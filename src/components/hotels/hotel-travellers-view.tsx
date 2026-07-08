"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CircleCheck, Edit2, Lock, Loader2, MessageCircle, Minus, Phone, Plus, Shield, Star, X } from "lucide-react";
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

const ALLOW_MOCK_RAZORPAY =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS === "true";

function getMealPlanLabel(packageName: string): string {
  const n = packageName.toLowerCase();
  if (n.includes("room only") || n.includes("(ep)")) return "Room Only";
  if (n.includes("breakfast") && !n.includes("dinner") && !n.includes("lunch")) return "Bed & Breakfast";
  if (n.includes("map") || (n.includes("breakfast") && n.includes("dinner") && !n.includes("lunch"))) return "Half Board";
  if (n.includes("full board") || n.includes("(ap)") || (n.includes("lunch") && n.includes("dinner"))) return "Full Board";
  return packageName.replace(/\s*\([A-Z]+\)\s*/g, "").trim();
}

const PLAN_SUFFIX_TO_MEALS: Record<string, string | null> = {
  ep:  null,
  cp:  "breakfast",
  map: "breakfast,dinner",
  ap:  "breakfast,lunch,dinner",
};

function mealPlanPayloadFromRatePlan(ratePlan: HotelRoomRatePlan) {
  const suffix = ratePlan.id.split("-").pop() ?? "ep";
  return {
    meal_plan: PLAN_SUFFIX_TO_MEALS[suffix] ?? null,
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
const HOLD_MINUTES = process.env.NODE_ENV === "development" ? 60 : 15;

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
  const idempotencyKeyRef = useRef(crypto.randomUUID());

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
      firstName, lastName, email, mobile, title, agreed,
    });
  }, [
    storageKey, step, childrenAges, localRooms, localAdults, localNights,
    localCheckIn, localCheckOut, firstName, lastName, email, mobile,
    title, agreed,
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

  // ── Clear draft + pending checkout once booking is confirmed ──────────────
  useEffect(() => {
    if (step === "confirmed") {
      clearDraft(storageKey);
      if (apiBookingId) {
        import("@/lib/pending-checkout-storage").then(({ removePendingCheckout }) => {
          removePendingCheckout(apiBookingId);
        });
      }
    }
  }, [step, storageKey, apiBookingId]);

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
      const total = roomTotal + taxTotal + childCost;

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
  const roomBasePriceForChild = ratePlan.roomBasePrice ?? 0;
  const estimatedChildCharges = chargeableChildCount > 0
    ? extraBedAvailable
      ? Math.round(extraBedPricePerNight * chargeableChildCount * displayNights)
      : Math.round(roomBasePriceForChild * 0.5 * chargeableChildCount * displayNights)
    : 0;
  const childChargeUnknown = chargeableChildCount > 0 && !extraBedAvailable && roomBasePriceForChild === 0;
  // Warning: children aged 6-11 but room doesn't offer extra bed
  const extraBedWarning = chargeableChildCount > 0 && !extraBedAvailable
    ? `Extra bed not listed for this room. Child charges (age 6–11) will be confirmed at check-in by the hotel.`
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
  const discount = ratePlan.discountAmount * displayNights * displayRooms;
  const estimatedTotal = roomTotal + taxes - discount + estimatedChildCharges;
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
      }, { "X-Idempotency-Key": idempotencyKeyRef.current });

      // Reset idempotency key so a back-and-retry creates a fresh booking
      idempotencyKeyRef.current = crypto.randomUUID();

      if (auth.user?.id) {
        upsertCachedBooking(auth.user.id, created);
      }

      setApiBooking(created);
      setApiBookingId(created.id);
      setBookingRef(created.confirmation_number);
      persistPendingCheckout(created.id);

      // ── Open Razorpay directly — no separate payment step ────────────────
      const keyId   = created.razorpay_key_id ?? getRazorpayKeyId();
      const orderId = created.razorpay_order_id;

      // Explicit local mock orders skip the Razorpay popup.
      if (orderId?.startsWith("order_mock_") && !ALLOW_MOCK_RAZORPAY) {
        setFormError("Payment gateway returned a test order. Please redeploy the backend with real Razorpay payments enabled.");
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setContinuing(false);
        return;
      }

      if (!keyId || !orderId || orderId.startsWith("order_mock_")) {
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setContinuing(false);
        return;
      }

      const confirmedAmount = created.total_amount;
      const amountPaise = Math.round(confirmedAmount * 100);

      try {
        await openRazorpayCheckout({
          keyId,
          orderId,
          amountPaise,
          currency: "INR",
          name: hotel.name,
          description: `Full payment — ₹${confirmedAmount.toLocaleString("en-IN")}`,
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
    const keyId = apiBooking?.razorpay_key_id ?? getRazorpayKeyId();
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

    // Explicit local mock: skip Razorpay popup and verify immediately with dummy IDs
    if (orderId.startsWith("order_mock_")) {
      if (!ALLOW_MOCK_RAZORPAY) {
        setFormError("Payment gateway returned a test order. Please redeploy the backend with real Razorpay payments enabled.");
        setProcessing(false);
        return;
      }
      try {
        const verified = await verifyHotelBookingPayment(token, bookingId, {
          razorpay_order_id:   orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature:  "mock_signature",
        });
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
        if (auth?.user?.id) upsertCachedBooking(auth.user.id, nextBooking);
        setStep("confirmed");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Mock payment verification failed.");
      } finally {
        setProcessing(false);
      }
      return;
    }

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

  const inclusions = ratePlan.benefits;
  const mealLabel  = getMealPlanLabel(ratePlan.packageName);
  const cancellation = ratePlan.nonRefundable
    ? "Non-refundable — no refund on cancellation"
    : "Free cancellation before check-in";

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
            <div className="mx-auto max-w-2xl space-y-4">

              {/* ── Success hero banner ── */}
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] px-6 py-8 text-center text-white shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                  <CircleCheck className="h-9 w-9 text-white" strokeWidth={2} />
                </div>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Booking Confirmed!</h1>
                <p className="mt-1 text-[14px] text-green-100">
                  Your stay at <span className="font-semibold text-white">{hotel.name}</span> is all set.
                </p>
                {/* Booking ID pill */}
                <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 ring-1 ring-white/30">
                  <span className="text-[11px] font-medium text-green-100 uppercase tracking-widest">Booking ID</span>
                  <span className="text-[15px] font-extrabold tracking-wider text-white">{bookingRef}</span>
                </div>
                <p className="mt-3 text-[11px] text-green-200">
                  Confirmation details sent to {email}
                </p>
              </div>

              {/* ── Voucher card ── */}
              <div className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm">

                {/* Hotel identity strip */}
                <div className="flex items-center gap-4 border-b border-[#f0f0f0] px-5 py-4">
                  <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={hotel.images[0] ?? ""}
                      alt={hotel.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold text-[#1a1a1a]">{hotel.name}</p>
                    <p className="mt-0.5 text-[12px] text-[#757575]">{city.name}</p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-bold text-[#2E7D32]">
                      <CircleCheck className="h-3 w-3" strokeWidth={2.5} />
                      Confirmed
                    </div>
                  </div>
                </div>

                {/* ── Stay timeline ── */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-5">
                  {/* Check-in */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9E9E9E]">Check-in</p>
                    <p className="mt-1 text-[18px] font-extrabold text-[#1a1a1a]">{checkInLabel.main || "—"}</p>
                    <p className="text-[11px] text-[#757575]">From 2:00 PM</p>
                  </div>
                  {/* Nights pill */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-px w-8 bg-[#e0e0e0]" />
                    <span className="rounded-full border border-[#e0e0e0] bg-white px-3 py-1 text-[11px] font-bold text-[#424242]">
                      {displayNights}N
                    </span>
                    <div className="h-px w-8 bg-[#e0e0e0]" />
                  </div>
                  {/* Check-out */}
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9E9E9E]">Check-out</p>
                    <p className="mt-1 text-[18px] font-extrabold text-[#1a1a1a]">{checkOutLabel.main || "—"}</p>
                    <p className="text-[11px] text-[#757575]">Until 12:00 PM</p>
                  </div>
                </div>

                {/* ── Booking details grid ── */}
                <div className="grid grid-cols-2 gap-px bg-[#f0f0f0]">
                  {[
                    { label: "Room Type",   value: roomType.name },
                    { label: "Meal Plan",   value: mealLabel },
                    { label: "Rooms",       value: `${displayRooms} room${displayRooms > 1 ? "s" : ""}` },
                    { label: "Guests",      value: `${displayAdults} guest${displayAdults > 1 ? "s" : ""}` },
                    { label: "Guest Name",  value: guestFullName },
                    { label: "Mobile",      value: mobile },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9E9E9E]">{label}</p>
                      <p className="mt-0.5 text-[13px] font-semibold text-[#1a1a1a]">{value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* ── Amount paid strip ── */}
                <div className="flex items-center justify-between border-t border-[#f0f0f0] bg-[#FFF8F3] px-5 py-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9E9E9E]">Amount Paid</p>
                    <p className="text-[10px] text-[#757575]">Incl. all taxes &amp; fees</p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#EF6614]">
                    ₹ {formatInrAmount(apiBooking?.total_amount ?? payTotal)}
                  </p>
                </div>
              </div>

              {/* ── What to carry info ── */}
              <div className="rounded-2xl border border-[#FFF3E0] bg-[#FFF8F3] px-5 py-4">
                <p className="text-[12px] font-bold text-[#E65100] uppercase tracking-wider">What to carry at check-in</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    "This booking confirmation (screenshot or printout)",
                    "A valid government-issued photo ID (Aadhaar / Passport / Driving Licence)",
                    "Original credit/debit card used for payment (if requested)",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-[12px] text-[#616161]">
                      <span className="mt-0.5 text-[#EF6614]">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── CTA buttons ── */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/hotels"
                  className="flex-1 rounded-xl bg-[#EF6614] py-3 text-center text-[14px] font-bold text-white shadow-sm transition hover:bg-[#E65100]"
                >
                  Book Another Hotel
                </Link>
                <Link
                  href={detailHref}
                  className="flex-1 rounded-xl border border-[#e0e0e0] bg-white py-3 text-center text-[14px] font-semibold text-[#424242] transition hover:border-[#bdbdbd] hover:bg-[#fafafa]"
                >
                  View Hotel
                </Link>
              </div>
            </div>
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
                  isMockOrder={ALLOW_MOCK_RAZORPAY && apiBooking?.razorpay_order_id?.startsWith("order_mock_")}
                  onBack={() => { setStep("travellers"); setApiBooking(null); }}
                  onPay={() => void handlePay()}
                />
              )}
            </>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

              {/* ── LEFT COLUMN ── */}
              <div className="order-2 space-y-5 lg:order-1">

                {/* ── 1. Hotel & Stay Card ── */}
                <section className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">
                  {/* Hotel identity row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={hotel.images[0] ?? ""} alt={hotel.name} fill unoptimized className="object-cover" sizes="80px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h1 className="text-[16px] font-bold leading-tight text-[#1a1a1a]">{hotel.name}</h1>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="flex items-center gap-0.5">
                              {Array.from({ length: hotel.stars }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                              ))}
                            </span>
                            <span className="text-[#d0d0d0]">·</span>
                            <p className="text-[12px] text-[#757575]">{hotel.address ?? `${hotel.area}, ${city.name}`}</p>
                          </div>
                        </div>
                        <Link href={detailHref} className="shrink-0 rounded-lg border border-[#e8e8e8] px-3 py-1.5 text-[11px] font-semibold text-[#616161] transition hover:border-[#EF6614] hover:text-[#EF6614]">
                          Change
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Stay timeline — full width divider row */}
                  <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-5 py-4">
                    <div className="flex items-center">
                      {/* Check-in */}
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Check-In</p>
                        <p className="mt-1 text-[14px] font-extrabold text-[#1a1a1a]">{checkInLabel.main || "—"}</p>
                        <p className="text-[11px] text-[#9E9E9E]">{checkInLabel.sub || "From 2:00 PM"}</p>
                      </div>

                      {/* Nights connector — centred between both date columns */}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <div className="h-px w-10 bg-[#e0e0e0]" />
                        <span className="rounded-full bg-[#EF6614] px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
                          {displayNights}N
                        </span>
                        <div className="h-px w-10 bg-[#e0e0e0]" />
                      </div>

                      {/* Check-out */}
                      <div className="flex-1 pl-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Check-Out</p>
                        <p className="mt-1 text-[14px] font-extrabold text-[#1a1a1a]">{checkOutLabel.main || "—"}</p>
                        <p className="text-[11px] text-[#9E9E9E]">{checkOutLabel.sub || "Until 12:00 PM"}</p>
                      </div>

                      {/* Divider */}
                      <div className="mx-4 h-10 w-px bg-[#e8e8e8]" />

                      {/* Guests */}
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Guests</p>
                        <p className="mt-1 text-[14px] font-extrabold text-[#1a1a1a]">{displayAdults} Adult{displayAdults !== 1 ? "s" : ""}</p>
                        <p className="text-[11px] text-[#9E9E9E]">{displayRooms} room{displayRooms !== 1 ? "s" : ""}{localChildren > 0 ? ` · ${localChildren} child` : ""}</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── 2. Room Selection ── */}
                <section className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">
                  <div className="flex items-center gap-3 p-4">
                    {/* Room thumbnail */}
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      <Image src={roomType.image} alt={roomType.name} fill unoptimized className="object-cover" sizes="80px" />
                    </div>

                    {/* Room details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-bold text-[#1a1a1a]">{roomType.name}</p>
                        <Link href={changeRoomHref} className="shrink-0 text-[11px] font-semibold text-[#EF6614] hover:underline">
                          Change
                        </Link>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#757575]">
                        {roomType.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}
                        <span>Sleeps {roomType.maxOccupancy}</span>
                        <span className="rounded border border-[#ffe0cc] bg-[#fff8f3] px-1.5 py-0.5 text-[11px] font-semibold text-[#EF6614]">{mealLabel}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                        <span className={cn("font-medium", ratePlan.nonRefundable ? "text-[#c62828]" : "text-[#2E7D32]")}>
                          {ratePlan.nonRefundable ? "⚠ Non-refundable" : "✓ Free cancellation"}
                        </span>
                        <span className="text-[#bdbdbd]">·</span>
                        <span className="text-[#9E9E9E]">₹{formatInrAmount(ratePlan.price)}/night · {displayNights}N · {displayRooms} room{displayRooms !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── 3. Guest Details ── */}
                <section className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">
                  <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#EF6614] text-[11px] font-extrabold text-[#EF6614]">2</div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1a1a1a]">Guest Details</p>
                        <p className="text-[11px] text-[#9E9E9E]">Name must match your government-issued ID</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#e3f2fd] bg-[#f3f9ff] px-3.5 py-2.5 text-[12px] text-[#1565C0]">
                      <span className="text-base">ℹ️</span>
                      Booking confirmation and e-voucher will be sent to your email and mobile number.
                    </div>

                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E]">Primary Guest</p>
                    <div className="grid gap-3 sm:grid-cols-[90px_1fr_1fr]">
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-semibold text-[#424242]">Title</span>
                        <select
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-11 w-full rounded-lg border border-[#e0e0e0] bg-white px-3 text-[13px] text-[#1a1a1a] outline-none transition focus:border-[#EF6614] focus:ring-2 focus:ring-[#EF6614]/10"
                        >
                          <option>Mr</option>
                          <option>Ms</option>
                          <option>Mrs</option>
                          <option>Dr</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-semibold text-[#424242]">First Name <span className="text-[#EF6614]">*</span></span>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="As on ID proof"
                          className="h-11 w-full rounded-lg border border-[#e0e0e0] px-3 text-[13px] text-[#1a1a1a] outline-none transition placeholder:text-[#bdbdbd] focus:border-[#EF6614] focus:ring-2 focus:ring-[#EF6614]/10"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-semibold text-[#424242]">Last Name <span className="text-[#EF6614]">*</span></span>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="As on ID proof"
                          className="h-11 w-full rounded-lg border border-[#e0e0e0] px-3 text-[13px] text-[#1a1a1a] outline-none transition placeholder:text-[#bdbdbd] focus:border-[#EF6614] focus:ring-2 focus:ring-[#EF6614]/10"
                        />
                      </label>
                    </div>

                    <p className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-widest text-[#9E9E9E]">Contact Information</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-semibold text-[#424242]">Email Address <span className="text-[#EF6614]">*</span></span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@email.com"
                          className="h-11 w-full rounded-lg border border-[#e0e0e0] px-3 text-[13px] text-[#1a1a1a] outline-none transition placeholder:text-[#bdbdbd] focus:border-[#EF6614] focus:ring-2 focus:ring-[#EF6614]/10"
                        />
                        <p className="mt-1 text-[10px] text-[#9E9E9E]">Booking confirmation sent here</p>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-semibold text-[#424242]">Mobile Number <span className="text-[#EF6614]">*</span></span>
                        <div className="flex gap-2">
                          <select className="h-11 w-[68px] shrink-0 rounded-lg border border-[#e0e0e0] bg-white px-2 text-[13px] text-[#1a1a1a] outline-none transition focus:border-[#EF6614]">
                            <option>+91</option>
                          </select>
                          <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="10-digit mobile"
                            className="h-11 min-w-0 flex-1 rounded-lg border border-[#e0e0e0] px-3 text-[13px] text-[#1a1a1a] outline-none transition placeholder:text-[#bdbdbd] focus:border-[#EF6614] focus:ring-2 focus:ring-[#EF6614]/10"
                          />
                        </div>
                        <p className="mt-1 text-[10px] text-[#9E9E9E]">OTP for booking confirmation</p>
                      </label>
                    </div>
                  </div>
                </section>

                {/* ── 4. Important Information ── */}
                <section className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">
                  <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3.5">
                    <p className="text-[13px] font-bold text-[#1a1a1a]">Important Information</p>
                  </div>
                  <div className="grid gap-0 divide-y divide-[#f5f5f5] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    {[
                      { icon: "🕐", title: "Check-in Time", detail: "From 2:00 PM onwards", note: "Early check-in subject to availability" },
                      { icon: "🕙", title: "Check-out Time", detail: "By 12:00 PM (noon)", note: "Late check-out may incur extra charges" },
                      { icon: "🪪", title: "ID Required", detail: "Valid government photo ID", note: "Aadhar, Passport, Driving Licence, Voter ID" },
                      { icon: "🐾", title: "Pets Policy", detail: "Pets not allowed", note: "Service animals may be permitted on request" },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3 px-5 py-4">
                        <span className="mt-0.5 text-[20px] leading-none">{item.icon}</span>
                        <div>
                          <p className="text-[12px] font-bold text-[#1a1a1a]">{item.title}</p>
                          <p className="mt-0.5 text-[12px] text-[#424242]">{item.detail}</p>
                          <p className="mt-0.5 text-[11px] text-[#9E9E9E]">{item.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── 5. Special Requests (optional) ── */}
                <section className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">
                  <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-[#1a1a1a]">Special Requests</p>
                      <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-semibold text-[#9E9E9E]">Optional</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#9E9E9E]">Requests are not guaranteed but the hotel will do their best</p>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {["High floor room", "Early check-in", "Late check-out", "Non-smoking room", "Extra pillows", "King bed"].map(req => (
                        <button key={req} type="button" className="rounded-full border border-[#e0e0e0] px-3 py-1 text-[11px] font-medium text-[#616161] transition hover:border-[#EF6614] hover:text-[#EF6614]">
                          + {req}
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Any other requests or preferences for your stay… (e.g. anniversary setup, specific room location)"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-[#e0e0e0] px-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none transition placeholder:text-[#bdbdbd] focus:border-[#EF6614] focus:ring-2 focus:ring-[#EF6614]/10"
                    />
                  </div>
                </section>

                {/* Error */}
                {formError && (
                  <div className="flex items-center gap-3 rounded-xl border border-[#ffcdd2] bg-[#fff5f5] px-4 py-3">
                    <span className="text-[18px]">⚠️</span>
                    <p className="text-[13px] font-medium text-[#c62828]">{formError}</p>
                  </div>
                )}

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm transition hover:border-[#EF6614]/30 hover:bg-[#fffaf7]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#EF6614]"
                  />
                  <span className="text-[12px] leading-relaxed text-[#616161]">
                    I have read and agree to the{" "}
                    <span className="font-semibold text-[#EF6614]">Cancellation Policy</span>,{" "}
                    <span className="font-semibold text-[#EF6614]">Hotel Rules</span>, and{" "}
                    <span className="font-semibold text-[#EF6614]">Terms &amp; Conditions</span>.
                    By proceeding, I confirm that all guest details are accurate.
                  </span>
                </label>

                {/* Support */}
                <div className="overflow-hidden rounded-xl border border-[#f0d9c8] bg-gradient-to-r from-[#fff8f3] to-[#fff3ea]">
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-[14px] font-bold text-[#1a1a1a]">Need help with your booking?</p>
                      <p className="mt-0.5 text-[12px] text-[#9E9E9E]">Our travel experts are available 24/7</p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={siteWhatsAppChatUrl(`Hi, I need help with my hotel booking at ${hotel.name}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden />WhatsApp
                      </a>
                      <a
                        href={siteTelHref()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2 text-[12px] font-bold text-[#424242] shadow-sm transition hover:border-[#EF6614] hover:text-[#EF6614]"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden />Call us
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <div className="overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-sm">

                  {/* Sidebar hotel identity + summary header combined */}
                  <div className="flex items-center gap-2.5 border-b border-[#f0f0f0] px-4 py-2.5">
                    <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md">
                      <Image src={hotel.images[0] ?? ""} alt={hotel.name} fill unoptimized className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-[#1a1a1a]">{hotel.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="h-2 w-2 fill-[#FFC107] text-[#FFC107]" aria-hidden />
                        ))}
                        <span className="ml-1 truncate text-[10px] text-[#9E9E9E]">{hotel.area}</span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#EF6614]/10 px-2 py-0.5 text-[10px] font-bold text-[#EF6614]">
                      {displayRooms}R
                    </span>
                  </div>

                  {/* Editable dates */}
                  <div className="grid grid-cols-2 divide-x divide-[#f0f0f0] border-b border-[#f0f0f0]">
                    <div className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Check-in</p>
                        <button type="button" onClick={() => setEditingCheckIn(!editingCheckIn)} disabled={!!apiBooking} className="rounded p-0.5 text-[#9E9E9E] transition hover:text-[#EF6614] disabled:opacity-40">
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                      {editingCheckIn ? (
                        <input type="date" value={effectiveCheckIn} min={todayIso()} onChange={(e) => handleCheckInChange(e.target.value)} onBlur={() => setEditingCheckIn(false)} autoFocus className="mt-1 w-full rounded border border-[#EF6614] px-1.5 py-1 text-[11px] font-bold text-[#1a1a1a] outline-none" />
                      ) : (
                        <>
                          <p className="mt-0.5 text-[12px] font-bold text-[#1a1a1a]">{checkInLabel.main || "Select"}</p>
                          <p className="text-[10px] text-[#9E9E9E]">{checkInLabel.sub || "From 2:00 PM"}</p>
                        </>
                      )}
                    </div>
                    <div className="px-4 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Check-out</p>
                        <button type="button" onClick={() => setEditingCheckOut(!editingCheckOut)} disabled={!!apiBooking} className="rounded p-0.5 text-[#9E9E9E] transition hover:text-[#EF6614] disabled:opacity-40">
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                      {editingCheckOut ? (
                        <input type="date" value={effectiveCheckOut} min={addDaysToIso(effectiveCheckIn, 1)} onChange={(e) => handleCheckOutChange(e.target.value)} onBlur={() => setEditingCheckOut(false)} autoFocus className="mt-1 w-full rounded border border-[#EF6614] px-1.5 py-1 text-[11px] font-bold text-[#1a1a1a] outline-none" />
                      ) : (
                        <>
                          <p className="mt-0.5 text-[12px] font-bold text-[#1a1a1a]">{checkOutLabel.main || "Select"}</p>
                          <p className="text-[10px] text-[#9E9E9E]">{checkOutLabel.sub || "Until 12:00 PM"}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Guests / nights / rooms — 2×2 grid counters */}
                  <div className="border-b border-[#f0f0f0] px-4 py-3">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                      {/* Nights */}
                      {([
                        { label: "Nights", value: displayNights, onDec: () => handleNightsChange(displayNights - 1), onInc: () => handleNightsChange(displayNights + 1), decDisabled: displayNights <= 1, incDisabled: false, sub: null },
                        { label: "Adults", value: displayAdults, onDec: () => handleAdultsChange(displayAdults - 1), onInc: () => handleAdultsChange(displayAdults + 1), decDisabled: displayAdults <= 1, incDisabled: false, sub: displayAdults >= maxAdultsAllowed ? `Max ${maxOccupancy}/room` : null },
                        { label: "Rooms", value: displayRooms, onDec: () => handleRoomsChange(displayRooms - 1), onInc: () => handleRoomsChange(displayRooms + 1), decDisabled: !!apiBooking || displayRooms <= 1, incDisabled: !!apiBooking || displayRooms >= availableRoomCount, sub: null },
                        { label: "Children", value: localChildren, onDec: removeChild, onInc: addChild, decDisabled: localChildren <= 0, incDisabled: false, sub: "0-5 free · 6-11 bed" },
                      ] as const).map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-lg bg-[#f8f8f8] px-2.5 py-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-[#1a1a1a]">{item.label}</p>
                            {item.sub && <p className="text-[9px] text-[#9E9E9E]">{item.sub}</p>}
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button type="button" onClick={item.onDec} disabled={item.decDisabled} className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-[#424242] transition", item.decDisabled ? "border-[#e0e0e0] text-[#bdbdbd]" : "hover:border-[#EF6614] hover:text-[#EF6614]")}>
                              <Minus className="h-2 w-2" />
                            </button>
                            <span className="w-4 text-center text-[12px] font-bold text-[#1a1a1a]">{item.value}</span>
                            <button type="button" onClick={item.onInc} disabled={item.incDisabled} className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-[#424242] transition", item.incDisabled ? "border-[#e0e0e0] text-[#bdbdbd]" : "hover:border-[#EF6614] hover:text-[#EF6614]")}>
                              <Plus className="h-2 w-2" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {childrenAges.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {childrenAges.map((age, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg bg-[#fafafa] px-2 py-1">
                            <span className="text-[10px] text-[#757575]">Child {idx + 1}</span>
                            <select value={age} onChange={(e) => updateChildAge(idx, Number.parseInt(e.target.value, 10))} className="h-6 w-16 rounded border border-[#e0e0e0] px-1 text-[10px] font-semibold text-[#1a1a1a] outline-none focus:border-[#EF6614]">
                              {Array.from({ length: 18 }, (_, i) => (
                                <option key={i} value={i}>{i} yr{i !== 1 ? "s" : ""}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    {extraBedWarning && <p className="mt-1.5 rounded bg-[#FFF3E0] px-2 py-1 text-[10px] font-medium text-[#E65100]">⚠ {extraBedWarning}</p>}
                    {occupancyWarning && <p className="mt-1.5 rounded bg-[#FFEBEE] px-2 py-1 text-[10px] font-medium text-[#C62828]">⚠ {occupancyWarning}</p>}
                  </div>

                  {/* ── Price Breakdown ── */}
                  <div className="border-b border-[#f0f0f0] px-4 py-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">Price Breakdown</p>
                    <div className="space-y-1.5 text-[12px]">
                      {/* Room cost — uses ratePlan.price (the all-in nightly rate) */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[#616161]">
                          ₹{formatInrAmount(ratePlan.price)}/night × {displayNights} night{displayNights !== 1 ? "s" : ""}
                          {displayRooms > 1 ? ` × ${displayRooms} rooms` : ""}
                        </span>
                        <span className="shrink-0 font-medium text-[#1a1a1a]">
                          ₹{formatInrAmount(ratePlan.price * displayNights * displayRooms)}
                        </span>
                      </div>
                      {/* Rate discount */}
                      {discount > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#2E7D32]">Rate discount</span>
                          <span className="font-semibold text-[#2E7D32]">−₹{formatInrAmount(discount)}</span>
                        </div>
                      )}
                      {/* Taxes */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#616161]">Taxes &amp; fees</span>
                        <span className="font-medium text-[#1a1a1a]">₹{formatInrAmount(taxes)}</span>
                      </div>
                      {/* Child charges */}
                      {estimatedChildCharges > 0 && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#616161]">
                            {extraBedAvailable
                              ? `Extra bed (${chargeableChildCount} child${chargeableChildCount > 1 ? "ren" : ""})`
                              : `Child charges (${chargeableChildCount})`}
                          </span>
                          <span className="font-medium text-[#1a1a1a]">₹{formatInrAmount(estimatedChildCharges)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="px-4 pt-3 pb-4">
                    {/* Total row */}
                    <div className="flex items-center justify-between rounded-xl bg-[#fafafa] px-3 py-2.5">
                      <div>
                        <p className="text-[12px] font-bold text-[#1a1a1a]">
                          {apiBooking ? "Amount Payable" : "Est. Total"}
                        </p>
                        <p className="text-[10px] text-[#9E9E9E]">
                          {apiBooking ? "Confirmed · incl. taxes & fees" : "Estimated · incl. taxes & fees"}
                        </p>
                      </div>
                      <p className="text-[26px] font-extrabold leading-none text-[#EF6614]">₹{formatInrAmount(payTotal)}</p>
                    </div>
                    <p className="mt-1.5 text-right text-[10px] text-[#9E9E9E]">
                      {displayNights} night{displayNights !== 1 ? "s" : ""} · {displayRooms} room{displayRooms !== 1 ? "s" : ""} · {displayAdults} adult{displayAdults !== 1 ? "s" : ""}
                    </p>

                    {/* Savings callout */}
                    {discount > 0 && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f1fdf3] px-3 py-2 text-[12px]">
                        <span className="font-semibold text-[#2E7D32]">You save on this booking</span>
                        <span className="font-bold text-[#2E7D32]">₹{formatInrAmount(discount)}</span>
                      </div>
                    )}

                    {/* Cancellation */}
                    <div className="mt-3">
                      {ratePlan.nonRefundable ? (
                        <div className="flex items-center gap-2 rounded-lg bg-[#fff5f5] px-3 py-2 text-[12px] font-semibold text-[#c62828]">
                          ⚠ Non-refundable — no refund on cancellation
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#2E7D32]">
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                          Free cancellation before check-in
                        </div>
                      )}
                    </div>

                    {/* Hold countdown */}
                    {holdSec != null && !holdExpired && (
                      <div className={cn(
                        "mt-3 flex items-center justify-between rounded-xl px-4 py-2.5 text-[12px] font-bold",
                        holdSec <= 120 ? "bg-[#ffebee] text-[#c62828]" : "bg-[#fff8e1] text-[#e65100]",
                      )}>
                        <span>Room held for</span>
                        <span className="font-mono text-[16px]">{formatCountdown(holdSec)}</span>
                      </div>
                    )}

                    {/* CTA */}
                    {holdExpired ? (
                      <button
                        type="button"
                        onClick={() => void handleRetryBooking()}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c62828] py-4 text-[14px] font-bold text-white transition hover:bg-[#b71c1c]"
                      >
                        Session Expired — Retry
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleContinueBooking()}
                        disabled={continuing || occupancyExceeded}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#EF6614] py-4 text-[16px] font-extrabold text-white shadow-[0_6px_20px_rgba(239,102,20,0.4)] transition hover:bg-[#d95d10] active:scale-[0.98] disabled:opacity-60"
                      >
                        {continuing ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                        ) : occupancyExceeded ? (
                          "Reduce guests or add rooms"
                        ) : !firstName.trim() || !lastName.trim() || !email.trim() || !mobile.trim() ? (
                          "Fill Details to Continue"
                        ) : !auth?.isAuthenticated ? (
                          "Login to Continue"
                        ) : (
                          "Confirm & Proceed to Pay →"
                        )}
                      </button>
                    )}

                    {/* Trust signals */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9E9E9E]">
                        <Lock className="h-3 w-3" aria-hidden />
                        No payment charged at this step
                      </div>
                      <div className="flex items-center justify-center gap-4 text-[10px] text-[#b0b0b0]">
                        <span>🔒 SSL Secured</span>
                        <span>✓ Instant confirmation</span>
                        <span>📧 E-voucher on email</span>
                      </div>
                    </div>
                    <p className="mt-2.5 text-center text-[11px] text-[#9E9E9E]">
                      🔒 No payment charged at this step
                    </p>
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
          setTimeout(() => void handleContinueBooking(), 50);
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
