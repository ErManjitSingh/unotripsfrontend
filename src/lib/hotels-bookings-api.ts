/**
 * Hotel bookings API
 * @see https://unohotels-backend.onrender.com/docs
 */

import { apiDataWithAuth } from "@/lib/api";
import type { UserBooking } from "@/lib/hotels-account-api";

export type GuestInfoPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code?: string;
  special_requests?: string | null;
};

export type CreateBookingPayload = {
  hotel_id: string;
  room_type_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children?: number;
  rooms?: number;
  guest: GuestInfoPayload;
  payment_method_nonce?: string | null;
};

export type BookingWithOrder = UserBooking & {
  razorpay_order_id?: string | null;
};

export function isIncompleteBookingStatus(status: string): boolean {
  const s = (status || "pending").toLowerCase().trim();
  if (!s) return true;
  if (isConfirmedBookingStatus(s)) return false;
  if (s === "cancelled" || s === "canceled" || s === "failed" || s === "refunded") {
    return false;
  }
  return (
    s === "pending" ||
    s === "payment_pending" ||
    s === "awaiting_payment" ||
    s === "created" ||
    s === "unpaid" ||
    s.includes("pending") ||
    s.includes("payment")
  );
}

export function isConfirmedBookingStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "confirmed" || s === "completed" || s === "paid";
}

export async function createHotelBooking(
  accessToken: string,
  payload: CreateBookingPayload,
): Promise<BookingWithOrder> {
  return apiDataWithAuth<BookingWithOrder>("/v1/bookings", accessToken, {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      children: payload.children ?? 0,
      rooms: payload.rooms ?? 1,
    }),
  });
}

export async function verifyHotelBookingPayment(
  accessToken: string,
  bookingId: string,
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
): Promise<Record<string, unknown>> {
  return apiDataWithAuth<Record<string, unknown>>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/verify-payment`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function cancelHotelBooking(
  accessToken: string,
  bookingId: string,
): Promise<UserBooking> {
  return apiDataWithAuth<UserBooking>(
    `/v1/bookings/${encodeURIComponent(bookingId)}/cancel`,
    accessToken,
    { method: "POST" },
  );
}
