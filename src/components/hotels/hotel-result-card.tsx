"use client";

import Link from "next/link";
import { Check, Heart, MapPin, Star } from "lucide-react";
import { HotelCardGallery } from "@/components/hotels/hotel-card-gallery";
import { HotelTagBadgeList } from "@/components/hotels/hotel-tag-badge";
import { hotelDetailHref, hotelListingKey, type HotelListing } from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

type HotelResultCardProps = {
  hotel: HotelListing;
  className?: string;
};

export function HotelResultCard({ hotel, className }: HotelResultCardProps) {
  const amenityLine = [...hotel.amenities, `+ ${hotel.amenityMoreCount} More`].join(" • ");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full shrink-0 border-b border-[#eee] p-3 lg:w-[240px] lg:border-b-0 lg:border-r xl:w-[260px]">
          <HotelCardGallery
            hotelId={hotel.id}
            hotelName={hotel.name}
            images={hotel.images}
            dealOfDay={hotel.dealOfDay}
          />
        </div>

        <div className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-lg font-bold text-[#212121] sm:text-xl">{hotel.name}</h3>
            <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} star hotel`}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
              ))}
            </span>
          </div>

          <p className="mt-1 flex items-start gap-1 text-[12px] text-[#757575] sm:text-[13px]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            <span>{hotel.locationLine}</span>
          </p>

          <HotelTagBadgeList tags={hotel.tags} className="mt-2" />

          <p className="mt-2 text-[12px] capitalize text-[#757575]">{amenityLine}</p>

          {hotel.highlights.map((h) => (
            <p key={h} className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[#2E7D32]">
              <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
              {h}
            </p>
          ))}

          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[#616161] sm:text-[13px]">
            {hotel.description}{" "}
            <button type="button" className="font-semibold text-[#2196F3] hover:underline">
              Read more
            </button>
          </p>
        </div>

        <div className="flex shrink-0 flex-row items-end justify-between gap-4 border-t border-[#eee] p-3 sm:p-4 lg:w-[200px] lg:flex-col lg:items-stretch lg:justify-start lg:border-l lg:border-t-0 xl:w-[220px]">
          <div className="flex items-start gap-2 lg:justify-end">
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="rounded bg-[#008009] px-1.5 py-0.5 text-sm font-bold text-white">
                  {hotel.rating.toFixed(1)}
                </span>
                <span className="text-left text-[12px] leading-tight text-[#212121]">
                  <span className="block font-semibold">{hotel.ratingLabel}</span>
                  <span className="text-[#757575]">{formatInrAmount(hotel.reviewCount)} Reviews</span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right lg:mt-auto">
            <p className="text-[12px] text-[#9E9E9E] line-through">₹ {formatInrAmount(hotel.originalPrice)}</p>
            <p className="text-xl font-bold text-[#212121] sm:text-2xl">
              ₹ {formatInrAmount(hotel.price)}
            </p>
            <p className="mt-0.5 text-[11px] text-[#757575]">
              + ₹{formatInrAmount(hotel.taxes)} Taxes &amp; fees Per Night
            </p>
            <Link
              href={hotelDetailHref(hotel.citySlug, hotelListingKey(hotel))}
              className="mt-3 flex w-full min-w-[120px] items-center justify-center rounded-md bg-[#EF6614] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E65100] sm:min-w-[140px]"
            >
              View Room
            </Link>
            <Link
              href="/login"
              className="mt-2 inline-flex w-full items-center justify-end gap-1 text-[12px] font-semibold text-[#2196F3] hover:underline"
            >
              Login &amp; Save More
              <Heart className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
