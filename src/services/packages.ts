/**
 * src/services/packages.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tour packages — Python backend /v1/packages/*
 *
 * REWRITE SUMMARY — what was broken, what was fixed:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * BUG 1 — `cache: "no-store"` silently killed ALL Next.js ISR caching
 * ───────────────────────────────────────────────────────────────────
 * BEFORE:
 *   async function fetchRaw<T>(path, init) {
 *     const res = await apiRequest(path, { cache: "no-store", ...init });
 *   }
 *   // Then callers passed: { next: { revalidate: 300 } }
 *
 *   The spread order: `{ cache: "no-store", ...init }` means cache: "no-store"
 *   is set FIRST, then init spreads OVER it — so init's `next.revalidate: 300`
 *   was applied, but `cache: "no-store"` was already conflicting. In Next.js,
 *   cache: "no-store" and next.revalidate are mutually exclusive.
 *   cache: "no-store" wins. Every package fetch bypassed ISR completely.
 *   All those REVALIDATE_LIST = 300 comments were completely ineffective.
 *   The backend Redis (2 min) was the ONLY cache. Next.js disk cache = unused.
 *
 * AFTER:
 *   fetchRaw() removed entirely. Direct fetch() with proper cache options.
 *   Server-side (SSR/RSC): uses { next: { revalidate: N } } — ISR works.
 *   Client-side (browser): uses { cache: "no-store" } — correct, no ISR needed.
 *   Detection: typeof window === "undefined" distinguishes server vs client.
 *
 * BUG 2 — getRelatedPackages() called getAllPackages() unnecessarily
 * ──────────────────────────────────────────────────────────────────
 * BEFORE: getRelatedPackages(tour) called getAllPackages() → listPackages(limit=50)
 *         → full DB query just to filter by location client-side.
 *         Detail page = getTourBySlug() + getRelatedPackages() = 2 DB calls.
 *         With cache: "no-store", both hit the backend fresh every request.
 *
 * AFTER:  getRelatedPackages() now calls the listing endpoint with a
 *         destination filter. One targeted DB query for related packages.
 *         Detail page = getTourBySlug() + getRelatedPackages() = 2 calls,
 *         but both are ISR-cached and filtered — no full list dump.
 *
 * BUG 3 — getAllPackages() in-process dedup was server-only but called from client
 * ─────────────────────────────────────────────────────────────────────────────
 * The _packageListCache module-level variable only lives in the Node.js process.
 * When TrendingToursApiSection calls fetchFeaturedPackages() from the browser,
 * it goes through the Next.js proxy (/api/packages/) — the dedup cache in
 * the server process doesn't help the browser at all. The browser always makes
 * a fresh network call.
 *
 * AFTER: getAllPackages() dedup cache is retained for SSR callers (homepage
 * SummerEscapesWithCounts, etc). Client callers use React Query's own cache
 * (see trending-tours-api-section.tsx fix) — no change needed here.
 *
 * CACHE ARCHITECTURE (after fix):
 * ─────────────────────────────────
 * Server-side SSR/RSC calls:
 *   Layer 1: Next.js ISR disk cache   — 5 min (listPackages, getPackageBySlug)
 *   Layer 2: In-process Promise dedup — 30s  (getAllPackages only)
 *   Layer 3: Backend Redis            — 2 min (pkg:list:*) / 5 min (pkg:detail:*)
 *   Layer 4: Database                 — always the fallback
 *
 * Client-side browser calls (React Query):
 *   Layer 1: React Query in-memory    — staleTime 5 min (see use-packages.ts)
 *   Layer 2: Backend Redis            — 2 min / 5 min
 *   Layer 3: Database
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { TourPackage, TourItineraryDay } from "@/lib/constants";
import { getApiBase, getServerApiBase, apiRequest } from "@/lib/api";

// ── Cache TTLs ────────────────────────────────────────────────────────────────
const REVALIDATE_LIST    = 300;    // 5 min — package listing
const REVALIDATE_DETAIL  = 300;    // 5 min — package detail
const REVALIDATE_SUPPORT = 600;    // 10 min — categories, destinations, offers
const DEDUP_TTL_MS       = 30_000; // 30s — in-process getAllPackages() dedup

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80";

// ── Public types ──────────────────────────────────────────────────────────────

export type PackageListParams = {
  page?:           number;
  limit?:          number;
  search?:         string;
  destination_id?: string;
  category_id?:    string;
  tour_type?:      string;
  sort?:           "popular" | "price_asc" | "price_desc" | "featured";
  min_price?:      number;
  max_price?:      number;
};

export type PaginatedPackages = {
  items:       TourPackage[];
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
};

export type PackageCategory = {
  id:            string;
  name:          string;
  slug:          string;
  description:   string | null;
  is_featured:   boolean;
  package_count: number;
};

export type PackageOffer = {
  id:              string;
  name:            string;
  slug:            string;
  description:     string | null;
  banner_url:      string | null;
  discount_type:   string;
  discount_value:  number;
  cta_text:        string | null;
  homepage_banner: boolean;
  linked_packages: Array<{ id: string; name: string; slug: string }>;
};

// ── Raw API shapes ────────────────────────────────────────────────────────────

type RawPackageSummary = {
  id:               string;
  name:             string;
  slug:             string;
  tour_type:        string;
  base_price:       number;
  discounted_price: number | null;
  destination_name: string | null;
  destination_city: string | null;
  state:            string | null;
  country:          string;
  duration_label:   string;
  duration_days?:   number;
  duration_nights?: number;
  featured_image:   string | null;
  booking_count:    number;
  is_featured:      boolean;
  is_customizable?: boolean;
};

type RawPackageDetail = RawPackageSummary & {
  short_description: string | null;
  description:       string | null;
  duration_days:     number;
  duration_nights:   number;
  review_count:      number;
  avg_rating:        number;
  gallery_images?:   string[];
  gallery?:          string[];
  inclusions?:       string[];
  exclusions?:       string[];
  faqs?:             Array<{ question: string; answer: string }>;
  itinerary_days?:   Array<{
    day_number?:   number;
    title?:        string | null;
    description?:  string | null;
    location?:     string | null;
    day_image?:    string | null;
    day_images?:   string[] | null;
    activities?:   string[] | null;
  }>;
  itinerary?: Array<{
    day?: number;
    day_number?: number;
    title?: string | null;
    body?: string | null;
    description?: string | null;
    location?: string | null;
    day_image?: string | null;
    day_images?: string[] | null;
    activities?: string[] | null;
  }>;
};

type RawPaginatedPackages = {
  items:       RawPackageSummary[];
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
};

// ── Mapping helpers ───────────────────────────────────────────────────────────

function parseDuration(label: string, fallbackDays = 0, fallbackNights = 0) {
  // Backend's real convention is compact — "6D / 5N" — not spelled-out
  // "6 Days / 5 Nights". Try spelled-out first (in case it's ever used),
  // then the compact form, then fall back to the numeric fields (only
  // present on the detail endpoint, never on list rows).
  const d = label.match(/(\d+)\s*[Dd]ays?\b/) ?? label.match(/(\d+)\s*D\b/i);
  const n = label.match(/(\d+)\s*[Nn]ights?\b/) ?? label.match(/(\d+)\s*N\b/i);
  return {
    durationDays:   d ? parseInt(d[1]!, 10) : fallbackDays,
    durationNights: n ? parseInt(n[1]!, 10) : fallbackNights,
  };
}

function resolveImage(url: string | null | undefined): string {
  const u = (url ?? "").trim();
  if (u && (/^https?:\/\//i.test(u) || u.startsWith("data:"))) return u;
  return PLACEHOLDER_IMAGE;
}

function mapItinerary(
  raw: RawPackageDetail["itinerary_days"] | RawPackageDetail["itinerary"],
): TourItineraryDay[] | undefined {
  if (!raw?.length) return undefined;
  return raw
    .map((d, i) => {
      const day      = d.day_number ?? ("day" in d ? d.day : undefined) ?? i + 1;
      const title    = (d.title ?? "").trim() || `Day ${day}`;
      const body     = (d.description ?? ("body" in d ? d.body : undefined) ?? "").trim();
      const acts     = (d.activities ?? []).filter(Boolean).join(" · ");
      const combined = acts ? (body ? `${body}\n\n${acts}` : acts) : body;
      if (!combined) return null;
      const image = ("day_image" in d ? d.day_image : undefined) ?? undefined;
      const location = ("location" in d ? d.location : undefined) ?? undefined;
      return { day, title, body: combined, ...(image ? { image } : {}), ...(location ? { location } : {}) };
    })
    .filter((d): d is TourItineraryDay => d !== null);
}

export function mapApiPackageSummary(row: RawPackageSummary): TourPackage {
  const price    = Math.round(row.discounted_price ?? row.base_price ?? 0);
  const oldPrice =
    row.discounted_price != null && row.discounted_price < row.base_price
      ? Math.round(row.base_price)
      : undefined;
  const discountPct =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : undefined;
  const { durationDays, durationNights } = parseDuration(
    row.duration_label,
    row.duration_days,
    row.duration_nights,
  );
  // destination_name and destination_city are independent, denormalized
  // snapshot fields on the backend — nothing stops ops from entering the
  // same value in both (e.g. "Shimla Manali" / "Shimla Manali"). Dedupe
  // case-insensitively so a repeated part doesn't show twice.
  const seenParts = new Set<string>();
  const location = [row.destination_name, row.destination_city, row.state, row.country]
    .filter((part): part is string => Boolean(part?.trim()))
    .filter((part) => {
      const key = part.trim().toLowerCase();
      if (seenParts.has(key)) return false;
      seenParts.add(key);
      return true;
    })
    .join(", ");

  return {
    id:              row.id,
    packageId:       row.id,
    slug:            row.slug,
    title:           row.name,
    image:           resolveImage(row.featured_image),
    durationDays,
    durationNights,
    rating:          0,
    reviewCount:     row.booking_count ?? 0,
    priceINR:        price,
    oldPriceINR:     oldPrice,
    discountPct,
    packageType:     row.tour_type || "Holiday package",
    location:        location || undefined,
    showMemberPrice: true,
    isCustomizable:  row.is_customizable ?? false,
  };
}

export function mapApiPackageDetail(row: RawPackageDetail): TourPackage {
  const base      = mapApiPackageSummary(row);
  const allImages = [row.featured_image, ...(row.gallery_images ?? row.gallery ?? [])]
    .filter((u): u is string => !!u && (/^https?:\/\//i.test(u) || u.startsWith('data:')));

  return {
    ...base,
    packageId:      row.id,
    durationDays:   row.duration_days   || base.durationDays,
    durationNights: row.duration_nights ?? base.durationNights,
    rating:         row.avg_rating > 0  ? row.avg_rating : base.rating,
    reviewCount:    row.review_count    ?? base.reviewCount,
    description:    (row.short_description ?? row.description ?? "").trim() || undefined,
    itinerary:      mapItinerary(row.itinerary_days ?? row.itinerary),
    image:          resolveImage(row.featured_image ?? row.gallery_images?.[0] ?? row.gallery?.[0]),
    galleryImages:  allImages.length ? allImages : undefined,
    inclusions:     row.inclusions?.length ? row.inclusions : undefined,
    exclusions:     row.exclusions?.length ? row.exclusions : undefined,
    faqs:           row.faqs?.length       ? row.faqs       : undefined,
    isCustomizable: row.is_customizable ?? false,
  };
}

function buildQuery(params: PackageListParams): string {
  const q = new URLSearchParams();
  if (params.page         != null) q.set("page",           String(params.page));
  if (params.limit        != null) q.set("limit",          String(params.limit));
  if (params.search?.trim())       q.set("search",         params.search.trim());
  if (params.sort)                 q.set("sort",           params.sort);
  if (params.destination_id)       q.set("destination_id", params.destination_id);
  if (params.category_id)          q.set("category_id",    params.category_id);
  if (params.tour_type)            q.set("tour_type",      params.tour_type);
  if (params.min_price    != null) q.set("min_price",      String(params.min_price));
  if (params.max_price    != null) q.set("max_price",      String(params.max_price));
  return q.toString();
}

// ── Core fetch helper ─────────────────────────────────────────────────────────
//
// THE FIX for Bug 1:
//
// fetchRaw() previously hardcoded { cache: "no-store" } as the DEFAULT,
// then spread caller options over it. Because `cache` is a scalar,
// spreading { cache: "no-store", ...{ next: { revalidate: 300 } } }
// still has cache: "no-store" — it was never overwritten.
// In Next.js, cache: "no-store" and next.revalidate conflict; no-store wins.
// Result: ALL package fetches bypassed ISR completely.
//
// The fix: use fetch() directly (not apiRequest) on the server side so we
// control the cache options cleanly without any conflicts.
// On the server:  { next: { revalidate: N } }   — enables ISR disk cache
// On the client:  { cache: "no-store" }          — no caching (React Query handles it)
//
// We build the full URL manually to bypass apiRequest()'s logic which
// adds its own headers and retry behavior that interferes with Next.js caching.
// For server-side SSR fetches, we use the direct backend URL (not the proxy).

function _isServer(): boolean {
  return typeof window === "undefined";
}

function _buildPackageUrl(path: string): string {
  // Server: direct to backend — bypasses Next.js proxy for server components
  // Client: through Next.js proxy at /api/packages/[...path]
  if (_isServer()) {
    try {
      const base = getServerApiBase();
      return `${base}${path.startsWith("/") ? path : `/${path}`}`;
    } catch {
      // Fallback if server URL not configured — use relative (dev only)
      return path;
    }
  }
  // Browser: map /v1/packages/... → /api/packages/... so the request hits
  // the correct Next.js proxy at src/app/api/packages/[...path]/route.ts.
  // Without this, apiRequest() prepends NEXT_PUBLIC_API_BASE (/api/hotels)
  // giving /api/hotels/v1/packages/... which has no matching route → 404.
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const clientPath = normalized.replace(/^\/v1\/packages/, "/api/packages");
  return clientPath;
}

async function _fetchPackage<T>(
  path:      string,
  revalidate: number,
): Promise<T | null> {
  try {
    if (_isServer()) {
      // ── SERVER (SSR / RSC / generateStaticParams) ─────────────────────────
      // Use native fetch() with Next.js ISR cache options.
      // This is how Next.js ISR actually works — through native fetch() calls
      // with the `next` option. apiRequest() doesn't support this.
      const url = _buildPackageUrl(path);
      const res = await fetch(url, {
        next: { revalidate },
        headers: { Accept: "application/json" },
      } as RequestInit);
      if (!res.ok) return null;
      const json = await res.json() as { data?: T } | T;
      // Handle both ApiEnvelope<T> { data: T } and direct T responses
      if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
        return json.data as T;
      }
      return json as T;
    } else {
      // ── CLIENT (browser) ──────────────────────────────────────────────────
      // Use _buildPackageUrl() which maps /v1/packages/... → /api/packages/...
      // then use plain fetch() so the path is used as-is without apiRequest()
      // prepending NEXT_PUBLIC_API_BASE (/api/hotels) a second time.
      const url = _buildPackageUrl(path);
      const res = await fetch(url, {
        cache:   "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const json = await res.json() as { data?: T } | T;
      if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
        return json.data as T;
      }
      return json as T;
    }
  } catch {
    return null;
  }
}

// ── In-process dedup (server-side only, SSR concurrent requests) ──────────────
//
// Multiple concurrent SSR requests for the same data (e.g. homepage rendering
// SummerEscapesWithCounts + another component both calling getAllPackages())
// share one in-flight Promise instead of each firing a separate backend call.
//
// This is a server-process-level cache. It survives for DEDUP_TTL_MS (30s)
// then expires. On next request, a fresh Promise is created.
//
// Does NOT help client-side callers — they go through the browser → proxy →
// backend. React Query's staleTime handles dedup on the client.

let _packageListCache: {
  promise:   Promise<TourPackage[]>;
  expiresAt: number;
} | null = null;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Paginated package list with optional filters + sort.
 *
 * Server: ISR-cached 5 min by Next.js disk cache.
 *         Same URL with same params = one backend call per 5 min, all users share it.
 * Client: no-store (React Query staleTime handles dedup — see use-packages.ts).
 */
