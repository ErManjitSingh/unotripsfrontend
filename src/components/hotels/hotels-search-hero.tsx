"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Building2, ChevronRight, Headphones, MapPin, Star } from "lucide-react";
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

const QUICK_DESTINATIONS = [
  { city: "Shimla", slug: "shimla" },
  { city: "Manali", slug: "manali" },
  { city: "Goa", slug: "goa" },
  { city: "Jaipur", slug: "jaipur" },
];

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
        "relative isolate min-h-[560px] w-full overflow-x-hidden overflow-y-visible md:min-h-[690px]",
        className,
      )}
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
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,13,26,0.78)_0%,rgba(8,13,26,0.48)_16%,rgba(8,13,26,0.08)_42%,rgba(8,13,26,0.18)_100%)]" aria-hidden />
      </div>

      {!bannerLoaded && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <HotelsHeroSkeleton className="h-full min-h-full" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1320px] gap-8 px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-[128px] lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.72fr)] lg:items-center lg:gap-14 lg:px-8">

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.45)] ring-1 ring-white/80 backdrop-blur-md">
            <BadgeCheck className="h-3.5 w-3.5 fill-primary text-white" aria-hidden />
            Verified hotel bookings
          </div>

          <h1 className="mt-5 max-w-3xl text-[2.75rem] font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.48)] sm:text-5xl md:text-[4.25rem]">
            Find stays your guests would actually{" "}
            <span className="relative inline-block text-primary">
              recommend
              <span className="absolute -bottom-2 left-0 h-3 w-full rounded-[50%] border-b-[4px] border-primary/80" aria-hidden />
            </span>.
          </h1>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {QUICK_DESTINATIONS.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  setCity(item.city);
                  setCountry("India");
                  setSelectedSlug(item.slug);
                  setNearMeActive(false);
                  setSearchError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-2.5 text-[13px] font-bold text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 backdrop-blur-md transition hover:bg-white hover:text-primary"
              >
                <MapPin className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                {item.city}
              </button>
            ))}
            <a
              href="#popular-destinations"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-4 py-2.5 text-[13px] font-bold text-slate-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 backdrop-blur-md transition hover:bg-white hover:text-primary"
            >
              Explore more
            </a>
          </div>

          <div className="mt-9 grid max-w-[560px] grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-3xl bg-white/95 p-1 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-primary sm:flex">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-black leading-none text-slate-950">250+</p>
                <p className="mt-1 text-[12px] font-semibold leading-tight text-slate-500">Verified Hotels</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-primary sm:flex">
                <Star className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-black leading-none text-slate-950">4.8</p>
                <p className="mt-1 text-[12px] font-semibold leading-tight text-slate-500">Avg Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-primary sm:flex">
                <Headphones className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-black leading-none text-slate-950">24/7</p>
                <p className="mt-1 text-[12px] font-semibold leading-tight text-slate-500">Stay Support</p>
              </div>
            </div>
          </div>
        </div>

        <form
          className="relative z-20 w-full overflow-visible rounded-[1.5rem] border border-white/70 bg-white shadow-[0_24px_70px_-18px_rgba(0,0,0,0.55),0_6px_18px_rgba(0,0,0,0.14)]"
          role="search"
          aria-busy={isSearching}
          onSubmit={(e) => { e.preventDefault(); if (!isSearching) handleSearch(); }}
        >
          {isSearching && <HotelSearchLoadingOverlay />}
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-primary">
                <Building2 className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Hotel search</p>
                <h2 className="mt-0.5 text-xl font-black leading-tight text-slate-950">Find the right stay</h2>
                <p className="mt-1 text-[12px] font-medium text-slate-500">Real prices, clean rooms, quick confirmation.</p>
              </div>
            </div>
          </div>
          <div className={cn(
            "flex w-full flex-col overflow-visible",
            isSearching && "pointer-events-none select-none opacity-60",
          )}>
            <div className="flex w-full min-w-0 flex-1 flex-col overflow-visible">
              <HotelLocationField
                className="border-b border-[#EEEEEE]"
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
              <div className="grid grid-cols-2">
                <HotelDateField
                  className="border-b border-r border-[#EEEEEE]"
                  label="Check-In"
                  iso={checkInIso}
                  minIso={localDateInputString(today)}
                  onIsoChange={handleCheckInChange}
                  onAfterSelect={openCheckOutPicker}
                />
                <HotelDateField
                  className="border-b border-[#EEEEEE]"
                  label="Check-Out"
                  iso={checkOutIso}
                  minIso={checkOutMinIso}
                  inputRef={checkOutInputRef}
                  onIsoChange={setCheckOutIso}
                />
              </div>
              <HotelRoomsGuestsField
                className="border-b border-[#EEEEEE]"
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
              className="m-4 flex h-[54px] shrink-0 items-center justify-center gap-3 rounded-full bg-primary text-[15px] font-black text-white shadow-[0_18px_36px_-18px_rgba(234,88,12,0.95)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-80 sm:m-5"
            >
              {isSearching ? "Searching…" : "Search available hotels"}
              {!isSearching && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary">
                  <ChevronRight className="h-5 w-5" strokeWidth={2.3} aria-hidden />
                </span>
              )}
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
