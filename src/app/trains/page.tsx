"use client";

/**
 * src/app/trains/page.tsx
 * UNO Trips — Train booking page.
 * Style matches hotels/packages pages — UNO brand colors only.
 * Frontend only — no backend yet.
 */

import { Navbar }         from "@/components/layout/Navbar";
import { Footer }         from "@/components/layout/Footer";
import { TrainSearchBar } from "@/components/trains/TrainSearchBar";
import { Train, Shield, Clock, IndianRupee, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function TrainsPage() {
  return (
    <>
      <Navbar variant="ease" easeActiveNavId="trains" />

      <main className="min-h-screen bg-surface">

        {/* ── Hero — full bleed background image, same as hotels hero ── */}
        <section className="relative min-h-[320px] overflow-hidden border-b border-slate-200/60">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Dark overlay — same as hotels bg-black/50 */}
          <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden />

          {/* Content */}
          <div className="relative z-10 mx-auto w-full max-w-[1320px] px-3 py-10 sm:px-4 sm:py-12 lg:px-6">
            <div className="mb-6 text-center">
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">
                UNO Trips · Train Booking
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Search Trains Across India
              </h1>
              <p className="mt-1.5 text-[13px] text-white/70">
                15,000+ trains · All classes · Instant confirmation
              </p>
            </div>
            <TrainSearchBar />
          </div>
        </section>

        {/* ── Trust badges ── */}
        <section className="border-b border-slate-200/60 bg-white">
          <div className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-4 lg:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Train,        label: "15,000+ Trains",      sub: "Pan-India network"      },
                { icon: Shield,       label: "Safe & Secure",        sub: "100% secure payments"   },
                { icon: Clock,        label: "Instant Confirmation", sub: "Real-time availability" },
                { icon: IndianRupee,  label: "Best Price",           sub: "No convenience fee"     },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-surface px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-ink">{label}</div>
                    <div className="text-[11px] text-slate-400">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Popular routes ── */}
        <section className="py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
            <h2 className="mb-5 text-[17px] font-bold text-ink">Popular Routes</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { from: "New Delhi",      fromCode: "NDLS", to: "Mumbai Central", toCode: "BCT",  trains: "42 trains", duration: "15h 35m", price: "₹755"  },
                { from: "New Delhi",      fromCode: "NDLS", to: "Howrah Jn",      toCode: "HWH",  trains: "35 trains", duration: "17h 05m", price: "₹665"  },
                { from: "Chennai",        fromCode: "MAS",  to: "Bengaluru",      toCode: "SBC",  trains: "28 trains", duration: "5h 30m",  price: "₹245"  },
                { from: "Jaipur",         fromCode: "JP",   to: "New Delhi",      toCode: "NDLS", trains: "22 trains", duration: "4h 15m",  price: "₹185"  },
                { from: "Mumbai Central", fromCode: "BCT",  to: "Ahmedabad",      toCode: "ADI",  trains: "18 trains", duration: "6h 05m",  price: "₹215"  },
                { from: "Patna Jn",       fromCode: "PNBE", to: "New Delhi",      toCode: "NDLS", trains: "30 trains", duration: "12h 20m", price: "₹445"  },
              ].map(r => (
                <Link
                  key={r.fromCode + r.toCode}
                  href={`/trains/results?from=${r.fromCode}&to=${r.toCode}&date=&class=ALL`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-ink truncate">{r.from} ({r.fromCode})</div>
                    <div className="my-1.5 flex items-center gap-1.5">
                      <div className="h-px flex-1 bg-slate-200" />
                      <Train className="h-3 w-3 text-primary" />
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="text-[13px] font-bold text-ink truncate">{r.to} ({r.toCode})</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[16px] font-extrabold text-primary">{r.price}</div>
                    <div className="text-[10px] text-slate-400">{r.trains}</div>
                    <div className="text-[10px] text-slate-400">{r.duration}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Offer banner — same as SpecialOffers / brand-banner ── */}
        <section className="py-5 sm:py-6">
          <div className="mx-auto w-full max-w-[1320px] overflow-hidden rounded-[2rem] border border-white/10 px-3 shadow-lift sm:px-4 lg:px-6">
            <div className="relative animate-gradient-x bg-brand-banner bg-[length:200%_200%] px-6 py-6 sm:px-10 sm:py-7 lg:px-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),transparent_55%)]" />
              <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                    Limited time · Train travel offer
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    Book early &amp; save up to ₹500 on select train routes
                  </h2>
                  <p className="mt-3 text-sm text-white/85">
                    Exclusive discounts on Rajdhani, Shatabdi &amp; Vande Bharat trains. Valid for travel between{" "}
                    <span className="font-semibold text-accent">July – September 2026</span>.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href="/trains"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-primary shadow-md transition hover:bg-white/90"
                  >
                    <Train className="h-4 w-4" />
                    Search trains
                  </Link>
                  <Link
                    href="/packages"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Browse packages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}