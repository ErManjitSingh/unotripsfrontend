"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarRange, Clock, ShieldCheck, Zap } from "lucide-react";
import { HotelSearchLoadingOverlay } from "@/components/hotels/hotel-search-loading-overlay";
import {
  addDaysToIso,
  formatHotelDateFromIso,
  HotelRoomsGuestsField,
  localDateInputString,
} from "@/components/hotels/hotels-search-fields";
import {
  HotelLocationField,
  reverseGeocodeCity,
} from "@/components/hotels/hotels-location-field";
import { DatePickerPopover } from "@/components/hotels/hotel-date-range-picker";
import {
  HOTEL_INNER_BANNER_IMAGE,
  findHotelLocality,
  matchHotelDestinationFromList,
  type HotelCity,
  type HotelDestinationOption,
  type HotelLocalityOption,
} from "@/lib/hotels-catalog";
import { PARTNER_PORTAL_URL } from "@/lib/constants";
import { fetchHotelLocalities } from "@/services/hotels";
import { cn } from "@/lib/utils";

export type HotelModifySearchPayload = {
  slug: string;
  city: string;
  country: string;
  fullLocation: string;
  check_in: string;
  check_out: string;
  rooms: number;
  guests: number;
  q?: string;
};

type HotelsResultsSearchStripProps = {
  city: HotelCity;
  destinations?: HotelDestinationOption[];
  searching?: boolean;
  onSearch: (payload: HotelModifySearchPayload) => void | Promise<void>;
  className?: string;
};

const TRUST_BADGES = [
  { icon: ShieldCheck, title: "Lowest Price Guarantee", sub: "We'll match the price"  },
  { icon: Zap,         title: "Last Minute Deals",      sub: "Great savings"           },
  { icon: Clock,       title: "Free Cancellation",      sub: "On most rooms"           },
] as const;

