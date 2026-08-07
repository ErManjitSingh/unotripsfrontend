/**
 * src/lib/package-fulfillment-types.ts
 *
 * TypeScript types mirroring the backend's FulfillmentPricingResponse
 * and its nested schemas.
 *
 * Source: app/schemas/packages/fulfillment_schemas.py
 *
 * These types are the single source of truth for the package pricing
 * integration. The frontend never derives prices from these values —
 * it only reads and displays them.
 */

// ── Passenger manifest ───────────────────────────────────────────────────────

export type PassengerManifest = {
  total_adults:         number;
  total_children:       number;
  total_infants:        number;
  total_headcount:      number;
  requested_room_count: number;
};

// ── Line item (one component in the pre-tax breakdown) ──────────────────────

export type PricingLineItem = {
  component: string;   // machine key: "base_package", "hotel_upgrade", etc.
  label:     string;   // display name: "Base package", "Hotel upgrade", etc.
  amount:    number;   // INR, always >= 0, always PRE-TAX
  note?:     string;   // annotation: "2 adults × ₹20,000"
};

// ── Allocation warning ────────────────────────────────────────────────────────

export type AllocationWarning = {
  code:     string;   // "ROOMS_INCREASED", "CAB_AUTO_UPGRADED", etc.
  severity: string;   // "info" | "advisory"
  message:  string;   // human-readable
};

// ── Pre-tax pricing summary ───────────────────────────────────────────────────

export type PricingSummary = {
  base_package_price:  number;   // base × billable_persons (PRE-TAX)
  hotel_upgrade_total: number;   // sum of hotel upgrade deltas
  cab_upgrade_total:   number;   // cab upgrade delta (0 = default retained)
  volvo_bus_cost:      number;   // Volvo return-ticket cost (0 for non-Volvo packages)
  extra_bed_total:     number;   // extra beds × nights
  infant_cot_total:    number;   // infant cots × nights (cot_charge policy)
  activities_total:    number;   // sightseeing + activities
  addons_total:        number;   // add-ons × effective_persons
  package_subtotal:    number;   // sum of all above, PRE-TAX
  pricing_breakdown:   PricingLineItem[];
  warnings:            AllocationWarning[];
  is_complete:         boolean;  // false = some stays could not be priced
};

// ── GST result ────────────────────────────────────────────────────────────────

export type GSTResult = {
  taxable_amount:     number;   // = package_subtotal, PRE-TAX
  gst_rate:           number;   // total rate, e.g. 0.05
  gst_regime:         string;   // "without_itc" | "with_itc" | "exempt"
  cgst_rate:          number;
  cgst_amount:        number;
  sgst_rate:          number;
  sgst_amount:        number;
  igst_rate:          number;
  igst_amount:        number;
  total_gst:          number;
  grand_total:        number;   // taxable_amount + total_gst
  gst_label:          string;   // "GST @ 5% (CGST 2.5% + SGST 2.5%)"
  supply_type:        string;   // "intra_state" | "inter_state" | "export"
  sac_code:           string;   // always "9985"
  is_tax_exempt:      boolean;
  rule_version:       string;
  gst_engine_version: string;
};

// ── Full fulfillment pricing response ────────────────────────────────────────
//
// Returned by POST /v1/packages/{slug}/fulfillment-price.
// The frontend reads these values directly — no arithmetic, no derivation.

export type FulfillmentPricingResponse = {
  // Passenger summary (from PassengerEngine)
  passenger_manifest: PassengerManifest;

  // Pre-tax breakdown
  pricing_summary:  PricingSummary;

  // GST calculation
  gst_result:       GSTResult;

  // Final authoritative amounts
  grand_total:      number;    // = gst_result.grand_total; what Razorpay charges
  token_amount:     number;    // advance payment to confirm booking
  /** Platform advance percentage actually applied (e.g. 40). Display only. */
  token_percent?:   number;
  /** Minimum % payable now when the guest may choose; null = fixed token. */
  min_token_percent?: number | null;
  balance_amount:   number;    // grand_total - token_amount; due before travel

  // Completeness — false means some hotel stays could not be priced
  is_complete:      boolean;

  // Engine warnings (room allocation, cab, hotel pricing)
  warnings:         AllocationWarning[];

  // MVP policy note — informational only
  allocation_policy: string;
};

// ── Request body for POST /v1/packages/{slug}/fulfillment-price ──────────────
//
// Same shape as PriceCalculateRequest on the backend.
// Uses the new selected_hotels shape with explicit (option_id, room_type_id)
// pairs. The deprecated selected_hotel_option_ids is kept for backward
// compatibility — the backend accepts either and merges correctly.

export type SelectedHotelPayload = {
  option_id:    string;
  room_type_id: string | null;
};

export type FulfillmentPriceRequest = {
  package_id:                string;
  travel_date:               string | null;   // YYYY-MM-DD
  rooms:                     Array<{ adults: number; children: number }>;
  /** New typed shape — preferred. Each entry carries option_id + room_type_id. */
  selected_hotels:           SelectedHotelPayload[];
  /** @deprecated — kept for backward compat. Use selected_hotels instead. */
  selected_hotel_option_ids?: string[];
  selected_cab_option_id:    string | null;
  selected_sightseeing_ids:  string[];
  selected_activity_link_ids: string[];
  selected_addon_ids:        string[];
  /** Chosen advance %; server clamps to the package minimum. */
  token_percent?: number | null;
};
// ── Traveller Price Diff (MakeMyTrip-style breakdown) ─────────────────────────

export type TravellerDiffLineItem = {
  label:  string;   // "Room Allocation", "Extra Beds", "Vehicle", etc.
  before: string;   // "1 Room", "0", "Sedan"
  after:  string;   // "2 Rooms", "1", "SUV"
  delta:  number | null;  // INR change; null for purely structural items
};

export type TravellerPriceDiff = {
  from_label:         string;   // "2 Adults"
  to_label:           string;   // "5 Adults"
  changes:            TravellerDiffLineItem[];
  previous_total:     number;
  new_total:          number;
  delta_total:        number;   // new_total - previous_total
  gst_delta:          number;
  new_grand_total:    number;
  // full pipeline outputs (for components needing deep breakdown)
  previous_response:  FulfillmentPricingResponse;
  new_response:       FulfillmentPricingResponse;
};

export type TravellerDiffRequest = {
  before_request: FulfillmentPriceRequest;
  after_request:  FulfillmentPriceRequest;
};