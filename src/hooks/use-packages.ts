"use client";

import { useQuery } from "@tanstack/react-query";
import type { PackageListParams } from "@/services/packages";
import {
  fetchFeaturedPackages,
  getAllPackages,
  getPackageBySlug,
  getRelatedPackages,
  listPackages,
} from "@/services/packages";
import type { TourPackage } from "@/lib/constants";

export function usePackages(params?: PackageListParams) {
  return useQuery({
    queryKey: ["packages", "list", params],
    queryFn: () =>
      params
        ? listPackages(params)
        : getAllPackages().then((items) => ({
            items,
            total: items.length,
            page: 1,
            limit: items.length,
            total_pages: 1,
          })),
  });
}

export function usePackage(slug: string) {
  return useQuery({
    queryKey: ["packages", "detail", slug],
    queryFn: () => getPackageBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useFeaturedPackages(limit = 12) {
  return useQuery({
    queryKey: ["packages", "featured", limit],
    queryFn: () => fetchFeaturedPackages(limit),
  });
}

export function useRelatedPackages(tour: TourPackage | null | undefined, limit = 8) {
  return useQuery({
    queryKey: ["packages", "related", tour?.id, limit],
    queryFn: () => (tour ? getRelatedPackages(tour, limit) : Promise.resolve([])),
    enabled: Boolean(tour),
  });
}