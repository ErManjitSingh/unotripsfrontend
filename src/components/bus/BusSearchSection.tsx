"use client";

/**
 * components/bus/BusSearchSection.tsx
 * Full-width banner with bus search bar — same pattern as CabsSearchSection.
 * overflow-visible on section, overflow-hidden only on the bg image div.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BusSearchBar } from "@/components/bus/BusSearchBar";
import type { BusSearchParams } from "@/lib/bus-api";
import { cn } from "@/lib/utils";

const BUS_BANNER_IMAGE = "/images/hotels/hero-banner.webp";

export function BusSearchSection({ className }: { className?: string }) {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = BUS_BANNER_IMAGE;
    if (img.complete) { setBannerLoaded(true); return; }
    img.onload  = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const handleSearch = async (params: BusSearchParams) => {
    setSearching(true);
    try {
      const qs = new URLSearchParams({
        from_city:   params.from_city,
        to_city:     params.to_city,
        travel_date: params.travel_date,
      });
      router.push(`/bus/results?${qs}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    /* NO overflow-hidden, NO isolate — dropdowns must escape freely */
    <section className={cn("relative min-h-[200px] px-3 py-5 sm:min-h-[220px] sm:px-4 sm:py-6 lg:px-6", className)}>

      {/* Background — overflow-hidden ONLY on this inner div */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image src={BUS_BANNER_IMAGE} alt="" fill priority sizes="100vw"
          className={cn("object-cover object-center transition-opacity duration-500", bannerLoaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setBannerLoaded(true)} onError={() => setBannerLoaded(true)} />
        <div className="absolute inset-0 bg-black/60" aria-hidden />
        {!bannerLoaded && <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden />}
      </div>

      {/* Content */}
      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <h1 className="text-center text-xl font-bold text-white drop-shadow-sm sm:text-2xl md:text-[26px]">
          Bus Ticket Booking
        </h1>
        <p className="mt-1 text-center text-sm text-white/80">
          Book bus tickets across India — Volvo, Sleeper, AC & Non-AC
        </p>
        <div className="mt-4 sm:mt-5">
          <BusSearchBar onSearch={handleSearch} searching={searching} />
        </div>
      </div>
    </section>
  );
}