"use client";

import { useState } from "react";
import { Clock, MapPin, Star } from "lucide-react";
import type { HotelCity, HotelListing, HotelPhotoCategory } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type HotelDetailAboutProps = {
  hotel: HotelListing;
  city: HotelCity;
  photoCategories?: HotelPhotoCategory[];
  className?: string;
};

const PHOTO_CATEGORY_COLORS: Record<string, string> = {
  exterior:  "bg-[#e8f4fd] text-[#1565C0]",
  rooms:     "bg-[#fff3eb] text-[#c94e0a]",
  dining:    "bg-[#e8f5e9] text-[#2E7D32]",
  pool:      "bg-[#e3f2fd] text-[#0277BD]",
  spa:       "bg-[#f3e5f5] text-[#6A1B9A]",
  lobby:     "bg-[#fff8e1] text-[#F57F17]",
};

function getCategoryColor(category: string) {
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(PHOTO_CATEGORY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "bg-[#f5f5f5] text-[#616161]";
}

export function HotelDetailAbout({ hotel, city, photoCategories, className }: HotelDetailAboutProps) {
  const description =
    hotel.description?.trim() ||
    `Stay at ${hotel.name} in ${hotel.area}, ${city.name}.`;

  const TRUNCATE_AT = 220;
  const isLong = description.length > TRUNCATE_AT;
  const [expanded, setExpanded] = useState(false);
  const displayDesc = isLong && !expanded ? description.slice(0, TRUNCATE_AT) + "…" : description;

  return (
    <div className={cn("p-5 sm:p-6", className)}>
      {/* Header */}
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
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#EF6614]" strokeWidth={2} aria-hidden />
          <span>{hotel.address?.trim() || `${city.name}, ${hotel.state}`}</span>
        </p>

        {/* Quick facts */}
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2">
            <Star className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
            <span className="text-[12px] font-semibold text-[#424242]">{hotel.stars}-Star Hotel</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2">
            <MapPin className="h-3.5 w-3.5 text-[#EF6614]" aria-hidden />
            <span className="text-[12px] font-semibold text-[#424242]">{hotel.area}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-[#757575]" aria-hidden />
            <span className="text-[12px] text-[#424242]">Check-in 2:00 PM · Check-out 12:00 PM</span>
          </div>
        </div>

        {hotel.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-2.5 py-0.5 text-[11px] font-medium text-[#616161]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Description */}
      <div className="mt-4">
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#424242]">{displayDesc}</p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[13px] font-semibold text-[#EF6614] hover:underline"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      {/* Photo categories */}
      {photoCategories && photoCategories.length > 0 ? (
        <div className="mt-5 border-t border-[#eee] pt-4">
          <h3 className="text-[13px] font-bold text-[#212121]">Photo Gallery</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {photoCategories.map((cat) => (
              <span
                key={cat.category}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-semibold",
                  getCategoryColor(cat.category),
                )}
              >
                {cat.label} ({cat.images.length})
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
