"use client";

import { motion } from "framer-motion";
import { HeroCinematicBackground } from "@/components/home/hero-cinematic-background";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { HolidayPackagesSearchBar, TrustBadgesBar } from "@/components/home/holiday-packages-search-bar";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";
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

export function HeroSection({ searchCatalog, className }: HeroSectionProps) {
  return (
    <section id="home-hero" className={cn("relative z-20 flex h-dvh min-h-[700px] w-full flex-col", className)}>
      {/* Full-bleed cinematic slideshow */}
      <div className="absolute inset-0 overflow-hidden">
        <HeroCinematicBackground />
      </div>

      {/* Floating nav — persistent across the whole page, glass over the hero → solid once scrolled */}
      <HeroGlassNavbar activeId="holidays" />

      {/* Content — fills remaining height, centered. pt- clears the now-fixed nav sitting on top. */}
      <div className="relative z-30 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-3 pb-3 pt-16 sm:gap-4 sm:px-6 sm:pb-4 sm:pt-20 lg:px-8">
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
            <motion.span custom={0.1} variants={fadeUp} className="block text-2xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-4xl md:text-[44px]">
              Your Next
            </motion.span>
            <motion.span
              custom={0.22}
              variants={fadeUp}
              className="font-script block text-5xl leading-[1.05] text-amber-300 drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] sm:text-6xl md:text-7xl"
            >
              Adventure
            </motion.span>
            <motion.span custom={0.34} variants={fadeUp} className="block text-2xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] sm:text-4xl md:text-[44px]">
              Awaits
            </motion.span>
          </h1>

          <motion.p custom={0.46} variants={fadeUp} className="mt-2 max-w-md text-[12px] font-medium text-white/70 sm:mt-2.5 sm:text-sm">
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
          className="relative z-20 w-full max-w-5xl"
        >
          <HolidayPackagesSearchBar catalog={searchCatalog} />
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 w-full max-w-5xl"
        >
          <TrustBadgesBar />
        </motion.div>
      </div>
    </section>
  );
}
