import type { HotelDestinationListing } from "@/lib/hotels-api";
import { fetchHotelDestinations } from "@/lib/hotels-api";
import { hotelHref } from "@/lib/hotels-catalog";
import { HotelsPopularDestinations } from "@/components/hotels/hotels-popular-destinations";

const DESTINATION_IMAGE_FALLBACKS: Record<string, string> = {
  shimla: "https://images.unsplash.com/photo-1510027834-5f309a0f8c7d?w=1200&q=85",
  manali: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85",
  dharamshala: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=85",
  dalhousie: "https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=1200&q=85",
  himachal: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=85",
  rajasthan: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=85",
  jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=85",
  udaipur: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=85",
  jodhpur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=85",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85",
  kochi: "https://images.unsplash.com/photo-1589809066073-5f4d8cf2d6bb?w=1200&q=85",
  munnar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85",
  alleppey: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=85",
  sikkim: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85",
  gangtok: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85",
  kashmir: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=85",
  srinagar: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=85",
  gulmarg: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=85",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=85",
  amritsar: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=85",
  chandigarh: "https://images.unsplash.com/photo-1564082791114-45e8b27c8a5a?w=1200&q=85",
};

function pickDestinationImage(slug: string, city: string, fallback: string) {
  const key = slug.toLowerCase();
  const cityKey = city.toLowerCase().replace(/\s+/g, "-");
  return DESTINATION_IMAGE_FALLBACKS[key] ?? DESTINATION_IMAGE_FALLBACKS[cityKey] ?? fallback;
}

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
    image: pickDestinationImage(d.slug, d.city, d.imageUrl),
    fallbackImage: d.imageUrl || "/images/hotels/hero-banner.webp",
    featured: i === 0,
    hotelCount: d.hotelCount,
    startingPrice: d.startingPrice,
  }));

  return <HotelsPopularDestinations destinations={destinations} />;
}
