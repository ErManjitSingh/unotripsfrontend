"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Hotel,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  hotelDetailHref,
  HOTEL_MAJOR_CITY_OPTIONS,
  hotelListingKey,
  type HotelListing,
} from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type DestinationSlide = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  thumbnail: string;
};

const TRUST_ITEMS = [
  { icon: Hotel, title: "Luxury Stays", sub: "Handpicked hotels" },
  { icon: Compass, title: "Local Experiences", sub: "Curated adventures" },
  { icon: ShieldCheck, title: "Best Price", sub: "Book with confidence" },
] as const;

const AUTO_SCROLL_MS = 5000;

function titleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/* ═══════════════════════════════════════════════════════════════════════════ */

function FeaturedHotelCard({ hotel, index }: { hotel: HotelListing; index: number }) {
  const href = hotelDetailHref(hotel.citySlug, hotelListingKey(hotel));
  const image = hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=800&q=80";

  return (
    <Link
      href={href}
      className="group min-w-0 overflow-hidden rounded-2xl bg-white/95 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.75)] ring-1 ring-white/80 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white"
    >
      <div className="relative h-[118px] overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={hotel.name}
          fill
          unoptimized
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="112px"
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur">
          Stay {index + 1}
        </span>
      </div>
      <div className="min-w-0 p-3">
        <div>
          <p className="line-clamp-2 min-h-[34px] text-[13px] font-black leading-snug text-slate-950">
            {hotel.name}
          </p>
          <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-500">
            {hotel.locationLine || hotel.area || hotel.citySlug.replace(/-/g, " ")}
          </p>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-[11px] font-semibold text-slate-500">
            From <span className="text-[17px] font-black text-primary">₹{hotel.price.toLocaleString("en-IN")}</span>
          </p>
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-primary">
            {hotel.rating.toFixed(1)} ★
          </span>
        </div>
      </div>
    </Link>
  );
}

type HotelsFeaturedDestinationsProps = {
  hotels?: HotelListing[];
};

