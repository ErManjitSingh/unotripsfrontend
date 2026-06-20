"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FaqSection({ className }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className={cn("bg-[#faf8f4] py-12 sm:py-16", className)}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary/40" aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              FAQ
            </span>
            <span className="h-px w-8 bg-primary/40" aria-hidden />
          </div>
          <h2 className="mt-4 font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Common questions
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            Straight answers about how we plan trips, visas, and cancellations —<br className="hidden sm:block" />
            same content as our structured FAQ markup for search engines.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={item.question}
                className={cn(
                  "overflow-hidden rounded-2xl bg-white transition-shadow",
                  isOpen
                    ? "shadow-md ring-1 ring-slate-200"
                    : "border border-slate-100 shadow-sm",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  {/* Circle toggle */}
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                      isOpen
                        ? "bg-primary text-white"
                        : "border border-primary/30 text-primary",
                    )}
                  >
                    {isOpen
                      ? <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                      : <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    }
                  </span>

                  <span className="flex-1 text-[15px] font-semibold text-slate-900">
                    {item.question}
                  </span>

                  {/* Chevron */}
                  <span className="shrink-0 text-primary">
                    {isOpen
                      ? <ChevronUp className="h-4 w-4" strokeWidth={2} aria-hidden />
                      : <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
                    }
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pl-[68px]">
                    <p className="text-sm leading-relaxed text-slate-500">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
