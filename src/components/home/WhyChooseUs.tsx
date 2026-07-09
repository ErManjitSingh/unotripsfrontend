import Image from "next/image";
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
    <section id="about" className={cn("bg-white py-12 sm:py-16 lg:py-20", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:aspect-[4/5]">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="Himachal Pradesh — snow-capped Himalayan peaks"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Copy + differentiators */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Why discerning travelers choose us
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Precision planning. Impeccable delivery.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-600 sm:text-base">
              We orchestrate every touchpoint — from chauffeur greetings to restaurant pacing
              — so your holiday feels effortless, never rushed.
            </p>

            <div className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-4 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
