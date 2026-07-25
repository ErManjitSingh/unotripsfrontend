/* Auto-enriched Leh Ads CRO content - keep in sync with landing */
import type { LehPackage } from "./leh-tour-data";

export const LEH_CRO = {
  heroH1: "Leh Ladakh Tour Packages 2026",
  heroSub:
    "Experience Pangong Lake, Nubra Valley, Khardung La & Tso Moriri with Local Experts.",
  startingFrom: "₹ 18,999",
  startingValue: 18999,
  saveBadge: "Save Up To 30%",
  offerBadge: "Limited Time Offer",
  rating: "4.9",
  travellers: "10,000+",
  experience: "15+ Years",
} as const;

export const LEH_TRUST_STRIP = [
  { label: "4.9 Rating", sub: "Google reviews" },
  { label: "10,000+ Happy Travellers", sub: "Trusted journeys" },
  { label: "15+ Years Experience", sub: "Himalayan experts" },
  { label: "Best Price Guarantee", sub: "Transparent quotes" },
  { label: "No Hidden Charges", sub: "Clear inclusions" },
] as const;

export const LEH_TRUST_CARDS = [
  { value: "10,000+", label: "Happy Travellers", icon: "users" },
  { value: "4.9★", label: "Google Rating", icon: "star" },
  { value: "24x7", label: "Travel Support", icon: "support" },
  { value: "Verified", label: "Hotels", icon: "hotel" },
  { value: "Best Price", label: "Guarantee", icon: "tag" },
  { value: "Secure", label: "Booking", icon: "shield" },
  { value: "Local", label: "Experts", icon: "map" },
] as const;

