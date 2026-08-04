import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SITE } from "@/lib/constants";

export type PolicySection = {
  title: string;
  body: string[];
};

export type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
};

export function PolicyPage({ eyebrow, title, intro, updated, sections }: PolicyPageProps) {
  return (
    <>
      <Navbar variant="ease" />
      <main className="bg-[#fbfaf8]">
        <section className="relative overflow-hidden border-b border-orange-100/70 bg-[radial-gradient(circle_at_80%_20%,rgba(234,88,12,0.14),transparent_30%),linear-gradient(180deg,#fff7ed_0%,#fbfaf8_100%)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-orange-700">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {intro}
            </p>
            <div className="mt-6 inline-flex rounded-full border border-orange-100 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              Last updated: {updated}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="h-fit rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)] lg:sticky lg:top-28">
              <p className="text-sm font-black text-slate-950">{SITE.name}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Clear policies for bookings, payments, privacy, and support.
              </p>
              <div className="mt-5 space-y-2 text-sm font-semibold text-slate-600">
                {sections.map((section) => (
                  <a key={section.title} href={`#${slugify(section.title)}`} className="block rounded-2xl px-3 py-2 transition hover:bg-orange-50 hover:text-primary">
                    {section.title}
                  </a>
                ))}
              </div>
            </aside>

            <div className="space-y-5">
              {sections.map((section) => (
                <article
                  key={section.title}
                  id={slugify(section.title)}
                  className="scroll-mt-28 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.5)] sm:p-7"
                >
                  <h2 className="flex items-start gap-3 text-xl font-black text-slate-950 sm:text-2xl">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-[15px] leading-7 text-slate-600">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
