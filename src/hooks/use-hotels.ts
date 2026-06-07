"use client";

import { useQuery } from "@tanstack/react-query";
import type { HotelSearchParams } from "@/services/hotels";
import {
  getAllHotels,
  getFeaturedHotels,
  getHotelDetailBundle,
  getRelatedHotels,
  searchHotels,
} from "@/services/hotels";

export function useHotels(params?: HotelSearchParams) {
  return useQuery({
    queryKey: ["hotels", "search", params],
    queryFn: () => (params ? searchHotels(params) : getAllHotels()),
  });
}

export function useAllHotels(limit = 50) {
  return useQuery({
    queryKey: ["hotels", "all", limit],
    queryFn: () => getAllHotels(limit),
  });
}

export function useHotel(city: string, hotelId: string) {
  return useQuery({
    queryKey: ["hotels", "detail", city, hotelId],
    queryFn: () => getHotelDetailBundle(city, hotelId),
    enabled: Boolean(city && hotelId),
  });
}

export function useFeaturedHotels(limit = 50) {
  return useQuery({
    queryKey: ["hotels", "featured", limit],
    queryFn: () => getFeaturedHotels(limit),
  });
}

export function useRelatedHotels(hotelId: string, limit = 4) {
  return useQuery({
    queryKey: ["hotels", "related", hotelId, limit],
    queryFn: () => getRelatedHotels(hotelId, limit),
    enabled: Boolean(hotelId),
  });
}