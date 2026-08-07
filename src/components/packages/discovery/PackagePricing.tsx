"use client";

/**
 * src/components/packages/discovery/PackagePricing.tsx
 *
 * The price block — the conversion anchor of the card.
 *
 * Layout:
 *
 *   ₹22,318 /Person      ┌──────────────────────┐
 *                        │ ✨ Customize Your Trip│  ← `highlightSlot`
 *                        │ To Match Your Budget  │
 *                        └──────────────────────┘
 *   Total Trip ₹44,635 · Excl. GST                  ← `footerNote` inlined
 *   ┌──────────────────────────────┐
 *   │ 💳 EMI Available             │                ← `emiSlot`, own section
 *   │ Starting from ₹3,720/month   │
 *   └──────────────────────────────┘
 *
 * The USP badge rides the price row's empty right half, so it costs the card
 * no height at all. The price keeps the left and stays the hero; the badge is
 * clamped to 140–170px and never shrinks the amount (price is `shrink-0`).
 *
 * The EMI section is the one block that does NOT share a row — an
 * affordability figure beside the amount competes with it for the same glance,
 * and it needs the full width for the widget that replaces it later.
 *
 * TYPOGRAPHIC HIERARCHY — the amount is the hero:
 *   ₹22,318      26px extrabold slate-900  ← unmistakably the largest thing
 *   /Person      11px semibold slate-500
 *   Total Trip   11px slate-500, amount in slate-700
 *   EMI block    11px, muted slate on a soft fill
 *
 * The EMI block is subordinated by COLOUR and WEIGHT, never by shrinking it to
 * an unreadable size. Nothing sits on the price's row: an affordability figure
 * parked beside the amount competes for the same glance.
 *
 * The total is never hidden. A per-person figure alone is the single biggest
 * source of drop-off at the payment step on high-ticket travel.
 *
 * DISPLAY ONLY. Derived from the listing's priceINR via package-pricing-display
 * helpers; the amount actually charged comes from the backend at checkout.
 */

import type { ReactNode } from "react";

import { cn, formatInrAmount } from "@/lib/utils";
import {
  type PricePer,
  perPersonFromListing,
  tripTotalFromListing,
} from "@/lib/package-pricing-display";

export type PackagePricingProps = {
  priceInr: number;
  pricePer?: PricePer;
  oldPriceInr?: number;
  /** Rendered between the headline price and the total — the USP badge. */
  highlightSlot?: ReactNode;
  /** Dedicated EMI section, rendered BELOW the total — never on the price row. */
  emiSlot?: ReactNode;
  /** Small print under the total (disclaimer + tax note). */
  footerNote?: ReactNode;
  className?: string;
};

export function PackagePricing({
  priceInr,
  pricePer = "per_couple",
  oldPriceInr,
  highlightSlot,
  emiSlot,
  footerNote,
  className,
}: PackagePricingProps) {
  const perPerson = perPersonFromListing(priceInr, pricePer);
  const tripTotal = tripTotalFromListing(priceInr, pricePer);
  const hasStrike = typeof oldPriceInr === "number" && oldPriceInr > tripTotal && tripTotal > 0;

  return (
    <div className={cn("min-w-0", className)}>
      {perPerson !== null ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="flex shrink-0 items-baseline gap-1 whitespace-nowrap text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
              <span>₹{formatInrAmount(perPerson)}</span>
              <span className="text-[11px] font-semibold text-slate-500">/Person</span>
            </p>
            {highlightSlot ? (
              <div className="min-w-[124px] max-w-[170px] flex-1">{highlightSlot}</div>
            ) : null}
          </div>

          <p className="mt-2 text-[11px] leading-none text-slate-500">
            {hasStrike ? (
              <span className="mr-1.5 text-slate-400 line-through">
                ₹{formatInrAmount(oldPriceInr!)}
              </span>
            ) : null}
            Total Trip{" "}
            <span className="font-bold text-slate-700">₹{formatInrAmount(tripTotal)}</span>
            {footerNote ? <span className="text-slate-400"> · {footerNote}</span> : null}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="shrink-0 whitespace-nowrap text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
              ₹{formatInrAmount(tripTotal)}
            </p>
            {highlightSlot ? (
              <div className="min-w-[124px] max-w-[170px] flex-1">{highlightSlot}</div>
            ) : null}
          </div>

          <p className="mt-2 text-[11px] leading-none text-slate-500">
            Total for the group
            {footerNote ? <span className="text-slate-400"> · {footerNote}</span> : null}
          </p>
        </>
      )}

      {/* Dedicated EMI section — its own block, never the price's row.
          mt-4 (was mt-2.5): the EMI card read as attached to the total above
          it. The extra 6px lets the two sections breathe while still grouping
          as purchase detail. */}
      {emiSlot ? <div className="mt-4">{emiSlot}</div> : null}
    </div>
  );
}

export default PackagePricing;
