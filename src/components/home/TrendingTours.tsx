"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { TrendingTourCard } from "@/components/home/trending-tour-card";
import { TrendingToursCarousel } from "@/components/home/trending-tours-carousel";
import type { TourPackage } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TrendingToursProps = {
  tours: TourPackage[];
  className?: string;
};

export function TrendingTours({ tours, className }: TrendingToursProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section
      id="packages"
      className={cn("border-b border-slate-200/80 bg-slate-100 py-6 sm:py-8 lg:py-10", className)}
    >
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:rounded-3xl sm:p-6 lg:p-8">

          {/* ── Header ── */}
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {/* HANDPICKED ROUTES label */}
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-0.5 rounded-full bg-primary" aria-hidden />
                <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Handpicked Routes
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Packages guests love
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
                Curated routes with clear pricing — use arrows to browse more packages.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
              <Link
                href="/packages"
                className="rounded-full border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                View all packages &rsaquo;
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-10 sm:w-10"
                  aria-label="Previous packages"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-10 sm:w-10"
                  aria-label="Next packages"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Carousel ── */}
          <div className="relative w-full">
            <TrendingToursCarousel
              className="!pb-4 !pt-1"
              onSwiper={(s) => { swiperRef.current = s; }}
            >
              {tours.map((tour) => (
                <TrendingTourCard key={tour.id} tour={tour} />
              ))}
            </TrendingToursCarousel>
          </div>

          {/* ── Trust badges ── */}

        </div>
      </div>
    </section>
  );
}
