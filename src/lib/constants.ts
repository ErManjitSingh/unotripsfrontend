/** Site-wide copy and mock catalog used by API fallbacks and static sections. */

const DEFAULT_SITE_URL = "https://www.wanderluxvoyages.com";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export const SITE = {
  name: "Wanderlux Voyages",
  tagline: "Premium curated journeys across India and the world.",
  url: resolveSiteUrl(),
  phone: "+91 1800 000 4455",
  email: "hello@wanderluxvoyages.com",
} as const;

export type DestinationCard = {
  id: string;
  name: string;
  slug: string;
  image: string;
  packageCount: number;
  region: string;
};

export type TourPackage = {
  id: string;
  title: string;
  image: string;
  durationNights: number;
  durationDays: number;
  rating: number;
  reviewCount: number;
  priceINR: number;
  oldPriceINR?: number;
  discountPct?: number;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  publishedAt: string;
  readMinutes: number;
};

export type TravelCategory = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export const NAV_LINKS = [
  { href: "#destinations", label: "Destinations" },
  { href: "#packages", label: "Packages" },
  { href: "#honeymoon", label: "Honeymoon" },
  { href: "#international", label: "International" },
  { href: "#blog", label: "Blogs" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;

export const MEGA_DESTINATIONS = [
  {
    region: "India Classics",
    items: [
      { label: "Rajasthan", href: "#" },
      { label: "Kerala Backwaters", href: "#" },
      { label: "Himachal Pradesh", href: "#" },
      { label: "Goa", href: "#" },
    ],
  },
  {
    region: "Asia Pacific",
    items: [
      { label: "Japan", href: "#" },
      { label: "Maldives", href: "#" },
      { label: "Singapore", href: "#" },
      { label: "Vietnam", href: "#" },
    ],
  },
  {
    region: "Europe & Beyond",
    items: [
      { label: "Switzerland", href: "#" },
      { label: "Italy", href: "#" },
      { label: "France", href: "#" },
      { label: "Dubai", href: "#" },
    ],
  },
] as const;

export const HERO_SLIDES = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80",
    alt: "Scenic coastal road at sunset",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    alt: "Alpine mountain landscape",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80",
    alt: "Traveler planning journey with map",
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

export const CATEGORY_STRIP = [
  { id: "explore", label: "Explore", icon: "flame", trending: false },
  { id: "europe", label: "Europe", icon: "landmark", trending: false },
  { id: "japan", label: "Japan", icon: "torii", trending: true },
  { id: "singapore", label: "Singapore", icon: "building2", trending: false },
  { id: "maldives", label: "Maldives", icon: "palmtree", trending: true },
  { id: "dubai", label: "Dubai", icon: "sun", trending: true },
  { id: "bali", label: "Bali", icon: "waves", trending: false },
  { id: "usa", label: "USA", icon: "flag", trending: false },
] as const;

export const POPULAR_DESTINATIONS: DestinationCard[] = [
  { id: "d1", name: "Rajasthan Royal", slug: "rajasthan", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80", packageCount: 42, region: "India" },
  { id: "d2", name: "Kerala Serenity", slug: "kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc39c1be?w=800&q=80", packageCount: 36, region: "India" },
  { id: "d3", name: "Swiss Alps", slug: "switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80", packageCount: 28, region: "Europe" },
  { id: "d4", name: "Maldives Escape", slug: "maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", packageCount: 19, region: "Asia" },
  { id: "d5", name: "Tokyo & Kyoto", slug: "japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", packageCount: 24, region: "Asia" },
  { id: "d6", name: "Dubai Luxury", slug: "dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", packageCount: 31, region: "Middle East" },
  { id: "d7", name: "Italian Romance", slug: "italy", image: "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80", packageCount: 33, region: "Europe" },
  { id: "d8", name: "Vietnam Trails", slug: "vietnam", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80", packageCount: 17, region: "Asia" },
];

export const TRENDING_TOURS: TourPackage[] = [
  { id: "t1", title: "Golden Triangle Luxury", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", durationNights: 6, durationDays: 7, rating: 4.9, reviewCount: 1284, priceINR: 89999, oldPriceINR: 112999, discountPct: 20 },
  { id: "t2", title: "Swiss Scenic Rail Journey", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80", durationNights: 7, durationDays: 8, rating: 4.95, reviewCount: 642, priceINR: 189000, oldPriceINR: 205000, discountPct: 8 },
  { id: "t3", title: "Maldives Overwater Retreat", image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", durationNights: 4, durationDays: 5, rating: 4.98, reviewCount: 910, priceINR: 245000 },
  { id: "t4", title: "Japan Cherry Blossom", image: "https://images.unsplash.com/photo-1493976040374-85c3e764a8d5?w=800&q=80", durationNights: 8, durationDays: 9, rating: 4.92, reviewCount: 532, priceINR: 298000, oldPriceINR: 329000, discountPct: 9 },
  { id: "t5", title: "Dubai Skyline & Desert", image: "https://images.unsplash.com/photo-1518684079-c4aef7d92ea7?w=800&q=80", durationNights: 4, durationDays: 5, rating: 4.88, reviewCount: 1205, priceINR: 79999, oldPriceINR: 99999, discountPct: 20 },
];

export const TESTIMONIALS: Testimonial[] = [
  { id: "m1", name: "Ananya Mehta", location: "Mumbai, India", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating: 5, text: "Flawless coordination, boutique hotels, and thoughtful touches throughout our Europe tour. Felt truly five-star." },
  { id: "m2", name: "James Porter", location: "London, UK", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating: 5, text: "The Rajasthan itinerary balanced culture and comfort perfectly. Private guides made every monument come alive." },
  { id: "m3", name: "Priya & Rahul", location: "Bengaluru, India", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80", rating: 5, text: "Our honeymoon in the Maldives was seamless—from seaplane transfers to candlelit dinners on the sand." },
];

export const BLOG_POSTS: BlogPost[] = [
  { id: "b1", title: "Best Time to Visit Japan for First-Timers", excerpt: "Seasons, rail passes, and city pacing—plan a trip that feels relaxed, not rushed.", slug: "best-time-japan-first-timers", coverImage: "https://images.unsplash.com/photo-1493976040374-85c3e764a8d5?w=900&q=80", publishedAt: "2026-04-12", readMinutes: 8 },
  { id: "b2", title: "How to Choose a Rajasthan Palace Stay", excerpt: "Heritage hotels vs modern resorts: what delivers authentic luxury without compromising comfort.", slug: "rajasthan-palace-stay-guide", coverImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=900&q=80", publishedAt: "2026-03-28", readMinutes: 6 },
  { id: "b3", title: "Europe Rail: Scenic Routes Worth the Upgrade", excerpt: "First-class panoramas, luggage service, and the lines that justify splurging on premium cabins.", slug: "europe-rail-scenic-routes", coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80", publishedAt: "2026-03-02", readMinutes: 10 },
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
    title: "Destinations",
    links: [
      { label: "India Tours", href: "#" },
      { label: "Europe Tours", href: "#" },
      { label: "Asia Pacific", href: "#" },
      { label: "Middle East", href: "#" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Custom Itineraries", href: "#" },
      { label: "Visa Assistance", href: "#" },
      { label: "Travel Insurance", href: "#" },
      { label: "Corporate Travel", href: "#" },
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
