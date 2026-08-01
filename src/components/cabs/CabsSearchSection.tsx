"use client";

/**
 * components/cabs/CabsSearchSection.tsx
 *
 * DEPRECATED for traveller UX — catalog search was retired in favour of the
 * quote marketplace at /cabs. Kept temporarily so any residual embeds still
 * land on the request form instead of /cabs/results.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CabSearchBar } from "@/components/cabs/CabSearchBar";
import type { CabSearchParams } from "@/lib/cabs-api";
import { cn } from "@/lib/utils";

const CAB_BANNER_IMAGE = "/images/hotels/hero-banner.webp";

type CabsSearchSectionProps = {
  initialParams?: Partial<CabSearchParams>;
  className?: string;
};

export function CabsSearchSection({
  initialParams,
  className,
}: CabsSearchSectionProps) {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = CAB_BANNER_IMAGE;
    if (img.complete) { setBannerLoaded(true); return; }
    img.onload  = () => setBannerLoaded(true);
    img.onerror = () => setBannerLoaded(true);
  }, []);

  const handleSearch = async (_params: CabSearchParams) => {
    // Catalog search → results was retired. Travellers post trip requests instead.
    setSearching(true);
    try {
      router.push("/cabs#cab-booking-form");
    } finally {
      setSearching(false);
    }
  };

  return (
    /*
     * CRITICAL:
     *   ✅ NO overflow-hidden  → dropdowns can escape the section boundary
     *   ✅ NO isolate          → no new stacking context trapping z-index
     *   ✅ position-relative   → absolute children (banner bg) still work
     *   ✅ z-10 on content div → content sits above the bg image layer
     */
    <section
      className={cn(
        "relative min-h-[240px] px-3 py-5 sm:min-h-[260px] sm:px-4 sm:py-6 lg:px-6",
        className,
      )}
    >
      {/* ── Background image layer (clipped to section via overflow on THIS div) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src={CAB_BANNER_IMAGE}
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
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/60" aria-hidden />
        {/* fallback while image loads */}
        {!bannerLoaded && <div className="absolute inset-0 bg-[#1a1a1a]" aria-hidden />}
      </div>

      {/* ── Foreground content — needs z-index above bg but search dropdowns
              must be able to overflow downward past the section bottom edge.
              z-[1] here is enough; the dropdowns inside CabSearchBar use z-[200]. */}
      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <h1 className="text-center text-xl font-bold text-white drop-shadow-sm sm:text-2xl md:text-[26px]">
          Outstation Cabs — Book Your Ride
        </h1>
        <p className="mt-1 text-center text-sm text-white/80">
          One-way, round trip &amp; full-day cab bookings across India
        </p>

        <div className="mt-4 sm:mt-5">
          <CabSearchBar onSearch={handleSearch} searching={searching} />
        </div>
      </div>
    </section>
  );
}