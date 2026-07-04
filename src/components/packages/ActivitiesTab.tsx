"use client";

/**
 * src/components/packages/ActivitiesTab.tsx
 *
 * Activities & Sightseeing tab for the package customiser.
 * Shows sightseeing spots and activities grouped by day.
 *
 * Each day expands to show:
 *   - Included sightseeing (locked, no toggle)
 *   - Optional sightseeing (toggle, adds to price)
 *   - Optional activities (toggle, adds to price)
 *
 * Prices update in the sidebar instantly on toggle.
 */

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown, Footprints, Lock, Mountain,
  ShieldAlert, Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { fmtINR } from "@/lib/package-customizer-data";
import type { DayOption, DaySightseeing, DayActivity } from "@/hooks/useDayOptions";
import type { RoomConfig } from "@/hooks/useRoomsConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

type SelectedItems = {
  sightseeing: Set<string>;   // DaySightseeing.id
  activities:  Set<string>;   // DayActivity.link_id
};

type ActivitiesTabProps = {
  days:            DayOption[];
  rooms:           RoomConfig[];
  selectedItems:   SelectedItems;
  onToggleSight:   (id: string) => void;
  onToggleActivity:(linkId: string) => void;
  sightseeingTotal: number;
  activitiesTotal:  number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function effectivePersons(rooms: RoomConfig[]): number {
  return rooms.reduce((sum, r) => sum + r.adults + r.children * 0.7, 0);
}

function computeSightTotal(spot: DaySightseeing, eff: number): number {
  if (spot.price_type === "included" || (spot.is_included && !spot.is_optional)) return 0;
  if (spot.price_type === "per_group") return spot.price_per_person;
  return Math.round(spot.price_per_person * eff);
}

function computeActTotal(act: DayActivity, eff: number, totalGuests: number): number {
  const price = act.price;
  if (act.price_type === "per_group")   return price;
  if (act.price_type === "per_vehicle") return price * Math.ceil(totalGuests / 6);
  return Math.round(price * eff);
}

const DIFF_COLOR: Record<string, string> = {
  Easy:     "bg-emerald-50 text-emerald-700",
  Moderate: "bg-amber-50 text-amber-700",
  Hard:     "bg-red-50 text-red-700",
  Expert:   "bg-purple-50 text-purple-700",
};

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        on ? "bg-primary" : "bg-[#d0d0d0]",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

// ── Sightseeing row ───────────────────────────────────────────────────────────

function SightseeingRow({
  spot, on, onToggle, eff,
}: {
  spot:     DaySightseeing;
  on:       boolean;
  onToggle: () => void;
  eff:      number;
}) {
  const total = computeSightTotal(spot, eff);
  const isLocked  = spot.is_included && !spot.is_optional;
  const isFree    = spot.price_per_person === 0;

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-xl border-[1.5px] px-3.5 py-3 transition duration-200",
      isLocked
        ? "border-[#f0f0f0] bg-[#fafafa]"
        : on
          ? "border-primary/30 bg-orange-50/40 shadow-[0_2px_10px_-4px_rgba(234,88,12,0.2)]"
          : "border-[#e8e8e8] bg-white hover:border-[#d0d0d0] hover:shadow-sm",
    )}>
      {/* Icon */}
      <div className={cn(
        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        isLocked ? "bg-emerald-50" : "bg-[#f5f5f5]",
      )}>
        <Footprints className={cn("h-4 w-4", isLocked ? "text-emerald-600" : "text-[#616161]")} aria-hidden />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[12px] font-semibold text-[#1a1a1a]">{spot.name}</p>
          {isLocked && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
              <Lock className="h-2.5 w-2.5" />Included
            </span>
          )}
          {spot.seasonal_note && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
              <ShieldAlert className="h-2.5 w-2.5" />Seasonal
            </span>
          )}
        </div>
        {spot.location && (
          <p className="mt-0.5 text-[10px] text-[#9e9e9e]">{spot.location}</p>
        )}
        {spot.duration && (
          <p className="mt-0.5 text-[10px] text-[#9e9e9e]">{spot.duration}</p>
        )}
        {spot.seasonal_note && (
          <p className="mt-0.5 text-[10px] text-amber-600">{spot.seasonal_note}</p>
        )}
      </div>

      {/* Price + toggle */}
      <div className="shrink-0 text-right">
        {isLocked ? (
          <p className="text-[11px] font-semibold text-emerald-700">Free</p>
        ) : (
          <>
            <p className={cn(
              "text-[11px] font-semibold",
              isFree ? "text-emerald-700" : "text-primary",
            )}>
              {isFree ? "Free" : `+₹${fmtINR(total)}`}
            </p>
            {!isFree && (
              <p className="text-[9px] text-[#9e9e9e]">₹{fmtINR(spot.price_per_person)}/person</p>
            )}
            <div className="mt-1.5 flex justify-end">
              <Toggle on={on} onChange={onToggle} label={`Toggle ${spot.name}`} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({
  act, on, onToggle, eff, totalGuests,
}: {
  act:         DayActivity;
  on:          boolean;
  onToggle:    () => void;
  eff:         number;
  totalGuests: number;
}) {
  const total = computeActTotal(act, eff, totalGuests);
  const diffCls = DIFF_COLOR[act.difficulty_level] ?? DIFF_COLOR.Moderate!;

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border-[1.5px] transition duration-200",
      on ? "border-primary/30 bg-orange-50/40 shadow-[0_2px_10px_-4px_rgba(234,88,12,0.2)]" : "border-[#e8e8e8] bg-white hover:border-[#d0d0d0] hover:shadow-sm",
    )}>
      <div className="flex items-start gap-3 p-3.5">
        {/* Activity image */}
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {act.featured_image ? (
            <Image
              src={act.featured_image}
              alt={act.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange-50">
              <Zap className="h-6 w-6 text-primary/40" aria-hidden />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[12px] font-semibold text-[#1a1a1a]">{act.name}</p>
            {act.seasonal_note && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                <ShieldAlert className="h-2.5 w-2.5" />Seasonal
              </span>
            )}
          </div>

          {act.short_description && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-[#9e9e9e] line-clamp-2">
              {act.short_description}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {act.difficulty_level && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", diffCls)}>
                {act.difficulty_level}
              </span>
            )}
            {act.duration && (
              <span className="text-[10px] text-[#9e9e9e]">{act.duration}</span>
            )}
            {act.age_limit && (
              <span className="text-[10px] text-[#9e9e9e]">Age {act.age_limit}</span>
            )}
          </div>

          {act.seasonal_note && (
            <p className="mt-1 text-[10px] text-amber-600">{act.seasonal_note}</p>
          )}
        </div>

        {/* Price + toggle */}
        <div className="shrink-0 text-right">
          <p className="text-[11px] font-semibold text-primary">+₹{fmtINR(total)}</p>
          <p className="text-[9px] text-[#9e9e9e]">₹{fmtINR(act.price)}/person</p>
          <div className="mt-1.5 flex justify-end">
            <Toggle on={on} onChange={onToggle} label={`Toggle ${act.name}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Day accordion ─────────────────────────────────────────────────────────────

function DaySection({
  day, rooms, selectedItems, onToggleSight, onToggleActivity,
}: {
  day:              DayOption;
  rooms:            RoomConfig[];
  selectedItems:    SelectedItems;
  onToggleSight:    (id: string) => void;
  onToggleActivity: (linkId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const eff         = effectivePersons(rooms);
  const totalGuests = rooms.reduce((s, r) => s + r.adults + r.children, 0);

  const optionalSight = day.sightseeing.filter((s) => s.is_optional);
  const includedSight = day.sightseeing.filter((s) => !s.is_optional);
  const hasContent    = optionalSight.length > 0 || day.activities.length > 0;

  if (!hasContent && includedSight.length === 0) return null;

  const selectedCount =
    optionalSight.filter((s) => selectedItems.sightseeing.has(s.id)).length +
    day.activities.filter((a) => selectedItems.activities.has(a.link_id)).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_2px_12px_-6px_rgba(15,23,42,0.08)]">
      {/* Day header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[#fafafa] px-4 py-3.5 text-left transition hover:bg-[#f5f5f5]"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {day.day_number}
          </span>
          <div>
            <p className="text-[12px] font-semibold text-[#1a1a1a]">{day.title}</p>
            <p className="text-[10px] text-[#9e9e9e]">{day.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
              {selectedCount} selected
            </span>
          )}
          {includedSight.length > 0 && (
            <span className="text-[10px] text-emerald-700">
              {includedSight.length} included
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#9e9e9e] transition-transform", open && "rotate-180")} aria-hidden />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2 p-3.5">
              {/* Included sightseeing */}
              {includedSight.map((spot) => (
                <SightseeingRow
                  key={spot.id}
                  spot={spot}
                  on={true}
                  onToggle={() => {}}
                  eff={eff}
                />
              ))}

              {/* Optional sightseeing */}
              {optionalSight.length > 0 && (
                <div className="space-y-1.5">
                  {includedSight.length > 0 && (
                    <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">
                      Optional Sightseeing
                    </p>
                  )}
                  {optionalSight.map((spot) => (
                    <SightseeingRow
                      key={spot.id}
                      spot={spot}
                      on={selectedItems.sightseeing.has(spot.id)}
                      onToggle={() => onToggleSight(spot.id)}
                      eff={eff}
                    />
                  ))}
                </div>
              )}

              {/* Activities */}
              {day.activities.length > 0 && (
                <div className="space-y-1.5">
                  <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">
                    Activities
                  </p>
                  {day.activities.map((act) => (
                    <ActivityRow
                      key={act.link_id}
                      act={act}
                      on={selectedItems.activities.has(act.link_id)}
                      onToggle={() => onToggleActivity(act.link_id)}
                      eff={eff}
                      totalGuests={totalGuests}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivitiesTab({
  days, rooms, selectedItems, onToggleSight, onToggleActivity,
  sightseeingTotal, activitiesTotal,
}: ActivitiesTabProps) {
  if (!days.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa] px-6 py-12 text-center">
        <Mountain className="mx-auto mb-3 h-10 w-10 text-[#d0d0d0]" aria-hidden />
        <p className="text-[13px] font-semibold text-[#424242]">No activities configured yet</p>
        <p className="mt-1 text-[11px] text-[#9e9e9e]">
          Admin will add sightseeing spots and activities to the itinerary builder.
        </p>
      </div>
    );
  }

  const totalSelected =
    selectedItems.sightseeing.size + selectedItems.activities.size;
  const grandTotal = sightseeingTotal + activitiesTotal;

  return (
    <section aria-labelledby="activities-tab-heading">
      <h2 id="activities-tab-heading" className="sr-only">Activities and sightseeing</h2>

      {/* Summary bar */}
      <AnimatePresence>
        {totalSelected > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-primary/15 bg-gradient-to-r from-orange-50 to-amber-50/60 px-4 py-3 text-[12px] shadow-[0_2px_10px_-6px_rgba(234,88,12,0.25)]">
              <span className="font-medium text-[#424242]">
                {totalSelected} item{totalSelected !== 1 ? "s" : ""} selected
              </span>
              <span className="font-bold text-primary">+₹{fmtINR(grandTotal)} total</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {days.map((day) => (
          <DaySection
            key={day.day_number}
            day={day}
            rooms={rooms}
            selectedItems={selectedItems}
            onToggleSight={onToggleSight}
            onToggleActivity={onToggleActivity}
          />
        ))}
      </div>

      <p className="mt-4 text-[10px] text-[#9e9e9e]">
        Prices shown per person. Group prices are flat regardless of size.
        Seasonal activities may not be available on all dates.
      </p>
    </section>
  );
}