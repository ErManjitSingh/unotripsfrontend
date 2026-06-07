"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
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

/** EaseMyTrip hotels hero — horizontal white search strip + orange SEARCH (reference layout). */
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

  const checkInDefaultIso = useMemo(
    () => localDateInputString(addDays(today, 1)),
    [today],
  );
  const checkOutDefaultIso = useMemo(
    () => addDaysToIso(checkInDefaultIso, 1),
    [checkInDefaultIso],
  );

  const [city, setCity] = useState(defaultCity);
  const [country, setCountry] = useState(defaultCountry);
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [checkInIso, setCheckInIso] = useState(checkInDefaultIso);
  const [checkOutIso, setCheckOutIso] = useState(checkOutDefaultIso);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const checkOutInputRef = useRef<HTMLInputElement>(null);
  const [lastMinute, setLastMinute] = useState(false);
  const [lowestPrice, setLowestPrice] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { data: fetchedDestinations } = useQuery({
    queryKey: ["hotels", "search-destinations"],
    queryFn: async () => {
      const list = await fetchHotelDestinations();
      return list.map((d) => ({
        slug: d.slug,
        city: d.city,
        state: d.state,
        country: d.country,
      }));
    },
    enabled: destinations.length === 0,
    staleTime: 5 * 60 * 1000,
  });

  const effectiveDestinations = destinations.length > 0 ? destinations : (fetchedDestinations ?? []);

  useEffect(() => {
    if (defaultCity) setCity(defaultCity);
    if (defaultCountry) setCountry(defaultCountry);
    if (defaultSlug) setSelectedSlug(defaultSlug);
  }, [defaultCity, defaultCountry, defaultSlug]);

  useEffect(() => {
    const img = new window.Image();
    img.src = HOTELS_BANNER_IMAGE;
    if (img.complete) {
      setBannerLoaded(true);
      return;
    }
    img.onload = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const checkOutMinIso = checkInIso
    ? addDaysToIso(checkInIso, 1)
    : addDaysToIso(localDateInputString(today), 1);

  const fieldDivider =
    "border-[#EEEEEE] max-sm:border-b sm:border-b-0 sm:border-r";

  const handleCheckInChange = (iso: string) => {
    setCheckInIso(iso);
    const nextOut = addDaysToIso(iso, 1);
    setCheckOutIso((prev) => (!prev || prev <= iso ? nextOut : prev));
  };

  const openCheckOutPicker = () => {
    requestAnimationFrame(() => {
      openNativeDatePicker(checkOutInputRef.current);
    });
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
    if (!trimmedCity) {
      setSearchError("Please enter a city or hotel location");
      return;
    }

    if (!checkInIso) {
      setSearchError("Please select check-in date");
      return;
    }

    if (!checkOutIso || checkOutIso <= checkInIso) {
      setSearchError("Check-out must be after check-in");
      return;
    }

    const matched = matchHotelDestinationFromList(trimmedCity, effectiveDestinations);
    const slug = selectedSlug || matched?.slug || slugifyCityName(trimmedCity);

    if (matched && !selectedSlug) {
      setSelectedSlug(matched.slug);
      setCountry(matched.country);
    }

    const sort: HotelSortOption | undefined = lowestPrice ? "price-low" : undefined;

    setIsSearching(true);
    router.push(
      hotelResultsHref(slug, {
        check_in: checkInIso,
        check_out: checkOutIso,
        rooms,
        guests,
        last_minute: lastMinute || undefined,
        sort,
      }),
    );
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
          const { city: resolvedCity, country: resolvedCountry } =
            await reverseGeocodeCity(
              position.coords.latitude,
              position.coords.longitude,
            );
          const match = matchHotelDestinationFromList(
            resolvedCity,
            effectiveDestinations,
          );
          if (match) {
            setCity(match.city);
            setCountry(match.country);
            setSelectedSlug(match.slug);
          } else {
            setCity(resolvedCity);
            setCountry(resolvedCountry);
            setSelectedSlug("");
          }
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
        if (error.code === error.PERMISSION_DENIED) {
          setNearMeError("Allow location access to use Near Me");
        } else if (error.code === error.TIMEOUT) {
          setNearMeError("Location timed out. Try again.");
        } else {
          setNearMeError("Could not get your location");
        }
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <section
      id="hotel-search"
      className={cn(
        "relative isolate min-h-[240px] overflow-x-hidden overflow-y-visible px-3 pb-9 pt-5 sm:min-h-[260px] sm:px-4 sm:pb-10 sm:pt-6",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full min-h-[240px] sm:min-h-[260px]">
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
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-black/50"
          aria-hidden
        />
      </div>

      {!bannerLoaded ? (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <HotelsHeroSkeleton className="h-full min-h-full" />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <p className="mb-4 text-right text-[17px] font-semibold leading-snug text-white sm:mb-5 sm:text-xl md:text-[22px] md:font-bold">
          Same hotel, Cheapest price. Guaranteed!
        </p>

        <form
          className="relative z-20 w-full overflow-visible rounded-xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] sm:rounded-2xl"
          role="search"
          aria-busy={isSearching}
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSearching) handleSearch();
          }}
        >
          {isSearching ? <HotelSearchLoadingOverlay /> : null}
          <div
            className={cn(
              "flex w-full flex-col overflow-visible sm:flex-row sm:items-stretch",
              isSearching && "pointer-events-none select-none opacity-60",
            )}
          >
            <div className="flex w-full min-w-0 flex-1 flex-col overflow-visible sm:flex-row sm:items-stretch">
              <HotelLocationField
                className={fieldDivider}
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
                className={cn(
                  fieldDivider,
                  "sm:min-w-[120px] sm:flex-1 sm:basis-0",
                )}
                label="Check-In"
                iso={checkInIso}
                minIso={localDateInputString(today)}
                onIsoChange={handleCheckInChange}
                onAfterSelect={openCheckOutPicker}
              />
              <HotelDateField
                className={cn(
                  fieldDivider,
                  "sm:min-w-[120px] sm:flex-1 sm:basis-0",
                )}
                label="Check-Out"
                iso={checkOutIso}
                minIso={checkOutMinIso}
                inputRef={checkOutInputRef}
                onIsoChange={setCheckOutIso}
              />
              <HotelRoomsGuestsField
                className="sm:min-w-[140px] sm:flex-1 sm:basis-0 sm:border-r-0"
                rooms={rooms}
                guests={guests}
                onRoomsChange={setRooms}
                onGuestsChange={setGuests}
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="flex h-[52px] w-full shrink-0 items-center justify-center bg-[#EF6614] text-[15px] font-bold tracking-[0.06em] text-white transition-colors hover:bg-[#E65100] disabled:cursor-wait disabled:opacity-90 sm:h-auto sm:min-h-[76px] sm:w-[128px] sm:flex-none sm:px-0 lg:w-[136px]"
            >
              {isSearching ? "Searching…" : "SEARCH"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white px-3.5 py-2 text-[13px] font-medium text-[#212121] shadow-sm">
              <input
                type="checkbox"
                checked={lastMinute}
                onChange={(e) => setLastMinute(e.target.checked)}
                className="h-4 w-4 rounded border-[#BDBDBD] accent-[#2196F3]"
              />
              Last Minute Deals
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white px-3.5 py-2 text-[13px] font-medium text-[#212121] shadow-sm">
              <input
                type="checkbox"
                checked={lowestPrice}
                onChange={(e) => setLowestPrice(e.target.checked)}
                className="h-4 w-4 rounded border-[#BDBDBD] accent-[#2196F3]"
              />
              <ShieldCheck
                className="h-4 w-4 text-[#4CAF50]"
                strokeWidth={2}
                aria-hidden
              />
              Lowest Price Guarantee
            </label>
          </div>
          <a
            href={PARTNER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-full border-2 border-white bg-transparent px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
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
