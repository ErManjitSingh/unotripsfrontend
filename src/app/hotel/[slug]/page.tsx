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

// This page stays force-dynamic — it renders user search params (check_in,
// check_out, rooms, guests, sort) which are different per request.
// The searchHotels call itself cannot be cached per-page because the results
// depend on user-supplied query params that change on every search.
// fetchHotelDestinations uses next: { revalidate: 600 } inside hotels-api.ts
// so it still benefits from Next.js fetch cache even inside a dynamic page.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function readIntParam(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = readParam(value);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

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

export default async function HotelInCityPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const citySlug = parseHotelCitySlug(slug);
  const [city, destinations] = await Promise.all([
    resolveHotelCity(citySlug),
    fetchHotelDestinations(),
  ]);
  if (!city) notFound();

  const checkIn = readParam(sp.check_in);
  const checkOut = readParam(sp.check_out);
  const rooms = readIntParam(sp.rooms, 1);
  const guests = readIntParam(sp.guests, 2);
  const lastMinute = readParam(sp.last_minute) === "1";
  const sortParam = readParam(sp.sort);
  const q = readParam(sp.q);

  const firstResult = await searchHotels({
    city: city.name,
    q,
    check_in: checkIn,
    check_out: checkOut,
    adults: guests,
    rooms,
    limit: 50,
    sort: sortParam === "price-low" ? "price_low" : "popular",
  });

  const useFallbackCitySearch = Boolean(q && firstResult.total === 0);
  const { hotels } = useFallbackCitySearch
    ? await searchHotels({
        // A free-text hotel-name search should still work when the typed
        // property's city differs from the destination used for the URL.
        // The first request remains city-scoped for the common case.
        q,
        check_in: checkIn,
        check_out: checkOut,
        adults: guests,
        rooms,
        limit: 50,
        sort: sortParam === "price-low" ? "price_low" : "popular",
      })
    : firstResult;

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
      initialCheckIn={checkIn}
      initialCheckOut={checkOut}
      initialRooms={rooms}
      initialGuests={guests}
      initialLastMinute={lastMinute}
      initialSort={sortParam === "price-low" ? "price-low" : "popularity"}
      initialSearchQuery={q}
    />
  );
}
