"use client";

/**
 * src/components/packages/pricing/PackagePriceActions.tsx
 *
 * The CTA block that closes every pricing panel: primary button, optional
 * part-payment reassurance, and the trust row.
 *
 * Owns no booking logic — the caller supplies `onClick` (or `formId` for a
 * submit button) and keeps its existing handler. The Razorpay checkout flow
 * is untouched.
 */

import type { ReactNode } from "react";

import { Lock, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { fmtINR } from "@/lib/package-customizer-data";

export type PackagePriceActionsProps = {
  /** Amount rendered on the button — must be what checkout will charge. */
  payAmountInr: number;
  label?: string;
  onClick?: () => void;
  /** When set, renders a submit button bound to that form id instead. */
  formId?: string;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  /** Part-payment amount; shows the "pay only today" reassurance line. */
  tokenAmountInr?: number | null;
  /**
   * Append " · ₹amount" to the label. Off when the label already carries the
   * figure ("Pay ₹18,747 Now") or when no single amount applies ("Continue
   * with EMI", where the bank sets the instalment).
   */
  showAmountInLabel?: boolean;
  /**
   * Replaces the default "Secure payment · Instant confirmation" footnote, so
   * the reassurance matches the selected payment method.
   */
  subtitle?: ReactNode;
  className?: string;
};

export function PackagePriceActions({
  payAmountInr,
  label = "Continue to payment",
  onClick,
  formId,
  disabled = false,
  busy = false,
  busyLabel = "Preparing booking…",
  tokenAmountInr,
  showAmountInLabel = true,
  subtitle,
  className,
}: PackagePriceActionsProps) {
  const showToken =
    typeof tokenAmountInr === "number" && tokenAmountInr > 0 && tokenAmountInr < payAmountInr;

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type={formId ? "submit" : "button"}
        form={formId}
        onClick={formId ? undefined : onClick}
        disabled={disabled || busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-extrabold text-white shadow-[0_8px_20px_-8px_rgba(239,102,20,0.65)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(239,102,20,0.7)] disabled:pointer-events-none disabled:opacity-60"
      >
        {busy ? (
          busyLabel
        ) : (
          <>
            <Lock className="h-4 w-4" aria-hidden />
            {showAmountInLabel ? `${label} · ₹${fmtINR(payAmountInr)}` : label}
          </>
        )}
      </button>

      {showToken ? (
        <p className="text-center text-[11px] font-semibold text-emerald-700">
          Pay just ₹{fmtINR(tokenAmountInr!)} today to confirm
        </p>
      ) : null}

      <p className="flex items-center justify-center gap-1 text-center text-[10px] text-slate-400">
        <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
        {subtitle ?? "Secure payment · Instant confirmation"}
      </p>
    </div>
  );
}

export default PackagePriceActions;
