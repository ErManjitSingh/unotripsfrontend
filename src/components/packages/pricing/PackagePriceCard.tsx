"use client";

/**
 * src/components/packages/pricing/PackagePriceCard.tsx
 *
 * The price rail of a package listing tile — the block that used to be a
 * near-empty "₹X /Person + View Details" column.
 *
 * Hierarchy (top → bottom), mirroring MMT/Goibibo listing tiles:
 *
 *     Starts From
 *     ₹22,318 /Person          ← the anchor, largest type on the card
 *     Total ₹44,635            ← context so the click is informed
 *     ─────────────────
 *     💳 EMI from ₹3,719/mo    ← affordability slot (placeholder today)
 *     🎁 Bank offers           ← offer visibility
 *     ─────────────────
 *     [ View Details ]
 *     Enquire now
 *
 * Display-only: every figure is derived from the listing's `priceINR` via
 * package-pricing-display helpers. Nothing here is charged — the authoritative
 * price is fetched on the detail page from /fulfillment-price.
 */

import type { ReactNode } from "react";

import { cn, formatInrAmount } from "@/lib/utils";
import {
  type PricePer,
  perPersonFromListing,
  tripTotalFromListing,
} from "@/lib/package-pricing-display";

import { PackageEmiNote } from "./PackageEmiNote";
import { PackageOffers } from "./PackageOffers";

export type PackagePriceCardProps = {
  /** Listing price as stored by Ops (TourPackage.priceINR). */
  priceInr: number;
  /** Basis the stored price is quoted in (TourPackage.pricePer). */
  pricePer?: PricePer;
  /** Struck-through "was" price, when Ops configured one. */
  oldPriceInr?: number;
  /** Primary CTA — usually a <Link>/<Button> to the detail page. */
  action: ReactNode;
  /** Optional secondary row (e.g. the enquiry trigger). */
  secondaryAction?: ReactNode;
  /** Explicit offer lines from a real data source. */
  offers?: string[];
  className?: string;
};

export function PackagePriceCard({
  priceInr,
  pricePer = "per_couple",
  oldPriceInr,
  action,
  secondaryAction,
  offers,
  className,
}: PackagePriceCardProps) {
  const perPerson = perPersonFromListing(priceInr, pricePer);
  const tripTotal = tripTotalFromListing(priceInr, pricePer);
  const hasDiscount = typeof oldPriceInr === "number" && oldPriceInr > tripTotal && tripTotal > 0;
  const discountPct = hasDiscount
    ? Math.round(((oldPriceInr! - tripTotal) / oldPriceInr!) * 100)
    : 0;

  return (
    <div className={cn("flex flex-col justify-center gap-3", className)}>
      {/* ── Price anchor ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Starts from
          </p>
          {hasDiscount && discountPct > 0 ? (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {discountPct}% off
            </span>
          ) : null}
        </div>

        {perPerson !== null ? (
          <>
            <p className="mt-0.5 flex items-baseline gap-1 text-2xl font-extrabold leading-none tracking-tight text-slate-900">
              ₹{formatInrAmount(perPerson)}
              <span className="text-xs font-semibold text-slate-500">/Person</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {hasDiscount ? (
                <span className="mr-1.5 line-through text-slate-400">
                  ₹{formatInrAmount(oldPriceInr!)}
                </span>
              ) : null}
              Total ₹{formatInrAmount(tripTotal)}
            </p>
          </>
        ) : (
          <>
            <p className="mt-0.5 text-2xl font-extrabold leading-none tracking-tight text-slate-900">
              ₹{formatInrAmount(tripTotal)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Total for the group</p>
          </>
        )}
      </div>

      {/* ── Affordability + offers ───────────────────────────────────────
          Static label by design: `tripTotal` here is a pre-GST listing
          estimate, not the amount checkout charges, so it must not drive the
          Razorpay widget. Real plans render on the detail/checkout pages. */}
      <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-3">
        <PackageEmiNote variant="inline" />
        <PackageOffers offers={offers} />
        <p className="text-[10px] text-slate-400">Excl. GST · Final price at checkout</p>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        {action}
        {secondaryAction ? (
          <div className="flex items-center justify-center text-xs font-semibold text-primary">
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PackagePriceCard;
