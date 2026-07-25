export const LEH_ADS = {
  phoneDisplay: "+91-7876505119",
  phoneTel: "+917876505119",
  whatsapp: "917876505119",
  brand: "Uno Trips",
  defaultH1:
    "Best Leh Ladakh Tour Packages 2026 - Save up to 40% on Curated Trips",
  description:
    "Explore Leh Ladakh with curated family and biking packages. Save up to 40% and request a quick callback from UNO Trips experts. Hotels, meals, transfers & trip assistance.",
  landingPage: "Leh Tour Package Ads Landing",
  path: "/meta/leh_tour_package",
  img: "/meta/leh_tour_package",
  tourismReg: "HIM/TOUR/1287/2024",
  gstin: "02AABCU9603R1ZM",
  badges: ["IATO", "TAAI", "TripAdvisor 2026 Travellers' Choice"] as const,
} as const;

export type LehPackageFocus =
  | "adventure"
  | "family"
  | "biking"
  | "nubra"
  | "pangong"
  | "turtuk";

export type LehPackage = {
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
  wasPrice?: string;
  image: string;
  focus: LehPackageFocus[];
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

export const LEH_INCLUSIONS = [
  { label: "Meals", icon: "meal" as const },
  { label: "Transfers / Bike", icon: "transfer" as const },
  { label: "Hotels / Camps", icon: "hotel" as const },
  { label: "Sightseeing", icon: "sight" as const },
  { label: "Trip Assistance", icon: "assist" as const },
] as const;

const IMG = LEH_ADS.img;

const HERO = `${IMG}/hero.jpg`;
const LEH_PALACE =
  "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114";
const PANGONG =
  "https://images.indianexpress.com/2019/01/leh-ladakh-getty-images-759.jpg?w=1200";
const LEH_LOCAL = "https://www.lehladakhindia.com/wp-content/uploads/2024/07/leh-1.jpg";
const TURTUK =
  "https://lh5.googleusercontent.com/BdUHLPSsLD0R5ZrXWHaua6UEtqCGbZCdpD1WY7LvPcwlAOh4Lvt8PLvqsnM8vMTE7BkF2lSiD3GFMhU_U6W5cw7HlRzAqza_9huNtJFFipUPBMXnCQg-T_SBqT95J-lJMJrJVCDI0GXPIMX_0SubPj__m-9aoyPcQvKjt1KvSJKtN-bEeQvxPlo8";
const BIKE_TRAIL =
  "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/1d/eb/78/caption.jpg?w=500&h=400&s=1";
const UMLING =
  "https://static.justwravel.com/images/cgnfe1hd/production/8ee77f1eb8257d39a14895b06d7e133a694159a0-938x850.webp?fm=webp";

function inr(n: number): string {
  return `\u20B9 ${n.toLocaleString("en-IN")}`;
}

export const LEH_PACKAGES: LehPackage[] = [
  {
    id: "ladakh-turtuk",
    anchor: "TurtukTour",
    title: "Ladakh Adventure Expedition With Turtuk Village",
    shortTitle: "Ladakh Adventure With Turtuk",
    duration: "6N / 7D",
    nights: "Leh 2N, Nubra 2N, Pangong 1N, Leh 1N",
    route: ["Leh", "Nubra", "Turtuk", "Pangong"],
    highlights: ["Turtuk Village", "Nubra Valley", "Pangong Tso", "Khardung La"],
    priceFrom: inr(21800),
    priceValue: 21800,
    wasPrice: inr(29900),
    image: TURTUK,
    focus: ["adventure", "turtuk", "nubra", "pangong"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    bestSeller: true,
    rating: 5.0,
    reviewCount: 71,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "8+ Places",
    locationLine: "2D Leh \u2022 2D Nubra \u2022 1D Pangong \u2022 2D Leh",
    galleryImages: [TURTUK, LEH_PALACE, PANGONG, HERO],
    highlightBullets: [
      "Turtuk village visit on the Nubra circuit",
      "Nubra Valley dunes & monastery stops",
      "Overnight near Pangong Tso (as plan)",
      "Khardung La / high-pass experience",
    ],
    extraPhotoCount: 14,
    itinerary: [
      "Day 1: Arrive Leh - rest & acclimatisation",
      "Day 2: Leh local sightseeing - Shanti Stupa, Leh Palace, markets",
      "Day 3: Leh to Nubra via Khardung La - Diskit / Hunder",
      "Day 4: Turtuk village excursion & Nubra overnight",
      "Day 5: Nubra to Pangong Tso - lakeside evening",
      "Day 6: Pangong to Leh via Chang La - overnight Leh",
      "Day 7: Departure with trip assistance",
    ],
  },
  {
    id: "leh-expedition",
    anchor: "LehExpedition",
    title: "Leh Ladakh Expedition",
    shortTitle: "Leh Ladakh Expedition",
    duration: "5N / 6D",
    nights: "Leh 2N, Nubra 1N, Pangong 1N, Leh 1N",
    route: ["Leh", "Nubra", "Pangong"],
    highlights: ["Classic circuit", "Nubra", "Pangong", "Monasteries"],
    priceFrom: inr(22900),
    priceValue: 22900,
    wasPrice: inr(29900),
    image: LEH_PALACE,
    focus: ["adventure", "nubra", "pangong"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.4,
    reviewCount: 10800,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "7+ Places",
    locationLine: "2D Leh \u2022 1D Nubra \u2022 1D Pangong \u2022 2D Leh",
    galleryImages: [LEH_PALACE, PANGONG, HERO, LEH_LOCAL],
    highlightBullets: [
      "Classic Leh–Nubra–Pangong circuit",
      "High-pass drives with photo stops",
      "Monastery & market time in Leh",
      "Comfortable hotels / camps as per plan",
    ],
    extraPhotoCount: 12,
    itinerary: [
      "Day 1: Arrive Leh - acclimatisation day",
      "Day 2: Leh local - monasteries, palace & Shanti Stupa",
      "Day 3: Leh to Nubra Valley via Khardung La",
      "Day 4: Nubra to Pangong Tso - lakeside stay",
      "Day 5: Return to Leh via Chang La",
      "Day 6: Departure",
    ],
  },
  {
    id: "pangong-adventure",
    anchor: "PangongLake",
    title: "Leh Ladakh Adventure With Pangong Lake",
    shortTitle: "Leh Adventure With Pangong",
    duration: "4N / 5D",
    nights: "Leh based 4N",
    route: ["Leh", "Pangong"],
    highlights: ["Pangong Lake", "Leh local", "Short & scenic"],
    priceFrom: inr(19000),
    priceValue: 19000,
    wasPrice: inr(25000),
    image: PANGONG,
    focus: ["adventure", "pangong"],
    inclusions: ["Hotels", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.6,
    reviewCount: 742,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "5+ Places",
    locationLine: "5D Leh circuit with Pangong",
    galleryImages: [PANGONG, LEH_PALACE, HERO, LEH_LOCAL],
    highlightBullets: [
      "Dedicated Pangong Lake day trip / overnight",
      "Leh sightseeing with flexible pacing",
      "Ideal short Ladakh adventure",
      "Private transfers & trip assistance",
    ],
    extraPhotoCount: 10,
    itinerary: [
      "Day 1: Arrive Leh - rest & acclimatisation",
      "Day 2: Leh local sightseeing",
      "Day 3: Pangong Lake excursion / overnight (as plan)",
      "Day 4: Return to Leh - free evening",
      "Day 5: Departure",
    ],
  },
  {
    id: "family-glimpse-leh",
    anchor: "FamilyGlimpse",
    title: "Glimpse Of Leh Ladakh | Private Adventure",
    shortTitle: "Glimpse Of Leh Ladakh",
    duration: "4N / 5D",
    nights: "Leh 4N private",
    route: ["Leh"],
    highlights: ["Private cab", "Family paced", "Customisable"],
    priceFrom: inr(19000),
    priceValue: 19000,
    wasPrice: inr(28999),
    image: LEH_LOCAL,
    focus: ["family"],
    inclusions: ["Family Hotels", "Breakfast", "Private Cab", "Sightseeing"],
    rating: 4.7,
    reviewCount: 351,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "5+ Places",
    locationLine: "5D Leh · Private Adventure",
    galleryImages: [LEH_LOCAL, LEH_PALACE, HERO, PANGONG],
    highlightBullets: [
      "Private family-friendly transfers",
      "Relaxed Leh sightseeing pace",
      "Hotels suited for families",
      "Easy customisation of day plans",
    ],
    extraPhotoCount: 9,
    itinerary: [
      "Day 1: Arrive Leh - family check-in & rest",
      "Day 2: Leh local - Shanti Stupa, markets, palace",
      "Day 3: Nearby monastery circuit / flexible day",
      "Day 4: Optional Pangong / Nubra half-day options",
      "Day 5: Departure",
    ],
  },
  {
    id: "family-discover-leh",
    anchor: "FamilyDiscover",
    title: "Discover Leh Ladakh | FREE Customization",
    shortTitle: "Discover Leh Ladakh",
    duration: "5N / 6D",
    nights: "Leh 2N, Nubra 2N, Pangong 1N",
    route: ["Leh", "Nubra", "Pangong"],
    highlights: ["Free customization", "Nubra", "Pangong", "Family"],
    priceFrom: inr(23950),
    priceValue: 23950,
    wasPrice: inr(34215),
    image: LEH_PALACE,
    focus: ["family", "nubra", "pangong"],
    inclusions: ["Family Hotels", "Breakfast", "Transfers", "Customization"],
    rating: 4.8,
    reviewCount: 892,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "7+ Places",
    locationLine: "2D Leh \u2022 2D Nubra \u2022 1D Pangong \u2022 1D Leh",
    galleryImages: [LEH_PALACE, PANGONG, LEH_LOCAL, HERO],
    highlightBullets: [
      "FREE itinerary customization",
      "Nubra Valley dunes & monasteries",
      "Pangong Tso experience",
      "Family hotels with daily breakfast",
    ],
    extraPhotoCount: 11,
    itinerary: [
      "Day 1: Arrive Leh - acclimatisation",
      "Day 2: Leh sightseeing & briefing",
      "Day 3–4: Nubra Valley stay with local visits",
      "Day 5: Pangong Tso & return toward Leh",
      "Day 6: Departure",
    ],
  },
  {
    id: "family-incredible-leh",
    anchor: "FamilyIncredible",
    title: "Incredible Leh & Ladakh | Journey To The Land Of Lamas",
    shortTitle: "Incredible Leh & Ladakh",
    duration: "5N / 6D",
    nights: "Premium Leh circuit",
    route: ["Leh", "Lamayuru", "Nubra", "Pangong"],
    highlights: ["Land of Lamas", "Lamayuru", "Premium stays"],
    priceFrom: inr(48800),
    priceValue: 48800,
    wasPrice: inr(65800),
    image: PANGONG,
    focus: ["family"],
    inclusions: ["Premium Hotels", "Meals as plan", "Private Cab", "Sightseeing"],
    rating: 4.9,
    reviewCount: 624,
    hotelLabel: "4 Star",
    breakfastLabel: "As Plan",
    transferLabel: "Private Cab",
    sightseeingLabel: "10+ Places",
    locationLine: "Leh \u2022 Lamayuru \u2022 Nubra \u2022 Pangong",
    galleryImages: [PANGONG, LEH_PALACE, HERO, LEH_LOCAL],
    highlightBullets: [
      "Journey through Land of Lamas monasteries",
      "Lamayuru / west Ladakh scenic day",
      "Premium hotel upgrades as per plan",
      "Full classic circuit with Nubra & Pangong",
    ],
    extraPhotoCount: 15,
    itinerary: [
      "Day 1: Arrive Kushok Bakula / Leh - rest",
      "Day 2: Leh local monasteries & markets",
      "Day 3: Lamayuru / west Ladakh excursion",
      "Day 4–5: Nubra & Pangong circuit",
      "Day 6: Buffer / departure from Leh",
    ],
  },
  {
    id: "bike-turtuk",
    anchor: "BikeTurtuk",
    title: "Ladakh Bike Trip With Turtuk Village",
    shortTitle: "Ladakh Bike Trip With Turtuk",
    duration: "6N / 7D",
    nights: "Leh–Nubra–Pangong bike circuit",
    route: ["Leh", "Nubra", "Turtuk", "Pangong"],
    highlights: ["Royal Enfield", "Turtuk", "High passes"],
    priceFrom: inr(36800),
    priceValue: 36800,
    wasPrice: inr(45999),
    image: LEH_PALACE,
    focus: ["biking", "turtuk"],
    inclusions: ["Bike rental", "Stay", "Backup support", "Permits help"],
    rating: 4.0,
    reviewCount: 31,
    hotelLabel: "Camps / Hotel",
    breakfastLabel: "As Plan",
    transferLabel: "Bike + Backup",
    sightseeingLabel: "8+ Places",
    locationLine: "2D Leh \u2022 2D Nubra \u2022 1D Pangong \u2022 2D Leh",
    galleryImages: [LEH_PALACE, BIKE_TRAIL, TURTUK, PANGONG],
    highlightBullets: [
      "Bike trip covering Turtuk village",
      "Nubra & Pangong on two wheels",
      "Backup vehicle support (as plan)",
      "High-pass riding with expert guidance",
    ],
    extraPhotoCount: 12,
    itinerary: [
      "Day 1: Arrive Leh - bike allotment & briefing",
      "Day 2: Local Leh ride & acclimatisation",
      "Day 3: Leh to Nubra via Khardung La",
      "Day 4: Turtuk ride & Nubra overnight",
      "Day 5: Nubra to Pangong",
      "Day 6: Pangong to Leh",
      "Day 7: Departure",
    ],
  },
  {
    id: "bike-manali-leh",
    anchor: "BikeManaliLeh",
    title: "Manali Leh Srinagar Bike Adventure",
    shortTitle: "Manali–Leh–Srinagar Bike",
    duration: "11N / 12D",
    nights: "Manali–Jispa–Sarchu–Leh–Srinagar",
    route: ["Manali", "Jispa", "Sarchu", "Leh", "Srinagar"],
    highlights: ["Full highway", "Manali to Leh", "Srinagar exit"],
    priceFrom: inr(39800),
    priceValue: 39800,
    wasPrice: inr(47928),
    image: BIKE_TRAIL,
    focus: ["biking"],
    inclusions: ["Bike", "Stay", "Backup", "Mechanic support"],
    rating: 4.5,
    reviewCount: 1100,
    hotelLabel: "Camps / Hotel",
    breakfastLabel: "As Plan",
    transferLabel: "Bike + Backup",
    sightseeingLabel: "12+ Places",
    locationLine: "Delhi \u2022 Manali \u2022 Jispa \u2022 Sarchu \u2022 Leh \u2022 Srinagar",
    galleryImages: [BIKE_TRAIL, LEH_PALACE, HERO, UMLING],
    highlightBullets: [
      "Epic Manali–Leh highway ride",
      "Jispa & Sarchu high-camp nights",
      "Leh rest + Srinagar exit corridor",
      "Backup vehicle & mechanic support",
    ],
    extraPhotoCount: 18,
    itinerary: [
      "Day 1: Delhi briefing / travel start",
      "Day 2: Reach Manali - rest",
      "Day 3: Manali to Jispa",
      "Day 4: Jispa to Sarchu",
      "Day 5–6: Enter Leh - rest & local",
      "Day 7–10: Leh region rides / optional excursions",
      "Day 11–12: Leh to Srinagar corridor & wrap-up",
    ],
  },
  {
    id: "bike-umling-la",
    anchor: "BikeUmlingLa",
    title: "Ladakh Bike Adventure With Umling La Visit",
    shortTitle: "Bike Adventure With Umling La",
    duration: "7N / 8D",
    nights: "Leh–Nubra–Pangong–Hanle",
    route: ["Leh", "Nubra", "Pangong", "Umling La"],
    highlights: ["Umling La", "World's highest road", "Hanle"],
    priceFrom: inr(28800),
    priceValue: 28800,
    wasPrice: inr(34560),
    image: UMLING,
    focus: ["biking"],
    inclusions: ["Bike", "Stay", "Backup", "Permits help"],
    rating: 4.0,
    reviewCount: 23,
    hotelLabel: "Camps / Hotel",
    breakfastLabel: "As Plan",
    transferLabel: "Bike + Backup",
    sightseeingLabel: "9+ Places",
    locationLine: "2D Leh \u2022 1D Nubra \u2022 1D Pangong \u2022 Hanle / Umling La",
    galleryImages: [UMLING, BIKE_TRAIL, LEH_PALACE, PANGONG],
    highlightBullets: [
      "Umling La — among the world’s highest motorable roads",
      "Classic Nubra & Pangong bike days",
      "Hanle region adventure (as permitted)",
      "Backup support for high-altitude riding",
    ],
    extraPhotoCount: 13,
    itinerary: [
      "Day 1: Arrive Leh - bike briefing",
      "Day 2: Local acclimatisation ride",
      "Day 3: Leh to Nubra",
      "Day 4: Nubra to Pangong",
      "Day 5–6: Toward Hanle / Umling La visit",
      "Day 7: Return toward Leh",
      "Day 8: Departure",
    ],
  },
];

export const LEH_TESTIMONIALS = [
  {
    name: "Ankit & Friends",
    tag: "Adventure - Turtuk",
    quote:
      "Turtuk village and Pangong night were unreal. Transfers on time, hotels clean, and the team handled altitude tips really well.",
    rating: 5,
  },
  {
    name: "Sharma Family",
    tag: "Family - Discover Leh",
    quote:
      "We customized the Discover Leh plan for kids and elders. Private cab, flexible days, zero stress — highly recommend Uno Trips.",
    rating: 5,
  },
  {
    name: "Rohan M.",
    tag: "Biking - Manali Leh",
    quote:
      "Manali–Leh bike adventure with backup support was the trip of a lifetime. Mechanic help on high passes saved the day.",
    rating: 5,
  },
] as const;

export const LEH_BEST_TIME = [
  {
    season: "May - Jun",
    label: "Peak Season",
    detail: "Best roads open; ideal for first-timers & families",
  },
  {
    season: "Jul - Aug",
    label: "Warm Days",
    detail: "Great for Pangong & Nubra; book early",
  },
  {
    season: "Sep - Oct",
    label: "Clear Skies",
    detail: "Stunning photography; cooler nights",
  },
  {
    season: "Nov - Apr",
    label: "Limited Access",
    detail: "Many passes closed; winter trips need specialist plans",
  },
] as const;

const H1_BY_KEYWORD: Record<string, string> = {
  family: "Best Leh Ladakh Family Tour Packages 2026 - Save up to 40%",
  bike: "Best Ladakh Bike Trip Packages 2026 - Save up to 40%",
  biking: "Best Ladakh Bike Trip Packages 2026 - Save up to 40%",
  turtuk: "Best Ladakh Turtuk Tour Packages 2026 - Save up to 40%",
  pangong: "Best Pangong Lake Tour Packages 2026 - Save up to 40%",
  nubra: "Best Nubra Valley Tour Packages 2026 - Save up to 40%",
  leh: "Best Leh Ladakh Tour Packages 2026 - Save up to 40%",
};

/** Resolve H1 from ?h1= / ?headline= / ?kw= Ads params */
export function resolveLehAdsH1(
  h1?: string | string[] | null,
  headline?: string | string[] | null,
  kw?: string | string[] | null,
): string {
  const pick = (v?: string | string[] | null) =>
    (Array.isArray(v) ? v[0] : v)?.trim() || "";

  const raw = pick(h1) || pick(headline) || pick(kw);
  if (!raw) return LEH_ADS.defaultH1;

  const lower = raw.toLowerCase();
  if (H1_BY_KEYWORD[lower]) return H1_BY_KEYWORD[lower];

  const orderedKeys = ["biking", "bike", "family", "turtuk", "pangong", "nubra", "leh"];
  if (raw.length < 40) {
    for (const key of orderedKeys) {
      if (lower.includes(key)) return H1_BY_KEYWORD[key];
    }
  }

  if (raw.length > 3 && raw.length < 120) return raw;
  return LEH_ADS.defaultH1;
}
