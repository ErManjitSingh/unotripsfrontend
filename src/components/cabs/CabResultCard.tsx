"use client";

/**
 * components/cabs/CabResultCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Card shown in the /cabs/results grid.
 * Design language: matches hotel-grid-card.tsx — white card, rounded-xl,
 * shadow-sm, orange #EF6614 CTA.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Image from "next/image";
import { AirVent, Briefcase, CheckCircle2, Users } from "lucide-react";
import type { CabSearchResult } from "@/lib/cabs-api";
import { cn } from "@/lib/utils";

type CabResultCardProps = {
  cab: CabSearchResult;
  onBook: () => void;
  className?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  sedan:           "Sedan",
  suv:             "SUV",
  luxury:          "Luxury",
  tempo_traveller: "Tempo Traveller",
  mini:            "Mini",
  bus:             "Bus",
};

export function CabResultCard({ cab, onBook, className }: CabResultCardProps) {
  const categoryLabel = CATEGORY_LABELS[cab.cab_category] ?? cab.cab_category;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-[#F5F5F5]">
        {cab.featured_image ? (
          <Image
            src={cab.featured_image}
            alt={cab.name}
            fill
            sizes="(max-width:640px) 100vw, 33vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#BDBDBD]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect width="13" height="10" x="8" y="9" rx="2" />
              <circle cx="11" cy="19" r="2" />
              <circle cx="17" cy="19" r="2" />
            </svg>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          {categoryLabel}
        </span>
        {/* AC badge */}
        {cab.is_ac ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#E3F2FD] px-2 py-0.5 text-[11px] font-semibold text-[#1565C0]">
            <AirVent className="h-3 w-3" strokeWidth={2} /> AC
          </span>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-bold text-[#212121]">{cab.name}</h3>

        {/* Specs row */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 text-xs text-[#757575]">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
            {cab.seating_capacity} seats
          </span>
          <span className="flex items-center gap-1 text-xs text-[#757575]">
            <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
            {cab.luggage_capacity} bags
          </span>
        </div>

        {/* Features */}
        {cab.features.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {cab.features.slice(0, 3).map((f) => (
              <li
                key={f}
                className="flex items-center gap-1 rounded-full border border-[#EEEEEE] px-2.5 py-0.5 text-[11px] text-[#616161]"
              >
                <CheckCircle2 className="h-3 w-3 shrink-0 text-[#4CAF50]" strokeWidth={2} />
                {f}
              </li>
            ))}
            {cab.features.length > 3 ? (
              <li className="rounded-full border border-[#EEEEEE] px-2.5 py-0.5 text-[11px] text-[#9E9E9E]">
                +{cab.features.length - 3} more
              </li>
            ) : null}
          </ul>
        ) : null}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <span className="text-[11px] text-[#9E9E9E]">Total fare</span>
            <p className="text-xl font-bold text-[#212121]">
              ₹{cab.total_fare.toLocaleString("en-IN")}
            </p>
            {cab.fare_breakdown ? (
              <span className="text-[11px] text-[#757575]">
                incl. GST @ {cab.fare_breakdown.gst_rate}%
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onBook}
            className="shrink-0 rounded-full bg-[#EF6614] px-5 py-2.5 text-[13px] font-bold tracking-wide text-white transition-colors hover:bg-[#E65100]"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}