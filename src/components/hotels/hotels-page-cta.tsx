import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Headphones, Search, ShieldCheck } from "lucide-react";

type HotelsPageCtaProps = {
  searchHref?: string;
  exploreHref?: string;
};

export function HotelsPageCta({
  searchHref = "/hotels#hotel-search",
  exploreHref = "/hotels#popular-destinations",
}: HotelsPageCtaProps) {
  return (
    <section className="pb-14 pt-4 sm:pb-20 sm:pt-6">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-br from-primary via-orange-500 to-amber-500 shadow-[0_24px_60px_-20px_rgba(234,88,12,0.55)]">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl"
            aria-hidden
          />

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:p-10">
            <div className="text-white">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-100">Book with confidence</p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Ready to find your perfect stay?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-orange-50 sm:text-base">
                Search by city, compare prices instantly, and book in minutes. Best rates, verified hotels, and
                24/7 support on every booking.
              </p>

              <ul className="mt-5 flex flex-wrap gap-3 text-xs font-semibold sm:text-sm">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Lowest price guarantee
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
                  <Headphones className="h-4 w-4" aria-hidden />
                  24/7 customer care
                </li>
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={searchHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:text-base"
                >
                  <Search className="h-4 w-4" aria-hidden />
                  Search hotels
                </Link>
                <Link
                  href={exploreHref}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-base"
                >
                  Explore destinations
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="relative hidden min-h-[220px] overflow-hidden rounded-2xl ring-2 ring-white/25 lg:block">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a850609ee90?auto=format&fit=crop&w=900&q=80"
                alt="Luxury hotel room"
                fill
                className="object-cover"
                sizes="480px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" aria-hidden />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Limited offers</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">Save up to 40% on select properties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}