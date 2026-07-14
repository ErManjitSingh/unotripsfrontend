/**
 * src/lib/package-customizer-data.ts
 *
 * Demo data + types for the package customizer.
 * Real data comes from GET /v1/packages/{slug}/customizer which now
 * reads hotel/cab pools from itinerary days (migration 0036).
 *
 * FLOW
 * ────
 * Admin creates a package → fills itinerary builder day by day
 *   → For each day with a hotel stop: adds hotel tier options
 *     (Budget/Standard/Deluxe with price deltas)
 *   → For each day with a cab transfer: adds cab options
 *     (same pool on each transfer day — deduped by ID on the backend)
 *   → Publishes package
 *
 * Frontend:
 *   → Calls GET /v1/packages/{slug}/customizer
 *   → Backend groups hotel_options by destination, dedupes cab_options by id
 *   → Frontend renders Stay tab (hotel groups) and Transfers tab (cabs)
 *   → User selects options → sidebar updates live via calcTotal()
 *   → Book → sends selected option IDs to /calculate-price → then /book
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type HotelOption = {
  id:    string;
  name:  string;
  desc:  string;
  stars: number;
  extra: number;   // INR delta for all nights at this destination
  pop:   boolean;
  img:   string;
  /** Real fields from the backend's per-hotel config — undefined/empty when not configured. */
  roomType?:      string;
  maxGuests?:     number;
  extraBedPrice?: number;
  mealsIncluded?: string[];
};

export type DestinationHotels = {
  dest:   string;
  nights: number;
  opts:   HotelOption[];
};

export type CabOption = {
  id:    string;
  name:  string;
  desc:  string;
  seats: number;
  extra: number;   // flat INR delta for the entire trip
  pop:   boolean;
  img?:  string;
};

export type AddonOption = {
  id:    string;
  name:  string;
  icon:  string;
  note:  string;
  price: number;   // per person per trip
  on:    boolean;
};

export type ItineraryActivity = {
  kind:    "transfer" | "sightseeing" | "hotel" | "meal";
  title:   string;
  sub:     string;
  meta:    string;
  img:     "transfer" | "sight" | "hotel" | "meal";
  stars?:  number;
  score?:  string;
};

export type ItineraryDay = {
  day:   number;
  loc:   string;
  title: string;
  acts:  ItineraryActivity[];
};

export type PriceBreakdown = {
  base:   number;
  hotel:  number;
  cab:    number;
  addons: number;
  disc:   number;
  total:  number;
};

