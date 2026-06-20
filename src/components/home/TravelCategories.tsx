import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Crown,
  Heart,
  Landmark,
  Mountain,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { TravelCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_HREFS: Record<string, string> = {
  Adventure: "/packages?q=adventure",
  Family: "/packages?q=family",
  Honeymoon: "/packages?q=honeymoon",
  Pilgrimage: "/packages?q=pilgrimage",
  Luxury: "/packages?q=luxury",
  Corporate: "/packages?q=corporate",
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Adventure: Mountain,
  Family: Users,
  Honeymoon: Heart,
  Pilgrimage: Landmark,
  Luxury: Crown,
  Corporate: Briefcase,
};

export type TravelCategoriesProps = {
  categories: TravelCategory[];
  className?: string;
};

export function TravelCategories({ categories, className }: TravelCategoriesProps) {
  return (
    <section className={cn("bg-[#faf8f4] py-12 sm:py-16", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">

        {/* Header — left aligned */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Travel Moods
            </span>
            <span className="h-px w-8 bg-primary" aria-hidden />
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Categories we design for
          </h2>
          <p className="mt-3 max-w-lg text-sm text-slate-500 sm:text-base">
            Each vertical has its own playbook — pacing, hotels, and guides
            tuned to the traveler in the room.
          </p>
        </div>

        {/* 2×3 grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.title] ?? Mountain;
            return (
              <Link
                key={c.id}
                href={CATEGORY_HREFS[c.title] ?? "/packages"}
                aria-label={`Explore ${c.title}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
                </div>

                {/* Top-left icon circle */}
                <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{c.title}</h3>
                    <span className="mt-1.5 block h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                    <p className="mt-2.5 max-w-[220px] text-sm leading-relaxed text-white/80">
                      {c.description}
                    </p>
                  </div>

                  {/* Arrow circle */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition group-hover:bg-primary">
                    <ArrowUpRight
                      className="h-5 w-5 text-primary transition group-hover:text-white"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Explore all categories
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

      </div>
    </section>
  );
}
