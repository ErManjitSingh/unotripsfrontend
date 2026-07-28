/** Hotel listing / inner-page hero banner */
export const HOTEL_INNER_BANNER_IMAGE =
  "https://www.maritim.com/fileadmin/_processed_/0/1/csm_Bpa_363_Superior_500a005b62.jpg";

export type HotelCity = {
  slug: string;
  name: string;
  /** Full line in search bar — EaseMyTrip style */
  fullLocation: string;
  state?: string;
  country?: string;
};

/** Short location for hotel listing cards — city and state only (no street address). */
export function formatHotelCardLocation(city: string, state?: string): string {
  const c = city.trim();
  const s = (state ?? "").trim();
  if (c && s) return `${c}, ${s}`;
  return c || s;
}

export type HotelListing = {
  id: string;
  /** API URL slug — `/hotel/{city}/{hotelSlug}` */
  hotelSlug?: string;
  citySlug: string;
  name: string;
  stars: number;
  area: string;
  locationLine: string;
  tags: string[];
  amenities: string[];
  amenityMoreCount: number;
  highlights: string[];
  description: string;
  rating: number;
  ratingLabel: string;
  reviewCount: number;
  originalPrice: number;
  price: number;
  taxes: number;
  images: string[];
  dealOfDay?: boolean;
  bookWithZero?: boolean;
  freeCancellation?: boolean;
  freeBreakfast?: boolean;
  freeParking?: boolean;
  coupleFriendly?: boolean;
  localIdsAccepted?: boolean;
  propertyPhotoCount: number;
  roomPhotoCount: number;
  videoCount: number;
  nearbyLandmark: string;
  defaultRoomType: string;
  roomOptionsCount: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  state?: string;
  country?: string;
  distanceFromSearchKm?: number;
  searchLocationLabel?: string;
  startingPriceSummary?: {
    price: number;
    nights: number;
    rooms: number;
    subtotal: number;
    gst: number;
    tcs: number;
    taxes: number;
    total: number;
  };
};

export type HotelRoomOption = {
  id: string;
  name: string;
  guests: number;
  beds: string;
  price: number;
  taxes: number;
};

export type HotelRoomRatePlan = {
  id: string;
  packageName: string;
  /** Meal inclusions only — room amenities are shown once per room. */
  benefits: string[];
  roomBasePrice: number;
  mealAddOn: number;
  originalPrice: number;
  price: number;
  total: number;
  taxes: number;
  discountAmount: number;
  nonRefundable: boolean;
  couponCode: string;
  showBestValueBadge?: boolean;
};

export type HotelRoomType = {
  id: string;
  name: string;
  image: string;
  description?: string;
  amenities?: string[];
  availableCount?: number;
  maxOccupancy: number;
  /** INR per night for an extra bed. null = extra bed not offered for this room. */
  extraBedPrice: number | null;
  tags: string[];
  ratePlans: HotelRoomRatePlan[];
};

export type HotelPhotoCategory = {
  category: string;
  label: string;
  images: string[];
};

export type HotelBookingSelection = {
  city: HotelCity;
  hotel: HotelListing;
  roomType: HotelRoomType;
  ratePlan: HotelRoomRatePlan;
};

export type HotelRatingCategory = {
  label: string;
  score: number;
};

export type HotelGuestReview = {
  id: string;
  author: string;
  date: string;
  title: string;
  body: string;
};

export type HotelAboutSection = {
  title: string;
  body: string;
};

export type HotelFiltersState = {
  bookWithZero: boolean;
  freeCancellation: boolean;
  freeBreakfast: boolean;
  freeParking: boolean;
  stars: number[];
  priceBands: string[];
};

export const EMPTY_HOTEL_FILTERS: HotelFiltersState = {
  bookWithZero: false,
  freeCancellation: false,
  freeBreakfast: false,
  freeParking: false,
  stars: [],
  priceBands: [],
};

