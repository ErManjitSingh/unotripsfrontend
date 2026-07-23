export const HIMACHAL_SPECIAL1_ADS = {
  phoneDisplay: "+91-7876505119",
  phoneTel: "+917876505119",
  whatsapp: "917876505119",
  brand: "Uno Trips",
  defaultH1:
    "Best Himachal Tour Packages 2026 - Save up to 60% on Customized Trips",
  description:
    "Book customized Himachal tour packages 2026 - Shimla, Manali, Spiti, Jibhi & honeymoon trips. Save up to 60%. Hotels, meals, 4x4 transfers & trip assistance. Free quote on WhatsApp.",
  landingPage: "Himachal Special 1 Ads Landing",
  path: "/meta/himachal_special1",
  img: "/meta/himachal_special",
  hpTourismReg: "HIM/TOUR/1287/2024",
  gstin: "02AABCU9603R1ZM",
  badges: ["IATO", "TAAI", "TripAdvisor 2026 Travellers' Choice"] as const,
} as const;

export type Hs1PackageFocus =
  | "classic"
  | "manali"
  | "shimla"
  | "jibhi"
  | "honeymoon"
  | "spiti"
  | "family"
  | "dharamshala";

export type Hs1Package = {
  id: string;
  anchor: string;
  title: string;
  shortTitle: string;
  duration: string;
  nights: string;
  route: string[];
  highlights: string[];
  priceFrom: string;
  priceValue: number;
  image: string;
  focus: Hs1PackageFocus[];
  inclusions: string[];
  itinerary: string[];
  bestSeller?: boolean;
  rating: number;
  reviewCount: number;
  hotelLabel: string;
  breakfastLabel: string;
  transferLabel: string;
  sightseeingLabel: string;
  locationLine: string;
  galleryImages: string[];
  highlightBullets: string[];
  extraPhotoCount: number;
};

export const HS1_INCLUSIONS = [
  { label: "Meals", icon: "meal" as const },
  { label: "4x4 Transfers", icon: "transfer" as const },
  { label: "3/4 Star Hotels", icon: "hotel" as const },
  { label: "Sightseeing", icon: "sight" as const },
  { label: "Trip Assistance", icon: "assist" as const },
] as const;

const IMG = HIMACHAL_SPECIAL1_ADS.img;

