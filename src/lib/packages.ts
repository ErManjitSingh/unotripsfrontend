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

export {
  listPackages,
  searchPackages,
  fetchFeaturedPackages,
  getRelatedPackages,
  getPackageBySlug,
};