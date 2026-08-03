"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getPartnerVehiclePricing,
  upsertPartnerVehiclePricing,
  type PartnerCabNetPricing,
  type PartnerCabPricing,
} from "@/lib/cab-partner-api";

const RATE_ROWS: { key: keyof PartnerCabNetPricing; label: string; unit: string; note?: string }[] = [
  { key: "oneway_local_net", label: "One-way local", unit: "₹/km" },
  { key: "oneway_out_net", label: "One-way outstation", unit: "₹/km", note: "Billed at actual km × 2" },
  { key: "roundtrip_local_net", label: "Round trip local", unit: "₹/km" },
  { key: "roundtrip_out_net", label: "Round trip outstation", unit: "₹/km" },
  { key: "fullday_local_net", label: "Full day local", unit: "₹/day" },
  { key: "fullday_out_net", label: "Full day outstation", unit: "₹/day" },
];

const EMPTY: PartnerCabNetPricing = {
  oneway_local_net: 0,
  oneway_out_net: 0,
  roundtrip_local_net: 0,
  roundtrip_out_net: 0,
  fullday_local_net: 0,
  fullday_out_net: 0,
  fullday_included_km: 80,
  fullday_included_hrs: 8,
  extra_km_net: 0,
  extra_hr_net: 0,
  driver_allowance_per_night: 300,
  night_charge: 0,
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ef6614]";

function fromPricing(pricing: PartnerCabPricing | null | undefined): PartnerCabNetPricing {
  if (!pricing) return { ...EMPTY };
  return {
    oneway_local_net: pricing.oneway_local_net,
    oneway_out_net: pricing.oneway_out_net,
    roundtrip_local_net: pricing.roundtrip_local_net,
    roundtrip_out_net: pricing.roundtrip_out_net,
    fullday_local_net: pricing.fullday_local_net,
    fullday_out_net: pricing.fullday_out_net,
    fullday_included_km: pricing.fullday_included_km,
    fullday_included_hrs: pricing.fullday_included_hrs,
    extra_km_net: pricing.extra_km_net,
    extra_hr_net: pricing.extra_hr_net,
    driver_allowance_per_night: pricing.driver_allowance_per_night,
    night_charge: pricing.night_charge,
  };
}

export function PartnerVehiclePricingForm({
  cabId,
  onSaved,
}: {
  cabId: string;
  onSaved?: (pricing: PartnerCabPricing) => void;
}) {
  const auth = useAuthOptional();
  const [form, setForm] = useState<PartnerCabNetPricing>(EMPTY);
  const [selling, setSelling] = useState<PartnerCabPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    getPartnerVehiclePricing(token, cabId)
      .then((pricing) => {
        if (cancelled) return;
        setForm(fromPricing(pricing));
        setSelling(pricing);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load pricing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth, cabId]);

  const patch = (key: keyof PartnerCabNetPricing, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = auth?.getAccessToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const next = await upsertPartnerVehiclePricing(token, cabId, form);
      setSelling(next);
      setForm(fromPricing(next));
      setSuccess("Net rates saved. Guest prices update with UnoCabs margins.");
      onSaved?.(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save pricing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-32 place-items-center rounded-xl border border-slate-200 bg-white">
        <span className="h-6 w-6 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  const sellingFor = (netKey: keyof PartnerCabNetPricing) => {
    if (!selling) return null;
    const map: Partial<Record<keyof PartnerCabNetPricing, keyof PartnerCabPricing>> = {
      oneway_local_net: "oneway_local_selling",
      oneway_out_net: "oneway_out_selling",
      roundtrip_local_net: "roundtrip_local_selling",
      roundtrip_out_net: "roundtrip_out_selling",
      fullday_local_net: "fullday_local_selling",
      fullday_out_net: "fullday_out_selling",
      extra_km_net: "extra_km_selling",
      extra_hr_net: "extra_hr_selling",
    };
    const sellKey = map[netKey];
    return sellKey ? selling[sellKey] : null;
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-black">Your net rates</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Enter what UnoCabs pays you. Guest-facing prices include platform margins and are shown as estimates.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
          <span>Trip type</span>
          <span>Your net</span>
          <span>Guest estimate</span>
        </div>
        {RATE_ROWS.map((row) => {
          const estimate = sellingFor(row.key);
          return (
            <div key={row.key} className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0">
              <div>
                <p className="text-xs font-bold text-[#192131]">{row.label}</p>
                <p className="text-[10px] text-slate-400">{row.unit}{row.note ? ` · ${row.note}` : ""}</p>
              </div>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form[row.key]}
                onChange={(e) => patch(row.key, Number(e.target.value) || 0)}
              />
              <p className="text-sm font-semibold text-slate-500">
                {estimate != null ? `₹${Number(estimate).toLocaleString("en-IN")}` : "—"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-600">
          Full-day included km
          <input type="number" min={1} className={inputClass} value={form.fullday_included_km} onChange={(e) => patch("fullday_included_km", Number(e.target.value) || 1)} />
        </label>
        <label className="text-xs font-bold text-slate-600">
          Full-day included hours
          <input type="number" min={1} className={inputClass} value={form.fullday_included_hrs} onChange={(e) => patch("fullday_included_hrs", Number(e.target.value) || 1)} />
        </label>
        <label className="text-xs font-bold text-slate-600">
          Extra km net (₹)
          <input type="number" min={0} step="0.01" className={inputClass} value={form.extra_km_net} onChange={(e) => patch("extra_km_net", Number(e.target.value) || 0)} />
        </label>
        <label className="text-xs font-bold text-slate-600">
          Extra hour net (₹)
          <input type="number" min={0} step="0.01" className={inputClass} value={form.extra_hr_net} onChange={(e) => patch("extra_hr_net", Number(e.target.value) || 0)} />
        </label>
        <label className="text-xs font-bold text-slate-600">
          Driver allowance / night (₹)
          <input type="number" min={0} step="0.01" className={inputClass} value={form.driver_allowance_per_night} onChange={(e) => patch("driver_allowance_per_night", Number(e.target.value) || 0)} />
        </label>
        <label className="text-xs font-bold text-slate-600">
          Night charge (₹)
          <input type="number" min={0} step="0.01" className={inputClass} value={form.night_charge} onChange={(e) => patch("night_charge", Number(e.target.value) || 0)} />
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
      >
        {saving ? "Saving rates…" : "Save net rates"}
      </button>
    </form>
  );
}
