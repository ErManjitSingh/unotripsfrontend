"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Zap, Clock } from "lucide-react";
import { HotelSearchLoadingOverlay } from "@/components/hotels/hotel-search-loading-overlay";
import {
  addDaysToIso,
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
  hotelResultsHref,
  matchHotelDestinationFromList,
  slugifyCityName,
  type HotelDestinationOption,
  type HotelSortOption,
} from "@/lib/hotels-catalog";
import { fetchHotelDestinations } from "@/services/hotels";
import { PARTNER_PORTAL_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HotelsHeroSkeleton } from "@/components/hotels/hotels-page-skeleton";

const HOTELS_BANNER_IMAGE = "/images/hotels/hero-banner.webp";

type HotelsSearchHeroProps = {
  className?: string;
  destinations?: HotelDestinationOption[];
  defaultCity?: string;
  defaultCountry?: string;
  defaultSlug?: string;
};

const TRUST_BADGES = [
  { icon: ShieldCheck, title: "Lowest Price Guarantee", sub: "We'll match the price" },
  { icon: Zap,         title: "Last Minute Deals",      sub: "Great savings"         },
  { icon: Clock,       title: "Flexible Cancellation",  sub: "Plans can change"      },
] as const;

export function HotelsSearchHero({
  className,
  destinations = [],
  defaultCity = "",
  defaultCountry = "India",
  defaultSlug = "",
}: HotelsSearchHeroProps) {
  const router = useRouter();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const checkInDefaultIso  = useMemo(() => localDateInputString(addDays(today, 1)),  [today]);
  const checkOutDefaultIso = useMemo(() => addDaysToIso(checkInDefaultIso, 1),       [checkInDefaultIso]);

  const [city,           setCity]           = useState(defaultCity);
  const [country,        setCountry]        = useState(defaultCountry);
  const [selectedSlug,   setSelectedSlug]   = useState(defaultSlug);
  const [nearMeActive,   setNearMeActive]   = useState(false);
  const [nearMeLoading,  setNearMeLoading]  = useState(false);
  const [nearMeError,    setNearMeError]    = useState<string | null>(null);
  const [searchError,    setSearchError]    = useState<string | null>(null);
  const [checkInIso,     setCheckInIso]     = useState(checkInDefaultIso);
  const [checkOutIso,    setCheckOutIso]    = useState(checkOutDefaultIso);
  const [rooms,          setRooms]          = useState(1);
  const [guests,         setGuests]         = useState(2);
  const [childrenAges,   setChildrenAges]   = useState<number[]>([]);
  const [bannerLoaded,   setBannerLoaded]   = useState(false);
  const [isSearching,    setIsSearching]    = useState(false);
  const checkOutInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedDestinations } = useQuery({
    queryKey: ["hotels", "search-destinations"],
    queryFn: async () => {
      const list = await fetchHotelDestinations();
      return list.map((d) => ({ slug: d.slug, city: d.city, state: d.state, country: d.country }));
    },
    enabled: destinations.length === 0,
    staleTime: 5 * 60 * 1000,
  });

  const effectiveDestinations = destinations.length > 0 ? destinations : (fetchedDestinations ?? []);

  useEffect(() => {
    if (defaultCity)    setCity(defaultCity);
    if (defaultCountry) setCountry(defaultCountry);
    if (defaultSlug)    setSelectedSlug(defaultSlug);
  }, [defaultCity, defaultCountry, defaultSlug]);

  useEffect(() => {
    const img = new window.Image();
    img.src = HOTELS_BANNER_IMAGE;
    if (img.complete) { setBannerLoaded(true); return; }
    img.onload  = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const checkOutMinIso = checkInIso
    ? addDaysToIso(checkInIso, 1)
    : addDaysToIso(localDateInputString(today), 1);

  const fieldDivider = "border-[#EEEEEE] max-sm:border-b sm:border-b-0 sm:border-r";

  const handleCheckInChange = (iso: string) => {
    setCheckInIso(iso);
    const nextOut = addDaysToIso(iso, 1);
    setCheckOutIso((prev) => (!prev || prev <= iso ? nextOut : prev));
  };

  const openCheckOutPicker = () => {
    requestAnimationFrame(() => openNativeDatePicker(checkOutInputRef.current));
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    setSelectedSlug("");
    setNearMeActive(false);
    setNearMeError(null);
    setSearchError(null);
  };

  const handleSelectDestination = (dest: HotelDestinationOption) => {
    setCity(dest.city);
    setCountry(dest.country);
    setSelectedSlug(dest.slug);
    setNearMeActive(false);
    setSearchError(null);
  };

  const handleSearch = () => {
    setSearchError(null);
    const trimmedCity = city.trim();
    if (!trimmedCity)                           { setSearchError("Please enter a city or hotel location"); return; }
    if (!checkInIso)                            { setSearchError("Please select check-in date");           return; }
    if (!checkOutIso || checkOutIso <= checkInIso) { setSearchError("Check-out must be after check-in");  return; }

    const matched = matchHotelDestinationFromList(trimmedCity, effectiveDestinations);
    const slug    = selectedSlug || matched?.slug || slugifyCityName(trimmedCity);

    if (matched && !selectedSlug) {
      setSelectedSlug(matched.slug);
      setCountry(matched.country);
    }

    const sort: HotelSortOption | undefined = undefined;
    setIsSearching(true);
    router.push(hotelResultsHref(slug, { check_in: checkInIso, check_out: checkOutIso, rooms, guests, sort }));
  };

  const handleNearMe = () => {
    setNearMeError(null);
    setSearchError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNearMeError("Location not supported on this device");
      return;
    }
    setNearMeLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { city: resolvedCity, country: resolvedCountry } = await reverseGeocodeCity(
            position.coords.latitude, position.coords.longitude,
          );
          const match = matchHotelDestinationFromList(resolvedCity, effectiveDestinations);
          if (match) { setCity(match.city); setCountry(match.country); setSelectedSlug(match.slug); }
          else        { setCity(resolvedCity); setCountry(resolvedCountry); setSelectedSlug(""); }
          setNearMeActive(true);
        } catch {
          setNearMeError("Unable to detect city. Try again.");
          setNearMeActive(false);
        } finally {
          setNearMeLoading(false);
        }
      },
      (error) => {
        setNearMeLoading(false);
        setNearMeActive(false);
        if (error.code === error.PERMISSION_DENIED)      setNearMeError("Allow location access to use Near Me");
        else if (error.code === error.TIMEOUT)           setNearMeError("Location timed out. Try again.");
        else                                             setNearMeError("Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <section
      id="hotel-search"
      className={cn(
        "relative isolate w-full overflow-x-hidden overflow-y-visible",
        className,
      )}
      style={{ minHeight: "520px" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={HOTELS_BANNER_IMAGE}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-opacity duration-500",
            bannerLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setBannerLoaded(true)}
          onError={() => setBannerLoaded(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" aria-hidden />
      </div>

      {!bannerLoaded && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <HotelsHeroSkeleton className="h-full min-h-full" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col px-4 pb-8 pt-[100px] sm:px-6 sm:pt-[110px] lg:px-8">

        {/* Hero headline */}
        <div className="mb-7">
          <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-5xl md:text-[3.25rem]">
            Same hotel.<br />
            Cheapest price.<br />
            <span className="text-amber-400">Guaranteed!</span>
          </h1>
          <p className="mt-3 text-[15px] font-medium text-white/80 drop-shadow-md sm:text-base">
            Find the best hotels at unbeatable prices.
          </p>
        </div>

        {/* Search card */}
        <form
          className="relative z-20 w-full overflow-visible rounded-2xl bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.45),0_4px_16px_rgba(0,0,0,0.12)]"
          role="search"
          aria-busy={isSearching}
          onSubmit={(e) => { e.preventDefault(); if (!isSearching) handleSearch(); }}
        >
          {isSearching && <HotelSearchLoadingOverlay />}
          <div className={cn(
            "flex w-full flex-col overflow-visible sm:flex-row sm:items-stretch",
            isSearching && "pointer-events-none select-none opacity-60",
          )}>
            <div className="flex w-full min-w-0 flex-1 flex-col overflow-visible sm:flex-row sm:items-stretch">
              <HotelLocationField
                className={cn(fieldDivider, "sm:flex-[1.5]")}
                city={city}
                country={country}
                destinations={effectiveDestinations}
                nearMeActive={nearMeActive}
                nearMeLoading={nearMeLoading}
                nearMeError={nearMeError}
                searchError={searchError}
                onCityChange={handleCityChange}
                onSelectDestination={handleSelectDestination}
                onNearMe={handleNearMe}
              />
              <HotelDateField
                className={cn(fieldDivider, "sm:min-w-[130px] sm:flex-1 sm:basis-0")}
                label="Check-In"
                iso={checkInIso}
                minIso={localDateInputString(today)}
                onIsoChange={handleCheckInChange}
                onAfterSelect={openCheckOutPicker}
              />
              <HotelDateField
                className={cn(fieldDivider, "sm:min-w-[130px] sm:flex-1 sm:basis-0")}
                label="Check-Out"
                iso={checkOutIso}
                minIso={checkOutMinIso}
                inputRef={checkOutInputRef}
                onIsoChange={setCheckOutIso}
              />
              <HotelRoomsGuestsField
                className="sm:min-w-[150px] sm:flex-1 sm:basis-0 sm:border-r-0"
                rooms={rooms}
                guests={guests}
                onRoomsChange={setRooms}
                onGuestsChange={setGuests}
                childrenAges={childrenAges}
                onChildrenAgesChange={setChildrenAges}
              />
            </div>

            {/* Search button — rounded on right on desktop */}
            <button
              type="submit"
              disabled={isSearching}
              className="flex h-[54px] w-full shrink-0 items-center justify-center rounded-b-2xl bg-primary text-[15px] font-bold tracking-[0.08em] text-white transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-80 sm:h-auto sm:min-h-[unset] sm:w-[136px] sm:flex-none sm:rounded-b-none sm:rounded-r-2xl sm:px-0"
            >
              {isSearching ? "Searching…" : "SEARCH"}
            </button>
          </div>
        </form>

        {/* Bottom bar: trust badges + CTA */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Trust badges */}
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

          {/* List your hotel CTA */}
          <a
            href={PARTNER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-transparent px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
          >
            List Your Hotel For Free
          </a>
        </div>
      </div>
    </section>
  );
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}