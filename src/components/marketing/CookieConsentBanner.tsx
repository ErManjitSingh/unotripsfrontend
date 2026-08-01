"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie, Settings2, X } from "lucide-react";
import { getTrackingConsent, saveTrackingConsent } from "@/lib/marketing-tracking";

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => setOpen(!getTrackingConsent()), []);

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    saveTrackingConsent(next);
    setOpen(false);
  };

  if (!open) return null;
  return (
    <section role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-orange-100 bg-white p-4 shadow-[0_20px_60px_rgba(45,28,19,0.22)] sm:bottom-5 sm:p-5">
      <button aria-label="Close cookie preferences" onClick={() => save({ analytics: false, marketing: false })} className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      <div className="pr-8">
        <div className="flex items-center gap-2 text-sm font-black text-[#292229]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-[#ef6614]"><Cookie className="h-4 w-4" /></span>Your privacy, your choice</div>
        <p className="mt-2 text-xs leading-5 text-slate-600">We use essential storage to keep your trip flowing. With permission, analytics and marketing tags show which campaigns work—never your password or payment details. <Link href="/cookie-policy" className="font-bold text-[#d95717] underline">Cookie policy</Link></p>
      </div>
      {customising && <div className="mt-3 grid gap-2 rounded-xl bg-[#fbfaf9] p-3 text-xs text-slate-700 sm:grid-cols-2"><label className="flex items-center justify-between gap-3"><span><b>Analytics</b><small className="block text-slate-500">Improve journeys and pages</small></span><input aria-label="Analytics cookies" type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="accent-[#ef6614]" /></label><label className="flex items-center justify-between gap-3"><span><b>Marketing</b><small className="block text-slate-500">Measure ads and offers</small></span><input aria-label="Marketing cookies" type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} className="accent-[#ef6614]" /></label></div>}
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => save({ analytics: true, marketing: true })} className="rounded-xl bg-[#ef6614] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(239,102,20,0.2)]">Accept all</button><button onClick={() => save({ analytics: false, marketing: false })} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-700">Essential only</button><button onClick={() => setCustomising((value) => !value)} className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-xs font-extrabold text-[#d95717]"><Settings2 className="h-3.5 w-3.5" />{customising ? "Hide choices" : "Customise"}</button>{customising && <button onClick={() => save({ analytics, marketing })} className="rounded-xl px-2 py-2 text-xs font-extrabold text-[#d95717]">Save choices</button>}</div>
    </section>
  );
}
