import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CarFront, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type UnoCabsHomeSectionProps = {
  className?: string;
};

const PANELS = [
  {
    id: "partner",
    href: "/cabs/list-your-cab",
    eyebrow: "For cab partners",
    title: "Register your cab",
    body: "List your fleet, get verified, and receive real trip requests from travellers.",
    bodyMobile: "List your fleet and get verified trip requests.",
    cta: "List your cab",
    phoneImage: "/images/cabs/uno-cabs-partner-phone-v1.png",
    phoneImageAlt:
      "UNO Cabs partner app showing a trip request and quote payout",
    Icon: CarFront,
    ctaClass: "bg-white text-[#1a1210] hover:bg-[#fff4ec]",
  },
  {
    id: "traveller",
    href: "/cabs",
    eyebrow: "For travellers",
    title: "Get free quotations",
    body: "Post your trip once, compare partner quotes, and book only when the fare feels right.",
    bodyMobile: "Post once, compare quotes, book when it feels right.",
    cta: "Get free quotes",
    phoneImage: "/images/cabs/uno-cabs-traveller-phone-v1.png",
    phoneImageAlt: "UNO Cabs app showing cab partner quote comparison",
    Icon: Quote,
    ctaClass: "bg-[#EF6614] text-white hover:bg-[#e05a0f]",
  },
] as const;

/** Homepage dual-panel promo for UNO Cabs — partner listing + traveller quotes. */
export function UnoCabsHomeSection({ className }: UnoCabsHomeSectionProps) {
  return (
    <section
      id="uno-cabs"
      className={cn(
        "relative overflow-hidden bg-[#120e0c] py-10 text-white sm:py-16",
        className,
      )}
      aria-labelledby="uno-cabs-heading"
    >
      <div className="relative mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:mb-10 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF9A4A]">
                UNO Cabs
              </span>
              <span className="h-px w-10 bg-[#EF6614]" aria-hidden />
            </div>
            <h2
              id="uno-cabs-heading"
              className="font-display mt-2 text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:mt-3 sm:text-4xl"
            >
              One marketplace.{" "}
              <span className="text-[#FF9A4A]">Two ways in.</span>
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#d9d0c9] sm:mt-3 sm:text-base">
              Partners grow with verified trip requests. Travellers compare free
              quotes before they book.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-5">
          {PANELS.map((panel) => (
            <Link
              key={panel.id}
              href={panel.href}
              className="group relative isolate flex min-h-[275px] overflow-hidden rounded-[1.25rem] bg-[#211613] ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:ring-white/25 sm:min-h-[390px] sm:rounded-[1.5rem] lg:min-h-[440px]"
            >
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_83%_18%,rgba(239,102,20,0.3),transparent_31%),linear-gradient(135deg,#2c1a16_0%,#171110_48%,#0e0b0a_100%)]"
                aria-hidden
              />
              <div
                className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:26px_26px]"
                aria-hidden
              />
              <div className="absolute inset-y-0 right-0 z-0 w-[56%] overflow-hidden sm:w-[52%]">
                <Image
                  src={panel.phoneImage}
                  alt={panel.phoneImageAlt}
                  fill
                  sizes="(max-width: 640px) 58vw, (max-width: 1024px) 45vw, 340px"
                  className="scale-[1.12] object-cover object-center transition duration-700 ease-out group-hover:scale-[1.16]"
                />
                <div
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#17100e] to-transparent"
                  aria-hidden
                />
              </div>
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#120e0c] via-[#120e0c]/88 to-transparent"
                aria-hidden
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#120e0c] via-[#120e0c]/55 to-transparent"
                aria-hidden
              />

              <div className="relative z-10 mt-auto flex w-[60%] flex-col p-4 sm:w-[58%] sm:p-7 lg:p-9">
                <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white ring-1 ring-white/25 backdrop-blur-sm sm:mb-4 sm:px-3 sm:py-1.5 sm:text-[10px]">
                  <panel.Icon
                    className="h-3 w-3 text-[#FF9A4A] sm:h-3.5 sm:w-3.5"
                    aria-hidden
                  />
                  {panel.eyebrow}
                </span>

                <h3 className="font-display text-[1.35rem] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-[1.85rem] lg:text-[2.1rem]">
                  {panel.title}
                </h3>

                <p className="mt-1.5 max-w-md text-[12px] font-medium leading-snug text-[#f2ebe4] drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] sm:mt-3 sm:text-[14px] sm:leading-relaxed lg:text-[15px]">
                  <span className="sm:hidden">{panel.bodyMobile}</span>
                  <span className="hidden sm:inline">{panel.body}</span>
                </p>

                <span
                  className={cn(
                    "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-extrabold shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)] transition sm:mt-7 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm",
                    panel.ctaClass,
                  )}
                >
                  {panel.cta}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
