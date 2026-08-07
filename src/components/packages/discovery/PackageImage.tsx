"use client";

/**
 * src/components/packages/discovery/PackageImage.tsx
 *
 * The hero block of a vertical package card: 4:3 image, wishlist control and
 * the badge stack. Sized for a grid tile, not a landscape row — the image is
 * the first thing that sells a ₹45k holiday, so it gets the full card width.
 */

import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

export type PackageImageProps = {
  src: string;
  alt: string;
  /** e.g. "5D / 4N" — bottom-left chip. */
  durationLabel?: string;
  /** Editorial badge on the first result. */
  showPopular?: boolean;
  /**
   * Discount percentage from the API (TourPackage.discountPct). Rendered as a
   * "20% OFF" badge. Only pass a real figure — this reads as a live offer.
   */
  discountPct?: number;
  /** Priority-load the first row of tiles. */
  priority?: boolean;
  className?: string;
};

export function PackageImage({
  src,
  alt,
  durationLabel,
  showPopular,
  discountPct,
  priority,
  className,
}: PackageImageProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const hasDiscount = typeof discountPct === "number" && discountPct > 0;

  // 16:10 rather than 4:3 — still a full-bleed hero, ~37px shorter per tile,
  // which is the single largest contributor to the compacted card height.
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden bg-slate-100", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
        sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
      />
      {/* Two-stop scrim: a deeper anchor at the very bottom fading through a
          soft mid-tone, rather than a single hard ramp. Seats the duration
          badge on the image instead of floating it, and keeps light photos
          (snow, beaches) from washing the badge out. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
        aria-hidden
      />
      {/* Faint top vignette so the wishlist control stays legible on bright skies */}
      <div
        className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent"
        aria-hidden
      />

      {/* Badges — top left */}
      <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
        {showPopular ? (
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm backdrop-blur-sm">
            Popular Today
          </span>
        ) : null}
        {hasDiscount ? (
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            {Math.round(discountPct!)}% Off
          </span>
        ) : null}
      </div>

      {/* Wishlist — top right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setWishlisted((w) => !w);
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={wishlisted}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:text-primary"
      >
        <Heart className={cn("h-4 w-4 transition", wishlisted && "fill-primary text-primary")} />
      </button>

      {/* Duration — bottom left */}
      {durationLabel ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {durationLabel}
        </span>
      ) : null}
    </div>
  );
}

export default PackageImage;
