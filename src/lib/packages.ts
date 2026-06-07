import type { TourPackage } from "@/lib/constants";
import {
  fetchFeaturedPackages,
  getAllPackages,
  getPackageBySlug,
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

export async function getTourSlugs(): Promise<string[]> {
  const tours = await getAllPackages();
  return tours.map((t) => t.slug ?? t.id).filter(Boolean) as string[];
}

export function packageDetailHref(tour: TourPackage): string {
  return `/packages/${tour.slug ?? tour.id}`;
}

export {
  listPackages,
  searchPackages,
  fetchFeaturedPackages,
  getRelatedPackages,
  getPackageBySlug,
};
