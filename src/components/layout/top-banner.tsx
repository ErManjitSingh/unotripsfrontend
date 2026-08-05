"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Copy, Tag, X } from "lucide-react";
import { CAB_WELCOME_PROMO_CODE } from "@/lib/cab-promo";
import { useCabPromoOptional } from "@/contexts/cab-promo-context";

const DISMISS_KEY = "uno_cabs_promo_banner_dismissed";

function shouldShowCabPromoBanner(pathname: string) {
  if (pathname.startsWith("/cabs/partner")) return false;
  return pathname === "/" || pathname.startsWith("/cabs");
}

function setBannerHeight(px: number) {
  document.documentElement.style.setProperty("--uno-top-banner-height", `${px}px`);
}

export function TopBanner() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const promo = useCabPromoOptional();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const syncBannerHeight = useCallback(() => {
    const el = bannerRef.current;
    setBannerHeight(el ? el.offsetHeight : 0);
  }, []);

  useEffect(() => {
    if (!shouldShowCabPromoBanner(pathname)) {
      setVisible(false);
      setBannerHeight(0);
      return;
    }
    try {
      setVisible(sessionStorage.getItem(DISMISS_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!visible) {
      setBannerHeight(0);
      return;
    }
    syncBannerHeight();
    const el = bannerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncBannerHeight);
    observer.observe(el);
    return () => {
      observer.disconnect();
      setBannerHeight(0);
    };
  }, [visible, expanded, promo?.isApplied, syncBannerHeight]);

  if (!visible || !promo || !shouldShowCabPromoBanner(pathname)) {
    return null;
  }

  const dismiss = () => {
    setVisible(false);
    setBannerHeight(0);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CAB_WELCOME_PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const applyFromBanner = async (event?: FormEvent) => {
    event?.preventDefault();
    const result = await promo.applyCode(input || CAB_WELCOME_PROMO_CODE);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setInput("");
    setExpanded(false);
    if (!pathname.startsWith("/cabs")) {
      router.push("/cabs");
    }
  };

  return (
    <div
      ref={bannerRef}
      className="sticky top-0 z-[60] border-b border-[#c94f0f] bg-[#ef6614] text-white"
      role="region"
      aria-label="UNO Cabs welcome offer"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
        {promo.alreadyUsed ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold sm:text-sm">
            <span>
              <strong>{CAB_WELCOME_PROMO_CODE}</strong> already used on this account · first-ride offer is once per user
            </span>
          </div>
        ) : promo.isApplied ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold sm:text-sm">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>
              <strong>{promo.code}</strong> applied — {promo.discountPercent}% off your first ride (once per account)
            </span>
          </div>
        ) : (
          <>
            <p className="min-w-0 flex-1 text-xs font-bold leading-snug sm:text-sm">
              First ride? Get <strong>10% off</strong> once with code{" "}
              <button
                type="button"
                onClick={() => void copyCode()}
                className="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5 font-black tracking-wide text-white underline-offset-2 hover:bg-white/25 hover:underline"
              >
                {CAB_WELCOME_PROMO_CODE}
                <Copy className="h-3 w-3 opacity-80" />
              </button>
              {copied && <span className="ml-1 text-[10px] font-semibold text-white/90">Copied!</span>}
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExpanded((open) => !open);
                  setError("");
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold transition hover:bg-white/25 sm:text-xs"
              >
                <Tag className="h-3.5 w-3.5" />
                Enter code
                <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => void applyFromBanner()}
                className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#ef6614] transition hover:bg-orange-50 sm:text-xs"
              >
                Apply
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="ml-auto shrink-0 rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white sm:ml-0"
          aria-label="Dismiss offer banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {expanded && !promo.isApplied && !promo.alreadyUsed && (
        <form
          onSubmit={(event) => void applyFromBanner(event)}
          className="border-t border-white/20 bg-[#d95511] px-3 py-2 sm:px-4"
        >
          <div className="mx-auto flex max-w-6xl gap-2">
            <input
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (error) setError("");
              }}
              placeholder={`Enter ${CAB_WELCOME_PROMO_CODE}`}
              className="min-w-0 flex-1 rounded-lg border border-white/25 bg-white px-3 py-2 text-sm font-bold uppercase tracking-wide text-[#292229] outline-none placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8b828a] focus:border-white focus:ring-2 focus:ring-white/40"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#292229] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#403842]"
            >
              Apply code
            </button>
          </div>
          {error && (
            <p className="mx-auto mt-1.5 max-w-6xl text-[11px] font-semibold text-orange-100">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
