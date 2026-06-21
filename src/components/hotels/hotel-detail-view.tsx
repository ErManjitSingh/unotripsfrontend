"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  BedDouble,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ExternalLink,
  MapPin,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import type { RoomSelection } from "@/components/hotels/hotel-detail-rooms-table";
import { Navbar } from "@/components/layout/Navbar";
import { HotelTagBadgeList } from "@/components/hotels/hotel-tag-badge";
import { HotelDetailBookingPolicy } from "@/components/hotels/hotel-detail-booking-policy";
import { HotelDetailReviews } from "@/components/hotels/hotel-detail-reviews";
import { HotelDetailSimilarHotels } from "@/components/hotels/hotel-detail-similar-hotels";
import { HotelDetailTabs, type HotelDetailTabId } from "@/components/hotels/hotel-detail-tabs";
import { HotelPhotoLightbox } from "@/components/hotels/hotel-photo-lightbox";
import type { ApiReview } from "@/lib/hotels-api";
import {
  addDaysToIso,
  formatHotelDateFromIso,
  localDateInputString,
} from "@/components/hotels/hotels-search-fields";
import { HotelDateRangePicker, DatePickerPopover } from "@/components/hotels/hotel-date-range-picker";
import {
  hotelBookingHref,
  hotelHref,
  hotelListingKey,
  type HotelBookingQueryParams,
  type HotelCity,
  type HotelListing,
  type HotelPhotoCategory,
  type HotelRoomType,
} from "@/lib/hotels-catalog";
import { cn, formatInrAmount } from "@/lib/utils";

type HotelDetailViewProps = {
  city: HotelCity;
  hotel: HotelListing;
  roomTypes?: HotelRoomType[];
  policies?: string[];
  apiReviews?: ApiReview[];
  similarHotels?: HotelListing[];
  nearbyAttractions?: string[];
  photoCategories?: HotelPhotoCategory[];
};

function parseBookingContextFromParams(
  searchParams: URLSearchParams,
): HotelBookingQueryParams {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkIn = searchParams.get("check_in") || localDateInputString(tomorrow);
  const checkOut = searchParams.get("check_out") || addDaysToIso(checkIn, 1);
  const rooms = Number.parseInt(searchParams.get("rooms") ?? "1", 10);
  const guests = Number.parseInt(searchParams.get("guests") ?? "2", 10);

  return {
    check_in: checkIn,
    check_out: checkOut,
    rooms: Number.isFinite(rooms) && rooms > 0 ? rooms : 1,
    guests: Number.isFinite(guests) && guests > 0 ? guests : 2,
  };
}

function bookingContextQueryString(ctx: HotelBookingQueryParams): string {
  const q = new URLSearchParams();
  if (ctx.check_in) q.set("check_in", ctx.check_in);
  if (ctx.check_out) q.set("check_out", ctx.check_out);
  if (ctx.rooms != null) q.set("rooms", String(ctx.rooms));
  if (ctx.guests != null) q.set("guests", String(ctx.guests));
  return q.toString();
}

function nightCount(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(`${checkOut}T12:00:00`).getTime() - new Date(`${checkIn}T12:00:00`).getTime();
  const n = Math.round(ms / 86_400_000);
  return Math.max(1, n);
}

function getGstRate(pricePerNight: number): number {
  if (pricePerNight <= 999) return 0;
  if (pricePerNight <= 7499) return 0.12;
  return 0.18;
}

