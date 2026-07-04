/**
 * src/components/home/home-async-sections.tsx
 *
 * Async RSC sections rendered on the homepage via <Suspense>.
 * Each function is an async Server Component — data is fetched at render time
 * and streamed to the client progressively.
 *
 * Testimonials: static data (no backend endpoint yet)
 * Trending tours: client component with its own data fetching
 */

import { getTestimonials } from "@/lib/cms-api";
import { Testimonials }           from "@/components/home/Testimonials";
import { TrendingToursApiSection } from "@/components/home/trending-tours-api-section";

export function TrendingToursSection() {
  return <TrendingToursApiSection />;
}

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  return <Testimonials items={testimonials} />;
}