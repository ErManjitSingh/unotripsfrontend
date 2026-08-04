"use client";

/**
 * src/hooks/use-traveller-price-diff.ts
 *
 * Fetches the traveller price diff from the backend whenever the
 * traveller/room selection changes. Returns a TravellerPriceDiff
 * object that powers the MakeMyTrip-style "Traveller Update" panel.
 *
 * USAGE:
 *   const { diff, isLoading, errorMessage } = useTravellerPriceDiff({
 *     slug,
 *     packageId,
 *     travelDate,
 *     previousRooms: [{ adults: 2, children: 0 }],
 *     currentRooms:  [{ adults: 3, children: 0 }, { adults: 2, children: 0 }],
 *     selectedHotelOptionIds,
 *     selectedCabOptionId,
 *     selectedSightseeingIds,
 *     selectedActivityLinkIds,
 *     selectedAddonIds,
 *   });
 *
 * The hook is DEBOUNCED (600ms) — it only fires after the selection has
 * settled. Returns null diff while loading or on error (with isStale=true
 * so the previous diff remains visible while the new one loads).
 */

import { useEffect, useRef, useState } from "react";
import type {
  TravellerPriceDiff,
  TravellerDiffRequest,
  FulfillmentPriceRequest,
} from "@/lib/package-fulfillment-types";

const DEBOUNCE_MS = 600;

const PACKAGES_BASE =
  process.env.NEXT_PUBLIC_PACKAGES_API_BASE?.replace(/\/$/, "") ??
  "/api/packages";

async function fetchTravellerDiff(
  slug: string,
  payload: TravellerDiffRequest,
  signal: AbortSignal,
): Promise<TravellerPriceDiff> {
  const url = `${PACKAGES_BASE}/${encodeURIComponent(slug)}/traveller-price-diff`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    let msg = "Could not calculate price difference. Please try again.";
    try {
      const json = (await res.json()) as { message?: string };
      if (json.message) msg = json.message;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  const envelope = (await res.json()) as { data: TravellerPriceDiff };
  return envelope.data;
}

export type UseTravellerPriceDiffOptions = {
  slug: string;
  packageId: string;
  travelDate: string | null;
  /** The room selection BEFORE the guest made changes. */
  previousRooms: Array<{ adults: number; children: number }>;
  /** The room selection AFTER the guest made changes (current state). */
  currentRooms: Array<{ adults: number; children: number }>;
  selectedHotels: Array<{ option_id: string; room_type_id: string | null }>;
  selectedCabOptionId: string | null;
  selectedSightseeingIds: string[];
  selectedActivityLinkIds: string[];
  selectedAddonIds: string[];
  /**
   * Only fetch when both previousRooms and currentRooms are defined and
   * differ. Pass false to suppress the call (e.g. during initial load).
   */
  enabled?: boolean;
};

export type UseTravellerPriceDiffResult = {
  diff: TravellerPriceDiff | null;
  isLoading: boolean;
  isStale: boolean;
  errorMessage: string | null;
};

export function useTravellerPriceDiff(
  opts: UseTravellerPriceDiffOptions,
): UseTravellerPriceDiffResult {
  type State =
    | { status: "idle" }
    | { status: "loading"; prev: TravellerPriceDiff | null }
    | { status: "success"; data: TravellerPriceDiff }
    | { status: "error"; prev: TravellerPriceDiff | null; message: string };

  const [state, setState] = useState<State>({ status: "idle" });
  const stateRef = useRef<State>(state);
  stateRef.current = state;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fireRef = useRef(() => {
    const {
      slug, packageId, travelDate,
      previousRooms, currentRooms,
      selectedHotels, selectedCabOptionId,
      selectedSightseeingIds, selectedActivityLinkIds, selectedAddonIds,
      enabled = true,
    } = optsRef.current;

    if (!enabled || !slug || !packageId) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const s = stateRef.current;
    const prev =
      s.status === "success" ? s.data :
      s.status === "loading" || s.status === "error" ? s.prev : null;

    setState({ status: "loading", prev });

    const sharedSelections = {
      package_id: packageId,
      travel_date: travelDate,
      selected_hotels: selectedHotels,
      selected_cab_option_id: selectedCabOptionId,
      selected_sightseeing_ids: selectedSightseeingIds,
      selected_activity_link_ids: selectedActivityLinkIds,
      selected_addon_ids: selectedAddonIds,
    };

    const payload: TravellerDiffRequest = {
      before_request: { ...sharedSelections, rooms: previousRooms } as FulfillmentPriceRequest,
      after_request:  { ...sharedSelections, rooms: currentRooms  } as FulfillmentPriceRequest,
    };

    fetchTravellerDiff(slug, payload, controller.signal)
      .then((data) => setState({ status: "success", data }))
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setState({ status: "error", prev, message: err.message });
      });
  });

  const {
    slug, packageId, travelDate,
    previousRooms, currentRooms,
    selectedHotels, selectedCabOptionId,
    selectedSightseeingIds, selectedActivityLinkIds, selectedAddonIds,
    enabled = true,
  } = opts;

  const prevKey    = JSON.stringify(previousRooms);
  const curKey     = JSON.stringify(currentRooms);
  const hotelKey   = JSON.stringify(selectedHotels);
  const sightKey   = selectedSightseeingIds.join(",");
  const actKey     = selectedActivityLinkIds.join(",");
  const addonKey   = selectedAddonIds.join(",");

  // Only fire when the selection has actually changed
  const hasChanged = prevKey !== curKey;

  useEffect(() => {
    if (!enabled || !slug || !packageId || !hasChanged) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fireRef.current, DEBOUNCE_MS);
    return () => { if (timerRef.current !== null) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, packageId, travelDate, prevKey, curKey, hotelKey, selectedCabOptionId, sightKey, actKey, addonKey, enabled, hasChanged]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      controllerRef.current?.abort();
    };
  }, []);

  const current: TravellerPriceDiff | null =
    state.status === "success" ? state.data :
    state.status === "loading" || state.status === "error" ? state.prev : null;

  return {
    diff:         current,
    isLoading:    state.status === "loading",
    isStale:      state.status === "loading" || state.status === "error",
    errorMessage: state.status === "error" ? state.message : null,
  };
}