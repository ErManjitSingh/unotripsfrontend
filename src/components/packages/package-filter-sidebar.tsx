"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarRange,
  Filter,
  IndianRupee,
  Layers,
  MapPin,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRICE_BANDS = [
  "₹ 49,000 - ₹ 80,000",
  "₹ 80,000 - ₹ 1.2L",
  "₹ 1.2L - ₹ 1.6L",
  "₹ 1.6L - ₹ 2L",
  "₹ 2L & above",
];

const DEPARTURE_CITIES: { label: string; count: number }[] = [
  { label: "Joining / Leaving", count: 11 },
  { label: "Trivandrum", count: 1 },
  { label: "Mumbai", count: 24 },
  { label: "Delhi", count: 18 },
  { label: "Bengaluru", count: 9 },
  { label: "Chennai", count: 6 },
  { label: "Hyderabad", count: 4 },
  { label: "Kolkata", count: 3 },
];

const PACKAGE_TYPES: { label: string; count: number }[] = [
  { label: "Group tour", count: 28 },
  { label: "Family package", count: 16 },
  { label: "Honeymoon", count: 14 },
  { label: "Beach & island", count: 9 },
  { label: "Escorted tour", count: 12 },
  { label: "Small-group tour", count: 7 },
  { label: "Rail & mountain", count: 5 },
];

const TOUR_DURATIONS: { label: string; count: number }[] = [
  { label: "1–3 days", count: 4 },
  { label: "4–6 days", count: 11 },
  { label: "7–9 days", count: 18 },
  { label: "10–12 days", count: 9 },
  { label: "13+ days", count: 3 },
];

function FilterSectionHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span>{title}</span>
    </span>
  );
}

export function PackageFilterSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className="w-full rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15">
            <Filter className="h-4 w-4" aria-hidden />
          </span>
          Filter Your Tour
        </h3>
        <div className="flex items-center gap-3">
          <Link href="#" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            <RotateCcw className="h-3 w-3 shrink-0" aria-hidden /> Reset
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary sm:hidden"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "Hide" : "Show filters"}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-[#e8e8e8]", mobileOpen ? "block" : "hidden sm:block")}>
      <details className="group border-b border-[#e8e8e8] py-4">
        <summary className="cursor-pointer list-none text-[13px] font-bold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <FilterSectionHeader icon={IndianRupee} title="Price Range" />
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ⌄
            </span>
          </span>
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PRICE_BANDS.map((p) => (
            <label
              key={p}
              className="cursor-pointer rounded-full border border-[#e0e0e0] bg-slate-50 px-2 py-2 text-center text-[10px] font-medium leading-tight text-slate-700 hover:border-primary/35 has-[:checked]:border-primary has-[:checked]:bg-primary/5 sm:text-[11px]"
            >
              <input type="checkbox" className="sr-only" />
              {p}
            </label>
          ))}
        </div>
      </details>

      <details className="group border-b border-[#e8e8e8] py-4">
        <summary className="cursor-pointer list-none text-[13px] font-bold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <FilterSectionHeader icon={Layers} title="Package type" />
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ⌄
            </span>
          </span>
        </summary>
        <div className="mt-3 space-y-2">
          {PACKAGE_TYPES.map(({ label, count }) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-2 text-[12px] text-slate-700"
            >
              <input type="checkbox" className="rounded border-[#cbd5e1] text-primary" />
              <span>
                {label} <span className="text-slate-500">({count})</span>
              </span>
            </label>
          ))}
        </div>
      </details>

      <details className="group border-b border-[#e8e8e8] py-4">
        <summary className="cursor-pointer list-none text-[13px] font-bold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <FilterSectionHeader icon={CalendarRange} title="Tour duration" />
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ⌄
            </span>
          </span>
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOUR_DURATIONS.map(({ label, count }) => (
            <label
              key={label}
              className="cursor-pointer rounded-full border border-[#e0e0e0] bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:border-primary/35 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input type="checkbox" className="sr-only" />
              {label}{" "}
              <span className="text-slate-500">({count})</span>
            </label>
          ))}
        </div>
      </details>

      <details className="group py-4">
        <summary className="cursor-pointer list-none text-[13px] font-bold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            <FilterSectionHeader icon={MapPin} title="Departure City" />
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ⌄
            </span>
          </span>
        </summary>
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-0.5">
          {DEPARTURE_CITIES.map(({ label, count }) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-2 text-[12px] text-slate-700"
            >
              <input type="checkbox" className="rounded border-[#cbd5e1] text-primary" />
              <span>
                {label} <span className="text-slate-500">({count})</span>
              </span>
            </label>
          ))}
        </div>
      </details>
      </div>
    </aside>
  );
}
