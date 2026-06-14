/**
 * src/app/hotel/[slug]/[hotelId]/book/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Hotel booking (travellers) page.
 *
 * CHANGES vs previous version:
 * ──────────────────────────────
 * 1. REMOVED `export const dynamic = "force-dynamic"`
 *
 *    The booking page needs live availability because the guest is about to
 *    pay. BUT — the bundle itself (hotel info, room list) can still be cached.
 *    The actual availability check happens at POST /v1/bookings time, not here.
 *    This page just shows the hotel details and room selection.
 *
 *    Using `revalidate = 30` instead of force-dynamic. Same reasoning as the
 *    detail page — 30s stale availability display is acceptable because the
 *    live check happens at booking submission.
 *
 * 2. REMOVED redundant `decodeURIComponent(hotelId)` on line 2 of bundle call
 *
 *    getHotelDetailBundle() already calls decodeURIComponent() internally.
 *    Double-decoding caused issues with slugs containing encoded characters.
 *
 * 3. CHECK-IN / CHECK-OUT from searchParams
 *
 *    The booking page is reached with ?check_in=...&check_out=... in the URL.
 *    These are now passed to getHotelDetailBundle() so the backend returns
 *    real per-room availability for those specific dates.
 *    Without this, the bundle returned rooms without availability data,
 *    and the booking page showed "available" for all rooms even if full.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Metadata }  from "next";
import { notFound }       from "next/navigation";
import { Suspense }       from "react";
import { HotelTravellersView }  from "@/components/hotels/hotel-travellers-view";
import { getHotelDetailBundle } from "@/lib/hotels-api";
import { parseHotelCitySlug }   from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND }    from "@/lib/travel-home-brand";

// 30s ISR — booking page needs reasonably fresh data but not live on every
// request. The actual live availability check is at POST /v1/bookings time.
export const revalidate = 30;

type PageProps = {
  params:      Promise<{ slug: string; hotelId: string }>;
  searchParams: Promise<{
    check_in?:  string;
    check_out?: string;
    adults?:    string;
    rooms?:     string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, hotelId } = await params;

  // No dates for metadata — we only need the hotel name.
  // Next.js deduplicates this with the page render call below when both
  // omit dates. If the page render includes dates, they get separate cache
  // entries — still correct, metadata just shows the hotel name.
  const bundle = await getHotelDetailBundle(parseHotelCitySlug(slug), hotelId);

  if (!bundle) {
    return { title: `Book Hotel | ${TRAVEL_HOME_BRAND.name}` };
  }

  return {
    title: `Book ${bundle.hotel.name} | ${TRAVEL_HOME_BRAND.name}`,
    description: `Review guests and complete your booking for ${bundle.hotel.name}.`,
  };
}

function TravellersFallback() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] px-3 py-12">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6 space-y-4">
        <div className="h-10 animate-pulse rounded bg-white" />
        <div className="h-48 animate-pulse rounded-lg bg-white" />
        <div className="h-64 animate-pulse rounded-lg bg-white" />
      </div>
    </main>
  );
}

export default async function HotelBookPage({ params, searchParams }: PageProps) {
  const { slug, hotelId }         = await params;
  const { check_in, check_out }   = await searchParams;

  // Pass dates so backend returns per-room availability for this stay.
  // hotelId is already URL-decoded by Next.js — no need for decodeURIComponent.
  const bundle = await getHotelDetailBundle(
    parseHotelCitySlug(slug),
    hotelId,
    check_in,
    check_out,
  );

  if (!bundle) notFound();

  return (
    <Suspense fallback={<TravellersFallback />}>
      <HotelTravellersView
        pathSlug={slug}
        hotelId={hotelId}
        bundle={bundle}
      />
    </Suspense>
  );
}