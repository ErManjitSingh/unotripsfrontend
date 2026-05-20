import type { HotelDestinationListing } from "@/lib/hotels-api";
import { fetchHotelDestinations } from "@/lib/hotels-api";
import { hotelHref } from "@/lib/hotels-catalog";
import { HotelsPopularDestinations } from "@/components/hotels/hotels-popular-destinations";

type HotelsPopularDestinationsSectionProps = {
  destinations?: HotelDestinationListing[];
};

export async function HotelsPopularDestinationsSection({
  destinations: destinationsProp,
}: HotelsPopularDestinationsSectionProps) {
  const apiDests = destinationsProp ?? (await fetchHotelDestinations());
  if (apiDests.length === 0) return null;

  const destinations = apiDests.map((d, i) => ({
    name: d.city,
    state: d.state,
    description:
      d.hotelCount > 0
        ? `${d.hotelCount} ${d.hotelCount === 1 ? "property" : "properties"} available`
        : "Hotels available",
    href: hotelHref(d.slug),
    image: d.imageUrl,
    featured: i === 0,
    hotelCount: d.hotelCount,
    startingPrice: d.startingPrice,
  }));

  return <HotelsPopularDestinations destinations={destinations} />;
}
