"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  Landmark,
  Mountain,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TravelCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_HREFS: Record<string, string> = {
  Adventure: "/packages?q=adventure",
  Family: "/packages?q=family",
  Honeymoon: "/packages?q=honeymoon",
  Pilgrimage: "/packages?q=pilgrimage",
  Luxury: "/packages?q=luxury",
  Corporate: "/packages?q=corporate",
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Adventure: Mountain,
  Family: Users,
  Honeymoon: Heart,
  Pilgrimage: Landmark,
  Luxury: Crown,
  Corporate: Briefcase,
};

export type TravelCategoriesProps = {
  categories: TravelCategory[];
  className?: string;
};

export function TravelCategories({ categories, className }: TravelCategoriesProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-category-card]");
    const step = card ? card.offsetWidth + 16 : 240;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }, []);

  return (
    <section className={cn("bg-[#faf8f4] py-12 sm:py-16", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

        {/* Header — title left, scroll arrows right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                Travel Moods
              </span>
              <span className="h-px w-8 bg-primary" aria-hidden />
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Categories we design for
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-500 sm:text-base">
              Each vertical has its own playbook — pacing, hotels, and guides
              tuned to the traveler in the room.
            </p>
          </div>

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

        {/* Single-line horizontal scroller */}
        <div
          ref={scrollerRef}
          className={cn(
            "mt-8 flex gap-4 overflow-x-auto overflow-y-hidden pb-2",
            "scroll-smooth snap-x snap-mandatory",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.title] ?? Mountain;
            return (
              <Link
                key={c.id}
                href={CATEGORY_HREFS[c.title] ?? "/packages"}
                aria-label={`Explore ${c.title}`}
                data-category-card
                className={cn(
                  "group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900",
                  "w-[190px] sm:w-[220px]",
                  "shadow-[0_14px_40px_-14px_rgba(15,23,42,0.4)] ring-1 ring-black/5",
                  "transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-14px_rgba(234,88,12,0.35)] hover:ring-primary/30",
                )}
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(max-width: 640px) 190px, 220px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />

                  <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-lg font-bold text-white">{c.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/80">
                      {c.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Explore all categories
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

      </div>
    </section>
  );
}
