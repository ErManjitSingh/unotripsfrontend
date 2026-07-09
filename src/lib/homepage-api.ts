/**
 * Homepage slim API — /v1/homepage/hotels and /v1/homepage/packages
 * Returns only card-level fields. No 80-90 image arrays, no full descriptions.
 */
import { apiJson } from "@/lib/api";
import { formatHotelCardLocation, type HotelListing } from "@/lib/hotels-catalog";
import { citySlugFromName } from "@/lib/hotels-api";
import type { TourPackage } from "@/lib/constants";

// ── Backend response types ────────────────────────────────────────────────────

export type HomepageHotelCard = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  star_category: number;
  rating: number;
  review_count: number;
  thumbnail_url: string;
  starting_price: number;
  currency: string;
  is_featured: boolean;
  is_verified: boolean;
  collection_type: string | null;
  amenities: string[];
  tags: string[];
};

export type HomepagePackageCard = {
  id: string;
  slug: string;
  name: string;
  tour_type: string;
  destination_name: string | null;
  destination_city: string | null;
  state: string | null;
  country: string;
  duration_label: string;
  duration_days: number;
  duration_nights: number;
  base_price: number;
  discounted_price: number | null;
  currency: string;
  price_per: string;
  featured_image: string | null;
  is_featured: boolean;
  is_customizable: boolean;
  booking_count: number;
  avg_rating: number;
  review_count: number;
};

// ── Mapping helpers ───────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE = "/images/packages/placeholder.webp";

function ratingLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4)   return "Very Good";
  if (score >= 3.5) return "Good";
  if (score >= 3)   return "Average";
  if (score > 0)    return "Fair";
  return "New";
}

function roomTaxes(price: number): number {
  if (price <= 7500) return Math.round(price * 0.12);
  return Math.round(price * 0.18);
}

export function mapHomepageHotelCard(h: HomepageHotelCard): HotelListing {
  const citySlug = citySlugFromName(h.city);
  const price    = Math.round(h.starting_price);
  const original = Math.round(price * 1.15);
  const tagLower = h.tags.map((t) => t.toLowerCase());
  const images   = h.thumbnail_url ? [h.thumbnail_url] : [];

  return {
    id:           h.id,
    hotelSlug:    h.slug,
    citySlug,
    name:         h.name,
    stars:        h.star_category,
    area:         h.city,
    locationLine: formatHotelCardLocation(h.city, h.state),
    tags:         h.tags,
    amenities:    h.amenities.map((a) => a.toLowerCase()),
    amenityMoreCount: Math.max(0, h.amenities.length - 4),
    highlights:   h.is_featured
      ? ["Featured stay"]
      : h.is_verified
      ? ["Verified property"]
      : [],
    description:      "",
    rating:           h.rating > 0 ? h.rating : 0,
    ratingLabel:      ratingLabel(h.rating),
    reviewCount:      h.review_count,
    originalPrice:    original,
    price,
    taxes:            roomTaxes(price),
    images,
    dealOfDay:        h.is_featured,
    bookWithZero:     false,
    freeCancellation: tagLower.some((t) => t.includes("free cancellation")),
    freeBreakfast:    tagLower.some((t) => t.includes("breakfast")),
    freeParking:      h.amenities.some((a) => /parking/i.test(a)),
    coupleFriendly:   tagLower.some((t) => t.includes("couple")),
    localIdsAccepted: tagLower.some((t) => t.includes("local id")),
    propertyPhotoCount: images.length,
    roomPhotoCount:     0,
    videoCount:         0,
    nearbyLandmark:     h.city,
    defaultRoomType:    "Room",
    roomOptionsCount:   0,
    state:   h.state,
    country: "",
    address: "",
  };
}

function resolveImage(url: string | null | undefined): string {
  const u = (url ?? "").trim();
  if (u && /^https?:\/\//i.test(u)) return u;
  return PLACEHOLDER_IMAGE;
}

export function mapHomepagePackageCard(p: HomepagePackageCard): TourPackage {
  const price    = Math.round(p.discounted_price ?? p.base_price ?? 0);
  const oldPrice =
    p.discounted_price != null && p.discounted_price < p.base_price
      ? Math.round(p.base_price)
      : undefined;
  const discountPct =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : undefined;
  const location = [p.destination_name, p.destination_city, p.state, p.country]
    .filter(Boolean)
    .join(", ");

  return {
    id:             p.id,
    packageId:      p.id,
    slug:           p.slug,
    title:          p.name,
    image:          resolveImage(p.featured_image),
    durationDays:   p.duration_days,
    durationNights: p.duration_nights,
    rating:         p.avg_rating ?? 0,
    reviewCount:    p.review_count || p.booking_count || 0,
    priceINR:       price,
    oldPriceINR:    oldPrice,
    discountPct,
    packageType:    p.tour_type || "Holiday package",
    location:       location || undefined,
    showMemberPrice: true,
    isCustomizable: p.is_customizable ?? false,
  };
}

// ── API fetch functions ───────────────────────────────────────────────────────
// apiJson already unwraps the { data: ..., request_id: ... } envelope,
// so result.data IS the inner payload — do NOT wrap type in ApiEnvelope<>.

export async function fetchHomepageHotels(
  limit = 4,
): Promise<{ hotels: HotelListing[]; total: number }> {
  const result = await apiJson<HomepageHotelCard[]>(
    `/v1/homepage/hotels?limit=${limit}`,
    {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 900 },
    },
  );
  if (!result.ok || !result.data?.length) return { hotels: [], total: 0 };
  return { hotels: result.data.map(mapHomepageHotelCard), total: result.data.length };
}

export async function fetchHomepagePackages(limit = 4): Promise<TourPackage[]> {
  const result = await apiJson<HomepagePackageCard[]>(
    `/v1/homepage/packages?limit=${limit}`,
    {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 900 },
    },
  );
  if (!result.ok || !result.data?.length) return [];
  return result.data.map(mapHomepagePackageCard);
}
