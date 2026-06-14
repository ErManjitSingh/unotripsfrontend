/**
 * lib/cabs-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Types + fetch helpers for the public Cab V2 API.
 * Mirrors the same pattern as hotels-api.ts / hotels-catalog.ts.
 *
 * Backend endpoints (proxied via /api/cabs/[...path]):
 *   GET  /v1/cabs/search   → search available cabs
 *   POST /v1/cabs/fare     → fare breakdown for a selected cab
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Trip type ────────────────────────────────────────────────────────────────

export type CabTripType = "one_way" | "round_trip" | "full_day";

export const CAB_TRIP_TYPES: { value: CabTripType; label: string }[] = [
  { value: "one_way",    label: "One Way"     },
  { value: "round_trip", label: "Round Trip"  },
  { value: "full_day",   label: "Full Day"    },
];

// ─── Search params ────────────────────────────────────────────────────────────

export type CabSearchParams = {
  pickup_city:  string;
  drop_city:    string;
  drop_state:   string;
  trip_type:    CabTripType;
  travel_date:  string;          // YYYY-MM-DD
  return_date?: string;          // YYYY-MM-DD — required for round_trip
  passengers:   number;
};

// ─── Search result item (returned by /v1/cabs/search) ────────────────────────

export type CabSearchResult = {
  cab_type_id:        string;
  slug:               string;
  name:               string;
  cab_category:       string;
  seating_capacity:   number;
  luggage_capacity:   number;
  is_ac:              boolean;
  features:           string[];
  featured_image:     string | null;
  total_fare:         number;
  fare_breakdown:     CabFareBreakdown | null;
};

export type CabFareBreakdown = {
  actual_km:           number;
  billed_km:           number;
  zone:                string;
  season:              string;
  per_km_net:          number;
  per_km_selling:      number;
  trip_fare:           number;
  driver_allowance:    number;
  night_charge:        number;
  gst_amount:          number;
  gst_rate:            number;
  total_amount:        number;
};

// ─── Popular routes (static — for the search field suggestions) ───────────────

export type CabRoute = {
  from:  string;
  to:    string;
  state: string;     // drop_state value expected by API
};

/**
 * Curated popular cab routes — shown as trending suggestions in the
 * From / To autocomplete dropdowns (same UX as hotel location field).
 * Add/remove as needed; these are purely frontend hints.
 */
export const POPULAR_CAB_ROUTES: CabRoute[] = [
  { from: "Jaipur",   to: "Delhi",   state: "Delhi"         },
  { from: "Jaipur",   to: "Agra",    state: "Uttar Pradesh" },
  { from: "Mumbai",   to: "Pune",    state: "Maharashtra"   },
  { from: "Delhi",    to: "Agra",    state: "Uttar Pradesh" },
  { from: "Delhi",    to: "Shimla",  state: "Himachal Pradesh" },
  { from: "Jaipur",   to: "Udaipur", state: "Rajasthan"     },
  { from: "Mumbai",   to: "Goa",     state: "Goa"           },
  { from: "Bangalore","to": "Mysore", state: "Karnataka"    },
];

/** Unique pickup cities from popular routes. */
export const POPULAR_PICKUP_CITIES = [
  ...new Set(POPULAR_CAB_ROUTES.map((r) => r.from)),
];

/** Unique drop cities. */
export const POPULAR_DROP_CITIES = [
  ...new Set(POPULAR_CAB_ROUTES.map((r) => r.to)),
];

// ─── Date helpers (mirrors hotels-search-fields pattern) ─────────────────────

/** Returns "YYYY-MM-DD" for a given Date (local, no UTC shift). */
export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Formats "YYYY-MM-DD" → "15 Jun'26 · Mon" display string. */
export function formatCabDate(iso: string): { main: string; sub: string } {
  if (!iso) return { main: "—", sub: "" };
  const d = new Date(iso + "T12:00:00");
  const main = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
  const sub  = d.toLocaleDateString("en-IN", { weekday: "long" });
  return { main, sub };
}

/** Returns "YYYY-MM-DD" N days after the given iso string. */
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return localDateStr(d);
}

// ─── API fetch ────────────────────────────────────────────────────────────────

/**
 * Search cabs — calls the Next.js proxy at /api/cabs/search
 * which forwards to backend /v1/cabs/search.
 */
export async function searchCabs(params: CabSearchParams): Promise<CabSearchResult[]> {
  const qs = new URLSearchParams({
    pickup_city:  params.pickup_city,
    drop_city:    params.drop_city,
    drop_state:   params.drop_state,
    trip_type:    params.trip_type,
    travel_date:  params.travel_date,
    passengers:   String(params.passengers),
  });
  if (params.return_date) qs.set("return_date", params.return_date);

  const res = await fetch(`/api/cabs/search?${qs.toString()}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Cabs API error ${res.status}`);
  }

  const data = await res.json();
  // API returns an array directly (same as backend router)
  return Array.isArray(data) ? data : (data.results ?? []);
}