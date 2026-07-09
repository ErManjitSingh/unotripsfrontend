"use client";

/**
 * src/components/packages/package-detail-view.tsx
 *
 * Final production-ready package detail page.
 *
 * Tabs:
 *   Itinerary   — day pills → activity cards (sightseeing + activity toggles inline)
 *   Stay        — hotel tiers per destination + rooms/travellers config
 *   Transfers   — cab/vehicle selection
 *   Activities  — day accordion with sightseeing + activity toggles
 *   Summary     — trip stats + route + current config
 *   Inclusions  — what's included/excluded + trip-level add-ons
 *   Terms       — T&C accordion
 *   Book        — traveller form + token/full payment + success screen
 *
 * DATA SOURCES (in order of priority):
 *   1. GET /v1/packages/{slug}/day-options — hotel/cab/sightseeing/activities/addons
 *   2. Demo data from package-customizer-data.ts — fallback if backend returns empty
 *
 * PRICE FLOW:
 *   Optimistic: calcTotalWithOptions() runs client-side on every selection change
 *   Authoritative: POST /calculate-price called on "Confirm & Pay"
 *   Razorpay: charged the authoritative server total, never the frontend estimate
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useCallback, useEffect, useMemo, useRef, useState, type FormEvent,
} from "react";
import {
  BedDouble, Building2, Calendar, Car, Check, ChevronDown,
  ChevronRight, CircleCheck, CircleX, Lock, MapPin,
  MessageCircle, Mountain, Phone, PlaneTakeoff, ShieldCheck,
  Snowflake, Star, UtensilsCrossed, Users,
} from "lucide-react";

import { Footer }                from "@/components/layout/Footer";
import { HeroGlassNavbar }       from "@/components/home/hero-glass-navbar";
import { PackagePhotoGrid }      from "@/components/packages/package-photo-grid";
import { PackageBookingSuccess } from "@/components/packages/PackageBookingSuccess";
import { ActivitiesTab }         from "@/components/packages/ActivitiesTab";
import { ChangeHotelModal }      from "@/components/packages/change-hotel-modal";
import { cn, formatInrAmount }   from "@/lib/utils";
import { SITE }                  from "@/lib/constants";
import { formatTourType, packageDetailHref } from "@/lib/packages";
import {
  packageWhatsAppPrefill, siteWhatsAppChatUrl, siteTelHref,
} from "@/lib/site-contact";
import type { TourPackage }      from "@/lib/constants";
import { usePackageBooking }     from "@/hooks/use-package-booking";
import { useAuth }               from "@/contexts/auth-context";
import { BookingAuthModal }      from "@/components/hotels/booking-auth-modal";
import { useDayOptions }         from "@/hooks/useDayOptions";
import {
  encodeRooms, roomsLabel,
  type RoomConfig,
} from "@/hooks/useRoomsConfig";

import {
  INCLUSIONS, EXCLUSIONS, TERMS_AND_CONDITIONS,
  calcTotalWithOptions, fmtINR, tokenAmount,
  type AddonOption, type CustomizerState,
} from "@/lib/package-customizer-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "itinerary",   label: "Itinerary"   },
  { id: "stay",        label: "Stay"        },
  { id: "transfers",   label: "Transfers"   },
  { id: "activities",  label: "Activities"  },
  { id: "summary",     label: "Summary"     },
  { id: "inclusions",  label: "Inclusions"  },
  { id: "terms",       label: "Terms"       },
  { id: "book",        label: "Book"        },
] as const;

type TabId = typeof TABS[number]["id"];

const ADDON_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Snowflake, Mountain, ShieldCheck, PlaneTakeoff,
};

// ── Props ─────────────────────────────────────────────────────────────────────

export type PackageDetailViewProps = {
  tour:          TourPackage;
  similar:       TourPackage[];
  initialRooms?: RoomConfig[];
  initialDate?:  string | null;
};

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({
  label, sub, value, min = 0, max = 20, onDec, onInc,
}: {
  label: string; sub: string; value: number;
  min?: number; max?: number;
  onDec: () => void; onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f5f5f5] py-2.5 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
        <p className="text-[11px] text-[#9e9e9e]">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onDec} disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-lg transition hover:border-primary hover:text-primary disabled:opacity-30">−</button>
        <span className="min-w-[20px] text-center text-sm font-semibold">{value}</span>
        <button type="button" onClick={onInc} disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-lg transition hover:border-primary hover:text-primary disabled:opacity-30">+</button>
      </div>
    </div>
  );
}

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[#eeeeee]", className)} />;
}

/** Mirrors the real hotel-card layout so the page doesn't jump when data arrives. */
function HotelCardSkeleton() {
  return (
    <div className="mb-4">
      <Shimmer className="mb-2.5 h-4 w-40" />
      <div className="flex gap-3 rounded-xl border-[1.5px] border-[#e8e8e8] bg-white p-3.5">
        <Shimmer className="h-16 w-20 shrink-0 sm:h-20 sm:w-24" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-40" />
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          <Shimmer className="h-4 w-14" />
          <Shimmer className="h-7 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors the real cab-option card layout so the page doesn't jump when data arrives. */
function CabCardSkeleton() {
  return (
    <div className="rounded-xl border-[1.5px] border-[#e8e8e8] bg-white p-4">
      <Shimmer className="mb-2.5 h-4 w-4 rounded-full" />
      <Shimmer className="mb-1.5 h-9 w-9 rounded-lg" />
      <Shimmer className="mb-1.5 h-4 w-24" />
      <Shimmer className="h-3 w-16" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PackageDetailView({
  tour, similar, initialRooms, initialDate,
}: PackageDetailViewProps) {
  const slug      = tour.slug ?? tour.id;
  const packageId = tour.packageId ?? tour.id;

  // ── Day options from backend ──────────────────────────────────────────────
  const {
    isLoading: optLoading,
    hotelGroups, cabOptions, addonOptions, days,
    usingDemo,
    tokenType, tokenAmount: pkgTokenConfig, balanceDays,
  } = useDayOptions(slug);

  // ── Customiser state ──────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<RoomConfig[]>(
    initialRooms ?? [{ adults: 2, children: 0 }],
  );
  const [selectedHotels, setSelectedHotels] = useState<number[]>([]);
  const [selectedCab,    setSelectedCab]    = useState<number>(0);
  const [addons,         setAddons]         = useState<AddonOption[]>([]);
  const [payType,        setPayType]        = useState<"token" | "full">("token");

  // Activities/sightseeing selected IDs
  const [selectedSight,  setSelectedSight]  = useState<Set<string>>(new Set());
  const [selectedActs,   setSelectedActs]   = useState<Set<string>>(new Set());

  // Sightseeing + activity totals (computed)
  const [sightTotal, setSightTotal] = useState(0);
  const [actTotal,   setActTotal]   = useState(0);

  // ── Initialise selections when data loads ─────────────────────────────────
  useEffect(() => {
    if (!hotelGroups.length) return;
    setSelectedHotels(hotelGroups.map(() => 0));
  }, [hotelGroups]);

  useEffect(() => {
    if (!addonOptions.length) return;
    setAddons(addonOptions.map((a) => ({ ...a })));
  }, [addonOptions]);

  useEffect(() => {
    // Pre-select default sightseeing and activities
    const sightDefaults = new Set<string>();
    const actDefaults   = new Set<string>();
    for (const day of days) {
      for (const s of day.sightseeing) {
        if (s.is_optional && s.is_selected_by_default) sightDefaults.add(s.id);
      }
      for (const a of day.activities) {
        if (a.is_optional && a.is_selected_by_default) actDefaults.add(a.link_id);
      }
    }
    setSelectedSight(sightDefaults);
    setSelectedActs(actDefaults);
  }, [days]);

  // ── Recompute sightseeing + activity totals ───────────────────────────────
  useEffect(() => {
    const eff = rooms.reduce((s, r) => s + r.adults + r.children * 0.7, 0);
    const totalGuests = rooms.reduce((s, r) => s + r.adults + r.children, 0);
    let st = 0;
    let at = 0;
    for (const day of days) {
      for (const spot of day.sightseeing) {
        if (!spot.is_optional || !selectedSight.has(spot.id)) continue;
        if (spot.price_type === "per_group") st += spot.price_per_person;
        else st += Math.round(spot.price_per_person * eff);
      }
      for (const act of day.activities) {
        if (!selectedActs.has(act.link_id)) continue;
        if (act.price_type === "per_group")   at += act.price;
        else if (act.price_type === "per_vehicle") at += act.price * Math.ceil(totalGuests / 6);
        else at += Math.round(act.price * eff);
      }
    }
    setSightTotal(st);
    setActTotal(at);
  }, [days, selectedSight, selectedActs, rooms]);

  // ── Tab + UI state ────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<TabId>("itinerary");
  const [activeDay,    setActiveDay]    = useState(1);
  const [openTermIdx,  setOpenTermIdx]  = useState<number | null>(null);
  const [changeHotelDestIdx, setChangeHotelDestIdx] = useState<number | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // ── Booking ───────────────────────────────────────────────────────────────
  const { state: bookState, book: doBook, payBalance, reset: resetBook } = usePackageBooking(slug);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const switchTab = useCallback((id: TabId) => {
    setActiveTab(id);
    setTimeout(() => tabBarRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }, []);

  const changeRoom = useCallback((roomIdx: number, field: "adults" | "children", delta: number) => {
    setRooms((prev) => prev.map((r, i) => {
      if (i !== roomIdx) return r;
      const v = r[field] + delta;
      if (field === "adults")   return { ...r, adults:   Math.max(1, Math.min(4, v)) };
      if (field === "children") return { ...r, children: Math.max(0, Math.min(3, v)) };
      return r;
    }));
  }, []);

  const addRoom = useCallback(() => {
    if (rooms.length >= 4) return;
    setRooms((prev) => [...prev, { adults: 1, children: 0 }]);
  }, [rooms.length]);

  const removeRoom = useCallback((idx: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== idx));
    setSelectedHotels((prev) => prev); // hotel selections stay per-destination not per-room
  }, []);

  const toggleAddon = useCallback((id: string) => {
    setAddons((prev) => prev.map((a) => a.id === id ? { ...a, on: !a.on } : a));
  }, []);

  const toggleSight = useCallback((id: string) => {
    setSelectedSight((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAct = useCallback((linkId: string) => {
    setSelectedActs((prev) => {
      const next = new Set(prev);
      next.has(linkId) ? next.delete(linkId) : next.add(linkId);
      return next;
    });
  }, []);

  // ── Price calculation ─────────────────────────────────────────────────────

  const custState: CustomizerState = useMemo(() => ({
    adults:   rooms.reduce((s, r) => s + r.adults, 0),
    children: rooms.reduce((s, r) => s + r.children, 0),
    rooms:    rooms.length,
    hotels:   selectedHotels,
    cab:      selectedCab,
    addons,
    pay:      payType,
  }), [rooms, selectedHotels, selectedCab, addons, payType]);

  const breakdown = useMemo(() => {
    const base = calcTotalWithOptions(
      custState,
      hotelGroups,
      cabOptions,
      tour.priceINR,
      tour.oldPriceINR,
    );
    return {
      ...base,
      sightseeing: sightTotal,
      activities:  actTotal,
      total:       base.total + sightTotal + actTotal,
    };
  }, [custState, hotelGroups, cabOptions, tour.priceINR, tour.oldPriceINR, sightTotal, actTotal]);

  const token = tokenAmount(breakdown.total, tokenType, pkgTokenConfig);
  // A "fixed" token package with no real token_amount configured computes
  // to ₹0 — the backend rejects that outright ("below the minimum of
  // ₹1.00"). Token payment is only a real option when it lands strictly
  // between ₹0 and the full total.
  const tokenPaymentAvailable = token > 0 && token < breakdown.total;
  const payAmt = payType === "token" && tokenPaymentAvailable ? token : breakdown.total;

  useEffect(() => {
    if (!optLoading && !tokenPaymentAvailable && payType === "token") setPayType("full");
  }, [optLoading, tokenPaymentAvailable, payType]);

  // ── Gallery images ────────────────────────────────────────────────────────
  const galleryImages = useMemo(() => {
    const imgs = tour.galleryImages?.length
      ? tour.galleryImages
      : tour.image
        ? [tour.image, ...Array(4).fill("https://images.unsplash.com/photo-1469854523086-cc02fe7d8800?w=600&q=80")]
        : [];
    return imgs.slice(0, 12);
  }, [tour]);

  // ── Build selected option IDs for booking ─────────────────────────────────

  const getSelectedIds = useCallback(() => {
    const hotelIds = selectedHotels
      .map((optIdx, destIdx) => hotelGroups[destIdx]?.opts[optIdx]?.id ?? "")
      .filter(Boolean);
    const cabId = cabOptions[selectedCab]?.id ?? null;
    const addonIds = addons.filter((a) => a.on).map((a) => a.id).filter((id) => !id.startsWith("demo-"));
    const sightIds = Array.from(selectedSight).filter((id) => !id.startsWith("demo-"));
    const actIds   = Array.from(selectedActs).filter((id) => !id.startsWith("demo-"));
    return { hotelIds, cabId, addonIds, sightIds, actIds };
  }, [selectedHotels, hotelGroups, selectedCab, cabOptions, addons, selectedSight, selectedActs]);

  // ── Book handler ──────────────────────────────────────────────────────────

  const handleConfirmAndPay = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const form  = e.target as HTMLFormElement;
    const name  = (form.querySelector("[name=guestName]")  as HTMLInputElement)?.value.trim()  || "";
    const email = (form.querySelector("[name=guestEmail]") as HTMLInputElement)?.value.trim()  || "";
    const phone = (form.querySelector("[name=guestPhone]") as HTMLInputElement)?.value.trim()  || "";
    const date  = (form.querySelector("[name=travelDate]") as HTMLInputElement)?.value.trim()  || null;
    const notes = (form.querySelector("[name=specialReq]") as HTMLTextAreaElement)?.value.trim() || null;

    if (!name || !email || !phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }

    const { hotelIds, cabId, addonIds, sightIds, actIds } = getSelectedIds();

    await doBook({
      package_slug:               slug,
      guest_name:                 name,
      guest_email:                email,
      guest_phone:                phone,
      rooms,
      travel_date:                date,
      special_requests:           notes,
      selected_hotel_option_ids:  hotelIds,
      selected_cab_option_id:     cabId,
      selected_sightseeing_ids:   sightIds,
      selected_activity_link_ids: actIds,
      selected_addon_ids:         addonIds,
      payment_type:               payType,
    } as any);
  }, [slug, rooms, payType, getSelectedIds, doBook]);

  const isBooking  = ["loading", "awaiting_payment", "verifying"].includes(bookState.phase);
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fullStars  = Math.min(5, Math.round(tour.rating));
  const currentDay = tour.itinerary?.find((d) => d.day === activeDay) ?? tour.itinerary?.[0];

  // ── Itinerary day helpers (all derived from real data — no fabricated fields) ─

  /** Real calendar date per day, only when the visitor picked a travel date upstream (?date=). */
  const dateForDay = useCallback((dayNum: number): Date | null => {
    if (!initialDate) return null;
    const parsed = new Date(initialDate);
    if (Number.isNaN(parsed.getTime())) return null;
    const d = new Date(parsed);
    d.setDate(d.getDate() + (dayNum - 1));
    return d;
  }, [initialDate]);

  const dayDateLabel = useCallback((dayNum: number): string | null => {
    const d = dateForDay(dayNum);
    return d ? d.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" }) : null;
  }, [dateForDay]);

  /** First day number of a given hotelGroups destination leg (1-indexed, cumulative real nights). */
  const destStartDayOf = useCallback((destIdx: number): number => {
    if (destIdx <= 0) return 1;
    return 1 + hotelGroups.slice(0, destIdx).reduce((s, h) => s + h.nights, 0);
  }, [hotelGroups]);

  /** Which real hotel destination-leg (from hotelGroups) a given itinerary day falls in,
   *  derived from each destination's real `nights` count — not a fabricated mapping. */
  const destForDay = useCallback((dayNum: number) => {
    let cursor = 1;
    for (const dest of hotelGroups) {
      const end = cursor + dest.nights;
      if (dayNum >= cursor && dayNum <= end) return dest;
      cursor = end;
    }
    return hotelGroups[hotelGroups.length - 1];
  }, [hotelGroups]);

  const destIndexOf = useCallback(
    (destName: string) => hotelGroups.findIndex((h) => h.dest === destName),
    [hotelGroups],
  );

  const transfersCount = Math.max(0, hotelGroups.length - 1);

  /** Total meals, parsed from real inclusion text (e.g. "5 Breakfasts + 5 Dinners"). */
  const totalMeals = (tour.inclusions ?? []).reduce((sum, inc) => {
    const m = inc.match(/(\d+)\s*(Breakfast|Lunch|Dinner|Meals?)/i);
    return m ? sum + parseInt(m[1]!, 10) : sum;
  }, 0);

  // ── Sidebar component ─────────────────────────────────────────────────────

  const Sidebar = () => (
    <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_2px_20px_-8px_rgba(15,23,42,0.12)]">
      <div className="border-b border-[#f0f0f0] bg-gradient-to-br from-white to-[#fafafa] px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Total price</p>
        <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight text-[#1a1a1a]">₹{fmtINR(breakdown.total)}</p>
        <p className="mt-1.5 text-[11px] text-[#9e9e9e]">{roomsLabel(rooms)}</p>
      </div>
      <div className="space-y-1.5 px-5 py-4 text-[12px]">
        <div className="flex justify-between text-[#616161]"><span>Base</span><span className="font-medium text-[#424242]">₹{fmtINR(breakdown.base)}</span></div>
        {breakdown.hotel > 0 && <div className="flex justify-between text-[#616161]"><span>Hotel upgrade</span><span className="font-medium text-[#424242]">+₹{fmtINR(breakdown.hotel)}</span></div>}
        {breakdown.cab > 0 && <div className="flex justify-between text-[#616161]"><span>Vehicle upgrade</span><span className="font-medium text-[#424242]">+₹{fmtINR(breakdown.cab)}</span></div>}
        {breakdown.sightseeing > 0 && <div className="flex justify-between text-[#616161]"><span>Sightseeing</span><span className="font-medium text-[#424242]">+₹{fmtINR(breakdown.sightseeing)}</span></div>}
        {breakdown.activities > 0  && <div className="flex justify-between text-[#616161]"><span>Activities</span><span className="font-medium text-[#424242]">+₹{fmtINR(breakdown.activities)}</span></div>}
        {breakdown.addons > 0      && <div className="flex justify-between text-[#616161]"><span>Add-ons</span><span className="font-medium text-[#424242]">+₹{fmtINR(breakdown.addons)}</span></div>}
        {breakdown.disc > 0 && <div className="flex justify-between font-semibold text-emerald-700"><span>You&apos;re saving</span><span>−₹{fmtINR(breakdown.disc)}</span></div>}
        <div className="flex justify-between border-t border-dashed border-[#e0e0e0] pt-2 text-sm font-bold text-[#1a1a1a]"><span>Total</span><span>₹{fmtINR(breakdown.total)}</span></div>
      </div>
      <div className="px-5 pb-5">
        <button type="button" onClick={() => {
            if (!isAuthenticated) { setShowLoginModal(true); }
            else { switchTab("book"); }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(234,88,12,0.55)]">
          <Lock className="h-4 w-4" aria-hidden />
          Book · ₹{fmtINR(payAmt)}
        </button>
        {tokenPaymentAvailable && (
          <p className="mt-2 text-center text-[11px] font-semibold text-emerald-700">
            Pay just ₹{fmtINR(token)}
            {tokenType === "percent" ? ` (${pkgTokenConfig}%)` : ""} to confirm today
          </p>
        )}
        <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-[#9e9e9e]">
          <ShieldCheck className="h-3 w-3" aria-hidden />Secured by Razorpay
        </p>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <HeroGlassNavbar activeId="holidays" solid combinedAuth />
      <main className="min-h-screen bg-[#f4f6f8] pt-[56px] sm:pt-[64px] lg:pt-[72px]">
        <div className="mx-auto w-full max-w-[1100px] px-3 pb-24 pt-3 sm:px-4 sm:pt-4 lg:px-6 lg:pb-0 lg:pt-5">

          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1 py-3 text-[11px] text-[#9e9e9e]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <Link href="/packages" className="hover:text-primary">Packages</Link>
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            <span className="font-medium text-[#424242] line-clamp-1">{tour.title}</span>
          </nav>

          {/* Photo grid */}
          <PackagePhotoGrid images={galleryImages} tourTitle={tour.title} className="mb-4" />

          {/* Header */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_2px_20px_-8px_rgba(15,23,42,0.1)]">
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  {formatTourType(tour.packageType)}
                </span>
                {usingDemo && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700">
                    Demo options — Admin will configure real options
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#1a1a1a] sm:text-[1.7rem]">{tour.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {[
                  { Icon: Calendar, label: `${tour.durationDays} Days / ${tour.durationNights} Nights` },
                  tour.location && { Icon: MapPin, label: tour.location },
                  { Icon: Users, label: roomsLabel(rooms) },
                ].filter(Boolean).map(({ Icon, label }: any) => (
                  <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e8e8] bg-[#fafafa] px-3 py-1.5 text-[11px] font-semibold text-[#424242]">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />{label}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {tour.reviewCount > 0 ? (
                  <>
                    <span className="flex">{Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i < fullStars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} aria-hidden />
                    ))}</span>
                    <span className="text-xs font-bold text-[#424242]">{tour.rating.toFixed(1)}</span>
                    <span className="text-[11px] text-[#9e9e9e]">({formatInrAmount(tour.reviewCount)} reviews)</span>
                  </>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">New listing</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#f5f5f5] bg-[#fafafa] px-5 py-3.5 sm:px-6">
              {(tour.inclusions?.length ? tour.inclusions : ["Hotel", "Breakfast", "Sightseeing", "Private cab", "Tour manager"])
                .slice(0, 5)
                .map((inc) => (
                  <span key={inc} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                    <Check className="h-2.5 w-2.5" aria-hidden />{inc}
                  </span>
                ))}
            </div>
          </div>

          {/* Tab bar + content */}
          <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_2px_20px_-8px_rgba(15,23,42,0.1)]">
            <div ref={tabBarRef} className="relative flex overflow-x-auto border-b border-[#e8e8e8] px-1" role="tablist">
              {TABS.map((tab) => (
                <button key={tab.id} type="button" role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={cn(
                    "relative shrink-0 flex-1 min-w-[72px] px-3 py-3.5 text-center text-[11px] font-bold tracking-wide transition sm:text-xs",
                    activeTab === tab.id ? "text-primary" : "text-[#757575] hover:text-[#424242]",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="package-tab-indicator"
                      className="absolute inset-x-0 -bottom-px h-[2px] bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >

              {/* ═══ ITINERARY ═══ */}
              {activeTab === "itinerary" && (
                <section>
                  {tour.itinerary?.length ? (
                    <>
                      {/* Trip summary strip — all real, derived from actual package data */}
                      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-orange-50/60 px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-white px-3 py-1 text-[11px] font-bold text-primary">
                          {tour.itinerary.length} Day Plan
                        </span>
                        {transfersCount > 0 && (
                          <span className="text-[12px] text-[#616161]"><b className="font-bold text-[#1a1a1a]">{transfersCount}</b> Transfer{transfersCount === 1 ? "" : "s"}</span>
                        )}
                        {hotelGroups.length > 0 && (
                          <span className="text-[12px] text-[#616161]"><b className="font-bold text-[#1a1a1a]">{hotelGroups.length}</b> Hotel{hotelGroups.length === 1 ? "" : "s"}</span>
                        )}
                        {totalMeals > 0 && (
                          <span className="text-[12px] text-[#616161]"><b className="font-bold text-[#1a1a1a]">{totalMeals}</b> Meals</span>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:gap-5">
                        {/* Day timeline */}
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
                          {tour.itinerary.map((d) => {
                            const dateLabel = dayDateLabel(d.day);
                            const active = activeDay === d.day;
                            return (
                              <button key={d.day} type="button" onClick={() => setActiveDay(d.day)}
                                className={cn("shrink-0 rounded-xl px-3.5 py-2.5 text-left transition sm:shrink",
                                  active ? "bg-[#1a1a1a] text-white shadow-sm" : "bg-[#fafafa] text-[#616161] hover:bg-[#f0f0f0]")}>
                                <p className={cn("text-[10px] font-semibold uppercase tracking-wide", active ? "text-white/70" : "text-[#9e9e9e]")}>Day {d.day}</p>
                                <p className="text-[12px] font-bold">{dateLabel ?? `Stop ${d.day}`}</p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Day detail */}
                        {currentDay && (() => {
                          const dest = destForDay(currentDay.day);
                          const destIdx = dest ? destIndexOf(dest.dest) : -1;
                          const selectedOpt = dest && destIdx >= 0 ? dest.opts[selectedHotels[destIdx] ?? 0] : undefined;
                          const isNewDestDay = destIdx > 0 && currentDay.day === destStartDayOf(destIdx);
                          const dayReal = days.find((dd) => dd.day_number === currentDay.day);

                          return (
                            <article className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
                              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                  Day {currentDay.day}
                                </span>
                                {dayDateLabel(currentDay.day) && (
                                  <span className="text-[11px] font-semibold text-[#9e9e9e]">{dayDateLabel(currentDay.day)}</span>
                                )}
                                <h3 className="w-full text-base font-bold leading-snug text-[#1a1a1a] sm:w-auto sm:text-lg">
                                  {currentDay.title.trim()}
                                </h3>
                              </div>

                              <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#424242] sm:text-sm">
                                {currentDay.body.trim()}
                              </p>

                              {isNewDestDay && (
                                <div className="mt-4 flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
                                    <Car className="h-4 w-4" aria-hidden />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Transfer</p>
                                    <p className="truncate text-[12px] font-semibold text-[#1a1a1a]">{cabOptions[selectedCab]?.name ?? "Private vehicle"}</p>
                                  </div>
                                  <button type="button" onClick={() => switchTab("transfers")}
                                    className="shrink-0 text-[11px] font-bold text-sky-700 underline">Change</button>
                                </div>
                              )}

                              {dest && selectedOpt && (
                                <div className="mt-4 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                    <Image src={selectedOpt.img} alt="" fill className="object-cover" sizes="80px" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Hotel · {dest.dest}</p>
                                    <p className="truncate text-[12px] font-bold text-[#1a1a1a]">{selectedOpt.name}</p>
                                    <span className="flex">{Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={cn("h-2.5 w-2.5", i < selectedOpt.stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} aria-hidden />
                                    ))}</span>
                                  </div>
                                  <button type="button" onClick={() => setChangeHotelDestIdx(destIdx)}
                                    className="shrink-0 self-start text-[11px] font-bold text-emerald-700 underline">Change</button>
                                </div>
                              )}

                              {dayReal && (dayReal.sightseeing.length > 0 || dayReal.activities.length > 0) && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                  {dayReal.sightseeing.map((s) => (
                                    <span key={s.id} className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">{s.name}</span>
                                  ))}
                                  {dayReal.activities.map((a) => (
                                    <span key={a.id} className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">{a.name}</span>
                                  ))}
                                </div>
                              )}
                            </article>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#e0e0e0] bg-[#fafafa] p-6 text-center">
                      <p className="text-sm font-medium text-[#616161]">Day-wise itinerary is being finalized for this package.</p>
                      <p className="mt-1 text-[12px] text-[#9e9e9e]">Message us on WhatsApp and we&apos;ll share the full day-by-day plan.</p>
                    </div>
                  )}
                </section>
              )}

              {/* ═══ STAY ═══ */}
              {activeTab === "stay" && (
                <section>
                  <h2 className="mb-1 text-base font-bold text-[#1a1a1a]">Your stay</h2>
                  <p className="mb-5 text-[12px] text-[#9e9e9e]">Your hotel, room type, and occupancy per destination. Price updates live in the sidebar.</p>
                  {optLoading && (
                    <div aria-live="polite" aria-busy="true">
                      <span className="sr-only">Loading hotel options…</span>
                      <Shimmer className="mb-6 h-40 w-full rounded-2xl" />
                      <HotelCardSkeleton />
                      <HotelCardSkeleton />
                    </div>
                  )}
                  {!optLoading && (
                    <>
                      {/* Room configuration */}
                      <div className="mb-6 rounded-2xl border border-[#e8e8e8] bg-[#fafafa] px-4 py-1 sm:px-5">
                        <p className="pt-3 text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">Rooms &amp; Travellers</p>
                        {rooms.map((room, idx) => (
                          <div key={idx} className="border-b border-[#f0f0f0] py-3 last:border-b-0">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9e9e9e]">Room {idx + 1}</span>
                              {idx > 0 && (
                                <button type="button" onClick={() => removeRoom(idx)}
                                  className="text-[11px] font-semibold text-[#DC2626] hover:underline">Remove</button>
                              )}
                            </div>
                            <Stepper label="Adults" sub="12+ years" value={room.adults} min={1} max={4}
                              onDec={() => changeRoom(idx, "adults", -1)} onInc={() => changeRoom(idx, "adults", 1)} />
                            <Stepper label="Children" sub="2–11 years" value={room.children} min={0} max={3}
                              onDec={() => changeRoom(idx, "children", -1)} onInc={() => changeRoom(idx, "children", 1)} />
                          </div>
                        ))}
                        {rooms.length < 4 && (
                          <button type="button" onClick={addRoom}
                            className="my-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d0d0d0] bg-white py-2.5 text-[12px] font-semibold text-[#616161] transition hover:border-primary hover:text-primary">
                            + Add Another Room
                          </button>
                        )}
                      </div>

                      {/* Current hotel per destination — same rich data + modal as the Itinerary tab */}
                      {hotelGroups.map((dest, di) => {
                        const opt = dest.opts[selectedHotels[di] ?? 0];
                        if (!opt) return null;
                        return (
                          <div key={dest.dest} className="mb-4">
                            <div className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-[#1a1a1a]">
                              <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                              {dest.dest}
                              <span className="text-[11px] font-normal text-[#9e9e9e]">({dest.nights} night{dest.nights === 1 ? "" : "s"})</span>
                            </div>
                            <div className="flex gap-3 rounded-xl border-[1.5px] border-[#e8e8e8] bg-white p-3.5">
                              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-24">
                                <Image src={opt.img} alt="" fill className="object-cover" sizes="96px" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-[#1a1a1a]">{opt.name}</p>
                                <span className="flex">{Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("h-3 w-3", i < opt.stars ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} aria-hidden />
                                ))}</span>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#616161]">
                                  {opt.roomType && (
                                    <span className="inline-flex items-center gap-1">
                                      <BedDouble className="h-3 w-3 shrink-0 text-[#9e9e9e]" aria-hidden />{opt.roomType} Room
                                    </span>
                                  )}
                                  {opt.maxGuests && (
                                    <span className="inline-flex items-center gap-1">
                                      <Users className="h-3 w-3 shrink-0 text-[#9e9e9e]" aria-hidden />Up to {opt.maxGuests} guests
                                    </span>
                                  )}
                                </div>
                                {opt.mealsIncluded && opt.mealsIncluded.length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {opt.mealsIncluded.map((m) => (
                                      <span key={m} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{m} included</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                                {opt.extra === 0 ? (
                                  <span className="text-[11px] font-bold text-emerald-700">Included</span>
                                ) : (
                                  <span className="text-[12px] font-bold text-primary">+₹{fmtINR(opt.extra)}</span>
                                )}
                                <button type="button" onClick={() => setChangeHotelDestIdx(di)}
                                  className="rounded-lg border border-primary px-3 py-1.5 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-white">
                                  Change
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </section>
              )}

              {/* ═══ TRANSFERS ═══ */}
              {activeTab === "transfers" && (
                <section>
                  <h2 className="mb-1 text-base font-bold text-[#1a1a1a]">Select your vehicle</h2>
                  <p className="mb-5 text-[12px] text-[#9e9e9e]">One vehicle for all intercity transfers and local sightseeing.</p>
                  {optLoading && (
                    <div className="grid grid-cols-2 gap-3" aria-live="polite" aria-busy="true">
                      <span className="sr-only">Loading vehicle options…</span>
                      <CabCardSkeleton /><CabCardSkeleton /><CabCardSkeleton /><CabCardSkeleton />
                    </div>
                  )}
                  {!optLoading && (
                    <div className="grid grid-cols-2 gap-3">
                      {cabOptions.map((cab, ci) => (
                        <button key={cab.id} type="button" onClick={() => setSelectedCab(ci)}
                          className={cn("relative rounded-xl border-[1.5px] p-4 text-left transition duration-200",
                            selectedCab===ci ? "border-primary bg-orange-50/60 shadow-[0_4px_16px_-6px_rgba(234,88,12,0.25)]" : "border-[#e8e8e8] bg-white hover:border-[#FDBA74] hover:shadow-sm")}
                          aria-pressed={selectedCab===ci}>
                          {cab.pop && <span className="absolute -top-px right-6 rounded-b bg-[#C9A84C] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">Popular</span>}
                          <div className={cn("mb-2.5 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px]", selectedCab===ci?"border-primary bg-primary":"border-[#d0d0d0]")}>
                            {selectedCab===ci && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#fafafa]">
                            <Car className="h-4.5 w-4.5 text-[#616161]" aria-hidden />
                          </div>
                          <p className="text-xs font-bold text-[#1a1a1a]">{cab.name}</p>
                          <p className="text-[10px] text-[#9e9e9e]">{cab.desc}</p>
                          <p className={cn("mt-1.5 text-[11px] font-bold", cab.extra===0?"text-emerald-700":"text-primary")}>
                            {cab.extra===0?"Included":`+₹${fmtINR(cab.extra)}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ═══ ACTIVITIES ═══ */}
              {activeTab === "activities" && (
                <ActivitiesTab
                  days={days}
                  rooms={rooms}
                  selectedItems={{ sightseeing: selectedSight, activities: selectedActs }}
                  onToggleSight={toggleSight}
                  onToggleActivity={toggleAct}
                  sightseeingTotal={sightTotal}
                  activitiesTotal={actTotal}
                />
              )}

              {/* ═══ SUMMARY ═══ */}
              {activeTab === "summary" && (
                <section>
                  <h2 className="mb-3 text-base font-bold text-[#1a1a1a]">Trip at a glance</h2>
                  <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[
                      { v: String(tour.durationDays),   l: "Days" },
                      { v: String(tour.durationNights), l: "Nights" },
                      { v: String(hotelGroups.length),  l: "Destinations" },
                      { v: String(days.reduce((s, d) => s + d.sightseeing.length + d.activities.length, 0)), l: "Experiences" },
                    ].map(({v,l}) => (
                      <div key={l} className="rounded-xl bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] px-3 py-4 text-center">
                        <p className="text-[1.7rem] font-bold leading-none text-primary">{v}</p>
                        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9e9e9e]">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-[#e8e8e8] bg-[#fafafa] p-5">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#9e9e9e]">Your configuration</p>
                    <div className="divide-y divide-[#f0f0f0]">
                      {[
                        ["Travellers",  roomsLabel(rooms)],
                        ["Hotels",      hotelGroups.map((h, i) => `${h.dest} — ${h.opts[selectedHotels[i]??0]?.name ?? ""}`).join(" · ") || "—"],
                        ["Cab",         cabOptions[selectedCab]?.name ?? "—"],
                        ["Sightseeing", `${selectedSight.size} selected (+₹${fmtINR(sightTotal)})`],
                        ["Activities",  `${selectedActs.size} selected (+₹${fmtINR(actTotal)})`],
                        ["Add-ons",     addons.filter((a) => a.on).map((a) => a.name).join(", ") || "None"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:gap-2">
                          <span className="shrink-0 text-[11px] font-semibold text-[#9e9e9e] sm:w-28">{label}</span>
                          <span className="text-[12px] text-[#424242]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ═══ INCLUSIONS ═══ */}
              {activeTab === "inclusions" && (
                <section>
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <div className="mb-3 flex items-center gap-1.5 text-[12px] font-bold text-emerald-700"><CircleCheck className="h-4 w-4" aria-hidden />What&apos;s included</div>
                      <ul className="space-y-2">
                        {(tour.inclusions ?? INCLUSIONS).map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#424242]">
                            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4">
                      <div className="mb-3 flex items-center gap-1.5 text-[12px] font-bold text-[#DC2626]"><CircleX className="h-4 w-4" aria-hidden />What&apos;s excluded</div>
                      <ul className="space-y-2">
                        {(tour.exclusions ?? EXCLUSIONS).map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[11px] leading-relaxed text-[#424242]">
                            <CircleX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DC2626]" aria-hidden />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mb-2.5 text-[13px] font-bold text-[#1a1a1a]">Optional add-ons</p>
                  <div className="divide-y divide-[#f5f5f5] overflow-hidden rounded-2xl border border-[#e8e8e8]">
                    {addons.map((addon) => {
                      const Icon = ADDON_ICON[addon.icon] ?? ShieldCheck;
                      return (
                        <button key={addon.id} type="button" onClick={() => toggleAddon(addon.id)}
                          className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left transition", addon.on ? "bg-orange-50/50" : "hover:bg-[#fafafa]")} aria-pressed={addon.on}>
                          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors", addon.on ? "bg-primary/10" : "bg-[#f5f5f5]")}>
                            <Icon className={cn("h-4 w-4", addon.on ? "text-primary" : "text-[#616161]")} aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-[#1a1a1a]">{addon.name}</p>
                            <p className="text-[10px] text-[#9e9e9e]">{addon.note}</p>
                          </div>
                          <p className="shrink-0 text-[11px] font-semibold text-[#424242]">+₹{fmtINR(addon.price)}/person</p>
                          <div className={cn("relative ml-1 h-5 w-9 shrink-0 rounded-full transition-colors", addon.on?"bg-primary":"bg-[#d0d0d0]")}>
                            <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", addon.on?"translate-x-4":"translate-x-0.5")} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ═══ TERMS ═══ */}
              {activeTab === "terms" && (
                <section>
                  <h2 className="mb-3 text-base font-bold text-[#1a1a1a]">Terms &amp; Conditions</h2>
                  <div className="divide-y divide-[#f0f0f0] overflow-hidden rounded-2xl border border-[#e8e8e8]">
                    {TERMS_AND_CONDITIONS.map((tc, i) => (
                      <div key={tc.title}>
                        <button type="button" onClick={() => setOpenTermIdx(openTermIdx===i?null:i)}
                          className={cn("flex w-full items-center justify-between px-4 py-4 text-left transition", openTermIdx===i ? "bg-[#fafafa]" : "hover:bg-[#fafafa]")}
                          aria-expanded={openTermIdx===i}>
                          <span className="text-[13px] font-bold text-[#1a1a1a]">{tc.title}</span>
                          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#9e9e9e] transition-transform", openTermIdx===i&&"rotate-180")} aria-hidden />
                        </button>
                        {openTermIdx===i && (
                          <div className="border-t border-[#f0f0f0] bg-[#fafafa] px-4 py-3.5 text-[12px] leading-relaxed text-[#616161]">{tc.body}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ═══ BOOK ═══ */}
              {activeTab === "book" && (
                <section>
                  {bookState.phase === "success" && bookState.result && (
                    <PackageBookingSuccess
                      result={bookState.result}
                      tourTitle={tour.title}
                      onPayBalance={bookState.result.status === "token_paid"
                        ? () => payBalance(bookState.result!.booking_id, { name: "", email: "", phone: "" })
                        : undefined}
                    />
                  )}

                  {bookState.phase === "error" && (
                    <div className="mb-4 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-4">
                      <p className="text-[12px] font-bold text-[#DC2626]">Payment failed</p>
                      <p className="mt-1 text-[11px] text-[#B91C1C]">{bookState.message}</p>
                      <button type="button" onClick={resetBook} className="mt-2 text-[11px] font-bold text-primary underline">Try again</button>
                    </div>
                  )}

                  {isBooking && (
                    <div className="mb-4 rounded-2xl border border-[#e8e8e8] bg-[#fafafa] p-6 text-center">
                      <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#e8e8e8] border-t-primary" />
                      <p className="text-[12px] font-medium text-[#616161]">
                        {bookState.phase==="loading"?"Creating your booking…":bookState.phase==="awaiting_payment"?"Opening payment window…":"Verifying payment…"}
                      </p>
                    </div>
                  )}

                  {(bookState.phase === "idle" || bookState.phase === "error") && (
                    <form onSubmit={handleConfirmAndPay} noValidate>
                      <h2 className="mb-4 text-base font-bold text-[#1a1a1a]">Traveller details</h2>
                      <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        {[
                          { name:"guestName", label:"Full name *", type:"text",  auto:"name",  ph:"Your full name",   prefill: user?.name  ?? "" },
                          { name:"guestEmail",label:"Email *",      type:"email", auto:"email", ph:"you@email.com",    prefill: user?.email ?? "" },
                          { name:"guestPhone",label:"Phone *",      type:"tel",   auto:"tel",   ph:"+91 98765 43210",  prefill: user?.phone ?? "" },
                          { name:"travelDate",label:"Travel date",  type:"date",  auto:"off",   ph:"",                 prefill: "" },
                        ].map(({name,label,type,auto,ph,prefill}) => (
                          <div key={name}>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#616161]">{label}</label>
                            <input name={name} required={label.includes("*")} type={type} autoComplete={auto}
                              placeholder={ph}
                              defaultValue={prefill}
                              className="block h-11 w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 text-sm text-[#1a1a1a] placeholder:text-[#bdbdbd] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-semibold text-[#616161]">Special requests</label>
                          <textarea name="specialReq" rows={2} placeholder="Dietary needs, anniversary, accessibility…"
                            className="block w-full resize-none rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#bdbdbd] transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                      </div>

                      <p className="mb-2 text-[12px] font-bold text-[#1a1a1a]">Payment option</p>
                      <div className={cn("mb-5 grid gap-3", tokenPaymentAvailable ? "grid-cols-2" : "grid-cols-1")}>
                        {[
                          ...(tokenPaymentAvailable ? [{
                            type: "token" as const, title: "Token amount", amt: `₹${fmtINR(token)}`,
                            sub: `${tokenType === "percent" ? `${pkgTokenConfig}%` : `₹${fmtINR(token)}`} now · balance ${balanceDays} days before travel`,
                            badge: "Recommended",
                          }] : []),
                          { type:"full"  as const, title:"Full payment",  amt:`₹${fmtINR(breakdown.total)}`, sub:"100% now · priority seat", badge: tokenPaymentAvailable ? null : "Only option" },
                        ].map(({type,title,amt,sub,badge}) => (
                          <button key={type} type="button" onClick={() => setPayType(type)}
                            className={cn("relative rounded-xl border-[1.5px] p-4 text-left transition duration-200",
                              payType===type?"border-primary bg-orange-50/60 shadow-[0_4px_16px_-6px_rgba(234,88,12,0.25)]":"border-[#e8e8e8] bg-white hover:border-[#FDBA74] hover:shadow-sm")}
                            aria-pressed={payType===type}>
                            {badge && <span className="absolute -top-px right-8 rounded-b bg-primary px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">{badge}</span>}
                            <div className={cn("mb-2.5 flex h-5 w-5 items-center justify-center rounded-full border-[1.5px]", payType===type?"border-primary bg-primary":"border-[#d0d0d0]")}>
                              {payType===type && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <p className="text-[12px] font-bold text-[#1a1a1a]">{title}</p>
                            <p className="mt-0.5 text-lg font-bold text-primary">{amt}</p>
                            <p className="mt-0.5 text-[10px] text-[#9e9e9e]">{sub}</p>
                          </button>
                        ))}
                      </div>

                      <button type="submit" disabled={isBooking}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(234,88,12,0.55)] disabled:pointer-events-none disabled:opacity-60">
                        <Lock className="h-4 w-4" aria-hidden />
                        Confirm &amp; pay ₹{fmtINR(payAmt)}
                      </button>
                      {payType === "token" && tokenPaymentAvailable ? (
                        <p className="mt-1.5 text-center text-[11px] font-semibold text-emerald-700">
                          You&apos;re paying just ₹{fmtINR(token)}
                          {tokenType === "percent" ? ` (${pkgTokenConfig}%)` : ""} now to secure your booking
                        </p>
                      ) : (
                        <p className="mt-1.5 text-center text-[11px] font-semibold text-emerald-700">
                          You&apos;re paying the full amount now to confirm your booking
                        </p>
                      )}
                      <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-[#9e9e9e]">
                        <ShieldCheck className="h-3 w-3" aria-hidden />Secured by Razorpay · No hidden charges
                      </p>

                      <div className="mt-6 rounded-2xl border border-dashed border-[#FDBA74] bg-orange-50/50 p-5 text-center">
                        <p className="text-[13px] font-bold text-[#1a1a1a]">Want a fully custom itinerary?</p>
                        <p className="mt-0.5 text-[11px] text-[#757575]">Different route, extra nights, special requirements — designed free.</p>
                        <div className="mt-3.5 flex items-center justify-center gap-2">
                          <a href={siteWhatsAppChatUrl(packageWhatsAppPrefill(tour.title))} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden />WhatsApp
                          </a>
                          <a href={siteTelHref()} className="flex items-center gap-1.5 rounded-xl border border-[#e0e0e0] bg-white px-4 py-2.5 text-[12px] font-bold text-[#424242] transition hover:-translate-y-0.5 hover:shadow-sm">
                            <Phone className="h-3.5 w-3.5" aria-hidden />Call us
                          </a>
                        </div>
                      </div>
                    </form>
                  )}
                </section>
              )}

              </motion.div>

              {/* Sticky sidebar */}
              <div className="hidden lg:block">
                <div className="sticky top-4">
                  <Sidebar />
                </div>
              </div>

              </div>
            </div>
          </div>

          {/* Similar packages */}
          {similar.length > 0 && (
            <div className="mt-6 rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.1)] sm:p-6">
              <h2 className="mb-4 text-base font-bold text-[#1a1a1a]">You may also like</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {similar.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link href={`${packageDetailHref(p)}?rooms=${encodeRooms(rooms)}`}
                      className="group flex gap-3 rounded-xl border border-[#e8e8e8] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_24px_-10px_rgba(15,23,42,0.25)]">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image src={p.image} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="96px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1a1a1a] group-hover:text-primary line-clamp-2">{p.title}</p>
                        <p className="mt-1 text-[11px] text-[#9e9e9e]">{p.durationDays}D · from ₹{formatInrAmount(p.priceINR)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/packages" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">View all packages →</Link>
            </div>
          )}
        </div>
      </main>

      {/* Mobile price bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e8e8] bg-white/95 px-4 py-3 shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.15)] backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#9e9e9e]">Total</p>
            <p className="text-lg font-bold text-[#1a1a1a]">₹{fmtINR(breakdown.total)}</p>
          </div>
          <button type="button" onClick={() => {
              if (!isAuthenticated) { setShowLoginModal(true); }
              else { switchTab("book"); }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.5)] transition hover:opacity-90">
            <Lock className="h-4 w-4" aria-hidden />Book now
          </button>
        </div>
      </div>

      <Footer />

      {/* ── Booking auth modal — same component used across hotels + packages ── */}
      <BookingAuthModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          setTimeout(() => switchTab("book"), 100);
        }}
      />

      <ChangeHotelModal
        open={changeHotelDestIdx !== null}
        onClose={() => setChangeHotelDestIdx(null)}
        destination={changeHotelDestIdx !== null ? hotelGroups[changeHotelDestIdx] : undefined}
        selectedIndex={changeHotelDestIdx !== null ? (selectedHotels[changeHotelDestIdx] ?? 0) : 0}
        checkIn={changeHotelDestIdx !== null ? dateForDay(destStartDayOf(changeHotelDestIdx)) : null}
        onSelect={(oi) => {
          if (changeHotelDestIdx === null) return;
          const di = changeHotelDestIdx;
          setSelectedHotels((prev) => { const h = [...prev]; h[di] = oi; return h; });
        }}
      />
    </>
  );
}
