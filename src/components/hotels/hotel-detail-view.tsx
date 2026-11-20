"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  Coffee,
  ExternalLink,
  Headphones,
  Home,
  MapPin,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import type { RoomSelection } from "@/components/hotels/hotel-detail-rooms-table";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { TravelMobileTopShell } from "@/components/home/HeroSection";
import { HotelDetailTabs, type HotelDetailTabId } from "@/components/hotels/hotel-detail-tabs";
import { HotelDetailReviews } from "@/components/hotels/hotel-detail-reviews";
import { clockLabel, HotelDetailBookingPolicy } from "@/components/hotels/hotel-detail-booking-policy";
import { siteTelHref, siteWhatsAppChatUrl } from "@/lib/site-contact";
import { HotelDetailDeferredSimilarHotels } from "@/components/hotels/hotel-detail-deferred-similar-hotels";
import type { ApiHotelPolicies, ApiReview } from "@/lib/hotels-api";
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
  hotelMapsLink,
  hotelPostalAddress,
  mealPlanLabel,
  type HotelBookingQueryParams,
  type HotelCity,
  type HotelListing,
  type HotelPhotoCategory,
  type HotelRoomType,
} from "@/lib/hotels-catalog";
import { cn, formatGstEquation, formatInrAmount } from "@/lib/utils";

const HotelPhotoGalleryModal = dynamic(() =>
  import("@/components/hotels/hotel-photo-gallery-modal").then((mod) => mod.HotelPhotoGalleryModal),
);

type HotelDetailViewProps = {
  city: HotelCity;
  hotel: HotelListing;
  roomTypes?: HotelRoomType[];
  policies?: string[];
  hotelPolicies?: ApiHotelPolicies | null;
  apiReviews?: ApiReview[];
  nearbyAttractions?: string[];
  photoCategories?: HotelPhotoCategory[];
};

function titleCaseAmenityLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^wifi$|^wi-fi$/i.test(trimmed)) return "Wi-Fi";
  if (/^tv$|^television$/i.test(trimmed)) return "TV";
  if (/^cctv$/i.test(trimmed)) return "CCTV";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Property amenity chips from the hotel record only — never invent winter extras. */
function hotelAmenityChips(hotel: HotelListing): string[] {
  const chips: string[] = [];
  if (hotel.freeCancellation) chips.push("Free cancellation");
  if (hotel.freeBreakfast) chips.push("Breakfast included");
  for (const raw of hotel.amenities) {
    const label = titleCaseAmenityLabel(raw);
    if (!label) continue;
    if (chips.some((c) => c.toLowerCase() === label.toLowerCase())) continue;
    // Prefer "Parking" from amenities over a separate Free parking flag when both exist
    if (/^parking$/i.test(label) && chips.some((c) => /parking/i.test(c))) continue;
    chips.push(label);
  }
  return chips;
}

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
  const children = Number.parseInt(searchParams.get("children") ?? "0", 10);

  const guestsCount = Number.isFinite(guests) && guests > 0 ? guests : 2;
  const requestedRooms = Number.isFinite(rooms) && rooms > 0 ? rooms : 1;

  return {
    check_in: checkIn,
    check_out: checkOut,
    rooms: Math.max(requestedRooms, Math.ceil(guestsCount / 2)),
    guests: guestsCount,
    children: Number.isFinite(children) && children > 0 ? Math.min(children, 4) : 0,
  };
}

function bookingContextQueryString(ctx: HotelBookingQueryParams): string {
  const q = new URLSearchParams();
  if (ctx.check_in) q.set("check_in", ctx.check_in);
  if (ctx.check_out) q.set("check_out", ctx.check_out);
  if (ctx.rooms != null) q.set("rooms", String(ctx.rooms));
  if (ctx.guests != null) q.set("guests", String(ctx.guests));
  if (ctx.children != null) q.set("children", String(ctx.children));
  return q.toString();
}

function nightCount(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(`${checkOut}T12:00:00`).getTime() - new Date(`${checkIn}T12:00:00`).getTime();
  const n = Math.round(ms / 86_400_000);
  return Math.max(1, n);
}

/**
 * Hotel photos hosted in Supabase can be resized at the CDN. Keep third-party
 * image URLs untouched so a missing transformation service never breaks a
 * landing page.
 */
function hotelImageAtWidth(source: string, width: number): string {
  try {
    const url = new URL(source);
    if (
      !url.hostname.endsWith(".supabase.co") ||
      !url.pathname.includes("/storage/v1/object/public/")
    ) {
      return source;
    }

    url.pathname = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", "78");
    return url.toString();
  } catch {
    return source;
  }
}

