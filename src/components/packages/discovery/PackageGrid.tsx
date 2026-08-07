"use client";

/**
 * src/components/packages/discovery/PackageGrid.tsx
 *
 * Responsive tile grid.
 *
 *   < 640px   1 column
 *   ≥ 640px   2 columns   (tablet)
 *   ≥ 1024px  2 columns   (desktop, alongside the sticky filter rail)
 *   ≥ 1280px  3 columns   (large screens)
 *
 * `items-stretch` plus the flex-column card gives equal-height tiles, so price
 * and CTA line up across a row no matter how long a package name runs.
 */

import type { TourPackage } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PackageCard } from "./PackageCard";

export type PackageGridProps = {
  tours: TourPackage[];
  /** Index of the tile that gets the "Popular Today" badge. -1 to disable. */
  popularIndex?: number;
  /** Tiles at or below this index get priority image loading. */
  priorityCount?: number;
  className?: string;
};

export function PackageGrid({
  tours,
  popularIndex = 0,
  priorityCount = 3,
  className,
}: PackageGridProps) {
  return (
    <div
      className={cn(
        "grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3",
        className,
      )}
    >
      {tours.map((tour, idx) => (
        <PackageCard
          key={tour.id}
          tour={tour}
          showPopularTag={idx === popularIndex}
          priority={idx < priorityCount}
        />
      ))}
    </div>
  );
}

export default PackageGrid;
