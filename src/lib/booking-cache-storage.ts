/**
 * Local booking cache — used when GET /v1/bookings fails on the backend.
 * Bookings are stored when created successfully from checkout.
 */

import type { UserBooking } from "@/lib/hotels-account-api";

const CACHE_KEY = "uno_booking_cache_v1";

type BookingCacheStore = Record<string, UserBooking[]>;

function readStore(): BookingCacheStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BookingCacheStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: BookingCacheStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(store));
}

export function getCachedBookings(userId: string): UserBooking[] {
  return readStore()[userId] ?? [];
}

export function upsertCachedBooking(userId: string, booking: UserBooking): void {
  const store = readStore();
  const list = store[userId] ?? [];
  const idx = list.findIndex((b) => b.id === booking.id);
  const next =
    idx >= 0 ? list.map((b, i) => (i === idx ? booking : b)) : [booking, ...list].slice(0, 50);
  store[userId] = next;
  writeStore(store);
}

export function mergeBookings(api: UserBooking[], cached: UserBooking[]): UserBooking[] {
  const byId = new Map<string, UserBooking>();
  for (const b of [...cached, ...api]) {
    byId.set(b.id, b);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
