"use client";

/**
 * src/components/packages/discovery/PackageHeader.tsx
 *
 * Identity block of the vertical card: tour type → name → place & duration.
 *
 * Place and duration share ONE line — "📍 Leh, Ladakh • 5D / 4N" — instead of
 * two stacked rows. The duration also appears as a badge on the image, so the
 * long form ("5 Days / 4 Nights") was spending a whole line to repeat it.
 */

import Link from "next/link";
import { MapPinned } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Pick the part of the joined location string that actually reads as a place.
 *
 *   "Leh, Ladakh, India"                            → "Leh, Ladakh"
 *   "Dream Goa Vacation 4 Nights 5 Days, Goa"       → "Goa"
 *   "Delhi–Manali–Kasol–Jibhi–Delhi, Himachal"      → "Himachal"
 *   "Kerala 5N 6D, Kerala"                          → "Kerala"
 *
 * The API joins destination_name, destination_city, state and country into one
 * string, and on most live packages `destination_name` is an ops-entered
 * itinerary or marketing line rather than a place — so naively taking the
 * leading segments echoes the package title on the row directly beneath it and
 * truncates the real location away.
 *
 * Display-only heuristic, no backend change: drop segments that carry digits
 * (durations, "4 Nights 5 Days"), multi-hop route strings, or that simply
 * repeat the title, then keep the first two survivors. The untouched value
 * remains in the row's `title` tooltip.
 */
export function compactLocation(location: string, packageTitle = "", parts = 2): string {
  const segments = location
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const normalizedTitle = packageTitle.toLowerCase();

  const isPlaceLike = (segment: string) => {
    if (/\d/.test(segment)) return false; // "Kerala 5N 6D", "4 Nights 5 Days"
    if ((segment.match(/[–—-]/g) ?? []).length >= 2) return false; // route strings
    // Long segment that the title already says — pure duplication.
    if (segment.length >= 10 && normalizedTitle.includes(segment.toLowerCase())) return false;
    return true;
  };

  const kept = segments.filter(isPlaceLike);
  // Never render nothing: fall back to the tail (usually state/country), then
  // to the raw value.
  const usable = kept.length > 0 ? kept : segments.slice(-1);

  return usable.slice(0, parts).join(", ") || location;
}

export type PackageHeaderProps = {
  title: string;
  href: string;
  typeLabel?: string;
  destination?: string;
  /** Short form, e.g. "5D / 4N" — shares the line with the destination. */
  durationLabel?: string;
  className?: string;
};

export function PackageHeader({
  title,
  href,
  typeLabel,
  destination,
  durationLabel,
  className,
}: PackageHeaderProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <h3 className="text-[14px] font-bold leading-tight text-slate-900">
        <Link href={href} className="line-clamp-2 hover:text-primary" onClick={(e) => e.stopPropagation()}>
          {title}
        </Link>
      </h3>

      {/* Type pill and place • duration share ONE row — three stacked rows of
          10px metadata was the single largest block of dead height in the body,
          and there is ample horizontal room for both at a 275px tile. */}
      {typeLabel || destination || durationLabel ? (
        <div className="mt-1.5 flex items-center gap-1.5">
          {/* Sparkles icon dropped: ✨ now belongs to the Customize badge in
              the pricing block, and two sparkle marks on one tile read as
              sloppy. Pill, colours and text are otherwise unchanged. */}
          {typeLabel ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary">
              {typeLabel}
            </span>
          ) : null}

          {destination || durationLabel ? (
            <p
              className="flex min-w-0 items-center gap-1 text-[10px] text-slate-500"
              title={destination}
            >
              <MapPinned className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">
                {destination ? compactLocation(destination, title) : null}
                {destination && durationLabel ? (
                  <span className="mx-1 text-slate-300" aria-hidden>
                    •
                  </span>
                ) : null}
                {durationLabel ? (
                  <span className="font-medium text-slate-600">{durationLabel}</span>
                ) : null}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default PackageHeader;