export const HOTEL_PRICE_BANDS = [
  { id: "below-2k", label: "Below ₹ 2000", min: 0, max: 2000 },
  { id: "2k-4k", label: "₹ 2001 - ₹ 4000", min: 2001, max: 4000 },
  { id: "4k-6k", label: "₹ 4001 - ₹ 6000", min: 4001, max: 6000 },
  { id: "6k-8k", label: "₹ 6001 - ₹ 8000", min: 6001, max: 8000 },
  { id: "8k-10k", label: "₹ 8001 - ₹ 10000", min: 8001, max: 10000 },
  { id: "above-10k", label: "Above ₹ 10000", min: 10001, max: Infinity },
] as const;

export const HOTEL_STAR_FILTERS = [
  { stars: 5, label: "5 Star" },
  { stars: 4, label: "4 Star" },
  { stars: 3, label: "3 Star" },
  { stars: 2, label: "2 Star" },
  { stars: 1, label: "1 Star" },
] as const;

export const HOTEL_AMENITY_FILTERS = [
  "Free WiFi",
  "Swimming Pool",
  "Restaurant",
  "Room Service",
  "Gym",
  "Spa",
] as const;

export const HOTEL_PROPERTY_TYPES = [
  "Hotel",
  "Resort",
  "Apartment",
  "Guest House",
  "Homestay",
] as const;

export type HotelSortOption = "popularity" | "price-low" | "price-high" | "rating";

export function countHotelsByStar(hotels: HotelListing[], stars: number): number {
  return hotels.filter((h) => h.stars === stars).length;
}

export function hotelListingPathSlug(citySlug: string): string {
  const s = citySlug.trim().toLowerCase();
  if (s.startsWith("hotel-in-")) return s;
  return s;
}

export function hotelHref(citySlug: string): string {
  return `/hotel/${hotelListingPathSlug(citySlug)}`;
}

export function parseHotelCitySlug(param: string): string {
  const decoded = decodeURIComponent(param).trim().toLowerCase();
  if (decoded.startsWith("hotel-in-")) {
    return decoded.slice("hotel-in-".length);
  }
  return decoded;
}

export function hotelListingKey(hotel: HotelListing): string {
  return hotel.hotelSlug ?? hotel.id;
}

export function hotelDetailHref(citySlug: string, hotelIdOrSlug: string): string {
  const city = hotelListingPathSlug(citySlug);
  return `/hotel/${city}/${encodeURIComponent(hotelIdOrSlug)}`;
}

export type HotelBookingQueryParams = {
  check_in?: string;
  check_out?: string;
  rooms?: number;
  /** Adults; retained as `guests` in existing booking URLs for compatibility. */
  guests?: number;
  children?: number;
};

export function hotelBookingHref(
  citySlug: string,
  hotelIdOrSlug: string,
  roomTypeId: string,
  ratePlanId: string,
  params?: HotelBookingQueryParams,
): string {
  const q = new URLSearchParams({
    roomType: roomTypeId,
    rate: ratePlanId,
  });
  if (params?.check_in) q.set("check_in", params.check_in);
  if (params?.check_out) q.set("check_out", params.check_out);
  if (params?.rooms != null) q.set("rooms", String(params.rooms));
  if (params?.guests != null) q.set("guests", String(params.guests));
  if (params?.children != null) q.set("children", String(params.children));
  return `${hotelDetailHref(citySlug, hotelIdOrSlug)}/book?${q.toString()}`;
}

export function hotelBookingNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const [y1, m1, d1] = checkIn.split("-").map((x) => Number.parseInt(x, 10));
  const [y2, m2, d2] = checkOut.split("-").map((x) => Number.parseInt(x, 10));
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 1;
  const start = new Date(y1, m1 - 1, d1, 12, 0, 0, 0);
  const end = new Date(y2, m2 - 1, d2, 12, 0, 0, 0);
  const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, nights);
}

