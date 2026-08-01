"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { listPartnerBookings, type PartnerCabBooking } from "@/lib/cab-partner-api";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

function statusTone(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";
    case "completed":
      return "bg-sky-50 text-sky-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
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

export default function PartnerBookingsPage() {
  const auth = useAuthOptional();
  const [bookings, setBookings] = useState<PartnerCabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    listPartnerBookings(token)
      .then((items) => {
        if (!cancelled) setBookings(items);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load bookings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  const visible = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">Bookings</h2>
          <p className="mt-1 text-sm text-slate-500">Confirmed trips assigned to your fleet.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
              filter === item.id
                ? "bg-[#ef6614] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.label}
            {item.id !== "all" && (
              <span className="ml-1 opacity-70">
                {bookings.filter((b) => b.status === item.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid min-h-40 place-items-center">
          <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : visible.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <CalendarDays className="mx-auto h-9 w-9 text-[#ef6614]" />
          <h3 className="mt-3 text-base font-black">No bookings yet</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
            Paid trips for your cabs will show up here with route, guest, and payout details.
          </p>
          <Link href="/cabs/partner/quotes" className="mt-5 inline-flex text-xs font-extrabold text-[#ef6614]">
            Check quote requests →
          </Link>
        </section>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {visible.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/cabs/partner/bookings/${booking.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-orange-50/50 sm:px-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-sm font-extrabold text-[#192131]">
                        {booking.pickup_city} → {booking.drop_city}
                      </h3>
                      <span className={`rounded px-1.5 py-px text-[9px] font-bold capitalize ${statusTone(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {formatDate(booking.travel_date)} · {booking.cab_name} ·{" "}
                      {booking.guest_first_name} {booking.guest_last_name} · {booking.confirmation_number}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-[#192131]">
                      {formatMoney(booking.subtotal_net, booking.currency)}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">Your net</p>
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
