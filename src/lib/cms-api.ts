/**
 * src/lib/cms-api.ts
 *
 * Content API — destinations, packages, blog, testimonials.
 * 100% Python backend. Zero Laravel. No NEXT_PUBLIC_API_URL.
 *
 * Every function has:
 *   1. Next.js ISR cache (revalidate N seconds) — zero extra DB hits per user
 *   2. Silent fallback to static data — page never crashes on API down
 *
 * Testimonials: no backend support exists yet. Returns static TESTIMONIALS
 * from constants.ts. Replace with a real endpoint when the backend adds it.
 */

import {
  POPULAR_DESTINATIONS,
  TESTIMONIALS,
  type DestinationCard,
  type Testimonial,
  type TourPackage,
} from "@/lib/constants";

import {
  getBlogs as getBlogsFromApi,
  getBlogPost as getBlogPostFromApi,
  type BlogPost,
} from "@/lib/blog-api";

import { getAllPackages, getPackageBySlug } from "@/services/packages";
import { apiGetRaw } from "@/services/api";

export type { BlogPost } from "@/lib/blog-api";

const REVALIDATE_DESTINATIONS = 600;   // 10 min — destination data barely changes

// ── Raw shape from Python /v1/destinations ────────────────────────────────────

type RawDestination = {
  city:           string;
  state:          string;
  country:        string;
  hotel_count:    number;
  image_url:      string;
  slug:           string;
  starting_price: number;
};

function mapDestination(d: RawDestination): DestinationCard {
  return {
    id:           d.slug,           // slug is the stable identifier
    name:         d.city,
    slug:         d.slug,
    image:        d.image_url || "",
    packageCount: d.hotel_count,
    region:       d.state || d.country,
  };
}

// ── Destinations ──────────────────────────────────────────────────────────────

/**
 * Popular destinations list.
 * Python: GET /v1/destinations/popular
 * Cached 10 min. Falls back to POPULAR_DESTINATIONS static data on error.
 */
export async function getDestinations(): Promise<DestinationCard[]> {
  try {
    const raw = await apiGetRaw<{ data: RawDestination[] }>(
      "/v1/destinations/popular",
      { next: { revalidate: REVALIDATE_DESTINATIONS } },
    );

    const list = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
        ? (raw as unknown as RawDestination[])
        : [];

    if (list.length > 0) {
      return list.map(mapDestination);
    }
  } catch {
    // fall through to static data
  }

  return POPULAR_DESTINATIONS;
}

/**
 * Single destination by slug.
 * Python: GET /v1/destinations/{slug}
 * Cached 10 min. Falls back to local catalog match.
 */
export async function getDestinationBySlug(
  slug: string,
): Promise<DestinationCard | null> {
  try {
    const raw = await apiGetRaw<{ data: RawDestination }>(
      `/v1/destinations/${encodeURIComponent(slug)}`,
      { next: { revalidate: REVALIDATE_DESTINATIONS } },
    );

    const d = raw?.data ?? (raw as unknown as RawDestination);
    if (d?.slug) {
      return mapDestination(d);
    }
  } catch {
    // fall through to local catalog
  }

  // Local fallback — static catalog
  return POPULAR_DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

// ── Packages ──────────────────────────────────────────────────────────────────

/**
 * All packages — Python /v1/packages.
 * Already cached in services/packages.ts (apiGetRaw with ISR).
 */
export async function getPackages(): Promise<TourPackage[]> {
  return getAllPackages();
}

/**
 * Single package by slug — Python /v1/packages/{slug}.
 */
export async function getPackageBySlugFromApi(
  slug: string,
): Promise<TourPackage | null> {
  return getPackageBySlug(slug);
}

// ── Blog ──────────────────────────────────────────────────────────────────────

/**
 * Published blog posts list.
 * Python: GET /v1/blog/posts
 */
export async function getBlogs(
  limit    = 3,
  category?: string,
): Promise<BlogPost[]> {
  const { posts } = await getBlogsFromApi(limit, category);
  return posts;
}

/**
 * Single blog post with related posts.
 * Python: GET /v1/blog/posts/{slug}
 */
export async function getBlogPost(
  slug: string,
): Promise<BlogPost | null> {
  const { post } = await getBlogPostFromApi(slug);
  return post;
}

/**
 * Single blog post with related posts (full object).
 * Python: GET /v1/blog/posts/{slug}
 */
export async function getBlogPostDetail(
  slug: string,
): Promise<{ post: BlogPost | null; related: BlogPost[] }> {
  return getBlogPostFromApi(slug);
}

// ── Testimonials ──────────────────────────────────────────────────────────────

/**
 * Testimonials — static data (no backend endpoint yet).
 *
 * When the Python backend adds GET /v1/testimonials, replace this with:
 *   const raw = await apiGetRaw<{data: Testimonial[]}>("/v1/testimonials", ...);
 *   return raw?.data?.length ? raw.data : TESTIMONIALS;
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}