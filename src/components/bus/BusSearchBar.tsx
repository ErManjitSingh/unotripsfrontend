"use client";

/**
 * components/bus/BusSearchBar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bus search bar — matches the screenshot exactly:
 *   From  |  To  |  Travel Date ↓  |  [SEARCH blue pill]
 *
 * Bold city names: "Delhi, Delhi" / "Kanpur, Uttar Pradesh"
 * Custom mini-calendar on Travel Date click
 * City autocomplete from popular routes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Calendar, ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addDays,
  formatBusDate,
  localDateStr,
  POPULAR_FROM_CITIES,
  POPULAR_TO_CITIES,
  POPULAR_BUS_ROUTES,
  type BusSearchParams,
} from "@/lib/bus-api";

// ─── Date helpers ──────────────────────────────────────────────────────────────

const MO  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const WD  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;
const WDF = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
function isoOfDate(d: Date) { return localDateStr(d); }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }

// ─── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({
  value, minIso, onChange, onClose,
}: {
  value: string; minIso: string;
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

  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      className="z-[300] w-[290px] rounded-2xl border border-[#E0E0E0] bg-white p-3 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.22)]"
      onMouseDown={(e) => e.stopPropagation()}
    >
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
          const isSelected  = cellIso === value;
          const isDisabled  = !!(minDate && cellDate < minDate);
          return (
            <button key={cellIso} type="button" disabled={isDisabled}
              onClick={() => { onChange(cellIso); onClose(); }}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors",
                isDisabled  && "cursor-not-allowed text-[#BDBDBD]",
                !isDisabled && !isSelected && "text-[#212121] hover:bg-[#E3F2FD]",
                isSelected  && "bg-[#2196F3] font-bold text-white",
              )}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── City Field ────────────────────────────────────────────────────────────────

function CityField({
  label, value, subLabel, suggestions, placeholder, icon, onChange,
}: {
  label: string; value: string; subLabel?: string;
  suggestions: string[]; placeholder: string;
  icon: React.ReactNode; onChange: (v: string) => void;
}) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef          = useRef<HTMLInputElement>(null);
  const wrapRef           = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-1 flex-col">
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 30); }}
        className="flex min-h-[90px] w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
      >
        <span className="mt-1 shrink-0 text-[#9E9E9E]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-normal text-[#9E9E9E]">{label}</span>
          {open ? (
            <input ref={inputRef} value={query}
              onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
              placeholder={placeholder} autoComplete="off"
              className="mt-1 block w-full border-0 bg-transparent p-0 text-[22px] font-bold leading-tight text-[#212121] outline-none placeholder:text-[16px] placeholder:font-normal placeholder:text-[#BDBDBD]"
            />
          ) : (
            <span className={cn("mt-1 block truncate font-bold leading-tight",
              value ? "text-[22px] text-[#212121]" : "text-[16px] font-normal text-[#BDBDBD]"
            )}>
              {value || placeholder}
            </span>
          )}
          {subLabel && value && !open && (
            <span className="mt-0.5 block text-[12px] text-[#9E9E9E]">{subLabel}</span>
          )}
        </span>
      </button>

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-[200] w-full min-w-[220px] overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.2)]">
          {filtered.slice(0, 6).map((city) => (
            <li key={city}>
              <button type="button" onMouseDown={() => { setQuery(city); onChange(city); setOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-medium text-[#212121] hover:bg-[#F5F7FA]">
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

// ─── Date Field ─────────────────────────────────────────────────────────────────

function DateField({ label, iso, minIso, onChange }: {
  label: string; iso: string; minIso: string; onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fmt = formatBusDate(iso);

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
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex min-h-[90px] w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]">
        <Calendar className="mt-1 h-5 w-5 shrink-0 text-[#9E9E9E]" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[12px] font-normal text-[#9E9E9E]">
            {label}
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
          </span>
          <span className="mt-0.5 flex items-end gap-1.5">
            <span className="text-[28px] font-bold leading-tight text-[#212121]">{fmt.day}</span>
            <span className="mb-0.5 text-[15px] font-semibold text-[#212121]">{fmt.mo}'{fmt.yr}</span>
          </span>
          <span className="block text-[12px] text-[#9E9E9E]">{fmt.wd}</span>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[200]">
          <MiniCalendar value={iso} minIso={minIso} onChange={onChange} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Main BusSearchBar ─────────────────────────────────────────────────────────

export type BusSearchBarProps = {
  onSearch: (params: BusSearchParams) => void | Promise<void>;
  searching?: boolean;
  className?: string;
};

function inferSubLabel(city: string, type: "from" | "to"): string {
  const route = POPULAR_BUS_ROUTES.find((r) =>
    type === "from"
      ? r.from.toLowerCase() === city.toLowerCase()
      : r.to.toLowerCase() === city.toLowerCase(),
  );
  return route?.state ? `${route.state}, India` : "India";
}

export function BusSearchBar({ onSearch, searching = false, className }: BusSearchBarProps) {
  const today    = localDateStr();
  const tomorrow = addDays(today, 1);

  const [fromCity,    setFromCity]    = useState("");
  const [toCity,      setToCity]      = useState("");
  const [travelDate,  setTravelDate]  = useState(tomorrow);
  const [error,       setError]       = useState<string | null>(null);

  const swap = () => { const f = fromCity; setFromCity(toCity); setToCity(f); };

  const validate = () => {
    if (!fromCity.trim()) { setError("Enter departure city"); return false; }
    if (!toCity.trim())   { setError("Enter destination city"); return false; }
    if (fromCity.trim().toLowerCase() === toCity.trim().toLowerCase()) {
      setError("Departure and destination cannot be the same"); return false;
    }
    setError(null); return true;
  };

  const handleSearch = async () => {
    if (!validate() || searching) return;
    await onSearch({ from_city: fromCity.trim(), to_city: toCity.trim(), travel_date: travelDate });
  };

  const divider = "border-[#EEEEEE] border-b sm:border-b-0 sm:border-r";

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "relative w-full overflow-visible rounded-2xl bg-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.28)]",
        searching && "pointer-events-none opacity-60",
      )}>
        <div className="flex w-full flex-col sm:flex-row sm:items-stretch">

          {/* From */}
          <div className={cn("flex min-w-0 sm:flex-[1.4]", divider)}>
            <CityField
              label="From"
              value={fromCity}
              subLabel={fromCity ? inferSubLabel(fromCity, "from") : undefined}
              suggestions={POPULAR_FROM_CITIES}
              placeholder="Enter city or stop"
              icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
              onChange={setFromCity}
            />
          </div>

          {/* Swap button — sits on the divider */}
          <div className="relative flex items-center justify-center sm:self-center">
            <button type="button" onClick={swap} aria-label="Swap cities"
              className="absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#EEEEEE] bg-white text-[#9E9E9E] shadow-sm transition-colors hover:border-[#2196F3] hover:text-[#2196F3] sm:relative sm:left-auto sm:translate-x-0 sm:mx-[-1px]">
              <ArrowLeftRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="hidden h-[90px] w-[1px] sm:block sm:invisible" />
          </div>

          {/* To */}
          <div className={cn("flex min-w-0 sm:flex-[1.4]", divider)}>
            <CityField
              label="To"
              value={toCity}
              subLabel={toCity ? inferSubLabel(toCity, "to") : undefined}
              suggestions={POPULAR_TO_CITIES}
              placeholder="Enter city or stop"
              icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
              onChange={setToCity}
            />
          </div>

          {/* Travel Date */}
          <div className="flex min-w-0 sm:flex-1">
            <DateField
              label="Travel Date"
              iso={travelDate}
              minIso={today}
              onChange={setTravelDate}
            />
          </div>

          {/* SEARCH — blue pill button matching screenshot */}
          <div className="flex items-center justify-center border-t border-[#EEEEEE] p-4 sm:border-t-0 sm:px-5">
            <button type="button" disabled={searching} onClick={() => void handleSearch()}
              className="h-[52px] w-full min-w-[140px] rounded-full bg-[#2196F3] px-8 text-[15px] font-bold tracking-[0.07em] text-white shadow-[0_4px_14px_-2px_rgba(33,150,243,0.5)] transition-colors hover:bg-[#1E88E5] disabled:cursor-wait disabled:opacity-70 sm:w-auto">
              {searching ? "Searching…" : "SEARCH"}
            </button>
          </div>
        </div>

        {error && (
          <p className="border-t border-[#EEEEEE] px-5 py-2 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}