"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  Globe2,
  Hotel,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Pencil,
  Phone,
  Plane,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, getAuthErrorMessage } from "@/contexts/auth-context";
import type { AuthUser } from "@/lib/hotels-auth-api";
import {
  fetchAccountProfile,
  fetchUserBookings,
  updateAccountProfile,
  type UserBooking,
} from "@/lib/hotels-account-api";
import {
  buildIncompleteDisplay,
  pendingBookingsForMerge,
  syncPendingCheckoutsFromBookings,
} from "@/lib/account-bookings-display";
import { getCachedBookings, mergeBookings } from "@/lib/booking-cache-storage";
import { cancelHotelBooking, isIncompleteBookingStatus } from "@/lib/hotels-bookings-api";
import { AccountChangePassword } from "@/components/account/account-change-password";
import { AccountMyReviews } from "@/components/account/account-my-reviews";
import {
  claimPendingCheckoutsForUser,
  getPendingCheckoutsForUser,
  resumeCheckoutHref,
  type PendingCheckout,
} from "@/lib/pending-checkout-storage";
import { checkoutResumeHref } from "@/lib/checkout-resume";
import { cn } from "@/lib/utils";

function resumeApiBookingHref(booking: UserBooking, pendingMeta?: PendingCheckout): string {
  if (pendingMeta) {
    return checkoutResumeHref({
      citySlug: pendingMeta.citySlug,
      hotelSlug: pendingMeta.hotelSlug ?? pendingMeta.hotelId,
      roomTypeId: pendingMeta.roomTypeId,
      ratePlanId: pendingMeta.ratePlanId,
      checkIn: pendingMeta.checkIn,
      checkOut: pendingMeta.checkOut,
      rooms: pendingMeta.rooms,
      guests: pendingMeta.guests,
      bookingId: booking.id,
    });
  }

  const q = new URLSearchParams({
    booking_id: booking.id,
    resume: "1",
    city: booking.hotel_city.trim().toLowerCase().replace(/\s+/g, "-"),
    roomType: booking.room_type_id,
    rate: booking.room_type_id,
    check_in: booking.check_in,
    check_out: booking.check_out,
    rooms: String(booking.rooms),
    guests: String(booking.adults),
  });
  return `/checkout/resume?${q.toString()}`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] ?? "U").toUpperCase();
}

type BookingFilter = "all" | "upcoming" | "past" | "pending";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntilCheckIn(checkIn: string): number | null {
  try {
    const target = new Date(checkIn);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  } catch {
    return null;
  }
}

function loyaltyMeta(tripCount: number): { tier: string; progress: number; next: string } {
  if (tripCount >= 5) return { tier: "UNO Globetrotter", progress: 100, next: "Max tier unlocked" };
  if (tripCount >= 3) return { tier: "UNO Explorer", progress: 75, next: "2 more trips for Globetrotter" };
  if (tripCount >= 1) return { tier: "UNO Wanderer", progress: 40, next: "2 more trips for Explorer" };
  return { tier: "UNO Newcomer", progress: 8, next: "Book your first stay to level up" };
}

function filterConfirmedBookings(bookings: UserBooking[], filter: BookingFilter): UserBooking[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (filter === "all") return bookings;
  if (filter === "upcoming") {
    return bookings.filter((b) => {
      try {
        return new Date(b.check_in) >= now;
      } catch {
        return false;
      }
    });
  }
  if (filter === "past") {
    return bookings.filter((b) => {
      try {
        return new Date(b.check_out) < now;
      } catch {
        return false;
      }
    });
  }
  return bookings;
}

