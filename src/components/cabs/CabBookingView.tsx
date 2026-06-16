"use client";

/**
 * src/components/cabs/CabBookingView.tsx  (v2 — MMT-style)
 * ─────────────────────────────────────────────────────────────────────────────
 * "Review Booking" layout matching MakeMyTrip's cab booking page:
 *
 * LEFT COLUMN:
 *   1. Route card (pickup → drop, date, trip type)
 *   2. Cab info card (name, category, seats, AC, free cancellation)
 *   3. Inclusions (km included, tolls, driver allowance)
 *   4. Traveller Details (pickup location, name, email, phone)
 *
 * RIGHT SIDEBAR (sticky):
 *   1. Payment options: Part Pay / Full Pay toggle
 *   2. Fare Breakdown (collapsible)
 *   3. PAY NOW button
 *
 * Auth: BookingAuthModal, sessionStorage draft, 15-min countdown.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  Shield,
  Users,
  Utensils,
} from "lucide-react";
import { BookingAuthModal } from "@/components/hotels/booking-auth-modal";
import { useAuthOptional } from "@/contexts/auth-context";
import type { CabDetail, CabBookingResponse } from "@/lib/cabs-booking-api";
import { createCabBooking, verifyCabBookingPayment } from "@/lib/cabs-booking-api";
import type { CabFareBreakdown } from "@/lib/cabs-api";
import { formatCabDate } from "@/lib/cabs-api";
import { getRazorpayKeyId, openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { siteWhatsAppChatUrl, siteTelHref } from "@/lib/site-contact";
import { cn, formatInrAmount } from "@/lib/utils";

// ─── Hold countdown ──────────────────────────────────────────────────────────
const HOLD_MINUTES = 15;
function holdRemaining(createdAt: string): number {
  const t = new Date(createdAt).getTime();
  return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((t + HOLD_MINUTES * 60_000 - Date.now()) / 1000));
}
function fmtTimer(sec: number): string {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

// ─── SessionStorage draft ────────────────────────────────────────────────────
type Draft = {
  firstName: string; lastName: string; email: string; mobile: string;
  title: string; pickupAddr: string; dropAddr: string;
  specialInstr: string; flightTrain: string; agreed: boolean;
};
function loadDraft(k: string): Draft | null {
  if (typeof window === "undefined") return null;
  try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveDraft(k: string, d: Draft) {
  try { sessionStorage.setItem(k, JSON.stringify(d)); } catch {}
}
function clearDraft(k: string) {
  try { sessionStorage.removeItem(k); } catch {}
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = "review" | "confirmed";
type PayMode = "part" | "full";

type Props = { cab: CabDetail; fare: CabFareBreakdown };

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CabBookingView({ cab, fare }: Props) {
  const sp   = useSearchParams();
  const auth = useAuthOptional();

  const pickupCity = sp.get("pickup_city") ?? "";
  const dropCity   = sp.get("drop_city") ?? "";
  const dropState  = sp.get("drop_state") ?? "";
  const tripType   = sp.get("trip_type") ?? "one_way";
  const travelDate = sp.get("travel_date") ?? "";
  const returnDate = sp.get("return_date") ?? "";
  const passengers = Number(sp.get("passengers") ?? 1);
  const travelLabel = formatCabDate(travelDate);

  // ── Draft ──────────────────────────────────────────────────────────────────
  const draftKey = useMemo(() => `uno_cab_${cab.id}_${travelDate}`, [cab.id, travelDate]);
  const [draft] = useState(() => loadDraft(draftKey));

  // ── Form ───────────────────────────────────────────────────────────────────
  const [step, setStep]           = useState<Step>("review");
  const [title, setTitle]         = useState(draft?.title ?? "Mr");
  const [firstName, setFirstName] = useState(draft?.firstName ?? "");
  const [lastName, setLastName]   = useState(draft?.lastName ?? "");
  const [email, setEmail]         = useState(draft?.email ?? "");
  const [mobile, setMobile]       = useState(draft?.mobile ?? "");
  const [pickupAddr, setPickupAddr] = useState(draft?.pickupAddr ?? "");
  const [dropAddr, setDropAddr]   = useState(draft?.dropAddr ?? "");
  const [specialInstr, setSpecialInstr] = useState(draft?.specialInstr ?? "");
  const [flightTrain, setFlightTrain] = useState(draft?.flightTrain ?? "");
  const [agreed, setAgreed]       = useState(draft?.agreed ?? false);
  const [formError, setFormError] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);

  // ── Payment ────────────────────────────────────────────────────────────────
  const [payMode, setPayMode]     = useState<PayMode>("part");
  const [fareOpen, setFareOpen]   = useState(false);
  const [booking, setBooking]     = useState<CabBookingResponse | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fullAmount = booking?.total_amount ?? fare.total_amount;
  const partAmount = Math.round(fullAmount * 0.25); // 25% upfront
  const payAmount  = payMode === "part" ? partAmount : fullAmount;

  // ── Countdown ──────────────────────────────────────────────────────────────
  const [holdSec, setHoldSec] = useState<number | null>(null);
  const holdExpired = holdSec === 0;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!booking?.created_at || step === "confirmed") { setHoldSec(null); return; }
    const tick = () => {
      const r = holdRemaining(booking.created_at);
      setHoldSec(r);
      if (r <= 0 && timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [booking?.created_at, step]);

  useEffect(() => { if (step === "confirmed") clearDraft(draftKey); }, [step, draftKey]);

  // ── Draft save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step === "confirmed") return;
    saveDraft(draftKey, { firstName, lastName, email, mobile, title, pickupAddr, dropAddr, specialInstr, flightTrain, agreed });
  }, [draftKey, step, firstName, lastName, email, mobile, title, pickupAddr, dropAddr, specialInstr, flightTrain, agreed]);

  // ── Auth prefill ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth?.user) return;
    if (auth.user.email && !email) setEmail(auth.user.email);
    if (auth.user.name && !firstName) {
      const p = auth.user.name.trim().split(/\s+/);
      setFirstName(p[0] ?? ""); setLastName(p.slice(1).join(" "));
    }
    if (auth.user.phone && !mobile) {
      const d = auth.user.phone.replace(/\D/g, "").slice(-10);
      if (d && !/^0+$/.test(d)) setMobile(d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) { setFormError("Please enter your name."); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFormError("Enter a valid email."); return false; }
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) { setFormError("Enter a valid phone number."); return false; }
    if (!pickupAddr.trim()) { setFormError("Enter a pickup address."); return false; }
    if (!dropAddr.trim()) { setFormError("Enter a drop address."); return false; }
    if (!agreed) { setFormError("Please accept the terms."); return false; }
    setFormError(null); return true;
  };

  // ── Create booking + Razorpay ──────────────────────────────────────────────
  const handlePayNow = async () => {
    if (!validate()) return;
    if (!auth?.isAuthenticated) { setAuthModalOpen(true); return; }

    setContinuing(true);
    setFormError(null);

    try {
      const created = await createCabBooking({
        cab_type_id: cab.id, trip_type: tripType, travel_date: travelDate,
        return_date: returnDate || null,
        pickup_address: pickupAddr.trim(), pickup_city: pickupCity,
        pickup_state: dropState, drop_address: dropAddr.trim(),
        drop_city: dropCity, drop_state: dropState, pickup_time: null,
        guest_first_name: firstName.trim(), guest_last_name: lastName.trim(),
        guest_email: email.trim(), guest_phone: mobile.replace(/\D/g, "").slice(-10),
        guest_country_code: "+91", passengers,
        special_instructions: specialInstr.trim() || null,
        flight_train_number: flightTrain.trim() || null,
        booking_source: "website",
      });

      setBooking(created);
      setBookingRef(created.confirmation_number);

      const keyId   = created.razorpay_key_id ?? getRazorpayKeyId();
      const orderId = created.razorpay_order_id;
      if (!keyId || !orderId) { setFormError("Payment gateway unavailable."); setContinuing(false); return; }

      const amountPaise = Math.round(payAmount * 100);

      await openRazorpayCheckout({
        keyId, orderId, amountPaise, currency: "INR",
        name: "UNO Trips — Cab Booking",
        description: payMode === "part"
          ? `Part payment (25%) — ₹${formatInrAmount(partAmount)}`
          : `Full payment — ₹${formatInrAmount(fullAmount)}`,
        prefill: {
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(), contact: mobile.replace(/\D/g, "").slice(-10),
        },
        onSuccess: async (response) => {
          try {
            await verifyCabBookingPayment(created.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStep("confirmed");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch { setFormError("Payment verification failed. Contact support if deducted."); }
        },
        onDismiss: () => setFormError("Payment cancelled. Click PAY NOW to retry."),
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Booking failed. Try again.");
    } finally { setContinuing(false); }
  };

  // ── Retry payment (booking exists, unpaid) ─────────────────────────────────
  const handleRetryPayment = async () => {
    if (!booking?.razorpay_order_id) return;
    const keyId = booking.razorpay_key_id ?? getRazorpayKeyId();
    if (!keyId) { setFormError("Payment gateway unavailable."); return; }
    setContinuing(true); setFormError(null);
    try {
      await openRazorpayCheckout({
        keyId, orderId: booking.razorpay_order_id,
        amountPaise: Math.round(payAmount * 100), currency: "INR",
        name: "UNO Trips", description: `${cab.name} · ${pickupCity} → ${dropCity}`,
        prefill: { name: `${firstName} ${lastName}`.trim(), email: email.trim(), contact: mobile.replace(/\D/g, "").slice(-10) },
        onSuccess: async (r) => {
          try {
            await verifyCabBookingPayment(booking.id, { razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature });
            setStep("confirmed"); window.scrollTo({ top: 0, behavior: "smooth" });
          } catch { setFormError("Verification failed."); }
        },
        onDismiss: () => setFormError("Payment cancelled."),
      });
    } catch { setFormError("Could not open payment."); } finally { setContinuing(false); }
  };

  const handleRetryBooking = useCallback(() => {
    setBooking(null); setBookingRef(""); setFormError(null); setHoldSec(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMED
  // ═══════════════════════════════════════════════════════════════════════════

  if (step === "confirmed") {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-3 py-8 sm:px-4 lg:px-6">
        <section className="mx-auto max-w-2xl rounded-xl border border-[#c8e6c9] bg-white p-8 text-center shadow-sm">
          <CircleCheck className="mx-auto h-16 w-16 text-[#2E7D32]" strokeWidth={1.5} />
          <h1 className="mt-4 text-2xl font-bold text-[#212121]">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-[#616161]">
            Your <strong>{cab.name}</strong> from {pickupCity} to {dropCity} is confirmed.
          </p>
          <p className="mt-4 rounded-lg bg-[#F5F5F5] px-4 py-3 text-sm">
            Booking ID: <span className="font-bold">{bookingRef}</span>
          </p>
          <dl className="mt-4 space-y-2 text-left text-[13px]">
            <div className="flex justify-between border-b border-[#EEE] pb-2">
              <dt className="text-[#757575]">Route</dt><dd className="font-semibold">{pickupCity} → {dropCity}</dd>
            </div>
            <div className="flex justify-between border-b border-[#EEE] pb-2">
              <dt className="text-[#757575]">Date</dt><dd className="font-semibold">{travelLabel.main}</dd>
            </div>
            <div className="flex justify-between pt-1">
              <dt className="text-[#757575]">Amount Paid</dt>
              <dd className="text-lg font-bold">₹{formatInrAmount(payAmount)}</dd>
            </div>
            {payMode === "part" && (
              <div className="flex justify-between text-[#757575]">
                <dt>Remaining (pay to driver)</dt>
                <dd className="font-semibold text-[#424242]">₹{formatInrAmount(fullAmount - partAmount)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-[#757575]">Confirmation sent to {email}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/cabs" className="rounded-md bg-[#EF6614] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#E65100]">
              Book More Cabs
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REVIEW BOOKING
  // ═══════════════════════════════════════════════════════════════════════════

  const tripLabel = tripType === "round_trip" ? "Outstation Round Trip"
    : tripType === "full_day" ? "Full Day Rental"
    : "Outstation One Way Trip";

  return (
    <>
      {/* Page header */}
      <div className="border-b border-[#E0E0E0] bg-[#1a2332]">
        <div className="mx-auto w-full max-w-[1320px] px-3 py-4 sm:px-4 lg:px-6">
          <h1 className="text-lg font-bold text-white sm:text-xl">Review Booking</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-4 lg:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:gap-6">

          {/* ═════════════ LEFT COLUMN ═════════════ */}
          <div className="space-y-4">

            {/* 1. Route card */}
            <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#757575]">{tripLabel}</p>
              <div className="mt-3 flex items-center gap-4">
                <div>
                  <p className="text-[15px] font-bold text-[#212121]">{pickupCity}</p>
                  <p className="text-[11px] text-[#757575]">{pickupCity}, {dropState}</p>
                </div>
                <div className="flex items-center gap-1 text-[#9E9E9E]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9E9E9E]" />
                  <span className="h-px w-8 bg-[#BDBDBD]" />
                  <span className="h-px w-8 bg-[#BDBDBD] opacity-50" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#212121]" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#212121]">{dropCity}</p>
                  <p className="text-[11px] text-[#757575]">{dropCity}, {dropState}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#616161]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{travelLabel.main}, {travelLabel.sub}</span>
              </div>
            </section>

            {/* 2. Cab info */}
            <section className="rounded-xl border border-[#E0E0E0] bg-white shadow-sm">
              <div className="flex items-start gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-[#212121]">{cab.name}</h2>
                    <span className="text-[12px] text-[#757575]">or similar</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#616161]">
                    {cab.cab_category.toUpperCase()} • {cab.is_ac ? "AC" : "Non-AC"} • {cab.seating_capacity} Seats
                  </p>
                </div>
                {cab.featured_image && (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F0F4FF]">
                    <img src={cab.featured_image} alt="" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
              {/* Free cancellation strip */}
              <div className="flex items-center gap-2 border-t border-[#FFF3E0] bg-[#FFF8E1] px-5 py-2.5 text-[12px] font-medium text-[#E65100]">
                <Clock className="h-3.5 w-3.5" />
                Free cancellation till <strong className="ml-0.5">24 hours before</strong> departure
              </div>
            </section>

            {/* 3. Inclusions */}
            <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#757575]">Inclusions</p>
              <div className="mt-3 divide-y divide-[#F0F0F0]">
                <div className="flex items-start gap-3 py-3">
                  <Route className="mt-0.5 h-5 w-5 shrink-0 text-[#4CAF50]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] font-bold text-[#212121]">{fare.actual_km} Km included</p>
                    <p className="text-[11px] text-[#757575]">₹{fare.per_km_selling}/km will apply beyond the included kms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#4CAF50]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] font-bold text-[#212121]">Toll, tax and other charges</p>
                    <p className="text-[11px] text-[#757575]">Toll, State Tax, Parking charges are included</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-3">
                  <Utensils className="mt-0.5 h-5 w-5 shrink-0 text-[#4CAF50]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] font-bold text-[#212121]">Driver allowance</p>
                    <p className="text-[11px] text-[#757575]">Driver food and accommodation(stay) charges are included</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Traveller Details */}
            <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#212121]">Traveller Details</h2>

              <p className="mt-4 text-[12px] font-bold text-[#424242]">Pickup Details</p>
              <input value={pickupAddr} onChange={(e) => setPickupAddr(e.target.value)}
                placeholder="ENTER PICKUP LOCATION"
                className="mt-2 h-11 w-full rounded-lg border border-[#E0E0E0] px-4 text-[13px] uppercase placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />

              <input value={dropAddr} onChange={(e) => setDropAddr(e.target.value)}
                placeholder="ENTER DROP LOCATION"
                className="mt-3 h-11 w-full rounded-lg border border-[#E0E0E0] px-4 text-[13px] uppercase placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />

              <p className="mt-5 text-[12px] font-bold text-[#424242]">Traveller Contact Details</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <input value={`${firstName} ${lastName}`.trim()} onChange={(e) => {
                    const parts = e.target.value.split(/\s+/);
                    setFirstName(parts[0] ?? ""); setLastName(parts.slice(1).join(" "));
                  }}
                    placeholder="FULL NAME"
                    className="h-11 w-full rounded-lg border border-[#E0E0E0] px-4 text-[13px] uppercase placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />
                </div>
                <select value={title} onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-lg border border-[#E0E0E0] px-4 text-[13px] outline-none focus:border-[#EF6614]">
                  <option value="Mr">Male</option><option value="Ms">Female</option><option value="Mrs">Other</option>
                </select>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL"
                  className="h-11 w-full rounded-lg border border-[#E0E0E0] px-4 text-[13px] uppercase placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />
                <div className="flex gap-2">
                  <select className="h-11 w-20 shrink-0 rounded-lg border border-[#E0E0E0] px-2 text-[13px]"><option>+91</option></select>
                  <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                    placeholder="MOBILE NUMBER"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-[#E0E0E0] px-4 text-[13px] uppercase placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />
                </div>
              </div>
              <input value={flightTrain} onChange={(e) => setFlightTrain(e.target.value)}
                placeholder="FLIGHT / TRAIN NUMBER (OPTIONAL)"
                className="mt-3 h-11 w-full rounded-lg border border-[#E0E0E0] px-4 text-[13px] uppercase placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />
              <textarea value={specialInstr} onChange={(e) => setSpecialInstr(e.target.value)} rows={2}
                placeholder="Special instructions (optional)"
                className="mt-3 w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-[13px] placeholder:text-[#BDBDBD] outline-none focus:border-[#EF6614]" />

              {/* T&C */}
              <label className="mt-4 flex cursor-pointer items-start gap-2 text-[12px] leading-relaxed text-[#616161]">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#EF6614]" />
                I agree to the Terms &amp; Conditions and Privacy Policy.
              </label>
            </section>

            {formError && (
              <p className="rounded-md border border-[#FFCDD2] bg-[#FFEBEE] px-3 py-2 text-[12px] font-medium text-[#C62828]">{formError}</p>
            )}

            {/* Support */}
            <div className="rounded-xl border border-dashed border-[#FDBA74] bg-orange-50/50 p-4">
              <p className="text-[13px] font-bold text-[#1a1a1a]">Need help?</p>
              <div className="mt-2 flex gap-2 justify-center">
                <a href={siteWhatsAppChatUrl(`Cab booking: ${cab.name} ${pickupCity}→${dropCity}`)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href={siteTelHref()} className="inline-flex items-center gap-1 rounded-lg border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs font-bold text-[#424242]">
                  <Phone className="h-3.5 w-3.5" /> Call us
                </a>
              </div>
            </div>
          </div>

          {/* ═════════════ RIGHT SIDEBAR ═════════════ */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">

            {/* Payment options */}
            <div className="rounded-xl border border-[#E0E0E0] bg-white shadow-sm">
              <div className="border-b border-[#EEE] px-4 py-3">
                <p className="text-[14px] font-bold text-[#212121]">Payment Options</p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {/* Part Pay */}
                <label className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition",
                  payMode === "part" ? "border-[#EF6614] bg-[#FFF8F0]" : "border-[#E0E0E0]",
                )}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="payMode" checked={payMode === "part"} onChange={() => setPayMode("part")}
                      className="h-4 w-4 accent-[#EF6614]" />
                    <div>
                      <p className="text-[13px] font-bold text-[#212121]">Part Pay</p>
                      <p className="text-[11px] text-[#757575]">Pay rest to the driver</p>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-[#212121]">₹{formatInrAmount(partAmount)}</span>
                </label>

                {/* Full Pay */}
                <label className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition",
                  payMode === "full" ? "border-[#EF6614] bg-[#FFF8F0]" : "border-[#E0E0E0]",
                )}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="payMode" checked={payMode === "full"} onChange={() => setPayMode("full")}
                      className="h-4 w-4 accent-[#EF6614]" />
                    <div>
                      <p className="text-[13px] font-bold text-[#212121]">Full Pay</p>
                      <p className="text-[11px] text-[#757575]">Full amount</p>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-[#212121]">₹{formatInrAmount(fullAmount)}</span>
                </label>
              </div>

              {/* Countdown */}
              {holdSec != null && !holdExpired && (
                <div className={cn(
                  "mx-4 mb-3 flex items-center justify-center gap-2 rounded-lg py-1.5 text-[12px] font-bold",
                  holdSec <= 120 ? "bg-[#FFEBEE] text-[#C62828]" : "bg-[#FFF8E1] text-[#E65100]",
                )}>
                  ⏱ Complete in {fmtTimer(holdSec)}
                </div>
              )}

              {/* PAY NOW */}
              <div className="px-4 pb-4">
                {holdExpired ? (
                  <button type="button" onClick={handleRetryBooking}
                    className="flex w-full items-center justify-center rounded-lg bg-[#C62828] py-3 text-[14px] font-bold text-white hover:bg-[#B71C1C]">
                    Session Expired — Retry
                  </button>
                ) : booking && booking.payment_status !== "paid" ? (
                  <button type="button" onClick={() => void handleRetryPayment()} disabled={continuing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF6614] py-3 text-[14px] font-bold text-white hover:bg-[#E65100] disabled:opacity-70">
                    {continuing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : "PAY NOW"}
                  </button>
                ) : (
                  <button type="button" onClick={() => void handlePayNow()} disabled={continuing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF6614] py-3 text-[14px] font-bold text-white hover:bg-[#E65100] disabled:opacity-70">
                    {continuing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                      : !auth?.isAuthenticated ? "LOGIN & PAY" : "PAY NOW"}
                  </button>
                )}
              </div>

              {/* Fare breakdown toggle */}
              <div className="border-t border-[#EEE]">
                <button type="button" onClick={() => setFareOpen(!fareOpen)}
                  className="flex w-full items-center justify-center gap-1 py-2.5 text-[13px] font-bold text-[#EF6614]">
                  {fareOpen ? "Hide" : "Show"} Fare Break up
                  {fareOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {fareOpen && (
                  <div className="space-y-2 border-t border-[#F0F0F0] px-4 py-3 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-[#616161]">Base Fare</span>
                      <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.trip_fare)}</span>
                    </div>
                    {fare.driver_allowance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#616161]">Driver Allowance</span>
                        <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.driver_allowance)}</span>
                      </div>
                    )}
                    {fare.night_charge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#616161]">Night Charge</span>
                        <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.night_charge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#616161]">Taxes &amp; Fees</span>
                      <span className="font-medium text-[#212121]">₹{formatInrAmount(fare.gst_amount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#EEE] pt-2">
                      <span className="font-bold text-[#212121]">Total</span>
                      <span className="font-bold text-[#212121]">₹{formatInrAmount(fullAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <BookingAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => { setAuthModalOpen(false); void handlePayNow(); }}
        prefill={{ name: `${firstName} ${lastName}`.trim(), email: email.trim(), phone: mobile.replace(/\D/g, "").slice(-10) }}
      />
    </>
  );
}