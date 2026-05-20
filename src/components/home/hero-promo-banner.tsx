import Image from "next/image";
import Link from "next/link";

/** Promo strip directly below the home hero (e.g. Vietnam desk banner). */
export function HeroPromoBanner() {
  return (
    <aside className="relative z-0 mt-[3rem] flex w-full justify-center bg-white px-3 sm:px-4 lg:px-6">
      <Link
        href="/destinations/vietnam"
        className="group relative block w-[80%] max-w-[1152px] overflow-hidden rounded-2xl border-2 border-[#E5E7EB] bg-gradient-to-b from-white via-white to-[#FAFAFA] p-1.5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.12),0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-[#F3F4F6] transition-all duration-300 hover:border-primary/35 hover:shadow-[0_8px_32px_-6px_rgba(234,88,12,0.18),0_4px_12px_rgba(15,23,42,0.08)] sm:rounded-[1.25rem] sm:p-2"
      >
        <span
          className="pointer-events-none absolute inset-x-4 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
        <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-inner sm:rounded-[0.875rem]">
          <Image
            src="/images/vietnam-banner-desk.webp"
            alt="Vietnam tour packages — explore with UNO Trips"
            width={1440}
            height={160}
            className="h-auto w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
            sizes="80vw"
            priority={false}
          />
        </div>
      </Link>
    </aside>
  );
}
