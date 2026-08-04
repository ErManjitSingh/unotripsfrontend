/**
 * src/lib/activities-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Types + fetch helpers for Activities.
 * Backend endpoint ALREADY EXISTS: GET /v1/packages/activities
 * Proxied via: /api/packages/activities  (reuses existing packages proxy)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types (matches PackageActivityOut from backend schema) ───────────────────

export type Activity = {
  id:                string;
  name:              string;
  slug:              string;
  short_description: string | null;
  full_description?: string | null;
  featured_image:    string | null;
  gallery_images:    string[];
  category:          string | null;
  destination_name:  string | null;
  location:          string | null;
  tags:              string[];
  duration:          string | null;
  difficulty_level:  string;   // "easy" | "moderate" | "hard"
  age_limit:         string | null;
  best_time:         string | null;
  starting_price:    number | null;
  max_price:         number | null;
  price_type:        string;   // "per_person" | "per_group"
  included?:         string | null;
  excluded?:         string | null;
  is_featured:       boolean;
  package_count:     number;
};

export type ActivitiesResponse = {
  items:       Activity[];
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
};

// ─── Category filter options ──────────────────────────────────────────────────

export const ACTIVITY_CATEGORIES = [
  { value: "",              label: "All Activities" },
  { value: "adventure",     label: "Adventure"      },
  { value: "trekking",      label: "Trekking"       },
  { value: "water_sports",  label: "Water Sports"   },
  { value: "wildlife",      label: "Wildlife"       },
  { value: "cultural",      label: "Cultural"       },
  { value: "pilgrimage",    label: "Pilgrimage"     },
  { value: "camping",       label: "Camping"        },
  { value: "paragliding",   label: "Paragliding"    },
  { value: "snow_sports",   label: "Snow Sports"    },
];

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  hard:     "bg-red-100 text-red-700",
};

// ─── Popular destinations for search ─────────────────────────────────────────

export const POPULAR_ACTIVITY_DESTINATIONS = [
  "Manali", "Rishikesh", "Goa", "Jaipur", "Leh", "Coorg",
  "Shimla", "Mussoorie", "Nainital", "Spiti Valley",
];

// ─── Fetch functions ──────────────────────────────────────────────────────────

export type FetchActivitiesParams = {
  page?:       number;
  limit?:      number;
  category?:   string;
  destination?: string;
  difficulty?: string;
  search?:     string;
  minPrice?:   number;
  maxPrice?:   number;
  featured?:   boolean;
};

export async function fetchActivities(params: FetchActivitiesParams = {}): Promise<ActivitiesResponse> {
  const qs = new URLSearchParams();
  if (params.page)        qs.set("page",        String(params.page));
  if (params.limit)       qs.set("limit",       String(params.limit));
  if (params.category)    qs.set("category",    params.category);
  if (params.destination) qs.set("destination", params.destination);
  if (params.difficulty)  qs.set("difficulty",  params.difficulty);
  if (params.search)      qs.set("search",      params.search);
  if (params.minPrice !== undefined) qs.set("min_price", String(params.minPrice));
  if (params.maxPrice !== undefined) qs.set("max_price", String(params.maxPrice));
  if (params.featured)    qs.set("featured",    "true");

  const res = await fetch(`/api/packages/activities?${qs}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Activities API error ${res.status}`);
  }

  const data = await res.json();
  // Backend may return paginated wrapper or raw array
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, limit: data.length, total_pages: 1 };
  }
  return data as ActivitiesResponse;
}

// Server-side fetch (for RSC / page.tsx)
export async function fetchActivitiesServer(params: FetchActivitiesParams = {}): Promise<ActivitiesResponse> {
  const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";
  const qs = new URLSearchParams();
  if (params.page)        qs.set("page",        String(params.page));
  if (params.limit)       qs.set("limit",       String(params.limit));
  if (params.category)    qs.set("category",    params.category);
  if (params.destination) qs.set("destination", params.destination);
  if (params.difficulty)  qs.set("difficulty",  params.difficulty);
  if (params.search)      qs.set("search",      params.search);
  if (params.minPrice !== undefined) qs.set("min_price", String(params.minPrice));
  if (params.maxPrice !== undefined) qs.set("max_price", String(params.maxPrice));
  if (params.featured)    qs.set("featured",    "true");

  try {
    const res = await fetch(`${BACKEND}/v1/packages/activities?${qs}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { items: [], total: 0, page: 1, limit: 12, total_pages: 0 };
    const data = await res.json();
    if (Array.isArray(data)) return { items: data, total: data.length, page: 1, limit: data.length, total_pages: 1 };
    return data as ActivitiesResponse;
  } catch {
    return { items: [], total: 0, page: 1, limit: 12, total_pages: 0 };
  }
}
