/**
 * src/lib/flight-api.ts
 * Types + fetch helpers for Flights.
 * Backend endpoint (when built): /v1/flights/search
 */

// ─── Trip types ───────────────────────────────────────────────────────────────

export type FlightTripType = "one_way" | "round_trip" | "multi_city";

// ─── Cabin class ──────────────────────────────────────────────────────────────

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  economy:         "Economy",
  premium_economy: "Premium Economy",
  business:        "Business",
  first:           "First Class",
};

// ─── Airport data ─────────────────────────────────────────────────────────────

export type Airport = {
  code:    string;   // IATA code e.g. "DEL"
  name:    string;   // "Indira Gandhi International Airport"
  city:    string;   // "New Delhi"
  country: string;   // "India"
};

export const AIRPORTS: Airport[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi",   country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai",    country: "India" },
  { code: "BLR", name: "Bengaluru International Airport",     city: "Bengaluru",  country: "India" },
  { code: "MAA", name: "Chennai International Airport",       city: "Chennai",    country: "India" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata",   country: "India" },
  { code: "HYD", name: "Rajiv Gandhi International Airport",  city: "Hyderabad",  country: "India" },
  { code: "JAI", name: "Jaipur International Airport",        city: "Jaipur",     country: "India" },
  { code: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", country: "India" },
  { code: "PNQ", name: "Pune Airport",                        city: "Pune",       country: "India" },
  { code: "GOI", name: "Goa International Airport (Dabolim)", city: "Goa",        country: "India" },
  { code: "COK", name: "Cochin International Airport",        city: "Kochi",      country: "India" },
  { code: "IXC", name: "Chandigarh Airport",                  city: "Chandigarh", country: "India" },
  { code: "LKO", name: "Chaudhary Charan Singh International Airport", city: "Lucknow",   country: "India" },
  { code: "IXB", name: "Bagdogra Airport",                    city: "Siliguri",   country: "India" },
  { code: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", city: "Guwahati", country: "India" },
  { code: "PAT", name: "Jay Prakash Narayan Airport",         city: "Patna",      country: "India" },
  { code: "BHO", name: "Raja Bhoj Airport",                   city: "Bhopal",     country: "India" },
  { code: "NAG", name: "Dr. Babasaheb Ambedkar International Airport", city: "Nagpur",    country: "India" },
  { code: "VNS", name: "Lal Bahadur Shastri International Airport", city: "Varanasi",  country: "India" },
  { code: "IXZ", name: "Veer Savarkar International Airport", city: "Port Blair", country: "India" },
  // International
  { code: "DXB", name: "Dubai International Airport",         city: "Dubai",      country: "UAE"   },
  { code: "SIN", name: "Singapore Changi Airport",            city: "Singapore",  country: "Singapore" },
  { code: "BKK", name: "Suvarnabhumi Airport",                city: "Bangkok",    country: "Thailand" },
  { code: "LHR", name: "Heathrow Airport",                    city: "London",     country: "UK"    },
  { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA"   },
];

// ─── Search params ────────────────────────────────────────────────────────────

export type FlightSearchParams = {
  from_code:    string;   // IATA
  to_code:      string;
  trip_type:    FlightTripType;
  departure:    string;   // YYYY-MM-DD
  return_date?: string;   // YYYY-MM-DD — round trip only
  adults:       number;
  children:     number;
  infants:      number;
  cabin:        CabinClass;
};

// ─── Result ───────────────────────────────────────────────────────────────────

export type FlightResult = {
  id:          string;
  airline:     string;
  airline_code: string;
  logo_url:    string | null;
  flight_no:   string;
  from_code:   string;
  to_code:     string;
  departure:   string;   // "06:00"
  arrival:     string;   // "08:30"
  duration:    string;   // "2h 30m"
  stops:       number;
  stop_info?:  string;   // "1 stop via Hyderabad"
  cabin:       CabinClass;
  fare:        number;
  seats_left:  number | null;
  refundable:  boolean;
  baggage:     string;   // "15 kg"
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MO  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const WDF = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

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

export function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function formatFlightDate(iso: string) {
  if (!iso) return { day: "--", mo: "", yr: "", wd: "", full: "" };
  const dt = parseIso(iso);
  return {
    day:  String(dt.getDate()),
    mo:   MO[dt.getMonth()],
    yr:   String(dt.getFullYear()).slice(2),
    wd:   WDF[dt.getDay()],
    full: `${dt.getDate()} ${MO[dt.getMonth()]}'${String(dt.getFullYear()).slice(2)}`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

export function searchAirports(q: string): Airport[] {
  const lower = q.toLowerCase().trim();
  if (!lower) return AIRPORTS.slice(0, 8);
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(lower) ||
      a.city.toLowerCase().includes(lower) ||
      a.name.toLowerCase().includes(lower),
  ).slice(0, 8);
}

export function totalTravellers(p: FlightSearchParams) {
  return p.adults + p.children + p.infants;
}

// ─── API fetch ────────────────────────────────────────────────────────────────

export async function searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
  const qs = new URLSearchParams({
    from_code:  params.from_code,
    to_code:    params.to_code,
    trip_type:  params.trip_type,
    departure:  params.departure,
    adults:     String(params.adults),
    children:   String(params.children),
    infants:    String(params.infants),
    cabin:      params.cabin,
  });
  if (params.return_date) qs.set("return_date", params.return_date);

  const res = await fetch(`/api/flights/search?${qs}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `Flights API error ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}