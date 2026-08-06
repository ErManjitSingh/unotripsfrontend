"use client";

/**
 * src/components/packages/pricing/PackageBookingSummary.tsx
 *
 * The checkout-page price aside, assembled from the reusable parts:
 *
 *     Price Summary            ← header + "Updating…" indicator
 *     ─────────────────
 *     Base price
 *     Upgrades / add-ons
 *     Taxes
 *     Total
 *     ─────────────────
 *     ─────────────────
 *     Continue to Payment      ← <PackagePriceActions />
 *
 * Previously this was ~4,000 characters of JSX on a single line inside
 * package-detail-view.tsx. Behaviour is unchanged: same figures, same submit
 * target, same disabled conditions — only the structure moved.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { fmtINR } from "@/lib/package-customizer-data";
import { PackagePriceActions } from "./PackagePriceActions";
import { PackagePriceSummary, type PackagePriceLine } from "./PackagePriceSummary";

export type PackageBookingSummaryProps = {
  basePriceInr: number;
  basePriceNote?: string;
  lines?: PackagePriceLine[];
  taxInr?: number;
  taxRate?: number;
  totalInr: number;
  /** Amount charged now — token_amount for part payment, else the total. */
  payAmountInr: number;
  /** Part-payment amount, when the package offers one. */
  tokenAmountInr?: number | null;
  /**
   * The payment card the guest selected. Drives the callout and the CTA so
   * the aside reflects the choice instead of always showing full payment.
   * Display only — it changes no amount, no request, and no Razorpay option.
   */
  payOption?: "full" | "token" | "emi";
  /** Platform advance percentage, for the "Pay 40% today" line. */
  tokenPercent?: number;
  guestCount?: number;
  guestSummary?: string;

  loading?: boolean;
  stale?: boolean;

  /** Form the CTA submits. Keeps the existing booking handler in place. */
  formId?: string;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  ctaBusy?: boolean;
  /** Rendered above the CTA — e.g. the "complete traveller details" warning. */
  ctaNotice?: ReactNode;
  /** Applied to the total figure, so callers keep their settle animation. */
  totalClassName?: string;
  className?: string;
};

export function PackageBookingSummary({
  basePriceInr,
  basePriceNote,
  lines,
  taxInr,
  taxRate,
  totalInr,
  payAmountInr,
  tokenAmountInr,
  payOption = "full",
  tokenPercent = 0,
  guestCount,
  guestSummary,
  loading = false,
  stale = false,
  formId,
  ctaLabel = "Continue to payment",
  ctaDisabled = false,
  ctaBusy = false,
  ctaNotice,
  totalClassName,
  className,
}: PackageBookingSummaryProps) {
  const isEmi   = payOption === "emi";
  const isToken = payOption === "token";

  // "Pay today" is only a distinct fact worth its own box when it differs from
  // the trip total — i.e. part payment. Full payment already shows the figure
  // in the breakdown above and again on the CTA.
  const showPayTodayCallout =
    isToken && typeof tokenAmountInr === "number" && tokenAmountInr > 0 && tokenAmountInr < totalInr;

  const percentLabel = tokenPercent > 0 ? `${Math.round(tokenPercent)}%` : null;

  // CTA wording per selected method. The amount and the request are unchanged
  // in every branch — only the words differ.
  const resolvedCtaLabel = isEmi
    ? "Choose EMI Plan"
    : isToken
      ? `Pay ₹${fmtINR(payAmountInr)} Now`
      : ctaLabel;

  const ctaSubtitle = isEmi
    ? "Select your bank and EMI plan securely in Razorpay."
    : isToken
      ? `Pay ${percentLabel ?? "part"} today · Balance before travel`
      : "Secure payment · Instant confirmation";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-[16px] font-extrabold text-slate-900">Price Summary</h2>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          Final price for your selected trip
          {stale ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-ping" />
              Updating…
            </span>
          ) : null}
        </p>
      </header>

      <div className="space-y-4 p-5">
        <PackagePriceSummary
          basePriceInr={basePriceInr}
          basePriceNote={basePriceNote}
          lines={lines}
          taxInr={taxInr}
          taxRate={taxRate}
          totalInr={totalInr}
          guestCount={guestCount}
          guestSummary={guestSummary}
          loading={loading}
          stale={stale}
          totalClassName={totalClassName}
        />

        {!loading ? (
          <>
            {isEmi ? (
              /* EMI charges the full amount, so a "pay only today" figure would
                 be wrong here. The instalment is set by the guest's bank inside
                 the Razorpay window, not by us — so state the method, not a
                 number we do not own. */
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                <p className="text-[11px] font-bold text-blue-900">Selected Payment Method</p>
                <p className="mt-1 text-[15px] font-extrabold text-blue-900">EMI via Razorpay</p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  You&apos;ll pick your bank and tenure on the next step, inside the secure
                  Razorpay window.
                </p>
                {/* Sets expectations for what happens after the CTA. No figures:
                    the rate, tenure and eligible banks are the bank's to state,
                    and the widget above already shows the live ones. */}
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {["Multiple banks", "Choose your tenure", "Interest set by your bank"].map(
                    (benefit) => (
                      <li
                        key={benefit}
                        className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-900 ring-1 ring-blue-100"
                      >
                        {benefit}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : showPayTodayCallout ? (
              <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-3">
                <p className="text-[11px] font-bold text-orange-800">Pay today</p>
                <p className={cn("mt-1 text-xl font-extrabold text-primary", totalClassName)}>
                  ₹{fmtINR(tokenAmountInr!)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Remaining balance before travel.
                </p>
              </div>
            ) : null}

            {/* The affordability widget used to sit here. It moved into the
                "Pay with EMI" card in the payment-options list, so live plans
                appear where the guest actually chooses EMI — and because the
                SDK resolves its container by a single fixed element id, only
                one instance may exist per page. Keep this aside to pricing
                and the CTA. */}

            {ctaNotice}

            <PackagePriceActions
              payAmountInr={payAmountInr}
              label={resolvedCtaLabel}
              // Token/EMI labels already carry their own wording; only the
              // full-payment CTA appends "· ₹total".
              showAmountInLabel={!isEmi && !isToken}
              subtitle={ctaSubtitle}
              formId={formId}
              disabled={ctaDisabled}
              busy={ctaBusy}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default PackageBookingSummary;
