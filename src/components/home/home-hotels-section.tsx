"use client";

import { HandpickedHotelsSlider } from "@/components/home/handpicked-hotels-slider";
import { SummerEscapesSkeleton } from "@/components/home/home-page-skeleton";
import { useAllHotels } from "@/hooks/use-hotels";

export function HomeHotelsSection() {
  const { data, isLoading } = useAllHotels(4);

  if (isLoading) return <SummerEscapesSkeleton />;

  const hotels = data?.hotels ?? [];
  const total = data?.total ?? 0;

  if (!hotels.length) return null;

  return <HandpickedHotelsSlider hotels={hotels} total={total} />;
}
