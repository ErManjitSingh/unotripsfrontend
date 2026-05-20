import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HotelsSearchHero } from "@/components/hotels/hotels-search-hero";
import { HotelsMoroccoBanner } from "@/components/hotels/hotels-morocco-banner";
import { HotelsExclusiveOffers } from "@/components/hotels/hotels-exclusive-offers";
import { HotelsPopularDestinationsSection } from "@/components/hotels/hotels-popular-destinations-section";
import { fetchHotelDestinations } from "@/lib/hotels-api";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Hotels | ${TRAVEL_HOME_BRAND.name} — Same hotel, cheapest price`,
  description:
    "Search hotels by city, check-in dates, and guests. Exclusive offers and lowest price guarantee with UNO Trips.",
};

export default async function HotelsPage() {
  const destinations = await fetchHotelDestinations();
  const first = destinations[0];

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <HotelsSearchHero defaultCity={first?.city} />
        <HotelsMoroccoBanner />
        <HotelsExclusiveOffers />
        <HotelsPopularDestinationsSection />
      </main>
      <Footer />
    </>
  );
}
