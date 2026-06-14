/**
 * src/app/packages/page.tsx
 *
 * Holiday packages listing page.
 * Reads `dest`, `date`, `rooms` URL params from PackageSearchBox.
 * Shows PackageSearchBox at the top so user can refine their search.
 * ISR: revalidate every 5 min (base data is cached; rooms/price computed client-side).
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageListingView }    from "@/components/packages/package-listing-view";
import { PackageSearchBox }      from "@/components/packages/PackageSearchBox";
import { listPackages }          from "@/services/packages";
import { TRAVEL_HOME_BRAND }     from "@/lib/travel-home-brand";

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
    dest?:  string;
    date?:  string;
    rooms?: string;
    sort?:  string;
    page?:  string;
  }>;
};

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=1200&q=80";

export default async function PackagesPage({ searchParams }: Props) {
  const params   = await searchParams;
  const page     = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort     = params.sort ?? "popular";

  // Fetch first page with any destination filter from search
  const { items: packages, total } = await listPackages({
    page,
    limit:          50,
    sort:           sort as "popular" | "price_asc" | "price_desc" | "featured",
    destination_id: params.dest ?? undefined,
  });

  const featured  = packages[0];
  const heroImage = featured?.image ?? FALLBACK_HERO;

  const easeHero = {
    title:           "Holiday Tour Packages",
    image:           heroImage,
    destinationName: "All Destinations",
    fromCity:        "New Delhi",
  } as const;

  const countLabel = total > packages.length
    ? `${total}+ Holiday Package${total === 1 ? "" : "s"}`
    : `${packages.length} Holiday Package${packages.length === 1 ? "" : "s"}`;

  return (
    <>
      {/* Search box — sticky bar at top of listing */}
      <div className="border-b border-[#e0e0e0] bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto max-w-[1100px]">
          <Suspense fallback={null}>
            <PackageSearchBox
              initialDest={params.dest}
              initialDate={params.date}
              initialRooms={params.rooms}
              compact
            />
          </Suspense>
        </div>
      </div>

      {/* Listing */}
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
          searchHint="India & World"
        />
      )}
    </>
  );
}