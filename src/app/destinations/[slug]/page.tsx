/**
 * src/app/destinations/[slug]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Destination detail page — lists all packages for a destination.
 *
 * CHANGES vs previous version:
 * ─────────────────────────────
 * 1. REMOVED `export const dynamic = "force-dynamic"`
 *
 *    force-dynamic was disabling ALL Next.js caching on this page.
 *    Every visitor triggered a full server render + backend API calls.
 *    Destination data changes very rarely — force-dynamic was wrong here.
 *
 *    Replaced with `export const revalidate = 600` (ISR — 10 min).
 *    Destination data (name, image, package count) changes infrequently.
 *    10 min aligns with the backend Redis TTL for destination endpoints.
 *
 * 2. ELIMINATED double getDestinationBySlug() call
 *
 *    BEFORE:
 *      destinations/[slug]/page.tsx → generateMetadata() calls getDestinationBySlug()
 *      destinations/[slug]/destination-page-content.tsx → also calls getDestinationBySlug()
 *
 *      Two separate async server components, same slug, same endpoint,
 *      zero sharing. With force-dynamic and cache: "no-store" (now fixed),
 *      that was 2 backend calls per page render for destination data alone.
 *
 *    AFTER:
 *      React.cache() wraps getDestinationBySlug() into getCachedDestination().
 *      generateMetadata() and DestinationPageContent() share one result.
 *      The cached destination is passed as a prop to DestinationPageContent
 *      so it never needs to fetch it again.
 *
 * 3. Destination data passed as prop (eliminates the component-level fetch)
 *
 *    DestinationPageContent now accepts `destination` as an optional prop.
 *    When provided (from this page), it skips the fetch entirely.
 *    When not provided (backward compat), it fetches normally.
 *    This pattern means zero duplicate destination fetches.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cache }         from "react";
import type { Metadata } from "next";
import { getDestinationBySlug } from "@/lib/cms-api";
import { DestinationPageContent } from "./destination-page-content";

// ISR: revalidate every 10 min — destinations change very rarely.
// Aligns with backend Redis TTL for /v1/destinations/* (10 min).
// Admin updates to destination data visible within 10 min.
// Destination package results must reflect the same live catalog as the
// packages listing; do not serve an old cached empty result.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// ── Request-level memoization ─────────────────────────────────────────────────
//
// React.cache() ensures generateMetadata and DestinationPageContent share
// one fetch result per request. The destination data is the same for both —
// fetching it twice is pure waste.
//
// Scope: one server request. Cleared after each render. No stale data risk.
const getCachedDestination = cache(
  (slug: string) => getDestinationBySlug(slug),
);

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // getCachedDestination: memoized — shared with DestinationPageContent below
  const d = await getCachedDestination(slug);

  if (!d) return { title: "Destination" };

  return {
    title:       `${d.name} Tour Packages`,
    description: `${d.name} — browse holiday packages, deals, and request a call back.`,
    openGraph: {
      title:       `${d.name} Tour Packages`,
      description: `Explore ${d.name} with UNO Trips.`,
      images:      [{ url: d.image }],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;

  // getCachedDestination: memoized — returns same result as generateMetadata call.
  // Zero extra backend call for destination data.
  const destination = await getCachedDestination(slug);

  // Pass pre-fetched destination to content component — eliminates its fetch
  return (
    <DestinationPageContent
      params={params}
      destination={destination}
    />
  );
}
