"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  createPartnerVehicle,
  updatePartnerVehicle,
  uploadPartnerVehiclePhoto,
  type PartnerCab,
  type PartnerCabCity,
  type PartnerCabPayload,
} from "@/lib/cab-partner-api";

const CATEGORIES = [
  { value: "hatchback", label: "Hatchback", image: "/images/cabs/fleet/hatchback-white.png", seats: 4, luggage: 2 },
  { value: "sedan", label: "Sedan", image: "/images/cabs/fleet/sedan-white.png", seats: 4, luggage: 3 },
  { value: "suv", label: "SUV", image: "/images/cabs/fleet/innova-white.png", seats: 6, luggage: 4 },
  { value: "muv", label: "MUV", image: "/images/cabs/fleet/ertiga-white.png", seats: 6, luggage: 3 },
  { value: "xuv", label: "XUV / 7-Seater", image: "/images/cabs/fleet/innova-white.png", seats: 7, luggage: 4 },
  { value: "innova", label: "Innova Crysta", image: "/images/cabs/fleet/innova-white.png", seats: 7, luggage: 4 },
  { value: "ertiga", label: "Ertiga", image: "/images/cabs/fleet/ertiga-white.png", seats: 6, luggage: 3 },
  { value: "tempo_traveller", label: "Tempo Traveller", image: "/images/cabs/fleet/tempo-white.png", seats: 12, luggage: 8 },
  { value: "mini_bus", label: "Mini Bus", image: "/images/cabs/fleet/tempo-white.png", seats: 18, luggage: 12 },
  { value: "bus", label: "Bus", image: "/images/cabs/fleet/tempo-white.png", seats: 30, luggage: 20 },
  { value: "luxury", label: "Luxury sedan", image: "/images/cabs/fleet/sedan-white.png", seats: 4, luggage: 3 },
  { value: "electric", label: "Electric", image: "/images/cabs/fleet/hatchback-white.png", seats: 4, luggage: 2 },
];

const FUEL_TYPES = ["petrol", "diesel", "cng", "electric", "hybrid"];
const PERMIT_TYPES = [
  { value: "all_india", label: "All India" },
  { value: "state", label: "State" },
  { value: "tourist", label: "Tourist" },
];
const FEATURES = ["GPS", "Music System", "Reclining Seats", "Charging Points", "First Aid Kit", "Bottle Water", "Blanket"];
const SERVICE_TYPES = [
  { value: "point_to_point", label: "Point to Point" },
  { value: "full_day_rental", label: "Full Day Rental" },
  { value: "airport_transfer", label: "Airport Transfer" },
  { value: "multi_day", label: "Multi Day" },
];
const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const STEPS = ["Vehicle", "Driver", "Cities & photos"];

type FormState = {
  name: string;
  category: string;
  seats: number;
  luggage_capacity: number;
  fuel_type: string;
  ac: boolean;
  permit_type: string;
  short_description: string;
  features: string[];
  service_types: string[];
  registration_number: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_year: string;
  base_city: string;
  vehicle_notes: string;
  driver_name: string;
  driver_phone: string;
  driver_whatsapp: string;
  driver_license: string;
  featured_image: string;
  gallery_images: string[];
  cities: PartnerCabCity[];
};

