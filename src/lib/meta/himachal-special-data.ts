export const HIMACHAL_ADS = {
  phoneDisplay: "+91-7876505119",
  phoneTel: "+917876505119",
  whatsapp: "917876505119",
  brand: "Uno Trips",
  defaultH1: "Best Himachal Tour Packages 2026",
  defaultTitle:
    "Best Himachal Tour Packages 2026 | Shimla Manali Jibhi Honeymoon",
  description:
    "Book Himachal tour packages — Shimla, Manali, Jibhi & honeymoon trips. Day-wise itinerary, hotel, meals & transfers. Free quote in 30 mins.",
  landingPage: "Himachal Special Landing Page",
  path: "/meta/himachal_special",
  img: "/meta/himachal_special",
} as const;

export type HimachalPackage = {
  id: string;
  anchor?: string;
  title: string;
  duration: string;
  route: string[];
  image: string;
  trending?: boolean;
  focus: ("manali" | "shimla" | "jibhi" | "honeymoon" | "dharamshala" | "group")[];
  itinerary: string[];
  attractions: string[];
};

export const HIMACHAL_INCLUSIONS = [
  { label: "Hotel Stay", icon: "hotel" as const },
  { label: "Breakfast", icon: "meal" as const },
  { label: "Transfers", icon: "transfer" as const },
  { label: "Sightseeing", icon: "sight" as const },
  { label: "Trip Assistance", icon: "assist" as const },
] as const;

export const HIMACHAL_EXCLUSIONS = [
  "Flights / train tickets",
  "Lunch & dinner (unless mentioned)",
  "Personal expenses & adventure activities",
  "Anything not listed in inclusions",
] as const;

