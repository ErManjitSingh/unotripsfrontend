import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ChevronRight, LayoutGrid, Star } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import type { TourPackage } from "@/lib/constants";
import { SITE } from "@/lib/constants";
import { PackageFilterSidebar } from "@/components/packages/package-filter-sidebar";
import { PackageListingWithSearch } from "@/components/packages/package-listing-with-search";
import { PackageLeadForm } from "@/components/packages/package-lead-form";
import { DestinationEaseHero } from "@/components/destinations/destination-ease-hero";
import type { DestinationEaseHeroProps } from "@/components/destinations/destination-ease-hero";
import { Navbar } from "@/components/layout/Navbar";
import {
  FloatingEnquireButton,
  QuickEnquiryProvider,
} from "@/components/enquiry/quick-enquiry";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";
import { cn, formatInrAmount } from "@/lib/utils";

export type PackageListingBreadcrumb = {
  label: string;
  href?: string;
};

export type PackageListingViewProps = {
  featured: TourPackage;
  packages: TourPackage[];
  breadcrumbs?: PackageListingBreadcrumb[];
  heroTitle?: string;
  heroDescription?: string;
  leadFormContextTitle?: string;
  countHeading?: string;
  showingRangeText?: string | null;
  ongoingBadgeRegion?: string;
  footerNote?: string | null;
  emptyListing?: ReactNode;
  /** Veena-style header search pill hint, e.g. destination name */
  searchHint?: string;
  /** Home-style header + EaseMyTrip destination banner (destination pages). */
  easeHero?: Omit<DestinationEaseHeroProps, "className">;
};

const DEFAULT_DESC =
  "Explore hand-picked stays, transfers, and sightseeing with transparent inclusions. Extend or trim nights with your travel designer before you book.";

function BreadcrumbTrail({
  breadcrumbs,
  featuredTitle,
}: {
  breadcrumbs?: PackageListingBreadcrumb[];
  featuredTitle: string;
}) {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600 sm:text-xs"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="hover:text-primary">
        Home
      </Link>
      {breadcrumbs?.length ? (
        breadcrumbs.map((crumb, idx) => (
          <Fragment key={`${crumb.label}-${idx}`}>
            <ChevronRight
              className="inline h-3 w-3 shrink-0 text-slate-400"
              aria-hidden
            />
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-primary">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{crumb.label}</span>
            )}
          </Fragment>
        ))
      ) : (
        <>
          <ChevronRight
            className="h-3 w-3 shrink-0 text-slate-400"
            aria-hidden
          />
          <Link href="/#packages" className="hover:text-primary">
            Packages
          </Link>
          <ChevronRight
            className="h-3 w-3 shrink-0 text-slate-400"
            aria-hidden
          />
          <span className="font-medium text-slate-900">{featuredTitle}</span>
        </>
      )}
    </nav>
  );
}