function fromCab(cab?: PartnerCab | null): FormState {
  return {
    name: cab?.name ?? "",
    category: cab?.category ?? "sedan",
    seats: cab?.seats ?? 4,
    luggage_capacity: cab?.luggage_capacity ?? 2,
    fuel_type: cab?.fuel_type ?? "diesel",
    ac: cab?.ac ?? true,
    permit_type: cab?.permit_type ?? "all_india",
    short_description: cab?.short_description ?? "",
    features: cab?.features ?? [],
    service_types: cab?.service_types ?? ["point_to_point"],
    registration_number: cab?.registration_number ?? "",
    vehicle_brand: cab?.vehicle_brand ?? "",
    vehicle_model: cab?.vehicle_model ?? "",
    vehicle_color: cab?.vehicle_color ?? "",
    vehicle_year: cab?.vehicle_year ? String(cab.vehicle_year) : "",
    base_city: cab?.base_city ?? "",
    vehicle_notes: cab?.vehicle_notes ?? "",
    driver_name: cab?.driver_name ?? "",
    driver_phone: cab?.driver_phone ?? "",
    driver_whatsapp: cab?.driver_whatsapp ?? "",
    driver_license: cab?.driver_license ?? "",
    featured_image: cab?.featured_image ?? "",
    gallery_images: cab?.gallery_images ?? [],
    cities: cab?.cities?.length ? cab.cities : [],
  };
}

function toPayload(form: FormState): PartnerCabPayload {
  return {
    name: form.name.trim(),
    category: form.category,
    seats: Number(form.seats) || 4,
    luggage_capacity: Number(form.luggage_capacity) || 0,
    fuel_type: form.fuel_type || null,
    ac: form.ac,
    permit_type: form.permit_type || null,
    short_description: form.short_description.trim(),
    features: form.features,
    service_types: form.service_types,
    registration_number: form.registration_number.trim() || null,
    vehicle_brand: form.vehicle_brand.trim() || null,
    vehicle_model: form.vehicle_model.trim() || null,
    vehicle_color: form.vehicle_color.trim() || null,
    vehicle_year: form.vehicle_year ? Number(form.vehicle_year) : null,
    base_city: form.base_city.trim() || null,
    vehicle_notes: form.vehicle_notes.trim() || null,
    driver_name: form.driver_name.trim() || null,
    driver_phone: form.driver_phone.trim() || null,
    driver_whatsapp: form.driver_whatsapp.trim() || null,
    driver_license: form.driver_license.trim() || null,
    featured_image: form.featured_image || null,
    gallery_images: form.gallery_images,
    cities: form.cities,
  };
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ef6614]";
const labelClass = "block text-xs font-bold text-slate-600";

