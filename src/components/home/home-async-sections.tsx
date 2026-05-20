import { getBlogs, getPackages, getTestimonials } from "@/lib/cms-api";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { TrendingTours } from "@/components/home/TrendingTours";

export async function TrendingToursSection() {
  const packages = await getPackages();
  return <TrendingTours tours={packages} />;
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
