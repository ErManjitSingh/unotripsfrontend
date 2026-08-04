"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarCheck2,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  TrendingDown,
  TrendingUp,
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

function formatRelative(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTripDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function vehicleLabel(categories: string[] | undefined) {
  if (!categories?.length) return "Any vehicle";
  return categories[0].replaceAll("_", " ");
}

function categoryLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function PartnerDashboardPage() {
  const auth = useAuthOptional();
  const { requests, application } = usePartnerPortal();
  const pendingQuotes = requests.length;
  const name = application.business_name || application.owner_name;
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

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const earningsLabel =
    earnings && earnings.completed_trips > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: earnings.currency || "INR",
          maximumFractionDigits: 0,
        }).format(earnings.total_earnings)
      : "—";
  const maxDay = Math.max(1, ...(earnings?.daily.map((d) => d.amount) ?? [1]));

  const stats = [
    {
      label: "Total Bookings",
      value: String(bookings.length || "—"),
      hint: bookings.length ? "Across all statuses" : "After trips are confirmed",
      icon: CalendarCheck2,
      tone: "bg-orange-50 text-[#ef6614]",
    },
    {
      label: "Confirmed Bookings",
      value: String(confirmedCount || "—"),
      hint: confirmedCount ? "Upcoming / active trips" : "No confirmed trips yet",
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending Quotes",
      value: String(pendingQuotes),
      hint: pendingQuotes ? "Awaiting your response" : "Inbox is clear",
      icon: Clock3,
      tone: "bg-amber-50 text-amber-600",
      live: true,
    },
    {
      label: "Completed Trips",
      value: String(completedCount || "—"),
      hint: completedCount ? "Finished successfully" : "Available once trips finish",
      icon: CarFront,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Total Earnings",
      value: earningsLabel,
      hint: earnings?.completed_trips
        ? `${earnings.completed_trips} completed trips`
        : "Connects after completed trips",
      icon: Wallet,
      tone: "bg-violet-50 text-violet-600",
    },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">
        {stats.map(({ label, value, hint, icon: Icon, tone, ...rest }) => (
          <article
            key={label}
            className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-xl sm:p-4 ${label === "Total Earnings" ? "col-span-2 xl:col-span-1" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-black tracking-tight text-[#192131] sm:mt-1.5 sm:text-2xl">{value}</p>
                <p className={`mt-1 text-[11px] font-semibold ${"live" in rest && rest.live && pendingQuotes > 0 ? "text-[#ef6614]" : "text-slate-400"}`}>
                  {hint}
                </p>
              </div>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone} sm:h-10 sm:w-10 sm:rounded-lg`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* My Vehicles */}
      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="text-sm font-black">My Vehicles</h2>
            {!vehiclesLoading && vehicles.length > 0 && (
              <span className="truncate text-[11px] font-semibold text-slate-400">
                {vehicles.filter((v) => v.is_active).length}/{vehicles.length} active
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/cabs/partner/vehicles/new"
              className="inline-flex items-center gap-1 rounded-md bg-[#ef6614] px-2 py-1 text-[10px] font-extrabold text-white"
            >
              <Plus className="h-3 w-3" /> Add
            </Link>
            <Link href="/cabs/partner/vehicles" className="text-[11px] font-bold text-[#ef6614]">
              View all
            </Link>
          </div>
        </div>

        {vehiclesLoading ? (
          <div className="grid min-h-12 place-items-center py-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-100 border-t-[#ef6614]" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
            <p className="text-xs text-slate-500">No vehicles yet</p>
            <Link href="/cabs/partner/vehicles/new" className="text-[11px] font-extrabold text-[#ef6614]">
              Add vehicle →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {vehicles.slice(0, 4).map((cab) => (
              <li key={cab.id}>
                <Link
                  href={`/cabs/partner/vehicles/${cab.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 transition hover:bg-orange-50/40 sm:px-4"
                >
                  <div className="grid h-8 w-12 shrink-0 place-items-center overflow-hidden rounded bg-slate-50">
                    {cab.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cab.featured_image}
                        alt=""
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <CarFront className="h-3.5 w-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-extrabold text-[#192131]">{cab.name}</span>
                      <span
                        className={`shrink-0 rounded px-1 py-px text-[9px] font-bold ${
                          cab.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cab.is_active ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="truncate text-[10px] capitalize text-slate-400">
                      {categoryLabel(cab.category)} · {cab.registration_number || "No reg"}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>

      {/* Middle: earnings + recent bookings */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black">Earnings Overview</h2>
              <p className="mt-1 text-xs text-slate-500">Net from completed trips over the last 7 days.</p>
            </div>
            <Link
              href="/cabs/partner/earnings"
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-[#ef6614]"
            >
              View earnings
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Earnings</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-[#192131]">{earningsLabel}</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
                <TrendingUp className="h-3.5 w-3.5" />
                {earnings?.this_week_earnings
                  ? `₹${Math.round(earnings.this_week_earnings).toLocaleString("en-IN")} this week`
                  : "No trip payouts yet"}
              </p>
            </div>
          </div>
          <div className="mt-6 flex h-40 items-end gap-2 rounded-lg bg-[#fafafa] px-3 pb-3 pt-6">
            {(earnings?.daily ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => ({
              date: label,
              label,
              amount: 0,
              trip_count: 0,
            }))).map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t ${day.amount > 0 ? "bg-[#ef6614]/80" : "bg-slate-200/80"}`}
                  style={{ height: day.amount > 0 ? Math.max(8, Math.round((day.amount / maxDay) * 120)) : 12 }}
                />
                <span className="text-[10px] font-semibold text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Recent Bookings</h2>
            <Link href="/cabs/partner/bookings" className="text-xs font-bold text-[#ef6614]">
              View all
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="mt-6 grid place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
              <p className="text-sm font-bold text-slate-600">No bookings yet</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                Confirmed trips for {name} will show up here with route, fare, and status.
              </p>
              <Link href="/cabs/partner/quotes" className="mt-4 text-xs font-extrabold text-[#ef6614]">
                Respond to quote requests →
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {bookings.slice(0, 4).map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/cabs/partner/bookings/${booking.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 transition hover:bg-orange-50/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-[#192131]">
                        {booking.pickup_city} → {booking.drop_city}
                      </p>
                      <p className="truncate text-[10px] capitalize text-slate-400">
                        {booking.status} · {booking.cab_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-black text-[#192131]">
                      ₹{Math.round(booking.subtotal_net).toLocaleString("en-IN")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {/* Bottom: quotes + performance + announcements */}
      <div className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Booking Requests</h2>
            <Link href="/cabs/partner/quotes" className="text-xs font-bold text-[#ef6614]">
              View all
            </Link>
          </div>
          {requests.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
              <p className="text-sm font-bold text-slate-600">No open requests</p>
              <p className="mt-1 text-xs text-slate-500">New trip requests will appear here automatically.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {requests.slice(0, 4).map((request) => (
                <li
                  key={request.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">
                        {request.pickup_city} → {request.drop_city}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatTripDate(request.pickup_at)}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold capitalize text-slate-600">
                        {vehicleLabel(request.preferred_vehicle_categories)} · {request.passengers} pax
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      {formatRelative(request.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/cabs/partner/quotes?request=${request.id}`}
                    className="mt-3 inline-flex rounded-md bg-[#ef6614] px-3 py-1.5 text-[11px] font-extrabold text-white"
                  >
                    Respond
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/cabs/partner/quotes"
            className="mt-4 inline-flex text-xs font-extrabold text-[#ef6614]"
          >
            View all quote requests →
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Performance Overview</h2>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
              This Week
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              {
                label: "Acceptance Rate",
                value: "—",
                delta: "After you send quotes",
                up: true,
              },
              {
                label: "Response Time (Avg.)",
                value: "—",
                delta: "Tracked once quotes flow",
                up: false,
              },
              {
                label: "Completion Rate",
                value:
                  bookings.length > 0
                    ? `${Math.round((completedCount / bookings.length) * 100)}%`
                    : "—",
                delta: completedCount ? `${completedCount} completed` : "Needs completed trips",
                up: true,
              },
              {
                label: "Customer Rating",
                value: earnings?.avg_rating != null ? `${earnings.avg_rating.toFixed(1)}★` : "—",
                delta: earnings?.review_count
                  ? `${earnings.review_count} reviews`
                  : "No reviews yet",
                up: true,
              },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-bold text-slate-600">{row.label}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    {row.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {row.delta}
                  </p>
                </div>
                <span className="text-sm font-black text-[#192131]">{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold text-slate-400">
            Performance metrics unlock as you quote and complete trips.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black">Announcements</h2>
          </div>
          <ul className="mt-4 space-y-3">
            <li className="rounded-lg border border-orange-100 bg-orange-50/60 p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#ef6614]">Tip</p>
              <p className="mt-1 text-sm font-extrabold text-[#192131]">Peak Season Alert</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Respond to quote requests quickly — travellers often pick the first clear, competitive fare.
              </p>
            </li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Growth</p>
              <p className="mt-1 text-sm font-extrabold text-[#192131]">Keep your profile sharp</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Accurate city coverage and contact details help travellers trust your quotes.
              </p>
              <Link href="/cabs/list-your-cab" className="mt-2 inline-flex text-xs font-extrabold text-[#ef6614]">
                Update profile →
              </Link>
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
