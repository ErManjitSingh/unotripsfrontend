"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  BookOpen,
  Building2,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headphones,
  Hotel,
  MapPin,
  Plane,
  ShieldCheck,
  Star,
  Ticket,
  CircleCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TourPackage } from "@/lib/constants";
import { DatePickerPopover } from "@/components/hotels/hotel-date-range-picker";
import { TravellerSelector } from "@/components/packages/traveller-selector";
import { travellerSummary, type TravellerRoom } from "@/lib/rooms-utils";
import { staySelectionIndex, type DestinationHotels } from "@/lib/package-customizer-data";

type AnyRecord = Record<string, any>;

type Props = {
  tour: TourPackage;
  images: string[];
  roomsLabel: string;
  total: number;
  tokenType: string;
  tokenAmount: number;
  loadingJourney?: boolean;
  initialDate?: string | null;
  hotelGroups: AnyRecord[];
  cabOptions: AnyRecord[];
  selectedHotels: Array<{ optionId: string }>;
  selectedCab: number;
  /** New traveller rooms with child ages. */
  travellerRooms: TravellerRoom[];
  /** Whether the fulfillment price is currently loading. */
  priceLoading?: boolean;
  /** Whether at least one successful price response has been received. */
  hasPrice?: boolean;
  /** Pre-tax base package price. */
  basePackagePrice?: number;
  /** Hotel upgrade cost. */
  hotelUpgrade?: number;
  /** Cab upgrade cost. */
  cabUpgrade?: number;
  /** Volvo bus return-ticket cost (0 for non-Volvo packages). */
  volvoBusCost?: number;
  /** Activities + sightseeing total. */
  activitiesTotal?: number;
  /** Add-ons total. */
  addonsTotal?: number;
  /** GST result from the fulfillment pipeline. */
  gstResult?: { total_gst: number; gst_label: string } | null;
  onBook: () => void;
  onViewBrochure: () => void;
  onChangeHotel: (index: number) => void;
  onChangeRoom: (index: number) => void;
  onChangeCab: () => void;
  /** New: receives full TravellerRoom[] from the selector. */
  onChangeTravellerRooms: (rooms: TravellerRoom[]) => void;
  onChangeDate: (date: string) => void;
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-IN").format(Math.round(amount || 0));
const itineraryTabs = [
  { label: "Itinerary", Icon: CalendarDays },
  { label: "Summary", Icon: BedDouble },
  { label: "Transfers", Icon: Car },
  { label: "Stay", Icon: Hotel },
];

function displayPackageTitle(value?: string | null) {
  const title = value?.trim();
  if (!title) return "Holiday Package";
  // Preserve intentional backend casing (e.g. "Honeymoon Shimla"), but make
  // a lowercase fallback/slug title presentable ("test packages" → "Test Packages").
  if (title !== title.toLowerCase()) return title;
  return title.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function travelDate(value?: string | null) {
  if (!value) return "Select date";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Select date"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/** "2:00 PM" from a "14:00" Hotel Master time. Empty string when unset. */
function clockLabel(hhmm?: string | null): string {
  if (!hhmm) return "";
  const [rawHour, rawMinute] = hhmm.split(":");
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return "";
  const minute = String(Number(rawMinute) || 0).padStart(2, "0");
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}

/**
 * "28 Jul 2:00 PM — 29 Jul 11:00 AM" for one stay, derived from the traveller's
 * chosen date plus the stay's offset and length. Returns null when no valid
 * travel date is set, so the caller can hide the line rather than show a
 * misleading placeholder.
 */
function stayWindowLabel(
  travelDateValue: string,
  startDay: number,
  nights: number,
  checkInTime?: string | null,
  checkOutTime?: string | null,
): string | null {
  if (!travelDateValue) return null;
  const base = new Date(travelDateValue);
  if (Number.isNaN(base.getTime())) return null;

  const checkIn = new Date(base);
  checkIn.setDate(checkIn.getDate() + Math.max(0, startDay - 1));
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + Math.max(1, nights));

  const dayLabel = (value: Date) =>
    value.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const inTime = clockLabel(checkInTime);
  const outTime = clockLabel(checkOutTime);

  return `${dayLabel(checkIn)}${inTime ? ` ${inTime}` : ""} — ${dayLabel(checkOut)}${
    outTime ? ` ${outTime}` : ""
  }`;
}

function todayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function GlacialStylePackageDetail({
  tour,
  images,
  roomsLabel,
  total,
  tokenType,
  tokenAmount,
  loadingJourney = false,
  initialDate,
  hotelGroups,
  cabOptions,
  selectedHotels,
  selectedCab,
  travellerRooms,
  priceLoading = false,
  hasPrice = false,
  basePackagePrice = 0,
  hotelUpgrade = 0,
  cabUpgrade = 0,
  volvoBusCost = 0,
  activitiesTotal = 0,
  addonsTotal = 0,
  gstResult = null,
  onBook,
  onViewBrochure,
  onChangeHotel,
  onChangeRoom,
  onChangeCab,
  onChangeTravellerRooms,
  onChangeDate,
}: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [selectedTravelDate, setSelectedTravelDate] = useState(
    initialDate ?? "",
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [topDateOpen, setTopDateOpen] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [journeyImagesReady, setJourneyImagesReady] = useState(false);
  const itinerary = tour.itinerary ?? [];
  const packageTitle = displayPackageTitle(tour.title);
  // Derived from the new TravellerRoom[] state owned by PackageDetailView.
  const travellerCount = travellerRooms.reduce((s, r) => s + r.adults, 0);
  // Children are charged too, so every "per person" figure must divide by the
  // real head count. Dividing by adults alone overstated the price by 50% for
  // a couple travelling with one child.
  const guestCount = travellerRooms.reduce(
    (s, r) => s + r.adults + (r.children?.length ?? 0),
    0,
  );
  const travellerLabel = travellerSummary(travellerRooms);
  const heroImages = images.length ? images : [tour.image].filter(Boolean);
  const heroImage = heroImages[imageIndex] ?? tour.image;
  const nights = tour.durationNights || Math.max(1, itinerary.length - 1);
  const getStayForDay = (day: number) => {
    let startDay = 1;

    for (let index = 0; index < hotelGroups.length; index += 1) {
      const group = hotelGroups[index];
      const stayNights = Math.max(1, Number(group?.nights) || 1);

      if (day >= startDay && day < startDay + stayNights) {
        // startDay is returned so the stay card can derive real check-in /
        // check-out dates from the traveller's chosen travel date.
        return { group, index, startDay, nights: stayNights };
      }

      startDay += stayNights;
    }

    return null;
  };
  const cab = cabOptions[selectedCab];
  const itineraryImageSources = useMemo(
    () =>
      [
        cab?.img,
        ...hotelGroups.map(
          (group, index) => group?.opts?.[staySelectionIndex(selectedHotels[index], group as DestinationHotels)]?.img,
        ),
      ].filter((source): source is string => Boolean(source)),
    [cab?.img, hotelGroups, selectedHotels],
  );
  const itineraryImageKey = itineraryImageSources.join("|");
  const showJourneyLoader = loadingJourney || !journeyImagesReady;
  // `total` is the live package amount after traveller, room, hotel and cab
  // selections. Do not divide it back into a per-person number when rendering:
  // that hid every traveller-count price change from the customer.
  const totalPrice = Math.max(0, Math.round(total >= 1000 ? total : (tour.priceINR >= 1000 ? tour.priceINR : 0)));
  const bookingAmount = tokenType === "percent" ? (totalPrice * tokenAmount) / 100 : tokenAmount;
  const hasBookingAmount = Number.isFinite(bookingAmount) && bookingAmount >= 1 && bookingAmount < totalPrice;
  const notices = [
    "Lowest price today",
    "Limited seats available!",
    "🔥 12 booked today",
  ];

  useEffect(() => {
    const timer = window.setInterval(
      () => setNoticeIndex((index) => (index + 1) % notices.length),
      3200,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!initialDate)
      setSelectedTravelDate((current) => current || todayDateValue());
  }, [initialDate]);

  const updateTravelDate = (date: string) => {
    setSelectedTravelDate(date);
    onChangeDate(date);
  };

  useEffect(() => {
    if (loadingJourney) {
      setJourneyImagesReady(false);
      return;
    }

    if (!itineraryImageSources.length) {
      setJourneyImagesReady(true);
      return;
    }

    let cancelled = false;
    setJourneyImagesReady(false);

    Promise.all(
      itineraryImageSources.map(
        (source) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = source;
          }),
      ),
    ).then(() => {
      if (!cancelled) setJourneyImagesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [itineraryImageKey, itineraryImageSources, loadingJourney]);

  const inclusions = useMemo(
    () => [
      { Icon: BedDouble, text: `${nights} Nights`, sub: "Hotel accommodation" },
      { Icon: Hotel, text: "Handpicked stays", sub: "Comfortable rooms" },
      {
        Icon: UtensilsCrossed,
        text: "Meals included",
        sub: "Breakfast & dinner",
      },
      {
        Icon: Car,
        text: cab?.name ?? "Private vehicle",
        sub: "Transfers & sightseeing",
      },
    ],
    [cab?.name, nights],
  );

  const selectImage = (next: number) =>
    setImageIndex((next + heroImages.length) % heroImages.length);

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-28 pt-0 text-[#172033] md:pt-[92px] xl:pb-16">
      <section className="relative z-30 hidden pb-2.5 pt-2 sm:block">
        <div className="mx-auto w-full max-w-[1240px] px-4 lg:px-0">
          <div className="flex flex-wrap items-stretch overflow-visible rounded-b-2xl rounded-t-none border border-[#e4e8ee] bg-white shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)]">
            <div className="flex min-w-0 flex-1 items-stretch">
              <div className="flex min-w-0 flex-[1.15] items-center gap-3 border-r border-[#ECEEF2] px-4 py-3 sm:px-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#EF6614]">
                  <MapPin className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">
                    Starts from
                  </p>
                  <p className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#20242c]">
                    New Delhi
                  </p>
                </div>
              </div>
              <div className="relative z-[300] flex min-w-0 flex-[1.15] border-r border-[#ECEEF2]">
                <button
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setTopDateOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/45 sm:px-5"
                >
                  <CalendarDays
                    className="h-4 w-4 shrink-0 text-[#737b88]"
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">
                      Travelling on
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] font-bold leading-tight text-[#20242c]">
                      {travelDate(selectedTravelDate)}
                    </span>
                  </span>
                </button>
                {topDateOpen && (
                  <DatePickerPopover
                    checkIn={selectedTravelDate}
                    checkOut=""
                    onChange={(checkIn) => updateTravelDate(checkIn)}
                    onApply={() => setTopDateOpen(false)}
                    onClose={() => setTopDateOpen(false)}
                    compact
                    singleDate
                  />
                )}
              </div>
              <div className="relative min-w-0 flex-[1.3] border-r border-[#ECEEF2]">
                <TravellerSelector
                  rooms={travellerRooms}
                  onChange={onChangeTravellerRooms}
                  compact
                />
              </div>
            </div>
            <div className="flex items-center border-l border-[#ECEEF2] p-3">
              <button
                type="button"
                onClick={onBook}
                className="h-11 rounded-xl bg-[#ef5a0a] px-8 text-[13px] font-bold text-white shadow-[0_8px_16px_-8px_rgba(239,90,10,0.72)] transition hover:bg-[#d94d04]"
              >
                Book Now
              </button>
            </div>
            <div className="basis-full flex items-center justify-between gap-4 rounded-b-2xl border-t border-[#edf0f3] bg-[#fbfcfd] px-5 py-2 text-[11px] text-[#657080]">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#3f4856]">
                  {nights} Nights / {tour.durationDays} Days
                </span>
                <span className="h-3.5 w-px bg-[#dfe4e9]" />
                <span>Private transfers &amp; hotel stays included</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share)
                    void navigator.share({
                      title: packageTitle,
                      url: window.location.href,
                    });
                  else void navigator.clipboard.writeText(window.location.href);
                }}
                className="font-semibold text-[#4b5563] transition hover:text-[#ef5a0a]"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-0 sm:py-5">
        <nav className="hidden" aria-hidden="true">
          <Link href="/" tabIndex={-1}>
            Home
          </Link>
        </nav>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-primary px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                      {tour.packageType?.replace(/_/g, " ") || "Domestic tour"}
                    </span>
                    <span className="rounded bg-orange-50 px-2.5 py-1 text-xs font-bold text-primary">
                      {nights}N/{tour.durationDays}D
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      Curated holiday package
                    </span>
                  </div>
                  <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.035em] text-[#162034] sm:text-[1.8rem]">
                    {packageTitle}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:justify-end">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <MapPin className="h-4 w-4 text-primary" />
                    {tour.location || "Himachal Pradesh, India"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    {roomsLabel}
                  </span>
                  {/* Only show a score when one actually exists. Rendering
                      `0.0 ★` for an unrated package read as "customers scored
                      this zero" — worse for trust than showing nothing. Falls
                      back to an honest "New" chip and swaps itself out the
                      moment a real rating arrives. */}
                  {tour.rating > 0 ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">
                      {tour.rating.toFixed(1)}{" "}
                      <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  ) : null}
                  {tour.reviewCount > 0 && (
                    <span className="font-semibold">
                      {tour.reviewCount} reviews
                    </span>
                  )}
                </div>
              </div>
              <div className="relative aspect-[1.48/1] overflow-hidden bg-slate-200 sm:aspect-[2.75/1]">
                {heroImage && (
                  <Image
                    src={heroImage}
                    alt={packageTitle}
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                    sizes="(min-width: 1280px) 1200px, 100vw"
                  />
                )}
                <button
                  type="button"
                  onClick={onViewBrochure}
                  className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50 hover:text-primary sm:right-4 sm:top-4"
                >
                  <BookOpen className="mr-1.5 inline h-3.5 w-3.5" />
                  View Trip Brochure
                </button>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/15 to-transparent p-4 text-white">
                  <span className="flex max-w-[78%] items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-[11px] font-semibold sm:max-w-[80%]">
                    <MapPin className="h-4 w-4" />
                    {tour.location || "Himachal Pradesh, India"}
                  </span>
                  <span className="rounded bg-black/55 px-3 py-2 text-[11px] font-bold">
                    {imageIndex + 1} / {heroImages.length}
                  </span>
                </div>
                {heroImages.length > 1 && (
                  <>
                    <button
                      aria-label="Previous image"
                      onClick={() => selectImage(imageIndex - 1)}
                      className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                    >
                      <ChevronLeft />
                    </button>
                    <button
                      aria-label="Next image"
                      onClick={() => selectImage(imageIndex + 1)}
                      className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_12px_28px_-20px_rgba(234,88,12,0.48)] xl:hidden">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Your trip, your way</p>
                <h2 className="mt-1 text-base font-extrabold text-[#172033]">Pick a date and you&apos;re ready</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDateOpen(true)}
                    className="flex min-h-14 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left"
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Travel date</span>
                      <span className="mt-0.5 block truncate text-xs font-bold text-slate-700">{travelDate(selectedTravelDate)}</span>
                    </span>
                  </button>
                  {dateOpen && (
                    <DatePickerPopover
                      checkIn={selectedTravelDate}
                      checkOut=""
                      onChange={(checkIn) => updateTravelDate(checkIn)}
                      onApply={() => setDateOpen(false)}
                      onClose={() => setDateOpen(false)}
                      compact
                      singleDate
                    />
                  )}
                </div>
                <TravellerSelector
                  rooms={travellerRooms}
                  onChange={onChangeTravellerRooms}
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700"><ShieldCheck className="h-4 w-4" /> Free date changes before confirmation</p>
            </section>

            <section className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-3 sm:px-5 sm:py-4 lg:grid-cols-4">
              {inclusions.map(({ Icon, text, sub }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 sm:gap-3 sm:bg-transparent sm:p-0 lg:border-r lg:last:border-0"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                  <div>
                    <p className="text-xs font-bold sm:text-sm">{text}</p>
                    <p className="text-[11px] text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-extrabold">
                <span className="mr-2 text-primary">✦</span>Package Highlights
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {heroImages.slice(0, 6).map((src, index) => (
                  <div key={`${src}-highlight-${index}`} className="min-w-0">
                    <div className="relative aspect-[1.45/1] overflow-hidden rounded-md bg-slate-100">
                      <Image
                        src={src}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="160px"
                      />
                    </div>
                    <p className="mt-1.5 truncate text-center text-[10px] font-semibold text-slate-600">
                      {
                        [
                          "Scenic mountains",
                          "Pine forests",
                          "Beautiful waterfalls",
                          "Local culture",
                          "Peaceful landscapes",
                          "Adventure activities",
                        ][index]
                      }
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="itinerary"
              className={cn(
                "relative overflow-hidden rounded-[24px] bg-white shadow-[0_18px_55px_rgba(16,24,40,0.07)]",
                showJourneyLoader && "h-[370px]",
              )}
            >
              {showJourneyLoader && (
                <div className="absolute inset-0 z-20 grid place-items-start overflow-hidden bg-white pt-11 sm:pt-14">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,122,0,0.16),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.13),transparent_36%)]" />
                  <div className="relative flex w-full max-w-md justify-self-center flex-col items-center px-6 text-center">
                    <div className="relative grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-[#fff3e8] to-[#fff9f4] shadow-[0_14px_32px_rgba(255,107,0,0.18)]">
                      <Plane className="h-9 w-9 animate-[bounce_1.7s_ease-in-out_infinite] text-primary" />
                      <span className="absolute -bottom-2 h-2 w-9 rounded-full bg-primary/15 blur-sm" />
                    </div>
                    <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.24em] text-primary">
                      UNO Trips is preparing your journey
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#172033]">
                      Loading your itinerary
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      Matching your stays, transfers, and day-by-day
                      experiences.
                    </p>
                    <div className="mt-5 grid w-full grid-cols-3 gap-2">
                      {["Route", "Stays", "Transfers"].map((step, index) => (
                        <div
                          key={step}
                          className="rounded-xl border border-slate-100 bg-white px-2 py-3 shadow-sm"
                        >
                          <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-white">
                            0{index + 1}
                          </span>
                          <p className="mt-2 text-[11px] font-bold text-slate-700">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-[#ff7a00] via-[#ffb36c] to-[#ff7a00] animate-[pulse_1.4s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              )}
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      The journey
                    </p>
                    <h2 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-[#172033] sm:text-[26px]">
                      Every day, beautifully planned
                    </h2>
                    <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                      A considered route with comfortable stays, private
                      transfers and memorable experiences.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#FFF8F2] px-4 py-3 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                      Your escape
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-[#172033]">
                      {itinerary.length} days{" "}
                      <span className="mx-1 text-[#FFB27A]">·</span> curated
                    </p>
                  </div>
                </div>
                <div
                  className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-[#F8FAFC] p-1"
                  aria-label="Itinerary sections"
                >
                  {itineraryTabs.map(({ label, Icon }, index) => (
                    <button
                      key={label}
                      type="button"
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition",
                        index === 0
                          ? "bg-white text-primary shadow-[0_2px_8px_rgba(16,24,40,0.08)]"
                          : "text-slate-500 hover:bg-white hover:text-slate-700",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 py-6 sm:px-7 sm:py-8">
                <div className="space-y-8">
                  {itinerary.map((item, index) => {
                    const stayForDay = getStayForDay(item.day);
                    const dayHotel =
                      stayForDay?.group?.opts?.[
                        staySelectionIndex(selectedHotels[stayForDay.index], hotelGroups[stayForDay.index] as DestinationHotels)
                      ];
                    const stayWindow = stayForDay
                      ? stayWindowLabel(
                          selectedTravelDate,
                          stayForDay.startDay,
                          stayForDay.nights,
                          dayHotel?.checkInTime,
                          dayHotel?.checkOutTime,
                        )
                      : null;
                    const stayGallery = (dayHotel?.images ?? []).filter(
                      (url: string) => url && url !== dayHotel?.img,
                    );

                    return (
                      <article
                        key={item.day}
                        className="relative pl-8 sm:pl-10"
                      >
                        <div className="absolute bottom-[-32px] left-[10px] top-8 w-px bg-gradient-to-b from-[#FF6B00] via-slate-200 to-transparent sm:left-[13px]" />
                        <div className="absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full bg-primary shadow-[0_0_0_5px_#FFF3EB] sm:h-7 sm:w-7">
                          <span className="text-[10px] font-extrabold text-white">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <header className="flex flex-wrap items-start justify-between gap-3">
                          <div className="w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                                Day {item.day}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-[#FFB27A]" />
                              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                                On the itinerary
                              </span>
                            </div>
                            <h3 className="mt-2 max-w-2xl text-lg font-extrabold leading-snug tracking-[-0.015em] text-[#172033] sm:text-xl">
                              {item.title}
                            </h3>
                          </div>
                          {initialDate && (
                            <div className="rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm">
                              {travelDate(initialDate)}
                            </div>
                          )}
                          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-slate-500 shadow-sm">
                            <Car className="h-4 w-4 text-[#344054]" />
                            <div>
                              <p className="text-xs font-bold text-[#344054]">
                                ~ 7–8 hrs
                              </p>
                              <p className="text-[10px]">Total drive</p>
                            </div>
                          </div>
                        </header>
                        <div className="mt-5 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-4">
                          <div className="flex min-w-0 items-center gap-4 rounded-2xl bg-[#F8FAFC] p-3">
                            <div className="relative grid h-16 w-44 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-primary shadow-sm">
                              {cab?.img ? (
                                <Image
                                  src={cab.img}
                                  alt={cab.name ?? "Vehicle"}
                                  fill
                                  unoptimized
                                  className="object-contain p-1"
                                  sizes="176px"
                                />
                              ) : (
                                <Car
                                  className="h-7 w-7"
                                  aria-label="Vehicle image unavailable"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#172033]">
                                {cab?.name ?? "Private transfer"}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                                {cab?.seats ? (
                                  <span>{cab.seats} seater</span>
                                ) : null}
                                {cab?.desc ? <span>{cab.desc}</span> : null}
                                <span className="text-emerald-600">
                                  Private transfer
                                </span>
                              </div>
                            </div>
                          </div>
                          {index === 0 && (
                            <button
                              type="button"
                              onClick={onChangeCab}
                              className="justify-self-end rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-primary transition hover:bg-orange-100 lg:self-center"
                            >
                              Change vehicle{" "}
                              <span aria-hidden="true" className="ml-1">
                                ↗
                              </span>
                            </button>
                          )}
                        </div>
                        <div className="mt-4 max-w-4xl">
                          <p
                            className={cn(
                              "whitespace-pre-line text-sm leading-6 text-slate-500",
                              item.body.length > 420 &&
                                !expandedDays[item.day] &&
                                "line-clamp-3",
                            )}
                          >
                            {item.body}
                          </p>
                          {item.body.length > 420 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDays((current) => ({
                                  ...current,
                                  [item.day]: !current[item.day],
                                }))
                              }
                              className="mt-2 text-xs font-bold text-primary transition hover:text-[#D94F00]"
                            >
                              {expandedDays[item.day]
                                ? "Show less"
                                : "Read more"}{" "}
                              <span aria-hidden="true">→</span>
                            </button>
                          )}
                        </div>
                        {dayHotel && (
                          <div className="mt-5 rounded-2xl border border-[#F2F4F7] bg-gradient-to-br from-[#FFFDFC] to-[#FFF8F2] p-3 sm:p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                              <div className="w-full shrink-0 sm:w-56">
                                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-36">
                                  {dayHotel.img ? (
                                    <Image
                                      src={dayHotel.img}
                                      alt={dayHotel.name ?? "Hotel"}
                                      fill
                                      unoptimized
                                      className="object-cover"
                                      sizes="(min-width: 640px) 224px, 100vw"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Building2 className="h-10 w-10 text-slate-300" />
                                    </div>
                                  )}
                                </div>
                                {/* Gallery strip — opens the hotel drawer, which
                                    already owns the full photo experience. */}
                                {stayGallery.length > 0 && (
                                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                                    {stayGallery.slice(0, 4).map((url: string, gi: number) => {
                                      const isLast = gi === 3 && stayGallery.length > 4;
                                      return (
                                        <button
                                          key={url}
                                          type="button"
                                          onClick={() => onChangeHotel(stayForDay.index)}
                                          aria-label={`View ${dayHotel.name} photos`}
                                          className="relative h-11 overflow-hidden rounded-md bg-slate-100"
                                        >
                                          <Image
                                            src={url}
                                            alt=""
                                            fill
                                            unoptimized
                                            className="object-cover"
                                            sizes="60px"
                                          />
                                          {isLast && (
                                            <span className="absolute inset-0 grid place-items-center bg-black/60 text-[10px] font-extrabold text-white">
                                              {stayGallery.length - 3}+
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 pb-1 sm:py-2 sm:pr-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                                      {index === 0
                                        ? "Your first stay"
                                        : "Your stay"}
                                    </p>
                                    <h4 className="mt-1 text-base font-extrabold text-[#172033]">
                                      {dayHotel.name}
                                    </h4>
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className={cn(
                                              "h-3.5 w-3.5",
                                              i < (dayHotel.stars ?? 3)
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-slate-200",
                                            )}
                                          />
                                        ))}
                                      </span>
                                      {/* Rating badge stays hidden until review
                                          data exists — Property.rating is null
                                          for every hotel today. */}
                                      {dayHotel.rating ? (
                                        <span className="inline-flex items-center gap-1.5">
                                          <span className="rounded bg-[#1668E3] px-1.5 py-0.5 text-[11px] font-extrabold text-white">
                                            {Number(dayHotel.rating).toFixed(1)}
                                          </span>
                                          {(dayHotel.reviewCount ?? 0) > 0 && (
                                            <span className="text-[11px] font-medium text-slate-500">
                                              ({dayHotel.reviewCount} ratings)
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        // No review data yet. Show the official
                                        // star classification (real, from Hotel
                                        // Master) plus an honest "New" chip —
                                        // never an invented score. Both vanish
                                        // automatically once `rating` is populated.
                                        <span className="inline-flex items-center gap-1.5">
                                          {dayHotel.stars ? (
                                            <span className="rounded bg-[#F2F4F7] px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-[#475467]">
                                              {dayHotel.stars}-STAR
                                            </span>
                                          ) : null}
                                        </span>
                                      )}
                                    </div>
                                    {dayHotel.address && (
                                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-slate-500">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <span className="line-clamp-1">{dayHotel.address}</span>
                                      </p>
                                    )}
                                    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                      <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                      {travellerRooms.length} Room
                                      {travellerRooms.length === 1 ? "" : "s"} · {travellerLabel}
                                    </p>
                                    {stayWindow && (
                                      <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        {stayWindow}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onChangeHotel(stayForDay.index)
                                    }
                                    className="shrink-0 rounded-lg bg-orange-50 px-2 py-1.5 text-xs font-bold text-primary"
                                  >
                                    Change hotel{" "}
                                    <span aria-hidden="true">↗</span>
                                  </button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {dayHotel.mealsIncluded && dayHotel.mealsIncluded.length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2F4F7] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                      <UtensilsCrossed className="h-3.5 w-3.5 text-slate-500" />
                                      {dayHotel.mealsIncluded.join(" & ")}
                                    </span>
                                  )}
                                  {dayHotel.roomType && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2F4F7] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                      <BedDouble className="h-3.5 w-3.5 text-slate-500" />
                                      {dayHotel.roomType}
                                    </span>
                                  )}
                                </div>
                                {dayHotel.hotelDescription && (
                                  <p className="mt-2.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                                    {dayHotel.hotelDescription}
                                  </p>
                                )}
                                {(dayHotel.amenities ?? []).length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    {(dayHotel.amenities ?? []).slice(0, 4).map((amenity: string) => (
                                      <span
                                        key={amenity}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600"
                                      >
                                        <CircleCheck className="h-3.5 w-3.5 text-[#1b9c5a]" />
                                        {amenity}
                                      </span>
                                    ))}
                                    {(dayHotel.amenities ?? []).length > 4 && (
                                      <span className="text-[11px] font-bold text-slate-400">
                                        +{(dayHotel.amenities ?? []).length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onChangeRoom(stayForDay.index)}
                                  className="mt-2.5 text-xs font-bold text-primary"
                                >
                                  More room options{" "}
                                  <span aria-hidden="true">→</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <aside className="hidden w-full min-w-0 xl:sticky xl:top-[106px] xl:block xl:h-fit">
            <section className="overflow-hidden rounded-[12px] border border-[#D0D5DD] bg-white px-3 py-3 shadow-[0_10px_35px_rgba(16,24,40,.08)] sm:px-4 sm:py-4">
              <div className="flex h-9 items-center overflow-hidden rounded-[12px] bg-[#FFF4EC] px-3 text-[10px] font-semibold text-[#FF5A00] sm:text-[11px]">
                <span
                  key={noticeIndex}
                  className="flex items-center gap-2 animate-[notice-slide_500ms_ease-out]"
                >
                  {noticeIndex !== 2 && (
                    <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#FF6B00] text-sm font-bold text-white">
                      ϟ
                    </span>
                  )}
                  <span>{notices[noticeIndex]}</span>
                </span>
              </div>

              {/* Price breakdown */}
              <div className="mt-3 rounded-xl border border-orange-100 bg-gradient-to-b from-orange-50/80 to-white p-4">
                {priceLoading && !hasPrice ? (
                  <>
                    <p className="text-[11px] font-semibold text-[#667085]">Starts from</p>
                    <p className="mt-1 text-[1.85rem] font-extrabold leading-none tracking-tight text-[#FF5A00]">
                      ₹{formatMoney(Math.round(tour.priceINR / 2))}<span className="ml-1 text-sm font-bold text-[#667085]">/Person</span>
                    </p>
                    <p className="mt-1.5 text-xs text-[#667085]">
                      Total Price ₹{formatMoney(tour.priceINR)}
                    </p>
                    <div className="mt-3 h-px bg-[#f0f2f5]" />
                    <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#eee]" />
                  </>
                ) : hasPrice ? (
                  <>
                    <div className="space-y-1.5 text-[12px]">
                      <div className="flex justify-between text-[#667085]">
                        <div>
                          <span>Base package</span>
                          {guestCount > 0 && (
                            <span className="block text-[10px] text-[#8b8fa3]">
                              ₹{formatMoney(Math.round(basePackagePrice / guestCount))} × {guestCount} {guestCount === 1 ? "guest" : "guests"}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-[#344054]">₹{formatMoney(basePackagePrice)}</span>
                      </div>
                      {hotelUpgrade > 0 && (
                        <div className="flex justify-between text-[#667085]">
                          <span>Hotel upgrade</span>
                          <span className="font-medium text-[#344054]">+₹{formatMoney(hotelUpgrade)}</span>
                        </div>
                      )}
                      {volvoBusCost > 0 && (
                        <div className="flex justify-between text-[#667085]">
                          <div>
                            <span>Volvo bus (return ticket)</span>
                          </div>
                          <span className="font-medium text-[#344054]">+₹{formatMoney(volvoBusCost)}</span>
                        </div>
                      )}
                      {cabUpgrade > 0 && (
                        <div className="flex justify-between text-[#667085]">
                          <span>Vehicle upgrade</span>
                          <span className="font-medium text-[#344054]">+₹{formatMoney(cabUpgrade)}</span>
                        </div>
                      )}
                      {activitiesTotal > 0 && (
                        <div className="flex justify-between text-[#667085]">
                          <span>Activities</span>
                          <span className="font-medium text-[#344054]">+₹{formatMoney(activitiesTotal)}</span>
                        </div>
                      )}
                      {addonsTotal > 0 && (
                        <div className="flex justify-between text-[#667085]">
                          <span>Add-ons</span>
                          <span className="font-medium text-[#344054]">+₹{formatMoney(addonsTotal)}</span>
                        </div>
                      )}
                      {gstResult && gstResult.total_gst > 0 && (
                        <div className="flex justify-between text-[#667085]">
                          <div>
                            <span>Fees &amp; Taxes</span>
                            <span className="block text-[10px] text-[#8b8fa3]">GST 5%</span>
                          </div>
                          <span className="font-medium text-[#344054]">+₹{formatMoney(gstResult.total_gst)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-dashed border-[#e0e0e0] pt-2 text-[13px] font-bold text-[#1a1a2e]">
                        <span>Total</span>
                        <span className="text-[#FF5A00]">₹{formatMoney(totalPrice)}</span>
                      </div>
                      {guestCount > 0 && (
                        <p className="text-right text-[10px] text-[#667085]">
                          <span className="font-bold text-[#344054]">
                            ₹{formatMoney(Math.round(totalPrice / guestCount))}
                          </span>{" "}
                          per person · {travellerLabel}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-[#667085]">Starts from</p>
                    <p className="mt-1 text-[1.85rem] font-extrabold leading-none tracking-tight text-[#FF5A00]">
                      ₹{formatMoney(Math.round(tour.priceINR / 2))}<span className="ml-1 text-sm font-bold text-[#667085]">/Person</span>
                    </p>
                    <p className="mt-1.5 text-xs text-[#667085]">
                      Total Price ₹{formatMoney(tour.priceINR)}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 border-b border-[#F2F4F7] py-3">
                <div className="flex w-[42%] shrink-0 items-center gap-2">
                  <CalendarDays className="h-7 w-7 shrink-0 text-[#FF5A00]" />
                  <div className="min-w-0">
                    <p className="whitespace-nowrap text-sm font-bold text-[#172033]">
                      {tour.durationNights} Nights / {tour.durationDays} Days
                    </p>
                    <p className="mt-1 whitespace-nowrap text-[10px] text-[#667085]">
                      Starting from: <b className="text-[#344054]">New Delhi</b>
                    </p>
                  </div>
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-4 text-center text-[10px] text-[#344054]">
                  <span className="border-l border-[#F2F4F7]">
                    <UtensilsCrossed className="mx-auto mb-1 h-4 w-4" />
                    Meal
                  </span>
                  <span className="border-l border-[#F2F4F7]">
                    <Hotel className="mx-auto mb-1 h-4 w-4" />
                    Hotel
                  </span>
                  <span className="border-l border-[#F2F4F7]">
                    <Car className="mx-auto mb-1 h-4 w-4" />
                    Cab
                  </span>
                  <span className="border-l border-[#F2F4F7]">
                    <Ticket className="mx-auto mb-1 h-4 w-4" />
                    Sightseeing
                  </span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-[#E4E7EC] p-3">
                <h3 className="text-sm font-bold text-[#344054]">
                  Customize your trip
                </h3>
                <p className="mt-1 text-xs text-[#667085]">
                  Change travel date &amp; travellers as per your comfort
                </p>
                <div className="mt-3">
                  <div className="relative">
                    <button
                      onClick={() => setDateOpen(true)}
                      className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#E4E7EC] px-3 text-left text-xs text-[#667085]"
                    >
                      <CalendarDays className="h-5 w-5 shrink-0 text-[#FF5A00]" />
                      <span className="truncate whitespace-nowrap">
                        {selectedTravelDate
                          ? travelDate(selectedTravelDate)
                          : "Select travel date"}
                      </span>
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 rotate-90" />
                    </button>
                    {dateOpen && (
                      <DatePickerPopover
                        checkIn={selectedTravelDate}
                        checkOut=""
                        onChange={(checkIn) => updateTravelDate(checkIn)}
                        onApply={() => setDateOpen(false)}
                        onClose={() => setDateOpen(false)}
                        compact
                        placement="top"
                        singleDate
                      />
                    )}
                  </div>
                  <div className="mt-2">
                    <TravellerSelector
                      rooms={travellerRooms}
                      onChange={onChangeTravellerRooms}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#FFF4EC] px-4 py-1.5 text-sm font-bold text-[#FF5A00]">
                  {hasBookingAmount ? <>Book with just ₹{formatMoney(bookingAmount)}</> : <>Request your tailored quote</>}{" "}
                  <span className="text-xl">›</span>
                </div>
              </div>
              <div className="mt-5">
                <button
                  onClick={onBook}
                  className="h-14 w-full rounded-xl bg-gradient-to-r from-[#FF7A18] to-[#FF5A00] text-base font-bold text-white shadow-[0_10px_22px_rgba(255,107,0,.2)] transition hover:-translate-y-0.5"
                >
                  Book Now
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBF8] px-1.5 py-2 text-[9px] whitespace-nowrap text-[#344054]">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#FF5A00]" />
                  <span>Best Price</span>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBF8] px-1.5 py-2 text-[9px] whitespace-nowrap text-[#344054]">
                  <Headphones className="h-5 w-5 shrink-0 text-[#FF5A00]" />
                  <span>24×7 Support</span>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBF8] px-1.5 py-2 text-[9px] whitespace-nowrap text-[#344054]">
                  <CircleCheck className="h-5 w-5 shrink-0 text-[#FF5A00]" />
                  <span>Secure Payments</span>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-[#667085]">
                <ShieldCheck className="mr-2 inline h-4 w-4" />
                Secure your slot with minimal booking amount
              </p>
            </section>
          </aside>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-100 bg-white/95 px-3 py-2.5 shadow-[0_-10px_30px_rgba(15,23,42,0.10)] backdrop-blur xl:hidden" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-500">Starts from</p>
            <p className="truncate text-base font-extrabold leading-tight text-[#172033]">₹{formatMoney(Math.round(tour.priceINR / 2))} <span className="text-[10px] font-medium text-slate-500">/Person · Total ₹{formatMoney(tour.priceINR)}</span></p>
          </div>
          <button
            type="button"
            onClick={onBook}
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a18] to-[#ef5a0a] px-5 text-sm font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(239,90,10,0.75)] active:scale-[0.98]"
          >
            Book this trip <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}