"use client";

/**
 * components/cabs/CabSearchBar.tsx  (v2 — full rebuild)
 *
 * Matches the reference design exactly:
 *   • Bold city names like "Mumbai" / "Pune"
 *   • Swap ⇄ button between From / To
 *   • Custom mini-calendar popup on Departure / Return click
 *   • Pickup-Time dropdown (hour × AM/PM)
 *   • Passengers counter (+ / -)
 *   • Trip tabs: Outstation One-Way | Outstation Round-Trip | Full Day
 *   • No dropdown-covers-content bug (portal-style absolute, high z-index)
 */

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Calendar, Car, ChevronDown, Clock, MapPin, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CabSearchParams, CabTripType } from "@/lib/cabs-api";
import {
  addDays,
  localDateStr,
  POPULAR_PICKUP_CITIES,
  POPULAR_DROP_CITIES,
  POPULAR_CAB_ROUTES,
} from "@/lib/cabs-api";

// ─── Constants ────────────────────────────────────────────────────────────────

const MO  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const WD  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;
const WDF = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

const TRIP_TABS: { value: CabTripType; label: string }[] = [
  { value: "one_way",    label: "Outstation One-Way"    },
  { value: "round_trip", label: "Outstation Round-Trip" },
  { value: "full_day",   label: "Full Day"              },
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function fmtDisplay(iso: string) {
  if (!iso) return { day: "--", mo: "", yr: "", wd: "" };
  const dt = parseIso(iso);
  return {
    day: String(dt.getDate()),
    mo:  MO[dt.getMonth()],
    yr:  String(dt.getFullYear()).slice(2),
    wd:  WDF[dt.getDay()],
  };
}

function isoOfDate(d: Date) { return localDateStr(d); }

function startOfMonth(iso: string) {
  const dt = parseIso(iso);
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

type MiniCalendarProps = {
  value: string;          // YYYY-MM-DD
  minIso: string;
  maxIso?: string;
  rangeStart?: string;
  rangeEnd?: string;
  onChange: (iso: string) => void;
  onClose: () => void;
};

function MiniCalendar({ value, minIso, maxIso, rangeStart, rangeEnd, onChange, onClose }: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const dt = value ? parseIso(value) : new Date();
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
  });

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days  = daysInMonth(year, month);
  const first = new Date(year, month, 1).getDay(); // 0=Sun

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const minDate = minIso ? parseIso(minIso) : null;
  const maxDate = maxIso ? parseIso(maxIso) : null;
  const rsDate  = rangeStart ? parseIso(rangeStart) : null;
  const reDate  = rangeEnd   ? parseIso(rangeEnd)   : null;

  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className="z-[300] w-[290px] rounded-2xl border border-[#E0E0E0] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#616161] hover:bg-[#F5F5F5]"
        >
          ‹
        </button>
        <span className="text-[13px] font-bold text-[#212121]">
          {MO[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#616161] hover:bg-[#F5F5F5]"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {WD.map((w) => (
          <span key={w} className="text-[10px] font-semibold text-[#9E9E9E]">{w}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const cellIso = isoOfDate(new Date(year, month, day, 12));
          const cellDate = parseIso(cellIso);
          const isSelected = cellIso === value;
          const isDisabled =
            (minDate && cellDate < minDate) ||
            (maxDate && cellDate > maxDate) ||
            false;
          const inRange =
            rsDate && reDate
              ? cellDate >= rsDate && cellDate <= reDate
              : rsDate && value
              ? (cellDate >= rsDate && cellDate <= parseIso(value)) ||
                (cellDate <= rsDate && cellDate >= parseIso(value))
              : false;

          return (
            <button
              key={cellIso}
              type="button"
              disabled={!!isDisabled}
              onClick={() => { onChange(cellIso); onClose(); }}
              className={cn(
                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors",
                isDisabled && "cursor-not-allowed text-[#BDBDBD]",
                !isDisabled && !isSelected && "text-[#212121] hover:bg-[#FFF3E0]",
                inRange && !isSelected && "rounded-none bg-[#FFF3E0]",
                isSelected && "bg-[#EF6614] font-bold text-white",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── City field with autocomplete ────────────────────────────────────────────

type CityFieldProps = {
  label: string;
  value: string;
  suggestions: string[];
  placeholder: string;
  icon: React.ReactNode;
  onChange: (v: string) => void;
};

function CityField({ label, value, suggestions, placeholder, icon, onChange }: CityFieldProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef          = useRef<HTMLInputElement>(null);
  const wrapRef           = useRef<HTMLDivElement>(null);

  // Sync external value → local query when value changes from swap
  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const filtered = query.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSelect = (city: string) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      <button
        type="button"
        className="flex min-h-[80px] w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:px-5 sm:py-4"
        onClick={() => {
          setOpen(true);
          setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 30);
        }}
      >
        <span className="mt-1 shrink-0 text-[#757575]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-normal text-[#9E9E9E]">{label}</span>
          {open ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
              placeholder={placeholder}
              autoComplete="off"
              className="mt-1 block w-full border-0 bg-transparent p-0 text-[22px] font-bold leading-tight text-[#212121] outline-none placeholder:text-[18px] placeholder:font-normal placeholder:text-[#BDBDBD]"
            />
          ) : (
            <span className={cn(
              "mt-1 block truncate font-bold leading-tight",
              value ? "text-[22px] text-[#212121]" : "text-[16px] font-normal text-[#BDBDBD]",
            )}>
              {value || placeholder}
            </span>
          )}
        </span>
      </button>

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-[200] w-full min-w-[200px] overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.2)]">
          {filtered.slice(0, 6).map((city) => (
            <li key={city}>
              <button
                type="button"
                onMouseDown={() => handleSelect(city)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-[#212121] hover:bg-[#F5F7FA]"
              >
                <MapPin className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={1.5} />
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Date field with custom calendar popup ───────────────────────────────────

type DateFieldProps = {
  label: string;
  iso: string;
  minIso: string;
  rangeStart?: string;
  rangeEnd?: string;
  showClear?: boolean;
  onChange: (iso: string) => void;
  onClear?: () => void;
};

function DateField({ label, iso, minIso, rangeStart, rangeEnd, showClear, onChange, onClear }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fmt = fmtDisplay(iso);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      {/* 
        FIX: was <button> but contained a <button> (the clear X) — invalid HTML.
        Changed to <div role="button"> so the clear button is a valid child.
      */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((o) => !o); }}
        className="flex min-h-[80px] w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:px-5 sm:py-4"
      >
        <Calendar className="mt-1 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[11px] font-normal text-[#9E9E9E]">
            {label}
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
          </span>
          <span className="mt-0.5 flex items-end gap-1">
            <span className="text-[28px] font-bold leading-tight text-[#212121]">{fmt.day}</span>
            <span className="mb-0.5 text-[15px] font-semibold text-[#212121]">
              {fmt.mo}'{fmt.yr}
            </span>
          </span>
          <span className="block text-xs font-normal text-[#757575]">{fmt.wd}</span>
        </span>
        {showClear && iso && onClear ? (
          <button
            type="button"
            onMouseDown={(e) => { e.stopPropagation(); onClear(); }}
            className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E0E0E0] text-[#616161] hover:bg-[#BDBDBD]"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200]">
          <MiniCalendar
            value={iso}
            minIso={minIso}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Pickup Time field ────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1–12

type PickupTimeFieldProps = {
  hour: number;        // 1–12
  period: "AM" | "PM";
  onHourChange: (h: number) => void;
  onPeriodChange: (p: "AM" | "PM") => void;
};

function PickupTimeField({ hour, period, onHourChange, onPeriodChange }: PickupTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const displayHour = String(hour).padStart(2, "0");

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[80px] w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:px-5 sm:py-4"
      >
        <Clock className="mt-1 h-5 w-5 shrink-0 text-[#757575]" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[11px] font-normal text-[#9E9E9E]">
            Pickup-Time
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
          </span>
          <span className="mt-0.5 flex items-end gap-1">
            <span className="text-[28px] font-bold leading-tight text-[#212121]">{displayHour}:00</span>
            <span className="mb-0.5 text-[15px] font-semibold text-[#212121]">{period}</span>
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200] w-[240px] rounded-2xl border border-[#E0E0E0] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)]">
          {/* AM / PM toggle */}
          <div className="mb-3 flex gap-2">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors",
                  period === p
                    ? "bg-[#EF6614] text-white"
                    : "border border-[#E0E0E0] text-[#616161] hover:bg-[#F5F5F5]",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Hour grid */}
          <div className="grid grid-cols-4 gap-1">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => { onHourChange(h); setOpen(false); }}
                className={cn(
                  "rounded-lg py-1.5 text-sm font-medium transition-colors",
                  hour === h
                    ? "bg-[#EF6614] font-bold text-white"
                    : "text-[#212121] hover:bg-[#FFF3E0]",
                )}
              >
                {String(h).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Passengers field ─────────────────────────────────────────────────────────

type PassengersFieldProps = {
  value: number;
  onChange: (n: number) => void;
};

function PassengersField({ value, onChange }: PassengersFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[80px] w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFAFA] sm:px-5 sm:py-4"
      >
        <span className="mt-1 h-5 w-5 shrink-0 text-[#757575]">
          {/* person icon inline */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[11px] font-normal text-[#9E9E9E]">
            Passengers
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
          </span>
          <span className="mt-0.5 flex items-end gap-1">
            <span className="text-[22px] font-bold leading-tight text-[#212121]">{value}</span>
            <span className="mb-0.5 text-[14px] font-normal text-[#616161]">
              {value === 1 ? "Passenger" : "Passengers"}
            </span>
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200] w-[220px] rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-[#212121]">Passengers</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={value <= 1}
                onClick={() => onChange(Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-40"
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="min-w-[1.5rem] text-center text-base font-bold text-[#212121]">{value}</span>
              <button
                type="button"
                disabled={value >= 12}
                onClick={() => onChange(Math.min(12, value + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-40"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 h-9 w-full rounded-lg bg-[#EF6614] text-sm font-semibold text-white hover:bg-[#E65100]"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main CabSearchBar ────────────────────────────────────────────────────────

export type CabSearchBarProps = {
  onSearch: (params: CabSearchParams) => void | Promise<void>;
  searching?: boolean;
  className?: string;
};

function inferDropState(city: string) {
  return POPULAR_CAB_ROUTES.find((r) => r.to.toLowerCase() === city.toLowerCase())?.state ?? "";
}

export function CabSearchBar({ onSearch, searching = false, className }: CabSearchBarProps) {
  const today    = localDateStr(new Date());
  const tomorrow = addDays(today, 1);

  const [tripType,    setTripType]    = useState<CabTripType>("one_way");
  const [pickupCity,  setPickupCity]  = useState("");
  const [dropCity,    setDropCity]    = useState("");
  const [dropState,   setDropState]   = useState("");
  const [travelDate,  setTravelDate]  = useState(tomorrow);
  const [returnDate,  setReturnDate]  = useState(addDays(tomorrow, 1));
  const [pickupHour,  setPickupHour]  = useState(10);
  const [pickupPM,    setPickupPM]    = useState<"AM" | "PM">("AM");
  const [passengers,  setPassengers]  = useState(1);
  const [error,       setError]       = useState<string | null>(null);

  const handleDropCity = (city: string) => {
    setDropCity(city);
    const st = inferDropState(city);
    if (st) setDropState(st);
  };

  const swap = () => {
    const p = pickupCity; const d = dropCity;
    setPickupCity(d);
    setDropCity(p);
    setDropState(inferDropState(p));
  };

  const validate = () => {
    if (!pickupCity.trim()) { setError("Enter a pickup city"); return false; }
    if (!dropCity.trim())   { setError("Enter a drop city");   return false; }
    if (pickupCity.trim().toLowerCase() === dropCity.trim().toLowerCase()) {
      setError("Pickup and drop cities cannot be the same"); return false;
    }
    if (tripType === "round_trip" && returnDate <= travelDate) {
      setError("Return date must be after departure"); return false;
    }
    setError(null); return true;
  };

  const handleSearch = async () => {
    if (!validate() || searching) return;
    await onSearch({
      pickup_city: pickupCity.trim(),
      drop_city:   dropCity.trim(),
      drop_state:  dropState || "India",
      trip_type:   tripType,
      travel_date: travelDate,
      return_date: tripType === "round_trip" ? returnDate : undefined,
      passengers,
    });
  };

  const divider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";

  return (
    <div className={cn("w-full", className)}>

      {/* ── Trip-type tabs ─────────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 px-1">
        {TRIP_TABS.map(({ value, label }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-white select-none">
            <span className={cn(
              "relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
              tripType === value ? "border-[#EF6614] bg-[#EF6614]" : "border-white/70 bg-transparent",
            )}>
              {tripType === value && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <input type="radio" name="cab_trip" value={value} checked={tripType === value}
              onChange={() => { setTripType(value); setError(null); }} className="sr-only" />
            {label}
          </label>
        ))}
      </div>

      {/* ── White search card ───────────────────────────────────────────────── */}
      <div className={cn(
        "relative w-full overflow-visible rounded-xl bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)] sm:rounded-2xl",
        searching && "pointer-events-none opacity-60",
      )}>
        <div className="flex w-full flex-col sm:flex-row sm:items-stretch">

          {/* From */}
          <CityField
            label="From"
            value={pickupCity}
            suggestions={POPULAR_PICKUP_CITIES}
            placeholder="Enter pickup city"
            icon={<Car className="h-5 w-5" strokeWidth={1.5} />}
            onChange={setPickupCity}
          />

          {/* ⇄ swap */}
          <div className="relative flex items-center justify-center sm:self-center sm:mx-0">
            <button type="button" onClick={swap} aria-label="Swap cities"
              className="absolute left-1/2 -translate-x-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#E0E0E0] bg-white text-[#757575] shadow-sm transition-colors hover:border-[#EF6614] hover:text-[#EF6614] sm:relative sm:left-auto sm:translate-x-0">
              <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
            </button>
            {/* invisible spacer so sm layout doesn't collapse */}
            <div className="hidden h-[80px] w-[1px] bg-[#EEEEEE] sm:block sm:invisible" />
          </div>

          {/* To */}
          <div className={cn("flex min-w-0 flex-1", divider)}>
            <CityField
              label="To"
              value={dropCity}
              suggestions={POPULAR_DROP_CITIES}
              placeholder="Enter drop city"
              icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
              onChange={handleDropCity}
            />
          </div>

          {/* Departure */}
          <div className={cn("flex min-w-0 flex-1", divider)}>
            <DateField
              label="Departure"
              iso={travelDate}
              minIso={today}
              rangeStart={tripType === "round_trip" ? travelDate : undefined}
              rangeEnd={tripType === "round_trip" ? returnDate : undefined}
              onChange={(iso) => {
                setTravelDate(iso);
                if (returnDate <= iso) setReturnDate(addDays(iso, 1));
              }}
            />
          </div>

          {/* Return — only round_trip */}
          {tripType === "round_trip" ? (
            <div className={cn("flex min-w-0 flex-1", divider)}>
              <DateField
                label="Return"
                iso={returnDate}
                minIso={addDays(travelDate, 1)}
                rangeStart={travelDate}
                rangeEnd={returnDate}
                showClear
                onClear={() => setTripType("one_way")}
                onChange={setReturnDate}
              />
            </div>
          ) : null}

          {/* Pickup Time */}
          <div className={cn("flex min-w-0 flex-1", divider)}>
            <PickupTimeField
              hour={pickupHour}
              period={pickupPM}
              onHourChange={setPickupHour}
              onPeriodChange={setPickupPM}
            />
          </div>

          {/* Passengers */}
          <div className="flex min-w-0 flex-1">
            <PassengersField value={passengers} onChange={setPassengers} />
          </div>

          {/* SEARCH button */}
          <div className="flex border-t border-[#EEEEEE] sm:border-t-0">
            <button type="button" disabled={searching} onClick={() => void handleSearch()}
              className="flex h-[80px] w-full shrink-0 items-center justify-center bg-[#EF6614] px-6 text-[15px] font-bold tracking-[0.07em] text-white transition-colors hover:bg-[#E65100] disabled:cursor-wait disabled:opacity-80 sm:min-w-[110px] sm:w-[110px]">
              {searching ? "…" : "SEARCH"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <p className="border-t border-[#EEEEEE] px-5 py-2 text-sm font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}