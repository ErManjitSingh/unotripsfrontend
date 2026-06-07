import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HotelsSearchHero } from "@/components/hotels/hotels-search-hero";
import { HotelsMoroccoBanner } from "@/components/hotels/hotels-morocco-banner";
import { HotelsExclusiveOffers } from "@/components/hotels/hotels-exclusive-offers";
import { HotelsPopularDestinationsSection } from "@/components/hotels/hotels-popular-destinations-section";
import { HotelsPopularHotelsSection } from "@/components/hotels/hotels-popular-hotels-section";
import { HotelsPageCta } from "@/components/hotels/hotels-page-cta";
import { fetchHotelDestinations } from "@/lib/hotels-api";
import { hotelHref, toHotelDestinationOptions } from "@/lib/hotels-catalog";
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
      <main className="min-h-screen bg-slate-50">
        <Navbar variant="ease" easeActiveNavId="hotels" />
        <HotelsSearchHero
          destinations={toHotelDestinationOptions(destinations)}
          defaultCity={first?.city}
          defaultCountry={first?.country ?? "India"}
          defaultSlug={first?.slug}
        />
        <HotelsMoroccoBanner />
        <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
          <HotelsPopularDestinationsSection destinations={destinations} />
          <HotelsPopularHotelsSection
            viewMoreHref={
              destinations[0]?.slug ? hotelHref(destinations[0].slug) : "/hotels#popular-destinations"
            }
          />
          <HotelsExclusiveOffers />
          <HotelsPageCta />
        </div>
      </main>
      <Footer />
    </>
  );
}
