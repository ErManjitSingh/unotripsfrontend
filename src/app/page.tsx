import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HeroPromoBanner } from "@/components/home/hero-promo-banner";
import {
  BlogPreviewSection,
  TestimonialsSection,
  TrendingToursSection,
} from "@/components/home/home-async-sections";
import { HomeHotelsSection } from "@/components/home/home-hotels-section";
import {
  BlogPreviewSectionSkeleton,
  SummerEscapesSkeleton,
  TestimonialsSectionSkeleton,
  TrendingToursSectionSkeleton,
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

export default function HomePage() {
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
            <Suspense fallback={<TrendingToursSectionSkeleton />}>
              <TrendingToursSection />
            </Suspense>
            <Suspense fallback={<SummerEscapesSkeleton />}>
              <HomeHotelsSection />
            </Suspense>
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
