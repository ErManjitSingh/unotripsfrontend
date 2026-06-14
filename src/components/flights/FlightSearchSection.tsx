"use client";

/**
 * components/flights/FlightSearchSection.tsx
 */
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlightSearchBar } from "@/components/flights/FlightSearchBar";
import type { FlightSearchParams } from "@/lib/flight-api";
import { cn } from "@/lib/utils";

const BANNER = "/images/hotels/hero-banner.webp";

export function FlightSearchSection({ className }: { className?: string }) {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = BANNER;
    if (img.complete) { setLoaded(true); return; }
    img.onload  = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
  }, []);

  const handleSearch = async (params: FlightSearchParams) => {
    setSearching(true);
    try {
      const qs = new URLSearchParams({
        from_code:  params.from_code,
        to_code:    params.to_code,
        trip_type:  params.trip_type,
        departure:  params.departure,
        adults:     String(params.adults),
        children:   String(params.children),
        infants:    String(params.infants),
        cabin:      params.cabin,
      });
      if (params.return_date) qs.set("return_date", params.return_date);
      router.push(`/flights/results?${qs}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className={cn("relative min-h-[240px] px-3 py-5 sm:min-h-[260px] sm:px-4 sm:py-6 lg:px-6", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image src={BANNER} alt="" fill priority sizes="100vw"
          className={cn("object-cover object-center transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
        <div className="absolute inset-0 bg-black/60" aria-hidden />
        {!loaded && <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden />}
      </div>
      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <h1 className="text-center text-xl font-bold text-white sm:text-2xl md:text-[26px]">
          Book Domestic & International Flights
        </h1>
        <p className="mt-1 text-center text-sm text-white/80">
          Compare fares across all major airlines. No booking fees.
        </p>
        <div className="mt-4 sm:mt-5">
          <FlightSearchBar onSearch={handleSearch} searching={searching} />
        </div>
      </div>
    </section>
  );
}