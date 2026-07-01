"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  Hotel,
  Loader2,
  MapPin,
  Moon,
  Phone,
  Users,
  Utensils,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/auth-context";
import { fetchBookingById, type UserBooking } from "@/lib/hotels-account-api";
import { cancelHotelBooking, isConfirmedBookingStatus } from "@/lib/hotels-bookings-api";
import { getAuthErrorMessage } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch { return iso; }
}

function formatMoney(amount: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch { return `₹${amount}`; }
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "confirmed" || s === "completed")
    return { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: status };
  if (s === "cancelled" || s === "failed")
    return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: status };
  if (s === "pending" || s === "payment_pending")
    return { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", label: "Payment pending" };
  return { bg: "bg-sky-100", text: "text-sky-800", dot: "bg-sky-500", label: status };
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAccessToken, isLoading: authLoading } = useAuth();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<UserBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const token = getAccessToken();
    if (!token) { router.replace("/login?redirect=/account"); return; }
    setLoading(true);
    fetchBookingById(token, bookingId)
      .then(setBooking)
      .catch((err) => setError(getAuthErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [authLoading, bookingId, getAccessToken, router]);

  const handleCancel = async () => {
    if (!booking) return;
    const token = getAccessToken();
    if (!token) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelHotelBooking(token, booking.id);
      setCancelled(true);
      setBooking((b) => b ? { ...b, status: "cancelled" } : b);
    } catch (err) {
      setCancelError(getAuthErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const hotelPath = booking
    ? `/hotel/${booking.hotel_city.trim().toLowerCase().replace(/\s+/g, "-")}/${booking.hotel_slug ?? booking.hotel_id}`
    : "#";

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar variant="ease" easeActiveNavId="hotels" />

        <div className="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6">
          {/* Back link */}
          <Link href="/account" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#616161] hover:text-[#212121]">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to My Bookings
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#EF6614]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="font-semibold text-red-700">{error}</p>
              <button onClick={() => router.back()} className="mt-4 text-sm text-[#EF6614] hover:underline">Go back</button>
            </div>
          ) : booking ? (
            <div className="space-y-4">

              {/* ── Voucher card ── */}
              <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">

                {/* Hotel hero */}
                <div className="relative h-44 w-full sm:h-52">
                  {booking.hotel_thumbnail ? (
                    <Image src={booking.hotel_thumbnail} alt={booking.hotel_name} fill className="object-cover" sizes="800px" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FFF3E0]">
                      <Hotel className="h-12 w-12 text-[#EF6614]" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">Booking confirmed</p>
                      <h1 className="text-[20px] font-black text-white sm:text-[22px]">{booking.hotel_name}</h1>
                      <p className="mt-0.5 flex items-center gap-1 text-[13px] text-white/80">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />{booking.hotel_city}
                      </p>
                    </div>
                    {(() => { const s = statusBadge(booking.status); return (
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold capitalize", s.bg, s.text)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />{s.label.replace(/_/g, " ")}
                      </span>
                    ); })()}
                  </div>
                </div>

                {/* Confirmation ref */}
                <div className="flex items-center justify-between border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-emerald-600" aria-hidden />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">Confirmation No.</p>
                      <p className="font-mono text-[15px] font-bold text-[#212121]">{booking.confirmation_number}</p>
                    </div>
                  </div>
                  <Link href={hotelPath} className="flex items-center gap-1 text-[12px] font-semibold text-[#EF6614] hover:underline">
                    View hotel <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>

                {/* Stay details grid */}
                <div className="grid grid-cols-2 gap-px bg-[#f0f0f0] sm:grid-cols-4">
                  {[
                    { icon: CalendarDays, label: "Check-in",  value: formatDate(booking.check_in),  sub: "From 2:00 PM" },
                    { icon: CalendarDays, label: "Check-out", value: formatDate(booking.check_out), sub: "Until 12:00 PM" },
                    { icon: Moon,         label: "Duration",  value: `${booking.nights} Night${booking.nights !== 1 ? "s" : ""}`, sub: null },
                    { icon: Users,        label: "Guests",    value: `${booking.adults} Adult${booking.adults !== 1 ? "s" : ""}`, sub: booking.rooms > 1 ? `${booking.rooms} rooms` : "1 room" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1 bg-white px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">
                        <item.icon className="h-3.5 w-3.5" aria-hidden />{item.label}
                      </div>
                      <p className="text-[14px] font-bold text-[#212121]">{item.value}</p>
                      {item.sub && <p className="text-[11px] text-[#9E9E9E]">{item.sub}</p>}
                    </div>
                  ))}
                </div>

                {/* Room + meal */}
                <div className="border-t border-[#f0f0f0] px-5 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5f5f5] px-3 py-1.5 text-[12px] font-semibold text-[#424242]">
                      <BedDouble className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />{booking.room_name}
                    </span>
                    {booking.meal_plan_label && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF8E1] px-3 py-1.5 text-[12px] font-semibold text-[#F57F17]">
                        <Utensils className="h-3.5 w-3.5" aria-hidden />{booking.meal_plan_label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Price breakdown ── */}
              <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
                <div className="border-b border-[#f0f0f0] px-5 py-3.5">
                  <h2 className="flex items-center gap-2 text-[14px] font-bold text-[#212121]">
                    <CreditCard className="h-4 w-4 text-[#EF6614]" aria-hidden />Price breakdown
                  </h2>
                </div>
                <div className="space-y-2.5 px-5 py-4">
                  {booking.amount_breakdown && (
                    <>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#616161]">Room charges</span>
                        <span className="font-semibold text-[#212121]">{formatMoney(booking.amount_breakdown.room_charges, booking.currency)}</span>
                      </div>
                      {booking.amount_breakdown.meal_charges > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#616161]">Meal plan</span>
                          <span className="font-semibold text-[#212121]">{formatMoney(booking.amount_breakdown.meal_charges, booking.currency)}</span>
                        </div>
                      )}
                      {booking.amount_breakdown.child_charges > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#616161]">Child charges</span>
                          <span className="font-semibold text-[#212121]">{formatMoney(booking.amount_breakdown.child_charges, booking.currency)}</span>
                        </div>
                      )}
                      {booking.amount_breakdown.taxes > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#616161]">Taxes &amp; fees</span>
                          <span className="font-semibold text-[#212121]">{formatMoney(booking.amount_breakdown.taxes, booking.currency)}</span>
                        </div>
                      )}
                      {booking.amount_breakdown.discount > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#616161]">Discount</span>
                          <span className="font-semibold text-emerald-700">−{formatMoney(booking.amount_breakdown.discount, booking.currency)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                    <span className="text-[14px] font-bold text-[#212121]">Total paid</span>
                    <span className="text-[18px] font-black text-[#EF6614]">{formatMoney(booking.total_amount, booking.currency)}</span>
                  </div>
                </div>
              </div>

              {/* ── Guest details ── */}
              {booking.guest && (
                <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
                  <div className="border-b border-[#f0f0f0] px-5 py-3.5">
                    <h2 className="flex items-center gap-2 text-[14px] font-bold text-[#212121]">
                      <Users className="h-4 w-4 text-[#EF6614]" aria-hidden />Guest details
                    </h2>
                  </div>
                  <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">Name</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-[#212121]">
                        {booking.guest.first_name} {booking.guest.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">Email</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-[#212121]">{booking.guest.email}</p>
                    </div>
                    {booking.guest.phone && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">Phone</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[14px] font-semibold text-[#212121]">
                          <Phone className="h-3.5 w-3.5 text-[#9E9E9E]" aria-hidden />{booking.guest.phone}
                        </p>
                      </div>
                    )}
                    {booking.guest.special_requests && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E]">Special requests</p>
                        <p className="mt-0.5 text-[13px] text-[#424242]">{booking.guest.special_requests}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── What to carry ── */}
              <div className="rounded-2xl border border-[#e8e8e8] bg-white px-5 py-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#212121]">
                  <Clock className="h-4 w-4 text-[#EF6614]" aria-hidden />What to carry at check-in
                </h2>
                <ul className="space-y-2">
                  {[
                    "This booking confirmation (screenshot or printout)",
                    "Original government-issued photo ID (Aadhaar / Passport / Driving License)",
                    "Same card used for payment, if required by hotel",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#424242]">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF6614]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Actions ── */}
              <div className="flex flex-wrap gap-3">
                <Link href={hotelPath}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#424242] shadow-sm transition hover:border-[#EF6614]/40 hover:text-[#EF6614]"
                >
                  <Hotel className="h-4 w-4" aria-hidden />View hotel page
                </Link>

                {isConfirmedBookingStatus(booking.status) && !cancelled && (
                  <button type="button" onClick={() => void handleCancel()} disabled={cancelling}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {cancelling ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
                    Cancel booking
                  </button>
                )}
              </div>

              {cancelError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{cancelError}</p>
              )}
              {cancelled && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
                  Booking cancelled successfully.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
