"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Heart, MapPin, Star, Users } from "lucide-react";
import type { TourPackage } from "@/lib/constants";
import { packageDetailHref } from "@/lib/packages";
import { cn, formatInrAmount } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80";

/** Ensure the image URL is an absolute HTTPS URL, else use placeholder. */
function safeImage(url: string | null | undefined): string {
  const u = (url ?? "").trim();
  return u && (/^https?:\/\//i.test(u) || u.startsWith("data:")) ? u : PLACEHOLDER_IMAGE;
}

// ── Rating helpers ────────────────────────────────────────────────────────────

function scoreOutOf10(rating: number): number {
  return Math.round((rating / 5) * 100) / 10;
}

function reviewLabel(score10: number): string {
  if (score10 >= 9.2) return "Wonderful";
  if (score10 >= 8.8) return "Excellent";
  if (score10 >= 8.2) return "Very Good";
  if (score10 >= 7.5) return "Good";
  if (score10 >= 0.1) return "Pleasant";
  return "New";
}

// ── Tour type badge colour ────────────────────────────────────────────────────

function tourTypeBadgeClass(packageType: string): string {
  const t = packageType.toLowerCase();
  if (t.includes("honeymoon"))    return "bg-rose-50 text-rose-700 border-rose-200";
  if (t.includes("adventure"))    return "bg-amber-50 text-amber-700 border-amber-200";
  if (t.includes("family"))       return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (t.includes("international")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (t.includes("weekend"))      return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-orange-50 text-orange-700 border-orange-200";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrendingTourCard({ tour }: { tour: TourPackage }) {
  const [saved, setSaved] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => safeImage(tour.image));

  const hasRating  = tour.rating > 0;
  const score10    = useMemo(() => scoreOutOf10(tour.rating), [tour.rating]);
  const label      = useMemo(() => reviewLabel(score10), [score10]);
  const fullStars  = Math.min(5, Math.round(tour.rating));

  const packageType    = (tour.packageType ?? "Holiday").replace(/\s+package$/i, "");
  const location       = tour.location ?? "";
  const detailHref     = packageDetailHref(tour);
  const badgeClass     = tourTypeBadgeClass(packageType);

  const hasDiscount    = Boolean(tour.oldPriceINR && tour.oldPriceINR > tour.priceINR);
  const discountPct    = hasDiscount && tour.discountPct ? tour.discountPct : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.10)] transition hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16)]">

      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-t-xl bg-slate-100">
        <Image
          src={imgSrc}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />

        {/* Discount badge */}
        {discountPct ? (
          <span className="absolute left-2.5 top-2.5 z-[1] rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            {discountPct}% OFF
          </span>
        ) : null}

        {/* Package type badge */}
        <span
          className={cn(
            "absolute bottom-2.5 left-2.5 z-[1] rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize",
            badgeClass,
          )}
        >
          {packageType}
        </span>

        {/* Save button */}
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

        {/* Invisible link overlay */}
        <Link href={detailHref} className="absolute inset-0 z-0" aria-label={`View ${tour.title}`} />
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <Link
        href={detailHref}
        className="group flex flex-1 flex-col gap-1.5 p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:p-3.5"
      >

        {/* Title */}
        <h3 className="line-clamp-2 text-left text-[15px] font-bold leading-snug text-slate-900 group-hover:underline sm:text-base">
          {tour.title}
        </h3>

        {/* Location */}
        {location ? (
          <p className="flex items-center gap-1 text-left text-xs text-slate-500 sm:text-[13px]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="line-clamp-1">{location}</span>
          </p>
        ) : null}

        {/* Duration */}
        <p className="flex items-center gap-1 text-xs text-slate-600">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span>
            {tour.durationDays} Days / {tour.durationNights} Nights
          </span>
        </p>

        {/* Rating row — only shown when the package has actual reviews */}
        {hasRating ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="flex h-7 min-w-[2rem] items-center justify-center rounded bg-primary px-1.5 text-xs font-bold text-white">
              {score10.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-slate-800">{label}</span>
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
            {tour.reviewCount > 0 ? (
              <span className="text-xs text-slate-500">
                {formatInrAmount(tour.reviewCount)} reviews
              </span>
            ) : null}
          </div>
        ) : (
          /* No reviews yet — show a neutral "New" pill */
          <div className="mt-0.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
              New
            </span>
          </div>
        )}

        {/* Inclusions strip */}
        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
          <Users className="h-3 w-3 shrink-0" aria-hidden />
          <span>Hotel · Meals · Transfers · Sightseeing included</span>
        </p>

        {/* ── Price + CTA ─────────────────────────────────────────────────── */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] text-slate-500">Starting from</p>
            {hasDiscount && tour.oldPriceINR ? (
              <p className="text-xs text-slate-400 line-through">
                ₹ {formatInrAmount(tour.oldPriceINR)}
              </p>
            ) : null}
            <p className="text-lg font-bold text-slate-900 sm:text-xl">
              ₹ {formatInrAmount(tour.priceINR)}
            </p>
            <p className="text-[10px] text-slate-400">per person</p>
          </div>

          <span className="shrink-0 rounded-lg border-2 border-primary bg-white px-3 py-2 text-center text-xs font-bold text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white sm:px-3.5 sm:text-sm">
            View details
          </span>
        </div>
      </Link>
    </article>
  );
}