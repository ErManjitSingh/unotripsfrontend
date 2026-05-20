/**
 * Merge API/cache bookings with local pending checkouts for the account dashboard.
 */

import type { UserBooking } from "@/lib/hotels-account-api";
import { isIncompleteBookingStatus } from "@/lib/hotels-bookings-api";
import {
  getPendingCheckoutsForUser,
  pendingCheckoutAsBooking,
  savePendingCheckout,
  type PendingCheckout,
} from "@/lib/pending-checkout-storage";
import { hotelListingPathSlug } from "@/lib/hotels-catalog";

export type IncompleteDisplay = {
  incompleteFromBookings: UserBooking[];
  incompleteFromLocal: PendingCheckout[];
  incompleteCount: number;
};

/** Re-save cached pending rows into pending-checkout storage if missing. */
export function syncPendingCheckoutsFromBookings(
  userId: string,
  email: string,
  bookings: UserBooking[],
  citySlugFromBooking?: (b: UserBooking) => string | undefined,
): void {
  const emailLower = email.trim().toLowerCase();
  const existingPending = getPendingCheckoutsForUser(userId, email);
  for (const b of bookings) {
    if (!isIncompleteBookingStatus(b.status)) continue;
    const prev = existingPending.find((p) => p.bookingId === b.id);
    savePendingCheckout({
      bookingId: b.id,
      userId,
      guestEmail: emailLower,
      hotelId: b.hotel_id,
      hotelSlug: prev?.hotelSlug ?? citySlugFromBooking?.(b),
      hotelName: b.hotel_name,
      hotelCity: b.hotel_city,
      hotelThumbnail: b.hotel_thumbnail,
      citySlug:
        prev?.citySlug ??
        citySlugFromBooking?.(b) ??
        hotelListingPathSlug(b.hotel_city.trim().toLowerCase().replace(/\s+/g, "-")),
      roomTypeId: b.room_type_id,
      ratePlanId: prev?.ratePlanId ?? b.room_type_id,
      checkIn: b.check_in,
      checkOut: b.check_out,
      rooms: b.rooms,
      guests: b.adults,
      adults: b.adults,
      totalAmount: b.total_amount,
      currency: b.currency,
    });
  }
}

export function buildIncompleteDisplay(
  bookings: UserBooking[],
  localPending: PendingCheckout[],
): IncompleteDisplay {
  const seen = new Set<string>();
  const incompleteFromBookings: UserBooking[] = [];

  for (const b of bookings) {
    if (!isIncompleteBookingStatus(b.status)) continue;
    if (seen.has(b.id)) continue;
    seen.add(b.id);
    incompleteFromBookings.push(b);
  }

  const incompleteFromLocal: PendingCheckout[] = [];
  for (const p of localPending) {
    const key = p.bookingId ?? p.id;
    if (seen.has(key)) continue;
    seen.add(key);
    incompleteFromLocal.push(p);
  }

  return {
    incompleteFromBookings,
    incompleteFromLocal,
    incompleteCount: incompleteFromBookings.length + incompleteFromLocal.length,
  };
}

export function pendingBookingsForMerge(pending: PendingCheckout[]): UserBooking[] {
  return pending.map(pendingCheckoutAsBooking);
}
