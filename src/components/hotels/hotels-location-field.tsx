"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Building2, LocateFixed } from "lucide-react";
import type { HotelDestinationOption } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

export type HotelLocationFieldProps = {
  city: string;
  country: string;
  destinations: HotelDestinationOption[];
  nearMeActive: boolean;
  nearMeLoading: boolean;
  nearMeError: string | null;
  searchError: string | null;
  onCityChange: (city: string) => void;
  onSelectDestination: (dest: HotelDestinationOption) => void;
  onNearMe: () => void;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  showNearMe?: boolean;
};

export async function reverseGeocodeCity(
  lat: number,
  lon: number,
): Promise<{ city: string; country: string }> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": "UNOTrips-Hotels/1.0 (info@unotrips.com)",
    },
  });

  if (!res.ok) {
    throw new Error("Could not resolve your location");
  }

  const data = (await res.json()) as {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      suburb?: string;
      state_district?: string;
      state?: string;
      country?: string;
    };
  };

  const addr = data.address ?? {};
  const city =
    addr.city ??
    addr.town ??
    addr.village ??
    addr.suburb ??
    addr.state_district ??
    addr.state ??
    "Near you";

  return {
    city,
    country: addr.country ?? "India",
  };
}

export function HotelLocationField({
  city,
  country,
  destinations,
  nearMeActive,
  nearMeLoading,
  nearMeError,
  searchError,
  onCityChange,
  onSelectDestination,
  onNearMe,
  className,
  inputRef: externalInputRef,
  showNearMe = true,
}: HotelLocationFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);

  const assignInputRef = (el: HTMLInputElement | null) => {
    internalInputRef.current = el;
    if (externalInputRef) externalInputRef.current = el;
  };

  const suggestions = useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!q) return destinations.slice(0, 8);
    return destinations
      .filter(
        (d) =>
          d.city.toLowerCase().includes(q) ||
          d.slug.includes(q.replace(/\s+/g, "-")) ||
          d.country.toLowerCase().includes(q) ||
          (d.state?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 8);
  }, [city, destinations]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative flex w-full min-w-0 items-stretch text-left sm:min-w-[200px] sm:flex-[1.4] sm:basis-0",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">
          <label className="block text-[11px] font-normal leading-tight text-[#9E9E9E]">
            Enter City Name, Location, or Specific hotel
          </label>
          <input
            ref={assignInputRef}
            type="text"
            value={city}
            onChange={(e) => {
              onCityChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && open && suggestions.length > 0) {
                e.preventDefault();
                onSelectDestination(suggestions[0]!);
                setOpen(false);
              }
            }}
            placeholder="Search city"
            autoComplete="off"
            className="mt-1 w-full truncate border-0 bg-transparent p-0 text-[17px] font-bold leading-tight text-[#212121] outline-none placeholder:font-normal placeholder:text-[#BDBDBD]"
          />
          {country ? (
            <span className="mt-0.5 block truncate text-xs font-normal text-[#757575]">{country}</span>
          ) : null}
          {searchError ? (
            <span className="mt-1 block text-[10px] font-medium text-[#E53935]">{searchError}</span>
          ) : nearMeError ? (
            <span className="mt-1 block text-[10px] font-medium text-[#E53935]">{nearMeError}</span>
          ) : null}
        </span>
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          className={cn(
            "absolute left-0 top-full z-[200] mt-0 max-h-[min(70vh,16rem)] overflow-y-auto rounded-b-xl border border-t-0 border-[#E0E0E0] bg-white py-1 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.25)]",
            showNearMe ? "right-0 sm:left-2 sm:right-[88px]" : "right-0 sm:left-2 sm:right-2",
          )}
          role="listbox"
          aria-label="City suggestions"
        >
          {suggestions.map((d) => (
            <li key={d.slug} role="option">
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm text-[#212121] transition-colors hover:bg-[#F5F5F5]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectDestination(d);
                  setOpen(false);
                }}
              >
                <span className="font-semibold">{d.city}</span>
                {(d.state || d.country) && (
                  <span className="text-[#757575]">
                    {d.state ? `, ${d.state}` : ""}
                    {d.country ? `, ${d.country}` : ""}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showNearMe ? (
        <button
          type="button"
          onClick={onNearMe}
          disabled={nearMeLoading}
          aria-pressed={nearMeActive}
          aria-busy={nearMeLoading}
          className={cn(
            "flex w-[72px] shrink-0 flex-col items-center justify-center gap-0.5 border-l border-[#EEEEEE] px-2 py-3 transition-colors sm:w-[80px] sm:px-3",
            nearMeActive ? "bg-[#E3F2FD]" : "hover:bg-[#FAFAFA]",
            nearMeLoading && "cursor-wait opacity-80",
          )}
        >
          <LocateFixed className="h-5 w-5 text-[#2196F3]" strokeWidth={2} aria-hidden />
          <span
            className={cn(
              "text-center text-[10px] font-semibold leading-tight sm:text-[11px]",
              nearMeActive ? "text-[#1976D2]" : "text-[#2196F3]",
            )}
          >
            {nearMeLoading ? "Locating…" : "Near Me"}
          </span>
        </button>
      ) : null}
    </div>
  );
}