export const LEH_SAMPLE_ITINERARY = [
  { day: 1, title: "Arrival Leh", detail: "Airport pickup, hotel check-in & acclimatisation. Evening stroll at Leh market.", image: "/meta/leh_tour_package/hero.webp" },
  { day: 2, title: "Sham Valley", detail: "Magnetic Hill, Gurudwara Pathar Sahib, Hall of Fame & Indus confluence viewpoints.", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp" },
  { day: 3, title: "Nubra Valley", detail: "Cross Khardung La to Diskit / Hunder. Optional camel safari at sand dunes.", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp" },
  { day: 4, title: "Pangong", detail: "Scenic drive to Pangong Tso. Lakeside sunset & overnight near the lake (as plan).", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp" },
  { day: 5, title: "Return Leh", detail: "Drive back via Chang La. Free time for cafes, Shanti Stupa & shopping.", image: "/meta/leh_tour_package/hero.webp" },
  { day: 6, title: "Departure", detail: "Hotel checkout & airport drop with trip assistance.", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp" },
] as const;

export const LEH_HOTELS = [
  { name: "Hotel Grand Dragon / Similar", rating: 4.5, room: "Deluxe Double", amenities: ["WiFi", "Heating", "Restaurant", "Parking"], image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp" },
  { name: "Nubra Desert Camp / Similar", rating: 4.3, room: "Swiss Tent", amenities: ["Meals", "Bonfire", "Attached Washroom"], image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp" },
  { name: "Pangong Lakeside Stay / Similar", rating: 4.4, room: "Cottage / Camp", amenities: ["Lake View", "Meals", "Hot Water"], image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp" },
] as const;

export const LEH_CABS = [
  { name: "Toyota Innova", type: "Private Cab", seats: "6+1", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp" },
  { name: "Maruti Ertiga", type: "Private Cab", seats: "6+1", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp" },
  { name: "Tempo Traveller", type: "Group", seats: "12+1", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp" },
  { name: "SUV / Xylo", type: "Private Cab", seats: "6+1", image: "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/12_converted.webp" },
] as const;

export const LEH_INCLUDED = [
  { label: "Hotels / Camps", icon: "hotel" },
  { label: "Daily Breakfast", icon: "meal" },
  { label: "Sightseeing", icon: "sight" },
  { label: "Airport Pickup", icon: "plane" },
  { label: "Inner Line Permits", icon: "permit" },
  { label: "Private Cab", icon: "cab" },
] as const;

export const LEH_EXCLUDED = [
  "Airfare / train tickets",
  "Lunch & dinner (unless specified)",
  "Adventure activities & entry fees",
  "Personal expenses & tips",
  "Travel insurance",
  "Anything not mentioned in inclusions",
] as const;

export const LEH_WHY = [
  { title: "Local Experts", desc: "On-ground Ladakh specialists for permits & pacing." },
  { title: "Lowest Price", desc: "Best price guarantee with transparent quotes." },
  { title: "Verified Hotels", desc: "Handpicked stays & camps for altitude comfort." },
  { title: "Experienced Drivers", desc: "High-pass trained drivers with backup support." },
  { title: "24x7 Support", desc: "WhatsApp & call assistance throughout the trip." },
  { title: "Customized Tour", desc: "Family, honeymoon & adventure itineraries." },
  { title: "Secure Booking", desc: "Confirmed hotels & transfers before you travel." },
  { title: "No Hidden Charges", desc: "Clear inclusions - what you see is what you pay." },
] as const;

export const LEH_GALLERY = [
  "/meta/leh_tour_package/hero.webp",
  "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp",
  "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp",
  "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp",
  "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/12_converted.webp",
  "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/7_converted.webp",
] as const;

export const LEH_FAQS: { q: string; a: string }[] = [
  { q: "What is the best time to visit Leh Ladakh?", a: "May to October is ideal when major passes are open. July-September offers pleasant days; September-October brings clear skies for photography." },
  { q: "How many days are enough for a Leh trip?", a: "A classic Leh-Nubra-Pangong circuit works well in 5N/6D to 6N/7D including acclimatisation. Longer trips can add Hanle, Tso Moriri or Srinagar." },
  { q: "Is altitude sickness common? How do you handle it?", a: "Mild symptoms can occur. We plan a rest day on arrival, advise hydration, and avoid strenuous activity on day one. Medical support guidance is shared pre-trip." },
  { q: "Are inner line permits included?", a: "Yes - for Nubra, Pangong and other restricted areas as per your itinerary, permits are arranged by our team." },
  { q: "What hotels are provided?", a: "3-star equivalent hotels in Leh and quality camps/cottages in Nubra & Pangong (or similar category). Upgrades available on request." },
  { q: "Is a private cab included?", a: "Yes. Private Innova / Ertiga / SUV as per group size for the sightseeing circuit. Airport transfers are included in most packages." },
  { q: "Can I customise the itinerary?", a: "Absolutely. Share travel month, group size and preferences - we tailor routes, hotels and pacing for families, couples or bikers." },
  { q: "What is the starting price?", a: "Packages start from ₹18,999 per person on twin sharing, depending on season, hotels and inclusions. Get a free quote for exact pricing." },
  { q: "Do you arrange flights?", a: "We can assist with flight suggestions and coordination. Airfare is usually quoted separately unless a flight-inclusive plan is requested." },
  { q: "Is oxygen support available?", a: "Oxygen cylinders / concentrator support can be arranged on request for high-altitude comfort, subject to availability." },
  { q: "Are meals included?", a: "Daily breakfast is standard. MAP / AP (lunch & dinner) can be added. Camps often include dinner & breakfast as per plan." },
  { q: "How do I book with Uno Trips?", a: "Share your details via the form, WhatsApp or call. We confirm itinerary, hotels and cab, then share payment options for booking." },
  { q: "Is this suitable for seniors and kids?", a: "Yes - we customise pacing, hotel comfort and rest stops for families and senior travellers." },
  { q: "What about bike trips?", a: "We offer Ladakh bike adventures with backup vehicle and mechanic support. Ask for bike-specific packages." },
  { q: "Why book with Uno Trips for Ladakh?", a: "Local Himalayan expertise, transparent pricing, verified stays, experienced high-pass drivers, and 24x7 trip assistance - built for Google Ads travellers who want clarity and trust." },
];

export type EnrichedLehPackage = LehPackage & {
  wasPrice: string;
  wasValue: number;
  discountPct: number;
  seatsLeft: number;
};

export const LEH_PACKAGES_ENRICHED: EnrichedLehPackage[] = [
  {
    "id": "leh-turtuk-package-tour",
    "anchor": "LehTurtukPackageTour",
    "title": "Leh Package Tour with Turtuk Village",
    "shortTitle": "Leh Package Tour with Turtuk Village",
    "duration": "6N / 7D",
    "nights": "6N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 47,345",
    "priceValue": 47345,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "bestSeller": true,
    "rating": 4.7,
    "reviewCount": 80,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 6N / 7D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 6: Sightseeing as per package plan",
      "Day 7: Departure with trip assistance"
    ],
    "wasPrice": "₹ 67,636",
    "wasValue": 67636,
    "discountPct": 30,
    "seatsLeft": 3
  },
  {
    "id": "leh-package-tour",
    "anchor": "LehPackageTour",
    "title": "Most Wanted Ladakh Package Tour",
    "shortTitle": "Most Wanted Ladakh Package Tour",
    "duration": "5N / 6D",
    "nights": "5N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 35,816",
    "priceValue": 35816,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 97,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 5N / 6D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/20.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 5: Sightseeing as per package plan",
      "Day 6: Departure with trip assistance"
    ],
    "wasPrice": "₹ 51,166",
    "wasValue": 51166,
    "discountPct": 30,
    "seatsLeft": 5
  },
  {
    "id": "srinagar-to-leh-ladakh-tour-with-umling-la-9-days",
    "anchor": "SrinagarToLehLadakh",
    "title": "Srinagar to Leh Ladakh Tour with Umling La (9 Days)",
    "shortTitle": "Srinagar to Leh Ladakh Tour with Umling La (9...",
    "duration": "8N / 9D",
    "nights": "8N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 88,972",
    "priceValue": 88972,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/9_converted_es9mkhb.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 114,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Srinagar · 8N / 9D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/9_converted_es9mkhb.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 8: Sightseeing as per package plan",
      "Day 9: Departure with trip assistance"
    ],
    "wasPrice": "₹ 1,27,103",
    "wasValue": 127103,
    "discountPct": 30,
    "seatsLeft": 7
  },
  {
    "id": "remarkable-ladakh-tour-package",
    "anchor": "RemarkableLadakhTourPackage",
    "title": "Remarkable Ladakh Premium Tour Package",
    "shortTitle": "Remarkable Ladakh Premium Tour Package",
    "duration": "4N / 5D",
    "nights": "4N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 53,657",
    "priceValue": 53657,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/2_converted_BUyqBWk.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 131,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 4N / 5D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/2_converted_BUyqBWk.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 4: Sightseeing as per package plan",
      "Day 5: Departure with trip assistance"
    ],
    "wasPrice": "₹ 76,653",
    "wasValue": 76653,
    "discountPct": 30,
    "seatsLeft": 4
  },
  {
    "id": "explore-leh-in-luxury-7-days-6-nights-of-elegance",
    "anchor": "ExploreLehInLuxury",
    "title": "Explore Leh in Premium: 7 Days, 6 Nights of Elegance",
    "shortTitle": "Explore Leh in Premium: 7 Days, 6 Nights of E...",
    "duration": "6N / 7D",
    "nights": "6N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 74,913",
    "priceValue": 74913,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/12_converted.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 148,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 6N / 7D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/12_converted.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 6: Sightseeing as per package plan",
      "Day 7: Departure with trip assistance"
    ],
    "wasPrice": "₹ 1,07,019",
    "wasValue": 107019,
    "discountPct": 30,
    "seatsLeft": 6
  },
  {
    "id": "leh-ladakh-a-journey-through-hanle-and-umlingla-pass",
    "anchor": "LehLadakhAJourney",
    "title": "Leh Ladakh: A Journey Through Hanle and Umlingla Pass",
    "shortTitle": "Leh Ladakh: A Journey Through Hanle and Umlin...",
    "duration": "6N / 7D",
    "nights": "6N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 53,865",
    "priceValue": 53865,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/7_converted.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 165,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 6N / 7D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/7_converted.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 6: Sightseeing as per package plan",
      "Day 7: Departure with trip assistance"
    ],
    "wasPrice": "₹ 76,950",
    "wasValue": 76950,
    "discountPct": 30,
    "seatsLeft": 3
  },
  {
    "id": "srinagar-and-ladakh-a-perfect-blend-of-nature",
    "anchor": "SrinagarAndLadakhA",
    "title": "Srinagar and Ladakh: A Perfect Blend of Nature",
    "shortTitle": "Srinagar and Ladakh: A Perfect Blend of Nature",
    "duration": "10N / 11D",
    "nights": "10N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 99,299",
    "priceValue": 99299,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/10_converted.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 182,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Srinagar · 10N / 11D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/10_converted.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 10: Sightseeing as per package plan",
      "Day 11: Departure with trip assistance"
    ],
    "wasPrice": "₹ 1,41,856",
    "wasValue": 141856,
    "discountPct": 30,
    "seatsLeft": 5
  },
  {
    "id": "leh-ladakh-odyssey",
    "anchor": "LehLadakhOdyssey",
    "title": "Leh Ladakh Odyssey",
    "shortTitle": "Leh Ladakh Odyssey",
    "duration": "4N / 5D",
    "nights": "4N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 33,926",
    "priceValue": 33926,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 199,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 4N / 5D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/1_converted.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 4: Sightseeing as per package plan",
      "Day 5: Departure with trip assistance"
    ],
    "wasPrice": "₹ 48,466",
    "wasValue": 48466,
    "discountPct": 30,
    "seatsLeft": 7
  },
  {
    "id": "exclusive-ladakh-luxury-tour",
    "anchor": "ExclusiveLadakhLuxuryTour",
    "title": "Elite Ladakh Tour - Premium & Private",
    "shortTitle": "Elite Ladakh Tour - Premium & Private",
    "duration": "5N / 6D",
    "nights": "5N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 1,02,320",
    "priceValue": 102320,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/13_converted_FGInvCY.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 216,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 5N / 6D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/13_converted_FGInvCY.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 5: Sightseeing as per package plan",
      "Day 6: Departure with trip assistance"
    ],
    "wasPrice": "₹ 1,46,171",
    "wasValue": 146171,
    "discountPct": 30,
    "seatsLeft": 4
  },
  {
    "id": "a-blissful-adventure-leh-and-srinagar-tour",
    "anchor": "ABlissfulAdventureLeh",
    "title": "A Blissful Adventure: Leh and Srinagar Tour",
    "shortTitle": "A Blissful Adventure: Leh and Srinagar Tour",
    "duration": "7N / 8D",
    "nights": "7N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 72,765",
    "priceValue": 72765,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/4_converted.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 233,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 7N / 8D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/4_converted.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 7: Sightseeing as per package plan",
      "Day 8: Departure with trip assistance"
    ],
    "wasPrice": "₹ 1,03,950",
    "wasValue": 103950,
    "discountPct": 30,
    "seatsLeft": 6
  },
  {
    "id": "leh-package-tour-copy-1",
    "anchor": "LehPackageTourCopy",
    "title": "Magical Ladakh with Deluxe",
    "shortTitle": "Magical Ladakh with Deluxe",
    "duration": "5N / 6D",
    "nights": "5N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 42,761",
    "priceValue": 42761,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/22_44YRQug.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 250,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 5N / 6D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/22_44YRQug.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 5: Sightseeing as per package plan",
      "Day 6: Departure with trip assistance"
    ],
    "wasPrice": "₹ 61,087",
    "wasValue": 61087,
    "discountPct": 30,
    "seatsLeft": 3
  },
  {
    "id": "leh-ladakh-round-circuit-srinagar-pickup-delhi-drop",
    "anchor": "LehLadakhRoundCircuit",
    "title": "Srinagar to  Leh Ladakh Adventures",
    "shortTitle": "Srinagar to  Leh Ladakh Adventures",
    "duration": "7N / 8D",
    "nights": "7N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 74,351",
    "priceValue": 74351,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/6_converted.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 267,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Srinagar · 7N / 8D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/6_converted.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 7: Sightseeing as per package plan",
      "Day 8: Departure with trip assistance"
    ],
    "wasPrice": "₹ 1,06,216",
    "wasValue": 106216,
    "discountPct": 30,
    "seatsLeft": 5
  },
  {
    "id": "leh-package-with-turtuk-village",
    "anchor": "LehPackageWithTurtuk",
    "title": "Incredible Ladakh with Hanle",
    "shortTitle": "Incredible Ladakh with Hanle",
    "duration": "7N / 8D",
    "nights": "7N Leh Ladakh",
    "route": [
      "Leh",
      "Ladakh"
    ],
    "highlights": [
      "Leh Ladakh",
      "Curated itinerary",
      "Trip assistance"
    ],
    "priceFrom": "₹ 57,551",
    "priceValue": 57551,
    "image": "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/21.webp",
    "focus": [
      "adventure"
    ],
    "inclusions": [
      "Hotels / Camps",
      "Breakfast",
      "Transfers",
      "Sightseeing"
    ],
    "rating": 4.7,
    "reviewCount": 284,
    "hotelLabel": "3 Star",
    "breakfastLabel": "Daily",
    "transferLabel": "Private Cab",
    "sightseeingLabel": "As Plan",
    "locationLine": "Ex-Leh · 7N / 8D",
    "galleryImages": [
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/21.webp",
      "/meta/leh_tour_package/hero.webp",
      "https://glacial-1.s3.ap-south-1.amazonaws.com/media/image/package_image/23.webp"
    ],
    "highlightBullets": [
      "Curated Leh Ladakh experience",
      "Hotels / camps as per plan",
      "Private transfers & trip assistance",
      "Flexible date options on enquiry"
    ],
    "extraPhotoCount": 8,
    "itinerary": [
      "Day 1: Arrive and acclimatisation",
      "Day 2 to 7: Sightseeing as per package plan",
      "Day 8: Departure with trip assistance"
    ],
    "wasPrice": "₹ 82,216",
    "wasValue": 82216,
    "discountPct": 30,
    "seatsLeft": 7
  }
] as EnrichedLehPackage[];
