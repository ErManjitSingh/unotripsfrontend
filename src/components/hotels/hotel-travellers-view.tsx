"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    meal_plan: suffix === "ep" ? null : suffix,
    meal_plan_label: ratePlan.packageName,
    meal_plan_price: ratePlan.mealAddOn,
  };
}

function addDaysToIso(iso: string, days: number): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((x) => Number.parseInt(x, 10));
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type BookingStep = "travellers" | "payment" | "confirmed";

// ── Checkout draft — survives auth redirect (sessionStorage) ─────────────────

type CheckoutDraft = {
  childrenAges: number[];
  localRooms: number;
  localAdults: number | null;
  localNights: number | null;
  localCheckIn: string;
  localCheckOut: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  title: string;
  donation: number | null;
  agreed: boolean;
};

function draftKey(hotelId: string, roomTypeId: string): string {
  return `uno_checkout_draft_${hotelId}_${roomTypeId}`;
}

function loadDraft(key: string): CheckoutDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null;
  }
}

function saveDraftToStorage(key: string, d: CheckoutDraft): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(key, JSON.stringify(d)); } catch { /* quota full — ignore */ }
}

function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}

// ── Booking hold countdown (must match backend PENDING_EXPIRES_MINUTES) ──────
const HOLD_MINUTES = 15;

function holdSecondsRemaining(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  const expiresAt = created + HOLD_MINUTES * 60 * 1000;
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
}