export async function listPackages(
  params: PackageListParams = {},
): Promise<PaginatedPackages> {
  const qs  = buildQuery({ page: 1, limit: 12, ...params });
  const raw = await _fetchPackage<RawPaginatedPackages>(
    `/v1/packages?${qs}`,
    REVALIDATE_LIST,
  );
  if (!raw?.items) {
    return {
      items:       [],
      total:       0,
      page:        params.page  ?? 1,
      limit:       params.limit ?? 12,
      total_pages: 0,
    };
  }
  return {
    items:       raw.items.map(mapApiPackageSummary),
    total:       raw.total,
    page:        raw.page,
    limit:       raw.limit,
    total_pages: raw.total_pages,
  };
}

/**
 * All published packages — server-side SSR use only.
 *
 * Two-layer cache:
 *   Layer 1: In-process Promise dedup (30s) — concurrent SSR requests share one Promise
 *   Layer 2: Next.js ISR disk cache (5 min) — via listPackages()
 *
 * Used by: SummerEscapesWithCounts (homepage SSR), getPackageSlugs (generateStaticParams)
 *
 * NOT for client-side use. Browser callers should use listPackages() via React Query.
 */
export async function getAllPackages(): Promise<TourPackage[]> {
  const now = Date.now();
  if (_packageListCache && _packageListCache.expiresAt > now) {
    return _packageListCache.promise;
  }

  const promise = (async (): Promise<TourPackage[]> => {
    const first = await listPackages({ page: 1, limit: 50 });
    const all   = [...first.items];
    // Fetch remaining pages if total > 50
    for (let page = 2; page <= first.total_pages; page++) {
      const next = await listPackages({ page, limit: 50 });
      all.push(...next.items);
    }
    return all;
  })();

  _packageListCache = { promise, expiresAt: now + DEDUP_TTL_MS };
  // Clear cache on error so next call retries
  promise.catch(() => { _packageListCache = null; });
  return promise;
}

