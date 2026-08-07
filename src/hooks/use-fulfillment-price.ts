"use client";

/**
 * src/hooks/use-fulfillment-price.ts
 *
 * Calls POST /v1/packages/{slug}/fulfillment-price whenever any customizer
 * selection changes and returns the authoritative backend price.
 *
 * REPLACES all frontend price calculations:
 *   - calcTotalWithOptions()  → pricing_summary fields
 *   - tokenAmount()           → token_amount (from backend)
 *   - sightTotal / actTotal   → pricing_summary.activities_total
 *   - breakdown.hotel         → pricing_summary.hotel_upgrade_total
 *   - breakdown.cab           → pricing_summary.cab_upgrade_total
 *   - breakdown.addons        → pricing_summary.addons_total
 *   - breakdown.total         → grand_total (includes GST)
 *
 * DEBOUNCE (600ms):
 *   Selection changes start a 600ms timer. If another change arrives before
 *   the timer fires, the previous timer is cancelled and a new 600ms window
 *   starts. Only after 600ms of silence does the request fire.
 *
 * ABORT:
 *   When the debounce timer fires and a request is already in flight, the
 *   in-flight request is aborted via AbortController before the new one
 *   starts. Aborted requests are silently discarded (not treated as errors).
 *
 * DUPLICATE PREVENTION:
 *   The useEffect dependency array uses serialised string keys for arrays/
 *   objects. If no key changes between renders, the effect does not re-run
 *   and no new debounce timer is started.
 *
 * STATE MACHINE:
 *   idle      — no selections made yet (initial render, enabled=false)
 *   loading   — debounce fired, request in-flight
 *   success   — backend responded, price values are authoritative
 *   error     — request failed; last good price kept with isStale=true
 *
 * FALLBACK:
 *   On error or while loading, the hook returns the last successful response
 *   (isStale=true) so the user always sees a price. The booking flow
 *   always re-prices server-side regardless of what this hook shows.
 */

import { useEffect, useRef, useState } from "react";
import type {
  FulfillmentPricingResponse,
  FulfillmentPriceRequest,
} from "@/lib/package-fulfillment-types";

const DEBOUNCE_MS = 600;

const PACKAGES_BASE =
  process.env.NEXT_PUBLIC_PACKAGES_API_BASE?.replace(/\/$/, "") ??
  "/api/packages";

// ── Internal state ────────────────────────────────────────────────────────────

type PriceState =
  | { status: "idle" }
  | { status: "loading"; prev: FulfillmentPricingResponse | null }
  | { status: "success"; data: FulfillmentPricingResponse }
  | { status: "error"; prev: FulfillmentPricingResponse | null; message: string };

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function fetchFulfillmentPrice(
  slug: string,
  payload: FulfillmentPriceRequest,
  signal: AbortSignal,
): Promise<FulfillmentPricingResponse> {
  const url = `${PACKAGES_BASE}/${encodeURIComponent(slug)}/fulfillment-price`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    let msg = "Price calculation failed. Please try again.";
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) msg = json.message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(msg);
  }
  const envelope = (await res.json()) as { data: FulfillmentPricingResponse };
  return envelope.data;
}

// ── Public types ──────────────────────────────────────────────────────────────

export type UseFulfillmentPriceOptions = {
  slug: string;
  /** TourPackage.packageId — sent as package_id in the request body. */
  packageId: string;
  travelDate: string | null;
  rooms: Array<{ adults: number; children: number }>;
  /** Typed hotel+room selections — each entry has option_id + room_type_id. */
  selectedHotels: Array<{ option_id: string; room_type_id: string | null }>;
  selectedCabOptionId: string | null;
  /** Guest's chosen advance %. Server clamps to the package floor. */
  tokenPercent?: number | null;
  selectedSightseeingIds: string[];
  selectedActivityLinkIds: string[];
  selectedAddonIds: string[];
  /**
   * Set to false while day-options are still loading to avoid a race between
   * the customizer data arriving and the first pricing request.
   * Defaults to true.
   */
  enabled?: boolean;
};

