"use client";

import { useQuery } from "@tanstack/react-query";
import type { HotelListing } from "@/lib/hotels-catalog";
import type { TourPackage } from "@/lib/constants";
import { fetchHomepageHotels, fetchHomepagePackages } from "@/lib/homepage-api";

const HOMEPAGE_QUERY_CONFIG = {
  staleTime: 15 * 60 * 1000,
  gcTime:    20 * 60 * 1000,
} as const;

export function useHomepageHotels(
  limit = 4,
  initialData?: { hotels: HotelListing[]; total: number },
) {
  return useQuery({
    queryKey: ["homepage", "hotels", limit],
    queryFn:  () => fetchHomepageHotels(limit),
    ...HOMEPAGE_QUERY_CONFIG,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}

export function useHomepagePackages(
  limit = 4,
  initialData?: TourPackage[],
) {
  return useQuery({
    queryKey: ["homepage", "packages", limit],
    queryFn:  () => fetchHomepagePackages(limit),
    ...HOMEPAGE_QUERY_CONFIG,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}
