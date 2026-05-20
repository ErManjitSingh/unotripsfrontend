import {
  POPULAR_DESTINATIONS,
  TESTIMONIALS,
  type DestinationCard,
  type Testimonial,
  type TourItineraryDay,
  type TourPackage,
} from "@/lib/constants";
import {
  getBlogPost as getBlogPostFromApi,
  getBlogs as getBlogsFromApi,
  type BlogPost,
} from "@/lib/blog-api";
import { findDestinationInExtendedCatalog } from "@/lib/destination-catalog";

const DEFAULT_API_ROOT = "https://website.travelwithuno.com";

/** Laravel / CMS API base — defaults to production when env is unset (same as blog API). */
const baseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_ROOT;

async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type V1PackageRow = {
  id: number | string;
  title: string;
  slug?: string | null;
  destination?: string | null;
  location_name?: string | null;
  days?: number | null;
  nights?: number | null;
  duration?: string | null;
  price?: string | number | null;
  discount_price?: string | number | null;
  offer_price?: string | number | null;
  featured_image?: string | null;
  images?: unknown[];
  short_description?: string | null;
  description?: string | null;
  full_description?: string | null;
  itinerary?: Array<{
    title?: string | null;
    description?: string | null;
    meals?: string | null;
    hotel?: string | null;
    transport?: string | null;
    travel_mode?: string | null;
    image?: string | null;
  }> | null;
};

type V1PackagesResponse = {
  packages?: {
    data?: V1PackageRow[];
    last_page?: number;
    current_page?: number;
  };
};

function stripHtmlLite(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mapV1Itinerary(raw: unknown): TourItineraryDay[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: TourItineraryDay[] = [];
  let day = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const desc = stripHtmlLite(String(o.description ?? ""));
    const bits: string[] = [];
    const meals = String(o.meals ?? "").trim();
    const hotel = String(o.hotel ?? "").trim();
    const transport = String(o.transport ?? "").trim();
    if (meals) bits.push(meals);
    if (hotel) bits.push(`Stay: ${hotel}`);
    if (transport) bits.push(`Transport: ${transport}`);
    const body = bits.length ? (desc ? `${desc}\n\n${bits.join(" · ")}` : bits.join(" · ")) : desc;
    if (!title && !body) continue;
    day += 1;
    out.push({
      day,
      title: title || `Day ${day}`,
      body: body || "—",
    });
  }
  return out.length ? out : undefined;
}

function coerceNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function buildMediaUrl(pathLike: string, root: string): string {
  const p = pathLike.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, "");
  // Laravel-style: `storage/..` or raw `tour-packages/..`
  const normalized = clean.startsWith("storage/") ? clean : `storage/${clean}`;
  return `${root.replace(/\/$/, "")}/${normalized}`;
}

/** Avoid hung CI / offline builds when the Laravel API is slow or unreachable. */
const API_FETCH_TIMEOUT_MS = 15_000;