export const HS1_PACKAGES: Hs1Package[] = [
  {
    id: "shimla-manali-6d5n",
    anchor: "Manali",
    title: "Shimla Manali Package",
    shortTitle: "Shimla Manali Package",
    duration: "5N / 6D",
    nights: "Shimla 2N, Manali 3N",
    route: ["Shimla", "Manali"],
    highlights: ["Scenic views", "Solang & Rohtang", "Mall Road", "Comfortable stay"],
    priceFrom: "\u20B9 21,999",
    priceValue: 21999,
    image: `${IMG}/hero.webp`,
    focus: ["classic", "manali", "shimla"],
    inclusions: ["3 Star Hotels", "Daily Breakfast", "Private Cab", "Sightseeing"],
    bestSeller: true,
    rating: 4.8,
    reviewCount: 320,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "7+ Places",
    locationLine: "Shimla (2N) \u2022 Manali (3N)",
    galleryImages: [
      `${IMG}/shimla.webp`,
      `${IMG}/solang.webp`,
      `${IMG}/kullu.webp`,
      `${IMG}/himachal-opt.webp`,
    ],
    highlightBullets: [
      "Scenic mountain views & snow peaks",
      "Solang Valley & Rohtang experience",
      "Mall Road evening walk in Shimla",
      "Comfortable stay with daily breakfast",
    ],
    extraPhotoCount: 12,
    itinerary: [
      "Day 1: Arrive Shimla - check-in & Mall Road evening walk",
      "Day 2: Shimla sightseeing - Ridge, Christ Church, Kufri viewpoints",
      "Day 3: Scenic transfer to Manali via Kullu valley",
      "Day 4: Manali local - Hadimba Temple, Old Manali cafes, Vashisht",
      "Day 5: Solang Valley adventure & Atal Tunnel visit (as permitted)",
      "Day 6: Departure with trip assistance",
    ],
  },
  {
    id: "romantic-honeymoon-5d4n",
    anchor: "Honeymoon",
    title: "Romantic Manali Honeymoon",
    shortTitle: "Romantic Manali Honeymoon",
    duration: "4N / 5D",
    nights: "Manali 4N",
    route: ["Manali"],
    highlights: ["Private Photoshoot", "Candlelight Dinner", "Couple Stays"],
    priceFrom: "\u20B9 18,999",
    priceValue: 18999,
    image: `${IMG}/romantic-opt.webp`,
    focus: ["honeymoon", "manali"],
    inclusions: ["Couple Stay", "Breakfast", "Photoshoot", "Candlelight Dinner"],
    rating: 4.9,
    reviewCount: 186,
    hotelLabel: "4 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "5+ Places",
    locationLine: "Manali (4N) \u2022 Couple Stay",
    galleryImages: [
      `${IMG}/romantic-opt.webp`,
      `${IMG}/solang.webp`,
      `${IMG}/himachal-opt.webp`,
      `${IMG}/hero.webp`,
    ],
    highlightBullets: [
      "Private couple photoshoot at scenic spots",
      "Candlelight dinner setup included",
      "Romantic hotel / boutique stay",
      "Solang Valley snow day (seasonal)",
    ],
    extraPhotoCount: 10,
    itinerary: [
      "Day 1: Arrive Manali - romantic check-in & evening stroll",
      "Day 2: Couple photoshoot at scenic spots + Hadimba & Old Manali",
      "Day 3: Solang Valley snow day (seasonal) & private leisure time",
      "Day 4: Candlelight dinner setup & flexible sightseeing",
      "Day 5: Departure with honeymoon trip assistance",
    ],
  },
  {
    id: "jibhi-tirthan-5d4n",
    anchor: "Jibhi",
    title: "Offbeat Jibhi & Tirthan",
    shortTitle: "Offbeat Jibhi & Tirthan",
    duration: "4N / 5D",
    nights: "Jibhi / Tirthan 4N",
    route: ["Jibhi", "Tirthan", "Jalori Pass"],
    highlights: ["Jalori Pass", "Serolsar Lake", "Homestays"],
    priceFrom: "\u20B9 14,999",
    priceValue: 14999,
    image: `${IMG}/himachal-opt.webp`,
    focus: ["jibhi"],
    inclusions: ["Homestay", "Breakfast", "Local Transfers", "Trek Guidance"],
    rating: 4.7,
    reviewCount: 142,
    hotelLabel: "Homestay",
    breakfastLabel: "Daily",
    transferLabel: "Local Cab",
    sightseeingLabel: "6+ Places",
    locationLine: "Jibhi (2N) \u2022 Tirthan (2N)",
    galleryImages: [
      `${IMG}/himachal-opt.webp`,
      `${IMG}/himachal.webp`,
      `${IMG}/full_himachal.webp`,
      `${IMG}/shimla.webp`,
    ],
    highlightBullets: [
      "Jalori Pass day trip with mountain views",
      "Serolsar Lake trek (seasonal)",
      "Riverside cafes & village trails",
      "Boutique homestay experience",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive Jibhi - riverside check-in & cafe hop",
      "Day 2: Tirthan Valley walks, waterfalls & local trails",
      "Day 3: Jalori Pass day trip with Serolsar Lake trek (seasonal)",
      "Day 4: Free day for cafes, riverside & village exploration",
      "Day 5: Departure",
    ],
  },
  {
    id: "spiti-expedition-9d8n",
    anchor: "Spiti",
    title: "Spiti Valley Expedition",
    shortTitle: "Spiti Valley Expedition",
    duration: "8N / 9D",
    nights: "Shimla to Manali circuit",
    route: ["Shimla", "Spiti", "Manali"],
    highlights: ["4x4 SUV", "Permits", "Key Monastery"],
    priceFrom: "\u20B9 32,999",
    priceValue: 32999,
    image: `${IMG}/himachal-group-opt.webp`,
    focus: ["spiti"],
    inclusions: ["4x4 SUV", "Stay & Meals", "Inner Line Permits", "Driver"],
    rating: 4.8,
    reviewCount: 98,
    hotelLabel: "3 Star",
    breakfastLabel: "As Plan",
    transferLabel: "4x4 SUV",
    sightseeingLabel: "10+ Places",
    locationLine: "Shimla \u2022 Spiti \u2022 Manali",
    galleryImages: [
      `${IMG}/himachal-group-opt.webp`,
      `${IMG}/full_himachal.webp`,
      `${IMG}/himachal.webp`,
      `${IMG}/shimla.webp`,
    ],
    highlightBullets: [
      "4x4 SUV transfers for high-altitude roads",
      "Inner line permits handled for you",
      "Key Monastery & Spiti village visits",
      "Experienced mountain driver included",
    ],
    extraPhotoCount: 15,
    itinerary: [
      "Day 1: Arrive Shimla - briefing & overnight",
      "Day 2: Shimla to Kalpa / Sangla via Kinnaur route",
      "Day 3: Enter Spiti - Nako / Tabo region",
      "Day 4: Kaza arrival - Key Monastery & local exploration",
      "Day 5: Komic, Hikkim, Langza high-altitude villages",
      "Day 6: Chandratal / Kunzum Pass (seasonal access)",
      "Day 7: Cross toward Manali via Atal Tunnel corridor",
      "Day 8: Manali leisure & buffer day",
      "Day 9: Departure from Manali",
    ],
  },
  {
    id: "manali-kullu-family-5d4n",
    anchor: "Family",
    title: "Manali Kullu Family Tour",
    shortTitle: "Manali Kullu Family Tour",
    duration: "4N / 5D",
    nights: "Manali 3N, Kullu 1N",
    route: ["Manali", "Kullu"],
    highlights: ["Family Friendly", "Solang Valley", "Kullu Valley"],
    priceFrom: "\u20B9 16,999",
    priceValue: 16999,
    image: `${IMG}/kullu.webp`,
    focus: ["family", "manali"],
    inclusions: ["Family Hotels", "Breakfast", "Private Cab", "Sightseeing"],
    rating: 4.8,
    reviewCount: 210,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "6+ Places",
    locationLine: "Manali (3N) \u2022 Kullu (1N)",
    galleryImages: [
      `${IMG}/kullu.webp`,
      `${IMG}/solang.webp`,
      `${IMG}/hero.webp`,
      `${IMG}/shimla.webp`,
    ],
    highlightBullets: [
      "Family-friendly hotels & pacing",
      "Solang Valley adventure for all ages",
      "Kullu valley scenic drive & river views",
      "Hadimba Temple & local Manali sights",
    ],
    extraPhotoCount: 9,
    itinerary: [
      "Day 1: Arrive Manali - family check-in & Mall Road stroll",
      "Day 2: Manali local - Hadimba, Vashisht & Old Manali cafes",
      "Day 3: Solang Valley day with easy adventure options",
      "Day 4: Kullu valley sightseeing & overnight",
      "Day 5: Departure with trip assistance",
    ],
  },
  {
    id: "dharamshala-mcleod-4d3n",
    anchor: "Dharamshala",
    title: "Dharamshala McLeodganj Escape",
    shortTitle: "Dharamshala McLeodganj Escape",
    duration: "3N / 4D",
    nights: "Dharamshala / McLeodganj 3N",
    route: ["Dharamshala", "McLeodganj"],
    highlights: ["Triund", "Bhagsu", "Dalai Lama Temple"],
    priceFrom: "\u20B9 11,999",
    priceValue: 11999,
    image: `${IMG}/dharamshala-opt.webp`,
    focus: ["dharamshala"],
    inclusions: ["Hotels", "Breakfast", "Private Cab", "Sightseeing"],
    rating: 4.7,
    reviewCount: 156,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "5+ Places",
    locationLine: "Dharamshala (1N) \u2022 McLeodganj (2N)",
    galleryImages: [
      `${IMG}/dharamshala-opt.webp`,
      `${IMG}/dharamshala.webp`,
      `${IMG}/himachal-opt.webp`,
      `${IMG}/full_himachal.webp`,
    ],
    highlightBullets: [
      "Bhagsu waterfall & temple visit",
      "Triund trek option (seasonal)",
      "Dalai Lama Temple & McLeodganj cafes",
      "Peaceful hill-station stay with breakfast",
    ],
    extraPhotoCount: 7,
    itinerary: [
      "Day 1: Arrive Dharamshala - check-in & local evening walk",
      "Day 2: McLeodganj - Dalai Lama Temple, Bhagsu waterfall",
      "Day 3: Triund trek option or Naddi viewpoints (seasonal)",
      "Day 4: Departure",
    ],
  },
];

