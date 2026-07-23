import type { Metadata } from "next";
import { HimachalSpecialLanding } from "@/components/meta/himachal-special/himachal-special-landing";
import {
  HIMACHAL_ADS,
  HIMACHAL_FAQS,
  HIMACHAL_PACKAGES,
  resolveAdsH1,
} from "@/lib/meta/himachal-special-data";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const h1 = resolveAdsH1(params.h1 ?? params.headline);
  return {
    title: { absolute: `${h1} | Uno Trips` },
    description: HIMACHAL_ADS.description,
    alternates: { canonical: HIMACHAL_ADS.path },
  };
}

export default async function HimachalSpecialPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const h1 = resolveAdsH1(params.h1 ?? params.headline);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `https://unotrips.com${HIMACHAL_ADS.path}/#agency`,
        name: "Uno Trips — Himachal Tour Packages",
        url: `https://unotrips.com${HIMACHAL_ADS.path}/`,
        telephone: HIMACHAL_ADS.phoneDisplay,
        areaServed: "Himachal Pradesh, India",
        image: `https://unotrips.com${HIMACHAL_ADS.img}/hero.webp`,
      },
      {
        "@type": "ItemList",
        name: "Himachal Tour Packages",
        itemListElement: HIMACHAL_PACKAGES.slice(0, 8).map((pkg, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "TouristTrip",
            name: pkg.title,
            description: pkg.itinerary.join(" · "),
            touristType: pkg.focus.includes("honeymoon")
              ? "Honeymoon"
              : "Leisure",
            itinerary: {
              "@type": "ItemList",
              itemListElement: pkg.itinerary.map((day, di) => ({
                "@type": "ListItem",
                position: di + 1,
                name: day,
              })),
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: HIMACHAL_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "WebPage",
        "@id": `https://unotrips.com${HIMACHAL_ADS.path}/#webpage`,
        url: `https://unotrips.com${HIMACHAL_ADS.path}/`,
        name: h1,
        description: HIMACHAL_ADS.description,
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
      <HimachalSpecialLanding h1={h1} />
    </>
  );
}
