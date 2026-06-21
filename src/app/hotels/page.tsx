import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HotelsSearchHero } from "@/components/hotels/hotels-search-hero";
import { HotelsFeaturedDestinations } from "@/components/hotels/hotels-featured-destinations";
import { HotelsExclusiveOffers } from "@/components/hotels/hotels-exclusive-offers";
import { HotelsPopularDestinationsSection } from "@/components/hotels/hotels-popular-destinations-section";
import { HotelsPopularHotelsSection } from "@/components/hotels/hotels-popular-hotels-section";
import { HotelsPageCta } from "@/components/hotels/hotels-page-cta";
import { fetchFeaturedHotels, fetchHotelDestinations } from "@/lib/hotels-api";
import { hotelHref, toHotelDestinationOptions } from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

// Revalidate every 5 minutes — destinations and hotel list change rarely.
// Removed force-dynamic: that was causing a full DB hit on every single page
// load. With revalidate=300, Next.js serves the cached page instantly and
// rebuilds in the background only when 5 minutes have passed.
export const revalidate = 300;

export const metadata: Metadata = {
  title: `Hotels | ${TRAVEL_HOME_BRAND.name} — Same hotel, cheapest price`,
  description:
    "Search hotels by city, check-in dates, and guests. Exclusive offers and lowest price guarantee with UNO Trips.",
};

export default async function HotelsPage() {
  const [destinations, featuredHotels] = await Promise.all([
    fetchHotelDestinations(),
    fetchFeaturedHotels(),
  ]);
  const first = destinations[0];
  const ctaHotel = featuredHotels[0] ?? null;

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
        <HotelsFeaturedDestinations />
        <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
          <HotelsPopularDestinationsSection destinations={destinations} />
          <HotelsPopularHotelsSection
            viewMoreHref={
              destinations[0]?.slug ? hotelHref(destinations[0].slug) : "/hotels#popular-destinations"
            }
          />
          <HotelsExclusiveOffers />
          <HotelsPageCta hotel={ctaHotel} />
        </div>
      </main>
      <Footer />
    </>
  );
}