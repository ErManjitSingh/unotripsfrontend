"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PropertyWizardData } from "../shared/types";

const MAX_TAGS = 2;
const ALL_AMENITIES = [
  "WiFi","Pool","Spa","Gym","Restaurant","Bar","Parking","Valet Parking",
  "Room Service","Concierge","Laundry","Business Center","Conference Room",
  "Airport Transfer","Kids Club","Pet Friendly","Beach Access","Garden",
  "Terrace","Rooftop","EV Charging","Wheelchair Accessible",
  "24hr Front Desk","Doctor on Call","Kids Pool","Steam Room",
  "Yoga Studio","Library","Currency Exchange","Helipad",
];
const ALL_TAGS = [
  "Luxury","Beachfront","Heritage","Boutique","Family Friendly",
  "Pet Friendly","Romantic","Business","Budget","Eco-friendly",
  "Wellness","Adventure","Adults Only","Wedding Venue","Backpacker",
];

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step3Amenities({ data, setField }: Props) {
  const [tagWarning, setTagWarning] = useState(false);

  function toggleAmenity(a: string) {
    const cur = data.amenities;
    setField("amenities", cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  }

  function toggleTag(t: string) {
    const cur = data.tags;
    if (cur.includes(t)) { setTagWarning(false); setField("tags", cur.filter(x => x !== t)); return; }
    if (cur.length >= MAX_TAGS) { setTagWarning(true); setTimeout(() => setTagWarning(false), 2500); return; }
    setTagWarning(false);
    setField("tags", [...cur, t]);
  }

  return (
    <div className="space-y-6">
      {/* Amenities */}
      <div>
        <div className="mb-3">
          <p className="text-sm font-semibold text-slate-800">Amenities</p>
          <p className="text-xs text-slate-400">{data.amenities.length} selected</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_AMENITIES.map(a => {
            const on = data.amenities.includes(a);
            return (
              <button
                key={a} type="button" onClick={() => toggleAmenity(a)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                )}
              >
                {on && "✓ "}{a}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Tags */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Property Tags</p>
            <p className="text-xs text-slate-400">Up to {MAX_TAGS} tags — help guests discover your property</p>
          </div>
          <span className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-semibold",
            data.tags.length === MAX_TAGS ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-500"
          )}>
            {data.tags.length} / {MAX_TAGS}
          </span>
        </div>
        {tagWarning && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Maximum {MAX_TAGS} tags. Remove one to add another.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map(t => {
            const on = data.tags.includes(t);
            const blocked = !on && data.tags.length >= MAX_TAGS;
            return (
              <button
                key={t} type="button" onClick={() => toggleTag(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  on ? "border-amber-400 bg-amber-50 text-amber-700"
                  : blocked ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}