function formatCountdown(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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

  // ── Restore checkout draft from sessionStorage (survives auth redirect) ────
  const storageKey = useMemo(() => draftKey(hotelId, roomTypeId), [hotelId, roomTypeId]);
  const [draft] = useState(() => loadDraft(storageKey));

  const [step, setStep] = useState<BookingStep>("travellers");
  const [agreed, setAgreed] = useState(draft?.agreed ?? false);
  const [title, setTitle] = useState(draft?.title ?? "Mr");
  const [firstName, setFirstName] = useState(draft?.firstName ?? "");
  const [lastName, setLastName] = useState(draft?.lastName ?? "");
  const [email, setEmail] = useState(draft?.email ?? "");
  const [mobile, setMobile] = useState(draft?.mobile ?? "");
  const [donation, setDonation] = useState<number | null>(draft?.donation ?? null);
  const [formError, setFormError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [apiBooking, setApiBooking] = useState<BookingWithOrder | null>(null);
  const [apiBookingId, setApiBookingId] = useState<string | null>(
    () => searchParams.get("booking_id"),
  );
  const [continuing, setContinuing] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Editable order summary state (restored from draft if available)
  const [localRooms, setLocalRooms]       = useState(draft?.localRooms ?? rooms);
  const [localNights, setLocalNights]     = useState<number | null>(draft?.localNights ?? null);
  const [localAdults, setLocalAdults]     = useState<number | null>(draft?.localAdults ?? null);
  const [childrenAges, setChildrenAges]   = useState<number[]>(draft?.childrenAges ?? []);
  const localChildren = childrenAges.length;
  const [editingCheckIn, setEditingCheckIn]   = useState(false);
  const [editingCheckOut, setEditingCheckOut] = useState(false);
  const [localCheckIn,  setLocalCheckIn]  = useState(draft?.localCheckIn || checkInIso);
  const [localCheckOut, setLocalCheckOut] = useState(draft?.localCheckOut || checkOutIso);

  const displayNights = localNights ?? nights;
  const displayAdults = localAdults ?? guests;
  const displayRooms  = localRooms;
  const maxOccupancy  = selection?.roomType.maxOccupancy ?? 2;
  const maxAdultsAllowed = maxOccupancy * displayRooms;
  const availableRoomCount = selection?.roomType.availableCount ?? 10;
  const resumePayment = searchParams.get("resume") === "1";

  // ── Booking hold countdown — ticks every second when a pending booking exists ─
  const [holdSec, setHoldSec] = useState<number | null>(null);
  const holdExpired = holdSec === 0;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (!apiBooking?.created_at || step === "confirmed") {
      setHoldSec(null);
      return;
    }
    const tick = () => {
      const remaining = holdSecondsRemaining(apiBooking.created_at);
      setHoldSec(remaining);
      if (remaining <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [apiBooking?.created_at, step]);

  const effectiveCheckIn  = localCheckIn  || checkInIso;
  const effectiveCheckOut = localCheckOut || checkOutIso;

  const checkInLabel = formatHotelDateFromIso(effectiveCheckIn);
  const checkOutLabel = formatHotelDateFromIso(effectiveCheckOut);

  // ── Persist checkout draft to sessionStorage on every edit ─────────────────
  useEffect(() => {
    if (step === "confirmed") return; // don't save after confirmation
    saveDraftToStorage(storageKey, {
      childrenAges, localRooms, localAdults, localNights,
      localCheckIn, localCheckOut,
      firstName, lastName, email, mobile, title, donation, agreed,
    });
  }, [
    storageKey, step, childrenAges, localRooms, localAdults, localNights,
    localCheckIn, localCheckOut, firstName, lastName, email, mobile,
    title, donation, agreed,
  ]);

  // ── Children 12+ count as adults for occupancy — auto-increase rooms ──────
  const adultEquivalent = useMemo(
    () => displayAdults + childrenAges.filter((a) => a >= 12).length,
    [displayAdults, childrenAges],
  );
  const neededRooms = useMemo(
    () => Math.ceil(adultEquivalent / maxOccupancy),
    [adultEquivalent, maxOccupancy],
  );
  useEffect(() => {
    if (neededRooms > displayRooms && neededRooms <= availableRoomCount) {
      setLocalRooms(neededRooms);
    }
  }, [neededRooms, displayRooms, availableRoomCount]);

  // ── Clear draft once booking is confirmed ──────────────────────────────────
  useEffect(() => {
    if (step === "confirmed") clearDraft(storageKey);
  }, [step, storageKey]);

  const handleAdultsChange = useCallback((newAdults: number) => {
    if (newAdults < 1) return;
    const neededRooms = Math.ceil(newAdults / maxOccupancy);
    if (neededRooms > availableRoomCount) return;
    setLocalAdults(newAdults);
    if (neededRooms > displayRooms) setLocalRooms(neededRooms);
  }, [maxOccupancy, displayRooms, availableRoomCount]);

  const handleNightsChange = useCallback((newNights: number) => {
    if (newNights < 1) return;
    setLocalNights(newNights);
    const newCheckOut = addDaysToIso(effectiveCheckIn, newNights);
    if (newCheckOut) setLocalCheckOut(newCheckOut);
  }, [effectiveCheckIn]);

  const handleCheckInChange = useCallback((newDate: string) => {
    setLocalCheckIn(newDate);
    setEditingCheckIn(false);
    const newNights = hotelBookingNights(newDate, effectiveCheckOut);
    if (newNights >= 1) setLocalNights(newNights);
  }, [effectiveCheckOut]);

  const handleCheckOutChange = useCallback((newDate: string) => {
    setLocalCheckOut(newDate);
    setEditingCheckOut(false);
    const newNights = hotelBookingNights(effectiveCheckIn, newDate);
    if (newNights >= 1) setLocalNights(newNights);
  }, [effectiveCheckIn]);

  const handleRoomsChange = useCallback((newRooms: number) => {
    if (newRooms < 1 || newRooms > availableRoomCount) return;
    setLocalRooms(newRooms);
    const newMax = maxOccupancy * newRooms;
    if (displayAdults > newMax) setLocalAdults(newMax);
  }, [maxOccupancy, displayAdults, availableRoomCount]);

  const addChild = useCallback(() => {
    setChildrenAges((prev) => [...prev, 0]);
  }, []);

  const removeChild = useCallback(() => {
    setChildrenAges((prev) => prev.slice(0, -1));
  }, []);

  const updateChildAge = useCallback((index: number, age: number) => {
    setChildrenAges((prev) => {
      const next = [...prev];
      next[index] = age;
      return next;
    });
  }, []);

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

  // ── Auth prefill — only fill truly empty fields (draft takes priority) ──────
  useEffect(() => {
    if (!auth?.user) return;
    if (auth.user.email && !email) setEmail(auth.user.email);
    if (auth.user.name && !firstName) {
      const parts = auth.user.name.trim().split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
    }
    if (auth.user.phone && !mobile) {
      const digits = auth.user.phone.replace(/\D/g, "").slice(-10);
      // Only prefill if the phone is real (not all zeros / placeholder)
      if (digits && !/^0+$/.test(digits)) {
        setMobile(digits);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps — intentionally runs only when auth.user changes
  }, [auth?.user]);

  const persistPendingCheckout = useCallback(
    (bookingId?: string) => {
      if (!selection) return;
      const { city, hotel, roomType, ratePlan } = selection;

      const ebPrice = roomType.extraBedPrice ?? 0;
      const chargeable = childrenAges.filter((a) => a >= 6 && a <= 11).length;
      const childCost = chargeable > 0
        ? ebPrice > 0
          ? Math.round(ebPrice * chargeable * displayNights)
          : Math.round((ratePlan.roomBasePrice ?? 0) * 0.5 * chargeable * displayNights)
        : 0;

      const nightCount = hotelBookingNights(effectiveCheckIn, effectiveCheckOut);
      const roomTotal = ratePlan.price * nightCount * displayRooms;
      const taxTotal = ratePlan.taxes * nightCount * displayRooms;
      const total = roomTotal + taxTotal + childCost + (donation ?? 0);

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
        checkIn: effectiveCheckIn,
        checkOut: effectiveCheckOut,
        rooms: displayRooms,
        guests: displayAdults,
        adults: displayAdults,
        totalAmount: total,
        currency: "INR",
      });
    },
    [
      selection,
      auth?.user?.id,
      email,
      effectiveCheckIn,
      effectiveCheckOut,
      displayRooms,
      displayAdults,
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

  // ── Extra bed availability + child charges ─────────────────────────────────
  const extraBedAvailable = roomType.extraBedPrice != null;
  const extraBedPricePerNight = roomType.extraBedPrice ?? 0;
  const chargeableChildCount = childrenAges.filter((a) => a >= 6 && a <= 11).length;
  const estimatedChildCharges = chargeableChildCount > 0
    ? extraBedAvailable
      ? Math.round(extraBedPricePerNight * chargeableChildCount * displayNights)
      : Math.round((ratePlan.roomBasePrice ?? 0) * 0.5 * chargeableChildCount * displayNights)
    : 0;
  // Warning: children aged 6-11 but room doesn't offer extra bed
  const extraBedWarning = chargeableChildCount > 0 && !extraBedAvailable
    ? `Extra bed not available for this room. Consider adding another room for ${chargeableChildCount} child${chargeableChildCount > 1 ? "ren" : ""} (age 6-11).`
    : null;
  // Warning: total occupancy exceeds capacity
  const occupancyExceeded = adultEquivalent > maxOccupancy * displayRooms && neededRooms > availableRoomCount;
  const occupancyWarning = occupancyExceeded
    ? `Not enough rooms available. Max ${maxOccupancy} guests per room × ${availableRoomCount} available = ${maxOccupancy * availableRoomCount} guests.`
    : null;

    
  const detailHref = hotelDetailHref(city.slug, hotelListingKey(hotel));
  const changeRoomHref = `${detailHref}?check_in=${encodeURIComponent(checkInIso)}&check_out=${encodeURIComponent(checkOutIso)}&rooms=${rooms}&guests=${guests}#hotel-tabs`;

  const roomTotal = ratePlan.price * displayNights * displayRooms;
  const taxes = ratePlan.taxes * displayNights * displayRooms;
  const donationAmt = donation ?? 0;
  const estimatedTotal = roomTotal + taxes + donationAmt + estimatedChildCharges;
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

      if (!effectiveCheckIn || !effectiveCheckOut) {
        setFormError("Please select valid check-in and check-out dates.");
        setContinuing(false);
        return;
      }

      // Children aged 12+ count as adults for occupancy
      const adultsForBooking = displayAdults + childrenAges.filter((a) => a >= 12).length;

      const created: BookingWithOrder = await createHotelBooking(token, {
        hotel_id: hotel.id,
        room_type_id: roomType.id,
        check_in: effectiveCheckIn,
        check_out: effectiveCheckOut,
        adults: adultsForBooking,
        children: localChildren,
        children_ages: childrenAges,
        rooms: displayRooms,
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

  // ── Retry booking after hold expires — creates fresh booking + Razorpay order ──
  const handleRetryBooking = useCallback(async () => {
    setApiBooking(null);
    setApiBookingId(null);
    setBookingRef("");
    setFormError(null);
    setHoldSec(null);
    setProcessing(false);
    setStep("travellers");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
              {/* ── Hold countdown / expiry banner ── */}
              {holdExpired ? (
                <div className="mb-4 rounded-xl border border-[#FFCDD2] bg-[#FFEBEE] px-4 py-4 text-center">
                  <p className="text-[14px] font-bold text-[#C62828]">Session expired</p>
                  <p className="mt-1 text-[12px] text-[#616161]">
                    Your hold on this room has expired. Prices or availability may have changed.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleRetryBooking()}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EF6614] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65100]"
                  >
                    Retry Booking →
                  </button>
                </div>
              ) : holdSec != null ? (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-[#FFE082] bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] px-4 py-3">
                  <div className="text-[13px] text-[#E65100]">
                    <strong>Payment pending.</strong> Complete payment to confirm your stay at {hotel.name}.
                  </div>
                  <div className={cn(
                    "ml-3 shrink-0 rounded-lg px-3 py-1.5 text-center font-mono text-[15px] font-bold",
                    holdSec <= 120 ? "bg-[#C62828] text-white animate-pulse" : "bg-[#212121] text-white",
                  )}>
                    {formatCountdown(holdSec)}
                  </div>
                </div>
              ) : null}

              {!holdExpired && (
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
              )}
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
                      { label: "Guests", value: `${displayAdults} Adult${displayAdults !== 1 ? "s" : ""}${localChildren > 0 ? `, ${localChildren} Child${localChildren !== 1 ? "ren" : ""}` : ""}` },
                      {
                        label: "Rooms",
                        value: `${displayRooms} Room${displayRooms !== 1 ? "s" : ""} | ${displayNights} Night${displayNights !== 1 ? "s" : ""}`,
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
                        {displayRooms} room{displayRooms !== 1 ? "s" : ""}
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

                    {/* Rooms counter — LIVE */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleRoomsChange(displayRooms - 1)} disabled={displayRooms <= 1} className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition", displayRooms <= 1 ? "border-[#e0e0e0] text-[#bdbdbd]" : "border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]")}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-[13px] font-bold">{displayRooms}</span>
                        <button type="button" onClick={() => handleRoomsChange(displayRooms + 1)} disabled={displayRooms >= availableRoomCount} className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition", displayRooms >= availableRoomCount ? "border-[#e0e0e0] text-[#bdbdbd]" : "border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]")}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[13px] font-semibold text-[#212121]">
                        ₹{formatInrAmount(ratePlan.price * displayNights * displayRooms)}
                      </p>
                    </div>
                  </div>

                  {/* Dates — editable */}
                  <div className="grid grid-cols-2 divide-x divide-[#eee] border-b border-[#eee]">
                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9E9E9E]">Check-in</p>
                        <button type="button" onClick={() => setEditingCheckIn(!editingCheckIn)} className="p-0.5">
                          <Edit2 className="h-3 w-3 text-[#9E9E9E] hover:text-[#EF6614]" />
                        </button>
                      </div>
                      {editingCheckIn ? (
                        <input type="date" value={effectiveCheckIn} min={todayIso()} onChange={(e) => handleCheckInChange(e.target.value)} onBlur={() => setEditingCheckIn(false)} autoFocus className="mt-1 w-full rounded border border-[#EF6614] px-1.5 py-1 text-[12px] font-bold text-[#212121] outline-none" />
                      ) : (
                        <>
                          <p className="mt-0.5 text-[12px] font-bold text-[#212121]">{checkInLabel.main || "Select"}</p>
                          <p className="text-[10px] text-[#757575]">{checkInLabel.sub || "From 2:00 PM"}</p>
                        </>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9E9E9E]">Check-out</p>
                        <button type="button" onClick={() => setEditingCheckOut(!editingCheckOut)} className="p-0.5">
                          <Edit2 className="h-3 w-3 text-[#9E9E9E] hover:text-[#EF6614]" />
                        </button>
                      </div>
                      {editingCheckOut ? (
                        <input type="date" value={effectiveCheckOut} min={addDaysToIso(effectiveCheckIn, 1)} onChange={(e) => handleCheckOutChange(e.target.value)} onBlur={() => setEditingCheckOut(false)} autoFocus className="mt-1 w-full rounded border border-[#EF6614] px-1.5 py-1 text-[12px] font-bold text-[#212121] outline-none" />
                      ) : (
                        <>
                          <p className="mt-0.5 text-[12px] font-bold text-[#212121]">{checkOutLabel.main || "Select"}</p>
                          <p className="text-[10px] text-[#757575]">{checkOutLabel.sub || "Until 10:00 AM"}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Nights / Adults / Children — LIVE with age selectors */}
                  <div className="divide-y divide-[#eee] border-b border-[#eee]">
                    {/* Nights */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-[12px] font-semibold text-[#212121]">Nights</p>
                        <p className="text-[10px] text-[#9E9E9E]">{checkInLabel.main?.split(",")[0] ?? ""} → {checkOutLabel.main?.split(",")[0] ?? ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleNightsChange(displayNights - 1)} disabled={displayNights <= 1} className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition", displayNights <= 1 ? "border-[#e0e0e0] text-[#bdbdbd]" : "border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]")}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-[#212121]">{displayNights}</span>
                        <button type="button" onClick={() => handleNightsChange(displayNights + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614]">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Adults */}
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-[12px] font-semibold text-[#212121]">Adults</p>
                        {displayAdults >= maxAdultsAllowed && (
                          <p className="text-[10px] text-[#E65100]">Max {maxOccupancy}/room</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleAdultsChange(displayAdults - 1)} disabled={displayAdults <= 1} className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition", displayAdults <= 1 ? "border-[#e0e0e0] text-[#bdbdbd]" : "border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]")}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-[#212121]">{displayAdults}</span>
                        <button type="button" onClick={() => handleAdultsChange(displayAdults + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614]">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[12px] font-semibold text-[#212121]">Children</p>
                          <p className="text-[10px] text-[#9E9E9E]">0-5 free · 6-11 extra bed · 12+ adult</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={removeChild} disabled={localChildren <= 0} className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition", localChildren <= 0 ? "border-[#e0e0e0] text-[#bdbdbd]" : "border-[#e0e0e0] text-[#424242] hover:border-[#EF6614] hover:text-[#EF6614]")}>
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-[13px] font-bold text-[#212121]">{localChildren}</span>
                          <button type="button" onClick={addChild} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614]">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Age selector per child */}
                      {childrenAges.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {childrenAges.map((age, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-md bg-[#fafafa] px-3 py-1.5">
                              <span className="text-[11px] text-[#616161]">Child {idx + 1} age</span>
                              <select
                                value={age}
                                onChange={(e) => updateChildAge(idx, Number.parseInt(e.target.value, 10))}
                                className="h-7 w-20 rounded border border-[#e0e0e0] px-1.5 text-[11px] font-semibold text-[#212121] outline-none focus:border-[#EF6614]"
                              >
                                {Array.from({ length: 18 }, (_, i) => (
                                  <option key={i} value={i}>
                                    {i} yr{i !== 1 ? "s" : ""}{i <= 5 ? " (free)" : i <= 11 ? extraBedAvailable ? " (extra bed)" : " (needs room)" : " (adult)"}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Extra bed / occupancy warnings */}
                      {extraBedWarning && (
                        <p className="mt-2 rounded-md bg-[#FFF3E0] px-3 py-2 text-[11px] font-medium text-[#E65100]">
                          ⚠ {extraBedWarning}
                        </p>
                      )}
                      {occupancyWarning && (
                        <p className="mt-2 rounded-md bg-[#FFEBEE] px-3 py-2 text-[11px] font-medium text-[#C62828]">
                          ⚠ {occupancyWarning}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 px-4 py-3 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-[#616161]">
                        {roomType.name} ×{displayRooms} × {displayNights}n
                      </span>
                      <span className="font-medium text-[#212121]">
                        ₹{formatInrAmount(ratePlan.roomBasePrice * displayNights * displayRooms)}
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
                    {estimatedChildCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#616161]">
                          {extraBedAvailable
                            ? `Extra bed (${chargeableChildCount} × ₹${formatInrAmount(extraBedPricePerNight)} × ${displayNights}n)`
                            : `Children (${chargeableChildCount} × ${displayNights}n est.)`}
                        </span>
                        <span className="font-medium text-[#212121]">
                          ₹{formatInrAmount(estimatedChildCharges)}
                        </span>
                      </div>
                    )}
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
                      {displayNights} night{displayNights !== 1 ? "s" : ""} · {displayRooms} room{displayRooms !== 1 ? "s" : ""} · {displayAdults} guest{displayAdults !== 1 ? "s" : ""}
                    </p>

                    {/* Countdown timer — shown once a pending booking exists */}
                    {holdSec != null && !holdExpired && (
                      <div className={cn(
                        "mt-2 flex items-center justify-center gap-2 rounded-lg py-1.5 text-[12px] font-bold",
                        holdSec <= 120 ? "bg-[#FFEBEE] text-[#C62828]" : "bg-[#FFF8E1] text-[#E65100]",
                      )}>
                        <span>⏱</span>
                        <span>Complete in {formatCountdown(holdSec)}</span>
                      </div>
                    )}

                    {holdExpired ? (
                      <button
                        type="button"
                        onClick={() => void handleRetryBooking()}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#C62828] py-3 text-[13px] font-bold text-white transition hover:bg-[#B71C1C]"
                      >
                        Session Expired — Retry Booking
                      </button>
                    ) : (
                    <button
                      type="button"
                      onClick={() => void handleContinueBooking()}
                      disabled={continuing || occupancyExceeded}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#EF6614] py-3 text-[13px] font-bold text-white transition hover:bg-[#E65100] disabled:opacity-70"
                    >
                      {continuing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                      ) : occupancyExceeded ? (
                        "Reduce guests or add rooms"
                      ) : !firstName.trim() || !lastName.trim() || !email.trim() || !mobile.trim() ? (
                        "Fill Guest Details First"
                      ) : !auth?.isAuthenticated ? (
                        "Login to Continue"
                      ) : (
                        "Proceed to Pay →"
                      )}
                    </button>
                    )}
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
        prefill={{
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          phone: mobile.replace(/\D/g, "").slice(-10),
        }}
      />
    </>
  );
}