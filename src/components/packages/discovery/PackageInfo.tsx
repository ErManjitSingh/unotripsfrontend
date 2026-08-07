"use client";

/**
 * src/components/packages/discovery/PackageInfo.tsx
 *
 * The inclusions chip strip.
 *
 * ── PRESERVED VERBATIM ─────────────────────────────────────────────────────
 * The chip set and the international/flights inference are lifted unchanged
 * from the previous landscape card (package-list-row.tsx). They are presentation
 * placeholders today — the listing endpoint returns no per-package inclusions —
 * and are intentionally kept as-is until a later phase wires them to backend
 * data. Do not "fix" them here; that is a separate, deliberate task.
 * ───────────────────────────────────────────────────────────────────────────
 */

import {
  Building2,
  Car,
  Headphones,
  MapPinned,
  Plane,
  UtensilsCrossed,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { TourPackage } from "@/lib/constants";

const INCLUSION_BASE = [
  { Icon: Building2, label: "Hotel" },
  { Icon: UtensilsCrossed, label: "Meals" },
  { Icon: Car, label: "Transfers" },
  { Icon: MapPinned, label: "Sightseeing" },
  { Icon: Headphones, label: "24×7 Support" },
] as const;

export function listingInclusions(tour: TourPackage) {
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

export type PackageInfoProps = {
  tour: TourPackage;
  /**
   * Cap the visible chips; the rest collapse into a "+N" pill.
   *
   * Three keeps the row calm and leaves the eye free to reach the price. All
   * inclusions remain accounted for — the "+2" pill carries the remainder and
   * its title attribute names them.
   */
  maxVisible?: number;
  className?: string;
};

export function PackageInfo({ tour, maxVisible = 3, className }: PackageInfoProps) {
  const items = listingInclusions(tour);
  const visible = items.slice(0, maxVisible);
  const hidden = items.slice(maxVisible);
  const overflow = hidden.length;

  return (
    <div
      className={cn("flex flex-wrap gap-1", className)}
      role="list"
      aria-label="Typical package inclusions"
    >
      {/* Tight padding keeps all four chips plus the overflow pill on ONE row
          at the 271px tile width — the two-line wrap cost ~26px per card. */}
      {visible.map(({ Icon, label }) => (
        <span
          key={label}
          role="listitem"
          className="flex items-center gap-0.5 whitespace-nowrap rounded-full border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
        >
          <Icon className="h-2.5 w-2.5 shrink-0 text-primary" strokeWidth={2} aria-hidden />
          {label}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          role="listitem"
          title={hidden.map((h) => h.label).join(", ")}
          className="flex items-center rounded-full border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export default PackageInfo;
