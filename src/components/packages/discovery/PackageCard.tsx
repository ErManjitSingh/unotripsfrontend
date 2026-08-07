"use client";

/**
 * src/components/packages/discovery/PackageCard.tsx
 *
 * Vertical package tile — the replacement for the landscape PackageListRow.
 *
 * ┌──────────────────────────────┐
 * │  IMAGE  ♡  badges            │  PackageImage
 * ├──────────────────────────────┤
 * │  Type · Name                 │  PackageHeader
 * │  Destination · 5D/4N         │
 * │  chips chips chips           │  PackageInfo
 * │  ──────────────────────────  │
 * │  ₹22,318/Pp  ┌────────────┐  │  PackagePricing — price keeps the left
 * │              │✨ Customize │  │  PackageCustomizeBadge rides the empty
 * │              │ Your Trip  │  │  right half, costing no card height
 * │              └────────────┘  │
 * │  Total Trip ₹44,635 · Excl.  │
 * │  ┌────────────────────────┐  │
 * │  │ 💳 EMI Available       │  │  PackageEmiNote — static label only.
 * │  │ Plans shown at checkout│  │  ← no figure: a tile has no payable amount
 * │  └────────────────────────┘  │
 * │  🎁 Offers (when enabled)    │  PackageOffers
 * │  ──────────────────────────  │
 * │  [View Package]   [Enquire]  │  PackageActions
 * └──────────────────────────────┘
 *
 * Height is kept down by tightening the metadata above the fold line — type
 * pill and place share a row, chips cap at three — NOT by squeezing the price
 * block. The pricing section is the one part of the card that gets room.
 *
 * Equal-height tiles: the card is a flex column and the header block grows, so
 * price and CTA sit on a common baseline across a row regardless of how long
 * the package name runs.
 */

import { useRouter } from "next/navigation";

import type { TourPackage } from "@/lib/constants";
import { formatTourType, packageDetailHref } from "@/lib/packages";
import { cn } from "@/lib/utils";
import {
  PackageEmiNote,
  PackageOffers,
} from "@/components/packages/pricing";

import { PackageActions } from "./PackageActions";
import { PackageCustomizeBadge } from "./PackageCustomizeBadge";
import { PackageHeader } from "./PackageHeader";
import { PackageImage } from "./PackageImage";
import { PackageInfo } from "./PackageInfo";
import { PackagePricing } from "./PackagePricing";

export type PackageCardProps = {
  tour: TourPackage;
  /** Editorial "Popular Today" badge — typically the first result. */
  showPopularTag?: boolean;
  /** Priority-load images in the first grid row. */
  priority?: boolean;
  className?: string;
};

export function PackageCard({ tour, showPopularTag, priority, className }: PackageCardProps) {
  const router = useRouter();
  const href = packageDetailHref(tour);
  const sku = (tour.slug ?? tour.id).slice(0, 8).toUpperCase();

  // One short form, used both on the image badge and in the meta line.
  const durationChip =
    tour.durationDays > 0 ? `${tour.durationDays}D / ${tour.durationNights}N` : undefined;

  return (
    <article
      onClick={() => router.push(href)}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_16px_-6px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_-14px_rgba(15,23,42,0.22)]",
        className,
      )}
    >
      <PackageImage
        src={tour.image}
        alt={tour.title}
        durationLabel={durationChip}
        showPopular={showPopularTag}
        discountPct={tour.discountPct}
        priority={priority}
      />

      <div className="flex flex-1 flex-col p-2.5">
        {/* Grows so the price rail aligns across the row */}
        <div className="flex-1">
          <PackageHeader
            title={tour.title}
            href={href}
            typeLabel={formatTourType(tour.packageType)}
            destination={tour.location?.trim()}
            durationLabel={durationChip}
          />
          <PackageInfo tour={tour} className="mt-2" />
        </div>

        <div className="mt-2.5 border-t border-dashed border-slate-200 pt-3">
          <PackagePricing
            priceInr={tour.priceINR}
            pricePer={tour.pricePer}
            oldPriceInr={tour.oldPriceINR}
            /* Static EMI label — no figure, no tenure. A tile only knows the
               pre-GST listing price, which is not what checkout charges, so it
               must not feed the Razorpay Affordability Widget. The widget runs
               on the detail and checkout pages against /fulfillment-price. */
            highlightSlot={<PackageCustomizeBadge />}
            emiSlot={<PackageEmiNote variant="section" />}
            footerNote="Excl. GST"
          />
          <PackageOffers className="mt-2" />
        </div>

        {/* mt-5 (was mt-2.5): the CTA was sitting flush against the EMI card.
            10px more separation reads as "this is the action", not "this is
            part of the box above it". */}
        <PackageActions
          className="mt-5"
          href={href}
          tourTitle={tour.title}
          tourSku={sku}
        />
      </div>
    </article>
  );
}

export default PackageCard;
