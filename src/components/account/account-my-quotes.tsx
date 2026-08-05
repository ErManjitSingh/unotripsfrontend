"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CarFront,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageCircle,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { listMyCabTripRequests, type CabTripRequest } from "@/lib/cab-quote-api";
import { cn } from "@/lib/utils";

type FilterKey = "active" | "accepted" | "past" | "all";
type MetaKind = "confirmed" | "selected" | "quoted" | "past" | "waiting";

const TRIP_TYPE_LABEL: Record<CabTripRequest["trip_type"], string> = {
  one_way: "Outstation",
  round_trip: "Round trip",
  hourly_rental: "Hourly",
  airport_transfer: "Airport",
};

const FLEET_AVATARS = [
  "/images/cabs/fleet-catalog/sedan.png",
  "/images/cabs/fleet-catalog/suv.png",
  "/images/cabs/fleet-catalog/innova.png",
  "/images/cabs/fleet-catalog/hatchback.png",
] as const;

function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPickup(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function liveQuoteCount(request: CabTripRequest) {
  const quotes = request.quotes || [];
  const live = quotes.filter((q) => q.status === "sent" || q.status === "viewed");
  return live.length || (request.status === "quoted" ? quotes.length : 0);
}

function isActive(request: CabTripRequest) {
  return request.status === "open" || request.status === "quoted" || request.status === "accepted";
}

function isPast(request: CabTripRequest) {
  return request.status === "expired" || request.status === "cancelled";
}

function requestHref(request: CabTripRequest) {
  if (request.booking_confirmation_number && ["confirmed", "completed"].includes(request.booking_status || "")) {
    return `/cabs/quotes/book/confirmation?conf=${encodeURIComponent(request.booking_confirmation_number)}&request=${request.id}`;
  }
  const quotes = request.quotes || [];
  const accepted = quotes.find((q) => q.status === "accepted");
  if (request.status === "accepted" && accepted) {
    return `/cabs/quotes/book?request=${request.id}&quote=${accepted.id}`;
  }
  return `/cabs/quotes?request=${request.id}`;
}

function requestMeta(request: CabTripRequest) {
  const quotes = request.quotes || [];
  const received = liveQuoteCount(request);
  const accepted = quotes.find((q) => q.status === "accepted");

  if (request.booking_confirmation_number && ["confirmed", "completed"].includes(request.booking_status || "")) {
    return {
      kind: "confirmed" as MetaKind,
      badge: request.booking_status === "completed" ? "Trip completed" : "Booking confirmed",
      tone: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      icon: CheckCircle2,
      summary:
        request.booking_status === "completed"
          ? `Confirmation ${request.booking_confirmation_number} · trip completed`
          : `Confirmation ${request.booking_confirmation_number} · you’re all set`,
      cta: request.booking_status === "completed" ? "View trip" : "View booking",
    };
  }
  if (request.status === "accepted" && accepted) {
    const paymentPending = request.booking_status === "pending" || request.booking_payment_status === "pending";
    return {
      kind: "selected" as MetaKind,
      badge: paymentPending ? "Payment pending" : "Quote selected",
      tone: paymentPending
        ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      icon: CheckCircle2,
      summary: `${accepted.business_name || accepted.partner_name} · ${money(accepted.total_amount, accepted.currency)}`,
      cta: paymentPending ? "Complete payment" : "Continue booking",
    };
  }
  if (received > 0 || request.status === "quoted") {
    const count = received || quotes.length;
    const lowest = [...quotes].sort((a, b) => a.total_amount - b.total_amount)[0];
    return {
      kind: "quoted" as MetaKind,
      badge: `${count} quote${count === 1 ? "" : "s"}`,
      tone: "bg-[#FFF3E0] text-[#E65100] ring-1 ring-orange-100",
      icon: MessageCircle,
      summary: lowest
        ? `${count} quote${count === 1 ? "" : "s"} received · from ${money(lowest.total_amount, lowest.currency)}`
        : `${count} quote${count === 1 ? "" : "s"} received · compare & book`,
      cta: "Compare quotes",
    };
  }
  if (isPast(request)) {
    return {
      kind: "past" as MetaKind,
      badge: request.status === "expired" ? "Expired" : "Cancelled",
      tone: "bg-[#f5f5f5] text-[#757575] ring-1 ring-[#eee]",
      icon: Clock3,
      summary: "This request is no longer active",
      cta: "View details",
    };
  }
  return {
    kind: "waiting" as MetaKind,
    badge: "Waiting",
    tone: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
    icon: BellRing,
    summary: "Sit back — sent to 100+ partners · first quotes in 1–30 min",
    cta: "Track request",
  };
}

function PartnerAvatars({ compact = false }: { compact?: boolean }) {
  const size = compact ? "h-7 w-7" : "h-8 w-8";
  return (
    <div className="flex -space-x-2">
      {FLEET_AVATARS.map((src, index) => (
        <span
          key={src}
          className={cn(
            "relative grid place-items-center overflow-hidden rounded-full border-2 border-white bg-[#fff8f2] shadow-sm",
            size,
          )}
          style={{ zIndex: FLEET_AVATARS.length - index }}
        >
          <Image src={src} alt="" width={32} height={22} className="h-4 w-auto object-contain" unoptimized />
        </span>
      ))}
      <span
        className={cn(
          "relative z-0 grid place-items-center rounded-full border-2 border-white bg-[#EF6614] text-[9px] font-black text-white shadow-sm",
          size,
        )}
      >
        +100
      </span>
    </div>
  );
}

export function AccountMyQuotes() {
  const { getAccessToken } = useAuth();
  const [requests, setRequests] = useState<CabTripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const items = await listMyCabTripRequests(token);
      setRequests(Array.isArray(items) ? items : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your quote requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const isUpcoming = (r: CabTripRequest) =>
    r.status === "accepted" || ["confirmed", "pending"].includes(r.booking_status || "");

  const counts = useMemo(
    () => ({
      all: requests.length,
      active: requests.filter(isActive).length,
      upcoming: requests.filter(isUpcoming).length,
      past: requests.filter(isPast).length,
    }),
    [requests],
  );

  const quotesReceived = useMemo(
    () => requests.reduce((sum, r) => sum + liveQuoteCount(r), 0),
    [requests],
  );

  const visible = useMemo(() => {
    const sorted = [...requests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (filter === "active") return sorted.filter(isActive);
    if (filter === "accepted") return sorted.filter(isUpcoming);
    if (filter === "past") return sorted.filter(isPast);
    return sorted;
  }, [requests, filter]);

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "active", label: "Active", count: counts.active },
    { key: "accepted", label: "Upcoming", count: counts.upcoming },
    { key: "past", label: "Past", count: counts.past },
    { key: "all", label: "All", count: counts.all },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#e8e8e8] bg-white py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[#EF6614]" aria-hidden />
        <p className="text-[13px] text-[#9E9E9E]">Loading your cab quotes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-white px-5 py-10 text-center">
        <p className="text-sm font-semibold text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex rounded-xl bg-[#EF6614] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65100]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e8e8] bg-white px-3.5 py-3 shadow-sm sm:px-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#212121]">My Quotes</h2>
            <span className="rounded-full bg-[#FFF3E0] px-2 py-0.5 text-[10px] font-bold text-[#E65100]">
              {quotesReceived} quote{quotesReceived === 1 ? "" : "s"} received
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#9E9E9E]">
            Cab trip requests and partner replies
          </p>
        </div>
        <Link
          href="/cabs"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-[#EF6614] px-3 text-[12px] font-bold text-white transition hover:bg-[#E65100]"
        >
          <CarFront className="h-3.5 w-3.5" aria-hidden />
          Post a trip
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
              filter === item.key
                ? "bg-[#EF6614] text-white"
                : "border border-[#e8e8e8] bg-white text-[#616161] hover:border-[#EF6614]/30 hover:text-[#EF6614]",
            )}
          >
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-bold",
                filter === item.key ? "bg-white/25" : "bg-[#f5f5f5] text-[#9E9E9E]",
              )}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white px-5 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3E0]">
            <CarFront className="h-6 w-6 text-[#EF6614]" aria-hidden />
          </div>
          <p className="font-bold text-[#212121]">
            {filter === "active"
              ? "No active quote requests"
              : filter === "accepted"
                ? "No upcoming trips yet"
                : filter === "past"
                  ? "No past requests"
                  : "No cab quotes yet"}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[12px] text-[#9E9E9E]">
            Post a trip and partner quotes will show up here.
          </p>
          <Link
            href="/cabs"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#EF6614] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65100]"
          >
            Post a trip request <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((request) => {
            const meta = requestMeta(request);
            const Icon = meta.icon;
            const received = liveQuoteCount(request);
            const routeLabel =
              request.trip_type === "hourly_rental"
                ? request.pickup_city
                : `${request.pickup_city} → ${request.drop_city}`;
            const isWaiting = meta.kind === "waiting";
            const isQuoted = meta.kind === "quoted";

            return (
              <Link
                key={request.id}
                href={requestHref(request)}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md",
                  isWaiting
                    ? "border-orange-100 hover:border-[#EF6614]/40"
                    : isQuoted
                      ? "border-orange-100/90 hover:border-[#EF6614]/40"
                      : "border-[#e8e8e8] hover:border-[#EF6614]/35",
                )}
              >
                {isWaiting && (
                  <div className="flex items-center justify-between gap-2 bg-[linear-gradient(120deg,#2b2521_0%,#403842_55%,#5a4030_100%)] px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-orange-200">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      Live with partners
                    </span>
                    <span className="truncate text-[10px] font-semibold text-white/55">
                      {request.request_number}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition",
                      isWaiting || isQuoted
                        ? "bg-[#FFF3E0] text-[#EF6614] group-hover:bg-[#EF6614] group-hover:text-white"
                        : "bg-[#f5f5f5] text-[#616161] group-hover:bg-[#EF6614] group-hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[15px] font-bold text-[#212121]">{routeLabel}</h3>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", meta.tone)}>
                        {meta.badge}
                      </span>
                      {isQuoted && (
                        <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#757575]">
                          {received} received
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-[13px] leading-5 text-[#616161]">{meta.summary}</p>

                    {isWaiting && (
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <PartnerAvatars compact />
                        <span className="text-[11px] font-bold text-[#EF6614]">Happy booking!</span>
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#9E9E9E]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#EF6614]" aria-hidden />
                        {formatPickup(request.pickup_at)}
                      </span>
                      {request.return_at && <span>Return {formatPickup(request.return_at)}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden />
                        {request.passengers} traveller{request.passengers === 1 ? "" : "s"}
                      </span>
                      <span>{TRIP_TYPE_LABEL[request.trip_type]}</span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center justify-center gap-1 self-stretch rounded-xl px-3 text-[12px] font-bold transition sm:self-center",
                      isWaiting || isQuoted
                        ? "bg-[#FFF3E0] text-[#EF6614] group-hover:bg-[#EF6614] group-hover:text-white"
                        : "text-[#EF6614]",
                    )}
                  >
                    {meta.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
