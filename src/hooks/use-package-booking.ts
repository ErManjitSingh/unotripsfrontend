"use client";

/**
 * src/hooks/use-package-booking.ts
 *
 * Production-grade package booking flow.
 *
 * v2 HARDENING:
 *   1. rooms sent as RoomConfig[] (not integer)
 *   2. selected_sightseeing_ids + selected_activity_link_ids included
 *   3. Free package handling (is_free flag → skip Razorpay modal)
 *   4. Verify-payment retry on network failure (3 attempts)
 *   5. Button disable during submission (phase-based)
 *   6. Payment recovery via localStorage on page reload
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  openRazorpayCheckout,
  getRazorpayKeyId,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay-checkout";
import { apiData } from "@/lib/api";
import type { RoomConfig } from "@/hooks/useRoomsConfig";

// ── Constants ─────────────────────────────────────────────────────────────────

const VERIFY_MAX_RETRIES = 3;
const VERIFY_RETRY_DELAY_MS = 2000;
const RECOVERY_KEY_PREFIX = "pkg_booking_";
const RECOVERY_EXPIRY_MS = 15 * 60 * 1000; // 15 min

// ── Request / Response types ──────────────────────────────────────────────────

export type PackageBookingPayload = {
  package_slug:               string;
  guest_name:                 string;
  guest_email:                string;
  guest_phone:                string;
  rooms:                      RoomConfig[];
  travel_date:                string | null;
  special_requests:           string | null;
  selected_hotel_option_ids:  string[];
  selected_cab_option_id:     string | null;
  selected_sightseeing_ids:   string[];
  selected_activity_link_ids: string[];
  selected_addon_ids:         string[];
  payment_type:               "token" | "full";
};

type OrderData = {
  booking_id:        string;
  booking_number:    string;
  razorpay_order_id: string;
  razorpay_key_id:   string;
  amount_paise:      number;
  currency:          string;
  total_amount:      number;
  token_amount:      number;
  balance_amount:    number;
  payment_type:      string;
  prefill_name:      string;
  prefill_email:     string;
  prefill_phone:     string;
  is_free?:          boolean;
};

export type PackageBookingResult = {
  booking_id:       string;
  booking_number:   string;
  status:           string;
  payment_type:     string;
  total_amount:     number;
  token_amount:     number;
  balance_amount:   number;
  balance_due_date?: string | null;
  message:          string;
};

type BookingState =
  | { phase: "idle" }
  | { phase: "loading";          message: string }
  | { phase: "awaiting_payment"; message: string }
  | { phase: "verifying";        message: string }
  | { phase: "success";          result: PackageBookingResult }
  | { phase: "error";            message: string };

// ── Recovery helpers ──────────────────────────────────────────────────────────

type RecoveryData = {
  booking_id:        string;
  razorpay_order_id: string;
  razorpay_key_id:   string;
  amount_paise:      number;
  currency:          string;
  prefill_name:      string;
  prefill_email:     string;
  prefill_phone:     string;
  payment_type:      string;
  total_amount:      number;
  token_amount:      number;
  created_at:        number;
};

function saveRecovery(slug: string, data: RecoveryData) {
  try {
    localStorage.setItem(RECOVERY_KEY_PREFIX + slug, JSON.stringify(data));
  } catch { /* localStorage unavailable — skip */ }
}

