"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** Swiper + webpack/Next कभी-कभी SSR चंक में टूटता है — सिर्फ़ क्लाइंट पर लोड करें। */

export const TrendingToursCarousel = dynamic(
  () =>
    import("@/components/home/trending-tours-carousel").then((m) => ({
      default: m.TrendingToursCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[22rem] w-full gap-4 overflow-hidden pb-4 pt-1"
        aria-hidden
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[min(100%,280px)] shrink-0 space-y-3">
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    ),
  },
);

export const TestimonialsCarousel = dynamic(
  () =>
    import("@/components/home/testimonials-carousel").then((m) => ({
      default: m.TestimonialsCarousel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-4 overflow-hidden pb-12" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[14rem] w-[min(100%,320px)] shrink-0 space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((__, j) => (
                <Skeleton key={j} className="h-4 w-4 rounded-sm" />
              ))}
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    ),
  },
);