export const HIMACHAL_PACKAGES: HimachalPackage[] = [
  {
    id: "romantic-honeymoon-5n6d",
    anchor: "Honeymoon",
    title: "Best Manali Honeymoon Packages 2026 — Shimla & Manali",
    duration: "5N / 6D",
    route: ["Shimla", "Manali"],
    image: `${HIMACHAL_ADS.img}/romantic-opt.webp`,
    trending: true,
    focus: ["honeymoon", "manali", "shimla"],
    itinerary: [
      "Day 1: Arrival in Shimla — check-in & Mall Road evening stroll",
      "Day 2: Romantic Shimla — Kufri, Ridge & private dinner setup",
      "Day 3: Scenic transfer to Manali via Kullu valley",
      "Day 4: Manali couple spots — Hadimba, Old Manali cafés",
      "Day 5: Solang Valley snow & adventure (weather dependent)",
      "Day 6: Departure with trip assistance",
    ],
    attractions: ["Kufri viewpoints", "Solang Valley", "Romantic sunset points"],
  },
  {
    id: "manali-kullu-4n5d",
    anchor: "ManaliTour",
    title: "Manali Kullu Tour Package — 4N/5D",
    duration: "4N / 5D",
    route: ["Manali", "Kullu"],
    image: `${HIMACHAL_ADS.img}/kullu.webp`,
    focus: ["manali"],
    itinerary: [
      "Day 1: Arrival in Manali — local market & Hadimba Temple",
      "Day 2: Solang Valley visit & snow activities",
      "Day 3: Transfer to Kullu — river valley views",
      "Day 4: Kullu & Manikaran hot springs",
      "Day 5: Departure",
    ],
    attractions: ["Rohtang / Atal Tunnel access", "Solang Valley", "Manikaran"],
  },
  {
    id: "shimla-manali-5n6d",
    anchor: "ShimlaTour",
    title: "Shimla Manali Tour Package — 5N/6D",
    duration: "5N / 6D",
    route: ["Shimla", "Manali"],
    image: `${HIMACHAL_ADS.img}/shimla.webp`,
    focus: ["shimla", "manali"],
    itinerary: [
      "Day 1: Arrival in Shimla",
      "Day 2: Shimla sightseeing — Mall Road, Ridge, Christ Church",
      "Day 3: Travel to Manali",
      "Day 4: Manali exploration — Hadimba & Vashisht",
      "Day 5: Solang Valley & Rohtang access (as permitted)",
      "Day 6: Departure",
    ],
    attractions: ["Shimla Mall Road", "Hadimba Temple", "Solang Valley"],
  },
  {
    id: "jibhi-tirthan-3n4d",
    anchor: "JibhiTour",
    title: "Jibhi Tirthan Valley Escape — 3N/4D",
    duration: "3N / 4D",
    route: ["Jibhi", "Tirthan", "Jalori Pass"],
    image: `${HIMACHAL_ADS.img}/himachal-opt.webp`,
    trending: true,
    focus: ["jibhi"],
    itinerary: [
      "Day 1: Arrival in Jibhi — riverside check-in & café hop",
      "Day 2: Tirthan Valley — Raju's Café trail & waterfall walks",
      "Day 3: Jalori Pass / Serolsar Lake day trip (seasonal)",
      "Day 4: Departure",
    ],
    attractions: ["Tirthan River", "Jibhi waterfalls", "Jalori Pass views"],
  },
  {
    id: "shimla-manali-4n5d",
    title: "Shimla Manali Tour — 4N/5D",
    duration: "4N / 5D",
    route: ["Shimla", "Manali"],
    image: `${HIMACHAL_ADS.img}/himachal-opt.webp`,
    focus: ["shimla", "manali"],
    itinerary: [
      "Day 1: Arrival in Shimla",
      "Day 2: Shimla city tour",
      "Day 3: Manali adventure transfer",
      "Day 4: Solang Valley visit",
      "Day 5: Departure",
    ],
    attractions: ["Shimla Mall Road", "Solang Valley", "Kufri & Naldehra"],
  },
  {
    id: "shimla-manali-dharamshala-6n7d",
    title: "Shimla Manali Dharamshala Tour — 6N/7D",
    duration: "6N / 7D",
    route: ["Shimla", "Manali", "Dharamshala"],
    image: `${HIMACHAL_ADS.img}/dharamshala-opt.webp`,
    focus: ["shimla", "manali", "dharamshala"],
    itinerary: [
      "Day 1: Arrival in Shimla",
      "Day 2: Shimla city tour",
      "Day 3: Travel to Manali",
      "Day 4: Manali sightseeing",
      "Day 5: Travel to Dharamshala",
      "Day 6: Dharamshala & McLeod Ganj",
      "Day 7: Departure",
    ],
    attractions: ["Shimla Ridge", "Solang Valley", "Dalai Lama Temple"],
  },
  {
    id: "complete-himachal-8n9d",
    title: "Complete Himachal Tour — 8N/9D",
    duration: "8N / 9D",
    route: ["Shimla", "Manali", "Dharamshala"],
    image: `${HIMACHAL_ADS.img}/hero.webp`,
    focus: ["group", "shimla", "manali", "dharamshala"],
    itinerary: [
      "Day 1: Arrival in Shimla",
      "Day 2: Shimla sightseeing",
      "Day 3: Travel to Manali",
      "Day 4–5: Manali exploration",
      "Day 6: Travel to Dharamshala",
      "Day 7–8: Dharamshala & McLeod Ganj",
      "Day 9: Departure",
    ],
    attractions: ["Shimla Ridge", "Solang Valley", "McLeod Ganj"],
  },
  {
    id: "group-8d-hill",
    title: "Himachal Group Tour — 8 Days Hill Station Special",
    duration: "7N / 8D",
    route: ["Shimla", "Manali", "Kullu", "Dalhousie", "Dharamshala"],
    image: `${HIMACHAL_ADS.img}/himachal-group-opt.webp`,
    focus: ["group"],
    itinerary: [
      "Day 1: Arrival in Shimla",
      "Day 2: Shimla city tour & Mall Road",
      "Day 3: Travel to Manali",
      "Day 4: Manali sightseeing & Solang Valley",
      "Day 5: Kullu & Manikaran",
      "Day 6: Travel to Dalhousie",
      "Day 7: Dharamshala & McLeod Ganj",
      "Day 8: Departure",
    ],
    attractions: ["Shimla Ridge", "Solang Valley", "Khajjiar"],
  },
  {
    id: "group-9d-adventure",
    title: "Himachal Group Tour — 9 Days Adventure Special",
    duration: "9N / 10D",
    route: ["Shimla", "Manali", "Dharamshala", "Bir Billing", "Dalhousie"],
    image: `${HIMACHAL_ADS.img}/solang.webp`,
    trending: true,
    focus: ["group", "manali"],
    itinerary: [
      "Day 1: Arrival in Shimla",
      "Day 2: Shimla sightseeing",
      "Day 3: Travel to Manali",
      "Day 4: Manali & Solang Valley",
      "Day 5: Travel to Dharamshala",
      "Day 6: Dharamshala & McLeod Ganj",
      "Day 7: Bir Billing paragliding",
      "Day 8: Dalhousie & Khajjiar",
      "Day 9: Adventure activities",
      "Day 10: Departure",
    ],
    attractions: ["Solang Valley", "Bir Billing", "Khajjiar"],
  },
  {
    id: "dharamshala-3n4d",
    anchor: "DharamshalaTour",
    title: "Dharamshala & McLeodganj Tour — 3N/4D",
    duration: "3N / 4D",
    route: ["Dharamshala", "McLeod Ganj", "Triund"],
    image: `${HIMACHAL_ADS.img}/dharamshala-opt.webp`,
    focus: ["dharamshala"],
    itinerary: [
      "Day 1: Arrival in Dharamshala / McLeod Ganj",
      "Day 2: Monasteries, Bhagsu waterfall & local cafés",
      "Day 3: Triund trek base / Dal Lake (fitness dependent)",
      "Day 4: Departure",
    ],
    attractions: ["Dalai Lama Temple", "Bhagsu Nag", "Triund views"],
  },
  {
    id: "dalhousie-3n4d",
    title: "Dalhousie Tour — 3N/4D Khajjiar & Kalatop",
    duration: "3N / 4D",
    route: ["Dalhousie", "Khajjiar", "Kalatop"],
    image: `${HIMACHAL_ADS.img}/himachal-opt.webp`,
    focus: ["dharamshala"],
    itinerary: [
      "Day 1: Arrival in Dalhousie",
      "Day 2: Khajjiar — mini Switzerland of India",
      "Day 3: Kalatop Wildlife Sanctuary",
      "Day 4: Departure",
    ],
    attractions: ["Khajjiar meadow", "Kalatop", "Dalhousie viewpoints"],
  },
];

