"use client";

import { cn } from "@/lib/utils";
import type { PropertyWizardData, PropertyType } from "../shared/types";

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: "hotel",             label: "Hotel",          icon: "🏨" },
  { value: "resort",            label: "Resort",         icon: "🌴" },
  { value: "boutique_hotel",    label: "Boutique Hotel", icon: "🏩" },
  { value: "heritage_hotel",    label: "Heritage Hotel", icon: "🏯" },
  { value: "villa",             label: "Villa",          icon: "🏡" },
  { value: "homestay",          label: "Homestay",       icon: "🏠" },
  { value: "service_apartment", label: "Service Apt.",   icon: "🏢" },
  { value: "hostel",            label: "Hostel",         icon: "🛏️" },
];

const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step1BasicInfo({ data, setField }: Props) {
  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelCls}>Property Name <span className="text-red-500">*</span></label>
        <input className={inputCls} value={data.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. The Grand Palace" />
      </div>

      {/* Property Type */}
      <div>
        <label className={labelCls}>Property Type <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PROPERTY_TYPES.map(t => (
            <button
              key={t.value} type="button"
              onClick={() => setField("property_type", t.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-semibold transition-all",
                data.property_type === t.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              )}
            >
              <span className="text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Star Category */}
      <div>
        <label className={labelCls}>Star Category</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s => (
            <button
              key={s} type="button"
              onClick={() => setField("star_category", s)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all",
                data.star_category === s
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-400 hover:border-amber-300"
              )}
            >
              ⭐ {s}
            </button>
          ))}
        </div>
      </div>

      {/* Total Rooms */}
      <div>
        <label className={labelCls}>Total Rooms <span className="text-red-500">*</span></label>
        <input
          className={inputCls} type="number" min={1}
          value={data.total_rooms || ""}
          onChange={e => setField("total_rooms", Number(e.target.value))}
          placeholder="e.g. 45"
        />
        <p className="mt-1 text-xs text-slate-400">Overall capacity across all room types</p>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description <span className="text-red-500">*</span></label>
        <textarea
          className={cn(inputCls, "resize-vertical")} rows={5}
          maxLength={2500}
          value={data.description}
          onChange={e => setField("description", e.target.value)}
          placeholder="Describe your property — location highlights, vibe, unique features, nearby attractions..."
        />
        <p className={cn("mt-1 text-right text-xs", data.description.length > 2200 ? "text-amber-600" : "text-slate-400")}>
          {data.description.length} / 2500
        </p>
      </div>
    </div>
  );
}