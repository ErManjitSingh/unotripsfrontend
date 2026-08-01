"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CarFront, Phone, Save } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  listPartnerVehicles,
  updatePartnerVehicle,
  type PartnerCab,
} from "@/lib/cab-partner-api";
import {
  buildDriverRows,
  decodeDriverId,
  driverIdentityKey,
  encodeDriverId,
} from "@/lib/partner-drivers";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#192131] outline-none focus:border-[#ef6614]";

export default function PartnerDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const driverId = params.id;
  const auth = useAuthOptional();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<PartnerCab[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [license, setLicense] = useState("");

  const key = useMemo(() => (driverId ? decodeDriverId(driverId) : null), [driverId]);

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    listPartnerVehicles(token)
      .then((items) => {
        if (cancelled) return;
        setVehicles(items);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load driver.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const driver = useMemo(() => {
    if (!key) return null;
    return buildDriverRows(vehicles).drivers.find((row) => row.key === key) ?? null;
  }, [vehicles, key]);

  useEffect(() => {
    if (!driver) return;
    setName(driver.name === "Unnamed driver" ? "" : driver.name);
    setPhone(driver.phone || "");
    setWhatsapp(driver.whatsapp || "");
    setLicense(driver.license || "");
  }, [driver]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = auth?.getAccessToken();
    if (!token || !driver) return;
    if (!name.trim() || !phone.trim()) {
      setError("Driver name and phone are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = {
        driver_name: name.trim(),
        driver_phone: phone.trim(),
        driver_whatsapp: whatsapp.trim() || null,
        driver_license: license.trim() || null,
      };
      const updated = await Promise.all(
        driver.vehicles.map((cab) => updatePartnerVehicle(token, cab.id, payload)),
      );
      setVehicles((prev) => {
        const byId = new Map(updated.map((cab) => [cab.id, cab]));
        return prev.map((cab) => byId.get(cab.id) ?? cab);
      });
      setSaved(true);
      const nextKey = driverIdentityKey(payload.driver_name, payload.driver_phone);
      if (nextKey !== key) {
        router.replace(`/cabs/partner/drivers/${encodeDriverId(nextKey)}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save driver.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  if (!key || !driver) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{error || "Driver not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/cabs/partner/drivers")}
          className="mt-4 text-xs font-extrabold text-[#ef6614]"
        >
          Back to drivers
        </button>
      </section>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-50 text-base font-black text-[#ef6614]">
            {(name || driver.name).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <Link
              href="/cabs/partner/drivers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ef6614]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Drivers
            </Link>
            <h2 className="mt-1 truncate text-xl font-black tracking-tight">{name || driver.name}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
              {phone || driver.phone ? (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {phone || driver.phone}
                </span>
              ) : (
                <span>No phone</span>
              )}
              <span>
                · {driver.vehicles.length} vehicle{driver.vehicles.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      {saved && !error && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Driver details saved across assigned vehicles.
        </p>
      )}

      <form onSubmit={submit} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-extrabold">Driver details</h3>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-500">
            Name
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="text-xs font-bold text-slate-500">
            Phone
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label className="text-xs font-bold text-slate-500">
            WhatsApp
            <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </label>
          <label className="text-xs font-bold text-slate-500">
            License
            <input className={inputClass} value={license} onChange={(e) => setLicense(e.target.value)} />
          </label>
        </div>
        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#ef6614] px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save driver"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-extrabold">Assigned vehicles</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {driver.vehicles.map((cab) => (
            <li key={cab.id}>
              <Link
                href={`/cabs/partner/vehicles/${cab.id}`}
                className="flex items-center gap-3 px-4 py-2 transition hover:bg-orange-50/40"
              >
                <div className="grid h-8 w-12 shrink-0 place-items-center overflow-hidden rounded bg-slate-50">
                  {cab.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cab.featured_image} alt="" className="h-full w-full object-contain" loading="lazy" />
                  ) : (
                    <CarFront className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-[#192131]">{cab.name}</p>
                  <p className="truncate text-[10px] text-slate-400">
                    {cab.registration_number || "No registration"} · {cab.is_active ? "Active" : "Offline"}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-[#ef6614]">Open →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
