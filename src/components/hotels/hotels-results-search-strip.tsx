"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Calendar, Clock, ShieldCheck, Users, Zap } from "lucide-react";
import { HotelSearchLoadingOverlay } from "@/components/hotels/hotel-search-loading-overlay";
import {
  addDaysToIso,
  formatHotelDateFromIso,
  HotelDateField,
  HotelRoomsGuestsField,
  localDateInputString,
  openNativeDatePicker,
} from "@/components/hotels/hotels-search-fields";
import {
  HotelLocationField,
  reverseGeocodeCity,
} from "@/components/hotels/hotels-location-field";
import {
  HOTEL_INNER_BANNER_IMAGE,
  matchHotelDestinationFromList,
  type HotelCity,
  type HotelDestinationOption,
} from "@/lib/hotels-catalog";
import { PARTNER_PORTAL_URL } from "@/lib/constants";
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

function ReadonlyField({
  icon,
  label,
  value,
  sub,
  action,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full min-w-0 items-start gap-3 px-4 py-3.5 sm:px-5 sm:py-4", className)}>
      <span className="mt-0.5 shrink-0 text-[#757575]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] text-[#9E9E9E]">{label}</span>
        <span className="mt-1 block truncate text-[15px] font-bold leading-tight text-[#212121] sm:text-[16px]">
          {value}
        </span>
        {sub && <span className="mt-0.5 block truncate text-xs text-[#757575]">{sub}</span>}
        {action}
      </span>
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
  const checkOutRef  = useRef<HTMLInputElement>(null);

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

  const [isEditing,    setIsEditing]    = useState(false);
  const [cityName,     setCityName]     = useState(city.name);
  const [country,      setCountry]      = useState("");
  const [selectedSlug, setSelectedSlug] = useState(city.slug);
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
  const [rooms,  setRooms]  = useState(() => { const n = parseInt(searchParams.get("rooms")  ?? "1", 10); return Number.isFinite(n) && n > 0 ? n : 1; });
  const [guests, setGuests] = useState(() => { const n = parseInt(searchParams.get("guests") ?? "2", 10); return Number.isFinite(n) && n > 0 ? n : 2; });

  const checkOutMin  = checkInIso ? addDaysToIso(checkInIso, 1) : addDaysToIso(localDateInputString(today), 1);
  const fieldDivider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";
  const checkInFmt   = formatHotelDateFromIso(checkInIso);
  const checkOutFmt  = formatHotelDateFromIso(checkOutIso);

  useEffect(() => { setCityName(city.name); setSelectedSlug(city.slug); }, [city.name, city.slug]);

  useEffect(() => {
    const img = new window.Image();
    img.src = HOTEL_INNER_BANNER_IMAGE;
    if (img.complete) { setBannerLoaded(true); return; }
    img.onload  = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const enterEditMode = () => {
    setIsEditing(true);
    setSearchError(null);
    setNearMeError(null);
    requestAnimationFrame(() => { cityInputRef.current?.focus(); cityInputRef.current?.select(); });
  };

  const exitEditMode = () => {
    setIsEditing(false);
    setSearchError(null);
    setNearMeError(null);
    setCityName(city.name);
    setSelectedSlug(city.slug);
    setNearMeActive(false);
  };

  const handleCityChange = (value: string) => {
    setCityName(value); setSelectedSlug(""); setNearMeActive(false); setNearMeError(null); setSearchError(null);
  };

  const handleSelectDestination = (dest: HotelDestinationOption) => {
    setCityName(dest.city); setCountry(dest.country); setSelectedSlug(dest.slug); setNearMeActive(false); setSearchError(null);
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
          if (match) { setCityName(match.city); setCountry(match.country); setSelectedSlug(match.slug); }
          else        { setCityName(resolvedCity); setCountry(resolvedCountry); setSelectedSlug(""); }
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
    const match =
      (selectedSlug
        ? destinations.find((d) => d.slug === selectedSlug) ??
          ({ slug: selectedSlug, city: cityName, country: country || "India" } as HotelDestinationOption)
        : null) ?? matchHotelDestinationFromList(cityName, destinations);

    if (!match) { setSearchError("Please select a city from the list"); return; }

    const fullLocation = match.state && match.country
      ? `${match.city}, ${match.state}, ${match.country}`
      : match.country
        ? `${match.city}, ${match.country}`
        : city.fullLocation;

    await onSearch({ slug: match.slug, city: match.city, country: match.country, fullLocation, check_in: checkInIso, check_out: checkOutIso, rooms, guests });
    setIsEditing(false);
    setSearchError(null);
  };

  return (
    <section
      className={cn("relative isolate w-full overflow-hidden", className)}
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
          onSubmit={(e) => { e.preventDefault(); if (isEditing && !searching) void handleSubmitSearch(); }}
        >
          {searching && <HotelSearchLoadingOverlay />}
          <div className={cn("flex w-full flex-col sm:flex-row sm:items-stretch", searching && "pointer-events-none select-none opacity-60")}>
            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">

              {/* Location field */}
              {isEditing ? (
                <HotelLocationField
                  className={cn(fieldDivider, "sm:flex-[1.4]")}
                  city={cityName}
                  country={country}
                  destinations={destinations}
                  nearMeActive={nearMeActive}
                  nearMeLoading={nearMeLoading}
                  nearMeError={nearMeError}
                  searchError={searchError}
                  onCityChange={handleCityChange}
                  onSelectDestination={handleSelectDestination}
                  onNearMe={handleNearMe}
                  inputRef={cityInputRef}
                  showNearMe={destinations.length > 0}
                />
              ) : (
                <ReadonlyField
                  className={cn(fieldDivider, "sm:min-w-[200px] sm:flex-[1.4] sm:basis-0")}
                  icon={<Building2 className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                  label="Location"
                  value={city.fullLocation}
                  action={
                    <button
                      type="button"
                      onClick={enterEditMode}
                      className="mt-1 block text-xs font-semibold text-primary hover:underline"
                    >
                      Change location
                    </button>
                  }
                />
              )}

              {/* Date + Rooms fields */}
              {isEditing ? (
                <>
                  <HotelDateField
                    className={cn(fieldDivider, "sm:min-w-[110px] sm:flex-1 sm:basis-0")}
                    label="Check-In"
                    iso={checkInIso}
                    minIso={localDateInputString(today)}
                    onIsoChange={(iso) => { setCheckInIso(iso); setCheckOutIso((p) => (!p || p <= iso ? addDaysToIso(iso, 1) : p)); }}
                    onAfterSelect={() => requestAnimationFrame(() => openNativeDatePicker(checkOutRef.current))}
                  />
                  <HotelDateField
                    className={cn(fieldDivider, "sm:min-w-[110px] sm:flex-1 sm:basis-0")}
                    label="Check-Out"
                    iso={checkOutIso}
                    minIso={checkOutMin}
                    inputRef={checkOutRef}
                    onIsoChange={setCheckOutIso}
                  />
                  <HotelRoomsGuestsField
                    className="sm:min-w-[130px] sm:flex-1 sm:basis-0"
                    rooms={rooms}
                    guests={guests}
                    onRoomsChange={setRooms}
                    onGuestsChange={setGuests}
                  />
                </>
              ) : (
                <>
                  <ReadonlyField
                    className={cn(fieldDivider, "sm:min-w-[120px] sm:flex-1 sm:basis-0")}
                    icon={<Calendar className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                    label="Check-in"
                    value={checkInFmt.main}
                    sub={checkInFmt.sub}
                  />
                  <ReadonlyField
                    className={cn(fieldDivider, "sm:min-w-[120px] sm:flex-1 sm:basis-0")}
                    icon={<Calendar className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                    label="Check-out"
                    value={checkOutFmt.main}
                    sub={checkOutFmt.sub}
                  />
                  <ReadonlyField
                    className="sm:min-w-[130px] sm:flex-1 sm:basis-0"
                    icon={<Users className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                    label="Rooms & Guests"
                    value={`${rooms} Room, ${guests} Guests`}
                  />
                </>
              )}
            </div>

            {/* Action button */}
            {isEditing ? (
              <div className="flex flex-col gap-2 border-t border-[#EEEEEE] p-3 sm:flex-row sm:items-stretch sm:border-t-0 sm:p-0">
                <button
                  type="button"
                  onClick={exitEditMode}
                  disabled={searching}
                  className="flex h-11 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white px-5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-60 sm:m-4 sm:h-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={searching}
                  className="flex h-[52px] shrink-0 items-center justify-center rounded-xl bg-primary px-6 text-[15px] font-bold tracking-wide text-white transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-80 sm:m-3 sm:h-auto sm:min-h-[60px] sm:w-[128px] sm:rounded-xl sm:px-0 lg:w-[136px]"
                >
                  {searching ? "Searching…" : "SEARCH"}
                </button>
              </div>
            ) : (
              <div className="flex items-center p-3 sm:p-4">
                <button
                  type="button"
                  onClick={enterEditMode}
                  className="flex h-12 w-full shrink-0 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold tracking-wide text-white shadow-[0_4px_16px_-4px_rgba(234,88,12,0.5)] transition hover:bg-primary/90 sm:w-[148px] sm:rounded-xl"
                >
                  Modify Search
                </button>
              </div>
            )}
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
