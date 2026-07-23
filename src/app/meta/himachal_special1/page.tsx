import type { Metadata } from "next";
import { HimachalSpecial1Landing } from "@/components/meta/himachal-special1/himachal-special1-landing";
import {
  HIMACHAL_SPECIAL1_ADS,
  HS1_PACKAGES,
  resolveAdsH1,
} from "@/lib/meta/himachal-special1-data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const h1 = resolveAdsH1(params.h1, params.headline, params.kw);
  return {
    title: { absolute: `${h1} | Uno Trips` },
    description: HIMACHAL_SPECIAL1_ADS.description,
    alternates: { canonical: HIMACHAL_SPECIAL1_ADS.path },
  };
}

export default async function HimachalSpecial1Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const h1 = resolveAdsH1(params.h1, params.headline, params.kw);
  const ads = HIMACHAL_SPECIAL1_ADS;
  const site = "https://unotrips.com";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${site}${ads.path}/#agency`,
        name: "Uno Trips – Himachal Tour Packages",
        url: `${site}${ads.path}/`,
        telephone: ads.phoneDisplay,
        areaServed: "Himachal Pradesh, India",
        image: `${site}${ads.img}/hero.webp`,
        priceRange: "₹₹",
      },
      {
        "@type": "ItemList",
        name: "Himachal Tour Packages 2026",
        itemListElement: HS1_PACKAGES.map((pkg, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: pkg.title,
            description: `${pkg.duration} · ${pkg.route.join(" - ")} · ${pkg.highlights.join(", ")}`,
            image: `${site}${pkg.image}`,
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
      ...HS1_PACKAGES.map((pkg) => ({
        "@type": "TouristTrip",
        name: pkg.title,
        description: `${pkg.duration} Himachal package covering ${pkg.route.join(", ")}`,
        touristType: pkg.focus.includes("honeymoon")
          ? "Honeymoon"
          : pkg.focus.includes("spiti")
            ? "Adventure"
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
      <HimachalSpecial1Landing h1={h1} />
    </>
  );
}