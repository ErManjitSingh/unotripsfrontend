"use client";

/**
 * components/flights/FlightSearchBar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches screenshot exactly:
 *   Tabs: ● One Way  ○ Round Trip  ○ Multi City    "Book International and Domestic Flights"
 *   Fields: From | To ⇄ | Departure ↓ | Return ↓ | Travellers & Class ↓
 *
 *   • Bold city names: "New Delhi" / "Bengaluru"
 *   • Sub-label: "DEL, Indira Gandhi International Airport..."
 *   • Return field shows "Tap to add a return date for bigger discounts" when empty
 *   • Travellers & Class: "1 Traveller · Economy/Premium Economy"
 *   • Custom mini-calendar on date fields
 *   • Airport autocomplete (code + city + airport name)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Calendar, ChevronDown, Minus, Plane, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Airport,
  type CabinClass,
  type FlightSearchParams,
  type FlightTripType,
  AIRPORTS,
  CABIN_CLASS_LABELS,
  addDays,
  formatFlightDate,
  localDateStr,
  parseIso,
  searchAirports,
} from "@/lib/flight-api";

// ─── Calendar ─────────────────────────────────────────────────────────────────

const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const WD = ["Su","Mo","Tu","We","Th","Fr","Sa"] as const;

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function isoOfDate(d: Date) { return localDateStr(d); }

function MiniCalendar({
  value, minIso, rangeStart, rangeEnd, onChange, onClose,
}: {
  value: string; minIso: string;
  rangeStart?: string; rangeEnd?: string;
  onChange: (iso: string) => void; onClose: () => void;
}) {
  const [view, setView] = useState(() => {
    const dt = value ? parseIso(value) : new Date();
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
  });
  const year  = view.getFullYear();
  const month = view.getMonth();
  const days  = daysInMonth(year, month);
  const first = new Date(year, month, 1).getDay();
  const minDate = minIso ? parseIso(minIso) : null;
  const rsDate  = rangeStart ? parseIso(rangeStart) : null;
  const reDate  = rangeEnd   ? parseIso(rangeEnd)   : null;

  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="z-[300] w-[300px] rounded-2xl border border-[#E0E0E0] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)]"
      onMouseDown={(e) => e.stopPropagation()}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => setView(new Date(year, month - 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[#616161] hover:bg-[#F5F5F5]">‹</button>
        <span className="text-[13px] font-bold text-[#212121]">{MO[month]} {year}</span>
        <button type="button" onClick={() => setView(new Date(year, month + 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[#616161] hover:bg-[#F5F5F5]">›</button>
      </div>
      <div className="mb-1 grid grid-cols-7 text-center">
        {WD.map((w) => <span key={w} className="text-[10px] font-semibold text-[#9E9E9E]">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const cellIso  = isoOfDate(new Date(year, month, day, 12));
          const cellDate = parseIso(cellIso);
          const isSelected = cellIso === value;
          const isDisabled = !!(minDate && cellDate < minDate);
          const inRange    = rsDate && reDate ? cellDate >= rsDate && cellDate <= reDate : false;
          return (
            <button key={cellIso} type="button" disabled={isDisabled}
              onClick={() => { onChange(cellIso); onClose(); }}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors",
                isDisabled  && "cursor-not-allowed text-[#BDBDBD]",
                !isDisabled && !isSelected && "text-[#212121] hover:bg-[#FFF3E0]",
                inRange     && !isSelected && "rounded-none bg-[#FFF3E0]",
                isSelected  && "bg-[#EF6614] font-bold text-white",
              )}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Airport Field ─────────────────────────────────────────────────────────────

function AirportField({
  label, airport, placeholder, onChange,
}: {
  label: string; airport: Airport | null; placeholder: string;
  onChange: (a: Airport) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const inputRef          = useRef<HTMLInputElement>(null);
  const wrapRef           = useRef<HTMLDivElement>(null);
  const results           = searchAirports(query);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const subLabel = airport
    ? `${airport.code}, ${airport.name}`
    : "";

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      <button type="button"
        onClick={() => { setOpen(true); setQuery(""); setTimeout(() => { inputRef.current?.focus(); }, 30); }}
        className="flex min-h-[90px] w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F0F6FF]">
        <Plane className="mt-1 h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-normal text-[#9E9E9E]">{label}</span>
          {open ? (
            <input ref={inputRef} value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={airport?.city ?? placeholder} autoComplete="off"
              className="mt-1 block w-full border-0 bg-transparent p-0 text-[22px] font-bold leading-tight text-[#212121] outline-none placeholder:text-[18px] placeholder:font-bold placeholder:text-[#BDBDBD]"
            />
          ) : (
            <span className={cn("mt-1 block truncate font-bold leading-tight",
              airport ? "text-[22px] text-[#212121]" : "text-[16px] font-normal text-[#BDBDBD]"
            )}>
              {airport?.city ?? placeholder}
            </span>
          )}
          {airport && !open && (
            <span className="mt-0.5 block truncate text-[11px] text-[#9E9E9E]">
              {subLabel.length > 42 ? subLabel.slice(0, 42) + "..." : subLabel}
            </span>
          )}
        </span>
      </button>

      {open && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-[200] w-full min-w-[300px] overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.2)]">
          {results.map((a) => (
            <li key={a.code}>
              <button type="button"
                onMouseDown={() => { onChange(a); setOpen(false); setQuery(""); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F0F6FF]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD] text-[13px] font-bold text-[#1565C0]">
                  {a.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-[#212121]">{a.city}</span>
                  <span className="block truncate text-[11px] text-[#9E9E9E]">{a.name}, {a.country}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Date Field ────────────────────────────────────────────────────────────────

function DateField({
  label, iso, minIso, rangeStart, rangeEnd,
  emptyHint, onChange, onActivate,
}: {
  label: string; iso: string; minIso: string;
  rangeStart?: string; rangeEnd?: string;
  emptyHint?: string;
  onChange: (iso: string) => void;
  onActivate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fmt = formatFlightDate(iso);
  const isEmpty = !iso;

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
      <button type="button"
        onClick={() => { if (onActivate) onActivate(); setOpen((o) => !o); }}
        className="flex min-h-[90px] w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F0F6FF]">
        <Calendar className="mt-1 h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[12px] font-normal text-[#9E9E9E]">
            {label}
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
          </span>
          {isEmpty ? (
            <span className="mt-1.5 block text-[12px] leading-snug text-[#9E9E9E]">
              {emptyHint ?? "Select date"}
            </span>
          ) : (
            <>
              <span className="mt-0.5 flex items-end gap-1.5">
                <span className="text-[28px] font-bold leading-tight text-[#212121]">{fmt.day}</span>
                <span className="mb-0.5 text-[15px] font-semibold text-[#212121]">{fmt.mo}'{fmt.yr}</span>
              </span>
              <span className="block text-[12px] text-[#9E9E9E]">{fmt.wd}</span>
            </>
          )}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200]">
          <MiniCalendar value={iso} minIso={minIso}
            rangeStart={rangeStart} rangeEnd={rangeEnd}
            onChange={onChange} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Travellers & Class Field ──────────────────────────────────────────────────

type TravCount = { adults: number; children: number; infants: number };

function TravellersField({
  counts, cabin, onCounts, onCabin,
}: {
  counts: TravCount; cabin: CabinClass;
  onCounts: (c: TravCount) => void; onCabin: (c: CabinClass) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const total = counts.adults + counts.children + counts.infants;

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const TRAV_ROWS: { key: keyof TravCount; label: string; sub: string; min: number }[] = [
    { key: "adults",   label: "Adults",   sub: "12+ yrs",  min: 1 },
    { key: "children", label: "Children", sub: "2-12 yrs", min: 0 },
    { key: "infants",  label: "Infants",  sub: "Under 2",  min: 0 },
  ];

  const cabinLabel = CABIN_CLASS_LABELS[cabin];

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex min-h-[90px] w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F0F6FF]">
        <Users className="mt-1 h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[12px] font-normal text-[#9E9E9E]">
            Travellers &amp; Class
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
          </span>
          <span className="mt-0.5 flex items-end gap-1.5">
            <span className="text-[28px] font-bold leading-tight text-[#212121]">{total}</span>
            <span className="mb-0.5 text-[14px] font-semibold text-[#212121]">
              {total === 1 ? "Traveller" : "Travellers"}
            </span>
          </span>
          <span className="block truncate text-[11px] text-[#9E9E9E]">{cabinLabel}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-[200] w-[300px] rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)]">

          {/* Traveller counters */}
          <div className="flex flex-col gap-4">
            {TRAV_ROWS.map(({ key, label, sub, min }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-[#212121]">{label}</p>
                  <p className="text-[11px] text-[#9E9E9E]">{sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button"
                    disabled={counts[key] <= min}
                    onClick={() => onCounts({ ...counts, [key]: Math.max(min, counts[key] - 1) })}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30">
                    <Minus className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <span className="w-5 text-center text-[15px] font-bold text-[#212121]">{counts[key]}</span>
                  <button type="button"
                    disabled={total >= 9}
                    onClick={() => onCounts({ ...counts, [key]: counts[key] + 1 })}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E0E0E0] text-[#616161] hover:border-[#EF6614] hover:text-[#EF6614] disabled:opacity-30">
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cabin class */}
          <div className="mt-4 border-t border-[#EEEEEE] pt-4">
            <p className="mb-2 text-[12px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Cabin Class</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CABIN_CLASS_LABELS) as [CabinClass, string][]).map(([val, lbl]) => (
                <button key={val} type="button" onClick={() => onCabin(val)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-[12px] font-semibold text-left transition-colors",
                    cabin === val
                      ? "border-[#EF6614] bg-[#FFF3E0] text-[#EF6614]"
                      : "border-[#E0E0E0] text-[#616161] hover:bg-[#F5F5F5]",
                  )}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setOpen(false)}
            className="mt-4 h-10 w-full rounded-xl bg-[#EF6614] text-[13px] font-bold text-white hover:bg-[#E65100]">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main FlightSearchBar ──────────────────────────────────────────────────────

export type FlightSearchBarProps = {
  onSearch: (p: FlightSearchParams) => void | Promise<void>;
  searching?: boolean;
  className?: string;
};

const DEFAULT_FROM = AIRPORTS.find((a) => a.code === "DEL")!;
const DEFAULT_TO   = AIRPORTS.find((a) => a.code === "BLR")!;

export function FlightSearchBar({ onSearch, searching = false, className }: FlightSearchBarProps) {
  const today    = localDateStr();
  const tomorrow = addDays(today, 1);

  const [tripType,   setTripType]   = useState<FlightTripType>("one_way");
  const [fromApt,    setFromApt]    = useState<Airport>(DEFAULT_FROM);
  const [toApt,      setToApt]      = useState<Airport>(DEFAULT_TO);
  const [departure,  setDeparture]  = useState(tomorrow);
  const [returnDate, setReturnDate] = useState("");
  const [counts,     setCounts]     = useState({ adults: 1, children: 0, infants: 0 });
  const [cabin,      setCabin]      = useState<CabinClass>("economy");
  const [error,      setError]      = useState<string | null>(null);

  const swap = () => { const f = fromApt; setFromApt(toApt); setToApt(f); };

  const handleTripType = (t: FlightTripType) => {
    setTripType(t);
    if (t === "round_trip" && !returnDate) setReturnDate(addDays(departure, 1));
    if (t === "one_way") setReturnDate("");
  };

  const validate = () => {
    if (fromApt.code === toApt.code) { setError("Origin and destination cannot be the same"); return false; }
    if (tripType === "round_trip" && !returnDate) { setError("Please select a return date"); return false; }
    setError(null); return true;
  };

  const handleSearch = async () => {
    if (!validate() || searching) return;
    await onSearch({
      from_code:   fromApt.code,
      to_code:     toApt.code,
      trip_type:   tripType,
      departure,
      return_date: returnDate || undefined,
      adults:      counts.adults,
      children:    counts.children,
      infants:     counts.infants,
      cabin,
    });
  };

  const divider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";
  const total   = counts.adults + counts.children + counts.infants;

  return (
    <div className={cn("w-full", className)}>
      {/* ── Trip type tabs ──────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
          {(["one_way","round_trip","multi_city"] as FlightTripType[]).map((t) => {
            const labels = { one_way: "One Way", round_trip: "Round Trip", multi_city: "Multi City" };
            return (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-white select-none">
                <span className={cn(
                  "relative flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                  tripType === t ? "border-[#EF6614] bg-[#EF6614]" : "border-white/70 bg-transparent",
                )}>
                  {tripType === t && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <input type="radio" name="flight_trip" value={t} checked={tripType === t}
                  onChange={() => handleTripType(t)} className="sr-only" />
                {labels[t]}
              </label>
            );
          })}
        </div>
        <span className="hidden text-[12px] text-white/80 sm:block">
          Book International and Domestic Flights
        </span>
      </div>

      {/* ── White search card ────────────────────────────────────────────── */}
      <div className={cn(
        "relative w-full overflow-visible rounded-2xl bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]",
        searching && "pointer-events-none opacity-60",
      )}>
        <div className="flex w-full flex-col sm:flex-row sm:items-stretch">

          {/* From */}
          <div className={cn("flex min-w-0 sm:flex-[1.3]", divider)}>
            <AirportField label="From" airport={fromApt} placeholder="Departure city"
              onChange={setFromApt} />
          </div>

          {/* Swap */}
          <div className="relative flex items-center justify-center sm:self-center">
            <button type="button" onClick={swap} aria-label="Swap airports"
              className="absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#EEEEEE] bg-white text-[#9E9E9E] shadow-sm transition-colors hover:border-[#EF6614] hover:text-[#EF6614] sm:relative sm:left-auto sm:translate-x-0 sm:mx-[-1px]">
              <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="hidden h-[90px] w-[1px] sm:block sm:invisible" />
          </div>

          {/* To */}
          <div className={cn("flex min-w-0 sm:flex-[1.3]", divider)}>
            <AirportField label="To" airport={toApt} placeholder="Destination city"
              onChange={setToApt} />
          </div>

          {/* Departure */}
          <div className={cn("flex min-w-0 sm:flex-1", divider)}>
            <DateField label="Departure" iso={departure} minIso={today}
              rangeStart={tripType === "round_trip" ? departure : undefined}
              rangeEnd={tripType === "round_trip" ? returnDate : undefined}
              onChange={(iso) => {
                setDeparture(iso);
                if (returnDate && returnDate <= iso) setReturnDate(addDays(iso, 1));
              }} />
          </div>

          {/* Return */}
          <div className={cn("flex min-w-0 sm:flex-1", divider)}>
            <DateField label="Return" iso={returnDate} minIso={addDays(departure, 1)}
              rangeStart={departure} rangeEnd={returnDate}
              emptyHint="Tap to add a return date for bigger discounts"
              onChange={setReturnDate}
              onActivate={() => { if (tripType !== "round_trip") handleTripType("round_trip"); }} />
          </div>

          {/* Travellers & Class */}
          <div className="flex min-w-0 sm:flex-[1.2]">
            <TravellersField counts={counts} cabin={cabin}
              onCounts={setCounts} onCabin={setCabin} />
          </div>

        </div>

        {/* Error */}
        {error && (
          <p className="border-t border-[#EEEEEE] px-5 py-2 text-sm font-medium text-red-600">{error}</p>
        )}

        {/* Search button — full width below on mobile, bottom-centre on desktop */}
        <div className="flex border-t border-[#EEEEEE] p-3 sm:border-t-0 sm:p-0 sm:justify-center sm:pb-4">
          <button type="button" disabled={searching} onClick={() => void handleSearch()}
            className="h-[52px] w-full rounded-full bg-[#EF6614] px-10 text-[15px] font-bold tracking-[0.07em] text-white shadow-[0_4px_14px_-2px_rgba(239,102,20,0.5)] transition-colors hover:bg-[#E65100] disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-[200px]">
            {searching ? "Searching…" : "SEARCH FLIGHTS"}
          </button>
        </div>
      </div>
    </div>
  );
}