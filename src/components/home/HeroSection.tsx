"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeroFloatingChrome } from "@/components/home/hero-floating-chrome";
import { HeroSplitBackground } from "@/components/home/hero-split-background";
import { HERO_DESTINATION_SLIDES } from "@/lib/ease-hero-images";
import type { HeroSearchCatalog } from "@/lib/hero-search-catalog";
import { cn } from "@/lib/utils";

export type HeroSectionProps = {
  searchCatalog: HeroSearchCatalog;
  className?: string;
};

const INTERVAL_MS = 2800;

/**
 * EaseMyTrip-style hero — rotating destination + matching banner image,
 * search, category pills half on / half below banner edge.
 */
export function HeroSection({ searchCatalog, className }: HeroSectionProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_DESTINATION_SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const destination = HERO_DESTINATION_SLIDES[index].name;

  return (
    <section
      className={cn(
        "relative z-20 w-full overflow-visible bg-white pb-7 sm:pb-8",
        className,
      )}
    >
      <div className="relative h-[350px] w-full overflow-visible">
        <div className="absolute inset-0 overflow-hidden">
          <HeroSplitBackground activeIndex={index} />
        </div>

        {/* Headings — upper hero, above search */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-[46%] flex-col items-center justify-end px-4 pb-1 text-center sm:px-6">
          <h1 className="font-script max-w-4xl text-[3.5rem] font-normal leading-[1.05] tracking-wide text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)]">
            <span className="inline-flex flex-wrap items-baseline justify-center gap-[0.25em]">
              <span className="relative inline-block min-w-[8.5rem] text-center sm:min-w-[10rem]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={destination}
                    initial={{ opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {destination}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span>Tour Packages</span>
            </span>
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] sm:mt-2 sm:text-base md:text-lg">
            Where Every Experience Counts!
          </p>
        </div>

        <HeroFloatingChrome catalog={searchCatalog} />
      </div>
    </section>
  );
}
