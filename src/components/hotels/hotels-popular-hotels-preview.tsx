"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HotelGridCard } from "@/components/hotels/hotel-grid-card";
import { HotelsSectionHeader } from "@/components/hotels/hotels-section-header";
import type { HotelListing } from "@/lib/hotels-catalog";

const POPULAR_LIMIT = 4;

type HotelsPopularHotelsPreviewProps = {
  hotels: HotelListing[];
  viewMoreHref: string;
};

function pickPopularHotels(hotels: HotelListing[]): HotelListing[] {
  return [...hotels]
    .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
    .slice(0, POPULAR_LIMIT);
}

export function HotelsPopularHotelsPreview({ hotels, viewMoreHref }: HotelsPopularHotelsPreviewProps) {
  const popular = pickPopularHotels(hotels);

  return (
    <section className="py-12 sm:py-14 lg:py-16" id="popular-hotels">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <HotelsSectionHeader
            eyebrow="Guest favourites"
            title="Popular Hotels"
            description="Top-rated stays loved by travellers — handpicked for comfort, location, and value."
          />
          <Link
            href={viewMoreHref}
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border-2 border-primary bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white"
          >
            View more
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {popular.map((hotel) => (
            <HotelGridCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href={viewMoreHref}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            View more hotels
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}