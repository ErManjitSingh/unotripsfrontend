"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CircleCheck, Edit2, Loader2, MessageCircle, Minus, Phone, Plus, Star, X } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  HotelBookingPaymentStep,
} from "@/components/hotels/hotel-booking-payment-step";
import { CheckoutGuestAuthPanel } from "@/components/hotels/checkout-guest-auth-panel";
import { BookingAuthModal } from "@/components/hotels/booking-auth-modal";
import { HotelTagBadgeList } from "@/components/hotels/hotel-tag-badge";
import { formatHotelDateFromIso } from "@/components/hotels/hotels-search-fields";
import { useAuthOptional } from "@/contexts/auth-context";
import type { HotelDetailBundle } from "@/lib/hotels-api";
import { upsertCachedBooking } from "@/lib/booking-cache-storage";
import { createHotelBooking, fetchHotelBookingById, isConfirmedBookingStatus, verifyHotelBookingPayment, type BookingWithOrder } from "@/lib/hotels-bookings-api";
import {
  hotelBookingNights,
  hotelDetailHref,
  hotelListingKey,
  resolveBookingSelectionFromBundle,
  type HotelRoomRatePlan,
} from "@/lib/hotels-catalog";
import { getRazorpayKeyId, openRazorpayCheckout } from "@/lib/razorpay-checkout";
import {
  savePendingCheckout,
} from "@/lib/pending-checkout-storage";
import { siteWhatsAppChatUrl, siteTelHref } from "@/lib/site-contact";
import { cn, formatInrAmount } from "@/lib/utils";

