/**
 * src/components/packages/discovery/PackageTrustStrip.tsx
 *
 * The USP strip that sits INSIDE the hero, directly beneath the search card and
 * matched to its width, so the two read as one composition over the photograph
 * rather than two stacked blocks.
 *
 * Desktop — three two-line items, hairline dividers between them:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  💳 EMI Available  │  ✨ Customize Any Package │ 📞 24×7 Support │
 *   │     Leading Banks  │    To Match Your Budget   │  Travel Experts │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Mobile — ONE compact row, primary labels only, • separated:
 *
 *   💳 EMI Available  •  ✨ Customize Package  •  📞 24×7 Support
 *
 * The qualifiers ("Leading Banks" etc.) are dropped below `sm` — they are the
 * first thing to go when the row has to stay on one line. If the viewport is
 * too narrow to hold all three, the row scrolls horizontally rather than
 * wrapping: a wrapped trust line inside a fixed-height hero pushes the strip
 * out of the image.
 *
 * GLASS, NOT BANNER. A 10% white fill with a backdrop blur and a hairline
 * border — the same visual language as the navbar pill and the search card, so
 * it belongs to the hero instead of sitting on top of it. No brand orange: the
 * orange in this composition is the Search button, and a trust line that
 * competes with the CTA stops being a trust line.
 *
 * READABILITY: the hero's own gradient overlay is heaviest at the bottom
 * (black/70) where this strip lands, so white text clears contrast comfortably.
 * The blur is what protects it if the background photograph is a bright one.
 */

import { CreditCard, Phone, Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type TrustItem = {
  Icon: LucideIcon;
  /** Bold first line — the promise. */
  label: string;
  /**
   * Shorter wording used on the single-line mobile row. Falls back to `label`.
   * "Customize Package" rather than "Customize Trip": this page lists packages
   * and nothing is booked yet, so "package" matches the guest's mental model.
   */
  shortLabel?: string;
  /** Muted second line — the qualifier. Desktop only. */
  detail: string;
};

/**
 * Order matters: the two genuine differentiators lead, support closes.
 *
 * ── On the third item ──
 * "Instant Booking Confirmation" was considered and rejected: the package
 * flow's own confirmation email reads "Our team will reach you within 2 hours
 * to finalize the itinerary", and the default part-payment path leaves a
 * booking at `token_paid` rather than `confirmed`. Promising instant
 * confirmation here would be contradicted by the first email a guest receives.
 */
const TRUST_ITEMS: TrustItem[] = [
  { Icon: CreditCard, label: "EMI Available", detail: "Leading Banks" },
  {
    Icon: Sparkles,
    label: "Customize Any Package",
    shortLabel: "Customize Package",
    detail: "To Match Your Budget",
  },
  { Icon: Phone, label: "24×7 Support", detail: "Travel Experts" },
];

export type PackageTrustStripProps = {
  className?: string;
};

export function PackageTrustStrip({ className }: PackageTrustStripProps) {
  return (
    <div
      aria-label="Why book with Uno Trips"
      role="group"
      className={cn(
        "w-full rounded-2xl border border-white/20 bg-white/10 px-2.5 py-2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-5 sm:py-3.5",
        className,
      )}
    >
      {/* Mobile scrolls rather than wraps; the scrollbar is hidden so the row
          still reads as a trust line. `w-max mx-auto` centres the row while it
          fits and lets it overflow cleanly when it does not. From sm up the
          overflow and flex rules switch off and the approved 3-column grid
          takes over unchanged. */}
      <div className="overflow-x-auto [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex w-max flex-nowrap items-center sm:mx-0 sm:grid sm:w-auto sm:grid-cols-3">
          {TRUST_ITEMS.map(({ Icon, label, shortLabel, detail }, index) => (
            <li
              key={label}
              className={cn(
                "flex shrink-0 items-center justify-center gap-1 sm:gap-2.5",
                // Hairline divider between columns — desktop only, where the
                // items actually sit side by side.
                index > 0 && "sm:border-l sm:border-white/20",
              )}
            >
              {/* Bullet separator — mobile only. */}
              {index > 0 ? (
                <span className="mx-1.5 text-white/40 sm:hidden" aria-hidden>
                  •
                </span>
              ) : null}

              <Icon
                className="h-4 w-4 shrink-0 text-white/70 sm:h-[18px] sm:w-[18px]"
                strokeWidth={1.75}
                aria-hidden
              />

              {/* Label only on mobile; label over qualifier from sm up. */}
              <span className="flex items-baseline sm:flex-col sm:items-center sm:gap-0.5">
                <span className="whitespace-nowrap text-[13px] font-semibold leading-tight text-white sm:text-[14px]">
                  {/* Only one of these is ever in the layout — and therefore in
                      the accessibility tree — at a given breakpoint. */}
                  <span className="sm:hidden">{shortLabel ?? label}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
                <span className="hidden text-[11px] font-medium leading-tight text-white/70 sm:block sm:text-[12px]">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PackageTrustStrip;
