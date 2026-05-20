"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { HERO_DESTINATION_SLIDES } from "@/lib/ease-hero-images";

export type HeroSplitBackgroundProps = {
  activeIndex: number;
};

/** Full-width hero banner — crossfades with rotating destination headline. */
export function HeroSplitBackground({ activeIndex }: HeroSplitBackgroundProps) {
  const slide =
    HERO_DESTINATION_SLIDES[activeIndex % HERO_DESTINATION_SLIDES.length] ??
    HERO_DESTINATION_SLIDES[0];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1a1208]" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.name}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-black/20 to-black/50" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/40 via-transparent to-black/25" />
    </div>
  );
}
