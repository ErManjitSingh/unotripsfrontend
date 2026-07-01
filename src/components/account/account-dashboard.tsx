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
  const hotelPath = `/account/bookings/${booking.id}`;
  const nights = booking.check_in && booking.check_out
    ? Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86_400_000)
    : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        {booking.hotel_thumbnail ? (
          <div className="relative h-44 w-full shrink-0 sm:h-auto sm:w-52">
            <Image src={booking.hotel_thumbnail} alt={booking.hotel_name} fill className="object-cover" sizes="208px" unoptimized />
          </div>
        ) : (
          <div className="flex h-44 w-full shrink-0 items-center justify-center bg-[#FFF3E0] sm:h-auto sm:w-52">
            <Hotel className="h-10 w-10 text-[#EF6614]" aria-hidden />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between gap-4 p-5">
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3E0] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#EF6614]">
              <Zap className="h-3 w-3" aria-hidden />
              Next trip
            </span>
            <h2 className="mt-2 text-[18px] font-black text-[#212121] leading-snug">{booking.hotel_name}</h2>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-[#757575]">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {booking.hotel_city}
              {booking.room_name ? <> · <span className="text-[#424242]">{booking.room_name}</span></> : null}
            </p>

            {/* Date row */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e8e8] bg-[#f5f5f5] px-3 py-1.5 text-[12px] font-semibold text-[#424242]">
                <CalendarDays className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />
                {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
                {nights ? <span className="text-[#9E9E9E]">· {nights}N</span> : null}
              </span>
              {days !== null && days >= 0 ? (
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold",
                  days === 0 ? "bg-emerald-100 text-emerald-700" : "bg-[#FFF3E0] text-[#EF6614]"
                )}>
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {days === 0 ? "Check-in today!" : `${days} day${days !== 1 ? "s" : ""} to go`}
                </span>
              ) : null}
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-3 border-t border-[#f0f0f0] pt-4">
            <div>
              <p className="text-[11px] text-[#9E9E9E]">Total paid</p>
              <p className="text-[20px] font-black text-[#212121]">{formatMoney(booking.total_amount, booking.currency)}</p>
            </div>
            <Link href={hotelPath}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EF6614] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#E65100]"
            >
              View details <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
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
  const hotelPath = `/account/bookings/${booking.id}`;
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

  // Initialise from localStorage cache so the page never shows a skeleton
  const [bookings, setBookings] = useState<UserBooking[]>(() => {
    if (!sessionUser) return [];
    const cached = getCachedBookings(sessionUser.id);
    const pending = getPendingCheckoutsForUser(sessionUser.id, sessionUser.email);
    return mergeBookings(cached, pendingBookingsForMerge(pending));
  });
  const [localPending, setLocalPending] = useState<PendingCheckout[]>(() => {
    if (!sessionUser) return [];
    return getPendingCheckoutsForUser(sessionUser.id, sessionUser.email);
  });
  // Only show skeleton if there is truly nothing cached yet
  const [loading, setLoading] = useState(() => {
    if (!sessionUser) return false;
    return getCachedBookings(sessionUser.id).length === 0;
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews" | "profile">("bookings");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sessionUser?.name ?? "");
  const [phone, setPhone] = useState(sessionUser?.phone?.replace(/\D/g, "").slice(-10) ?? "");
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
    else if (bookings.length === 0) setLoading(true); // only show skeleton when truly empty
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
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-6">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:space-y-3">
        {/* Profile card */}
        <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EF6614] text-[15px] font-black text-white">
              {displayUser.avatar ? (
                <Image src={displayUser.avatar} alt="" width={48} height={48} className="h-full w-full rounded-xl object-cover" unoptimized />
              ) : userInitials(displayUser.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-[#212121]">{displayUser.name}</p>
              <p className="truncate text-[11px] text-[#9E9E9E]">{displayUser.email}</p>
            </div>
          </div>
          {/* Loyalty progress */}
          <div className="mt-4 border-t border-[#f0f0f0] pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF9800]">
                <Star className="h-3.5 w-3.5" aria-hidden />{loyalty.tier}
              </span>
              <span className="text-[10px] text-[#9E9E9E]">{confirmedBookings.length} trips</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF9800] to-[#EF6614] transition-all duration-700" style={{ width: `${loyalty.progress}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-[#9E9E9E]">{loyalty.next}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="rounded-2xl border border-[#e8e8e8] bg-white p-2 shadow-sm">
          {([
            { id: "bookings" as const, label: "My Bookings", icon: Plane },
            { id: "reviews" as const,  label: "My Reviews",  icon: MessageSquare },
            { id: "profile" as const,  label: "Profile",     icon: Shield },
          ] as const).map((item) => (
            <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
              className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-semibold transition",
                activeTab === item.id ? "bg-[#EF6614] text-white" : "text-[#424242] hover:bg-[#f5f5f5]")}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />{item.label}
            </button>
          ))}
        </nav>

        {/* Quick links */}
        <div className="space-y-2">
          {[
            { href: "/hotels",   label: "Book hotels",  icon: Hotel },
            { href: "/packages", label: "Packages",     icon: Globe2 },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-[13px] font-semibold text-[#424242] transition hover:border-[#EF6614]/30 hover:text-[#EF6614]"
            >
              <link.icon className="h-4 w-4 text-[#EF6614]" aria-hidden />{link.label}
              <ChevronRight className="ml-auto h-4 w-4 text-[#e0e0e0]" aria-hidden />
            </Link>
          ))}
          <button type="button" onClick={() => void onLogout()}
            className="flex w-full items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-[13px] font-semibold text-[#757575] transition hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" aria-hidden />Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="space-y-5">

        {/* Profile header bar */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e8e8] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EF6614] text-[14px] font-black text-white">
              {displayUser.avatar ? (
                <Image src={displayUser.avatar} alt="" width={44} height={44} className="h-full w-full rounded-xl object-cover" unoptimized />
              ) : userInitials(displayUser.name)}
            </div>
            <div>
              <p className="text-[13px] text-[#9E9E9E]">{getGreeting()}</p>
              <p className="text-[16px] font-bold text-[#212121]">{displayUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void loadDashboard({ silent: true })} disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e8e8] px-3 py-2 text-[12px] font-semibold text-[#616161] transition hover:bg-[#f5f5f5] disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link href="/hotels"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EF6614] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#E65100]"
            >
              <Hotel className="h-3.5 w-3.5" aria-hidden />Book hotel
            </Link>
            <button type="button" onClick={() => void onLogout()}
              className="hidden rounded-lg border border-[#e8e8e8] px-3 py-2 text-[12px] font-semibold text-[#757575] transition hover:border-red-200 hover:text-red-600 lg:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Stats row — compact */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total trips",      value: confirmedBookings.length, color: "text-[#2196F3]", bg: "bg-[#E3F2FD]", icon: Plane },
            { label: "Upcoming",         value: upcomingCount,            color: "text-emerald-700", bg: "bg-emerald-50", icon: TrendingUp },
            { label: "Pending pay",      value: incompleteCount,          color: "text-[#E65100]", bg: "bg-[#FFF3E0]", icon: AlertTriangle },
            { label: "Total spent",      value: confirmedBookings.length ? formatMoney(totalSpent, confirmedBookings[0]?.currency ?? "INR") : "—", color: "text-[#7B1FA2]", bg: "bg-purple-50", icon: Wallet, isText: true },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-4 shadow-sm">
              <div className={cn("mb-2 inline-flex rounded-lg p-1.5", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} aria-hidden />
              </div>
              <p className={cn("text-xl font-black", s.color)}>{s.isText ? s.value : s.value}</p>
              <p className="mt-0.5 text-[11px] text-[#9E9E9E]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Next trip spotlight */}
        {activeTab === "bookings" && nextTrip ? <NextTripSpotlight booking={nextTrip} /> : null}

        {/* Mobile tab bar */}
        <div className="flex gap-1 rounded-xl border border-[#e8e8e8] bg-white p-1 lg:hidden">
          {([
            { id: "bookings" as const, label: "Bookings", count: confirmedBookings.length + incompleteCount },
            { id: "reviews" as const,  label: "Reviews",  count: null },
            { id: "profile" as const,  label: "Profile",  count: null },
          ] as const).map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition",
                activeTab === tab.id ? "bg-[#EF6614] text-white shadow-sm" : "text-[#757575] hover:bg-[#f5f5f5]")}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 ? (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", activeTab === tab.id ? "bg-white/25" : "bg-[#f0f0f0] text-[#616161]")}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ── Bookings tab ── */}
        {activeTab === "bookings" ? (
          <section className="space-y-5">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {bookingFilters.map((f) => (
                <button key={f.id} type="button" onClick={() => setBookingFilter(f.id)}
                  className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold transition",
                    bookingFilter === f.id ? "bg-[#EF6614] text-white" : "border border-[#e8e8e8] bg-white text-[#616161] hover:border-[#EF6614]/30 hover:text-[#EF6614]")}
                >
                  {f.label}
                  <span className={cn("rounded-full px-1.5 text-[10px]", bookingFilter === f.id ? "bg-white/25" : "bg-[#f5f5f5] text-[#9E9E9E]")}>{f.count}</span>
                </button>
              ))}
            </div>

            {/* Incomplete checkouts */}
            {(bookingFilter === "pending" || bookingFilter === "all") && incompleteCount > 0 ? (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-[13px] font-bold text-[#E65100]">
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  {incompleteCount} pending payment{incompleteCount > 1 ? "s" : ""}
                </p>
                {incompleteApiBookings.map((b) => (
                  <IncompleteBookingCard key={b.id} booking={b} resumeHref={resumeApiBookingHref(b, localPending.find((p) => p.bookingId === b.id))} />
                ))}
                {extraLocalPending.map((p) => (
                  <IncompletePendingCard key={p.bookingId ?? p.id} pending={p} />
                ))}
              </div>
            ) : bookingFilter === "pending" ? (
              <div className="rounded-xl border border-dashed border-[#e0e0e0] bg-white py-10 text-center">
                <p className="text-sm text-[#9E9E9E]">No pending payments — you&apos;re all set.</p>
              </div>
            ) : null}

            {/* Confirmed bookings list */}
            {bookingFilter !== "pending" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-bold text-[#212121]">
                    {bookingFilter === "upcoming" ? "Upcoming trips" : bookingFilter === "past" ? "Past stays" : "All reservations"}
                  </h2>
                  {confirmedBookings.length > 0 ? (
                    <Link href="/hotels" className="text-[12px] font-semibold text-[#EF6614] hover:underline">
                      Book another →
                    </Link>
                  ) : null}
                </div>

                {displayedConfirmed.length === 0 && incompleteCount === 0 && bookingFilter === "all" ? (
                  <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-white py-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFF3E0]">
                      <Hotel className="h-7 w-7 text-[#EF6614]" aria-hidden />
                    </div>
                    <p className="font-bold text-[#212121]">No bookings yet</p>
                    <p className="mt-1 text-[13px] text-[#9E9E9E]">Explore hotels across India and book your first stay.</p>
                    <Link href="/hotels" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#EF6614] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[#E65100]">
                      Discover hotels <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                ) : displayedConfirmed.length > 0 ? (
                  <div className="grid gap-3">
                    {displayedConfirmed.map((b, i) => (
                      <BookingCard key={b.id} booking={b} index={i} onCancel={(bk) => void handleCancelBooking(bk)} cancelLoading={cancelBookingId === b.id} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-[#e0e0e0] bg-white py-8 text-center text-[13px] text-[#9E9E9E]">No bookings match this filter.</p>
                )}
              </>
            ) : null}
          </section>

        ) : activeTab === "reviews" ? (
          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#212121]">My Reviews</h2>
            <AccountMyReviews />
          </section>

        ) : (
          <section className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] px-6 py-4">
              <div>
                <h2 className="text-[15px] font-bold text-[#212121]">Profile details</h2>
                <p className="text-[12px] text-[#9E9E9E]">Keep your contact info up to date for bookings</p>
              </div>
              {!editing ? (
                <Button type="button" variant="outline" size="sm" className="rounded-lg border-[#e0e0e0] text-[#424242] hover:bg-[#f5f5f5]" onClick={() => setEditing(true)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden />Edit
                </Button>
              ) : null}
            </div>

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="mx-auto max-w-md space-y-5">
                  <div>
                    <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-[#424242]">Full name</label>
                    <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} disabled={saveLoading} className="h-12 rounded-xl border-[#e0e0e0]" />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-semibold text-[#424242]">Mobile number</label>
                    <div className="flex gap-2">
                      <span className="flex h-12 items-center rounded-xl border border-[#e0e0e0] bg-[#f5f7fa] px-4 text-sm font-medium text-[#616161]">+91</span>
                      <Input id="profile-phone" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} disabled={saveLoading} className="h-12 rounded-xl border-[#e0e0e0]" placeholder="10-digit number" />
                    </div>
                  </div>
                  {saveError ? <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{saveError}</p> : null}
                  {saveMessage ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">{saveMessage}</p> : null}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={saveLoading} className="h-11 flex-1 rounded-xl bg-[#EF6614] font-bold hover:bg-[#E65100]">
                      {saveLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save changes"}
                    </Button>
                    <Button type="button" variant="outline" disabled={saveLoading} className="h-11 rounded-xl"
                      onClick={() => { setEditing(false); setName(displayUser.name); setPhone(displayUser.phone?.replace(/\D/g, "").slice(-10) ?? ""); setSaveError(null); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Mail,  label: "Email",  value: displayUser.email, iconBg: "bg-[#E3F2FD]", iconColor: "text-[#1976D2]" },
                    { icon: Phone, label: "Phone",  value: displayUser.phone ? `+91 ${displayUser.phone}` : "Not added", iconBg: "bg-[#FFF3E0]", iconColor: "text-[#E65100]" },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", item.iconBg)}>
                        <item.icon className={cn("h-4.5 h-[18px] w-[18px]", item.iconColor)} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">{item.label}</p>
                        <p className="mt-0.5 truncate text-[14px] font-semibold text-[#212121]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4 sm:col-span-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <BadgeCheck className="h-[18px] w-[18px] text-emerald-600" aria-hidden />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">Verification</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {[
                          { label: "Email", ok: displayUser.email_verified },
                          { label: "Phone", ok: displayUser.phone_verified },
                        ].map(({ label, ok }) => (
                          <span key={label} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} />
                            {label} {ok ? "verified" : "pending"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!editing ? <AccountChangePassword /> : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}








