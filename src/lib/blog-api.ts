/**
 * src/lib/blog-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Blog data from the Python backend — /v1/blog/posts, /v1/blog/categories.
 * No Laravel dependency. No NEXT_PUBLIC_API_URL.
 *
 * All server-side calls go directly to HOTELS_API_URL (RSC / Route Handlers).
 * All client-side calls go through the Next.js /api/hotels proxy.
 *
 * CACHING STRATEGY (after fix):
 * ─────────────────────────────────────────────────────────────────────────────
 * Layer 1 — Next.js ISR disk cache (server-side only)
 *   Every server fetch passes { next: { revalidate: 300 } } to native fetch().
 *   Next.js caches on disk for 5 min — at most 1 backend call per 5 min per route.
 *   All blog visitors within a 5 min window share the same cached response.
 *   Zero DB hits for 99% of traffic.
 *
 * Layer 2 — Backend Redis cache
 *   Python backend caches blog:list:*, blog:post:{slug}, blog:featured:* for 5 min.
 *   If Next.js ISR cache misses (expired), backend Redis is the second shield.
 *   DB only hit when both caches miss.
 *
 * Layer 3 — On-demand ISR revalidation
 *   Admin publish/update calls bust_blog_cache() which:
 *     1. Clears all blog:* Redis keys
 *     2. Calls Next.js /api/revalidate → revalidatePath("/blog", "/blog/{slug}")
 *   After admin publish, the updated post is visible within 1-2 seconds.
 *
 * WHY THE OLD CODE WAS BROKEN:
 *   blog-api.ts used apiGetRaw() from services/api.ts.
 *   services/api.ts had: const DEFAULT_INIT = { cache: "no-store" }
 *   apiGetRaw called: apiRequest(path, { ...DEFAULT_INIT, ...init })
 *   Result: { cache: "no-store", next: { revalidate: 300 } }
 *   In Next.js, cache: "no-store" wins over next.revalidate.
 *   All ISR was silently broken. Every page render hit the backend fresh.
 *
 * THE FIX:
 *   services/api.ts now has NO default cache option.
 *   blog-api.ts passes { next: { revalidate: REVALIDATE_SECONDS } } explicitly.
 *   ISR works correctly on the server. Client calls use { cache: "no-store" }.
 *
 * FALLBACK:
 *   Every function returns an empty result on network or parse error —
 *   the page renders with "no posts" state rather than crashing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { apiGetRaw } from "@/services/api";

const BLOG_PLACEHOLDER_IMAGE = "/images/vietnam-banner-desk.webp";
const REVALIDATE_SECONDS      = 300; // 5 min — matches backend Redis TTL

// ── Public types ──────────────────────────────────────────────────────────────

export type BlogCategory = {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  is_featured: boolean;
  post_count:  number;
};

export type BlogPost = {
  id:              string;
  title:           string;
  slug:            string;
  excerpt:         string;
  coverImage:      string;
  publishedAt:     string;  // human-readable "12 Jun 2025"
  publishedAtIso:  string;  // ISO for <time datetime="">
  readMinutes:     number;
  is_featured:     boolean;
  author_name:     string | null;
  category:        { name: string; slug: string } | null;
  tags:            string[];
  // Full content — only populated by getBlogPost(), never by list calls
  content?:        string;
  tableOfContents?: Array<{ id: string; text: string; level: number }>;
  // SEO fields
  seoTitle?:           string;
  seoDescription?:     string;
  ogImage?:            string;
  ogTitle?:            string;
  ogDescription?:      string;
  canonicalUrl?:       string;
  robots?:             string;
  schemaType?:         string;
  schemaMarkup?:       string | null;
  twitterTitle?:       string | null;
  twitterDescription?: string | null;
};

// ── Raw API shapes (Python backend) ──────────────────────────────────────────

type RawPost = {
  id?:              string;
  title?:           string | null;
  slug?:            string | null;
  excerpt?:         string | null;
  featured_image?:  string | null;
  published_at?:    string | null;
  read_time?:       number | null;
  is_featured?:     boolean;
  author_name?:     string | null;
  category?:        { name: string; slug: string } | null;
  tags?:            string[];
  content?:         string | null;
  table_of_contents?: Array<{ id: string; text: string; level: number }>;
  seo_title?:           string | null;
  seo_description?:     string | null;
  og_image?:            string | null;
  og_title?:            string | null;
  og_description?:      string | null;
  canonical_url?:       string | null;
  robots?:              string | null;
  schema_type?:         string | null;
  schema_markup?:       string | null;
  twitter_title?:       string | null;
  twitter_description?: string | null;
};

type RawListResponse = {
  posts:       RawPost[];
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
};

type RawPostResponse = {
  post:    RawPost;
  related: RawPost[];
};

// ── Cache init helpers ────────────────────────────────────────────────────────
//
// Server-side: ISR cache via { next: { revalidate: N } }
// Client-side: no-store so browser always fetches fresh (rare — blog data
//              is almost always fetched server-side in RSC/SSR)
//
// _isServer() is evaluated at call-time inside the request lifecycle.
// On the server, Next.js intercepts native fetch() calls with the `next`
// option and applies ISR caching. On the browser, no Next.js interception
// occurs — `next` is ignored, and we use no-store for correctness.

function _isServer(): boolean {
  return typeof window === "undefined";
}

function _blogCacheInit(revalidate: number): RequestInit {
  if (_isServer()) {
    return { next: { revalidate } } as RequestInit;
  }
  // Client-side: always fetch fresh (blog detail components don't exist
  // as client components — all blog rendering is server-side)
  return { cache: "no-store" };
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function formatPublishedDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function mapRawPost(raw: RawPost): BlogPost | null {
  const slug  = (raw.slug  ?? "").trim();
  const title = (raw.title ?? "").trim();
  if (!slug || !title) return null;

  return {
    id:              raw.id ?? slug,
    title,
    slug,
    excerpt:         (raw.excerpt ?? "").trim(),
    coverImage:      raw.featured_image?.trim() || BLOG_PLACEHOLDER_IMAGE,
    publishedAt:     formatPublishedDate(raw.published_at),
    publishedAtIso:  raw.published_at ?? "",
    readMinutes:     raw.read_time ?? 1,
    is_featured:     raw.is_featured ?? false,
    author_name:     raw.author_name ?? null,
    category:        raw.category ?? null,
    tags:            raw.tags ?? [],
    content:         raw.content ?? undefined,
    tableOfContents: raw.table_of_contents ?? [],
    seoTitle:            raw.seo_title            ?? undefined,
    seoDescription:      raw.seo_description      ?? undefined,
    ogImage:             raw.og_image ?? raw.featured_image ?? undefined,
    ogTitle:             raw.og_title             ?? undefined,
    ogDescription:       raw.og_description       ?? undefined,
    canonicalUrl:        raw.canonical_url         ?? undefined,
    robots:              raw.robots               ?? "index,follow",
    schemaType:          raw.schema_type          ?? "BlogPosting",
    schemaMarkup:        raw.schema_markup        ?? null,
    twitterTitle:        raw.twitter_title        ?? null,
    twitterDescription:  raw.twitter_description  ?? null,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Paginated list of published posts.
 *
 * Server: ISR-cached 5 min via Next.js disk cache.
 *         Same URL params = one backend call per 5 min, all page visitors share it.
 * Client: cache: "no-store" (rare — blog listing is server-rendered).
 */
