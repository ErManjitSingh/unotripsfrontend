/**
 * Tour packages — Uno Hotels backend /v1/packages/*
 */
import type { TourItineraryDay, TourPackage } from "@/lib/constants";
import { apiGetEnvelope, apiGetRaw } from "@/services/api";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80";

export type PackageListParams = {
  page?: number;
  limit?: number;
  search?: string;
  destination_id?: string;
  category_id?: string;
  tour_type?: string;
  min_price?: number;
  max_price?: number;
};

export type PaginatedPackages = {
  items: TourPackage[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type PackageCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_featured: boolean;
  package_count: number;
};

export type PackageOffer = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  discount_type: string;
  discount_value: number;
  cta_text: string | null;
  homepage_banner: boolean;
  linked_packages: Array<{ id: string; name: string; slug: string }>;
};

type ApiPackageSummary = {
  id: string;
  name: string;
  slug: string;
  tour_type: string;
  base_price: number;
  discounted_price: number | null;
  destination_name: string | null;
  destination_city: string | null;
  state: string | null;
  country: string;
  duration_label: string;
  featured_image: string | null;
  booking_count: number;
  is_featured: boolean;
};

type ApiPackageDetail = ApiPackageSummary & {
  short_description: string | null;
  description: string | null;
  duration_days: number;
  duration_nights: number;
  review_count: number;
  avg_rating: number;
  gallery_images: string[];
  itinerary_days?: Array<{
    day_number?: number;
    title?: string | null;
    description?: string | null;
    activities?: string[] | null;
  }>;
};

type ApiPaginatedRaw = {
  items: ApiPackageSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

function parseDuration(label: string, fallbackDays = 0, fallbackNights = 0) {
  const daysMatch = label.match(/(\d+)\s*[Dd]ays?/);
  const nightsMatch = label.match(/(\d+)\s*[Nn]ights?/);
  return {
    durationDays: daysMatch ? Number.parseInt(daysMatch[1], 10) : fallbackDays,
    durationNights: nightsMatch ? Number.parseInt(nightsMatch[1], 10) : fallbackNights,
  };
}

function resolveImage(url: string | null | undefined): string {
  const u = (url ?? "").trim();
  if (!u) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(u)) return u;
  return PLACEHOLDER_IMAGE;
}

function mapItinerary(raw: ApiPackageDetail["itinerary_days"]): TourItineraryDay[] | undefined {
  if (!raw?.length) return undefined;
  return raw
    .map((day, i) => {
      const title = (day.title ?? "").trim() || `Day ${day.day_number ?? i + 1}`;
      const body = (day.description ?? "").trim();
      const acts = (day.activities ?? []).filter(Boolean).join(" · ");
      const combined = acts ? (body ? `${body}\n\n${acts}` : acts) : body;
      if (!combined) return null;
      return { day: day.day_number ?? i + 1, title, body: combined };
    })
    .filter((d): d is TourItineraryDay => d !== null);
}

export function mapApiPackageSummary(row: ApiPackageSummary): TourPackage {
  const price = Math.round(row.discounted_price ?? row.base_price ?? 0);
  const oldPrice =
    row.discounted_price != null && row.discounted_price < row.base_price
      ? Math.round(row.base_price)
      : undefined;
  const discountPct =
    oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;
  const { durationDays, durationNights } = parseDuration(row.duration_label);
  const location = [row.destination_name, row.destination_city, row.state, row.country]
    .filter(Boolean)
    .join(", ");

  return {
    id: row.id,
    slug: row.slug,
    title: row.name,
    image: resolveImage(row.featured_image),
    durationDays,
    durationNights,
    rating: 0,
    reviewCount: row.booking_count ?? 0,
    priceINR: price,
    oldPriceINR: oldPrice,
    discountPct,
    packageType: row.tour_type || "Holiday package",
    location: location || undefined,
    showMemberPrice: true,
  };
}

export function mapApiPackageDetail(row: ApiPackageDetail): TourPackage {
  const base = mapApiPackageSummary(row);
  return {
    ...base,
    durationDays: row.duration_days || base.durationDays,
    durationNights: row.duration_nights ?? base.durationNights,
    rating: row.avg_rating > 0 ? row.avg_rating : base.rating,
    reviewCount: row.review_count ?? base.reviewCount,
    description: (row.short_description ?? row.description ?? "").trim() || undefined,
    itinerary: mapItinerary(row.itinerary_days),
    image: resolveImage(row.featured_image ?? row.gallery_images?.[0]),
  };
}

function buildQuery(params: PackageListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.destination_id) q.set("destination_id", params.destination_id);
  if (params.category_id) q.set("category_id", params.category_id);
  if (params.tour_type) q.set("tour_type", params.tour_type);
  if (params.min_price != null) q.set("min_price", String(params.min_price));
  if (params.max_price != null) q.set("max_price", String(params.max_price));
  return q.toString();
}

export async function listPackages(params: PackageListParams = {}): Promise<PaginatedPackages> {
  const qs = buildQuery({ page: 1, limit: 12, ...params });
  const raw = await apiGetRaw<ApiPaginatedRaw>(`/v1/packages?${qs}`);
  if (!raw?.items) {
    return { items: [], total: 0, page: params.page ?? 1, limit: params.limit ?? 12, total_pages: 0 };
  }
  return {
    items: raw.items.map(mapApiPackageSummary),
    total: raw.total,
    page: raw.page,
    limit: raw.limit,
    total_pages: raw.total_pages,
  };
}

export async function getAllPackages(): Promise<TourPackage[]> {
  const first = await listPackages({ page: 1, limit: 50 });
  const all = [...first.items];
  for (let page = 2; page <= first.total_pages; page++) {
    const next = await listPackages({ page, limit: 50 });
    all.push(...next.items);
  }
  return all;
}

export async function getPackageBySlug(slug: string): Promise<TourPackage | null> {
  const raw = await apiGetRaw<ApiPackageDetail>(`/v1/packages/${encodeURIComponent(slug)}`);
  if (!raw?.id) return null;
  return mapApiPackageDetail(raw);
}

export async function fetchFeaturedPackages(limit = 12): Promise<TourPackage[]> {
  const raw = await apiGetRaw<ApiPaginatedRaw>("/v1/packages?page=1&limit=50");
  if (!raw?.items?.length) return [];
  return raw.items.filter((p) => p.is_featured).map(mapApiPackageSummary).slice(0, limit);
}

export async function getPackageCategories(): Promise<PackageCategory[]> {
  return (await apiGetRaw<PackageCategory[]>("/v1/packages/categories")) ?? [];
}

export async function getFeaturedCategories(): Promise<PackageCategory[]> {
  return (await apiGetRaw<PackageCategory[]>("/v1/packages/categories/featured")) ?? [];
}

export async function getActiveOffers(): Promise<PackageOffer[]> {
  return (await apiGetRaw<PackageOffer[]>("/v1/packages/offers/active")) ?? [];
}

export async function searchPackages(query: string, page = 1, limit = 12): Promise<PaginatedPackages> {
  return listPackages({ search: query, page, limit });
}

export async function getRelatedPackages(tour: TourPackage, limit = 8): Promise<TourPackage[]> {
  const term = tour.location?.split(",")[0]?.trim();
  const raw = term ? await listPackages({ page: 1, limit: 50, search: term }) : await listPackages({ page: 1, limit: 50 });
  const id = tour.slug ?? tour.id;
  return raw.items.filter((p) => (p.slug ?? p.id) !== id).slice(0, limit);
}