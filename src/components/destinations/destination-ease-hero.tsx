"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PackageTrustStrip } from "@/components/packages/discovery/PackageTrustStrip";
import { DatePickerPopover } from "@/components/hotels/hotel-date-range-picker";

const DEFAULT_FROM = "New Delhi";

export type DestinationEaseHeroProps = {
  title: string;
  image: string;
  destinationName: string;
  fromCity?: string;
  initialDate?: string;
  className?: string;
};

type CityHit = { name: string; country: string; state: string };

/** "2026-08-05" → "5 Aug 2026". Full date now that the field picks a day. */
function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function DestinationEaseHero({
  title,
  image,
  destinationName,
  fromCity = DEFAULT_FROM,
  initialDate,
  className,
}: DestinationEaseHeroProps) {
  const router = useRouter();

  const [to, setTo]           = useState(destinationName !== "All Destinations" ? destinationName : "");
  const [toOpen, setToOpen]   = useState(false);
  const [cityHits, setCityHits] = useState<CityHit[]>([]);
  const [dateIso, setDateIso] = useState(initialDate ?? "");
  const [dateOpen, setDateOpen] = useState(false);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateIso) {
      // Defaults to today. The old month field defaulted to the 1st of the
      // current month, which is a past date for most of any given month.
      const t = new Date();
      setDateIso(
        `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`,
      );
    }
  }, [dateIso]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const abortRef = useRef<AbortController | null>(null);
  const fetchCities = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`,
        { signal: abortRef.current.signal },
      );
      const data = await res.json();
      const hits: CityHit[] = (data.features ?? [])
        .filter((f: any) => ["city","town","village","municipality"].includes(f.properties.type ?? "") && f.properties.name)
        .slice(0, 5)
        .map((f: any) => ({ name: f.properties.name, country: f.properties.country ?? "", state: f.properties.state ?? "" }));
      setCityHits(hits);
    } catch { /* aborted */ }
  }, []);

  useEffect(() => {
    const q = to.trim();
    if (!q || q.length < 2) { setCityHits([]); return; }
    const id = setTimeout(() => fetchCities(q), 300);
    return () => clearTimeout(id);
  }, [to, fetchCities]);

  const onSubmit = () => {
    const p = new URLSearchParams();
    if (to.trim()) p.set("q",    to.trim());
    if (fromCity)  p.set("from", fromCity);
    if (dateIso)   p.set("date", dateIso);
    router.push(`/packages?${p.toString()}`);
  };

  return (
    <section
      className={cn("relative z-10 w-full overflow-hidden bg-slate-900", className)}
      aria-label={title}
    >
      {/* Taller than before (248→308 mobile, 360→470 desktop) to seat the trust
          strip inside the image beneath the search card. Background, gradient
          and search-card dimensions are unchanged.
          Mobile came back down from 368 when the strip collapsed to a single
          42px row — holding 368 would have left ~60px of empty image above the
          search card. */}
      <div className="relative h-[308px] w-full sm:h-[470px]">
        {/* Background */}
        <Image src={image} alt="" fill priority unoptimized sizes="100vw" className="object-cover object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        {/* Title */}
        {/* The site navbar overlays this hero on desktop. Reserve that space so
            the eyebrow/title never disappear behind it. The bottom padding
            clears the search card AND the trust strip below it. */}
        <div className="relative z-10 hidden h-full translate-y-2 flex-col items-center justify-center px-4 pb-[212px] pt-[92px] text-center sm:flex">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.38em] text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:text-xs">
            Holiday Packages
          </p>
          <h1 className="max-w-4xl font-display text-3xl font-extrabold leading-tight tracking-[-0.025em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.78)] sm:text-4xl md:text-5xl lg:text-[3.75rem]">
            {title}
          </h1>
          {destinationName !== "All Destinations" && (
            <p className="mt-2 text-sm font-medium tracking-[0.06em] text-white/80 drop-shadow-md sm:text-base">{destinationName}</p>
          )}
        </div>

        {/* Search card + trust strip — one centered column so both share the
            900px measure and read as a single unit against the photograph. */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-3 pb-4 sm:gap-5 sm:px-6 sm:pb-8">
          {/* Warm translucent glass instead of pure white: at 92% alpha the
              photograph tints through just enough that the card reads as part
              of the hero rather than a white block dropped on top of it. The
              blur matches the navbar pill; the second shadow is a low-opacity
              orange glow that ties the card to the Search button. */}
          {/* max-w-[420px] below sm: the fields stack until 640px, so between
              ~420 and 639 the card stretched to ~576px while still in single
              column — which turned the full-width Search button into a 542px
              slab. Capping the card at phone width keeps every element in
              proportion there. No effect at 375 (card is 351px anyway) and the
              900px desktop measure is untouched. */}
          <div className="relative z-30 w-full max-w-[420px] overflow-visible rounded-[26px] border border-white/50 bg-[rgba(255,248,241,0.92)] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35),0_8px_28px_-10px_rgba(234,88,12,0.22)] backdrop-blur-md sm:max-w-[900px]">
            {/* No `divide-y` on mobile. It compiles to
                `& > :not([hidden]) ~ :not([hidden])`, which keys on the hidden
                ATTRIBUTE — the "Traveling From" cell is hidden by the `hidden`
                CLASS, so it still counted as a sibling and handed a border-top
                to Destination, the first *visible* cell. The card is
                overflow-visible (the city dropdown has to escape it), so that
                1px sat unclipped across the 26px top radius as a seam.
                A `border-t-0` override cannot win: the divide selector is
                specificity (0,3,0) vs (0,1,0) for a utility. So the two mobile
                dividers are declared explicitly on the cells below instead. */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.6fr_1fr_auto] sm:divide-x sm:divide-[#F1E7DC]">

              {/* FROM */}
              <div className="hidden items-center gap-3 px-5 py-4 sm:flex">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <MapPin className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Traveling From</p>
                  <p className="truncate text-[15px] font-bold text-slate-800">{fromCity}</p>
                </div>
              </div>

              {/* TO — editable */}
              {/* Vertical padding trimmed ~12–14% on the destination and date
                  fields only (py-3.5→3 mobile, py-4→3.5 desktop). The From cell
                  and the Search button's cell keep their original padding. */}
              <div ref={toRef} className="relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <Search className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Destination</p>
                  <div className="flex items-center gap-1">
                    <input
                      value={to}
                      onChange={e => { setTo(e.target.value); setToOpen(true); }}
                      onFocus={() => to.trim().length >= 2 && setToOpen(true)}
                      placeholder="Where to?"
                      className="min-w-0 flex-1 bg-transparent text-[15px] font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
                    />
                    {to && (
                      <button type="button" onClick={() => { setTo(""); setCityHits([]); setToOpen(false); }}>
                        <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>
                {/* City dropdown */}
                {toOpen && cityHits.length > 0 && (
                  <ul className="absolute left-0 top-full z-[200] mt-2 w-full min-w-[240px] overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                    {cityHits.map((h, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50"
                          onClick={() => { setTo(`${h.name}${h.country ? `, ${h.country}` : ""}`); setToOpen(false); setCityHits([]); }}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{h.name}</p>
                            <p className="text-xs text-slate-400">{[h.state, h.country].filter(Boolean).join(", ")}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* DATE */}
              {/* Day picker, not a month picker. The old transparent
                  <input type="month"> only let guests choose a month, and
                  Chrome would only open it when the click landed on its
                  (invisible) calendar icon. This is the same DatePickerPopover
                  the package detail page already uses, in singleDate mode. */}
              <div className="relative flex items-center border-t border-[#F1E7DC] sm:border-t-0">
                <button
                  type="button"
                  onClick={() => setDateOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={dateOpen}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5 sm:py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                    <Calendar className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Travel Date
                    </span>
                    <span className="block truncate text-[15px] font-bold text-slate-800">
                      {fmtDate(dateIso) || "Pick date"}
                    </span>
                  </span>
                </button>

                {dateOpen && (
                  <DatePickerPopover
                    checkIn={dateIso}
                    checkOut=""
                    onChange={(checkIn) => setDateIso(checkIn)}
                    onApply={() => setDateOpen(false)}
                    onClose={() => setDateOpen(false)}
                    compact
                    singleDate
                  />
                )}
              </div>

              {/* SEARCH */}
              {/* Mobile only: no w-full. The button is 76% of this cell, which
                  works out to ~70% of the CARD (the cell is inset by px-4 on
                  each side), and mx-auto centres it. A full-width bar read as a
                  slab rather than a primary CTA.
                  Every sm: value restores the approved desktop button exactly —
                  auto width, 48px tall, 14px text. */}
              <div className="flex items-center border-t border-[#F1E7DC] px-4 py-2.5 sm:border-t-0 sm:py-4">
                <button
                  type="button"
                  onClick={onSubmit}
                  className="mx-auto flex w-[76%] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-[13px] font-black uppercase tracking-wider text-white shadow-[0_6px_20px_-4px_rgba(234,88,12,0.55)] transition hover:bg-primary/90 sm:mx-0 sm:w-auto sm:rounded-xl sm:px-7 sm:py-3.5 sm:text-sm"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* USP trust strip — same 900px measure as the search card above. */}
          <PackageTrustStrip className="relative z-10 max-w-[420px] sm:max-w-[900px]" />
        </div>
      </div>
    </section>
  );
}
