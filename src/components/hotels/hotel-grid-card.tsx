"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Accessibility,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ConciergeBell,
  Dumbbell,
  Heart,
  ImageOff,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import {
  hotelDetailHref,
  hotelListingKey,
  type HotelListing,
} from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

type HotelGridCardProps = {
  hotel: HotelListing;
};

function discountPercent(original: number, current: number): number | null {
  if (original <= current || original <= 0) return null;
  return Math.round(((original - current) / original) * 100);
}

function amenityIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/wifi|wi-fi|internet/.test(n)) return Wifi;
  if (/park/.test(n)) return Car;
  if (/pool|swim/.test(n)) return Waves;
  if (/room.service|concierge/.test(n)) return ConciergeBell;
  if (/wheelchair|accessible/.test(n)) return Accessibility;
  if (/gym|fitness|workout/.test(n)) return Dumbbell;
  return Check;
}

function amenityLabel(name: string): string {
  const n = name.toLowerCase();
  if (/wifi|wi-fi|internet/.test(n)) return "Wi-Fi";
  if (/park/.test(n)) return "Parking";
  if (/pool|swim/.test(n)) return "Pool";
  if (/room.service/.test(n)) return "Room Service";
  if (/wheelchair|accessible/.test(n)) return "Wheelchair Access";
  if (/gym|fitness/.test(n)) return "Gym";
  return name;
}

function stopParentSwipe(e: React.SyntheticEvent) {
  e.stopPropagation();
}

export function HotelGridCard({ hotel }: HotelGridCardProps) {
  const [saved, setSaved] = useState(false);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const failedImages = useRef(new Set<number>());
  const [, forceUpdate] = useState(0);
  const href = hotelDetailHref(hotel.citySlug, hotelListingKey(hotel));

  const images = useMemo(
    () =>
      hotel.images.length > 0
        ? hotel.images
        : ["https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=800&q=80"],
    [hotel.images],
  );
  const imageCount = images.length;
  const discount = useMemo(
    () => discountPercent(hotel.originalPrice, hotel.price),
    [hotel.originalPrice, hotel.price],
  );
  const savings = Math.max(0, hotel.originalPrice - hotel.price);
  const showLastRoom = hotel.dealOfDay || hotel.roomOptionsCount <= 1;

  // Show max 3 amenity pills + overflow count
  const shownAmenities = hotel.amenities.slice(0, 3);
  const overflowCount = Math.max(0, hotel.amenities.length - 3);

  const slidePrev = useCallback(
    (e: React.MouseEvent) => {
      stopParentSwipe(e);
      e.preventDefault();
      swiper?.slidePrev();
    },
    [swiper],
  );

  const slideNext = useCallback(
    (e: React.MouseEvent) => {
      stopParentSwipe(e);
      e.preventDefault();
      swiper?.slideNext();
    },
    [swiper],
  );

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {/* Image gallery — top of card */}
      <div
        className="hotel-card-gallery swiper-no-swiping relative overflow-hidden bg-neutral-200"
        onTouchStart={stopParentSwipe}
        onTouchMove={stopParentSwipe}
        onPointerDown={stopParentSwipe}
      >
        <Swiper
          nested
          allowTouchMove={imageCount > 1}
          onSwiper={setSwiper}
          onSlideChange={(s) => setActiveIndex(s.realIndex)}
          className="w-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${hotel.id}-img-${index}`}>
              <div className="relative aspect-[4/3] w-full bg-neutral-100">
                {failedImages.current.has(index) ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-100">
                    <ImageOff className="h-10 w-10 text-neutral-300" aria-hidden />
                    <span className="text-[11px] text-neutral-400">No photo available</span>
                  </div>
                ) : (
                  <Image
                    src={src}
                    alt={`${hotel.name} photo ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 88vw, 310px"
                    loading={index === 0 ? "lazy" : undefined}
                    onError={() => {
                      failedImages.current.add(index);
                      forceUpdate((n) => n + 1);
                    }}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Badges & controls overlay */}
        {showLastRoom && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-20 rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            Our last room!
          </span>
        )}

        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:bg-white"
          aria-label={saved ? "Remove from saved" : "Save hotel"}
        >
          <Heart
            className={cn("h-4 w-4", saved ? "fill-[#e12d2d] text-[#e12d2d]" : "text-[#757575]")}
            aria-hidden
          />
        </button>

        {imageCount > 1 && (
          <>
            <button
              type="button"
              onPointerDown={stopParentSwipe}
              onClick={slidePrev}
              className="absolute left-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#212121] shadow-md transition hover:bg-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              onPointerDown={stopParentSwipe}
              onClick={slideNext}
              className="absolute right-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#212121] shadow-md transition hover:bg-white"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
            <span className="pointer-events-none absolute bottom-2 left-2 z-20 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {activeIndex + 1}/{imageCount}
            </span>
          </>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col">
        {/* Hotel name — main highlight */}
        <div className="px-4 pt-3">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[#212121]">
            {hotel.name}
          </h3>
        </div>

        {/* Amenity pills — single non-wrapping row */}
        {shownAmenities.length > 0 && (
          <div className="mx-4 mt-2 flex min-w-0 items-center gap-x-3 overflow-hidden border-t border-[#f0f0f0] pt-2">
            {shownAmenities.map((item) => {
              const Icon = amenityIcon(item);
              return (
                <span
                  key={item}
                  className="flex shrink-0 items-center gap-1 text-[11px] text-[#555]"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#888]" aria-hidden />
                  <span className="max-w-[80px] truncate">{amenityLabel(item)}</span>
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span className="shrink-0 rounded border border-[#e0e0e0] px-1.5 py-0.5 text-[10px] font-semibold text-[#888]">
                +{overflowCount}
              </span>
            )}
          </div>
        )}

        {/* Pricing pod */}
        <div className="mx-3 mt-2 rounded-xl border border-[#ebebeb] bg-[#fdf9f7] px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#b8b8b8]">
                Starting from
              </p>
              <p className="mt-0.5 text-[21px] font-extrabold leading-none text-primary">
                ₹{formatInrAmount(hotel.price)}
                <span className="ml-1 text-[11px] font-medium text-[#c0c0c0]">/night</span>
              </p>
              <p className="mt-1 text-[10px] text-[#c8c8c8]">
                + ₹{formatInrAmount(hotel.taxes)} taxes &amp; fees
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
              {discount !== null && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#c0c0c0] line-through">
                    ₹{formatInrAmount(hotel.originalPrice)}
                  </span>
                  <span className="rounded-[4px] bg-[#e12d2d] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                    -{discount}%
                  </span>
                </div>
              )}
              {savings > 0 && (
                <div className="flex items-center gap-1 rounded-md bg-[#f0faf1] px-2 py-1 text-[10px] font-bold text-[#1a7a2e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1a7a2e]" aria-hidden />
                  Save ₹{formatInrAmount(savings)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Book button */}
        <div className="mt-auto px-3 pb-3 pt-2.5">
          <Link
            href={href}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] py-3 text-[13px] font-extrabold tracking-wide text-white shadow-[0_3px_10px_rgba(201,78,10,0.38)] transition active:scale-[0.98] active:brightness-95 hover:shadow-[0_5px_16px_rgba(201,78,10,0.48)] hover:brightness-105"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
