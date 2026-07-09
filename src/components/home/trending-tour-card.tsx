"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calendar,
  Car,
  ChevronRight,
  Compass,
  Heart,
  Hotel,
  MapPin,
  Star,
  Utensils,
} from "lucide-react";
import type { TourPackage } from "@/lib/constants";
import { packageDetailHref } from "@/lib/packages";
import { cn, formatInrAmount } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80";

const INCLUSIONS = [
  { icon: Hotel,    label: "Hotel" },
  { icon: Utensils, label: "Meals" },
  { icon: Car,      label: "Transfers" },
  { icon: Compass,  label: "Sightseeing" },
] as const;

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

// ── Badge helpers ─────────────────────────────────────────────────────────────

function getTopBadge(packageType: string): {
  label: string;
  className: string;
  showStar: boolean;
} {
  const t = packageType.toLowerCase();
  if (t.includes("family"))
    return { label: "Great for Families", className: "bg-emerald-500", showStar: false };
  if (t.includes("honeymoon") || t.includes("romantic"))
    return { label: "Romantic Getaway", className: "bg-rose-500", showStar: false };
  if (t.includes("adventure"))
    return { label: "Adventure", className: "bg-amber-500", showStar: false };
  if (t.includes("beach"))
    return { label: "Beach Escape", className: "bg-purple-500", showStar: false };
  if (t.includes("luxury") || t.includes("premium"))
    return { label: "Best Seller", className: "bg-blue-600", showStar: false };
  if (t.includes("weekend"))
    return { label: "Weekend Escape", className: "bg-violet-500", showStar: false };
  if (t.includes("international"))
    return { label: "International", className: "bg-indigo-500", showStar: false };
  return { label: "Top Rated", className: "bg-primary", showStar: true };
}

function getLocationType(packageType: string): string {
  return packageType.toLowerCase().includes("international") ? "International" : "Domestic";
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrendingTourCard({ tour }: { tour: TourPackage }) {
  const [saved, setSaved] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => safeImage(tour.image));

  const hasRating = tour.rating > 0;
  const score10   = useMemo(() => scoreOutOf10(tour.rating), [tour.rating]);
  const fullStars = Math.min(5, Math.round(tour.rating));

  const packageType = (tour.packageType ?? "Holiday").replace(/\s+package$/i, "");
  const location    = tour.location ?? "";
  const detailHref  = packageDetailHref(tour);
  const topBadge    = getTopBadge(packageType);
  const locType     = getLocationType(packageType);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-8px_rgba(15,23,42,0.18)]">

      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-t-xl bg-slate-100">
        <Image
          src={imgSrc}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
        />

        {/* Top-left: category badge */}
        <span
          className={cn(
            "absolute left-2.5 top-2.5 z-[1] flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow",
            topBadge.className,
          )}
        >
          {topBadge.showStar && (
            <Star className="h-2.5 w-2.5 fill-white text-white" aria-hidden />
          )}
          {topBadge.label}
        </span>

        {/* Top-right: save button */}
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

        {/* Bottom-left: location type */}
        <span className="absolute bottom-2.5 left-2.5 z-[1] flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          {locType}
        </span>

        {/* Invisible link overlay */}
        <Link href={detailHref} className="absolute inset-0 z-0" aria-label={`View ${tour.title}`} />
      </div>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <Link
        href={detailHref}
        className="flex flex-1 flex-col gap-1.5 p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:p-3.5"
      >
        {/* Title */}
        <h3 className="truncate text-left text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
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
          <span>{tour.durationDays} Days / {tour.durationNights} Nights</span>
        </p>

        {/* Rating / New */}
        {hasRating ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="flex items-center justify-center rounded bg-emerald-700 px-1.5 py-0.5 text-xs font-bold text-white">
              {tour.rating.toFixed(1)}
            </span>
            {tour.reviewCount > 0 ? (
              <span className="text-xs text-slate-500">
                {formatInrAmount(tour.reviewCount)}+ reviews
              </span>
            ) : null}
          </div>
        ) : (
          <div className="mt-0.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
              New
            </span>
          </div>
        )}

        {/* Inclusions */}
        <div className="mt-0.5 flex flex-nowrap items-center gap-x-1 overflow-hidden">
          {INCLUSIONS.map(({ icon: Icon, label }, i) => (
            <span key={label} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300">·</span>}
              <Icon className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
              <span className="text-[11px] font-medium text-emerald-700">{label}</span>
            </span>
          ))}
        </div>

        {/* ── Price + CTA ─────────────────────────────────────────────────── */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] text-slate-500">Starting from</p>
            <p className="text-lg font-bold text-slate-900 sm:text-xl">
              ₹ {formatInrAmount(tour.priceINR)}
            </p>
            <p className="text-[10px] text-slate-400">per person</p>
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-lg border-2 border-primary bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white sm:text-sm">
            View details
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </article>
  );
}
