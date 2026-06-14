"use client";

/**
 * src/hooks/use-package-booking.ts
 *
 * Complete package booking flow hook.
 * Fixed: razorpayResponse uses useRef so TypeScript doesn't infer it as never.
 * Fixed: PackageBookingPayload uses rooms: RoomConfig[] (new multi-room shape).
 */

import { useState, useCallback, useRef } from "react";
import {
  openRazorpayCheckout,
  getRazorpayKeyId,
  type RazorpaySuccessResponse,
} from "@/lib/razorpay-checkout";
import { apiData } from "@/lib/api";
import type { RoomConfig } from "@/hooks/useRoomsConfig";

// ── Request / Response types ──────────────────────────────────────────────────

export type PackageBookingPayload = {
  package_slug:               string;
  guest_name:                 string;
  guest_email:                string;
  guest_phone:                string;
  // Updated: room-wise config replaces flat adults/children/rooms
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

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePackageBooking(slug: string) {
  const [state, setState] = useState<BookingState>({ phase: "idle" });

  // useRef fixes the TypeScript "type never" issue.
  // When a let variable is assigned inside a callback, TS can infer it as never
  // because it can't track mutations across closure boundaries.
  // Using a ref ensures the type is always RazorpaySuccessResponse | null.
  const razorpayResponseRef = useRef<RazorpaySuccessResponse | null>(null);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  const book = useCallback(
    async (payload: PackageBookingPayload) => {
      razorpayResponseRef.current = null;
      try {
        // ── Step 1: Create booking + Razorpay order ───────────────────────────
        setState({ phase: "loading", message: "Creating your booking…" });

        // Map frontend RoomConfig[] to what backend schema expects:
        //   adults   = total adults across all rooms
        //   children = total children across all rooms
        //   rooms    = number of rooms (integer)
        const totalAdults   = payload.rooms.reduce((s, r) => s + r.adults,   0);
        const totalChildren = payload.rooms.reduce((s, r) => s + r.children, 0);
        const totalRooms    = payload.rooms.length;

        const backendPayload = {
          package_slug:             payload.package_slug,
          guest_name:               payload.guest_name,
          guest_email:              payload.guest_email,
          guest_phone:              payload.guest_phone,
          adults:                   totalAdults,
          children:                 totalChildren,
          rooms:                    totalRooms,
          travel_date:              payload.travel_date,
          special_requests:         payload.special_requests,
          selected_hotel_option_ids: payload.selected_hotel_option_ids,
          selected_cab_option_id:    payload.selected_cab_option_id,
          selected_addon_ids:        payload.selected_addon_ids,
          payment_type:              payload.payment_type,
          // sightseeing + activity selections sent but ignored if backend doesn't support yet
        };

        const orderData = await apiData<{
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
        }>(`/v1/packages/${slug}/book`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(backendPayload),
        });

        // ── Step 2: Open Razorpay modal ───────────────────────────────────────
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
          onSuccess: (resp) => {
            // Store in ref — avoids the TypeScript "never" inference issue
            razorpayResponseRef.current = resp;
          },
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

        // ── Step 3: Verify payment ────────────────────────────────────────────
        setState({ phase: "verifying", message: "Verifying payment…" });

        const verified = await apiData<PackageBookingResult>(
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
        );

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
          onSuccess: (resp) => {
            razorpayResponseRef.current = resp;
          },
          onDismiss: () => {
            setState({ phase: "error", message: "Balance payment cancelled." });
          },
        });

        const rp = razorpayResponseRef.current as RazorpaySuccessResponse | null;
        if (!rp) return;

        setState({ phase: "verifying", message: "Verifying balance payment…" });

        const verified = await apiData<PackageBookingResult>(
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

  return { state, book, payBalance, reset };
}