"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Building2, Calendar, Users } from "lucide-react";
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

function ReadonlyField({
  icon,
  label,
  value,
  sub,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-start gap-3 px-4 py-3.5 sm:px-5 sm:py-4",
        className,
      )}
    >
      <span className="mt-0.5 shrink-0 text-[#757575]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] text-[#9E9E9E]">{label}</span>
        <span className="mt-1 block truncate text-[15px] font-bold leading-tight text-[#212121] sm:text-[16px]">
          {value}
        </span>
        {sub ? (
          <span className="mt-0.5 block truncate text-xs font-normal text-[#757575]">{sub}</span>
        ) : null}
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
  const checkOutRef = useRef<HTMLInputElement>(null);

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

  const [isEditing, setIsEditing] = useState(false);
  const [cityName, setCityName] = useState(city.name);
  const [country, setCountry] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(city.slug);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [checkInIso, setCheckInIso] = useState(
    () => searchParams.get("check_in") || checkInDefault,
  );
  const [checkOutIso, setCheckOutIso] = useState(() => {
    const fromUrl = searchParams.get("check_out");
    if (fromUrl) return fromUrl;
    const checkIn = searchParams.get("check_in") || checkInDefault;
    return addDaysToIso(checkIn, 1);
  });
  const [rooms, setRooms] = useState(() => {
    const n = Number.parseInt(searchParams.get("rooms") ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  });
  const [guests, setGuests] = useState(() => {
    const n = Number.parseInt(searchParams.get("guests") ?? "2", 10);
    return Number.isFinite(n) && n > 0 ? n : 2;
  });
  const [bannerLoaded, setBannerLoaded] = useState(false);

  const checkOutMin = checkInIso ? addDaysToIso(checkInIso, 1) : addDaysToIso(localDateInputString(today), 1);
  const fieldDivider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";
  const checkInFmt = formatHotelDateFromIso(checkInIso);
  const checkOutFmt = formatHotelDateFromIso(checkOutIso);

  useEffect(() => {
    setCityName(city.name);
    setSelectedSlug(city.slug);
  }, [city.name, city.slug]);

  useEffect(() => {
    const img = new window.Image();
    img.src = HOTEL_INNER_BANNER_IMAGE;
    if (img.complete) {
      setBannerLoaded(true);
      return;
    }
    img.onload = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const enterEditMode = () => {
    setIsEditing(true);
    setSearchError(null);
    setNearMeError(null);
    requestAnimationFrame(() => {
      cityInputRef.current?.focus();
      cityInputRef.current?.select();
    });
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
    setCityName(value);
    setSelectedSlug("");
    setNearMeActive(false);
    setNearMeError(null);
    setSearchError(null);
  };

  const handleSelectDestination = (dest: HotelDestinationOption) => {
    setCityName(dest.city);
    setCountry(dest.country);
    setSelectedSlug(dest.slug);
    setNearMeActive(false);
    setSearchError(null);
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
            position.coords.latitude,
            position.coords.longitude,
          );
          const match = matchHotelDestinationFromList(resolvedCity, destinations);
          if (match) {
            setCityName(match.city);
            setCountry(match.country);
            setSelectedSlug(match.slug);
          } else {
            setCityName(resolvedCity);
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

  const handleSubmitSearch = async () => {
    setSearchError(null);

    const match =
      (selectedSlug
        ? destinations.find((d) => d.slug === selectedSlug) ??
          ({ slug: selectedSlug, city: cityName, country: country || "India" } as HotelDestinationOption)
        : null) ?? matchHotelDestinationFromList(cityName, destinations);

    if (!match) {
      setSearchError("Please select a city from the list");
      return;
    }

    const fullLocation =
      match.state && match.country
        ? `${match.city}, ${match.state}, ${match.country}`
        : match.country
          ? `${match.city}, ${match.country}`
          : city.fullLocation;

    await onSearch({
      slug: match.slug,
      city: match.city,
      country: match.country,
      fullLocation,
      check_in: checkInIso,
      check_out: checkOutIso,
      rooms,
      guests,
    });

    setIsEditing(false);
    setSearchError(null);
  };

  return (
    <section
      className={cn(
        "relative isolate min-h-[220px] overflow-hidden px-3 py-5 sm:min-h-[240px] sm:px-4 sm:py-6 lg:px-6",
        className,
      )}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={HOTEL_INNER_BANNER_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-opacity duration-500",
            bannerLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setBannerLoaded(true)}
          onError={() => setBannerLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden />
        {!bannerLoaded ? <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden /> : null}
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px]">
        <h1 className="text-center text-xl font-bold text-white drop-shadow-sm sm:text-2xl md:text-[26px]">
          Hotels in {city.name}
        </h1>

        <form
          className="relative z-10 mt-4 w-full overflow-visible rounded-xl bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)] sm:mt-5 sm:rounded-2xl"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (isEditing) void handleSubmitSearch();
          }}
        >
          <div className="flex w-full flex-col sm:flex-row sm:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-stretch">
              {isEditing ? (
                <HotelLocationField
                  className={fieldDivider}
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
                />
              )}

              {isEditing ? (
                <>
                  <HotelDateField
                    className={cn(fieldDivider, "sm:min-w-[110px] sm:flex-1 sm:basis-0")}
                    label="Check-In"
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
                    className={cn(fieldDivider, "sm:min-w-[110px] sm:flex-1 sm:basis-0")}
                    icon={<Calendar className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                    label="Check-In"
                    value={checkInFmt.main}
                    sub={checkInFmt.sub}
                  />
                  <ReadonlyField
                    className={cn(fieldDivider, "sm:min-w-[110px] sm:flex-1 sm:basis-0")}
                    icon={<Calendar className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                    label="Check-Out"
                    value={checkOutFmt.main}
                    sub={checkOutFmt.sub}
                  />
                  <ReadonlyField
                    className="sm:min-w-[130px] sm:flex-1 sm:basis-0"
                    icon={<Users className="h-5 w-5" strokeWidth={1.5} aria-hidden />}
                    label="Rooms & Guests"
                    value={`${rooms} Room ${guests} Guests`}
                  />
                </>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2 border-t border-[#EEEEEE] p-3 sm:flex-row sm:items-stretch sm:border-t-0 sm:p-0">
                <button
                  type="button"
                  onClick={exitEditMode}
                  disabled={searching}
                  className="flex h-11 shrink-0 items-center justify-center rounded-full border-2 border-[#E0E0E0] bg-white px-5 text-sm font-semibold text-[#757575] transition-colors hover:bg-[#FAFAFA] disabled:opacity-60 sm:m-4 sm:h-auto sm:min-h-[52px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={searching}
                  className="flex h-[52px] shrink-0 items-center justify-center bg-[#EF6614] px-6 text-[15px] font-bold tracking-[0.06em] text-white transition-colors hover:bg-[#E65100] disabled:cursor-wait disabled:opacity-80 sm:m-4 sm:min-h-[76px] sm:w-[128px] sm:px-0 lg:w-[136px]"
                >
                  {searching ? "Searching…" : "SEARCH"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={enterEditMode}
                className="m-3 shrink-0 self-center rounded-full border-2 border-[#2196F3] bg-white px-6 py-2 text-sm font-semibold text-[#2196F3] transition-colors hover:bg-[#E3F2FD] sm:m-4"
              >
                Modify Search
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
