import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HotelDetailView } from "@/components/hotels/hotel-detail-view";
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

export default async function HotelDetailPage({ params }: PageProps) {
  const { slug, hotelId } = await params;
  const bundle = await getHotelDetailBundle(parseHotelCitySlug(slug), hotelId);

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
