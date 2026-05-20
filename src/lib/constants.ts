/** Site-wide copy and mock catalog used by API fallbacks and static sections. */

const DEFAULT_SITE_URL = "https://unotrips.com";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

/** FAQ copy — shared by visible FAQ section and JSON-LD FAQPage schema. */
export const FAQ_ITEMS = [
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
] as const;

export const SITE = {
  name: "UNO Trips",
  tagline: "Luxury travel, distilled — curated journeys across India and the world.",
  url: resolveSiteUrl(),
  phone: "+91 83530 96965",
  /** For `https://wa.me/{digits}` — India country code + 10-digit mobile, no plus. */
  whatsappPhoneDigits: "918353096965",
  email: "info@unotrips.com",
  /** Office address shown in footer, schema.org, and contact blocks. */
  address:
    "Verma Building, Kamla Nagar, sanjauli, Shimla, Himachal Pradesh 171006",
  /** UNO Trips brand mark — dark-background artwork; used in Navbar + inner header. */
  logoUrl: "https://travelwithuno.com/img/logo.png",
} as const;

/** Hotel partners — list property / partner signup (opens in new tab from nav CTAs). */
export const PARTNER_PORTAL_URL = "https://partner.unotrips.com/partner";

export type DestinationCard = {
  id: string;
  name: string;
  slug: string;
  image: string;
  packageCount: number;
  region: string;
};

/** One day block from Laravel `itinerary` on `/api/v1/packages`. */
export type TourItineraryDay = {
  day: number;
  title: string;
  body: string;
};

export type TourPackage = {
  id: string;
  /** URL segment for `/packages/[slug]` (Laravel may omit). */
  slug?: string;
  title: string;
  image: string;
  durationNights: number;
  durationDays: number;
  rating: number;
  reviewCount: number;
  priceINR: number;
  oldPriceINR?: number;
  discountPct?: number;
  /** Long hero / listing intro (HTML-free). */
  description?: string;
  /** Stats line: “N Countries | M Cities”. */
  countries?: number;
  cities?: number;
  /** Booking-style top line (e.g. escorted tour, beach package). */
  packageType?: string;
  /** City / region label under title. */
  location?: string;
  /** “X km from centre” line. */
  distanceFromCentreKm?: number;
  /** Show a compact member-save badge next to stars. */
  showMemberPrice?: boolean;
  /** Day-wise plan from API when present; otherwise UI builds a short placeholder. */
  itinerary?: TourItineraryDay[];
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
};

export type { BlogPost, BlogCategory } from "@/lib/blog-api";

export type TravelCategory = {
  id: string;
  title: string;
  description: string;
  image: string;
};

/** Single hero banner (home + OG default image). */
export const HERO_SLIDES = [
  {
    id: "hero-tropical-beach",
    src: "https://static.vecteezy.com/system/resources/thumbnails/041/042/057/small/ai-generated-aerial-view-of-beautiful-tropical-beach-and-sea-with-coconut-palm-tree-for-travel-and-vacation-free-photo.jpg",
    alt: "Aerial view of tropical beach, palm trees and turquoise sea",
  },
] as const;

