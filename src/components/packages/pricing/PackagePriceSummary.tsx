"use client";

/**
 * src/components/packages/pricing/PackagePriceSummary.tsx
 *
 * The canonical price line-item table. One implementation, three call sites
 * (detail sidebar, checkout aside, and any future surface) — replacing three
 * hand-rolled copies that had already drifted apart in wording and in which
 * rows they chose to show.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * PURE PRESENTATION. Every value is passed in, already computed by the
 * backend via /fulfillment-price. This component adds no arithmetic beyond
 * dividing the displayed total by head count for the "per person" caption.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/lib/utils";
import { fmtINR } from "@/lib/package-customizer-data";

export type PackagePriceLine = {
  label: string;
  /** Secondary caption under the label (e.g. "₹12,000 × 3 guests"). */
  note?: string;
  amountInr: number;
  /** Render with a leading "+". Defaults to true for everything but base. */
  additive?: boolean;
};

export type PackagePriceSummaryProps = {
  /** Pre-tax base package amount. */
  basePriceInr: number;
  /** Caption under "Base package", e.g. "₹12,000 × 3 guests". */
  basePriceNote?: string;
  /** Upgrade / extra rows. Zero-amount rows are dropped automatically. */
  lines?: PackagePriceLine[];
  /** Total GST. Rendered as its own "Fees & Taxes" row when > 0. */
  taxInr?: number;
  /** e.g. 0.05 → renders "GST 5%". */
  taxRate?: number;
  /** GST-inclusive grand total. */
  totalInr: number;
  /**
   * Render the "Total" row. Turn off where the surface already shows the grand
   * total in a headline above the breakdown (the detail sidebar), so the same
   * figure isn't printed twice. The value is still required — the per-person
   * caption and callers' arithmetic depend on it.
   */
  showTotal?: boolean;
  /** Head count for the "₹X per person" caption. Omit to hide it. */
  guestCount?: number;
  /** Extra caption appended after the per-person figure. */
  guestSummary?: string;
  /** Show skeleton rows instead of figures. */
  loading?: boolean;
  /** Dim the panel while a newer price is in flight. */
  stale?: boolean;
  /** Applied to the total row — lets callers keep their settle animation. */
  totalClassName?: string;
  className?: string;
};

export function PackagePriceSummary({
  basePriceInr,
  basePriceNote,
  lines = [],
  taxInr = 0,
  taxRate,
  totalInr,
  showTotal = true,
  guestCount = 0,
  guestSummary,
  loading = false,
  stale = false,
  totalClassName,
  className,
}: PackagePriceSummaryProps) {
  if (loading) {
    return (
      <div
        className={cn("space-y-3", className)}
        aria-live="polite"
        aria-busy="true"
        data-testid="price-summary-loading"
      >
        <span className="sr-only">Calculating your price…</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex justify-between">
            <span className="h-3 w-24 rounded bg-slate-100 motion-safe:animate-pulse" />
            <span className="h-3 w-16 rounded bg-slate-100 motion-safe:animate-pulse" />
          </div>
        ))}
        {showTotal ? (
          <div className="h-9 w-full rounded-lg bg-slate-50 motion-safe:animate-pulse" />
        ) : null}
      </div>
    );
  }

  const visibleLines = lines.filter((l) => Number.isFinite(l.amountInr) && l.amountInr > 0);
  const taxPct = typeof taxRate === "number" ? Math.round(taxRate * 100) : null;

  return (
    <div
      className={cn(
        // Without the total row the list is the whole panel, so it gets a
        // touch more air between rows rather than reading as a dense footnote.
        showTotal ? "space-y-2" : "space-y-2.5",
        "text-[13px] transition-opacity duration-200",
        stale && "opacity-50",
        className,
      )}
      data-testid="price-summary"
    >
      <Row label="Base package" note={basePriceNote} amount={`₹${fmtINR(basePriceInr)}`} />

      {visibleLines.map((line) => (
        <Row
          key={line.label}
          label={line.label}
          note={line.note}
          amount={`${line.additive === false ? "" : "+"}₹${fmtINR(line.amountInr)}`}
        />
      ))}

      {taxInr > 0 ? (
        <Row
          label="Fees & Taxes"
          note={taxPct !== null ? `GST ${taxPct}%` : undefined}
          amount={`+₹${fmtINR(taxInr)}`}
        />
      ) : null}

      {showTotal ? (
        <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5 text-[15px] font-extrabold text-slate-900">
          <span>Total</span>
          <span className={totalClassName}>₹{fmtINR(totalInr)}</span>
        </div>
      ) : null}

      {showTotal && guestCount > 0 ? (
        <p className="text-right text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">
            ₹{fmtINR(Math.round(totalInr / guestCount))}
          </span>{" "}
          per person{guestSummary ? ` · ${guestSummary}` : null}
        </p>
      ) : null}
    </div>
  );
}

function Row({ label, note, amount }: { label: string; note?: string; amount: string }) {
  return (
    <div className="flex justify-between gap-3 text-slate-600">
      <div className="min-w-0">
        <span>{label}</span>
        {note ? <span className="block text-[10px] text-slate-400">{note}</span> : null}
      </div>
      <span className="shrink-0 font-medium text-slate-700">{amount}</span>
    </div>
  );
}

export default PackagePriceSummary;
