"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BedDouble,
  Check,
  ChevronRight,
  ChevronsDown,
  MapPin,
  Play,
  Search,
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
  HotelDateField,
  HotelRoomsGuestsField,
  localDateInputString,
  openNativeDatePicker,
} from "@/components/hotels/hotels-search-fields";
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

function DetailSearchStrip({
  hotelName,
  bookingContext,
  onApply,
}: {
  hotelName: string;
  bookingContext: HotelBookingQueryParams;
  onApply: (ctx: HotelBookingQueryParams) => void;
}) {
  const checkOutRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [checkInIso, setCheckInIso] = useState(bookingContext.check_in ?? "");
  const [checkOutIso, setCheckOutIso] = useState(bookingContext.check_out ?? "");
  const [rooms, setRooms] = useState(bookingContext.rooms ?? 1);
  const [guests, setGuests] = useState(bookingContext.guests ?? 2);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setCheckInIso(bookingContext.check_in ?? "");
      setCheckOutIso(bookingContext.check_out ?? "");
      setRooms(bookingContext.rooms ?? 1);
      setGuests(bookingContext.guests ?? 2);
    }
  }, [bookingContext, isEditing]);

  const checkInLabel = formatHotelDateFromIso(bookingContext.check_in ?? "");
  const checkOutLabel = formatHotelDateFromIso(bookingContext.check_out ?? "");
  const checkOutMin = checkInIso ? addDaysToIso(checkInIso, 1) : addDaysToIso(localDateInputString(today), 1);
  const roomsGuestsLabel = `${bookingContext.guests} Guest${bookingContext.guests !== 1 ? "s" : ""} in ${bookingContext.rooms} Room${bookingContext.rooms !== 1 ? "s" : ""}`;

  const enterEditMode = () => setIsEditing(true);

  const exitEditMode = () => {
    setIsEditing(false);
    setCheckInIso(bookingContext.check_in ?? "");
    setCheckOutIso(bookingContext.check_out ?? "");
    setRooms(bookingContext.rooms ?? 1);
    setGuests(bookingContext.guests ?? 2);
  };

  const handleApply = () => {
    onApply({
      check_in: checkInIso,
      check_out: checkOutIso,
      rooms,
      guests,
    });
    setIsEditing(false);
  };

  const hotelField = (
    <div className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 sm:rounded-none sm:border-0 sm:border-r sm:border-[#EEEEEE]">
      <p className="text-[10px] text-[#9E9E9E]">City name, Location or Specific hotel</p>
      <p className="mt-0.5 truncate text-[13px] font-semibold text-[#212121] sm:text-sm">{hotelName}</p>
    </div>
  );

  return (
    <section className="border-b border-[#90caf9] bg-[#e3f2fd] py-3">
      <form
        className="mx-auto flex w-full max-w-[1320px] flex-col gap-2 px-3 sm:flex-row sm:items-stretch sm:gap-0 sm:px-4 lg:px-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (isEditing) handleApply();
        }}
      >
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-0 sm:overflow-visible sm:rounded-l-md sm:border sm:border-[#bbdefb] sm:bg-white">
          {hotelField}

          {isEditing ? (
            <>
              <HotelDateField
                className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white sm:rounded-none sm:border-0 sm:border-r sm:border-[#EEEEEE]"
                label="Check-in"
                iso={checkInIso}
                minIso={localDateInputString(today)}
                onIsoChange={(iso) => {
                  setCheckInIso(iso);
                  setCheckOutIso((prev) => (!prev || prev <= iso ? addDaysToIso(iso, 1) : prev));
                }}
                onAfterSelect={() => {
                  requestAnimationFrame(() => openNativeDatePicker(checkOutRef.current));
                }}
              />
              <HotelDateField
                className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white sm:rounded-none sm:border-0 sm:border-r sm:border-[#EEEEEE]"
                label="Check-out"
                iso={checkOutIso}
                minIso={checkOutMin}
                inputRef={checkOutRef}
                onIsoChange={setCheckOutIso}
              />
              <HotelRoomsGuestsField
                className="overflow-visible rounded-lg border border-[#e0e0e0] bg-white sm:rounded-none sm:border-0"
                rooms={rooms}
                guests={guests}
                onRoomsChange={setRooms}
                onGuestsChange={setGuests}
              />
            </>
          ) : (
            [
              { label: "Check-in", value: checkInLabel.main, sub: checkInLabel.sub },
              { label: "Check-out", value: checkOutLabel.main, sub: checkOutLabel.sub },
              { label: "Rooms/Guests", value: roomsGuestsLabel },
            ].map((field, i) => (
              <div
                key={field.label}
                className={cn(
                  "rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 sm:rounded-none sm:border-0",
                  i < 2 && "sm:border-r sm:border-[#EEEEEE]",
                )}
              >
                <p className="text-[10px] text-[#9E9E9E]">{field.label}</p>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-[#212121] sm:text-sm">
                  {field.value}
                </p>
                {"sub" in field && field.sub ? (
                  <p className="truncate text-[11px] text-[#757575]">{field.sub}</p>
                ) : null}
              </div>
            ))
          )}
        </div>

        {isEditing ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={exitEditMode}
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#1976D2] bg-white px-5 py-2.5 text-sm font-semibold text-[#1976D2] transition hover:bg-[#E3F2FD] sm:rounded-none sm:px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-[#1976D2] bg-[#2196F3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1976D2] sm:rounded-none sm:rounded-r-md sm:px-6"
            >
              <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              Update
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={enterEditMode}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-[#1976D2] bg-[#2196F3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1976D2] sm:rounded-none sm:rounded-r-md sm:px-6"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            Modify Search
          </button>
        )}
      </form>
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

  return (
    <div
      id="photos"
      className="grid h-[min(320px,50vw)] min-h-[240px] grid-cols-1 gap-2 sm:grid-cols-[1.65fr_1fr] sm:gap-2.5"
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
        <button
          type="button"
          onClick={() => onOpenPhoto(indexOf(videoThumb))}
          className="group relative cursor-zoom-in overflow-hidden rounded-lg text-left sm:rounded-tr-xl"
        >
          <Image src={videoThumb} alt="" fill unoptimized className="object-cover" sizes="30vw" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#212121] shadow-md">
              <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
            </span>
            <span className="text-sm font-semibold">Videos({hotel.videoCount})</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenPhoto(indexOf(roomImg))}
          className="group relative cursor-zoom-in overflow-hidden rounded-lg text-left sm:rounded-br-xl"
        >
          <Image src={roomImg} alt="" fill unoptimized className="object-cover" sizes="30vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 text-white">
            <span className="text-sm font-semibold">Room({hotel.roomPhotoCount})</span>
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </div>
        </button>
      </div>
    </div>
  );
}

function BookingSummary({
  hotel,
  onViewRooms,
}: {
  hotel: HotelListing;
  selection: RoomSelection | null;   // kept in signature so callers don't break
  onViewRooms: () => void;
}) {
  return (
    <div className="space-y-3 lg:sticky lg:top-24">
      {/* Always show simple CTA — full summary is inside each room card */}
      <div className="rounded-xl border border-[#e0e0e0] bg-white shadow-sm">
        <div className="border-b border-[#eee] px-4 py-3">
          <h2 className="text-[15px] font-bold text-[#212121]">Booking Summary</h2>
        </div>
        <div className="px-4 py-5 text-center">
          <p className="text-[13px] font-semibold text-[#212121]">
            ₹ {formatInrAmount(hotel.price)}
            <span className="text-[11px] font-normal text-[#757575]"> / night</span>
          </p>
          <p className="mt-1 text-[12px] text-[#757575]">Select a room below to see full pricing</p>
          <button
            type="button"
            onClick={onViewRooms}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#EF6614] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E65100]"
          >
            View Room Options
            <ChevronsDown className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
        )
      </div>

      {/* Why book with us */}
      <div className="rounded-xl border border-[#e0e0e0] bg-[#f8f9ff] px-4 py-3">
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#212121]">
          <ShieldCheck className="h-4 w-4 text-[#EF6614]" aria-hidden />
          Why book with us?
        </p>
        <ul className="mt-2 space-y-1">
          {["Best Price Guaranteed", "Instant Confirmation", "Safe & Secure Payments", "24x7 Customer Support"].map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-[11px] text-[#424242]">
              <Check className="h-3 w-3 shrink-0 text-[#2E7D32]" strokeWidth={2.5} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
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

  const paramsContext = useMemo(
    () => parseBookingContextFromParams(searchParams),
    [searchParams],
  );
  const [bookingContext, setBookingContext] = useState<HotelBookingQueryParams>(paramsContext);

  useEffect(() => {
    setBookingContext(paramsContext);
  }, [paramsContext]);

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
      document.getElementById("hotel-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

        <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <nav
            className="mb-3 flex flex-wrap items-center gap-1 text-[12px] text-[#2196F3]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <Link href="/hotels" className="hover:underline">
              Hotels
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <Link href={listingHref} className="hover:underline">
              Hotels in {city.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
            <span className="font-medium text-[#212121]">{hotel.name}</span>
          </nav>

          <div className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#EF6614]">UNO Stays</p>
            <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-[#212121] sm:text-2xl">{hotel.name}</h1>
                  <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} stars`}>
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                    ))}
                  </span>
                </div>
                <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[13px] text-[#616161]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#757575]" aria-hidden />
                  <span>{hotel.area}, {city.name}</span>
                  <span className="text-[#BDBDBD]">|</span>
                  <span>{hotel.nearbyLandmark}</span>
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-[#2196F3]/40"
                >
                  <span className="relative block h-10 w-14 overflow-hidden rounded bg-neutral-200">
                    <Image
                      src={hotel.images[0]!}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="56px"
                    />
                  </span>
                  <span className="text-[12px] font-semibold text-[#2196F3]">View Map</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#008009] px-2 py-1 text-sm font-bold text-white">
                    {hotel.rating.toFixed(1)}/5
                  </span>
                  <button
                    type="button"
                    onClick={scrollToReviews}
                    className="text-[12px] font-semibold text-[#2196F3] hover:underline"
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
            <div className="min-w-0 flex-1">
              <DetailGallery hotel={hotel} photos={allPhotos} onOpenPhoto={openPhoto} />
            </div>
            <div className="w-full shrink-0 lg:w-[300px] xl:w-[320px]">
              <BookingSummary
                hotel={hotel}
                selection={roomSelection}
                onViewRooms={scrollToRooms}
              />
            </div>
          </div>

          <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
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
          className="fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#2196F3] text-lg text-white shadow-lg transition hover:bg-[#1976D2] sm:right-6"
          aria-label="Scroll to top"
        >
          ↑
        </button>
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