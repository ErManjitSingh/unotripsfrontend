"use client";

import { cn } from "@/lib/utils";
import type { PropertyWizardData } from "../shared/types";

const PAYMENT_OPTIONS = ["Cash","Credit Card","Debit Card","UPI","Net Banking","Cheque"];
const POLICY_FIELDS = [
  { key: "cancellation",   label: "Cancellation Policy",    placeholder: "e.g. Free cancellation up to 24 hours before check-in." },
  { key: "children",       label: "Children Policy",        placeholder: "e.g. Children of all ages are welcome." },
  { key: "pets",           label: "Pet Policy",             placeholder: "e.g. Pets are not allowed." },
  { key: "smoking",        label: "Smoking Policy",         placeholder: "e.g. Non-smoking property." },
  { key: "extra_bed",      label: "Extra Bed Policy",       placeholder: "e.g. Extra beds available on request at ₹1,500/night." },
  { key: "early_check_in", label: "Early Check-in Policy",  placeholder: "e.g. Early check-in available from 10:00 AM on request." },
  { key: "late_check_out", label: "Late Check-out Policy",  placeholder: "e.g. Late check-out until 2:00 PM on request." },
  { key: "age_restriction",label: "Age Restriction",        placeholder: "e.g. Guests must be 18+ to check-in." },
  { key: "alcohol",        label: "Alcohol Policy",         placeholder: "e.g. Alcohol served at the bar. Outside alcohol not permitted." },
] as const;

const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-semibold text-slate-600";

interface Props {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

export default function Step4Policies({ data, setField }: Props) {
  function togglePayment(method: string) {
    const cur = data.payment_methods;
    setField("payment_methods", cur.includes(method) ? cur.filter(x => x !== method) : [...cur, method]);
  }

  return (
    <div className="space-y-5">
      {/* Check-in / Check-out */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Check-in Time</label>
          <input type="time" className={inputCls} value={data.check_in_time} onChange={e => setField("check_in_time", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Check-out Time</label>
          <input type="time" className={inputCls} value={data.check_out_time} onChange={e => setField("check_out_time", e.target.value)} />
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label className={labelCls}>Payment Methods ({data.payment_methods.length} selected)</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map(m => {
            const on = data.payment_methods.includes(m);
            return (
              <button
                key={m} type="button" onClick={() => togglePayment(m)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  on ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
                )}
              >
                {on && "✓ "}{m}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Policy fields */}
      {POLICY_FIELDS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className={labelCls}>{label}</label>
          <textarea
            className={cn(inputCls, "resize-y")} rows={2}
            value={data[key]} placeholder={placeholder}
            onChange={e => setField(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}