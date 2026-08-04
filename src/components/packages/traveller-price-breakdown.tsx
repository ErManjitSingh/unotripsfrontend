"use client";

/**
 * src/components/packages/traveller-price-breakdown.tsx
 *
 * MakeMyTrip-style "Traveller Update" price diff panel.
 *
 * Shows exactly what changed when the guest updates their traveller count:
 *
 *   Traveller Update
 *   2 Adults → 5 Adults
 *
 *   Changes Applied
 *   ✓ Room Allocation:  1 Room → 2 Rooms
 *   ✓ Extra Beds:       0 → 1               +₹4,000
 *   ✓ Vehicle:          Sedan → SUV          +₹2,500
 *   ✓ Hotel Cost:       ₹30,000 → ₹38,000   +₹8,000
 *   ✓ GST:              ₹1,500 → ₹2,075     +₹575
 *   ──────────────────────────────────────────────────
 *   New Package Total                         ₹56,075
 *
 * PROPS
 * ─────
 *   diff:       TravellerPriceDiff from useTravellerPriceDiff hook.
 *   isLoading:  Show skeleton while the diff is being fetched.
 *   onAccept:   Called when the guest taps "Apply Changes".
 *   onDismiss:  Called when the guest taps "Cancel".
 *               Typically closes a modal or reverts the selection.
 *
 * USAGE
 * ─────
 *   <TravellerPriceBreakdown
 *     diff={diff}
 *     isLoading={isLoading}
 *     onAccept={handleAccept}
 *     onDismiss={handleDismiss}
 *   />
 */

import type { TravellerPriceDiff, TravellerDiffLineItem } from "@/lib/package-fulfillment-types";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatInr(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(abs);
  return amount < 0 ? `−${formatted}` : formatted;
}

function formatDelta(delta: number): string {
  const prefix = delta >= 0 ? "+" : "−";
  const abs = Math.abs(delta);
  return `${prefix}${new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(abs)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChangeRow({ item }: { item: TravellerDiffLineItem }) {
  const hasDelta = item.delta !== null && item.delta !== 0;
  const isPositive = (item.delta ?? 0) >= 0;

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      {/* Left: label + before→after */}
      <div className="flex items-start gap-2 min-w-0">
        {/* Checkmark */}
        <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">
          ✓
        </span>
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-700">{item.label}</span>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
            <span className="line-through opacity-60">{item.before}</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium text-gray-800">{item.after}</span>
          </div>
        </div>
      </div>

      {/* Right: monetary delta */}
      {hasDelta && (
        <span
          className={cn(
            "flex-shrink-0 text-sm font-semibold tabular-nums",
            isPositive ? "text-orange-600" : "text-green-600",
          )}
        >
          {formatDelta(item.delta!)}
        </span>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded mt-4" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export type TravellerPriceBreakdownProps = {
  diff:       TravellerPriceDiff | null;
  isLoading?: boolean;
  /** Called when the guest confirms the traveller change. */
  onAccept?:  () => void;
  /** Called when the guest cancels (reverts to previous selection). */
  onDismiss?: () => void;
  /** Additional class names for the container. */
  className?: string;
};

export function TravellerPriceBreakdown({
  diff,
  isLoading = false,
  onAccept,
  onDismiss,
  className,
}: TravellerPriceBreakdownProps) {
  if (isLoading && !diff) {
    return (
      <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
        <Skeleton />
      </div>
    );
  }

  if (!diff) return null;

  const deltaTotal = diff.delta_total;
  const isMoreExpensive = deltaTotal > 0;
  const isCheaper = deltaTotal < 0;
  const noChange = deltaTotal === 0;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500 mb-1">
          Traveller Update
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 line-through">{diff.from_label}</span>
          <span className="text-gray-400 text-sm">→</span>
          <span className="text-sm font-semibold text-gray-900">{diff.to_label}</span>
        </div>
      </div>

      {/* ── Changes list ────────────────────────────────────────────────────── */}
      <div className="px-4 py-2">
        {diff.changes.length === 0 ? (
          <p className="py-3 text-sm text-gray-500 text-center">
            No pricing changes for this traveller update.
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-1">
              Changes Applied
            </p>
            {diff.changes.map((item, idx) => (
              <ChangeRow key={`${item.label}-${idx}`} item={item} />
            ))}
          </>
        )}
      </div>

      {/* ── Total ───────────────────────────────────────────────────────────── */}
      <div className="mx-4 my-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">New Package Total</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatInr(diff.new_grand_total)}
            </p>
          </div>
          {!noChange && (
            <span
              className={cn(
                "text-sm font-semibold px-2 py-1 rounded-full",
                isMoreExpensive && "bg-orange-50 text-orange-600",
                isCheaper      && "bg-green-50  text-green-600",
              )}
            >
              {formatDelta(deltaTotal)}
            </span>
          )}
        </div>

        {noChange && (
          <p className="text-xs text-gray-400 mt-1">
            Price unchanged from your previous selection.
          </p>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      {(onAccept || onDismiss) && (
        <div className="flex gap-2 px-4 pb-4">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Apply Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TravellerPriceBreakdown;