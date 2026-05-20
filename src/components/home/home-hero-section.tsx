import { getDestinations, getPackages } from "@/lib/cms-api";
import type { DestinationCard, TourPackage } from "@/lib/constants";
import { HeroSection } from "@/components/home/HeroSection";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

function buildSearchCatalog(packages: TourPackage[], destinations: DestinationCard[]): HeroSearchCatalog {
  return {
    destinations: destinations.map((d) => ({
      slug: d.slug,
      name: d.name,
      region: d.region,
    })),
    packages: packages.map((p) => ({
      slug: (p.slug ?? p.id).trim() || p.id,
      title: p.title,
      location: p.location,
      priceINR: p.priceINR,
      durationDays: p.durationDays,
      image: p.image,
    })),
  };
}

/** Loads catalog for `HeroSection` floating search. */
export async function HomeHeroSection() {
  const [packages, destinations] = await Promise.all([getPackages(), getDestinations()]);
  const searchCatalog = buildSearchCatalog(packages, destinations);
  return <HeroSection searchCatalog={searchCatalog} />;
}
