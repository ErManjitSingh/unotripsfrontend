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
  | "spiti";

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
};

export const HS1_INCLUSIONS = [
  { label: "Meals", icon: "meal" as const },
  { label: "4x4 Transfers", icon: "transfer" as const },
  { label: "3/4 Star Hotels", icon: "hotel" as const },
  { label: "Sightseeing", icon: "sight" as const },
  { label: "Trip Assistance", icon: "assist" as const },
] as const;

export const HS1_PACKAGES: Hs1Package[] = [
  {
    id: "classic-himachal-6d5n",
    anchor: "Manali",
    title: "Classic Himachal - Shimla & Manali",
    shortTitle: "Classic Himachal",
    duration: "6D / 5N",
    nights: "Shimla 2N, Manali 3N",
    route: ["Shimla", "Manali"],
    highlights: ["Mall Road", "Solang Valley", "Atal Tunnel"],
    priceFrom: "Rs. 12,999",
    priceValue: 12999,
    image: `${HIMACHAL_SPECIAL1_ADS.img}/shimla.webp`,
    focus: ["classic", "manali", "shimla"],
    inclusions: [
      "3/4 Star Hotels",
      "Daily Breakfast",
      "Private Cab",
      "Sightseeing",
      "Trip Assistance",
    ],
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
    title: "Romantic Honeymoon - Manali Special",
    shortTitle: "Romantic Honeymoon",
    duration: "5D / 4N",
    nights: "Manali 4N",
    route: ["Manali"],
    highlights: ["Private Photoshoot", "Candlelight Dinner", "Couple Stays"],
    priceFrom: "Rs. 18,999",
    priceValue: 18999,
    image: `${HIMACHAL_SPECIAL1_ADS.img}/romantic-opt.webp`,
    focus: ["honeymoon", "manali"],
    inclusions: [
      "Couple-friendly Stay",
      "Breakfast",
      "Private Photoshoot",
      "Candlelight Dinner",
      "Cab & Assistance",
    ],
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
    title: "Offbeat Jibhi & Tirthan Escape",
    shortTitle: "Offbeat Jibhi & Tirthan",
    duration: "5D / 4N",
    nights: "Jibhi / Tirthan 4N",
    route: ["Jibhi", "Tirthan", "Jalori Pass"],
    highlights: ["Jalori Pass", "Serolsar Lake", "Homestays"],
    priceFrom: "Rs. 14,999",
    priceValue: 14999,
    image: `${HIMACHAL_SPECIAL1_ADS.img}/himachal-opt.webp`,
    focus: ["jibhi"],
    inclusions: [
      "Homestay / Boutique Stay",
      "Breakfast",
      "Local Transfers",
      "Trek Guidance",
      "Trip Assistance",
    ],
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
    title: "Spiti Valley Expedition - Full Circuit",
    shortTitle: "Spiti Valley Expedition",
    duration: "9D / 8N",
    nights: "Shimla to Manali circuit",
    route: ["Shimla", "Spiti", "Manali"],
    highlights: ["4x4 SUV", "Permits", "Key Monastery"],
    priceFrom: "Rs. 32,999",
    priceValue: 32999,
    image: `${HIMACHAL_SPECIAL1_ADS.img}/himachal-group-opt.webp`,
    focus: ["spiti"],
    inclusions: [
      "4x4 SUV Transfers",
      "Stay & Meals (as per plan)",
      "Inner Line Permits",
      "Monastery Visits",
      "Experienced Driver",
    ],
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