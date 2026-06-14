/**
 * Returns the backend origin (scheme + host + port, no trailing slash).
 *
 * Resolution order (first non-empty value wins):
 *   1. HOTELS_API_URL          — server-side env var (Route Handlers, RSC)
 *   2. NEXT_PUBLIC_HOTELS_API_URL — build-time public env var (fallback)
 *
 * Set these in .env.development:
 *   HOTELS_API_URL=http://localhost:8000
 *   NEXT_PUBLIC_HOTELS_API_URL=http://localhost:8000
 *
 * If neither is set, throws in development so you notice immediately.
 * In production the build will fail at the call site if the var is missing.
 */
export function getBackendOrigin(): string {
  const origin =
    process.env.HOTELS_API_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_HOTELS_API_URL?.trim().replace(/\/$/, "");

  if (!origin) {
    throw new Error(
      "[backend-fetch] Backend URL is not configured.\n" +
        "Add HOTELS_API_URL=http://localhost:8000 to your .env.development file.",
    );
  }

  return origin;
}

const RETRY_STATUSES = new Set([502, 503, 504]);
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "expect",
  "accept-encoding",
]);

export function stripHopByHopHeaders(headers: Headers): Headers {
  const out = new Headers();
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out.set(key, value);
  });
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    try {
      return AbortSignal.timeout(ms);
    } catch {
      /* fall through */
    }
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export async function pingBackend(origin = getBackendOrigin(), timeoutMs = 55_000): Promise<void> {
  try {
    await fetch(`${origin}/docs`, {
      method: "GET",
      signal: timeoutSignal(timeoutMs),
      cache: "no-store",
    });
  } catch {
    /* ignore */
  }
}

export async function fetchBackendWithRetry(
  url: string,
  init: RequestInit,
  options?: { timeoutMs?: number; maxAttempts?: number; wakeOnFailure?: boolean },
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const maxAttempts = options?.maxAttempts ?? 5;
  const wakeOnFailure = options?.wakeOnFailure ?? true;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: timeoutSignal(timeoutMs),
        cache: "no-store",
      });
      if (res.ok || !RETRY_STATUSES.has(res.status) || attempt >= maxAttempts - 1) {
        return res;
      }
      await sleep(1200 * (attempt + 1));
      continue;
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts - 1) break;
      if (wakeOnFailure && attempt === 0) {
        await pingBackend();
      }
      await sleep(1500 * (attempt + 1));
    }
  }

  throw lastError ?? new Error("Backend unreachable");
}