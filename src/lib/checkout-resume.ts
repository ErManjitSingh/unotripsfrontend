/**
 * Resume incomplete checkout — `/checkout/resume` (dynamic app route).
 * Avoids dynamic `/hotel/[slug]/[hotelId]/book` paths that must be pre-built.
 */

export type CheckoutResumeParams = {
  citySlug: string;
  hotelSlug: string;
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  bookingId?: string;
};

export function checkoutResumeHref(params: CheckoutResumeParams): string {
  const q = new URLSearchParams({
    city: params.citySlug,
    hotel: params.hotelSlug,
    roomType: params.roomTypeId,
    rate: params.ratePlanId,
    check_in: params.checkIn,
    check_out: params.checkOut,
    rooms: String(params.rooms),
    guests: String(params.guests),
    resume: "1",
  });
  if (params.bookingId) q.set("booking_id", params.bookingId);
  return `/checkout/resume?${q.toString()}`;
}
