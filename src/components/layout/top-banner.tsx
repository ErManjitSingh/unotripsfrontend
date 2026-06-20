"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const OFFERS = [
  {
    label: "FLASH SALE",
    text: "Get ₹2,000 OFF on all holiday packages",
    cta: "Grab Deal",
    href: "/packages",
  },
  {
    label: "GOA SPECIAL",
    text: "Goa packages starting at just ₹9,999/person",
    cta: "Book Now",
    href: "/packages",
  },
  {
    label: "HOTEL DEAL",
    text: "Up to 40% off on hotel bookings this week only",
    cta: "View Hotels",
    href: "/hotels",
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function TopBanner() {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const targetRef = useRef(0);

  useEffect(() => {
    if (sessionStorage.getItem("uno_top_banner_dismissed")) return;
    setVisible(true);
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    targetRef.current = midnight.getTime();

    const tick = () => {
      const diff = Math.max(0, targetRef.current - Date.now());
      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const go = (dir: 1 | -1) => {
    setFade(false);
    setTimeout(() => {
      setIdx((i) => (i + dir + OFFERS.length) % OFFERS.length);
      setFade(true);
    }, 200);
  };

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => go(1), 4500);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const offer = OFFERS[idx];

  return (
    <div className="border-b border-orange-100 bg-orange-50 py-2">
      <div className="flex w-full items-center gap-2 px-4 sm:gap-3 sm:px-6">

        {/* Prev */}
        <button onClick={() => go(-1)} className="hidden shrink-0 text-orange-300 transition hover:text-orange-500 sm:block">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Center content */}
        <div
          className="flex flex-1 items-center justify-between gap-3"
          style={{ opacity: fade ? 1 : 0, transition: "opacity 0.2s ease" }}
        >
          {/* Label + text */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="shrink-0 rounded bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
              {offer.label}
            </span>
            <span className="truncate text-[12px] font-medium text-orange-900 sm:text-[13px]">
              {offer.text}
            </span>
          </div>

          {/* Timer */}
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <Clock className="h-3 w-3 text-orange-400" />
            <span className="text-[11px] text-orange-500">Ends in</span>
            <span className="font-mono text-[12px] font-bold tabular-nums text-orange-700">
              {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
            </span>
          </div>

          {/* CTA */}
          <Link
            href={offer.href}
            className="hidden shrink-0 rounded-full bg-orange-500 px-4 py-1 text-[11px] font-bold text-white transition hover:bg-orange-600 sm:block"
          >
            {offer.cta} →
          </Link>
        </div>

        {/* Next */}
        <button onClick={() => go(1)} className="hidden shrink-0 text-orange-300 transition hover:text-orange-500 sm:block">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Dot indicators */}
        <div className="hidden items-center gap-1 sm:flex">
          {OFFERS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 200); }}
              className="rounded-full transition-all"
              style={{
                height: "6px",
                width: i === idx ? "16px" : "6px",
                background: i === idx ? "#F97316" : "#FED7AA",
              }}
            />
          ))}
        </div>

        {/* Mobile: timer */}
        <span className="font-mono text-[11px] font-bold tabular-nums text-orange-600 sm:hidden">
          {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
        </span>

        {/* Dismiss */}
        <button
          onClick={() => { setVisible(false); sessionStorage.setItem("uno_top_banner_dismissed", "1"); }}
          className="shrink-0 text-orange-300 transition hover:text-orange-600"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
