"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FilePenLine,
  HelpCircle,
  IndianRupee,
  Luggage,
  MapPin,
  MessageCircle,
  Phone,
  Route,
  ShieldCheck,
  Timer,
  UserRound,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { BookingAuthModal } from "@/components/hotels/booking-auth-modal";
import { TravelMobileTopShell } from "@/components/home/HeroSection";
import { trackEvent } from "@/lib/marketing-tracking";
import {
  acceptCabQuote,
  cancelCabTripRequest,
  getCabTripRequest,
  updateCabTripRequest,
  type CabQuote,
  type CabTripRequest,
} from "@/lib/cab-quote-api";
import { CabPromoCodeField } from "@/components/cabs/CabPromoCodeField";
import { useCabPromoPricing } from "@/components/cabs/CabPromoPrice";

const VEHICLE_CATEGORY_OPTIONS = [
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "innova", label: "Innova" },
  { value: "tempo_traveller", label: "Tempo traveller" },
  { value: "mini_bus", label: "Mini bus" },
  { value: "bus", label: "Bus" },
  { value: "luxury", label: "Luxury" },
] as const;

function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string) {
  return new Date(value).toISOString();
}

const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const dateOnly = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

const timeOnly = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

const money = (value: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

const TRIP_TYPE_LABEL: Record<CabTripRequest["trip_type"], string> = {
  one_way: "One-way / Outstation",
  round_trip: "Round trip",
  hourly_rental: "Hourly rental",
  airport_transfer: "Airport transfer",
};

const STATUS_LABEL: Record<CabTripRequest["status"], string> = {
  open: "Waiting for quotes",
  quoted: "Quotes received",
  accepted: "Quote selected",
  expired: "Request expired",
  cancelled: "Cancelled",
};

function formatLabel(key: string) {
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBreakdownValue(value: unknown, currency: string) {
  if (typeof value === "number") return money(value, currency);
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}

function relativeMinutes(from: string, to = new Date()) {
  const ms = to.getTime() - new Date(from).getTime();
  const mins = Math.max(0, Math.round(ms / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function deadlineCopy(deadlineAt: string, now: Date) {
  const remaining = new Date(deadlineAt).getTime() - now.getTime();
  if (remaining <= 0) return "Quote window closed";
  const mins = Math.round(remaining / 60_000);
  if (mins < 60) return `${mins} min left to receive quotes`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return `${hours}h ${remMins}m left to receive quotes`;
  return `Open until ${dateTime(deadlineAt)}`;
}

function QuoteFareBreakdown({ quote }: { quote: CabQuote }) {
  // These are implementation values sent by the quote engine, not useful fare
  // information for a traveller (and an id can make a mobile card enormous).
  const internalKeys = new Set(["source", "cab_type_id", "suggested_from", "owner_id", "quote_id"]);
  const entries = Object.entries(quote.fare_breakdown ?? {}).filter(
    ([key, value]) => value != null && value !== "" && !internalKeys.has(key.toLowerCase()),
  );
  if (!entries.length) return null;
  return (
    <div className="rounded-xl border border-[#f0eeec] bg-[#fcfbfa] px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Fare breakdown</p>
      <dl className="mt-2 space-y-1.5 text-xs">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-3">
            <dt className="text-[#706771]">{formatLabel(key)}</dt>
            <dd className="shrink-0 font-semibold text-[#292229]">{formatBreakdownValue(value, quote.currency)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function WaitingState({ request, now }: { request: CabTripRequest; now: Date }) {
  const routeLabel =
    request.trip_type === "hourly_rental"
      ? request.pickup_city
      : `${request.pickup_city} → ${request.drop_city}`;

  const steps = [
    { title: "Request shared", text: "Your trip details were sent to approved cab partners in this corridor.", done: true },
    { title: "Partners reviewing", text: "They check availability, vehicle type, route and pickup time before quoting.", done: false, active: true },
    { title: "We notify you", text: "As soon as a quote lands, you’ll get an alert — then compare and book here.", done: false },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-[0_18px_40px_-28px_rgba(239,102,20,0.35)]">
        <div className="relative bg-[linear-gradient(145deg,#fff4eb_0%,#ffffff_42%,#f6fbf9_100%)] px-4 pb-5 pt-5 text-center sm:px-8 sm:pb-7 sm:pt-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-200/30 blur-2xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-emerald-200/25 blur-2xl" />

          <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#ef6614] shadow-[0_10px_24px_-12px_rgba(239,102,20,0.8)] ring-4 ring-orange-50 sm:h-14 sm:w-14">
            <BellRing className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <p className="relative mt-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#ef6614] sm:mt-4">
            You’re all set
          </p>
          <h2 className="relative mt-1.5 text-xl font-black tracking-tight text-[#292229] sm:text-2xl">
            Sit back and relax
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-[13px] leading-5 text-[#746a73] sm:text-sm sm:leading-6">
            We&apos;ll notify you as soon as the first quote arrives — no need to keep watching this page.
          </p>

          {/* Partner broadcast card */}
          <div className="relative mx-auto mt-5 max-w-md overflow-hidden rounded-[22px] border border-orange-100 bg-white text-left shadow-[0_16px_36px_-22px_rgba(64,34,19,0.4)]">
            <div className="relative overflow-hidden bg-[linear-gradient(120deg,#2b2521_0%,#403842_55%,#5a4030_100%)] px-4 pb-8 pt-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(239,102,20,0.35),transparent_42%)]" />
              <div className="relative flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-200 ring-1 ring-white/15">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live broadcast
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-300/20">
                  <CheckCircle2 className="h-3 w-3" /> Sent
                </span>
              </div>
              <p className="relative mt-3 text-[15px] font-black leading-snug tracking-tight text-white sm:text-base">
                Sent to <span className="text-[#ffb070]">100+ cab partners</span>
                <span className="block text-[13px] font-semibold text-white/70">who operate on this route</span>
              </p>
              <div className="relative mt-3 flex items-end justify-between gap-2">
                <p className="inline-flex max-w-[70%] min-w-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-orange-50 ring-1 ring-white/10">
                  <MapPin className="h-3 w-3 shrink-0 text-[#ffb070]" />
                  <span className="truncate">{routeLabel}</span>
                </p>
                <div className="flex -space-x-3">
                  {[
                    "/images/cabs/fleet-catalog/sedan.png",
                    "/images/cabs/fleet-catalog/suv.png",
                    "/images/cabs/fleet-catalog/innova.png",
                    "/images/cabs/fleet-catalog/hatchback.png",
                  ].map((src, index) => (
                    <span
                      key={src}
                      className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-[#403842] bg-white shadow-md"
                      style={{ zIndex: 4 - index }}
                    >
                      <Image src={src} alt="" width={40} height={28} className="h-6 w-auto object-contain" unoptimized />
                    </span>
                  ))}
                  <span className="relative z-0 grid h-10 w-10 place-items-center rounded-full border-2 border-[#403842] bg-[#ef6614] text-[10px] font-black text-white shadow-md">
                    +100
                  </span>
                </div>
              </div>
            </div>

            <div className="relative -mt-4 rounded-t-[18px] bg-white px-4 pb-3.5 pt-3.5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#ef6614]">
                  <UserRoundCheck className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-5 text-[#292229]">
                    Partners are reviewing your trip details right now.
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-[#746a73]">
                    Expect the first quotes in about <strong className="text-[#514953]">1–30 minutes</strong>. We&apos;ll notify you the moment one arrives.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#fff8f2] px-3 py-2.5">
                <p className="text-[11px] font-medium text-[#8b828a]">
                  Request <strong className="text-[#514953]">{request.request_number}</strong>
                </p>
                <p className="text-[12px] font-black tracking-tight text-[#ef6614]">
                  Happy booking!
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-4 max-w-md rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-left sm:px-4">
            <p className="flex items-start gap-2.5 text-[12px] font-semibold leading-5 text-emerald-900 sm:text-sm">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
                <BellRing className="h-3.5 w-3.5" />
              </span>
              <span>
                Notification on when a quote lands
                <small className="mt-0.5 block font-medium text-emerald-800/80">
                  WhatsApp / SMS / in-app — then open My quotes to compare and book.
                </small>
              </span>
            </p>
          </div>

          <div className="relative mx-auto mt-3.5 flex max-w-lg flex-wrap items-center justify-center gap-2 text-[11px] font-semibold sm:mt-4 sm:text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[#514953] shadow-sm ring-1 ring-orange-100">
              <Timer className="h-3.5 w-3.5 text-[#ef6614]" />
              Usually 1–30 min for first quote
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[#514953] shadow-sm ring-1 ring-orange-100">
              <Clock3 className="h-3.5 w-3.5 text-[#ef6614]" />
              {deadlineCopy(request.quote_deadline_at, now)}
            </span>
          </div>

          <div className="relative mx-auto mt-4 grid max-w-md gap-2 sm:grid-cols-2">
            <Link
              href="/account?tab=quotes"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#ef6614] px-4 text-sm font-extrabold text-white shadow-[0_12px_22px_-14px_rgba(239,102,20,0.85)]"
            >
              Done for now · My quotes
            </Link>
            <Link
              href="/cabs"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#e8e0db] bg-white px-4 text-sm font-extrabold text-[#514953]"
            >
              Browse while you wait
            </Link>
          </div>
          <p className="relative mt-3 text-[11px] font-medium text-[#8b828a]">
            Quotes also appear here automatically if you stay on this page.
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:hidden">
        {[
          { icon: UserRoundCheck, title: "100+ partners notified", text: "Cab partners on this route have your request." },
          { icon: BellRing, title: "We’ll ping you", text: "Alert when the first partner quote is ready." },
          { icon: Timer, title: "Typical wait", text: "First responses often land in 1–30 minutes." },
          { icon: ShieldCheck, title: "Nothing booked yet", text: "You only pay after you choose a quote." },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title} className="flex gap-3 rounded-2xl border border-[#eee9e5] bg-white px-3.5 py-3 text-left">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#ef6614]">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-[13px] font-extrabold text-[#292229]">{title}</h3>
              <p className="mt-0.5 text-[11px] leading-4 text-[#746a73]">{text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className={`rounded-2xl border p-4 ${step.active ? "border-orange-200 bg-orange-50/40" : "border-[#eee9e5] bg-white"}`}
          >
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${step.done ? "bg-emerald-500 text-white" : step.active ? "bg-[#ef6614] text-white" : "bg-slate-100 text-slate-500"}`}>
              {step.done ? "✓" : index + 1}
            </span>
            <h3 className="mt-3 text-sm font-extrabold text-[#292229]">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 text-[#746a73]">{step.text}</p>
          </article>
        ))}
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2">
        <section className="rounded-2xl border border-[#eee9e5] bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold">
            <BadgeCheck className="h-4 w-4 text-[#ef6614]" />
            What each quote will usually include
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-[#5f565e]">
            {[
              "Total all-in fare for your route and pickup time",
              "What’s included — fuel, driver allowance, tolls, taxes",
              "What’s not included — extras you may pay separately",
              "Partner note with vehicle or timing details",
              "Quote validity window so you know when to decide",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#eee9e5] bg-white p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold">
            <HelpCircle className="h-4 w-4 text-[#ef6614]" />
            While you wait
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-[#5f565e]">
            {[
              "Sit back — we’ll notify you when the first quote arrives.",
              "Typical first responses land within 1–30 minutes on popular routes.",
              "Nothing is booked until you select a quote and confirm payment.",
              "Resume anytime from My quotes if you leave this page.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef6614]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function QuoteCard({
  quote,
  request,
  accepting,
  isBestPrice,
  isHighlighted,
  onSelect,
  onHighlight,
}: {
  quote: CabQuote;
  request: CabTripRequest;
  accepting: string | null;
  isBestPrice: boolean;
  isHighlighted?: boolean;
  onSelect: (id: string) => void;
  onHighlight?: (id: string) => void;
}) {
  const promoPricing = useCabPromoPricing(quote.total_amount);
  const partnerLabel = quote.business_name || quote.partner_name;
  const respondedAt = quote.sent_at || quote.created_at;

  return (
    <article
      onClick={() => onHighlight?.(quote.id)}
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        quote.status === "accepted"
          ? "border-emerald-300 bg-emerald-50/20"
          : isHighlighted
            ? "border-[#ef6614] ring-2 ring-orange-100"
          : isBestPrice
            ? "border-orange-200 ring-1 ring-orange-100"
            : "border-[#ece8e5]"
      }`}
    >
      <div className="grid gap-4 border-b border-[#f0eeec] p-4 sm:grid-cols-[1fr_auto] sm:items-start sm:p-5">
        <div className="flex gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#292229] text-sm font-black text-[#ffaf00]">
            {partnerLabel.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-[#292229]">{partnerLabel}</h3>
              {isBestPrice && quote.status !== "accepted" && (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Best price</span>
              )}
              {quote.status === "accepted" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  <CheckCircle2 className="h-3 w-3" /> Selected
                </span>
              )}
            </div>
            {quote.business_name && quote.partner_name !== quote.business_name && (
              <p className="mt-0.5 text-xs text-[#746a73]">Contact: {quote.partner_name}</p>
            )}
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#706771]">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified partner
              </span>
              <span>Quote {quote.quote_number}</span>
              <span>Responded {relativeMinutes(respondedAt)}</span>
            </p>
            {quote.partner_message && (
              <p className="mt-3 rounded-xl bg-[#fff8f2] px-3 py-2 text-xs leading-5 text-[#5f565e]">
                <MessageCircle className="mr-1 inline h-3.5 w-3.5 text-[#ef6614]" />
                “{quote.partner_message}”
              </p>
            )}
          </div>
        </div>

        <div className="sm:text-right">
          {promoPricing.isApplied ? (
            <div className="sm:flex sm:flex-col sm:items-end">
              <p className="text-sm font-semibold text-[#8b828a] line-through">
                {money(quote.total_amount, quote.currency)}
              </p>
              <p className="flex items-center gap-1 text-3xl font-black tracking-tight text-[#292229] sm:justify-end">
                <IndianRupee className="h-6 w-6" />
                {money(promoPricing.finalAmount, quote.currency).replace(/^₹\s?/, "")}
              </p>
              <p className="mt-1 text-[11px] font-bold text-emerald-700">UNOCABS10 · 10% off</p>
            </div>
          ) : (
            <p className="flex items-center gap-1 text-3xl font-black tracking-tight text-[#292229] sm:justify-end">
              <IndianRupee className="h-6 w-6" />
              {money(quote.total_amount, quote.currency).replace(/^₹\s?/, "")}
            </p>
          )}
          <p className="mt-1 text-xs text-[#746a73]">Total fare · all taxes as quoted</p>
          <p className="mt-2 text-[11px] font-semibold text-[#706771]">Valid until {dateTime(quote.valid_until)}</p>
          <div className="mt-3 sm:flex sm:justify-end">
            {quote.status === "accepted" ? (
              <Link
                href={`/cabs/quotes/book?request=${request.id}&quote=${quote.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
              >
                Continue to booking →
              </Link>
            ) : (
              <button
                type="button"
                disabled={Boolean(accepting) || request.status === "accepted"}
                onClick={() => onSelect(quote.id)}
                className="w-full rounded-xl bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_10px_18px_-12px_rgba(239,102,20,0.8)] transition hover:bg-[#d95511] disabled:opacity-60 sm:w-auto"
              >
                {accepting === quote.id ? "Selecting…" : "Select this quote"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#f0eeec] p-3 sm:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-[#5f565e]">
            <span className="min-w-0 truncate">
              {quote.inclusions.length ? `Includes: ${quote.inclusions.slice(0, 2).join(" · ")}${quote.inclusions.length > 2 ? ` +${quote.inclusions.length - 2}` : ""}` : "View fare details"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#ef6614] transition group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3 border-t border-[#f0eeec] pt-3">
            <QuoteFareBreakdown quote={quote} />
            {quote.inclusions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {quote.inclusions.map((item) => <span key={item} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{item}</span>)}
              </div>
            )}
            {quote.exclusions.length > 0 && (
              <p className="text-[11px] text-[#746a73]">Not included: {quote.exclusions.join(" · ")}</p>
            )}
          </div>
        </details>
      </div>

      <div className="hidden gap-3 p-4 sm:grid sm:grid-cols-2 sm:p-5 lg:grid-cols-[1.1fr_1fr_1fr]">
        <QuoteFareBreakdown quote={quote} />

        <div className="rounded-xl border border-[#f0eeec] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Included</p>
          {quote.inclusions.length ? (
            <ul className="mt-2 space-y-1.5 text-xs text-[#5f565e]">
              {quote.inclusions.map((item) => (
                <li key={item} className="flex gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[#8b828a]">Partner will confirm inclusions after selection.</p>
          )}
        </div>

        <div className="rounded-xl border border-[#f0eeec] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Not included</p>
          {quote.exclusions.length ? (
            <ul className="mt-2 space-y-1.5 text-xs text-[#5f565e]">
              {quote.exclusions.map((item) => (
                <li key={item} className="flex gap-1.5">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[#8b828a]">No exclusions listed — confirm with partner if unsure.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CabQuotesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuthOptional();
  const requestId = params.get("request");
  const [request, setRequest] = useState<CabTripRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accepting, setAccepting] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [editing, setEditing] = useState(false);
  // On a phone the trip context is important while quotes are still arriving,
  // so show it immediately instead of making the traveller discover it.
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [editPassengers, setEditPassengers] = useState(1);
  const [editPickupAt, setEditPickupAt] = useState("");
  const [editReturnAt, setEditReturnAt] = useState("");
  const [editRequirements, setEditRequirements] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedForSticky, setSelectedForSticky] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = auth?.getAccessToken();
    if (!token || !requestId) {
      setLoading(false);
      return;
    }
    try {
      setRequest(await getCabTripRequest(token, requestId));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load this trip request.");
    } finally {
      setLoading(false);
    }
  }, [auth, requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!request || editing) return;
    setEditPassengers(request.passengers);
    setEditPickupAt(toLocalInputValue(request.pickup_at));
    setEditReturnAt(request.return_at ? toLocalInputValue(request.return_at) : "");
    setEditRequirements(request.additional_requirements || "");
    setEditCategories(request.preferred_vehicle_categories || []);
  }, [request, editing]);

  const canManage = request?.status === "open" || request?.status === "quoted";

  useEffect(() => {
    if (!request || request.status === "accepted" || editing) return;
    const interval = window.setInterval(() => void load(), 12_000);
    return () => window.clearInterval(interval);
  }, [load, request, editing]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

  const startEdit = () => {
    if (!request) return;
    setEditPassengers(request.passengers);
    setEditPickupAt(toLocalInputValue(request.pickup_at));
    setEditReturnAt(request.return_at ? toLocalInputValue(request.return_at) : "");
    setEditRequirements(request.additional_requirements || "");
    setEditCategories(request.preferred_vehicle_categories || []);
    setEditing(true);
    setMessage("");
  };

  const saveEdit = async () => {
    const token = auth?.getAccessToken();
    if (!token || !request) return;
    setSaving(true);
    try {
      const next = await updateCabTripRequest(token, request.id, {
        passengers: editPassengers,
        pickup_at: fromLocalInputValue(editPickupAt),
        return_at: request.trip_type === "round_trip"
          ? (editReturnAt ? fromLocalInputValue(editReturnAt) : null)
          : request.return_at,
        preferred_vehicle_categories: editCategories,
        additional_requirements: editRequirements.trim() || null,
      });
      setRequest(next);
      setEditing(false);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update this trip request.");
    } finally {
      setSaving(false);
    }
  };

  const cancelRequest = async () => {
    const token = auth?.getAccessToken();
    if (!token || !request) return;
    const ok = window.confirm("Cancel this trip request? Partners will no longer be able to send quotes.");
    if (!ok) return;
    setCancelling(true);
    try {
      const next = await cancelCabTripRequest(token, request.id);
      setRequest(next);
      setEditing(false);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not cancel this trip request.");
    } finally {
      setCancelling(false);
    }
  };

  const selectQuote = async (quoteId: string) => {
    const token = auth?.getAccessToken();
    if (!token || !request) return;
    setAccepting(quoteId);
    try {
      const next = await acceptCabQuote(token, request.id, quoteId);
      setRequest(next);
      const selected = next.quotes.find((quote) => quote.id === quoteId);
      trackEvent("cab_quote_selected", {
        request_id: request.id,
        quote_id: quoteId,
        value: selected?.total_amount || 0,
        currency: selected?.currency || "INR",
        vehicle_category: selected?.cab_category || "unknown",
      });
      router.push(`/cabs/quotes/book?request=${request.id}&quote=${quoteId}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not select this quote.");
    } finally {
      setAccepting(null);
    }
  };

  const quotes = useMemo(
    () => (request?.quotes.filter((quote) => quote.status !== "declined") ?? []).slice().sort((a, b) => a.total_amount - b.total_amount),
    [request],
  );

  const bestPriceId = quotes.length ? quotes[0].id : null;

  if (!requestId) return <MissingRequest />;
  if (!auth?.isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#fffaf7]">
        <TravelMobileTopShell activeId="cabs" showGreeting={false} compact />
        <div className="grid place-items-center p-5 pt-10">
          <section className="max-w-md rounded-3xl border border-orange-100 bg-white p-7 text-center shadow-xl shadow-orange-100/30">
            <h1 className="text-2xl font-black">Sign in to view your quotes</h1>
            <p className="mt-2 text-sm text-slate-600">Quotes are only visible to the traveller who posted this request. Your link is saved.</p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="mt-5 inline-flex rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-bold text-white"
            >
              Sign in
            </button>
            <Link href="/cabs" className="mt-3 block text-sm font-semibold text-[#746a73]">
              Back to trip form
            </Link>
          </section>
        </div>
        <BookingAuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            void load();
          }}
          title="Sign in to view quotes"
          subtitle="Continue where you left off — your trip request is waiting."
          footerNote="Sign in or sign up to compare partner quotes."
        />
      </main>
    );
  }
  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbfaf9]">
        <Clock3 className="h-8 w-8 animate-spin text-[#ef6614]" />
      </main>
    );
  }
  if (!request) return <MissingRequest message={message} />;

  const routeLabel =
    request.trip_type === "hourly_rental"
      ? request.pickup_city
      : `${request.pickup_city} → ${request.drop_city}`;

  return (
    <main className="min-h-screen bg-[#fbfaf9] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-[#292229] md:pb-0">
      <TravelMobileTopShell activeId="cabs" showGreeting={false} compact />
      <header className="hidden border-b border-[#eee9e5] bg-white md:block">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-2 px-4 sm:h-16 sm:px-7">
          <Link href="/" className="relative block h-8 w-[100px] sm:h-9 sm:w-[118px]">
            <Image src="/images/homelogo-transparent.png" alt="UNO Trips" fill sizes="118px" className="object-contain object-left" priority />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/account?tab=quotes"
              className="inline-flex items-center gap-2 rounded-lg border border-[#eee9e5] px-2.5 py-1.5 text-[12px] font-bold text-[#514953] hover:border-orange-200 hover:text-[#ef6614] sm:px-3 sm:py-2 sm:text-sm"
            >
              My quotes
            </Link>
            <Link
              href="/cabs"
              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-2.5 py-1.5 text-[12px] font-bold text-[#ef6614] sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <FilePenLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:hidden">New trip</span>
              <span className="hidden sm:inline">Post another trip</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-7 sm:py-7">
        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ef6614] lg:hidden">
          Step 2 of 4 · Quotes
        </p>
        <section className="hidden overflow-hidden rounded-2xl border border-[#eee9e5] bg-white shadow-sm lg:block">
          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.55fr_.85fr] lg:items-center lg:px-7">
            <ol className="grid grid-cols-4 gap-1 text-center text-[9px] sm:text-xs">
              {["Request", "Quotes", "Book", "Done"].map((label, index) => {
                const done =
                  index === 0 ||
                  (index === 1 && quotes.length > 0) ||
                  (index >= 2 && request.status === "accepted");
                const active =
                  (index === 1 && request.status !== "accepted") ||
                  (index === 2 && request.status === "accepted");
                return (
                  <li key={label} className="relative">
                    {index > 0 && (
                      <span
                        aria-hidden
                        className={`absolute left-[-50%] right-1/2 top-[18px] h-0.5 ${
                          done || active ? "bg-[#ef6614]/45" : "bg-slate-200"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 mx-auto grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold ${
                        done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : active
                            ? "border-[#ef6614] bg-white text-[#ef6614]"
                            : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <strong className={`mt-2 block ${active ? "text-[#ef6614]" : ""}`}>{label}</strong>
                  </li>
                );
              })}
            </ol>
            <div className="relative min-h-24 overflow-hidden rounded-xl bg-[linear-gradient(115deg,#fff7ef,#fffdfa_58%,#f4f8f7)] p-4">
              <p className="relative z-10 flex items-center gap-2 text-sm font-extrabold">
                <BellRing className="h-4 w-4 text-[#ef6614]" />
                {request.status === "accepted"
                  ? "Your cab is selected!"
                  : quotes.length
                    ? `${quotes.length} quote${quotes.length === 1 ? "" : "s"} ready to compare`
                    : "Partners are reviewing — we’ll notify you"}
              </p>
              <p className="relative z-10 mt-1 max-w-[260px] text-xs leading-5 text-[#716771]">
                {request.status === "accepted"
                  ? "The selected partner will confirm vehicle and driver details after booking."
                  : quotes.length
                    ? "Compare fare, inclusions and partner notes — lowest fare is highlighted."
                    : deadlineCopy(request.quote_deadline_at, now)}
              </p>
              <Image
                src="/images/cabs/uno-cabs-dzire-hero.png"
                alt="UNO Cabs sedan"
                width={1693}
                height={929}
                className="absolute -bottom-5 -right-4 h-32 w-auto max-w-none mix-blend-multiply"
              />
            </div>
          </div>
        </section>

        {/* Mobile compact status — keep quotes above the fold */}
        <section className="rounded-2xl border border-[#eee9e5] bg-white p-3.5 shadow-sm lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-black tracking-tight">{routeLabel}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#746a73]">
                {dateOnly(request.pickup_at)} · {timeOnly(request.pickup_at)} · {request.passengers} pax
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#d95717]">
              {STATUS_LABEL[request.status]}
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#514953]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7ef] px-2.5 py-1 text-[#d95717]">
              <Timer className="h-3 w-3" />
              {deadlineCopy(request.quote_deadline_at, now)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <BellRing className="h-3 w-3 text-[#ef6614]" />
              {quotes.length
                ? `${quotes.length} quote${quotes.length === 1 ? "" : "s"}`
                : "We’ll notify you"}
            </span>
          </div>
        </section>

        {message && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mt-4">{message}</p>
        )}

        <section className="mt-3 grid gap-3 sm:mt-5 sm:gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="order-2 space-y-3 lg:order-1 lg:space-y-4">
            <section className="h-fit rounded-2xl border border-[#eee9e5] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-extrabold sm:text-base">Your trip summary</h2>
                  <p className="mt-0.5 text-[11px] text-[#746a73] sm:mt-1 sm:text-xs">{routeLabel}</p>
                </div>
                <span className="hidden rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#d95717] lg:inline-flex">
                  {STATUS_LABEL[request.status]}
                </span>
              </div>

              <div className={summaryOpen || editing ? "block" : "hidden lg:block"}>
              <div className="relative mt-4 space-y-5 border-l border-[#e6e4e2] pl-5 sm:mt-5">
                <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="absolute -left-[5px] top-[92px] h-2.5 w-2.5 rounded-full bg-red-500" />
                <div>
                  <span className="text-xs font-semibold text-[#8b828a]">PICKUP</span>
                  <strong className="mt-1 block text-sm leading-5">{request.pickup_address}</strong>
                  <p className="mt-1 text-xs text-[#726873]">
                    {[request.pickup_city, request.pickup_state].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-[#514953]">
                    {dateOnly(request.pickup_at)} · {timeOnly(request.pickup_at)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#8b828a]">
                    {request.trip_type === "hourly_rental" ? "AREA / PACKAGE" : "DROP"}
                  </span>
                  <strong className="mt-1 block text-sm leading-5">{request.drop_address}</strong>
                  <p className="mt-1 text-xs text-[#726873]">
                    {[request.drop_city, request.drop_state].filter(Boolean).join(", ")}
                  </p>
                  {request.return_at && (
                    <p className="mt-1.5 text-xs font-semibold text-[#514953]">
                      Return · {dateOnly(request.return_at)} · {timeOnly(request.return_at)}
                    </p>
                  )}
                </div>
              </div>

              <dl className="mt-5 space-y-3 border-t border-[#eee9e5] pt-4 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[#706771]">
                    <CarFront className="h-3.5 w-3.5" /> Trip type
                  </dt>
                  <dd className="text-right font-bold">{TRIP_TYPE_LABEL[request.trip_type]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[#706771]">
                    <UserRound className="h-3.5 w-3.5" /> Passengers
                  </dt>
                  <dd className="font-bold">
                    {request.passengers} {request.passengers === 1 ? "traveller" : "travellers"}
                  </dd>
                </div>
                {request.luggage_count != null && (
                  <div className="flex justify-between gap-3">
                    <dt className="flex items-center gap-2 text-[#706771]">
                      <Luggage className="h-3.5 w-3.5" /> Luggage
                    </dt>
                    <dd className="font-bold">{request.luggage_count} bags</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[#706771]">
                    <Route className="h-3.5 w-3.5" /> Route
                  </dt>
                  <dd className="text-right font-bold">{routeLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[#706771]">
                    <UserRoundCheck className="h-3.5 w-3.5" /> Request no.
                  </dt>
                  <dd className="font-bold">{request.request_number}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[#706771]">
                    <Timer className="h-3.5 w-3.5" /> Quote window
                  </dt>
                  <dd className="max-w-[150px] text-right font-bold leading-4">{deadlineCopy(request.quote_deadline_at, now)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#706771]">Posted</dt>
                  <dd className="text-right font-bold">{dateTime(request.created_at)}</dd>
                </div>
              </dl>

              {request.preferred_vehicle_categories.length > 0 && !editing && (
                <div className="mt-4 border-t border-[#eee9e5] pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Preferred vehicles</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {request.preferred_vehicle_categories.map((category) => (
                      <span key={category} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-[#514953]">
                        {formatLabel(category)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {request.additional_requirements && !editing && (
                <div className="mt-4 border-t border-[#eee9e5] pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Your preferences</p>
                  <p className="mt-2 text-xs leading-5 text-[#5f565e]">{request.additional_requirements}</p>
                </div>
              )}
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => setSummaryOpen((v) => !v)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-[#eee9e5] py-2 text-[12px] font-bold text-[#514953] lg:hidden"
                >
                  {summaryOpen ? "Hide trip details" : "View trip details"}
                  <ChevronDown className={`h-3.5 w-3.5 transition ${summaryOpen ? "rotate-180" : ""}`} />
                </button>
              )}

              {editing && canManage && (
                <div className="mt-4 space-y-3 border-t border-[#eee9e5] pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Edit request</p>
                  <p className="text-[11px] leading-4 text-amber-800">
                    Saving route/time/passenger changes withdraws existing quotes so partners can requote.
                  </p>
                  <label className="block text-xs font-bold text-[#403842]">
                    Passengers
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={editPassengers}
                      onChange={(e) => setEditPassengers(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                      className="mt-1 h-10 w-full rounded-lg border border-[#ddd5d1] px-3 text-sm font-semibold outline-none focus:border-[#ef6614]"
                    />
                  </label>
                  <label className="block text-xs font-bold text-[#403842]">
                    Pickup date &amp; time
                    <input
                      type="datetime-local"
                      value={editPickupAt}
                      onChange={(e) => setEditPickupAt(e.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border border-[#ddd5d1] px-3 text-sm font-semibold outline-none focus:border-[#ef6614]"
                    />
                  </label>
                  {request.trip_type === "round_trip" && (
                    <label className="block text-xs font-bold text-[#403842]">
                      Return date &amp; time
                      <input
                        type="datetime-local"
                        value={editReturnAt}
                        onChange={(e) => setEditReturnAt(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-[#ddd5d1] px-3 text-sm font-semibold outline-none focus:border-[#ef6614]"
                      />
                    </label>
                  )}
                  <fieldset>
                    <legend className="text-xs font-bold text-[#403842]">Preferred vehicles</legend>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {VEHICLE_CATEGORY_OPTIONS.map(({ value, label }) => {
                        const selected = editCategories.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setEditCategories((current) =>
                                selected ? current.filter((item) => item !== value) : [...current, value].slice(0, 8),
                              )
                            }
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                              selected
                                ? "border-[#ef6614] bg-orange-50 text-[#b84710]"
                                : "border-[#e4dbd5] bg-white text-[#514953]"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <label className="block text-xs font-bold text-[#403842]">
                    Special requirements
                    <textarea
                      value={editRequirements}
                      onChange={(e) => setEditRequirements(e.target.value)}
                      rows={2}
                      className="mt-1 w-full resize-y rounded-lg border border-[#ddd5d1] px-3 py-2 text-sm outline-none focus:border-[#ef6614]"
                      placeholder="Child seat, luggage, accessibility…"
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveEdit()}
                      className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-[#ef6614] text-xs font-bold text-white disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setEditing(false)}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#e4dbd5] px-3 text-xs font-bold text-[#514953]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {canManage && !editing && (
                <div className="mt-3 flex gap-2 border-t border-[#eee9e5] pt-3 sm:mt-4 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSummaryOpen(true);
                      startEdit();
                    }}
                    className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-[#fffaf7] text-xs font-bold text-[#d95717]"
                  >
                    <FilePenLine className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => void cancelRequest()}
                    className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" /> {cancelling ? "Cancelling…" : "Cancel"}
                  </button>
                </div>
              )}

              {request.status === "cancelled" && (
                <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-[#5f565e]">
                  This request was cancelled. Partners can no longer send quotes.
                </p>
              )}
            </section>

            <section className="hidden rounded-2xl border border-[#eee9e5] bg-white p-4 shadow-sm lg:block">
              <h2 className="flex items-center gap-2 text-sm font-extrabold">
                <HelpCircle className="h-4 w-4 text-[#ef6614]" /> Need help?
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#746a73]">Our travel team can help if partners are slow to respond.</p>
              <div className="mt-3 grid gap-2">
                <a
                  href="tel:+919999999999"
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#ef6614] text-xs font-bold text-white"
                >
                  <Phone className="h-3.5 w-3.5" /> Call support
                </a>
              </div>
            </section>

            <section className="hidden rounded-2xl border border-[#eee9e5] bg-white p-4 text-xs shadow-sm lg:block">
              <h2 className="font-extrabold">Why UNO Cabs</h2>
              <ul className="mt-3 space-y-3 text-[#665c65]">
                <li className="flex gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#ef6614]" /> Verified, approved cab partners only
                </li>
                <li className="flex gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[#ef6614]" /> Compare multiple quotes before you pay
                </li>
                <li className="flex gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#ef6614]" /> Support before and during your trip
                </li>
              </ul>
            </section>
          </aside>

          <section className="order-1 rounded-2xl border border-[#eee9e5] bg-white p-4 shadow-sm sm:p-5 lg:order-2 lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#eee9e5] pb-3 sm:gap-3 sm:pb-4">
              <div>
                <h1 className="text-base font-black sm:text-xl">
                  {quotes.length ? "Compare partner quotes" : "Quotes"}
                </h1>
                <p className="mt-0.5 text-[12px] text-[#746a73] sm:mt-1 sm:text-sm">
                  {quotes.length
                    ? "Pick the fare that fits — lowest is highlighted."
                    : "Sit back — we’ll notify you when quotes arrive."}
                </p>
              </div>
              {quotes.length > 0 && (
                <p className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-[#514953] sm:text-xs">
                  Sorted by lowest fare
                </p>
              )}
            </div>

            <CabPromoCodeField className="mt-4 rounded-xl border border-orange-100 bg-[#fffaf7] p-3" />

            {quotes.length === 0 ? (
              <div className="mt-4 sm:mt-5">
                <WaitingState request={request} now={now} />
              </div>
            ) : (
              <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                {quotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    request={request}
                    accepting={accepting}
                    isBestPrice={quote.id === bestPriceId}
                    isHighlighted={quote.id === (selectedForSticky || bestPriceId)}
                    onSelect={(id) => void selectQuote(id)}
                    onHighlight={setSelectedForSticky}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>

      {quotes.length > 0 && request.status !== "accepted" && (() => {
        const stickyId = selectedForSticky && quotes.some((q) => q.id === selectedForSticky)
          ? selectedForSticky
          : bestPriceId;
        const stickyQuote = quotes.find((q) => q.id === stickyId) || quotes[0];
        return (
          <StickyQuoteBar
            quote={stickyQuote}
            isBestPrice={stickyQuote.id === bestPriceId}
            accepting={accepting}
            onSelect={() => void selectQuote(stickyQuote.id)}
          />
        );
      })()}
    </main>
  );
}

function StickyQuoteBar({
  quote,
  isBestPrice,
  accepting,
  onSelect,
}: {
  quote: CabQuote;
  isBestPrice: boolean;
  accepting: string | null;
  onSelect: () => void;
}) {
  const pricing = useCabPromoPricing(quote.total_amount);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-semibold text-[#514953]">
          {quote.business_name || quote.partner_name}
          {isBestPrice ? " · Best price" : ""}
        </span>
        <strong className="shrink-0 text-base font-black">{money(pricing.finalAmount, quote.currency)}</strong>
      </div>
      <button
        type="button"
        disabled={Boolean(accepting)}
        onClick={onSelect}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#ef6614] text-sm font-extrabold text-white disabled:opacity-60"
      >
        {accepting === quote.id ? "Selecting…" : "Select this quote"}
      </button>
    </div>
  );
}

function MissingRequest({ message }: { message?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf7] p-5">
      <section className="max-w-md rounded-3xl border border-orange-100 bg-white p-7 text-center">
        <MapPin className="mx-auto h-10 w-10 text-[#ef6614]" />
        <h1 className="mt-4 text-2xl font-black">Trip request not found</h1>
        <p className="mt-2 text-sm text-slate-600">{message || "Post a cab request first to receive partner quotes."}</p>
        <Link href="/cabs" className="mt-5 inline-flex rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-bold text-white">
          Post a trip request
        </Link>
      </section>
    </main>
  );
}
