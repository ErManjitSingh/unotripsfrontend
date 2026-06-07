import { NewsletterForm } from "@/components/home/newsletter-form";
import { cn } from "@/lib/utils";

export type NewsletterProps = {
  className?: string;
};

export function Newsletter({ className }: NewsletterProps) {
  return (
    <section className={cn("bg-surface py-16 sm:py-20", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-lift sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-12">
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
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
