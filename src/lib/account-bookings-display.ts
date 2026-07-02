/**
 * Merge API/cache bookings with local pending checkouts for the account dashboard.
 */

import type { UserBooking } from "@/lib/hotels-account-api";
import { isIncompleteBookingStatus } from "@/lib/hotels-bookings-api";
import {
  getPendingCheckoutsForUser,
  pendingCheckoutAsBooking,
  removePendingCheckout,
  savePendingCheckout,
  type PendingCheckout,
} from "@/lib/pending-checkout-storage";
import { hotelListingPathSlug } from "@/lib/hotels-catalog";

export type IncompleteDisplay = {
  incompleteFromBookings: UserBooking[];
  incompleteFromLocal: PendingCheckout[];
  incompleteCount: number;
};

/** Sync local pending-checkout storage with the latest API bookings.
 *  - Adds/updates entries for bookings still pending payment.
 *  - Removes entries whose booking is now confirmed/cancelled/completed.
 *  - Prunes local-only entries older than 48 h with no matching API booking.
 */
export function syncPendingCheckoutsFromBookings(
  userId: string,
  email: string,
  bookings: UserBooking[],
  citySlugFromBooking?: (b: UserBooking) => string | undefined,
): void {
  const emailLower = email.trim().toLowerCase();
  const existingPending = getPendingCheckoutsForUser(userId, email);

  // Build a set of booking IDs that are confirmed/done so we can purge stale localStorage entries.
  const resolvedIds = new Set<string>();
  for (const b of bookings) {
    if (!isIncompleteBookingStatus(b.status)) {
      resolvedIds.add(b.id);
    }
  }

  // Remove localStorage entries whose API booking is now confirmed/cancelled.
  for (const p of existingPending) {
    if (p.bookingId && resolvedIds.has(p.bookingId)) {
      removePendingCheckout(p.id);
    }
  }

  // Prune local-only entries older than 48 hours (from abandoned test sessions, etc.)
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const apiBookingIds = new Set(bookings.map((b) => b.id));
  for (const p of existingPending) {
    if (!p.bookingId && p.createdAt < cutoff) {
      removePendingCheckout(p.id);
    }
    if (p.bookingId && !apiBookingIds.has(p.bookingId) && p.createdAt < cutoff) {
      removePendingCheckout(p.id);
    }
  }

  // Add/update entries for bookings still genuinely pending.
  const refreshedPending = getPendingCheckoutsForUser(userId, email);
  for (const b of bookings) {
    if (!isIncompleteBookingStatus(b.status)) continue;
    const prev = refreshedPending.find((p) => p.bookingId === b.id);
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