function pickNextTrip(bookings: UserBooking[]): UserBooking | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcoming = bookings
    .filter((b) => {
      try {
        return new Date(b.check_in) >= now;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  return upcoming[0] ?? null;
}

function statusStyles(status: string): { badge: string; dot: string } {
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "completed") {
    return { badge: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20", dot: "bg-emerald-500" };
  }
  if (s === "cancelled" || s === "failed") {
    return { badge: "bg-red-500/15 text-red-700 ring-red-500/20", dot: "bg-red-500" };
  }
  if (s === "pending" || s === "payment_pending") {
    return { badge: "bg-amber-500/15 text-amber-800 ring-amber-500/20", dot: "bg-amber-500" };
  }
  return { badge: "bg-sky-500/15 text-sky-800 ring-sky-500/20", dot: "bg-sky-500" };
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-44 rounded-3xl bg-gradient-to-r from-slate-200 to-slate-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="h-72 rounded-3xl bg-white/90 shadow-sm" />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
  barWidth,
  onClick,
  active,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  barWidth: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const className = cn(
    "group relative w-full overflow-hidden rounded-2xl border bg-white/90 p-5 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition duration-300",
    active ? "border-[#2196F3]/40 ring-2 ring-[#2196F3]/20" : "border-white/80 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(33,150,243,0.12)]",
  );
  const inner = (
    <>
      <div className={cn("absolute inset-0 opacity-[0.07] bg-gradient-to-br", gradient)} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9E9E9E]">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-[#212121]">{value}</p>
          <p className="mt-0.5 text-[12px] text-[#757575]">{sub}</p>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", gradient)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-[#f0f0f0]">
        <div className={cn("h-full rounded-full bg-gradient-to-r", gradient)} style={{ width: barWidth }} />
      </div>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}

function NextTripSpotlight({ booking }: { booking: UserBooking }) {
  const days = daysUntilCheckIn(booking.check_in);
  const citySlug = booking.hotel_city.trim().toLowerCase().replace(/\s+/g, "-");
  const hotelPath = `/hotel/${citySlug}/${booking.hotel_id}`;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 shadow-[0_20px_60px_rgba(21,101,192,0.15)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D47A1]/90 via-[#1565C0]/85 to-[#1976D2]/75" />
      {booking.hotel_thumbnail ? (
        <Image
          src={booking.hotel_thumbnail}
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="(max-width: 1024px) 100vw, 1152px"
          unoptimized
        />
      ) : null}
      <div className="dashboard-shine pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex-1 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-[#FFD54F]" aria-hidden />
            Next adventure
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{booking.hotel_name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
            <MapPin className="h-4 w-4 text-[#FFB74D]" aria-hidden />
            {booking.hotel_city} · {booking.room_name}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur-md">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
            </span>
            {days !== null && days >= 0 ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#EF6614] px-3 py-2 text-sm font-bold shadow-lg">
                <Clock className="h-4 w-4" aria-hidden />
                {days === 0 ? "Check-in today!" : `${days} day${days !== 1 ? "s" : ""} to go`}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <p className="text-2xl font-black text-white">{formatMoney(booking.total_amount, booking.currency)}</p>
          <Button asChild className="h-12 rounded-xl bg-white px-6 font-bold text-[#1565C0] shadow-xl hover:bg-white/95">
            <Link href={hotelPath}>
              View stay details
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function IncompleteBookingCard({
  booking,
  resumeHref,
}: {
  booking: UserBooking;
  resumeHref: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-[#FFB74D] bg-gradient-to-br from-[#FFF8E1] via-white to-[#FFF3E0] shadow-[0_8px_32px_rgba(239,102,20,0.12)]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FF9800] text-white shadow-lg shadow-[#FF9800]/30">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#E65100]">
            Checkout incomplete · Payment pending
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#212121]">{booking.hotel_name}</h3>
          <p className="mt-0.5 text-[13px] text-[#616161]">
            {booking.hotel_city} · {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#757575]">
            You reached checkout for this hotel but <strong>payment was not completed</strong>. Complete
            payment now to confirm your booking.
          </p>
          {booking.confirmation_number ? (
            <p className="mt-1 text-[11px] text-[#9E9E9E]">
              Ref: <span className="font-mono">{booking.confirmation_number}</span>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <p className="text-center text-lg font-black text-[#EF6614] sm:text-right">
            {formatMoney(booking.total_amount, booking.currency)}
          </p>
          <Button asChild className="h-11 rounded-xl bg-[#EF6614] px-6 font-bold shadow-md hover:bg-[#E65100]">
            <Link href={resumeHref}>
              <CreditCard className="mr-2 h-4 w-4" aria-hidden />
              Complete payment
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function IncompletePendingCard({ pending }: { pending: PendingCheckout }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-dashed border-[#FFB74D] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF3E0] text-[#E65100]">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#E65100]">Payment not done</p>
          <h3 className="font-bold text-[#212121]">{pending.hotelName}</h3>
          <p className="text-[13px] text-[#616161]">
            {pending.hotelCity} · {formatDate(pending.checkIn)} – {formatDate(pending.checkOut)}
          </p>
          <p className="mt-1 text-[12px] text-[#757575]">
            Checkout was not completed — payment is still pending.
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-xl bg-[#2196F3] font-bold hover:bg-[#1976D2]">
          <Link href={resumeCheckoutHref(pending)}>Resume checkout</Link>
        </Button>
      </div>
    </article>
  );
}

function canCancelBooking(booking: UserBooking): boolean {
  const s = booking.status.toLowerCase();
  if (s === "cancelled" || s === "canceled" || s === "failed" || s === "refunded") return false;
  if (isIncompleteBookingStatus(booking.status)) return false;
  const days = daysUntilCheckIn(booking.check_in);
  return days !== null && days >= 0;
}

function BookingCard({
  booking,
  index,
  onCancel,
  cancelLoading,
}: {
  booking: UserBooking;
  index: number;
  onCancel?: (booking: UserBooking) => void;
  cancelLoading?: boolean;
}) {
  const citySlug = booking.hotel_city.trim().toLowerCase().replace(/\s+/g, "-");
  const hotelPath = `/hotel/${citySlug}/${booking.hotel_id}`;
  const status = statusStyles(booking.status);
  const daysLeft = daysUntilCheckIn(booking.check_in);

  return (
    <article
      className="group overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(33,150,243,0.15)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-48 w-full shrink-0 overflow-hidden lg:h-auto lg:w-56">
          {booking.hotel_thumbnail ? (
            <>
              <Image
                src={booking.hotel_thumbnail}
                alt={booking.hotel_name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 224px"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
              <Hotel className="h-12 w-12 text-[#1976D2]/40" aria-hidden />
            </div>
          )}
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ring-inset backdrop-blur-md",
              status.badge,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {booking.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#212121] group-hover:text-[#1976D2] transition-colors">
                {booking.hotel_name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-[13px] text-[#757575]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#EF6614]" aria-hidden />
                {booking.hotel_city}
              </p>
            </div>
            <p className="text-xl font-black text-[#EF6614]">
              {formatMoney(booking.total_amount, booking.currency)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { icon: BedDouble, label: booking.room_name },
              { icon: Moon, label: `${booking.nights} night${booking.nights !== 1 ? "s" : ""}` },
              { icon: Users, label: `${booking.adults} guest${booking.adults !== 1 ? "s" : ""}` },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5f7fa] px-2.5 py-1 text-[11px] font-medium text-[#616161]"
              >
                <Icon className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E3F2FD]/60 to-[#FFF3E0]/50 px-3 py-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#1976D2]" aria-hidden />
            <p className="text-[13px] font-medium text-[#424242]">
              {formatDate(booking.check_in)}
              <span className="mx-2 text-[#bdbdbd]">→</span>
              {formatDate(booking.check_out)}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f0f0] pt-4">
            <p className="text-[11px] font-medium text-[#9E9E9E]">
              Confirmation · <span className="font-mono text-[#616161]">{booking.confirmation_number}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {onCancel && canCancelBooking(booking) ? (
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={() => onCancel(booking)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                >
                  {cancelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                  Cancel booking
                </button>
              ) : null}
              <Link
                href={hotelPath}
                className="inline-flex items-center gap-1 rounded-full bg-[#2196F3] px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-[#2196F3]/25 transition hover:bg-[#1976D2] hover:shadow-lg"
              >
                View hotel
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type AccountDashboardProps = {
  onLogout: () => Promise<void>;
};

export function AccountDashboard({ onLogout }: AccountDashboardProps) {
  const { user: sessionUser, getAccessToken, updateUser } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(sessionUser);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [localPending, setLocalPending] = useState<PendingCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews" | "profile">("bookings");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (options?: { silent?: boolean }) => {
    const token = getAccessToken();
    if (!token) {
      setLoadError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    if (options?.silent) setRefreshing(true);
    else setLoading(true);
    setLoadError(null);
    try {
      const profileData = await fetchAccountProfile(token);
      setProfile(profileData);
      setName(profileData.name);
      setPhone(profileData.phone?.replace(/\D/g, "").slice(-10) ?? "");

      claimPendingCheckoutsForUser(profileData.id, profileData.email);

      const apiBookings = await fetchUserBookings(token);
      const cached = getCachedBookings(profileData.id);
      const merged = mergeBookings(apiBookings, cached);

      syncPendingCheckoutsFromBookings(profileData.id, profileData.email, merged);

      const pending = getPendingCheckoutsForUser(profileData.id, profileData.email);
      setLocalPending(pending);
      setBookings(mergeBookings(merged, pendingBookingsForMerge(pending)));
    } catch (err) {
      const storedUser = sessionUser;
      if (storedUser) {
        claimPendingCheckoutsForUser(storedUser.id, storedUser.email);
        const cached = getCachedBookings(storedUser.id);
        syncPendingCheckoutsFromBookings(storedUser.id, storedUser.email, cached);
        const pending = getPendingCheckoutsForUser(storedUser.id, storedUser.email);
        setLocalPending(pending);
        setBookings(mergeBookings(cached, pendingBookingsForMerge(pending)));
        setLoadError(null);
      } else {
        setLoadError(getAuthErrorMessage(err));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAccessToken, sessionUser]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const onFocus = () => void loadDashboard();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadDashboard]);

  const handleCancelBooking = async (booking: UserBooking) => {
    const token = getAccessToken();
    if (!token) return;
    if (!window.confirm(`Cancel booking at ${booking.hotel_name}? This cannot be undone.`)) return;

    setCancelBookingId(booking.id);
    try {
      const updated = await cancelHotelBooking(token, booking.id);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)));
    } catch (err) {
      window.alert(getAuthErrorMessage(err));
    } finally {
      setCancelBookingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) return;

    setSaveLoading(true);
    setSaveError(null);
    setSaveMessage(null);
    try {
      const phoneDigits = phone.replace(/\D/g, "").slice(-10);
      const updated = await updateAccountProfile(token, {
        name: name.trim(),
        phone: phoneDigits.length === 10 ? phoneDigits : null,
      });
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
      setSaveMessage("Profile updated successfully.");
    } catch (err) {
      setSaveError(getAuthErrorMessage(err));
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50 to-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-red-700">{loadError}</p>
        <Button
          type="button"
          className="mt-5 rounded-full bg-[#2196F3] px-6 hover:bg-[#1976D2]"
          onClick={() => void loadDashboard()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const displayUser = profile ?? sessionUser;
  if (!displayUser) return null;

  const firstName = displayUser.name.split(" ")[0] || "Traveler";
  const memberSince = formatDate(displayUser.created_at);

  const {
    incompleteFromBookings: incompleteApiBookings,
    incompleteFromLocal: extraLocalPending,
    incompleteCount,
  } = buildIncompleteDisplay(bookings, localPending);
  const confirmedBookings = bookings.filter((b) => !isIncompleteBookingStatus(b.status));

  const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const upcomingCount = confirmedBookings.filter((b) => {
    try {
      return new Date(b.check_in) >= new Date();
    } catch {
      return false;
    }
  }).length;

  const loyalty = loyaltyMeta(confirmedBookings.length);
  const nextTrip = pickNextTrip(confirmedBookings);
  const displayedConfirmed =
    bookingFilter === "pending" ? [] : filterConfirmedBookings(confirmedBookings, bookingFilter);

  const bookingFilters: { id: BookingFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: confirmedBookings.length },
    { id: "upcoming", label: "Upcoming", count: upcomingCount },
    {
      id: "past",
      label: "Past",
      count: filterConfirmedBookings(confirmedBookings, "past").length,
    },
    { id: "pending", label: "Pending pay", count: incompleteCount },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start lg:gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:space-y-4">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] text-lg font-black text-white shadow-lg">
              {displayUser.avatar ? (
                <Image src={displayUser.avatar} alt="" width={56} height={56} className="h-full w-full rounded-2xl object-cover" unoptimized />
              ) : (
                userInitials(displayUser.name)
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-[#212121]">{displayUser.name}</p>
              <p className="truncate text-[12px] text-[#757575]">{displayUser.email}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#FFF8E1] to-[#FFF3E0] p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FF9800]" aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#E65100]">{loyalty.tier}</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF9800] to-[#EF6614]" style={{ width: `${loyalty.progress}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-[#757575]">{loyalty.next}</p>
          </div>
        </div>

        <nav className="space-y-1 rounded-3xl border border-white/80 bg-white/90 p-2 shadow-sm backdrop-blur-md">
          {(
            [
              { id: "bookings" as const, label: "My bookings", icon: Plane },
              { id: "reviews" as const, label: "My reviews", icon: MessageSquare },
              { id: "profile" as const, label: "Profile", icon: Shield },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition",
                activeTab === item.id ? "bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white shadow-md" : "text-[#616161] hover:bg-[#f5f7fa]",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-2">
          {[
            { href: "/hotels", label: "Book hotels", icon: Hotel },
            { href: "/packages", label: "Packages", icon: Globe2 },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl border border-[#e8e8e8] bg-white/90 px-4 py-3 text-sm font-semibold text-[#424242] shadow-sm transition hover:border-[#2196F3]/30 hover:text-[#1976D2]"
            >
              <link.icon className="h-4 w-4 text-[#2196F3]" aria-hidden />
              {link.label}
              <ChevronRight className="ml-auto h-4 w-4 text-[#bdbdbd]" aria-hidden />
            </Link>
          ))}
        </div>
      </aside>

      <div className="space-y-6 sm:space-y-8">
      {/* Hero welcome card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2] p-6 text-white shadow-[0_24px_60px_rgba(13,71,161,0.4)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#EF6614]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-8 opacity-[0.07]">
          <Sparkles className="h-32 w-32" aria-hidden />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black backdrop-blur-sm ring-2 ring-white/30 sm:h-20 sm:w-20 sm:text-3xl">
                {displayUser.avatar ? (
                  <Image
                    src={displayUser.avatar}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full rounded-2xl object-cover"
                    unoptimized
                  />
                ) : (
                  userInitials(displayUser.name)
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EF6614] ring-2 ring-[#1976D2]">
                <BadgeCheck className="h-3.5 w-3.5 text-white" aria-hidden />
              </span>
            </div>

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {getGreeting()} · Your travel hub
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                {firstName}, ready for your next trip?
              </h1>
              <p className="mt-1 max-w-sm text-sm text-white/80">
                Bookings, payments, and profile — all in one premium dashboard.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {displayUser.role === "guest" ? "Guest member" : displayUser.role}
                <span className="text-white/50">·</span>
                Since {memberSince}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
            <Button
              asChild
              className="h-11 rounded-xl bg-white font-bold text-[#1565C0] shadow-lg hover:bg-white/95"
            >
              <Link href="/hotels">
                <Hotel className="mr-2 h-4 w-4" aria-hidden />
                Book a hotel
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-white/40 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              onClick={() => void onLogout()}
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Logout
            </Button>
          </div>
        </div>
      </section>

      {activeTab === "bookings" && nextTrip ? <NextTripSpotlight booking={nextTrip} /> : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#616161]">Overview</p>
        <button
          type="button"
          onClick={() => void loadDashboard({ silent: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-2 text-[12px] font-bold text-[#616161] shadow-sm transition hover:border-[#2196F3]/30 hover:text-[#1976D2] disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} aria-hidden />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Confirmed trips", value: String(confirmedBookings.length), sub: confirmedBookings.length === 1 ? "booking" : "bookings", icon: Plane, gradient: "from-[#2196F3] to-[#1565C0]", glow: "shadow-[#2196F3]/20" },
          { label: "Upcoming stays", value: String(upcomingCount), sub: upcomingCount ? "get packing" : "plan a trip", icon: TrendingUp, gradient: "from-[#00897B] to-[#00695C]", glow: "shadow-emerald-500/20" },
          { label: "Pending payment", value: String(incompleteCount), sub: incompleteCount ? "complete checkout" : "all clear", icon: AlertTriangle, gradient: "from-[#FF9800] to-[#E65100]", glow: "shadow-[#FF9800]/20" },
          { label: "Total spent", value: confirmedBookings.length ? formatMoney(totalSpent, confirmedBookings[0]?.currency ?? "INR") : "—", sub: "lifetime value", icon: Wallet, gradient: "from-[#7B1FA2] to-[#4A148C]", glow: "shadow-purple-500/20" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5",
              stat.glow,
              "hover:shadow-lg",
            )}
          >
            <div
              className={cn(
                "absolute -right-4 -top-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br opacity-[0.12] transition group-hover:opacity-20",
                stat.gradient,
              )}
            >
              <stat.icon className="h-10 w-10" aria-hidden />
            </div>
            <div
              className={cn(
                "mb-3 inline-flex rounded-xl bg-gradient-to-br p-2.5 text-white shadow-md",
                stat.gradient,
              )}
            >
              <stat.icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">{stat.label}</p>
            <p className="mt-1 text-2xl font-black text-[#212121]">{stat.value}</p>
            <p className="text-[12px] text-[#757575]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs — mobile */}
      <div className="flex gap-1 rounded-2xl border border-[#e8e8e8] bg-white/90 p-1.5 shadow-sm backdrop-blur-md lg:hidden">
        {(
          [
            { id: "bookings" as const, label: "Bookings", count: confirmedBookings.length + incompleteCount },
            { id: "reviews" as const, label: "Reviews", count: null },
            { id: "profile" as const, label: "Profile", count: null },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
              activeTab === tab.id
                ? "bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white shadow-md shadow-[#2196F3]/25"
                : "text-[#757575] hover:bg-[#f5f5f5] hover:text-[#212121]",
            )}
          >
            {tab.label}
            {tab.count !== null ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px]",
                  activeTab === tab.id ? "bg-white/25" : "bg-[#E3F2FD] text-[#1976D2]",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === "bookings" ? (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {bookingFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setBookingFilter(f.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition",
                  bookingFilter === f.id
                    ? "bg-gradient-to-r from-[#2196F3] to-[#1976D2] text-white shadow-md"
                    : "border border-[#e8e8e8] bg-white text-[#616161] hover:border-[#2196F3]/30",
                )}
              >
                {f.label}
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", bookingFilter === f.id ? "bg-white/25" : "bg-[#f5f5f5]")}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {(bookingFilter === "pending" || bookingFilter === "all") && incompleteCount > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#E65100]" aria-hidden />
                <h2 className="text-lg font-bold text-[#212121]">Incomplete checkout</h2>
                <span className="rounded-full bg-[#FF9800] px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {incompleteCount}
                </span>
              </div>
              <p className="text-[13px] text-[#616161]">
                You started checkout for these hotels but did not complete payment. Finish payment to confirm
                your bookings.
              </p>
              <div className="grid gap-4">
                {incompleteApiBookings.map((b) => {
                  const pendingMeta = localPending.find((p) => p.bookingId === b.id);
                  return (
                    <IncompleteBookingCard
                      key={b.id}
                      booking={b}
                      resumeHref={resumeApiBookingHref(b, pendingMeta)}
                    />
                  );
                })}
                {extraLocalPending.map((p) => (
                  <IncompletePendingCard key={p.bookingId ?? p.id} pending={p} />
                ))}
              </div>
            </div>
          ) : bookingFilter === "pending" ? (
            <p className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white px-6 py-10 text-center text-sm text-[#757575]">
              No pending payments — you&apos;re all clear.
            </p>
          ) : null}

          {bookingFilter !== "pending" ? (
          <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#212121]">
              {bookingFilter === "upcoming" ? "Upcoming trips" : bookingFilter === "past" ? "Past stays" : "All reservations"}
            </h2>
            {confirmedBookings.length > 0 ? (
              <Link
                href="/hotels"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#2196F3] hover:underline"
              >
                Book another
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>

          {displayedConfirmed.length === 0 && incompleteCount === 0 && bookingFilter === "all" ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-[#90CAF9] bg-gradient-to-br from-[#E3F2FD]/50 via-white to-[#FFF3E0]/40 p-10 text-center sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(33,150,243,0.08),transparent_50%)]" />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] shadow-lg shadow-[#2196F3]/30">
                <Hotel className="h-10 w-10 text-white" aria-hidden />
              </div>
              <h3 className="relative mt-6 text-xl font-bold text-[#212121]">No adventures yet</h3>
              <p className="relative mx-auto mt-2 max-w-sm text-sm text-[#616161]">
                Your dream stay is one click away. Explore hand-picked hotels across India and beyond.
              </p>
              <Button
                asChild
                className="relative mt-6 h-12 rounded-full bg-gradient-to-r from-[#EF6614] to-[#E65100] px-8 text-sm font-bold shadow-lg shadow-[#EF6614]/30 hover:opacity-95"
              >
                <Link href="/hotels">
                  Discover hotels
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : displayedConfirmed.length > 0 ? (
            <div className="grid gap-5">
              {displayedConfirmed.map((b, i) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  index={i}
                  onCancel={(bk) => void handleCancelBooking(bk)}
                  cancelLoading={cancelBookingId === b.id}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[#e0e0e0] bg-white px-4 py-6 text-center text-sm text-[#757575]">
              No bookings match this filter.
            </p>
          )}
          </>
          ) : null}
        </section>
      ) : activeTab === "reviews" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#212121]">My reviews</h2>
            <p className="text-[13px] text-[#757575]">Reviews you submitted after your stays</p>
          </div>
          <AccountMyReviews />
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
          <div className="border-b border-[#f0f0f0] bg-gradient-to-r from-[#fafafa] to-white px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#212121]">Profile details</h2>
                <p className="text-[13px] text-[#757575]">Keep your contact info up to date for bookings</p>
              </div>
              {!editing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#2196F3]/30 text-[#1976D2] hover:bg-[#E3F2FD]"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Edit profile
                </Button>
              ) : null}
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSaveProfile} className="mx-auto max-w-md space-y-5">
                <div>
                  <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-[#424242]">
                    Full name
                  </label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    disabled={saveLoading}
                    className="h-12 rounded-xl border-[#e0e0e0]"
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-semibold text-[#424242]">
                    Mobile number
                  </label>
                  <div className="flex gap-2">
                    <span className="flex h-12 items-center rounded-xl border border-[#e0e0e0] bg-[#f5f7fa] px-4 text-sm font-medium text-[#616161]">
                      +91
                    </span>
                    <Input
                      id="profile-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      disabled={saveLoading}
                      className="h-12 rounded-xl border-[#e0e0e0]"
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
                {saveError ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{saveError}</p>
                ) : null}
                {saveMessage ? (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">{saveMessage}</p>
                ) : null}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={saveLoading}
                    className="h-11 flex-1 rounded-xl bg-[#2196F3] font-bold hover:bg-[#1976D2]"
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saveLoading}
                    className="h-11 rounded-xl"
                    onClick={() => {
                      setEditing(false);
                      setName(displayUser.name);
                      setPhone(displayUser.phone?.replace(/\D/g, "").slice(-10) ?? "");
                      setSaveError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Mail,
                    label: "Email address",
                    value: displayUser.email,
                    color: "from-[#E3F2FD] to-[#BBDEFB]",
                    iconColor: "text-[#1976D2]",
                  },
                  {
                    icon: Phone,
                    label: "Phone number",
                    value: displayUser.phone ? `+91 ${displayUser.phone}` : "Add your mobile number",
                    color: "from-[#FFF3E0] to-[#FFE0B2]",
                    iconColor: "text-[#E65100]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-4 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-4 transition hover:border-[#2196F3]/20 hover:bg-white hover:shadow-sm"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                        item.color,
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", item.iconColor)} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                        {item.label}
                      </p>
                      <p className="mt-0.5 truncate text-[15px] font-semibold text-[#212121]">{item.value}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-4 sm:col-span-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                    <BadgeCheck className="h-5 w-5 text-emerald-600" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                      Account verification
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold",
                          displayUser.email_verified
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            displayUser.email_verified ? "bg-emerald-500" : "bg-amber-500",
                          )}
                        />
                        Email {displayUser.email_verified ? "verified" : "pending"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold",
                          displayUser.phone_verified
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            displayUser.phone_verified ? "bg-emerald-500" : "bg-amber-500",
                          )}
                        />
                        Phone {displayUser.phone_verified ? "verified" : "pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!editing ? <AccountChangePassword /> : null}
          </div>
        </section>
      )}

      {/* Quick links strip */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/hotels", label: "Hotels", desc: "Best stays", emoji: "🏨" },
          { href: "/packages", label: "Packages", desc: "Curated tours", emoji: "🎒" },
          { href: "/blog", label: "Travel tips", desc: "Inspiration", emoji: "✨" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-3 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm transition hover:border-[#2196F3]/30 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f7fa] text-xl transition group-hover:scale-110">
              {link.emoji}
            </span>
            <div className="flex-1">
              <p className="font-bold text-[#212121]">{link.label}</p>
              <p className="text-[12px] text-[#9E9E9E]">{link.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#bdbdbd] transition group-hover:translate-x-0.5 group-hover:text-[#2196F3]" />
          </Link>
        ))}
      </section>
      </div>
    </div>
  );
}






