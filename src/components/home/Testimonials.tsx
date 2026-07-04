"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialCard } from "@/components/home/testimonial-card";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TestimonialsProps = {
  items: Testimonial[];
  className?: string;
};

export function Testimonials({ items, className }: TestimonialsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-testimonial-card]");
    const step = card ? card.offsetWidth + 24 : 360;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className={cn("bg-[#faf8f4] py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                Voices From The Road
              </span>
              <span className="h-px w-8 bg-primary" aria-hidden />
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Testimonials
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-500 sm:text-base">
              Real travelers. Private journeys. Consistently exceptional feedback.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-end sm:mb-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Reader-paced scroller — no autoplay */}
        <div
          ref={scrollerRef}
          className={cn(
            "mt-10 flex gap-6 overflow-x-auto overflow-y-hidden pb-2",
            "scroll-smooth snap-x snap-mandatory",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {items.map((t) => (
            <div
              key={t.id}
              data-testimonial-card
              className="w-[min(90vw,380px)] shrink-0 snap-start sm:w-[360px]"
            >
              <TestimonialCard item={t} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