export const HIMACHAL_TESTIMONIALS = [
  {
    name: "Riya & Aarav",
    tag: "Honeymooners · Manali",
    quote:
      "Our Manali honeymoon felt private and well planned — Solang snow day and the candle-light dinner were perfect.",
    rating: 5,
  },
  {
    name: "Neha & Kunal",
    tag: "Honeymooners · Shimla–Manali",
    quote:
      "Clean hotels, on-time transfers, and zero stress. Exactly what we wanted for our first trip together.",
    rating: 5,
  },
  {
    name: "Vikram S.",
    tag: "Adventure · Jibhi",
    quote:
      "Jibhi Tirthan package was peaceful and scenic. Guide knew every waterfall trail — highly recommend.",
    rating: 5,
  },
] as const;

export const HIMACHAL_FAQS = [
  {
    q: "What is included in a Himachal tour package?",
    a: "Hotel stay, daily breakfast, sightseeing as per itinerary, private transfers, and trip assistance. Flights and personal expenses are usually extra.",
  },
  {
    q: "What is the best time to visit Manali & Jibhi?",
    a: "March–June and September–November for pleasant weather. December–February for snow in Manali. Jibhi is ideal March–June and Sept–Nov for valley walks.",
  },
  {
    q: "Are packages suitable for honeymoon couples?",
    a: "Yes — our honeymoon itineraries include romantic stays, flexible sightseeing, and couple-friendly activities in Shimla and Manali.",
  },
  {
    q: "Can I customise the itinerary?",
    a: "Absolutely. Share your dates and preferences — we customise hotels, days, and activities to match your budget.",
  },
] as const;

/** Map common Google Ads keywords → default H1 */
export function resolveAdsH1(raw?: string | string[] | null): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && value.trim().length > 3 && value.trim().length < 90) {
    return value.trim();
  }
  return HIMACHAL_ADS.defaultH1;
}
