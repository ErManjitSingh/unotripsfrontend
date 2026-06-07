"use client";

import { MapPin, Star } from "lucide-react";
import type { HotelCity, HotelListing, HotelPhotoCategory } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type HotelDetailAboutProps = {
  hotel: HotelListing;
  city: HotelCity;
  photoCategories?: HotelPhotoCategory[];
  className?: string;
};

export function HotelDetailAbout({ hotel, city, photoCategories, className }: HotelDetailAboutProps) {
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
        {hotel.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hotel.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[#e0e0e0] bg-[#fafafa] px-2 py-0.5 text-[11px] font-medium text-[#616161]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed text-[#424242]">
        {description}
      </p>

      {photoCategories && photoCategories.length > 0 ? (
        <div className="mt-5 border-t border-[#eee] pt-4">
          <h3 className="text-[13px] font-bold text-[#212121]">Photo gallery</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {photoCategories.map((cat) => (
              <li
                key={cat.category}
                className="rounded-md border border-[#e0e0e0] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#424242]"
              >
                {cat.label} ({cat.images.length})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