/** Resolve selected room + rate from a hotel bundle (client-safe). */
export function resolveBookingSelectionFromBundle(
  bundle: {
    city: HotelCity;
    hotel: HotelListing;
    roomTypes: HotelRoomType[];
  },
  roomTypeId?: string,
  ratePlanId?: string,
): HotelBookingSelection | null {
  if (bundle.roomTypes.length === 0) return null;

  const roomType =
    bundle.roomTypes.find((r) => r.id === roomTypeId) ?? bundle.roomTypes[0]!;
  const ratePlan =
    roomType.ratePlans.find((p) => p.id === ratePlanId) ?? roomType.ratePlans[0];
  if (!ratePlan) return null;

  return {
    city: bundle.city,
    hotel: bundle.hotel,
    roomType,
    ratePlan,
  };
}

/** Slugify a city name for URL paths (client-safe). */
export function slugifyCityName(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, "-");
}

export type HotelDestinationOption = {
  slug: string;
  city: string;
  state?: string;
  country: string;
};

export const HOTEL_MAJOR_CITY_OPTIONS: HotelDestinationOption[] = [
  { slug: "shimla", city: "Shimla", country: "India" },
  { slug: "manali", city: "Manali", country: "India" },
  { slug: "dharamshala", city: "Dharamshala", country: "India" },
  { slug: "palampur", city: "Palampur", country: "India" },
  { slug: "jalandhar", city: "Jalandhar", country: "India" },
  { slug: "amritsar", city: "Amritsar", country: "India" },
  { slug: "chandigarh", city: "Chandigarh", country: "India" },
  { slug: "dehradun", city: "Dehradun", country: "India" },
  { slug: "mussoorie", city: "Mussoorie", country: "India" },
  { slug: "nainital", city: "Nainital", country: "India" },
  { slug: "udaipur", city: "Udaipur", country: "India" },
  { slug: "jaisalmer", city: "Jaisalmer", country: "India" },
  { slug: "agra", city: "Agra", country: "India" },
  { slug: "varanasi", city: "Varanasi", country: "India" },
  { slug: "rishikesh", city: "Rishikesh", country: "India" },
  { slug: "goa", city: "Goa", country: "India" },
  { slug: "delhi", city: "Delhi", country: "India" },
  { slug: "mumbai", city: "Mumbai", country: "India" },
  { slug: "bengaluru", city: "Bengaluru", country: "India" },
  { slug: "hyderabad", city: "Hyderabad", country: "India" },
  { slug: "chennai", city: "Chennai", country: "India" },
  { slug: "kolkata", city: "Kolkata", country: "India" },
  { slug: "jaipur", city: "Jaipur", country: "India" },
];

export type HotelLocalityOption = {
  slug: string;
  citySlug: string;
  city: string;
  name: string;
  state?: string;
  country: string;
  description: string;
  latitude: number;
  longitude: number;
};

