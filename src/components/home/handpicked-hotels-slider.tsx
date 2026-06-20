"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Building2,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Navigation } from "swiper/modules";
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

const TRUST_BADGES = [
  { icon: ShieldCheck, title: "Best Price Guarantee", sub: "Find a lower price? We'll match it" },
  { icon: Tag,         title: "Exclusive Deals",       sub: "Get access to member-only prices" },
  { icon: Headphones,  title: "24/7 Customer Support", sub: "We're here to help anytime" },
  { icon: CalendarCheck2, title: "Free Cancellation",  sub: "On most bookings" },
] as const;

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
              slidesPerView={1.08}
              slidesPerGroup={1}
              watchOverflow
              breakpoints={{
                640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
                1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
                1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 },
              }}
              className="!pb-4 !pt-1"
            >
              {hotels.map((hotel) => (
                <SwiperSlide key={hotel.id} className="!h-auto">
                  <div className="flex h-full flex-col">
                    <HotelGridCard hotel={hotel} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-5 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 px-4 first:pl-0 last:pr-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
