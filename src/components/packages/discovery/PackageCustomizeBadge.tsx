"use client";

/**
 * src/components/packages/discovery/PackageCustomizeBadge.tsx
 *
 * Uno Trips' core differentiator, stated on every tile — and it costs the card
 * no height, because it lives in the empty space to the RIGHT of the price:
 *
 *   ₹22,318 /Person      ┌──────────────────────┐
 *                        │ ✨ Customize Your Trip│
 *                        │ To Match Your Budget  │
 *                        └──────────────────────┘
 *
 * SIZING — the constraint is real, not stylistic. At the 3-column breakpoint
 * the tile's inner width is 281px and a six-figure price needs 131px, leaving
 * 142px. The caller clamps this badge to 140–170px; the type inside is sized to
 * fit that column on two single lines without wrapping. That is why line 1 is
 * 11px rather than the 13px it used when the badge spanned the full card.
 *
 * DELIBERATELY QUIET. A soft blue field with slate text, no brand orange and
 * no exclamation. The orange belongs to the CTA and the price stays the
 * darkest, largest thing in the card — this badge must not out-shout either.
 * It reads as a service promise, not a promotion.
 */

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type PackageCustomizeBadgeProps = {
  /**
   * Set false for packages that genuinely cannot be tailored.
   *
   * Defaults to true because the badge is specified to appear on every card.
   * If any package in the catalogue is fixed-itinerary, bind this to
   * `tour.isCustomizable` at the call site — the promise has to be true, since
   * the guest will act on it at the detail step.
   */
  customizable?: boolean;
  className?: string;
};

export function PackageCustomizeBadge({
  customizable = true,
  className,
}: PackageCustomizeBadgeProps) {
  if (!customizable) return null;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center rounded-xl border border-sky-100 bg-sky-50/80 px-2 py-1.5 text-center",
        className,
      )}
    >
      <p className="flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold leading-tight text-slate-800">
        <Sparkles className="h-3 w-3 shrink-0 text-sky-500" aria-hidden />
        Customize Your Trip
      </p>
      <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium leading-tight text-slate-500">
        To Match Your Budget
      </p>
    </div>
  );
}

export default PackageCustomizeBadge;
