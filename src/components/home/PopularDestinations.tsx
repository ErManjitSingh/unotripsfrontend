"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DestinationCard } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type PopularDestinationsProps = {
  items: DestinationCard[];
  className?: string;
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemMotion = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function PopularDestinations({
  items,
  className,
}: PopularDestinationsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="destinations"
      className={cn("bg-surface py-16 sm:py-20 lg:py-24", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Handpicked regions
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Popular destinations
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
              Iconic routes with vetted hotels, private transfers, and on-ground
              hosts who elevate every arrival.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start rounded-full">
            <Link href="#">View all destinations</Link>
          </Button>
        </div>

        <motion.div
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((d) => (
            <motion.article
              key={d.id}
              variants={reduceMotion ? undefined : itemMotion}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-glass ring-1 ring-slate-100"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent opacity-90 transition group-hover:from-primary/90" />
                <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                  {d.region}
                </div>
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
                  <div>
                    <h3 className="font-display text-xl font-semibold">{d.name}</h3>
                    <p className="mt-1 text-xs text-white/80">
                      {d.packageCount}+ curated packages
                    </p>
                  </div>
                  <Link
                    href={`/destinations/${d.slug}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white hover:text-primary"
                    aria-label={`Explore ${d.name}`}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
