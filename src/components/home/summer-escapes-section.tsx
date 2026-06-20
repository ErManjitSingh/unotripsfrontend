"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag,
  Shield,
  Clock,
  Headphones,
  Lock,
} from "lucide-react";
import { SUMMER_ESCAPE_CARDS } from "@/lib/summer-escapes-cards";
import { cn } from "@/lib/utils";

export type SummerEscapesSectionProps = {
  className?: string;
  packageCountsBySlug?: Record<string, number>;
};

const TRUST_BADGES = [
  { icon: Shield,     title: "Best Price Guarantee", sub: "We match any price" },
  { icon: Clock,      title: "Flexible Booking",     sub: "Free cancellation on many trips" },
  { icon: Headphones, title: "24/7 Support",          sub: "We're here to help" },
  { icon: Lock,       title: "Secure Payments",       sub: "100% safe & secure" },
] as const;

export function SummerEscapesSection({
  className,
  packageCountsBySlug,
}: SummerEscapesSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-summer-card]");
    const step = card ? card.offsetWidth + 12 : 260;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  }, []);

  return (
    <section
      className={cn(
        "border-b border-slate-200/80 bg-slate-100 py-6 sm:py-8 lg:py-10",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] sm:rounded-3xl sm:p-6 lg:p-8">

          {/* ── Header ── */}
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-xl font-black leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-[1.75rem]">
                <span className="text-2xl leading-none">🌴</span>
                Summer Escapes
                <span className="text-lg text-primary leading-none">✦</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-[0.9375rem]">
                Handpicked destinations for your next getaway.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Tag className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                Up to 40% OFF on unforgettable experiences
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
              <Link
                href="/packages"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All &rsaquo;
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-10 sm:w-10"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-10 sm:w-10"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Cards ── */}
          <div
            ref={scrollerRef}
            className={cn(
              "-mx-1 flex gap-3 overflow-x-auto overflow-y-hidden px-1 pb-1 pt-0.5",
              "scroll-smooth snap-x snap-mandatory",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {SUMMER_ESCAPE_CARDS.map((card, i) => {
              const n = packageCountsBySlug?.[card.slug];
              const countLabel =
                typeof n === "number"
                  ? `${n} ${n === 1 ? "package" : "packages"} available`
                  : "packages available";

              return (
                <Link
                  key={`${card.slug}-${i}`}
                  href={`/destinations/${card.slug}`}
                  data-summer-card
                  className={cn(
                    "group relative shrink-0 snap-start overflow-hidden rounded-2xl sm:rounded-3xl",
                    "w-[48%] min-w-[160px] sm:w-[31%] sm:min-w-[200px] lg:w-[calc(20%-10px)] lg:min-w-[200px]",
                    "aspect-[3/4]",
                    "shadow-[0_12px_40px_-14px_rgba(15,23,42,0.28)]",
                    "transition duration-300 ease-out will-change-transform",
                    "hover:-translate-y-1.5 hover:shadow-[0_22px_48px_-12px_rgba(234,88,12,0.3)]",
                  )}
                >
                  {/* Image */}
                  <Image
                    src={card.image}
                    alt={card.label}
                    fill
                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 260px"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
                  />

                  {/* Gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                  {/* Discount badge */}
                  <div className="absolute left-3 top-3 z-10">
                    <span className="flex items-center gap-1 rounded-full border border-primary/25 bg-white px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm">
                      <Tag className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                      {card.discount}
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
                    <div className="mb-0.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-white/70" strokeWidth={2} />
                      <p className="text-base font-bold leading-tight text-white sm:text-lg">
                        {card.label}
                      </p>
                    </div>
                    <p className="mb-2.5 text-[11px] text-white/65">{countLabel}</p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-primary sm:text-base">
                          {card.startingPrice}
                        </span>
                        <span className="text-[11px] text-white/45 line-through">
                          {card.originalPrice}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm sm:text-xs">
                        Explore →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Trust badges ── */}
          <div className="mt-6 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-5 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 px-4 first:pl-0 last:pr-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
