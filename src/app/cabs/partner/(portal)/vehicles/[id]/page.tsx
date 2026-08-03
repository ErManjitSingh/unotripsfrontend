"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CarFront, Pencil } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getPartnerVehicle,
  setPartnerVehicleStatus,
  type PartnerCab,
} from "@/lib/cab-partner-api";
import { PartnerVehicleForm } from "@/components/cabs/partner/PartnerVehicleForm";
import { PartnerVehiclePricingForm } from "@/components/cabs/partner/PartnerVehiclePricingForm";

export default function PartnerVehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const cabId = params.id;
  const auth = useAuthOptional();
  const router = useRouter();
  const [cab, setCab] = useState<PartnerCab | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token || !cabId) return;
    let cancelled = false;
    setLoading(true);
    getPartnerVehicle(token, cabId)
      .then((item) => {
        if (!cancelled) setCab(item);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load vehicle.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth, cabId]);

  const toggleStatus = async () => {
    const token = auth?.getAccessToken();
    if (!token || !cab) return;
    setWorking(true);
    setError("");
    try {
      const next = await setPartnerVehicleStatus(token, cab.id, !cab.is_active);
      setCab(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update status.");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  if (!cab) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{error || "Vehicle not found."}</p>
        <button type="button" onClick={() => router.push("/cabs/partner/vehicles")} className="mt-4 text-xs font-extrabold text-[#ef6614]">
          Back to fleet
        </button>
      </section>
    );
  }

  if (editing) {
    return (
      <div className="w-full space-y-4">
        <button type="button" onClick={() => setEditing(false)} className="text-xs font-bold text-slate-500 hover:text-[#ef6614]">
          ← Cancel editing
        </button>
        <PartnerVehicleForm initial={cab} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-20 sm:w-28">
            {cab.featured_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cab.featured_image}
                alt=""
                width={112}
                height={80}
                className="h-full w-full object-contain p-1"
                loading="eager"
                decoding="async"
              />
            ) : (
              <CarFront className="h-6 w-6 text-slate-300" />
            )}
          </div>
          <div className="min-w-0">
            <Link href="/cabs/partner/vehicles" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ef6614]">
              <ArrowLeft className="h-3.5 w-3.5" /> My Vehicles
            </Link>
            <h2 className="mt-1 truncate text-xl font-black tracking-tight sm:text-2xl">{cab.name}</h2>
            <p className="mt-1 text-sm capitalize text-slate-500">
              {cab.category.replaceAll("_", " ")} · {cab.seats} seats{cab.ac ? " · AC" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            type="button"
            disabled={working}
            onClick={() => void toggleStatus()}
            className={`rounded-lg px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50 ${
              cab.is_active ? "bg-slate-700" : "bg-emerald-600"
            }`}
          >
            {working ? "Updating…" : cab.is_active ? "Set offline" : "Activate"}
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Status", cab.is_active ? "Active" : "Offline"],
            ["Registration", cab.registration_number || "—"],
            ["Brand / Model", [cab.vehicle_brand, cab.vehicle_model].filter(Boolean).join(" ") || "—"],
            ["Colour / Year", [cab.vehicle_color, cab.vehicle_year].filter(Boolean).join(" · ") || "—"],
            ["Fuel / Permit", [cab.fuel_type, cab.permit_type?.replaceAll("_", " ")].filter(Boolean).join(" · ") || "—"],
            ["Base city", cab.base_city || "—"],
            ["Driver", cab.driver_name || "—"],
            ["Driver phone", cab.driver_phone || "—"],
            ["Cities", cab.cities.map((c) => c.city).join(", ") || "None"],
            ["Pricing", cab.has_pricing ? "Configured" : "Not set yet"],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-slate-100 px-4 py-3 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#192131]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {cab.gallery_images.length > 1 && (
        <div>
          <h3 className="text-sm font-extrabold">Gallery</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {cab.gallery_images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-16 w-24 rounded-lg object-contain bg-white border border-slate-100" loading="lazy" />
            ))}
          </div>
        </div>
      )}

      {cab.short_description && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          {cab.short_description}
        </p>
      )}

      <PartnerVehiclePricingForm
        cabId={cab.id}
        onSaved={() => setCab((prev) => (prev ? { ...prev, has_pricing: true } : prev))}
      />
    </div>
  );
}
