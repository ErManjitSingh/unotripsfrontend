"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CarFront, ChevronRight, Phone, Plus, UserRound } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { listPartnerVehicles, type PartnerCab } from "@/lib/cab-partner-api";
import { buildDriverRows, encodeDriverId } from "@/lib/partner-drivers";

export default function PartnerDriversPage() {
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
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load drivers.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const { drivers, unassigned } = useMemo(() => buildDriverRows(vehicles), [vehicles]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Drivers</h2>
          <p className="mt-1 text-sm text-slate-500">
            Drivers linked to your vehicles. Open a driver to view or edit details.
          </p>
        </div>
        <Link
          href="/cabs/partner/vehicles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white"
        >
          <Plus className="h-4 w-4" /> Add via vehicle
        </Link>
      </div>

      {loading ? (
        <div className="grid min-h-40 place-items-center">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : drivers.length === 0 && unassigned.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <UserRound className="mx-auto h-9 w-9 text-[#ef6614]" />
          <h3 className="mt-3 text-base font-black">No drivers yet</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
            Add a vehicle and fill in driver name and phone to see them here.
          </p>
          <Link
            href="/cabs/partner/vehicles/new"
            className="mt-5 inline-flex rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white"
          >
            Add vehicle
          </Link>
        </section>
      ) : (
        <>
          {drivers.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 sm:px-4">
                <p className="text-xs font-bold text-slate-500">
                  {drivers.length} driver{drivers.length === 1 ? "" : "s"}
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {drivers.map((driver) => (
                  <li key={driver.key}>
                    <Link
                      href={`/cabs/partner/drivers/${encodeDriverId(driver.key)}`}
                      className="flex items-center gap-3 px-3 py-2 transition hover:bg-orange-50/50 sm:px-4 sm:py-2.5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-xs font-black text-[#ef6614]">
                        {driver.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="truncate text-sm font-extrabold text-[#192131]">{driver.name}</h3>
                          {driver.vehicles.some((v) => v.is_active) ? (
                            <span className="rounded px-1.5 py-px text-[9px] font-bold bg-emerald-50 text-emerald-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded px-1.5 py-px text-[9px] font-bold bg-slate-100 text-slate-500">
                              Offline
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                          {driver.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {driver.phone}
                            </span>
                          ) : (
                            <span>No phone</span>
                          )}
                          {driver.license && <span>· DL {driver.license}</span>}
                          <span className="inline-flex items-center gap-1 capitalize">
                            · <CarFront className="h-3 w-3" />
                            {driver.vehicles.map((v) => v.name).join(", ")}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-amber-100 bg-white shadow-sm">
              <div className="border-b border-amber-50 px-3 py-2 sm:px-4">
                <p className="text-xs font-bold text-amber-700">
                  Needs driver · {unassigned.length} vehicle{unassigned.length === 1 ? "" : "s"}
                </p>
              </div>
              <ul className="divide-y divide-slate-50">
                {unassigned.map((cab) => (
                  <li key={cab.id}>
                    <Link
                      href={`/cabs/partner/vehicles/${cab.id}`}
                      className="flex items-center gap-3 px-3 py-2 transition hover:bg-amber-50/40 sm:px-4"
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
                          {cab.registration_number || "No registration"} · add driver to activate
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-extrabold text-[#ef6614]">Assign →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
