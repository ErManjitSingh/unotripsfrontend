"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MapPin, Phone, Star } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import {
  cancelCabBooking,
  fetchCabBookingByConfNo,
  listMyCabReviews,
  submitCabReview,
  type CabBookingResponse,
} from "@/lib/cabs-booking-api";
import { trackOnce } from "@/lib/marketing-tracking";

function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function ConfirmationInner() {
  const params = useSearchParams();
  const conf = params.get("conf") || "";
  const requestId = params.get("request") || "";
  const auth = useAuthOptional();
  const [booking, setBooking] = useState<CabBookingResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewWorking, setReviewWorking] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!conf) {
      setError("Missing confirmation number.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchCabBookingByConfNo(conf)
      .then(async (item) => {
        if (cancelled) return;
        setBooking(item);
        const token = auth?.getAccessToken();
        if (token && item.status === "completed") {
          try {
            const mine = await listMyCabReviews(token);
            if (!cancelled && mine.some((row) => row.booking_id === item.id)) {
              setReviewSaved(true);
            }
          } catch {
            /* ignore */
          }
        }
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load booking.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conf, auth]);

  useEffect(() => {
    if (!booking || booking.status === "cancelled") return;
    trackOnce(`cab_booking_${booking.id}`, "cab_booking_completed", {
      transaction_id: booking.confirmation_number,
      value: booking.total_amount,
      currency: booking.currency,
      payment_option: booking.payment_option,
    });
  }, [booking]);

  const submitReview = async () => {
    const token = auth?.getAccessToken();
    if (!token || !booking) {
      setReviewError("Sign in to leave a review.");
      return;
    }
    setReviewWorking(true);
    setReviewError("");
    try {
      await submitCabReview(token, {
        booking_id: booking.id,
        rating,
        comment: comment.trim() || null,
      });
      setReviewSaved(true);
    } catch (reason) {
      setReviewError(reason instanceof Error ? reason.message : "Could not submit review.");
    } finally {
      setReviewWorking(false);
    }
  };

  const confirmCancel = async () => {
    const token = auth?.getAccessToken();
    if (!token || !booking) {
      setError("Sign in to cancel this booking.");
      return;
    }
    setCancelling(true);
    setError("");
    try {
      const next = await cancelCabBooking(token, booking.id, cancelReason.trim());
      setBooking(next);
      setShowCancel(false);
      setCancelReason("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  const isCancelled = booking?.status === "cancelled";

  return (
    <main className="min-h-screen bg-[#fbfaf9] px-4 py-10 text-[#292229]">
      <div className="mx-auto max-w-lg rounded-2xl border border-[#eee9e5] bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ef6614]">Step 4 of 4 · Done</p>
        <CheckCircle2 className={`mx-auto mt-3 h-12 w-12 ${isCancelled ? "text-slate-400" : "text-emerald-600"}`} />
        <h1 className="mt-4 text-2xl font-black tracking-tight">
          {isCancelled ? "Booking cancelled" : "Booking confirmed"}
        </h1>
        <p className="mt-2 text-sm text-[#746a73]">
          {error
            ? error
            : isCancelled
              ? booking?.cancellation_reason || "This trip has been cancelled."
              : booking?.payment_option === "commission_and_driver"
                ? "UNO fee received. Please pay the remaining balance directly to your cab driver."
                : booking?.payment_option === "direct_to_cab_owner"
                  ? "Your booking is confirmed. Please pay the full quoted fare directly to the cab owner or driver."
                : booking?.driver_name
                  ? "Payment received. Your driver details are below."
                  : "Payment received. Your partner will share final vehicle and driver details before pickup."}
        </p>

        {booking && (
          <div className="mt-6 rounded-xl border border-[#f0eeec] bg-[#fbfaf9] p-4 text-left text-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8b828a]">Confirmation</p>
            <p className="mt-1 text-lg font-black">{booking.confirmation_number}</p>
            <p className="mt-3 flex items-start gap-2 text-[#5f565e]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ef6614]" />
              <span>
                <strong className="block text-[#292229]">
                  {booking.pickup_city} → {booking.drop_city}
                </strong>
                {booking.cab_name} · {booking.travel_date}
              </span>
            </p>
            {booking.driver_name && !isCancelled && (
              <p className="mt-3 flex items-start gap-2 text-[#5f565e]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#ef6614]" />
                <span>
                  <strong className="block text-[#292229]">Captain contact protected</strong>
                  Our captain will call you before pickup.
                </span>
              </p>
            )}
            <div className="mt-3 rounded-lg bg-white p-3 text-sm">
              <div className="flex justify-between gap-3 font-extrabold text-[#292229]"><span>Total fare</span><span>{money(booking.total_amount, booking.currency)}</span></div>
              {booking.payment_option === "commission_and_driver" ? <><div className="mt-2 flex justify-between gap-3 text-emerald-700"><span>Paid to UNO</span><span>{money(booking.online_amount || 0, booking.currency)}</span></div><div className="mt-1 flex justify-between gap-3 font-bold text-[#292229]"><span>Pay driver directly</span><span>{money(booking.driver_due_amount || 0, booking.currency)}</span></div></> : booking.payment_option === "direct_to_cab_owner" ? <div className="mt-2 flex justify-between gap-3 font-bold text-[#ef6614]"><span>Pay cab owner directly</span><span>{money(booking.driver_due_amount || booking.total_amount, booking.currency)}</span></div> : <div className="mt-2 flex justify-between gap-3 text-emerald-700"><span>{isCancelled ? "Fare was" : "Paid online"}</span><span>{money(booking.online_amount ?? booking.total_amount, booking.currency)}</span></div>}
            </div>
            <p className="mt-1 text-xs capitalize text-[#746a73]">
              Status: {booking.status} · Payment: {booking.payment_status}
              {booking.refund_status && booking.refund_status !== "not_applicable"
                ? ` · Refund: ${booking.refund_status}`
                : ""}
            </p>
            {(booking.guest_email_masked || booking.guest_phone_masked) && (
              <p className="mt-2 text-[11px] text-[#8b828a]">
                Guest {booking.guest_email_masked}
                {booking.guest_phone_masked ? ` · ${booking.guest_phone_masked}` : ""}
              </p>
            )}
          </div>
        )}

        {booking && !isCancelled && (
          <section className="mt-5 rounded-xl border border-orange-100 bg-[#fffaf7] p-4 text-left">
            <h2 className="text-sm font-extrabold text-[#292229]">What happens next</h2>
            <ol className="mt-3 space-y-2.5 text-xs leading-5 text-[#5f565e]">
              <li className="flex gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ef6614] text-[10px] font-black text-white">1</span>
                <span>Save this confirmation number — you may need it for support.</span>
              </li>
              <li className="flex gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ef6614] text-[10px] font-black text-white">2</span>
                <span>Your partner will share final vehicle and driver details before pickup. The captain usually calls you.</span>
              </li>
              <li className="flex gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ef6614] text-[10px] font-black text-white">3</span>
                <span>
                  {booking.payment_option === "direct_to_cab_owner" || booking.payment_option === "commission_and_driver"
                    ? "Keep cash/UPI ready for any amount due to the driver at pickup."
                    : "You’re paid online — no fare due at pickup unless extras were agreed."}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ef6614] text-[10px] font-black text-white">4</span>
                <span>Need help? Call support from My quotes or the UNO Cabs help line.</span>
              </li>
            </ol>
          </section>
        )}

        {booking?.status === "confirmed" && (
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="mt-4 text-xs font-extrabold text-red-600 underline-offset-2 hover:underline"
          >
            Cancel this booking
          </button>
        )}

        {booking?.status === "completed" && (
          <div className="mt-5 rounded-xl border border-[#f0eeec] bg-white p-4 text-left">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#ef6614]" />
              <h2 className="text-sm font-extrabold">Rate this trip</h2>
            </div>
            {reviewSaved ? (
              <p className="mt-2 text-sm text-emerald-700">Thanks — your review was submitted.</p>
            ) : (
              <>
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-black ${
                        rating >= value ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the ride?"
                  className="mt-3 w-full rounded-lg border border-[#eee9e5] px-3 py-2 text-sm"
                />
                {reviewError && <p className="mt-2 text-xs font-semibold text-red-600">{reviewError}</p>}
                <button
                  type="button"
                  disabled={reviewWorking}
                  onClick={() => void submitReview()}
                  className="mt-3 rounded-xl bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
                >
                  {reviewWorking ? "Submitting…" : "Submit review"}
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {requestId && (
            <Link
              href={`/cabs/quotes?request=${requestId}`}
              className="rounded-xl border border-[#eee9e5] px-4 py-2.5 text-xs font-extrabold text-[#514954]"
            >
              View request
            </Link>
          )}
          <Link
            href="/cabs"
            className="rounded-xl bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white"
          >
            Back to UnoCabs
          </Link>
        </div>
      </div>

      {showCancel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-left shadow-xl">
            <h3 className="text-lg font-black">Cancel booking?</h3>
            <p className="mt-1 text-sm text-slate-500">
              Refunds follow UnoCabs season policy (free / partial / none based on hours before pickup).
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Why are you cancelling?"
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600"
              >
                Keep booking
              </button>
              <button
                type="button"
                disabled={cancelling || cancelReason.trim().length < 5}
                onClick={() => void confirmCancel()}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Confirm cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CabQuoteBookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[50vh] place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      }
    >
      <ConfirmationInner />
    </Suspense>
  );
}
