"use client";

/**
 * src/components/trains/TrainSearchBar.tsx
 * ─────────────────────────────────────────
 * Train search bar — frontend only (no backend yet).
 * Style matches the existing SearchBar / cab search pattern.
 *
 * Fields:
 *   From station (with autocomplete from POPULAR_STATIONS)
 *   To station   (with autocomplete)
 *   Travel date  (date picker, defaults to tomorrow)
 *   Class        (dropdown: ALL, SL, 3A, 2A, 1A, CC, EC)
 *
 * On search → navigates to /trains/results?from=NDLS&to=CNB&date=2026-06-15&class=ALL
 * Results page is a placeholder for now.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CalendarDays, ChevronDown, Train } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Popular stations ──────────────────────────────────────────────────────────
const POPULAR_STATIONS = [
  { code: "NDLS", name: "New Delhi",        city: "Delhi"       },
  { code: "BCT",  name: "Mumbai Central",   city: "Mumbai"      },
  { code: "HWH",  name: "Howrah Junction",  city: "Kolkata"     },
  { code: "MAS",  name: "Chennai Central",  city: "Chennai"     },
  { code: "SBC",  name: "KSR Bengaluru",    city: "Bengaluru"   },
  { code: "PUNE", name: "Pune Junction",    city: "Pune"        },
  { code: "ADI",  name: "Ahmedabad Jn",     city: "Ahmedabad"   },
  { code: "JP",   name: "Jaipur Junction",  city: "Jaipur"      },
  { code: "LKO",  name: "Lucknow Charbagh", city: "Lucknow"     },
  { code: "HYB",  name: "Hyderabad Deccan", city: "Hyderabad"   },
  { code: "CNB",  name: "Kanpur Central",   city: "Kanpur"      },
  { code: "PNBE", name: "Patna Junction",   city: "Patna"       },
  { code: "BPL",  name: "Bhopal Junction",  city: "Bhopal"      },
  { code: "UDZ",  name: "Udaipur City",     city: "Udaipur"     },
  { code: "JAT",  name: "Jammu Tawi",       city: "Jammu"       },
  { code: "CDG",  name: "Chandigarh",       city: "Chandigarh"  },
  { code: "AMD",  name: "Ahmedabad Jn",     city: "Ahmedabad"   },
  { code: "NZM",  name: "Hazrat Nizamuddin",city: "Delhi"       },
  { code: "GKP",  name: "Gorakhpur Jn",     city: "Gorakhpur"   },
  { code: "BSB",  name: "Varanasi Jn",      city: "Varanasi"    },
];

const CLASSES = [
  { value: "ALL", label: "All Classes"            },
  { value: "SL",  label: "Sleeper (SL)"           },
  { value: "3A",  label: "3rd AC (3A)"            },
  { value: "2A",  label: "2nd AC (2A)"            },
  { value: "1A",  label: "1st AC (1A)"            },
  { value: "CC",  label: "Chair Car (CC)"         },
  { value: "EC",  label: "Executive Chair (EC)"   },
];

// ── Tomorrow's date as YYYY-MM-DD ─────────────────────────────────────────────
function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]!;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit", weekday: "short" });
}

// ── Station autocomplete input ────────────────────────────────────────────────
interface StationInputProps {
  label:      string;
  value:      string;
  onChange:   (code: string, name: string) => void;
  placeholder: string;
  exclude?:   string; // exclude this station code from results
}

function StationInput({ label, value, onChange, placeholder, exclude }: StationInputProps) {
  const [query,     setQuery]     = useState(value);
  const [open,      setOpen]      = useState(false);
  const [focused,   setFocused]   = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync display when value changes externally (e.g. swap)
  useEffect(() => {
    const st = POPULAR_STATIONS.find(s => s.code === value);
    setQuery(st ? `${st.name} (${st.code})` : value);
  }, [value]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const filtered = POPULAR_STATIONS.filter(s =>
    s.code !== exclude &&
    (s.name.toLowerCase().includes(query.toLowerCase()) ||
     s.code.toLowerCase().includes(query.toLowerCase()) ||
     s.city.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 8);

  function select(s: typeof POPULAR_STATIONS[0]) {
    onChange(s.code, s.name);
    setQuery(`${s.name} (${s.code})`);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      <div className={cn(
        "flex flex-col px-4 py-2.5 cursor-pointer rounded-xl transition-colors",
        focused ? "bg-orange-50/40" : "hover:bg-surface",
      )}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-0.5">
          {label}
        </span>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); setQuery(""); }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="border-0 bg-transparent p-0 text-[15px] font-bold text-[#212121] outline-none placeholder:font-normal placeholder:text-[#BDBDBD] w-full"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full z-[200] mt-1 w-72 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.18)]">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E] border-b border-[#F0F0F0]">
            Popular Stations
          </div>
          {filtered.map(s => (
            <button key={s.code} type="button" onMouseDown={() => select(s)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F5F7FA]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[11px] font-bold text-primary">
                {s.code.slice(0, 3)}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-[#212121]">{s.name}</div>
                <div className="text-[11px] text-[#9E9E9E]">{s.city}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface TrainSearchBarProps {
  className?: string;
}

export function TrainSearchBar({ className }: TrainSearchBarProps) {
  const router = useRouter();

  const [fromCode, setFromCode] = useState("NDLS");
  const [fromName, setFromName] = useState("New Delhi");
  const [toCode,   setToCode]   = useState("BCT");
  const [toName,   setToName]   = useState("Mumbai Central");
  const [date,     setDate]     = useState(tomorrow());
  const [tClass,   setTClass]   = useState("ALL");
  const [showClass, setShowClass] = useState(false);
  const classRef = useRef<HTMLDivElement>(null);
  const dateRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (classRef.current && !classRef.current.contains(e.target as Node)) setShowClass(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function swap() {
    setFromCode(toCode); setFromName(toName);
    setToCode(fromCode); setToName(fromName);
  }

  function search() {
    if (!fromCode || !toCode) return;
    router.push(`/trains/results?from=${fromCode}&to=${toCode}&date=${date}&class=${tClass}`);
  }

  const classLabel = CLASSES.find(c => c.value === tClass)?.label ?? "All Classes";

  return (
    <div className={cn("w-full", className)}>
      {/* Main search card */}
      <div className="rounded-2xl bg-white shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18),0_2px_12px_-2px_rgba(15,23,42,0.08)] border border-[#E0E0E0] overflow-visible">

        {/* Row 1: From / Swap / To / Date / Class / Search */}
        <div className="flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-[#F0F0F0]">

          {/* From */}
          <StationInput
            label="From"
            value={fromCode}
            onChange={(code, name) => { setFromCode(code); setFromName(name); }}
            placeholder="Departure city or station"
            exclude={toCode}
          />

          {/* Swap button */}
          <div className="flex items-center justify-center px-2 py-2 lg:py-0">
            <button type="button" onClick={swap}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E0E0E0] bg-white shadow-sm transition hover:border-primary hover:text-primary text-[#9E9E9E]"
              title="Swap stations">
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* To */}
          <StationInput
            label="To"
            value={toCode}
            onChange={(code, name) => { setToCode(code); setToName(name); }}
            placeholder="Destination city or station"
            exclude={fromCode}
          />

          {/* Divider */}
          <div className="hidden lg:block w-px bg-[#F0F0F0]" />

          {/* Date */}
          <div className="relative flex-1 min-w-0">
            <button type="button" onClick={() => dateRef.current?.showPicker?.()}
              className="flex w-full flex-col px-4 py-2.5 text-left rounded-xl transition-colors hover:bg-gray-50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-0.5">
                Travel Date
              </span>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-[#EF6614] shrink-0" />
                <span className="text-[15px] font-bold text-[#212121]">
                  {date ? formatDisplayDate(date) : "Select date"}
                </span>
              </div>
            </button>
            <input
              ref={dateRef}
              type="date"
              value={date}
              min={tomorrow()}
              onChange={e => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-[#F0F0F0]" />

          {/* Class */}
          <div ref={classRef} className="relative flex-1 min-w-0">
            <button type="button" onClick={() => setShowClass(v => !v)}
              className="flex w-full flex-col px-4 py-2.5 text-left rounded-xl transition-colors hover:bg-gray-50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9E9E] mb-0.5">
                Class
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[15px] font-bold text-[#212121]">{tClass}</span>
                <ChevronDown className={cn("h-4 w-4 text-[#9E9E9E] transition-transform", showClass && "rotate-180")} />
              </div>
              <span className="text-[11px] text-[#9E9E9E] mt-0.5">{classLabel}</span>
            </button>

            {showClass && (
              <div className="absolute right-0 top-full z-[200] mt-1 w-52 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white shadow-[0_16px_48px_-8px_rgba(15,23,42,0.18)]">
                {CLASSES.map(c => (
                  <button key={c.value} type="button"
                    onMouseDown={() => { setTClass(c.value); setShowClass(false); }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[#F5F7FA]",
                      tClass === c.value ? "bg-orange-50 font-bold text-primary" : "font-medium text-ink"
                    )}>
                    <span>{c.label}</span>
                    {tClass === c.value && (
                      <span className="h-2 w-2 rounded-full bg-[#EF6614]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search button */}
          <div className="flex items-center px-3 py-3 lg:py-0">
            <button type="button" onClick={search}
              className="flex h-12 w-full lg:w-auto lg:min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#EF6614] px-6 text-[15px] font-bold tracking-wide text-white shadow-[0_4px_14px_-2px_rgba(239,102,20,0.5)] transition hover:bg-[#E65100] active:scale-[0.98]">
              <Train className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick popular routes */}
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        <span className="text-[11px] font-semibold text-[#9E9E9E]">Popular:</span>
        {[
          { from: "NDLS", fromN: "New Delhi",      to: "BCT",  toN: "Mumbai Central"  },
          { from: "NDLS", fromN: "New Delhi",      to: "HWH",  toN: "Howrah"          },
          { from: "MAS",  fromN: "Chennai",        to: "SBC",  toN: "Bengaluru"       },
          { from: "JP",   fromN: "Jaipur",         to: "NDLS", toN: "New Delhi"       },
        ].map(r => (
          <button key={r.from + r.to} type="button"
            onClick={() => {
              setFromCode(r.from); setFromName(r.fromN);
              setToCode(r.to);   setToName(r.toN);
            }}
            className="rounded-full border border-[#E0E0E0] bg-white px-3 py-1 text-[11px] font-medium text-[#424242] transition hover:border-[#EF6614] hover:text-[#EF6614]">
            {r.fromN} → {r.toN}
          </button>
        ))}
      </div>
    </div>
  );
}