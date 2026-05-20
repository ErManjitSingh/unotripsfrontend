/**
 * Uno Hotels API — https://unohotels-backend.onrender.com/docs
 * All hotel data comes from the API only (no mock catalog).
 */

import {
  formatHotelCardLocation,
  type HotelBookingSelection,
  type HotelCity,
  type HotelListing,
  type HotelRoomRatePlan,
  type HotelRoomType,
} from "@/lib/hotels-catalog";

import { apiJson } from "@/lib/api";

export type ApiEnvelope<T> = {
  data: T;
  message?: string | null;
  request_id: string;
};

export type ApiHotel = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  star_category: number;
  thumbnail_url: string;
  images: string[];
  starting_price: number;
  currency: string;
  amenities: string[];
  tags: string[];
  description: string;
  is_featured: boolean;
  is_verified: boolean;
  collection_type: string | null;
};

export type ApiRoomType = {
  id: string;
  hotel_id: string;
  name: string;
  description: string;
  max_occupancy: number;
  bed_type: string;
  size_sqft: number;
  amenities: string[];
  images: string[];
  price_per_night: number;
  original_price: number | null;
  available: boolean;
  available_count: number;
};

export type ApiHotelPolicies = {
  check_in_time: string;
  check_out_time: string;
  cancellation: string;
  children: string;
  pets: string;
  smoking: string;
  extra_bed: string;
};

export type ApiReview = {
  id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  stay_date: string;
  room_type: string | null;
  helpful_count: number;
};

export type ApiHotelDetail = ApiHotel & {
  rooms: ApiRoomType[];
  policies: ApiHotelPolicies;
  reviews: ApiReview[];
  nearby_attractions: string[];
  check_in_time: string;
  check_out_time: string;
};

export type ApiHotelSearchResponse = {
  hotels: ApiHotel[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type ApiDestination = {
  city: string;
  state: string;
  country: string;
  hotel_count: number;
  image_url: string;
  slug: string;
  starting_price: number;
};

export type ApiHotelSlug = {
  city: string;
  slug: string;
  updated_at: string;
};

export type HotelSearchParams = {
  city?: string;
  check_in?: string;
  check_out?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  min_price?: number;
  max_price?: number;
  rating?: number;
  star_category?: number;
  amenities?: string[];
  sort?: string;
  page?: number;
  limit?: number;
};

export type HotelDetailBundle = {
  city: HotelCity;
  hotel: HotelListing;
  roomTypes: HotelRoomType[];
  policies: string[];
  reviews: ApiReview[];
  nearbyAttractions: string[];
  similarHotels: HotelListing[];
};

function ratingLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4) return "Very Good";
  if (score >= 3.5) return "Good";
  if (score >= 3) return "Average";
  if (score > 0) return "Fair";
  return "New";
}

export function citySlugFromName(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, "-");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const result = await apiJson<T>(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) return null;
  return result.data;
}

export function mapApiHotelToListing(h: ApiHotel): HotelListing {
  const citySlug = citySlugFromName(h.city);
  const price = Math.round(h.starting_price);
  const original = Math.round(price * 1.15);
  const images =
    h.images?.length > 0 ? h.images : h.thumbnail_url ? [h.thumbnail_url] : [];

  const tagLower = h.tags.map((t) => t.toLowerCase());

  return {
    id: h.id,
    hotelSlug: h.slug,
    citySlug,
    name: h.name,
    stars: h.star_category,
    area: h.address.split(",")[0]?.trim() || h.city,
    locationLine: formatHotelCardLocation(h.city, h.state),
    tags: h.tags,
    amenities: h.amenities.map((a) => a.toLowerCase()),
    amenityMoreCount: Math.max(0, h.amenities.length - 4),
    highlights: h.is_featured ? ["Featured stay"] : h.is_verified ? ["Verified property"] : [],
    description: h.description,
    rating: h.rating > 0 ? h.rating : 0,
    ratingLabel: ratingLabel(h.rating),
    reviewCount: h.review_count,
    originalPrice: original,
    price,
    taxes: Math.round(price * 0.12),
    images,
    dealOfDay: h.is_featured,
    bookWithZero: false,
    freeCancellation: /free cancellation/i.test(h.description + (h.tags?.join(" ") ?? "")),
    freeBreakfast: tagLower.some((t) => t.includes("breakfast")),
    freeParking: h.amenities.some((a) => /parking/i.test(a)),
    coupleFriendly: tagLower.some((t) => t.includes("couple")),
    localIdsAccepted: tagLower.some((t) => t.includes("local id")),
    propertyPhotoCount: images.length,
    roomPhotoCount: images.length,
    videoCount: 0,
    nearbyLandmark: h.city,
    defaultRoomType: "Room",
    roomOptionsCount: 0,
    latitude: h.latitude,
    longitude: h.longitude,
    address: h.address,
    state: h.state,
    country: h.country,
  };
}

