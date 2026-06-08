/**
 * Uno Hotels API client (auth, hotels, bookings)
 * Browser: ONLY /api/hotels (Next.js proxy) — no direct Render URLs
 * Server: HOTELS_API_URL direct to backend
 * @see https://unohotels-backend.onrender.com/docs
 */

export const API_DOCS_URL = "https://unohotels-backend.onrender.com/docs";

const DEFAULT_PUBLIC_BASE = "/api/hotels";
const DEFAULT_SERVER_BASE = "https://unohotels-backend.onrender.com";

const FETCH_TIMEOUT_MS = 90_000;
/** Auth/account signup can wait for Render cold start (server proxy allows ~120s + retries). */
const AUTH_FETCH_TIMEOUT_MS = 150_000;
const RETRY_STATUSES = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 4;

export type ApiEnvelope<T> = {
  data: T;
  message?: string | null;
  request_id?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[] | string>;
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** @deprecated Use ApiError */
export const HotelsAuthError = ApiError;

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[api]", ...args);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Public proxy path — browser must use this only */
export function getPublicApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");
  return base || DEFAULT_PUBLIC_BASE;
}

/** Server-side direct backend (Route Handler + RSC) */
export function getServerApiBase(): string {
  return (
    process.env.HOTELS_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_HOTELS_API_URL?.replace(/\/$/, "") ||
    DEFAULT_SERVER_BASE
  );
}

export function getApiBase(): string {
  if (typeof window === "undefined") {
    return getServerApiBase();
  }
  return getPublicApiBase();
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function isAuthOrAccountPath(path: string): boolean {
  const normalized = normalizePath(path);
  return (
    normalized.startsWith("/api/auth") ||
    normalized.startsWith("/api/account") ||
    normalized.startsWith("/v1/auth") ||
    normalized.startsWith("/v1/account")
  );
}

function unreachableMessage(path: string): string {
  if (isAuthOrAccountPath(path)) {
    return "Could not reach auth service. The server may be waking up — please wait up to 60 seconds and try again.";
  }
  return "Could not reach Hotels API. The server may be waking up — please wait a moment and try again.";
}

function buildUrl(path: string): string {
  const normalized = normalizePath(path);
  // Auth/account use dedicated Next.js routes (longer server timeout + Render wake-up)
  if (normalized.startsWith("/api/auth") || normalized.startsWith("/api/account")) {
    return normalized;
  }
  const base = getApiBase();
  if (base.endsWith("/api/hotels") || base === "/api/hotels") {
    return `${base}${normalized}`;
  }
  return `${base}${normalized}`;
}

function fetchTimeoutSignal(ms: number): AbortSignal {
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

export function isHtmlError(res: Response, bodyText: string): boolean {
  if (res.status === 404 || res.status === 502) return true;
  const t = bodyText.trimStart();
  return t.startsWith("<!") || t.startsWith("<html");
}

export async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  const url = buildUrl(path);
  const timeoutMs = isAuthOrAccountPath(path) ? AUTH_FETCH_TIMEOUT_MS : FETCH_TIMEOUT_MS;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      devLog(init?.method ?? "GET", url);
      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          ...(init?.headers ?? {}),
        },
        signal: fetchTimeoutSignal(timeoutMs),
      });
      lastResponse = res;
      if (res.ok) return res;
      if (RETRY_STATUSES.has(res.status) && attempt < MAX_ATTEMPTS - 1) {
        await sleep(900 * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      devLog("fetch error", err);
      if (attempt < MAX_ATTEMPTS - 1) {
        await sleep(700 * (attempt + 1));
        continue;
      }
      throw new ApiError(unreachableMessage(path), 0);
    }
  }

  if (lastResponse) return lastResponse;
  throw new ApiError(unreachableMessage(path), 0);
}

function formatErrorMessage(
  json: { message?: string; errors?: Record<string, string[] | string> },
  fallback: string,
): string {
  if (json.errors) {
    const parts: string[] = [];
    for (const [field, val] of Object.entries(json.errors)) {
      const text = Array.isArray(val) ? val.join(", ") : String(val);
      parts.push(field === "body" || field === "1" ? text : `${field}: ${text}`);
    }
    if (parts.length) return parts.join(" ");
  }
  return json.message ?? fallback;
}

function normalizeFieldErrors(
  errors?: Record<string, string[] | string>,
): Record<string, string> | undefined {
  if (!errors) return undefined;
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(errors)) {
    out[key] = Array.isArray(val) ? val.join(", ") : String(val);
  }
  return out;
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  try {
    const res = await apiRequest(path, init);
    const text = await res.text();
    if (isHtmlError(res, text)) {
      return {
        ok: false,
        status: res.status,
        message: "API proxy error — deploy with Next.js server (npm start) or enable /api/hotels proxy",
      };
    }
    let json: ApiEnvelope<T> & { message?: string };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      return {
        ok: false,
        status: res.status,
        message: res.ok ? "Invalid JSON from API" : unreachableMessage(path),
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: json.status ?? res.status,
        message: formatErrorMessage(json, "Request failed"),
      };
    }
    if (json.data === undefined || json.data === null) {
      return {
        ok: false,
        status: res.status,
        message: json.message ?? "Empty response from API",
      };
    }
    return { ok: true, data: json.data };
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Network error";
    return { ok: false, status: 0, message };
  }
}

export async function apiData<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await apiRequest(path, { ...init, headers });
  let json: ApiEnvelope<T> & {
    message?: string;
    errors?: Record<string, string[] | string>;
  };

  try {
    const text = await res.text();
    if (!text.trim()) {
      throw new ApiError(
        res.ok ? "Empty response from API" : unreachableMessage(path),
        res.status,
      );
    }
    json = JSON.parse(text) as typeof json;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(res.ok ? "Invalid response" : unreachableMessage(path), res.status);
  }

  if (!res.ok) {
    throw new ApiError(
      formatErrorMessage(json, "Request failed"),
      json.status ?? res.status,
      normalizeFieldErrors(json.errors),
    );
  }

  if (json.data === undefined || json.data === null) {
    throw new ApiError(json.message ?? "Empty response", res.status);
  }

  return json.data;
}

export async function apiDataWithAuth<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  return apiData<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

/** Back-compat aliases */
export const hotelsApiRequest = apiRequest;
export const hotelsApiJson = apiJson;
export const isHotelsHtmlError = isHtmlError;
export const HOTELS_API_DOCS_URL = API_DOCS_URL;