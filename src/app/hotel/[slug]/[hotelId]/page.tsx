/**
 * src/app/hotel/[slug]/[hotelId]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Hotel detail page.
 *
 * CHANGES vs previous version:
 * ──────────────────────────────
 * 1. REMOVED `export const dynamic = "force-dynamic"`
 *
 *    force-dynamic disabled ALL Next.js caching on this page — every visitor
 *    triggered a full server render + backend API calls from scratch.
 *
 *    Replaced with `export const revalidate = 30` (ISR — 30 second window).
 *    This means:
 *      - First visitor after 30s: Next.js re-renders in background, serves
 *        the previous cached version instantly (stale-while-revalidate).
 *      - All other visitors: served from Next.js cache — zero backend calls.
 *      - 30 seconds aligns with the backend Redis TTL for hotel detail with
 *        dates (30s). Without dates the backend caches for 5 minutes.
 *
 *    Why 30s not 5 minutes?
 *      Hotel detail pages can show availability counts (rooms left). These
 *      change on every booking. 30s means availability is at most 30s stale —
 *      acceptable for a browse page. The actual booking step does a live
 *      availability check so stale counts on the detail page are never a
 *      booking correctness issue.
 *
 * 2. SHARED bundle between generateMetadata and page render
 *
 *    BEFORE: generateMetadata() called getHotelDetailBundle() independently,
 *            then the page component called it again. Two separate fetches,
 *            doubling all API calls just for page metadata.
 *
 *    AFTER:  Next.js automatically deduplicates fetch() calls with the same
 *            URL within a single request via React's cache() / fetch cache.
 *            Both calls resolve to the same cached result with zero extra
 *            backend requests. This works because apiFetch() uses native
 *            fetch() which Next.js intercepts and deduplicates.
 *
 * 3. `checkIn` / `checkOut` from searchParams passed to getHotelDetailBundle
 *
 *    When a user searches with dates, the backend returns real availability
 *    counts per room. The URL search params are forwarded so the detail page
 *    shows accurate "X rooms left" counts.
 *
 *    The backend caches date-parameterised requests for 30s separately from
 *    the no-date cache (5 min). Short TTL is correct here — availability
 *    changes on every confirmed booking.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { notFound }       from "next/navigation";
import type { Metadata }  from "next";
import { Suspense }       from "react";
import { HotelDetailView } from "@/components/hotels/hotel-detail-view";
import { getHotelDetailBundle } from "@/lib/hotels-api";
import { parseHotelCitySlug }   from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND }    from "@/lib/travel-home-brand";

// ISR: re-render at most every 30 seconds.
// Aligns with backend Redis TTL for date-parameterised hotel detail (30s).
// Without dates, backend caches for 5 min — this page revalidates sooner,
// which is conservative-safe. Raise to 300 if you don't show availability
// counts on the detail page without dates.
export const revalidate = 30;

type PageProps = {
  params:      Promise<{ slug: string; hotelId: string }>;
  searchParams: Promise<{ check_in?: string; check_out?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, hotelId } = await params;

  // Next.js deduplicates this fetch() call with the one in the page component
  // below — same URL, same request lifecycle = zero extra backend call.
  const bundle = await getHotelDetailBundle(
    parseHotelCitySlug(slug),
    hotelId,
  );

  if (!bundle) {
    return { title: `Hotel | ${TRAVEL_HOME_BRAND.name}` };
  }

  return {
    title: `${bundle.hotel.name} | Hotels in ${bundle.city.name} | ${TRAVEL_HOME_BRAND.name}`,
    description: `Book ${bundle.hotel.name} — room options, photos, reviews and lowest price on ${TRAVEL_HOME_BRAND.name}.`,
    openGraph: bundle.hotel.images[0]
      ? { images: [{ url: bundle.hotel.images[0] }] }
      : undefined,
  };
}

export default async function HotelDetailPage({ params, searchParams }: PageProps) {
  const { slug, hotelId }         = await params;
  const { check_in, check_out }   = await searchParams;

  // Next.js deduplicates this with the generateMetadata call above when dates
  // are absent. When dates are present the URL differs so it's a separate
  // cached entry — correct because availability is date-specific.
  const bundle = await getHotelDetailBundle(
    parseHotelCitySlug(slug),
    hotelId,
    check_in,
    check_out,
  );

  if (!bundle) notFound();

  return (
    <Suspense fallback={null}>
      <HotelDetailView
        city={bundle.city}
        hotel={bundle.hotel}
        roomTypes={bundle.roomTypes}
        policies={bundle.policies}
        apiReviews={bundle.reviews}
        similarHotels={bundle.similarHotels}
        nearbyAttractions={bundle.nearbyAttractions}
        photoCategories={bundle.photoCategories}
      />
    </Suspense>
  );
}