import type { Metadata } from "next";
import { LehTourLanding } from "@/components/meta/leh-tour/leh-tour-landing";
import {
  LEH_ADS,
  LEH_PACKAGES,
  resolveLehAdsH1,
} from "@/lib/meta/leh-tour-data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const h1 = resolveLehAdsH1(params.h1, params.headline, params.kw);
  return {
    title: { absolute: `${h1} | Uno Trips` },
    description: LEH_ADS.description,
    alternates: { canonical: LEH_ADS.path },
  };
}

export default async function LehTourPackagePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const h1 = resolveLehAdsH1(params.h1, params.headline, params.kw);
  const ads = LEH_ADS;
  const site = "https://unotrips.com";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${site}${ads.path}/#agency`,
        name: "Uno Trips - Leh Ladakh Tour Packages",
        url: `${site}${ads.path}/`,
        telephone: ads.phoneDisplay,
        areaServed: "Leh Ladakh, India",
        image: `${site}${ads.img}/hero.jpg`,
        priceRange: "₹₹",
      },
      {
        "@type": "ItemList",
        name: "Leh Ladakh Tour Packages 2026",
        itemListElement: LEH_PACKAGES.map((pkg, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: pkg.title,
            description: `${pkg.duration} · ${pkg.route.join(" - ")} · ${pkg.highlights.join(", ")}`,
            image: pkg.image.startsWith("http") ? pkg.image : `${site}${pkg.image}`,
            brand: { "@type": "Brand", name: ads.brand },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: pkg.priceValue,
              availability: "https://schema.org/InStock",
              url: `${site}${ads.path}/#${pkg.anchor}`,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              reviewCount: "14001",
              bestRating: "5",
            },
          },
        })),
      },
      ...LEH_PACKAGES.map((pkg) => ({
        "@type": "TouristTrip",
        name: pkg.title,
        description: `${pkg.duration} Ladakh package covering ${pkg.route.join(", ")}`,
        touristType: pkg.focus.includes("biking")
          ? "Adventure"
          : pkg.focus.includes("family")
            ? "Family"
            : "Leisure",
        itinerary: {
          "@type": "ItemList",
          itemListElement: pkg.itinerary.map((day, d) => ({
            "@type": "ListItem",
            position: d + 1,
            name: day,
          })),
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: pkg.priceValue,
        },
      })),
      {
        "@type": "WebPage",
        "@id": `${site}${ads.path}/#webpage`,
        url: `${site}${ads.path}/`,
        name: h1,
        description: ads.description,
        isPartOf: { "@id": "https://unotrips.com/#website" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <LehTourLanding h1={h1} />
    </>
  );
}