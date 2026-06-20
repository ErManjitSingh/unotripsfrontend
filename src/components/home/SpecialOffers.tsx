import Link from "next/link";
import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpecialOffersProps = {
  className?: string;
};

export function SpecialOffers({ className }: SpecialOffersProps) {
  return (
    <section id="honeymoon" className={cn("py-6 sm:py-8", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Background photo */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=80')",
            }}
            aria-hidden
          />
          {/* Gradient overlay: dark navy left → transparent right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #0d1b35 30%, rgba(13,27,53,0.75) 55%, rgba(13,27,53,0.15) 100%)",
            }}
            aria-hidden
          />

          {/* Content */}
          <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                Limited Suites &nbsp;·&nbsp; Honeymoon &amp; Anniversary
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Complimentary upgrades on select
                <br className="hidden sm:block" /> Maldives &amp; Europe departures
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                Confirm before{" "}
                <span className="font-semibold text-primary">31 July 2026</span> to unlock
                room upgrades, airport fast-track, and a private sunset experience.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/packages?q=honeymoon"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
                >
                  <Gift className="h-4 w-4" aria-hidden />
                  Claim offer
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                >
                  Browse packages →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
