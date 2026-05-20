"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatInrAmount } from "@/lib/utils";

export type PopularDestinationCard = {
  name: string;
  state?: string;
  description: string;
  href: string;
  image: string;
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

  return (
    <Link
      href={destination.href}
      data-destination-card
      className={cn(
        "group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-[#1a1a1a]",
        "w-[72vw] min-w-[240px] max-w-[280px] sm:w-[260px] sm:min-w-[260px] sm:max-w-[280px]",
        "shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5",
        "transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(33,150,243,0.22)] hover:ring-[#2196F3]/25",
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        {!loaded ? <Skeleton className="absolute inset-0 z-[1]" /> : null}
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className={cn(
            "object-cover transition duration-500 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0",
          )}
          sizes="280px"
          onLoad={() => setLoaded(true)}
          unoptimized
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
          aria-hidden
        />

        {showTopPick ? (
          <span className="absolute left-3 top-3 z-[2] rounded-full bg-[#EF6614] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            Top pick
          </span>
        ) : null}

        {destination.hotelCount != null && destination.hotelCount > 0 ? (
          <span className="absolute right-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            <Building2 className="h-3 w-3" aria-hidden />
            {destination.hotelCount}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-[2] p-4">
          {destination.state ? (
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
              <MapPin className="h-3 w-3 text-[#FFB74D]" aria-hidden />
              {destination.state}
            </p>
          ) : null}
          <h3 className="text-lg font-bold leading-tight text-white">{destination.name}</h3>
          <p className="mt-1 line-clamp-1 text-[12px] text-white/85">{destination.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            {destination.startingPrice != null && destination.startingPrice > 0 ? (
              <p className="text-[11px] text-white/80">
                From{" "}
                <span className="font-black text-white">
                  ₹{formatInrAmount(destination.startingPrice)}
                </span>
              </p>
            ) : (
              <span className="text-[11px] font-medium text-white/80">Explore</span>
            )}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1565C0] shadow-md transition group-hover:bg-[#EF6614] group-hover:text-white">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
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

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-destination-card]");
    const step = card ? card.offsetWidth + 12 : 272;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setHeadingReady(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  if (destinations.length === 0) return null;

  return (
    <section className={cn("px-3 py-10 sm:px-4 sm:py-12 lg:px-6", className)}>
      <div className="mx-auto max-w-[1180px]">
        <div className="overflow-hidden rounded-3xl border border-[#e8e8e8]/80 bg-white p-5 shadow-[0_12px_48px_rgba(15,23,42,0.08)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {!headingReady ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-56 rounded-lg" aria-hidden />
                <Skeleton className="h-4 w-full max-w-md rounded-md" aria-hidden />
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2196F3]">
                  Hand-picked for you
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#212121] sm:text-[1.75rem]">
                  Popular Destinations
                </h2>
                <p className="mt-2 max-w-lg text-sm text-[#616161] sm:text-[15px]">
                  Swipe to explore top cities — hotels from the best locations in India.
                </p>
              </div>
            )}
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#424242] shadow-sm transition hover:border-[#2196F3]/40 hover:text-[#1976D2]"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#424242] shadow-sm transition hover:border-[#2196F3]/40 hover:text-[#1976D2]"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className={cn(
              "mt-6 flex gap-3 overflow-x-auto overflow-y-hidden pb-1 pt-0.5 sm:mt-8",
              "scroll-smooth snap-x snap-mandatory",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {destinations.map((destination, i) => (
              <DestinationCard
                key={`${destination.href}-${destination.name}`}
                destination={destination}
                showTopPick={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

