"use client";

/**
 * src/components/packages/discovery/PackagePagination.tsx
 *
 * Pagination bar for the tile grid. Extracted from the old
 * package-listing-paginated component so the discovery container stays a
 * layout shell; the numbered-page behaviour is unchanged.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PackagePaginationProps = {
  page: number;
  totalPages: number;
  /** 1-based index of the first item on the page. */
  rangeStart: number;
  /** 1-based index of the last item on the page. */
  rangeEnd: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PackagePagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
  className,
}: PackagePaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className={cn("mt-6 text-center text-xs text-slate-600", className)}>
        Showing all {total} package{total === 1 ? "" : "s"}
      </p>
    );
  }

  return (
    <nav
      className={cn(
        "mt-8 flex flex-col items-center gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between",
        className,
      )}
      aria-label="Package list pagination"
    >
      <p className="order-2 text-center text-xs text-slate-600 sm:order-1 sm:text-left">
        Showing{" "}
        <span className="font-semibold text-slate-800">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        of <span className="font-semibold text-slate-800">{total}</span> · Page {page} of{" "}
        {totalPages}
      </p>

      <div className="order-1 flex flex-wrap items-center justify-center gap-1.5 sm:order-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-md px-3"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Prev
        </Button>

        {totalPages <= 9 ? (
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-md border text-xs font-semibold transition",
                  n === page
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-primary",
                )}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </button>
            ))}
          </div>
        ) : (
          <span className="px-2 text-xs font-medium text-slate-600">
            Page {page} / {totalPages}
          </span>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-md px-3"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

export default PackagePagination;