function loadRecovery(slug: string): RecoveryData | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY_PREFIX + slug);
    if (!raw) return null;
    const data: RecoveryData = JSON.parse(raw);
    // Expired?
    if (Date.now() - data.created_at > RECOVERY_EXPIRY_MS) {
      clearRecovery(slug);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearRecovery(slug: string) {
  try {
    localStorage.removeItem(RECOVERY_KEY_PREFIX + slug);
  } catch { /* skip */ }
}

// ── Retry helper ──────────────────────────────────────────────────────────────

async function retryFetch<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number,
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePackageBooking(slug: string) {
  const [state, setState] = useState<BookingState>({ phase: "idle" });
  const razorpayResponseRef = useRef<RazorpaySuccessResponse | null>(null);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  // ── Check for recoverable in-progress booking on mount ──────────────────
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  useEffect(() => {
    const data = loadRecovery(slug);
    if (data) setRecoveryData(data);
  }, [slug]);

  // ── Resume payment from recovery data ───────────────────────────────────
  const resumePayment = useCallback(async () => {
    if (!recoveryData) return;

    razorpayResponseRef.current = null;
    try {
      setState({ phase: "awaiting_payment", message: "Resuming payment…" });

      const payDesc =
        recoveryData.payment_type === "token"
          ? `Token payment (40%) — ₹${recoveryData.token_amount.toLocaleString("en-IN")}`
          : `Full payment — ₹${recoveryData.total_amount.toLocaleString("en-IN")}`;

      await openRazorpayCheckout({
        keyId:       recoveryData.razorpay_key_id || getRazorpayKeyId(),
        orderId:     recoveryData.razorpay_order_id,
        amountPaise: recoveryData.amount_paise,
        currency:    recoveryData.currency,
        name:        "UNO Trips",
        description: payDesc,
        prefill: {
          name:    recoveryData.prefill_name,
          email:   recoveryData.prefill_email,
          contact: recoveryData.prefill_phone,
        },
        onSuccess: (resp) => { razorpayResponseRef.current = resp; },
        onDismiss: () => {
          setState({
            phase: "error",
            message: "Payment cancelled. Your booking is saved — you can retry.",
          });
        },
      });

      const rp = razorpayResponseRef.current as RazorpaySuccessResponse | null;
      if (!rp) return;

      setState({ phase: "verifying", message: "Verifying payment…" });

      const verified = await retryFetch(
        () => apiData<PackageBookingResult>(
          `/v1/packages/${slug}/verify-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              booking_id:          recoveryData.booking_id,
              razorpay_order_id:   rp.razorpay_order_id,
              razorpay_payment_id: rp.razorpay_payment_id,
              razorpay_signature:  rp.razorpay_signature,
            }),
          },
        ),
        VERIFY_MAX_RETRIES,
        VERIFY_RETRY_DELAY_MS,
      );

      clearRecovery(slug);
      setRecoveryData(null);
      setState({ phase: "success", result: verified });
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Payment failed. Please try again.",
      });
    }
  }, [slug, recoveryData]);

  // ── Main booking flow ───────────────────────────────────────────────────
  const book = useCallback(
    async (payload: PackageBookingPayload) => {
      razorpayResponseRef.current = null;
      try {
        // ── Step 1: Create booking + Razorpay order ─────────────────────
        setState({ phase: "loading", message: "Creating your booking…" });

        const backendPayload = {
          package_slug:               payload.package_slug,
          guest_name:                 payload.guest_name,
          guest_email:                payload.guest_email,
          guest_phone:                payload.guest_phone,
          rooms:                      payload.rooms,
          travel_date:                payload.travel_date,
          special_requests:           payload.special_requests,
          selected_hotel_option_ids:  payload.selected_hotel_option_ids,
          selected_cab_option_id:     payload.selected_cab_option_id,
          selected_sightseeing_ids:   payload.selected_sightseeing_ids,
          selected_activity_link_ids: payload.selected_activity_link_ids,
          selected_addon_ids:         payload.selected_addon_ids,
          payment_type:               payload.payment_type,
        };

        const orderData = await apiData<OrderData>(
          `/v1/packages/${slug}/book`,
          {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(backendPayload),
          },
        );

        // ── Step 1b: Handle free packages ───────────────────────────────
        if (orderData.is_free) {
          clearRecovery(slug);
          setState({
            phase: "success",
            result: {
              booking_id:     orderData.booking_id,
              booking_number: orderData.booking_number,
              status:         "confirmed",
              payment_type:   "full",
              total_amount:   0,
              token_amount:   0,
              balance_amount: 0,
              message:        "🎉 Booking confirmed! Our team will reach you within 2 hours.",
            },
          });
          return;
        }

        // ── Save recovery data ──────────────────────────────────────────
        saveRecovery(slug, {
          booking_id:        orderData.booking_id,
          razorpay_order_id: orderData.razorpay_order_id,
          razorpay_key_id:   orderData.razorpay_key_id,
          amount_paise:      orderData.amount_paise,
          currency:          orderData.currency,
          prefill_name:      orderData.prefill_name,
          prefill_email:     orderData.prefill_email,
          prefill_phone:     orderData.prefill_phone,
          payment_type:      orderData.payment_type,
          total_amount:      orderData.total_amount,
          token_amount:      orderData.token_amount,
          created_at:        Date.now(),
        });

        // ── Step 2: Open Razorpay modal ─────────────────────────────────
        setState({ phase: "awaiting_payment", message: "Opening payment window…" });

        const paymentDesc =
          payload.payment_type === "token"
            ? `Token payment (40%) — ₹${orderData.token_amount.toLocaleString("en-IN")}`
            : `Full payment — ₹${orderData.total_amount.toLocaleString("en-IN")}`;

        await openRazorpayCheckout({
          keyId:       orderData.razorpay_key_id || getRazorpayKeyId(),
          orderId:     orderData.razorpay_order_id,
          amountPaise: orderData.amount_paise,
          currency:    orderData.currency,
          name:        "UNO Trips",
          description: paymentDesc,
          prefill: {
            name:    orderData.prefill_name,
            email:   orderData.prefill_email,
            contact: orderData.prefill_phone,
          },
          onSuccess: (resp) => { razorpayResponseRef.current = resp; },
          onDismiss: () => {
            setState({
              phase:   "error",
              message: "Payment cancelled. Your booking is saved — you can retry.",
            });
          },
        });

        const rp = razorpayResponseRef.current as RazorpaySuccessResponse | null;
        if (!rp) {
          setState({ phase: "error", message: "Payment was cancelled." });
          return;
        }

        // ── Step 3: Verify payment (with retry) ─────────────────────────
        setState({ phase: "verifying", message: "Verifying payment…" });

        const verified = await retryFetch(
          () => apiData<PackageBookingResult>(
            `/v1/packages/${slug}/verify-payment`,
            {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                booking_id:          orderData.booking_id,
                razorpay_order_id:   rp.razorpay_order_id,
                razorpay_payment_id: rp.razorpay_payment_id,
                razorpay_signature:  rp.razorpay_signature,
              }),
            },
          ),
          VERIFY_MAX_RETRIES,
          VERIFY_RETRY_DELAY_MS,
        );

        clearRecovery(slug);
        setState({ phase: "success", result: verified });
      } catch (err) {
        setState({
          phase:   "error",
          message: err instanceof Error ? err.message : "Payment failed. Please try again.",
        });
      }
    },
    [slug],
  );

  // ── Balance payment (token bookings only) ─────────────────────────────────

  const payBalance = useCallback(
    async (
      bookingId: string,
      prefill:   { name: string; email: string; phone: string },
    ) => {
      razorpayResponseRef.current = null;
      try {
        setState({ phase: "loading", message: "Preparing balance payment…" });

        const orderData = await apiData<{
          booking_id:        string;
          booking_number:    string;
          razorpay_order_id: string;
          razorpay_key_id:   string;
          amount_paise:      number;
          balance_amount:    number;
          currency:          string;
          prefill_name:      string;
          prefill_email:     string;
          prefill_phone:     string;
        }>("/v1/packages/balance-order", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ booking_id: bookingId }),
        });

        setState({ phase: "awaiting_payment", message: "Opening payment window…" });

        await openRazorpayCheckout({
          keyId:       orderData.razorpay_key_id || getRazorpayKeyId(),
          orderId:     orderData.razorpay_order_id,
          amountPaise: orderData.amount_paise,
          currency:    orderData.currency,
          name:        "UNO Trips",
          description: `Balance payment — ₹${orderData.balance_amount.toLocaleString("en-IN")}`,
          prefill: {
            name:    orderData.prefill_name || prefill.name,
            email:   orderData.prefill_email || prefill.email,
            contact: orderData.prefill_phone || prefill.phone,
          },
          onSuccess: (resp) => { razorpayResponseRef.current = resp; },
          onDismiss: () => {
            setState({ phase: "error", message: "Balance payment cancelled." });
          },
        });

        const rp = razorpayResponseRef.current as RazorpaySuccessResponse | null;
        if (!rp) return;

        setState({ phase: "verifying", message: "Verifying balance payment…" });

        const verified = await retryFetch(
          () => apiData<PackageBookingResult>(
            "/v1/packages/verify-balance",
            {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                booking_id:          bookingId,
                razorpay_order_id:   rp.razorpay_order_id,
                razorpay_payment_id: rp.razorpay_payment_id,
                razorpay_signature:  rp.razorpay_signature,
              }),
            },
          ),
          VERIFY_MAX_RETRIES,
          VERIFY_RETRY_DELAY_MS,
        );

        setState({ phase: "success", result: verified });
      } catch (err) {
        setState({
          phase:   "error",
          message: err instanceof Error ? err.message : "Balance payment failed.",
        });
      }
    },
    [],
  );

  return {
    state,
    book,
    payBalance,
    resumePayment,
    recoveryData,
    reset,
    isProcessing: state.phase !== "idle" && state.phase !== "error" && state.phase !== "success",
  };
}