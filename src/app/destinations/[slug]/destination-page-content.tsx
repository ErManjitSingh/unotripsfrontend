import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageListingView } from "@/components/packages/package-listing-view";
import type { DestinationCard, TourPackage } from "@/lib/constants";
import { getDestinationBySlug, getPackages } from "@/lib/cms-api";
import { filterTourPackagesByDestinationSlug } from "@/lib/package-destination-filter";

type Props = { params: Promise<{ slug: string }> };

function destinationHeroTour(d: DestinationCard, slug: string): TourPackage {
  return {
    id: `dest-hero-${slug}`,
    slug: `destination-${slug}`,
    title: `${d.name} Tour Packages`,
    image: d.image,
    durationNights: 6,
    durationDays: 7,
    rating: 4.8,
    reviewCount: 487,
    priceINR: 49_999,
    description: `Book ${d.name} tour packages with trusted hotels, sightseeing, and transfers. Browse departures, seasonal offers, and customise your route with our travel experts — all in one place.`,
    packageType: "Holiday package",
    location: d.region,
    showMemberPrice: true,
  };
}

function breadcrumbScope(d: DestinationCard): { label: string; href: string } {
  if (d.region === "India") return { label: "India", href: "/#destinations" };
  return { label: "World", href: "/#destinations" };
}

export async function DestinationPageContent({ params }: Props) {
  const { slug } = await params;
  const d = await getDestinationBySlug(slug);
  if (!d) notFound();

  const allPackages = await getPackages();
  const related = filterTourPackagesByDestinationSlug(allPackages, slug);

  const featured = related[0] ?? destinationHeroTour(d, slug);
  const scope = breadcrumbScope(d);
  const pageTitle = `${d.name} Tour Packages`;
  const heroDescription =
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
      ongoingBadgeRegion={d.name}
      footerNote=""
      searchHint={d.name}
      emptyListing={related.length === 0 ? emptyListing : undefined}
      easeHero={{
        title: pageTitle,
        image: d.image,
        destinationName: d.name,
        fromCity: "New Delhi",
      }}
    />
  );
}
