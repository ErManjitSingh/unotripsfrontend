"use client";

import { MapPin, Star } from "lucide-react";
import type { HotelCity, HotelListing } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type HotelDetailAboutProps = {
  hotel: HotelListing;
  city: HotelCity;
  className?: string;
};

export function HotelDetailAbout({ hotel, city, className }: HotelDetailAboutProps) {
  const description =
    hotel.description?.trim() ||
    `Stay at ${hotel.name} in ${hotel.area}, ${city.name}.`;

  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <div className="border-b border-[#eee] pb-4">
        <div className="flex flex-wrap items-start gap-2">
          <h2 className="text-lg font-bold text-[#212121] sm:text-xl">About {hotel.name}</h2>
          <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} star hotel`}>
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
            ))}
          </span>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-[13px] text-[#616161]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#757575]" strokeWidth={2} aria-hidden />
          <span>
            {hotel.address?.trim() || `${city.name}, ${hotel.state}`}
          </span>
        </p>
      </div>

      <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed text-[#424242]">
        {description}
      </p>
    </div>
  );
}
