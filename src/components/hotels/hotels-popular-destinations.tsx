"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HotelsSectionHeader } from "@/components/hotels/hotels-section-header";
import { cn, formatInrAmount } from "@/lib/utils";

export type PopularDestinationCard = {
  name: string;
  state?: string;
  description: string;
  href: string;
  image: string;
  fallbackImage?: string;
  featured: boolean;
  hotelCount?: number;
  startingPrice?: number;
};

function DestinationCard({
  destination,
  showTopPick,
}: {
  destination: PopularDestinationCard;
  showTopPick?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(destination.image);
  const fallbackSrc = destination.fallbackImage || "/images/hotels/hero-banner.webp";

  return (
    <Link
      href={destination.href}
      data-destination-card
      className={cn(
        "group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900",
        "w-[min(74vw,250px)] sm:w-[245px] lg:w-[235px]",
        "shadow-[0_14px_40px_-14px_rgba(15,23,42,0.4)] ring-1 ring-black/5",
        "transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-14px_rgba(234,88,12,0.35)] hover:ring-primary/30",
      )}
    >
      <div className="relative aspect-[16/9] w-full">
        {!loaded ? <Skeleton className="absolute inset-0 z-[1]" /> : null}
        <Image
          src={src}
          alt={destination.name}
          fill
          className={cn(
            "object-cover transition duration-700 group-hover:scale-110",
            loaded ? "opacity-100" : "opacity-0",
          )}
          sizes="340px"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (src !== fallbackSrc) {
              setLoaded(false);
              setSrc(fallbackSrc);
            }
          }}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" aria-hidden />

        {showTopPick ? (
          <span className="absolute left-3 top-3 z-[2] rounded-full bg-gradient-to-r from-primary to-orange-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-md">
            Top pick
          </span>
        ) : null}

        {destination.hotelCount != null && destination.hotelCount > 0 ? (
          <span className="absolute right-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full bg-white/22 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            <Building2 className="h-3 w-3" aria-hidden />
            {destination.hotelCount} hotels
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-[2] p-2.5">
          {destination.state ? (
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-orange-200">
              <MapPin className="h-3 w-3" aria-hidden />
              {destination.state}
            </p>
          ) : null}
          <h3 className="line-clamp-1 text-base font-black leading-tight text-white">{destination.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-white/85">{destination.description}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {destination.startingPrice != null && destination.startingPrice > 0 ? (
              <p className="text-xs text-white/90">
                From <span className="text-sm font-bold text-white">₹{formatInrAmount(destination.startingPrice)}</span>
                <span className="text-white/70"> /night</span>
              </p>
            ) : (
              <span className="text-xs font-semibold text-white/90">Explore stays</span>
            )}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-md transition group-hover:bg-primary group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export type HotelsPopularDestinationsProps = {
  destinations: PopularDestinationCard[];
  className?: string;
};

export function HotelsPopularDestinations({
  destinations,
  className,
}: HotelsPopularDestinationsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [headingReady, setHeadingReady] = useState(false);
  const visibleDestinations = destinations
    .slice()
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.hotelCount ?? 0) - (a.hotelCount ?? 0);
    })
    .slice(0, 10);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-destination-card]");
    const step = card ? card.offsetWidth + 16 : 336;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setHeadingReady(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  if (destinations.length === 0) return null;

  return (
    <section className={cn("border-b border-slate-200/60 bg-white py-12 sm:py-14", className)} id="popular-destinations">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {!headingReady ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-md" aria-hidden />
              <Skeleton className="h-9 w-64 rounded-lg" aria-hidden />
              <Skeleton className="h-4 w-full max-w-md rounded-md" aria-hidden />
            </div>
          ) : (
            <HotelsSectionHeader
              eyebrow="Where to next"
              title="Popular Destinations"
              description="Explore India's most loved cities — handpicked hotels in prime locations."
            />
          )}

          <div className="flex shrink-0 items-center gap-2 self-end sm:mb-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className={cn(
            "mt-8 flex gap-4 overflow-x-auto overflow-y-hidden pb-3",
            "scroll-smooth snap-x snap-mandatory",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {visibleDestinations.map((destination, i) => (
            <DestinationCard
              key={`${destination.href}-${destination.name}`}
              destination={destination}
              showTopPick={destination.featured || i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
