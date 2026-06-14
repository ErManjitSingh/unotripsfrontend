"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DiningVenue } from "./types";

const CUISINE_TYPES = [
  "Multi-cuisine","Indian","North Indian","South Indian","Continental",
  "Chinese","Italian","Japanese","Mediterranean","Bar & Cocktails",
  "Café & Light Bites","Seafood","BBQ & Grill","Vegetarian","Vegan",
];
const EMPTY: DiningVenue = { name:"",cuisine:"Multi-cuisine",timing:"",description:"",open_to_public:false };
const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

interface Props { initial?: DiningVenue; onSave: (v: DiningVenue) => void; onCancel: () => void; }

export default function DiningForm({ initial, onSave, onCancel }: Props) {
  const [venue, setVenue] = useState<DiningVenue>(initial ?? EMPTY);
  function set<K extends keyof DiningVenue>(key: K, val: DiningVenue[K]) { setVenue(v => ({ ...v, [key]: val })); }
  const canSave = !!venue.name.trim() && !!venue.timing.trim();

  return (
    <div className="space-y-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Venue Name <span className="text-red-500">*</span></label>
          <input className={inputCls} value={venue.name} onChange={e => set("name", e.target.value)} placeholder="The Signature Restaurant" />
        </div>
        <div>
          <label className={labelCls}>Cuisine Type</label>
          <select className={inputCls} style={{ cursor: "pointer" }} value={venue.cuisine} onChange={e => set("cuisine", e.target.value)}>
            {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Operating Hours <span className="text-red-500">*</span></label>
        <input className={inputCls} value={venue.timing} onChange={e => set("timing", e.target.value)} placeholder="7:00 AM – 11:00 PM" />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={cn(inputCls, "resize-y")} rows={2} value={venue.description} onChange={e => set("description", e.target.value)} placeholder="Describe the dining experience, specialities, ambience..." />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={venue.open_to_public} onChange={e => set("open_to_public", e.target.checked)} className="h-4 w-4 cursor-pointer" />
        This venue is open to outside guests (non-residents)
      </label>
      <div className="flex justify-end gap-2 border-t border-amber-200 pt-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(venue)} disabled={!canSave}>Save Venue</Button>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";