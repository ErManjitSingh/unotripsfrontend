"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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

const TRIP_TYPE_LABEL: Record<CabTripRequest["trip_type"], string> = {
  one_way: "Outstation",
  round_trip: "Round trip",
  hourly_rental: "Hourly",
  airport_transfer: "Airport",
};

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
  const live = quotes.filter((q) => q.status === "sent" || q.status === "viewed");
  const accepted = quotes.find((q) => q.status === "accepted");

  if (request.booking_confirmation_number && ["confirmed", "completed"].includes(request.booking_status || "")) {
    return {
      badge: request.booking_status === "completed" ? "Trip completed" : "Booking confirmed",
      tone: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
      summary: `Confirmation ${request.booking_confirmation_number}${request.booking_status === "completed" ? " · trip completed" : " · payment captured"}` ,
      cta: request.booking_status === "completed" ? "View trip" : "View booking",
    };
  }
  if (request.status === "accepted" && accepted) {
    const paymentPending = request.booking_status === "pending" || request.booking_payment_status === "pending";
    return {
      badge: paymentPending ? "Payment pending" : "Quote selected",
      tone: paymentPending ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
      summary: `${accepted.business_name || accepted.partner_name} · ${money(accepted.total_amount, accepted.currency)}` ,
      cta: paymentPending ? "Complete payment" : "Continue booking",
    };
  }
  if (live.length > 0 || request.status === "quoted") {
    const count = live.length || quotes.length;
    const lowest = [...quotes].sort((a, b) => a.total_amount - b.total_amount)[0];
    return {
      badge: `${count} quote${count === 1 ? "" : "s"}`,
      tone: "bg-[#FFF3E0] text-[#E65100]",
      icon: MessageCircle,
      summary: lowest
        ? `From ${money(lowest.total_amount, lowest.currency)} · compare & pick`
        : "Partners have responded",
      cta: "Compare quotes",
    };
  }
  if (isPast(request)) {
    return {
      badge: request.status === "expired" ? "Expired" : "Cancelled",
      tone: "bg-[#f5f5f5] text-[#757575]",
      icon: Clock3,
      summary: "This request is no longer active",
      cta: "View details",
    };
  }
  return {
    badge: "Waiting",
    tone: "bg-amber-50 text-amber-800",
    icon: Clock3,
    summary: "Shared with partners · quotes usually arrive in 10–30 min",
    cta: "Track request",
  };
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
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-[#212121]">My Quotes</h2>
          <p className="mt-0.5 text-[12px] text-[#9E9E9E]">Cab trip requests and partner replies</p>
        </div>
        <Link
          href="/cabs"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EF6614] px-3.5 py-2 text-[12px] font-bold text-white transition hover:bg-[#E65100]"
        >
          <CarFront className="h-3.5 w-3.5" aria-hidden />
          Post a trip
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold transition",
              filter === item.key
                ? "bg-[#EF6614] text-white"
                : "border border-[#e8e8e8] bg-white text-[#616161] hover:border-[#EF6614]/30 hover:text-[#EF6614]",
            )}
          >
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px]",
                filter === item.key ? "bg-white/25" : "bg-[#f5f5f5] text-[#9E9E9E]",
              )}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF3E0]">
            <CarFront className="h-7 w-7 text-[#EF6614]" aria-hidden />
          </div>
          <p className="font-bold text-[#212121]">
            {filter === "active"
              ? "No active quote requests"
              : filter === "accepted"
                ? "No selected quotes yet"
                : filter === "past"
                  ? "No past requests"
                  : "No cab quotes yet"}
          </p>
          <p className="mt-1 text-[13px] text-[#9E9E9E]">
            Post a trip on UNO Cabs and partner quotes will show up here.
          </p>
          <Link
            href="/cabs"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#EF6614] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65100]"
          >
            Post a trip request <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((request) => {
            const meta = requestMeta(request);
            const Icon = meta.icon;
            const routeLabel =
              request.trip_type === "hourly_rental"
                ? request.pickup_city
                : `${request.pickup_city} → ${request.drop_city}`;

            return (
              <Link
                key={request.id}
                href={requestHref(request)}
                className="group flex flex-col gap-3 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm transition hover:border-[#EF6614]/35 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFF3E0] text-[#EF6614] transition group-hover:bg-[#EF6614] group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[15px] font-bold text-[#212121]">{routeLabel}</h3>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", meta.tone)}>
                      {meta.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-[#757575]">{meta.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#9E9E9E]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#EF6614]" aria-hidden />
                      {formatPickup(request.pickup_at)}
                    </span>
                    {request.return_at && (
                      <span>Return {formatPickup(request.return_at)}</span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden />
                      {request.passengers} traveller{request.passengers === 1 ? "" : "s"}
                    </span>
                    <span>{TRIP_TYPE_LABEL[request.trip_type]}</span>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 self-start text-[12px] font-bold text-[#EF6614] sm:self-center">
                  {meta.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
