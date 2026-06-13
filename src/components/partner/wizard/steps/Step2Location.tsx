"use client";

import type { PropertyWizardData } from "../shared/types";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
];

const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step2Location({ data, setField }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Street Address <span className="text-red-500">*</span></label>
        <input className={inputCls} value={data.address} onChange={e => setField("address", e.target.value)} placeholder="123, Marine Drive" />
      </div>
      <div>
        <label className={labelCls}>Landmark / Area Name</label>
        <input className={inputCls} value={data.landmark} onChange={e => setField("landmark", e.target.value)} placeholder="e.g. Near City Palace, Beachfront" />
        <p className="mt-1 text-xs text-slate-400">Helps guests find and recognise your location</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>City <span className="text-red-500">*</span></label>
          <input className={inputCls} value={data.city} onChange={e => setField("city", e.target.value)} placeholder="Mumbai" />
        </div>
        <div>
          <label className={labelCls}>State <span className="text-red-500">*</span></label>
          <select className={inputCls} value={data.state} onChange={e => setField("state", e.target.value)} style={{ cursor: "pointer" }}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Pincode</label>
          <input className={inputCls} value={data.pincode} onChange={e => setField("pincode", e.target.value)} placeholder="400001" maxLength={6} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Latitude</label>
          <input className={inputCls} type="number" value={data.latitude || ""} onChange={e => setField("latitude", Number(e.target.value))} placeholder="18.9388" />
        </div>
        <div>
          <label className={labelCls}>Longitude</label>
          <input className={inputCls} type="number" value={data.longitude || ""} onChange={e => setField("longitude", Number(e.target.value))} placeholder="72.8354" />
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 leading-relaxed">
        💡 To get coordinates: open <strong>Google Maps</strong> → right-click your property location → copy the latitude and longitude shown.
      </div>
    </div>
  );
}