function DetailSearchStrip({
  hotelName,
  bookingContext,
  onApply,
}: {
  hotelName: string;
  bookingContext: HotelBookingQueryParams;
  onApply: (ctx: HotelBookingQueryParams) => void;
}) {
  // Draft dates only live while the picker is open — strip fields always show bookingContext
  const [draftCheckIn,  setDraftCheckIn]  = useState("");
  const [draftCheckOut, setDraftCheckOut] = useState("");
  const [rooms, setRooms]   = useState(bookingContext.rooms ?? 1);
  const [guests, setGuests] = useState(bookingContext.guests ?? 2);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef   = useRef<HTMLDivElement>(null);

  // Keep rooms/guests in sync when bookingContext changes externally
  useEffect(() => {
    setRooms(bookingContext.rooms ?? 1);
    setGuests(bookingContext.guests ?? 2);
  }, [bookingContext]);

  // Close guests dropdown on outside click
  useEffect(() => {
    if (!guestsOpen) return;
    const handler = (e: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setGuestsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [guestsOpen]);

  const openPicker = () => {
    setDraftCheckIn(bookingContext.check_in ?? "");
    setDraftCheckOut(bookingContext.check_out ?? "");
    setPickerOpen(true);
    setGuestsOpen(false);
  };

  const handleDateChange = (ci: string, co: string) => {
    setDraftCheckIn(ci);
    setDraftCheckOut(co);
    // Auto-apply + close as soon as both dates are chosen
    if (ci && co) {
      onApply({ check_in: ci, check_out: co, rooms, guests });
      setPickerOpen(false);
    }
  };

  // Strip fields always read from bookingContext — single source of truth
  const checkInFmt       = formatHotelDateFromIso(bookingContext.check_in ?? "");
  const checkOutFmt      = formatHotelDateFromIso(bookingContext.check_out ?? "");
  const roomsGuestsLabel = `${guests} Guest${guests !== 1 ? "s" : ""}, ${rooms} Room${rooms !== 1 ? "s" : ""}`;

  const fieldDivider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <section className="border-b border-slate-200 bg-white shadow-sm">

      {/* ── Mobile: compact 1-row summary, expands on tap ── */}
      <div className="sm:hidden px-3 py-2.5">
        <button
          type="button"
          onClick={() => { setMobileExpanded((v) => !v); setPickerOpen(false); setGuestsOpen(false); }}
          className="flex w-full items-center gap-3 rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 shadow-sm active:bg-[#fafafa]"
        >
          <Search className="h-4 w-4 shrink-0 text-[#EF6614]" strokeWidth={2.5} aria-hidden />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-bold text-[#1a1a1a]">
              {checkInFmt.main} <span className="text-[#EF6614]">→</span> {checkOutFmt.main}
            </p>
            <p className="text-[11px] text-[#757575]">{roomsGuestsLabel}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#9E9E9E] transition-transform duration-200", mobileExpanded && "rotate-180")} aria-hidden />
        </button>

        {mobileExpanded && (
          <div className="mt-2 overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-md">
            {/* Date buttons */}
            <div className="grid grid-cols-2 divide-x divide-[#f0f0f0] border-b border-[#f0f0f0]">
              <button type="button" onClick={openPicker} className="px-3 py-3 text-left hover:bg-[#fff8f5]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#9E9E9E]">Check-In</p>
                <p className="mt-0.5 text-[13px] font-bold text-[#1a1a1a]">{checkInFmt.main}</p>
                {checkInFmt.sub && <p className="text-[10px] text-[#757575]">{checkInFmt.sub}</p>}
              </button>
              <button type="button" onClick={openPicker} className="px-3 py-3 text-left hover:bg-[#fff8f5]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#9E9E9E]">Check-Out</p>
                <p className="mt-0.5 text-[13px] font-bold text-[#1a1a1a]">{checkOutFmt.main}</p>
                {checkOutFmt.sub && <p className="text-[10px] text-[#757575]">{checkOutFmt.sub}</p>}
              </button>
            </div>

            {/* Inline date picker */}
            {pickerOpen && (
              <div className="border-b border-[#f0f0f0] p-3">
                <HotelDateRangePicker
                  checkIn={draftCheckIn}
                  checkOut={draftCheckOut}
                  onChange={handleDateChange}
                  numberOfMonths={1}
                />
                <button type="button" onClick={() => setPickerOpen(false)} className="mt-2 w-full rounded-lg border border-[#e0e0e0] py-2 text-[12px] font-semibold text-[#616161]">Close</button>
              </div>
            )}

            {/* Guests / Rooms counters */}
            <div className="grid grid-cols-2 divide-x divide-[#f0f0f0] border-b border-[#f0f0f0]">
              {[
                { label: "Guests", value: guests, set: setGuests, min: 1, max: 10 },
                { label: "Rooms",  value: rooms,  set: setRooms,  min: 1, max: 10 },
              ].map(({ label, value, set, min, max }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[12px] font-semibold text-[#424242]">{label}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] disabled:opacity-30">−</button>
                    <span className="w-4 text-center text-[13px] font-bold text-[#212121]">{value}</span>
                    <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] disabled:opacity-30">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Search CTA */}
            <div className="p-3">
              <button
                type="button"
                onClick={() => {
                  onApply({ check_in: bookingContext.check_in ?? "", check_out: bookingContext.check_out ?? "", rooms, guests });
                  setMobileExpanded(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EF6614] py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(239,102,20,0.3)]"
              >
                <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden /> Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop: full form (hidden on mobile) ── */}
      <div className="hidden sm:block py-3">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-6px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] sm:flex sm:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">

            {/* Destination — always readonly */}
            <div className={cn("flex min-w-0 items-start gap-3 px-4 py-3.5 sm:flex-[1.5] sm:px-5 sm:py-4", fieldDivider)}>
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Destination</p>
                <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-[#212121]">{hotelName}</p>
              </div>
            </div>

            {/* Date fields — clicking opens picker */}
            <div className={cn("relative sm:flex-[2] flex", fieldDivider)}>
              {/* Check-In */}
              <button
                type="button"
                onClick={openPicker}
                className={cn("flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#fff8f5] sm:px-5 sm:py-4", fieldDivider)}
              >
                <BedDouble className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Check-In</p>
                  <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-[#212121]">{checkInFmt.main}</p>
                  {checkInFmt.sub && <p className="mt-0.5 truncate text-xs text-[#757575]">{checkInFmt.sub}</p>}
                </div>
              </button>

              {/* Check-Out */}
              <button
                type="button"
                onClick={openPicker}
                className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#fff8f5] sm:px-5 sm:py-4"
              >
                <BedDouble className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Check-Out</p>
                  <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-[#212121]">{checkOutFmt.main}</p>
                  {checkOutFmt.sub && <p className="mt-0.5 truncate text-xs text-[#757575]">{checkOutFmt.sub}</p>}
                </div>
              </button>

              {/* Floating date picker — auto-applies when range is complete */}
              {pickerOpen && (
                <DatePickerPopover
                  checkIn={draftCheckIn}
                  checkOut={draftCheckOut}
                  onChange={handleDateChange}
                  onApply={() => {}}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>

            {/* Rooms & Guests — inline stepper dropdown */}
            <div ref={guestsRef} className="relative sm:flex-1">
              <button
                type="button"
                onClick={() => { setGuestsOpen((v) => !v); setPickerOpen(false); }}
                className="flex w-full min-w-0 items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#fff8f5] sm:px-5 sm:py-4"
              >
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E]">Rooms &amp; Guests</p>
                  <p className="mt-0.5 truncate text-[15px] font-bold leading-tight text-[#212121]">{roomsGuestsLabel}</p>
                </div>
              </button>

              {guestsOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)]">
                  {[
                    { label: "Guests", value: guests, set: setGuests, min: 1, max: 10 },
                    { label: "Rooms",  value: rooms,  set: setRooms,  min: 1, max: 10 },
                  ].map(({ label, value, set, min, max }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-[13px] font-semibold text-[#212121]">{label}</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => set(Math.max(min, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30" disabled={value <= min}>−</button>
                        <span className="min-w-[1.5rem] text-center text-[14px] font-bold text-[#212121]">{value}</span>
                        <button type="button" onClick={() => set(Math.min(max, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30" disabled={value >= max}>+</button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onApply({ check_in: bookingContext.check_in ?? "", check_out: bookingContext.check_out ?? "", rooms, guests });
                      setGuestsOpen(false);
                    }}
                    className="mt-2 w-full rounded-xl bg-[#EF6614] py-2 text-[13px] font-bold text-white hover:bg-[#d95d10]"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search CTA */}
          <div className="flex items-center border-t border-slate-100 p-3 sm:border-l sm:border-t-0 sm:p-4">
            <button
              type="button"
              onClick={() => onApply({ check_in: bookingContext.check_in ?? "", check_out: bookingContext.check_out ?? "", rooms, guests })}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_-4px_rgba(234,88,12,0.5)] transition hover:bg-primary/90 sm:w-auto sm:px-6"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              Search
            </button>
          </div>
        </div>
      </div>
      </div>{/* end hidden sm:block desktop wrapper */}
    </section>
  );
}

function DetailGallery({
  hotel,
  photos,
  onOpenPhoto,
}: {
  hotel: HotelListing;
  photos: string[];
  onOpenPhoto: (index: number) => void;
}) {
  const main = photos[0] ?? hotel.images[0] ?? hotel.images[hotel.images.length - 1];
  const roomImg = photos[1] ?? hotel.images[1] ?? main;
  const videoThumb = photos[2] ?? hotel.images[2] ?? main;

  const indexOf = (src: string) => {
    const idx = photos.indexOf(src);
    return idx >= 0 ? idx : 0;
  };

  const photoCount = photos.length || hotel.propertyPhotoCount;
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselPhotos = photos.slice(0, Math.min(photos.length, 10));

  return (
    <div id="photos">

      {/* ── Mobile: swipeable carousel ── */}
      <div className="sm:hidden relative overflow-hidden rounded-xl" style={{ height: "min(72vw, 320px)" }}>
        <div
          ref={carouselRef}
          className="flex h-full overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {carouselPhotos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpenPhoto(i)}
              className="relative h-full w-full shrink-0 snap-center overflow-hidden"
            >
              <Image src={src} alt={i === 0 ? hotel.name : ""} fill unoptimized className="object-cover" sizes="100vw" priority={i === 0} />
              {i === 0 && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />}
              {i === 0 && (
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-[11px] font-semibold drop-shadow">Property Photos ({photoCount})</p>
                </div>
              )}
            </button>
          ))}
        </div>
        {/* Slide counter */}
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white">
          {activeSlide + 1}/{carouselPhotos.length}
        </div>
        {/* Dot indicators */}
        {carouselPhotos.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {carouselPhotos.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === activeSlide ? "w-5 bg-white" : "w-1.5 bg-white/50")} />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: original grid (hidden on mobile) ── */}
      <div
        className="hidden sm:grid h-[min(480px,62vw)] min-h-[320px] grid-cols-[1.65fr_1fr] gap-2.5"
      >
      <button
        type="button"
        onClick={() => onOpenPhoto(0)}
        className="group relative min-h-[200px] cursor-zoom-in overflow-hidden rounded-lg text-left sm:min-h-0 sm:rounded-l-xl"
      >
        <Image src={main} alt={hotel.name} fill unoptimized className="object-cover" sizes="60vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2.5 text-white sm:px-4 sm:py-3">
          <span className="text-sm font-semibold sm:text-base">
            Property Photos ({photoCount})
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold">
            View All
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
      </button>

      <div className="grid min-h-[160px] grid-rows-2 gap-2 sm:min-h-0 sm:gap-2.5">
        {/* Top-right photo */}
        <button
          type="button"
          onClick={() => onOpenPhoto(indexOf(videoThumb))}
          className="group relative cursor-zoom-in overflow-hidden rounded-lg text-left sm:rounded-tr-xl"
        >
          <Image src={videoThumb} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="30vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {hotel.videoCount > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#212121] shadow-md">
                <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
              </span>
              <span className="text-xs font-semibold drop-shadow">{hotel.videoCount} Video{hotel.videoCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </button>

        {/* Bottom-right photo — shows remaining count overlay */}
        <button
          type="button"
          onClick={() => onOpenPhoto(indexOf(roomImg))}
          className="group relative cursor-zoom-in overflow-hidden rounded-lg text-left sm:rounded-br-xl"
        >
          <Image src={roomImg} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="30vw" />
          {photoCount > 3 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white">
              <span className="text-2xl font-black">+{photoCount - 3}</span>
              <span className="mt-0.5 text-xs font-semibold tracking-wide">more photos</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          )}
        </button>
      </div>
      </div>{/* end desktop grid */}
    </div>
  );
}

function GallerySidebarLayout({ gallery, sidebar }: { gallery: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
      <div className="min-w-0 flex-1 overflow-hidden rounded-xl">{gallery}</div>
      <div
        className="hidden lg:block w-full shrink-0 lg:w-[300px] xl:w-[320px] lg:sticky lg:top-24 lg:self-start"
        style={{ borderRadius: "0.75rem", border: "1px solid #e0e0e0", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        {sidebar}
      </div>
    </div>
  );
}

function BookingSummary({
  hotel,
  bookingContext,
  onViewRooms,
  onApply,
}: {
  hotel: HotelListing;
  selection: RoomSelection | null;
  bookingContext: HotelBookingQueryParams;
  onViewRooms: () => void;
  onApply?: (ctx: HotelBookingQueryParams) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [checkIn, setCheckIn]   = useState(bookingContext.check_in ?? "");
  const [checkOut, setCheckOut] = useState(bookingContext.check_out ?? "");
  const [guests, setGuests]     = useState(bookingContext.guests ?? 2);
  const [rooms, setRooms]       = useState(bookingContext.rooms ?? 1);

  useEffect(() => {
    if (!editing) {
      setCheckIn(bookingContext.check_in ?? "");
      setCheckOut(bookingContext.check_out ?? "");
      setGuests(bookingContext.guests ?? 2);
      setRooms(bookingContext.rooms ?? 1);
    }
  }, [bookingContext, editing]);

  const checkInFmt  = formatHotelDateFromIso(editing ? checkIn : (bookingContext.check_in ?? ""));
  const checkOutFmt = formatHotelDateFromIso(editing ? checkOut : (bookingContext.check_out ?? ""));
  const guestsLabel = `${bookingContext.guests ?? 2} Guest${(bookingContext.guests ?? 2) !== 1 ? "s" : ""}`;
  const roomsLabel  = `${bookingContext.rooms ?? 1} Room${(bookingContext.rooms ?? 1) !== 1 ? "s" : ""}`;

  const handleApply = () => {
    onApply?.({ check_in: checkIn, check_out: checkOut, guests, rooms });
    setEditing(false);
  };

  const nights      = nightCount(bookingContext.check_in, bookingContext.check_out);
  const roomsCount  = bookingContext.rooms ?? 1;
  const gstRate     = getGstRate(hotel.price);
  const baseTotal   = hotel.price * nights * roomsCount;
  const taxesTotal  = Math.round(baseTotal * gstRate);
  const grandTotal  = baseTotal + taxesTotal;

  return (
    <div>
      <div className="flex flex-col">
        {/* Price header */}
        <div className="rounded-t-xl bg-gradient-to-br from-[#fff8f3] to-[#fdf5ef] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#b8b8b8]">Starting from</p>
          <p className="mt-0.5 text-[26px] font-extrabold leading-none text-[#EF6614]">
            ₹{formatInrAmount(hotel.price)}
            <span className="ml-1 text-[13px] font-medium text-[#9E9E9E]">/night</span>
          </p>
          <p className="mt-0.5 text-[10px] text-[#b8b8b8]">per room · {roomsCount} room{roomsCount !== 1 ? "s" : ""} · {bookingContext?.guests ?? 2} guest{(bookingContext?.guests ?? 2) !== 1 ? "s" : ""}</p>

          {/* Total stay cost */}
          <div className="mt-3 rounded-xl border border-[#f0d9c8] bg-white/60 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#9E9E9E]">
                ₹{formatInrAmount(hotel.price)} × {nights} night{nights !== 1 ? "s" : ""}{roomsCount > 1 ? ` × ${roomsCount} rooms` : ""}
              </p>
              <p className="text-[13px] font-bold text-[#212121]">₹{formatInrAmount(baseTotal)}</p>
            </div>
            {gstRate > 0 && (
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] text-[#9E9E9E]">Taxes &amp; fees ({Math.round(gstRate * 100)}% GST)</p>
                <p className="text-[12px] font-medium text-[#616161]">₹{formatInrAmount(taxesTotal)}</p>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[#f0d9c8] pt-2">
              <p className="text-[12px] font-bold text-[#212121]">Total for {nights} night{nights !== 1 ? "s" : ""}</p>
              <p className="text-[16px] font-extrabold text-[#EF6614]">₹{formatInrAmount(grandTotal)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 py-3">
          {/* Free cancellation badge */}
          {hotel.freeCancellation && (
            <div className="flex items-center gap-1.5 rounded-md bg-[#f0fdf4] px-3 py-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-[#166534]" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold text-[#166534]">Free cancellation available</span>
            </div>
          )}

          {editing ? (
            /* ── Edit mode — beautiful calendar ── */
            <div className="rounded-xl border border-[#EF6614]/25 bg-[#fff8f5] px-3 py-3">
              <HotelDateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(ci, co) => {
                  setCheckIn(ci);
                  setCheckOut(co);
                  // Auto-apply dates immediately when range is complete — keeps strip in sync
                  if (ci && co) onApply?.({ check_in: ci, check_out: co, guests, rooms });
                }}
                numberOfMonths={1}
                className="text-sm"
              />

              {/* Guests & Rooms steppers */}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#f0e8e0] pt-3">
                {[
                  { label: "Guests", value: guests, set: setGuests, min: 1, max: 10 },
                  { label: "Rooms",  value: rooms,  set: setRooms,  min: 1, max: 10 },
                ].map(({ label, value, set, min, max }) => (
                  <div key={label} className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-[#9E9E9E]">{label}</p>
                    <div className="mt-1.5 flex items-center justify-center gap-2">
                      <button type="button" onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30">−</button>
                      <span className="min-w-[1.25rem] text-center text-[14px] font-bold text-[#212121]">{value}</span>
                      <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={handleApply} disabled={!checkIn || !checkOut} className="flex-1 rounded-xl bg-[#EF6614] py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#d95d10] disabled:opacity-40">Apply</button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-[#e0e0e0] px-4 py-2.5 text-[12px] font-semibold text-[#616161] transition hover:border-[#212121]">Cancel</button>
              </div>
            </div>
          ) : (
            /* ── Display mode — click to edit ── */
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full text-left"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 transition hover:border-[#EF6614]/40 hover:bg-[#fff8f5]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#9E9E9E]">Check-In</p>
                  <p className="mt-0.5 text-[13px] font-bold text-[#212121]">{checkInFmt.main}</p>
                  {checkInFmt.sub && <p className="text-[10px] text-[#9E9E9E]">{checkInFmt.sub}</p>}
                </div>
                <div className="rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 transition hover:border-[#EF6614]/40 hover:bg-[#fff8f5]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#9E9E9E]">Check-Out</p>
                  <p className="mt-0.5 text-[13px] font-bold text-[#212121]">{checkOutFmt.main}</p>
                  {checkOutFmt.sub && <p className="text-[10px] text-[#9E9E9E]">{checkOutFmt.sub}</p>}
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 transition hover:border-[#EF6614]/40 hover:bg-[#fff8f5]">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#9E9E9E]">Guests &amp; Rooms</p>
                <p className="mt-0.5 text-[13px] font-bold text-[#212121]">{guestsLabel}, {roomsLabel}</p>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-[#9E9E9E]">Tap to edit dates &amp; guests</p>
            </button>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={onViewRooms}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] py-3 text-[13px] font-extrabold text-white shadow-[0_3px_10px_rgba(201,78,10,0.38)] transition hover:brightness-105 active:scale-[0.98]"
          >
            View Room Options
            <ChevronsDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
          {/* Check-in / Check-out times */}
          <div className="flex items-center justify-between text-[11px] text-[#9E9E9E]">
            <span>Check-in: <span className="font-semibold text-[#424242]">2:00 PM</span></span>
            <span className="text-[#d5d5d5]">|</span>
            <span>Check-out: <span className="font-semibold text-[#424242]">12:00 PM</span></span>
          </div>
        </div>

      </div>
    </div>
  );
}

function MobileBookingBar({
  hotel,
  onViewRooms,
  visible,
  bookingHref,
  selectedRoomName,
}: {
  hotel: HotelListing;
  onViewRooms: () => void;
  visible: boolean;
  bookingHref?: string;
  selectedRoomName?: string;
}) {
  const hasSelection = !!bookingHref && bookingHref !== "#";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e8e8] bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {hasSelection ? (
            <>
              <p className="text-[10px] font-medium text-[#9E9E9E]">Selected room</p>
              <p className="truncate text-[13px] font-bold text-[#212121]">{selectedRoomName}</p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-medium text-[#9E9E9E]">Starting from</p>
              <p className="text-[18px] font-extrabold leading-tight text-[#212121]">
                ₹{formatInrAmount(hotel.price)}
                <span className="ml-1 text-[11px] font-normal text-[#9E9E9E]">/night</span>
              </p>
              {hotel.freeCancellation && (
                <p className="text-[10px] font-semibold text-[#166534]">✓ Free cancellation</p>
              )}
            </>
          )}
        </div>

        {hasSelection ? (
          <Link
            href={bookingHref!}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] px-5 py-3 text-[13px] font-extrabold text-white shadow-[0_3px_10px_rgba(201,78,10,0.38)] active:scale-[0.98]"
          >
            Proceed →
          </Link>
        ) : (
          <button
            type="button"
            onClick={onViewRooms}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] px-5 py-3 text-[13px] font-extrabold text-white shadow-[0_3px_10px_rgba(201,78,10,0.38)] active:scale-[0.98]"
          >
            View Rooms
            <BedDouble className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export function HotelDetailView({
  city,
  hotel,
  roomTypes,
  policies,
  apiReviews,
  similarHotels = [],
  nearbyAttractions = [],
  photoCategories = [],
}: HotelDetailViewProps) {
  const searchParams = useSearchParams();
  const listingHref = hotelHref(city.slug);
  const [activeTab, setActiveTab] = useState<HotelDetailTabId>("rooms");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [roomSelection, setRoomSelection] = useState<RoomSelection | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const gallerySentinelRef = useRef<HTMLDivElement>(null);

  const paramsContext = useMemo(
    () => parseBookingContextFromParams(searchParams),
    [searchParams],
  );
  const [bookingContext, setBookingContext] = useState<HotelBookingQueryParams>(paramsContext);

  useEffect(() => {
    setBookingContext(paramsContext);
  }, [paramsContext]);

  useEffect(() => {
    const sentinel = gallerySentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleApplySearch = useCallback((ctx: HotelBookingQueryParams) => {
    setBookingContext(ctx);
    const qs = bookingContextQueryString(ctx);
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, []);

  const allPhotos = useMemo(() => {
    const list = [...hotel.images.filter(Boolean)];
    roomTypes?.forEach((room) => {
      if (room.image && !list.includes(room.image)) list.push(room.image);
    });
    return list;
  }, [hotel.images, roomTypes]);

  const openPhoto = useCallback((index: number) => {
    if (allPhotos.length === 0) return;
    setLightbox({ open: true, index: index % allPhotos.length });
  }, [allPhotos.length]);

  const openPhotoBySrc = useCallback(
    (src: string) => {
      const idx = allPhotos.indexOf(src);
      openPhoto(idx >= 0 ? idx : 0);
    },
    [allPhotos, openPhoto],
  );

  const scrollToRooms = useCallback(() => {
    setActiveTab("rooms");
    requestAnimationFrame(() => {
      const el = document.getElementById("hotel-tabs");
      if (!el) return;
      // Manual offset: mobile sticky header ~116px, desktop ~72px
      const offset = window.innerWidth >= 1024 ? 80 : 130;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
    });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleTabChange = useCallback(
    (tab: HotelDetailTabId) => {
      setActiveTab(tab);
      if (tab === "policy") scrollToSection("booking-policy");
    },
    [scrollToSection],
  );

  const scrollToReviews = useCallback(() => {
    scrollToSection("guest-reviews");
  }, [scrollToSection]);

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <DetailSearchStrip
          hotelName={hotel.name}
          bookingContext={bookingContext}
          onApply={handleApplySearch}
        />

        {/* ── Full-width sticky hotel header ── */}
        <div className="sticky top-[116px] z-30 w-full border-b border-[#e0e0e0] bg-white shadow-sm sm:top-[132px] lg:top-[72px]">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <div className="flex flex-col gap-1.5 py-2.5 lg:flex-row lg:items-center lg:justify-between lg:py-3">
              <div className="min-w-0 flex-1">
                {/* Row 1: badge + name + stars */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#fff3eb] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#EF6614]">UNO Stays</span>
                  <h1 className="text-[18px] font-bold text-[#212121] sm:text-[20px]">{hotel.name}</h1>
                  <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} stars`}>
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                    ))}
                  </span>
                </div>
                {/* Row 2: location + rating + reviews + tags */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="flex items-center gap-0.5 text-[12px] text-[#757575]">
                    <MapPin className="h-3 w-3 shrink-0 text-[#EF6614]" aria-hidden />
                    {hotel.area}, {city.name}
                    {hotel.nearbyLandmark && <><span className="mx-1 text-[#d5d5d5]">·</span>{hotel.nearbyLandmark}</>}
                  </span>
                  <span className="text-[#d5d5d5]">|</span>
                  {hotel.rating > 0 && (
                    <span className="rounded bg-[#008009] px-1.5 py-0.5 text-[11px] font-bold text-white">{hotel.rating.toFixed(1)}</span>
                  )}
                  <button type="button" onClick={scrollToReviews} className="text-[11px] font-semibold text-[#EF6614] hover:underline">
                    {hotel.reviewCount > 0 ? `${hotel.reviewCount} reviews` : "Reviews"}
                  </button>
                  {hotel.amenities.length > 0 && <span className="text-[11px] text-[#9E9E9E]">· {hotel.amenities.length} amenities</span>}
                  <HotelTagBadgeList tags={hotel.tags.slice(0, 2)} />
                  {/* highlights inline on larger screens */}
                  {hotel.freeCancellation && (
                    <span className="hidden items-center gap-0.5 rounded border border-[#d1fae5] bg-[#f0fdf4] px-1.5 py-0.5 text-[10px] font-semibold text-[#166534] sm:inline-flex">
                      <Check className="h-2.5 w-2.5" aria-hidden />Free cancellation
                    </span>
                  )}
                  {hotel.freeBreakfast && (
                    <span className="hidden items-center gap-0.5 rounded border border-[#fef9c3] bg-[#fefce8] px-1.5 py-0.5 text-[10px] font-semibold text-[#854d0e] sm:inline-flex">
                      <Utensils className="h-2.5 w-2.5" aria-hidden />Breakfast
                    </span>
                  )}
                  {hotel.freeParking && (
                    <span className="hidden items-center gap-0.5 rounded border border-[#e0e7ff] bg-[#eef2ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#3730a3] sm:inline-flex">
                      <Car className="h-2.5 w-2.5" aria-hidden />Free parking
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {(() => {
                  const mapsUrl = hotel.latitude && hotel.longitude
                    ? `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${city.name}`)}`;
                  return (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#424242] shadow-sm transition hover:border-[#EF6614]/40 hover:text-[#EF6614]"
                    >
                      <MapPin className="h-3.5 w-3.5 text-[#EF6614]" aria-hidden />
                      View on Map
                      <ExternalLink className="h-3 w-3 opacity-50" aria-hidden />
                    </a>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      void navigator.share({ title: hotel.name, url: window.location.href });
                    } else {
                      void navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#424242] shadow-sm transition hover:border-[#EF6614]/40 hover:text-[#EF6614]"
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1320px] px-3 py-4 pb-24 sm:px-4 sm:py-5 lg:px-6 lg:pb-0">
          <nav
            className="mb-3 flex flex-wrap items-center gap-1 text-[12px] text-[#EF6614]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <Link href="/hotels" className="hover:underline">Hotels</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <Link href={listingHref} className="hover:underline">Hotels in {city.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <span className="font-medium text-[#212121]">{hotel.name}</span>
          </nav>

          <GallerySidebarLayout
            gallery={<DetailGallery hotel={hotel} photos={allPhotos} onOpenPhoto={openPhoto} />}
            sidebar={
              <BookingSummary
                hotel={hotel}
                selection={roomSelection}
                bookingContext={bookingContext}
                onViewRooms={scrollToRooms}
                onApply={handleApplySearch}
              />
            }
          />
          <div ref={gallerySentinelRef} className="h-px" aria-hidden />

          <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
            {/* Urgency strip */}
            <div className="flex items-center gap-2 rounded-lg border border-[#fef3c7] bg-[#fffbeb] px-4 py-2.5">
              <span className="text-base">🔥</span>
              <p className="text-[12px] font-semibold text-[#92400e]">
                High demand — this hotel has been booked {Math.max(3, Math.round(hotel.reviewCount / 10))} times in the last 24 hours
              </p>
            </div>
            <HotelDetailTabs
              hotel={hotel}
              city={city}
              roomTypes={roomTypes}
              bookingContext={bookingContext}
              policies={policies}
              nearbyAttractions={nearbyAttractions}
              photoCategories={photoCategories}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onRoomPhotoClick={openPhotoBySrc}
              onRoomSelect={setRoomSelection}
            />
            <HotelDetailReviews hotel={hotel} cityName={city.name} apiReviews={apiReviews} />
            <HotelDetailBookingPolicy hotel={hotel} policies={policies} />
            <HotelDetailSimilarHotels hotels={similarHotels} city={city} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn("fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#EF6614] text-white shadow-lg transition hover:bg-[#c94e0a] sm:right-6 sm:bottom-6", stickyVisible ? "bottom-[76px] lg:bottom-6" : "bottom-6")}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
        <MobileBookingBar
          hotel={hotel}
          onViewRooms={scrollToRooms}
          visible={stickyVisible}
          bookingHref={roomSelection?.bookingHref}
          selectedRoomName={roomSelection ? `${roomSelection.roomName} · ${roomSelection.planCode}` : undefined}
        />
      </main>

      <HotelPhotoLightbox
        images={allPhotos}
        initialIndex={lightbox.index}
        open={lightbox.open}
        onClose={() => setLightbox((s) => ({ ...s, open: false }))}
        title={hotel.name}
      />

      <Footer />
    </>
  );
}