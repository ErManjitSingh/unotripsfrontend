"use client";

/**
 * src/components/home/hero-glass-navbar.tsx
 *
 * Homepage-only floating navbar. Persistent for the whole page (fixed to the
 * top of the viewport, not just the hero) — starts as a semi-transparent
 * glass pill over the cinematic hero image, then smoothly resolves to a
 * solid white bar once the visitor scrolls past it. Same real nav links,
 * same auth actions, same "List Your Property" CTA as the site-wide Navbar,
 * just a different shell. The shared `Navbar` component (used on every other
 * page) is untouched; this exists only so the hero can look the way it
 * should without changing navigation anywhere else on the site.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bus, Building2, Car, Menu, Palmtree,
  Plane, TicketCheck, TrainFront, X,
} from "lucide-react";
import { motion } from "framer-motion";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import { PARTNER_PORTAL_URL } from "@/lib/constants";
import { TRAVEL_HOME_BRAND, TRAVEL_HOME_LOGO_SRC } from "@/lib/travel-home-brand";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string; href: string; icon: typeof Plane };

const NAV_ITEMS: NavItem[] = [
  { id: "holidays",   label: "Holidays",   href: "/",           icon: Palmtree },
  { id: "hotels",     label: "Hotels",     href: "/hotels",     icon: Building2 },
  { id: "activities", label: "Activities", href: "/activities", icon: TicketCheck },
  { id: "flights",    label: "Flights",    href: "/flights",    icon: Plane },
  { id: "trains",     label: "Trains",     href: "/trains",     icon: TrainFront },
  { id: "bus",        label: "Bus",        href: "/bus",        icon: Bus },
  { id: "cabs",       label: "Cabs",       href: "/cabs",       icon: Car },
];

const SOON_IDS = new Set(["flights", "trains", "bus", "cabs"]);

export type HeroGlassNavbarProps = {
  activeId?: string;
  solid?: boolean;
};

export function HeroGlassNavbar({ activeId = "holidays", solid = false }: HeroGlassNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(TRAVEL_HOME_LOGO_SRC);

  useEffect(() => {
    if (solid) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  const resolvedScrolled = solid || scrolled;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 max-[900px]:pt-3">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1320px] items-center gap-2 rounded-2xl border px-3 py-2 transition-all duration-500 sm:gap-3 sm:px-4 max-[900px]:max-w-[1180px] max-[900px]:py-1.5",
          resolvedScrolled
            ? "border-slate-200/80 bg-white/95 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md"
            : "border-white/20 bg-white/[0.14] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-xl",
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center rounded-xl transition-all",
            !resolvedScrolled && "bg-white/95 px-2 py-1.5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.3)]",
          )}
        >
          <span className="relative block h-8 w-[100px] shrink-0 sm:h-9 sm:w-[116px] max-[900px]:h-8 max-[900px]:w-[104px]">
            <Image
              src={logoSrc}
              alt={TRAVEL_HOME_BRAND.name}
              fill
              className="object-contain object-left"
              sizes="116px"
              priority
              onError={() => setLogoSrc("/images/homelogo.webp")}
            />
          </span>
        </Link>

        <nav className="mx-auto hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1" aria-label="Services">
          {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
            const active = id === activeId;
            return (
              <motion.div key={id} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className="relative">
                <Link
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold tracking-wide transition-colors xl:px-4 max-[900px]:gap-1.5 max-[900px]:px-2.5 max-[900px]:py-2 max-[900px]:text-[13px]",
                    resolvedScrolled
                      ? active ? "text-primary" : "text-[#424242] hover:text-primary"
                      : active ? "text-white" : "text-white/75 hover:text-white",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                  {label}
                  {active && (
                    <motion.span
                      layoutId="hero-nav-underline"
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-[2.5px] rounded-full",
                        resolvedScrolled ? "bg-primary" : "bg-amber-300 shadow-[0_0_8px_1px_rgba(252,211,77,0.7)]",
                      )}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
                {SOON_IDS.has(id) && (
                  <span className="pointer-events-none absolute -right-1.5 -top-1.5 whitespace-nowrap rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-bold leading-none tracking-wide text-white shadow-sm">
                    Soon
                  </span>
                )}
              </motion.div>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href={PARTNER_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "hidden items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition lg:inline-flex max-[900px]:px-3 max-[900px]:py-1.5 max-[900px]:text-[12px]",
              resolvedScrolled
                ? "border-slate-200 text-[#424242] hover:border-primary/40 hover:text-primary"
                : "border-white/20 text-white/85 hover:border-white/40 hover:bg-white/10",
            )}
          >
            <Building2 className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
            List Your Property
            <span className={cn("text-[10px] font-bold uppercase", resolvedScrolled ? "text-primary" : "text-amber-300")}>Free</span>
          </Link>

          <AuthNavActions variant={resolvedScrolled ? "ease" : "overlay"} combined className="hidden sm:flex" />

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition lg:hidden",
              resolvedScrolled ? "text-[#424242] hover:bg-slate-100" : "text-white hover:bg-white/10",
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 w-full max-w-[1400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:hidden">
          <nav className="grid grid-cols-4 gap-1 p-3" aria-label="Services">
            {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => (
              <Link
                key={id}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[11px] font-semibold",
                  id === activeId ? "bg-orange-50 text-primary" : "text-[#424242]",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                {label}
                {SOON_IDS.has(id) && (
                  <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-red-500 px-1 py-px text-[7px] font-bold leading-none text-white">Soon</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-3">
            <AuthNavActions variant="ease" combined onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
