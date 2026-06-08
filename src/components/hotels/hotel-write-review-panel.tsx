"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2, LogIn, Star } from "lucide-react";
import { getAuthErrorMessage, useAuthOptional } from "@/contexts/auth-context";
import type { HotelListing } from "@/lib/hotels-catalog";
import { fetchUserBookings, type UserBooking } from "@/lib/hotels-account-api";
import { isConfirmedBookingStatus } from "@/lib/hotels-bookings-api";
import { submitHotelReview } from "@/lib/hotels-reviews-api";
import type { HotelReviewUi } from "@/lib/hotel-demo-reviews";
import { cn } from "@/lib/utils";

type HotelWriteReviewPanelProps = {
  hotel: HotelListing;
  onReviewSubmitted?: (review: HotelReviewUi) => void;
  className?: string;
};

function formatBookingLabel(booking: UserBooking) {
  const checkIn = new Date(booking.check_in).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${booking.room_name} · ${checkIn} · ${booking.confirmation_number}`;
}

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition hover:scale-110"
          >
            <Star
              className={cn(
                "h-7 w-7",
                active ? "fill-[#FFC107] text-[#FFC107]" : "fill-[#e0e0e0] text-[#e0e0e0]",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

export function HotelWriteReviewPanel({
  hotel,
  onReviewSubmitted,
  className,
}: HotelWriteReviewPanelProps) {
  const auth = useAuthOptional();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const loginReturnUrl = useMemo(() => {
    const qs = searchParams.toString();
    return `${pathname}${qs ? `?${qs}` : ""}#write-review`;
  }, [pathname, searchParams]);

  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    const token = auth?.getAccessToken?.();
    if (!token) return;
    setBookingsLoading(true);
    setError(null);
    try {
      const all = await fetchUserBookings(token);
      const eligible = all.filter(
        (b) => b.hotel_id === hotel.id && isConfirmedBookingStatus(b.status),
      );
      setBookings(eligible);
      setBookingId((current) => current || eligible[0]?.id || "");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBookingsLoading(false);
    }
  }, [auth, hotel.id]);

  useEffect(() => {
    if (auth?.isAuthenticated && !auth.isLoading) {
      void loadBookings();
    }
  }, [auth?.isAuthenticated, auth?.isLoading, loadBookings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#write-review") {
      document.getElementById("write-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (auth?.isLoading) {
    return (
      <div
        id="write-review"
        className={cn(
          "scroll-mt-24 flex items-center gap-2 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 text-sm text-[#757575]",
          className,
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Checking login…
      </div>
    );
  }

  if (!auth?.isAuthenticated) {
    return (
      <div
        id="write-review"
        className={cn(
          "scroll-mt-24 rounded-xl border border-[#BBDEFB] bg-gradient-to-br from-[#E3F2FD] to-white p-5 sm:p-6",
          className,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2196F3] text-white">
              <LogIn className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#1565C0]">Write a review</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#424242]">
                Login to share your stay experience at {hotel.name}. Only guests who completed a
                booking can submit a review.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(loginReturnUrl)}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#2196F3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1976D2]"
            >
              Login
            </Link>
            <Link
              href={`/signup?redirect=${encodeURIComponent(loginReturnUrl)}`}
              className="inline-flex items-center justify-center rounded-lg border border-[#2196F3] bg-white px-5 py-2.5 text-sm font-bold text-[#2196F3] transition hover:bg-[#f5f9ff]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!bookingId) {
      setError("Select a completed stay to review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    const token = auth.getAccessToken();
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    setSubmitting(true);
    try {
      await submitHotelReview(token, {
        booking_id: bookingId,
        rating,
        title: title.trim() || null,
        comment: comment.trim() || null,
      });

      const selected = bookings.find((b) => b.id === bookingId);
      const userName = auth.user?.name || "You";
      onReviewSubmitted?.({
        id: `user-${Date.now()}`,
        author: userName,
        rating,
        title: title.trim() || "My stay",
        body: comment.trim() || "Great experience.",
        date: new Date().toISOString(),
        roomType: selected?.room_name ?? null,
        helpfulCount: 0,
      });

      setSuccess("Thank you! Your review has been submitted.");
      setTitle("");
      setComment("");
      setRating(5);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="write-review"
      className={cn(
        "scroll-mt-24 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 sm:p-6",
        className,
      )}
    >
      <h3 className="text-base font-bold text-[#212121]">Write a review</h3>
      <p className="mt-1 text-[13px] text-[#616161]">
        Signed in as <strong>{auth.user?.name || auth.user?.email || "Guest"}</strong>
      </p>

      {bookingsLoading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-[#757575]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading your stays…
        </p>
      ) : bookings.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[#ccc] bg-white p-4 text-[13px] text-[#616161]">
          <p className="font-semibold text-[#212121]">No completed stay found for this hotel</p>
          <p className="mt-1">
            You can review this property after a confirmed booking and checkout. Book a room first,
            then come back here to share feedback.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="review-booking" className="text-[12px] font-semibold text-[#424242]">
              Your stay
            </label>
            <select
              id="review-booking"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#212121] outline-none focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {formatBookingLabel(b)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[#424242]">Your rating</p>
            <div className="mt-1.5">
              <InteractiveStarRating value={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label htmlFor="review-title" className="text-[12px] font-semibold text-[#424242]">
              Review title
            </label>
            <input
              id="review-title"
              type="text"
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="mt-1.5 w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
            />
          </div>

          <div>
            <label htmlFor="review-comment" className="text-[12px] font-semibold text-[#424242]">
              Your review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? How was the room, service, and location?"
              className="mt-1.5 w-full resize-y rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2196F3] focus:ring-1 focus:ring-[#2196F3]"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-[#ffcdd2] bg-[#ffebee] px-3 py-2 text-[13px] text-[#c62828]">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-lg border border-[#c8e6c9] bg-[#e8f5e9] px-3 py-2 text-[13px] text-[#2E7D32]">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EF6614] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#E65100] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Submit review
          </button>
        </form>
      )}
    </div>
  );
}