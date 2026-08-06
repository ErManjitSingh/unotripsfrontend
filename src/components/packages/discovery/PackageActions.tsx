"use client";

/**
 * src/components/packages/discovery/PackageActions.tsx
 *
 * Two-CTA footer.
 *
 * "View Package" is the primary path and is weighted to dominate: it takes the
 * flexible column, carries the brand fill and a lift shadow, and is a step
 * larger in type. "Enquire" stays available for the researchers who won't
 * self-serve a ₹45k holiday, but is demoted to a quiet ghost button — present
 * without splitting attention with the primary action.
 */

import Link from "next/link";

import { QuickEnquiryTrigger } from "@/components/enquiry/quick-enquiry";
import { cn } from "@/lib/utils";

export type PackageActionsProps = {
  href: string;
  tourTitle: string;
  tourSku: string;
  className?: string;
};

export function PackageActions({ href, tourTitle, tourSku, className }: PackageActionsProps) {
  return (
    // Below sm the grid is single-column, so tiles stretch to ~576px and a
    // [1fr_auto] split handed every surplus pixel to the primary — it rendered
    // 487px against a 61px "Enquire", an 8:1 slab. A proportional split makes
    // both scale together; from sm up the tiles are narrow again and the
    // approved [1fr_auto] weighting is restored.
    <div
      className={cn(
        "grid grid-cols-[1.7fr_1fr] items-center gap-1.5 sm:grid-cols-[1fr_auto]",
        className,
      )}
    >
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className="flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-[14px] font-extrabold tracking-tight text-white shadow-[0_10px_20px_-8px_rgba(239,102,20,0.7)] transition hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_14px_26px_-8px_rgba(239,102,20,0.75)]"
      >
        View Package
      </Link>

      {/* w-full on both wrapper and button so Enquire actually fills its
          column below sm — otherwise the proportional split just parks a 61px
          button in a wide cell and the imbalance looks the same. */}
      <span className="block w-full" onClick={(e) => e.stopPropagation()}>
        <QuickEnquiryTrigger
          tourTitle={tourTitle}
          tourSku={tourSku}
          label="Enquire"
          icon={false}
          className="inline-flex h-10 w-full items-center justify-center rounded-xl border-0 bg-transparent px-2.5 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-primary hover:no-underline sm:w-auto"
        />
      </span>
    </div>
  );
}

export default PackageActions;
