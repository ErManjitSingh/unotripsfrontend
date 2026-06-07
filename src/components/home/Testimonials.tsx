import { TestimonialCard } from "@/components/home/testimonial-card";
import { TestimonialsCarousel } from "@/components/swiper/swiper-client";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TestimonialsProps = {
  items: Testimonial[];
  className?: string;
};

export function Testimonials({ items, className }: TestimonialsProps) {
  return (
    <section className={cn("bg-surface py-8 sm:py-10 lg:py-12", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Voices from the road
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Testimonials
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Real travelers. Private journeys. Consistently exceptional feedback.
          </p>
        </div>

        <div className="mt-5">
          <TestimonialsCarousel className="!pb-6 testimonial-swiper">
            {items.map((t) => (
              <TestimonialCard key={t.id} item={t} />
            ))}
          </TestimonialsCarousel>
        </div>
      </div>
    </section>
  );
}
