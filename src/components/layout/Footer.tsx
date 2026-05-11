import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { FOOTER_COLUMNS, SITE } from "@/lib/constants";

export type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer id="contact" className={className}>
      <div className="border-t border-slate-100 bg-ink text-slate-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="font-display text-xl font-semibold lowercase text-white">
              wanderlux
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {SITE.tagline}
            </p>
            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                {SITE.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                {SITE.email}
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                Connaught Place, New Delhi, India
              </p>
            </div>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold uppercase tracking-wide text-white">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white">
              Stay inspired
            </p>
            <p className="mt-3 text-sm text-slate-300">
              Follow us for limited seasonal offers and new route drops.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="https://www.instagram.com/"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.facebook.com/"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {SITE.name}. Crafted for discerning travelers.
        </div>
      </div>
    </footer>
  );
}
