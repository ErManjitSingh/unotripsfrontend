import Image from "next/image";
import Link from "next/link";
import { Plane, Hotel, UtensilsCrossed, Camera, FileText } from "lucide-react";

const INCLUSIONS = [
  { icon: Plane, label: "Flight" },
  { icon: Hotel, label: "Hotel" },
  { icon: UtensilsCrossed, label: "Meal" },
  { icon: Camera, label: "Sightseeing" },
  { icon: FileText, label: "Visa" },
];

/** Promo strip directly below the home hero (e.g. Vietnam desk banner). */
export function HeroPromoBanner() {
  return (
    <aside className="relative z-0 mb-5 mt-2 w-full bg-white md:mb-6 md:mt-6">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-4 lg:px-6">
        <Link
          href="/destinations/vietnam"
          className="group relative block w-full overflow-hidden rounded-[22px] border border-white shadow-[0_18px_42px_-24px_rgba(15,23,42,0.5)] ring-1 ring-slate-100 transition-all duration-300 hover:border-primary/35 hover:shadow-[0_8px_32px_-6px_rgba(234,88,12,0.18),0_4px_12px_rgba(15,23,42,0.08)] sm:rounded-[1.25rem] md:border-2 md:border-[#E5E7EB]"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80"
              alt=""
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1320px) 100vw, 1320px"
              priority={false}
              aria-hidden
            />
            {/* gradient overlay — stronger on mobile for legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/80 via-[#0a1628]/55 to-transparent sm:from-[#0a1628]/70 sm:via-[#0a1628]/40" />
          </div>

          {/* Content */}
          <div className="relative flex min-h-[178px] flex-col justify-end gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-4 md:min-h-0">
            {/* Text block */}
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-black leading-tight text-white sm:text-lg">
                Unlock{" "}
                <span className="text-orange-400">FREE*</span>{" "}
                Hotel Upgrades
              </p>
              <p className="text-[15px] font-semibold text-white/90 sm:text-base">
                on Vietnam Group Departures
              </p>

              {/* Price */}
              <p className="mt-2 text-[13px] font-bold text-white/85">
                Starting from{" "}
                <span className="text-white text-sm">₹45,999*</span>
              </p>

              {/* Inclusions */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                {INCLUSIONS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 text-[11px] font-medium text-white/78"
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <span className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 group-hover:bg-primary/90 group-hover:shadow-lg md:px-5 md:py-2 md:font-semibold">
                Book Now
              </span>
              <p className="text-[10px] text-white/55 sm:text-right">
                *T&amp;Cs Apply | Only Hanoi – Da&nbsp;Nang Flight included
              </p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
