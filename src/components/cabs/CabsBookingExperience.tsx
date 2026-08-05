"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { DayPicker } from "react-day-picker";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FilePenLine,
  Handshake,
  ListChecks,
  LoaderCircle,
  LocateFixed,
  MapPin,
  MessageCircle,
  Minus,
  PhoneCall,
  Plus,
  Scale,
  ShieldCheck,
  Star,
  SwitchCamera,
  Send,
  UserRoundCheck,
} from "lucide-react";
import {
  estimateCabRoute,
  searchCabLocations,
  type CabLocation,
  type CabRouteEstimate,
} from "@/lib/cabs-location-api";
import { useAuthOptional } from "@/contexts/auth-context";
import { getCabPartnerContext, type CabPartnerContext } from "@/lib/cab-partner-api";
import { createCabTripRequest } from "@/lib/cab-quote-api";
import { BookingAuthModal } from "@/components/hotels/booking-auth-modal";
import { TravellerQuoteRequestsStrip } from "@/components/cabs/TravellerQuoteRequestsStrip";
import { TravelMobileTopShell } from "@/components/home/HeroSection";
import { trackEvent, trackOnce } from "@/lib/marketing-tracking";

type RideType = "hourly" | "airport" | "outstation";
type ScheduleMode = "now" | "schedule";
type OutstationDirection = "one_way" | "round_trip";

const PARTNER_QUOTES = [
  { id: "economy", name: "Economy sedan", partner: "Verified partner", response: "Quote expected in 10–15 min", fare: "From ₹1,450", seats: "AC sedan · 4 seats" },
  { id: "comfort", name: "Comfort SUV", partner: "Verified partner", response: "Quote expected in 15–20 min", fare: "From ₹1,950", seats: "SUV · 6 seats" },
  { id: "premium", name: "Premium traveller", partner: "Verified partner", response: "Quote expected in 20–30 min", fare: "From ₹2,600", seats: "Tempo traveller · 9 seats" },
];

const RIDE_TYPES: { value: RideType; label: string; detail: string }[] = [
  { value: "outstation", label: "Outstation", detail: "Round trip or one-way" },
  { value: "hourly", label: "Hourly rental", detail: "Flexible local travel" },
  { value: "airport", label: "Airport transfer", detail: "Pickup or drop" },
];

/** Matches partner cab categories travellers can prefer (max 8 on API). */
const VEHICLE_CATEGORY_OPTIONS = [
  { value: "hatchback", label: "Hatchback", image: "/images/cabs/fleet-catalog/hatchback.png", seats: "4 seats" },
  { value: "sedan", label: "Sedan", image: "/images/cabs/fleet-catalog/sedan.png", seats: "4 seats" },
  { value: "suv", label: "SUV", image: "/images/cabs/fleet-catalog/suv.png", seats: "6 seats" },
  { value: "innova", label: "Innova", image: "/images/cabs/fleet-catalog/innova.png", seats: "7 seats" },
  { value: "tempo_traveller", label: "Tempo traveller", image: "/images/cabs/fleet-catalog/tempo-traveller.png", seats: "12 seats" },
  { value: "mini_bus", label: "Mini bus", image: "/images/cabs/fleet-catalog/mini-bus.png", seats: "18 seats" },
  { value: "bus", label: "Bus", image: "/images/cabs/fleet-catalog/bus.png", seats: "30+ seats" },
  { value: "luxury", label: "Luxury", image: "/images/cabs/fleet-catalog/luxury.png", seats: "4 seats" },
] as const;

const INITIAL_CAB_TYPES_VISIBLE = 4;

/** Table uses table-fixed so the month grid fills the popover (flex on <tr> is ignored). */
const CAB_DAY_PICKER_CLASSNAMES = {
  root: "relative w-full",
  months: "w-full",
  month: "w-full space-y-3",
  month_caption: "relative flex h-8 items-center justify-center",
  caption_label: "text-sm font-extrabold text-[#302934]",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous: "grid h-8 w-8 place-items-center rounded-lg text-[#665d65] transition hover:bg-orange-50",
  button_next: "grid h-8 w-8 place-items-center rounded-lg text-[#665d65] transition hover:bg-orange-50",
  chevron: "h-4 w-4",
  month_grid: "w-full table-fixed border-collapse",
  weekdays: "border-b border-orange-50",
  weekday: "h-8 w-[14.285%] p-0 text-center text-[10px] font-bold text-[#a0969e]",
  week: "h-10",
  day: "h-10 w-[14.285%] p-0 text-center align-middle",
  day_button: "mx-auto grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold text-[#514953] transition hover:bg-orange-50",
  selected: "[&>button]:bg-[#ef6614] [&>button]:text-white [&>button]:shadow-sm [&>button]:hover:bg-[#d95511]",
  today: "[&>button]:font-black [&>button]:text-[#d95717]",
  disabled: "[&>button]:cursor-not-allowed [&>button]:text-[#d8d1d4] [&>button]:hover:bg-transparent",
  outside: "[&>button]:text-[#c9c2c6]",
} as const;

/** Anchored under the date field (not a fixed bottom sheet). */
const CAB_DATE_POPOVER_CLASS =
  "absolute left-0 right-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-[#eaded6] bg-white p-3 shadow-[0_20px_45px_-20px_rgba(64,34,19,0.45)]";

function parseDateValue(value: string) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toTimeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Scheduled rides can start from 30 minutes ahead (soft lead for partners). */
const SCHEDULE_LEAD_MS = 30 * 60 * 1000;

function earliestScheduleAt(from = new Date()) {
  return new Date(from.getTime() + SCHEDULE_LEAD_MS);
}

/** Default slot: round up to the next 15 minutes after the 30-min lead. */
function earliestScheduleSlot(from = new Date()) {
  const date = earliestScheduleAt(from);
  const minutes = date.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  if (rounded === 60) {
    date.setHours(date.getHours() + 1, 0, 0, 0);
  } else {
    date.setMinutes(rounded, 0, 0);
  }
  return {
    date: toDateValue(date),
    time: toTimeValue(date),
    at: date,
  };
}

/** Product rule: "Schedule ride" is always for next day 09:00 AM only. */
function tomorrowNineSlot(from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return {
    date: toDateValue(date),
    time: toTimeValue(date),
    at: date,
  };
}

function combineDateTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return null;
  return new Date(`${dateValue}T${timeValue}:00`);
}

function isScheduleAtLeast24h(dateValue: string, timeValue: string, from = new Date()) {
  const at = combineDateTime(dateValue, timeValue);
  if (!at) return false;
  return at.getTime() >= earliestScheduleAt(from).getTime();
}

function displayDate(value: string) {
  if (!value) return "Select date";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parseDateValue(value));
}

