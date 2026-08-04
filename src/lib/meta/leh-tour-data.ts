export const LEH_ADS = {
  phoneDisplay: "+91-7876505119",
  phoneTel: "+917876505119",
  whatsapp: "917876505119",
  brand: "Uno Trips",
  defaultH1:
    "Best Leh Ladakh Tour Packages 2026 - Save up to 40% on Curated Trips",
  description:
    "Explore Leh Ladakh with curated family and adventure packages. Save up to 40% and request a quick callback from UNO Trips experts. Hotels, meals, transfers & trip assistance.",
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

export const LEH_PACKAGES: LehPackage[] = [
  {
    id: "leh-turtuk-package-tour",
    anchor: "LehTurtukPackageTour",
    title: "Leh Package Tour with Turtuk Village",
    shortTitle: "Leh Package Tour with Turtuk Village",
    duration: "6N / 7D",
    nights: "6N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 47,345",
    priceValue: 47345,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    bestSeller: true,
    rating: 4.7,
    reviewCount: 80,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 6N / 7D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 6: Sightseeing as per package plan",
      "Day 7: Departure with trip assistance",
    ],
  },
  {
    id: "leh-package-tour",
    anchor: "LehPackageTour",
    title: "Most Wanted Ladakh Package Tour",
    shortTitle: "Most Wanted Ladakh Package Tour",
    duration: "5N / 6D",
    nights: "5N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 35,816",
    priceValue: 35816,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 97,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 5N / 6D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 5: Sightseeing as per package plan",
      "Day 6: Departure with trip assistance",
    ],
  },
  {
    id: "srinagar-to-leh-ladakh-tour-with-umling-la-9-days",
    anchor: "SrinagarToLehLadakh",
    title: "Srinagar to Leh Ladakh Tour with Umling La (9 Days)",
    shortTitle: "Srinagar to Leh Ladakh Tour with Umling La (9...",
    duration: "8N / 9D",
    nights: "8N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 88,972",
    priceValue: 88972,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/9_converted_es9mkhb.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 114,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Srinagar · 8N / 9D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/9_converted_es9mkhb.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 8: Sightseeing as per package plan",
      "Day 9: Departure with trip assistance",
    ],
  },
  {
    id: "remarkable-ladakh-tour-package",
    anchor: "RemarkableLadakhTourPackage",
    title: "Remarkable Ladakh Premium Tour Package",
    shortTitle: "Remarkable Ladakh Premium Tour Package",
    duration: "4N / 5D",
    nights: "4N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 53,657",
    priceValue: 53657,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/2_converted_BUyqBWk.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 131,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 4N / 5D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/2_converted_BUyqBWk.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 4: Sightseeing as per package plan",
      "Day 5: Departure with trip assistance",
    ],
  },
  {
    id: "explore-leh-in-luxury-7-days-6-nights-of-elegance",
    anchor: "ExploreLehInLuxury",
    title: "Explore Leh in Premium: 7 Days, 6 Nights of Elegance",
    shortTitle: "Explore Leh in Premium: 7 Days, 6 Nights of E...",
    duration: "6N / 7D",
    nights: "6N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 74,913",
    priceValue: 74913,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/12_converted.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 148,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 6N / 7D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/12_converted.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 6: Sightseeing as per package plan",
      "Day 7: Departure with trip assistance",
    ],
  },
  {
    id: "leh-ladakh-a-journey-through-hanle-and-umlingla-pass",
    anchor: "LehLadakhAJourney",
    title: "Leh Ladakh: A Journey Through Hanle and Umlingla Pass",
    shortTitle: "Leh Ladakh: A Journey Through Hanle and Umlin...",
    duration: "6N / 7D",
    nights: "6N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 53,865",
    priceValue: 53865,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/7_converted.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 165,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 6N / 7D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/7_converted.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 6: Sightseeing as per package plan",
      "Day 7: Departure with trip assistance",
    ],
  },
  {
    id: "srinagar-and-ladakh-a-perfect-blend-of-nature",
    anchor: "SrinagarAndLadakhA",
    title: "Srinagar and Ladakh: A Perfect Blend of Nature",
    shortTitle: "Srinagar and Ladakh: A Perfect Blend of Nature",
    duration: "10N / 11D",
    nights: "10N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 99,299",
    priceValue: 99299,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/10_converted.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 182,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Srinagar · 10N / 11D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/10_converted.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 10: Sightseeing as per package plan",
      "Day 11: Departure with trip assistance",
    ],
  },
  {
    id: "leh-ladakh-odyssey",
    anchor: "LehLadakhOdyssey",
    title: "Leh Ladakh Odyssey",
    shortTitle: "Leh Ladakh Odyssey",
    duration: "4N / 5D",
    nights: "4N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 33,926",
    priceValue: 33926,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 199,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 4N / 5D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 4: Sightseeing as per package plan",
      "Day 5: Departure with trip assistance",
    ],
  },
  {
    id: "exclusive-ladakh-luxury-tour",
    anchor: "ExclusiveLadakhLuxuryTour",
    title: "Elite Ladakh Tour – Premium & Private",
    shortTitle: "Elite Ladakh Tour – Premium & Private",
    duration: "5N / 6D",
    nights: "5N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 1,02,320",
    priceValue: 102320,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/13_converted_FGInvCY.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 216,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 5N / 6D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/13_converted_FGInvCY.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 5: Sightseeing as per package plan",
      "Day 6: Departure with trip assistance",
    ],
  },
  {
    id: "a-blissful-adventure-leh-and-srinagar-tour",
    anchor: "ABlissfulAdventureLeh",
    title: "A Blissful Adventure: Leh and Srinagar Tour",
    shortTitle: "A Blissful Adventure: Leh and Srinagar Tour",
    duration: "7N / 8D",
    nights: "7N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 72,765",
    priceValue: 72765,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/4_converted.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 233,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 7N / 8D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/4_converted.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 7: Sightseeing as per package plan",
      "Day 8: Departure with trip assistance",
    ],
  },
  {
    id: "leh-package-tour-copy-1",
    anchor: "LehPackageTourCopy",
    title: "Magical Ladakh with Deluxe",
    shortTitle: "Magical Ladakh with Deluxe",
    duration: "5N / 6D",
    nights: "5N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 42,761",
    priceValue: 42761,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/22_44YRQug.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 250,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 5N / 6D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/22_44YRQug.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 5: Sightseeing as per package plan",
      "Day 6: Departure with trip assistance",
    ],
  },
  {
    id: "leh-ladakh-round-circuit-srinagar-pickup-delhi-drop",
    anchor: "LehLadakhRoundCircuit",
    title: "Srinagar to  Leh Ladakh Adventures",
    shortTitle: "Srinagar to  Leh Ladakh Adventures",
    duration: "7N / 8D",
    nights: "7N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 74,351",
    priceValue: 74351,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/6_converted.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 267,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Srinagar · 7N / 8D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/6_converted.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 7: Sightseeing as per package plan",
      "Day 8: Departure with trip assistance",
    ],
  },
  {
    id: "leh-package-with-turtuk-village",
    anchor: "LehPackageWithTurtuk",
    title: "Incredible Ladakh with Hanle",
    shortTitle: "Incredible Ladakh with Hanle",
    duration: "7N / 8D",
    nights: "7N Leh Ladakh",
    route: ["Leh", "Ladakh"],
    highlights: ["Leh Ladakh", "Curated itinerary", "Trip assistance"],
    priceFrom: "₹ 57,551",
    priceValue: 57551,
    image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/21.webp",
    focus: ["adventure"],
    inclusions: ["Hotels / Camps", "Breakfast", "Transfers", "Sightseeing"],
    rating: 4.7,
    reviewCount: 284,
    hotelLabel: "3 Star",
    breakfastLabel: "Daily",
    transferLabel: "Private Cab",
    sightseeingLabel: "As Plan",
    locationLine: "Ex-Leh · 7N / 8D",
    galleryImages: ["https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/21.webp", "/meta/leh_tour_package/hero.jpg", "https://s7ap1.scene7.com/is/image/incredibleindia/leh-palace-leh-ladakh-2-musthead-hero?qlt=82&ts=1726668053114"],
    highlightBullets: [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry",
    ],
    extraPhotoCount: 8,
    itinerary: [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 7: Sightseeing as per package plan",
      "Day 8: Departure with trip assistance",
    ],
  }
];

export const LEH_TESTIMONIALS = [
  {
    name: "Ankit & Friends",
    tag: "Adventure - Leh",
    quote:
      "Pangong night and high passes were unreal. Transfers on time, hotels clean, and the team handled altitude tips really well.",
    rating: 5,
  },
  {
    name: "Sharma Family",
    tag: "Family - Ladakh",
    quote:
      "We customized the Ladakh plan for kids and elders. Private cab, flexible days, zero stress - highly recommend Uno Trips.",
    rating: 5,
  },
  {
    name: "Rohan M.",
    tag: "Adventure - Umling La",
    quote:
      "Leh-Nubra-Pangong circuit with Umling La was the trip of a lifetime. Support team was always reachable.",
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
