"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Car,
  Headphones,
  Heart,
  Info,
  MapPinned,
  Plane,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { QuickEnquiryTrigger } from "@/components/enquiry/quick-enquiry";
import { Button } from "@/components/ui/button";
import type { TourPackage } from "@/lib/constants";
import { formatTourType, packageDetailHref } from "@/lib/packages";
import { cn, formatInrAmount } from "@/lib/utils";

const INCLUSION_BASE = [
  { Icon: Building2, label: "Hotel" },
  { Icon: UtensilsCrossed, label: "Meals" },
  { Icon: Car, label: "Transfers" },
  { Icon: MapPinned, label: "Sightseeing" },
  { Icon: Headphones, label: "24×7 Support" },
] as const;

function listingInclusions(tour: TourPackage) {
  const hay = `${tour.title} ${tour.location ?? ""} ${tour.description ?? ""}`.toLowerCase();
  const looksIntl =
    (tour.countries ?? 1) > 1 ||
    /\b(flight|airfare|international|europe|dubai|maldives|japan|thailand|vietnam|bali|singapore|switzerland|usa|uk|paris)\b/i.test(
      hay,
    );
  if (!looksIntl) return [...INCLUSION_BASE];
  const withFlights = [
    { Icon: Plane, label: "Flights" },
    ...INCLUSION_BASE.filter((x) => x.label !== "Transfers"),
    { Icon: Car, label: "Airport Transfers" },
  ];
  return withFlights.slice(0, 6);
}

function PackageInclusionsStrip({ tour }: { tour: TourPackage }) {
  const items = listingInclusions(tour);
  return (
    <div
      className="mt-3 flex flex-wrap gap-1.5"
      role="list"
      aria-label="Typical package inclusions"
    >
      {items.map(({ Icon, label }) => (
        <span
          key={label}
          role="listitem"
          className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
        >
          <Icon className="h-3 w-3 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

export function PackageListRow({
  tour,
  showPopularTag,
}: {
  tour: TourPackage;
  showPopularTag?: boolean;
}) {
  const router = useRouter();
  const href = packageDetailHref(tour);
  const fullStars = Math.min(5, Math.round(tour.rating));
  const hasReviews = tour.reviewCount > 0;
  const destinationLabel = tour.location?.trim();
  const typeLabel = formatTourType(tour.packageType);

  return (
    <article
      onClick={() => router.push(href)}
      className="cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_16px_-6px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.18)]">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,240px)_1fr_minmax(0,220px)]">
        {/* Image */}
        <div className="relative aspect-[5/4] min-h-[180px] w-full bg-slate-100 lg:aspect-auto lg:min-h-[200px]">
          <Image src={tour.image} alt={tour.title} fill className="object-cover" sizes="(max-width:1024px)100vw,240px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden />
          {showPopularTag ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm backdrop-blur-sm">
              Popular Today
            </span>
          ) : null}
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm transition hover:text-primary"
            aria-label="Save"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
          <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {tour.durationDays}D / {tour.durationNights}N
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col border-t border-slate-100 p-5 lg:border-l lg:border-t-0">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
            {typeLabel}
          </span>

          <h2 className="mt-3 text-base font-bold leading-snug text-slate-900">
            <Link href={href} className="hover:text-primary hover:underline">
              {tour.title}
            </Link>
          </h2>

          {destinationLabel ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPinned className="h-3 w-3 shrink-0" aria-hidden />
              {destinationLabel}
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {hasReviews ? (
              <>
                <span className="flex items-center gap-0.5 text-amber-500" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-3.5 w-3.5", i < fullStars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
                    />
                  ))}
                </span>
                <span>{formatInrAmount(tour.reviewCount)} Reviews</span>
                <span className="text-slate-300" aria-hidden>|</span>
              </>
            ) : (
              <>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  New listing
                </span>
                <span className="text-slate-300" aria-hidden>|</span>
              </>
            )}
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              All Inclusive
              <Info className="h-3 w-3 text-emerald-600" aria-hidden />
            </span>
          </div>

          <PackageInclusionsStrip tour={tour} />
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col justify-center border-t border-slate-100 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
          <p className="text-xs leading-snug text-slate-600">
            Starts from{" "}
            <span className="block text-xl font-bold text-slate-900">₹{formatInrAmount(tour.priceINR)}</span>
            <span className="text-[11px] text-slate-500">per person on twin sharing</span>
          </p>
          <Button
            asChild
            onClick={(e) => e.stopPropagation()}
            className="mt-4 h-10 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-sm hover:bg-primary/90"
          >
            <Link href={href}>View Details</Link>
          </Button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex items-center justify-center border-t border-slate-200 pt-3 text-xs font-semibold text-primary"
          >
            <QuickEnquiryTrigger
              tourTitle={tour.title}
              tourSku={`${(tour.slug ?? tour.id).slice(0, 8).toUpperCase()}`}
              label="Enquire now"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
