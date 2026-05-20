"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HotelsMoroccoBannerSkeleton } from "@/components/hotels/hotels-page-skeleton";

const MOROCCO_IMAGE =
  "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80";

/** Morocco promo strip — EaseMyTrip-style maroon ad below hotel search. */
export function HotelsMoroccoBanner() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <aside className="bg-white px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
      <div className="relative mx-auto max-w-[1180px] min-h-[96px] sm:min-h-[108px]">
        {!imageLoaded ? <HotelsMoroccoBannerSkeleton className="!px-0 !py-0" /> : null}

        <Link
          href="/packages"
          className={cn(
            "group relative flex min-h-[96px] overflow-hidden rounded-2xl bg-[#4a2323] shadow-md transition-opacity duration-300 sm:min-h-[108px]",
            imageLoaded ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          <div className="relative z-10 flex w-[26%] shrink-0 flex-col justify-center border-r border-white/10 px-5 py-4 sm:w-[24%] sm:px-7">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8C4A0]">
              Morocco
            </span>
            <span className="mt-1 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
              Kingdom of light
            </span>
          </div>

          <div className="relative min-h-[96px] flex-1 sm:min-h-[108px]">
            <Image
              src={MOROCCO_IMAGE}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 55vw, 600px"
              onLoad={() => setImageLoaded(true)}
            />
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#4a2323] via-[#4a2323]/30 to-[#4a2323]/55"
              aria-hidden
            />
          </div>

          <div className="relative z-10 flex w-[32%] shrink-0 flex-col items-end justify-center gap-2.5 px-5 py-4 sm:w-[28%] sm:px-7">
            <p className="text-right text-sm font-semibold leading-snug text-white sm:text-base">
              A Land of Endless Wonder.
            </p>
            <span className="rounded-full border-2 border-white px-5 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-white/15 sm:text-sm">
              Know More
            </span>
          </div>

          <span className="absolute bottom-2.5 right-3 z-20 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-medium text-white/95">
            Ad
          </span>
        </Link>
      </div>
    </aside>
  );
}


