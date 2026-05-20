import type { Metadata } from "next";
import { Suspense } from "react";
import { HotelViewClient } from "@/components/hotels/hotel-view-client";
import { HotelsCityResultsSkeleton } from "@/components/hotels/hotels-page-skeleton";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Hotel details | ${TRAVEL_HOME_BRAND.name}`,
  description: "View rooms, photos, reviews and book your stay on UNO Trips.",
};

export default function HotelViewPage() {
  return (
    <Suspense fallback={<HotelsCityResultsSkeleton />}>
      <HotelViewClient />
    </Suspense>
  );
}
