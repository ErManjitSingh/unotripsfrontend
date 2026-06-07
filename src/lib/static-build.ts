import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import packageCatalog from "@/lib/package-catalog.json";
import { getBlogStaticSlugs } from "@/lib/blog-static-slugs";
import { getAllStaticDestinationCards } from "@/lib/destination-catalog";
import type { TourPackage } from "@/lib/constants";

export const isStaticExportBuild = process.env.BUILD_STATIC === "1";

type HotelSlugRow = { city?: string; slug?: string };

type HotelBuildCache = {
  slugs?: HotelSlugRow[];
  searches?: Record<string, unknown>;
};

function citySlugFromName(city: string): string {
  return String(city ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function loadHotelBuildCache(): HotelBuildCache | null {
  const path = join(process.cwd(), "src/lib/hotels-build-cache.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as HotelBuildCache;
  } catch {
    return null;
  }
}

export function blogStaticParams(): { slug: string }[] {
  if (!isStaticExportBuild) return [];
  return getBlogStaticSlugs().map((slug) => ({ slug }));
}

export function packageStaticParams(): { slug: string }[] {
  if (!isStaticExportBuild) return [];
  const tours = packageCatalog as TourPackage[];
  return tours
    .map((t) => t.slug ?? t.id)
    .filter(Boolean)
    .map((slug) => ({ slug: String(slug) }));
}

export function destinationStaticParams(): { slug: string }[] {
  if (!isStaticExportBuild) return [];
  return getAllStaticDestinationCards().map((d) => ({ slug: d.slug }));
}

export function hotelCityStaticParams(): { slug: string }[] {
  if (!isStaticExportBuild) return [];
  const cache = loadHotelBuildCache();
  const fromSearches = cache?.searches ? Object.keys(cache.searches) : [];
  const fromSlugs = (cache?.slugs ?? [])
    .map((s) => citySlugFromName(s.city ?? ""))
    .filter(Boolean);
  return [...new Set([...fromSearches, ...fromSlugs])].map((slug) => ({ slug }));
}

export function hotelDetailStaticParams(): { slug: string; hotelId: string }[] {
  if (!isStaticExportBuild) return [];
  const cache = loadHotelBuildCache();
  const rows = cache?.slugs ?? [];
  return rows
    .filter((s) => s.slug && s.city)
    .map((s) => ({
      slug: citySlugFromName(s.city!),
      hotelId: String(s.slug),
    }));
}
