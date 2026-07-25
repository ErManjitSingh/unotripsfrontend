import type { Metadata } from "next";
import { LehTourLanding } from "@/components/meta/leh-tour/leh-tour-landing";
import { LEH_ADS } from "@/lib/meta/leh-tour-data";
import { LEH_CRO, LEH_FAQS, LEH_PACKAGES_ENRICHED, LEH_SAMPLE_ITINERARY } from "@/lib/meta/leh-ads-content";

const site = "https://unotrips.com";

export const metadata: Metadata = {
  title: { absolute: "Leh Ladakh Tour Packages 2026 | Starting ₹18,999 | Uno Trips" },
  description: LEH_ADS.description,
  alternates: { canonical: LEH_ADS.path },
};

export default function LehTourPackagePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "TravelAgency"],
        "@id": `${site}${LEH_ADS.path}/#agency`,
        name: "Uno Trips",
        url: site,
        logo: `${site}${LEH_ADS.img}/logo.png`,
        image: `${site}${LEH_ADS.img}/hero.webp`,
        telephone: LEH_ADS.phoneDisplay,
        priceRange: "₹₹",
        areaServed: { "@type": "Place", name: "Leh Ladakh, India" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: LEH_CRO.rating,
          reviewCount: "14001",
          bestRating: "5",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site },
          {
            "@type": "ListItem",
            position: 2,
            name: "Leh Ladakh Tour Packages",
            item: `${site}${LEH_ADS.path}/`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: LEH_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "ItemList",
        name: "Leh Ladakh Tour Packages 2026",
        itemListElement: LEH_PACKAGES_ENRICHED.slice(0, 6).map((pkg, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: pkg.title,
            image: pkg.image,
            description: `${pkg.duration}: ${pkg.route.join(" to ")}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: pkg.priceValue,
              availability: "https://schema.org/InStock",
              url: `${site}${LEH_ADS.path}/#${pkg.anchor}`,
            },
          },
        })),
      },
      {
        "@type": "TouristTrip",
        name: "Classic Leh Nubra Pangong Itinerary",
        itinerary: {
          "@type": "ItemList",
          itemListElement: LEH_SAMPLE_ITINERARY.map((day) => ({
            "@type": "ListItem",
            position: day.day,
            name: day.title,
            description: day.detail,
          })),
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: LEH_CRO.startingValue,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <LehTourLanding />
    </>
  );
}