export function CabsBookingExperience() {
  const router = useRouter();
  const auth = useAuthOptional();
  const [rideType, setRideType] = useState<RideType>("outstation");
  const [outstationDirection, setOutstationDirection] = useState<OutstationDirection>("one_way");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("schedule");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [pickupLocation, setPickupLocation] = useState<CabLocation | null>(null);
  const [dropLocation, setDropLocation] = useState<CabLocation | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<CabLocation[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<CabLocation[]>([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [routeEstimate, setRouteEstimate] = useState<CabRouteEstimate | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("18:00");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedCab, setSelectedCab] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<"quotes" | "signin">("signin");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [partnerContext, setPartnerContext] = useState<CabPartnerContext | null>(null);
  const [postingRequest, setPostingRequest] = useState(false);
  const [authUiReady, setAuthUiReady] = useState(false);
  /** Mobile wizard: 0 route → 1 when/travellers → 2 preferences + submit */
  const [mobileStep, setMobileStep] = useState(0);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [showAllCabTypes, setShowAllCabTypes] = useState(false);
  const pendingQuoteSubmitRef = useRef(false);

  useEffect(() => {
    setAuthUiReady(true);
    const nextSlot = scheduleMode === "schedule" ? tomorrowNineSlot() : earliestScheduleSlot();
    setTravelDate((current) => current || nextSlot.date);
    setTravelTime(nextSlot.time);
    setReturnDate((current) => current || nextSlot.date);
  }, []);

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) { setPartnerContext(null); return; }
    getCabPartnerContext(token).then(setPartnerContext).catch(() => setPartnerContext(null));
  }, [auth]);

  const earliestSlot = useMemo(() => earliestScheduleSlot(), [
    // Refresh lead boundary roughly when the schedule UI is open / date changes
    scheduleMode, travelDate,
  ]);
  const earliestScheduleDate = earliestSlot.date;
  const earliestScheduleTimeOnMinDay = earliestSlot.time;

  const destinationLabel = rideType === "hourly" ? "Package / area" : "Drop location";
  const isRoundTrip = rideType === "outstation" && outstationDirection === "round_trip";
  const pickupAtPreview = scheduleMode === "now"
    ? new Date(Date.now() + 20 * 60 * 1000)
    : travelDate && travelTime
      ? combineDateTime(travelDate, travelTime)
      : null;
  const returnAtPreview = isRoundTrip && returnDate && returnTime
    ? combineDateTime(returnDate, returnTime)
    : null;
  const returnIsValid = !isRoundTrip || Boolean(
    returnAtPreview && pickupAtPreview && returnAtPreview.getTime() > pickupAtPreview.getTime(),
  );
  const scheduleIsValid = scheduleMode === "now" || isScheduleAtLeast24h(travelDate, travelTime);
  const canSubmit = Boolean(
    pickupLocation
    && (rideType === "hourly" || dropLocation)
    && (scheduleMode === "now" || (travelDate && travelTime && scheduleIsValid))
    && (!isRoundTrip || (returnDate && returnTime && returnIsValid)),
  );
  // Keep the first interaction focused: choose a route before exposing trip details.
  // Auth is deferred until "Get free quotes" — guests can fill the full form first.
  const routeReady = Boolean(pickupLocation && dropLocation);
  const routeDetailsUnlocked = routeReady;

  useEffect(() => {
    if (!routeReady) setMobileStep(0);
  }, [routeReady]);

  useEffect(() => {
    // Mobile UX: when advancing to Step 3 (review), reset scroll so the new panel is visible.
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile && mobileStep === 2) {
      document.getElementById("cab-booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mobileStep]);

  const summary = useMemo(() => {
    const ride = RIDE_TYPES.find((item) => item.value === rideType)?.label ?? "Hourly rental";
    const direction = rideType === "outstation"
      ? (outstationDirection === "round_trip" ? " · Round trip" : " · One-way")
      : "";
    const pickupLabel = scheduleMode === "now" ? "ASAP (~20 min)" : `${travelDate} at ${travelTime}`;
    const returnLabel = isRoundTrip && returnDate
      ? ` · Return ${returnDate} at ${returnTime}`
      : "";
    return `${ride}${direction} · ${travellers} ${travellers === 1 ? "traveller" : "travellers"} · ${pickupLabel}${returnLabel}`;
  }, [rideType, outstationDirection, isRoundTrip, scheduleMode, travelDate, travelTime, returnDate, returnTime, travellers]);

  const swapRoute = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupLocation(dropLocation);
    setDropLocation(pickupLocation);
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setSubmitted(false);
  };

  useEffect(() => {
    if (pickupLocation || pickup.trim().length < 3) {
      setPickupSuggestions([]);
      setPickupLoading(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setPickupLoading(true);
      searchCabLocations(pickup).then((places) => {
        if (active) setPickupSuggestions(places);
      }).catch(() => {
        if (active) {
          setPickupSuggestions([]);
          setLocationError("Couldn’t load location suggestions. Please try again.");
        }
      }).finally(() => {
        if (active) setPickupLoading(false);
      });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [pickup, pickupLocation]);

  useEffect(() => {
    if (dropLocation || drop.trim().length < 3) {
      setDropSuggestions([]);
      setDropLoading(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setDropLoading(true);
      searchCabLocations(drop).then((places) => {
        if (active) setDropSuggestions(places);
      }).catch(() => {
        if (active) {
          setDropSuggestions([]);
          setLocationError("Couldn’t load location suggestions. Please try again.");
        }
      }).finally(() => {
        if (active) setDropLoading(false);
      });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [drop, dropLocation]);

  useEffect(() => {
    if (!pickupLocation || !dropLocation) {
      setRouteEstimate(null);
      setRouteLoading(false);
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    setLocationError("");
    estimateCabRoute(pickupLocation, dropLocation).then((estimate) => {
      if (!cancelled) setRouteEstimate(estimate);
    }).catch(() => {
      if (!cancelled) setLocationError("Couldn’t calculate the driving distance for this route.");
    }).finally(() => {
      if (!cancelled) setRouteLoading(false);
    });
    return () => { cancelled = true; };
  }, [pickupLocation, dropLocation]);

  const useCurrentLocation = () => {
    setLocating(true);
    setError("");
    if (!navigator.geolocation) {
      setLocating(false);
      setError("Current location is not available in this browser. Enter a pickup instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = (await res.json()) as {
            city?: string;
            locality?: string;
            principalSubdivision?: string;
            countryName?: string;
          };
          const city = (data.city || data.locality || "").trim();
          if (!city) {
            setError("Could not resolve your city. Please type a pickup location.");
            setLocating(false);
            return;
          }
          const label = [city, data.principalSubdivision].filter(Boolean).join(", ");
          setPickup(label);
          setPickupLocation({
            place_id: `current:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
            label,
            locality: city,
            district: city,
            state: data.principalSubdivision || null,
            country: data.countryName || "India",
            latitude,
            longitude,
          });
        } catch {
          setError("Could not resolve your city. Please type a pickup location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("We couldn’t access your location. Enter a pickup instead.");
      },
      { timeout: 8000 },
    );
  };

  const postTripRequest = async () => {
    const accessToken = auth?.getAccessToken();
    if (!accessToken) {
      trackEvent("cab_login_prompted", { step: "trip_request", ride_type: rideType });
      setAuthModalOpen(true);
      return;
    }
    setError("");
    setSelectedCab(null);
    setPostingRequest(true);
    try {
      const pickupAt = scheduleMode === "now"
        ? new Date(Date.now() + 20 * 60 * 1000)
        : combineDateTime(travelDate, travelTime);
      if (!pickupAt) {
        setError("Choose a pickup date and time.");
        return;
      }
      if (scheduleMode === "schedule" && pickupAt.getTime() < earliestScheduleAt().getTime()) {
        setError("Scheduled pickup must be at least 30 minutes from now. Pick a later time.");
        return;
      }
      const tripType = rideType === "airport"
        ? "airport_transfer"
        : rideType === "hourly"
          ? "hourly_rental"
          : outstationDirection;
      const returnAt = tripType === "round_trip"
        ? new Date(`${returnDate}T${returnTime}:00`)
        : null;
      if (returnAt && returnAt.getTime() <= pickupAt.getTime()) {
        setError("Return date and time must be after pickup.");
        return;
      }
      const result = await createCabTripRequest(accessToken, {
        trip_type: tripType,
        pickup_address: pickupLocation?.label || pickup,
        pickup_city: pickupLocation?.locality || pickupLocation?.district || pickup,
        pickup_state: pickupLocation?.state || null,
        drop_address: dropLocation?.label || drop || pickupLocation?.label || pickup,
        drop_city: dropLocation?.locality || dropLocation?.district || drop || pickupLocation?.locality || pickup,
        drop_state: dropLocation?.state || pickupLocation?.state || null,
        pickup_at: pickupAt.toISOString(),
        passengers: travellers,
        preferred_vehicle_categories: preferredCategories,
        additional_requirements: requirements.trim() || null,
        return_at: returnAt ? returnAt.toISOString() : null,
        notify_whatsapp: notifyWhatsApp,
      });
      trackEvent("cab_trip_request_submitted", {
        request_id: result.id,
        ride_type: rideType,
        trip_type: tripType,
        passengers: travellers,
        preferred_vehicle_count: preferredCategories.length,
        notify_whatsapp: notifyWhatsApp,
      });
      try {
        sessionStorage.setItem("uno_cabs_notify_whatsapp", notifyWhatsApp ? "1" : "0");
      } catch {
        /* ignore */
      }
      try {
        const key = "uno_cabs_my_trip_requests";
        const prev = JSON.parse(sessionStorage.getItem(key) || "[]") as unknown[];
        const next = [result, ...(Array.isArray(prev) ? prev.filter((r) => (r as { id?: string }).id !== result.id) : [])].slice(0, 5);
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore cache write errors */
      }
      router.push(`/cabs/quotes?request=${encodeURIComponent(result.id)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not post your trip request. Please try again.");
    } finally {
      setPostingRequest(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setSubmitted(false);
      if (isRoundTrip && (!returnDate || !returnTime || !returnIsValid)) {
        setError("Choose a return date and time after pickup for your round trip.");
      } else if (scheduleMode === "schedule" && !scheduleIsValid) {
        setError("Scheduled pickup must be at least 30 minutes from now. Pick a later time.");
      } else if (scheduleMode === "schedule") {
        setError("Select pickup, destination, date and time to see cabs.");
      } else {
        setError("Select a pickup and destination to see cabs.");
      }
      return;
    }
    if (!auth?.getAccessToken()) {
      setError("");
      pendingQuoteSubmitRef.current = true;
      setAuthModalIntent("quotes");
      setAuthModalOpen(true);
      return;
    }
    await postTripRequest();
  };

  return (
    <div className="min-h-screen bg-[#fffaf7] text-[#272129]">
      <TravelMobileTopShell activeId="cabs" showGreeting={false} compact />

      <header className="sticky top-0 z-40 hidden border-b border-orange-100/70 bg-white/95 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="relative block h-9 w-[118px] shrink-0" aria-label="UNO Trips home">
            <Image src="/images/homelogo-transparent.png" alt="UNO Trips" fill sizes="118px" className="object-contain object-left" priority />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link href="/cabs/list-your-cab" className="hidden min-h-10 items-center rounded-full border border-orange-200 px-3 text-sm font-bold text-[#d95717] transition hover:border-[#ef6614] hover:bg-orange-50 lg:inline-flex">
              List your cab
            </Link>
            <a href="tel:+919999999999" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-[#514953] hover:bg-orange-50 sm:px-3">
              <CircleHelp className="h-4 w-4 text-[#ef6614]" /> <span className="hidden sm:inline">Help</span>
            </a>
            {!authUiReady ? (
              <span className="inline-flex min-h-10 min-w-[88px] items-center rounded-full border border-[#e6ded9] px-3 text-sm font-semibold text-transparent" aria-hidden>
                Sign in
              </span>
            ) : auth?.isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 text-sm font-bold text-[#403842] transition hover:border-[#ef6614]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ef6614] text-[10px] text-white">
                    {(auth.user?.name || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate">{auth.user?.name || "My account"}</span>
                  <ChevronRight className={`h-3.5 w-3.5 transition ${accountMenuOpen ? "rotate-90" : ""}`} />
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-orange-100 bg-white p-2 shadow-[0_18px_42px_-18px_rgba(64,34,19,0.35)]">
                    {(() => {
                      const isApprovedPartner = partnerContext?.application?.onboarding_status === "approved";
                      const isPartnerApplicant =
                        !!partnerContext?.is_cab_partner ||
                        partnerContext?.application?.onboarding_status === "submitted" ||
                        partnerContext?.application?.onboarding_status === "draft";

                      if (isApprovedPartner) {
                        return (
                          <>
                            <p className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500">Cab partner account</p>
                            <Link
                              href="/cabs/partner/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="block rounded-xl px-3 py-2.5 hover:bg-orange-50"
                            >
                              <strong className="block text-sm text-[#302834]">Go to dashboard</strong>
                              <small className="mt-0.5 block text-xs text-[#766d76]">Quotes, bookings, vehicles and payouts</small>
                            </Link>
                          </>
                        );
                      }

                      if (isPartnerApplicant) {
                        return (
                          <>
                            <p className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500">Cab partner account</p>
                            <Link
                              href="/cabs/list-your-cab"
                              onClick={() => setAccountMenuOpen(false)}
                              className="block rounded-xl px-3 py-2.5 hover:bg-orange-50"
                            >
                              <strong className="block text-sm text-[#302834]">Application status</strong>
                              <small className="mt-0.5 block text-xs text-[#766d76]">
                                {partnerContext?.application?.onboarding_status === "submitted"
                                  ? "Under review"
                                  : "Continue your application"}
                              </small>
                            </Link>
                          </>
                        );
                      }

                      return (
                        <>
                          <p className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500">Traveller account</p>
                          <Link
                            href="/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block rounded-xl px-3 py-2.5 hover:bg-orange-50"
                          >
                            <strong className="block text-sm text-[#302834]">Go to dashboard</strong>
                            <small className="mt-0.5 block text-xs text-[#766d76]">Bookings, quotes and payments</small>
                          </Link>
                        </>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        auth.logout();
                      }}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center rounded-full border border-[#e6ded9] px-3 text-sm font-semibold text-[#403842] transition hover:border-[#ef6614] hover:text-[#ef6614]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <TravellerQuoteRequestsStrip />

      <BookingAuthModal
        open={authModalOpen}
        onClose={() => {
          pendingQuoteSubmitRef.current = false;
          setAuthModalOpen(false);
        }}
        onSuccess={() => {
          const shouldPost = pendingQuoteSubmitRef.current;
          pendingQuoteSubmitRef.current = false;
          setAuthModalOpen(false);
          if (shouldPost) void postTripRequest();
        }}
        title={authModalIntent === "quotes" ? "Sign in to get your free quotes" : "Login to continue"}
        subtitle={authModalIntent === "quotes" ? "Your trip details are saved. Sign in so partners can send quotes to your account." : "Sign in to manage your trips and bookings"}
        footerNote={authModalIntent === "quotes" ? "Sign in or sign up to post this request." : "Sign in or sign up to continue."}
      />

      <main className="flex flex-col">
        <section className="order-2 relative isolate overflow-hidden bg-[radial-gradient(circle_at_80%_48%,#ffe2d3_0%,#fff8f4_34%,#fffdfb_64%,#ffffff_100%)]">
          <div className="pointer-events-none absolute -right-20 top-16 h-[520px] w-[520px] rounded-full border border-orange-200/60" />
          <div className="pointer-events-none absolute right-[19%] top-28 h-[420px] w-[420px] rounded-full border border-orange-100" />
          <div className="pointer-events-none absolute left-[49%] top-48 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_0_8px_rgba(239,102,20,0.08)]" />
          <div className="relative mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-8 lg:px-8 lg:py-16">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide text-[#df5715] shadow-[0_10px_26px_-20px_rgba(239,102,20,0.7)]">
                <BadgeCheck className="h-4 w-4" /> Verified cab partners
              </span>
              <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-[#211b21] sm:text-5xl lg:text-[4.25rem]">
                One request.<br />
                <span className="text-[#ef6614]">Multiple quotes.</span><br />
                Better choice.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#70656b] sm:text-lg sm:leading-8">
                Tell us where and when you want to travel. Relevant verified cab partners send their best available quotes for you to compare.
              </p>
              <div className="mt-7 grid max-w-lg grid-cols-3 gap-3 text-center sm:gap-4">
                {[
                  { icon: Scale, label: "Compare fares" },
                  { icon: ShieldCheck, label: "Verified partners" },
                  { icon: MessageCircle, label: "Choose with confidence" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="min-w-0">
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-[#ef6614] sm:h-11 sm:w-11"><Icon className="h-5 w-5" /></span>
                    <p className="mt-2 text-[11px] font-bold leading-4 text-[#554b52] sm:text-xs">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => document.getElementById("cab-booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ef6614] px-5 text-sm font-extrabold text-white shadow-[0_15px_28px_-14px_rgba(239,102,20,0.9)] transition hover:-translate-y-0.5 hover:bg-[#d95511]">
                  Get free quotes <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/cabs/list-your-cab" className="hidden min-h-12 items-center gap-2 rounded-xl border border-orange-200 bg-white/80 px-5 text-sm font-extrabold text-[#d95717] transition hover:border-[#ef6614] hover:bg-orange-50 sm:inline-flex">
                  <CarFront className="h-4 w-4" /> List your cab
                </Link>
              </div>
              <p className="mt-3 text-xs font-medium text-[#887b82]">Free to request. Nothing is booked until you choose a quote.</p>
            </div>

            <div className="relative mx-auto hidden h-[430px] w-full max-w-[520px] lg:block" aria-label="UNO Cabs app preview">
              <div className="absolute right-[58px] top-0 h-[396px] w-[201px] rotate-[9deg] drop-shadow-[0_25px_20px_rgba(44,24,15,0.28)]">
                <Image src="/images/cabs/uno-cabs-partner-phone-cutout-v1.png" alt="UNO Cab Partner app showing a trip request" fill sizes="201px" className="object-contain" />
              </div>
              <div className="absolute bottom-[-10px] left-[92px] z-10 h-[402px] w-[204px] -rotate-[9deg] drop-shadow-[0_25px_20px_rgba(44,24,15,0.3)]">
                <Image src="/images/cabs/uno-cabs-traveller-phone-cutout-v1.png" alt="UNO Cabs traveller app comparing quotes" fill sizes="204px" className="object-contain" />
              </div>
              <div className="absolute right-0 top-10 z-20 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_18px_40px_-20px_rgba(81,44,21,0.35)] backdrop-blur">
                <span className="flex items-center gap-2 text-sm font-extrabold text-[#403842]"><Star className="h-4 w-4 fill-orange-400 text-orange-400" /> Compare real offers</span>
              </div>
              <div className="absolute bottom-7 left-0 z-20 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_18px_40px_-20px_rgba(81,44,21,0.35)] backdrop-blur">
                <span className="flex items-center gap-2 text-xs font-extrabold text-[#403842]"><BadgeCheck className="h-4 w-4 text-[#ef6614]" /> Fare, cab and inclusions</span>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 relative overflow-visible bg-[linear-gradient(110deg,#fff8f2_0%,#fffdfb_50%,#f2f8fb_100%)]">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-8 pb-14 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <form id="cab-booking-form" noValidate onFocus={() => trackOnce("cab_trip_form_started", "cab_trip_form_started", { ride_type: rideType })} onSubmit={submit} className="relative flex w-full flex-col rounded-3xl border border-[#eee3dc] bg-white p-4 shadow-[0_22px_55px_-28px_rgba(71,38,16,0.45)] sm:p-6 lg:p-8">
              <div className="order-0 mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ef6614]">
                    {mobileStep === 0 && "Step 1 of 4 · Request"}
                    {mobileStep === 1 && "Step 2 of 4 · When & cab"}
                    {mobileStep >= 2 && "Step 3 of 4 · Review"}
                    <span className="hidden md:inline"> · Request → Quotes → Book → Done</span>
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight">
                    {mobileStep === 0 && "Where would you like to go?"}
                    {mobileStep === 1 && "When & which cab?"}
                    {mobileStep >= 2 && "Review & get free quotes"}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#746a72]">
                    {mobileStep === 0 && "Start with pickup and destination. No login needed yet."}
                    {mobileStep === 1 && "Ride type, pickup time, travellers and cab type."}
                    {mobileStep >= 2 && "Add notes if needed, then request partner quotes."}
                  </p>
                </div>
                <span className="hidden rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#d95717] sm:block">No booking fee</span>
              </div>

              {/* Mobile wizard progress */}
              <ol className="order-0 mb-3 grid grid-cols-3 gap-1.5 md:hidden" aria-label="Booking steps">
                {["Route", "When & cab", "Quotes"].map((label, index) => {
                  const active = mobileStep === index || (index === 2 && mobileStep >= 2);
                  const done = mobileStep > index;
                  return (
                    <li key={label} className={`rounded-lg px-2 py-1.5 text-center text-[10px] font-extrabold ${done || active ? "bg-orange-50 text-[#d95717]" : "bg-slate-50 text-slate-400"}`}>
                      {index + 1}. {label}
                    </li>
                  );
                })}
              </ol>

              {routeDetailsUnlocked && <fieldset className={`order-2 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <legend className="sr-only">Ride type</legend>
                {/* Mobile: keep all 3 ride types in one row. */}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                  {RIDE_TYPES.map(({ value, label, detail }) => (
                    <label key={value} className={`cursor-pointer rounded-xl border p-2 transition ${rideType === value ? "border-[#ef6614] bg-orange-50 text-[#b84710]" : "border-[#ebe5e2] text-[#514953] hover:border-orange-200"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        name="rideType"
                        value={value}
                        checked={rideType === value}
                        onChange={() => {
                          setRideType(value);
                          if (value !== "outstation") setOutstationDirection("one_way");
                          setSubmitted(false);
                        }}
                      />
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="hidden mt-0.5 text-[11px] leading-4 text-[#766d74] sm:block">{detail}</span>
                    </label>
                  ))}
                </div>
              </fieldset>}

              {routeDetailsUnlocked && rideType === "outstation" && (
                <fieldset className={`order-3 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                  <legend className="mb-1.5 text-sm font-bold text-[#403842]">Trip direction <span className="text-[#ef6614]">*</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${outstationDirection === "one_way" ? "border-[#ef6614] bg-orange-50 text-[#b84710]" : "border-[#ebe5e2]"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        name="outstationDirection"
                        checked={outstationDirection === "one_way"}
                        onChange={() => { setOutstationDirection("one_way"); setSubmitted(false); }}
                      />
                      One-way
                      <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Drop at destination</span>
                    </label>
                    <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${outstationDirection === "round_trip" ? "border-[#ef6614] bg-orange-50 text-[#b84710]" : "border-[#ebe5e2]"}`}>
                      <input
                        className="sr-only"
                        type="radio"
                        name="outstationDirection"
                        checked={outstationDirection === "round_trip"}
                        onChange={() => {
                          setOutstationDirection("round_trip");
                          setReturnDate((current) => current || travelDate || earliestScheduleDate);
                          setSubmitted(false);
                        }}
                      />
                      Round trip
                      <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Return to pickup</span>
                    </label>
                  </div>
                </fieldset>
              )}

              <div className={`order-1 mt-3 grid gap-2.5 sm:grid-cols-[1fr_auto_1fr] sm:items-end ${mobileStep > 0 ? "hidden md:grid" : ""}`}>
                <div>
                  <label htmlFor="cab-pickup" className="mb-1 block text-sm font-bold text-[#403842]">Pickup location <span className="text-[#ef6614]">*</span></label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ef6614]" />
                    <input id="cab-pickup" value={pickup} onChange={(event) => { setPickup(event.target.value); setPickupLocation(null); setLocationError(""); setSubmitted(false); }} placeholder="City, town, village or landmark" autoComplete="off" className="h-11 w-full rounded-xl border border-[#ddd5d1] bg-white pl-9 pr-10 text-base outline-none transition placeholder:text-[#9a9198] focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100" />
                    {pickupLoading ? <span role="status" aria-label="Loading pickup suggestions" className="absolute right-4 top-1/2 -translate-y-1/2"><span className="block h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-[#ef6614]" /></span> : <button type="button" onClick={useCurrentLocation} aria-label="Use current location" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#ef6614] hover:bg-orange-50 disabled:opacity-50" disabled={locating}>
                      <LocateFixed className="h-4 w-4" />
                    </button>}
                    {pickupSuggestions.length > 0 && <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-orange-100 bg-white py-1 shadow-[0_18px_36px_-18px_rgba(64,34,19,0.35)]">{pickupSuggestions.map((place) => <li key={place.place_id}><button type="button" onClick={() => { setPickup(place.label); setPickupLocation(place); setPickupSuggestions([]); setLocationError(""); setSubmitted(false); }} className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-orange-50"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ef6614]" /><span><strong className="block text-sm text-[#403842]">{place.locality || place.label.split(",")[0]}</strong><small className="mt-0.5 block text-xs text-[#766d74]">{[place.district, place.state, place.country].filter(Boolean).join(", ") || place.label}</small></span></button></li>)}</ul>}
                  </div>
                </div>
                <button type="button" onClick={swapRoute} aria-label="Swap pickup and drop locations" className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-orange-200 bg-white text-[#ef6614] transition hover:bg-orange-50 sm:mb-1 sm:mx-0">
                  <SwitchCamera className="h-4 w-4" />
                </button>
                <div>
                  <label htmlFor="cab-drop" className="mb-1 block text-sm font-bold text-[#403842]">{destinationLabel} {rideType !== "hourly" && <span className="text-[#ef6614]">*</span>}</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ef6614]" />
                    <input id="cab-drop" value={drop} onChange={(event) => { setDrop(event.target.value); setDropLocation(null); setLocationError(""); setSubmitted(false); }} placeholder={rideType === "hourly" ? "City, town, village or area" : "City, town, village or landmark"} autoComplete="off" className="h-11 w-full rounded-xl border border-[#ddd5d1] bg-white pl-9 pr-10 text-base outline-none transition placeholder:text-[#9a9198] focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100" />
                    {dropLoading && <span role="status" aria-label="Loading destination suggestions" className="absolute right-4 top-1/2 -translate-y-1/2"><span className="block h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-[#ef6614]" /></span>}
                    {dropSuggestions.length > 0 && <ul className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-orange-100 bg-white py-1 shadow-[0_18px_36px_-18px_rgba(64,34,19,0.35)]">{dropSuggestions.map((place) => <li key={place.place_id}><button type="button" onClick={() => { setDrop(place.label); setDropLocation(place); setDropSuggestions([]); setLocationError(""); setSubmitted(false); }} className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-orange-50"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ef6614]" /><span><strong className="block text-sm text-[#403842]">{place.locality || place.label.split(",")[0]}</strong><small className="mt-0.5 block text-xs text-[#766d74]">{[place.district, place.state, place.country].filter(Boolean).join(", ") || place.label}</small></span></button></li>)}</ul>}
                  </div>
                </div>
              </div>
              {(routeLoading || routeEstimate) && <div className={`order-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 ${mobileStep > 0 ? "hidden md:flex" : ""}`}><span className="flex items-center gap-2 text-xs font-bold text-emerald-800"><MapPin className="h-4 w-4 text-emerald-600" />{routeLoading ? "Calculating driving distance…" : "Driving route ready"}</span>{routeEstimate && <strong className="text-xs text-emerald-900">{routeEstimate.distance_km.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km · about {routeEstimate.duration_minutes < 60 ? `${routeEstimate.duration_minutes} min` : `${Math.floor(routeEstimate.duration_minutes / 60)}h ${routeEstimate.duration_minutes % 60 ? `${routeEstimate.duration_minutes % 60}m` : ""}`}</strong>}</div>}

              {routeDetailsUnlocked && <>
              <section aria-label="Number of travellers" className={`order-8 mt-3 flex items-center justify-between gap-4 rounded-xl border border-[#eee3dc] bg-[#fffaf7] px-3 py-2 sm:px-3.5 ${mobileStep !== 1 ? "hidden md:flex" : ""}`}>
                <span className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#ef6614] shadow-sm"><UserRoundCheck className="h-4 w-4" /></span><span className="flex items-baseline gap-1.5"><strong className="text-sm text-[#403842]">Travellers</strong><small className="text-xs text-[#766d74]">incl. children</small></span></span>
                <span className="flex items-center gap-1.5"><button type="button" onClick={() => setTravellers((count) => Math.max(1, count - 1))} disabled={travellers <= 1} aria-label="Remove traveller" className="grid h-11 w-11 place-items-center rounded-xl border border-[#e4dcd8] bg-white text-[#655b64] transition hover:border-orange-300 hover:text-[#ef6614] disabled:cursor-not-allowed disabled:opacity-35"><Minus className="h-4 w-4" /></button><output aria-live="polite" className="min-w-7 text-center text-sm font-extrabold text-[#302934]">{travellers}</output><button type="button" onClick={() => setTravellers((count) => Math.min(50, count + 1))} aria-label="Add traveller" className="grid h-11 w-11 place-items-center rounded-xl border border-orange-200 bg-white text-[#ef6614] transition hover:bg-orange-50"><Plus className="h-4 w-4" /></button></span>
              </section>

              <fieldset className={`order-8 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <legend className="text-sm font-bold text-[#403842]">
                  Cab type you want <span className="font-normal text-[#81777f]">(optional)</span>
                </legend>
                <p className="mt-0.5 text-xs text-[#766d74]">Pick any that work — partners match these first.</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(showAllCabTypes
                    ? VEHICLE_CATEGORY_OPTIONS
                    : VEHICLE_CATEGORY_OPTIONS.slice(0, INITIAL_CAB_TYPES_VISIBLE)
                  ).map(({ value, label, image, seats }) => {
                    const selected = preferredCategories.includes(value);
                    return (
                      <label
                        key={value}
                        className={`relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition ${
                          selected
                            ? "border-[#ef6614] ring-2 ring-orange-100"
                            : "border-[#e8e0db] hover:border-orange-200"
                        }`}
                      >
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setPreferredCategories((current) =>
                              selected
                                ? current.filter((item) => item !== value)
                                : current.length >= 8
                                  ? current
                                  : [...current, value],
                            );
                            setSubmitted(false);
                          }}
                        />
                        <span className="relative mx-auto mt-2 flex h-16 w-full items-center justify-center px-2 sm:h-20">
                          <Image
                            src={image}
                            alt={label}
                            width={160}
                            height={90}
                            className="h-full w-auto max-w-full object-contain"
                            unoptimized
                          />
                          {selected && (
                            <span className="absolute right-1 top-0 grid h-5 w-5 place-items-center rounded-full bg-[#ef6614] text-white shadow-sm">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <span className={`border-t px-2 py-2 text-center ${selected ? "border-orange-100 bg-orange-50/70" : "border-[#f3eeea]"}`}>
                          <strong className={`block text-[12px] font-extrabold sm:text-sm ${selected ? "text-[#b84710]" : "text-[#403842]"}`}>
                            {label}
                          </strong>
                          <small className="mt-0.5 block text-[10px] font-medium text-[#81777f]">{seats}</small>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {VEHICLE_CATEGORY_OPTIONS.length > INITIAL_CAB_TYPES_VISIBLE && (
                  <button
                    type="button"
                    onClick={() => setShowAllCabTypes((open) => !open)}
                    className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-orange-200 bg-orange-50/40 text-sm font-extrabold text-[#d95717] transition hover:bg-orange-50 sm:w-auto sm:px-4"
                  >
                    {showAllCabTypes
                      ? "Show less"
                      : `Show more types (+${VEHICLE_CATEGORY_OPTIONS.length - INITIAL_CAB_TYPES_VISIBLE})`}
                    <ChevronRight className={`h-4 w-4 transition ${showAllCabTypes ? "-rotate-90" : "rotate-90"}`} />
                  </button>
                )}
                {preferredCategories.length > 0 && (
                  <p className="mt-2 text-[11px] font-semibold text-[#d95717]">
                    {preferredCategories.length} selected · leave empty for any cab type
                  </p>
                )}
              </fieldset>

              <fieldset className={`order-5 mt-3 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <legend className="mb-1.5 text-sm font-bold text-[#403842]">Pickup time <span className="text-[#ef6614]">*</span></legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${scheduleMode === "now" ? "border-[#ef6614] bg-orange-50 text-[#b84710]" : "border-[#ebe5e2]"}`}><input className="sr-only" type="radio" name="schedule" checked={scheduleMode === "now"} onChange={() => { setScheduleMode("now"); setSubmitted(false); }} />ASAP (~20 min) <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Soonest partner pickup</span></label>
                  <label className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${scheduleMode === "schedule" ? "border-[#ef6614] bg-orange-50 text-[#b84710]" : "border-[#ebe5e2]"}`}><input className="sr-only" type="radio" name="schedule" checked={scheduleMode === "schedule"} onChange={() => {
                    setScheduleMode("schedule");
                    const slot = tomorrowNineSlot();
                    setTravelDate(slot.date);
                    setTravelTime(slot.time);
                    setSubmitted(false);
                  }} />Schedule ride <span className="mt-0.5 block text-xs font-normal text-[#766d74]">Prefilled · tomorrow 09:00 AM</span></label>
                </div>
              </fieldset>

              {scheduleMode === "schedule" && <section aria-label="Schedule your pickup" className={`order-6 mt-2 overflow-visible rounded-xl border border-orange-100 bg-orange-50/40 p-2.5 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
                  <div className="flex items-center gap-2 pb-0.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#ef6614] shadow-sm"><CalendarDays className="h-4 w-4" /></span><div><h3 className="text-sm font-extrabold text-[#403842]">Schedule pickup</h3><p className="text-[11px] text-[#766d74]">Prefilled: tomorrow 09:00 AM</p></div></div>
                  <div className="relative"><label id="cab-date-label" className="mb-1 block text-xs font-bold text-[#514953]">Date <span className="text-[#ef6614]">*</span></label><button type="button" aria-labelledby="cab-date-label" aria-haspopup="dialog" aria-expanded={calendarOpen} onClick={() => { setCalendarOpen((open) => !open); setReturnCalendarOpen(false); }} className="flex h-11 w-full items-center justify-between rounded-lg border border-[#ddd5d1] bg-white px-3 text-left text-sm font-semibold text-[#403842] outline-none transition hover:border-orange-300 focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#ef6614]" />{displayDate(travelDate)}</span><ChevronRight className={`h-4 w-4 text-[#766d74] transition ${calendarOpen ? "rotate-90" : ""}`} /></button>{calendarOpen && <div role="dialog" aria-label="Choose pickup date" className={CAB_DATE_POPOVER_CLASS}><DayPicker mode="single" animate selected={parseDateValue(travelDate || earliestScheduleDate)} disabled={{ before: parseDateValue(earliestScheduleDate) }} onSelect={(date) => { if (date) { const next = toDateValue(date); setTravelDate(next); if (next === earliestScheduleDate) { setTravelTime((current) => (!current || current < earliestScheduleTimeOnMinDay ? earliestScheduleTimeOnMinDay : current)); } if (returnDate && returnDate < next) setReturnDate(next); setCalendarOpen(false); setSubmitted(false); } }} classNames={CAB_DAY_PICKER_CLASSNAMES} /></div>}</div>
                  <div><label htmlFor="cab-time" className="mb-1 block text-xs font-bold text-[#514953]">Time <span className="text-[#ef6614]">*</span></label><div className="relative min-w-0"><Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ef6614]" /><input id="cab-time" type="time" value={travelTime} min={travelDate === earliestScheduleDate ? earliestScheduleTimeOnMinDay : undefined} onChange={(event) => { const next = event.target.value; if (travelDate === earliestScheduleDate && next < earliestScheduleTimeOnMinDay) { setTravelTime(earliestScheduleTimeOnMinDay); setError("Pickup must be at least 30 minutes from now."); } else { setTravelTime(next); setError(""); } setSubmitted(false); }} className="h-11 min-w-0 w-full max-w-full overflow-hidden rounded-lg border border-[#ddd5d1] bg-white pl-9 pr-3 text-left text-sm font-semibold text-[#403842] outline-none focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100 [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0 [&::-webkit-datetime-edit]:min-w-0" /></div></div>
                </div>
                {!scheduleIsValid && (
                  <p role="status" className="mt-2 text-xs font-medium text-amber-800">
                    Pickup must be at least 30 minutes from now (earliest: {displayDate(earliestScheduleDate)} at {earliestScheduleTimeOnMinDay}).
                  </p>
                )}
              </section>}

              {isRoundTrip && (
                <section aria-label="Schedule your return" className={`order-7 mt-2 overflow-visible rounded-xl border border-orange-100 bg-orange-50/40 p-2.5 ${mobileStep !== 1 ? "hidden md:block" : ""}`}>
                  <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
                    <div className="flex items-center gap-2 pb-0.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#ef6614] shadow-sm">
                        <CalendarDays className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#403842]">Return trip</h3>
                        <p className="hidden text-[11px] text-[#766d74] sm:block">When you head back</p>
                      </div>
                    </div>
                    <div className="relative">
                      <label id="cab-return-date-label" className="mb-1 block text-xs font-bold text-[#514953]">
                        Return date <span className="text-[#ef6614]">*</span>
                      </label>
                      <button
                        type="button"
                        aria-labelledby="cab-return-date-label"
                        aria-haspopup="dialog"
                        aria-expanded={returnCalendarOpen}
                        onClick={() => { setReturnCalendarOpen((open) => !open); setCalendarOpen(false); }}
                        className="flex h-10 w-full items-center justify-between rounded-lg border border-[#ddd5d1] bg-white px-3 text-left text-sm font-semibold text-[#403842] outline-none transition hover:border-orange-300 focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
                      >
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#ef6614]" />
                          {displayDate(returnDate)}
                        </span>
                        <ChevronRight className={`h-4 w-4 text-[#766d74] transition ${returnCalendarOpen ? "rotate-90" : ""}`} />
                      </button>
                      {returnCalendarOpen && (
                        <div
                          role="dialog"
                          aria-label="Choose return date"
                          className={CAB_DATE_POPOVER_CLASS}
                        >
                          <DayPicker
                            mode="single"
                            animate
                            selected={parseDateValue(returnDate || travelDate || earliestScheduleDate)}
                            disabled={{ before: parseDateValue(travelDate || earliestScheduleDate) }}
                            onSelect={(date) => {
                              if (date) {
                                setReturnDate(toDateValue(date));
                                setReturnCalendarOpen(false);
                                setSubmitted(false);
                              }
                            }}
                            classNames={CAB_DAY_PICKER_CLASSNAMES}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cab-return-time" className="mb-1 block text-xs font-bold text-[#514953]">
                        Return time <span className="text-[#ef6614]">*</span>
                      </label>
                      <div className="relative min-w-0">
                        <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ef6614]" />
                        <input
                          id="cab-return-time"
                          type="time"
                          value={returnTime}
                          onChange={(event) => { setReturnTime(event.target.value); setSubmitted(false); }}
                          className="h-10 min-w-0 w-full max-w-full overflow-hidden rounded-lg border border-[#ddd5d1] bg-white pl-9 pr-3 text-left text-sm font-semibold text-[#403842] outline-none focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100 [&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-datetime-edit-fields-wrapper]:min-w-0 [&::-webkit-datetime-edit]:min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                  {isRoundTrip && returnDate && returnTime && !returnIsValid && (
                    <p role="status" className="mt-2 text-xs font-medium text-amber-800">
                      Return must be after pickup time.
                    </p>
                  )}
                </section>
              )}

              <details className={`order-9 mt-2 rounded-xl bg-[#fffaf7] px-3 py-2 ${mobileStep < 2 ? "hidden md:block" : ""}`} open={mobileStep >= 2 || undefined}>
                <summary className="cursor-pointer text-sm font-bold text-[#534a53]">
                  Special requirements <span className="font-normal text-[#81777f]">(optional)</span>
                </summary>

                {preferredCategories.length > 0 && (
                  <p className="mt-3 text-xs font-semibold text-[#514953]">
                    Cab types:{" "}
                    <span className="text-[#d95717]">
                      {preferredCategories
                        .map((value) => VEHICLE_CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label || value)
                        .join(", ")}
                    </span>
                  </p>
                )}

                <label htmlFor="cab-requirements" className="mt-3 block text-sm font-bold text-[#403842]">
                  Notes for partners
                </label>
                <textarea
                  id="cab-requirements"
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  rows={2}
                  placeholder="Child seat, accessibility needs, extra luggage…"
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#ddd5d1] bg-white px-3 py-2.5 text-base outline-none placeholder:text-[#9a9198] focus:border-[#ef6614] focus:ring-4 focus:ring-orange-100"
                />
              </details>

              {mobileStep >= 2 && (
                <label className="order-9 mt-3 flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-3 text-sm md:hidden">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="mt-0.5 h-5 w-5 accent-[#ef6614]"
                  />
                  <span>
                    <strong className="block font-extrabold text-[#403842]">Notify me on WhatsApp</strong>
                    <span className="mt-0.5 block text-xs text-[#746a73]">We’ll message you when the first partner quote arrives. You can leave this page.</span>
                  </span>
                </label>
              )}
              <label className={`order-9 mt-3 hidden items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-3 text-sm md:flex ${!routeDetailsUnlocked ? "md:hidden" : ""}`}>
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-[#ef6614]"
                />
                <span>
                  <strong className="block font-extrabold text-[#403842]">Notify me on WhatsApp when quotes arrive</strong>
                  <span className="mt-0.5 block text-xs text-[#746a73]">We’ll keep matching partners even if you leave this page. Check My quotes anytime.</span>
                </span>
              </label>
              </>}

              {locationError && <p role="status" className="order-10 mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800">{locationError}</p>}
              {error && <p role="alert" className="order-11 mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}

              {/* Desktop / in-form CTAs */}
              <div className="order-12 mt-3 hidden md:block">
                {!routeReady ? (
                  <button type="submit" disabled className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-5 text-base font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.9)] disabled:cursor-not-allowed disabled:opacity-45">
                    Choose pickup and destination <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button type="submit" disabled={postingRequest || !canSubmit} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-5 text-base font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.9)] transition hover:bg-[#d95511] focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-45">
                    {postingRequest ? "Posting your request…" : "Get free quotes"} <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                <p className="mt-1.5 text-center text-xs leading-4 text-[#7c727a]">Free request · No booking until you choose a quote · Sign in only when you submit</p>
              </div>

              {/* Mobile wizard CTAs — inside the form card only */}
              <div className="order-12 mt-3 flex gap-2 md:hidden">
                {mobileStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setMobileStep((step) => Math.max(0, step - 1))}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e4dbd5] px-4 text-sm font-extrabold text-[#514953]"
                  >
                    Back
                  </button>
                )}
                {mobileStep === 0 && (
                  <button
                    type="button"
                    disabled={!routeReady}
                    onClick={() => setMobileStep(1)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-5 text-base font-extrabold text-white disabled:opacity-45"
                  >
                    Next · When <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                {mobileStep === 1 && (
                  <button
                    type="button"
                    disabled={!(scheduleMode === "now" || (travelDate && travelTime)) || (isRoundTrip && !returnIsValid)}
                    onClick={() => setMobileStep(2)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-5 text-base font-extrabold text-white disabled:opacity-45"
                  >
                    Next · Review <ArrowRight className="h-5 w-5" />
                  </button>
                )}
                {mobileStep >= 2 && (
                  <button
                    type="submit"
                    disabled={postingRequest || !canSubmit}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-5 text-base font-extrabold text-white disabled:opacity-45"
                  >
                    {postingRequest ? "Posting…" : "Get free quotes"} <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
              <p className="order-[13] mt-1.5 text-center text-xs leading-4 text-[#7c727a] md:hidden">Free request · Nothing booked until you choose a quote.</p>
            </form>
          </div>
        </section>

        {submitted && <section aria-live="polite" className="mx-auto max-w-6xl px-4 py-5 sm:px-6"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-emerald-600"><Check className="h-5 w-5" /></span><div><h2 className="font-extrabold text-emerald-950">Your request is ready to share</h2><p className="mt-0.5 text-sm text-emerald-800">{pickup} {rideType !== "hourly" ? `→ ${drop}` : `· ${drop}`} · {summary}</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-3">{PARTNER_QUOTES.map((quote) => <article key={quote.id} className={`rounded-xl border bg-white p-4 transition ${selectedCab === quote.id ? "border-emerald-500 ring-2 ring-emerald-200" : "border-emerald-100"}`}><div className="flex items-start justify-between gap-2"><div><h3 className="font-extrabold text-[#292229]">{quote.name}</h3><p className="mt-0.5 text-sm text-[#706771]">{quote.partner} · {quote.seats}</p></div><strong className="text-lg text-[#1d7a52]">{quote.fare}</strong></div><p className="mt-2 text-xs font-medium text-[#706771]">{quote.response}</p><button type="button" aria-pressed={selectedCab === quote.id} onClick={() => setSelectedCab(quote.id)} className={`mt-3 min-h-10 w-full rounded-lg text-sm font-bold transition ${selectedCab === quote.id ? "bg-emerald-600 text-white" : "border border-emerald-300 text-emerald-800 hover:bg-emerald-50"}`}>{selectedCab === quote.id ? "Quote preference saved" : "Prefer this quote"}</button></article>)}</div>{selectedCab && <p className="mt-3 text-sm font-semibold text-emerald-900">Preference saved. We&apos;ll connect you with the relevant cab partner to confirm the final quote and driver details.</p>}</div></section>}

        <div className="order-3">
        <section className="border-y border-orange-100 bg-white"><div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 text-sm sm:grid-cols-3 sm:px-6"><p className="flex items-center gap-2 font-medium"><BadgeCheck className="h-5 w-5 text-[#ef6614]" /> Driver and vehicle details before confirmation</p><p className="flex items-center gap-2 font-medium"><ShieldCheck className="h-5 w-5 text-[#ef6614]" /> Dedicated support throughout your ride</p><p className="flex items-center gap-2 font-medium"><Clock3 className="h-5 w-5 text-[#ef6614]" /> Schedule up to 30 days in advance</p></div></section>

        <section className="relative overflow-hidden bg-[#29232b] py-14 text-white sm:py-16">
          <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-[28%] h-64 w-64 rounded-full bg-rose-300/5 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">How it works</p>
              <h2 className="mt-3 max-w-md text-3xl font-black tracking-tight sm:text-4xl">A better cab booking flow, without the back-and-forth.</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-white/65">Tell us what you need once. Then compare real partner options before you commit.</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-orange-100"><ShieldCheck className="h-4 w-4 text-orange-300" /> No payment until you choose a quote</div>
            </div>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {[{ icon: ClipboardCheck, number: "01", title: "Share your trip", text: "Add your route, pickup time and the cab type you need." }, { icon: Handshake, number: "02", title: "Receive verified quotes", text: "Relevant cab partners respond with their best available options." }, { icon: Scale, number: "03", title: "Compare, then choose", text: "See the fare, vehicle and inclusions before confirming your ride." }].map(({ icon: Icon, number, title, text }) => <li key={number} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 first:pt-0 last:pb-0 sm:gap-5"><span className="text-2xl font-black tracking-tight text-white/25 sm:text-3xl">{number}</span><div><h3 className="text-base font-extrabold text-white sm:text-lg">{title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{text}</p></div><span className="grid h-10 w-10 place-items-center rounded-xl border border-orange-300/20 bg-orange-400/10 text-orange-300 sm:h-11 sm:w-11"><Icon className="h-5 w-5" /></span></li>)}
            </ol>
          </div>
        </section>

        <section className="overflow-hidden bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
            <div className="mx-auto max-w-2xl text-center lg:order-2 lg:mx-0 lg:max-w-md lg:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ef6614]">After you post</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#292229] sm:text-4xl">Know exactly what&apos;s happening with your request.</h2>
              <p className="mt-3 text-base leading-7 text-[#726873]">Follow every step—from sharing the request to receiving quotes and choosing a partner.</p>
              <ul className="mt-6 space-y-3 text-left">
                {["Live request status, not a black box", "Partner-response updates as they happen", "Trip details ready to edit before you choose"].map((item) => <li key={item} className="flex items-start gap-3 text-sm font-semibold text-[#514752]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-50 text-[#ef6614]"><Check className="h-3.5 w-3.5" /></span>{item}</li>)}
              </ul>
            </div>

            <div className="relative mx-auto mt-3 max-w-[332px] sm:hidden" aria-label="UNO Cabs request status on mobile">
              <div className="relative rounded-[40px] bg-[linear-gradient(145deg,#514d55_0%,#17151a_22%,#26232a_100%)] p-[6px] shadow-[0_28px_55px_-22px_rgba(16,13,18,0.7)]">
                <div className="pointer-events-none absolute left-1/2 top-[6px] z-20 h-7 w-24 -translate-x-1/2 rounded-b-[18px] bg-[#111015]" />
                <div className="overflow-hidden rounded-[34px] bg-[#fbfcff] pt-7">
                  <div className="flex h-10 items-center justify-between border-b border-slate-100 px-4 text-[10px] font-bold text-slate-500"><span className="font-black text-[#ef6614]">UNO <span className="text-[#29222b]">CABS</span></span><span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-[#ef6614]" /> Live</span></div>
                  <div className="p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#ef6614]">REQUEST #UC-2481</p>
                    <h3 className="mt-1 text-lg font-black tracking-tight text-[#272129]">Finding the best quotes for you</h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">Your trip is now with relevant verified cab partners.</p>
                    <div className="relative mt-5 grid grid-cols-3 gap-2 text-center"><span className="absolute left-[16%] right-[16%] top-4 h-px bg-orange-200" />{[{ label: "Sent", icon: CheckCircle2, state: "done" }, { label: "Quotes", icon: LoaderCircle, state: "current" }, { label: "Choose", icon: ListChecks, state: "next" }].map(({ label, icon: Icon, state }) => <div key={label} className="relative z-10"><span className={`mx-auto grid h-8 w-8 place-items-center rounded-full border-2 bg-white ${state === "done" ? "border-[#ef6614] bg-[#ef6614] text-white" : state === "current" ? "border-[#ef6614] text-[#ef6614]" : "border-slate-200 text-slate-400"}`}><Icon className={`h-3.5 w-3.5 ${state === "current" ? "animate-spin" : ""}`} /></span><p className={`mt-1 text-[9px] font-bold ${state === "current" ? "text-[#ef6614]" : "text-slate-500"}`}>{label}</p></div>)}</div>
                    <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><p className="text-xs font-extrabold text-[#302934]">Your trip</p><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Partner matching</span></div><div className="mt-3 space-y-2 border-l-2 border-orange-200 pl-3"><p><span className="block text-[9px] font-bold text-slate-400">PICKUP</span><strong className="text-[11px] text-[#302934]">Bandra West, Mumbai</strong></p><p><span className="block text-[9px] font-bold text-slate-400">DROP</span><strong className="text-[11px] text-[#302934]">Pune, Maharashtra</strong></p><p><span className="block text-[9px] font-bold text-slate-400">TRIP</span><strong className="text-[11px] text-[#302934]">Outstation · Today</strong></p></div></article>
                    <article className="mt-3 rounded-2xl bg-[#fff7f2] p-3"><div className="flex items-center justify-between"><p className="text-xs font-extrabold text-[#302934]">Live activity</p><span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</span></div><div className="mt-3 space-y-2 text-[10px]"><p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span><strong className="text-[#302934]">Request submitted</strong><small className="ml-1 text-slate-500">Just now</small></span></p><p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /><span><strong className="text-[#302934]">Sent to partners</strong></span></p><p className="flex items-center gap-2"><LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#ef6614]" /><span className="font-bold text-[#d95717]">Collecting quotes</span></p></div></article>
                    <div className="mt-4 rounded-xl bg-[#ef6614] px-3 py-3 text-center text-[11px] font-extrabold text-white">We&apos;ll notify you when new quotes arrive</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mx-auto mt-2 hidden max-w-5xl pt-1.5 sm:mt-2 sm:block sm:pt-2 lg:-my-14 lg:origin-center lg:scale-[0.84] lg:order-1 lg:mt-0">
              <div className="relative rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,#5a5660_0%,#2b282f_16%,#151419_58%,#37333c_100%)] p-[5px] shadow-[0_34px_70px_-28px_rgba(16,13,18,0.62),0_12px_20px_-16px_rgba(255,255,255,0.55)_inset] sm:rounded-[30px] sm:p-[7px]">
                <div className="pointer-events-none absolute left-1/2 top-[5px] z-10 flex h-3 w-12 -translate-x-1/2 items-center justify-center rounded-b-[9px] bg-[#151419] shadow-[0_1px_1px_rgba(255,255,255,0.12)] sm:top-[7px] sm:h-4 sm:w-16"><span className="h-1 w-1 rounded-full bg-[#667080] shadow-[0_0_2px_1px_rgba(120,154,190,0.38)]" /></div>
                <div className="overflow-hidden rounded-[18px] border border-black/25 bg-[#fbfcff] shadow-[0_1px_0_rgba(255,255,255,0.28)_inset] sm:rounded-[23px]">
                  <div className="flex h-8 items-center justify-between border-b border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-500 sm:px-5 sm:text-xs"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="ml-2 hidden sm:inline">UNO Cabs · Trip request #UC-2481</span></span><span className="flex items-center gap-1"><Bell className="h-3.5 w-3.5 text-[#ef6614]" /> Live updates</span></div>
                  <div className="relative p-3 sm:p-5">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-start sm:justify-between sm:pb-4">
                      <div><p className="text-base font-black tracking-tight text-[#272129] sm:text-xl">Finding the best quotes for you…</p><p className="mt-1 text-[11px] text-slate-500 sm:text-sm">Your trip request has been shared with relevant verified cab partners.</p></div>
                      <div className="hidden h-16 w-36 overflow-hidden rounded-xl bg-orange-50 sm:block"><Image src="/images/cabs/uno-cabs-dzire-hero.png" alt="UNO Cabs request illustration" width={1693} height={929} className="-mt-4 h-auto w-full mix-blend-multiply" /></div>
                    </div>

                    <div className="relative mt-4 grid grid-cols-4 gap-1 sm:mt-5 sm:gap-2">
                      <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-orange-200 sm:top-5" />
                      {[{ icon: CheckCircle2, label: "Request sent", state: "done" }, { icon: Send, label: "Sent to partners", state: "done" }, { icon: LoaderCircle, label: "Collecting quotes", state: "current" }, { icon: ListChecks, label: "Compare quotes", state: "next" }].map(({ icon: Icon, label, state }) => <div key={label} className="relative z-10 text-center"><span className={`mx-auto grid h-8 w-8 place-items-center rounded-full border-2 bg-white sm:h-10 sm:w-10 ${state === "done" ? "border-[#ef6614] bg-[#ef6614] text-white" : state === "current" ? "border-[#ef6614] text-[#ef6614]" : "border-slate-300 text-slate-400"}`}><Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${state === "current" ? "animate-spin" : ""}`} /></span><p className={`mt-1.5 text-[8px] font-bold sm:text-[10px] ${state === "current" ? "text-[#ef6614]" : "text-slate-600"}`}>{label}</p></div>)}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1.45fr_0.8fr] sm:mt-5 sm:gap-4">
                      <article className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="flex items-center justify-between"><div><h3 className="text-xs font-extrabold text-[#302934] sm:text-sm">Your trip request</h3><p className="mt-0.5 text-[9px] text-slate-500 sm:text-[11px]">Review the details you shared with partners.</p></div><button type="button" className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-2 py-1 text-[9px] font-bold text-[#ef6614] sm:text-[10px]"><FilePenLine className="h-3 w-3" /> Edit</button></div><div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-[9px] sm:grid-cols-3 sm:text-[11px]"><p><span className="block font-bold text-slate-400">PICKUP</span><strong className="text-[#302934]">Bandra West</strong></p><p><span className="block font-bold text-slate-400">DROP</span><strong className="text-[#302934]">Pune, Maharashtra</strong></p><p><span className="block font-bold text-slate-400">TRIP</span><strong className="text-[#302934]">Outstation · Today</strong></p></div><div className="mt-3 flex items-center gap-2 rounded-lg bg-[#fff8f2] p-2 text-[9px] text-[#6d626c] sm:p-3 sm:text-[11px]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#ef6614]" /> Partner quotes include the cab category, fare and trip inclusions.</div></article>
                      <article className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-extrabold text-[#302934] sm:text-sm">Live activity</h3><span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live</span></div><div className="mt-3 space-y-2.5 border-l border-orange-200 pl-3 text-[9px] sm:text-[11px]"><p><strong className="block text-[#302934]">Request submitted</strong><span className="text-slate-500">Just now</span></p><p><strong className="block text-[#302934]">Sent to partners</strong><span className="text-slate-500">Partners are reviewing your trip.</span></p><p className="rounded-r-lg bg-orange-50 py-1 pl-2"><strong className="block text-[#d95717]">Collecting quotes</strong><span className="text-[#9c653f]">In progress</span></p></div></article>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mx-auto -mt-px h-[13px] w-[103%] rounded-b-[18px] border-x border-b border-white/10 bg-[linear-gradient(180deg,#55515a_0%,#2b282f_34%,#121116_100%)] shadow-[0_16px_24px_-16px_rgba(15,12,17,0.82)] sm:h-[17px] sm:rounded-b-[22px]">
                <span className="absolute left-1/2 top-0 h-[5px] w-[38%] -translate-x-1/2 rounded-b-[7px] border-x border-b border-black/30 bg-[#16151a] sm:h-[7px] sm:w-[34%]" />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#fff9f5] py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-md lg:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ef6614]">When quotes arrive</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#292229] sm:text-4xl">Compare every option at a glance.</h2>
              <p className="mt-3 text-base leading-7 text-[#726873]">See price, vehicle, inclusions and partner details in one clear quote dashboard.</p>
              <ul className="mt-6 space-y-3 text-left">
                {["Compare several partner offers side by side", "See cab type, fare and inclusions before choosing", "Keep receiving new quotes while you review"].map((item) => <li key={item} className="flex items-start gap-3 text-sm font-semibold text-[#514752]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-50 text-[#ef6614]"><Check className="h-3.5 w-3.5" /></span>{item}</li>)}
              </ul>
            </div>

            <div className="relative mx-auto mt-3 max-w-[332px] sm:hidden" aria-label="UNO Cabs quote comparison on mobile">
              <div className="relative rounded-[40px] bg-[linear-gradient(145deg,#514d55_0%,#17151a_22%,#26232a_100%)] p-[6px] shadow-[0_28px_55px_-22px_rgba(16,13,18,0.7)]">
                <div className="pointer-events-none absolute left-1/2 top-[6px] z-20 h-7 w-24 -translate-x-1/2 rounded-b-[18px] bg-[#111015]" />
                <div className="overflow-hidden rounded-[34px] bg-[#fbfcff] pt-7">
                  <div className="flex h-10 items-center justify-between border-b border-slate-100 px-4 text-[10px] font-bold text-slate-500"><span className="font-black text-[#ef6614]">UNO <span className="text-[#29222b]">CABS</span></span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">3 quotes</span></div>
                  <div className="p-4"><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#ef6614]">YOUR TRIP</p><h3 className="mt-1 text-lg font-black tracking-tight text-[#272129]">Compare partner quotes</h3><div className="mt-3 rounded-xl bg-[#fff8f2] px-3 py-2"><p className="text-[11px] font-extrabold text-[#302934]">Bandra West <span className="text-[#ef6614]">→</span> Pune</p><p className="mt-0.5 text-[9px] text-slate-500">Outstation · Today · 3 travellers</p></div>
                    <div className="mt-4 space-y-2.5">{[{ partner: "Sai Travels", cab: "Maruti Dzire", fare: "₹2,450", badge: "Best price", tone: "bg-emerald-50 text-emerald-700" }, { partner: "City Drive", cab: "Honda Amaze", fare: "₹2,750", badge: "Good value", tone: "bg-blue-50 text-blue-700" }, { partner: "FastRide Cabs", cab: "Toyota Etios", fare: "₹2,950", badge: "Popular", tone: "bg-orange-50 text-orange-700" }].map((quote, index) => <article key={quote.partner} className={`rounded-2xl border p-3 ${index === 0 ? "border-[#ef6614] bg-orange-50/30 shadow-[0_10px_22px_-18px_rgba(239,102,20,0.7)]" : "border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#292229] text-[9px] font-black text-orange-300">{quote.partner.slice(0, 1)}</span><strong className="text-[11px] text-[#302934]">{quote.partner}</strong></div><p className="mt-1 text-[10px] font-semibold text-slate-500">{quote.cab} · AC · 4 seats</p></div><div className="text-right"><strong className="block text-sm text-[#292229]">{quote.fare}</strong><span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[8px] font-bold ${quote.tone}`}>{quote.badge}</span></div></div>{index === 0 && <div className="mt-3 flex items-center justify-between border-t border-orange-100 pt-2"><span className="text-[9px] font-semibold text-slate-500">Fuel + driver included</span><span className="text-[10px] font-extrabold text-[#ef6614]">View offer →</span></div>}</article>)}</div>
                    <div className="mt-4 rounded-xl bg-[#ef6614] px-3 py-3 text-center text-[11px] font-extrabold text-white">Choose the quote that feels right</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mx-auto mt-2 hidden max-w-6xl pt-1.5 sm:mt-2 sm:block sm:pt-2 lg:-my-20 lg:origin-center lg:scale-[0.7] lg:mt-0">
              <div className="relative rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,#5a5660_0%,#2b282f_16%,#151419_58%,#37333c_100%)] p-[5px] shadow-[0_34px_70px_-28px_rgba(16,13,18,0.62),0_12px_20px_-16px_rgba(255,255,255,0.55)_inset] sm:rounded-[30px] sm:p-[7px]">
                <div className="pointer-events-none absolute left-1/2 top-[5px] z-10 flex h-3 w-12 -translate-x-1/2 items-center justify-center rounded-b-[9px] bg-[#151419] shadow-[0_1px_1px_rgba(255,255,255,0.12)] sm:top-[7px] sm:h-4 sm:w-16"><span className="h-1 w-1 rounded-full bg-[#667080] shadow-[0_0_2px_1px_rgba(120,154,190,0.38)]" /></div>
                <div className="overflow-hidden rounded-[18px] border border-black/25 bg-[#fbfcff] shadow-[0_1px_0_rgba(255,255,255,0.28)_inset] sm:rounded-[23px]">
                  <div className="flex h-8 items-center justify-between border-b border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-500 sm:px-5 sm:text-xs"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="ml-2 hidden sm:inline">UNO Cabs · Quotes for request #UC-2481</span></span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">3 quotes received</span></div>
                  <div className="p-3 sm:p-5">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4"><div><p className="text-base font-black tracking-tight text-[#272129] sm:text-xl">Quotes received for your trip</p><p className="mt-1 text-[11px] text-slate-500 sm:text-sm">Compare partner offers and choose the option that fits best.</p></div><div className="flex gap-2"><button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-600 sm:text-[10px]">Sort: Best match</button><button type="button" className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[9px] font-bold text-[#ef6614] sm:text-[10px]">Filter</button></div></div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[0.52fr_1.48fr] sm:mt-5 sm:gap-4">
                      <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 md:block"><div className="flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#302934]">Trip summary</h3><button type="button" className="text-[10px] font-bold text-[#ef6614]">Edit</button></div><div className="mt-4 space-y-3 border-l border-slate-200 pl-3 text-[11px]"><p><span className="block font-bold text-slate-400">PICKUP</span><strong className="text-[#302934]">Bandra West, Mumbai</strong></p><p><span className="block font-bold text-slate-400">DROP</span><strong className="text-[#302934]">Pune, Maharashtra</strong></p><p><span className="block font-bold text-slate-400">TRIP TYPE</span><strong className="text-[#302934]">Outstation · 3 adults</strong></p><p><span className="block font-bold text-slate-400">PICKUP TIME</span><strong className="text-[#302934]">Today · 09:30 AM</strong></p></div><div className="mt-5 rounded-xl bg-[#fff8f2] p-3 text-[10px] text-[#6d626c]"><strong className="block text-[#392f38]">Need help deciding?</strong><span className="mt-1 block">Trip support can help explain a quote.</span><button type="button" className="mt-2 font-bold text-[#ef6614]">Talk to support</button></div></aside>
                      <div className="space-y-2.5 sm:space-y-3">
                        {[{ partner: "Sai Travels", vehicle: "Maruti Dzire", fare: "₹2,450", tag: "Best price", tone: "bg-emerald-50 text-emerald-700", details: "AC · 4 seats · 2 bags" }, { partner: "City Drive", vehicle: "Honda Amaze", fare: "₹2,750", tag: "Good value", tone: "bg-blue-50 text-blue-700", details: "AC · 4 seats · 2 bags" }, { partner: "FastRide Cabs", vehicle: "Toyota Etios", fare: "₹2,950", tag: "Popular choice", tone: "bg-orange-50 text-orange-700", details: "AC · 4 seats · 2 bags" }].map((quote, index) => <article key={quote.partner} className={`rounded-xl border bg-white p-2.5 sm:rounded-2xl sm:p-3 ${index === 0 ? "border-emerald-200 shadow-[0_12px_24px_-20px_rgba(16,185,129,0.5)]" : "border-slate-200"}`}><div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_0.55fr_0.65fr_auto] sm:items-center sm:gap-3"><div><div className="flex items-center gap-1.5"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#292229] text-[8px] font-black text-orange-300">{quote.partner.slice(0, 1)}</span><strong className="text-[10px] text-[#302934] sm:text-xs">{quote.partner}</strong><span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700 sm:text-[8px]">Verified partner</span></div><p className="mt-1 text-[8px] text-slate-500 sm:text-[10px]">★ 4.{6 - index} · {index === 0 ? "124" : index === 1 ? "98" : "76"} reviews</p></div><div className="hidden sm:block"><Image src="/images/cabs/uno-cabs-dzire-hero.png" alt={`${quote.vehicle} cab preview`} width={1693} height={929} className="-my-4 h-20 w-full object-contain mix-blend-multiply" /></div><div><strong className="block text-[10px] text-[#302934] sm:text-xs">{quote.vehicle}</strong><span className="mt-1 block text-[8px] text-slate-500 sm:text-[10px]">{quote.details}</span></div><div className="text-right"><strong className="block text-sm text-[#292229] sm:text-base">{quote.fare}</strong><span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[7px] font-bold sm:text-[8px] ${quote.tone}`}>{quote.tag}</span><button type="button" className="mt-1.5 block rounded-lg border border-orange-300 px-2 py-1 text-[8px] font-bold text-[#ef6614] sm:ml-auto sm:text-[9px]">View details</button></div></div><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[7px] font-semibold text-slate-500 sm:text-[9px]"><span className="flex items-center gap-1 text-emerald-700"><Check className="h-2.5 w-2.5" /> Fuel charges</span><span className="flex items-center gap-1 text-emerald-700"><Check className="h-2.5 w-2.5" /> Driver allowance</span><span className="flex items-center gap-1 text-emerald-700"><Check className="h-2.5 w-2.5" /> Toll &amp; parking</span></div></article>)}
                        <div className="flex items-center justify-between rounded-xl bg-[#fff8f2] px-3 py-2 text-[8px] sm:text-[10px]"><span className="flex items-center gap-1.5 font-semibold text-[#5f555e]"><Clock3 className="h-3.5 w-3.5 text-[#ef6614]" /> More partner quotes may still arrive.</span><button type="button" className="font-bold text-[#ef6614]">Notify me</button></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mx-auto -mt-px h-[13px] w-[103%] rounded-b-[18px] border-x border-b border-white/10 bg-[linear-gradient(180deg,#55515a_0%,#2b282f_34%,#121116_100%)] shadow-[0_16px_24px_-16px_rgba(15,12,17,0.82)] sm:h-[17px] sm:rounded-b-[22px]">
                <span className="absolute left-1/2 top-0 h-[5px] w-[38%] -translate-x-1/2 rounded-b-[7px] border-x border-b border-black/30 bg-[#16151a] sm:h-[7px] sm:w-[34%]" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ef6614]">More clarity, less chasing</p>
              <h2 className="mt-3 max-w-lg text-3xl font-black tracking-tight text-[#292229] sm:text-4xl">Compare the details that matter before you choose.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#716771]">UNO Cabs helps you collect and compare partner responses in one place, so you can make the right choice for your trip.</p>
              <ul className="mt-6 space-y-3">
                {["Cab category and passenger capacity", "Quoted fare and what is included", "Partner response time and trip notes", "Driver and vehicle details before final confirmation"].map((item) => <li key={item} className="flex items-start gap-3 text-sm font-semibold text-[#4f4650]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-50 text-[#ef6614]"><Check className="h-3.5 w-3.5" /></span>{item}</li>)}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-orange-100 bg-[linear-gradient(130deg,#fff8f2_0%,#eef8fb_100%)] p-6 sm:p-8">
              <div className="relative z-10 max-w-[260px] rounded-2xl bg-white p-4 shadow-[0_18px_34px_-20px_rgba(56,34,21,0.35)]"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-[#ef6614]"><Handshake className="h-5 w-5" /></span><span><strong className="block text-sm">Partner quote received</strong><small className="text-xs text-[#766d75]">SUV · 6 seats · Outstation</small></span></div><div className="mt-4 flex items-end justify-between"><span><small className="block text-xs text-[#766d75]">Quoted fare</small><strong className="text-xl text-[#2c2530]">₹1,950</strong></span><span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Verified</span></div></div>
              <Image src="/images/cabs/uno-cabs-dzire-hero.png" alt="UNO Cabs sedan for partner quote comparison" width={1693} height={929} className="mt-1 h-auto w-full translate-x-6 mix-blend-multiply sm:mt-0 sm:translate-x-12" />
              <div className="absolute bottom-6 left-6 rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur"><p className="text-xs font-extrabold text-[#413842]">You choose after you compare.</p></div>
            </div>
          </div>
        </section>

        <section id="list-your-cab" className="relative overflow-hidden bg-[#fdf3e8] py-16 sm:py-20">
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/75 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d95717]"><CarFront className="h-4 w-4" /> For cab owners &amp; operators</span>
              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-[#292229] sm:text-4xl">Put your cab in front of travellers who are ready to compare.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#716771]">Join UNO Cabs as a verified partner. Receive relevant trip requests, send your best quote, and grow your business on your own terms.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[{ icon: ListChecks, title: "Relevant requests", text: "See trip details before you respond." }, { icon: Scale, title: "Quote your way", text: "Share the fare that works for you." }, { icon: BadgeCheck, title: "Build trust", text: "Earn a verified partner profile." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-[0_12px_25px_-24px_rgba(102,54,19,0.7)]"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-[#ef6614]"><Icon className="h-4.5 w-4.5" /></span><h3 className="mt-3 text-sm font-extrabold text-[#332a34]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#766b74]">{text}</p></div>)}
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#5c4d55]"><ShieldCheck className="h-4 w-4 text-[#ef6614]" /> We review every partner before activating their profile.</p>
            </div>

            <div className="rounded-[28px] border border-white/90 bg-white p-6 shadow-[0_28px_58px_-30px_rgba(98,54,24,0.42)] sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#ef6614]"><UserRoundCheck className="h-6 w-6" /></span>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-[#ef6614]">Partner with UNO Cabs</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#292229]">Ready to list your cab?</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#766b74]">Choose your business type, add your vehicle details and complete verification in one guided flow.</p>
              <div className="mt-6 space-y-3 rounded-2xl bg-[#fff8f2] p-4 text-sm text-[#5f545d]"><p className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-emerald-600" /> Takes only a few minutes to begin</p><p className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-emerald-600" /> Keep control of your fleet and fares</p><p className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-emerald-600" /> Get support through verification</p></div>
              <Link href="/cabs/list-your-cab" className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ef6614] px-5 text-base font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.85)] transition hover:bg-[#d95511]">Start partner registration <ArrowRight className="h-5 w-5" /></Link>
              <p className="mt-3 text-center text-xs leading-5 text-[#80757d]">No listing fee to start. Our team will guide you through verification.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#2b252b] py-16 text-white sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-300">Need a hand?</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Helpful support, from planning to pickup.</h2><p className="mt-4 max-w-lg text-base leading-7 text-white/70">Our team can help you plan a route, understand quotes, or add practical trip requirements before you decide.</p><a href="tel:+919999999999" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#332c34] transition hover:bg-orange-50"><PhoneCall className="h-4 w-4 text-[#ef6614]" /> Talk to trip support</a></div>
            <div className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/5 px-5 sm:px-6">
              {[{ q: "When will I receive partner quotes?", a: "Response time depends on route and travel date. We show each partner’s response update with your trip request." }, { q: "Is a quote a confirmed booking?", a: "No. You stay in control—your trip is confirmed only after you choose a quote and complete the final details." }, { q: "Can I add special requirements?", a: "Yes. Add requirements such as luggage, child seats, pickup notes or accessibility needs in your trip request." }].map(({ q, a }) => <details key={q} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold"><span>{q}</span><ChevronRight className="h-5 w-5 shrink-0 text-orange-300 transition group-open:rotate-90" /></summary><p className="mt-3 pr-6 text-sm leading-6 text-white/65">{a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="bg-[#fff8f2] py-16 sm:py-20"><div className="mx-auto max-w-3xl px-4 text-center sm:px-6"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#ef6614] shadow-sm"><MessageCircle className="h-6 w-6" /></span><h2 className="mt-4 text-3xl font-black tracking-tight text-[#292229] sm:text-4xl">Ready to compare cab quotes for your trip?</h2><p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#716771]">Tell us where and when you want to travel. We&apos;ll help connect you with the right cab partners.</p><button type="button" onClick={() => document.getElementById("cab-booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ef6614] px-5 py-3 text-base font-extrabold text-white shadow-[0_12px_22px_-12px_rgba(239,102,20,0.8)] transition hover:bg-[#d95511]">Start your trip request <ArrowRight className="h-5 w-5" /></button></div></section>
        </div>
      </main>

      <footer className="bg-[#211b21] text-white"><div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.7fr_0.7fr_1fr]"><div><Image src="/images/homelogo-transparent.png" alt="UNO Trips" width={180} height={56} className="h-11 w-auto brightness-0 invert" /><p className="mt-4 max-w-xs text-sm leading-6 text-white/60">UNO Cabs connects travellers with verified cab partners for more transparent trip choices.</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-orange-200"><UserRoundCheck className="h-4 w-4" /> Partner-first trip matching</div></div><div><h2 className="text-sm font-extrabold">Ride types</h2><ul className="mt-4 space-y-3 text-sm text-white/60"><li>Outstation trips</li><li>Hourly rentals</li><li>Airport transfers</li></ul></div><div><h2 className="text-sm font-extrabold">UNO Cabs</h2><ul className="mt-4 space-y-3 text-sm text-white/60"><li><a href="#cab-booking-form" className="hover:text-orange-200">Post a trip</a></li><li><Link href="/cabs/list-your-cab" className="hover:text-orange-200">List your cab</Link></li><li><a href="#" className="hover:text-orange-200">How it works</a></li><li><a href="#" className="hover:text-orange-200">Support</a></li></ul></div><div><h2 className="text-sm font-extrabold">Need help?</h2><p className="mt-4 text-sm leading-6 text-white/60">Questions about a route or partner quote? Our trip support team is here to help.</p><a href="tel:+919999999999" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-orange-200 hover:text-orange-100"><PhoneCall className="h-4 w-4" /> Contact support</a></div></div><div className="border-t border-white/10"><div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© {new Date().getFullYear()} UNO Trips. All rights reserved.</span><span>UNO Cabs · Compare partner quotes with confidence</span></div></div></footer>
    </div>
  );
}
