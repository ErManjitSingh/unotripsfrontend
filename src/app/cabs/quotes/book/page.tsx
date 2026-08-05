"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuthOptional } from "@/contexts/auth-context";
import { BookingAuthModal } from "@/components/hotels/booking-auth-modal";
import { TravelMobileTopShell } from "@/components/home/HeroSection";
import {
  createBookingFromQuote,
  getCabTripRequest,
  type CabQuote,
  type CabTripRequest,
} from "@/lib/cab-quote-api";
import { verifyCabBookingPayment } from "@/lib/cabs-booking-api";
import { getRazorpayKeyId, openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { trackEvent, trackOnce } from "@/lib/marketing-tracking";

function money(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function dateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function QuoteBookInner() {
  const auth = useAuthOptional();
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params.get("request") || "";
  const quoteId = params.get("quote") || "";

  const [request, setRequest] = useState<CabTripRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showOtherPayments, setShowOtherPayments] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"full_online" | "commission_and_driver" | "direct_to_cab_owner">("full_online");

  const quote: CabQuote | null = useMemo(() => {
    if (!request || !quoteId) return null;
    return request.quotes.find((q) => q.id === quoteId) ?? null;
  }, [request, quoteId]);
  const commissionAmount = quote?.commission_payment_amount ?? null;
  const driverBalance = quote?.driver_due_amount ?? null;
  const commissionPercent = quote?.commission_percent ?? null;

  const payLabel = paying
    ? "Confirming booking…"
    : paymentOption === "commission_and_driver" && commissionAmount !== null
      ? `Pay UNO advance · ${money(commissionAmount, quote?.currency)}`
      : paymentOption === "direct_to_cab_owner"
        ? "Confirm — pay cab owner directly"
        : `Pay now · ${money(quote?.total_amount || 0, quote?.currency)}`;

  useEffect(() => {
    if (!request || !quote) return;
    trackOnce(`cab_checkout_${request.id}_${quote.id}`, "cab_checkout_started", {
      request_id: request.id,
      quote_id: quote.id,
      value: quote.total_amount,
      currency: quote.currency,
    });
  }, [request, quote]);

  useEffect(() => {
    if (!auth || auth.isLoading) return;
    if (!auth.getAccessToken()) {
      setLoading(false);
      setAuthModalOpen(true);
      return;
    }
    if (!requestId || !quoteId) {
      setError("Missing request or quote.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCabTripRequest(auth.getAccessToken()!, requestId)
      .then((item) => {
        if (cancelled) return;
        setRequest(item);
        setPassengers(item.passengers || 1);
        const name = auth.user?.name?.trim() || "";
        if (name) {
          const parts = name.split(/\s+/);
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
        }
        if (auth.user?.email) setEmail(auth.user.email);
        if (auth.user?.phone) setPhone(auth.user.phone.replace(/\D/g, "").slice(-10));
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
  }, [auth, requestId, quoteId]);

  const pay = async (event?: FormEvent) => {
    event?.preventDefault();
    const token = auth?.getAccessToken();
    if (!token || !request || !quote) {
      setAuthModalOpen(true);
      return;
    }
    if (!agreed) {
      setError("Please accept the terms to continue.");
      return;
    }
    if (quote.status !== "accepted" || request.status !== "accepted") {
      setError("Select this quote on the compare page before paying.");
      return;
    }

    setPaying(true);
    setError("");
    try {
      trackEvent("cab_payment_option_selected", {
        request_id: request.id,
        quote_id: quote.id,
        payment_option: paymentOption,
        value: paymentOption === "commission_and_driver" ? quote.commission_payment_amount || 0 : quote.total_amount,
        currency: quote.currency,
      });
      const created = await createBookingFromQuote(token, request.id, quote.id, {
        guest_first_name: firstName.trim(),
        guest_last_name: lastName.trim() || ".",
        guest_email: email.trim(),
        guest_phone: phone.replace(/\D/g, "").slice(-10),
        guest_country_code: "+91",
        passengers,
        special_instructions: notes.trim() || null,
        payment_option: paymentOption,
      });

      const amountPaise = Math.round(created.online_amount * 100);
      const finish = async (orderId: string, paymentId: string, signature: string) => {
        await verifyCabBookingPayment(created.booking_id || created.id, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });
        router.push(
          `/cabs/quotes/book/confirmation?conf=${encodeURIComponent(created.confirmation_number)}&request=${request.id}`,
        );
      };

      if (created.is_direct_payment) {
        router.push(
          `/cabs/quotes/book/confirmation?conf=${encodeURIComponent(created.confirmation_number)}&request=${request.id}`,
        );
        return;
      }

      if (created.is_mock_order || created.razorpay_order_id.startsWith("order_mock_")) {
        await finish(created.razorpay_order_id, `pay_mock_${Date.now()}`, "mock_signature");
        return;
      }

      const keyId = created.razorpay_key_id || getRazorpayKeyId();
      if (!keyId) {
        setError("Payment gateway is not configured. Enable mock payments in development or set Razorpay keys.");
        return;
      }

      await openRazorpayCheckout({
        keyId,
        orderId: created.razorpay_order_id,
        amountPaise,
        currency: created.currency || "INR",
        name: "UNO Cabs",
        description: `${request.pickup_city} → ${request.drop_city} · ${quote.business_name || quote.partner_name}`,
        prefill: {
          name: `${firstName} ${lastName}`.trim(),
          email: email.trim(),
          contact: phone.replace(/\D/g, "").slice(-10),
        },
        onSuccess: (response) => finish(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature),
        onDismiss: () => setError("Payment cancelled. You can try again."),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start payment.");
    } finally {
      setPaying(false);
    }
  };

  if (!auth?.isAuthenticated && !auth?.isLoading) {
    return (
      <main className="min-h-screen bg-[#fbfaf9]">
        <TravelMobileTopShell activeId="cabs" showGreeting={false} compact />
        <div className="grid min-h-[50vh] place-items-center px-4">
          <section className="max-w-md rounded-3xl border border-orange-100 bg-white p-7 text-center shadow-xl">
            <h1 className="text-2xl font-black">Sign in to book</h1>
            <p className="mt-2 text-sm text-slate-600">Your selected quote is saved. Sign in to confirm traveller details and pay.</p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="mt-5 inline-flex rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-bold text-white"
            >
              Sign in to continue
            </button>
            {requestId && quoteId && (
              <Link
                href={`/cabs/quotes?request=${requestId}`}
                className="mt-3 block text-sm font-semibold text-[#746a73]"
              >
                Back to quotes
              </Link>
            )}
          </section>
        </div>
        <BookingAuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
          title="Sign in to book & pay"
          subtitle="Your quote selection is saved on this page."
          footerNote="Sign in or sign up to complete booking."
        />
      </main>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
      </div>
    );
  }

  if (!request || !quote) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-slate-600">{error || "Quote not found."}</p>
        <Link href="/cabs/quotes" className="mt-4 inline-flex text-sm font-extrabold text-[#ef6614]">
          Back to quotes
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf9] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-[#292229] md:pb-0">
      <TravelMobileTopShell activeId="cabs" showGreeting={false} compact />
      <header className="hidden border-b border-[#eee9e5] bg-white md:block">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href={`/cabs/quotes?request=${request.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#514954]">
            <ArrowLeft className="h-4 w-4" /> Quotes
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-[#eee9e5] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#ef6614]">Step 3 of 4 · Book</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Traveller details</h1>
          <p className="mt-1 text-sm text-[#746a73]">
            Confirm who is travelling, then pay the partner quote securely.
          </p>

          <form id="cab-quote-pay-form" onSubmit={(e) => void pay(e)} className="mt-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#746a73]">
                First name
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" />
              </label>
              <label className="text-xs font-bold text-[#746a73]">
                Last name
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" />
              </label>
              <label className="text-xs font-bold text-[#746a73]">
                Email
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" />
              </label>
              <label className="text-xs font-bold text-[#746a73]">
                Phone
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" placeholder="10-digit mobile" />
              </label>
              <label className="text-xs font-bold text-[#746a73]">
                Passengers
                <input required type="number" min={1} max={50} value={passengers} onChange={(e) => setPassengers(Number(e.target.value) || 1)} className="mt-1 w-full rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]" />
              </label>
            </div>
            <label className="block text-xs font-bold text-[#746a73]">
              Special instructions (optional)
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-[#eee9e5] px-3 py-2.5 text-sm outline-none focus:border-[#ef6614]" placeholder="Flight number, landmark, etc." />
            </label>

            <fieldset className="rounded-2xl border border-[#eee9e5] bg-[#fffaf6] p-3">
              <legend className="px-1 text-xs font-extrabold text-[#514954]">Payment</legend>
              <label className="mt-1 flex cursor-pointer gap-3 rounded-xl border border-[#ef6614] bg-white p-3">
                <input type="radio" name="payment-option" checked={paymentOption === "full_online"} onChange={() => setPaymentOption("full_online")} className="mt-1 accent-[#ef6614]" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-extrabold text-[#292229]">
                    <span>Pay full fare online</span>
                    <span>{money(quote.total_amount, quote.currency)}</span>
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-[#746a73]">
                    Recommended · Secure Razorpay checkout · UNO settles the partner after the trip.
                  </span>
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowOtherPayments((open) => !open)}
                className="mt-2 flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-xs font-extrabold text-[#746a73]"
              >
                Other payment options
                <ChevronDown className={`h-4 w-4 transition ${showOtherPayments ? "rotate-180" : ""}`} />
              </button>

              {showOtherPayments && (
                <>
                  {commissionAmount !== null && driverBalance !== null && commissionAmount > 0 && (
                    <label className="mt-1 flex cursor-pointer gap-3 rounded-xl border border-[#e9dccf] bg-white p-3">
                      <input type="radio" name="payment-option" checked={paymentOption === "commission_and_driver"} onChange={() => setPaymentOption("commission_and_driver")} className="mt-1 accent-[#ef6614]" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2 text-sm font-extrabold text-[#292229]">
                          <span>Pay UNO advance{commissionPercent ? ` (${commissionPercent}%)` : ""}</span>
                          <span>{money(commissionAmount, quote.currency)}</span>
                        </span>
                        <span className="mt-1 block text-xs font-medium leading-5 text-[#746a73]">
                          Pay the remaining <strong className="text-[#292229]">{money(driverBalance, quote.currency)}</strong> to the cab owner or driver later.
                        </span>
                      </span>
                    </label>
                  )}
                  <label className="mt-2 flex cursor-pointer gap-3 rounded-xl border border-[#e9dccf] bg-white p-3">
                    <input type="radio" name="payment-option" checked={paymentOption === "direct_to_cab_owner"} onChange={() => setPaymentOption("direct_to_cab_owner")} className="mt-1 accent-[#ef6614]" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 text-sm font-extrabold text-[#292229]">
                        <span>Pay cab owner directly</span>
                        <span>{money(quote.total_amount, quote.currency)}</span>
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-5 text-[#746a73]">
                        No payment to UNO now. Pay the full quoted fare to the owner or driver.
                      </span>
                    </span>
                  </label>
                </>
              )}
            </fieldset>

            <label className="flex items-start gap-2 text-xs text-[#5f565e]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#ef6614]" />
              I agree to UnoCabs booking terms and understand the fare is as quoted by the partner.
            </label>

            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={paying}
              className="hidden w-full items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60 md:inline-flex"
            >
              <CreditCard className="h-4 w-4" />
              {payLabel}
            </button>
            <p className="hidden items-center justify-center gap-1.5 text-[11px] text-[#8b828a] md:flex">
              <LockKeyhole className="h-3.5 w-3.5" />
              Secured by Razorpay · UPI, cards, netbanking
            </p>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#eee9e5] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black">Trip summary</h2>
            <p className="mt-2 text-lg font-black">
              {request.pickup_city} → {request.drop_city}
            </p>
            <dl className="mt-3 space-y-2 text-xs text-[#5f565e]">
              <div className="flex justify-between gap-3">
                <dt>Pickup</dt>
                <dd className="text-right font-semibold text-[#292229]">{dateTime(request.pickup_at)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Trip type</dt>
                <dd className="capitalize font-semibold text-[#292229]">{request.trip_type.replaceAll("_", " ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Request</dt>
                <dd className="font-semibold text-[#292229]">{request.request_number}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-black text-[#292229]">{quote.business_name || quote.partner_name}</h2>
            </div>
            <p className="mt-1 text-xs text-[#5f565e]">
              {quote.cab_name || "Partner vehicle"}
              {quote.driver_name ? ` · ${quote.driver_name}` : ""}
            </p>
            <p className="mt-3 text-2xl font-black text-[#292229]">{money(quote.total_amount, quote.currency)}</p>
            <p className="text-[11px] text-[#746a73]">Total fare · as quoted · taxes included</p>
            {paymentOption === "full_online" && (
              <p className="mt-2 text-[11px] font-semibold text-emerald-700">Full fare will be settled to the cab owner after the trip.</p>
            )}
            {paymentOption === "direct_to_cab_owner" && (
              <p className="mt-2 text-[11px] font-semibold text-[#ef6614]">Pay {money(quote.total_amount, quote.currency)} directly to the cab owner or driver. No UNO payment is collected.</p>
            )}
            {paymentOption === "commission_and_driver" && commissionAmount !== null && driverBalance !== null && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-white/80 p-3 text-xs"><div className="flex justify-between gap-3 font-bold text-[#292229]"><span>Pay UNO now</span><span>{money(commissionAmount, quote.currency)}</span></div><div className="mt-1 flex justify-between gap-3 text-[#5f565e]"><span>Pay driver later</span><span>{money(driverBalance, quote.currency)}</span></div></div>
            )}
            {quote.inclusions.length > 0 && (
              <p className="mt-3 text-[11px] text-[#5f565e]">Includes: {quote.inclusions.join(", ")}</p>
            )}
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="truncate font-semibold text-[#514953]">{quote.business_name || quote.partner_name}</span>
          <strong className="shrink-0 text-base font-black">{money(quote.total_amount, quote.currency)}</strong>
        </div>
        <button
          type="button"
          disabled={paying}
          onClick={() => {
            const form = document.getElementById("cab-quote-pay-form") as HTMLFormElement | null;
            form?.requestSubmit();
          }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ef6614] text-sm font-extrabold text-white disabled:opacity-60"
        >
          <CreditCard className="h-4 w-4" />
          {payLabel}
        </button>
      </div>

      <BookingAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        title="Sign in to book & pay"
        subtitle="Your quote selection is saved on this page."
        footerNote="Sign in or sign up to complete booking."
      />
    </main>
  );
}

export default function CabQuoteBookPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[50vh] place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      }
    >
      <QuoteBookInner />
    </Suspense>
  );
}
