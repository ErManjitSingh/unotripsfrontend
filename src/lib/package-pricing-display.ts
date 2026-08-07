/**
 * src/lib/package-pricing-display.ts
 *
 * DISPLAY-ONLY pricing helpers for the package discovery + booking surfaces.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THIS FILE CALCULATES NOTHING THE CUSTOMER IS CHARGED.
 *
 * Every rupee the customer actually pays comes from the backend:
 *   POST /v1/packages/{slug}/fulfillment-price → grand_total / token_amount
 * Nothing here feeds an order, a Razorpay amount, or a booking payload. These
 * are presentation transforms only (per-person split on a listing tile,
 * offer copy).
 * ══════════════════════════════════════════════════════════════════════════
 */

/** Package listing price basis, mirroring TourPackage.pricePer. */
export type PricePer = "per_person" | "per_couple" | "per_group";

/** Persons a `per_couple` price is quoted for (twin sharing). */
const COUPLE_OCCUPANCY = 2;

/**
 * Split a listing total into a "starts from, per person" figure.
 *
 * The listing API only exposes `priceINR` (the whole-trip figure Ops entered)
 * plus its basis. The old card hardcoded `priceINR / 2`, which silently
 * halved per_person packages and per_group packages alike. This respects the
 * basis instead.
 *
 * Returns null for `per_group`, where a per-head number is meaningless — the
 * caller should show only the total.
 */
export function perPersonFromListing(
  totalInr: number,
  pricePer: PricePer = "per_couple",
): number | null {
  if (!Number.isFinite(totalInr) || totalInr <= 0) return null;
  switch (pricePer) {
    case "per_person":
      return Math.round(totalInr);
    case "per_group":
      return null;
    case "per_couple":
    default:
      return Math.round(totalInr / COUPLE_OCCUPANCY);
  }
}

/**
 * What a `per_couple` / `per_person` listing total represents end-to-end.
 * `per_person` tiles quote per head, so the trip total for the default
 * occupancy is the per-head price × 2; the other bases already are the total.
 */
export function tripTotalFromListing(
  totalInr: number,
  pricePer: PricePer = "per_couple",
): number {
  if (!Number.isFinite(totalInr) || totalInr <= 0) return 0;
  return pricePer === "per_person"
    ? Math.round(totalInr * COUPLE_OCCUPANCY)
    : Math.round(totalInr);
}

// ── Indicative EMI ───────────────────────────────────────────────────────────
//
// REMOVED. `indicativeMonthlyEmi()` used to return Math.ceil(total / 12) — a
// flat division with no interest, no processing fee and no issuer eligibility,
// rendered as "From ₹X/month for 12 months". No frontend EMI arithmetic lives
// here any more, and none should be reintroduced.
//
// EMI figures now come from exactly one place: the Razorpay Affordability
// Widget (src/components/payments/AffordabilityWidget.tsx), which is handed the
// payable amount and returns Razorpay's own plans, tenures, banks and rates.

// ── Offer visibility ─────────────────────────────────────────────────────────

/**
 * Single switchboard for promotional messaging across every package surface.
 *
 * `bankOffers` ships OFF on purpose: "Bank Offers Available" is a factual
 * claim about what the customer will find at checkout. Turn it on only once
 * live bank offers are actually configured on the Razorpay account — an empty
 * promise at the payment step costs more trust than the badge wins.
 */
export const PACKAGE_OFFERS = {
  /**
   * Show the static "EMI available at checkout" label on listing surfaces.
   * Carries no figure and no tenure — see PackageEmiNote.
   */
  emiTeaser: true,
  /** Show the "Bank offers at payment" chip. See note above before enabling. */
  bankOffers: false,
} as const;
