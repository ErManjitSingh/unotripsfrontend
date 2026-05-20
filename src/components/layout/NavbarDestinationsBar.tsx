"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { destinationSliderIconMap } from "@/components/destination/destination-slider-icons";
import {
  SLIDER_INDIA,
  SLIDER_INTERNATIONAL,
} from "@/lib/destination-catalog";
import { cn } from "@/lib/utils";

export type NavbarDestinationRegion = "india" | "international";

/** Sync India / International with current route and package hash links. */
export function useNavbarDestinationRegion(): [
  NavbarDestinationRegion,
  Dispatch<SetStateAction<NavbarDestinationRegion>>,
] {
  const pathname = usePathname();
  const [region, setRegion] = useState<NavbarDestinationRegion>("india");

  useEffect(() => {
    const seg = pathname?.split("/")[2];
    if (!seg) return;
    if (SLIDER_INTERNATIONAL.some((d) => d.slug === seg)) setRegion("international");
    else if (SLIDER_INDIA.some((d) => d.slug === seg)) setRegion("india");
  }, [pathname]);

  useEffect(() => {
    const applyHash = () => {
      if (typeof window === "undefined") return;
      const h = window.location.hash;
      if (h === "#international-packages") setRegion("international");
      if (h === "#india-packages") setRegion("india");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return [region, setRegion];
}

export function NavbarDestinationToggle({
  region,
  onChange,
  className,
  compact,
}: {
  region: NavbarDestinationRegion;
  onChange: (next: NavbarDestinationRegion) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-2 rounded-full border border-slate-200 bg-surface p-px shadow-inner",
        compact ? "h-7 w-full max-w-[12.5rem]" : "h-7 w-[min(100%,11.5rem)] sm:h-7 sm:max-w-[13rem]",
        className,
      )}
      role="group"
      aria-label="Domestic or international destinations"
    >
      <motion.div
        className="pointer-events-none absolute top-px bottom-px z-0 w-[calc(50%-2px)] rounded-full bg-accent shadow-sm"
        initial={false}
        animate={{ left: region === "india" ? "2px" : "calc(50% + 0px)" }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />
      <button
        type="button"
        onClick={() => onChange("india")}
        className={cn(
          "relative z-10 rounded-full px-1.5 text-[9px] font-semibold leading-none transition-colors sm:px-2 sm:text-[10px]",
          region === "india" ? "text-white" : "text-slate-600 hover:text-ink",
        )}
      >
        Domestic
      </button>
      <button
        type="button"
        onClick={() => onChange("international")}
        className={cn(
          "relative z-10 rounded-full px-1 text-[9px] font-semibold leading-none transition-colors sm:px-1.5 sm:text-[10px]",
          region === "international" ? "text-white" : "text-slate-600 hover:text-ink",
        )}
      >
        International
      </button>
    </div>
  );
}

const NAV_DEST_PAGE = 5;

/**
 * Navbar destination strip — no Swiper. **5 destinations at a time**; arrows step by 5.
 */
export function NavbarDestinationsInlineSwiper({
  region,
  onNavigate,
}: {
  region: NavbarDestinationRegion;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = region === "india" ? SLIDER_INDIA : SLIDER_INTERNATIONAL;
  const [start, setStart] = useState(0);

  const routeSlug =
    pathname?.startsWith("/destinations/") && pathname.split("/")[2]
      ? pathname.split("/")[2]
      : null;

  const maxStart = Math.max(0, items.length - NAV_DEST_PAGE);

  useEffect(() => {
    setStart(0);
  }, [region]);

  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [maxStart, items.length]);

  useEffect(() => {
    if (!routeSlug) return;
    const idx = items.findIndex((d) => d.slug === routeSlug);
    if (idx === -1) return;
    const pageStart = Math.floor(idx / NAV_DEST_PAGE) * NAV_DEST_PAGE;
    setStart(Math.min(pageStart, maxStart));
  }, [routeSlug, region, items, maxStart]);

  const visible = items.slice(start, start + NAV_DEST_PAGE);
  const padded: Array<(typeof items)[number] | null> = [...visible];
  while (padded.length < NAV_DEST_PAGE) padded.push(null);
  const canPrev = start > 0;
  const canNext = start < maxStart;

  const goPrev = useCallback(() => {
    setStart((s) => Math.max(0, s - NAV_DEST_PAGE));
  }, []);

  const goNext = useCallback(() => {
    setStart((s) => Math.min(maxStart, s + NAV_DEST_PAGE));
  }, [maxStart]);

  const pageStarts = (() => {
    if (items.length <= NAV_DEST_PAGE) return [0];
    const out: number[] = [];
    for (let s = 0; s < maxStart; s += NAV_DEST_PAGE) out.push(s);
    out.push(maxStart);
    return [...new Set(out)].sort((a, b) => a - b);
  })();
  const pageIndex = Math.max(0, pageStarts.indexOf(start));

  const navBtn =
    "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary/30 hover:text-primary hover:shadow disabled:pointer-events-none disabled:opacity-25 sm:h-9 sm:w-9";

  return (
    <div className="relative flex w-full min-w-0 flex-1 flex-col gap-1">
      <div className="relative flex min-h-[68px] items-center sm:min-h-[72px]">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className={cn(navBtn, "left-0.5 sm:left-1")}
          aria-label="Previous destinations"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${region}-${start}`}
            initial={{ opacity: 0.75 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="grid w-full flex-1 grid-cols-5 gap-0 px-8 sm:gap-0.5 sm:px-10"
          >
            {padded.map((d, i) => {
              if (!d) {
                return (
                  <div key={`pad-${start}-${i}`} className="min-h-[64px]" aria-hidden />
                );
              }
              const Icon = destinationSliderIconMap[d.iconKey];
              const href = `/destinations/${d.slug}`;
              const active = routeSlug === d.slug;
              return (
                <Link
                  key={d.id}
                  href={href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "group relative flex min-h-[64px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-center transition-colors duration-200 sm:min-h-[68px] sm:gap-2 sm:px-1.5",
                    "hover:bg-slate-50",
                    active && "bg-primary/[0.04]",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 shrink-0 transition-colors sm:h-7 sm:w-7",
                      active ? "text-primary" : "text-slate-500 group-hover:text-slate-700",
                    )}
                    aria-hidden
                    strokeWidth={1.35}
                  />
                  <span
                    className={cn(
                      "line-clamp-2 w-full px-0.5 text-[10px] font-medium leading-snug sm:text-[11px]",
                      active ? "font-semibold text-primary" : "text-slate-600 group-hover:text-slate-800",
                    )}
                  >
                    {d.name}
                  </span>
                  <span
                    className={cn(
                      "absolute bottom-1.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary transition-opacity sm:bottom-2 sm:w-9",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className={cn(navBtn, "right-0.5 sm:right-1")}
          aria-label="Next destinations"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      {pageStarts.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-0.5" role="tablist" aria-label="Destination pages">
          {pageStarts.map((pageStart, i) => (
            <button
              key={pageStart}
              type="button"
              onClick={() => setStart(pageStart)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === pageIndex ? "w-6 bg-primary shadow-sm" : "w-1.5 bg-slate-300 hover:bg-slate-400",
              )}
              aria-label={`Page ${i + 1}`}
              aria-current={i === pageIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
