"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronDown, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EaseMenuIcon } from "@/components/layout/ease-menu-icon";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";
import { PARTNER_PORTAL_URL, SITE } from "@/lib/constants";
import type { EaseMenuIconId } from "@/lib/ease-menu-sprite";
import { PAGE_CONTAINER_CLASS, PAGE_MARGIN_X_CLASS, PAGE_MAX_WIDTH_CLASS } from "@/lib/page-gutter";
import { TRAVEL_HOME_BRAND, TRAVEL_HOME_LOGO_SRC } from "@/lib/travel-home-brand";
import { cn } from "@/lib/utils";

export type NavbarProps = {
  /** `overlay` = absolute on hero (legacy). `solid` = sticky inner pages. `ease` = EaseMyTrip-style white bar (home). */
  variant?: "overlay" | "solid" | "ease";
  /** Highlighted main-nav tab when `variant="ease"`. */
  easeActiveNavId?: string;
};

type EaseNavItem = {
  id: EaseMenuIconId;
  label: string;
  href: string;
};

const LIST_PROPERTY_CTA = {
  href: PARTNER_PORTAL_URL,
  title: "List Your Property",
  badge: "Free",
} as const;

const EASE_MAIN_NAV: EaseNavItem[] = [
  { id: "flights", label: "FLIGHTS", href: "/flights" },
  { id: "hotels", label: "HOTELS", href: "/hotels" },
  { id: "trains", label: "TRAINS", href: "/trains" },
  { id: "bus", label: "BUS", href: "/bus" },
  { id: "holidays", label: "HOLIDAYS", href: "/" },
  { id: "cabs",       label: "CABS",       href: "/cabs"      },
  { id: "activities", label: "Activities", href: "/activities" },
  { id: "more", label: "More", href: "#more" },
];