function DetailSearchStrip({
  hotelName,
  bookingContext,
  onApply,
  footer,
}: {
  hotelName: string;
  bookingContext: HotelBookingQueryParams;
  onApply: (ctx: HotelBookingQueryParams) => void;
  footer?: ReactNode;
}) {
  // Until a specific room is selected, search uses the standard two-adult
  // occupancy. The checkout replaces this with the selected room's own limit.
  const guestsPerRoom = 2;
  // Draft dates only live while the picker is open — strip fields always show bookingContext
  const [draftCheckIn,  setDraftCheckIn]  = useState("");
  const [draftCheckOut, setDraftCheckOut] = useState("");
  const [rooms, setRooms]   = useState(bookingContext.rooms ?? 1);
  const [guests, setGuests] = useState(bookingContext.guests ?? 2);
  const [children, setChildren] = useState(bookingContext.children ?? 0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef   = useRef<HTMLDivElement>(null);

  // Keep rooms/guests in sync when bookingContext changes externally
  useEffect(() => {
    const guestsCount = bookingContext.guests ?? 2;
    setGuests(guestsCount);
    setRooms(Math.max(bookingContext.rooms ?? 1, Math.ceil(guestsCount / 2)));
    setChildren(bookingContext.children ?? 0);
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

  const updateGuests = (nextGuests: number) => {
    const guestsCount = Math.max(1, Math.min(10, nextGuests));
    setGuests(guestsCount);
    setRooms((currentRooms) =>
      Math.max(currentRooms, Math.ceil(guestsCount / guestsPerRoom)),
    );
  };

  const updateRooms = (nextRooms: number) => {
    const roomsCount = Math.max(1, Math.min(10, nextRooms));
    setRooms(roomsCount);
    // A guest cannot remain assigned to more capacity than the rooms selected.
    setGuests((currentGuests) => Math.min(currentGuests, roomsCount * guestsPerRoom));
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
  const roomsGuestsLabel = `${rooms} Room${rooms !== 1 ? "s" : ""}, ${guests} Adult${guests !== 1 ? "s" : ""}${children > 0 ? `, ${children} Child${children !== 1 ? "ren" : ""}` : ""}`;

  const fieldDivider = "border-[#ECEEF2] border-b sm:border-b-0 sm:border-r";
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <section className="border-b border-[#e8ebf0] bg-[#f5f5f5]">

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
                { label: "Adults", value: guests, set: updateGuests, min: 1, max: 10 },
                { label: "Rooms",  value: rooms,  set: updateRooms,  min: 1, max: 10 },
                { label: "Children", value: children, set: setChildren, min: 0, max: 4 },
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
                  onApply({ check_in: bookingContext.check_in ?? "", check_out: bookingContext.check_out ?? "", rooms, guests, children });
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
      <div className="hidden sm:block pb-2.5 pt-0">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="overflow-visible rounded-b-2xl rounded-t-none border border-[#e4e8ee] bg-white shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] sm:flex sm:flex-wrap sm:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">

            {/* Destination — always readonly */}
            <div className={cn("flex min-w-0 items-center gap-3 px-4 py-3 sm:flex-[1.55] sm:px-5", fieldDivider)}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#EF6614]">
                <MapPin className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">Your stay</p>
                <p className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#20242c]">{hotelName}</p>
              </div>
            </div>

            {/* Date fields — clicking opens picker */}
            <div className={cn("relative sm:flex-[2.15] flex", fieldDivider)}>
              {/* Check-In */}
              <button
                type="button"
                onClick={openPicker}
                className={cn("flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/45 sm:px-5", fieldDivider)}
              >
                <BedDouble className="h-4.5 w-4.5 shrink-0 text-[#737b88]" strokeWidth={1.75} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">Check-in</p>
                  <p className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#20242c]">{checkInFmt.main}</p>
                  {checkInFmt.sub && <p className="mt-0.5 truncate text-[11px] text-[#7b8491]">{checkInFmt.sub}</p>}
                </div>
              </button>

              {/* Check-Out */}
              <button
                type="button"
                onClick={openPicker}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/45 sm:px-5"
              >
                <BedDouble className="h-4.5 w-4.5 shrink-0 text-[#737b88]" strokeWidth={1.75} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">Check-out</p>
                  <p className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#20242c]">{checkOutFmt.main}</p>
                  {checkOutFmt.sub && <p className="mt-0.5 truncate text-[11px] text-[#7b8491]">{checkOutFmt.sub}</p>}
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
                className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/45 sm:px-5"
              >
                <Users className="h-4.5 w-4.5 shrink-0 text-[#737b88]" strokeWidth={1.75} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">Guests &amp; rooms</p>
                  <p className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#20242c]">{roomsGuestsLabel}</p>
                </div>
              </button>

              {guestsOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)]">
                  {[
                    { label: "Adults", value: guests, set: updateGuests, min: 1, max: 10 },
                    { label: "Rooms",  value: rooms,  set: updateRooms,  min: 1, max: 10 },
                    { label: "Children (0–17)", value: children, set: setChildren, min: 0, max: 4 },
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
                      onApply({ check_in: bookingContext.check_in ?? "", check_out: bookingContext.check_out ?? "", rooms, guests, children });
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
          <div className="flex items-center border-t border-slate-100 p-3 sm:border-l sm:border-t-0 sm:p-3">
            <button
              type="button"
            onClick={() => onApply({ check_in: bookingContext.check_in ?? "", check_out: bookingContext.check_out ?? "", rooms, guests, children })}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ef5a0a] px-5 text-[13px] font-bold text-white shadow-[0_8px_16px_-8px_rgba(239,90,10,0.72)] transition hover:bg-[#d94d04] sm:w-auto sm:px-5"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              Search
            </button>
          </div>
          {footer ? (
            <div className="basis-full rounded-b-2xl border-t border-[#edf0f3] bg-[#fbfcfd] px-4 py-2 sm:px-5">
              {footer}
            </div>
          ) : null}
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
  onOpenPhoto: () => void;
}) {
  const main = photos[0] ?? hotel.images[0] ?? hotel.images[hotel.images.length - 1];
  const roomImg = photos[1] ?? hotel.images[1] ?? main;
  const photoCount = photos.length || hotel.propertyPhotoCount;
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselPhotos = photos;

  return (
    <div id="photos">

      {/* ── Mobile: swipeable carousel ── */}
      <div className="sm:hidden relative overflow-hidden rounded-xl" style={{ height: "min(62vw, 280px)" }}>
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
              onClick={() => onOpenPhoto()}
              className="relative h-full w-full shrink-0 snap-center overflow-hidden"
            >
              <Image src={hotelImageAtWidth(src, 1080)} alt={i === 0 ? hotel.name : ""} fill unoptimized className="object-cover" sizes="100vw" priority={i === 0} />
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
        {carouselPhotos.length > 1 && carouselPhotos.length <= 8 && (
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {carouselPhotos.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === activeSlide ? "w-5 bg-white" : "w-1.5 bg-white/50")} />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop: 5-photo mosaic (hidden on mobile) ── */}
      <div
        className="hidden sm:grid min-h-[320px] grid-rows-2 gap-2 overflow-hidden rounded-xl"
        style={{ height: "min(480px,55vw)", gridTemplateColumns: "1.5fr 1fr 1fr" }}
      >
        {/* Main photo — spans 2 rows */}
        <button
          type="button"
          onClick={() => onOpenPhoto()}
          className="group relative row-span-2 cursor-zoom-in overflow-hidden rounded-l-xl text-left"
        >
          <Image src={hotelImageAtWidth(main, 1440)} alt={hotel.name} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="50vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <span className="text-[13px] font-semibold drop-shadow">
              {photoCount} photos
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-[12px] font-semibold backdrop-blur-sm">
              View all <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </span>
          </div>
        </button>

        {/* Top-center */}
        <button type="button" onClick={() => onOpenPhoto()} className="group relative cursor-zoom-in overflow-hidden text-left">
          <Image src={hotelImageAtWidth(photos[1] ?? hotel.images[1] ?? main, 640)} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="20vw" />
        </button>

        {/* Top-right */}
        <button type="button" onClick={() => onOpenPhoto()} className="group relative cursor-zoom-in overflow-hidden rounded-tr-xl text-left">
          <Image src={hotelImageAtWidth(photos[2] ?? hotel.images[2] ?? main, 640)} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="20vw" />
          {hotel.videoCount > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#212121] shadow-md">
                <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
              </span>
              <span className="text-[11px] font-semibold drop-shadow">{hotel.videoCount} video{hotel.videoCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </button>

        {/* Bottom-center */}
        <button type="button" onClick={() => onOpenPhoto()} className="group relative cursor-zoom-in overflow-hidden text-left">
          <Image src={hotelImageAtWidth(photos[3] ?? hotel.images[3] ?? roomImg, 640)} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="20vw" />
        </button>

        {/* Bottom-right — +N overlay */}
        <button type="button" onClick={() => onOpenPhoto()} className="group relative cursor-zoom-in overflow-hidden rounded-br-xl text-left">
          <Image src={hotelImageAtWidth(photos[4] ?? hotel.images[4] ?? roomImg, 640)} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="20vw" />
          {photoCount > 5 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white transition group-hover:bg-black/60">
              <span className="text-[22px] font-black">+{photoCount - 5}</span>
              <span className="mt-0.5 text-[11px] font-semibold tracking-wide">more photos</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

function hotelDisplayShortName(name: string, cityName?: string): string {
  let short = name.trim().replace(/^hotel\s+/i, "");
  if (cityName) {
    const city = cityName.trim();
    if (city && short.toLowerCase().endsWith(city.toLowerCase())) {
      short = short.slice(0, -city.length).trim();
    }
  }
  return short || name;
}

function whyStayFeatures(hotel: HotelListing): { icon: LucideIcon; label: string }[] {
  const amenities = hotel.amenities.map((a) => a.toLowerCase());
  const has = (re: RegExp) => amenities.some((a) => re.test(a));
  const features: { icon: LucideIcon; label: string }[] = [
    { icon: MapPin, label: "Prime Location" },
  ];
  if (has(/wifi|wi-fi|internet/)) features.push({ icon: Wifi, label: "Free Wi-Fi" });
  if (hotel.freeBreakfast) features.push({ icon: Coffee, label: "Breakfast Included" });
  else if (has(/restaurant|dining/)) features.push({ icon: Utensils, label: "Restaurant" });
  if (hotel.freeParking || has(/park/)) features.push({ icon: Car, label: "Parking" });
  if (has(/room.?service/)) features.push({ icon: Sparkles, label: "Room Service" });
  if (features.length < 4) features.push({ icon: Home, label: "Clean & Comfortable" });
  return features.slice(0, 4);
}

function WhyStayMountains({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 220"
      fill="none"
      className={className}
      aria-hidden
      preserveAspectRatio="xMaxYMax meet"
    >
      <defs>
        <linearGradient id="whyStayPeakA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d5c4" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#d4bba6" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="whyStayPeakB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0e2d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#cbb39c" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path
        d="M40 220 L120 95 L155 130 L210 55 L270 118 L310 78 L380 160 L420 130 L420 220 Z"
        fill="url(#whyStayPeakA)"
      />
      <path
        d="M0 220 L70 140 L115 175 L175 100 L230 155 L290 110 L350 170 L420 145 L420 220 Z"
        fill="url(#whyStayPeakB)"
      />
      <circle cx="340" cy="48" r="18" fill="#f6e7d8" fillOpacity="0.55" />
      <circle cx="340" cy="48" r="10" fill="#fff7ef" fillOpacity="0.7" />
    </svg>
  );
}

function WhyStayBanner({ hotel, cityName }: { hotel: HotelListing; cityName: string }) {
  const shortName = hotelDisplayShortName(hotel.name, cityName);
  const features = whyStayFeatures(hotel);

  return (
    <section className="relative hidden overflow-hidden rounded-xl border border-[#eadfce] sm:block">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,#fff9f3_0%,#f7eee4_55%,#efe3d6_100%)]" aria-hidden />
      <WhyStayMountains className="pointer-events-none absolute -bottom-1 right-0 h-[130%] w-[38%] max-w-none opacity-80" />

      <div className="relative flex flex-col gap-2.5 px-4 py-3 sm:px-5">
        <div className="min-w-0 pr-[18%]">
          <h2 className="text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[#1c1917]">
            Why stay at <span className="text-[#ef6614]">{shortName}</span>?
          </h2>
          <p className="mt-0.5 text-[11px] leading-snug text-[#7a7168]">
            Comfortable hill stay in the heart of {cityName}.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/75 px-2 py-1.5 backdrop-blur-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff1e6] text-[#ef6614]">
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
              </span>
              <span className="truncate text-[11px] font-bold text-[#2f2a26]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HotelTrustStrip({ hotel }: { hotel: HotelListing }) {
  const items = [
    { icon: ShieldCheck, label: "Secure & Safe Booking", tone: "text-[#15803d]" },
    { icon: Zap, label: "Instant Confirmation", tone: "text-[#2563eb]" },
    hotel.freeCancellation
      ? { icon: CalendarDays, label: "Free Cancellation*", tone: "text-[#2563eb]" }
      : { icon: Check, label: "Verified Property", tone: "text-[#2563eb]" },
    { icon: Headphones, label: "24×7 Support", tone: "text-[#ea580c]" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-xl border border-[#ebe7e1] bg-white px-3.5 py-2">
      {items.map(({ icon: Icon, label, tone }) => (
        <div key={label} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3f3f46]">
          <Icon className={cn("h-3.5 w-3.5 shrink-0", tone)} strokeWidth={2.2} aria-hidden />
          {label}
        </div>
      ))}
    </div>
  );
}

function GallerySidebarLayout({
  gallery,
  belowGallery,
  sidebar,
}: {
  gallery: React.ReactNode;
  belowGallery?: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="overflow-hidden rounded-xl">{gallery}</div>
        {belowGallery}
      </div>
      <div
        className="hidden w-full shrink-0 lg:sticky lg:top-24 lg:block lg:w-[300px] lg:self-start xl:w-[320px]"
        style={{
          borderRadius: "0.75rem",
          border: "1px solid #e0e0e0",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
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
  bookNowHref,
  bookNowMeal,
  bookNowRoom,
}: {
  hotel: HotelListing;
  selection: RoomSelection | null;
  bookingContext: HotelBookingQueryParams;
  onViewRooms: () => void;
  onApply?: (ctx: HotelBookingQueryParams) => void;
  bookNowHref?: string;
  bookNowMeal?: string;
  bookNowRoom?: string;
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
      const guestsCount = bookingContext.guests ?? 2;
      setGuests(guestsCount);
      setRooms(Math.max(bookingContext.rooms ?? 1, Math.ceil(guestsCount / 2)));
    }
  }, [bookingContext, editing]);

  const checkInFmt  = formatHotelDateFromIso(editing ? checkIn : (bookingContext.check_in ?? ""));
  const checkOutFmt = formatHotelDateFromIso(editing ? checkOut : (bookingContext.check_out ?? ""));
  const guestsLabel = `${bookingContext.guests ?? 2} Guest${(bookingContext.guests ?? 2) !== 1 ? "s" : ""}`;
  const normalizedRooms = Math.max(
    bookingContext.rooms ?? 1,
    Math.ceil((bookingContext.guests ?? 2) / 2),
  );
  const roomsLabel  = `${normalizedRooms} Room${normalizedRooms !== 1 ? "s" : ""}`;

  const handleApply = () => {
    onApply?.({
      check_in: checkIn,
      check_out: checkOut,
      guests,
      rooms,
      children: bookingContext.children ?? 0,
    });
    setEditing(false);
  };

  const updateGuests = (nextGuests: number) => {
    const guestsCount = Math.max(1, Math.min(10, nextGuests));
    setGuests(guestsCount);
    setRooms((currentRooms) => Math.max(currentRooms, Math.ceil(guestsCount / 2)));
  };

  const updateRooms = (nextRooms: number) => {
    const roomsCount = Math.max(1, Math.min(10, nextRooms));
    setRooms(roomsCount);
    setGuests((currentGuests) => Math.min(currentGuests, roomsCount * 2));
  };

  const nights      = nightCount(bookingContext.check_in, bookingContext.check_out);
  const roomsCount  = normalizedRooms;
  const summary = hotel.startingPriceSummary;
  const nightBase = Math.round(summary?.price ?? hotel.price);
  const nightTax = Math.round(summary?.taxes ?? 0);
  const nightTotal = nightBase + nightTax;
  const baseTotal = nightBase * nights * roomsCount;
  const taxesTotal = nightTax * nights * roomsCount;
  const grandTotal = nightTotal * nights * roomsCount;
  const headlineEquation = formatGstEquation(nightBase, nightTax);

  return (
    <div>
      <div className="flex flex-col">
        {/* Price header */}
        <div className="rounded-t-xl bg-gradient-to-br from-[#fff8f3] to-[#fdf5ef] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#b8b8b8]">Starting from</p>
          <p className="mt-0.5 text-[26px] font-extrabold leading-none text-[#EF6614]">
            ₹{formatInrAmount(nightTotal)}
            <span className="ml-1 text-[13px] font-medium text-[#9E9E9E]">/night</span>
          </p>
          {headlineEquation ? (
            <p className="mt-1 text-[12px] font-semibold leading-snug text-[#1a1a1a]">{headlineEquation}</p>
          ) : null}
          <p className="mt-1 text-[12px] font-semibold text-[#1a1a1a]">{bookNowMeal ?? "Room only"}</p>
          <p className="mt-0.5 text-[10px] text-[#b8b8b8]">per room · {roomsCount} room{roomsCount !== 1 ? "s" : ""} · {bookingContext?.guests ?? 2} guest{(bookingContext?.guests ?? 2) !== 1 ? "s" : ""}</p>

          {/* Total stay cost */}
          <div className="mt-3 rounded-xl border border-[#f0d9c8] bg-white/60 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#9E9E9E]">
                ₹{formatInrAmount(nightBase)} × {nights} night{nights !== 1 ? "s" : ""}{roomsCount > 1 ? ` × ${roomsCount} rooms` : ""}
              </p>
              <p className="text-[13px] font-bold text-[#212121]">₹{formatInrAmount(baseTotal)}</p>
            </div>
            {taxesTotal > 0 && (
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] text-[#9E9E9E]">GST</p>
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
                  if (ci && co) {
                    onApply?.({
                      check_in: ci,
                      check_out: co,
                      guests,
                      rooms,
                      children: bookingContext.children ?? 0,
                    });
                  }
                }}
                numberOfMonths={1}
                className="text-sm"
              />

              {/* Guests & Rooms steppers */}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#f0e8e0] pt-3">
                {[
                  { label: "Guests", value: guests, set: updateGuests, min: 1, max: 10 },
                  { label: "Rooms",  value: rooms,  set: updateRooms,  min: 1, max: 10 },
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

          {/* Booking shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onViewRooms}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e1e4e8] bg-white py-3 text-[12px] font-bold text-[#4b5563] transition hover:border-[#ef5a0a]/40 hover:text-[#ef5a0a]"
            >
              View rooms
              <ChevronsDown className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </button>
            {bookNowHref ? (
              <Link
                href={bookNowHref}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#f06a1c] to-[#d94d04] py-3 text-[12px] font-extrabold text-white shadow-[0_3px_10px_rgba(201,78,10,0.38)] transition hover:brightness-105 active:scale-[0.98]"
              >
                Book now
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onViewRooms}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] py-3 text-[12px] font-extrabold text-white shadow-[0_3px_10px_rgba(201,78,10,0.38)] transition hover:brightness-105 active:scale-[0.98]"
              >
                View options
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden />
              </button>
            )}
          </div>
          {bookNowHref ? (
            <p className="-mt-1 text-center text-[11px] font-medium text-[#3f3f46]">
              Book now takes {bookNowRoom ? `${bookNowRoom}, ` : ""}{bookNowMeal ?? "Room only"}.
            </p>
          ) : null}
          <p className="flex items-center justify-center gap-3 text-[12px]">
            <a href={siteTelHref()} className="inline-flex items-center gap-1.5 font-semibold text-[#1a1a1a]">
              <CallLogo className="h-3.5 w-3.5" />
              Call
            </a>
            <span className="text-[#e5e7eb]" aria-hidden>|</span>
            <a
              href={siteWhatsAppChatUrl(`Hi, I'd like to book ${hotel.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[#25D366]"
            >
              <WhatsAppLogo className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </p>
          {/* Check-in / Check-out times */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#9E9E9E]">
            <span>Check-in: <span className="font-semibold text-[#424242]">{clockLabel(hotel.checkInTime) || "2:00 PM"}</span></span>
            <span className="shrink-0 px-1 text-[#d5d5d5]" aria-hidden>·</span>
            <span>Check-out: <span className="font-semibold text-[#424242]">{clockLabel(hotel.checkOutTime) || "11:00 AM"}</span></span>
          </div>
        </div>

      </div>
    </div>
  );
}

function CallLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
    </svg>
  );
}

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function MobileBookingBar({
  hotel,
  onViewRooms,
  bookingHref,
  bookNowHref,
  bookNowMeal,
  selectedRoomName,
}: {
  hotel: HotelListing;
  onViewRooms: () => void;
  bookingHref?: string;
  bookNowHref?: string;
  bookNowMeal?: string;
  selectedRoomName?: string;
}) {
  const hasSelection = !!bookingHref && bookingHref !== "#";
  const whatsappHref = siteWhatsAppChatUrl(`Hi, I'd like to book ${hotel.name}.`);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e8e8] bg-white px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          {hasSelection ? (
            <>
              <p className="text-[9px] font-medium text-[#9E9E9E]">Selected</p>
              <p className="truncate text-[12px] font-bold leading-tight text-[#212121]">{selectedRoomName}</p>
            </>
          ) : (
            <>
              <p className="text-[9px] font-medium leading-none text-[#9E9E9E]">Starting from</p>
              <p className="mt-0.5 text-[16px] font-extrabold leading-none text-[#212121]">
                ₹{formatInrAmount(Math.round((hotel.startingPriceSummary?.price ?? hotel.price) + (hotel.startingPriceSummary?.taxes ?? 0)))}
                <span className="ml-0.5 text-[10px] font-normal text-[#9E9E9E]">/night</span>
              </p>
              <p className="mt-0.5 text-[10px] font-semibold leading-none text-[#616161]">{bookNowMeal ?? "Room only"}</p>
            </>
          )}
        </div>

        <a
          href={siteTelHref()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-[#f7f7f7] text-[#1a1a1a] active:scale-95"
          aria-label="Call"
        >
          <CallLogo className="h-4 w-4" />
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white active:scale-95"
          aria-label="WhatsApp"
        >
          <WhatsAppLogo className="h-[18px] w-[18px]" />
        </a>

        {hasSelection ? (
          <Link
            href={bookingHref!}
            className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] px-3.5 text-[12px] font-extrabold text-white shadow-[0_2px_8px_rgba(201,78,10,0.35)] active:scale-[0.98]"
          >
            Proceed <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : bookNowHref ? (
          <Link
            href={bookNowHref}
            className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-gradient-to-b from-[#f06a1c] to-[#d94d04] px-3.5 text-[12px] font-extrabold text-white shadow-[0_2px_8px_rgba(201,78,10,0.35)] active:scale-[0.98]"
          >
            Book now <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onViewRooms}
            className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-gradient-to-b from-[#e8651c] to-[#c94e0a] px-3.5 text-[12px] font-extrabold text-white shadow-[0_2px_8px_rgba(201,78,10,0.35)] active:scale-[0.98]"
          >
            Book now <ChevronRight className="h-3.5 w-3.5" aria-hidden />
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
  hotelPolicies,
  apiReviews,
  nearbyAttractions = [],
  photoCategories = [],
}: HotelDetailViewProps) {
  const searchParams = useSearchParams();
  const listingHref = hotelHref(city.slug);
  const [activeTab, setActiveTab] = useState<HotelDetailTabId>("rooms");
  const [gallery, setGallery] = useState<{ open: boolean; initialPhotoIndex?: number }>({ open: false });
  const [roomSelection, setRoomSelection] = useState<RoomSelection | null>(null);
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  const belowFoldSentinelRef = useRef<HTMLDivElement>(null);

  const paramsContext = useMemo(
    () => parseBookingContextFromParams(searchParams),
    [searchParams],
  );
  const [bookingContext, setBookingContext] = useState<HotelBookingQueryParams>(paramsContext);

  useEffect(() => {
    setBookingContext(paramsContext);
  }, [paramsContext]);

  useEffect(() => {
    const sentinel = belowFoldSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setBelowFoldReady(true);
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleApplySearch = useCallback((ctx: HotelBookingQueryParams) => {
    const guestsCount = Math.max(1, ctx.guests ?? 2);
    const normalizedContext = {
      ...ctx,
      guests: guestsCount,
      rooms: Math.max(ctx.rooms ?? 1, Math.ceil(guestsCount / 2)),
    };
    setBookingContext(normalizedContext);
    const qs = bookingContextQueryString(normalizedContext);
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

  // Fast booking defaults to the lowest-priced room and lowest-priced meal
  // plan, so the reservation page opens with the best available entry price.
  const bookNowOffer = useMemo(() => {
    const roomWithPlan = (roomTypes ?? [])
      .filter((room) => room.ratePlans.length > 0)
      .map((room) => ({
        room,
        plan: room.ratePlans.reduce((cheapest, plan) =>
          plan.price < cheapest.price ? plan : cheapest,
        ),
      }))
      .reduce<{ room: HotelRoomType; plan: HotelRoomType["ratePlans"][number] } | null>(
        (cheapest, candidate) => !cheapest || candidate.plan.price < cheapest.plan.price ? candidate : cheapest,
        null,
      );

    if (!roomWithPlan) return undefined;

    return {
      href: hotelBookingHref(
        city.slug,
        hotelListingKey(hotel),
        roomWithPlan.room.id,
        roomWithPlan.plan.id,
        bookingContext,
      ),
      roomName: roomWithPlan.room.name.trim(),
      meal: mealPlanLabel(roomWithPlan.plan.packageName),
    };
  }, [bookingContext, city.slug, hotel, roomTypes]);
  const bookNowHref = bookNowOffer?.href;

  const openPhoto = useCallback(() => {
    if (allPhotos.length === 0) return;
    setGallery({ open: true });
  }, [allPhotos.length]);

  const openPhotoBySrc = useCallback(() => {
    setGallery({ open: true });
  }, []);

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

  const handleTabChange = useCallback((tab: HotelDetailTabId) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      const el = document.getElementById("hotel-tabs");
      if (!el) return;
      const offset = window.innerWidth >= 1024 ? 80 : 130;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
    });
  }, []);

  const scrollToReviews = useCallback(() => {
    scrollToSection("guest-reviews");
  }, [scrollToSection]);

  const mapsUrl = hotelMapsLink(hotel, city.name);
  const postalAddress = hotelPostalAddress(hotel, city.name);

  const bookingMeta = (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
        <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} stars`}>
          {Array.from({ length: hotel.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" aria-hidden />
          ))}
        </span>
        {hotel.rating > 0 ? (
          <button type="button" onClick={scrollToReviews} className="inline-flex items-center gap-1 font-semibold text-[#1d7a38] hover:underline">
            <span className="rounded bg-[#eaf8ee] px-1.5 py-0.5 text-[10px] font-bold">{hotel.rating.toFixed(1)}</span>
            {hotel.reviewCount > 0 ? `${hotel.reviewCount} reviews` : "Guest rating"}
          </button>
        ) : null}
        <span className="hidden h-3.5 w-px bg-[#dfe4e9] sm:block" aria-hidden />
        <span className="flex min-w-0 items-center gap-1 text-[#687180]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ef5a0a]" strokeWidth={2.2} aria-hidden />
          <span className="truncate">{postalAddress}</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {hotelAmenityChips(hotel).slice(0, 8).map((label) => (
            <span
              key={label}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                /cancellation/i.test(label)
                  ? "bg-[#ecfdf3] text-[#18723a]"
                  : /breakfast/i.test(label)
                    ? "bg-[#fff8df] text-[#8a5a00]"
                    : "bg-[#f3f4f6] text-[#374151]",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md px-1 text-[11px] font-semibold text-[#4b5563] transition hover:text-[#ef5a0a]"
        >
          View on map <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
        <span className="h-3.5 w-px bg-[#dfe4e9]" aria-hidden />
        <button
          type="button"
          onClick={() => {
            if (navigator.share) void navigator.share({ title: hotel.name, url: window.location.href });
            else void navigator.clipboard.writeText(window.location.href);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1 text-[11px] font-semibold text-[#4b5563] transition hover:text-[#ef5a0a]"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
        </button>
      </div>
    </div>
  );

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <div className="hidden md:block">
          <HeroGlassNavbar activeId="hotels" solid flushDetailShell />
        </div>
        <TravelMobileTopShell activeId="hotels" showGreeting={false} compact />
        <div className="md:pt-[92px] lg:pt-[92px]">
          <DetailSearchStrip
            hotelName={hotel.name}
            bookingContext={bookingContext}
            onApply={handleApplySearch}
            footer={bookingMeta}
          />
        </div>

        <div className="mx-auto w-full max-w-[1320px] px-3 py-2.5 pb-24 sm:px-4 sm:py-3 lg:px-6 lg:pb-0">
          <nav
            className="mb-2 hidden flex-wrap items-center gap-1 text-[10px] text-[#8d95a1] sm:flex sm:text-[11px]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="text-[#EF6614] hover:underline">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <Link href="/hotels" className="text-[#EF6614] hover:underline">Hotels</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <Link href={listingHref} className="text-[#EF6614] hover:underline">Hotels in {city.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <span className="truncate font-medium text-[#3b414b]">{hotel.name}</span>
          </nav>

          <section className="mb-2 rounded-xl border border-[#e8e8e8] bg-white px-3.5 py-3 shadow-sm sm:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-[#1a1a1a]">{hotel.name}</h1>
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} stars`}>
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                    ))}
                  </span>
                  {hotel.rating > 0 ? <span className="rounded-md bg-[#eaf8ee] px-1.5 py-0.5 text-[10px] font-bold text-[#18723a]">{hotel.rating.toFixed(1)}</span> : null}
                  {hotel.reviewCount > 0 ? <span className="text-[#7b8491]">{hotel.reviewCount} reviews</span> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) void navigator.share({ title: hotel.name, url: window.location.href });
                  else void navigator.clipboard.writeText(window.location.href);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e6e9ed] text-[#5d6673] active:bg-[#fff7f2]"
                aria-label="Share hotel"
              >
                <Share2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-[#6b7280]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#ef5a0a]" aria-hidden />
              {postalAddress}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hotelAmenityChips(hotel).slice(0, 8).map((label) => (
                <span
                  key={label}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    /cancellation/i.test(label)
                      ? "bg-[#ecfdf3] text-[#18723a]"
                      : /breakfast/i.test(label)
                        ? "bg-[#fff8df] text-[#8a5a00]"
                        : "bg-[#f3f4f6] text-[#374151]",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </section>

          <GallerySidebarLayout
            gallery={<DetailGallery hotel={hotel} photos={allPhotos} onOpenPhoto={openPhoto} />}
            belowGallery={<WhyStayBanner hotel={hotel} cityName={city.name} />}
            sidebar={
              <BookingSummary
                hotel={hotel}
                selection={roomSelection}
                bookingContext={bookingContext}
                onViewRooms={scrollToRooms}
                onApply={handleApplySearch}
                bookNowHref={bookNowHref}
                bookNowMeal={bookNowOffer?.meal}
                bookNowRoom={bookNowOffer?.roomName}
              />
            }
          />
          <div className="mt-4 space-y-5 sm:mt-5 sm:space-y-6">
            <HotelTrustStrip hotel={hotel} />
            <HotelDetailTabs
              hotel={hotel}
              city={city}
              roomTypes={roomTypes}
              bookingContext={bookingContext}
              policies={policies}
              hotelPolicies={hotelPolicies}
              nearbyAttractions={nearbyAttractions}
              photoCategories={photoCategories}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onRoomPhotoClick={openPhotoBySrc}
              onRoomSelect={setRoomSelection}
            />
            <div ref={belowFoldSentinelRef} className="h-px" aria-hidden />
            {belowFoldReady ? (
              <>
                <HotelDetailReviews hotel={hotel} cityName={city.name} apiReviews={apiReviews} />
                <HotelDetailBookingPolicy hotel={hotel} hotelPolicies={hotelPolicies} policies={policies} />
                <HotelDetailDeferredSimilarHotels hotelId={hotel.id} city={city} />
              </>
            ) : (
              <div className="space-y-4 rounded-xl border border-[#e8e8e8] bg-white p-4">
                <div className="h-4 w-40 rounded bg-[#f1f5f9]" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="h-28 rounded-lg bg-[#f8fafc]" />
                  <div className="h-28 rounded-lg bg-[#f8fafc]" />
                </div>
                <div className="h-24 rounded-lg bg-[#f8fafc]" />
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-[60px] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#EF6614] text-white shadow-lg transition hover:bg-[#c94e0a] sm:right-6 lg:bottom-6"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
        <MobileBookingBar
          hotel={hotel}
          onViewRooms={scrollToRooms}
          bookingHref={roomSelection?.bookingHref}
          bookNowHref={bookNowHref}
          bookNowMeal={bookNowOffer?.meal}
          selectedRoomName={roomSelection ? `${roomSelection.roomName} · ${roomSelection.planCode}` : undefined}
        />
      </main>

      {gallery.open ? (
        <HotelPhotoGalleryModal
          open={gallery.open}
          onClose={() => setGallery({ open: false })}
          hotelName={hotel.name}
          photoCategories={photoCategories}
          allPhotos={allPhotos}
        />
      ) : null}
      <Footer />
    </>
  );
}
