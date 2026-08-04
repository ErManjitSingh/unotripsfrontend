"use client";

import Image from "next/image";
import { Quote, Sparkles, Star } from "lucide-react";
import { TestimonialCard } from "@/components/home/testimonial-card";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TESTIMONIAL_STORY_IMAGE =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85";

export type TestimonialsProps = {
  items: Testimonial[];
  className?: string;
};

export function Testimonials({ items, className }: TestimonialsProps) {
  if (items.length === 0) return null;

  const featured = items.find((item) => item.featured) ?? items[0];
  const supporting = items.filter((item) => item.id !== featured.id);

  return (
    <section className={cn("relative overflow-hidden bg-[#fff8f1] py-8 sm:py-14 lg:py-16", className)}>
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-4 lg:px-6">
        <div className="overflow-hidden rounded-[28px] border border-white bg-white/70 p-4 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr] lg:items-stretch">
            <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[24px] p-6 text-white sm:min-h-[500px] sm:p-8 lg:min-h-0">
              <Image
                src={TESTIMONIAL_STORY_IMAGE}
                alt="Friends enjoying a scenic road trip"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 470px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,13,28,0.9)_0%,rgba(14,23,39,0.78)_48%,rgba(67,38,12,0.48)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(251,146,60,0.32),transparent_34%)]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-100 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Traveler Stories
                </div>
                <h2 className="mt-5 text-[30px] font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-[42px]">
                  Trips people remember long after they return.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-white/72 sm:text-base">
                  Real guests, planned journeys, and the small details that make travel feel effortless.
                </p>
              </div>

              <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-white/20 pt-5">
                <div>
                  <p className="text-2xl font-black text-white">4.9</p>
                  <p className="mt-1 text-[11px] text-white/70">Avg rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">10k+</p>
                  <p className="mt-1 text-[11px] text-white/70">Happy guests</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">24/7</p>
                  <p className="mt-1 text-[11px] text-white/70">Trip support</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <figure className="relative overflow-hidden rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_46px_-30px_rgba(15,23,42,0.42)] sm:p-6">
                <Quote className="absolute right-5 top-5 h-12 w-12 text-orange-100" strokeWidth={1.4} />
                <div className="relative flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-4 ring-orange-50">
                    <Image src={featured.avatar} alt={featured.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0">
                    <figcaption className="text-lg font-black text-slate-950">{featured.name}</figcaption>
                    <p className="mt-0.5 text-sm font-medium text-slate-500">{featured.location}</p>
                    <div className="mt-2 flex gap-0.5" aria-label={`${featured.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-4 w-4", i < featured.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-100")}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="relative mt-5 text-[17px] font-semibold leading-relaxed text-slate-800 sm:text-xl">
                  &ldquo;{featured.text}&rdquo;
                </blockquote>
                {featured.trip && (
                  <div className="mt-5 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-primary">
                    {featured.trip}
                  </div>
                )}
              </figure>

              {supporting.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {supporting.map((item) => (
                    <TestimonialCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
