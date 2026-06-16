/** Hotel listing / inner-page hero banner */
export const HOTEL_INNER_BANNER_IMAGE =
  "https://www.maritim.com/fileadmin/_processed_/0/1/csm_Bpa_363_Superior_500a005b62.jpg";

export type HotelCity = {
  slug: string;
  name: string;
  /** Full line in search bar — EaseMyTrip style */
  fullLocation: string;
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
  guests?: number;
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