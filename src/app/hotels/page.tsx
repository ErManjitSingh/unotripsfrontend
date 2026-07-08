import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { TravelMobileTopShell } from "@/components/home/HeroSection";
import { HotelsSearchHero } from "@/components/hotels/hotels-search-hero";
import { HotelsFeaturedDestinations } from "@/components/hotels/hotels-featured-destinations";
import { HotelsExclusiveOffers } from "@/components/hotels/hotels-exclusive-offers";
import { HotelsPopularDestinationsSection } from "@/components/hotels/hotels-popular-destinations-section";
import { HotelsPopularHotelsSection } from "@/components/hotels/hotels-popular-hotels-section";
import { HotelsPageCta } from "@/components/hotels/hotels-page-cta";
import { fetchFeaturedHotels, fetchHotelDestinations } from "@/lib/hotels-api";
import { hotelHref } from "@/lib/hotels-catalog";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";
import {
  HotelsExclusiveOffersSkeleton,
  HotelsPopularDestinationsSkeleton,
} from "@/components/hotels/hotels-page-skeleton";

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

async function HotelsDynamicSections() {
  const [destinations, featuredHotels] = await Promise.all([
    fetchHotelDestinations(),
    fetchFeaturedHotels(),
  ]);
  const ctaHotel = featuredHotels[0] ?? null;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <HotelsPopularDestinationsSection destinations={destinations} />
      <HotelsPopularHotelsSection
        hotels={featuredHotels}
        viewMoreHref={
          destinations[0]?.slug ? hotelHref(destinations[0].slug) : "/hotels#popular-destinations"
        }
      />
      <HotelsExclusiveOffers />
      <HotelsPageCta hotel={ctaHotel} />
    </div>
  );
}

function HotelsSectionsFallback() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <HotelsPopularDestinationsSkeleton />
      <HotelsExclusiveOffersSkeleton />
    </div>
  );
}

export default function HotelsPage() {
  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <div className="hidden md:block">
          <HeroGlassNavbar activeId="hotels" />
        </div>
        <TravelMobileTopShell activeId="hotels" showGreeting={false} />
        <HotelsSearchHero
          defaultCity="Shimla"
          defaultCountry="India"
          defaultSlug="shimla"
        />
        <HotelsFeaturedDestinations />
        <Suspense fallback={<HotelsSectionsFallback />}>
          <HotelsDynamicSections />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