export const HOTEL_LOCALITY_OPTIONS: HotelLocalityOption[] = [
  {
    slug: "mall-road-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Mall Road",
    state: "Himachal Pradesh",
    country: "India",
    description: "Central Shimla, shopping and cafes",
    latitude: 31.1049,
    longitude: 77.1739,
  },
  {
    slug: "kasumpti-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Kasumpti",
    state: "Himachal Pradesh",
    country: "India",
    description: "Near New Shimla and government offices",
    latitude: 31.0738,
    longitude: 77.1903,
  },
  {
    slug: "panthaghati-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Panthaghati",
    state: "Himachal Pradesh",
    country: "India",
    description: "Convenient for lower Shimla and bypass access",
    latitude: 31.0637,
    longitude: 77.2071,
  },
  {
    slug: "kufri-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Kufri",
    state: "Himachal Pradesh",
    country: "India",
    description: "Snow point and mountain stays near Shimla",
    latitude: 31.0981,
    longitude: 77.2679,
  },
  {
    slug: "new-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "New Shimla",
    state: "Himachal Pradesh",
    country: "India",
    description: "Quiet residential area with easy city access",
    latitude: 31.0893,
    longitude: 77.1608,
  },
  {
    slug: "lakkar-bazaar-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Lakkar Bazar",
    state: "Himachal Pradesh",
    country: "India",
    description: "Near Ridge, Mall Road and central viewpoints",
    latitude: 31.1041,
    longitude: 77.1730,
  },
  {
    slug: "the-ridge-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "The Ridge",
    state: "Himachal Pradesh",
    country: "India",
    description: "Central promenade and tourist heart of Shimla",
    latitude: 31.1036,
    longitude: 77.1728,
  },
  {
    slug: "summer-hill-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Summer Hill",
    state: "Himachal Pradesh",
    country: "India",
    description: "Quiet hillside stays and heritage campus area",
    latitude: 31.1087,
    longitude: 77.1849,
  },
  {
    slug: "chotta-shimla",
    citySlug: "shimla",
    city: "Shimla",
    name: "Chotta Shimla",
    state: "Himachal Pradesh",
    country: "India",
    description: "Residential area with easy access to the center",
    latitude: 31.0979,
    longitude: 77.1506,
  },
  {
    slug: "mall-road-manali",
    citySlug: "manali",
    city: "Manali",
    name: "Mall Road",
    state: "Himachal Pradesh",
    country: "India",
    description: "Popular market area in Manali",
    latitude: 32.2432,
    longitude: 77.1892,
  },
  {
    slug: "old-manali",
    citySlug: "manali",
    city: "Manali",
    name: "Old Manali",
    state: "Himachal Pradesh",
    country: "India",
    description: "Cafes, riverside stays and backpacker vibe",
    latitude: 32.2527,
    longitude: 77.1775,
  },
  {
    slug: "vashisht-manali",
    citySlug: "manali",
    city: "Manali",
    name: "Vashisht",
    state: "Himachal Pradesh",
    country: "India",
    description: "Hot springs, temple area and quiet stays",
    latitude: 32.2460,
    longitude: 77.1834,
  },
  {
    slug: "simsa-manali",
    citySlug: "manali",
    city: "Manali",
    name: "Simsa",
    state: "Himachal Pradesh",
    country: "India",
    description: "Short drive from town with family hotels",
    latitude: 32.2248,
    longitude: 77.1841,
  },
  {
    slug: "mcleodganj-dharamshala",
    citySlug: "dharamshala",
    city: "Dharamshala",
    name: "McLeod Ganj",
    state: "Himachal Pradesh",
    country: "India",
    description: "Tibetan market area and monastery stays",
    latitude: 32.2426,
    longitude: 76.3212,
  },
  {
    slug: "dharamshala-bus-stand",
    citySlug: "dharamshala",
    city: "Dharamshala",
    name: "Bus Stand",
    state: "Himachal Pradesh",
    country: "India",
    description: "Convenient for town access and transport",
    latitude: 32.2196,
    longitude: 76.3215,
  },
  {
    slug: "bhagsunag-dharamshala",
    citySlug: "dharamshala",
    city: "Dharamshala",
    name: "Bhagsunag",
    state: "Himachal Pradesh",
    country: "India",
    description: "Waterfall side stays with a scenic hillside feel",
    latitude: 32.2502,
    longitude: 76.3254,
  },
  {
    slug: "kotwali-bazar-dharamshala",
    citySlug: "dharamshala",
    city: "Dharamshala",
    name: "Kotwali Bazar",
    state: "Himachal Pradesh",
    country: "India",
    description: "Main market and central stay area",
    latitude: 32.2181,
    longitude: 76.3238,
  },
  {
    slug: "tapovan-dharamshala",
    citySlug: "dharamshala",
    city: "Dharamshala",
    name: "Tapovan",
    state: "Himachal Pradesh",
    country: "India",
    description: "Peaceful hillside stay area near McLeod Ganj",
    latitude: 32.2448,
    longitude: 76.3147,
  },
  {
    slug: "shimla-bypass-dharamshala",
    citySlug: "dharamshala",
    city: "Dharamshala",
    name: "Shimla Bypass",
    state: "Himachal Pradesh",
    country: "India",
    description: "Easy road access with practical stays",
    latitude: 32.2297,
    longitude: 76.3132,
  },
  {
    slug: "palampur",
    citySlug: "palampur",
    city: "Palampur",
    name: "Tea Garden Road",
    state: "Himachal Pradesh",
    country: "India",
    description: "Tea garden side stays and scenic town access",
    latitude: 32.1213,
    longitude: 76.5369,
  },
  {
    slug: "palampur-bundla",
    citySlug: "palampur",
    city: "Palampur",
    name: "Bundla",
    state: "Himachal Pradesh",
    country: "India",
    description: "Quiet stay area with access to town",
    latitude: 32.1159,
    longitude: 76.5244,
  },
  {
    slug: "palampur-sadar-bazaar",
    citySlug: "palampur",
    city: "Palampur",
    name: "Sadar Bazaar",
    state: "Himachal Pradesh",
    country: "India",
    description: "Market center and practical hotel area",
    latitude: 32.1138,
    longitude: 76.5361,
  },
  {
    slug: "jalandhar-cantt",
    citySlug: "jalandhar",
    city: "Jalandhar",
    name: "Cantt Road",
    state: "Punjab",
    country: "India",
    description: "Central cantonment side hotels and transit access",
    latitude: 31.3224,
    longitude: 75.5762,
  },
  {
    slug: "jalandhar-gurunanak-pura",
    citySlug: "jalandhar",
    city: "Jalandhar",
    name: "Guru Nanak Pura",
    state: "Punjab",
    country: "India",
    description: "Residential hotel zone with city access",
    latitude: 31.3354,
    longitude: 75.5901,
  },
  {
    slug: "jalandhar-model-town",
    citySlug: "jalandhar",
    city: "Jalandhar",
    name: "Model Town",
    state: "Punjab",
    country: "India",
    description: "Popular local stay area and cafes",
    latitude: 31.3168,
    longitude: 75.5845,
  },
  {
    slug: "amritsar-hall-bazar",
    citySlug: "amritsar",
    city: "Amritsar",
    name: "Hall Bazaar",
    state: "Punjab",
    country: "India",
    description: "Near Golden Temple and city market stays",
    latitude: 31.6249,
    longitude: 74.8765,
  },
  {
    slug: "amritsar-ranjit-avenue",
    citySlug: "amritsar",
    city: "Amritsar",
    name: "Ranjit Avenue",
    state: "Punjab",
    country: "India",
    description: "Premium residential and hotel zone",
    latitude: 31.6408,
    longitude: 74.8647,
  },
  {
    slug: "amritsar-lawrence-road",
    citySlug: "amritsar",
    city: "Amritsar",
    name: "Lawrence Road",
    state: "Punjab",
    country: "India",
    description: "Food, shopping and centrally located hotels",
    latitude: 31.6351,
    longitude: 74.8702,
  },
  {
    slug: "amritsar-katra-jaimal-singh",
    citySlug: "amritsar",
    city: "Amritsar",
    name: "Katra Jaimal Singh",
    state: "Punjab",
    country: "India",
    description: "Old city market area near the shrine route",
    latitude: 31.6236,
    longitude: 74.8773,
  },
  {
    slug: "chandigarh-sector-17",
    citySlug: "chandigarh",
    city: "Chandigarh",
    name: "Sector 17",
    state: "Chandigarh",
    country: "India",
    description: "Shopping, dining and central city access",
    latitude: 30.7415,
    longitude: 76.7687,
  },
  {
    slug: "chandigarh-sector-43",
    citySlug: "chandigarh",
    city: "Chandigarh",
    name: "Sector 43",
    state: "Chandigarh",
    country: "India",
    description: "Transport hub and practical stay location",
    latitude: 30.7144,
    longitude: 76.7654,
  },
  {
    slug: "chandigarh-sector-22",
    citySlug: "chandigarh",
    city: "Chandigarh",
    name: "Sector 22",
    state: "Chandigarh",
    country: "India",
    description: "Market area with hotels and eateries",
    latitude: 30.7354,
    longitude: 76.7779,
  },
  {
    slug: "chandigarh-sector-35",
    citySlug: "chandigarh",
    city: "Chandigarh",
    name: "Sector 35",
    state: "Chandigarh",
    country: "India",
    description: "Dining and business stay area",
    latitude: 30.7239,
    longitude: 76.7832,
  },
  {
    slug: "dehradun-rajpur-road",
    citySlug: "dehradun",
    city: "Dehradun",
    name: "Rajpur Road",
    state: "Uttarakhand",
    country: "India",
    description: "Popular hotel strip with restaurants and shopping",
    latitude: 30.3443,
    longitude: 78.0238,
  },
  {
    slug: "dehradun-clock-tower",
    citySlug: "dehradun",
    city: "Dehradun",
    name: "Clock Tower",
    state: "Uttarakhand",
    country: "India",
    description: "Central market and budget stay area",
    latitude: 30.3247,
    longitude: 78.0415,
  },
  {
    slug: "dehradun-aram-bagh",
    citySlug: "dehradun",
    city: "Dehradun",
    name: "Aram Bagh",
    state: "Uttarakhand",
    country: "India",
    description: "Convenient city-side stay location",
    latitude: 30.3188,
    longitude: 78.0393,
  },
  {
    slug: "mussoorie-library-road",
    citySlug: "mussoorie",
    city: "Mussoorie",
    name: "Library Road",
    state: "Uttarakhand",
    country: "India",
    description: "Central market area and easy hill-station access",
    latitude: 30.4583,
    longitude: 78.0771,
  },
  {
    slug: "mussoorie-mall-road",
    citySlug: "mussoorie",
    city: "Mussoorie",
    name: "Mall Road",
    state: "Uttarakhand",
    country: "India",
    description: "Classic main strip with shops and hotels",
    latitude: 30.4568,
    longitude: 78.0772,
  },
  {
    slug: "mussoorie-barlow-ganj",
    citySlug: "mussoorie",
    city: "Mussoorie",
    name: "Barlow Ganj",
    state: "Uttarakhand",
    country: "India",
    description: "Quieter hillside stay area",
    latitude: 30.4487,
    longitude: 78.0688,
  },
  {
    slug: "nainital-malital",
    citySlug: "nainital",
    city: "Nainital",
    name: "Mallital",
    state: "Uttarakhand",
    country: "India",
    description: "Lakeside stays near the main market",
    latitude: 29.3920,
    longitude: 79.4498,
  },
  {
    slug: "nainital-tallital",
    citySlug: "nainital",
    city: "Nainital",
    name: "Tallital",
    state: "Uttarakhand",
    country: "India",
    description: "Bus stand side and lake-end hotels",
    latitude: 29.3869,
    longitude: 79.4631,
  },
  {
    slug: "nainital-bara-patak",
    citySlug: "nainital",
    city: "Nainital",
    name: "Bara Patthar",
    state: "Uttarakhand",
    country: "India",
    description: "Scenic hillside stay area above the lake",
    latitude: 29.3986,
    longitude: 79.4538,
  },
  {
    slug: "udaipur-lake-pichola",
    citySlug: "udaipur",
    city: "Udaipur",
    name: "Lake Pichola",
    state: "Rajasthan",
    country: "India",
    description: "Heritage lake area and palace-view stays",
    latitude: 24.5792,
    longitude: 73.6835,
  },
  {
    slug: "udaipur-fateh-sagar",
    citySlug: "udaipur",
    city: "Udaipur",
    name: "Fateh Sagar",
    state: "Rajasthan",
    country: "India",
    description: "Popular lakeside hotel zone and cafes",
    latitude: 24.5867,
    longitude: 73.6806,
  },
  {
    slug: "udaipur-court-railway-station",
    citySlug: "udaipur",
    city: "Udaipur",
    name: "Court Railway Station Area",
    state: "Rajasthan",
    country: "India",
    description: "Practical city stay zone with transport access",
    latitude: 24.5732,
    longitude: 73.6868,
  },
  {
    slug: "udaipur-ganesh-ghar",
    citySlug: "udaipur",
    city: "Udaipur",
    name: "Ganesh Ghat",
    state: "Rajasthan",
    country: "India",
    description: "Old city side and lake-facing hotel area",
    latitude: 24.5798,
    longitude: 73.6849,
  },
  {
    slug: "jaisalmer-fort-road",
    citySlug: "jaisalmer",
    city: "Jaisalmer",
    name: "Fort Road",
    state: "Rajasthan",
    country: "India",
    description: "Old city stays near the fort and havelis",
    latitude: 26.9113,
    longitude: 70.9109,
  },
  {
    slug: "jaisalmer-gandhi-colony",
    citySlug: "jaisalmer",
    city: "Jaisalmer",
    name: "Gandhi Colony",
    state: "Rajasthan",
    country: "India",
    description: "Popular budget and mid-range stay area",
    latitude: 26.9188,
    longitude: 70.9133,
  },
  {
    slug: "jaisalmer-sam-sand-dunes",
    citySlug: "jaisalmer",
    city: "Jaisalmer",
    name: "Sam Sand Dunes",
    state: "Rajasthan",
    country: "India",
    description: "Desert resort and safari stay zone",
    latitude: 26.8681,
    longitude: 70.4533,
  },
  {
    slug: "goa-baga",
    citySlug: "goa",
    city: "Goa",
    name: "Baga",
    state: "Goa",
    country: "India",
    description: "Beachfront stays, nightlife and water sports",
    latitude: 15.5553,
    longitude: 73.7517,
  },
  {
    slug: "goa-calangute",
    citySlug: "goa",
    city: "Goa",
    name: "Calangute",
    state: "Goa",
    country: "India",
    description: "Popular beach area with resorts and family hotels",
    latitude: 15.5439,
    longitude: 73.7553,
  },
  {
    slug: "goa-panjim",
    citySlug: "goa",
    city: "Goa",
    name: "Panjim",
    state: "Goa",
    country: "India",
    description: "Capital city stays, riverfront and heritage zone",
    latitude: 15.4909,
    longitude: 73.8278,
  },
  {
    slug: "goa-candolim",
    citySlug: "goa",
    city: "Goa",
    name: "Candolim",
    state: "Goa",
    country: "India",
    description: "Upscale beachside stay area",
    latitude: 15.5161,
    longitude: 73.7707,
  },
  {
    slug: "goa-arpora",
    citySlug: "goa",
    city: "Goa",
    name: "Arpora",
    state: "Goa",
    country: "India",
    description: "Popular resort, nightlife and villa area",
    latitude: 15.5471,
    longitude: 73.7568,
  },
  {
    slug: "agra-tajganj",
    citySlug: "agra",
    city: "Agra",
    name: "Taj Ganj",
    state: "Uttar Pradesh",
    country: "India",
    description: "Best known area near the Taj Mahal",
    latitude: 27.1677,
    longitude: 78.0410,
  },
  {
    slug: "agra-fatehabad-road",
    citySlug: "agra",
    city: "Agra",
    name: "Fatehabad Road",
    state: "Uttar Pradesh",
    country: "India",
    description: "Hotel strip with easy Taj access",
    latitude: 27.1618,
    longitude: 78.0367,
  },
  {
    slug: "agra-sadar-bazar",
    citySlug: "agra",
    city: "Agra",
    name: "Sadar Bazaar",
    state: "Uttar Pradesh",
    country: "India",
    description: "Food, shopping and central hotels",
    latitude: 27.1560,
    longitude: 78.0058,
  },
  {
    slug: "varanasi-dashashwamedh",
    citySlug: "varanasi",
    city: "Varanasi",
    name: "Dashashwamedh",
    state: "Uttar Pradesh",
    country: "India",
    description: "Ghat-side stays near the river and old city",
    latitude: 25.3075,
    longitude: 83.0106,
  },
  {
    slug: "varanasi-assi-ghat",
    citySlug: "varanasi",
    city: "Varanasi",
    name: "Assi Ghat",
    state: "Uttar Pradesh",
    country: "India",
    description: "Riverfront stay area with cafes and hostels",
    latitude: 25.2776,
    longitude: 83.0046,
  },
  {
    slug: "varanasi-cantt",
    citySlug: "varanasi",
    city: "Varanasi",
    name: "Cantt",
    state: "Uttar Pradesh",
    country: "India",
    description: "Station side area with practical hotels",
    latitude: 25.3207,
    longitude: 82.9900,
  },
  {
    slug: "rishikesh-laxman-jhula",
    citySlug: "rishikesh",
    city: "Rishikesh",
    name: "Laxman Jhula",
    state: "Uttarakhand",
    country: "India",
    description: "Riverfront stays, cafes and yoga retreats",
    latitude: 30.1290,
    longitude: 78.3218,
  },
  {
    slug: "rishikesh-ram-jhula",
    citySlug: "rishikesh",
    city: "Rishikesh",
    name: "Ram Jhula",
    state: "Uttarakhand",
    country: "India",
    description: "Ashram and yoga stay zone",
    latitude: 30.1226,
    longitude: 78.3210,
  },
  {
    slug: "rishikesh-tapovan",
    citySlug: "rishikesh",
    city: "Rishikesh",
    name: "Tapovan",
    state: "Uttarakhand",
    country: "India",
    description: "Popular stay area for cafes and retreats",
    latitude: 30.1316,
    longitude: 78.3240,
  },
];

