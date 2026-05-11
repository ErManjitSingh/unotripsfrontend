"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { STATS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type StatsProps = {
  className?: string;
};

export function Stats({ className }: StatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [start, setStart] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, -40]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setStart(true);
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="international"
      className={cn("relative overflow-hidden py-20 sm:py-24", className)}
    >
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=70')] bg-cover bg-center opacity-25"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/92 to-white" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-slate-100 bg-white/80 p-8 shadow-glass backdrop-blur-xl sm:grid-cols-2 sm:p-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduceMotion ? 0 : 0.08 * i }}
              className="text-center"
            >
              <p className="font-display text-4xl font-bold text-primary sm:text-5xl">
                {start ? (
                  <CountUp
                    end={s.value}
                    duration={2.2}
                    decimals={"decimals" in s ? (s.decimals as number) : 0}
                    suffix={s.suffix}
                    preserveValue
                  />
                ) : (
                  <span>0{s.suffix}</span>
                )}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-600">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
