"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Button } from "@/components/ui/button";
import type { TourPackage } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TrendingToursProps = {
  tours: TourPackage[];
  className?: string;
};

export function TrendingTours({ tours, className }: TrendingToursProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="packages" className={cn("bg-white py-16 sm:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Limited seasonal fares
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Trending tour packages
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Fully escorted journeys with transparent inclusions — no surprise
              exclusions at checkout.
            </p>
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="relative mt-10"
        >
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.05}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4800, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1.2 },
              900: { slidesPerView: 2.1 },
              1280: { slidesPerView: 3.05 },
            }}
            className="!pb-12 trending-swiper"
          >
            {tours.map((tour) => (
              <SwiperSlide key={tour.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-glass transition hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      fill
                      sizes="(max-width: 900px) 90vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {tour.discountPct ? (
                      <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-md">
                        {tour.discountPct}% off
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>
                        {tour.durationDays}D / {tour.durationNights}N
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {tour.rating}{" "}
                        <span className="font-normal text-slate-400">
                          ({tour.reviewCount.toLocaleString("en-IN")})
                        </span>
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-ink">
                      {tour.title}
                    </h3>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          From
                        </p>
                        <p className="text-xl font-semibold text-primary">
                          ₹{tour.priceINR.toLocaleString("en-IN")}
                        </p>
                        {tour.oldPriceINR ? (
                          <p className="text-xs text-slate-400 line-through">
                            ₹{tour.oldPriceINR.toLocaleString("en-IN")}
                          </p>
                        ) : null}
                      </div>
                      <Button asChild variant="accent" className="rounded-full px-5">
                        <Link href="#">View details</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
