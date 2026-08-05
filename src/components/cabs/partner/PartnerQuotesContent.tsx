"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  Users,
  X,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  if (ms <= 0) return "Time over";
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
  return Math.round(pricing.fullday_out_selling || pricing.fullday_local_selling);
}

function tripTypeLabel(value: string) {
  const map: Record<string, string> = {
    one_way: "Outstation",
    round_trip: "Round trip",
    hourly_rental: "Hourly",
    airport_transfer: "Airport",
  };
  return map[value] || value.replaceAll("_", " ");
}

function quoteStatusLabel(status: string) {
  if (status === "sent") return "Waiting for guest";
  if (status === "viewed") return "Guest opened it";
  if (status === "accepted") return "Guest chose you";
  if (status === "rejected") return "Not selected";
  if (status === "withdrawn") return "Skipped";
  return status.replaceAll("_", " ");
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
  const [sheetOpen, setSheetOpen] = useState(false);
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
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passing, setPassing] = useState(false);
  const [skipConfirm, setSkipConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [receipt, setReceipt] = useState<{ route: string; amount: number } | null>(null);

  const activeFleet = useMemo(() => vehicles.filter((v) => v.is_active), [vehicles]);
  const selectedCab = useMemo(() => vehicles.find((v) => v.id === cabId) ?? null, [vehicles, cabId]);
  const myQuote = selected?.quotes?.[0] ?? null;
  const needsReplyCount = useMemo(
    () => requests.filter((r) => !(r.quotes && r.quotes.length > 0)).length,
    [requests],
  );

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
      setSheetOpen(false);
      return;
    }
    const fromQuery = requestParam ? requests.find((item) => item.id === requestParam) : null;
    setSelected((current) => {
      if (fromQuery) return fromQuery;
      if (current && requests.some((item) => item.id === current.id)) {
        return requests.find((item) => item.id === current.id) ?? current;
      }
      return null;
    });
    if (fromQuery) setSheetOpen(true);
  }, [requests, requestParam]);

  useEffect(() => {
    if (!selected) return;
    const existing = selected.quotes?.[0];
    setFormError("");
    setReceipt(null);
    setSkipConfirm(false);
    setShowMore(false);
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
        if (!cancelled) setPricing(card);
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

  const openRequest = (request: CabTripRequest) => {
    setSelected(request);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || !amount || !cabId) return;
    const token = auth?.getAccessToken();
    if (!token) return;
    const validIso = validUntil
      ? new Date(validUntil).toISOString()
      : selected.quote_deadline_at || selected.pickup_at;
    setSaving(true);
    setFormError("");
    setReceipt(null);
    try {
      const quote = await sendPartnerQuote(token, selected.id, {
        total_amount: Number(amount),
        cab_type_id: cabId,
        partner_message: message || undefined,
        inclusions,
        exclusions,
        valid_until: validIso,
        fare_breakdown: pricing
          ? {
              source: usedSuggestedRate ? "fleet_rate_card_suggestion" : "partner_entered_quote",
              cab_type_id: cabId,
              suggested_from: selected.trip_type,
            }
          : undefined,
      });
      const route = `${selected.pickup_city} → ${selected.drop_city}`;
      setRequests((items) =>
        items.map((request) =>
          request.id === selected.id ? { ...request, status: "quoted", quotes: [quote] } : request,
        ),
      );
      setReceipt({ route, amount: Number(amount) });
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
      setSheetOpen(false);
      setSkipConfirm(false);
      await refreshQuotes();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Could not skip this trip.");
    } finally {
      setPassing(false);
    }
  };

  const renderQuoteForm = () => {
    if (!selected) return null;

    if (receipt) {
      return (
        <div className="space-y-4 px-4 py-6 text-center sm:px-5">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <div>
            <h3 className="text-lg font-black text-[#192131]">Quote sent</h3>
            <p className="mt-1 text-sm text-slate-600">
              Guest will see your fare for <strong>{receipt.route}</strong>.
            </p>
            <p className="mt-2 text-2xl font-black text-[#ef6614]">{formatMoney(receipt.amount)}</p>
          </div>
          <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] font-medium text-emerald-800">
            We’ll notify you if the guest chooses your cab.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setReceipt(null);
                closeSheet();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ef6614] px-5 text-sm font-extrabold text-white"
            >
              Back to trip requests
            </button>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600"
            >
              Edit quote
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Trip details</p>
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
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {selected.passengers} traveller{selected.passengers === 1 ? "" : "s"}
              {selected.luggage_count != null ? ` · ${selected.luggage_count} bags` : ""}
              {" · "}
              {tripTypeLabel(selected.trip_type)}
            </p>
            {selected.preferred_vehicle_categories?.length > 0 && (
              <p>
                <strong className="text-[10px] uppercase text-slate-400">Preferred cab</strong>
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
          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-extrabold text-[#192131]">1. Choose your car</label>
              <Link href="/cabs/partner/vehicles" className="text-[11px] font-bold text-[#ef6614]">
                My cars
              </Link>
            </div>
            {vehiclesLoading ? (
              <p className="mt-2 text-xs text-slate-400">Loading your cars…</p>
            ) : activeFleet.length === 0 ? (
              <div className="mt-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-4 text-center">
                <p className="text-sm font-bold text-amber-900">Add your first car to send quotes</p>
                <p className="mt-1 text-[12px] text-amber-800/80">Turn a car on, then come back to reply.</p>
                <Link
                  href="/cabs/partner/vehicles/new"
                  className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ef6614] px-5 text-sm font-extrabold text-white"
                >
                  Add your first car
                </Link>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {activeFleet.map((cab) => {
                  const tooSmall = cab.seats < selected.passengers;
                  const active = cabId === cab.id;
                  return (
                    <button
                      key={cab.id}
                      type="button"
                      disabled={tooSmall}
                      onClick={() => setCabId(cab.id)}
                      className={cn(
                        "flex min-h-[4.5rem] flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2 text-center transition sm:min-h-14 sm:flex-row sm:items-center sm:gap-2 sm:px-2.5 sm:py-2.5 sm:text-left",
                        active
                          ? "border-[#ef6614] bg-orange-50"
                          : tooSmall
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                            : "border-slate-200 hover:border-orange-200",
                      )}
                    >
                      <div className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white sm:h-10 sm:w-14">
                        {cab.featured_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cab.featured_image} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <CarFront className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <span className="min-w-0 w-full">
                        <strong className="block truncate text-[10px] font-extrabold sm:text-xs">{cab.name}</strong>
                        <span className="block truncate text-[9px] capitalize text-slate-500 sm:text-[10px]">
                          {cab.category.replaceAll("_", " ")} · {cab.seats} seats
                        </span>
                        {tooSmall && <span className="text-[9px] font-bold text-red-600">Too few seats</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-extrabold text-[#192131]">
              2. Total fare for guest (₹)
              <input
                required
                type="number"
                min={1}
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setUsedSuggestedRate(false);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold outline-none focus:border-[#ef6614]"
                placeholder="e.g. 4500"
              />
            </label>
            <div className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/55 px-3 py-2.5">
              <span>
                <span className="block text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                  You receive (approx.)
                </span>
                <span className="block text-[11px] font-medium text-emerald-800/75">After platform fee &amp; tax</span>
              </span>
              <strong className="shrink-0 text-base font-black text-emerald-800">
                {payoutLoading ? "…" : payout !== null ? formatMoney(payout) : "—"}
              </strong>
            </div>
          </div>

          <label className="block text-sm font-extrabold text-[#192131]">
            3. Note to guest <span className="font-semibold text-slate-400">(optional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#ef6614]"
              placeholder="AC cab, experienced hill driver, etc."
            />
          </label>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-slate-500"
          >
            More options
            <ChevronDown className={cn("h-3.5 w-3.5 transition", showMore && "rotate-180")} />
          </button>

          {showMore && (
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <label className="block text-xs font-bold text-slate-500">
                Quote valid until
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]"
                />
              </label>
              {pricing && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span>
                    Suggested from your prices: day package {formatMoney(pricing.fullday_out_selling)}
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
              <div>
                <p className="text-xs font-bold text-slate-500">Included</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[...new Set([...DEFAULT_INCLUSIONS, ...inclusions])].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleChip(inclusions, item, setInclusions)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold",
                        inclusions.includes(item)
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-white text-slate-400 ring-1 ring-slate-100",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Not included</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[...new Set([...DEFAULT_EXCLUSIONS, ...exclusions])].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleChip(exclusions, item, setExclusions)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold",
                        exclusions.includes(item)
                          ? "bg-slate-800 text-white"
                          : "bg-white text-slate-400 ring-1 ring-slate-100",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formError && <p className="text-xs font-semibold text-red-600">{formError}</p>}
          {myQuote && !receipt && (
            <p className="text-[11px] text-slate-500">
              Last sent: {formatMoney(myQuote.total_amount)}
              {myQuote.cab_name ? ` · ${myQuote.cab_name}` : ""} · {quoteStatusLabel(myQuote.status)}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <button
              disabled={saving || !cabId || activeFleet.length === 0}
              type="submit"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#ef6614] px-5 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {saving ? "Sending…" : myQuote ? "Update quote" : "Send quote"}
            </button>
            {!skipConfirm ? (
              <button
                type="button"
                disabled={passing || saving}
                onClick={() => setSkipConfirm(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 disabled:opacity-50"
              >
                Skip this trip
              </button>
            ) : (
              <div className="flex flex-1 flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 sm:flex-row sm:items-center">
                <p className="flex-1 text-[12px] font-semibold text-amber-900">
                  Skip this trip? You won’t be able to quote on it again.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={passing}
                    onClick={() => void passRequest()}
                    className="rounded-lg bg-amber-800 px-3 py-2 text-[11px] font-extrabold text-white disabled:opacity-50"
                  >
                    {passing ? "Skipping…" : "Yes, skip"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkipConfirm(false)}
                    className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-[11px] font-bold text-amber-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black tracking-tight">Trip requests</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pick a trip, choose your car, type the fare, and send.
        </p>
      </div>

      {/* 1. Open trips first — action needed */}
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-black">Open trips</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {needsReplyCount > 0
                ? `${needsReplyCount} need${needsReplyCount === 1 ? "s" : ""} your reply`
                : requests.length > 0
                  ? "All open trips have your quote"
                  : "Nothing waiting right now"}
            </p>
          </div>
          {quotesError && <p className="m-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{quotesError}</p>}
          {requests.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CarFront className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-[#192131]">No trip requests yet</p>
              <p className="mt-1 text-[12px] text-slate-500">
                When a guest needs a cab on your routes, it shows up here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((request) => {
                const quoted = Boolean(request.quotes?.length);
                const active = selected?.id === request.id && sheetOpen;
                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => openRequest(request)}
                    className={cn(
                      "w-full px-4 py-3.5 text-left transition hover:bg-orange-50/60",
                      active && "bg-orange-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-sm font-extrabold text-[#192131]">
                        {request.pickup_city} → {request.drop_city}
                      </strong>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                          quoted ? "bg-emerald-50 text-emerald-700" : "bg-[#FFF3E0] text-[#E65100]",
                        )}
                      >
                        {quoted ? "Quoted" : "Needs reply"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatDateTime(request.pickup_at)} · {request.passengers} traveller
                      {request.passengers === 1 ? "" : "s"} · {tripTypeLabel(request.trip_type)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        <Clock3 className="h-3 w-3" />
                        {deadlineLabel(request.quote_deadline_at)}
                      </span>
                      {quoted && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          {formatMoney(request.quotes[0].total_amount)} ·{" "}
                          {quoteStatusLabel(request.quotes[0].status)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
          {!selected ? (
            <div className="grid min-h-72 place-items-center px-6 text-center text-sm text-slate-500">
              Tap a trip on the left to send your fare.
            </div>
          ) : (
            renderQuoteForm()
          )}
        </section>
      </div>

      {/* 2. Guest chose you */}
      {selectedByTravellerRequests.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/35 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-emerald-950">Guest chose you</h3>
                <p className="text-[11px] text-emerald-800/75">
                  Waiting for payment. You’ll see it under My trips when booked.
                </p>
              </div>
            </div>
            <Link
              href="/cabs/partner/bookings"
              className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-100"
            >
              Check My trips →
            </Link>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {selectedByTravellerRequests.map((request) => {
              const quote = request.quotes?.[0];
              return (
                <article key={request.id} className="rounded-lg border border-emerald-100 bg-white px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="block text-sm font-extrabold text-[#192131]">
                        {request.pickup_city} → {request.drop_city}
                      </strong>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {formatDateTime(request.pickup_at)} · {request.passengers} traveller
                        {request.passengers === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="text-right text-sm font-black text-emerald-700">
                      {quote ? formatMoney(quote.total_amount) : "Selected"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 3. Old / closed — last */}
      {recentlyClosedRequests.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-black text-[#192131]">Old requests</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">Closed — you can’t reply to these.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
              {recentlyClosedRequests.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentlyClosedRequests.map((request) => {
              const quote = request.quotes?.[0];
              const highlighted = requestParam === request.id;
              return (
                <article
                  key={request.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                    highlighted && "bg-amber-50/70 ring-1 ring-inset ring-amber-200",
                  )}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm font-extrabold text-[#192131]">
                        {request.pickup_city} → {request.drop_city}
                      </strong>
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        Closed
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatDateTime(request.pickup_at)} · {request.passengers} traveller
                      {request.passengers === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    {quote ? (
                      <>
                        <strong className="block text-sm text-[#192131]">{formatMoney(quote.total_amount)}</strong>
                        <span>{quoteStatusLabel(quote.status)}</span>
                      </>
                    ) : (
                      <span>No quote sent</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {sheetOpen && selected && (
        <div className="fixed inset-0 z-50 bg-white xl:hidden" role="dialog" aria-modal="true">
          <div className="flex h-[100dvh] flex-col">
            <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-3">
              <button
                type="button"
                onClick={closeSheet}
                className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-700"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[#192131]">
                  {selected.pickup_city} → {selected.drop_city}
                </p>
                <p className="text-[11px] text-slate-500">{deadlineLabel(selected.quote_deadline_at)}</p>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="grid h-10 w-10 place-items-center rounded-full text-slate-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              {renderQuoteForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