export const HS1_TESTIMONIALS = [
  {
    name: "Riya & Aarav",
    tag: "Honeymoon - Manali",
    quote:
      "Our Manali honeymoon felt private and well planned. The photoshoot and candlelight dinner made it unforgettable.",
    rating: 5,
  },
  {
    name: "Meera Family",
    tag: "Family - Shimla Manali",
    quote:
      "Classic Himachal package was perfect for kids and elders. Clean hotels, on-time cabs, zero stress.",
    rating: 5,
  },
  {
    name: "Vikram S.",
    tag: "Adventure - Spiti",
    quote:
      "Spiti expedition with 4x4 and permits handled end-to-end. Key Monastery sunrise was the highlight.",
    rating: 5,
  },
] as const;

export const HS1_BEST_TIME = [
  {
    season: "Mar - Jun",
    label: "Pleasant & Ideal",
    detail: "Best for Shimla, Manali, Jibhi & family trips",
  },
  {
    season: "Jul - Aug",
    label: "Monsoon Green",
    detail: "Lush valleys; check landslide advisories",
  },
  {
    season: "Sep - Nov",
    label: "Clear Skies",
    detail: "Great for Spiti & photography",
  },
  {
    season: "Dec - Feb",
    label: "Snow Season",
    detail: "Manali snow; Spiti often restricted",
  },
] as const;

