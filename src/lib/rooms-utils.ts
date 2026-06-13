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
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type RoomConfig = {
  adults:   number;
  children: number;
};

export const MAX_ROOMS            = 4;
export const MAX_GUESTS_PER_ROOM  = 4;
export const MAX_ADULTS_PER_ROOM  = 4;
export const MAX_CHILDREN_PER_ROOM = 3;
export const DEFAULT_ROOMS: RoomConfig[] = [{ adults: 2, children: 0 }];

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

export function calcBaseTotal(rooms: RoomConfig[], basePricePerPerson: number): number {
  const effective = rooms.reduce(
    (sum, r) => sum + r.adults + r.children * 0.7,
    0,
  );
  return Math.round(basePricePerPerson * Math.max(1, effective));
}