export type HotelResultsSearchParams = {
  check_in?: string;
  check_out?: string;
  rooms?: number;
  guests?: number;
  q?: string;
  last_minute?: boolean;
  sort?: HotelSortOption;
};

export function hotelResultsHref(
  citySlug: string,
  params?: HotelResultsSearchParams,
): string {
  const slug = hotelListingPathSlug(citySlug);
  const q = new URLSearchParams();
  if (params?.check_in) q.set("check_in", params.check_in);
  if (params?.check_out) q.set("check_out", params.check_out);
  if (params?.rooms != null) q.set("rooms", String(params.rooms));
  if (params?.guests != null) q.set("guests", String(params.guests));
  if (params?.q) q.set("q", params.q);
  if (params?.last_minute) q.set("last_minute", "1");
  if (params?.sort && params.sort !== "popularity") q.set("sort", params.sort);
  const qs = q.toString();
  return qs ? `/hotel/${slug}?${qs}` : `/hotel/${slug}`;
}

export function findHotelLocality(query: string): HotelLocalityOption | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  const asSlug = slugifyCityName(normalized);
  return (
    HOTEL_LOCALITY_OPTIONS.find(
      (l) =>
        l.slug === asSlug ||
        l.name.toLowerCase() === normalized ||
        `${l.name} ${l.city}`.toLowerCase() === normalized,
    ) ??
    HOTEL_LOCALITY_OPTIONS.find(
      (l) =>
        l.name.toLowerCase().includes(normalized) ||
        normalized.includes(l.name.toLowerCase()),
    ) ??
    null
  );
}

export function distanceKmBetween(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function toHotelDestinationOptions(
  destinations: Array<{
    slug: string;
    city: string;
    state?: string;
    country: string;
  }>,
): HotelDestinationOption[] {
  return destinations.map((d) => ({
    slug: d.slug,
    city: d.city,
    state: d.state,
    country: d.country,
  }));
}

/** Match typed city text to a known destination (client-safe). */
export function matchHotelDestinationFromList(
  query: string,
  destinations: HotelDestinationOption[],
): HotelDestinationOption | null {
  const trimmed = query.trim();
  if (!trimmed || destinations.length === 0) return null;

  const normalized = trimmed.toLowerCase();
  const asSlug = slugifyCityName(trimmed);

  const exact = destinations.find((d) => d.city.toLowerCase() === normalized);
  if (exact) return exact;

  const bySlug = destinations.find((d) => d.slug === asSlug);
  if (bySlug) return bySlug;

  const startsWith = destinations.find((d) => d.city.toLowerCase().startsWith(normalized));
  if (startsWith) return startsWith;

  const includes = destinations.find(
    (d) =>
      d.city.toLowerCase().includes(normalized) ||
      normalized.includes(d.city.toLowerCase()),
  );
  if (includes) return includes;

  return null;
}
