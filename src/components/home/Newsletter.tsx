"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type NewsletterProps = {
  className?: string;
};

export function Newsletter({ className }: NewsletterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("bg-surface py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-lift sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-12"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Insider list
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Join the private newsletter
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Seasonal fare drops, new suite openings, and invitation-only experiences —
              never spam, unsubscribe anytime.
            </p>
          </div>
          <form
            className="relative mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row lg:mt-0 lg:max-w-lg"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              required
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-2xl border-slate-200 bg-white"
              name="email"
            />
            <Button type="submit" variant="accent" className="h-12 rounded-2xl px-6">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
