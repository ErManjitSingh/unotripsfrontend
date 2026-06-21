"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
 * Destination data — each slide in the hero carousel.
 * `slug` matches /destinations/[slug] for package filtering.
 * ──────────────────────────────────────────────────────────────────────────── */

type DestinationSlide = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  thumbnail: string;
};

const DESTINATIONS: DestinationSlide[] = [
  {
    slug: "himachal",
    name: "Himachal Pradesh",
    tagline: "Land of the Gods",
    description:
      "Snow-capped peaks, pine forests, and charming hill stations — Himachal is where the mountains call you home.",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    tagline: "Land of Kings",
    description:
      "Majestic forts, golden deserts, and royal heritage — experience the vibrant colours and timeless grandeur.",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80",
  },
  {
    slug: "kerala",
    name: "Kerala",
    tagline: "God's Own Country",
    description:
      "Serene backwaters, lush tea gardens, and Ayurvedic retreats — Kerala offers a tranquil escape into nature.",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
  },
  {
    slug: "north-east",
    name: "Sikkim",
    tagline: "Mystical Himalayan Gem",
    description:
      "Monasteries on misty ridges, blooming rhododendrons, and views of Kanchenjunga — raw Himalayan magic.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  },
  {
    slug: "himachal",
    name: "Manali",
    tagline: "Valley of the Gods",
    description:
      "Adventure meets serenity — from Rohtang Pass to Old Manali's cosy cafes and riverside trails.",
    image:
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&q=80",
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    tagline: "Paradise on Earth",
    description:
      "Shikara rides on Dal Lake, meadows of Gulmarg, and the serenity of Pahalgam — heaven on Earth.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80",
  },
  {
    slug: "north-east",
    name: "Northeast India",
    tagline: "Unexplored Paradise",
    description:
      "Living root bridges, crystal-clear rivers, and ancient tribal culture — India's best-kept secret.",
    image:
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&q=80",
  },
  {
    slug: "goa",
    name: "Goa",
    tagline: "Sun, Sand & Soul",
    description:
      "Golden beaches, Portuguese heritage, and vibrant nightlife — India's favourite coastal escape.",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=80",
    thumbnail:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
  },
];

const TRUST_ITEMS = [
  { icon: Hotel, title: "Luxury Stays", sub: "Handpicked hotels" },
  { icon: Compass, title: "Local Experiences", sub: "Curated adventures" },
  { icon: ShieldCheck, title: "Best Price", sub: "Book with confidence" },
] as const;

const AUTO_SCROLL_MS = 5000;

/* ═══════════════════════════════════════════════════════════════════════════ */

export function HotelsFeaturedDestinations() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const total = DESTINATIONS.length;

  const goTo = useCallback(
    (idx: number) => setActive(((idx % total) + total) % total),
    [total],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, AUTO_SCROLL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, isPaused]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) timerRef.current = setInterval(next, AUTO_SCROLL_MS);
  }, [next, isPaused]);

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

  const dest = DESTINATIONS[active];

  return (
    <section
      className="border-b border-slate-200/60 bg-white py-5 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        {/* ── Main slider ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-xl shadow-lg sm:rounded-2xl">
          {/* Background images — crossfade */}
          {DESTINATIONS.map((d, i) => (
            <div
              key={`bg-${i}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                i === active ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
              aria-hidden={i !== active}
            >
              <Image
                src={d.image}
                alt={d.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1320px"
                priority={i < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            </div>
          ))}

          {/* Content */}
          <div className="relative z-10 flex min-h-[220px] flex-col justify-end px-5 pb-5 pt-8 sm:min-h-[260px] sm:px-8 sm:pb-6 sm:pt-10 lg:min-h-[300px] lg:px-10 lg:pb-8 lg:pt-12">
            <div key={`slide-${active}`} className="animate-[fadeSlideUp_0.45s_ease-out_both] max-w-lg">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 sm:text-[11px]">
                Featured Destination
              </span>
              <h2 className="mt-1.5 text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl lg:text-4xl">
                {dest.name}
              </h2>
              <p className="mt-0.5 text-[12px] font-medium italic text-orange-300/80 sm:text-[13px]">
                {dest.tagline}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-white/70 sm:text-[13px]">
                {dest.description}
              </p>
              <Link
                href={`/destinations/${dest.slug}`}
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
          {DESTINATIONS.map((_, i) => (
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
              aria-label={`Go to ${DESTINATIONS[i].name}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>

        <div
          ref={thumbRef}
          className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:gap-2.5"
        >
          {DESTINATIONS.map((d, i) => (
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
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}