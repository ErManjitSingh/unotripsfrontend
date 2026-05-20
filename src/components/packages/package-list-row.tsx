import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Car,
  Headphones,
  Heart,
  Info,
  MapPinned,
  Plane,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { QuickEnquiryTrigger } from "@/components/enquiry/quick-enquiry";
import { Button } from "@/components/ui/button";
import type { TourPackage } from "@/lib/constants";
import { packageDetailHref } from "@/lib/packages";
import { cn, formatInrAmount } from "@/lib/utils";

const INCLUSION_BASE = [
  { Icon: Building2, label: "Hotel" },
  { Icon: UtensilsCrossed, label: "Meals" },
  { Icon: Car, label: "Transfers" },
  { Icon: MapPinned, label: "Sightseeing" },
  { Icon: Headphones, label: "24×7" },
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
    { Icon: Car, label: "Airport" },
  ];
  return withFlights.slice(0, 6);
}

function PackageInclusionsStrip({ tour }: { tour: TourPackage }) {
  const items = listingInclusions(tour);
  return (
    <div
      className="mt-2 flex min-w-0 flex-nowrap items-center gap-x-2 overflow-x-auto text-[10px] text-slate-600 sm:text-[11px]"
      role="list"
      aria-label="Typical package inclusions"
    >
      <span className="shrink-0 font-semibold text-slate-500">Includes</span>
      <span className="shrink-0 text-slate-400" aria-hidden>
        :
      </span>
      {items.map(({ Icon, label }, i) => (
        <span key={label} className="flex shrink-0 items-center gap-1" role="listitem">
          {i > 0 ? (
            <span className="px-1.5 text-slate-300" aria-hidden>
              |
            </span>
          ) : null}
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          <span className="whitespace-nowrap">{label}</span>
        </span>
      ))}
    </div>
  );
}

function showAsbmBadge(tour: TourPackage): boolean {
  let s = 0;
  for (let i = 0; i < (tour.id?.length ?? 0); i++) s += tour.id!.charCodeAt(i);
  return s % 2 === 0;
}

export function PackageListRow({
  tour,
  showPopularTag,
}: {
  tour: TourPackage;
  showPopularTag?: boolean;
}) {
  const href = packageDetailHref(tour);
  const countries = tour.countries ?? 1;
  const cities = tour.cities ?? 3;
  const fullStars = Math.min(5, Math.round(tour.rating));
  const tag = tour.packageType ?? "Holiday package";
  const familyish = /family|honeymoon|beach/i.test(tag + tour.title);
  const destinationLabel = tour.location?.trim();
  const asbm = showAsbmBadge(tour);

  return (
    <article className="overflow-hidden rounded-md border border-[#e0e0e0] bg-white shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] transition hover:shadow-md">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,220px)] xl:grid-cols-[minmax(0,240px)_1fr_minmax(0,228px)]">
        {/* Image */}
        <div className="relative aspect-[5/4] min-h-[168px] w-full bg-slate-100 sm:min-h-[176px] lg:aspect-auto lg:min-h-[188px]">
          <Image src={tour.image} alt={tour.title} fill className="object-cover" sizes="(max-width:1024px)100vw,240px" />
          {showPopularTag ? (
            <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-900 shadow">
              Popular Today
            </span>
          ) : null}
          <button
            type="button"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-white text-slate-600 shadow"
            aria-label="Save"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col border-t border-[#e0e0e0] p-4 sm:p-5 lg:border-l lg:border-t-0 lg:border-[#e0e0e0]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-orange-300/70 bg-gradient-to-br from-orange-50 to-orange-100/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-950 shadow-sm ring-1 ring-orange-200/50">
              Group tour
            </span>
            {asbm ? (
              <span className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-700">
                ASBM
              </span>
            ) : null}
            {familyish ? (
              <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                Family
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
            <Link href={href} className="hover:text-primary hover:underline">
              {tour.title}
            </Link>
          </h2>
          {destinationLabel ? (
            <p className="mt-1 text-[11px] font-semibold text-slate-700 sm:text-xs">{destinationLabel}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-700 sm:text-xs">
            <span className="flex items-center gap-0.5 text-amber-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", i < fullStars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
                />
              ))}
            </span>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <span>{formatInrAmount(tour.reviewCount)} Reviews</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 sm:text-xs">
            <span>All Inclusive</span>
            <Info className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
            {tour.durationDays} Days | {tour.durationNights} Nights{" "}
            {destinationLabel ? (
              <>
                | <span className="font-semibold text-slate-800">Destination:</span> {destinationLabel}{" "}
              </>
            ) : (
              <>
                | {countries} {countries === 1 ? "Country" : "Countries"} | {cities} Cities
              </>
            )}
          </p>
          <PackageInclusionsStrip tour={tour} />
        </div>

        {/* Price + CTAs */}
        <div className="flex flex-col justify-center border-t border-[#e0e0e0] bg-slate-50 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <p className="text-[11px] leading-snug text-slate-600">
            Starts from{" "}
            <span className="text-base font-bold text-slate-900 sm:text-lg">₹{formatInrAmount(tour.priceINR)}</span>{" "}
            <span className="mt-0.5 block text-[10px] font-normal sm:inline sm:text-[11px]">per person on twin sharing</span>
          </p>
          <Button
            asChild
            className="mt-4 h-9 w-full rounded-md border-0 bg-accent text-xs font-bold text-slate-900 hover:bg-accent/90 sm:h-10 sm:text-sm"
          >
            <Link href={href}>Book Online</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="mt-2 h-9 w-full rounded-md border-2 border-primary bg-white text-xs font-bold text-primary hover:bg-primary/5 sm:h-10 sm:text-sm"
          >
            <Link href={href}>View Tour Details</Link>
          </Button>
          <div className="mt-3 flex items-center justify-center border-t border-[#e0e0e0] pt-3 text-[11px] font-semibold text-primary">
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
