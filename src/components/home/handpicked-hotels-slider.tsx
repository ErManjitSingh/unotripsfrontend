"use client";

import Link from "next/link";
import { Navigation } from "swiper/modules";
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
  return (
    <section className="bg-gradient-to-b from-white via-orange-50/30 to-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Premium stays</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              Handpicked Hotels
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              {total}+ luxury &amp; boutique properties — 4 picks per view, swipe for more.
            </p>
          </div>
          <Link
            href="/hotels#all-hotels"
            className="inline-flex w-fit items-center rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            View all hotels
          </Link>
        </div>

        <div className="relative mt-8 w-full sm:mt-10">
          <Swiper
            modules={[Navigation]}
            nested
            navigation
            spaceBetween={14}
            slidesPerView={1.05}
            slidesPerGroup={1}
            watchOverflow
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 14,
              },
            }}
            className="handpicked-hotels-swiper trending-packages-swiper !pb-4 !pt-1"
          >
            {hotels.map((hotel) => (
              <SwiperSlide key={hotel.id} className="h-auto">
                <div className="h-full py-1.5">
                  <HotelGridCard hotel={hotel} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}