export function mapApiRoomsToHotelRoomTypes(
  hotel: HotelListing,
  rooms: ApiRoomType[],
): HotelRoomType[] {
  return rooms
    .filter((r) => r.available)
    .map((room) => {
      const image = room.images[0] ?? hotel.images[0] ?? "";
      const price = Math.round(room.price_per_night);
      const original = Math.round(room.original_price ?? price + Math.max(400, price * 0.2));
      const taxes = Math.round(price * 0.12);

      const ratePlan: HotelRoomRatePlan = {
        id: `${room.id}-room-only`,
        packageName: "Room Only",
        benefits: [...room.amenities.slice(0, 6), "Free WiFi"],
        originalPrice: original,
        price,
        taxes,
        discountAmount: Math.max(0, original - price),
        nonRefundable: false,
        couponCode: "UNOHOTELS",
      };

      return {
        id: room.id,
        name: room.name,
        image,
        tags: [
          room.bed_type ? `${room.bed_type} bed` : "Bed",
          `${room.size_sqft} Sq Ft`,
          `${room.max_occupancy} Guests`,
        ],
        ratePlans: [ratePlan],
      };
    });
}

export function mapApiPoliciesToBullets(policies: ApiHotelPolicies): string[] {
  return [
    `Check-in from ${policies.check_in_time}, check-out by ${policies.check_out_time}.`,
    policies.cancellation,
    policies.children,
    policies.pets,
    policies.smoking,
    policies.extra_bed,
  ].filter(Boolean);
}

async function resolveApiCityName(cityInput: string): Promise<string> {
  const normalized = citySlugFromName(cityInput);
  const slugs = await fetchHotelSlugs();
  const match = slugs.find(
    (s) =>
      citySlugFromName(s.city) === normalized ||
      s.city.toLowerCase() === normalized ||
      s.slug === normalized,
  );
  if (match) return match.city;

  const dests = await fetchPopularDestinations();
  const dest = dests.find((d) => d.slug === normalized || citySlugFromName(d.city) === normalized);
  if (dest) return dest.city;

  return cityInput.replace(/-/g, " ");
}

export async function searchHotels(
  params: HotelSearchParams,
): Promise<{ hotels: HotelListing[]; total: number }> {
  const q = new URLSearchParams();
  if (params.city) {
    const apiCity = await resolveApiCityName(params.city);
    q.set("city", apiCity);
  }
  if (params.check_in) q.set("check_in", params.check_in);
  if (params.check_out) q.set("check_out", params.check_out);
  if (params.adults != null) q.set("adults", String(params.adults));
  if (params.children != null) q.set("children", String(params.children));
  if (params.rooms != null) q.set("rooms", String(params.rooms));
  if (params.min_price != null) q.set("min_price", String(params.min_price));
  if (params.max_price != null) q.set("max_price", String(params.max_price));
  if (params.rating != null) q.set("rating", String(params.rating));
  if (params.star_category != null) q.set("star_category", String(params.star_category));
  if (params.sort) q.set("sort", params.sort);
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 24));

  const raw = await apiFetch<ApiHotelSearchResponse>(
    `/v1/hotels/search?${q.toString()}`,
  );

  if (!raw?.hotels) {
    return { hotels: [], total: 0 };
  }

  return {
    hotels: raw.hotels.map(mapApiHotelToListing),
    total: raw.total,
  };
}

export async function fetchFeaturedHotels(): Promise<HotelListing[]> {
  const raw = await apiFetch<ApiHotel[]>("/v1/hotels/featured");
  if (raw?.length) return raw.map(mapApiHotelToListing);
  return [];
}

export async function fetchPopularDestinations(): Promise<ApiDestination[]> {
  const raw = await apiFetch<ApiDestination[]>("/v1/destinations/popular");
  return raw ?? [];
}

