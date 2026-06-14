/**
 * Hotel layout.
 *
 * REMOVED: export const dynamic = "force-dynamic"
 *
 * This was the root cause of ALL hotel pages being slow — a layout-level
 * force-dynamic overrides every child page's own revalidate setting.
 * Even though [hotelId]/page.tsx had `revalidate = 30`, the layout was
 * silently cancelling it and forcing a full SSR on every visit.
 *
 * Each page now controls its own caching:
 *   hotel/[slug]/page.tsx          → force-dynamic (search results, user filters)
 *   hotel/[slug]/[hotelId]/page.tsx → revalidate = 30 (detail, semi-static)
 */
export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return children;
}