export type CustomizerState = {
  adults:   number;
  children: number;
  rooms:    number;
  hotels:   number[];      // selected option index per destination
  cab:      number;        // selected cab index
  addons:   AddonOption[];
  pay:      "token" | "full";
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const CHILD_PRICE_FACTOR    = 0.70;
export const TOKEN_PERCENT         = 0.40;

// ── Demo data (shown when no real customizer data is configured) ──────────────
//
// These are used ONLY as a fallback when the backend returns empty hotel_groups
// or empty cab_options. Once admin fills in hotel/cab pools in the itinerary
// builder, these are never shown.

export const DEMO_HOTELS: DestinationHotels[] = [
  {
    dest: "Shimla", nights: 2,
    opts: [
      { id: "demo-s1", name: "Budget 3★",   desc: "Clean central guesthouse",        stars: 3, extra: 0,    pop: false, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
      { id: "demo-s2", name: "Standard 3★", desc: "Mall Road hotel · mountain views", stars: 3, extra: 1800, pop: true,  img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
      { id: "demo-s3", name: "Deluxe 4★",   desc: "Heritage property, scenic garden", stars: 4, extra: 4200, pop: false, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
    ],
  },
  {
    dest: "Manali", nights: 3,
    opts: [
      { id: "demo-m1", name: "Budget 3★",   desc: "River-view guesthouse near bazaar", stars: 3, extra: 0,    pop: false, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
      { id: "demo-m2", name: "Standard 4★", desc: "Snowline valley view resort",        stars: 4, extra: 2700, pop: true,  img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
      { id: "demo-m3", name: "Deluxe 4★",   desc: "Premium Himalayan retreat",          stars: 4, extra: 6300, pop: false, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
    ],
  },
  {
    dest: "Dharamshala", nights: 1,
    opts: [
      { id: "demo-d1", name: "Budget 3★",   desc: "City centre stay, basic comfort",  stars: 3, extra: 0,    pop: false, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
      { id: "demo-d2", name: "Standard 3★", desc: "McLeod Ganj view hotel",            stars: 3, extra: 900,  pop: true,  img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
      { id: "demo-d3", name: "Deluxe 4★",   desc: "Boutique retreat, Kangra valley",  stars: 4, extra: 2100, pop: false, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70" },
    ],
  },
];

export const DEMO_CABS: CabOption[] = [
  { id: "demo-c1", name: "Swift Dzire",     desc: "Sedan · 4 pax · AC",    seats: 4,  extra: 0,    pop: false },
  { id: "demo-c2", name: "Innova",          desc: "SUV · 6 pax · AC",      seats: 6,  extra: 3500, pop: true  },
  { id: "demo-c3", name: "Innova Crysta",   desc: "Premium SUV · 6 pax",   seats: 6,  extra: 6000, pop: false },
  { id: "demo-c4", name: "Tempo Traveller", desc: "12-seater · Groups",    seats: 12, extra: 9000, pop: false },
];

export const DEMO_ADDONS: AddonOption[] = [
  { id: "demo-a1", name: "All meals (lunch + dinner)",    icon: "UtensilsCrossed", note: "Breakfast already included.",              price: 1800, on: false },
  { id: "demo-a2", name: "Solang Valley snow activities", icon: "Snowflake",       note: "Cable car + snow shoes + guide.",          price: 1200, on: false },
  { id: "demo-a3", name: "Rohtang Pass permit + jeep",    icon: "Mountain",        note: "NGT permit + shared jeep to Rohtang top.", price: 1600, on: false },
  { id: "demo-a4", name: "Travel insurance",              icon: "ShieldCheck",     note: "Per-person coverage up to ₹5 lakh.",      price: 450,  on: false },
  { id: "demo-a5", name: "Airport / railway transfers",   icon: "PlaneTakeoff",    note: "Pick-up & drop at Chandigarh.",           price: 1100, on: false },
];

// ── Demo itinerary (shown while real itinerary loads or as fallback) ──────────

export const DEMO_ITINERARY: ItineraryDay[] = [
  { day:1,  loc:"Shimla",      title:"Arrival in Shimla",           acts:[{kind:"transfer",title:"Private Transfer",sub:"Chandigarh → Shimla",meta:"Sedan AC · 4–5 hrs",img:"transfer"},{kind:"sightseeing",title:"Mall Road & Ridge",sub:"City orientation & evening walk",meta:"2 hrs · 2 places",img:"sight"},{kind:"hotel",title:"Goldenfern Resort, Shimla",sub:"3★ · Breakfast included",meta:"Check-in: Day 1",img:"hotel",stars:3,score:"4.1"},{kind:"meal",title:"Welcome dinner",sub:"At hotel restaurant",meta:"1 meal included",img:"meal"}] },
  { day:2,  loc:"Shimla",      title:"Shimla Full-Day Sightseeing", acts:[{kind:"sightseeing",title:"Jakhu Temple & Kufri",sub:"Monkey hill + scenic valley lookout",meta:"5 hrs · 3 places",img:"sight"},{kind:"hotel",title:"Goldenfern Resort, Shimla",sub:"3★ · Breakfast included",meta:"Night 2 of 2",img:"hotel",stars:3,score:"4.1"},{kind:"meal",title:"Breakfast & dinner",sub:"At hotel",meta:"2 meals",img:"meal"}] },
  { day:3,  loc:"Manali",      title:"Shimla → Manali Drive",       acts:[{kind:"transfer",title:"Private Transfer",sub:"Shimla → Manali via Kullu valley",meta:"Innova · 6–7 hrs",img:"transfer"},{kind:"hotel",title:"Snowline Grand Manali",sub:"4★ · Valley view rooms",meta:"Check-in: Day 3",img:"hotel",stars:4,score:"4.4"},{kind:"meal",title:"Dinner on arrival",sub:"At hotel",meta:"1 meal",img:"meal"}] },
  { day:4,  loc:"Manali",      title:"Solang Valley & Rohtang",     acts:[{kind:"sightseeing",title:"Solang Valley Snow Activities",sub:"Cable car · snow shoes · zipline",meta:"4 hrs",img:"sight"},{kind:"sightseeing",title:"Rohtang Pass (seasonal)",sub:"Via NGT jeep · 13,050 ft",meta:"Full day",img:"sight"},{kind:"hotel",title:"Snowline Grand Manali",sub:"4★ · Breakfast",meta:"Night 2",img:"hotel",stars:4,score:"4.4"},{kind:"meal",title:"All meals today",sub:"B + L + D",meta:"3 meals",img:"meal"}] },
  { day:5,  loc:"Manali",      title:"Manali Local Sightseeing",    acts:[{kind:"sightseeing",title:"Hadimba Devi Temple & Old Manali",sub:"Ancient temple + hippie market",meta:"3 hrs",img:"sight"},{kind:"sightseeing",title:"Naggar Castle & Jogini Falls",sub:"Medieval castle + forest trek",meta:"3 hrs",img:"sight"},{kind:"hotel",title:"Snowline Grand Manali",sub:"4★ · Breakfast",meta:"Night 3",img:"hotel",stars:4,score:"4.4"},{kind:"meal",title:"Breakfast & dinner",sub:"At hotel",meta:"2 meals",img:"meal"}] },
  { day:6,  loc:"Dharamshala", title:"Manali → Dharamshala",        acts:[{kind:"transfer",title:"Private Transfer",sub:"Manali → Dharamshala via Mandi",meta:"Innova · 5–6 hrs",img:"transfer"},{kind:"sightseeing",title:"McLeod Ganj evening",sub:"Tibetan market & café culture",meta:"2 hrs",img:"sight"},{kind:"hotel",title:"Valley View Retreat",sub:"3★ · Kangra valley views",meta:"Check-in: Day 6",img:"hotel",stars:3,score:"4.2"},{kind:"meal",title:"Dinner",sub:"At hotel",meta:"1 meal",img:"meal"}] },
  { day:7,  loc:"Departure",   title:"Departure Day",               acts:[{kind:"meal",title:"Breakfast",sub:"At hotel",meta:"1 meal",img:"meal"},{kind:"sightseeing",title:"Dharamkot & Triund base walk",sub:"Morning valley walk",meta:"2 hrs",img:"sight"},{kind:"transfer",title:"Private Drop Transfer",sub:"Dharamshala → Pathankot / Gaggal Airport",meta:"Sedan AC · 2–3 hrs",img:"transfer"}] },
];

// ── Inclusions / Exclusions ───────────────────────────────────────────────────

export const INCLUSIONS: string[] = [
  "6 nights hotel accommodation (twin sharing, base category)",
  "Daily breakfast at all hotels",
  "Private cab for all intercity transfers & local sightseeing",
  "Professional tour manager on group departures",
  "All sightseeing as per day-wise itinerary",
  "Driver bata, fuel, toll & parking charges",
  "Welcome dinner on Day 1",
  "All applicable GST on the above",
];

export const EXCLUSIONS: string[] = [
  "Flights or train tickets to Chandigarh (arrival city)",
  "Lunch & dinner except Day 1 welcome dinner",
  "Rohtang Pass NGT permit & jeep (available as add-on)",
  "Personal expenses — laundry, telephone, shopping",
  "Travel insurance (available as add-on)",
  "Entry fees to monuments or adventure parks",
  "Any service not listed under inclusions",
  "Cost from natural calamities or road closures",
];

// ── Terms & Conditions ────────────────────────────────────────────────────────

export const TERMS_AND_CONDITIONS: Array<{ title: string; body: string }> = [
  { title: "Booking Policy",                 body: "A minimum token deposit of 40% of the total package cost is required to confirm your booking. The seat is not guaranteed until the deposit clears. The balance is due 7 days before departure. UNO Trips reserves the right to release the seat if payment timelines are not met." },
  { title: "Tour Prepone / Postpone Policy", body: "Date change requests must be submitted at least 15 days before departure. One free date change is permitted per booking, subject to availability. Subsequent changes attract an administration fee of ₹500 per booking. Changes within 7 days of travel are subject to supplier cancellation policies." },
  { title: "Booking Confirmation",           body: "Booking is confirmed only upon receipt of the token payment and written confirmation from our team. A detailed voucher with hotel names, cab details, driver contact, and 24×7 emergency contacts is shared within 24 hours of full payment." },
  { title: "Important Note",                 body: "The itinerary is subject to change due to weather, road conditions, or government restrictions. UNO Trips will notify affected travellers and offer an alternate itinerary of equal value. All GST invoices must be collected within 5 days post travel." },
  { title: "Cancellation Policy",            body: "More than 30 days: 10% of package cost. 15–29 days: 25%. 7–14 days: 50%. Within 7 days or no-show: 100% forfeiture. Airline and hotel components may carry additional supplier cancellation fees." },
];

// ── Price engine ──────────────────────────────────────────────────────────────
//
// basePricePerPerson is ALWAYS the real package.priceINR (base_price from the
// backend) — never omit it. It used to default to a hardcoded ₹9,500 demo
// constant, which meant the optimistic price shown while customizing never
// matched the authoritative POST /calculate-price total charged at checkout
// (e.g. showing ~₹19,000 while browsing, then jumping to ₹46,000+ at
// "Confirm & Pay"). There is no fallback anymore — callers must pass it.

/**
 * Full price breakdown using the package's real per-person price plus
 * real hotel/cab option deltas. `basePricePerPerson` and `originalPricePerPerson`
 * come straight from the package record (TourPackage.priceINR / oldPriceINR) —
 * never a hardcoded rate. `disc` is informational only (what the traveller is
 * already saving vs. the listed price) — it is NOT subtracted from `total`,
 * since basePricePerPerson is already the net/current selling price.
 */
export function calcTotalWithOptions(
  state:                   Omit<CustomizerState, "pay">,
  hotels:                  DestinationHotels[],
  cabs:                    CabOption[],
  basePricePerPerson:      number,
  originalPricePerPerson?: number,
): PriceBreakdown {
  const persons     = state.adults + Math.round(state.children * CHILD_PRICE_FACTOR);
  const base        = basePricePerPerson * Math.max(1, persons);
  const hotelDelta  = state.hotels.reduce((sum, sel, i) => sum + (hotels[i]?.opts[sel]?.extra ?? 0) * state.rooms, 0);
  const cabDelta    = cabs[state.cab]?.extra ?? 0;
  const addons      = state.addons.filter((a) => a.on).reduce((s, a) => s + a.price * Math.max(1, persons), 0);
  const disc        =
    originalPricePerPerson && originalPricePerPerson > basePricePerPerson
      ? (originalPricePerPerson - basePricePerPerson) * Math.max(1, persons)
      : 0;
  const total       = Math.max(0, base + hotelDelta + cabDelta + addons);
  return { base, hotel: hotelDelta, cab: cabDelta, addons, disc, total };
}

/**
 * Mirrors the backend's exact token calculation (day_options_service.py's
 * take a flat configured amount capped at total. This used to always
 * assume 40% of total regardless of the package's real token_type/
 * token_amount — for a "fixed" package with no token_amount configured
 * (real_token_amount=0), that showed a token option (e.g. "₹18,400 (40%)")
 * that would always fail the backend's minimum-payment check at checkout.
 * Always pass the package's real token_type/token_amount — a package with
 * no token configured (fixed, amount=0) genuinely asks for ₹0 upfront;
 * that's an ops data gap to flag, not something to paper over here.
 */
export function tokenAmount(
  total: number,
  tokenType: string = "percent",
  configuredAmount: number = TOKEN_PERCENT * 100,
): number {
  if (tokenType === "percent") {
    return Math.round(total * (configuredAmount / 100));
  }
  return Math.round(Math.min(configuredAmount, total));
}

export function fmtINR(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}
