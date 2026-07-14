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
  "/images/holiday-packages-hero.png";

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
    // `q` is the user's free-text destination (for example "Shimla"), not
    // a UUID. Passing it as destination_id makes the backend try to parse
    // the city name as a UUID and returns no results. Use the public search
    // filter, which matches destination_name and destination_city.
    search: dest,
  });

  const featured  = packages[0];
  // Keep the listing hero generic and editorial; package imagery belongs in
  // the cards below and should not determine the page-wide backdrop.
  const heroImage = FALLBACK_HERO;

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
