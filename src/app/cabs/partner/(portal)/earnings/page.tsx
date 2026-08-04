"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingUp, Wallet } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getPartnerEarningsSummary,
  type PartnerEarningsSummary,
} from "@/lib/cab-partner-api";

function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function PartnerEarningsPage() {
  const auth = useAuthOptional();
  const [summary, setSummary] = useState<PartnerEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    getPartnerEarningsSummary(token)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load earnings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  if (loading) {
    return (
      <div className="grid min-h-40 place-items-center">
        <span className="h-7 w-7 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  const maxDay = Math.max(1, ...(summary?.daily.map((d) => d.amount) ?? [1]));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black tracking-tight">Earnings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Net amounts from completed trips. Bank settlements appear under Payouts once enabled.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total earned",
            value: money(summary?.total_earnings ?? 0, summary?.currency),
            hint: `${summary?.completed_trips ?? 0} completed trips`,
          },
          {
            label: "This week",
            value: money(summary?.this_week_earnings ?? 0, summary?.currency),
            hint: "Mon–today",
          },
          {
            label: "In progress",
            value: money(summary?.confirmed_pending ?? 0, summary?.currency),
            hint: `${summary?.confirmed_trips ?? 0} confirmed trips`,
          },
          {
            label: "Avg rating",
            value: summary?.avg_rating != null ? `${summary.avg_rating.toFixed(1)}★` : "—",
            hint: summary?.review_count ? `${summary.review_count} reviews` : "No reviews yet",
          },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1.5 text-2xl font-black tracking-tight text-[#192131]">{card.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-400">{card.hint}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black">Last 7 days</h3>
            <p className="mt-0.5 text-xs text-slate-500">Completed trip net by day</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            {money(summary?.this_week_earnings ?? 0, summary?.currency)}
          </span>
        </div>
        <div className="mt-6 flex h-40 items-end gap-2 rounded-lg bg-[#fafafa] px-3 pb-3 pt-6">
          {(summary?.daily ?? []).map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-[#ef6614]/80"
                style={{ height: Math.max(8, Math.round((day.amount / maxDay) * 120)) }}
                title={money(day.amount, summary?.currency)}
              />
              <span className="text-[10px] font-semibold text-slate-400">{day.label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-extrabold">Recent completed trips</h3>
          <Link href="/cabs/partner/payouts" className="inline-flex items-center gap-1 text-xs font-bold text-[#ef6614]">
            <Wallet className="h-3.5 w-3.5" /> Payouts
          </Link>
        </div>
        {!summary?.recent_trips.length ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            Mark confirmed bookings as completed to see earnings here.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {summary.recent_trips.map((trip) => (
              <li key={trip.booking_id}>
                <Link
                  href={`/cabs/partner/bookings/${trip.booking_id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#192131]">{trip.route_label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {trip.confirmation_number} · {formatDate(trip.travel_date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[#ef6614]">
                    {money(trip.amount, trip.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