export type UseFulfillmentPriceResult = {
  /** True while the debounce timer is running or a request is in-flight. */
  isLoading: boolean;
  /** True after at least one successful response has been received. */
  hasPrice: boolean;
  /**
   * True when displaying a previous response while a new request is
   * in-flight or the last request failed.
   */
  isStale: boolean;
  /** Non-null when the last completed request returned an error. */
  errorMessage: string | null;

  // ── All values are backend-authoritative — never computed in React ─────────

  /** Grand total including GST. The amount Razorpay will charge. */
  grandTotal: number;
  /** Advance payment to confirm the booking. */
  tokenAmount: number;
  /** Platform advance percentage applied (e.g. 40). Labelling only. */
  tokenPercent: number;
  /** Minimum % payable now, when the package lets the guest choose. */
  minTokenPercent: number | null;
  /** Balance due before travel (grand_total - token_amount). */
  balanceAmount: number;
  /** Pre-tax package subtotal (before GST). */
  subtotal: number;
  /** Hotel tier upgrade cost over the default. */
  hotelUpgrade: number;
  /** Vehicle upgrade cost over the default cab. */
  cabUpgrade: number;
  /** Volvo bus return-ticket cost (0 for non-Volvo packages). */
  volvoBusCost: number;
  /** Combined sightseeing + activities total. */
  activitiesTotal: number;
  /** Add-ons total. */
  addonsTotal: number;
  /**
   * false when the hotel pricing engine could not price one or more stays.
   * The booking button must be disabled when false.
   */
  isComplete: boolean;
  /**
   * True when token_amount > 0 and token_amount < grand_total.
   * Drives the "Pay token now / Pay full" split in the UI.
   */
  tokenPaymentAvailable: boolean;

  /**
   * Pre-tax base package price (before any upgrades).
   * Use this instead of computing subtotal - upgrades in the view.
   */
  basePackagePrice: number;

  /**
   * Total adults from the backend's passenger manifest.
   * Use this for "per person" display instead of summing rooms client-side.
   */
  totalAdults: number;
  /** Adults + children. The real head count the trip is priced for. */
  totalGuests: number;

  /** Full response for components that need GST breakdown or warnings. */
  raw: FulfillmentPricingResponse | null;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFulfillmentPrice(
  opts: UseFulfillmentPriceOptions,
): UseFulfillmentPriceResult {
  const [state, setState] = useState<PriceState>({ status: "idle" });

  // stateRef gives fire() access to the *current* state without it becoming
  // a closure dependency (which would require recreating fire() on every
  // state change and cause the debounce timer to reset).
  const stateRef = useRef<PriceState>(state);
  stateRef.current = state;

  // optsRef gives fire() access to the latest options for the same reason.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // fire() is stable — never recreated. It reads current state and options
  // from refs, so it is always up-to-date when the timer fires.
  const fireRef = useRef(() => {
    const {
      slug,
      packageId,
      travelDate,
      rooms,
      selectedHotels,
      selectedCabOptionId,
      selectedSightseeingIds,
      selectedActivityLinkIds,
      selectedAddonIds,
      tokenPercent,
      enabled = true,
    } = optsRef.current;

    if (!enabled || !slug || !packageId) return;

    // Abort any in-flight request before starting a new one.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    // Read prev from the ref — not from a closure — so it reflects the
    // state at the moment the debounce timer fires, not at mount time.
    const s = stateRef.current;
    const prev =
      s.status === "success"
        ? s.data
        : s.status === "loading" || s.status === "error"
          ? s.prev
          : null;

    setState({ status: "loading", prev });

    const payload: FulfillmentPriceRequest = {
      package_id: packageId,
      travel_date: travelDate,
      rooms,
      selected_hotels: selectedHotels,
      selected_cab_option_id: selectedCabOptionId,
      selected_sightseeing_ids: selectedSightseeingIds,
      selected_activity_link_ids: selectedActivityLinkIds,
      selected_addon_ids: selectedAddonIds,
      token_percent: tokenPercent ?? null,
    };

    fetchFulfillmentPrice(slug, payload, controller.signal).then((data) => {
      setState({ status: "success", data });
    }).catch((err: Error) => {
      // AbortError means this request was superseded by a newer one — ignore.
      if (err.name === "AbortError") return;
      setState({ status: "error", prev, message: err.message });
    });
  });

  // ── Serialised dependency keys ────────────────────────────────────────────
  // Arrays are serialised to stable strings so the effect only re-runs when
  // the actual values change, not when the parent re-creates array references.
  const {
    slug,
    packageId,
    travelDate,
    rooms,
    selectedHotels,
    selectedCabOptionId,
    selectedSightseeingIds,
    selectedActivityLinkIds,
    selectedAddonIds,
    tokenPercent,
    enabled = true,
  } = opts;

  const roomsKey  = JSON.stringify(rooms);
  const hotelKey  = JSON.stringify(selectedHotels);
  // Part of the key: without it, choosing a different preset would keep
  // showing the previous amount.
  const tokenKey  = String(tokenPercent ?? "");
  const sightKey  = selectedSightseeingIds.join(",");
  const actKey    = selectedActivityLinkIds.join(",");
  const addonKey  = selectedAddonIds.join(",");

  // ── Debounced effect ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !slug || !packageId) return;

    // Cancel any pending timer — start a fresh 600ms window.
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fireRef.current, DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    slug,
    packageId,
    travelDate,
    roomsKey,
    hotelKey,
    selectedCabOptionId,
    sightKey,
    actKey,
    addonKey,
    tokenKey,
    enabled,
  ]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      controllerRef.current?.abort();
    };
  }, []);

  // ── Derive result from state ──────────────────────────────────────────────

  const current: FulfillmentPricingResponse | null =
    state.status === "success"
      ? state.data
      : state.status === "loading" || state.status === "error"
        ? state.prev
        : null;

  const isLoading = state.status === "idle" || state.status === "loading";
  const hasPrice = current !== null;
  const isStale = state.status === "loading" || state.status === "error";
  const errorMessage = state.status === "error" ? state.message : null;

  const grandTotal      = current?.grand_total                              ?? 0;
  const tokenAmount     = current?.token_amount                             ?? 0;
  // Platform percentage the backend actually applied. Distinct from the
  // `tokenPercent` OPTION above, which is the guest's requested advance.
  const appliedTokenPercent = current?.token_percent                        ?? 0;
  const balanceAmount   = current?.balance_amount                           ?? 0;
  const subtotal        = current?.pricing_summary.package_subtotal         ?? 0;
  const basePackagePrice = current?.pricing_summary.base_package_price      ?? 0;
  const hotelUpgrade    = current?.pricing_summary.hotel_upgrade_total      ?? 0;
  const cabUpgrade      = current?.pricing_summary.cab_upgrade_total        ?? 0;
  const volvoBusCost    = current?.pricing_summary.volvo_bus_cost          ?? 0;
  const activitiesTotal = current?.pricing_summary.activities_total         ?? 0;
  const addonsTotal     = current?.pricing_summary.addons_total             ?? 0;
  const isComplete      = current?.is_complete                              ?? true;
  const minTokenPercent = current?.min_token_percent ?? null;
  const totalAdults     = current?.passenger_manifest.total_adults          ?? 0;
  const totalGuests     = current?.passenger_manifest.total_headcount       ?? totalAdults;

  const tokenPaymentAvailable = tokenAmount > 0 && tokenAmount < grandTotal;

  return {
    isLoading,
    hasPrice,
    isStale,
    errorMessage,
    grandTotal,
    tokenAmount,
    tokenPercent: appliedTokenPercent,
    balanceAmount,
    subtotal,
    basePackagePrice,
    hotelUpgrade,
    cabUpgrade,
    volvoBusCost,
    activitiesTotal,
    addonsTotal,
    isComplete,
    tokenPaymentAvailable,
    totalAdults,
    totalGuests,
    minTokenPercent,
    raw: current,
  };
}