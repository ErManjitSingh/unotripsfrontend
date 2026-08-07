"use client";

/**
 * src/components/packages/pricing/PackageOffers.tsx
 *
 * Promotional chips shown alongside package pricing (listing card, detail
 * panel, booking summary).
 *
 * Display-only. Renders nothing it cannot back up: the bank-offer chip is
 * gated behind PACKAGE_OFFERS.bankOffers, which ships OFF until real offers
 * are configured on the Razorpay account. Callers may also pass explicit
 * `offers` (e.g. a seasonal-offer string from the API) which always render.
 */

import { Gift, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { PACKAGE_OFFERS } from "@/lib/package-pricing-display";

export type PackageOffersProps = {
  /**
   * Explicit offer lines from a real data source. Always rendered.
   * Leave undefined to show only the globally-configured chips.
   */
  offers?: string[];
  /** Override the global bank-offer switch for this one surface. */
  showBankOffers?: boolean;
  className?: string;
};

export function PackageOffers({ offers, showBankOffers, className }: PackageOffersProps) {
  const bankOffers = showBankOffers ?? PACKAGE_OFFERS.bankOffers;
  const explicit = offers?.filter((o) => o.trim().length > 0) ?? [];

  if (!bankOffers && explicit.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label="Offers">
      {explicit.map((offer) => (
        <li
          key={offer}
          className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"
        >
          <Tag className="h-3 w-3 shrink-0" aria-hidden />
          {offer}
        </li>
      ))}
      {bankOffers ? (
        <li className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
          <Gift className="h-3 w-3 shrink-0" aria-hidden />
          Bank offers at payment
        </li>
      ) : null}
    </ul>
  );
}

export default PackageOffers;