const H1_BY_KEYWORD: Record<string, string> = {
  "manali-honeymoon":
    "Best Manali Honeymoon Packages 2026 - Save up to 60%",
  honeymoon: "Best Manali Honeymoon Packages 2026 - Save up to 60%",
  family: "Best Himachal Family Tour Packages 2026 - Save up to 60%",
  spiti: "Best Spiti Adventure Packages 2026 - Save up to 60%",
  manali: "Best Manali Tour Packages 2026 - Save up to 60%",
  jibhi: "Best Jibhi Tirthan Packages 2026 - Save up to 60%",
};

/** Resolve H1 from ?h1= / ?headline= / ?kw= Ads params */
export function resolveAdsH1(
  h1?: string | string[] | null,
  headline?: string | string[] | null,
  kw?: string | string[] | null,
): string {
  const pick = (v?: string | string[] | null) =>
    (Array.isArray(v) ? v[0] : v)?.trim() || "";

  const raw = pick(h1) || pick(headline) || pick(kw);
  if (!raw) return HIMACHAL_SPECIAL1_ADS.defaultH1;

  const lower = raw.toLowerCase();
  if (H1_BY_KEYWORD[lower]) return H1_BY_KEYWORD[lower];

  // Prefer longer / more specific keys first (short Ads kw / slug values only)
  const orderedKeys = [
    "manali-honeymoon",
    "honeymoon",
    "family",
    "spiti",
    "jibhi",
    "manali",
  ];
  if (raw.length < 40) {
    for (const key of orderedKeys) {
      if (lower.includes(key)) {
        return H1_BY_KEYWORD[key];
      }
    }
  }

  if (raw.length > 3 && raw.length < 120) {
    return raw;
  }

  return HIMACHAL_SPECIAL1_ADS.defaultH1;
}