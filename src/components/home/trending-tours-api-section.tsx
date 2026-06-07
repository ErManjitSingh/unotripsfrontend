"use client";

import { useMemo } from "react";
import { TrendingTours } from "@/components/home/TrendingTours";
import { ApiState } from "@/components/ui/api-state";
import { TrendingToursSectionSkeleton } from "@/components/home/home-page-skeleton";
import { useFeaturedPackages, usePackages } from "@/hooks/use-packages";

export function TrendingToursApiSection() {
  const featured = useFeaturedPackages(12);
  const all = usePackages({ page: 1, limit: 12 });

  const tours = useMemo(() => {
    if (featured.data?.length) return featured.data;
    const items = all.data && "items" in all.data ? all.data.items : Array.isArray(all.data) ? all.data : [];
    return items;
  }, [featured.data, all.data]);

  const isLoading = featured.isLoading || (featured.data?.length === 0 && all.isLoading);
  const isError = featured.isError && all.isError;

  return (
    <ApiState
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && tours.length === 0}
      emptyMessage="No packages available yet. Check back soon."
      onRetry={() => { featured.refetch(); all.refetch(); }}
      skeleton={<TrendingToursSectionSkeleton />}
    >
      <TrendingTours tours={tours} />
    </ApiState>
  );
}