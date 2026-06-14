"use client";

import AttractionInput from "../shared/AttractionInput";
import type { PropertyWizardData } from "../shared/types";

const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step5Contact({ data, setField }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-800">Contact Details</p>
        <p className="mb-4 text-xs text-slate-400">Shown to guests on your property page</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Property Phone <span className="text-red-500">*</span></label>
              <input className={inputCls} type="tel" value={data.contact.phone} onChange={e => setField("contact", { ...data.contact, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input className={inputCls} type="tel" value={data.contact.whatsapp} onChange={e => setField("contact", { ...data.contact, whatsapp: e.target.value })} placeholder="+91 98765 43210" />
              <p className="mt-1 text-xs text-slate-400">Leave blank if same as phone</p>
            </div>
          </div>
          <div>
            <label className={labelCls}>Reservation Email <span className="text-red-500">*</span></label>
            <input className={inputCls} type="email" value={data.contact.email} onChange={e => setField("contact", { ...data.contact, email: e.target.value })} placeholder="reservations@yourproperty.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Website</label>
              <input className={inputCls} value={data.contact.website} onChange={e => setField("contact", { ...data.contact, website: e.target.value })} placeholder="https://yourproperty.com" />
            </div>
            <div>
              <label className={labelCls}>GST Number</label>
              <input className={inputCls} value={data.contact.gst} onChange={e => setField("contact", { ...data.contact, gst: e.target.value })} placeholder="27AAPFU0939F1ZV" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100" />
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-800">Nearby Attractions</p>
        <p className="mb-4 text-xs text-slate-400">Shown under Experiences on your property page</p>
        <AttractionInput attractions={data.nearby_attractions} onChange={list => setField("nearby_attractions", list)} />
      </div>
    </div>
  );
}