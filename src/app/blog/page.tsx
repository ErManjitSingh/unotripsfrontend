/**
 * src/app/blog/page.tsx
 *
 * Blog listing page — paginated published posts from Python backend.
 * Uses ISR (revalidate 300s via blog-api.ts fetch options).
 * Switched from force-dynamic to ISR: page is pre-generated and
 * refreshed in background every 5 minutes or on admin publish.
 */

import type { Metadata } from "next";
import { BlogListingView } from "@/components/blog/blog-listing-view";
import { getBlogs } from "@/lib/blog-api";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

// ISR — page is statically generated, refreshed every 5 min or on-demand
// via /api/revalidate after admin publishes a post.
export const revalidate = 300;

export const metadata: Metadata = {
  title:       `Travel Guides & Tips | ${TRAVEL_HOME_BRAND.name}`,
  description: "Practical destination guides, seasonal advice, and itinerary ideas from UNO Trips editors.",
  openGraph: {
    title:       `Travel Guides & Tips | ${TRAVEL_HOME_BRAND.name}`,
    description: "Destination guides, travel tips, and curated itineraries from India and beyond.",
  },
};

export default async function BlogIndexPage() {
  // getBlogs() returns { posts, total, totalPages } — destructure posts array
  const { posts } = await getBlogs(50);
  return <BlogListingView posts={posts} />;
}