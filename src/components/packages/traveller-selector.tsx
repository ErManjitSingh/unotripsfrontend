"use client";

/**
 * src/components/packages/traveller-selector.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * MMT-style traveller selector popup with:
 *   - Multiple rooms
 *   - Adults (12+) and Children (0–11) per room
 *   - Individual child age selectors
 *   - Auto-room creation when adults exceed capacity
 *   - Child policy display (informational only)
 *   - Room management (add / edit / remove)
 *
 * This component manages a DRAFT state internally and commits on Apply.
 * The parent receives the final TravellerRoom[] via onChange.
 *
 * Frontend only — no pricing calculation, no backend calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, BedDouble, Minus, Plus, Trash2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAX_ADULTS_PER_ROOM,
  MAX_GUESTS_PER_ROOM,
  STANDARD_OCCUPANCY,
  CHILD_AGE_MAX,
  CHILD_AGE_MIN,
  MAX_CHILDREN_PER_ROOM,
  MAX_ROOMS,
  travellerSummary,
  type TravellerChild,
  type TravellerRoom,
} from "@/lib/rooms-utils";

// ── Props ───────────────────────────────────────────────────────────────────

export type TravellerSelectorProps = {
  rooms: TravellerRoom[];
  onChange: (rooms: TravellerRoom[]) => void;
  className?: string;
  /** Compact mode for inline header usage (no outer border). */
  compact?: boolean;
};

// ── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({
  label,
  sub,
  value,
  min = 0,
  max = 10,
  onDec,
  onInc,
}: {
  label: string;
  sub: string;
  value: number;
  min?: number;
  max?: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[13px] font-semibold text-[#1a1a2e]">{label}</p>
        <p className="text-[11px] text-[#8b8fa3]">{sub}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onDec}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="grid h-8 w-8 place-items-center rounded-full border border-[#d5d8e0] text-[#5a5f72] transition hover:border-[#EF6614] hover:text-[#EF6614] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#d5d8e0] disabled:hover:text-[#5a5f72]"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <span className="min-w-[22px] text-center text-sm font-bold text-[#1a1a2e]">
          {value}
        </span>
        <button
          type="button"
          onClick={onInc}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="grid h-8 w-8 place-items-center rounded-full border border-[#EF6614] text-[#EF6614] transition hover:bg-[#EF6614] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#EF6614]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ── Child age pill selector ─────────────────────────────────────────────────

function ChildAgeSelector({
  index,
  age,
  hasBeenSet,
  onChangeAge,
}: {
  index: number;
  age: number;
  /** Whether the user has explicitly picked an age (vs the initial default). */
  hasBeenSet: boolean;
  onChangeAge: (age: number) => void;
}) {
  // Auto-open when no age has been set yet; collapse after selection.
  const [isOpen, setIsOpen] = useState(!hasBeenSet);

  const handlePick = (a: number) => {
    onChangeAge(a);
    setIsOpen(false);
  };

  // When a new child is added, it has no age set yet — open automatically.
  useEffect(() => {
    if (!hasBeenSet) setIsOpen(true);
  }, [hasBeenSet]);

  // Collapsed: show a tappable summary pill
  if (!isOpen && hasBeenSet) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex items-center gap-2 rounded-lg border border-[#e4e7ed] bg-[#f8fafc] px-3 py-1.5 text-left transition hover:border-[#EF6614]/50"
      >
        <span className="text-[11px] font-semibold text-[#5a5f72]">
          Child {index + 1} Age
        </span>
        <span className="rounded-md border border-[#EF6614] bg-[#FFF4EC] px-2 py-0.5 text-[11px] font-bold text-[#EF6614]">
          {age} yr{age !== 1 ? "s" : ""}
        </span>
        <ChevronDown className="ml-auto h-3 w-3 text-[#9aa1ad]" />
      </button>
    );
  }

  // Expanded: show the age pill grid
  return (
    <div className="mt-2">
      <p className="mb-1.5 text-[11px] font-semibold text-[#5a5f72]">
        Child {index + 1} Age
      </p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: CHILD_AGE_MAX - CHILD_AGE_MIN + 1 }, (_, i) => i + CHILD_AGE_MIN).map(
          (a) => (
            <button
              key={a}
              type="button"
              onClick={() => handlePick(a)}
              className={cn(
                "grid h-7 min-w-[30px] place-items-center rounded-lg border text-[12px] font-semibold transition",
                age === a
                  ? "border-[#EF6614] bg-[#FFF4EC] text-[#EF6614]"
                  : "border-[#e4e7ed] bg-white text-[#5a5f72] hover:border-[#EF6614]/50 hover:text-[#EF6614]",
              )}
            >
              {a}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

// ── Room card ───────────────────────────────────────────────────────────────

function RoomCard({
  room,
  index,
  canRemove,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  room: TravellerRoom;
  index: number;
  canRemove: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (room: TravellerRoom) => void;
  onRemove: () => void;
}) {
  // Track which children have had their age explicitly picked by the user.
  const [ageSetChildren, setAgeSetChildren] = useState<Set<number>>(() => new Set());

  const totalGuests = room.adults + room.children.length;
  const needsExtraBed = totalGuests > STANDARD_OCCUPANCY;

  // Dynamic maximums — neither stepper can push total guests past MAX_GUESTS_PER_ROOM.
  const maxAdultsAllowed  = Math.min(MAX_ADULTS_PER_ROOM, MAX_GUESTS_PER_ROOM - room.children.length);
  const maxChildrenAllowed = Math.min(MAX_CHILDREN_PER_ROOM, MAX_GUESTS_PER_ROOM - room.adults);

  const updateAdults = useCallback(
    (delta: number) => {
      const next = Math.max(1, Math.min(maxAdultsAllowed, room.adults + delta));
      onUpdate({ ...room, adults: next });
    },
    [room, maxAdultsAllowed, onUpdate],
  );

  const updateChildCount = useCallback(
    (delta: number) => {
      const currentCount = room.children.length;
      const nextCount = Math.max(0, Math.min(maxChildrenAllowed, currentCount + delta));
      if (nextCount > currentCount) {
        onUpdate({
          ...room,
          children: [...room.children, { age: 0 }],
        });
      } else if (nextCount < currentCount) {
        setAgeSetChildren((prev) => {
          const next = new Set(prev);
          next.delete(nextCount);
          return next;
        });
        onUpdate({
          ...room,
          children: room.children.slice(0, nextCount),
        });
      }
    },
    [room, maxChildrenAllowed, onUpdate],
  );

  const updateChildAge = useCallback(
    (childIdx: number, age: number) => {
      const updated = room.children.map((c, i) =>
        i === childIdx ? { age } : c,
      );
      setAgeSetChildren((prev) => new Set(prev).add(childIdx));
      onUpdate({ ...room, children: updated });
    },
    [room, onUpdate],
  );

  // ── Collapsed summary ───────────────────────────────────────────────────
  const summaryParts: string[] = [
    `${room.adults} Adult${room.adults !== 1 ? "s" : ""}`,
  ];
  if (room.children.length > 0) {
    summaryParts.push(
      `${room.children.length} Child${room.children.length !== 1 ? "ren" : ""}`,
    );
  }
  const roomSummary = summaryParts.join(", ");

  if (!isExpanded) {
    return (
      <div className="rounded-xl border border-[#e4e7ed] bg-white">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#f8fafc]"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#8b8fa3]">
              Room {index + 1}
            </span>
            {needsExtraBed && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                <BedDouble className="h-3 w-3" />
                Extra Bed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#1a1a2e]">
              {roomSummary}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#9aa1ad]" />
          </div>
        </button>
      </div>
    );
  }

  // ── Expanded view ─────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-[#EF6614]/30 bg-white shadow-sm">
      {/* Room header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-[#f0f2f5] px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#8b8fa3]">
            Room {index + 1}
          </span>
          {needsExtraBed && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
              <BedDouble className="h-3 w-3" />
              Extra Bed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  onRemove();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#dc2626] transition hover:text-[#b91c1c]"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </span>
          )}
          <ChevronUp className="h-3.5 w-3.5 text-[#9aa1ad]" />
        </div>
      </button>

      {/* Steppers */}
      <div className="space-y-0 divide-y divide-[#f5f6f8] px-4">
        <Stepper
          label="Adults"
          sub="Age 12+"
          value={room.adults}
          min={1}
          max={maxAdultsAllowed}
          onDec={() => updateAdults(-1)}
          onInc={() => updateAdults(1)}
        />
        <Stepper
          label="Children"
          sub="Age 0–11 yrs"
          value={room.children.length}
          min={0}
          max={maxChildrenAllowed}
          onDec={() => updateChildCount(-1)}
          onInc={() => updateChildCount(1)}
        />
      </div>

      {/* Occupancy notices removed. The room header's "Extra Bed" chip already
          signals the extra bed, and the steppers cap at MAX_GUESTS_PER_ROOM,
          so reaching the limit needs no additional callout. */}

      {/* Child age selectors */}
      {room.children.length > 0 && (
        <div className="border-t border-[#f0f2f5] px-4 pb-3 pt-1">
          {room.children.map((child, ci) => (
            <ChildAgeSelector
              key={ci}
              index={ci}
              age={child.age}
              hasBeenSet={ageSetChildren.has(ci)}
              onChangeAge={(age) => updateChildAge(ci, age)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function TravellerSelector({
  rooms,
  onChange,
  className,
  compact = false,
}: TravellerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<TravellerRoom[]>(rooms);
  /** Accordion: only one room expanded at a time. */
  const [expandedRoomIdx, setExpandedRoomIdx] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync draft when parent rooms change (e.g. URL navigation)
  useEffect(() => {
    setDraft(rooms);
    setExpandedRoomIdx(0);
  }, [rooms]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
        setDraft(rooms); // revert on dismiss
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, rooms]);

  const updateRoom = useCallback((idx: number, room: TravellerRoom) => {
    setDraft((prev) => prev.map((r, i) => (i === idx ? room : r)));
  }, []);

  const removeRoom = useCallback((idx: number) => {
    setDraft((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length > 0 ? next : [{ adults: 1, children: [] }];
    });
    // Keep a valid expanded index after removal
    setExpandedRoomIdx((prev) => {
      if (prev >= idx && prev > 0) return prev - 1;
      return prev;
    });
  }, []);

  const addRoom = useCallback(() => {
    setDraft((prev) => {
      if (prev.length >= MAX_ROOMS) return prev;
      const next = [...prev, { adults: 1, children: [] }];
      // Expand the newly added room
      setExpandedRoomIdx(next.length - 1);
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    // Ensure at least 1 adult in first room
    const sanitized = draft.map((r, i) => ({
      ...r,
      adults: i === 0 ? Math.max(1, r.adults) : r.adults,
    }));
    onChange(sanitized);
    setIsOpen(false);
  }, [draft, onChange]);

  const summary = travellerSummary(rooms);

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 text-left transition",
          compact
            ? "hover:bg-orange-50/45 px-4 py-3 sm:px-5"
            : "rounded-xl border border-[#e4e7ed] bg-[#f8fafc] px-3 min-h-14 hover:border-[#EF6614]/40",
        )}
      >
        <Users
          className="h-4 w-4 shrink-0 text-[#737b88]"
          strokeWidth={1.75}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa1ad]">
            Travellers
          </span>
          <span className="mt-0.5 block truncate text-[14px] font-bold leading-tight text-[#20242c]">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#9aa1ad] transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-2xl border border-[#e4e7ed] bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)]"
          style={{ maxHeight: "min(520px, calc(100vh - 180px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#f0f2f5] px-4 py-3">
            <p className="text-[13px] font-bold text-[#1a1a2e]">
              Rooms &amp; Travellers
            </p>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setDraft(rooms);
              }}
              className="grid h-7 w-7 place-items-center rounded-full text-[#8b8fa3] transition hover:bg-[#f5f6f8] hover:text-[#1a1a2e]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div
            className="overflow-y-auto px-4 py-3"
            style={{ maxHeight: "min(380px, calc(100vh - 290px))" }}
          >
            <div className="space-y-3">
              {draft.map((room, idx) => (
                <RoomCard
                  key={idx}
                  room={room}
                  index={idx}
                  canRemove={draft.length > 1}
                  isExpanded={expandedRoomIdx === idx}
                  onToggle={() =>
                    setExpandedRoomIdx((prev) => (prev === idx ? -1 : idx))
                  }
                  onUpdate={(r) => updateRoom(idx, r)}
                  onRemove={() => removeRoom(idx)}
                />
              ))}
            </div>

            {/* Add room */}
            {draft.length < MAX_ROOMS && (
              <button
                type="button"
                onClick={addRoom}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#EF6614] bg-[#FFF4EC] py-3 text-[13px] font-bold text-[#EF6614] transition hover:bg-[#FFE8D6] hover:shadow-[0_6px_16px_-8px_rgba(239,102,20,0.55)] active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add Another Room
              </button>
            )}

            {/* Child Policy block removed — the age bands are already stated
                on the steppers themselves ("Age 12+" / "Age 0–11 yrs"). */}

            {/* Auto-room notice */}
            <p className="mt-3 text-center text-[10px] leading-relaxed text-[#8b8fa3]">
              Room allocation will be automatically optimized based on the
              selected hotel&apos;s occupancy rules.
            </p>
          </div>

          {/* Apply button */}
          <div className="border-t border-[#f0f2f5] px-4 py-3">
            <button
              type="button"
              onClick={handleApply}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#EF6614] text-[13px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(239,102,20,0.5)] transition hover:bg-[#d94d04]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}