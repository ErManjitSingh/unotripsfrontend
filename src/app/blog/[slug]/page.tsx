/**
 * src/app/blog/[slug]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Individual blog post page.
 *
 * CHANGES vs previous version:
 * ─────────────────────────────
 * 1. ELIMINATED double getBlogPost() call
 *
 *    BEFORE:
 *      generateMetadata() called getBlogPost(slug) independently.
 *      BlogPostPage() called getBlogPost(slug) again.
 *      Because apiGetRaw() used cache: "no-store", Next.js could NOT
 *      deduplicate these calls. Result: 2 backend calls per page render —
 *      one for metadata, one for content — even though both return identical data.
 *
 *    AFTER:
 *      React.cache() wraps getBlogPost() into a per-request memoized function.
 *      Both generateMetadata() and BlogPostPage() call getCachedBlogPost(slug).
 *      The second call returns the already-resolved Promise from the first.
 *      Guaranteed: exactly 1 backend call per page render, regardless of how
 *      many times the function is called within the same request.
 *
 *      This is the production pattern from Next.js docs for sharing data
 *      between generateMetadata and page components.
 *
 * 2. ISR now actually works
 *
 *    BEFORE: apiGetRaw defaulted to cache: "no-store" which silently overrode
 *            { next: { revalidate: 300 } }. Every render hit the backend fresh.
 *
 *    AFTER:  services/api.ts fixed — no conflicting default. blog-api.ts now
 *            uses { next: { revalidate: 300 } } correctly on the server.
 *            Next.js caches the rendered page for 5 min. Most visitors get
 *            the cached page with zero backend calls.
 *
 *    Cache hierarchy for a blog post page:
 *      1. Next.js ISR page cache (5 min) — serves pre-rendered HTML, zero calls
 *      2. React.cache() per-request memo — deduplicates within one render
 *      3. Next.js fetch cache (5 min) — deduplicates across same-URL fetches
 *      4. Backend Redis (5 min) — protects DB from cold ISR misses
 *      5. Database — only hit when all caches miss
 *
 * 3. revalidate = 300 (5 min ISR) — unchanged, already correct.
 *
 * 4. generateStaticParams uses getBlogs(100) — this call is ISR-cached too
 *    since services/api.ts fix propagates to all apiGetRaw callers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cache }         from "react";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import { BlogPostDetail }            from "@/components/blog/blog-post-detail";
import { getBlogPost, getBlogs }     from "@/lib/blog-api";
import { TRAVEL_HOME_BRAND }         from "@/lib/travel-home-brand";
import { SITE }                      from "@/lib/constants";

// ISR: revalidated every 5 min or on-demand after admin publishes/updates.
// Admin backend calls bust_blog_cache() which triggers revalidatePath("/blog/{slug}")
// via /api/revalidate — instant update without waiting for TTL.
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

// ── Request-level memoization ─────────────────────────────────────────────────
//
// React.cache() creates a per-request memoized function.
// Scope: one server request — cleared after each request, no cross-request leakage.
//
// Why needed even with ISR:
//   ISR caches the RENDERED PAGE across requests (disk cache).
//   React.cache() deduplicates WITHIN one render request.
//   Both generateMetadata() and BlogPostPage() call getCachedBlogPost(slug).
//   Without cache(): 2 fetch() calls → 2 network requests to backend.
//   With cache(): 1 fetch() call → second call returns memoized Promise.
//
// Works on top of Next.js fetch deduplication as a second layer.
// Belt AND suspenders — guaranteed 1 backend call per render.
const getCachedBlogPost = cache(
  (slug: string) => getBlogPost(slug),
);

// ── Static generation ─────────────────────────────────────────────────────────
//
// Pre-renders all published post pages at build time.
// New posts not in this list are rendered on first visit (ISR).
// getBlogs() is now ISR-cached → fast at build time.

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const { posts } = await getBlogs(100);
    return posts
      .map((p) => p.slug)
      .filter(Boolean)
      .map((slug) => ({ slug }));
  } catch {
    // Build proceeds without static params — all pages rendered on first visit
    return [];
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // getCachedBlogPost: memoized — if BlogPostPage already called it,
  // this returns the same Promise. Zero extra backend calls.
  const { post } = await getCachedBlogPost(slug);

  if (!post) {
    return { title: `Article | ${TRAVEL_HOME_BRAND.name}` };
  }

  const title       = post.seoTitle       ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  const image       = post.ogImage        ?? post.coverImage;
  const canonical   = post.canonicalUrl   ?? `${SITE.url}/blog/${slug}`;

  return {
    title,
    description,
    robots:     post.robots ?? "index,follow",
    alternates: { canonical },
    openGraph: {
      type:          "article",
      title:         post.ogTitle       ?? title,
      description:   post.ogDescription ?? description,
      images:        image ? [{ url: image, alt: title }] : undefined,
      publishedTime: post.publishedAtIso || undefined,
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.twitterTitle       ?? title,
      description: post.twitterDescription ?? description,
      images:      image ? [image] : undefined,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // getCachedBlogPost: memoized — if generateMetadata already called it,
  // this is a cache hit. No extra fetch. No extra DB query.
  const { post, related } = await getCachedBlogPost(slug);

  if (!post) notFound();

  return <BlogPostDetail post={post} related={related} />;
}