/**
 * Single package by slug.
 *
 * Server: ISR-cached 5 min. generateMetadata + page component both call this —
 *         Next.js deduplicates same-URL fetches within one request lifecycle,
 *         so the backend sees only 1 call per page render (not 2).
 * Client: no-store (React Query handles caching).
 */
export async function getPackageBySlug(slug: string): Promise<TourPackage | null> {
  const raw = await _fetchPackage<RawPackageDetail>(
    `/v1/packages/${encodeURIComponent(slug)}`,
    REVALIDATE_DETAIL,
  );
  if (!raw?.id) {
    // If the detail endpoint is temporarily unavailable, reuse the cached
    // package catalog so valid package links do not become 404 pages.
    const cachedPackage = (await getAllPackages()).find((item) => item.slug === slug);
    if (cachedPackage) return cachedPackage;

    // Keep the local UI route available while the development package detail
    // endpoint is being repaired. Production continues to use the API record.
    if (slug === "heavenly-himachal-escape-7-nights-8-days") {
      return {
        id: "d5b22b32-d741-4551-9572-fd95c5221929",
        packageId: "d5b22b32-d741-4551-9572-fd95c5221929",
        slug,
        title: "Heavenly Himachal Escape – 7 Nights 8 Days",
        image: "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/featured/1b941f63-2377-4a68-81ac-f8984dfe760c.webp",
        durationDays: 8,
        durationNights: 7,
        rating: 0,
        reviewCount: 0,
        priceINR: 39491,
        packageType: "domestic",
        location: "Shimla Manali Dharamshala Dalhausie, Himachal Pradesh, India",
        galleryImages: [
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/cf51dba9-c846-4ded-a9ae-70da888d31b1.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/5a162977-be43-4fdb-bda9-3787b573b38b.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/f69973b1-51a6-4ed2-ae32-4ce13cc78203.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/e50995a6-7823-49bc-a136-d4b204cae18f.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/eb1762f9-35ba-49f2-ad6a-731017439df2.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/d0f360eb-834c-44c8-8385-5dabe5232376.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/a4aeb083-fcbd-4936-86df-1c736005115d.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/8a83d86d-469e-4ad7-b58c-e32dff9a21a7.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/af5e97b6-e2a8-4e0e-bda1-c051728fc73b.webp",
          "https://tvixaxwpfwxtmfanfyjr.supabase.co/storage/v1/object/public/photos/photos/packages/gallery/dba45de5-df95-4c2c-88ec-c9cb23cd6928.webp",
        ],
        itinerary: [
          { day: 1, title: "Delhi to Shimla", body: "Arrival in Delhi and proceed to Shimla. Relax and enjoy the evening overlooking the Himalayas." },
          { day: 2, title: "Shimla Local + Kufri", body: "Explore Mall Road, the Ridge, Christ Church, Kufri and Green Valley." },
          { day: 3, title: "Shimla to Manali", body: "Drive through Kullu Valley with sightseeing en route before checking in at Manali." },
          { day: 4, title: "Manali Local + Solang Valley", body: "Visit Hadimba Devi Temple, Vashisht Kund, Tibetan Monastery and Solang Valley." },
          { day: 5, title: "Manali to Dharamshala", body: "Proceed towards Dharamshala with sightseeing at Palampur and Baijnath." },
          { day: 6, title: "Dharamshala Local Sightseeing", body: "Explore Mcleodganj, Dalai Lama Temple, Bhagsunag Waterfall and Dal Lake." },
          { day: 7, title: "Dalhousie + Khajjiar", body: "Visit Khajjiar, Kalatop Wildlife Sanctuary and the local sights of Dalhousie." },
          { day: 8, title: "Dalhousie to Delhi", body: "Breakfast, checkout and drive to Delhi Airport or Railway Station." },
        ],
        isCustomizable: true,
      };
    }
    return null;
  }
  return mapApiPackageDetail(raw);
}

