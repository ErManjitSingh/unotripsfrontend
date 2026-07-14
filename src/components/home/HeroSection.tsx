"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  Bus,
  Car,
  Grid3X3,
  Menu,
  Palmtree,
  Plane,
  Search,
  TicketCheck,
  TrendingUp,
  TrainFront,
  X,
} from "lucide-react";
import { HeroCinematicBackground } from "@/components/home/hero-cinematic-background";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { HolidayPackagesSearchBar, TrustBadgesBar } from "@/components/home/holiday-packages-search-bar";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";
import { TRAVEL_HOME_BRAND, TRAVEL_HOME_LOGO_SRC } from "@/lib/travel-home-brand";
import { cn } from "@/lib/utils";

export type HeroSectionProps = {
  searchCatalog: HeroSearchCatalog;
  className?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const mobileCategories = [
  { id: "holidays", label: "Holidays", href: "/packages", icon: Palmtree },
  { id: "hotels", label: "Hotels", href: "/hotels", icon: Building2 },
  { id: "flights", label: "Flights", href: "/flights", icon: Plane },
  { id: "trains", label: "Trains", href: "/trains", icon: TrainFront },
  { id: "more", label: "More", href: "/activities", icon: Grid3X3 },
];

const mobileMenuLinks = [
  { label: "Holiday Packages", href: "/packages", icon: Palmtree },
  { label: "Hotels", href: "/hotels", icon: Building2 },
  { label: "Activities", href: "/activities", icon: TicketCheck },
  { label: "Flights", href: "/flights", icon: Plane },
  { label: "Trains", href: "/trains", icon: TrainFront },
  { label: "Bus", href: "/bus", icon: Bus },
  { label: "Cabs", href: "/cabs", icon: Car },
];

const mobileFallbackDestinations = [
  {
    title: "Himachal",
    href: "/packages?q=Himachal",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
  },
  {
    title: "Kerala",
    href: "/packages?q=Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&q=80",
  },
  {
    title: "Goa",
    href: "/packages?q=Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80",
  },
  {
    title: "Kashmir",
    href: "/packages?q=Kashmir",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=500&q=80",
  },
];

export function TravelMobileTopShell({
  activeId = "holidays",
  showGreeting = true,
}: {
  activeId?: string;
  showGreeting?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative z-20 overflow-hidden bg-[#fbfaf8] pb-3 md:hidden">
      <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_82%_18%,rgba(234,88,12,0.18),transparent_34%),radial-gradient(circle_at_10%_10%,rgba(245,158,11,0.1),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fff7ed_62%,rgba(255,247,237,0)_100%)]" />

      <div className="relative mx-auto flex max-w-md flex-col px-4">
        <header className="flex h-[64px] items-center justify-between">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/55 text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.5)] backdrop-blur"
          >
            {menuOpen ? <X className="h-6 w-6" strokeWidth={1.9} /> : <Menu className="h-6 w-6" strokeWidth={1.9} />}
          </button>

          <Link
            href="/"
            className="relative flex h-11 w-[158px] items-center justify-center overflow-hidden rounded-2xl bg-white/65 px-3 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.55)] backdrop-blur-md"
          >
            <Image
              src={TRAVEL_HOME_LOGO_SRC}
              alt={TRAVEL_HOME_BRAND.name}
              fill
              className="object-contain p-1.5"
              sizes="150px"
              priority
            />
          </Link>

          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/55 text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.5)] backdrop-blur">
            <Bell className="h-[22px] w-[22px]" strokeWidth={1.9} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          </button>
        </header>

        {menuOpen && (
          <div className="absolute left-4 right-4 top-[66px] z-40 overflow-hidden rounded-[22px] border border-white bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-2 p-3">
              {mobileMenuLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl bg-orange-50/55 px-3 py-3 text-[13px] font-bold text-slate-700"
                >
                  <Icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.9} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-orange-100/70 p-3">
              <div className="mb-3 flex justify-center">
                <AuthNavActions variant="ease" combined onNavigate={() => setMenuOpen(false)} />
              </div>
              <Link
                href="/packages"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_-16px_rgba(234,88,12,0.9)]"
              >
                <Search className="h-4 w-4" />
                Search Packages
              </Link>
            </div>
          </div>
        )}

        {showGreeting && (
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-black leading-tight text-slate-900">Namaste, Explorer! 👋</h1>
              <p className="mt-1 text-[14px] font-medium text-slate-500">Where do you want to go next?</p>
            </div>
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-orange-100 shadow-[0_10px_24px_-12px_rgba(234,88,12,0.7)] ring-4 ring-white">
              <Image
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=160&q=80"
                alt=""
                fill
                className="object-cover"
                sizes="56px"
                unoptimized
              />
            </div>
          </div>
        )}

        <nav className={cn("flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", showGreeting ? "mt-5" : "mt-2")} aria-label="Travel categories">
          {mobileCategories.map(({ id, label, href, icon: Icon }) => {
            const active = id === activeId;
            return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex h-[76px] min-w-[76px] flex-col items-center justify-center gap-2 rounded-2xl border text-[12px] font-semibold shadow-[0_12px_28px_-18px_rgba(15,23,42,0.35)]",
                active
                  ? "border-orange-100 bg-white text-primary shadow-[0_14px_30px_-18px_rgba(234,88,12,0.8)]"
                  : "border-white bg-white/85 text-slate-500",
              )}
            >
              <Icon className={cn("h-7 w-7", active ? "text-primary" : "text-slate-500")} strokeWidth={1.8} />
              {label}
            </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

function MobileHomeHero({ searchCatalog }: { searchCatalog: HeroSearchCatalog }) {
  const destinationCards = mobileFallbackDestinations;

  return (
    <section className="relative z-20 overflow-hidden bg-[#fbfaf8] pb-5 md:hidden">
      <TravelMobileTopShell activeId="holidays" />
      <div className="relative mx-auto flex max-w-md flex-col px-4">
        <section className="mt-4 rounded-[24px] border border-white bg-white/90 p-4 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2.2} />
            <h2 className="text-[15px] font-black text-slate-900">Trending Destinations</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {destinationCards.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative h-[136px] min-w-[132px] overflow-hidden rounded-2xl bg-slate-200 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.8)]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="132px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <div className="rounded-full bg-black/35 px-3 py-2 text-white backdrop-blur-md">
                    <p className="text-[13px] font-black leading-none">{item.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_82%_35%,rgba(245,158,11,0.24),transparent_32%),linear-gradient(135deg,#fff7ed_0%,#ffedd5_100%)] p-5 shadow-[0_20px_48px_-30px_rgba(234,88,12,0.65)]">
          <div className="flex items-center justify-between gap-3">
            <div className="relative z-10">
              <p className="mb-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-primary">Weekend Ready</p>
              <h2 className="text-[22px] font-black leading-tight text-slate-950">Curated escapes from ₹9,999</h2>
              <p className="mt-1 max-w-[180px] text-[13px] font-medium text-slate-500">Hotels, transfers and sightseeing planned together.</p>
              <Link
                href="/packages?offer=exclusive"
                className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_24px_-12px_rgba(234,88,12,0.8)]"
              >
                View Packages
              </Link>
            </div>
            <div className="relative h-28 w-28 shrink-0">
              <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-amber-200/45 blur-xl" />
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=260&q=80"
                alt=""
                fill
                className="rounded-2xl object-cover mix-blend-multiply"
                sizes="112px"
                unoptimized
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export function HeroSection({ searchCatalog, className }: HeroSectionProps) {
  return (
    <>
    <MobileHomeHero searchCatalog={searchCatalog} />
    <section id="home-hero" className={cn("relative z-20 hidden min-h-[640px] w-full flex-col md:flex lg:h-svh lg:min-h-[680px] xl:min-h-[700px]", className)}>
      {/* Full-bleed cinematic slideshow */}
      <div className="absolute inset-0 overflow-hidden">
        <HeroCinematicBackground />
      </div>

      {/* Homepage nav is the shared source of truth for desktop pages. */}
      <HeroGlassNavbar activeId="holidays" showActiveUnderline={false} />

      {/* Content — fills remaining height, centered. pt- clears the now-fixed nav sitting on top. */}
      <div className="hero-content-stack relative z-30 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 pb-3 pt-16 sm:gap-4 sm:px-6 sm:pb-4 sm:pt-20 lg:px-8 max-[900px]:justify-start max-[900px]:gap-2 max-[900px]:pt-28">
        {/* Headline */}
        <motion.div initial="hidden" animate="show" className="flex flex-col items-center text-center">
          <motion.div custom={0} variants={fadeUp} className="mb-2 flex items-center gap-2 sm:mb-3">
            <span className="h-px w-8 bg-amber-300/60 sm:w-10" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-300 sm:text-[10px]">
              Incredible India
            </p>
            <span className="h-px w-8 bg-amber-300/60 sm:w-10" />
          </motion.div>

          <h1 className="max-w-3xl leading-[0.92]">
            <motion.span custom={0.1} variants={fadeUp} className="block text-2xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-4xl md:text-[44px] max-[900px]:text-4xl">
              Your Next
            </motion.span>
            <motion.span
              custom={0.22}
              variants={fadeUp}
              className="font-script block text-5xl leading-[1.05] text-amber-300 drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] sm:text-6xl md:text-7xl max-[900px]:text-[64px]"
            >
              Adventure
            </motion.span>
            <motion.span custom={0.34} variants={fadeUp} className="block text-2xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-4xl md:text-[44px] max-[900px]:text-4xl">
              Awaits
            </motion.span>
          </h1>

          <motion.p custom={0.46} variants={fadeUp} className="mt-2 max-w-md text-[12px] font-medium text-white/70 sm:mt-2.5 sm:text-sm max-[900px]:mt-1">
            Curated journeys across India&apos;s most breathtaking places — priced clearly, planned carefully.
          </motion.p>
        </motion.div>

        {/* Search card. Explicit z-20: Framer Motion's y-transform gives this
            its own stacking context, and without an explicit z-index here,
            the trust badges below (a later sibling, also transform-stacked)
            would paint over this card's dropdowns regardless of their own
            z-[200] — stacking context z-index only competes with siblings,
            not descendants of a differently-stacked sibling. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hero-search-shell relative z-20 w-full max-w-5xl max-[900px]:max-w-4xl"
        >
          <HolidayPackagesSearchBar catalog={searchCatalog} />
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="hero-trust-shell relative z-10 w-full max-w-5xl max-[900px]:max-w-4xl"
        >
          <TrustBadgesBar />
        </motion.div>
      </div>
    </section>
    </>
  );
}
