import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HeroPromoBanner } from "@/components/home/hero-promo-banner";
import {
  BlogPreviewSection,
  TestimonialsSection,
} from "@/components/home/home-async-sections";
import { HomeHotelsSection } from "@/components/home/home-hotels-section";
import { TrendingToursApiSection } from "@/components/home/trending-tours-api-section";
import { fetchHomepageHotels, fetchHomepagePackages } from "@/lib/homepage-api";
import {
  BlogPreviewSectionSkeleton,
  SummerEscapesSkeleton,
  TestimonialsSectionSkeleton,
} from "@/components/home/home-page-skeleton";
import { SummerEscapesWithCounts } from "@/components/home/summer-escapes-with-counts";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { Stats } from "@/components/home/Stats";
import { TravelCategories } from "@/components/home/TravelCategories";
import { Newsletter } from "@/components/home/Newsletter";
import { FaqSection } from "@/components/home/faq-section";
import { TRAVEL_CATEGORIES } from "@/lib/constants";
import { LeadCaptureWidgets } from "@/components/home/lead-capture-widgets";

export const dynamic = "force-dynamic";

const getHomepageHotels = unstable_cache(
  () => fetchHomepageHotels(4),
  ["homepage-hotels-slim-4"],
  { revalidate: 900 },
);

const getHomepagePackages = unstable_cache(
  () => fetchHomepagePackages(4),
  ["homepage-packages-slim-4"],
  { revalidate: 900 },
);

export const metadata: Metadata = {
  title: "UNO Trips — Travel Made Simple | Best Tour & Holiday Packages",
  description:
    "Book flights, hotels, trains, buses and holiday packages — curated deals, clear pricing, and 24×7 support. Travel made simple with UNO Trips.",
  openGraph: {
    title: "UNO Trips — Travel Made Simple",
    description:
      "Flights, hotels, trains, buses and holiday packages — curated deals, clear pricing, and 24×7 support.",
  },
};

// Race each server-side fetch against a 3-second deadline.
// If the backend is slow (DB cold, Redis miss), we return null and let
// the client components fetch on their own — page never blocks past 3s.
// When the backend IS fast (Redis hit), data arrives well within 3s and
// is passed as initialData → page renders with content, no skeleton.
function withTimeout<T>(p: Promise<T | null>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((res) => setTimeout(() => res(null), ms))]);
}

export default async function HomePage() {
  const [hotelsData, packagesData] = await Promise.all([
    withTimeout(getHomepageHotels().catch(() => null), 3000),
    withTimeout(getHomepagePackages().catch(() => null), 3000),
  ]);

  // Only hydrate client components when server actually got real data.
  // If the server fetch failed or returned empty, pass undefined so the
  // client component falls back to its own React Query fetch.
  const hotelsInitial   = (hotelsData?.hotels?.length ?? 0) > 0 ? hotelsData   : undefined;
  const packagesInitial = (packagesData?.length       ?? 0) > 0 ? packagesData : undefined;

  return (
    <>
      <main>
        <div>
          <div className="text-[#212121] antialiased">
            <Navbar variant="ease" />
            <Suspense
              fallback={
                <HeroSection searchCatalog={{ destinations: [], packages: [] }} />
              }
            >
              <HomeHeroSection />
            </Suspense>
            <HeroPromoBanner />
          </div>
          <div className="pb-[72px] sm:pb-0">
            <Suspense fallback={<SummerEscapesSkeleton />}>
              <SummerEscapesWithCounts />
            </Suspense>
            <TrendingToursApiSection initialData={packagesInitial} />
            <HomeHotelsSection initialData={hotelsInitial} />
            <WhyChooseUs />
            <div className="py-5 sm:py-6">
              <SpecialOffers />
            </div>
            <Stats />
            <Suspense fallback={<TestimonialsSectionSkeleton />}>
              <TestimonialsSection />
            </Suspense>
            <TravelCategories categories={TRAVEL_CATEGORIES} />
            <Suspense fallback={<BlogPreviewSectionSkeleton />}>
              <BlogPreviewSection />
            </Suspense>
            <FaqSection />
            <Newsletter />
          </div>
        </div>
        <LeadCaptureWidgets />
      </main>
      <Footer />
    </>
  );
}
