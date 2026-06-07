"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HotelsMoroccoBannerSkeleton } from "@/components/hotels/hotels-page-skeleton";

const MOROCCO_IMAGE =
  "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80";

export function HotelsMoroccoBanner() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <aside className="border-b border-slate-200/60 bg-white py-5 sm:py-6">
      <div className="relative mx-auto min-h-[100px] w-full max-w-[1320px] px-3 sm:min-h-[112px] sm:px-4 lg:px-6">
        {!imageLoaded ? <HotelsMoroccoBannerSkeleton className="!px-0 !py-0" /> : null}

        <Link
          href="/packages"
          className={cn(
            "group relative flex min-h-[100px] overflow-hidden rounded-2xl border border-slate-200/60 bg-[#4a2323] shadow-[0_10px_30px_-12px_rgba(74,35,35,0.55)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(74,35,35,0.65)] sm:min-h-[112px]",
            imageLoaded ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          <div className="relative z-10 flex w-[28%] shrink-0 flex-col justify-center border-r border-white/10 px-5 py-4 sm:w-[24%] sm:px-7">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8C4A0]">Featured</span>
            <span className="mt-1 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
              Kingdom of light
            </span>
          </div>

          <div className="relative min-h-[100px] flex-1 sm:min-h-[112px]">
            <Image
              src={MOROCCO_IMAGE}
              alt=""
              fill
              className="object-cover object-center transition duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 55vw, 600px"
              onLoad={() => setImageLoaded(true)}
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#4a2323] via-[#4a2323]/25 to-[#4a2323]/60" aria-hidden />
          </div>

          <div className="relative z-10 flex w-[34%] shrink-0 flex-col items-end justify-center gap-2.5 px-5 py-4 sm:w-[28%] sm:px-7">
            <p className="text-right text-sm font-semibold leading-snug text-white sm:text-base">
              A land of endless wonder awaits.
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white ring-1 ring-white/30 transition group-hover:bg-white group-hover:text-[#4a2323] sm:text-sm">
              Explore
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>

          <span className="absolute bottom-2.5 right-3 z-20 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/95">
            Ad
          </span>
        </Link>
      </div>
    </aside>
  );
}