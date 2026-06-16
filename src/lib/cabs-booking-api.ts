/**
 * src/lib/cabs-booking-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Types + fetch helpers for Cab V2 booking flow.
 * Mirrors hotels-bookings-api.ts patterns.
 *
 * Backend endpoints (proxied via /api/cabs/[...path]):
 *   POST /v1/cabs/bookings             → create booking + Razorpay order
 *   POST /v1/cabs/bookings/{id}/verify → verify Razorpay payment
 *   GET  /v1/cabs/bookings/{conf_no}   → lookup by confirmation number
 *   GET  /v1/cabs/{slug}               → cab detail data
 *   POST /v1/cabs/fare                 → fare breakdown
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { CabFareBreakdown, CabSearchParams } from "@/lib/cabs-api";

// ─── Cab detail (from GET /v1/cabs/{slug}) ───────────────────────────────────

export type CabDetail = {
  id:                string;
  name:              string;
  slug:              string;
  short_description: string | null;
  full_description:  string | null;
  cab_category:      string;
  seating_capacity:  number;
  luggage_capacity:  number;
  is_ac:             boolean;
  features:          string[];
  featured_image:    string | null;
  gallery_images:    string[];
  operating_cities:  { city: string; state: string }[];
  vehicle_count:     number;
  seo_title:         string | null;
  seo_description:   string | null;
  seo_keywords:      string | null;
};

// ─── Booking creation payload ────────────────────────────────────────────────

export type CreateCabBookingPayload = {
  cab_type_id:         string;
  trip_type:           string;
  travel_date:         string;
  return_date?:        string | null;
  pickup_address:      string;
  pickup_city:         string;
  pickup_state:        string;
  drop_address:        string;
  drop_city:           string;
  drop_state:          string;
  pickup_time?:        string | null;
  guest_first_name:    string;
  guest_last_name:     string;
  guest_email:         string;
  guest_phone:         string;
  guest_country_code:  string;
  passengers:          number;
  special_instructions?: string | null;
  flight_train_number?: string | null;
  booking_source:      string;
};

// ─── Booking response ────────────────────────────────────────────────────────

export type CabBookingResponse = {
  id:                  string;
  confirmation_number: string;
  status:              string;
  cab_name:            string;
  cab_category:        string;
  trip_type:           string;
  travel_date:         string;
  return_date:         string | null;
  pickup_city:         string;
  pickup_address:      string;
  drop_city:           string;
  drop_address:        string;
  actual_distance_km:  number;
  billed_distance_km:  number;
  passengers:          number;
  guest_first_name:    string;
  guest_last_name:     string;
  guest_email:         string;
  guest_phone:         string;
  total_amount:        number;
  gst_amount:          number;
  gst_rate:            number;
  driver_allowance:    number;
  night_charge:        number;
  trip_fare_selling:   number;
  currency:            string;
  razorpay_order_id:   string | null;
  razorpay_key_id?:    string;
  payment_status:      string;
  created_at:          string;
};

// ─── Razorpay verify payload ─────────────────────────────────────────────────

export type CabPaymentVerifyPayload = {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
};

// ─── API helpers ─────────────────────────────────────────────────────────────

const CAB_API = "/api/cabs";

async function cabApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${CAB_API}${path}`, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as { detail?: string; message?: string }).detail
      ?? (body as { message?: string }).message
      ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Fetch cab detail by slug. */
export function fetchCabDetail(slug: string): Promise<CabDetail> {
  return cabApiFetch<CabDetail>(`/${encodeURIComponent(slug)}`);
}

/** Calculate fare breakdown (no booking created). */
export function calculateCabFare(params: {
  cab_type_id: string;
  pickup_city: string;
  drop_city:   string;
  drop_state:  string;
  trip_type:   string;
  travel_date: string;
  pickup_time?: string | null;
}): Promise<CabFareBreakdown> {
  return cabApiFetch<CabFareBreakdown>("/fare", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** Create cab booking + Razorpay order. */
export function createCabBooking(
  payload: CreateCabBookingPayload,
): Promise<CabBookingResponse> {
  return cabApiFetch<CabBookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Verify Razorpay payment for a cab booking. */
export function verifyCabBookingPayment(
  bookingId: string,
  payload: CabPaymentVerifyPayload,
): Promise<CabBookingResponse> {
  return cabApiFetch<CabBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/verify`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

/** Lookup booking by confirmation number. */
export function fetchCabBookingByConfNo(
  confNo: string,
): Promise<CabBookingResponse> {
  return cabApiFetch<CabBookingResponse>(
    `/bookings/${encodeURIComponent(confNo)}`,
  );
}