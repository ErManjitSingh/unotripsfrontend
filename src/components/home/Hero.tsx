"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Flame, Landmark, Building2, Palmtree, Sun, Waves, Flag, Sparkles } from "lucide-react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import { Button } from "@/components/ui/button";
import { CATEGORY_STRIP, HERO_COLLAGE, HERO_SLIDES } from "@/lib/constants";
import { SearchBar } from "@/components/home/SearchBar";
import { cn } from "@/lib/utils";

const iconMap = {
  flame: Flame,
  landmark: Landmark,
  torii: Sparkles,
  building2: Building2,
  palmtree: Palmtree,
  sun: Sun,
  waves: Waves,
  flag: Flag,
} as const;

export type HeroProps = {
  className?: string;
};

export function Hero({ className }: HeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "relative flex min-h-[100svh] flex-col overflow-hidden bg-white pb-10 pt-28 md:pb-14 md:pt-32",
        className,
      )}
    >
      {/* Cinematic background slider — low contrast wash like a premium reel */}
      <div className="pointer-events-none absolute inset-0">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          loop
          speed={1200}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          className="h-full w-full"
        >
          {HERO_SLIDES.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-[100svh] w-full">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={slide.id === "1"}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/92 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,76,146,0.08),transparent_55%)]" />
      </div>

      {/* Soft landmark silhouettes — reference-style bottom texture */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FF7A00' d='M40 100 L70 40 L100 100 Z M130 100 L180 30 L230 100 Z M300 100 L360 20 L420 100 Z M520 100 L560 50 L600 100 Z M700 100 L760 35 L820 100 Z M900 100 L940 60 L980 100 Z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom",
          backgroundSize: "1200px 120px",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-1 flex-col items-center justify-center py-8">
          {/* Floating collage — Thrillophilia-style asymmetric tiles */}
          {HERO_COLLAGE.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: reduceMotion ? 0 : 0.08 * i,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className={cn(
                "pointer-events-none absolute z-0 overflow-hidden rounded-2xl shadow-[0_18px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/5",
                tile.className,
              )}
            >
              <motion.div
                animate={
                  reduceMotion
                    ? undefined
                    : { y: [0, -6, 0], rotate: [0, i % 2 === 0 ? 1.2 : -1.2, 0] }
                }
                transition={{
                  duration: 6 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative h-full w-full"
              >
                <Image
                  src={tile.src}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 768px) 160px, 220px"
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          ))}

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-3xl text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Curated multi-day journeys
            </p>
            <h1 className="font-display text-balance text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
              Discover The World With{" "}
              <span className="text-accent">Premium Travel</span> Experiences
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
              Luxury tours, curated experiences, unforgettable journeys — crafted
              by specialists who obsess over every detail.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="default" asChild>
                <a href="#packages">Explore Packages</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">Plan Your Trip</a>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="relative z-10 mt-4"
        >
          <SearchBar />
        </motion.div>

        {/* Category strip — reference-style horizontal chips */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="relative z-10 mt-10"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1 overflow-hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 pt-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORY_STRIP.map((cat) => {
                  const Icon = iconMap[cat.icon as keyof typeof iconMap] ?? Sparkles;
                  const active = cat.id === "explore";
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      className={cn(
                        "group relative flex min-w-[92px] flex-col items-center gap-2 rounded-2xl px-3 py-2 text-center transition-all",
                        active && "text-accent",
                      )}
                    >
                      {cat.trending && (
                        <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                          Trending
                        </span>
                      )}
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm transition-transform group-hover:-translate-y-0.5",
                          active
                            ? "border-accent/40 text-accent"
                            : "border-slate-100 text-slate-500 group-hover:border-primary/20 group-hover:text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium text-slate-600",
                          active && "font-semibold text-accent",
                        )}
                      >
                        {cat.label}
                      </span>
                      {active && (
                        <span className="h-1 w-10 rounded-full bg-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary/30 hover:text-primary md:flex"
              aria-label="Scroll categories"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
