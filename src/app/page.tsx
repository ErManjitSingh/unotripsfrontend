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
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";
import { PAGE_MARGIN_X_CLASS } from "@/lib/page-gutter";

export const metadata: Metadata = {
  title: "Rajasthan Tour Packages | UNO Trips — India Holidays",
  description:
    "Book Rajasthan tour packages and India holidays — premium floating search, curated deals, and 24×7 support.",
  openGraph: {
    title: `${TRAVEL_HOME_BRAND.name} — Holidays`,
    description: "Rajasthan tour packages and handpicked India holidays.",
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
          <div className={PAGE_MARGIN_X_CLASS}>
            <Suspense fallback={<SummerEscapesSkeleton />}>
              <SummerEscapesWithCounts />
            </Suspense>
            <Suspense fallback={<TrendingToursSectionSkeleton />}>
              <TrendingToursSection />
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
      </main>
      <Footer />
    </>
  );
}
