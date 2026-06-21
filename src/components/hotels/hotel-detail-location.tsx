"use client";

import { ExternalLink, MapPin } from "lucide-react";
import type { HotelCity, HotelListing } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type HotelDetailLocationProps = {
  hotel: HotelListing;
  city: HotelCity;
  nearbyAttractions?: string[];
  className?: string;
};

export function HotelDetailLocation({
  hotel,
  city,
  nearbyAttractions = [],
  className,
}: HotelDetailLocationProps) {
  const address = hotel.address?.trim() || `${city.name}, ${hotel.state ?? ""}, ${hotel.country ?? "India"}`;
  const hasCoords = hotel.latitude != null && hotel.longitude != null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${address}`)}`;
  const embedUrl = hasCoords
    ? `https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`
    : null;

  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#212121]">Location</h2>

      <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-[#424242]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#757575]" aria-hidden />
        <span>{address}</span>
      </p>

      {hasCoords ? (
        <p className="mt-1 text-[12px] text-[#757575]">
          Coordinates: {hotel.latitude!.toFixed(5)}, {hotel.longitude!.toFixed(5)}
        </p>
      ) : null}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#EF6614] hover:underline"
      >
        Open in Google Maps
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>

      {embedUrl ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-[#e0e0e0]">
          <iframe
            title={`Map — ${hotel.name}`}
            src={embedUrl}
            className="h-[280px] w-full border-0 sm:h-[320px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}

      {nearbyAttractions.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-[13px] font-bold text-[#212121]">Nearby attractions</h3>
          <ul className="mt-2 space-y-1.5">
            {nearbyAttractions.map((place) => (
              <li key={place} className="flex items-start gap-2 text-[13px] text-[#424242]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF6614]" aria-hidden />
                {place}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}