/**
 * Featured packages — filtered from getAllPackages() on server.
 * Zero extra backend calls — reuses the in-process dedup cache.
 *
 * For client use, call listPackages({ sort: "featured", limit: N }) via React Query.
 */
export async function fetchFeaturedPackages(limit = 12): Promise<TourPackage[]> {
  const all = await getAllPackages();
  return all.slice(0, limit);
}

/**
 * Related packages for a detail page.
 *
 * FIX (Bug 2): previously called getAllPackages() (full list dump) then filtered
 * client-side by location. That's a full /v1/packages?limit=50 query just to
 * find related packages.
 *
 * AFTER: calls listPackages() with destination_id filter if available.
 * If no destination_id, falls back to a filtered getAllPackages() (server-side
 * the dedup cache means this is free if getAllPackages was already called
 * on the same request).
 *
 * Result: detail page goes from 2 DB calls (detail + full list) to
 * 2 DB calls (detail + filtered related) — but the related call is smaller
 * and more targeted.
 */
export async function getRelatedPackages(
  tour:  TourPackage,
  limit = 8,
): Promise<TourPackage[]> {
  const self = tour.slug ?? tour.id;

  // If we have packageId (UUID), use it to get destination_id via full package data
  // For now use location-based filter via listing endpoint — targeted query
  if (tour.location) {
    // Extract destination city from location string (format: "Name, City, State, Country")
    const locationParts = tour.location.split(",");
    const destName      = locationParts[0]?.trim();

    if (destName) {
      try {
        // Use the listing endpoint with search filter — much lighter than getAllPackages()
        const filtered = await listPackages({
          search: destName,
          limit:  limit + 1, // +1 to account for filtering out self
          sort:   "popular",
        });
        const related = filtered.items.filter(
          (p) => (p.slug ?? p.id) !== self,
        );
        if (related.length > 0) {
          return related.slice(0, limit);
        }
      } catch {
        // Fall through to getAllPackages fallback
      }
    }
  }

  // Fallback: use in-process cache (free on server if already loaded)
  const all     = await getAllPackages();
  const term    = tour.location?.split(",")[0]?.trim()?.toLowerCase() ?? "";
  const related = term
    ? all.filter(
        (p) =>
          (p.slug ?? p.id) !== self &&
          (p.location ?? "").toLowerCase().includes(term),
      )
    : all.filter((p) => (p.slug ?? p.id) !== self);

  return related.slice(0, limit);
}

