"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TestimonialsProps = {
  items: Testimonial[];
  className?: string;
};

export function Testimonials({ items, className }: TestimonialsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("bg-surface py-16 sm:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5200, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            className="!pb-12 testimonial-swiper"
          >
            {items.map((t) => (
              <SwiperSlide key={t.id}>
                <figure className="glass-panel flex h-full flex-col rounded-3xl p-6 shadow-glass">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-white shadow-sm">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <figcaption className="font-semibold text-ink">{t.name}</figcaption>
                      <p className="text-xs text-slate-500">{t.location}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-0.5 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < t.rating ? "fill-amber-400" : "fill-transparent",
                        )}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                    “{t.text}”
                  </blockquote>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
