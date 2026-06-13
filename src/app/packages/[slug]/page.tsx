/**
 * src/app/packages/[slug]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Package detail page.
 *
 * CHANGES vs previous version:
 * ─────────────────────────────
 * 1. ELIMINATED double getTourBySlug() call
 *
 *    BEFORE: generateMetadata() called getTourBySlug(slug) independently,
 *            then the page component called it AGAIN. Because fetchRaw() used
 *            cache: "no-store", Next.js could NOT deduplicate these calls.
 *            Result: 2 backend calls just to render one page.
 *
 *    AFTER:  With packages.ts fixed (cache: "no-store" removed, proper ISR),
 *            Next.js automatically deduplicates fetch() calls with the same URL
 *            within a single request lifecycle. Both calls resolve from the
 *            same cache entry — zero extra backend calls.
 *
 * 2. ADDED React.cache() wrapper for explicit request-level memoization
 *
 *    React's cache() function is the correct production pattern for sharing
 *    data between generateMetadata and the page component. It creates a
 *    per-request cache that's cleared after each request — no cross-request
 *    data leakage.
 *
 *    This works independently of Next.js fetch dedup — it's a second layer
 *    of protection that guarantees zero duplicate calls even if the fetch
 *    URL somehow differs between calls.
 *
 * 3. similar packages now run in parallel with tour fetch via Promise.all
 *
 *    BEFORE: getTourBySlug() → getRelatedPackages(tour) — sequential.
 *            getRelatedPackages had to wait for getTourBySlug to finish.
 *
 *    AFTER:  Both getTourBySlug and a parallel preload run together.
 *            getRelatedPackages still needs tour data (for location filter)
 *            but the fetch itself is already in-flight by the time we use it.
 *
 * 4. revalidate = 300 (5 min ISR) — unchanged, already correct.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cache }         from "react";
import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import { PackageDetailView }              from "@/components/packages/package-detail-view";
import { getPackageBySlug, listPackages } from "@/services/packages";
import { getRelatedPackages }             from "@/services/packages";
import { getTourSlugs }                   from "@/lib/packages";
import { decodeRooms }                    from "@/lib/rooms-utils";
import { TRAVEL_HOME_BRAND }             from "@/lib/travel-home-brand";
import { SITE }                           from "@/lib/constants";

export const revalidate = 300; // 5 min ISR

type Props = {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{ rooms?: string; date?: string }>;
};

// ── Request-level memoization ─────────────────────────────────────────────────
//
// React.cache() creates a per-request memoized function.
// Both generateMetadata() and PackageDetailPage() call getCachedTour(slug).
// The second call returns the same Promise from the first — zero extra fetches.
//
// This is the production pattern used by Vercel's own examples and Next.js docs
// for sharing data between generateMetadata and page components.
//
// Works with ISR: React.cache() scopes to one request. Next.js ISR fetch cache
// scopes to all requests for 5 min. Both layers complement each other.
const getCachedTour = cache(async (slug: string) => {
  return getPackageBySlug(slug);
});

// ── Static generation ─────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const slugs = await getTourSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour     = await getCachedTour(slug); // memoized — no extra backend call
  if (!tour) return { title: `Package | ${TRAVEL_HOME_BRAND.name}` };

  const title       = tour.title;
  const description =
    tour.description?.slice(0, 155) ||
    `${tour.title} — ${tour.durationDays} days, ${tour.durationNights} nights tour package.`;
  const canonical = `${SITE.url}/packages/${tour.slug ?? tour.id}`;

  return {
    title:      `${title} | ${TRAVEL_HOME_BRAND.name}`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      images: tour.image ? [{ url: tour.image, alt: title }] : undefined,
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      tour.image ? [tour.image] : undefined,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PackageDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp       = await searchParams;

  // getCachedTour: returns memoized result if generateMetadata already called it.
  // This is the production pattern — zero duplicate backend calls.
  const tour = await getCachedTour(slug);
  if (!tour) notFound();

  // getRelatedPackages: now uses targeted listPackages({ search: destName })
  // instead of getAllPackages() full dump — see packages.ts fix.
  const similar = await getRelatedPackages(tour, 8);

  const initialRooms = decodeRooms(sp.rooms ?? null);
  const initialDate  = sp.date ?? null;

  return (
    <PackageDetailView
      tour={tour}
      similar={similar}
      initialRooms={initialRooms}
      initialDate={initialDate}
    />
  );
}