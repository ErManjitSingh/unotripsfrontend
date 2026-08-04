"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  cancelPartnerBooking,
  getPartnerBooking,
  listPartnerVehicles,
  markPartnerBookingCompleted,
  updatePartnerBookingDriver,
  updatePartnerBookingVehicle,
  type PartnerCab,
  type PartnerCabBooking,
} from "@/lib/cab-partner-api";
import { buildDriverRows } from "@/lib/partner-drivers";

function statusTone(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";
    case "completed":
      return "bg-sky-50 text-sky-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatMoney(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PartnerBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;
  const auth = useAuthOptional();
  const router = useRouter();
  const [booking, setBooking] = useState<PartnerCabBooking | null>(null);
  const [fleet, setFleet] = useState<PartnerCab[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [syncDriver, setSyncDriver] = useState(true);
  const [rosterKeys, setRosterKeys] = useState<{ label: string; name: string; phone: string }[]>([]);

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token || !bookingId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getPartnerBooking(token, bookingId), listPartnerVehicles(token)])
      .then(([item, vehicles]) => {
        if (cancelled) return;
        setBooking(item);
        setFleet(vehicles);
        setDriverName(item.driver_name || "");
        setDriverPhone(item.driver_phone || "");
        setVehicleId(item.cab_type_id);
        const { drivers } = buildDriverRows(vehicles);
        setRosterKeys(
          drivers.map((d) => ({
            label: `${d.name}${d.phone ? ` · ${d.phone}` : ""}`,
            name: d.name,
            phone: d.phone || "",
          })),
        );
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load booking.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth, bookingId]);

  const canEditDriver = booking?.status === "confirmed" || booking?.status === "completed";
  const canReassign = booking?.status === "confirmed";
  const eligibleVehicles = fleet.filter(
    (cab) => cab.is_active && cab.seats >= (booking?.passengers ?? 1),
  );

  const markDone = async () => {
    const token = auth?.getAccessToken();
    if (!token || !booking) return;
    setWorking(true);
    setError("");
    try {
      const next = await markPartnerBookingCompleted(token, booking.id);
      setBooking(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update booking.");
    } finally {
      setWorking(false);
    }
  };

  const saveDriver = async () => {
    const token = auth?.getAccessToken();
    if (!token || !booking) return;
    setSavingDriver(true);
    setError("");
    try {
      const next = await updatePartnerBookingDriver(token, booking.id, {
        driver_name: driverName.trim(),
        driver_phone: driverPhone.trim(),
      });
      setBooking(next);
      setDriverName(next.driver_name || "");
      setDriverPhone(next.driver_phone || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update driver.");
    } finally {
      setSavingDriver(false);
    }
  };

  const saveVehicle = async () => {
    const token = auth?.getAccessToken();
    if (!token || !booking || !vehicleId) return;
    setSavingVehicle(true);
    setError("");
    try {
      const next = await updatePartnerBookingVehicle(token, booking.id, {
        cab_id: vehicleId,
        sync_driver: syncDriver,
      });
      setBooking(next);
      setVehicleId(next.cab_type_id);
      setDriverName(next.driver_name || "");
      setDriverPhone(next.driver_phone || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reassign vehicle.");
    } finally {
      setSavingVehicle(false);
    }
  };

  const confirmCancel = async () => {
    const token = auth?.getAccessToken();
    if (!token || !booking) return;
    setCancelling(true);
    setError("");
    try {
      const next = await cancelPartnerBooking(token, booking.id, cancelReason.trim());
      setBooking(next);
      setShowCancel(false);
      setCancelReason("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{error || "Booking not found."}</p>
        <button
          type="button"
          onClick={() => router.push("/cabs/partner/bookings")}
          className="mt-4 text-xs font-extrabold text-[#ef6614]"
        >
          Back to bookings
        </button>
      </section>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/cabs/partner/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ef6614]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Bookings
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black tracking-tight">
              {booking.pickup_city} → {booking.drop_city}
            </h2>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold capitalize ${statusTone(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {booking.confirmation_number} · {formatDate(booking.travel_date)}
            {booking.return_date ? ` → ${formatDate(booking.return_date)}` : ""}
          </p>
        </div>
        {booking.status === "confirmed" && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={working}
              onClick={() => void markDone()}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
            >
              {working ? "Updating…" : "Mark completed"}
            </button>
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-extrabold text-red-600"
            >
              Cancel booking
            </button>
          </div>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      {booking.status === "cancelled" && booking.cancellation_reason && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          Cancelled{booking.cancelled_at ? ` · ${formatDate(booking.cancelled_at)}` : ""}:{" "}
          {booking.cancellation_reason}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-extrabold">Trip</h3>
          </div>
          <dl className="grid gap-0 sm:grid-cols-2">
            {[
              ["Pickup", `${booking.pickup_address}, ${booking.pickup_city}`],
              ["Drop", `${booking.drop_address}, ${booking.drop_city}`],
              ["Trip type", booking.trip_type.replaceAll("_", " ")],
              ["Distance", `${booking.billed_distance_km} km${booking.is_outstation ? " · Outstation" : ""}`],
              ["Vehicle", booking.cab_name],
              ["Registration", booking.vehicle_registration || "—"],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-slate-50 px-4 py-2.5">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold capitalize text-[#192131]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-extrabold">Guest & payout</h3>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <p className="text-sm font-extrabold text-[#192131]">
                {booking.guest_first_name} {booking.guest_last_name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {booking.guest_phone}
                </span>
                <span>{booking.guest_email}</span>
                <span>{booking.passengers} pax</span>
              </p>
              {booking.special_instructions && (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {booking.special_instructions}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Trip fare (net)</span>
                <span className="font-bold">{formatMoney(booking.trip_fare_net, booking.currency)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Driver allowance</span>
                <span className="font-bold">{formatMoney(booking.driver_allowance, booking.currency)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Night charge</span>
                <span className="font-bold">{formatMoney(booking.night_charge, booking.currency)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-extrabold text-[#192131]">Your net</span>
                <span className="font-black text-[#ef6614]">
                  {formatMoney(booking.subtotal_net, booking.currency)}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Guest paid {formatMoney(booking.total_amount, booking.currency)} (incl. GST)
              </p>
            </div>
          </div>
        </section>
      </div>

      {canReassign && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-extrabold">Reassign vehicle</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Switch to another active cab in your fleet. Availability blocks move with the booking.
          </p>
          <label className="mt-3 block text-xs font-bold text-slate-600">
            Vehicle
            <select
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-[#192131]"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {eligibleVehicles.map((cab) => (
                <option key={cab.id} value={cab.id}>
                  {cab.name}
                  {cab.registration_number ? ` · ${cab.registration_number}` : ""} · {cab.seats} seats
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={syncDriver}
              onChange={(e) => setSyncDriver(e.target.checked)}
              className="rounded border-slate-300"
            />
            Also apply this vehicle&apos;s default driver
          </label>
          <button
            type="button"
            disabled={savingVehicle || !vehicleId || vehicleId === booking.cab_type_id}
            onClick={() => void saveVehicle()}
            className="mt-3 rounded-lg bg-[#192131] px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
          >
            {savingVehicle ? "Saving…" : "Save vehicle"}
          </button>
        </section>
      )}

      {canEditDriver && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h3 className="text-sm font-extrabold">Assigned driver</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Travellers see this name and phone on their confirmation once set.
            </p>
          </div>
          {rosterKeys.length > 0 && (
            <div className="mt-3">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Pick from roster
              </label>
              <select
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                value=""
                onChange={(event) => {
                  const picked = rosterKeys.find((d) => d.label === event.target.value);
                  if (!picked) return;
                  setDriverName(picked.name);
                  setDriverPhone(picked.phone);
                }}
              >
                <option value="">Select a driver…</option>
                {rosterKeys.map((d) => (
                  <option key={d.label} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">
              Driver name
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-[#192131]"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Full name"
              />
            </label>
            <label className="text-xs font-bold text-slate-600">
              Driver phone
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-[#192131]"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+91…"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={savingDriver || !driverName.trim() || !driverPhone.trim()}
            onClick={() => void saveDriver()}
            className="mt-3 rounded-lg bg-[#ef6614] px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
          >
            {savingDriver ? "Saving…" : "Save driver"}
          </button>
        </section>
      )}

      {showCancel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-black text-[#192131]">Cancel this booking?</h3>
            <p className="mt-1 text-xs text-slate-500">
              Cancelling notifies the traveller and starts a season-policy refund when payment was captured.
            </p>
            <label className="mt-4 block text-xs font-bold text-slate-600">
              Reason
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Vehicle breakdown — guest informed"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancel(false);
                  setCancelReason("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600"
              >
                Keep booking
              </button>
              <button
                type="button"
                disabled={cancelling || cancelReason.trim().length < 5}
                onClick={() => void confirmCancel()}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
