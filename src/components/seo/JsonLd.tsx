import { SITE } from "@/lib/constants";

const faqEntities = [
  {
    question: "Do you offer fully customized itineraries?",
    answer:
      "Yes. Our travel designers build bespoke routes, pacing, and hotel tiers around your dates, budget, and interests.",
  },
  {
    question: "Is visa assistance included with international packages?",
    answer:
      "We coordinate documentation checklists and partner with trusted visa facilitators. Fees charged by embassies or third parties are billed separately.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Policies vary by airline, hotel, and season. Your quote includes a clear schedule of refundable vs non-refundable components before you confirm.",
  },
];

export function JsonLd() {
  const travelAgency = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/",
      "https://www.facebook.com/",
      "https://www.linkedin.com/",
    ],
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
    mainEntity: faqEntities.map((item) => ({
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
