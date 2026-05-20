import { PackageListingView } from "@/components/packages/package-listing-view";
import { getTourCatalog } from "@/lib/packages";

export default async function PackagesPage() {
  const packages = await getTourCatalog();
  const featured = packages[0];
  const heroImage =
    featured?.image ??
    "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=1200&q=80";

  const easeHero = {
    title: "Holiday Tour Packages",
    image: heroImage,
    destinationName: "All Destinations",
    fromCity: "New Delhi",
  } as const;

  if (!featured) {
    return (
      <PackageListingView
        featured={{
          id: "fallback",
          title: "Packages",
          image: heroImage,
          durationNights: 0,
          durationDays: 0,
          rating: 4.8,
          reviewCount: 0,
          priceINR: 0,
        }}
        packages={[]}
        easeHero={easeHero}
        countHeading="Holiday Packages"
        heroTitle="Holiday Tour Packages"
      />
    );
  }

  return (
    <PackageListingView
      featured={featured}
      packages={packages}
      easeHero={easeHero}
      heroTitle="Holiday Tour Packages"
      countHeading={`${packages.length} Holiday ${packages.length === 1 ? "Package" : "Packages"}`}
      searchHint="India & World"
    />
  );
}
