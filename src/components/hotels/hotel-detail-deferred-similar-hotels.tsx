"use client";

import { useQuery } from "@tanstack/react-query";
import { HotelDetailSimilarHotels } from "@/components/hotels/hotel-detail-similar-hotels";
import { fetchRelatedHotels } from "@/lib/hotels-api";
import type { HotelCity } from "@/lib/hotels-catalog";

type HotelDetailDeferredSimilarHotelsProps = {
  hotelId: string;
  city: HotelCity;
};

/**
 * Similar properties are not part of the landing-page decision. Fetch them
 * only after the visitor has scrolled past the primary booking content.
 */
export function HotelDetailDeferredSimilarHotels({
  hotelId,
  city,
}: HotelDetailDeferredSimilarHotelsProps) {
  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels", "related", hotelId],
    queryFn: () => fetchRelatedHotels(hotelId, 4),
    staleTime: 5 * 60 * 1000,
  });

  return <HotelDetailSimilarHotels hotels={hotels} city={city} />;
}
