import { Gift, ShieldCheck, Tag, Luggage } from "lucide-react";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { cn } from "@/lib/utils";

const PERKS = [
  { icon: Tag,     label: "Exclusive", sub: "offers" },
  { icon: Luggage, label: "New trip",  sub: "ideas" },
  { icon: Gift,    label: "Invitations", sub: "only" },
] as const;

export type NewsletterProps = {
  className?: string;
};

export function Newsletter({ className }: NewsletterProps) {
  return (
    <section className={cn("bg-[#faf8f4] pb-16 sm:pb-20", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 lg:p-12"
          style={{
            background:
              "linear-gradient(135deg, #fff3eb 0%, #fde8d4 40%, #fceee3 100%)",
          }}
        >
          {/* Decorative blob */}
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 right-1/3 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: copy + perks */}
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                Insider List
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Join the private newsletter
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Seasonal fare drops, new suite openings, and invitation-only
                experiences — never spam, unsubscribe anytime.
              </p>

              {/* Perk icons */}
              <div className="mt-6 flex items-center gap-6">
                {PERKS.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-white/60">
                      <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                    </div>
                    <p className="text-[12px] font-semibold leading-tight text-slate-700">
                      {label}<br />{sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div className="w-full max-w-sm lg:max-w-md">
              <NewsletterForm />
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-500">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