export const HERO_COLLAGE = [
  { id: "c1", src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80", alt: "Taj Mahal", className: "left-[2%] top-[8%] h-28 w-36 sm:h-36 sm:w-44 md:h-44 md:w-52" },
  { id: "c2", src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", alt: "Dubai skyline", className: "left-[8%] bottom-[18%] h-24 w-32 sm:h-32 sm:w-40 md:h-36 md:w-48" },
  { id: "c3", src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", alt: "Eiffel Tower Paris", className: "right-[4%] top-[6%] h-32 w-40 sm:h-40 sm:w-52 md:h-48 md:w-60" },
  { id: "c4", src: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80", alt: "India palace", className: "right-[10%] bottom-[14%] h-28 w-36 sm:h-36 sm:w-44 md:h-40 md:w-52" },
  { id: "c5", src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80", alt: "Arc de Triomphe", className: "left-[18%] top-[22%] h-20 w-28 sm:h-24 sm:w-32 opacity-90" },
  { id: "c6", src: "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=400&q=80", alt: "Venice canal", className: "right-[18%] top-[26%] h-24 w-32 sm:h-28 sm:w-36" },
  { id: "c7", src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5fe?w=400&q=80", alt: "Swiss lake", className: "left-[4%] top-[42%] h-16 w-24 sm:h-20 sm:w-28 hidden sm:block" },
  { id: "c8", src: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&q=80", alt: "Tropical beach", className: "right-[2%] top-[40%] h-16 w-24 sm:h-20 sm:w-28 hidden md:block" },
] as const;

export const POPULAR_DESTINATIONS: DestinationCard[] = [
  { id: "d1", name: "Rajasthan Royal", slug: "rajasthan", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80", packageCount: 42, region: "India" },
  { id: "d2", name: "Kerala Serenity", slug: "kerala", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80", packageCount: 36, region: "India" },
  { id: "d3", name: "Swiss Alps", slug: "switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80", packageCount: 28, region: "Europe" },
  { id: "d4", name: "Maldives Escape", slug: "maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", packageCount: 19, region: "Asia" },
  { id: "d5", name: "Tokyo & Kyoto", slug: "japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", packageCount: 24, region: "Asia" },
  { id: "d6", name: "Dubai Luxury", slug: "dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", packageCount: 31, region: "Middle East" },
  { id: "d7", name: "Italian Romance", slug: "italy", image: "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80", packageCount: 33, region: "Europe" },
  { id: "d8", name: "Vietnam Trails", slug: "vietnam", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80", packageCount: 17, region: "Asia" },
];

export const TRENDING_TOURS: TourPackage[] = [
  {
    id: "t1",
    slug: "golden-triangle-luxury",
    title: "Golden Triangle Luxury",
    description:
      "Experience Delhi, Agra, and Jaipur with private guides, heritage palace stays, and curated dining. Ideal for first-timers who want culture, comfort, and clear inclusions—read more on the full itinerary below.",
    countries: 1,
    cities: 3,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    durationNights: 6,
    durationDays: 7,
    rating: 4.9,
    reviewCount: 1284,
    priceINR: 89999,
    oldPriceINR: 112999,
    discountPct: 20,
    packageType: "Escorted tour",
    location: "Delhi, Agra & Jaipur, India",
    distanceFromCentreKm: 3.2,
    showMemberPrice: true,
  },
  {
    id: "t2",
    slug: "swiss-scenic-rail-journey",
    title: "Swiss Scenic Rail Journey",
    description:
      "Glacier views, scenic trains, and lakeside towns—Swiss precision meets relaxed pacing. Includes premium rail passes, hand-picked hotels, and optional mountain excursions.",
    countries: 1,
    cities: 4,
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
    durationNights: 7,
    durationDays: 8,
    rating: 4.95,
    reviewCount: 642,
    priceINR: 189000,
    oldPriceINR: 205000,
    discountPct: 8,
    packageType: "Rail & mountain package",
    location: "Zurich & Interlaken, Switzerland",
    distanceFromCentreKm: 1.4,
    showMemberPrice: true,
  },
  {
    id: "t3",
    slug: "maldives-overwater-retreat",
    title: "Maldives Overwater Retreat",
    description:
      "Overwater villas, house-reef snorkelling, and seamless speedboat or seaplane transfers. Built for honeymoons and milestone trips with spa credits and sunset dining.",
    countries: 1,
    cities: 2,
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
    durationNights: 4,
    durationDays: 5,
    rating: 4.98,
    reviewCount: 910,
    priceINR: 245000,
    oldPriceINR: 268000,
    packageType: "Beach & island package",
    location: "North Malé Atoll, Maldives",
    distanceFromCentreKm: 12.6,
    showMemberPrice: true,
  },
  {
    id: "t4",
    slug: "japan-cherry-blossom",
    title: "Japan Cherry Blossom",
    description:
      "Tokyo energy, Kyoto temples, and Osaka flavours—small-group pacing with rail passes and bilingual hosts. Seasonal sakura routing when dates align.",
    countries: 1,
    cities: 3,
    image: "https://images.unsplash.com/photo-1493976040374-85c3e764a8d5?w=800&q=80",
    durationNights: 8,
    durationDays: 9,
    rating: 4.92,
    reviewCount: 532,
    priceINR: 298000,
    oldPriceINR: 329000,
    discountPct: 9,
    packageType: "Small-group tour",
    location: "Tokyo, Kyoto & Osaka, Japan",
    distanceFromCentreKm: 5.8,
    showMemberPrice: false,
  },
  {
    id: "t5",
    slug: "dubai-skyline-desert",
    title: "Dubai Skyline & Desert",
    description:
      "Iconic skyline views, desert safaris, and family-friendly attractions with private airport transfers. Flexible add-ons for theme parks and dhow dinners.",
    countries: 1,
    cities: 2,
    image: "https://images.unsplash.com/photo-1518684079-c4aef7d92ea7?w=800&q=80",
    durationNights: 4,
    durationDays: 5,
    rating: 4.88,
    reviewCount: 1205,
    priceINR: 79999,
    oldPriceINR: 99999,
    discountPct: 20,
    packageType: "City & desert combo",
    location: "Dubai, UAE",
    distanceFromCentreKm: 8.1,
    showMemberPrice: true,
  },
  {
    id: "t6",
    slug: "kerala-backwaters-tea-hills",
    title: "Kerala Backwaters & Tea Hills",
    description:
      "Houseboat nights, spice plantations, and Munnar tea vistas with gentle pacing. Wellness add-ons and curated cultural evenings available on request.",
    countries: 1,
    cities: 4,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
    durationNights: 5,
    durationDays: 6,
    rating: 4.86,
    reviewCount: 876,
    priceINR: 62999,
    oldPriceINR: 74999,
    discountPct: 16,
    packageType: "Nature & wellness",
    location: "Kochi & Munnar, India",
    distanceFromCentreKm: 6.4,
    showMemberPrice: true,
  },
  {
    id: "t7",
    slug: "paris-swiss-highlights",
    title: "Paris & Swiss Highlights",
    description:
      "Two-country highlights: Paris icons and Lucerne lakes in one seamless route. Eurostar/TGV segments, central hotels, and optional Louvre or chocolate atelier slots.",
    countries: 2,
    cities: 4,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    durationNights: 9,
    durationDays: 10,
    rating: 4.91,
    reviewCount: 411,
    priceINR: 219000,
    packageType: "Multi-country tour",
    location: "Paris, France · Lucerne, Switzerland",
    distanceFromCentreKm: 2.0,
    showMemberPrice: false,
  },
  {
    id: "t8",
    slug: "bali-island-escape",
    title: "Bali Island Escape",
    description:
      "Ubud rice terraces, Seminyak sunsets, and temple visits with private drivers on rotation days. Surf lessons, spa rituals, and volcano sunrise hikes as add-ons.",
    countries: 1,
    cities: 3,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    durationNights: 5,
    durationDays: 6,
    rating: 4.94,
    reviewCount: 703,
    priceINR: 112000,
    oldPriceINR: 129000,
    packageType: "Beach package",
    location: "Ubud & Seminyak, Indonesia",
    distanceFromCentreKm: 4.5,
    showMemberPrice: true,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  { id: "m1", name: "Ananya Mehta", location: "Mumbai, India", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating: 5, text: "Flawless coordination, boutique hotels, and thoughtful touches throughout our Europe tour. Felt truly five-star." },
  { id: "m2", name: "James Porter", location: "London, UK", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating: 5, text: "The Rajasthan itinerary balanced culture and comfort perfectly. Private guides made every monument come alive." },
  { id: "m3", name: "Priya & Rahul", location: "Bengaluru, India", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80", rating: 5, text: "Our honeymoon in the Maldives was seamless—from seaplane transfers to candlelit dinners on the sand." },
];

export const TRAVEL_CATEGORIES: TravelCategory[] = [
  { id: "cat1", title: "Adventure", description: "Hikes, wildlife, and adrenaline with expert-led safety.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80" },
  { id: "cat2", title: "Family", description: "Kid-friendly pacing, spacious stays, and memorable bonding.", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80" },
  { id: "cat3", title: "Honeymoon", description: "Private experiences, romantic dining, and serene escapes.", image: "https://images.unsplash.com/photo-1515934751975-4628bf386ecd?w=800&q=80" },
  { id: "cat4", title: "Pilgrimage", description: "Respectful itineraries with comfortable transport and guides.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80" },
  { id: "cat5", title: "Luxury", description: "Chauffeurs, signature suites, and white-glove concierge.", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" },
  { id: "cat6", title: "Corporate", description: "MICE-ready logistics, branded experiences, and seamless billing.", image: "https://images.unsplash.com/photo-1540575467063-027a693dca10?w=800&q=80" },
];

export const STATS = [
  { id: "s1", value: 50, suffix: "K+", label: "Happy Travelers" },
  { id: "s2", value: 200, suffix: "+", label: "Curated Destinations" },
  { id: "s3", value: 4.9, suffix: "", label: "Average Rating", decimals: 1 },
  { id: "s4", value: 12, suffix: "+", label: "Years of Excellence" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "All packages", href: "/packages" },
      { label: "Himachal", href: "/destinations/himachal" },
      { label: "Ladakh", href: "/destinations/leh-ladakh" },
      { label: "Kerala", href: "/destinations/kerala" },
    ],
  },
  {
    title: "Quick links",
    links: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/#contact" },
      { label: "Packages", href: "/packages" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cancellation Policy", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
] as const;
