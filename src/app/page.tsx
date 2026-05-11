import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { PopularDestinations } from "@/components/home/PopularDestinations";
import { TrendingTours } from "@/components/home/TrendingTours";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { Stats } from "@/components/home/Stats";
import { Testimonials } from "@/components/home/Testimonials";
import { TravelCategories } from "@/components/home/TravelCategories";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Newsletter } from "@/components/home/Newsletter";
import {
  getBlogs,
  getDestinations,
  getPackages,
  getTestimonials,
} from "@/lib/api";
import { TRAVEL_CATEGORIES } from "@/lib/constants";

export default async function HomePage() {
  const [destinations, packages, blogs, testimonials] = await Promise.all([
    getDestinations(),
    getPackages(),
    getBlogs(3),
    getTestimonials(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PopularDestinations items={destinations} />
        <TrendingTours tours={packages} />
        <WhyChooseUs />
        <div className="py-10 sm:py-12">
          <SpecialOffers />
        </div>
        <Stats />
        <Testimonials items={testimonials} />
        <TravelCategories categories={TRAVEL_CATEGORIES} />
        <BlogPreview posts={blogs} />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
