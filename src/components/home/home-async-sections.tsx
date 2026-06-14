/**
 * src/components/home/home-async-sections.tsx
 *
 * Async RSC sections rendered on the homepage via <Suspense>.
 * Each function is an async Server Component — data is fetched at render time
 * and streamed to the client progressively.
 *
 * Blog: uses getFeaturedBlogPosts() → /v1/blog/posts/featured (Python backend)
 * Testimonials: static data (no backend endpoint yet)
 * Trending tours: client component with its own data fetching
 */

import { getFeaturedBlogPosts, getTestimonials } from "@/lib/cms-api";
import { BlogPreview }            from "@/components/home/BlogPreview";
import { Testimonials }           from "@/components/home/Testimonials";
import { TrendingToursApiSection } from "@/components/home/trending-tours-api-section";

export function TrendingToursSection() {
  return <TrendingToursApiSection />;
}

export async function BlogPreviewSection() {
  // getFeaturedBlogPosts returns BlogPost[] directly (not wrapped)
  const blogs = await getFeaturedBlogPosts(3);
  if (!blogs.length) return null;
  return <BlogPreview posts={blogs} />;
}

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  return <Testimonials items={testimonials} />;
}