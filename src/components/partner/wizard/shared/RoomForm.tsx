"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RoomTypePayload, BedType, PartnerMealKey, MealPlans } from "./types";
import { MEAL_DEFAULT_PRICES, MEAL_PLAN_CODES, PARTNER_MEAL_PLAN_LABELS, PARTNER_MEAL_DESCRIPTIONS } from "./types";

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: "single", label: "Single" }, { value: "double", label: "Double" },
  { value: "twin",   label: "Twin"   }, { value: "queen",  label: "Queen"  },
  { value: "king",   label: "King"   }, { value: "bunk",   label: "Bunk"   },
];
const ROOM_AMENITIES = [
  "AC","WiFi","TV","Mini Bar","Safe","Balcony","Sea View","Lake View",
  "Garden View","Jacuzzi","Bathtub","Coffee Maker","Microwave","Kitchenette",
];
const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

interface Props {
  initial?: Partial<RoomTypePayload>;
  onSave: (room: RoomTypePayload) => void;
  onCancel: () => void;
}

export default function RoomForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<RoomTypePayload>({
    name:          initial?.name          ?? "",
    description:   initial?.description   ?? "",
    bed_type:      initial?.bed_type      ?? "king",
    max_occupancy: initial?.max_occupancy ?? 2,
    size_sqft:     initial?.size_sqft     ?? 300,
    count:         initial?.count         ?? 1,
    amenities:     initial?.amenities     ?? [],
    images:        initial?.images        ?? [],
    base_price:    initial?.base_price    ?? 0,
    weekend_price: initial?.weekend_price,
    is_active:     initial?.is_active     ?? true,
    meal_plans:    initial?.meal_plans    ?? {},
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RoomTypePayload, string>>>({});

  function set<K extends keyof RoomTypePayload>(key: K, val: RoomTypePayload[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function toggleAmenity(a: string) {
    set("amenities", form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);
  }

  function isMealEnabled(meal: PartnerMealKey) { return meal in (form.meal_plans ?? {}); }
  function toggleMeal(meal: PartnerMealKey) {
    const updated: MealPlans = { ...(form.meal_plans ?? {}) };
    if (meal in updated) delete updated[meal]; else updated[meal] = MEAL_DEFAULT_PRICES[meal];
    set("meal_plans", updated);
  }
  function setMealPrice(meal: PartnerMealKey, price: number) {
    set("meal_plans", { ...(form.meal_plans ?? {}), [meal]: price });
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof RoomTypePayload, string>> = {};
    if (!form.name.trim())    errs.name       = "Room name is required";
    if (!form.bed_type)       errs.bed_type   = "Bed type is required";
    if (form.base_price <= 0) errs.base_price = "Base price must be > 0";
    if (form.count < 1)       errs.count      = "At least 1 room required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() { if (validate()) onSave(form); }

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
      <p className="text-sm font-bold text-slate-800">{initial?.name ? `Edit: ${initial.name}` : "Add Room Type"}</p>

      <div>
        <label className={labelCls}>Room Name <span className="text-red-500">*</span></label>
        <input className={cn(inputCls, errors.name ? "border-red-400" : "")} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Deluxe King Room" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className={labelCls}>Bed Type <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-2">
          {BED_TYPES.map(b => (
            <button key={b.value} type="button" onClick={() => set("bed_type", b.value)}
              className={cn("rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                form.bed_type === b.value ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary"
              )}>{b.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelCls}>Max Guests</label>
          <input className={inputCls} type="number" min={1} max={20} value={form.max_occupancy} onChange={e => set("max_occupancy", +e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Size (sq ft)</label>
          <input className={inputCls} type="number" min={0} value={form.size_sqft} onChange={e => set("size_sqft", +e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Room Count</label>
          <input className={cn(inputCls, errors.count ? "border-red-400" : "")} type="number" min={1} value={form.count} onChange={e => set("count", +e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Base Price (₹/night) <span className="text-red-500">*</span></label>
          <input className={cn(inputCls, errors.base_price ? "border-red-400" : "")} type="number" min={0} value={form.base_price || ""} onChange={e => set("base_price", +e.target.value)} placeholder="e.g. 3500" />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className={labelCls}>Room Amenities</label>
        <div className="flex flex-wrap gap-1.5">
          {ROOM_AMENITIES.map(a => {
            const on = form.amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                  on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                )}>{a}</button>
            );
          })}
        </div>
      </div>

      {/* Meal Plans */}
      <div>
        <label className={labelCls}>Meal Plans (optional)</label>
        <div className="space-y-2">
          {MEAL_PLAN_CODES.map(meal => {
            const enabled = isMealEnabled(meal);
            return (
              <div key={meal} className={cn("rounded-lg border p-3 transition-colors", enabled ? "border-green-200 bg-green-50" : "border-slate-200 bg-white")}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={enabled} onChange={() => toggleMeal(meal)} className="h-4 w-4 cursor-pointer" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{PARTNER_MEAL_PLAN_LABELS[meal]}</p>
                      <p className="text-xs text-slate-400">{PARTNER_MEAL_DESCRIPTIONS[meal]}</p>
                    </div>
                  </div>
                  {enabled && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">₹</span>
                      <input
                        type="number" min={0}
                        value={form.meal_plans?.[meal] ?? ""}
                        onChange={e => setMealPrice(meal, +e.target.value)}
                        className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-primary"
                        placeholder="300"
                      />
                      <span className="text-xs text-slate-400">/person</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Room</Button>
      </div>
    </div>
  );
}