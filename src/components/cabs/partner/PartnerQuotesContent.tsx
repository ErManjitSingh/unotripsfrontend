"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CarFront, CheckCircle2, ChevronDown, Clock3, MapPin, Users } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  getPartnerVehiclePricing,
  listPartnerVehicles,
  type PartnerCab,
  type PartnerCabPricing,
} from "@/lib/cab-partner-api";
import {
  getPartnerQuotePayoutPreview,
  passPartnerQuoteRequest,
  sendPartnerQuote,
  type CabTripRequest,
} from "@/lib/cab-quote-api";
import { usePartnerPortal } from "@/components/cabs/partner/PartnerPortalProvider";

const DEFAULT_INCLUSIONS = ["Driver", "Fuel", "Toll (as applicable)", "24×7 support"];
const DEFAULT_EXCLUSIONS = ["Parking", "State tax", "Extra km / hours"];

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function deadlineLabel(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Deadline passed";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h left`;
  return `${Math.floor(hrs / 24)}d left`;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function suggestFare(tripType: string, pricing: PartnerCabPricing | null): number | null {
  if (!pricing) return null;
  if (tripType === "hourly_rental") return Math.round(pricing.fullday_local_selling);
  if (tripType === "round_trip") return Math.round(pricing.fullday_out_selling * 1.5);
  // one_way / airport_transfer — start from outstation day package
  return Math.round(pricing.fullday_out_selling || pricing.fullday_local_selling);
}

function tripTypeLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function PartnerQuotesContent() {
  const auth = useAuthOptional();
  const searchParams = useSearchParams();
  const {
    requests,
    selectedByTravellerRequests,
    recentlyClosedRequests,
    setRequests,
    quotesError,
    refreshQuotes,
  } = usePartnerPortal();
  const requestParam = searchParams.get("request");

  const [selected, setSelected] = useState<CabTripRequest | null>(null);
  const [vehicles, setVehicles] = useState<PartnerCab[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [cabId, setCabId] = useState("");
  const [pricing, setPricing] = useState<PartnerCabPricing | null>(null);
  const [amount, setAmount] = useState("");
  const [usedSuggestedRate, setUsedSuggestedRate] = useState(false);
  const [payout, setPayout] = useState<number | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [validUntil, setValidUntil] = useState("");
  const [message, setMessage] = useState("");
  const [inclusions, setInclusions] = useState<string[]>(DEFAULT_INCLUSIONS);
  const [exclusions, setExclusions] = useState<string[]>(DEFAULT_EXCLUSIONS);
  const [saving, setSaving] = useState(false);
  const [passing, setPassing] = useState(false);
  const [formError, setFormError] = useState("");
  const [formOk, setFormOk] = useState("");

  const activeFleet = useMemo(
    () => vehicles.filter((v) => v.is_active),
    [vehicles],
  );
  const selectedCab = useMemo(() => vehicles.find((v) => v.id === cabId) ?? null, [vehicles, cabId]);
  const myQuote = selected?.quotes?.[0] ?? null;

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setVehiclesLoading(true);
    listPartnerVehicles(token)
      .then((items) => {
        if (!cancelled) setVehicles(items);
      })
      .catch(() => {
        if (!cancelled) setVehicles([]);
      })
      .finally(() => {
        if (!cancelled) setVehiclesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  useEffect(() => {
    if (!requests.length) {
      setSelected(null);
      return;
    }
    const fromQuery = requestParam ? requests.find((item) => item.id === requestParam) : null;
    setSelected((current) => {
      if (fromQuery) return fromQuery;
      if (current && requests.some((item) => item.id === current.id)) {
        return requests.find((item) => item.id === current.id) ?? current;
      }
      return requests[0];
    });
  }, [requests, requestParam]);

  useEffect(() => {
    if (!selected) return;
    const existing = selected.quotes?.[0];
    setFormError("");
    setFormOk("");
    if (existing?.cab_type_id) setCabId(existing.cab_type_id);
    else setCabId("");
    setAmount(existing ? String(Math.round(existing.total_amount)) : "");
    setUsedSuggestedRate(false);
    setPayout(null);
    setMessage(existing?.partner_message ?? "");
    setInclusions(existing?.inclusions?.length ? existing.inclusions : DEFAULT_INCLUSIONS);
    setExclusions(existing?.exclusions?.length ? existing.exclusions : DEFAULT_EXCLUSIONS);
    const defaultValid = existing?.valid_until || selected.quote_deadline_at || selected.pickup_at;
    setValidUntil(toLocalInputValue(defaultValid));
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token || !cabId || !selected) {
      setPricing(null);
      return;
    }
    let cancelled = false;
    getPartnerVehiclePricing(token, cabId)
      .then((card) => {
        if (cancelled) return;
        setPricing(card);
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [auth, cabId, selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const token = auth?.getAccessToken();
    const totalAmount = Number(amount);
    if (!token || !selected || !cabId || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      setPayout(null);
      setPayoutLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setPayoutLoading(true);
      getPartnerQuotePayoutPreview(token, selected.id, cabId, totalAmount)
        .then((preview) => {
          if (!cancelled) setPayout(preview.partner_payout);
        })
        .catch(() => {
          if (!cancelled) setPayout(null);
        })
        .finally(() => {
          if (!cancelled) setPayoutLoading(false);
        });
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [amount, auth, cabId, selected]);

  const toggleChip = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !amount || !cabId || !validUntil) return;
    const token = auth?.getAccessToken();
    if (!token) return;
    setSaving(true);
    setFormError("");
    setFormOk("");
    try {
      const quote = await sendPartnerQuote(token, selected.id, {
        total_amount: Number(amount),
        cab_type_id: cabId,
        partner_message: message || undefined,
        inclusions,
        exclusions,
        valid_until: new Date(validUntil).toISOString(),
        fare_breakdown: pricing
          ? {
              source: usedSuggestedRate ? "fleet_rate_card_suggestion" : "partner_entered_quote",
              cab_type_id: cabId,
              suggested_from: selected.trip_type,
            }
          : undefined,
      });
      setRequests((items) =>
        items.map((request) =>
          request.id === selected.id ? { ...request, status: "quoted", quotes: [quote] } : request,
        ),
      );
      setFormOk("Quote sent to the traveller.");
      await refreshQuotes();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Could not send quote.");
    } finally {
      setSaving(false);
    }
  };

  const passRequest = async () => {
    if (!selected) return;
    const token = auth?.getAccessToken();
    if (!token) return;
    setPassing(true);
    setFormError("");
    try {
      await passPartnerQuoteRequest(token, selected.id);
      setRequests((items) => items.filter((request) => request.id !== selected.id));
      setSelected(null);
      await refreshQuotes();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Could not pass on this request.");
    } finally {
      setPassing(false);
    }
  };

  const renderRequestDetail = (inline = false) => {
    if (!selected) {
      return (
        <section className="grid min-h-72 place-items-center rounded-xl border border-slate-200 bg-white px-6 text-center text-sm text-slate-500 shadow-sm">
          Choose a request to build your quote.
        </section>
      );
    }

    return (
      <section className={`bg-white ${inline ? "border-t border-slate-100" : "rounded-xl border border-slate-200 shadow-sm"}`}>
        <div className="space-y-0">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Request brief</p>
                <h3 className="mt-0.5 text-lg font-black text-[#192131]">{selected.pickup_city} → {selected.drop_city}</h3>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">{deadlineLabel(selected.quote_deadline_at)}</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <p className="flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef6614]" /><span><strong className="block text-[10px] uppercase text-slate-400">Pickup</strong>{selected.pickup_address}</span></p>
              <p className="flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" /><span><strong className="block text-[10px] uppercase text-slate-400">Drop</strong>{selected.drop_address}</span></p>
              <p><strong className="text-[10px] uppercase text-slate-400">Pickup time</strong><span className="mt-0.5 block font-semibold text-[#192131]">{formatDateTime(selected.pickup_at)}</span></p>
              {selected.return_at && <p><strong className="text-[10px] uppercase text-slate-400">Return</strong><span className="mt-0.5 block font-semibold text-[#192131]">{formatDateTime(selected.return_at)}</span></p>}
              <p className="flex items-center gap-1.5 capitalize"><Users className="h-3.5 w-3.5 text-slate-400" />{selected.passengers} passengers{selected.luggage_count != null ? ` · ${selected.luggage_count} bags` : ""} · {tripTypeLabel(selected.trip_type)}</p>
              {selected.preferred_vehicle_categories?.length > 0 && <p><strong className="text-[10px] uppercase text-slate-400">Preferred</strong><span className="mt-0.5 block capitalize">{selected.preferred_vehicle_categories.map((c) => c.replaceAll("_", " ")).join(", ")}</span></p>}
            </div>
            {selected.additional_requirements && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{selected.additional_requirements}</p>}
          </div>

          <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-5">
            <div>
              <div className="flex items-center justify-between gap-2"><label className="text-xs font-extrabold text-[#192131]">Offer vehicle</label><Link href="/cabs/partner/vehicles" className="text-[10px] font-bold text-[#ef6614]">Manage fleet</Link></div>
              {vehiclesLoading ? <p className="mt-2 text-xs text-slate-400">Loading fleet…</p> : activeFleet.length === 0 ? (
                <div className="mt-2 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-3 py-3 text-xs text-amber-800">No active vehicles. <Link href="/cabs/partner/vehicles" className="font-extrabold underline">Activate a cab</Link> first to send quotes.</div>
              ) : (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {activeFleet.map((cab) => {
                    const tooSmall = cab.seats < selected.passengers;
                    const active = cabId === cab.id;
                    return <button key={cab.id} type="button" disabled={tooSmall} onClick={() => setCabId(cab.id)} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${active ? "border-[#ef6614] bg-orange-50" : tooSmall ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50" : "border-slate-200 hover:border-orange-200"}`}><div className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded bg-white">{cab.featured_image ? <>
                      {/* Partner-uploaded image URLs are not eligible for Next image optimisation. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cab.featured_image} alt="" className="h-full w-full object-contain" />
                    </> : <CarFront className="h-4 w-4 text-slate-300" />}</div><span className="min-w-0"><strong className="block truncate text-xs font-extrabold">{cab.name}</strong><span className="block truncate text-[10px] capitalize text-slate-500">{cab.category.replaceAll("_", " ")} · {cab.seats} seats{cab.driver_name ? ` · ${cab.driver_name}` : ""}</span>{tooSmall && <span className="text-[9px] font-bold text-red-600">Too few seats</span>}</span></button>;
                  })}
                </div>
              )}
              {selectedCab && <p className="mt-2 text-[11px] text-slate-500">Driver: <strong className="text-[#192131]">{selectedCab.driver_name || "—"}</strong>{selectedCab.driver_phone ? ` · ${selectedCab.driver_phone}` : ""}{selectedCab.registration_number ? ` · ${selectedCab.registration_number}` : ""}</p>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-500">Guest total fare (₹)<input required type="number" min={1} value={amount} onChange={(e) => { setAmount(e.target.value); setUsedSuggestedRate(false); }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" placeholder="e.g. 4500" />
                <div className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/55 px-3 py-2"><span><span className="block text-[9px] font-extrabold uppercase tracking-[0.08em] text-emerald-700">Estimated payout</span><span className="block text-[10px] font-medium text-emerald-800/75">After UNO margin &amp; GST</span></span><strong className="shrink-0 text-base font-black text-emerald-800">{payoutLoading ? "Calculating…" : payout !== null ? formatMoney(payout) : "—"}</strong></div>
              </label>
              <label className="text-xs font-bold text-slate-500">Valid until<input required type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" /></label>
            </div>
            {pricing && <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600"><span>Optional rate-card suggestion: one-way out {formatMoney(pricing.oneway_out_selling)}/km · day package {formatMoney(pricing.fullday_out_selling)}</span><button type="button" className="font-extrabold text-[#ef6614]" onClick={() => { const suggested = suggestFare(selected.trip_type, pricing); if (suggested) { setAmount(String(suggested)); setUsedSuggestedRate(true); } }}>Use suggested</button></div>}

            <div><p className="text-xs font-bold text-slate-500">Inclusions</p><div className="mt-1.5 flex flex-wrap gap-1.5">{[...new Set([...DEFAULT_INCLUSIONS, ...inclusions])].map((item) => <button key={item} type="button" onClick={() => toggleChip(inclusions, item, setInclusions)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${inclusions.includes(item) ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-slate-50 text-slate-400 ring-1 ring-slate-100"}`}>{item}</button>)}</div></div>
            <div><p className="text-xs font-bold text-slate-500">Exclusions</p><div className="mt-1.5 flex flex-wrap gap-1.5">{[...new Set([...DEFAULT_EXCLUSIONS, ...exclusions])].map((item) => <button key={item} type="button" onClick={() => toggleChip(exclusions, item, setExclusions)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${exclusions.includes(item) ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-400 ring-1 ring-slate-100"}`}>{item}</button>)}</div></div>
            <label className="block text-xs font-bold text-slate-500">Message to traveller<textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#ef6614]" placeholder="Vehicle condition, pickup notes, or anything useful…" /></label>
            {formError && <p className="text-xs font-semibold text-red-600">{formError}</p>}
            {formOk && <p className="text-xs font-semibold text-emerald-600">{formOk}</p>}
            {myQuote && <p className="text-[11px] text-slate-500">Last sent: {formatMoney(myQuote.total_amount)}{myQuote.cab_name ? ` · ${myQuote.cab_name}` : ""} · status {myQuote.status}</p>}
            <div className="flex flex-wrap gap-2 pt-1"><button disabled={saving || !cabId || activeFleet.length === 0} type="submit" className="rounded-lg bg-[#ef6614] px-5 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">{saving ? "Sending…" : myQuote ? "Update quote" : "Send quote"}</button><button type="button" disabled={passing || saving} onClick={() => void passRequest()} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 disabled:opacity-50">{passing ? "Passing…" : "Pass"}</button></div>
          </form>
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black tracking-tight">Quotes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Match a fleet cab to each request, price from your rate card, and send a clear offer.
        </p>
      </div>

      {selectedByTravellerRequests.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/35 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-4 w-4" /></span>
              <div><h3 className="text-sm font-black text-emerald-950">Selected by traveller</h3><p className="text-[11px] text-emerald-800/75">Your offer was chosen. It will move to Bookings once the traveller completes the final step.</p></div>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">{selectedByTravellerRequests.length} awaiting booking</span>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {selectedByTravellerRequests.map((request) => {
              const quote = request.quotes?.[0];
              return <article key={request.id} className="rounded-lg border border-emerald-100 bg-white px-3 py-3">
                <div className="flex items-start justify-between gap-2"><div><strong className="block text-sm font-extrabold text-[#192131]">{request.pickup_city} → {request.drop_city}</strong><p className="mt-1 text-[11px] text-slate-500">{formatDateTime(request.pickup_at)} · {request.passengers} pax</p></div><span className="text-right text-sm font-black text-emerald-700">{quote ? formatMoney(quote.total_amount) : "Selected"}</span></div>
                <p className="mt-2 text-[11px] font-medium text-emerald-800">Quote selected · waiting for the traveller to complete booking</p>
              </article>;
            })}
          </div>
        </section>
      ) : null}

      {recentlyClosedRequests.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-[#192131]">Recently closed leads</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">These requests are no longer accepting quotes, but stay visible for seven days.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">{recentlyClosedRequests.length} closed</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentlyClosedRequests.map((request) => {
              const quote = request.quotes?.[0];
              const highlighted = requestParam === request.id;
              return (
                <article
                  key={request.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${highlighted ? "bg-amber-50/70 ring-1 ring-inset ring-amber-200" : ""}`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm font-extrabold text-[#192131]">{request.pickup_city} → {request.drop_city}</strong>
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Quote window closed</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(request.pickup_at)} · {request.passengers} pax · {request.request_number}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    {quote ? <><strong className="block text-sm text-[#192131]">{formatMoney(quote.total_amount)}</strong><span className="capitalize">Your quote {quote.status}</span></> : <span>Closed {formatDateTime(request.quote_deadline_at)}</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Inbox */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-black">Open requests</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{requests.length} waiting for a quote</p>
          </div>
          {quotesError && <p className="m-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{quotesError}</p>}
          {requests.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No open requests right now.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((request) => {
                const quoted = Boolean(request.quotes?.length);
                const expanded = selected?.id === request.id;
                return (
                  <div key={request.id}>
                    <button
                      type="button"
                      onClick={() => setSelected((current) => current?.id === request.id ? null : request)}
                      aria-expanded={expanded}
                      className={`w-full px-4 py-3 text-left transition hover:bg-orange-50/60 ${expanded ? "bg-orange-50" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm font-extrabold text-[#192131]">{request.pickup_city} → {request.drop_city}</strong>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#ef6614]">{request.request_number}<ChevronDown className={`h-3.5 w-3.5 transition-transform xl:hidden ${expanded ? "rotate-180" : ""}`} /></span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(request.pickup_at)} · {request.passengers} pax · <span className="capitalize">{tripTypeLabel(request.trip_type)}</span></p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500"><Clock3 className="h-3 w-3" />{deadlineLabel(request.quote_deadline_at)}</span>
                        {quoted && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Quoted ₹{Math.round(request.quotes[0].total_amount).toLocaleString("en-IN")}</span>}
                      </div>
                    </button>
                    {expanded && <div className="xl:hidden">{renderRequestDetail(true)}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Detail + form */}
        <section className="hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
          {!selected ? (
            <div className="grid min-h-72 place-items-center px-6 text-center text-sm text-slate-500">
              Choose a request to build your quote.
            </div>
          ) : (
            <div className="space-y-0">
              {/* Request brief */}
              <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Request brief</p>
                    <h3 className="mt-0.5 text-lg font-black text-[#192131]">
                      {selected.pickup_city} → {selected.drop_city}
                    </h3>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
                    {deadlineLabel(selected.quote_deadline_at)}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <p className="flex gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ef6614]" />
                    <span>
                      <strong className="block text-[10px] uppercase text-slate-400">Pickup</strong>
                      {selected.pickup_address}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>
                      <strong className="block text-[10px] uppercase text-slate-400">Drop</strong>
                      {selected.drop_address}
                    </span>
                  </p>
                  <p>
                    <strong className="text-[10px] uppercase text-slate-400">Pickup time</strong>
                    <span className="mt-0.5 block font-semibold text-[#192131]">{formatDateTime(selected.pickup_at)}</span>
                  </p>
                  {selected.return_at && (
                    <p>
                      <strong className="text-[10px] uppercase text-slate-400">Return</strong>
                      <span className="mt-0.5 block font-semibold text-[#192131]">{formatDateTime(selected.return_at)}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 capitalize">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {selected.passengers} passengers
                    {selected.luggage_count != null ? ` · ${selected.luggage_count} bags` : ""}
                    {" · "}
                    {tripTypeLabel(selected.trip_type)}
                  </p>
                  {selected.preferred_vehicle_categories?.length > 0 && (
                    <p>
                      <strong className="text-[10px] uppercase text-slate-400">Preferred</strong>
                      <span className="mt-0.5 block capitalize">
                        {selected.preferred_vehicle_categories.map((c) => c.replaceAll("_", " ")).join(", ")}
                      </span>
                    </p>
                  )}
                </div>
                {selected.additional_requirements && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    {selected.additional_requirements}
                  </p>
                )}
              </div>

              <form onSubmit={submit} className="space-y-4 px-4 py-4 sm:px-5">
                {/* Fleet picker */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-[#192131]">Offer vehicle</label>
                    <Link href="/cabs/partner/vehicles" className="text-[10px] font-bold text-[#ef6614]">
                      Manage fleet
                    </Link>
                  </div>
                  {vehiclesLoading ? (
                    <p className="mt-2 text-xs text-slate-400">Loading fleet…</p>
                  ) : activeFleet.length === 0 ? (
                    <div className="mt-2 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-3 py-3 text-xs text-amber-800">
                      No active vehicles.{" "}
                      <Link href="/cabs/partner/vehicles" className="font-extrabold underline">
                        Activate a cab
                      </Link>{" "}
                      first to send quotes.
                    </div>
                  ) : (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {activeFleet.map((cab) => {
                        const tooSmall = cab.seats < selected.passengers;
                        const active = cabId === cab.id;
                        return (
                          <button
                            key={cab.id}
                            type="button"
                            disabled={tooSmall}
                            onClick={() => setCabId(cab.id)}
                            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                              active
                                ? "border-[#ef6614] bg-orange-50"
                                : tooSmall
                                  ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                                  : "border-slate-200 hover:border-orange-200"
                            }`}
                          >
                            <div className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded bg-white">
                              {cab.featured_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={cab.featured_image} alt="" className="h-full w-full object-contain" />
                              ) : (
                                <CarFront className="h-4 w-4 text-slate-300" />
                              )}
                            </div>
                            <span className="min-w-0">
                              <strong className="block truncate text-xs font-extrabold">{cab.name}</strong>
                              <span className="block truncate text-[10px] capitalize text-slate-500">
                                {cab.category.replaceAll("_", " ")} · {cab.seats} seats
                                {cab.driver_name ? ` · ${cab.driver_name}` : ""}
                              </span>
                              {tooSmall && (
                                <span className="text-[9px] font-bold text-red-600">Too few seats</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {selectedCab && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Driver: <strong className="text-[#192131]">{selectedCab.driver_name || "—"}</strong>
                      {selectedCab.driver_phone ? ` · ${selectedCab.driver_phone}` : ""}
                      {selectedCab.registration_number ? ` · ${selectedCab.registration_number}` : ""}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold text-slate-500">
                    Guest total fare (₹)
                    <input
                      required
                      type="number"
                      min={1}
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setUsedSuggestedRate(false);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]"
                      placeholder="e.g. 4500"
                    />
                    <div className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/55 px-3 py-2">
                      <span>
                        <span className="block text-[9px] font-extrabold uppercase tracking-[0.08em] text-emerald-700">Estimated payout</span>
                        <span className="block text-[10px] font-medium text-emerald-800/75">After UNO margin &amp; GST</span>
                      </span>
                      <strong className="shrink-0 text-base font-black text-emerald-800">
                        {payoutLoading ? "Calculating…" : payout !== null ? formatMoney(payout) : "—"}
                      </strong>
                    </div>
                  </label>
                  <label className="text-xs font-bold text-slate-500">
                    Valid until
                    <input
                      required
                      type="datetime-local"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]"
                    />
                  </label>
                </div>
                {pricing && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                    <span>
                      Optional rate-card suggestion: one-way out {formatMoney(pricing.oneway_out_selling)}/km · day package{" "}
                      {formatMoney(pricing.fullday_out_selling)}
                    </span>
                    <button
                      type="button"
                      className="font-extrabold text-[#ef6614]"
                      onClick={() => {
                        const suggested = suggestFare(selected.trip_type, pricing);
                        if (suggested) {
                          setAmount(String(suggested));
                          setUsedSuggestedRate(true);
                        }
                      }}
                    >
                      Use suggested
                    </button>
                  </div>
                )}

                {/* Inclusions */}
                <div>
                  <p className="text-xs font-bold text-slate-500">Inclusions</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[...new Set([...DEFAULT_INCLUSIONS, ...inclusions])].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleChip(inclusions, item, setInclusions)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          inclusions.includes(item)
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-50 text-slate-400 ring-1 ring-slate-100"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Exclusions</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {[...new Set([...DEFAULT_EXCLUSIONS, ...exclusions])].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleChip(exclusions, item, setExclusions)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          exclusions.includes(item)
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 text-slate-400 ring-1 ring-slate-100"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block text-xs font-bold text-slate-500">
                  Message to traveller
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#ef6614]"
                    placeholder="Vehicle condition, pickup notes, or anything useful…"
                  />
                </label>

                {formError && <p className="text-xs font-semibold text-red-600">{formError}</p>}
                {formOk && <p className="text-xs font-semibold text-emerald-600">{formOk}</p>}
                {myQuote && (
                  <p className="text-[11px] text-slate-500">
                    Last sent: {formatMoney(myQuote.total_amount)}
                    {myQuote.cab_name ? ` · ${myQuote.cab_name}` : ""} · status {myQuote.status}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    disabled={saving || !cabId || activeFleet.length === 0}
                    type="submit"
                    className="rounded-lg bg-[#ef6614] px-5 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
                  >
                    {saving ? "Sending…" : myQuote ? "Update quote" : "Send quote"}
                  </button>
                  <button
                    type="button"
                    disabled={passing || saving}
                    onClick={() => void passRequest()}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-600 disabled:opacity-50"
                  >
                    {passing ? "Passing…" : "Pass"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