export async function getBlogs(
  limit    = 12,
  category?: string,
  page     = 1,
): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams({
    page:  String(page),
    limit: String(Math.min(limit, 50)),
  });
  if (category) qs.set("category", category);

  const raw = await apiGetRaw<{ data: RawListResponse }>(
    `/v1/blog/posts?${qs}`,
    _blogCacheInit(REVALIDATE_SECONDS),
  );

  // Handle both ApiEnvelope { data: RawListResponse } and direct RawListResponse
  const list  = raw?.data ?? (raw as unknown as RawListResponse);
  const posts = (list?.posts ?? [])
    .map(mapRawPost)
    .filter((p): p is BlogPost => p !== null)
    .slice(0, limit);

  return {
    posts,
    total:      list?.total       ?? posts.length,
    totalPages: list?.total_pages ?? 1,
  };
}

/**
 * Single published post by slug with 3 related posts.
 *
 * Server: ISR-cached 5 min per slug.
 *         generateMetadata + page component both call this — Next.js
 *         deduplicates same-URL fetches within one request lifecycle.
 *         Combined with React.cache() in the page file, guaranteed 1 backend call.
 * Client: no-store (blog post detail is server-rendered).
 */
export async function getBlogPost(
  slug: string,
): Promise<{ post: BlogPost | null; related: BlogPost[] }> {
  const raw = await apiGetRaw<{ data: RawPostResponse }>(
    `/v1/blog/posts/${encodeURIComponent(slug)}`,
    _blogCacheInit(REVALIDATE_SECONDS),
  );

  const payload = raw?.data ?? (raw as unknown as RawPostResponse);
  const post    = payload?.post
    ? mapRawPost(payload.post)
    : null;
  const related = (payload?.related ?? [])
    .map(mapRawPost)
    .filter((p): p is BlogPost => p !== null);

  return { post, related };
}

/**
 * All active blog categories with post counts.
 *
 * Server: ISR-cached 5 min.
 * Used by blog listing sidebar and admin category filter.
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const raw = await apiGetRaw<{ data: BlogCategory[] }>(
    "/v1/blog/categories",
    _blogCacheInit(REVALIDATE_SECONDS),
  );

  const list = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
      ? (raw as unknown as BlogCategory[])
      : [];

  return list;
}