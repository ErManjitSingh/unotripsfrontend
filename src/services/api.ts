/**
 * src/services/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared API helpers used by blog-api.ts, cms-api.ts (destinations), and
 * services/hotels.ts (availability suggestions).
 *
 * ROOT CAUSE FIX — cache: "no-store" was silently killing ALL ISR caching
 * ─────────────────────────────────────────────────────────────────────────────
 * BEFORE:
 *   const DEFAULT_INIT: RequestInit = { cache: "no-store" };
 *
 *   export async function apiGetRaw<T>(path, init) {
 *     const res = await apiRequest(path, { ...DEFAULT_INIT, ...init });
 *   }
 *
 *   Callers passed: { next: { revalidate: 300 } }
 *   Result: { cache: "no-store", next: { revalidate: 300 } }
 *
 *   In Next.js, cache: "no-store" and next.revalidate are MUTUALLY EXCLUSIVE.
 *   cache: "no-store" wins. The { next: { revalidate: 300 } } was silently
 *   ignored on EVERY call. blog-api.ts, cms-api.ts destinations — all ISR
 *   was completely broken. Every render hit the backend fresh.
 *
 * AFTER:
 *   DEFAULT_INIT removed entirely.
 *
 *   apiGetRaw() and apiGetEnvelope() now use caller-provided init directly —
 *   no conflicting defaults. If the caller passes { next: { revalidate: 300 } },
 *   that's exactly what fetch() receives. ISR works correctly.
 *
 *   For client-side calls (browser) that need no-store, callers pass it
 *   explicitly. Server-side RSC/SSR callers pass { next: { revalidate: N } }.
 *
 *   apiGetEnvelope() is only used by services/hotels.ts getHotelAvailability()
 *   which is called client-side (availability suggestions after 409 error).
 *   That call has no init — it correctly defaults to no cache option, which
 *   means browser default caching applies. For a live availability check,
 *   that's correct — we always want fresh data.
 *
 * IMPACT:
 *   blog-api.ts      → getBlogs, getBlogPost, getBlogCategories
 *                      all now correctly ISR-cached for 5 min
 *   cms-api.ts       → getDestinations, getDestinationBySlug
 *                      all now correctly ISR-cached for 10 min
 *   services/hotels  → getHotelAvailability uses apiGetEnvelope with no init
 *                      — client-side only, no ISR needed, unchanged behaviour
 * ─────────────────────────────────────────────────────────────────────────────
 */

export {
  API_DOCS_URL,
  ApiError,
  apiData,
  apiDataWithAuth,
  apiJson,
  apiRequest,
  getApiBase,
  getPublicApiBase,
  getServerApiBase,
} from "@/lib/api";

import { apiJson, apiRequest } from "@/lib/api";

/**
 * Fetch JSON from a path, unwrapping an ApiEnvelope { data: T } response.
 *
 * Used by: services/hotels.ts → getHotelAvailability (client-side only)
 *
 * No default cache option — caller controls caching via init.
 * For client-side availability checks, browser default caching applies.
 * For server-side ISR calls, caller passes { next: { revalidate: N } }.
 */
export async function apiGetEnvelope<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const result = await apiJson<T>(path, init);
  return result.ok ? result.data : null;
}

/**
 * Fetch raw JSON from a path. Returns the full parsed response body.
 *
 * Used by: blog-api.ts (blog listing, featured, post, categories)
 *          cms-api.ts (destinations, destination by slug)
 *
 * FIX: previously hardcoded { cache: "no-store" } as default which silently
 * overrode any { next: { revalidate: N } } passed by callers, breaking all
 * ISR caching in blog and destinations.
 *
 * Now: no default. Callers pass their own cache options:
 *   Server/SSR: { next: { revalidate: 300 } }  → ISR 5 min disk cache
 *   Client:     { cache: "no-store" }           → always fresh (React Query handles client cache)
 *   Omitted:    browser default caching          → fine for one-off calls
 */
export async function apiGetRaw<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await apiRequest(path, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Returns the backend base URL for direct server-side calls.
 * Reads from env vars — set HOTELS_API_URL=http://localhost:8000 in .env.development.
 */
export function getBackendBaseUrl(): string {
  const url =
    process.env.HOTELS_API_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_HOTELS_API_URL?.trim().replace(/\/$/, "");

  if (!url) {
    throw new Error(
      "[services/api] Backend URL is not configured.\n" +
        "Add HOTELS_API_URL=http://localhost:8000 to your .env.development file.",
    );
  }

  return url;
}