"use client";

/**
 * src/components/packages/PackageSearchBox.tsx
 *
 * Complete holiday package search bar.
 * Three fields: Destination · Travel Date · Travellers
 *
 * Features:
 *  - Destination autocomplete from /v1/packages/destinations
 *  - Single date picker (departure date)
 *  - Multi-room traveller dropdown (max 4 rooms, 4 guests/room)
 *  - URL-param based navigation — all state lives in the URL
 *  - Keyboard navigable (arrow keys, Enter, Escape)
 *  - Fully responsive — stacks on mobile, horizontal on desktop
 *  - UNO brand orange Search button
 */

import {
  useCallback, useEffect, useRef, useState, type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, ChevronDown, MapPin, Minus, Plus, Search, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  decodeRooms, encodeRooms, roomsLabel,
  MAX_ROOMS, MAX_ADULTS_PER_ROOM, MAX_CHILDREN_PER_ROOM, MAX_GUESTS_PER_ROOM,
  type RoomConfig,
} from "@/hooks/useRoomsConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

type Destination = {
  id:            string;
  name:          string;
  slug:          string;
  state:         string | null;
  package_count: number;
};

type SearchBoxProps = {
  /** Initial destination slug from URL */
  initialDest?:  string;
  /** Initial travel date YYYY-MM-DD */
  initialDate?:  string;
  /** Initial rooms encoded string e.g. "2-0,1-1" */
  initialRooms?: string;
  /** Navigate to this path on search (default: /packages) */
  targetPath?:   string;
  className?:    string;
  /** Compact variant for the sticky bar */
  compact?:      boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayPlusNDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day:   "numeric",
      month: "short",
      year:  "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Room configurator sub-component ──────────────────────────────────────────

function RoomConfigurator({
  rooms,
  onChange,
}: {
  rooms:    RoomConfig[];
  onChange: (rooms: RoomConfig[]) => void;
}) {
  const updateRoom = (idx: number, field: "adults" | "children", delta: number) => {
    const next = rooms.map((r, i) => {
      if (i !== idx) return r;
      const newAdults   = field === "adults"   ? r.adults   + delta : r.adults;
      const newChildren = field === "children" ? r.children + delta : r.children;
      return {
        adults:   Math.max(1, Math.min(MAX_ADULTS_PER_ROOM, newAdults)),
        children: Math.max(0, Math.min(MAX_CHILDREN_PER_ROOM, newChildren)),
      };
    });
    // Validate per-room guest cap
    const validated = next.map((r) => {
      if (r.adults + r.children > MAX_GUESTS_PER_ROOM) {
        return { ...r, children: MAX_GUESTS_PER_ROOM - r.adults };
      }
      return r;
    });
    onChange(validated);
  };

  const addRoom = () => {
    if (rooms.length >= MAX_ROOMS) return;
    onChange([...rooms, { adults: 1, children: 0 }]);
  };

  const removeRoom = (idx: number) => {
    if (rooms.length <= 1) return;
    onChange(rooms.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full">
      {/* Hint */}
      <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-[11px] font-medium text-slate-600">
        Maximum <strong>4 guests</strong> are allowed in each room
      </p>

      {/* Rooms */}
      <div className="space-y-3">
        {rooms.map((room, idx) => (
          <div key={idx} className="rounded-xl border border-[#e8e8e8] p-3">
            {/* Room header */}
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#9e9e9e]">
                Room {idx + 1}
              </span>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeRoom(idx)}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#DC2626] hover:underline"
                  aria-label={`Remove room ${idx + 1}`}
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Adults */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-[#424242]">
                  Adults
                  <span className="ml-1 font-normal text-[#9e9e9e]">12+</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateRoom(idx, "adults", -1)}
                    disabled={room.adults <= 1}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Decrease adults"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-[#1a1a1a]">
                    {String(room.adults).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRoom(idx, "adults", 1)}
                    disabled={room.adults >= MAX_ADULTS_PER_ROOM || room.adults + room.children >= MAX_GUESTS_PER_ROOM}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Increase adults"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-[#424242]">
                  Children
                  <span className="ml-1 font-normal text-[#9e9e9e]">2–11</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateRoom(idx, "children", -1)}
                    disabled={room.children <= 0}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Decrease children"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-[#1a1a1a]">
                    {String(room.children).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRoom(idx, "children", 1)}
                    disabled={room.children >= MAX_CHILDREN_PER_ROOM || room.adults + room.children >= MAX_GUESTS_PER_ROOM}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] text-[#424242] transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Increase children"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2">
        {rooms.length < MAX_ROOMS && (
          <button
            type="button"
            onClick={addRoom}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d0d0d0] py-2.5 text-[12px] font-semibold text-[#616161] transition hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Another Room
          </button>
        )}
        <button
          type="button"
          className="flex-1 rounded-xl bg-primary py-2.5 text-[12px] font-bold text-white transition hover:opacity-90"
          onClick={() => {/* close is handled by parent */}}
          data-close-rooms
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PackageSearchBox({
  initialDest,
  initialDate,
  initialRooms,
  targetPath  = "/packages",
  className,
  compact     = false,
}: SearchBoxProps) {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [destInput,   setDestInput]   = useState("");
  const [destSlug,    setDestSlug]    = useState(initialDest ?? "");
  const [destLabel,   setDestLabel]   = useState("");
  const [travelDate,  setTravelDate]  = useState(initialDate  ?? todayPlusNDays(7));
  const [rooms,       setRooms]       = useState<RoomConfig[]>(
    () => decodeRooms(initialRooms),
  );
  const [showDest,    setShowDest]    = useState(false);
  const [showRooms,   setShowRooms]   = useState(false);
  const [destinations, setDests]      = useState<Destination[]>([]);
  const [popular,      setPopular]    = useState<Destination[]>([]);
  const [destLoading,  setDestLoading] = useState(false);
  const [focusedIdx,   setFocusedIdx] = useState(-1);

  const debouncedQuery = useDebouncedValue(destInput, 300);
  const destRef  = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);
  const dateRef  = useRef<HTMLInputElement>(null);

  // ── Load popular destinations on mount ───────────────────────────────────

  useEffect(() => {
    fetch("/api/hotels/v1/packages/destinations/popular")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setPopular(list.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  // ── Autocomplete search ───────────────────────────────────────────────────

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setDests([]);
      return;
    }
    setDestLoading(true);
    const qs = new URLSearchParams({ search: debouncedQuery, limit: "8" });
    fetch(`/api/hotels/v1/packages/destinations?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setDests(list.slice(0, 8));
      })
      .catch(() => setDests([]))
      .finally(() => setDestLoading(false));
  }, [debouncedQuery]);

  // ── Close dropdowns on outside click ─────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDest(false);
        setFocusedIdx(-1);
      }
      if (roomsRef.current && !roomsRef.current.contains(e.target as Node)) {
        setShowRooms(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayedDests = destInput.trim().length >= 2 ? destinations : popular;

  // ── Destination selection ─────────────────────────────────────────────────

  const selectDest = useCallback((d: Destination) => {
    setDestSlug(d.slug);
    setDestLabel(`${d.name}${d.state ? `, ${d.state}` : ""}`);
    setDestInput(`${d.name}${d.state ? `, ${d.state}` : ""}`);
    setShowDest(false);
    setFocusedIdx(-1);
    // Move focus to date
    setTimeout(() => dateRef.current?.focus(), 50);
  }, []);

  const clearDest = useCallback(() => {
    setDestSlug("");
    setDestLabel("");
    setDestInput("");
    setDests([]);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleDestKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDest) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, displayedDests.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIdx >= 0) {
      e.preventDefault();
      const d = displayedDests[focusedIdx];
      if (d) selectDest(d);
    } else if (e.key === "Escape") {
      setShowDest(false);
      setFocusedIdx(-1);
    }
  };

  // ── Search handler ────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (destSlug)   params.set("dest",  destSlug);
    if (travelDate) params.set("date",  travelDate);
    params.set("rooms", encodeRooms(rooms));
    router.push(`${targetPath}?${params.toString()}`);
  }, [destSlug, travelDate, rooms, targetPath, router]);

  const handleRoomsApply = () => setShowRooms(false);

  // ── Render ────────────────────────────────────────────────────────────────

  const fieldCls = cn(
    "flex cursor-pointer flex-col justify-center border-b border-[#e0e0e0] bg-white px-4 transition hover:bg-[#fafafa]",
    compact ? "min-h-[56px] py-2" : "min-h-[72px] py-3",
    "sm:border-b-0 sm:border-r",
  );
  const labelCls = "text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]";
  const valueCls = cn(
    "mt-0.5 font-semibold text-[#1a1a1a] truncate",
    compact ? "text-sm" : "text-base",
  );
  const placeholderCls = cn(
    "mt-0.5 font-normal text-[#bdbdbd]",
    compact ? "text-sm" : "text-base",
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-visible rounded-2xl border border-[#e0e0e0] bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)]">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_200px]">

          {/* ── Destination ── */}
          <div ref={destRef} className="relative">
            <div
              className={cn(fieldCls, "sm:rounded-l-2xl")}
              onClick={() => { setShowDest(true); setShowRooms(false); }}
            >
              <p className={labelCls}>
                <MapPin className="mr-1 inline h-3 w-3" aria-hidden />
                Select travel destination
              </p>
              <div className="relative mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={destInput}
                  placeholder="Search Destination"
                  onChange={(e) => { setDestInput(e.target.value); setShowDest(true); setDestSlug(""); }}
                  onFocus={() => setShowDest(true)}
                  onKeyDown={handleDestKeyDown}
                  className={cn(
                    "flex-1 truncate bg-transparent outline-none",
                    destInput ? valueCls : placeholderCls,
                  )}
                  aria-label="Travel destination"
                  aria-autocomplete="list"
                  aria-expanded={showDest}
                  autoComplete="off"
                />
                {destInput && (
                  <button type="button" onClick={clearDest} className="shrink-0 text-[#9e9e9e] hover:text-[#424242]" aria-label="Clear destination">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Dropdown */}
            {showDest && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-[#e0e0e0] bg-white shadow-xl">
                {destLoading && (
                  <div className="px-4 py-3 text-[12px] text-[#9e9e9e] animate-pulse">
                    Searching…
                  </div>
                )}

                {!destLoading && displayedDests.length === 0 && destInput.length >= 2 && (
                  <div className="px-4 py-3 text-[12px] text-[#9e9e9e]">
                    No destinations found for "{destInput}"
                  </div>
                )}

                {!destLoading && displayedDests.length > 0 && (
                  <div>
                    <p className="border-b border-[#f0f0f0] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#9e9e9e]">
                      {destInput.length < 2 ? "Popular Destinations" : "Matching Destinations"}
                    </p>
                    {displayedDests.map((d, i) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => selectDest(d)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                          focusedIdx === i ? "bg-orange-50" : "hover:bg-[#fafafa]",
                        )}
                        aria-selected={focusedIdx === i}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                          <MapPin className="h-4 w-4 text-primary" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-[#1a1a1a]">
                            {d.name}{d.state ? `, ${d.state}` : ""}
                          </p>
                          <p className="text-[10px] text-[#9e9e9e]">
                            {d.package_count} package{d.package_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden w-px bg-[#e0e0e0] sm:block" aria-hidden />

          {/* ── Travel Date ── */}
          <div className={fieldCls} onClick={() => dateRef.current?.showPicker?.()}>
            <p className={labelCls}>
              <Calendar className="mr-1 inline h-3 w-3" aria-hidden />
              Select travel date
            </p>
            <div className="relative mt-1">
              {/* Display layer */}
              <p className={travelDate ? valueCls : placeholderCls} aria-hidden>
                {travelDate ? formatDateDisplay(travelDate).toUpperCase() : "Select Date"}
              </p>
              {/* Real input (visually hidden but accessible) */}
              <input
                ref={dateRef}
                type="date"
                value={travelDate}
                min={todayPlusNDays(1)}
                onChange={(e) => setTravelDate(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Travel date"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden w-px bg-[#e0e0e0] sm:block" aria-hidden />

          {/* ── Travellers ── */}
          <div ref={roomsRef} className="relative">
            <div
              className={cn(fieldCls, "cursor-pointer")}
              onClick={() => { setShowRooms((v) => !v); setShowDest(false); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setShowRooms((v) => !v)}
              aria-label="Select travellers"
              aria-haspopup="true"
              aria-expanded={showRooms}
            >
              <p className={labelCls}>
                <Users className="mr-1 inline h-3 w-3" aria-hidden />
                Select travellers
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className={valueCls}>{roomsLabel(rooms)}</p>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#9e9e9e] transition-transform", showRooms && "rotate-180")} aria-hidden />
              </div>
            </div>

            {/* Rooms dropdown */}
            {showRooms && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-xl">
                <RoomConfigurator
                  rooms={rooms}
                  onChange={setRooms}
                />
                {/* Apply button inside configurator triggers close */}
                <button
                  type="button"
                  onClick={handleRoomsApply}
                  className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* ── Search button ── */}
          <button
            type="button"
            onClick={handleSearch}
            className={cn(
              "flex items-center justify-center gap-2 rounded-b-2xl bg-primary font-bold text-white transition hover:opacity-90 active:scale-[0.98]",
              "sm:rounded-b-none sm:rounded-r-2xl",
              compact ? "px-6 py-3 text-sm" : "px-8 py-4 text-base",
              "w-full sm:w-auto",
            )}
            aria-label="Search packages"
          >
            <Search className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}