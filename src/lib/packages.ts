import type { TourPackage } from "@/lib/constants";
import { getPackages } from "@/lib/cms-api";

export async function getTourCatalog(): Promise<TourPackage[]> {
  return await getPackages();
}

export async function getTourBySlug(slug: string): Promise<TourPackage | undefined> {
  const tours = await getPackages();
  return tours.find((t) => t.slug === slug || t.id === slug);
}

export async function getTourSlugs(): Promise<string[]> {
  const tours = await getPackages();
  return tours.map((t) => t.slug ?? t.id).filter(Boolean) as string[];
}

export function packageDetailHref(tour: TourPackage): string {
  return `/packages/${tour.slug ?? tour.id}`;
}
