import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { FOOTER_COLUMNS, SITE } from "@/lib/constants";
import { siteTelHref } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

export type FooterProps = {
  className?: string;
};

const SOCIAL = [
  { href: "https://www.instagram.com/", icon: Instagram, label: "Instagram" },
  { href: "https://www.facebook.com/",  icon: Facebook,  label: "Facebook"  },
  { href: "https://www.linkedin.com/",  icon: Linkedin,  label: "LinkedIn"  },
] as const;

export function Footer({ className }: FooterProps) {
  return (
    <footer
      id="contact"
      className={cn("w-full border-t border-slate-100 bg-white", className)}
    >
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="flex flex-col gap-8 py-8 lg:flex-row lg:gap-12 lg:py-10">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-6 lg:w-[35%]">

            {/* Logo — sits naturally on white */}
            <Link href="/">
              <Image
                src="/images/homelogo.webp"
                alt="UNO Trips"
                width={180}
                height={56}
                className="h-14 w-auto object-contain"
                unoptimized
                priority
              />
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              Luxury travel, redefined — curated journeys across India and the world.
            </p>

            {/* Contact */}
            <div className="space-y-3.5 text-sm text-slate-600">
              <a
                href={siteTelHref()}
                className="flex items-center gap-3 transition hover:text-primary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-3.5 w-3.5 text-primary" aria-hidden />
                </span>
                {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 transition hover:text-primary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-3.5 w-3.5 text-primary" aria-hidden />
                </span>
                {SITE.email}
              </a>
              <p className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                </span>
                <span className="mt-1">
                  <span className="font-semibold text-slate-800">Address:</span>{" "}
                  {SITE.address}
                </span>
              </p>
            </div>

          </div>

          {/* Divider */}
          <div className="hidden w-px self-stretch bg-slate-100 lg:block" />

          {/* ── Right: link columns + Stay Inspired ── */}
          <div className="grid flex-1 grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
                  {col.title}
                </p>
                <span className="mt-2 block h-0.5 w-6 rounded-full bg-primary" aria-hidden />
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-primary"
                      >
                        <span className="text-primary" aria-hidden>&rsaquo;</span>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Stay Inspired as 4th column */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
                Stay Inspired
              </p>
              <span className="mt-2 block h-0.5 w-6 rounded-full bg-primary" aria-hidden />
              <p className="mt-5 text-sm leading-relaxed text-slate-500">
                Follow us for seasonal offers and new route drops.
              </p>
              <div className="mt-4 flex gap-2.5">
                {SOCIAL.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-slate-100 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <Image
              src="/images/homelogo.webp"
              alt="UNO Trips"
              width={80}
              height={26}
              className="h-6 w-auto object-contain opacity-60"
              unoptimized
            />
          </Link>
          <p className="text-xs text-slate-400">
            ©{" "}
            <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            {SITE.name}. Crafted for discerning travelers.
          </p>
        </div>

      </div>
    </footer>
  );
}
