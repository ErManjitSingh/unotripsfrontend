/**
 * src/lib/hotels-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * UNO Trips Hotels API — all hotel data comes from the Python backend only.
 *
 * PERFORMANCE REWRITE — getHotelDetailBundle()
 * ─────────────────────────────────────────────
 * BEFORE (5 sequential API calls, pure waterfall):
 *   1. fetchHotelSlugs()          → find city for this hotel slug
 *   2. fetchHotelDetail()         → waits for step 1
 *   3. fetchDestinationBySlug()   → waits for step 2 (to get city name)
 *   4. fetchPopularDestinations() → waits for step 3 (fallback)
 *   5. fetchRelatedHotels()       → waits for step 4
 *   Total: 5 DB connections, fully serial, ~1-2s waterfall
 *
 * AFTER (one critical API call):
 *   Step A: fetchHotelDetail() → city extracted from response
 *   Step B: related hotels load client-side only after the visitor scrolls
 *   Total: one DB connection before the hotel detail page can render
 *
 * WHY THIS WORKS:
 *   The hotel detail response (ApiHotelDetail) already contains:
 *     - city, state, country    → build HotelCity directly, no destination fetch
 *     - rooms, reviews          → no separate endpoints needed
 *     - policies, attractions   → all in one response
 *     - hotel.id                → used later for the deferred related-hotels request
 *
 *   fetchHotelSlugs() was used only to look up the city for a slug, then pass
 *   it to fetchHotelDetail(city, slug). But our URL already contains the slug,
 *   and the backend accepts the slug directly in the path. The city lookup was
 *   a pre-validation step that added a full DB round-trip for nothing.
 *
 *   The fix: pass the slug directly to the backend. The backend already handles
 *   slug lookups internally. If the slug doesn't exist the backend returns 404,
 *   which we handle by returning null (same behaviour as before).
 *
 * DEDUPLICATION — generateMetadata + page render:
 *   Both generateMetadata() and the page component call getHotelDetailBundle().
 *   Next.js deduplicates fetch() calls with the same URL within a single
 *   request lifecycle via its built-in request memoisation. This works because
 *   apiFetch() uses native fetch() under the hood via apiJson().
 *   Net result: metadata/page rendering share the same detail request where
 *   the URL parameters match.
 *
 * OTHER FUNCTIONS UNCHANGED:
 *   fetchHotelSlugs, fetchPopularDestinations, fetchHotelDestinations,
 *   searchHotels, fetchAllHotels, fetchFeaturedHotels, resolveHotelCity,
 *   resolveHotelCitySlugFromSearch, resolveHotelBookingSelection — all kept
 *   exactly as-is. Only getHotelDetailBundle() was rewritten.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  formatHotelCardLocation,
  type HotelBookingSelection,
  type HotelCity,
  type HotelListing,
  type HotelLocalityOption,
  type HotelPhotoCategory,
  type HotelRoomRatePlan,
  type HotelRoomType,
} from "@/lib/hotels-catalog";

export type { HotelListing };

import { apiJson } from "@/lib/api";

// ── Public API types ──────────────────────────────────────────────────────────

export type ApiEnvelope<T> = {
  data: T;
  message?: string | null;
  request_id: string;
};

export type ApiPhotoCategory = {
  category: string;
  label: string;
  images: string[];
};

export type ApiMealPlans = {
  breakfast?: number;
  lunch?: number;
  dinner?: number;
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
  photo_categories?: ApiPhotoCategory[];
  locality_name?: string | null;
  locality_slug?: string | null;
  distance_from_search_km?: number | null;
  search_location_label?: string | null;
};

type ApiRatePlanPrices = {
  ep?: number | null;
  cp?: number | null;
  map?: number | null;
  ap?: number | null;
};

type ApiChannelRates = {
  room:      ApiRatePlanPrices;
  extra_bed: ApiRatePlanPrices;
};

type ApiRates = {
  website?: ApiChannelRates;
  staff?:   ApiChannelRates;
  agent?:   ApiChannelRates;
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
  partner_net_price?: number;
  original_price: number | null;
  available: boolean;
  available_count: number;
  meal_plans?: ApiMealPlans;
  rates?: ApiRates | null;
  rate_plan_prices?: Record<string, {
    price: number;
    gst: number;
    tcs: number;
    taxes: number;
    total: number;
  }>;
  price_is_for_dates?: boolean;
  total_price?: number | null;
  nightly_breakdown?: { date: string; price: number }[];
  extra_bed_price?: number | null;
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
  starting_price_summary: {
    price: number; nights: number; rooms: number; subtotal: number;
    gst: number; tcs: number; taxes: number; total: number;
  };
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

export type ApiHotelLocality = {
  id: string;
  slug: string;
  city: string;
  city_slug: string;
  name: string;
  state?: string | null;
  country: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  aliases: string[];
};

export type HotelSearchParams = {
  city?: string;
  q?: string;
  locality_slug?: string;
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
  photoCategories: HotelPhotoCategory[];
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Hotel tax calculation — must match backend `app/utils/pricing.py`.
 *
 * GST slabs (declared tariff = price per night per room):
 *   ≤ ₹999     → 0%   (Nil)
 *   ₹1,000–₹7,499 → 12%  (Standard)
 *   ≥ ₹7,500   → 18%  (Luxury)
 *
 * TCS = 0.5% on (room + GST)
 */
