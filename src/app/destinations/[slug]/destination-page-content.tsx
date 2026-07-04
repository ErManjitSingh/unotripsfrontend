/**
 * src/app/destinations/[slug]/destination-page-content.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Destination content — renders the package listing for a destination.
 *
 * CHANGES vs previous version:
 * ─────────────────────────────
 * 1. Accepts optional `destination` prop from parent page
 *
 *    BEFORE: Always called getDestinationBySlug(slug) independently.
 *            Combined with the parent page's generateMetadata also calling it,
 *            that was 2 backend calls per render for the same data.
 *
 *    AFTER:  When `destination` is passed as a prop (from the parent page
 *            which uses React.cache()), this component skips the fetch entirely.
 *            The prop is already the resolved destination data — zero extra calls.
 *
 *            If destination is NOT passed (backward compat / direct rendering),
 *            it fetches normally. This makes the component self-contained
 *            without breaking any other potential callers.
 *
 * 2. getPackages() is now ISR-cached (packages.ts fix propagates here)
 *
 *    BEFORE: getPackages() → getAllPackages() → apiGetRaw with cache: "no-store"
 *            → full package list fetched fresh on every destination page render
 *
 *    AFTER:  packages.ts fixed → ISR 5 min + in-process dedup
 *            → destination pages share the cached package list
 *            → zero extra DB calls for packages on cached destination pages
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Link       from "next/link";
import { PackageListingView }             from "@/components/packages/package-listing-view";
import type { DestinationCard, TourPackage } from "@/lib/constants";
import { getDestinationBySlug, getPackages } from "@/lib/cms-api";
import { filterTourPackagesByDestinationSlug } from "@/lib/package-destination-filter";

// Fallback destination images keyed by common slugs
const FALLBACK_IMAGES: Record<string, string> = {
  kashmir:      "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1400&q=85",
  shimla:       "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1400&q=85",
  manali:       "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=85",
  leh:          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=85",
  dharamshala:  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1400&q=85",
  jaipur:       "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1400&q=85",
  vrindavan:    "https://images.unsplash.com/photo-1600800946984-5a3d65c9d35c?w=1400&q=85",
  goa:          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1400&q=85",
  kerala:       "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=1400&q=85",
  rajasthan:    "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1400&q=85",
  himachal:     "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85",
  ladakh:       "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=85",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85";

function slugToName(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function makeFallbackDestination(slug: string): DestinationCard {
  return {
    id:     slug,
    slug,
    name:   slugToName(slug),
    image:  FALLBACK_IMAGES[slug.toLowerCase()] ?? DEFAULT_IMAGE,
    region: "India",
    packageCount: 0,
  };
}

type Props = {
  params:       Promise<{ slug: string }>;
  // Optional: pass pre-fetched destination to avoid duplicate fetch.
  // When provided, skips the getDestinationBySlug() call entirely.
  // When not provided, fetches normally (backward compat).
  destination?: DestinationCard | null;
};

function destinationHeroTour(d: DestinationCard, slug: string): TourPackage {
  return {
    id:              `dest-hero-${slug}`,
    slug:            `destination-${slug}`,
    title:           `${d.name} Tour Packages`,
    image:           d.image,
    durationNights:  6,
    durationDays:    7,
    rating:          4.8,
    reviewCount:     487,
    priceINR:        49_999,
    description:     `Book ${d.name} tour packages with trusted hotels, sightseeing, and transfers. Browse departures, seasonal offers, and customise your route with our travel experts — all in one place.`,
    packageType:     "Holiday package",
    location:        d.region,
    showMemberPrice: true,
  };
}

function breadcrumbScope(d: DestinationCard): { label: string; href: string } {
  if (d.region === "India") return { label: "India", href: "/#destinations" };
  return { label: "World", href: "/#destinations" };
}

export async function DestinationPageContent({ params, destination: destinationProp }: Props) {
  const { slug } = await params;

  // Use pre-fetched destination prop if available — zero extra network call.
  // Fall back to fetching if called without prop (backward compat).
  const d = destinationProp !== undefined
    ? destinationProp
    : await getDestinationBySlug(slug);

  if (!d) {
    // CMS doesn't have this destination yet — render a graceful fallback
    // instead of a 404 so links don't die.
    const fallback = makeFallbackDestination(slug);
    return (
      <PackageListingView
        featured={destinationHeroTour(fallback, slug)}
        packages={[]}
        breadcrumbs={[{ label: "India", href: "/#destinations" }, { label: fallback.name }]}
        heroTitle={`${fallback.name} Tour Packages`}
        heroDescription={`Explore ${fallback.name} with UNO Trips — curated packages, trusted hotels, and 24/7 support. Contact us to build your perfect itinerary.`}
        leadFormContextTitle={`${fallback.name} Tour Packages`}
        countHeading={`0 ${fallback.name} Packages`}
        showingRangeText={null}
        footerNote=""
        searchHint={fallback.name}
        emptyListing={
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-800">
              Packages for {fallback.name} are coming soon
            </p>
            <p className="mt-2 text-xs text-slate-600">
              <Link href="/packages" className="font-semibold text-primary underline">Browse all packages</Link>
              {" "}or call us to plan a custom trip.
            </p>
          </div>
        }
        easeHero={{
          title:           `${fallback.name} Tour Packages`,
          image:           fallback.image,
          destinationName: fallback.name,
          fromCity:        "New Delhi",
        }}
      />
    );
  }

  // getPackages() → getAllPackages() — ISR-cached 5 min + in-process dedup.
  // Multiple destination pages rendered in the same deploy share this cache.
  const allPackages = await getPackages();
  const related     = filterTourPackagesByDestinationSlug(allPackages, slug);

  const featured         = related[0] ?? destinationHeroTour(d, slug);
  const scope            = breadcrumbScope(d);
  const pageTitle        = `${d.name} Tour Packages`;
  const heroDescription  =
    related[0]?.description ??
    `Discover curated ${d.name} holidays with clear inclusions, flexible nights, and competitive pricing. Use filters to narrow by budget and departure city, or request a call back for a tailor-made itinerary.`;

  const emptyListing = (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-800">
        No packages matched this destination yet
      </p>
      <p className="mt-2 text-xs text-slate-600">
        Try{" "}
        <Link href="/packages" className="font-semibold text-primary underline">
          all packages
        </Link>{" "}
        or contact us for a custom plan.
      </p>
    </div>
  );

  return (
    <PackageListingView
      featured={featured}
      packages={related}
      breadcrumbs={[scope, { label: d.name }]}
      heroTitle={pageTitle}
      heroDescription={heroDescription}
      leadFormContextTitle={pageTitle}
      countHeading={`${related.length} ${d.name} Holiday ${related.length === 1 ? "Package" : "Packages"}`}
      showingRangeText={
        related.length > 0
          ? `${related.length} package${related.length === 1 ? "" : "s"} — 5 per page with pagination below`
          : null
      }
      footerNote=""
      searchHint={d.name}
      emptyListing={related.length === 0 ? emptyListing : undefined}
      easeHero={{
        title:           pageTitle,
        image:           d.image,
        destinationName: d.name,
        fromCity:        "New Delhi",
      }}
    />
  );
}