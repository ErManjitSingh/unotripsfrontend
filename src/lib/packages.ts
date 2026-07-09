import type { TourPackage } from "@/lib/constants";
import {
  fetchFeaturedPackages,
  getAllPackages,
  getPackageBySlug,
  getPackageSlugs,
  getRelatedPackages,
  listPackages,
  searchPackages,
} from "@/services/packages";

export async function getTourCatalog(): Promise<TourPackage[]> {
  return getAllPackages();
}

export async function getTourBySlug(slug: string): Promise<TourPackage | undefined> {
  const tour = await getPackageBySlug(slug);
  return tour ?? undefined;
}

/** All published slugs — used by generateStaticParams in packages/[slug]/page.tsx */
export async function getTourSlugs(): Promise<string[]> {
  return getPackageSlugs();
}

export function packageDetailHref(tour: TourPackage): string {
  return `/packages/${tour.slug ?? tour.id}`;
}

// Mirrors the backend's tour_type enum (domestic | international | honeymoon |
// family | adventure | weekend | group) — see app/models/packages/tour_package.py.
const TOUR_TYPE_LABELS: Record<string, string> = {
  domestic: "Domestic Tour",
  international: "International Tour",
  honeymoon: "Honeymoon Package",
  family: "Family Package",
  adventure: "Adventure Tour",
  weekend: "Weekend Getaway",
  group: "Group Tour",
};

export function formatTourType(type: string | undefined): string {
  if (!type) return "Holiday Package";
  const known = TOUR_TYPE_LABELS[type.toLowerCase()];
  if (known) return known;
  return `${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} Tour`;
}

export {
  listPackages,
  searchPackages,
  fetchFeaturedPackages,
  getRelatedPackages,
  getPackageBySlug,
};