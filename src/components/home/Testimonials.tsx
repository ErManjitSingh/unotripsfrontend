"use client";

import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TestimonialCard } from "@/components/home/testimonial-card";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TestimonialsProps = {
  items: Testimonial[];
  className?: string;
};

export function Testimonials({ items, className }: TestimonialsProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = items.length;

  return (
    <section className={cn("bg-[#faf8f4] py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          {/* Eyebrow with lines */}
          <div className="flex w-full max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-primary/40" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Voices From The Road
            </span>
            <span className="h-px flex-1 bg-primary/40" />
          </div>

          <h2 className="mt-4 font-serif text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Testimonials
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-500">
            Real travelers. Private journeys. Consistently exceptional feedback.
          </p>
        </div>

        {/* Carousel */}
        <Swiper
          onSwiper={(s) => { swiperRef.current = s; }}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1100: { slidesPerView: 3 },
          }}
          className="!pb-2"
        >
          {items.map((t) => (
            <SwiperSlide key={t.id} className="!h-auto">
              <div className="h-full py-2">
                <TestimonialCard item={t} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation: ← dots → */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => swiperRef.current?.slideTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-5 bg-primary"
                    : "w-2 bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white"
            aria-label="Next testimonial"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

      </div>
    </section>
  );
}
