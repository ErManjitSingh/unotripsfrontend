/**
 * lib/bus-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Types + fetch helpers for Bus search.
 * Same pattern as cabs-api.ts.
 * Backend endpoint (when built): /v1/bus/search
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Search params ────────────────────────────────────────────────────────────

export type BusSearchParams = {
  from_city:   string;
  to_city:     string;
  travel_date: string;   // YYYY-MM-DD
};

// ─── Result (shape your backend will return) ──────────────────────────────────

export type BusResult = {
  id:            string;
  operator:      string;
  bus_type:      string;    // "Volvo AC Sleeper", "Non-AC Seater", etc.
  departure:     string;    // "06:00"
  arrival:       string;    // "14:30"
  duration:      string;    // "8h 30m"
  total_seats:   number;
  available_seats: number;
  fare:          number;
  rating:        number | null;
  amenities:     string[];  // ["WiFi", "Charging", "Blanket"]
  boarding_points: string[];
  dropping_points: string[];
};

// ─── Popular routes ───────────────────────────────────────────────────────────

export type BusRoute = {
  from:  string;
  to:    string;
  state: string;
};

export const POPULAR_BUS_ROUTES: BusRoute[] = [
  { from: "Delhi",     to: "Jaipur",    state: "Rajasthan"        },
  { from: "Delhi",     to: "Agra",      state: "Uttar Pradesh"    },
  { from: "Delhi",     to: "Manali",    state: "Himachal Pradesh" },
  { from: "Delhi",     to: "Shimla",    state: "Himachal Pradesh" },
  { from: "Mumbai",    to: "Pune",      state: "Maharashtra"      },
  { from: "Mumbai",    to: "Goa",       state: "Goa"              },
  { from: "Bangalore", to: "Chennai",   state: "Tamil Nadu"       },
  { from: "Bangalore", to: "Mysore",    state: "Karnataka"        },
  { from: "Jaipur",    to: "Delhi",     state: "Delhi"            },
  { from: "Hyderabad", to: "Bangalore", state: "Karnataka"        },
];

export const POPULAR_FROM_CITIES = [...new Set(POPULAR_BUS_ROUTES.map((r) => r.from))];
export const POPULAR_TO_CITIES   = [...new Set(POPULAR_BUS_ROUTES.map((r) => r.to))];

// ─── Date helpers (shared pattern) ───────────────────────────────────────────

export function localDateStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const [y, mo, d] = iso.split("-").map(Number);
  const dt = new Date(y, mo - 1, d, 12);
  dt.setDate(dt.getDate() + n);
  return localDateStr(dt);
}

const MO  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const WDF = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

export function formatBusDate(iso: string): { day: string; mo: string; yr: string; wd: string } {
  if (!iso) return { day: "--", mo: "", yr: "", wd: "" };
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return {
    day: String(dt.getDate()),
    mo:  MO[dt.getMonth()],
    yr:  String(dt.getFullYear()).slice(2),
    wd:  WDF[dt.getDay()],
  };
}

// ─── API fetch (ready for when backend is built) ──────────────────────────────

export async function searchBus(params: BusSearchParams): Promise<BusResult[]> {
  const qs = new URLSearchParams({
    from_city:   params.from_city,
    to_city:     params.to_city,
    travel_date: params.travel_date,
  });

  const res = await fetch(`/api/bus/search?${qs}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Bus API error ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}