"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

function fmtDate(iso: string) {
  if (!iso) return "";
  const [y, m] = iso.split("-");
  return new Date(+y, +m - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
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
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dateIso) {
      const t = new Date();
      setDateIso(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-01`);
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
      <div className="relative h-[310px] w-full sm:h-[360px]">
        {/* Background */}
        <Image src={image} alt="" fill priority unoptimized sizes="100vw" className="object-cover object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        {/* Title */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-24 pt-6 text-center sm:pb-28">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-amber-400 drop-shadow-md sm:text-xs">
            Holiday Packages
          </p>
          <h1 className="max-w-3xl text-2xl font-black leading-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {destinationName !== "All Destinations" && (
            <p className="mt-1.5 text-sm font-semibold text-white/70 drop-shadow-md">{destinationName}</p>
          )}
        </div>

        {/* Search card */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4 sm:px-6 sm:pb-6">
          <div className="w-full max-w-[900px] overflow-visible rounded-2xl border border-white/20 bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-[1fr_1.6fr_1fr_auto] sm:divide-x sm:divide-y-0">

              {/* FROM */}
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <MapPin className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Traveling From</p>
                  <p className="truncate text-[15px] font-bold text-slate-800">{fromCity}</p>
                </div>
              </div>

              {/* TO — editable */}
              <div ref={toRef} className="relative flex items-center gap-3 px-5 py-4">
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
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <Calendar className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Travel Date</p>
                  <div className="relative">
                    <p className="text-[15px] font-bold text-slate-800">{fmtDate(dateIso) || "Pick month"}</p>
                    <input
                      type="month"
                      value={dateIso.slice(0, 7)}
                      onChange={e => setDateIso(e.target.value + "-01")}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </div>
                </div>
              </div>

              {/* SEARCH */}
              <div className="flex items-center px-4 py-3 sm:py-4">
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_6px_20px_-4px_rgba(234,88,12,0.55)] transition hover:bg-primary/90 sm:w-auto sm:rounded-xl sm:px-7"
                >
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
