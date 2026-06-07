"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SUMMER_ESCAPE_CARDS } from "@/lib/summer-escapes-cards";
import { cn } from "@/lib/utils";

export type SummerEscapesSectionProps = {
  className?: string;
  /** Live counts from `getPackages` + destination filter; keyed by slug. */
  packageCountsBySlug?: Record<string, number>;
};

export function SummerEscapesSection({
  className,
  packageCountsBySlug,
}: SummerEscapesSectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-summer-card]");
    const step = card ? card.offsetWidth + 12 : 200;
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
          <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-pretty font-sans text-xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-2xl lg:text-[1.65rem]">
                Summer Escapes at Lowest prices!
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-[0.9375rem]">
                Explore Unmissable Offers. Use Code:{" "}
                <span className="font-semibold text-neutral-800">WANDERSUMMER</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
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
              const countLine =
                typeof n === "number"
                  ? `${n} ${n === 1 ? "package" : "packages"}`
                  : null;
              return (
                <Link
                  key={`${card.slug}-${card.label}-${i}`}
                  href={`/destinations/${card.slug}`}
                  data-summer-card
                  className={cn(
                    "group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-100 sm:rounded-3xl",
                    "w-[42%] min-w-[136px] max-w-[176px] sm:w-[30%] sm:min-w-[156px] sm:max-w-[188px] md:w-[23%] lg:w-[19%] lg:max-w-[200px]",
                    "shadow-[0_12px_40px_-14px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.06]",
                    "transition duration-300 ease-out will-change-transform",
                    "hover:-translate-y-1.5 hover:shadow-[0_22px_48px_-12px_rgba(234,88,12,0.28)] hover:ring-primary/30",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  )}
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={card.image}
                      alt={card.label}
                      fill
                      sizes="(max-width: 640px) 42vw, (max-width: 1024px) 23vw, 200px"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.06]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/35 to-primary/[0.12]"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-inset ring-white/25 transition duration-300 group-hover:opacity-100"
                      aria-hidden
                    />

                    <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 sm:p-3">
                      <div
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-xl border border-white/20 px-2.5 py-2 sm:px-3 sm:py-2.5",
                          "bg-gradient-to-r from-white/18 to-white/8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-md",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                            Summer deal
                          </p>
                          <p className="font-display text-base font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-lg">
                            {card.label}
                          </p>
                          {countLine ? (
                            <p className="mt-0.5 truncate text-[11px] font-semibold tabular-nums text-white/90">
                              {countLine}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-white/25 transition duration-300 sm:h-10 sm:w-10"
                          aria-hidden
                        >
                          <ArrowUpRight className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={2.25} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