export async function fetchDestinationBySlug(slug: string): Promise<ApiDestination | null> {
  const raw = await apiFetch<ApiDestination>(
    `/v1/destinations/${encodeURIComponent(slug)}`,
  );
  return raw ?? null;
}

export async function fetchHotelSlugs(): Promise<ApiHotelSlug[]> {
  const raw = await apiFetch<ApiHotelSlug[]>("/v1/hotels/slugs");
  return raw ?? [];
}

export async function fetchHotelDetail(
  city: string,
  hotelSlug: string,
  checkIn?: string,
  checkOut?: string,
): Promise<ApiHotelDetail | null> {
  const q = new URLSearchParams();
  if (checkIn) q.set("check_in", checkIn);
  if (checkOut) q.set("check_out", checkOut);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const raw = await apiFetch<ApiHotelDetail>(
    `/v1/hotels/${encodeURIComponent(city)}/${encodeURIComponent(hotelSlug)}${qs}`,
  );
  return raw ?? null;
}

export async function fetchRelatedHotels(
  hotelId: string,
  limit = 4,
): Promise<HotelListing[]> {
  const raw = await apiFetch<ApiHotel[]>(
    `/v1/hotels/related?hotel_id=${encodeURIComponent(hotelId)}&limit=${limit}`,
  );
  if (raw?.length) return raw.map(mapApiHotelToListing);
  return [];
}

export async function resolveHotelCity(citySlug: string): Promise<HotelCity | null> {
  const normalized = citySlug.trim().toLowerCase();

  const dest =
    (await fetchDestinationBySlug(normalized)) ??
    (await fetchPopularDestinations()).find(
      (d) => d.slug === normalized || citySlugFromName(d.city) === normalized,
    ) ??
    null;

  if (dest) {
    return {
      slug: dest.slug || normalized,
      name: dest.city,
      fullLocation: `${dest.city}, ${dest.state}, ${dest.country}`,
    };
  }

  const slugs = await fetchHotelSlugs();
  const fromHotel = slugs.find((s) => citySlugFromName(s.city) === normalized);
  if (fromHotel) {
    return {
      slug: normalized,
      name: fromHotel.city,
      fullLocation: `${fromHotel.city}, India`,
    };
  }

  return null;
}

export async function getHotelListingCitySlugs(): Promise<string[]> {
  const slugs = await fetchHotelSlugs();
  const fromHotels = [...new Set(slugs.map((s) => citySlugFromName(s.city)))];
  const dests = await fetchPopularDestinations();
  const fromDests = dests.map((d) => d.slug || citySlugFromName(d.city));
  return [...new Set([...fromHotels, ...fromDests])];
}

export async function cityHasHotels(citySlug: string): Promise<boolean> {
  const cities = await getHotelListingCitySlugs();
  return cities.includes(citySlugFromName(citySlug));
}

export async function getHotelDetailBundle(
  cityParam: string,
  hotelSlugOrId: string,
): Promise<HotelDetailBundle | null> {
  const hotelKey = decodeURIComponent(hotelSlugOrId);
  const slugs = await fetchHotelSlugs();

  const match = slugs.find((s) => s.slug === hotelKey);
  if (!match) return null;

  const detail = await fetchHotelDetail(match.city, match.slug);
  if (!detail) return null;

  const hotel = mapApiHotelToListing(detail);
  const city = await resolveHotelCity(citySlugFromName(detail.city));
  if (!city) return null;

  const roomTypes = mapApiRoomsToHotelRoomTypes(hotel, detail.rooms);
  const policies = mapApiPoliciesToBullets(detail.policies);
  const similarHotels = await fetchRelatedHotels(detail.id, 4);

  return {
    city,
    hotel: {
      ...hotel,
      roomOptionsCount: roomTypes.length,
      defaultRoomType: roomTypes[0]?.name ?? hotel.defaultRoomType,
    },
    roomTypes,
    policies,
    reviews: detail.reviews ?? [],
    nearbyAttractions: detail.nearby_attractions ?? [],
    similarHotels,
  };
}

