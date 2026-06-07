"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Heart,
  Ticket,
  Users,
  Wifi,
  Wind,
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
  if (/bath|shower/.test(n)) return Bath;
  if (/air|ac|conditioning/.test(n)) return Wind;
  if (/breakfast|coffee|kettle|tea/.test(n)) return Coffee;
  if (/bed|king|queen/.test(n)) return BedDouble;
  return Check;
}

function roomSizeLabel(stars: number): string {
  const sqm = 18 + stars * 6;
  const sqft = Math.round(sqm * 10.764);
  return `${sqm} m\u00B2/${sqft} ft\u00B2`;
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
  const amenityItems = hotel.amenities.slice(0, 6);
  const roomTitle = hotel.defaultRoomType !== "Room" ? hotel.defaultRoomType : "Standard Double Room";
  const showLastRoom = hotel.dealOfDay || hotel.roomOptionsCount <= 1;

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
      <div className="px-3 pb-2 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[#212121]">{roomTitle}</h3>
          <span className="shrink-0 text-[11px] text-[#757575]">{roomSizeLabel(hotel.stars)}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-[#616161]">{hotel.name}</p>
      </div>

      <div
        className="hotel-card-gallery swiper-no-swiping relative mx-3 overflow-hidden rounded-lg bg-neutral-200"
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
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={src}
                  alt={`${hotel.name} photo ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 88vw, 310px"
                  loading={index === 0 ? "lazy" : undefined}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {showLastRoom ? (
          <span className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-[#f79d65] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Our last room!
          </span>
        ) : null}

        {imageCount > 1 ? (
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
        ) : null}
      </div>

      <div className="mx-3 mt-2 grid grid-cols-3 divide-x divide-[#eee] rounded-md border border-[#eee] bg-[#fafafa] text-center text-[10px] text-[#424242]">
        <span className="px-1 py-2 leading-tight">{roomSizeLabel(hotel.stars)}</span>
        <span className="flex items-center justify-center gap-0.5 px-1 py-2">
          <Users className="h-3 w-3 text-[#757575]" aria-hidden />
          Max 2 adults
        </span>
        <span className="flex items-center justify-center gap-0.5 px-1 py-2 leading-tight">
          <BedDouble className="h-3 w-3 shrink-0 text-[#757575]" aria-hidden />
          {bedLabel(roomTitle)}
        </span>
      </div>

      {amenityItems.length > 0 ? (
        <div className="mx-3 mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
          {amenityItems.map((item) => {
            const Icon = amenityIcon(item);
            return (
              <span key={item} className="flex items-center gap-1 text-[10px] text-[#424242]">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#757575]" aria-hidden />
                <span className="line-clamp-1 capitalize">{item}</span>
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="mt-3 bg-[#e12d2d] px-3 py-1.5 text-[11px] font-bold text-white">Lowest price available!</div>

      <div className="flex flex-1 flex-col px-3 py-2.5">
        <p className="text-[12px] font-bold text-[#212121]">
          Lowest price {hotel.freeBreakfast ? "with breakfast included" : "per night"}
        </p>

        <div className="mt-2 flex gap-2">
          <div className="min-w-0 flex-1 space-y-1 text-[10px] text-[#424242]">
            <p className="flex items-center gap-1">
              <Users className="h-3 w-3 text-[#757575]" aria-hidden />2 adults
            </p>
            {hotel.freeBreakfast ? (
              <p className="flex items-center gap-1 font-semibold text-[#008009]">
                <Coffee className="h-3 w-3" aria-hidden />
                Breakfast included
              </p>
            ) : null}
            <p className="flex items-center gap-1">
              <Check className="h-3 w-3 text-[#008009]" strokeWidth={2.5} aria-hidden />
              {hotel.freeCancellation ? "Free cancellation" : "Non-refundable (Low price!)"}
            </p>
            <p className="flex items-center gap-1">
              <Check className="h-3 w-3 text-[#008009]" strokeWidth={2.5} aria-hidden />
              Book and pay now
            </p>
            {hotel.freeParking ? (
              <p className="flex items-center gap-1">
                <Check className="h-3 w-3 text-[#008009]" strokeWidth={2.5} aria-hidden />
                Parking
              </p>
            ) : null}
            <p className="flex items-center gap-1">
              <Check className="h-3 w-3 text-[#008009]" strokeWidth={2.5} aria-hidden />
              Free WiFi
            </p>
            {discount && discount >= 20 ? (
              <p className="mt-1 rounded bg-[#fff3e0] px-1.5 py-0.5 text-[9px] font-semibold text-[#e65100]">
                Special discount applied: Rs. {formatInrAmount(savings)} OFF!
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold text-[#e12d2d]">Cheapest price you&apos;ve seen!</p>
            <div className="mt-1 flex items-center justify-end gap-1">
              {discount ? (
                <>
                  <span className="text-[11px] text-[#9e9e9e] line-through">₹ {formatInrAmount(hotel.originalPrice)}</span>
                  <span className="rounded bg-[#e12d2d] px-1 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
                </>
              ) : null}
            </div>
            {showLastRoom ? (
              <span className="mt-1 inline-block rounded bg-[#f79d65] px-1.5 py-0.5 text-[9px] font-bold text-white">
                Our last room!
              </span>
            ) : null}
            {savings > 0 ? (
              <p className="mt-1 inline-flex items-center gap-0.5 rounded border border-[#008009] bg-[#f1f8f1] px-1.5 py-0.5 text-[9px] font-bold text-[#008009]">
                <Ticket className="h-3 w-3" aria-hidden />
                Rs. {formatInrAmount(savings)} applied
              </p>
            ) : null}
            <p className="mt-1 text-xl font-bold leading-none text-[#e12d2d]">₹ {formatInrAmount(hotel.price)}</p>
            <p className="mt-0.5 text-[9px] text-[#757575]">+ ₹{formatInrAmount(hotel.taxes)} taxes</p>
            <p className="text-[9px] text-[#9e9e9e]">You won&apos;t be charged yet</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-[#eee] bg-[#fafafa] p-3">
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e0e0e0] bg-white"
          aria-label={saved ? "Remove from saved" : "Save hotel"}
        >
          <Heart className={cn("h-4 w-4", saved ? "fill-[#e12d2d] text-[#e12d2d]" : "text-[#757575]")} aria-hidden />
        </button>
        <Link
          href={href}
          className="flex flex-1 items-center justify-center rounded-lg bg-[#0071c2] py-2.5 text-sm font-bold text-white transition hover:bg-[#005fa3]"
        >
          Book
        </Link>
      </div>
    </article>
  );
}