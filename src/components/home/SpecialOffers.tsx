import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SpecialOffersProps = {
  className?: string;
};

export function SpecialOffers({ className }: SpecialOffersProps) {
  return (
    <section id="honeymoon" className={cn("py-6 sm:py-8", className)}>
      <div className="mx-auto w-full max-w-[1320px] overflow-hidden rounded-[2rem] border border-white/10 px-3 shadow-lift sm:px-4 lg:px-6">
        <div
          className="relative animate-gradient-x bg-brand-banner bg-[length:200%_200%] px-6 py-6 sm:px-10 sm:py-7 lg:px-14"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),transparent_55%)]" />
          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                Limited suites · Honeymoon & anniversary
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Complimentary upgrades on select Maldives & Europe departures
              </h2>
              <p className="mt-3 text-sm text-white/85 sm:text-base">
                Confirm before{" "}
                <span className="font-semibold text-accent">15 June 2026</span> to unlock
                room upgrades, airport fast-track, and a private sunset experience.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-primary hover:bg-white/90"
              >
                <Link href="#contact">Claim offer</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full border-white/40"
              >
                <Link href="#packages">Browse packages</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