export async function resolveHotelBookingSelection(
  cityParam: string,
  hotelSlugOrId: string,
  roomTypeId: string,
  ratePlanId: string,
): Promise<HotelBookingSelection | undefined> {
  const bundle = await getHotelDetailBundle(cityParam, hotelSlugOrId);
  if (!bundle) return undefined;

  const roomType = bundle.roomTypes.find((r) => r.id === roomTypeId);
  if (!roomType) return undefined;

  const ratePlan = roomType.ratePlans.find((p) => p.id === ratePlanId);
  if (!ratePlan) return undefined;

  return {
    city: bundle.city,
    hotel: bundle.hotel,
    roomType,
    ratePlan,
  };
}

export function mapApiReviewsForUi(reviews: ApiReview[]) {
  return reviews.map((r) => ({
    id: r.id,
    author: r.user_name,
    rating: r.rating,
    title: r.title,
    body: r.comment,
    date: r.stay_date || r.created_at,
    helpfulCount: r.helpful_count,
    roomType: r.room_type,
  }));
}

export type HotelDestinationListing = {
  slug: string;
  city: string;
  state: string;
  country: string;
  hotelCount: number;
  imageUrl: string;
  startingPrice: number;
};

const DEFAULT_DESTINATION_IMAGE = "/images/hotels/hero-banner.webp";

/** All bookable hotel destinations — popular API + cities from hotel slugs. */
export async function fetchHotelDestinations(): Promise<HotelDestinationListing[]> {
  const [popular, slugList] = await Promise.all([
    fetchPopularDestinations(),
    fetchHotelSlugs(),
  ]);

  const map = new Map<string, HotelDestinationListing>();

  for (const d of popular) {
    const slug = (d.slug || citySlugFromName(d.city)).toLowerCase();
    map.set(slug, {
      slug,
      city: d.city,
      state: d.state,
      country: d.country,
      hotelCount: d.hotel_count,
      imageUrl: d.image_url || DEFAULT_DESTINATION_IMAGE,
      startingPrice: d.starting_price,
    });
  }

  const countByCity = new Map<string, { city: string; count: number }>();
  for (const s of slugList) {
    const slug = citySlugFromName(s.city);
    const cur = countByCity.get(slug);
    if (cur) cur.count += 1;
    else countByCity.set(slug, { city: s.city, count: 1 });
  }

  for (const [slug, { city, count }] of countByCity) {
    const existing = map.get(slug);
    if (!existing) {
      map.set(slug, {
        slug,
        city,
        state: "",
        country: "India",
        hotelCount: count,
        imageUrl: DEFAULT_DESTINATION_IMAGE,
        startingPrice: 0,
      });
    } else {
      existing.hotelCount = Math.max(existing.hotelCount, count);
    }
  }

  const destinations = Array.from(map.values());

  const enriched = await Promise.all(
    destinations.map(async (dest) => {
      const needsSearch =
        dest.imageUrl === DEFAULT_DESTINATION_IMAGE ||
        dest.startingPrice <= 0 ||
        dest.hotelCount === 0;

      if (!needsSearch) return dest;

      const { hotels, total } = await searchHotels({
        city: dest.slug,
        limit: 1,
        sort: "popular",
      });

      if (hotels.length === 0) return dest;

      const first = hotels[0]!;
      return {
        ...dest,
        hotelCount: Math.max(dest.hotelCount, total),
        startingPrice: dest.startingPrice > 0 ? dest.startingPrice : first.price,
        imageUrl:
          dest.imageUrl === DEFAULT_DESTINATION_IMAGE
            ? first.images[0] ?? DEFAULT_DESTINATION_IMAGE
            : dest.imageUrl,
      };
    }),
  );

  return enriched.sort((a, b) => a.city.localeCompare(b.city));
}

export async function resolveHotelCitySlugFromSearch(cityName: string): Promise<string | null> {
  const normalized = cityName.trim().toLowerCase();
  if (!normalized) return null;

  const dests = await fetchPopularDestinations();
  const dest = dests.find(
    (d) =>
      d.city.toLowerCase() === normalized ||
      d.slug === citySlugFromName(normalized) ||
      citySlugFromName(d.city) === normalized,
  );
  if (dest) return dest.slug || citySlugFromName(dest.city);

  const slugs = await fetchHotelSlugs();
  const fromSlug = slugs.find((s) => citySlugFromName(s.city) === citySlugFromName(normalized));
  if (fromSlug) return citySlugFromName(fromSlug.city);

  return citySlugFromName(normalized);
}
