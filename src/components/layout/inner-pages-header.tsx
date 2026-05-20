"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Phone, Search, User } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type InnerPagesHeaderProps = {
  /** Used in rotating search hints (destination / theme). */
  searchHint?: string;
  className?: string;
};

function displayPhone(phone: string): string {
  return phone.replace(/^\+91\s*/, "").trim() || phone;
}

function useTypewriterHints(searchHint: string) {
  const phrases = useMemo(
    () => [
      `Search “${searchHint}” packages…`,
      "Kerala · Goa · Rajasthan…",
      "Maldives · Dubai · Europe…",
      "Honeymoon & family getaways…",
    ],
    [searchHint],
  );

  const [text, setText] = useState("");
  const phraseRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<"typing" | "hold" | "deleting">("typing");
  const holdTicksRef = useRef(0);

  useEffect(() => {
    phraseRef.current = 0;
    charRef.current = 0;
    phaseRef.current = "typing";
    holdTicksRef.current = 0;
    setText("");
  }, [phrases]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const phrase = phrases[phraseRef.current % phrases.length];

      if (phaseRef.current === "typing") {
        const next = phrase.slice(0, charRef.current + 1);
        charRef.current += 1;
        setText(next);
        if (charRef.current >= phrase.length) {
          phaseRef.current = "hold";
          holdTicksRef.current = 40;
        }
        return;
      }

      if (phaseRef.current === "hold") {
        holdTicksRef.current -= 1;
        if (holdTicksRef.current <= 0) {
          phaseRef.current = "deleting";
        }
        return;
      }

      charRef.current -= 1;
      setText(phrase.slice(0, Math.max(0, charRef.current)));
      if (charRef.current <= 0) {
        phraseRef.current += 1;
        phaseRef.current = "typing";
        charRef.current = 0;
      }
    }, 42);

    return () => window.clearInterval(id);
  }, [phrases]);

  return text;
}

export function InnerPagesHeader({ searchHint = "Europe", className }: InnerPagesHeaderProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const animatedHint = useTypewriterHints(searchHint.trim() || "Europe");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/?q=${encodeURIComponent(term)}#packages`);
    else router.push("/#packages");
  };

  const telHref = `tel:${SITE.phone.replace(/\s/g, "")}`;

  const showGhost = q.length === 0;

  return (
    <header className={cn("sticky top-0 z-[100] w-full border-b border-white/10 bg-[#0b1f36] text-white shadow-md", className)}>
      <div className="mx-auto flex max-w-[1400px] flex-nowrap items-center gap-2 overflow-x-auto px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/"
          className="relative flex h-8 w-[118px] shrink-0 items-center py-0.5 sm:h-9 sm:w-[138px] md:h-10 md:w-[158px]"
        >
          <Image
            src={SITE.logoUrl}
            alt="UNO Trips — Travel made simple"
            fill
            className="object-contain object-left"
            sizes="(max-width: 768px) 118px, 158px"
            priority
          />
        </Link>

        <div className="flex min-w-0 flex-[1.15] justify-center px-1 sm:flex-[1.25] sm:px-2 lg:flex-[1.35]">
          <form
            onSubmit={onSearch}
            className={cn(
              "group relative flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-2xl border border-white/25",
              "bg-gradient-to-br from-white/[0.99] via-white/[0.97] to-slate-50/95 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]",
              "ring-1 ring-white/40 backdrop-blur-md transition-[box-shadow,border-color,transform] duration-300",
              "focus-within:border-orange-300/70 focus-within:shadow-[0_12px_40px_-10px_rgba(234,88,12,0.35)] focus-within:ring-orange-400/40",
              "max-w-[260px] sm:max-w-[312px] md:max-w-[364px] lg:max-w-[min(42vw,420px)]",
            )}
            role="search"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 pl-3 sm:pl-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-orange-500/10 text-primary shadow-inner ring-1 ring-primary/15">
                <Search className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="relative min-w-0 flex-1 py-2 pr-1">
                {showGhost ? (
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden pr-1"
                    aria-hidden
                  >
                    <span className="truncate text-left text-[13px] font-medium tracking-tight text-slate-500 sm:text-sm">
                      {animatedHint}
                      <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[1px] bg-primary align-middle animate-pulse" />
                    </span>
                  </div>
                ) : null}
                <input
                  type="search"
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder=" "
                  autoComplete="off"
                  className={cn(
                    "relative z-10 w-full min-w-0 border-0 bg-transparent py-0 text-[13px] font-medium outline-none ring-0 sm:text-sm",
                    "placeholder:text-transparent focus:ring-0",
                    showGhost ? "text-transparent caret-orange-500" : "text-slate-900 caret-orange-500",
                  )}
                  aria-label="Search packages and destinations"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group/btn flex shrink-0 items-center gap-1.5 border-l border-slate-200/90 bg-gradient-to-br from-primary via-orange-500 to-orange-600 px-3 text-xs font-bold text-white shadow-inner transition hover:brightness-[1.07] active:scale-[0.98] sm:px-4 sm:text-[13px]"
            >
              <ArrowRight className="h-3.5 w-3.5 opacity-95 sm:h-4 sm:w-4" aria-hidden />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </button>
          </form>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
          <Link
            href={telHref}
            className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-full bg-primary px-2.5 py-2 text-[10px] font-semibold text-white shadow-sm hover:bg-primary/90 sm:max-w-none sm:px-3 sm:text-xs"
          >
            <Phone className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            <span className="truncate">{displayPhone(SITE.phone)}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/95 hover:text-accent sm:text-xs"
          >
            <User className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Login</span>
            <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-white/10 sm:text-xs"
          >
            <span aria-hidden>🇮🇳</span>
            <span>India</span>
            <ChevronDown className="h-3 w-3 opacity-80" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
