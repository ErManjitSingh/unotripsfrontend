export {
  searchHotels,
  fetchFeaturedHotels,
  fetchAllHotels,
  fetchHotelDetail,
  fetchRelatedHotels,
  fetchHotelSlugs,
  fetchPopularDestinations,
  fetchDestinationBySlug,
  fetchHotelDestinations,
  getHotelDetailBundle,
  resolveHotelCity,
  resolveHotelBookingSelection,
  mapApiHotelToListing,
  citySlugFromName,
} from "@/lib/hotels-api";

export type {
  ApiHotel,
  ApiHotelDetail,
  HotelListing,
  HotelSearchParams,
  HotelDetailBundle,
  HotelDestinationListing,
} from "@/lib/hotels-api";

import {
  searchHotels,
  fetchFeaturedHotels,
  fetchAllHotels,
  fetchRelatedHotels,
  fetchHotelDetail,
} from "@/lib/hotels-api";
import { apiGetEnvelope } from "@/services/api";

export { fetchAllHotels as getAllHotels };

export async function getFeaturedHotels(limit?: number) {
  const { hotels } = await fetchAllHotels(limit ?? 50);
  if (hotels.length > 0) return limit ? hotels.slice(0, limit) : hotels;
  const featured = await fetchFeaturedHotels();
  return limit ? featured.slice(0, limit) : featured;
}

export async function getHotelBySlug(city: string, slug: string, checkIn?: string, checkOut?: string) {
  return fetchHotelDetail(city, slug, checkIn, checkOut);
}

export async function getRelatedHotels(hotelId: string, limit = 4) {
  return fetchRelatedHotels(hotelId, limit);
}

export async function getHotelAvailability(hotelId: string, roomTypeId: string, checkIn?: string, checkOut?: string) {
  const q = new URLSearchParams();
  if (checkIn) q.set("check_in", checkIn);
  if (checkOut) q.set("check_out", checkOut);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return apiGetEnvelope<unknown>(`/v1/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomTypeId)}/availability-suggestions${qs}`);
}