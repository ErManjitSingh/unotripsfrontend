import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageListingView } from "@/components/packages/package-listing-view";
import { listPackages }       from "@/services/packages";
import { Footer }             from "@/components/layout/Footer";
import { TRAVEL_HOME_BRAND }  from "@/lib/travel-home-brand";
export const revalidate = 300;

export const metadata: Metadata = {
  title:       `Holiday Tour Packages | ${TRAVEL_HOME_BRAND.name}`,
  description: "Browse curated holiday packages across India and the world. Best prices, hand-picked itineraries.",
  openGraph: {
    title:       `Holiday Tour Packages | ${TRAVEL_HOME_BRAND.name}`,
    description: "Curated holiday packages with flexible itineraries.",
  },
};

type Props = {
  searchParams: Promise<{
    // sent by HolidayPackagesSearchBar
    q?:        string;   // destination / search query
    from?:     string;   // origin city
    date?:     string;   // departure date ISO
    rooms?:    string;
    adults?:   string;
    children?: string;
    mode?:     string;   // honeymoon | family | group | lastminute
    budget?:   string;
    duration?: string;
    type?:     string;
    // legacy params kept for backwards compat
    dest?:     string;
    sort?:     string;
    page?:     string;
  }>;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1400&q=85"; // Mehrangarh Fort, Jodhpur — bright & colourful

export default async function PackagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page   = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort   = params.sort ?? "popular";

  // Resolve destination — prefer new `q` param, fall back to legacy `dest`
  const dest = params.q ?? params.dest ?? undefined;

  const { items: packages, total } = await listPackages({
    page,
    limit: 50,
    sort:  sort as "popular" | "price_asc" | "price_desc" | "featured",
    destination_id: dest,
  });

  const featured  = packages[0];
  const heroImage = featured?.image ?? FALLBACK_HERO;

  const destLabel = dest
    ? dest.split(",")[0].trim()
    : "All Destinations";

  const easeHero = {
    title:           "Holiday Tour Packages",
    image:           heroImage,
    destinationName: destLabel,
    fromCity:        params.from ?? "New Delhi",
    initialDate:     params.date,
  };

  const countLabel = total > packages.length
    ? `${total}+ Holiday Package${total === 1 ? "" : "s"}`
    : `${packages.length} Holiday Package${packages.length === 1 ? "" : "s"}`;

  return (
    <>
      {/* PackageListingView renders its own Navbar — do NOT add another one here */}
      <Suspense fallback={null}>
        {packages.length === 0 ? (
          <PackageListingView
            featured={{
              id: "empty", title: "Holiday Tour Packages",
              image: heroImage, durationNights: 0, durationDays: 0,
              rating: 0, reviewCount: 0, priceINR: 0,
            }}
            packages={[]}
            easeHero={easeHero}
            countHeading="Holiday Packages"
            heroTitle="Holiday Tour Packages"
          />
        ) : (
          <PackageListingView
            featured={featured!}
            packages={packages}
            easeHero={easeHero}
            heroTitle="Holiday Tour Packages"
            countHeading={countLabel}
            searchHint={destLabel}
          />
        )}
      </Suspense>
      <Footer />
    </>
  );
}
