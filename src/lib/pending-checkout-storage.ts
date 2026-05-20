/**
 * Local incomplete checkouts — shown on account when user left before paying.
 * Synced with API pending bookings when user is logged in.
 */

import { checkoutResumeHref } from "@/lib/checkout-resume";
import type { UserBooking } from "@/lib/hotels-account-api";

const STORAGE_KEY = "uno_pending_checkouts_v1";

export type PendingCheckout = {
  /** Local id */
  id: string;
  /** API booking id when created via POST /v1/bookings */
  bookingId?: string;
  userId?: string;
  guestEmail: string;
  hotelId: string;
  /** URL slug for /hotel/{city}/{slug}/book */
  hotelSlug?: string;
  hotelName: string;
  hotelCity: string;
  hotelThumbnail?: string;
  citySlug: string;
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  adults: number;
  totalAmount: number;
  currency: string;
  createdAt: number;
};

function readAll(): PendingCheckout[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingCheckout[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: PendingCheckout[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function savePendingCheckout(entry: Omit<PendingCheckout, "id" | "createdAt">): PendingCheckout {
  const all = readAll();
  const existing = entry.bookingId
    ? all.find((p) => p.bookingId === entry.bookingId)
    : all.find(
        (p) =>
          p.hotelId === entry.hotelId &&
          p.checkIn === entry.checkIn &&
          p.guestEmail.toLowerCase() === entry.guestEmail.toLowerCase(),
      );

  const record: PendingCheckout = {
    ...entry,
    id: existing?.id ?? `pc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: existing?.createdAt ?? Date.now(),
  };

  const next = existing
    ? all.map((p) => (p.id === existing.id ? record : p))
    : [record, ...all].slice(0, 20);

  writeAll(next);
  return record;
}

export function removePendingCheckout(idOrBookingId: string): void {
  const all = readAll().filter(
    (p) => p.id !== idOrBookingId && p.bookingId !== idOrBookingId,
  );
  writeAll(all);
}

/** Pending checkouts for logged-in user (by user id or matching email). */
export function getPendingCheckoutsForUser(userId: string, email: string): PendingCheckout[] {
  const emailLower = email.trim().toLowerCase();
  return readAll().filter(
    (p) => p.userId === userId || p.guestEmail.trim().toLowerCase() === emailLower,
  );
}

/** Attach user id to email-matched pending rows after login */
export function claimPendingCheckoutsForUser(userId: string, email: string): void {
  const emailLower = email.trim().toLowerCase();
  const all = readAll();
  let changed = false;
  const next = all.map((p) => {
    if (!p.userId && p.guestEmail.trim().toLowerCase() === emailLower) {
      changed = true;
      return { ...p, userId };
    }
    return p;
  });
  if (changed) writeAll(next);
}

export function resumeCheckoutHref(pending: PendingCheckout): string {
  return checkoutResumeHref({
    citySlug: pending.citySlug,
    hotelSlug: pending.hotelSlug ?? pending.hotelId,
    roomTypeId: pending.roomTypeId,
    ratePlanId: pending.ratePlanId,
    checkIn: pending.checkIn,
    checkOut: pending.checkOut,
    rooms: pending.rooms,
    guests: pending.guests,
    bookingId: pending.bookingId,
  });
}

/** Build a dashboard booking row from a pending checkout (when API list is unavailable). */
export function pendingCheckoutAsBooking(pending: PendingCheckout): UserBooking {
  const nights = Math.max(
    1,
    Math.round(
      (new Date(pending.checkOut).getTime() - new Date(pending.checkIn).getTime()) / 86_400_000,
    ),
  );
  return {
    id: pending.bookingId ?? pending.id,
    confirmation_number: pending.bookingId ? `PENDING-${pending.bookingId.slice(0, 8).toUpperCase()}` : "PENDING",
    status: "pending",
    hotel_id: pending.hotelId,
    hotel_name: pending.hotelName,
    hotel_city: pending.hotelCity,
    hotel_thumbnail: pending.hotelThumbnail ?? "",
    room_type_id: pending.roomTypeId,
    room_name: "Room",
    check_in: pending.checkIn,
    check_out: pending.checkOut,
    nights,
    adults: pending.adults,
    children: 0,
    rooms: pending.rooms,
    total_amount: pending.totalAmount,
    currency: pending.currency,
    created_at: new Date(pending.createdAt).toISOString(),
    updated_at: new Date(pending.createdAt).toISOString(),
  };
}
