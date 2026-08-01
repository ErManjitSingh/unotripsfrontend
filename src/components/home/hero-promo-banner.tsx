"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Camera,
  CarFront,
  ChevronLeft,
  ChevronRight,
  FileText,
  Facebook,
  Hotel,
  Instagram,
  Linkedin,
  Plane,
  UtensilsCrossed,
  Youtube,
} from "lucide-react";

const HOTEL_INCLUSIONS = [
  { icon: Plane, label: "Flight" },
  { icon: Hotel, label: "Hotel" },
  { icon: UtensilsCrossed, label: "Meal" },
  { icon: Camera, label: "Sightseeing" },
  { icon: FileText, label: "Visa" },
];

const BANNER_SHELL =
  "group relative block h-[220px] min-w-full w-full overflow-hidden rounded-[22px] border border-[#ffc5a7] bg-[#ffe6c9] shadow-[0_18px_42px_-24px_rgba(15,23,42,0.5)] ring-1 ring-orange-100 transition-all duration-300 hover:border-primary/35 hover:shadow-[0_8px_32px_-6px_rgba(234,88,12,0.18),0_4px_12px_rgba(15,23,42,0.08)] sm:h-[190px] sm:rounded-[1.25rem] md:h-[198px] md:border-2";

function CabsPromoSlide() {
  return (
    <Link href="/cabs" className={BANNER_SHELL}>
      <div className="absolute inset-0 bg-[#ffe6c9]" aria-hidden>
        {/* Keep cars to the right so copy never sits on top of them on mobile. */}
        <div
          className="absolute inset-y-0 right-0 w-[52%] overflow-hidden sm:w-[68%]"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 42%, #000 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, #000 42%, #000 100%)",
          }}
        >
          <Image
            src="/images/cabs/cars-banner-cropped.png"
            alt=""
            fill
            className="object-cover object-[82%_58%] transition-transform duration-700 group-hover:scale-[1.02] sm:object-[68%_54%]"
            sizes="(max-width: 640px) 52vw, 68vw"
            priority
          />
        </div>
        <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-[#ffe6c9] via-[#ffe6c9]/95 to-transparent sm:w-[48%]" />
      </div>

      <div className="relative flex h-full items-center px-4 py-4 sm:px-7 sm:py-5 md:px-9">
        <div className="min-w-0 max-w-[56%] sm:max-w-[54%] md:max-w-[50%]">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-sm">
            <CarFront className="h-3 w-3" aria-hidden />
            UNO Cabs
          </span>
          <h2 className="text-[20px] font-black leading-[1.08] tracking-tight text-[#252b35] sm:text-[26px] md:text-[31px]">
            Your ride is <span className="text-[#ef6614]">ready.</span>
          </h2>
          <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[#665953] sm:mt-2 sm:max-w-sm sm:text-[13px] sm:leading-relaxed">
            <span className="sm:hidden">Verified partner quotes for every journey.</span>
            <span className="hidden sm:inline">A comfortable UNO Cabs ride and verified partner quotes for every journey.</span>
          </p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-[11px] font-extrabold text-white shadow-[0_12px_28px_-10px_rgba(239,102,20,0.65)] transition group-hover:bg-[#e05a0f] sm:mt-3 sm:px-5 sm:py-2.5 sm:text-[13px]">
            Get quotes
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function VietnamPromoSlide() {
  return (
    <Link href="/destinations/vietnam" className={BANNER_SHELL}>
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80"
          alt=""
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1320px) 100vw, 1320px"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f]/96 via-[#07111f]/78 to-[#07111f]/25 sm:from-[#07111f]/90 sm:via-[#07111f]/55 sm:to-[#07111f]/10" />
      </div>

      <div className="relative flex h-full flex-col justify-between gap-2 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-lg">
            Unlock <span className="text-orange-400">FREE*</span> Hotel Upgrades
          </p>
          <p className="text-[13px] font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-base">
            on Vietnam Group Departures
          </p>
          <p className="mt-1.5 text-[12px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:mt-2 sm:text-[13px]">
            Starting from <span className="text-sm text-white">₹45,999*</span>
          </p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-3 sm:flex-wrap sm:gap-x-3 sm:gap-y-1 sm:overflow-visible">
            {HOTEL_INCLUSIONS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex shrink-0 items-center gap-1 rounded-full bg-[#07111f]/70 px-2 py-1 text-[10px] font-semibold text-white shadow-sm sm:text-[11px]"
              >
                <Icon className="h-3 w-3 shrink-0" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-white shadow-md transition-all duration-200 group-hover:bg-primary/90 group-hover:shadow-lg sm:px-6 sm:py-3 sm:text-sm md:px-5 md:py-2 md:font-semibold">
            Book Now
          </span>
          <p className="rounded bg-[#07111f]/55 px-1.5 py-0.5 text-[9px] font-medium leading-snug text-white sm:text-[10px] sm:text-right">
            <span className="sm:hidden">*T&amp;Cs Apply</span>
            <span className="hidden sm:inline">*T&amp;Cs Apply | Only Hanoi – Da&nbsp;Nang Flight included</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

function InstagramPromoSlide() {
  return (
    <div className={BANNER_SHELL}>
      <Image src="/images/holiday-packages-hero.png" alt="Mountain road and lake" fill sizes="(max-width: 1320px) 100vw, 1320px" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#071426]/66 to-[#091029]/25" />
      <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-[#071426]/75 to-transparent" />

      <div className="relative h-full px-5 py-3 sm:px-7 md:px-9">
        <div className="flex h-full max-w-[52%] flex-col justify-between py-1 sm:max-w-[48%]">
          <div>
            <div className="mb-1.5 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/75"><span className="h-0.5 w-5 bg-[#ef8a24]" />UNO Trips / everywhere</div>
            <h2 className="text-[21px] font-black leading-[.95] tracking-[-.045em] text-white sm:text-[25px] md:text-[29px]">Travel isn&apos;t a feed.<br /><em className="font-serif font-semibold text-[#ff9a42]">It&apos;s a feeling.</em></h2>
          </div>
          <p className="max-w-sm text-[10px] font-medium leading-snug text-white/80 sm:text-[11px]">Follow the places, people and little detours that make every trip yours.</p>
          <a href="https://www.instagram.com/uno_trips/" target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a20] to-[#ee3e87] px-3.5 py-2 text-[10px] font-extrabold text-white shadow-[0_12px_28px_-10px_rgba(0,0,0,.8)] sm:px-4 sm:text-[11px]">Find UNO Trips everywhere <span aria-hidden>↗</span></a>
        </div>

        <div className="absolute bottom-2.5 right-3 top-2.5 hidden w-[45%] flex-col rounded-[18px] border border-white/20 bg-[#10142f]/72 p-3 shadow-[0_20px_45px_-18px_rgba(0,0,0,.9)] backdrop-blur-md sm:flex">
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-full bg-[conic-gradient(#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[3px]"><div className="grid h-full w-full place-items-center rounded-full bg-[#090b11] text-[22px] font-black text-[#ff9b2f]">U</div><span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#2997f2] text-[10px] font-black text-white">✓</span></div>
            <div><p className="text-[15px] font-black text-white">uno_trips <span className="text-white/55">· 16K explorers</span></p><p className="mt-1 text-[10px] font-medium text-white/65">Safar khoobsurat hai ✈️</p></div>
          </div>
          <div className="mt-auto border-t border-white/15 pt-2.5">
            <div className="flex items-center justify-between">
              <a href="https://www.instagram.com/uno_trips/" target="_blank" rel="noreferrer" aria-label="UNO Trips on Instagram" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#ffb454] transition hover:bg-white/20"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.facebook.com/profile.php?id=61585094895115" target="_blank" rel="noreferrer" aria-label="UNO Trips on Facebook" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#79aaff] transition hover:bg-white/20"><Facebook className="h-5 w-5" /></a>
              <a href="https://www.linkedin.com/in/uno-trips-4b05833b1" target="_blank" rel="noreferrer" aria-label="UNO Trips on LinkedIn" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#6bc8ff] transition hover:bg-white/20"><Linkedin className="h-5 w-5" /></a>
              <a href="https://www.youtube.com/@UnoTrips" target="_blank" rel="noreferrer" aria-label="UNO Trips on YouTube" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#ff7e77] transition hover:bg-white/20"><Youtube className="h-5 w-5" /></a>
              <span className="ml-2 text-[10px] font-black tracking-[.08em] text-white/85">@UNO_TRIPS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Promo strip directly below the home hero — carousel of product banners. */
export function HeroPromoBanner() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % 3), 5500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const showPrevious = () => setActive((current) => (current + 2) % 3);
  const showNext = () => setActive((current) => (current + 1) % 3);

  return (
    <aside className="relative z-0 mb-5 mt-2 w-full bg-white md:mb-6 md:mt-6">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-4 lg:px-6">
        <div className="relative">
          <div className="w-full overflow-hidden rounded-[22px] bg-[#ffe6c9] sm:rounded-[1.25rem]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {active === 0 ? <CabsPromoSlide /> : active === 1 ? <VietnamPromoSlide /> : <InstagramPromoSlide />}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-2 sm:flex md:px-3">
            <button
              type="button"
              onClick={showPrevious}
              className="pointer-events-auto -translate-x-1/2 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/35 text-white shadow-md backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Previous promo"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="pointer-events-auto translate-x-1/2 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/35 text-white shadow-md backdrop-blur-sm transition hover:bg-black/50"
              aria-label="Next promo"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-1.5" role="tablist" aria-label="Promo slides">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-label={`Show promo ${index + 1}`}
                onClick={() => setActive(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
