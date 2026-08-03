"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, Clock3, MessageCircle } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { listMyCabTripRequests, type CabTripRequest } from "@/lib/cab-quote-api";

const CACHE_KEY_PREFIX = "uno_cabs_my_trip_requests";

function cacheKey(userId: string) {
  return `${CACHE_KEY_PREFIX}:${userId}`;
}

function money(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function readCache(userId: string): CabTripRequest[] {
  try {
    const raw = sessionStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CabTripRequest[];
    return Array.isArray(parsed) ? parsed.filter((r) => r && typeof r.id === "string") : [];
  } catch {
    return [];
  }
}

function writeCache(userId: string, items: CabTripRequest[]) {
  try {
    sessionStorage.setItem(cacheKey(userId), JSON.stringify(items.slice(0, 5)));
  } catch {
    /* ignore */
  }
}

function statusMeta(request: CabTripRequest) {
  const quotes = Array.isArray(request.quotes) ? request.quotes : [];
  const liveQuotes = quotes.filter((q) => q.status === "sent" || q.status === "viewed");
  const accepted = quotes.find((q) => q.status === "accepted");

  if (request.booking_confirmation_number && ["confirmed", "completed"].includes(request.booking_status || "")) {
    return {
      label: request.booking_status === "completed" ? "Trip completed" : "Booking confirmed",
      tone: "bg-emerald-50 text-emerald-700",
      detail: `Confirmation ${request.booking_confirmation_number}`,
      href: `/cabs/quotes/book/confirmation?conf=${encodeURIComponent(request.booking_confirmation_number)}&request=${request.id}`,
      cta: "View booking",
    };
  }
  if (request.status === "accepted" && accepted) {
    const paymentPending = request.booking_status === "pending" || request.booking_payment_status === "pending";
    return {
      label: paymentPending ? "Payment pending" : "Quote selected",
      tone: paymentPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
      detail: `${accepted.business_name || accepted.partner_name} · ${money(accepted.total_amount)}`,
      href: `/cabs/quotes/book?request=${request.id}&quote=${accepted.id}`,
      cta: paymentPending ? "Complete payment" : "Continue booking",
    };
  }
  if (liveQuotes.length > 0 || request.status === "quoted") {
    const count = liveQuotes.length || quotes.length;
    return {
      label: `${count} quote${count === 1 ? "" : "s"}`,
      tone: "bg-orange-50 text-[#ef6614]",
      detail: "Partners have responded — compare and pick one",
      href: `/cabs/quotes?request=${request.id}`,
      cta: "Compare quotes",
    };
  }
  if (request.status === "expired" || request.status === "cancelled") {
    return {
      label: request.status,
      tone: "bg-slate-100 text-slate-600",
      detail: "This request is no longer active",
      href: `/cabs/quotes?request=${request.id}`,
      cta: "View",
    };
  }
  return {
    label: "Waiting for quotes",
    tone: "bg-amber-50 text-amber-700",
    detail: "Sent to partners · usually 10–30 min",
    href: `/cabs/quotes?request=${request.id}`,
    cta: "Track request",
  };
}

export function TravellerQuoteRequestsStrip() {
  const auth = useAuthOptional();
  const isLoading = auth?.isLoading ?? true;
  const isAuthenticated = !!auth?.isAuthenticated;
  const userId = auth?.user?.id ?? null;
  const [requests, setRequests] = useState<CabTripRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setRequests([]);
      setLoaded(true);
      return;
    }

    const token = auth?.getAccessToken();
    if (!token) {
      setRequests([]);
      setLoaded(true);
      return;
    }

    try {
      const items = await listMyCabTripRequests(token);
      const list = Array.isArray(items) ? items : [];
      // The API is authoritative. An empty response must clear any old card.
      writeCache(userId, list);
      setRequests(list);
    } catch {
      // Only use an account-scoped cache when the traveller's own request API is unavailable.
      setRequests(readCache(userId));
    } finally {
      setLoaded(true);
    }
  }, [auth, isAuthenticated, userId]);

  useEffect(() => {
    // Never let a previous account's visible request persist while auth changes.
    setRequests([]);
    setLoaded(false);
    try {
      // Remove data written by the old, unscoped implementation.
      sessionStorage.removeItem(CACHE_KEY_PREFIX);
    } catch {
      /* ignore */
    }
  }, [userId]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  useEffect(() => {
    const refresh = () => {
      if (!isLoading && isAuthenticated && userId) void load();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [isLoading, isAuthenticated, userId, load]);

  const latest = useMemo(() => {
    return (
      requests.find((r) => r && (r.status === "open" || r.status === "quoted" || r.status === "accepted")) ?? null
    );
  }, [requests]);

  if (!isAuthenticated) return null;
  if (!loaded && !latest) return null;
  if (!latest) return null;

  const meta = statusMeta(latest);

  return (
    <div className="border-b border-orange-100/80 bg-gradient-to-r from-[#fff4eb] via-white to-[#fff8f2]">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-[#ef6614]" />
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#ef6614]">Latest trip request</p>
          </div>
          <Link href="/account?tab=quotes" className="text-[11px] font-bold text-[#ef6614] transition hover:underline">
            View all quotes
          </Link>
        </div>
        <Link
          href={meta.href}
          className="flex items-center gap-3 rounded-xl border border-orange-100/90 bg-white/90 px-3 py-2.5 shadow-[0_8px_24px_-20px_rgba(64,34,19,0.35)] transition hover:border-[#ef6614]/40 hover:bg-white"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-[#ef6614]">
            {latest.status === "accepted" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (latest.quotes || []).length > 0 ? (
              <MessageCircle className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-1.5">
              <strong className="truncate text-sm font-extrabold text-[#292229]">
                {latest.pickup_city} → {latest.drop_city}
              </strong>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${meta.tone}`}>{meta.label}</span>
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-[#746a73]">
              {formatWhen(latest.pickup_at)} · {meta.detail}
            </span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-extrabold text-[#ef6614] sm:inline-flex">
            {meta.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
