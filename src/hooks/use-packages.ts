/**
 * src/hooks/use-packages.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React Query hooks for package data — client-side only.
 *
 * CHANGES vs previous version:
 * ─────────────────────────────
 * Added staleTime: 5 * 60 * 1000 (5 minutes) to ALL queries.
 *
 * BEFORE: No staleTime was set. React Query's default staleTime is 0,
 *         meaning data is considered stale IMMEDIATELY after it's fetched.
 *         Every time a component mounts or the window refocuses, React Query
 *         fires a background refetch. On the homepage:
 *           - TrendingToursApiSection mounts → fetches packages
 *           - User switches tab and comes back → refetches again
 *           - User navigates away and back → refetches again
 *         With 2 parallel calls (useFeaturedPackages + usePackages), each
 *         remount = 2 backend calls. On a travel site with users browsing
 *         multiple tabs, this adds up fast.
 *
 * AFTER:  staleTime: 5 minutes means React Query reuses cached data for
 *         5 minutes before considering a background refetch. This aligns
 *         with the backend Redis TTL (2 min list, 5 min detail) and the
 *         Next.js ISR revalidate (5 min). All three layers agree on 5 min.
 *
 * REMOVED duplicate call in TrendingToursApiSection:
 *   The component called BOTH useFeaturedPackages(12) AND usePackages({limit:12})
 *   simultaneously. Two parallel API calls for the same data (packages list).
 *   useFeaturedPackages() calls getAllPackages() which calls listPackages(limit=50).
 *   usePackages({limit:12}) calls listPackages(limit=12).
 *   Different URLs → different cache keys → two DB hits.
 *
 *   Fix: useFeaturedPackages() now calls listPackages({ sort: "featured", limit })
 *   directly — same endpoint as usePackages, just with sort=featured.
 *   React Query deduplicates calls with the same queryKey — no double fetch.
 *
 * gcTime: 10 minutes — keep data in memory for 10 min after component unmounts.
 *         User navigates away and back within 10 min = instant data, no loading.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useQuery }          from "@tanstack/react-query";
import type { PackageListParams, PaginatedPackages } from "@/services/packages";
import {
  getAllPackages,
  getPackageBySlug,
  getRelatedPackages,
  listPackages,
} from "@/services/packages";
import type { TourPackage } from "@/lib/constants";

// ── Shared query config ───────────────────────────────────────────────────────
// Applied to all package queries.
// staleTime: how long before React Query considers data stale and refetches.
// gcTime:    how long to keep unused data in memory after component unmounts.
const PACKAGE_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,  // 5 min — aligns with backend Redis + Next.js ISR TTL
  gcTime:    10 * 60 * 1000, // 10 min — survive tab switches and back-navigation
} as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Paginated package list with optional filters.
 * Called from listing pages, search, filter sidebar.
 */
export function usePackages(params?: PackageListParams) {
  return useQuery({
    queryKey: ["packages", "list", params ?? {}],
    queryFn:  () =>
      params
        ? listPackages(params)
        : getAllPackages().then((items) => ({
            items,
            total:       items.length,
            page:        1,
            limit:       items.length,
            total_pages: 1,
          })),
    ...PACKAGE_QUERY_CONFIG,
  });
}

/**
 * Single package by slug.
 * Called from package detail client components.
 */
export function usePackage(slug: string) {
  return useQuery({
    queryKey: ["packages", "detail", slug],
    queryFn:  () => getPackageBySlug(slug),
    enabled:  Boolean(slug),
    ...PACKAGE_QUERY_CONFIG,
  });
}

/**
 * Featured packages for homepage trending section.
 *
 * FIX: previously called fetchFeaturedPackages() which called getAllPackages()
 * (limit=50 full list dump). Now calls listPackages({ sort: "featured" })
 * directly — same targeted endpoint as usePackages, just sorted differently.
 *
 * This means:
 *   - Smaller response (limit=12 not 50)
 *   - Same React Query cache key shape as usePackages — React Query
 *     automatically deduplicates if both are called with same params
 *   - No "load all 50 packages to show 12" waste
 */
export function useFeaturedPackages(limit = 12, initialData?: PaginatedPackages) {
  return useQuery({
    queryKey: ["packages", "list", { sort: "featured", limit }],
    queryFn:  () => listPackages({ sort: "featured", limit }),
    ...PACKAGE_QUERY_CONFIG,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}

/**
 * Related packages for a detail page.
 * Only enabled when tour data is available.
 */
export function useRelatedPackages(
  tour:  TourPackage | null | undefined,
  limit = 8,
) {
  return useQuery({
    queryKey: ["packages", "related", tour?.id, limit],
    queryFn:  () => (tour ? getRelatedPackages(tour, limit) : Promise.resolve([])),
    enabled:  Boolean(tour),
    ...PACKAGE_QUERY_CONFIG,
  });
}