export function HotelsFeaturedDestinations({ hotels = [] }: HotelsFeaturedDestinationsProps) {
  const [active, setActive] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const citySlides = useMemo(() => {
    const grouped = new Map<
      string,
      {
        slug: string;
        name: string;
        hotels: HotelListing[];
      }
    >();

    for (const hotel of hotels) {
      const slug = hotel.citySlug.trim().toLowerCase();
      const current = grouped.get(slug);
      if (current) {
        current.hotels.push(hotel);
      } else {
        grouped.set(slug, {
          slug,
          name: titleCaseSlug(slug),
          hotels: [hotel],
        });
      }
    }

    const preferredOrder = new Map(
      HOTEL_MAJOR_CITY_OPTIONS.map((city, index) => [city.slug.toLowerCase(), index]),
    );

    return [...grouped.values()]
      .sort((a, b) => {
        const aRank = preferredOrder.get(a.slug);
        const bRank = preferredOrder.get(b.slug);
        if (aRank != null && bRank != null) return aRank - bRank;
        if (aRank != null) return -1;
        if (bRank != null) return 1;
        return b.hotels.length - a.hotels.length || a.name.localeCompare(b.name);
      })
      .slice(0, 8)
      .map((entry, index): DestinationSlide => {
        const heroHotel = entry.hotels[0];
        const image = heroHotel?.images[0] || "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=1920&q=80";
        const cityLabel = entry.name;
        return {
          slug: entry.slug,
          name: cityLabel,
          tagline: `${entry.hotels.length} properties available`,
          description: `Explore handpicked stays in ${cityLabel} and compare the best options in prime locations.`,
          image,
          thumbnail: image,
        } satisfies DestinationSlide;
      });
  }, [hotels]);

  const total = citySlides.length;
  const featuredHotels = hotels;
  const hasSlides = total > 0;

  const goTo = useCallback(
    (idx: number) => {
      if (!hasSlides) return;
      const nextIndex = ((idx % total) + total) % total;
      setSlideDirection(nextIndex >= active ? 1 : -1);
      setActive(nextIndex);
    },
    [active, hasSlides, total],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (!hasSlides || isPaused) return;
    timerRef.current = setTimeout(() => {
      next();
    }, AUTO_SCROLL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasSlides, isPaused, next]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPaused && hasSlides) {
      timerRef.current = setTimeout(() => {
        next();
      }, AUTO_SCROLL_MS);
    }
  }, [hasSlides, isPaused, next]);

  useEffect(() => {
    const container = thumbRef.current;
    if (!container) return;
    const el = container.children[active] as HTMLElement | undefined;
    if (!el) return;
    // Scroll only the thumbnail strip — never the page
    container.scrollTo({
      left: el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };
  const handleGo = (i: number) => { goTo(i); resetTimer(); };

  const dest = citySlides[active];
  const destinationHotels = useMemo(() => {
    if (!dest) return [];
    const matches = featuredHotels.filter((hotel) => hotel.citySlug.trim().toLowerCase() === dest.slug);
    return (matches.length >= 2 ? matches : featuredHotels.filter((hotel) => hotel.citySlug.trim().toLowerCase() === dest.slug || hotel.name.toLowerCase().includes(dest.name.toLowerCase())))
      .slice(0, 2);
  }, [dest, featuredHotels]);

  const safeDest = dest ?? {
    slug: "shimla",
    name: "Shimla",
    tagline: "City stays",
    description: "Explore handpicked stays in Shimla and compare the best options in prime locations.",
    image: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=400&q=80",
  };

  const totalSlides = hasSlides ? total : 1;
  const slideClass =
    slideDirection === 1
      ? "animate-[slideInFromRight_0.75s_cubic-bezier(0.22,1,0.36,1)_both]"
      : "animate-[slideInFromLeft_0.75s_cubic-bezier(0.22,1,0.36,1)_both]";

  return (
    <section
      className="border-b border-slate-200/60 bg-white py-5 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        {/* ── Main slider ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl shadow-lg sm:rounded-2xl">
          {/* Background image — single active slide only for faster first paint */}
          <div key={safeDest.slug} className={`absolute inset-0 ${slideClass}`}>
            <Image
              src={safeDest.image}
              alt={safeDest.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1320px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          </div>

          {/* Content */}
          <div className="relative z-10 grid min-h-[220px] gap-5 px-5 pb-5 pt-8 sm:min-h-[260px] sm:px-8 sm:pb-6 sm:pt-10 lg:min-h-[300px] lg:grid-cols-[minmax(0,1fr)_520px] lg:items-end lg:px-10 lg:pb-8 lg:pt-12">
            <div key={`copy-${active}`} className={`max-w-lg ${slideClass}`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 sm:text-[11px]">
                  Featured Destination
                </span>
                <h2 className="mt-1.5 text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {safeDest.name}
                </h2>
                <p className="mt-0.5 text-[12px] font-medium italic text-orange-300/80 sm:text-[13px]">
                  {safeDest.tagline}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-white/70 sm:text-[13px]">
                  {safeDest.description}
                </p>
                <Link
                  href={`/destinations/${safeDest.slug}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white hover:text-[#212121] sm:text-[13px]"
                >
                  Explore Destination
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              {/* Trust row — compact */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-white/10 pt-3 sm:gap-x-7">
                {TRUST_ITEMS.map((item) => (
                  <div key={item.title} className="flex items-center gap-2">
                    <item.icon className="h-3.5 w-3.5 text-orange-400" aria-hidden />
                    <div>
                      <span className="text-[10px] font-semibold text-white sm:text-[11px]">{item.title}</span>
                      <span className="ml-1 text-[9px] text-white/50 sm:text-[10px]">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {destinationHotels.length > 0 ? (
              <div key={`cards-${active}`} className={`hidden lg:block ${slideClass}`}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
                    Recommended stays in {safeDest.name}
                  </p>
                  <Link href="/hotels#popular-hotels" className="text-[12px] font-bold text-white/85 transition hover:text-white">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {destinationHotels.map((hotel, index) => (
                    <FeaturedHotelCard key={hotel.id} hotel={hotel} index={index} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 sm:left-3 sm:h-9 sm:w-9"
            aria-label="Previous destination"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 sm:right-3 sm:h-9 sm:w-9"
            aria-label="Next destination"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Dots + Thumbnails (light bg) ─────────────────────────────── */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => handleGo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-5 bg-orange-500"
                : "w-1.5 bg-slate-300 hover:bg-slate-400",
              )}
              aria-label={`Go to ${citySlides[i]?.name ?? safeDest.name}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>

        <div
          ref={thumbRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-2.5"
        >
          {(hasSlides ? citySlides : [safeDest]).map((d, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => handleGo(i)}
              className={cn(
                "group relative flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300",
                "w-[100px] sm:w-[120px] lg:flex-1",
                i === active
                  ? "ring-2 ring-orange-500 ring-offset-1 ring-offset-white"
                  : "opacity-50 hover:opacity-80",
              )}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={d.thumbnail}
                  alt={d.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100px, (max-width: 1024px) 120px, 160px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                <div className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5 shrink-0 text-white/70" aria-hidden />
                  <p className="truncate text-[9px] font-bold text-white sm:text-[10px]">
                    {d.name}
                  </p>
                </div>
                <p className="truncate text-[7px] text-white/55 sm:text-[8px]">
                  {d.tagline}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(36px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-36px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