export function PartnerVehicleForm({ initial }: { initial?: PartnerCab | null }) {
  const auth = useAuthOptional();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editing = Boolean(initial?.id);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => {
    const base = fromCab(initial);
    const category = !initial ? CATEGORIES.find((item) => item.value === searchParams.get("category")) : undefined;
    return category ? { ...base, category: category.value, seats: category.seats, luggage_capacity: category.luggage } : base;
  });
  const [cityDraft, setCityDraft] = useState({ city: "", state: "Himachal Pradesh" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const patch = (partial: Partial<FormState>) => setForm((prev) => ({ ...prev, ...partial }));

  const toggleList = (key: "features" | "service_types", value: string) => {
    setForm((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  const canContinue = useMemo(() => {
    if (step === 0) return form.name.trim().length >= 2 && form.category;
    if (step === 1) return true;
    return true;
  }, [step, form.name, form.category]);

  const addCity = () => {
    const city = cityDraft.city.trim();
    if (!city) return;
    if (form.cities.some((item) => item.city.toLowerCase() === city.toLowerCase())) return;
    patch({ cities: [...form.cities, { city, state: cityDraft.state }] });
    setCityDraft((prev) => ({ ...prev, city: "" }));
  };

  const uploadPhoto = async (file: File, kind: "featured" | "gallery") => {
    const token = auth?.getAccessToken();
    if (!token) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadPartnerVehiclePhoto(token, file, kind);
      if (kind === "featured") patch({ featured_image: url });
      else patch({ gallery_images: [...form.gallery_images, url].slice(0, 10) });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const token = auth?.getAccessToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = toPayload(form);
      if (!payload.name) throw new Error("Vehicle name is required.");
    const saved = editing && initial
      ? await updatePartnerVehicle(token, initial.id, payload)
      : await createPartnerVehicle(token, payload);
    if (editing) {
      setSuccess("Changes saved. Your vehicle stays open for further edits.");
      return;
    }
    router.push(`/cabs/partner/vehicles/${saved.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">{editing ? "Edit vehicle" : "Add vehicle"}</h2>
          <p className="mt-1 text-sm text-slate-500">List a cab travellers can book from you.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/cabs/partner/vehicles")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ef6614]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to fleet
        </button>
      </div>

      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="text-center">
            <span
              className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold ${
                index < step
                  ? "bg-emerald-500 text-white"
                  : index === step
                    ? "bg-[#ef6614] text-white"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {index < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <p className={`mt-1.5 text-[10px] font-bold ${index === step ? "text-[#192131]" : "text-slate-400"}`}>
              {label}
            </p>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <label className={labelClass}>
              Display name *
              <input required className={inputClass} value={form.name} onChange={(e) => patch({ name: e.target.value })} placeholder="e.g. Swift Dzire — AC Sedan" />
            </label>
            <div>
              <p className={labelClass}>Category *</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => patch({ category: item.value, seats: item.seats, luggage_capacity: item.luggage })}
                    className={`relative overflow-hidden rounded-xl border p-1.5 text-left transition ${
                      form.category === item.value
                        ? "border-[#ef6614] bg-orange-50 text-[#ef6614] ring-2 ring-orange-100"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/40"
                    }`}
                  >
                    <span className="relative block h-20 overflow-hidden rounded-lg bg-white">
                      <Image src={item.image} alt={`${item.label} taxi`} fill sizes="(max-width: 640px) 42vw, 180px" className="object-contain p-1" />
                    </span>
                    <span className="flex items-center justify-between gap-2 px-1 pb-0.5 pt-1.5">
                      <strong className="truncate text-[11px] font-extrabold">{item.label}</strong>
                      <small className="shrink-0 text-[9px] font-bold text-slate-400">{item.seats} seats</small>
                    </span>
                    {form.category === item.value && <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[#ef6614] text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                Seats
                <input type="number" min={1} max={100} className={inputClass} value={form.seats} onChange={(e) => patch({ seats: Number(e.target.value) })} />
              </label>
              <label className={labelClass}>
                Luggage capacity
                <input type="number" min={0} max={50} className={inputClass} value={form.luggage_capacity} onChange={(e) => patch({ luggage_capacity: Number(e.target.value) })} />
              </label>
              <label className={labelClass}>
                Fuel type
                <select className={inputClass} value={form.fuel_type} onChange={(e) => patch({ fuel_type: e.target.value })}>
                  {FUEL_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Permit
                <select className={inputClass} value={form.permit_type} onChange={(e) => patch({ permit_type: e.target.value })}>
                  {PERMIT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Registration number
                <input className={inputClass} value={form.registration_number} onChange={(e) => patch({ registration_number: e.target.value.toUpperCase() })} placeholder="HP03AB1234" />
              </label>
              <label className={`${labelClass} flex items-center gap-2 pt-6`}>
                <input type="checkbox" checked={form.ac} onChange={(e) => patch({ ac: e.target.checked })} />
                Air conditioned
              </label>
              <label className={labelClass}>
                Brand
                <input className={inputClass} value={form.vehicle_brand} onChange={(e) => patch({ vehicle_brand: e.target.value })} placeholder="Maruti" />
              </label>
              <label className={labelClass}>
                Model
                <input className={inputClass} value={form.vehicle_model} onChange={(e) => patch({ vehicle_model: e.target.value })} placeholder="Swift Dzire" />
              </label>
              <label className={labelClass}>
                Colour
                <input className={inputClass} value={form.vehicle_color} onChange={(e) => patch({ vehicle_color: e.target.value })} />
              </label>
              <label className={labelClass}>
                Year
                <input type="number" min={1990} max={2100} className={inputClass} value={form.vehicle_year} onChange={(e) => patch({ vehicle_year: e.target.value })} />
              </label>
              <label className={labelClass}>
                Base city
                <input className={inputClass} value={form.base_city} onChange={(e) => patch({ base_city: e.target.value })} placeholder="Shimla" />
              </label>
            </div>
            <label className={labelClass}>
              Short description
              <textarea className={`${inputClass} min-h-20`} value={form.short_description} onChange={(e) => patch({ short_description: e.target.value })} />
            </label>
            <div>
              <p className={labelClass}>Features</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEATURES.map((item) => (
                  <button key={item} type="button" onClick={() => toggleList("features", item)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${form.features.includes(item) ? "border-[#ef6614] bg-orange-50 text-[#ef6614]" : "border-slate-200 text-slate-600"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={labelClass}>Service types</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVICE_TYPES.map((item) => (
                  <button key={item.value} type="button" onClick={() => toggleList("service_types", item.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${form.service_types.includes(item.value) ? "border-[#ef6614] bg-orange-50 text-[#ef6614]" : "border-slate-200 text-slate-600"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <label className={labelClass}>
              Notes
              <textarea className={`${inputClass} min-h-16`} value={form.vehicle_notes} onChange={(e) => patch({ vehicle_notes: e.target.value })} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Driver name
              <input className={inputClass} value={form.driver_name} onChange={(e) => patch({ driver_name: e.target.value })} />
            </label>
            <label className={labelClass}>
              Driver phone
              <input className={inputClass} value={form.driver_phone} onChange={(e) => patch({ driver_phone: e.target.value })} placeholder="+91…" />
            </label>
            <label className={labelClass}>
              WhatsApp
              <input className={inputClass} value={form.driver_whatsapp} onChange={(e) => patch({ driver_whatsapp: e.target.value })} />
            </label>
            <label className={labelClass}>
              Driving licence
              <input className={inputClass} value={form.driver_license} onChange={(e) => patch({ driver_license: e.target.value })} />
            </label>
            <p className="sm:col-span-2 text-xs text-slate-500">
              Required before you can mark this vehicle Active. A shared Drivers roster comes later.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className={labelClass}>Operating cities</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input className={inputClass} value={cityDraft.city} onChange={(e) => setCityDraft((prev) => ({ ...prev, city: e.target.value }))} placeholder="City" />
                <select className={inputClass} value={cityDraft.state} onChange={(e) => setCityDraft((prev) => ({ ...prev, state: e.target.value }))}>
                  {INDIA_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <button type="button" onClick={addCity} className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {form.cities.map((item) => (
                  <li key={`${item.city}-${item.state}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <span className="font-semibold">{item.city}, {item.state}</span>
                    <button type="button" onClick={() => patch({ cities: form.cities.filter((c) => c.city !== item.city) })} className="text-slate-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {form.cities.length === 0 && <li className="text-xs text-slate-400">Add at least one city before activating.</li>}
              </ul>
            </div>

            <div>
              <p className={labelClass}>Featured photo</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {form.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.featured_image} alt="" className="h-24 w-36 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-24 w-36 place-items-center rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-400">No photo</div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#ef6614] hover:text-[#ef6614]">
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading…" : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadPhoto(file, "featured");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <p className={labelClass}>Gallery (up to 10)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.gallery_images.map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-20 w-28 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => patch({ gallery_images: form.gallery_images.filter((item) => item !== url) })}
                      className="absolute right-1 top-1 rounded bg-white/90 p-0.5 text-slate-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {form.gallery_images.length < 10 && (
                  <label className="grid h-20 w-28 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 text-[11px] font-bold text-slate-500 hover:border-[#ef6614] hover:text-[#ef6614]">
                    + Add
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadPhoto(file, "gallery");
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
          {success && <p role="status" className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{success}</p>}

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 disabled:opacity-40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ef6614] px-5 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
          >
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ef6614] px-5 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add vehicle"}
          </button>
        )}
      </div>
    </form>
  );
}
