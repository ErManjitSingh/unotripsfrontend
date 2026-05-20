import { FAQ_ITEMS, SITE } from "@/lib/constants";

function siteTelephoneForSchema(): string {
  return SITE.phone.replace(/\s/g, "");
}

export function JsonLd() {
  const travelAgency = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    telephone: siteTelephoneForSchema(),
    email: SITE.email,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Shimla",
      addressRegion: "Himachal Pradesh",
      postalCode: "171006",
      addressCountry: "IN",
    },
    sameAs: [SITE.url],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
    ],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgency) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
