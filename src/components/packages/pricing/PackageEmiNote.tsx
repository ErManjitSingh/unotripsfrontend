/**
 * src/components/packages/pricing/PackageEmiNote.tsx
 *
 * Static "EMI available" label for LISTING surfaces.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * NO NUMBERS. NO TENURE. NO SDK.
 *
 * This replaces the old PackageAffordabilityPlaceholder, which printed
 * `Math.ceil(total / 12)` — a flat, interest-free division that no bank would
 * ever honour. It is deliberately NOT the Razorpay Affordability Widget:
 *
 *   - Listing tiles only know `priceINR`, a PRE-GST estimate. The widget must
 *     be fed the exact amount checkout will charge, or every plan it quotes is
 *     wrong. See src/lib/razorpay-affordability.ts.
 *   - A results grid would mount one widget (and one SDK render) per tile.
 *
 * Real, bank-specific plans come from <AffordabilityWidget /> on the detail
 * and checkout surfaces, where the amount comes from /fulfillment-price.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { CreditCard } from "lucide-react";

import { cn } from "@/lib/utils";
import { PACKAGE_OFFERS } from "@/lib/package-pricing-display";

export type PackageEmiNoteProps = {
  /**
   * "inline"  — single line, for a compact price card.
   * "section" — bordered block beneath the price on a listing tile.
   */
  variant?: "inline" | "section";
  /** Hide entirely. Defaults to true. */
  enabled?: boolean;
  className?: string;
};

const LABEL = "EMI available at checkout";

export function PackageEmiNote({
  variant = "section",
  enabled = true,
  className,
}: PackageEmiNoteProps) {
  if (!enabled || !PACKAGE_OFFERS.emiTeaser) return null;

  if (variant === "inline") {
    return (
      <p
        className={cn("flex items-center gap-1.5 text-[11px] text-slate-600", className)}
        data-emi-note="inline"
      >
        <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <span className="font-semibold text-slate-900">{LABEL}</span>
      </p>
    );
  }

  return (
    <div
      className={cn("rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2", className)}
      data-emi-note="section"
    >
      <p className="flex items-center gap-1.5 text-[11px] font-bold leading-none text-slate-700">
        <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        EMI Available
      </p>
      <p className="mt-1.5 text-[11px] leading-none text-slate-500">
        Plans and eligibility shown at checkout
      </p>
    </div>
  );
}

export default PackageEmiNote;
