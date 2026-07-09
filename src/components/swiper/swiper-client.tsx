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