function DateRangeField({
  checkInIso,
  checkOutIso,
  todayIso,
  onChange,
  className,
}: {
  checkInIso: string;
  checkOutIso: string;
  todayIso: string;
  onChange: (checkIn: string, checkOut: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const checkInFmt = formatHotelDateFromIso(checkInIso);
  const checkOutFmt = formatHotelDateFromIso(checkOutIso);

  return (
    <div className={cn("relative min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-[76px] w-full min-w-0 items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:min-h-[80px] sm:px-5 sm:py-4"
      >
        <CalendarRange className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-normal leading-tight text-[#9E9E9E]">Check-in / Check-out</span>
          <span className="mt-1 block truncate text-[17px] font-bold leading-tight text-[#212121]">
            {checkInFmt.main}
            <span className="mx-1 text-[#9E9E9E]">→</span>
            {checkOutFmt.main}
          </span>
          <span className="mt-0.5 block truncate text-xs font-normal text-[#757575]">
            {checkInFmt.sub || "Start date"}{" "}
            <span className="text-[#BDBDBD]">•</span>{" "}
            {checkOutFmt.sub || "End date"}
          </span>
        </span>
      </button>

      {open ? (
        <DatePickerPopover
          checkIn={checkInIso}
          checkOut={checkOutIso}
          onChange={(ci, co) => {
            onChange(ci || todayIso, co || (ci ? addDaysToIso(ci, 1) : ""));
            if (ci && co) {
              setOpen(false);
            }
          }}
          onApply={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

export function HotelsResultsSearchStrip({
  city,
  destinations = [],
  searching = false,
  onSearch,
  className,
}: HotelsResultsSearchStripProps) {
  const searchParams = useSearchParams();
  const cityInputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const checkInDefault = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return localDateInputString(d);
  }, [today]);

  const [cityName,     setCityName]     = useState(city.name);
  const [country,      setCountry]      = useState("");
  const [selectedSlug, setSelectedSlug] = useState(city.slug);
  const [searchLocation, setSearchLocation] = useState(searchParams.get("q") || "");
  const [nearMeActive,  setNearMeActive]  = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError,   setNearMeError]   = useState<string | null>(null);
  const [searchError,   setSearchError]   = useState<string | null>(null);
  const [bannerLoaded,  setBannerLoaded]  = useState(false);

  const [checkInIso, setCheckInIso] = useState(
    () => searchParams.get("check_in") || checkInDefault,
  );
  const [checkOutIso, setCheckOutIso] = useState(() => {
    const fromUrl = searchParams.get("check_out");
    if (fromUrl) return fromUrl;
    const ci = searchParams.get("check_in") || checkInDefault;
    return addDaysToIso(ci, 1);
  });
  const searchParamQ = searchParams.get("q") || "";
  const initialGuests = (() => {
    const n = parseInt(searchParams.get("guests") ?? "2", 10);
    return Number.isFinite(n) && n > 0 ? n : 2;
  })();
  const initialRooms = (() => {
    const n = parseInt(searchParams.get("rooms") ?? "1", 10);
    const requestedRooms = Number.isFinite(n) && n > 0 ? n : 1;
    return Math.max(requestedRooms, Math.ceil(initialGuests / 2));
  })();
  const [rooms, setRooms] = useState(initialRooms);
  const [guests, setGuests] = useState(initialGuests);

  const updateGuests = (nextGuests: number) => {
    const guestsCount = Math.max(1, Math.min(20, nextGuests));
    setGuests(guestsCount);
    setRooms((currentRooms) => Math.max(currentRooms, Math.ceil(guestsCount / 2)));
  };

  const updateRooms = (nextRooms: number) => {
    const roomsCount = Math.max(1, Math.min(8, nextRooms));
    setRooms(roomsCount);
    setGuests((currentGuests) => Math.min(currentGuests, roomsCount * 2));
  };

  const { data: fetchedLocalities } = useQuery({
    queryKey: ["hotels", "search-localities"],
    queryFn: () => fetchHotelLocalities(),
    staleTime: 10 * 60 * 1000,
  });
  const effectiveLocalities = fetchedLocalities ?? [];

  const fieldDivider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";

  useEffect(() => {
    setCityName(city.name);
    setCountry(city.country ?? "");
    setSelectedSlug(city.slug);
    setSearchLocation(searchParamQ);
  }, [city.name, city.country, city.slug, searchParamQ]);

  useEffect(() => {
    const img = new window.Image();
    img.src = HOTEL_INNER_BANNER_IMAGE;
    if (img.complete) { setBannerLoaded(true); return; }
    img.onload  = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const handleCityChange = (value: string) => {
    setCityName(value); setSelectedSlug(""); setSearchLocation(value); setNearMeActive(false); setNearMeError(null); setSearchError(null);
  };

  const handleSelectDestination = (dest: HotelDestinationOption) => {
    setCityName(dest.city); setCountry(dest.country); setSelectedSlug(dest.slug); setSearchLocation(""); setNearMeActive(false); setSearchError(null);
  };

  const handleSelectLocality = (locality: HotelLocalityOption) => {
    setCityName(locality.name);
    setCountry(`${locality.city}, ${locality.country}`);
    setSelectedSlug(locality.citySlug);
    setSearchLocation(locality.name);
    setNearMeActive(false);
    setSearchError(null);
  };

  const handleNearMe = () => {
    setNearMeError(null);
    setSearchError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) { setNearMeError("Location not supported on this device"); return; }
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { city: resolvedCity, country: resolvedCountry } = await reverseGeocodeCity(position.coords.latitude, position.coords.longitude);
          const match = matchHotelDestinationFromList(resolvedCity, destinations);
          if (match) { setCityName(match.city); setCountry(match.country); setSelectedSlug(match.slug); setSearchLocation(""); }
          else        { setCityName(resolvedCity); setCountry(resolvedCountry); setSelectedSlug(""); setSearchLocation(resolvedCity); }
          setNearMeActive(true);
        } catch {
          setNearMeError("Unable to detect city. Try again."); setNearMeActive(false);
        } finally {
          setNearMeLoading(false);
        }
      },
      (error) => {
        setNearMeLoading(false); setNearMeActive(false);
        if (error.code === error.PERMISSION_DENIED) setNearMeError("Allow location access to use Near Me");
        else if (error.code === error.TIMEOUT)      setNearMeError("Location timed out. Try again.");
        else                                        setNearMeError("Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  const handleSubmitSearch = async () => {
    setSearchError(null);
    const localQuery = cityName.trim().toLowerCase();
    const typedSlug = cityName.trim().toLowerCase().replace(/\s+/g, "-");
    const isExactCity = destinations.some(
      (d) => d.city.toLowerCase() === localQuery || d.slug === typedSlug,
    );
    const locality =
      effectiveLocalities.find(
        (item) =>
          item.name.toLowerCase() === localQuery ||
          item.slug === typedSlug ||
          `${item.name} ${item.city}`.toLowerCase() === localQuery,
      ) ?? (isExactCity ? null : findHotelLocality(cityName));
    const match =
      (selectedSlug
        ? destinations.find((d) => d.slug === selectedSlug) ??
          ({ slug: selectedSlug, city: cityName, country: country || "India" } as HotelDestinationOption)
        : null) ?? matchHotelDestinationFromList(locality?.city ?? cityName, destinations);

    if (!match) { setSearchError("Please select a city from the list"); return; }

    const finalCheckIn = checkInIso || checkInDefault;
    const finalCheckOut = checkOutIso || addDaysToIso(finalCheckIn, 1);
    const q = searchLocation.trim() || (locality ? locality.name : undefined);
    const fullLocation = match.state && match.country
      ? `${match.city}, ${match.state}, ${match.country}`
      : match.country
        ? `${match.city}, ${match.country}`
        : city.fullLocation;

    await onSearch({ slug: match.slug, city: match.city, country: match.country, fullLocation, check_in: finalCheckIn, check_out: finalCheckOut, rooms, guests, q });
    setSearchError(null);
  };

  return (
    <section
      className={cn("relative isolate w-full overflow-visible", className)}
      style={{ minHeight: "400px" }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HOTEL_INNER_BANNER_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className={cn("object-cover object-center transition-opacity duration-500", bannerLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setBannerLoaded(true)}
          onError={() => setBannerLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70" aria-hidden />
        {!bannerLoaded && <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden />}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-8 pt-[100px] sm:px-6 sm:pt-[110px] lg:px-8">

        {/* Hero headline */}
        <div className="mb-6">
          <h1 className="text-3xl font-black leading-[1.18] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-4xl md:text-[2.75rem]">
            Find the perfect stay<br />
            <span className="text-amber-400">in {city.name}</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-white/75 drop-shadow-md sm:text-[15px]">
            Comfortable stays. Best prices. Verified hotels.
          </p>
        </div>

        {/* Search card */}
        <form
          className="relative z-10 w-full overflow-visible rounded-2xl bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.45),0_4px_16px_rgba(0,0,0,0.12)]"
          role="search"
          aria-busy={searching}
          onSubmit={(e) => { e.preventDefault(); if (!searching) void handleSubmitSearch(); }}
        >
          {searching && <HotelSearchLoadingOverlay />}
          <div className={cn("flex w-full flex-col sm:flex-row sm:items-stretch", searching && "pointer-events-none select-none opacity-60")}>
            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">
              <HotelLocationField
                className={cn(fieldDivider, "sm:flex-[1.45]")}
                city={cityName}
                country={country}
                destinations={destinations}
                localities={fetchedLocalities}
                nearMeActive={nearMeActive}
                nearMeLoading={nearMeLoading}
                nearMeError={nearMeError}
                searchError={searchError}
                onCityChange={handleCityChange}
                onSelectDestination={handleSelectDestination}
                onSelectLocality={handleSelectLocality}
                onNearMe={handleNearMe}
                inputRef={cityInputRef}
                showNearMe={destinations.length > 0}
              />

              <DateRangeField
                className={cn(fieldDivider, "sm:flex-[1.2]")}
                checkInIso={checkInIso || checkInDefault}
                checkOutIso={checkOutIso || addDaysToIso(checkInIso || checkInDefault, 1)}
                todayIso={checkInDefault}
                onChange={(ci, co) => {
                  setCheckInIso(ci);
                  setCheckOutIso(co || addDaysToIso(ci, 1));
                  setSearchError(null);
                }}
              />

              <HotelRoomsGuestsField
                className="sm:flex-[0.9]"
                rooms={rooms}
                guests={guests}
                onRoomsChange={updateRooms}
                onGuestsChange={updateGuests}
              />
            </div>

            {/* Action button */}
            <div className="flex items-center p-3 sm:p-4">
              <button
                type="submit"
                disabled={searching}
                aria-label={searching ? "Searching" : "Search hotels"}
                className="flex h-12 w-full shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold tracking-wide text-white shadow-[0_4px_16px_-4px_rgba(234,88,12,0.5)] transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-80 sm:h-[60px] sm:w-[60px] sm:rounded-2xl sm:px-0"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                <span className="sr-only">{searching ? "Searching" : "Search hotels"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Trust badges */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[13px] font-bold leading-tight text-white">{title}</p>
                  <p className="text-[11px] leading-tight text-white/65">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href={PARTNER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-transparent px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/15"
          >
            List Your Hotel For Free
          </a>
        </div>
      </div>
    </section>
  );
}
