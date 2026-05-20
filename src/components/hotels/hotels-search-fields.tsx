"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Calendar, ChevronDown, Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MO_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WD_SHORT = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function localDateInputString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysToIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map((x) => Number.parseInt(x, 10));
  const next = new Date(y, m - 1, d, 12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return localDateInputString(next);
}

export function formatHotelDateFromIso(iso: string) {
  if (!iso) return { main: "Select date", sub: "" };
  const [y, m, d] = iso.split("-").map((x) => Number.parseInt(x, 10));
  if (!y || !m || !d) return { main: "Select date", sub: "" };
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return { main: "Select date", sub: "" };
  return {
    main: `${d} ${MO_SHORT[m - 1]}'${y}`,
    sub: WD_SHORT[date.getDay()],
  };
}

export function openNativeDatePicker(input: HTMLInputElement | null) {
  if (!input) return;

  input.focus({ preventScroll: true });

  if (typeof input.showPicker === "function") {
    try {
      input.showPicker();
      return;
    } catch {
      /* showPicker blocked — fall through to click */
    }
  }

  // Safari / older browsers: brief on-screen placement helps open the native picker
  const prev = {
    position: input.style.position,
    top: input.style.top,
    left: input.style.left,
    width: input.style.width,
    height: input.style.height,
    opacity: input.style.opacity,
    pointerEvents: input.style.pointerEvents,
  };
  input.style.position = "fixed";
  input.style.top = "50%";
  input.style.left = "50%";
  input.style.width = "1px";
  input.style.height = "1px";
  input.style.opacity = "0.01";
  input.style.pointerEvents = "auto";
  input.click();
  requestAnimationFrame(() => {
    input.style.position = prev.position;
    input.style.top = prev.top;
    input.style.left = prev.left;
    input.style.width = prev.width;
    input.style.height = prev.height;
    input.style.opacity = prev.opacity;
    input.style.pointerEvents = prev.pointerEvents;
  });
}

type HotelDateFieldProps = {
  label: string;
  iso: string;
  minIso?: string;
  onIsoChange: (iso: string) => void;
  onAfterSelect?: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
};

export function HotelDateField({
  label,
  iso,
  minIso,
  onIsoChange,
  onAfterSelect,
  inputRef: externalInputRef,
  className,
}: HotelDateFieldProps) {
  const inputId = useId();
  const internalRef = useRef<HTMLInputElement>(null);

  const assignRef = (el: HTMLInputElement | null) => {
    internalRef.current = el;
    if (externalInputRef) {
      externalInputRef.current = el;
    }
  };

  const fmt = formatHotelDateFromIso(iso);

  const openPicker = () => {
    openNativeDatePicker(internalRef.current);
  };

  return (
    <div className={cn("relative min-w-0", className)}>
      <input
        id={inputId}
        ref={assignRef}
        type="date"
        value={iso || ""}
        min={minIso}
        tabIndex={-1}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          onIsoChange(v);
          onAfterSelect?.();
        }}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        aria-hidden
      />

      <button
        type="button"
        onClick={openPicker}
        className="flex min-h-[76px] w-full min-w-0 cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:min-h-[80px] sm:px-5 sm:py-4"
        aria-label={`${label}: ${fmt.main}${fmt.sub ? `, ${fmt.sub}` : ""}`}
      >
        <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-normal leading-tight text-[#9E9E9E]">{label}</span>
          <span
            className="mt-1 block truncate text-[17px] font-bold leading-tight text-[#212121]"
            suppressHydrationWarning
          >
            {fmt.main}
          </span>
          {fmt.sub ? (
            <span className="mt-0.5 block truncate text-xs font-normal text-[#757575]" suppressHydrationWarning>
              {fmt.sub}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
}

type HotelRoomsGuestsFieldProps = {
  rooms: number;
  guests: number;
  onRoomsChange: (n: number) => void;
  onGuestsChange: (n: number) => void;
  className?: string;
};

const ROOM_MIN = 1;
const ROOM_MAX = 8;
const GUEST_MIN = 1;
const GUEST_MAX = 20;

export function HotelRoomsGuestsField({
  rooms,
  guests,
  onRoomsChange,
  onGuestsChange,
  className,
}: HotelRoomsGuestsFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className={cn("relative z-30 min-w-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex min-h-[76px] w-full min-w-0 items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:min-h-[80px] sm:px-5 sm:py-4"
      >
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} aria-hidden />
        <span className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block text-[11px] font-normal leading-tight text-[#9E9E9E]">
              Rooms &amp; Guests
            </span>
            <span className="mt-1 block truncate text-[17px] font-bold leading-tight text-[#212121]">
              {rooms} Room {guests} Guests
            </span>
          </span>
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-[#9E9E9E] transition-transform",
              open && "rotate-180",
            )}
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Rooms and guests"
          className="absolute right-0 top-[calc(100%-2px)] z-[200] mt-0 w-[min(calc(100vw-1.5rem),300px)] rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.25)]"
        >
          <CounterRow
            label="Rooms"
            value={rooms}
            min={ROOM_MIN}
            max={ROOM_MAX}
            onChange={onRoomsChange}
          />
          <CounterRow
            label="Guests"
            value={guests}
            min={GUEST_MIN}
            max={GUEST_MAX}
            onChange={onGuestsChange}
            className="mt-4"
          />
          <Button
            type="button"
            className="mt-4 h-10 w-full rounded-lg bg-[#2196F3] text-sm font-semibold text-white hover:bg-[#1E88E5]"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function CounterRow({
  label,
  value,
  min,
  max,
  onChange,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="text-sm font-semibold text-[#212121]">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-[#E0E0E0]"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </Button>
        <span className="min-w-[1.5rem] text-center text-base font-bold text-[#212121]">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-[#E0E0E0]"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