/** Destinations index — wire to `GET /api/destinations` on Laravel. */
export async function getDestinations(): Promise<DestinationCard[]> {
  const root = baseUrl();
  if (!root) return POPULAR_DESTINATIONS;

  let res: Response | null = null;
  try {
    res = await fetch(`${root}/api/destinations`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
  } catch {
    return POPULAR_DESTINATIONS;
  }
  const data = await safeJson<DestinationCard[]>(res);
  return data?.length ? data : POPULAR_DESTINATIONS;
}

async function fetchPackagesPage(root: string, page: number): Promise<V1PackagesResponse | null> {
  try {
    const res = await fetch(`${root}/api/v1/packages?page=${page}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
    return safeJson<V1PackagesResponse>(res);
  } catch {
    return null;
  }
}

function mapPackageRow(p: V1PackageRow, root: string, placeholderImage: string): TourPackage {
  const id = String(p.id);
  const title = p.title ?? `Package ${id}`;
  const slugFromTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const price = coerceNumber(p.offer_price ?? p.discount_price ?? p.price) ?? 0;
  const oldPrice = coerceNumber(p.price);
  const discountPct =
    oldPrice && oldPrice > 0 && price > 0 && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : undefined;

  const location = (p.destination ?? p.location_name ?? "").trim() || undefined;
  const durationDays = p.days ?? 0;
  const durationNights = p.nights ?? Math.max(0, durationDays - 1);
  const itinerary = mapV1Itinerary(p.itinerary);

  const image =
    typeof p.featured_image === "string" && p.featured_image.trim()
      ? buildMediaUrl(p.featured_image, root)
      : placeholderImage;

  return {
    id,
    slug: (p.slug ?? "").trim() || slugFromTitle || `pkg-${id}`,
    title,
    image,
    durationDays,
    durationNights,
    rating: 4.8,
    reviewCount: 120,
    priceINR: Math.round(price),
    oldPriceINR: oldPrice && oldPrice > price ? Math.round(oldPrice) : undefined,
    discountPct,
    description: (p.short_description ?? p.description ?? "").trim() || undefined,
    packageType: "Holiday package",
    location,
    showMemberPrice: true,
    itinerary,
  } satisfies TourPackage;
}

async function loadPackagesFromApiRoot(root: string): Promise<TourPackage[]> {
  const first = await fetchPackagesPage(root, 1);
  if (!first?.packages?.data?.length) return [];

  const firstRows = first.packages.data;
  const lastPage = Math.max(1, first.packages.last_page ?? 1);
  const allRows: V1PackageRow[] = [...firstRows];

  if (lastPage > 1) {
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) => fetchPackagesPage(root, i + 2)),
    );
    for (const page of rest) {
      const rows = page?.packages?.data ?? [];
      if (rows.length) allRows.push(...rows);
    }
  }

  const placeholderImage =
    "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80";

  return allRows.map((p) => mapPackageRow(p, root, placeholderImage));
}

/** Tour packages — always fetched from live CMS API at runtime. */
export async function getPackages(): Promise<TourPackage[]> {
  return loadPackagesFromApiRoot(baseUrl());
}

/** Blog posts — `GET /api/v1/blog/posts` via `@/lib/blog-api`. */
export async function getBlogs(limit = 3, category?: string): Promise<BlogPost[]> {
  return getBlogsFromApi(limit, category);
}

/** Testimonials — wire to `GET /api/testimonials`. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const root = baseUrl();
  if (!root) return TESTIMONIALS;

  let res: Response | null = null;
  try {
    res = await fetch(`${root}/api/testimonials`, {
      next: { revalidate: 7200 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
  } catch {
    return TESTIMONIALS;
  }
  const data = await safeJson<Testimonial[]>(res);
  return data?.length ? data : TESTIMONIALS;
}

/** Single blog post — `GET /api/v1/blog/posts/{slug}` via `@/lib/blog-api`. */
export async function getBlogPost(slug: string) {
  const { post } = await getBlogPostFromApi(slug);
  return post;
}

/** Single post with related articles from the API. */
export async function getBlogPostDetail(slug: string) {
  return getBlogPostFromApi(slug);
}

export type { BlogPost } from "@/lib/blog-api";

/** Single destination — wire to `GET /api/destinations/{slug}`. */
export async function getDestinationBySlug(
  slug: string,
): Promise<DestinationCard | null> {
  const local = findDestinationInExtendedCatalog(slug);
  const root = baseUrl();
  if (!root) return local ?? null;

  let res: Response | null = null;
  try {
    res = await fetch(`${root}/api/destinations/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
  } catch {
    return local ?? null;
  }
  const one = await safeJson<DestinationCard>(res);
  if (!one?.slug) return local ?? null;

  const fromApi = (one.image ?? "").trim();
  const resolved =
    fromApi && /^https?:\/\//i.test(fromApi)
      ? fromApi
      : fromApi
        ? buildMediaUrl(fromApi, root)
        : "";
  const image = resolved || local?.image || "";
  return { ...one, image };
}
