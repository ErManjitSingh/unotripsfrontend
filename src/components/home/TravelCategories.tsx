import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { TravelCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TravelCategoriesProps = {
  categories: TravelCategory[];
  className?: string;
};

export function TravelCategories({
  categories,
  className,
}: TravelCategoriesProps) {
  return (
    <section className={cn("bg-white py-8 sm:py-10 lg:py-12", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Travel moods
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Categories we design for
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              Each vertical has its own playbook — pacing, hotels, and guides tuned to
              the traveler in the room.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-ink shadow-glass transition-transform motion-safe:hover:-translate-y-1.5"
            >
              <div className="relative aspect-[16/11]">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold">{c.title}</h3>
                    <p className="mt-2 max-w-xs text-sm text-white/80">{c.description}</p>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white hover:text-primary"
                    aria-label={`Explore ${c.title}`}
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