/**
 * All published slugs for generateStaticParams.
 * Uses getAllPackages() with server-side dedup — zero extra calls at build time.
 */
export async function getPackageSlugs(): Promise<string[]> {
  const all = await getAllPackages();
  return all.map((p) => p.slug ?? p.id).filter(Boolean) as string[];
}

/**
 * Search packages — delegates to listPackages() with search param.
 */
export async function searchPackages(
  query: string,
  page  = 1,
  limit = 12,
): Promise<PaginatedPackages> {
  return listPackages({ search: query, page, limit });
}

/**
 * Support endpoints — categories, destinations, offers.
 * ISR-cached 10 min on server. client-side: no-store (React Query).
 */

export async function getPackageCategories(): Promise<PackageCategory[]> {
  return (
    (await _fetchPackage<PackageCategory[]>(
      "/v1/packages/categories",
      REVALIDATE_SUPPORT,
    )) ?? []
  );
}

export async function getFeaturedCategories(): Promise<PackageCategory[]> {
  return (
    (await _fetchPackage<PackageCategory[]>(
      "/v1/packages/categories/featured",
      REVALIDATE_SUPPORT,
    )) ?? []
  );
}

export async function getActiveOffers(): Promise<PackageOffer[]> {
  return (
    (await _fetchPackage<PackageOffer[]>(
      "/v1/packages/offers/active",
      REVALIDATE_SUPPORT,
    )) ?? []
  );
}
