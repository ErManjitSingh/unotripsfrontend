import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelsCityResultsView } from "@/components/hotels/hotels-city-results-view";
import {
  fetchHotelDestinations,
  resolveHotelCity,
  searchHotels,
} from "@/lib/hotels-api";
import { parseHotelCitySlug } from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const citySlug = parseHotelCitySlug(slug);
  const city = await resolveHotelCity(citySlug);
  if (!city) {
    return { title: `Hotels | ${TRAVEL_HOME_BRAND.name}` };
  }
  return {
    title: `Hotels in ${city.name} | ${TRAVEL_HOME_BRAND.name}`,
    description: `Compare hotels in ${city.name} with filters, ratings, and lowest price guarantee.`,
  };
}

export default async function HotelInCityPage({ params }: PageProps) {
  const { slug } = await params;
  const citySlug = parseHotelCitySlug(slug);
  const city = await resolveHotelCity(citySlug);
  if (!city) notFound();

  const { hotels } = await searchHotels({
    city: city.name,
    limit: 50,
    sort: "popular",
  });

  const destinations = await fetchHotelDestinations();

  return (
    <HotelsCityResultsView
      city={city}
      hotels={hotels}
      destinations={destinations.map((d) => ({
        slug: d.slug,
        city: d.city,
        state: d.state,
        country: d.country,
      }))}
    />
  );
}
