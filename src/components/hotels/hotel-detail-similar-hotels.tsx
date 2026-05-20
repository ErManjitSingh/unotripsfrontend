"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  hotelDetailHref,
  hotelListingKey,
  type HotelCity,
  type HotelListing,
} from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

type HotelDetailSimilarHotelsProps = {
  hotels: HotelListing[];
  city: HotelCity;
  className?: string;
};

function SimilarHotelCard({ hotel, city }: { hotel: HotelListing; city: HotelCity }) {
  const image = hotel.images[0] ?? hotel.images[1];

  return (
    <Link
      href={hotelDetailHref(hotel.citySlug, hotelListingKey(hotel))}
      className="group flex w-[min(100%,240px)] shrink-0 flex-col overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md sm:w-[240px]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-200">
        {image ? (
          <Image
            src={image}
            alt={hotel.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="240px"
          />
        ) : null}
        {hotel.dealOfDay ? (
          <span className="absolute right-2 top-2 z-10 rounded-sm bg-[#EF6614] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md">
            Deal of the Day
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[#212121] group-hover:text-[#2196F3]">
          {hotel.name}
        </h3>
        <span className="mt-1 flex items-center gap-0.5" aria-label={`${hotel.stars} stars`}>
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" aria-hidden />
          ))}
        </span>
        <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-[#757575]">
          {hotel.locationLine}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-[#eee] pt-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1">
              <span className="rounded bg-[#008009] px-1.5 py-0.5 text-[11px] font-bold text-white">
                {hotel.rating.toFixed(1)}
              </span>
              <span className="text-[10px] font-semibold text-[#212121]">{hotel.ratingLabel}</span>
            </span>
            <p className="mt-0.5 text-[10px] text-[#757575]">
              {formatInrAmount(hotel.reviewCount)} Reviews
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-[#9E9E9E] line-through">₹ {formatInrAmount(hotel.originalPrice)}</p>
            <p className="text-base font-bold text-[#212121]">₹ {formatInrAmount(hotel.price)}</p>
            <p className="mt-0.5 text-[9px] leading-tight text-[#757575]">
              + ₹{formatInrAmount(hotel.taxes)} taxes &amp; fees
              <br />
              per night, per room
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HotelDetailSimilarHotels({ hotels, city, className }: HotelDetailSimilarHotelsProps) {
  if (hotels.length === 0) return null;

  return (
    <section className={cn("rounded-lg border border-[#e0e0e0] bg-white p-5 shadow-sm sm:p-6", className)}>
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Similar Hotels</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
        {hotels.map((hotel) => (
          <SimilarHotelCard key={hotel.id} hotel={hotel} city={city} />
        ))}
      </div>
    </section>
  );
}
