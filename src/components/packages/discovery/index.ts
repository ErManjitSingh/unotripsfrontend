/**
 * src/components/packages/discovery/index.ts
 *
 * Package discovery UI. Replaces the retired landscape-row stack
 * (package-list-row / package-listing-paginated / package-listing-with-search).
 *
 * Composition:
 *   PackageDiscovery
 *   └── PackageGrid
 *       └── PackageCard
 *           ├── PackageImage
 *           ├── PackageHeader
 *           ├── PackageInfo
 *           ├── PackagePricing
 *           ├── PackageCustomizeBadge            ← USP, between price and total
 *           ├── PackageEmiNote                   ← from ../pricing (static label)
 *           ├── PackageOffers                    ← from ../pricing
 *           └── PackageActions
 *   └── PackagePagination
 */

export { PackageActions, type PackageActionsProps } from "./PackageActions";
export { PackageCard, type PackageCardProps } from "./PackageCard";
export {
  PackageCustomizeBadge,
  type PackageCustomizeBadgeProps,
} from "./PackageCustomizeBadge";
export { PackageDiscovery, type PackageDiscoveryProps } from "./PackageDiscovery";
export { PackageGrid, type PackageGridProps } from "./PackageGrid";
export { PackageHeader, type PackageHeaderProps } from "./PackageHeader";
export { PackageImage, type PackageImageProps } from "./PackageImage";
export { PackageInfo, listingInclusions, type PackageInfoProps } from "./PackageInfo";
export { PackagePagination, type PackagePaginationProps } from "./PackagePagination";
export { PackagePricing, type PackagePricingProps } from "./PackagePricing";
export { PackageTrustStrip, type PackageTrustStripProps } from "./PackageTrustStrip";
