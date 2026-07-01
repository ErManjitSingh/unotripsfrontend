"use client";

import { TrendingTours }                from "@/components/home/TrendingTours";
import { ApiState }                     from "@/components/ui/api-state";
import { TrendingToursSectionSkeleton } from "@/components/home/home-page-skeleton";
import { useHomepagePackages }          from "@/hooks/use-homepage";
import type { TourPackage }             from "@/lib/constants";

interface Props {
  initialData?: TourPackage[] | null;
}

export function TrendingToursApiSection({ initialData }: Props) {
  const { data, isLoading, isError, refetch } = useHomepagePackages(4, initialData ?? undefined);

  const tours = data ?? [];

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
