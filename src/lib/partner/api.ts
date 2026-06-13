/**
 * src/lib/partner/api.ts
 * Partner API client for unotrips.com — same backend endpoints as partner portal.
 * Uses the existing /api/hotels proxy (browser) → direct backend (SSR).
 */

import { getServerApiBase } from "@/lib/api";

/**
 * partnerPath — routing logic:
 *
 * Browser:  /api/partner/v1/partner/...  (same-origin Next.js proxy)
 *           → avoids CORS, hides backend URL, works from unotrips.com
 *
 * Server:   https://backend.com/v1/partner/...  (direct, no CORS issue)
 *           → used for any future RSC data fetching
 *
 * The proxy lives at src/app/api/partner/[...path]/route.ts
 */
function partnerPath(segment: string): string {
  // Normalise: ensure segment starts with /v1/partner
  const path = segment.startsWith("/") ? segment : `/${segment}`;

  if (typeof window !== "undefined") {
    // Browser — go through Next.js proxy to avoid CORS
    return `/api/partner${path}`;
  }

  // Server — call backend directly
  const base = getServerApiBase().replace(/\/$/, "");
  return `${base}${path}`;
}

async function partnerFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const url = partnerPath(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? body?.detail ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  return (json?.data ?? json) as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type PartnerStatus = "pending" | "kyc_submitted" | "approved" | "rejected" | "suspended";
export type PropertyStatus = "draft" | "pending_review" | "approved" | "rejected" | "inactive";
export type KycStatus = "not_started" | "submitted" | "verified" | "rejected";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";
export type PartnerBookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type BedType = "single" | "double" | "twin" | "queen" | "king" | "bunk";
export type PropertyType =
  | "hotel" | "resort" | "boutique_hotel" | "heritage_hotel"
  | "villa" | "homestay" | "service_apartment" | "hostel";

export interface AccountOut {
  id: string;
  user_id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string | null;
  pan: string | null;
  gstin: string | null;
  kyc_status: KycStatus;
  status: PartnerStatus;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_account_holder: string | null;
  has_kyc: boolean;
  has_bank_details: boolean;
  bank_account_verified: boolean;
  bank_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  partner_id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  state: string;
  country: string;
  address: string;
  pincode: string;
  star_category: number;
  property_type: PropertyType;
  status: PropertyStatus;
  amenities: string[];
  images: string[];
  thumbnail_url: string;
  check_in_time: string;
  check_out_time: string;
  room_count: number;
  booking_count: number;
  avg_rating: number;
  total_revenue: number;
  room_types?: any[];
  created_at: string;
  updated_at: string;
}

export interface PartnerBooking {
  id: string;
  confirmation_number: string;
  property_id: string;
  property_name: string;
  room_name: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  status: PartnerBookingStatus;
  total_amount: number;
  partner_payout: number;
  created_at: string;
}

export interface AnalyticsSummary {
  period: string;
  total_revenue: number;
  total_bookings: number;
  avg_occupancy_pct: number;
  avg_daily_rate: number;
  cancellation_rate: number;
  top_room_type: string;
  revenue_change_pct: number;
  booking_change_pct: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface PayoutRecord {
  id: string;
  period_start: string;
  period_end: string;
  booking_count: number;
  gross_amount: number;
  commission: number;
  tds_amount: number;
  net_amount: number;
  currency: string;
  status: PayoutStatus;
  utr: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface PayoutSummary {
  total_earned: number;
  pending_amount: number;
  processing_amount: number;
  total_bookings_paid_out: number;
  bank_account_verified: boolean;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const partnerApi = {
  // ── Account ──────────────────────────────────────────────────────────────
  getAccount: (token: string) =>
    partnerFetch<AccountOut>("/v1/partner/account", token),

  updateBusiness: (token: string, data: {
    business_name?: string;
    business_email?: string;
    business_phone?: string;
    business_address?: string;
  }) =>
    partnerFetch<AccountOut>("/v1/partner/account/business", token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateKyc: (token: string, data: { pan: string; gstin?: string }) =>
    partnerFetch<AccountOut>("/v1/partner/account/kyc", token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateBank: (token: string, data: {
    bank_account_number: string;
    bank_ifsc: string;
    bank_account_holder: string;
  }) =>
    partnerFetch<AccountOut>("/v1/partner/account/bank", token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  verifyBank: (token: string) =>
    partnerFetch<{ verified: boolean; message: string }>(
      "/v1/partner/payouts/verify-bank", token, { method: "POST" }
    ),

  // ── Properties ───────────────────────────────────────────────────────────
  listProperties: (token: string, params: { page?: number; limit?: number; status?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.page)   qs.set("page",   String(params.page));
    if (params.limit)  qs.set("limit",  String(params.limit));
    if (params.status) qs.set("status", params.status);
    const q = qs.toString();
    return partnerFetch<{ properties: Property[]; total: number }>(
      `/v1/partner/properties${q ? `?${q}` : ""}`, token
    );
  },

  getProperty: (token: string, propertyId: string) =>
    partnerFetch<Property>(`/v1/partner/properties/${propertyId}`, token),

  createProperty: (token: string, data: Record<string, unknown>) =>
    partnerFetch<Property>("/v1/partner/properties", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProperty: (token: string, propertyId: string, data: Record<string, unknown>) =>
    partnerFetch<Property>(`/v1/partner/properties/${propertyId}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteProperty: (token: string, propertyId: string) =>
    partnerFetch<{ message: string }>(`/v1/partner/properties/${propertyId}`, token, {
      method: "DELETE",
    }),

  // ── Bookings ─────────────────────────────────────────────────────────────
  listBookings: (token: string, params: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    date_from?: string;
    date_to?: string;
    property_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.status && params.status !== "all") qs.set("status", params.status);
    if (params.page)        qs.set("page",        String(params.page));
    if (params.limit)       qs.set("limit",       String(params.limit));
    if (params.search)      qs.set("search",      params.search);
    if (params.sort)        qs.set("sort",        params.sort);
    if (params.date_from)   qs.set("date_from",   params.date_from);
    if (params.date_to)     qs.set("date_to",     params.date_to);
    if (params.property_id) qs.set("property_id", params.property_id);
    const q = qs.toString();
    return partnerFetch<{ bookings: PartnerBooking[]; total: number }>(
      `/v1/partner/bookings${q ? `?${q}` : ""}`, token
    );
  },

  // ── Analytics ────────────────────────────────────────────────────────────
  getAnalyticsSummary: (token: string, period: string, propertyId?: string) => {
    const qs = new URLSearchParams({ period });
    if (propertyId) qs.set("property_id", propertyId);
    return partnerFetch<AnalyticsSummary>(
      `/v1/partner/analytics/summary?${qs}`, token
    );
  },

  getRevenueChart: (token: string, period: string, propertyId?: string) => {
    const qs = new URLSearchParams({ period });
    if (propertyId) qs.set("property_id", propertyId);
    return partnerFetch<RevenueDataPoint[]>(
      `/v1/partner/analytics/revenue?${qs}`, token
    );
  },

  // ── Payouts ──────────────────────────────────────────────────────────────
  listPayouts: (token: string, params: { page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.page)  qs.set("page",  String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return partnerFetch<{ items: PayoutRecord[]; total: number; page: number; pages: number }>(
      `/v1/partner/payouts${q ? `?${q}` : ""}`, token
    );
  },

  getPayoutSummary: (token: string) =>
    partnerFetch<PayoutSummary>("/v1/partner/payouts/summary", token),

  changePassword: (token: string, data: { current_password: string; new_password: string }) =>
    partnerFetch<{ message: string }>("/v1/auth/change-password", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateNotificationPrefs: (token: string, data: { email_bookings: boolean; email_reviews: boolean; sms_bookings: boolean }) =>
    partnerFetch<{ message: string }>("/v1/partner/settings/notifications", token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // ── Rooms ──────────────────────────────────────────────────────────────────
  listRooms: (token: string, propertyId: string) =>
    partnerFetch<any[]>(`/v1/partner/properties/${propertyId}/rooms`, token),

  addRoom: (token: string, propertyId: string, data: Record<string, unknown>) =>
    partnerFetch<any>(`/v1/partner/properties/${propertyId}/rooms`, token, {
      method: "POST", body: JSON.stringify(data),
    }),

  updateRoom: (token: string, propertyId: string, roomId: string, data: Record<string, unknown>) =>
    partnerFetch<any>(`/v1/partner/properties/${propertyId}/rooms/${roomId}`, token, {
      method: "PATCH", body: JSON.stringify(data),
    }),

  deleteRoom: (token: string, propertyId: string, roomId: string) =>
    partnerFetch<any>(`/v1/partner/properties/${propertyId}/rooms/${roomId}`, token, { method: "DELETE" }),

  // ── Rate calendar ──────────────────────────────────────────────────────────
  getRateCalendar: (token: string, roomId: string, year: number, month: number) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/rates?year=${year}&month=${month}`, token),

  setRateDate: (token: string, roomId: string, payload: {
    date: string; price?: number; available_count?: number; is_blocked?: boolean; note?: string;
  }) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/rates/date`, token, {
      method: "PUT", body: JSON.stringify(payload),
    }),

  setRateRange: (token: string, roomId: string, payload: {
    start_date: string; end_date: string; price?: number; available_count?: number; is_blocked?: boolean;
  }) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/rates/range`, token, {
      method: "PUT", body: JSON.stringify(payload),
    }),

  clearRateDate: (token: string, roomId: string, date: string) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/rates/date/${date}`, token, { method: "DELETE" }),

  // ── Inventory calendar ─────────────────────────────────────────────────────
  getInventoryCalendar: (token: string, roomId: string, year: number, month: number) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/inventory?year=${year}&month=${month}`, token),

  setInventoryDate: (token: string, roomId: string, payload: { date: string; available_count: number | null; note?: string }) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/inventory/date`, token, {
      method: "PUT", body: JSON.stringify(payload),
    }),

  setInventoryRange: (token: string, roomId: string, payload: { start_date: string; end_date: string; available_count: number }) =>
    partnerFetch<any>(`/v1/partner/rooms/${roomId}/inventory/range`, token, {
      method: "PUT", body: JSON.stringify(payload),
    }),
};

// ── Partner auth (register as partner) — separate export ───────────────────────────────────────
export const partnerAuthApi = {
  register: (token: string, data: {
    name: string; email: string; password: string; phone: string;
  }) =>
    partnerFetch("/v1/auth/register", token, {
      method: "POST",
      body: JSON.stringify({ ...data, role: "partner" }),
    }),
};