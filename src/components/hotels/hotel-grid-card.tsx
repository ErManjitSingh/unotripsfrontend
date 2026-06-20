"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Accessibility,
  BedDouble,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ConciergeBell,
  Dumbbell,
  Heart,
  ImageOff,
  Tag,
  Users,
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
  if (/bed|king|queen/.test(n)) return BedDouble;
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

function bedLabel(roomType: string): string {
  const t = roomType.toLowerCase();
  if (t.includes("king")) return "1 king bed";
  if (t.includes("twin")) return "2 twin beds";
  if (t.includes("double")) return "1 double bed";
  return "1 comfortable bed";
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

  const roomTitle =
    hotel.defaultRoomType !== "Room" ? hotel.defaultRoomType : "Standard Double Room";
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
        {/* Title row */}
        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-[#212121]">
              {roomTitle}
            </h3>
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] text-[#757575]">{hotel.name}</p>
        </div>

        {/* Amenity pills — single non-wrapping row */}
        {shownAmenities.length > 0 && (
          <div className="mx-4 mt-3 flex min-w-0 items-center gap-x-3 overflow-hidden border-t border-[#f0f0f0] pt-3">
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

        {/* "Lowest price available!" banner */}
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[#fff4f0] px-3 py-2">
          <Tag className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span className="text-[12px] font-bold text-primary">Lowest price available!</span>
        </div>

        {/* Pricing details */}
        <div className="mx-4 mt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#212121]">
              Lowest price per night
            </span>
            {discount !== null && (
              <span className="text-[10px] font-semibold text-[#e12d2d]">
                Best price today!
              </span>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-[12px] text-[#555]">
            <Users className="h-3.5 w-3.5 text-[#888]" aria-hidden />
            2 adults
            <span className="text-[#ccc]">•</span>
            <BedDouble className="h-3.5 w-3.5 text-[#888]" aria-hidden />
            {bedLabel(roomTitle)}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#555]">
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-[#008009]" strokeWidth={2.5} aria-hidden />
              {hotel.freeCancellation ? "Free cancellation" : "Non-refundable (Low price)"}
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-[#008009]" strokeWidth={2.5} aria-hidden />
              Book and pay now
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {discount !== null && (
                <>
                  <span className="text-[12px] text-[#9e9e9e] line-through">
                    ₹{formatInrAmount(hotel.originalPrice)}
                  </span>
                  <span className="rounded bg-[#e12d2d] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            {savings > 0 && (
              <span className="rounded bg-[#e8f5e9] px-2 py-0.5 text-[11px] font-bold text-[#008009]">
                You save ₹{formatInrAmount(savings)}
              </span>
            )}
          </div>

          <p className="text-[24px] font-bold leading-none text-primary">
            ₹{formatInrAmount(hotel.price)}
          </p>
          <p className="text-[12px] text-[#9e9e9e]">+ ₹{formatInrAmount(hotel.taxes)} taxes</p>
        </div>

        {/* Book button row */}
        <div className="mt-auto border-t border-[#eee] p-4">
          <Link
            href={href}
            className="flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
