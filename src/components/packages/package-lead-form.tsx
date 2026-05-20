"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PackageLeadFormProps = {
  tourTitle: string;
  /** Tighter padding and fields — use in listing hero beside compact copy. */
  compact?: boolean;
  /** Veena-style: visible “Full Name*” / “Mobile No.*” labels above fields. */
  labeled?: boolean;
  className?: string;
};

/** “Want us to call you?” — Veena-style lead capture (front-end only). */
export function PackageLeadForm({
  tourTitle,
  compact,
  labeled,
  className,
}: PackageLeadFormProps) {
  return (
    <form
      className={cn(
        "flex flex-col rounded-md border border-[#e0e0e0] bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]",
        compact && !labeled
          ? "h-full min-h-0 p-3 sm:p-3.5"
          : compact && labeled
            ? "p-4 sm:p-5"
            : "p-4 sm:p-5",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className={cn(compact && !labeled && "min-h-0 flex-1")}>
        <p
          className={cn(
            labeled ? "text-left" : "text-center",
            "font-bold text-slate-900",
            compact && !labeled ? "text-xs sm:text-[13px]" : "text-sm",
          )}
        >
          Want us to call you?
        </p>
        <p
          className={cn(
            labeled ? "text-left" : "text-center",
            "leading-snug text-slate-500",
            labeled ? "mt-1 text-xs" : compact ? "mt-0.5 text-[10px] sm:text-[11px]" : "mt-1 text-[11px]",
          )}
        >
          Regarding:{" "}
          <span className="font-semibold text-slate-700">{tourTitle}</span>
        </p>
        <div className={cn(labeled ? "mt-4 space-y-3" : compact ? "mt-2.5 space-y-2" : "mt-4 space-y-3")}>
          <div>
            {labeled ? (
              <label className="mb-1 block text-xs font-semibold text-slate-800" htmlFor="lead-name">
                Full Name*
              </label>
            ) : (
              <label className="sr-only" htmlFor="lead-name">
                Full name
              </label>
            )}
            <Input
              id="lead-name"
              name="name"
              placeholder={labeled ? "" : "Full Name*"}
              className={cn(
                "rounded-md border-[#e0e0e0] text-sm",
                compact && !labeled ? "h-9 text-xs" : "h-10",
              )}
            />
          </div>
          <div>
            {labeled ? (
              <label className="mb-1 block text-xs font-semibold text-slate-800" htmlFor="lead-mobile">
                Mobile No.*
              </label>
            ) : null}
            <div className="flex gap-2">
              <span
                className={cn(
                  "flex shrink-0 items-center rounded-md border border-[#e0e0e0] bg-slate-50 px-2 text-xs font-medium text-slate-700",
                  compact && !labeled ? "h-9" : "h-10",
                )}
              >
                🇮🇳 +91
              </span>
              {!labeled ? (
                <label className="sr-only" htmlFor="lead-mobile">
                  Mobile number
                </label>
              ) : null}
              <Input
                id="lead-mobile"
                name="mobile"
                type="tel"
                placeholder={labeled ? "" : "Mobile No.*"}
                className={cn(
                  "min-w-0 flex-1 rounded-md border-[#e0e0e0] text-sm",
                  compact && !labeled ? "h-9 text-xs" : "h-10",
                )}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md border-0 bg-[#FACC15] font-bold text-slate-900 shadow-sm hover:bg-[#EAB308]",
          labeled ? "mt-4 h-11 text-sm" : "",
          !labeled && compact
            ? "mt-auto h-9 text-[11px] sm:mt-2.5 sm:h-9 sm:text-xs"
            : !labeled && !compact
              ? "mt-4 h-10 text-xs sm:text-sm"
              : "",
        )}
      >
        <Phone className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden />
        Request Call Back
      </Button>
    </form>
  );
}
