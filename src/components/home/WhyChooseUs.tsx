import { Globe2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Trusted operations",
    body: "Licensed partners, audited insurance, and 24/7 emergency desks across time zones.",
    icon: ShieldCheck,
  },
  {
    title: "Global expertise",
    body: "On-ground teams in 40+ cities ensure smooth arrivals, fast pivots, and local insight.",
    icon: Globe2,
  },
  {
    title: "Human-first service",
    body: "Dedicated travel designers who remember your preferences trip after trip.",
    icon: Users,
  },
  {
    title: "Signature moments",
    body: "Private access, chef-led dinners, and surprise upgrades woven into the itinerary.",
    icon: Sparkles,
  },
] as const;

export type WhyChooseUsProps = {
  className?: string;
};

export function WhyChooseUs({ className }: WhyChooseUsProps) {
  return (
    <section id="about" className={cn("bg-white py-8 sm:py-10 lg:py-12", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Why discerning travelers choose us
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Precision planning. Impeccable delivery.
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            We orchestrate every touchpoint — from chauffeur greetings to restaurant pacing
            — so your holiday feels effortless, never rushed.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-b from-white to-surface p-6 shadow-glass transition-transform motion-safe:hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
