/**
 * Account API — profile & bookings
 * @see https://unohotels-backend.onrender.com/docs
 */

import { apiDataWithAuth } from "@/lib/api";
import type { AuthUser } from "@/lib/hotels-auth-api";

export type UserBooking = {
  id: string;
  confirmation_number: string;
  status: string;
  hotel_id: string;
  hotel_name: string;
  hotel_city: string;
  hotel_thumbnail: string;
  room_type_id: string;
  room_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export async function fetchUserProfile(accessToken: string): Promise<AuthUser> {
  return apiDataWithAuth<AuthUser>("/v1/account/profile", accessToken);
}

export const fetchAccountProfile = fetchUserProfile;

export async function updateAccountProfile(
  accessToken: string,
  payload: { name?: string; phone?: string | null },
): Promise<AuthUser> {
  return apiDataWithAuth<AuthUser>("/v1/account/profile", accessToken, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchUserBookings(accessToken: string): Promise<UserBooking[]> {
  return apiDataWithAuth<UserBooking[]>("/v1/bookings", accessToken);
}
