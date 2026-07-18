"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  BookOpen,
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
  selectedHotels: number[];
  selectedCab: number;
  onBook: () => void;
  onViewBrochure: () => void;
  onEnquire: () => void;
  onChangeHotel: (index: number) => void;
  onChangeRoom: (index: number) => void;
  onChangeCab: () => void;
  onChangeTravellers: (adults: number) => void;
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
  onBook,
  onViewBrochure,
  onEnquire,
  onChangeHotel,
  onChangeRoom,
  onChangeCab,
  onChangeTravellers,
  onChangeDate,
}: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [selectedTravelDate, setSelectedTravelDate] = useState(
    initialDate ?? "",
  );
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [topDateOpen, setTopDateOpen] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [journeyImagesReady, setJourneyImagesReady] = useState(false);
  const itinerary = tour.itinerary ?? [];
  const packageTitle = displayPackageTitle(tour.title);
  // Room configuration is owned by PackageDetailView. Deriving the count
  // here avoids keeping a second, temporarily stale traveller state.
  const travellerCount = Number(roomsLabel.match(/(\d+)\s+Adult/i)?.[1] ?? 1);
  const changeTravellerCount = (next: number) => {
    onChangeTravellers(Math.max(1, Math.min(12, next)));
  };
  const heroImages = images.length ? images : [tour.image].filter(Boolean);
  const heroImage = heroImages[imageIndex] ?? tour.image;
  const nights = tour.durationNights || Math.max(1, itinerary.length - 1);
  const getStayForDay = (day: number) => {
    let startDay = 1;

    for (let index = 0; index < hotelGroups.length; index += 1) {
      const group = hotelGroups[index];
      const stayNights = Math.max(1, Number(group?.nights) || 1);

      if (day >= startDay && day < startDay + stayNights) {
        return { group, index };
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
          (group, index) => group?.opts?.[selectedHotels[index] ?? 0]?.img,
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
  const travellerLabel = `${travellerCount} Adult${travellerCount === 1 ? "" : "s"}`;
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
      <section className="sticky top-0 z-30 hidden pb-2.5 sm:block">
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
              <div className="relative min-w-0 flex-[1.05]">
                <button
                  type="button"
                  onClick={() => setTravellersOpen((open) => !open)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50/45 sm:px-5"
                >
                  <Users
                    className="h-4 w-4 shrink-0 text-[#737b88]"
                    strokeWidth={1.75}
                  />
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">
                      No. of travellers
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] font-bold leading-tight text-[#20242c]">
                      {travellerLabel}
                    </span>
                  </span>
                </button>
                {travellersOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex items-center justify-between gap-5">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Adults
                        </p>
                        <p className="text-xs text-slate-500">Age 12+</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Remove adult"
                          onClick={() => changeTravellerCount(travellerCount - 1)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-slate-300 text-lg"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold">
                          {travellerCount}
                        </span>
                        <button
                          type="button"
                          aria-label="Add adult"
                          onClick={() => changeTravellerCount(travellerCount + 1)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-primary text-lg text-primary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravellersOpen(false)}
                      className="mt-4 w-full rounded-lg bg-primary py-2 text-sm font-bold text-white"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex min-w-[185px] items-center border-l border-[#ECEEF2] px-5 py-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">
                  Total price
                </p>
                <p className="mt-0.5 text-[14px] font-bold leading-tight text-[#20242c]">
                  ₹{formatMoney(totalPrice)}{" "}
                  <span className="text-xs font-medium text-slate-500">
                    for {travellerCount} adult{travellerCount === 1 ? "" : "s"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-[#ECEEF2] p-3">
              <button
                type="button"
                onClick={onEnquire}
                className="h-11 rounded-xl border border-primary px-5 text-[13px] font-bold text-primary transition hover:bg-orange-50"
              >
                Enquire Now
              </button>
              <button
                type="button"
                onClick={onBook}
                className="h-11 rounded-xl bg-[#ef5a0a] px-6 text-[13px] font-bold text-white shadow-[0_8px_16px_-8px_rgba(239,90,10,0.72)] transition hover:bg-[#d94d04]"
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
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">
                    {tour.rating.toFixed(1)}{" "}
                    <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </span>
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Your trip, your way</p>
                  <h2 className="mt-1 text-base font-extrabold text-[#172033]">Pick a date and you&apos;re ready</h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold text-slate-500">total</p>
                  <p className="text-lg font-extrabold leading-none text-primary">₹{formatMoney(totalPrice)}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">for {travellerCount} adult{travellerCount === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTravellersOpen((open) => !open)}
                    className="flex min-h-14 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left"
                  >
                    <Users className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Travellers</span>
                      <span className="mt-0.5 block truncate text-xs font-bold text-slate-700">{travellerLabel}</span>
                    </span>
                  </button>
                  {travellersOpen && (
                    <div className="absolute right-0 top-full z-40 mt-2 w-[250px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div><p className="text-sm font-bold text-slate-800">Adults</p><p className="text-xs text-slate-500">Age 12+</p></div>
                        <div className="flex items-center gap-3">
                          <button type="button" aria-label="Remove adult" onClick={() => changeTravellerCount(travellerCount - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-lg">−</button>
                          <span className="w-5 text-center font-bold">{travellerCount}</span>
                          <button type="button" aria-label="Add adult" onClick={() => changeTravellerCount(travellerCount + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-primary text-lg text-primary">+</button>
                        </div>
                      </div>
                      <button type="button" onClick={() => setTravellersOpen(false)} className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-bold text-white">Done</button>
                    </div>
                  )}
                </div>
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
                        selectedHotels[stayForDay.index] ?? 0
                      ];

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
                            <div className="flex flex-col gap-4 sm:min-h-[156px] sm:flex-row sm:gap-5">
                              <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-56">
                                <Image
                                  src={dayHotel.img ?? heroImage}
                                  alt={dayHotel.name ?? "Hotel"}
                                  fill
                                  className="object-cover"
                                  sizes="(min-width: 640px) 224px, 100vw"
                                />
                              </div>
                              <div className="min-w-0 flex-1 pb-1 sm:py-2 sm:pr-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                                      {index === 0
                                        ? "Your first stay"
                                        : "Your stay"}
                                    </p>
                                    <h4 className="mt-1 text-base font-extrabold text-[#172033]">
                                      {dayHotel.name}
                                    </h4>
                                    <div className="mt-2 flex">
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
                                    </div>
                                    <span className="mt-1 text-[11px] font-medium text-slate-500">
                                      (128 reviews)
                                    </span>
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
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2F4F7] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    <UtensilsCrossed className="h-3.5 w-3.5 text-slate-500" />
                                    Breakfast & Dinner
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2F4F7] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    <BedDouble className="h-3.5 w-3.5 text-slate-500" />
                                    Deluxe Room
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onChangeRoom(stayForDay.index)}
                                  className="mt-2 text-xs font-bold text-primary"
                                >
                                  Change room
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
              <div className="relative mt-3 h-[140px] overflow-hidden rounded-[12px] border border-[#D0D5DD]">
                {heroImage && (
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    className="object-cover object-right"
                    sizes="704px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-[38%] to-transparent" />
                <div className="relative z-10 max-w-[52%] px-5 pt-4 xl:max-w-[88%]">
                  <p className="text-sm font-semibold text-[#667085]">
                    Total price
                  </p>
                  <p className="mt-1 whitespace-nowrap text-[3rem] font-extrabold leading-none tracking-[-.05em] text-[#FF5A00] xl:text-[2.45rem]">
                    ₹{formatMoney(totalPrice)}{" "}
                    <span className="text-base font-semibold tracking-normal text-[#667085]">
                      / {travellerCount} adult{travellerCount === 1 ? "" : "s"}
                    </span>
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-[12px] bg-[#FFF0E6] px-3 py-2 text-sm font-semibold text-[#344054]">
                    <Users className="h-4 w-4 text-[#FF5A00]" />
                    Per person
                  </div>
                </div>
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
                  Change travel date & rooms as per your comfort
                </p>
                <div className="mt-3 flex gap-3">
                  <div className="relative min-w-0 flex-1">
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
                  <button
                    onClick={() => setDateOpen(true)}
                    className="h-10 rounded-xl border border-[#E4E7EC] px-5 text-sm font-bold text-[#FF5A00]"
                  >
                    Modify
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#FFF4EC] px-4 py-1.5 text-sm font-bold text-[#FF5A00]">
                  {hasBookingAmount ? <>Book with just ₹{formatMoney(bookingAmount)}</> : <>Request your tailored quote</>}{" "}
                  <span className="text-xl">›</span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <button
                  onClick={onEnquire}
                  className="h-14 rounded-xl border border-[#FF5A00] bg-white text-base font-bold text-[#FF5A00] transition hover:bg-[#FFF4EC]"
                >
                  Enquire Now
                </button>
                <button
                  onClick={onBook}
                  className="h-14 rounded-xl bg-gradient-to-r from-[#FF7A18] to-[#FF5A00] text-base font-bold text-white shadow-[0_10px_22px_rgba(255,107,0,.2)] transition hover:-translate-y-0.5"
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
            <p className="text-[10px] font-semibold text-slate-500">{hasBookingAmount ? "Reserve today" : "Plan with UNO"}</p>
            <p className="truncate text-base font-extrabold leading-tight text-[#172033]">{hasBookingAmount ? <>₹{formatMoney(bookingAmount)} <span className="text-[10px] font-medium text-slate-500">booking amount</span></> : <>Tailored quote available</>}</p>
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
