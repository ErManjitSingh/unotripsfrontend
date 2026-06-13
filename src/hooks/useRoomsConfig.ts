"use client";

/**
 * src/hooks/useRoomsConfig.ts
 *
 * Manages multi-room traveller configuration.
 *
 * URL encoding:  rooms=2-0,1-1
 *   "2-0" = Room 1: 2 adults, 0 children
 *   "1-1" = Room 2: 1 adult, 1 child
 *
 * Rules:
 *   - Max 4 rooms
 *   - Each room: 1–4 adults, 0–3 children
 *   - Max 4 guests per room
 *   - Min 1 adult across all rooms at all times
 *
 * NOTE: Pure helpers (decodeRooms, encodeRooms, etc.) live in @/lib/rooms-utils
 * so they can be imported by Server Components too. Re-exported here for
 * backwards compatibility with existing client imports.
 */

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Re-export pure helpers from the server-safe module
export type { RoomConfig } from "@/lib/rooms-utils";
export {
  MAX_ROOMS,
  MAX_GUESTS_PER_ROOM,
  MAX_ADULTS_PER_ROOM,
  MAX_CHILDREN_PER_ROOM,
  DEFAULT_ROOMS,
  encodeRooms,
  decodeRooms,
  roomsLabel,
  calcBaseTotal,
} from "@/lib/rooms-utils";

import type { RoomConfig } from "@/lib/rooms-utils";
import {
  DEFAULT_ROOMS,
  encodeRooms,
  decodeRooms,
  roomsLabel,
} from "@/lib/rooms-utils";

export type RoomsState = {
  rooms:          RoomConfig[];
  totalAdults:    number;
  totalChildren:  number;
  totalGuests:    number;
  numRooms:       number;
  label:          string;
  encoded:        string;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRoomsConfig() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const rooms: RoomConfig[] = useMemo(
    () => decodeRooms(searchParams.get("rooms")),
    [searchParams],
  );

  const state: RoomsState = useMemo(() => {
    const totalAdults   = rooms.reduce((s, r) => s + r.adults, 0);
    const totalChildren = rooms.reduce((s, r) => s + r.children, 0);
    return {
      rooms,
      totalAdults,
      totalChildren,
      totalGuests: totalAdults + totalChildren,
      numRooms:    rooms.length,
      label:       roomsLabel(rooms),
      encoded:     encodeRooms(rooms),
    };
  }, [rooms]);

  /** Apply rooms config by navigating to URL with updated param. */
  const applyRooms = useCallback(
    (newRooms: RoomConfig[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("rooms", encodeRooms(newRooms));
      // Reset to page 1 when travellers change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  /** Build href with rooms param (for search box linking to /packages). */
  const buildHref = useCallback(
    (base: string, extraParams?: Record<string, string>) => {
      const params = new URLSearchParams();
      params.set("rooms", encodeRooms(rooms));
      if (extraParams) {
        Object.entries(extraParams).forEach(([k, v]) => v && params.set(k, v));
      }
      return `${base}?${params.toString()}`;
    },
    [rooms],
  );

  return { state, applyRooms, buildHref };
}