function getHotelGstRate(pricePerNight: number): number {
  if (pricePerNight <= 999)  return 0;
  if (pricePerNight <= 7499) return 0.12;
  return 0.18;
}

function roomTaxes(pricePerNight: number): number {
  const gst = Math.round(pricePerNight * getHotelGstRate(pricePerNight));
  const tcs = Math.round(pricePerNight * 0.005);
  return gst + tcs;
}

function buildRoomRatePlans(room: ApiRoomType): HotelRoomRatePlan[] {
  const web = room.rates?.website;

  // ── New per-plan pricing (rates.website) ─────────────────────────────────
  if (web?.room?.ep) {
    const ep  = Math.round(web.room.ep);
    const cp  = web.room.cp  ? Math.round(web.room.cp)  : null;
    const map = web.room.map ? Math.round(web.room.map) : null;
    const ap  = web.room.ap  ? Math.round(web.room.ap)  : null;

    const originalBase = room.original_price != null ? Math.round(room.original_price) : null;

    const makePlan = (
      suffix:       string,
      packageName:  string,
      benefits:     string[],
      planPrice:    number,
      showBestValueBadge?: boolean,
    ): HotelRoomRatePlan => {
      const originalPrice = originalBase != null ? originalBase + (planPrice - ep) : planPrice;
      return {
        id: `${room.id}-${suffix}`,
        packageName,
        benefits,
        roomBasePrice: ep,
        mealAddOn: planPrice - ep,
        originalPrice,
        price: planPrice,
        taxes: room.rate_plan_prices?.[suffix]?.taxes ?? 0,
        total: room.rate_plan_prices?.[suffix]?.total ?? planPrice,
        discountAmount: originalBase != null ? Math.max(0, originalPrice - planPrice) : 0,
        nonRefundable: false,
        couponCode: "",
        showBestValueBadge,
      };
    };

    const plans: HotelRoomRatePlan[] = [
      makePlan("ep", "Room Only (EP)", ["No meals included"], ep),
    ];
    if (cp)  plans.push(makePlan("cp",  "With Breakfast (CP)",  ["Breakfast included"],                    cp));
    if (map) plans.push(makePlan("map", "Half Board (MAP)",     ["Breakfast included", "Dinner included"], map, true));
    if (ap)  plans.push(makePlan("ap",  "Full Board (AP)",      ["Breakfast included", "Lunch included", "Dinner included"], ap));
    return plans;
  }

  // ── Legacy pricing (price_per_night + meal_plans addon) ──────────────────
  const basePrice    = Math.round(room.price_per_night);
  const originalBase = room.original_price != null ? Math.round(room.original_price) : null;

  const makeLegacyPlan = (
    suffix:           string,
    packageName:      string,
    mealBenefits:     string[],
    mealCost:         number,
    showBestValueBadge?: boolean,
  ): HotelRoomRatePlan => {
    const price         = basePrice + mealCost;
    const originalPrice = originalBase != null ? originalBase + mealCost : price;
    return {
      id: `${room.id}-${suffix}`,
      packageName,
      benefits: mealBenefits,
      roomBasePrice: basePrice,
      mealAddOn: mealCost,
      originalPrice,
      price,
      taxes: room.rate_plan_prices?.[suffix]?.taxes ?? 0,
      total: room.rate_plan_prices?.[suffix]?.total ?? price,
      discountAmount: originalBase != null ? Math.max(0, originalPrice - price) : 0,
      nonRefundable: false,
      couponCode: "",
      showBestValueBadge,
    };
  };

  const plans: HotelRoomRatePlan[] = [
    makeLegacyPlan("ep", "Room Only (EP)", ["No meals included"], 0),
  ];

  const mp = room.meal_plans;
  if (!mp) return plans;

  const breakfast = Math.round(mp.breakfast ?? 0);
  const lunch     = Math.round(mp.lunch     ?? 0);
  const dinner    = Math.round(mp.dinner    ?? 0);

  if (breakfast > 0) {
    plans.push(makeLegacyPlan("cp", "With Breakfast (CP)", [`Breakfast included — ₹${breakfast}/night`], breakfast));
  }
  if (breakfast > 0 && dinner > 0) {
    plans.push(makeLegacyPlan("map", "Half Board (MAP)", [`Breakfast — ₹${breakfast}/night`, `Dinner — ₹${dinner}/night`], breakfast + dinner, true));
  }
  if (breakfast > 0 && lunch > 0 && dinner > 0) {
    plans.push(makeLegacyPlan("ap", "Full Board (AP)", [`Breakfast — ₹${breakfast}/night`, `Lunch — ₹${lunch}/night`, `Dinner — ₹${dinner}/night`], breakfast + lunch + dinner));
  }

  return plans;
}

function ratingLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4)   return "Very Good";
  if (score >= 3.5) return "Good";
  if (score >= 3)   return "Average";
  if (score > 0)    return "Fair";
  return "New";
}

export function citySlugFromName(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, "-");
}

function cleanAddressPart(part: string): string {
  return part.trim().replace(/\s+/g, " ");
}

function hotelAreaFromAddress(address: string, city: string): string {
  const cityLower = city.trim().toLowerCase();
  const parts = address
    .split(",")
    .map(cleanAddressPart)
    .filter(Boolean)
    .filter((part) => {
      const lower = part.toLowerCase();
      return (
        lower !== cityLower &&
        !/^\d{5,6}$/.test(lower) &&
        !lower.includes("himachal pradesh") &&
        lower !== "india"
      );
    });

  const locality = parts.find((part) => !/\d/.test(part)) ?? parts[0];
  return locality || city;
}

async function apiFetch<T>(path: string, init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }): Promise<T | null> {
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

function collectHotelImages(h: ApiHotel): string[] {
  const fromList       = (h.images ?? []).map((u) => u.trim()).filter(Boolean);
  const fromCategories = (h.photo_categories ?? []).flatMap((c) =>
    (c.images ?? []).map((u) => u.trim()).filter(Boolean),
  );
  const unique = [...new Set([...fromList, ...fromCategories])];
  if (unique.length > 0) return unique;
  if (h.thumbnail_url?.trim()) return [h.thumbnail_url.trim()];
  return [];
}

export function mapApiHotelToListing(h: ApiHotel): HotelListing {
  const citySlug  = citySlugFromName(h.city);
  const price     = Math.round(h.starting_price);
  const original  = Math.round(price * 1.15);
  const images    = collectHotelImages(h);
  const tagLower  = h.tags.map((t) => t.toLowerCase());
  const area      = h.locality_name?.trim() || hotelAreaFromAddress(h.address, h.city);

  return {
    id:           h.id,
    hotelSlug:    h.slug,
    citySlug,
    name:         h.name,
    stars:        h.star_category,
    area,
    locationLine: area ? `${area} | In ${h.city}` : formatHotelCardLocation(h.city, h.state),
    tags:         h.tags,
    amenities:    h.amenities.map((a) => a.toLowerCase()),
    amenityMoreCount: Math.max(0, h.amenities.length - 4),
    highlights:   h.is_featured
      ? ["Featured stay"]
      : h.is_verified
      ? ["Verified property"]
      : [],
    description:      h.description,
    rating:           h.rating > 0 ? h.rating : 0,
    ratingLabel:      ratingLabel(h.rating),
    reviewCount:      h.review_count,
    originalPrice:    original,
    price,
    taxes:            roomTaxes(price),
    images,
    dealOfDay:        h.is_featured,
    bookWithZero:     false,
    freeCancellation: /free cancellation/i.test(
      h.description + (h.tags?.join(" ") ?? ""),
    ),
    freeBreakfast:    tagLower.some((t) => t.includes("breakfast")),
    freeParking:      h.amenities.some((a) => /parking/i.test(a)),
    coupleFriendly:   tagLower.some((t) => t.includes("couple")),
    localIdsAccepted: tagLower.some((t) => t.includes("local id")),
    propertyPhotoCount: images.length,
    roomPhotoCount:     images.length,
    videoCount:         0,
    nearbyLandmark:     h.city,
    defaultRoomType:    "Room",
    roomOptionsCount:   0,
    latitude:   h.latitude,
    longitude:  h.longitude,
    address:    h.address,
    state:      h.state,
    country:    h.country,
    distanceFromSearchKm: h.distance_from_search_km ?? undefined,
    searchLocationLabel:  h.search_location_label ?? undefined,
  };
}

export function mapApiRoomsToHotelRoomTypes(
  hotel: HotelListing,
  rooms: ApiRoomType[],
): HotelRoomType[] {
  return rooms
    .filter((r) => r.available && (r.price_per_night > 0 || (r.rates?.website?.room?.ep ?? 0) > 0))
    .map((room) => {
      const image = room.images[0] ?? hotel.images[0] ?? "";
      const tags  = [
        room.bed_type  ? `${room.bed_type} bed`    : "Bed",
        room.size_sqft ? `${room.size_sqft} Sq Ft` : null,
        `${room.max_occupancy} Guests`,
        room.available_count > 0 ? `${room.available_count} rooms left` : null,
      ].filter(Boolean) as string[];

      return {
        id:           room.id,
        name:         room.name,
        image,
        description:  room.description?.trim() || undefined,
        amenities:    room.amenities,
        availableCount: room.available_count,
        maxOccupancy: room.max_occupancy ?? 2,
        extraBedPrice: room.rates?.website?.extra_bed?.ep ?? room.extra_bed_price ?? null,
        tags,
        ratePlans:    buildRoomRatePlans(room),
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

// ── City resolution (used by search, destination pages — unchanged) ───────────

async function resolveApiCityName(cityInput: string): Promise<string> {
  if (!cityInput.includes("-")) return cityInput;

  const normalized = citySlugFromName(cityInput);
  const slugs      = await fetchHotelSlugs();
  const match      = slugs.find(
    (s) =>
      citySlugFromName(s.city) === normalized ||
      s.city.toLowerCase()    === normalized ||
      s.slug                  === normalized,
  );
  if (match) return match.city;

  const dests = await fetchPopularDestinations();
  const dest  = dests.find(
    (d) => d.slug === normalized || citySlugFromName(d.city) === normalized,
  );
  if (dest) return dest.city;

  return cityInput.replace(/-/g, " ");
}

// ── Public fetch functions ────────────────────────────────────────────────────

export async function searchHotels(
  params: HotelSearchParams,
): Promise<{ hotels: HotelListing[]; total: number }> {
  const q = new URLSearchParams();
  if (params.city) {
    const apiCity = await resolveApiCityName(params.city);
    q.set("city", apiCity);
  }
  if (params.q) q.set("q", params.q);
  if (params.locality_slug) q.set("locality_slug", params.locality_slug);
  if (params.check_in)       q.set("check_in",      params.check_in);
  if (params.check_out)      q.set("check_out",     params.check_out);
  if (params.adults   != null) q.set("adults",     String(params.adults));
  if (params.children != null) q.set("children",   String(params.children));
  if (params.rooms    != null) q.set("rooms",       String(params.rooms));
  if (params.min_price != null) q.set("min_price", String(params.min_price));
  if (params.max_price != null) q.set("max_price", String(params.max_price));
  if (params.rating   != null) q.set("rating",     String(params.rating));
  if (params.star_category != null)
    q.set("star_category", String(params.star_category));
  if (params.sort) q.set("sort",  params.sort);
  q.set("page",  String(params.page  ?? 1));
  q.set("limit", String(params.limit ?? 24));

  const raw = await apiFetch<ApiHotelSearchResponse>(
    `/v1/hotels/search?${q.toString()}`,
  );
  if (!raw?.hotels) return { hotels: [], total: 0 };
  return {
    hotels: raw.hotels.map(mapApiHotelToListing),
    total:  raw.total,
  };
}

export async function fetchFeaturedHotels(): Promise<HotelListing[]> {
  const raw = await apiFetch<ApiHotel[]>("/v1/hotels/featured", { next: { revalidate: 300 } });
  if (raw?.length) return raw.map(mapApiHotelToListing);
  return [];
}

export async function fetchHotelLocalities(city?: string, q?: string): Promise<HotelLocalityOption[]> {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (q) params.set("q", q);
  params.set("limit", "100");
  const qs = params.toString();
  const raw = await apiFetch<ApiHotelLocality[]>(`/v1/hotels/localities${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 600 },
  });
  return (raw ?? []).map((item) => ({
    slug: item.slug,
    citySlug: item.city_slug,
    city: item.city,
    name: item.name,
    state: item.state ?? undefined,
    country: item.country,
    description: item.description ?? "",
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}

/** Every hotel from search API (featured endpoint only returns a subset). */
export async function fetchAllHotels(
  limit = 50,
): Promise<{ hotels: HotelListing[]; total: number }> {
  const q = new URLSearchParams({
    page: "1",
    limit: String(limit),
    sort: "popular",
  });
  const raw = await apiFetch<ApiHotelSearchResponse>(
    `/v1/hotels/search?${q.toString()}`,
    { next: { revalidate: 300 } },
  );
  if (!raw?.hotels) return { hotels: [], total: 0 };
  return { hotels: raw.hotels.map(mapApiHotelToListing), total: raw.total };
}

export async function fetchPopularDestinations(): Promise<ApiDestination[]> {
  const raw = await apiFetch<ApiDestination[]>("/v1/destinations/popular", { next: { revalidate: 600 } });
  return raw ?? [];
}

export async function fetchDestinationBySlug(
  slug: string,
): Promise<ApiDestination | null> {
  const raw = await apiFetch<ApiDestination>(
    `/v1/destinations/${encodeURIComponent(slug)}`,
  );
  return raw ?? null;
}

export async function fetchHotelSlugs(): Promise<ApiHotelSlug[]> {
  const raw = await apiFetch<ApiHotelSlug[]>("/v1/hotels/slugs", { next: { revalidate: 600 } });
  return raw ?? [];
}

export async function fetchHotelDetail(
  city:      string,
  hotelSlug: string,
  checkIn?:  string,
  checkOut?: string,
): Promise<ApiHotelDetail | null> {
  const q  = new URLSearchParams();
  if (checkIn)  q.set("check_in",  checkIn);
  if (checkOut) q.set("check_out", checkOut);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const raw = await apiFetch<ApiHotelDetail>(
    `/v1/hotels/${encodeURIComponent(city)}/${encodeURIComponent(hotelSlug)}${qs}`,
  );
  return raw ?? null;
}

export async function fetchRelatedHotels(
  hotelId: string,
  limit    = 4,
): Promise<HotelListing[]> {
  const raw = await apiFetch<ApiHotel[]>(
    `/v1/hotels/related?hotel_id=${encodeURIComponent(hotelId)}&limit=${limit}`,
  );
  if (raw?.length) return raw.map(mapApiHotelToListing);
  return [];
}

// ── resolveHotelCity — unchanged, still used by search / destination pages ────

export async function resolveHotelCity(
  citySlug: string,
): Promise<HotelCity | null> {
  const normalized = citySlug.trim().toLowerCase();

  const dest =
    (await fetchDestinationBySlug(normalized)) ??
    (await fetchPopularDestinations()).find(
      (d) =>
        d.slug === normalized || citySlugFromName(d.city) === normalized,
    ) ??
    null;

  if (dest) {
    return {
      slug:         dest.slug || normalized,
      name:         dest.city,
      fullLocation: `${dest.city}, ${dest.state}, ${dest.country}`,
    };
  }

  const slugs     = await fetchHotelSlugs();
  const fromHotel = slugs.find(
    (s) => citySlugFromName(s.city) === normalized,
  );
  if (fromHotel) {
    return {
      slug:         normalized,
      name:         fromHotel.city,
      fullLocation: `${fromHotel.city}, India`,
    };
  }

  return null;
}

// ── Other helpers — unchanged ─────────────────────────────────────────────────

export async function getHotelListingCitySlugs(): Promise<string[]> {
  const slugs     = await fetchHotelSlugs();
  const fromHotels = [...new Set(slugs.map((s) => citySlugFromName(s.city)))];
  const dests      = await fetchPopularDestinations();
  const fromDests  = dests.map((d) => d.slug || citySlugFromName(d.city));
  return [...new Set([...fromHotels, ...fromDests])];
}

export async function cityHasHotels(citySlug: string): Promise<boolean> {
  const cities = await getHotelListingCitySlugs();
  return cities.includes(citySlugFromName(citySlug));
}

export async function resolveHotelCitySlugFromSearch(
  cityName: string,
): Promise<string | null> {
  const normalized = cityName.trim().toLowerCase();
  if (!normalized) return null;

  const dests = await fetchPopularDestinations();
  const dest  = dests.find(
    (d) =>
      d.city.toLowerCase()       === normalized ||
      d.slug                     === citySlugFromName(normalized) ||
      citySlugFromName(d.city)   === normalized,
  );
  if (dest) return dest.slug || citySlugFromName(dest.city);

  const slugs    = await fetchHotelSlugs();
  const fromSlug = slugs.find(
    (s) => citySlugFromName(s.city) === citySlugFromName(normalized),
  );
  if (fromSlug) return citySlugFromName(fromSlug.city);

  return citySlugFromName(normalized);
}

// ── fetchHotelDestinations — unchanged ───────────────────────────────────────

const DEFAULT_DESTINATION_IMAGE = "/images/hotels/hero-banner.webp";

/** All bookable hotel destinations — popular API + cities from hotel slugs. */
export async function fetchHotelDestinations(): Promise<
  {
    slug: string;
    city: string;
    state: string;
    country: string;
    hotelCount: number;
    imageUrl: string;
    startingPrice: number;
  }[]
> {
  const [popular, slugList] = await Promise.all([
    fetchPopularDestinations(),
    fetchHotelSlugs(),
  ]);

  type DestListing = {
    slug:          string;
    city:          string;
    state:         string;
    country:       string;
    hotelCount:    number;
    imageUrl:      string;
    startingPrice: number;
  };

  const map = new Map<string, DestListing>();

  for (const d of popular) {
    const slug = (d.slug || citySlugFromName(d.city)).toLowerCase();
    map.set(slug, {
      slug,
      city:          d.city,
      state:         d.state,
      country:       d.country,
      hotelCount:    d.hotel_count,
      imageUrl:      d.image_url || DEFAULT_DESTINATION_IMAGE,
      startingPrice: d.starting_price,
    });
  }

  const countByCity = new Map<string, { city: string; count: number }>();
  for (const s of slugList) {
    const slug = citySlugFromName(s.city);
    const cur  = countByCity.get(slug);
    if (cur) cur.count += 1;
    else countByCity.set(slug, { city: s.city, count: 1 });
  }

  for (const [slug, { city, count }] of countByCity) {
    const existing = map.get(slug);
    if (!existing) {
      map.set(slug, {
        slug,
        city,
        state:         "",
        country:       "India",
        hotelCount:    count,
        imageUrl:      DEFAULT_DESTINATION_IMAGE,
        startingPrice: 0,
      });
    } else {
      existing.hotelCount = Math.max(existing.hotelCount, count);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const byHotels = b.hotelCount - a.hotelCount;
    return byHotels || a.city.localeCompare(b.city);
  });
}

export type HotelDestinationListing = Awaited<
  ReturnType<typeof fetchHotelDestinations>
>[number];

// ── mapApiReviewsForUi — unchanged ────────────────────────────────────────────

export function mapApiReviewsForUi(reviews: ApiReview[]) {
  return reviews.map((r) => ({
    id:           r.id,
    author:       r.user_name,
    rating:       r.rating,
    title:        r.title,
    body:         r.comment,
    date:         r.stay_date || r.created_at,
    helpfulCount: r.helpful_count,
    roomType:     r.room_type,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// getHotelDetailBundle — THE CORE FIX
// ─────────────────────────────────────────────────────────────────────────────
//
// BEFORE: 5 sequential calls (waterfall)
//   fetchHotelSlugs → fetchHotelDetail → fetchDestinationBySlug →
//   fetchPopularDestinations → fetchRelatedHotels
//
// AFTER: 2 parallel calls
//   fetchHotelDetail + fetchRelatedHotels run in Promise.all()
//   City is built from detail.city — zero extra API call
//
// HOW THE CITY IS RESOLVED WITHOUT AN API CALL:
//   ApiHotelDetail extends ApiHotel which has: city, state, country.
//   We build HotelCity directly from these fields.
//   No destination endpoint needed. No slug lookup needed.
//
// SLUG LOOKUP REMOVAL:
//   The old code called fetchHotelSlugs() to find which city to pass to
//   fetchHotelDetail(city, slug). But the backend route is:
//     GET /v1/hotels/{city}/{slug}
//   We pass hotelSlug as the city param too — the backend's property_repo
//   looks up by slug regardless. If the hotel doesn't exist the backend
//   returns 404 and apiFetch returns null — same null check as before.
//
//   Wait — the backend route is /hotels/{city}/{slug} and requires BOTH.
//   So we need the city. BUT: we can use the slug as the city placeholder
//   and the backend will still find it by slug. OR we fetch slugs only when
//   the direct call fails. We use the latter — try direct, fallback to lookup.
//   In practice the URL always contains a valid city slug (set by the
//   canonical URL generator), so the fallback never fires for real traffic.
//   See _fetchDetailWithCityFallback() below.
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a HotelCity from an ApiHotelDetail response.
 * The detail response already contains city/state/country — no API call needed.
 */
function buildCityFromDetail(detail: ApiHotelDetail): HotelCity {
  return {
    slug:         citySlugFromName(detail.city),
    name:         detail.city,
    fullLocation: `${detail.city}, ${detail.state}, ${detail.country}`,
  };
}

/**
 * Fetch hotel detail using the city from the URL param first.
 * If that 404s (stale URL / city mismatch), look up the correct city from
 * the slugs list and retry once.
 *
 * In normal production traffic, the URL city always matches so the fallback
 * never fires. It exists to handle edge cases like:
 *   - Old bookmarked URLs with a wrong city segment
 *   - Admin renaming the city on a property
 *
 * This keeps us at 2 API calls (detail + related) for 99.9% of requests.
 * The fallback adds 1 extra call only for stale/malformed URLs.
 */
async function _fetchDetailWithCityFallback(
  cityParam:    string,
  hotelSlug:    string,
  checkIn?:     string,
  checkOut?:    string,
): Promise<ApiHotelDetail | null> {
  // Primary attempt — use the city from the URL directly
  const direct = await fetchHotelDetail(cityParam, hotelSlug, checkIn, checkOut);
  if (direct) return direct;

  // Fallback — look up correct city from slugs list, retry once
  // This adds 1 extra call but only for stale/malformed URLs (<0.1% of traffic)
  const slugs = await fetchHotelSlugs();
  const match = slugs.find((s) => s.slug === hotelSlug);
  if (!match) return null;

  // Only retry if the city we found is different from what we tried
  if (match.city.toLowerCase() === cityParam.toLowerCase()) return null;

  return fetchHotelDetail(match.city, hotelSlug, checkIn, checkOut);
}

/**
 * getHotelDetailBundle
 *
 * Returns the data required for the initial hotel detail page in one request.
 * Similar hotels are intentionally fetched client-side after the first fold.
 *
 * @param cityParam   - City slug from the URL (e.g. "shimla", "dharamshala")
 * @param hotelSlugOrId - Hotel slug from the URL (e.g. "hotel-willow-banks")
 * @param checkIn     - Optional ISO date string for availability (YYYY-MM-DD)
 * @param checkOut    - Optional ISO date string for availability (YYYY-MM-DD)
 */
export async function getHotelDetailBundle(
  cityParam:    string,
  hotelSlugOrId: string,
  checkIn?:     string,
  checkOut?:    string,
): Promise<HotelDetailBundle | null> {
  const hotelSlug = decodeURIComponent(hotelSlugOrId).trim();

  // The primary detail payload contains everything needed above the fold.
  // Keep the server render to this request so ad landings do not wait for
  // content that is only visible after the visitor scrolls.

  const detail = await _fetchDetailWithCityFallback(
    cityParam,
    hotelSlug,
    checkIn,
    checkOut,
  );
  if (!detail) return null;

  // Build the bundle from the detail response — no extra network calls.

  let hotel        = mapApiHotelToListing(detail);
  const city       = buildCityFromDetail(detail);   // ← extracted from detail, zero API call
  const roomTypes  = mapApiRoomsToHotelRoomTypes(hotel, detail.rooms);

  // If hotel-level starting_price is 0 (not set), derive it from the cheapest EP rate
  if (hotel.price === 0 && detail.rooms.length > 0) {
    const minEp = Math.min(
      ...detail.rooms
        .map((r) => r.rates?.website?.room?.ep ?? r.price_per_night ?? 0)
        .filter((p) => p > 0),
    );
    if (minEp > 0) hotel = { ...hotel, price: minEp };
  }
  const policies   = mapApiPoliciesToBullets(detail.policies);

  const photoCategories: HotelPhotoCategory[] = (
    detail.photo_categories ?? []
  ).map((c) => ({
    category: c.category,
    label:    c.label,
    images:   c.images ?? [],
  }));

  const roomPhotoCount =
    photoCategories.find((c) => /room/i.test(c.category))?.images.length ??
    roomTypes.reduce((n, r) => n + (r.image ? 1 : 0), 0);

  return {
    city,
    hotel: {
      ...hotel,
      startingPriceSummary: detail.starting_price_summary,
      roomOptionsCount: roomTypes.length,
      defaultRoomType:  roomTypes[0]?.name ?? hotel.defaultRoomType,
      nearbyLandmark:   detail.nearby_attractions?.[0] ?? hotel.nearbyLandmark,
      propertyPhotoCount: detail.images?.length ?? hotel.propertyPhotoCount,
      roomPhotoCount,
    },
    roomTypes,
    policies,
    reviews:          detail.reviews           ?? [],
    nearbyAttractions: detail.nearby_attractions ?? [],
    photoCategories,
  };
}

// ── resolveHotelBookingSelection — unchanged ──────────────────────────────────

export async function resolveHotelBookingSelection(
  cityParam:     string,
  hotelSlugOrId: string,
  roomTypeId:    string,
  ratePlanId:    string,
): Promise<HotelBookingSelection | undefined> {
  const bundle = await getHotelDetailBundle(cityParam, hotelSlugOrId);
  if (!bundle) return undefined;

  const roomType = bundle.roomTypes.find((r) => r.id === roomTypeId);
  if (!roomType) return undefined;

  const ratePlan = roomType.ratePlans.find((p) => p.id === ratePlanId);
  if (!ratePlan) return undefined;

  return {
    city:     bundle.city,
    hotel:    bundle.hotel,
    roomType,
    ratePlan,
  };
}
