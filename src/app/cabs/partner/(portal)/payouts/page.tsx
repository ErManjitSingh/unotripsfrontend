"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getPartnerPayoutSummary,
  listPartnerPayouts,
  type PartnerPayout,
  type PartnerPayoutSummary,
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

function statusLabel(status: string) {
  if (status === "paid") return { text: "Paid", className: "text-emerald-600" };
  if (status === "failed") return { text: "Failed", className: "text-red-600" };
  return { text: "Pending", className: "text-amber-600" };
}

export default function PartnerPayoutsPage() {
  const auth = useAuthOptional();
  const [summary, setSummary] = useState<PartnerPayoutSummary | null>(null);
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getPartnerPayoutSummary(token), listPartnerPayouts(token)])
      .then(([summaryData, payoutRows]) => {
        if (cancelled) return;
        setSummary(summaryData);
        setPayouts(payoutRows);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load payouts.");
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black tracking-tight">Payouts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Settlement ledger for completed trips. Bank transfers run after ops marks payouts paid.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      {!summary?.has_bank_details && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Add your bank account in{" "}
          <Link href="/cabs/partner/settings" className="underline">
            Settings
          </Link>{" "}
          so completed trips can be settled.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Pending settlement</p>
          <p className="mt-1.5 text-2xl font-black text-[#192131]">
            {money(summary?.pending_settlement ?? 0, summary?.currency)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {summary?.pending_count ?? 0} completed trips
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Paid out</p>
          <p className="mt-1.5 text-2xl font-black text-[#192131]">
            {money(summary?.paid_out ?? 0, summary?.currency)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {summary?.paid_count ?? 0} settled payouts
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">In progress trips</p>
          <p className="mt-1.5 text-2xl font-black text-[#192131]">
            {money(summary?.confirmed_pending ?? 0, summary?.currency)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Earns after you mark trips completed
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-extrabold">Settlement queue</h3>
        </div>
        {!payouts.length ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No payout records yet. Mark confirmed trips completed to create settlement rows.{" "}
            <Link href="/cabs/partner/earnings" className="font-bold text-[#ef6614]">
              View earnings →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {payouts.map((payout) => {
              const status = statusLabel(payout.status);
              return (
                <li key={payout.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">
                      {payout.route_label || "Trip payout"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {payout.confirmation_number || payout.booking_id}
                      {payout.travel_date ? ` · Travel ${formatDate(payout.travel_date)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#192131]">
                      {money(payout.net_amount, payout.currency)}
                    </p>
                    <p className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide ${status.className}`}>
                      {status.text}
                      {payout.utr ? ` · ${payout.utr}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </div>
  );
}
