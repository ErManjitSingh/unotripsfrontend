/**
 * src/components/packages/pricing/index.ts
 *
 * Barrel for the package pricing UI kit. Import from "@/components/packages/pricing".
 *
 * AFFORDABILITY / EMI — two surfaces, two different things:
 *
 *   Real amount (POST /fulfillment-price) → <AffordabilityWidget /> from
 *   "@/components/payments/AffordabilityWidget". Razorpay returns the plans.
 *     - glacial-style-package-detail.tsx  (detail sidebar, grand_total)
 *     - package-detail-view.tsx           (book tab, payAmt)
 *     - PackageBookingSummary             (checkout aside, payAmountInr)
 *
 *   Listing estimate (pre-GST priceINR) → <PackageEmiNote />, a static label.
 *   No amount, no tenure, no SDK — a tile does not know the payable amount.
 *     - PackagePriceCard, PackageCard
 */

export { PackageEmiNote, type PackageEmiNoteProps } from "./PackageEmiNote";
export { PackageBookingSummary, type PackageBookingSummaryProps } from "./PackageBookingSummary";
export { PackageOffers, type PackageOffersProps } from "./PackageOffers";
export { PackagePriceActions, type PackagePriceActionsProps } from "./PackagePriceActions";
export { PackagePriceCard, type PackagePriceCardProps } from "./PackagePriceCard";
export {
  PackagePriceSummary,
  type PackagePriceLine,
  type PackagePriceSummaryProps,
} from "./PackagePriceSummary";
