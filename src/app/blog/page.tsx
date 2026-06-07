import { getBlogs } from "@/lib/blog-api";
import { BlogListingView } from "@/components/blog/blog-listing-view";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel guides & tips",
  description:
    "Practical destination guides, seasonal advice, and itinerary ideas from UNO Trips editors.",
};

export default async function BlogIndexPage() {
  const posts = await getBlogs(50);
  return <BlogListingView posts={posts} />;
}
