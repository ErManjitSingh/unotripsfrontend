/**
 * Account API — profile & bookings
 * @see https://unohotels-backend.onrender.com/docs
 */

import { apiDataWithAuth } from "@/lib/api";
import type { AuthUser } from "@/lib/hotels-auth-api";

/** Browser → /api/account/* (server proxy with Render wake-up). SSR → /v1/account/* direct. */
function accountApiPath(segment: string): string {
  const path = segment.startsWith("/") ? segment : `/${segment}`;
  const normalized = path.startsWith("/v1/account") ? path : `/v1/account${path}`;
  if (typeof window !== "undefined") {
    return `/api/account${normalized.replace(/^\/v1\/account/, "")}`;
  }
  return normalized;
}

export type UserBooking = {
  id: string;
  confirmation_number: string;
  status: string;
  hotel_id: string;
  hotel_slug?: string;
  hotel_name: string;
  hotel_city: string;
  hotel_thumbnail: string;
  room_type_id: string;
  room_name: string;
  meal_plan?: string | null;
  meal_plan_label?: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  children_ages?: number[];
  rooms: number;
  guest?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    special_requests?: string | null;
  };
  amount_breakdown?: {
    room_charges: number;
    meal_charges: number;
    child_charges: number;
    taxes: number;
    service_fee: number;
    discount: number;
    total: number;
  };
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export async function fetchUserProfile(accessToken: string): Promise<AuthUser> {
  return apiDataWithAuth<AuthUser>(accountApiPath("/v1/account/profile"), accessToken);
}

export const fetchAccountProfile = fetchUserProfile;

export async function updateAccountProfile(
  accessToken: string,
  payload: { name?: string; phone?: string | null },
): Promise<AuthUser> {
  return apiDataWithAuth<AuthUser>(accountApiPath("/v1/account/profile"), accessToken, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchUserBookings(accessToken: string): Promise<UserBooking[]> {
  const data = await apiDataWithAuth<UserBooking[] | { items?: UserBooking[] }>(
    "/v1/bookings",
    accessToken,
  );
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function fetchBookingById(accessToken: string, bookingId: string): Promise<UserBooking> {
  return apiDataWithAuth<UserBooking>(`/v1/bookings/${bookingId}`, accessToken);
}

export async function changeAccountPassword(
  accessToken: string,
  payload: { current_password: string; new_password: string },
): Promise<{ message?: string }> {
  return apiDataWithAuth<{ message?: string }>(
    accountApiPath("/v1/account/change-password"),
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