function mealPlanPayloadFromRatePlan(ratePlan: HotelRoomRatePlan) {
  const suffix = ratePlan.id.split("-").pop() ?? "ep";
  return {
    meal_plan: suffix,
    meal_plan_label: ratePlan.packageName,
    meal_plan_price: ratePlan.mealAddOn,
  };
}

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
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [donation, setDonation] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [apiBooking, setApiBooking] = useState<BookingWithOrder | null>(null);
  const [apiBookingId, setApiBookingId] = useState<string | null>(
    () => searchParams.get("booking_id"),
  );
  const [continuing, setContinuing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Editable order summary state
  const [localNights, setLocalNights]   = useState<number | null>(null);
  const [localAdults, setLocalAdults]   = useState<number | null>(null);
  const [localChildren, setLocalChildren] = useState(0);
  const [editingCheckIn, setEditingCheckIn]   = useState(false);
  const [editingCheckOut, setEditingCheckOut] = useState(false);
  const [localCheckIn,  setLocalCheckIn]  = useState(checkInIso);
  const [localCheckOut, setLocalCheckOut] = useState(checkOutIso);

  const displayNights = localNights ?? nights;
  const displayAdults = localAdults ?? guests;
  const resumePayment = searchParams.get("resume") === "1";

  const bookReturnUrl = useMemo(() => {
    const q = searchParams.toString();
    return `/hotel/${pathSlug}/${encodeURIComponent(hotelId)}/book${q ? `?${q}` : ""}`;
  }, [searchParams, pathSlug, hotelId]);

  useEffect(() => {
    if (!resumePayment || !apiBookingId || !auth?.isAuthenticated) return;
    const token = auth.getAccessToken();
    if (!token) return;

    let cancelled = false;
    void fetchHotelBookingById(token, apiBookingId)
      .then((booking) => {
        if (cancelled) return;
        setApiBooking(booking);
        setBookingRef(booking.confirmation_number);
        if (isConfirmedBookingStatus(booking.status)) {
          setStep("confirmed");
        } else {
          setStep("payment");
        }
      })
      .catch(() => {
        if (!cancelled) setStep("payment");
      });

    return () => {
      cancelled = true;
    };
  }, [resumePayment, apiBookingId, auth?.isAuthenticated, auth]);

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
      const roomTotal = ratePlan.price * nightCount * rooms;
      const taxTotal = ratePlan.taxes * nightCount * rooms;
      const total = roomTotal + taxTotal + (donation ?? 0);

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

  const roomTotal = ratePlan.price * nights * rooms;
  const taxes = ratePlan.taxes * nights * rooms;
  const donationAmt = donation ?? 0;
  const estimatedTotal = roomTotal + taxes + donationAmt;
  const payTotal = apiBooking?.total_amount ?? estimatedTotal;

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

  // ── Token / Full payment toggle (same as packages) ──────────────────────────
  const [payType, setPayType] = useState<"token" | "full">("token");
  const tokenAmt = Math.round(payTotal * 0.4);   // 40% token
  const payAmt   = payType === "token" ? tokenAmt : payTotal;

  const handleContinueBooking = async () => {
    // Check guest details first
    if (!validateTravellers()) return;

    // If not logged in → open login modal
    if (!auth?.isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setContinuing(true);
    setFormError(null);

    try {
      const token = auth.getAccessToken();
      if (!token) {
        setAuthModalOpen(true);
        setContinuing(false);
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
        ...mealPlanPayloadFromRatePlan(ratePlan),
      });

      if (auth.user?.id) {
        upsertCachedBooking(auth.user.id, created);
      }

      setApiBooking(created);
      setApiBookingId(created.id);
      setBookingRef(created.confirmation_number);
      persistPendingCheckout(created.id);

      // ── Open Razorpay directly — no separate payment step ────────────────
      const keyId   = getRazorpayKeyId();
      const orderId = created.razorpay_order_id;
      if (!keyId || !orderId) {
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setContinuing(false);
        return;
      }

      const amountPaise = payType === "token"
        ? Math.round(payTotal * 0.4 * 100)   // 40% token
        : Math.round(payTotal * 100);          // 100% full

      try {
        await openRazorpayCheckout({
          keyId,
          orderId,
          amountPaise,
          currency: "INR",
          name: hotel.name,
          description: payType === "token"
            ? `Token payment (40%) — ₹${Math.round(payTotal * 0.4).toLocaleString("en-IN")}`
            : `Full payment — ₹${payTotal.toLocaleString("en-IN")}`,
          prefill: {
            name:    `${firstName.trim()} ${lastName.trim()}`.trim(),
            email:   email.trim(),
            contact: mobile.replace(/\D/g, "").slice(-10),
          },
          onSuccess: async (response) => {
            try {
              const tkn = auth?.getAccessToken();
              if (tkn) {
                await verifyHotelBookingPayment(tkn, created.id, response);
              }
              setStep("confirmed");
            } catch {
              setStep("payment");
            }
          },
          onDismiss: () => {
            setStep("payment");
            window.scrollTo({ top: 0, behavior: "smooth" });
          },
        });
      } catch {
        setStep("payment");
      }
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
    const token = auth?.getAccessToken();
    const keyId = getRazorpayKeyId();
    const orderId = apiBooking?.razorpay_order_id;
    const bookingId = apiBookingId;

    if (!token || !bookingId) {
      setFormError("Session expired. Please go back and create the booking again.");
      return;
    }
    if (!keyId) {
      setFormError("Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID on the server.");
      return;
    }
    if (!orderId) {
      setFormError("Payment order missing from booking. Please contact support with your booking ID.");
      return;
    }

    setProcessing(true);
    setFormError(null);

    try {
      await openRazorpayCheckout({
        keyId,
        orderId,
        amountPaise: Math.round(payTotal * 100),
        name: "UNO Trips",
        description: `${hotel.name} — ${roomType.name}`,
        prefill: {
          name: guestFullName,
          email: email.trim(),
          contact: mobile.replace(/\D/g, "").slice(-10),
        },
        onDismiss: () => setProcessing(false),
        onSuccess: async (response) => {
          try {
            const verified = await verifyHotelBookingPayment(token, bookingId, response);
            const confirmed = verified as unknown as BookingWithOrder;
            const nextBooking: BookingWithOrder = {
              ...(apiBooking ?? {
                id: bookingId,
                confirmation_number: bookingRef,
                status: "confirmed",
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
                total_amount: payTotal,
                currency: "INR",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }),
              ...confirmed,
              status: confirmed.status ?? "confirmed",
            };
            setApiBooking(nextBooking);
            setBookingRef(nextBooking.confirmation_number || bookingRef);
            if (auth?.user?.id) {
              upsertCachedBooking(auth.user.id, nextBooking);
            }
            setStep("confirmed");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Payment verification failed. Contact support if amount was deducted.";
            setFormError(message);
          } finally {
            setProcessing(false);
          }
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not open payment.";
      if (message !== "Payment cancelled.") {
        setFormError(message);
      }
      setProcessing(false);
    }
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
          <div className="mx-auto flex w-full max-w-[1320px] items-center gap-6 px-3 py-4 sm:px-4 lg:px-6">
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

        <div className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-4 lg:px-6">
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
                  <dd className="text-lg font-bold">₹ {formatInrAmount(payTotal)}</dd>
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
              grandTotal={payTotal}
              guestName={guestFullName}
              email={email}
              mobile={mobile}
              processing={processing}
              paymentError={formError}
              onBack={() => setStep("travellers")}
              onPay={() => void handlePay()}
            />
            </>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
              <div className="order-2 space-y-4 lg:order-1">
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

                {/* Auth modal rendered at root level below */}

                {/* ── Customer support ── */}
                <div className="rounded-xl border border-dashed border-[#FDBA74] bg-orange-50/50 p-4">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">Need help with your booking?</p>
                  <p className="mt-0.5 text-[11px] text-[#757575]">Our team is available 24/7 — reach us on WhatsApp or call directly.</p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <a
                      href={siteWhatsAppChatUrl(`Hi, I need help with my hotel booking at ${hotel.name}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1.5 text-[12px] font-bold text-white"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden />WhatsApp
                    </a>
                    <a
                      href={siteTelHref()}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-[12px] font-bold text-[#424242]"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />Call us
                    </a>
                  </div>
                </div>


              </div>

              <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-xl border border-[#e0e0e0] bg-white shadow-sm overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-bold uppercase tracking-wide text-[#212121]">Order Summary</p>
                      <span className="rounded-full bg-[#EF6614] px-2 py-0.5 text-[10px] font-bold text-white">
                        {rooms} room
                      </span>
                    </div>
                    <Link href={changeRoomHref} className="text-[11px] font-semibold text-[#EF6614] hover:underline">
                      + Add more
                    </Link>
                  </div>

                  {/* Room card */}
                  <div className="border-b border-[#eee] px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-[#212121]">{roomType.name}</p>
                        <p className="text-[11px] text-[#757575]">
                          {roomType.tags[0] ?? ""} · ₹{formatInrAmount(ratePlan.price)}/night
                        </p>
                        {ratePlan.mealAddOn > 0 && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FFF8E1] px-2 py-0.5 text-[10px] font-semibold text-[#E65100]">
                            🍽 {ratePlan.packageName.replace(/\s*\(.*?\)\s*/g, "").trim()}
                          </span>
                        )}
                      </div>
                      <Link href={changeRoomHref}>
                        <X className="h-4 w-4 text-[#9E9E9E] hover:text-[#212121]" />
                      </Link>
                    </div>

                    {/* Rooms counter */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#bdbdbd]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-[13px] font-bold">{rooms}</span>
                        <button
                          type="button"
                          disabled
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#bdbdbd]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[13px] font-semibold text-[#212121]">
                        ₹{formatInrAmount(ratePlan.price * displayNights * rooms)}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 divide-x divide-[#eee] border-b border-[#eee]">
                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9E9E9E]">Check-in</p>
                        <Edit2 className="h-3 w-3 text-[#9E9E9E]" />
                      </div>
                      <p className="mt-0.5 text-[12px] font-bold text-[#212121]">
                        {checkInLabel.main || "Select"}
                      </p>
                      <p className="text-[10px] text-[#757575]">{checkInLabel.sub || "From 2:00 PM"}</p>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9E9E9E]">Check-out</p>
                        <Edit2 className="h-3 w-3 text-[#9E9E9E]" />
                      </div>
                      <p className="mt-0.5 text-[12px] font-bold text-[#212121]">
                        {checkOutLabel.main || "Select"}
                      </p>
                      <p className="text-[10px] text-[#757575]">{checkOutLabel.sub || "Until 10:00 AM"}</p>
                    </div>
                  </div>

                  {/* Nights / Adults / Children */}
                  <div className="divide-y divide-[#eee] border-b border-[#eee]">
                    {[
                      {
                        label: "Nights",
                        sub: `${checkInLabel.main?.split(",")[0] ?? ""} → ${checkOutLabel.main?.split(",")[0] ?? ""}`,
                        value: displayNights,
                        onDec: () => setLocalNights(Math.max(1, displayNights - 1)),
                        onInc: () => setLocalNights(displayNights + 1),
                      },
                      {
                        label: "Adults",
                        sub: "",
                        value: displayAdults,
                        onDec: () => setLocalAdults(Math.max(1, displayAdults - 1)),
                        onInc: () => setLocalAdults(displayAdults + 1),
                      },
                      {
                        label: "Children",
                        sub: "",
                        value: localChildren,
                        onDec: () => setLocalChildren(Math.max(0, localChildren - 1)),
                        onInc: () => setLocalChildren(localChildren + 1),
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <p className="text-[12px] font-semibold text-[#212121]">{row.label}</p>
                          {row.sub && <p className="text-[10px] text-[#9E9E9E]">{row.sub}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={row.onDec}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-[13px] font-bold text-[#212121]">{row.value}</span>
                          <button
                            type="button"
                            onClick={row.onInc}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 px-4 py-3 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-[#616161]">
                        {roomType.name} ×{rooms} × {displayNights}n
                      </span>
                      <span className="font-medium text-[#212121]">
                        ₹{formatInrAmount(ratePlan.roomBasePrice * displayNights * rooms)}
                      </span>
                    </div>
                    {ratePlan.mealAddOn > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1 text-[#616161]">
                          🍽 {ratePlan.packageName.replace(/\s*\(.*?\)\s*/g, "").trim()} ({displayAdults}g × {displayNights}n)
                        </span>
                        <span className="font-medium text-[#2E7D32]">
                          +₹{formatInrAmount(ratePlan.mealAddOn * displayAdults * displayNights)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#616161]">Platform fee (incl. in room price)</span>
                      <span className="text-[#616161]">Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#616161]">Taxes &amp; Fees</span>
                      <span className="font-medium text-[#212121]">
                        ₹{formatInrAmount(taxes)}
                      </span>
                    </div>
                    {donationAmt > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#616161]">Donation</span>
                        <span className="font-medium text-[#212121]">₹{formatInrAmount(donationAmt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total + CTA */}
                  <div className="border-t border-[#eee] px-4 pb-4 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#212121]">Total</span>
                      <span className="text-[18px] font-bold text-[#EF6614]">
                        ₹{formatInrAmount(payTotal)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-[#9E9E9E]">
                      {displayNights} night · {rooms} room · {displayAdults} guest{displayAdults !== 1 ? "s" : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleContinueBooking()}
                      disabled={continuing}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#EF6614] py-3 text-[13px] font-bold text-white transition hover:bg-[#E65100] disabled:opacity-70"
                    >
                      {continuing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                      ) : !firstName.trim() || !lastName.trim() || !email.trim() || !mobile.trim() ? (
                        "Fill Guest Details First"
                      ) : !auth?.isAuthenticated ? (
                        "Login to Continue"
                      ) : (
                        "Proceed to Pay →"
                      )}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Auth modal — opens when user clicks Proceed to Pay without being logged in */}
      <BookingAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          void handleContinueBooking();
        }}
      />
    </>
  );
}