export function PackageListingView({
  featured,
  packages,
  breadcrumbs,
  heroTitle,
  heroDescription,
  leadFormContextTitle,
  countHeading,
  showingRangeText,
  ongoingBadgeRegion,
  footerNote,
  emptyListing,
  searchHint,
  easeHero,
}: PackageListingViewProps) {
  const title = heroTitle ?? featured.title;
  const desc = heroDescription ?? featured.description ?? DEFAULT_DESC;
  const ordered =
    packages.length > 0
      ? [
          featured,
          ...packages.filter(
            (p) => (p.slug ?? p.id) !== (featured.slug ?? featured.id),
          ),
        ]
      : [];
  const count = packages.length;
  const fullStars = Math.min(5, Math.round(featured.rating));
  const regionName = ongoingBadgeRegion ?? title;
  const ongoingCount = Math.min(15, Math.max(count, 1) + 7);
  const defaultFooter = `Itineraries and seat counts are sample UI — connect to your Laravel CMS for live inventory. ${SITE.name}`;
  const resolvedFooter =
    footerNote === "" ? null : (footerNote ?? defaultFooter);

  const enquiryTitle = leadFormContextTitle ?? title;

  return (
    <QuickEnquiryProvider>
      <Navbar variant="ease" easeActiveNavId="holidays" />
      {easeHero ? <DestinationEaseHero {...easeHero} /> : null}
      <div className="min-h-screen bg-[#f4f6f8]">
        {/* Centered column + viewport gutters once (avoid edge-to-edge + avoid double padding) */}
        <div
          className={cn(
            "mx-auto min-h-0 w-full max-w-[1400px]",
            PAGE_MARGIN_X_CLASS,
          )}
        >
          {!easeHero ? (
          <section className="border-b border-[#e0e0e0] bg-white">
            <div className="grid w-full items-stretch gap-4 py-4 sm:gap-5 sm:py-5 lg:grid-cols-[1fr_minmax(0,260px)] lg:gap-5 xl:grid-cols-[1fr_minmax(0,272px)]">
              <div className="flex min-h-0 flex-col lg:h-full lg:pr-1">
                <div className="shrink-0">
                  <BreadcrumbTrail
                    breadcrumbs={breadcrumbs}
                    featuredTitle={featured.title}
                  />
                  <h1 className="mt-1.5 font-display text-xl font-bold leading-snug tracking-tight text-slate-900 sm:mt-2 sm:text-2xl lg:text-[1.45rem]">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm lg:line-clamp-4">
                    {desc}
                  </p>
                  <Link
                    href="#all-packages"
                    className="mt-1.5 inline-block text-[11px] font-semibold text-primary hover:underline sm:text-xs"
                  >
                    Read More
                  </Link>
                </div>
                <div className="mt-auto shrink-0 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-800 sm:text-sm lg:pt-2">
                    <span
                      className="flex items-center gap-0.5 text-amber-500"
                      aria-hidden
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4",
                            i < fullStars
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200",
                          )}
                        />
                      ))}
                    </span>
                    <span className="text-slate-300" aria-hidden>
                      |
                    </span>
                    <span className="font-semibold">
                      {formatInrAmount(featured.reviewCount)} Reviews
                    </span>
                  </div>
                </div>
              </div>
              <PackageLeadForm
                tourTitle={leadFormContextTitle ?? featured.title}
                compact
                className="h-full min-h-0 w-full"
              />
            </div>
          </section>
          ) : null}

          {/* ~24px rhythm below hero */}
          <section
            id="all-packages"
            className="w-full pb-8 pt-5 sm:pb-10 sm:pt-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-bold text-slate-900 sm:text-xl">
                  {countHeading ??
                    `${count} Holiday ${count === 1 ? "Package" : "Packages"}`}
                </p>
                {showingRangeText !== null && showingRangeText !== undefined ? (
                  <p className="text-xs text-slate-600 sm:text-sm">
                    {showingRangeText}
                  </p>
                ) : count > 0 ? (
                  <p className="text-xs text-slate-600 sm:text-sm">
                    {count} package{count === 1 ? "" : "s"} — 5 per page with
                    pagination below
                  </p>
                ) : null}
                <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white"
                    aria-hidden
                  />
                  {ongoingCount} Tours Ongoing in {regionName} right now!
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm">
                  <span className="font-medium">Sort by</span>
                  <select className="rounded-md border border-[#e0e0e0] bg-white px-2.5 py-2 text-xs font-medium text-slate-800 shadow-sm">
                    <option>Deals</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Duration</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-[#e0e0e0] bg-white px-2.5 py-2 text-xs font-medium text-slate-700 shadow-sm"
                >
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Grid View
                </button>
              </div>
            </div>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,290px)_1fr] lg:gap-8">
              <div className="self-start lg:sticky lg:top-[4.75rem] lg:z-40 lg:max-h-[calc(100vh-5.25rem)] lg:overflow-y-auto lg:pr-1">
                <PackageFilterSidebar />
              </div>
              <div className="min-w-0">
                {packages.length === 0 && emptyListing ? (
                  emptyListing
                ) : (
                  <PackageListingWithSearch tours={ordered} />
                )}
              </div>
            </div>

            {resolvedFooter ? (
              <p className="mt-8 text-center text-[11px] text-slate-500 sm:text-xs">
                {resolvedFooter}
              </p>
            ) : null}
          </section>
        </div>
      </div>
      <FloatingEnquireButton
        tourTitle={enquiryTitle}
        tourSku={(featured.slug ?? featured.id).slice(0, 8).toUpperCase()}
      />
      <Footer />
    </QuickEnquiryProvider>
  );
}
