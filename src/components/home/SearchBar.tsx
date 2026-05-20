"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

export type { HeroSearchCatalog } from "@/lib/hero-search-catalog";

export type SearchBarProps = {
  className?: string;
  catalog?: HeroSearchCatalog;
};

const EMPTY: HeroSearchCatalog = { destinations: [], packages: [] };

const TRENDING_HOLIDAY_DESTINATIONS = [
  {
    label: "Himachal",
    href: "/destinations/himachal",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=128&q=80",
  },
  {
    label: "Kashmir",
    href: "/destinations/kashmir",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=128&q=80",
  },
  {
    label: "Arunachal",
    href: "/packages?q=Arunachal",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=128&q=80",
  },
  {
    label: "North East",
    href: "/destinations/north-east",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=128&q=80",
  },
] as const;

function matchesQuery(qRaw: string, ...parts: (string | undefined | null)[]) {
  const q = qRaw.trim().toLowerCase();
  if (!q) return false;
  const hay = parts.filter(Boolean).join(" ").toLowerCase();
  return hay.includes(q);
}

/** Premium floating pill search — EaseMyTrip-style trending dropdown on focus. */
export function SearchBar({ className, catalog: catalogProp }: SearchBarProps) {
  const catalog = catalogProp ?? EMPTY;
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trimmed = q.trim();

  const destHits = useMemo(() => {
    if (!trimmed) return [];
    return catalog.destinations
      .filter((d) => matchesQuery(trimmed, d.name, d.region, d.slug.replace(/-/g, " ")))
      .slice(0, 6);
  }, [catalog.destinations, trimmed]);

  const pkgHits = useMemo(() => {
    if (!trimmed) return [];
    return catalog.packages
      .filter((p) =>
        matchesQuery(trimmed, p.title, p.location, p.slug.replace(/-/g, " ")),
      )
      .slice(0, 8);
  }, [catalog.packages, trimmed]);

  const showTrending = open && !trimmed;
  const showSearchResults = open && trimmed && (destHits.length > 0 || pkgHits.length > 0);
  const showPanel = showTrending || showSearchResults;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const submit = () => {
    setOpen(false);
    if (!trimmed) {
      router.push("/packages");
      return;
    }
    router.push(`/packages?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative z-50 mx-auto w-full", className)}
    >
      <motion.div
        whileHover={{ boxShadow: "0 18px 44px -10px rgba(15,23,42,0.2), 0 6px 18px -4px rgba(15,23,42,0.1)" }}
        className={cn(
          "relative flex min-h-[54px] w-full flex-col gap-2 rounded-[2rem] border bg-white p-2 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18),0_2px_12px_-2px_rgba(15,23,42,0.08)] sm:h-[64px] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-0 sm:pl-7 sm:pr-2",
          open ? "border-[#D0D0D0] ring-2 ring-[#E3F2FD]/80" : "border-[#E0E0E0]",
        )}
      >
        <div className="flex min-h-[44px] flex-1 items-center px-3 sm:min-h-0 sm:px-0 sm:pl-0">
          <Search
            className="mr-2 h-5 w-5 shrink-0 text-[#9CA3AF] sm:h-[26px] sm:w-[26px]"
            strokeWidth={1.65}
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-[15px] font-normal leading-snug text-[#212121] outline-none placeholder:text-[#9E9E9E] sm:py-2 sm:text-[18px]"
            placeholder="Enter Your Dream Destination!"
            aria-label="Destination search"
            aria-expanded={Boolean(showPanel)}
            aria-controls="hero-search-suggestions"
          />
        </div>
        <motion.button
          type="button"
          onClick={submit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mx-1 flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-[#EF6614] text-[15px] font-bold tracking-wide text-white shadow-[0_4px_14px_-2px_rgba(239,102,20,0.5)] transition-colors hover:bg-[#E65100] sm:mx-0 sm:ml-1.5 sm:h-[52px] sm:w-auto sm:min-w-[140px] sm:px-10 sm:text-[17px]"
        >
          Search
        </motion.button>
      </motion.div>

      {showPanel ? (
        <div
          id="hero-search-suggestions"
          className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white text-left shadow-[0_16px_48px_-8px_rgba(15,23,42,0.18),0_4px_16px_-4px_rgba(15,23,42,0.08)]"
          role="listbox"
          aria-label={showTrending ? "Top trending holiday destinations" : "Search suggestions"}
        >
          {showTrending ? (
            <>
              <div className="flex items-center gap-2 border-b border-[#F0F0F0] px-4 py-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={2} aria-hidden />
                <p className="text-sm font-bold text-[#212121]">
                  Top Trending Holiday Destinations
                </p>
              </div>
              <ul className="py-1">
                {TRENDING_HOLIDAY_DESTINATIONS.map((place) => (
                  <li key={place.label}>
                    <Link
                      href={place.href}
                      role="option"
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F5F7FA]"
                      onClick={() => setOpen(false)}
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#EEEEEE] bg-[#FAFAFA]">
                        <Image
                          src={place.image}
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          sizes="40px"
                        />
                      </span>
                      <span className="text-[15px] font-medium text-[#212121]">{place.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {showSearchResults ? (
            <div className="max-h-[min(70vh,22rem)] overflow-y-auto py-1">
              {destHits.length > 0 ? (
                <div className="border-b border-[#F3F4F6] pb-1">
                  <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Destinations
                  </p>
                  {destHits.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/destinations/${encodeURIComponent(d.slug)}`}
                      role="option"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#212121] transition-colors hover:bg-[#F5F7FA]"
                      onClick={() => setOpen(false)}
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {pkgHits.length > 0 ? (
                <div className="pt-1">
                  <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Packages
                  </p>
                  {pkgHits.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/packages/${encodeURIComponent(p.slug)}`}
                      role="option"
                      className="block px-4 py-2.5 text-sm font-medium text-[#212121] transition-colors hover:bg-[#F5F7FA]"
                      onClick={() => setOpen(false)}
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
