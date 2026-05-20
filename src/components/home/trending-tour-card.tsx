"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, MapPin, Star } from "lucide-react";
import type { TourPackage } from "@/lib/constants";
import { packageDetailHref } from "@/lib/packages";
import { cn, formatInrAmount } from "@/lib/utils";

function scoreOutOf10(rating: number): number {
  return Math.round((rating / 5) * 100) / 10;
}

function reviewLabel(score10: number): string {
  if (score10 >= 9.2) return "Wonderful";
  if (score10 >= 8.8) return "Excellent";
  if (score10 >= 8.2) return "Very Good";
  if (score10 >= 7.5) return "Good";
  return "Pleasant";
}

export function TrendingTourCard({ tour }: { tour: TourPackage }) {
  const [saved, setSaved] = useState(false);
  const score10 = useMemo(() => scoreOutOf10(tour.rating), [tour.rating]);
  const label = useMemo(() => reviewLabel(score10), [score10]);
  const fullStars = Math.min(5, Math.round(tour.rating));

  const packageType = tour.packageType ?? "Holiday package";
  const location = tour.location ?? "India";
  const distance = tour.distanceFromCentreKm ?? 10;
  const detailHref = packageDetailHref(tour);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.12)] transition hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]">
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-t-xl bg-slate-100">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <Link href={detailHref} className="absolute inset-0 z-0" aria-label={`View ${tour.title}`} />
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className="absolute right-2.5 top-2.5 z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-md transition hover:scale-105"
          aria-label={saved ? "Remove from saved" : "Save package"}
        >
          <Heart
            className={cn("h-4 w-4", saved ? "fill-red-500 text-red-500" : "text-slate-600")}
            aria-hidden
          />
        </button>
      </div>

      <Link
        href={detailHref}
        className="group flex flex-1 flex-col gap-1.5 p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:p-3.5"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600 sm:text-xs">
          <span className="font-medium">{packageType}</span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${tour.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3 sm:h-3.5 sm:w-3.5",
                  i < fullStars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200",
                )}
                aria-hidden
              />
            ))}
          </span>
          {tour.showMemberPrice ? (
            <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Member price
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-left text-[15px] font-bold leading-snug text-slate-900 group-hover:underline sm:text-base">
          {tour.title}
        </h3>
        <p className="line-clamp-1 text-left text-xs text-slate-500 sm:text-[13px]">{location}</p>

        <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
          <span className="flex h-8 min-w-[2rem] items-center justify-center rounded bg-primary px-1.5 text-sm font-bold text-white">
            {score10.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <span className="text-xs text-slate-500">{formatInrAmount(tour.reviewCount)} reviews</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span>{distance.toFixed(1)} km from centre</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] text-slate-500">Starting from</p>
            {tour.oldPriceINR ? (
              <p className="text-xs text-slate-400 line-through">
                ₹ {formatInrAmount(tour.oldPriceINR)}
              </p>
            ) : null}
            <p className="text-lg font-bold text-slate-900 sm:text-xl">
              ₹ {formatInrAmount(tour.priceINR)}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border-2 border-primary bg-white px-3 py-2 text-center text-xs font-bold text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white sm:px-3.5 sm:text-sm">
            View details
          </span>
        </div>
      </Link>
    </article>
  );
}
