import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HotelTravellersView } from "@/components/hotels/hotel-travellers-view";
import { getHotelDetailBundle } from "@/lib/hotels-api";
import { parseHotelCitySlug } from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; hotelId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, hotelId } = await params;
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

export default async function HotelBookPage({ params }: PageProps) {
  const { slug, hotelId } = await params;
  const bundle = await getHotelDetailBundle(
    parseHotelCitySlug(slug),
    decodeURIComponent(hotelId),
  );

  if (!bundle) notFound();

  return (
    <Suspense fallback={<TravellersFallback />}>
      <HotelTravellersView
        pathSlug={slug}
        hotelId={decodeURIComponent(hotelId)}
        bundle={bundle}
      />
    </Suspense>
  );
}
