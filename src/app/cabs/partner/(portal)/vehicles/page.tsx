"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CarFront, ChevronRight, Plus } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { listPartnerVehicles, type PartnerCab } from "@/lib/cab-partner-api";

function categoryLabel(value: string) {
  return value.replaceAll("_", " ");
}

const VEHICLE_TYPES = [
  { value: "hatchback", label: "Hatchback", image: "/images/cabs/fleet/hatchback-white.png" },
  { value: "sedan", label: "Sedan", image: "/images/cabs/fleet/sedan-white.png" },
  { value: "suv", label: "SUV", image: "/images/cabs/fleet/innova-white.png" },
  { value: "muv", label: "MUV", image: "/images/cabs/fleet/ertiga-white.png" },
  { value: "xuv", label: "XUV / 7-Seater", image: "/images/cabs/fleet/innova-white.png" },
  { value: "innova", label: "Innova Crysta", image: "/images/cabs/fleet/innova-white.png" },
  { value: "ertiga", label: "Ertiga", image: "/images/cabs/fleet/ertiga-white.png" },
  { value: "tempo_traveller", label: "Tempo Traveller", image: "/images/cabs/fleet/tempo-white.png" },
  { value: "mini_bus", label: "Mini Bus", image: "/images/cabs/fleet/tempo-white.png" },
  { value: "bus", label: "Bus", image: "/images/cabs/fleet/tempo-white.png" },
  { value: "luxury", label: "Luxury Sedan", image: "/images/cabs/fleet/sedan-white.png" },
  { value: "electric", label: "Electric", image: "/images/cabs/fleet/hatchback-white.png" },
];

export default function PartnerVehiclesPage() {
  const auth = useAuthOptional();
  const [vehicles, setVehicles] = useState<PartnerCab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    listPartnerVehicles(token)
      .then((items) => {
        if (!cancelled) setVehicles(items);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load vehicles.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">My Vehicles</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add and manage the cabs travellers can book from you.
          </p>
        </div>
        <Link
          href="/cabs/partner/vehicles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Plus className="h-4 w-4" /> Add vehicle
        </Link>
      </div>

      {loading ? (
        <div className="grid min-h-48 place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : vehicles.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="text-center">
            <CarFront className="mx-auto h-8 w-8 text-[#ef6614]" />
            <h3 className="mt-2 text-lg font-black">Choose your first vehicle</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Select a type to start with the right seats and luggage capacity already filled in.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {VEHICLE_TYPES.map((vehicle) => (
              <Link
                key={vehicle.value}
                href={`/cabs/partner/vehicles/new?category=${vehicle.value}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
              >
                <span className="relative block h-20 rounded-lg bg-white sm:h-24">
                  <Image src={vehicle.image} alt={vehicle.label} fill sizes="(max-width: 640px) 42vw, 180px" className="object-contain p-1" />
                </span>
                <strong className="block truncate px-1 pb-1 pt-1.5 text-center text-[11px] font-extrabold text-[#192131] group-hover:text-[#ef6614]">{vehicle.label}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {vehicles.map((cab) => (
              <li key={cab.id}>
                <Link
                  href={`/cabs/partner/vehicles/${cab.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-orange-50/50 sm:gap-4 sm:px-4 sm:py-3"
                >
                  <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-50 sm:h-16 sm:w-24">
                    {cab.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cab.featured_image}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <CarFront className="h-6 w-6 text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold text-[#192131]">{cab.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          cab.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {cab.is_active ? "Active" : "Offline"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs capitalize text-slate-500">
                      {categoryLabel(cab.category)} · {cab.seats} seats
                      {cab.ac ? " · AC" : ""} · {cab.registration_number || "No registration"} ·{" "}
                      {cab.cities.length} cit{cab.cities.length === 1 ? "y" : "ies"}
                    </p>
                    <p
                      className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${
                        cab.has_pricing ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {cab.has_pricing ? "Pricing set" : "Pricing incomplete"}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
