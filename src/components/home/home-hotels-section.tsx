"use client";

import { HandpickedHotelsSlider } from "@/components/home/handpicked-hotels-slider";
import { SummerEscapesSkeleton } from "@/components/home/home-page-skeleton";
import { useHomepageHotels } from "@/hooks/use-homepage";
import type { HotelListing } from "@/lib/hotels-catalog";

interface Props {
  initialData?: { hotels: HotelListing[]; total: number } | null;
}

export function HomeHotelsSection({ initialData }: Props) {
  const { data, isLoading } = useHomepageHotels(4, initialData ?? undefined);

  if (isLoading) return <SummerEscapesSkeleton />;

  const hotels = data?.hotels ?? [];
  const total = data?.total ?? 0;

  if (!hotels.length) return null;

  return <HandpickedHotelsSlider hotels={hotels} total={total} />;
}
