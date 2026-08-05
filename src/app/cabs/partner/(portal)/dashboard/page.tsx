"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Plus,
  Wallet,
} from "lucide-react";
import { usePartnerPortal } from "@/components/cabs/partner/PartnerPortalProvider";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getPartnerEarningsSummary,
  listPartnerBookings,
  listPartnerVehicles,
  type PartnerCab,
  type PartnerCabBooking,
  type PartnerEarningsSummary,
} from "@/lib/cab-partner-api";
import { cn } from "@/lib/utils";

function formatTripWhen(iso: string | null | undefined) {
  if (!iso) return "Date TBD";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function timeLeft(iso: string | null | undefined) {
  if (!iso) return "Reply soon";
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "Ending soon";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h left`;
  return `${Math.floor(hrs / 24)}d left`;
}

export default function PartnerDashboardPage() {
  const auth = useAuthOptional();
  const { requests, application } = usePartnerPortal();
  const firstName = (application.owner_name || application.business_name || "Partner").split(" ")[0];
  const [vehicles, setVehicles] = useState<PartnerCab[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [bookings, setBookings] = useState<PartnerCabBooking[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarningsSummary | null>(null);

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setVehiclesLoading(true);
    Promise.all([
      listPartnerVehicles(token),
      listPartnerBookings(token),
      getPartnerEarningsSummary(token).catch(() => null),
    ])
      .then(([fleet, trips, summary]) => {
        if (cancelled) return;
        setVehicles(fleet);
        setBookings(trips);
        setEarnings(summary);
      })
      .catch(() => {
        if (cancelled) return;
        setVehicles([]);
        setBookings([]);
        setEarnings(null);
      })
      .finally(() => {
        if (!cancelled) setVehiclesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const needsReply = useMemo(
    () => requests.filter((r) => !(r.quotes && r.quotes.length > 0)),
    [requests],
  );
  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "confirmed" || b.status === "pending")
        .sort((a, b) => new Date(a.travel_date).getTime() - new Date(b.travel_date).getTime())
        .slice(0, 3),
    [bookings],
  );
  const activeCars = vehicles.filter((v) => v.is_active);
  const hasEarnings = Boolean(earnings && earnings.completed_trips > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Greeting — short */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-[#192131]">Hi {firstName}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {needsReply.length > 0
            ? `${needsReply.length} trip${needsReply.length === 1 ? "" : "s"} waiting for your fare.`
            : "You’re all caught up on replies."}
        </p>
      </div>

      {/* Primary job: reply to trips */}
      <section
        className={cn(
          "overflow-hidden rounded-2xl border shadow-sm",
          needsReply.length > 0 ? "border-orange-200 bg-[linear-gradient(160deg,#fff7ed_0%,#ffffff_55%)]" : "border-slate-200 bg-white",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-orange-100/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-9 w-9 place-items-center rounded-xl",
                needsReply.length > 0 ? "bg-[#ef6614] text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#192131]">Trip requests</h3>
              <p className="text-[11px] text-slate-500">
                {needsReply.length > 0 ? "Tap a trip and send your fare" : "New guest requests show up here"}
              </p>
            </div>
          </div>
          <Link href="/cabs/partner/quotes" className="text-[12px] font-extrabold text-[#ef6614]">
            Open all
          </Link>
        </div>

        {needsReply.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-bold text-[#192131]">No pending replies</p>
            <p className="mt-1 text-[12px] text-slate-500">
              When a guest needs a cab on your routes, you’ll see it here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-orange-50">
            {needsReply.slice(0, 4).map((request) => (
              <li key={request.id}>
                <Link
                  href={`/cabs/partner/quotes?request=${request.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-orange-50/70"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold text-[#192131]">
                      {request.pickup_city} → {request.drop_city}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {formatTripWhen(request.pickup_at)} · {request.passengers} traveller
                      {request.passengers === 1 ? "" : "s"}
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <Clock3 className="h-3 w-3" />
                      {timeLeft(request.quote_deadline_at)}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#ef6614] px-3 py-2 text-[12px] font-extrabold text-white">
                    Reply
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upcoming trips */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#192131]">Upcoming trips</h3>
              <p className="text-[11px] text-slate-500">Confirmed bookings</p>
            </div>
          </div>
          <Link href="/cabs/partner/bookings" className="text-[12px] font-extrabold text-[#ef6614]">
            My trips
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="px-4 py-7 text-center">
            <p className="text-sm font-bold text-[#192131]">No trips booked yet</p>
            <p className="mt-1 text-[12px] text-slate-500">
              When a guest books your quote, the trip appears here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {upcoming.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/cabs/partner/bookings/${booking.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#192131]">
                      {booking.pickup_city} → {booking.drop_city}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {formatTripWhen(booking.travel_date)}
                      {booking.cab_name ? ` · ${booking.cab_name}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[#192131]">
                    {formatMoney(booking.subtotal_net)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cars — compact */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CarFront className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#192131]">My cars</h3>
              <p className="text-[11px] text-slate-500">
                {vehiclesLoading
                  ? "Loading…"
                  : vehicles.length === 0
                    ? "Add a car to send quotes"
                    : `${activeCars.length} on · ${vehicles.length} total`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/cabs/partner/vehicles/new"
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#ef6614] px-2.5 text-[11px] font-extrabold text-white"
            >
              <Plus className="h-3 w-3" />
              Add
            </Link>
            <Link href="/cabs/partner/vehicles" className="text-[12px] font-extrabold text-[#ef6614]">
              All
            </Link>
          </div>
        </div>

        {vehiclesLoading ? (
          <div className="grid place-items-center py-8">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-100 border-t-[#ef6614]" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="px-4 py-7 text-center">
            <p className="text-sm font-bold text-[#192131]">No cars yet</p>
            <p className="mt-1 text-[12px] text-slate-500">Add one car so you can reply to trip requests.</p>
            <Link
              href="/cabs/partner/vehicles/new"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#ef6614] px-4 text-[13px] font-extrabold text-white"
            >
              Add your first car
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {vehicles.slice(0, 3).map((cab) => (
              <li key={cab.id}>
                <Link
                  href={`/cabs/partner/vehicles/${cab.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50"
                >
                  <div className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-50">
                    {cab.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cab.featured_image} alt="" className="h-full w-full object-contain" loading="lazy" />
                    ) : (
                      <CarFront className="h-3.5 w-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-extrabold text-[#192131]">{cab.name}</p>
                    <p className="truncate text-[10px] capitalize text-slate-400">
                      {cab.category.replaceAll("_", " ")}
                      {cab.registration_number ? ` · ${cab.registration_number}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      cab.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {cab.is_active ? "On" : "Off"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Money — one quiet row, only useful when real */}
      <Link
        href="/cabs/partner/earnings"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-orange-200"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <Wallet className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Earnings</p>
          <p className="text-sm font-black text-[#192131]">
            {hasEarnings
              ? formatMoney(earnings!.total_earnings, earnings!.currency || "INR")
              : "No payouts yet"}
          </p>
          <p className="text-[11px] text-slate-500">
            {hasEarnings
              ? `${earnings!.completed_trips} completed trip${earnings!.completed_trips === 1 ? "" : "s"}`
              : "Shows after you finish trips"}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
      </Link>
    </div>
  );
}
