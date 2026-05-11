import {
  BLOG_POSTS,
  POPULAR_DESTINATIONS,
  TESTIMONIALS,
  TRENDING_TOURS,
  type BlogPost,
  type DestinationCard,
  type Testimonial,
  type TourPackage,
} from "@/lib/constants";

const baseUrl = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Destinations index — wire to `GET /api/destinations` on Laravel. */
export async function getDestinations(): Promise<DestinationCard[]> {
  const root = baseUrl();
  if (!root) return POPULAR_DESTINATIONS;

  const res = await fetch(`${root}/api/destinations`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });
  const data = await safeJson<DestinationCard[]>(res);
  return data?.length ? data : POPULAR_DESTINATIONS;
}

/** Tour packages — wire to `GET /api/packages` or `/api/tours`. */
export async function getPackages(): Promise<TourPackage[]> {
  const root = baseUrl();
  if (!root) return TRENDING_TOURS;

  const res = await fetch(`${root}/api/packages`, {
    next: { revalidate: 1800 },
    headers: { Accept: "application/json" },
  });
  const data = await safeJson<TourPackage[]>(res);
  return data?.length ? data : TRENDING_TOURS;
}

/** Blog posts for homepage module — wire to `GET /api/blogs?limit=3`. */
export async function getBlogs(limit = 3): Promise<BlogPost[]> {
  const root = baseUrl();
  if (!root) return BLOG_POSTS.slice(0, limit);

  const res = await fetch(`${root}/api/blogs?limit=${limit}`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/json" },
  });
  const data = await safeJson<BlogPost[]>(res);
  return (data?.length ? data : BLOG_POSTS).slice(0, limit);
}

/** Testimonials — wire to `GET /api/testimonials`. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const root = baseUrl();
  if (!root) return TESTIMONIALS;

  const res = await fetch(`${root}/api/testimonials`, {
    next: { revalidate: 7200 },
    headers: { Accept: "application/json" },
  });
  const data = await safeJson<Testimonial[]>(res);
  return data?.length ? data : TESTIMONIALS;
}
