export type CabQuote = {
  id: string;
  quote_number: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired" | "withdrawn";
  total_amount: number;
  currency: string;
  commission_payment_amount?: number | null;
  driver_due_amount?: number | null;
  commission_percent?: number | null;
  cab_type_id?: string | null;
  cab_name?: string | null;
  cab_category?: string | null;
  vehicle_registration?: string | null;
  driver_name?: string | null;
  fare_breakdown: Record<string, unknown> | null;
  inclusions: string[];
  exclusions: string[];
  partner_message: string | null;
  valid_until: string;
  sent_at: string | null;
  responded_at: string | null;
  partner_name: string;
  business_name: string | null;
  created_at: string;
};

export type CabTripRequest = {
  id: string;
  request_number: string;
  status: "open" | "quoted" | "accepted" | "expired" | "cancelled";
  booking_id?: string | null;
  booking_confirmation_number?: string | null;
  booking_status?: string | null;
  booking_payment_status?: string | null;
  trip_type: "one_way" | "round_trip" | "hourly_rental" | "airport_transfer";
  pickup_address: string;
  pickup_city: string;
  pickup_state: string | null;
  drop_address: string;
  drop_city: string;
  drop_state: string | null;
  pickup_at: string;
  return_at: string | null;
  passengers: number;
  luggage_count: number | null;
  preferred_vehicle_categories: string[];
  additional_requirements: string | null;
  quote_deadline_at: string;
  created_at: string;
  quotes: CabQuote[];
};

export type CreateCabTripRequest = Omit<CabTripRequest, "id" | "request_number" | "status" | "created_at" | "quotes" | "quote_deadline_at" | "return_at" | "luggage_count" | "preferred_vehicle_categories" | "additional_requirements"> & {
  quote_deadline_at?: string;
  return_at?: string | null;
  luggage_count?: number | null;
  preferred_vehicle_categories?: string[];
  additional_requirements?: string | null;
};

export type CreateCabQuote = {
  total_amount: number;
  cab_type_id: string;
  fare_breakdown?: Record<string, unknown>;
  inclusions?: string[];
  exclusions?: string[];
  partner_message?: string;
  valid_until: string;
};

export type PartnerQuotePayoutPreview = {
  total_amount: number;
  partner_payout: number;
  gst_amount: number;
  currency: string;
};

async function cabApi<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/cabs${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Cab quote request failed.");
  return body.data ?? body;
}

export function createCabTripRequest(accessToken: string, payload: CreateCabTripRequest) {
  return cabApi<CabTripRequest>("/trip-requests", accessToken, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

export function getCabTripRequest(accessToken: string, requestId: string) {
  return cabApi<CabTripRequest>(`/trip-requests/${requestId}`, accessToken);
}

export async function listMyCabTripRequests(accessToken: string) {
  const result = await cabApi<CabTripRequest[] | { items?: CabTripRequest[] }>("/trip-requests", accessToken);
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && Array.isArray((result as { items?: CabTripRequest[] }).items)) {
    return (result as { items: CabTripRequest[] }).items;
  }
  return [];
}

export function acceptCabQuote(accessToken: string, requestId: string, quoteId: string) {
  return cabApi<CabTripRequest>(`/trip-requests/${requestId}/quotes/${quoteId}/accept`, accessToken, { method: "POST" });
}

export type UpdateCabTripRequest = {
  trip_type?: CabTripRequest["trip_type"];
  pickup_address?: string;
  pickup_city?: string;
  pickup_state?: string | null;
  drop_address?: string;
  drop_city?: string;
  drop_state?: string | null;
  pickup_at?: string;
  return_at?: string | null;
  passengers?: number;
  luggage_count?: number | null;
  preferred_vehicle_categories?: string[];
  additional_requirements?: string | null;
  quote_deadline_at?: string;
};

export function updateCabTripRequest(accessToken: string, requestId: string, payload: UpdateCabTripRequest) {
  return cabApi<CabTripRequest>(`/trip-requests/${requestId}`, accessToken, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function cancelCabTripRequest(accessToken: string, requestId: string) {
  return cabApi<CabTripRequest>(`/trip-requests/${requestId}/cancel`, accessToken, { method: "POST" });
}

export type QuoteBookingGuestPayload = {
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country_code?: string;
  passengers: number;
  special_instructions?: string | null;
  flight_train_number?: string | null;
  payment_option?: "full_online" | "commission_and_driver" | "direct_to_cab_owner";
};

export type QuoteBookingCreateResponse = {
  booking_id: string;
  id: string;
  confirmation_number: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  total_amount: number;
  online_amount: number;
  driver_due_amount: number;
  commission_percent: number;
  payment_option: "full_online" | "commission_and_driver" | "direct_to_cab_owner";
  currency: string;
  is_mock_order?: boolean;
  is_direct_payment?: boolean;
};

export function createBookingFromQuote(
  accessToken: string,
  requestId: string,
  quoteId: string,
  payload: QuoteBookingGuestPayload,
) {
  return cabApi<QuoteBookingCreateResponse>(
    `/trip-requests/${requestId}/quotes/${quoteId}/book`,
    accessToken,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
  );
}

export function getPartnerQuoteRequests(accessToken: string) {
  return cabPartnerApi<CabTripRequest[]>("/quote-requests", accessToken);
}

async function cabPartnerApi<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/cab-partner${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", ...(init?.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Cab partner quote request failed.");
  return body.data ?? body;
}

export function getPartnerQuotePayoutPreview(
  accessToken: string,
  requestId: string,
  cabTypeId: string,
  totalAmount: number,
) {
  const params = new URLSearchParams({ cab_type_id: cabTypeId, total_amount: String(totalAmount) });
  return cabPartnerApi<PartnerQuotePayoutPreview>(
    `/quote-requests/${requestId}/payout-preview?${params.toString()}`,
    accessToken,
  );
}

export function sendPartnerQuote(accessToken: string, requestId: string, payload: CreateCabQuote) {
  return cabPartnerApi<CabQuote>(`/quote-requests/${requestId}/quotes`, accessToken, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
}

export function passPartnerQuoteRequest(accessToken: string, requestId: string) {
  return cabPartnerApi<CabTripRequest>(`/quote-requests/${requestId}/pass`, accessToken, {
    method: "POST",
  });
}
