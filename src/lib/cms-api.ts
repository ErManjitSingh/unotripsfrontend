import {
  POPULAR_DESTINATIONS,
  TESTIMONIALS,
  type DestinationCard,
  type Testimonial,
  type TourPackage,
} from "@/lib/constants";
import {
  getBlogPost as getBlogPostFromApi,
  getBlogs as getBlogsFromApi,
  type BlogPost,
} from "@/lib/blog-api";
import { findDestinationInExtendedCatalog } from "@/lib/destination-catalog";
import { getAllPackages, getPackageBySlug } from "@/services/packages";

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

const API_FETCH_TIMEOUT_MS = 15_000;

function buildMediaUrl(pathLike: string, root: string): string {
  const p = pathLike.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, "");
  const normalized = clean.startsWith("storage/") ? clean : `storage/${clean}`;
  return `${root.replace(/\/$/, "")}/${normalized}`;
}

/** Tour packages — Uno Hotels backend via `@/services/packages`. */
export async function getPackages(): Promise<TourPackage[]> {
  return getAllPackages();
}

/** Single package by slug — backend API. */
export async function getPackageBySlugFromApi(slug: string): Promise<TourPackage | null> {
  return getPackageBySlug(slug);
}

/** Destinations index — Laravel CMS (blog/destinations only). */
export async function getDestinations(): Promise<DestinationCard[]> {
  const root = baseUrl();
  if (!root) return POPULAR_DESTINATIONS;

  let res: Response | null = null;
  try {
    res = await fetch(`${root}/api/destinations`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
  } catch {
    return POPULAR_DESTINATIONS;
  }
  const data = await safeJson<DestinationCard[]>(res);
  return data?.length ? data : POPULAR_DESTINATIONS;
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
      cache: "no-store",
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
      cache: "no-store",
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