export function Navbar({
  variant = "solid",
  easeActiveNavId = "holidays",
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [easeLogoSrc, setEaseLogoSrc] = useState(TRAVEL_HOME_LOGO_SRC);
  const isOverlay = variant === "overlay";
  const isEase = variant === "ease";

  const inrBlock = (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border text-xs font-semibold sm:text-sm",
        isOverlay
          ? "border-white/25 bg-black/25 px-2.5 py-1.5 text-white backdrop-blur-sm"
          : isEase
            ? "h-7 border-[#E0E0E0] bg-white px-2 text-[11px] font-normal text-[#212121]"
            : "border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 shadow-sm",
      )}
      role="group"
      aria-label="Currency"
    >
      <Image
        src="https://flagcdn.com/w20/in.png"
        alt=""
        width={18}
        height={12}
        className="h-3 w-[18px] shrink-0 rounded-[1px] object-cover"
        aria-hidden
      />
      <span>INR</span>
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5",
          isOverlay
            ? "text-white/70"
            : isEase
              ? "text-[#9E9E9E]"
              : "text-slate-400",
        )}
        aria-hidden
      />
    </div>
  );

  const authRow = <AuthNavActions variant={variant} />;

  if (isEase) {
    /** Thin strokes — utility icons (headset, chevron). */
    const iconStroke = 1.15;

    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#EEEEEE] bg-white text-[#212121] antialiased">
        <div className={cn("mx-auto flex w-full flex-col", PAGE_MAX_WIDTH_CLASS)}>
          <div className={cn("flex h-[68px] min-h-[68px] max-h-[72px] items-center gap-2 sm:h-[72px] sm:min-h-[72px] sm:max-h-[72px] sm:gap-3", PAGE_MARGIN_X_CLASS)}>
            <Link href="/" className="flex shrink-0 items-center">
              <span className="relative block h-9 w-[108px] shrink-0 sm:h-10 sm:w-[124px]">
                <Image
                  src={easeLogoSrc}
                  alt={TRAVEL_HOME_BRAND.name}
                  fill
                  className="object-contain object-left"
                  sizes="(max-width: 640px) 108px, 124px"
                  priority
                  onError={() => setEaseLogoSrc("/images/homelogo.webp")}
                />
              </span>
            </Link>

            <nav
              className="mx-auto hidden min-w-0 flex-1 items-center justify-center gap-0.5 px-0.5 lg:flex xl:gap-1"
              aria-label="Services"
            >
              {EASE_MAIN_NAV.map(({ id, label, href }) => {
                const active = id === easeActiveNavId;
                return (
                  <motion.div key={id} whileHover={{ y: -0.5 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href={href}
                      className={cn(
                        "flex min-w-[3rem] shrink-0 flex-col items-center gap-0.5 rounded-md px-1.5 py-1 text-[9px] font-semibold uppercase leading-none tracking-wide text-black transition-colors sm:min-w-[3.25rem] sm:px-2 sm:py-1.5 sm:text-[10px]",
                        active
                          ? "border border-[#FFCC80] bg-[#FFF3E0] text-black"
                          : "border border-transparent text-black hover:bg-[#F5F5F5]",
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden sm:h-11 sm:w-11">
                        <EaseMenuIcon
                          id={id}
                          active={active}
                          size={28}
                          label={label}
                        />
                      </span>
                      <span className="whitespace-nowrap">{label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-2.5">
              <Link
                href={LIST_PROPERTY_CTA.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-[#FFE0B2] hover:bg-[#FFF8F0] lg:inline-flex"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1976D2] transition-colors group-hover:bg-[#BBDEFB]">
                  <Building2
                    className="h-4 w-4"
                    strokeWidth={iconStroke}
                    aria-hidden
                  />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="whitespace-nowrap text-[12px] font-semibold text-[#212121]">
                    {LIST_PROPERTY_CTA.title}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-[#EF6614]">
                    {LIST_PROPERTY_CTA.badge}
                  </span>
                </span>
              </Link>
              <div className="hidden sm:block">{inrBlock}</div>
              <AuthNavActions variant="ease" className="hidden sm:flex" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-[#616161] hover:bg-[#F5F5F5] lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center border-t border-[#EEEEEE] py-2 lg:hidden">
            <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max items-center gap-0.5 px-3 pr-2">
                {EASE_MAIN_NAV.map(({ id, label, href }) => {
                  const active = id === easeActiveNavId;
                  return (
                    <Link
                      key={id}
                      href={href}
                      className={cn(
                        "flex shrink-0 flex-col items-center gap-px rounded-md px-1 py-0.5 text-[8px] font-semibold uppercase leading-tight tracking-wide text-black",
                        active
                          ? "border border-[#FFCC80] bg-[#FFF3E0] text-black"
                          : "border border-transparent text-black",
                      )}
                    >
                      <EaseMenuIcon id={id} active={active} size={24} label={label} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {open ? (
            <div className="border-t border-[#EEEEEE] bg-white px-4 py-4 lg:hidden">
              <div className={cn("mx-auto flex w-full flex-col gap-3", PAGE_MAX_WIDTH_CLASS, PAGE_MARGIN_X_CLASS)}>
                <Link
                  href={LIST_PROPERTY_CTA.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-lg border border-[#FFE0B2] bg-[#FFF8F0] px-3 py-3 text-[#212121] transition-colors hover:bg-[#FFF3E0]"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1976D2]">
                    <Building2 className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-[13px] font-semibold">
                      {LIST_PROPERTY_CTA.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wide text-[#EF6614]">
                      {LIST_PROPERTY_CTA.badge} — partner with {TRAVEL_HOME_BRAND.name}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-[#9E9E9E]" aria-hidden />
                </Link>
                <div className="flex items-center justify-between gap-2">
                  {inrBlock}
                </div>
                <AuthNavActions variant="ease" onNavigate={() => setOpen(false)} />
              </div>
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "z-50 w-full",
        isOverlay
          ? "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent pb-10 pt-3 sm:pt-4"
          : "sticky top-0 border-b border-slate-200/80 bg-white/95 py-2 shadow-sm backdrop-blur-md sm:py-2.5",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center gap-2 sm:gap-4",
          PAGE_MAX_WIDTH_CLASS,
          PAGE_MARGIN_X_CLASS,
          isOverlay && "pointer-events-auto",
        )}
      >
        <Link
          href="/"
          className={cn(
            "relative flex h-9 w-[128px] shrink-0 items-center py-1 sm:h-10 sm:w-[148px] md:w-[160px]",
            isOverlay && "drop-shadow-md",
          )}
        >
          <Image
            src={SITE.logoUrl}
            alt="UNO Trips — Travel made simple"
            fill
            className="object-contain object-left"
            sizes="(max-width: 640px) 128px, 160px"
            priority
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">{inrBlock}</div>
          <div className="hidden sm:flex">{authRow}</div>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 sm:hidden",
              isOverlay
                ? "text-white hover:bg-white/15"
                : "text-slate-700 hover:bg-slate-100",
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "pointer-events-auto border-t px-4 py-4 sm:hidden",
            isOverlay
              ? "border-white/20 bg-black/60 backdrop-blur-md"
              : "border-slate-200 bg-white",
          )}
        >
          <div className={cn("mx-auto flex w-full flex-col gap-4", PAGE_MAX_WIDTH_CLASS, PAGE_MARGIN_X_CLASS)}>
            <div className="flex items-center justify-between gap-2">
              {inrBlock}
            </div>
            <div className="flex flex-col gap-2">{authRow}</div>
            <p
              className={cn(
                "text-center text-[10px] leading-snug",
                isOverlay ? "text-white/60" : "text-muted-foreground",
              )}
            >
              {SITE.tagline}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
