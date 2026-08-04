"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { HotelGridCard } from "@/components/hotels/hotel-grid-card";
import type { HotelListing } from "@/lib/hotels-catalog";

type HandpickedHotelsSliderProps = {
  hotels: HotelListing[];
  total: number;
};

export function HandpickedHotelsSlider({ hotels, total }: HandpickedHotelsSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="border-b border-slate-200/80 bg-slate-100 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:rounded-3xl sm:p-6 lg:p-8">

          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-4 w-0.5 rounded-full bg-primary" aria-hidden />
                <Building2 className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Premium Stays
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Handpicked Hotels
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
                {total}+ luxury &amp; boutique properties — 4 picks per view, swipe for more.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
              <Link
                href="/hotels#all-hotels"
                className="rounded-full border-2 border-primary bg-transparent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                View all hotels &rsaquo;
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-10 sm:w-10"
                  aria-label="Previous hotels"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => swiperRef.current?.slideNext()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-10 sm:w-10"
                  aria-label="Next hotels"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative w-full">
            <Swiper
              onSwiper={(s) => { swiperRef.current = s; }}
              spaceBetween={16}
              slidesPerView="auto"
              slidesPerGroup={1}
              watchOverflow
              className="!pb-4 !pt-1"
            >
              {hotels.map((hotel) => (
                <SwiperSlide key={hotel.id} className="!h-auto !w-[66%] sm:!w-[calc(50%-7px)] lg:!w-[calc(33.333%-11px)] xl:!w-[calc(25%-12px)]">
                  <div className="flex h-full flex-col">
                    <HotelGridCard hotel={hotel} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

        </div>
      </div>
    </section>
  );
}
