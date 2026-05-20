"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CircleCheck, Loader2, Star } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  HotelBookingPaymentStep,
  type PaymentMethod,
} from "@/components/hotels/hotel-booking-payment-step";
import { HotelTagBadgeList } from "@/components/hotels/hotel-tag-badge";
import { formatHotelDateFromIso } from "@/components/hotels/hotels-search-fields";
import { useAuthOptional } from "@/contexts/auth-context";
import type { HotelDetailBundle } from "@/lib/hotels-api";
import { upsertCachedBooking } from "@/lib/booking-cache-storage";
import { createHotelBooking, type BookingWithOrder } from "@/lib/hotels-bookings-api";
import {
  hotelBookingNights,
  hotelDetailHref,
  hotelListingKey,
  resolveBookingSelectionFromBundle,
} from "@/lib/hotels-catalog";
import {
  savePendingCheckout,
} from "@/lib/pending-checkout-storage";
import { cn, formatInrAmount } from "@/lib/utils";

const PROMO_OFFERS = [
  { id: "FLASHDEALS", label: "FLASHDEALS", save: 468, applied: true },
  { id: "EMTHOTELS", label: "EMTHOTELS", save: 320, applied: false },
  { id: "EMTSALE", label: "EMTSALE", save: 250, applied: false },
  { id: "CRAB20", label: "CRAB20", save: 200, applied: false },
] as const;

type BookingStep = "travellers" | "payment" | "confirmed";

type HotelTravellersViewProps = {
  pathSlug: string;
  hotelId: string;
  bundle: HotelDetailBundle;
};

