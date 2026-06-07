import { getBlogs, getTestimonials } from "@/lib/cms-api";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { TrendingToursApiSection } from "@/components/home/trending-tours-api-section";

export function TrendingToursSection() {
  return <TrendingToursApiSection />;
}

export async function BlogPreviewSection() {
  const blogs = await getBlogs(12);
  if (!blogs.length) return null;
  return <BlogPreview posts={blogs} />;
}

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  return <Testimonials items={testimonials} />;
}
