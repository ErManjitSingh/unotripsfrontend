/**
 * src/lib/rooms-utils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure encoding/decoding helpers for rooms config.
 * NO "use client" — safe to import from Server Components and page.tsx.
 *
 * WHY THIS FILE EXISTS:
 *   useRoomsConfig.ts has "use client" at the top (it uses hooks).
 *   decodeRooms() is a pure function with zero browser dependencies,
 *   but because it lived in a "use client" file, Next.js refused to
 *   let server components call it:
 *     "Attempted to call decodeRooms() from the server but decodeRooms
 *      is on the client."
 *
 *   Fix: move the pure helpers here (no "use client").
 *   useRoomsConfig.ts now re-exports from here so client code still works.
 *
 * V2 — TravellerRoom with child ages
 * ─────────────────────────────────────────────────────────────────────────────
 * New `TravellerRoom` type tracks per-child ages (0–11). This is the future
 * payload shape sent to the backend. The legacy `RoomConfig` is kept for
 * backward compatibility with existing code (URL encoding, hooks, checkout).
 *
 * Auto-room logic: when traveller count exceeds temporary frontend capacity
 * assumptions (max 2 adults per room), rooms are created automatically.
 * Backend will later replace this with real occupancy rules.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Legacy type (backward compat — used by URL encoding, hooks, checkout) ────

export type RoomConfig = {
  adults:   number;
  children: number;
};

// ── New traveller type with child ages ───────────────────────────────────────

export type TravellerChild = {
  age: number;
};

export type TravellerRoom = {
  adults:   number;
  children: TravellerChild[];
};

export type TravellerConfig = {
  rooms: TravellerRoom[];
};

// ── Constants ────────────────────────────────────────────────────────────────

export const MAX_ROOMS            = 4;
/** Maximum total guests (adults + children) per room. */
export const MAX_GUESTS_PER_ROOM  = 3;
/** Hard cap on adults in a single room. */
export const MAX_ADULTS_PER_ROOM  = 3;
export const MAX_CHILDREN_PER_ROOM = 3;

/** Standard occupancy before an extra bed is required. */
export const STANDARD_OCCUPANCY   = 2;

/** Auto-room distribution uses standard occupancy (2 adults per room). */
export const AUTO_ROOM_ADULTS_CAP = 2;

export const CHILD_AGE_MIN = 0;
export const CHILD_AGE_MAX = 11;

export const DEFAULT_ROOMS: RoomConfig[] = [{ adults: 2, children: 0 }];

export const DEFAULT_TRAVELLER_ROOMS: TravellerRoom[] = [
  { adults: 2, children: [] },
];

// ── Child age policy (informational only — no pricing logic) ─────────────────

export const CHILD_POLICY = [
  { range: "0–5 years",  label: "Free (No Extra Bed)" },
  { range: "6–11 years", label: "Extra Bed Charges Apply" },
  { range: "12+",        label: "Please add as Adult" },
] as const;

// ── Legacy encoding (RoomConfig ↔ URL string) ───────────────────────────────

export function encodeRooms(rooms: RoomConfig[]): string {
  return rooms.map((r) => `${r.adults}-${r.children}`).join(",");
}

export function decodeRooms(encoded: string | null | undefined): RoomConfig[] {
  if (!encoded?.trim()) return DEFAULT_ROOMS;
  try {
    const rooms = encoded.split(",").map((part) => {
      const [a, c] = part.split("-").map(Number);
      const adults   = Math.max(1, Math.min(MAX_ADULTS_PER_ROOM,   isNaN(a!) ? 2 : a!));
      const children = Math.max(0, Math.min(MAX_CHILDREN_PER_ROOM, isNaN(c!) ? 0 : c!));
      return { adults, children };
    });
    const valid = rooms.filter((r) => r.adults + r.children <= MAX_GUESTS_PER_ROOM);
    return valid.length > 0 ? valid.slice(0, MAX_ROOMS) : DEFAULT_ROOMS;
  } catch {
    return DEFAULT_ROOMS;
  }
}

// ── Conversion between TravellerRoom ↔ RoomConfig ───────────────────────────

/** Convert new TravellerRoom[] to legacy RoomConfig[] (drops child ages). */
export function travellerRoomsToLegacy(rooms: TravellerRoom[]): RoomConfig[] {
  return rooms.map((r) => ({
    adults:   r.adults,
    children: r.children.length,
  }));
}

/** Convert legacy RoomConfig[] to TravellerRoom[] (children get age 0). */
export function legacyToTravellerRooms(rooms: RoomConfig[]): TravellerRoom[] {
  return rooms.map((r) => ({
    adults:   r.adults,
    children: Array.from({ length: r.children }, () => ({ age: 0 })),
  }));
}

// ── Labels ──────────────────────────────────────────────────────────────────

export function roomsLabel(rooms: RoomConfig[]): string {
  const totalAdults   = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children, 0);
  const numRooms      = rooms.length;

  const parts: string[] = [
    `${totalAdults} Adult${totalAdults !== 1 ? "s" : ""}`,
  ];
  if (totalChildren > 0) {
    parts.push(`${totalChildren} Child${totalChildren !== 1 ? "ren" : ""}`);
  }
  if (numRooms > 1) {
    parts.push(`${numRooms} Rooms`);
  }
  return parts.join(" · ");
}

/** Rich summary for the new traveller selector collapsed state. */
export function travellerSummary(rooms: TravellerRoom[]): string {
  const totalAdults   = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children.length, 0);
  const numRooms      = rooms.length;

  const parts: string[] = [];
  if (numRooms > 1) {
    parts.push(`${numRooms} Rooms`);
  }
  parts.push(`${totalAdults} Adult${totalAdults !== 1 ? "s" : ""}`);
  if (totalChildren > 0) {
    parts.push(`${totalChildren} Child${totalChildren !== 1 ? "ren" : ""}`);
  }
  return parts.join(" · ");
}

/** Totals helper for TravellerRoom[]. */
export function travellerTotals(rooms: TravellerRoom[]) {
  const totalAdults   = rooms.reduce((s, r) => s + r.adults, 0);
  const totalChildren = rooms.reduce((s, r) => s + r.children.length, 0);
  return {
    totalAdults,
    totalChildren,
    totalGuests: totalAdults + totalChildren,
    numRooms: rooms.length,
  };
}

// ── Auto-room generation ────────────────────────────────────────────────────
//
// Temporary frontend logic. When total adults exceed room capacity assumptions,
// automatically distribute into rooms.
//
// Rule: max AUTO_ROOM_ADULTS_CAP (2) adults per room.
// Children stay in the room they were assigned to.
// Backend will later replace this with real occupancy rules.

export function autoDistributeAdults(totalAdults: number): TravellerRoom[] {
  const clamped = Math.max(1, Math.min(12, totalAdults));
  const rooms: TravellerRoom[] = [];
  let remaining = clamped;
  while (remaining > 0) {
    const roomAdults = Math.min(AUTO_ROOM_ADULTS_CAP, remaining);
    rooms.push({ adults: roomAdults, children: [] });
    remaining -= roomAdults;
  }
  return rooms;
}

// ── Price helpers ────────────────────────────────────────────────────────────

export function calcBaseTotal(rooms: RoomConfig[], basePricePerPerson: number): number {
  const effective = rooms.reduce(
    (sum, r) => sum + r.adults + r.children * 0.7,
    0,
  );
  return Math.round(basePricePerPerson * Math.max(1, effective));
}