export function HotelTravellersView({ pathSlug, hotelId, bundle }: HotelTravellersViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuthOptional();

  const roomTypeId = searchParams.get("roomType") ?? "";
  const ratePlanId = searchParams.get("rate") ?? "";
  const checkInIso = searchParams.get("check_in") ?? "";
  const checkOutIso = searchParams.get("check_out") ?? "";
  const rooms = useMemo(() => {
    const n = Number.parseInt(searchParams.get("rooms") ?? "1", 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [searchParams]);
  const guests = useMemo(() => {
    const n = Number.parseInt(searchParams.get("guests") ?? "2", 10);
    return Number.isFinite(n) && n > 0 ? n : 2;
  }, [searchParams]);

  const selection = useMemo(
    () => resolveBookingSelectionFromBundle(bundle, roomTypeId, ratePlanId),
    [bundle, roomTypeId, ratePlanId],
  );

  const nights = useMemo(
    () => hotelBookingNights(checkInIso, checkOutIso),
    [checkInIso, checkOutIso],
  );
  const checkInLabel = formatHotelDateFromIso(checkInIso);
  const checkOutLabel = formatHotelDateFromIso(checkOutIso);

  const [step, setStep] = useState<BookingStep>("travellers");
  const [promoId, setPromoId] = useState<string>("FLASHDEALS");
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [donation, setDonation] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [apiBookingId, setApiBookingId] = useState<string | null>(
    () => searchParams.get("booking_id"),
  );
  const [continuing, setContinuing] = useState(false);
  const resumePayment = searchParams.get("resume") === "1";

  const bookReturnUrl = useMemo(() => {
    const q = searchParams.toString();
    return `/hotel/${pathSlug}/${encodeURIComponent(hotelId)}/book${q ? `?${q}` : ""}`;
  }, [searchParams, pathSlug, hotelId]);

  useEffect(() => {
    if (resumePayment && apiBookingId) {
      setStep("payment");
    }
  }, [resumePayment, apiBookingId]);

  useEffect(() => {
    if (auth?.user?.email && !email) setEmail(auth.user.email);
    if (auth?.user?.name && !firstName) {
      const parts = auth.user.name.trim().split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
    }
    if (auth?.user?.phone && !mobile) {
      setMobile(auth.user.phone.replace(/\D/g, "").slice(-10));
    }
  }, [auth?.user, email, firstName, mobile]);

  const persistPendingCheckout = useCallback(
    (bookingId?: string) => {
      if (!selection) return;
      const { city, hotel, roomType, ratePlan } = selection;
      const nightCount = hotelBookingNights(checkInIso, checkOutIso);
      const promoOffer = PROMO_OFFERS.find((p) => p.id === promoId) ?? PROMO_OFFERS[0];
      const roomTotal = ratePlan.price * nightCount * rooms;
      const afterDiscount = Math.max(0, roomTotal - promoOffer.save);
      const taxTotal = ratePlan.taxes * nightCount * rooms;
      const total = afterDiscount + taxTotal + (donation ?? 0);

      savePendingCheckout({
        bookingId,
        userId: auth?.user?.id,
        guestEmail: email.trim(),
        hotelId: hotel.id,
        hotelSlug: hotelListingKey(hotel),
        hotelName: hotel.name,
        hotelCity: city.name,
        hotelThumbnail: hotel.images[0],
        citySlug: city.slug,
        roomTypeId: roomType.id,
        ratePlanId: ratePlan.id,
        checkIn: checkInIso,
        checkOut: checkOutIso,
        rooms,
        guests,
        adults: guests,
        totalAmount: total,
        currency: "INR",
      });
    },
    [
      selection,
      promoId,
      auth?.user?.id,
      email,
      checkInIso,
      checkOutIso,
      rooms,
      guests,
      donation,
    ],
  );

  if (!selection) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] p-8 text-center">
        <p className="font-semibold text-[#212121]">No rooms available for booking.</p>
        <Link
          href={hotelDetailHref(bundle.city.slug, hotelListingKey(bundle.hotel))}
          className="mt-3 inline-block text-[#2196F3] hover:underline"
        >
          Back to hotel
        </Link>
      </main>
    );
  }

  const { city, hotel, roomType, ratePlan } = selection;
  const detailHref = hotelDetailHref(city.slug, hotelListingKey(hotel));
  const changeRoomHref = `${detailHref}?check_in=${encodeURIComponent(checkInIso)}&check_out=${encodeURIComponent(checkOutIso)}&rooms=${rooms}&guests=${guests}#hotel-tabs`;

  const promo = PROMO_OFFERS.find((p) => p.id === promoId) ?? PROMO_OFFERS[0];
  const roomTotal = ratePlan.price * nights * rooms;
  const discount = promo.save;
  const afterDiscount = Math.max(0, roomTotal - discount);
  const taxes = ratePlan.taxes * nights * rooms;
  const donationAmt = donation ?? 0;
  const grandTotal = afterDiscount + taxes + donationAmt;

  const guestFullName = `${title} ${firstName} ${lastName}`.trim();

  const validateTravellers = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setFormError("Please enter guest first and last name.");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      setFormError("Please enter a valid mobile number.");
      return false;
    }
    if (!agreed) {
      setFormError("Please accept the terms and conditions.");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleContinueBooking = async () => {
    if (!validateTravellers()) return;

    if (!auth?.isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(bookReturnUrl)}`);
      return;
    }

    setContinuing(true);
    setFormError(null);

    try {
      const token = auth.getAccessToken();
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(bookReturnUrl)}`);
        return;
      }

      if (!checkInIso || !checkOutIso) {
        setFormError("Please select valid check-in and check-out dates.");
        setContinuing(false);
        return;
      }

      const created: BookingWithOrder = await createHotelBooking(token, {
        hotel_id: hotel.id,
        room_type_id: roomType.id,
        check_in: checkInIso,
        check_out: checkOutIso,
        adults: guests,
        children: 0,
        rooms,
        guest: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: mobile.replace(/\D/g, "").slice(-10),
          country_code: "+91",
        },
      });

      if (auth.user?.id) {
        upsertCachedBooking(auth.user.id, created);
      }

      setApiBookingId(created.id);
      setBookingRef(created.confirmation_number);
      persistPendingCheckout(created.id);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save your booking. Please try again.";
      setFormError(message);
      persistPendingCheckout();
    } finally {
      setContinuing(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setFormError(null);
    await new Promise((r) => setTimeout(r, 1200));

    const ref = bookingRef || `UNO-${Date.now().toString(36).toUpperCase()}`;
    setBookingRef(ref);
    if (apiBookingId && auth?.user?.id) {
      // Demo pay — keep pending in account until Razorpay verify is wired.
      persistPendingCheckout(apiBookingId);
      upsertCachedBooking(auth.user.id, {
        id: apiBookingId,
        confirmation_number: ref,
        status: "pending",
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        hotel_city: city.name,
        hotel_thumbnail: hotel.images[0] ?? "",
        room_type_id: roomType.id,
        room_name: roomType.name,
        check_in: checkInIso,
        check_out: checkOutIso,
        nights,
        adults: guests,
        children: 0,
        rooms,
        total_amount: grandTotal,
        currency: "INR",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setProcessing(false);
    setStep("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inclusions = ratePlan.benefits.filter((b) => /breakfast|wifi|wi-fi/i.test(b));
  const cancellation = ratePlan.nonRefundable
    ? "Non-Refundable Booking"
    : "Free cancellation available on this rate";

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <Navbar variant="ease" easeActiveNavId="hotels" />

        <div className="border-b border-[#e0e0e0] bg-white">
          <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-3 py-4 sm:px-4 lg:px-6">
            <div
              className={cn(
                "flex items-center gap-2 text-[13px]",
                step === "travellers" ? "font-bold text-[#212121]" : "text-[#9E9E9E]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  step === "travellers" || step === "payment" || step === "confirmed"
                    ? "bg-[#212121] text-white"
                    : "border border-[#e0e0e0]",
                )}
              >
                {step === "confirmed" ? <Check className="h-4 w-4" /> : "1"}
              </span>
              <span>Review and Travelers</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 text-[13px]",
                step === "payment" ? "font-bold text-[#212121]" : "text-[#9E9E9E]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  step === "payment" || step === "confirmed"
                    ? "bg-[#212121] text-white"
                    : "border border-[#e0e0e0]",
                )}
              >
                {step === "confirmed" ? <Check className="h-4 w-4" /> : "2"}
              </span>
              <span>Payment</span>
            </div>
            {step === "confirmed" ? (
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#2E7D32]">
                <CircleCheck className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                <span>Confirmed</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-3 py-5 sm:px-4 lg:px-6">
          {step === "confirmed" ? (
            <section className="mx-auto max-w-2xl rounded-xl border border-[#c8e6c9] bg-white p-8 text-center shadow-sm">
              <CircleCheck className="mx-auto h-16 w-16 text-[#2E7D32]" strokeWidth={1.5} aria-hidden />
              <h1 className="mt-4 text-2xl font-bold text-[#212121]">Booking Confirmed!</h1>
              <p className="mt-2 text-[14px] text-[#616161]">
                Your reservation at <strong>{hotel.name}</strong> is confirmed.
              </p>
              <p className="mt-4 rounded-lg bg-[#f5f5f5] px-4 py-3 text-sm">
                Booking ID: <span className="font-bold text-[#212121]">{bookingRef}</span>
              </p>
              <dl className="mt-4 space-y-2 text-left text-[13px]">
                <div className="flex justify-between border-b border-[#eee] pb-2">
                  <dt className="text-[#757575]">Room</dt>
                  <dd className="font-semibold">{roomType.name}</dd>
                </div>
                <div className="flex justify-between border-b border-[#eee] pb-2">
                  <dt className="text-[#757575]">Check-In</dt>
                  <dd className="font-semibold">{checkInLabel.main || "—"}</dd>
                </div>
                <div className="flex justify-between border-b border-[#eee] pb-2">
                  <dt className="text-[#757575]">Check-Out</dt>
                  <dd className="font-semibold">{checkOutLabel.main || "—"}</dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt className="text-[#757575]">Amount Paid</dt>
                  <dd className="text-lg font-bold">₹ {formatInrAmount(grandTotal)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px] text-[#757575]">
                Confirmation sent to {email}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/hotels"
                  className="rounded-md bg-[#EF6614] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#E65100]"
                >
                  Book More Hotels
                </Link>
                <Link
                  href={detailHref}
                  className="rounded-md border border-[#e0e0e0] bg-white px-6 py-2.5 text-sm font-semibold text-[#424242] hover:bg-[#fafafa]"
                >
                  View Hotel
                </Link>
              </div>
            </section>
          ) : step === "payment" ? (
            <>
              {apiBookingId ? (
                <div className="mb-4 rounded-xl border border-[#FFE082] bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] px-4 py-3 text-[13px] text-[#E65100]">
                  <strong>Payment pending.</strong> Complete payment below to confirm your stay at{" "}
                  {hotel.name}. If you leave without paying, this booking will appear in your account
                  as incomplete.
                </div>
              ) : null}
            <HotelBookingPaymentStep
              selection={selection}
              nights={nights}
              rooms={rooms}
              guests={guests}
              grandTotal={grandTotal}
              guestName={guestFullName}
              email={email}
              mobile={mobile}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              cardNumber={cardNumber}
              onCardNumberChange={setCardNumber}
              cardExpiry={cardExpiry}
              onCardExpiryChange={setCardExpiry}
              cardCvv={cardCvv}
              onCardCvvChange={setCardCvv}
              upiId={upiId}
              onUpiIdChange={setUpiId}
              processing={processing}
              onBack={() => setStep("travellers")}
              onPay={() => void handlePay()}
            />
            </>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
              <div className="space-y-4">
                <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-lg font-bold sm:text-xl">{hotel.name}</h1>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                          ))}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-[#616161]">
                        {hotel.area}, {city.name}
                      </p>
                    </div>
                    <Link href={detailHref} className="text-[12px] font-semibold text-[#2196F3] hover:underline">
                      Change Hotel
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-3 text-[12px] sm:grid-cols-4">
                    {[
                      { label: "Check-In", value: checkInLabel.main || "Select date", sub: checkInLabel.sub },
                      { label: "Check-Out", value: checkOutLabel.main || "Select date", sub: checkOutLabel.sub },
                      { label: "Guests", value: `${guests} Adult${guests !== 1 ? "s" : ""}` },
                      {
                        label: "Rooms",
                        value: `${rooms} Room${rooms !== 1 ? "s" : ""} | ${nights} Night${nights !== 1 ? "s" : ""}`,
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[#9E9E9E]">{item.label}</p>
                        <p className="mt-0.5 font-semibold text-[#212121]">{item.value}</p>
                        {"sub" in item && item.sub ? (
                          <p className="text-[11px] text-[#757575]">{item.sub}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-[#eee] pt-4 sm:flex-row">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      <Image
                        src={roomType.image}
                        alt={roomType.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#757575]">
                            Selected Room
                          </p>
                          <p className="mt-0.5 text-[14px] font-bold text-[#212121]">{roomType.name}</p>
                          <p className="mt-1 text-[12px] text-[#616161]">{ratePlan.packageName}</p>
                        </div>
                        <Link
                          href={changeRoomHref}
                          className="text-[12px] font-semibold text-[#2196F3] hover:underline"
                        >
                          Change Room
                        </Link>
                      </div>
                      <HotelTagBadgeList tags={roomType.tags} className="mt-2" />
                      {inclusions.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {inclusions.map((inc) => (
                            <li key={inc} className="flex items-center gap-1.5 text-[12px] text-[#2E7D32]">
                              <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <p className="mt-2 text-[12px] font-medium text-[#c62828]">{cancellation}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm sm:p-5">
                  <h2 className="text-base font-bold">Guest Details</h2>
                  <p className="mt-1 text-[12px] text-[#757575]">Adult 1</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[100px_1fr_1fr]">
                    <label className="block">
                      <span className="text-[11px] text-[#757575]">Title</span>
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-2 text-[13px] outline-none focus:border-[#2196F3]"
                      >
                        <option>Mr</option>
                        <option>Ms</option>
                        <option>Mrs</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-[#757575]">First Name</span>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-[#757575]">Last Name</span>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                      />
                    </label>
                  </div>

                  <h3 className="mt-5 text-sm font-bold">Contact Details</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] text-[#757575]">Email Address</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 h-10 w-full rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] text-[#757575]">Mobile Number</span>
                      <div className="mt-1 flex gap-2">
                        <select className="h-10 w-20 shrink-0 rounded border border-[#e0e0e0] px-2 text-[13px]">
                          <option>+91</option>
                        </select>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          className="h-10 min-w-0 flex-1 rounded border border-[#e0e0e0] px-3 text-[13px] outline-none focus:border-[#2196F3]"
                        />
                      </div>
                    </label>
                  </div>
                </section>

                <section className="rounded-lg border border-[#c8e6c9] bg-[#e8f5e9] p-4">
                  <p className="text-[13px] font-bold text-[#2E7D32]">
                    Help us preserve India&apos;s Heritage &amp; Green Spaces!
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonation(donation === amt ? null : amt)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-[12px] font-semibold transition",
                          donation === amt
                            ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                            : "border-[#a5d6a7] bg-white text-[#2E7D32]",
                        )}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </section>

                {formError ? (
                  <p className="rounded-md border border-[#FFCDD2] bg-[#FFEBEE] px-3 py-2 text-[12px] font-medium text-[#C62828]">
                    {formError}
                  </p>
                ) : null}

                <label className="flex cursor-pointer items-start gap-2 text-[12px] leading-relaxed text-[#616161]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#EF6614]"
                  />
                  I understand and agree to the rules of this fare, the Terms &amp; Conditions and Privacy
                  Policy.
                </label>

                {!auth?.isAuthenticated ? (
                  <p className="rounded-lg border border-[#BBDEFB] bg-[#E3F2FD] px-3 py-2.5 text-[12px] text-[#1565C0]">
                    Please{" "}
                    <Link
                      href={`/login?redirect=${encodeURIComponent(bookReturnUrl)}`}
                      className="font-bold underline"
                    >
                      login
                    </Link>{" "}
                    or{" "}
                    <Link href="/signup" className="font-bold underline">
                      sign up
                    </Link>{" "}
                    to continue — unpaid checkouts will be saved to your account.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleContinueBooking()}
                  disabled={continuing}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#EF6614] py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#E65100] disabled:opacity-70 sm:max-w-md"
                >
                  {continuing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving booking…
                    </>
                  ) : (
                    "Continue to payment"
                  )}
                </button>
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-[#212121]">
                    Room Price Details
                  </h2>
                  <dl className="mt-3 space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">
                        {rooms} Room{rooms !== 1 ? "s" : ""} × {nights} Night{nights !== 1 ? "s" : ""}
                      </dt>
                      <dd className="font-medium">₹ {formatInrAmount(roomTotal)}</dd>
                    </div>
                    <div className="flex justify-between text-[#2E7D32]">
                      <dt>Total Discount</dt>
                      <dd className="font-medium">- ₹ {formatInrAmount(discount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">Price After Discount</dt>
                      <dd className="font-medium">₹ {formatInrAmount(afterDiscount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#616161]">Taxes &amp; Fees</dt>
                      <dd className="font-medium">₹ {formatInrAmount(taxes)}</dd>
                    </div>
                    {donationAmt > 0 ? (
                      <div className="flex justify-between">
                        <dt className="text-[#616161]">Donation</dt>
                        <dd className="font-medium">₹ {formatInrAmount(donationAmt)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="mt-3 flex justify-between border-t border-[#eee] pt-3">
                    <span className="text-base font-bold">Grand Total</span>
                    <span className="text-lg font-bold">₹ {formatInrAmount(grandTotal)}</span>
                  </div>
                </section>

                <section className="rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-bold">Offers &amp; Promo Codes</h2>
                  {promoId === "FLASHDEALS" ? (
                    <p className="mt-2 flex items-center gap-1 rounded bg-[#e8f5e9] px-2 py-1.5 text-[12px] font-medium text-[#2E7D32]">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      FLASHDEALS applied successfully!
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {PROMO_OFFERS.map((offer) => (
                      <li key={offer.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded border border-[#eee] p-2.5 hover:border-[#2196F3]/30">
                          <input
                            type="radio"
                            name="promo"
                            checked={promoId === offer.id}
                            onChange={() => setPromoId(offer.id)}
                            className="accent-[#EF6614]"
                          />
                          <span className="text-[12px] font-semibold text-[#212121]">{offer.label}</span>
                          <span className="ml-auto text-[11px] text-[#2E7D32]">
                            Save ₹{formatInrAmount(offer.save)}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
