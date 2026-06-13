/**
 * src/components/home/trending-tours-api-section.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Homepage trending packages section — client component.
 *
 * CHANGES vs previous version:
 * ─────────────────────────────
 * BEFORE: Called BOTH useFeaturedPackages(12) AND usePackages({ page:1, limit:12 })
 *         simultaneously on every homepage load.
 *
 *         useFeaturedPackages(12) → fetchFeaturedPackages(12) → getAllPackages()
 *           → listPackages({ limit: 50 }) → GET /v1/packages?limit=50
 *
 *         usePackages({ page:1, limit:12 }) → listPackages({ limit: 12 })
 *           → GET /v1/packages?limit=12
 *
 *         Two different URLs → two different React Query cache keys →
 *         two parallel API calls → two DB connections → every homepage load.
 *
 *         The logic was: "use featured if available, fall back to all."
 *         But BOTH calls fired in parallel regardless — the fallback was
 *         always firing even when featured had data.
 *
 * AFTER:  One call only — useFeaturedPackages(12).
 *
 *         useFeaturedPackages() now calls listPackages({ sort: "featured", limit: 12 })
 *         directly (see use-packages.ts fix). One URL, one cache key, one DB call.
 *
 *         The backend already returns packages sorted by is_featured DESC,
 *         then booking_count DESC — so "featured" packages always come first.
 *         No fallback to a separate "all packages" call is needed.
 *
 *         If there are no featured packages, the backend returns regular packages
 *         sorted by popularity — same behaviour as before, one call not two.
 *
 * RESULT: Homepage package API calls: 2 → 1
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { TrendingTours }              from "@/components/home/TrendingTours";
import { ApiState }                   from "@/components/ui/api-state";
import { TrendingToursSectionSkeleton } from "@/components/home/home-page-skeleton";
import { useFeaturedPackages }        from "@/hooks/use-packages";

export function TrendingToursApiSection() {
  // ONE query — no parallel duplicate.
  // useFeaturedPackages calls listPackages({ sort: "featured", limit: 12 })
  // React Query staleTime: 5 min — no refetch on tab switch or remount.
  const { data, isLoading, isError, refetch } = useFeaturedPackages(12);

  const tours = data?.items ?? [];

  return (
    <ApiState
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && tours.length === 0}
      emptyMessage="No packages available yet. Check back soon."
      onRetry={refetch}
      skeleton={<TrendingToursSectionSkeleton />}
    >
      <TrendingTours tours={tours} />
    </ApiState>
  );
}