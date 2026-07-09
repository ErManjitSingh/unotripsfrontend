"use client";

/**
 * src/components/packages/package-photo-grid.tsx
 *
 * Premium 5-image mosaic photo grid — large hero left, 2×2 grid right.
 * Hover scales each tile. Last tile shows "+N photos" overlay.
 * Clicking any tile opens a full-screen lightbox gallery.
 *
 * Design: no external libraries — pure CSS grid + Next.js Image.
 * Responsive: collapses to a 2-row grid on mobile.
 */

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  tourTitle: string;
  className?: string;
};

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIdx,
  title,
  onClose,
}: {
  images: string[];
  startIdx: number;
  title: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);

  const prev = useCallback(
    () => setIdx((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i + 1) % images.length),
    [images.length],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo gallery — ${title}`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-white/80">
          {idx + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/20 p-1.5 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="relative min-h-0 flex-1">
        <Image
          src={images[idx]!}
          alt={`${title} — photo ${idx + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority={idx === startIdx}
        />

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex shrink-0 gap-1.5 overflow-x-auto px-4 py-3">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition",
              i === idx
                ? "border-primary opacity-100"
                : "border-transparent opacity-50 hover:opacity-80",
            )}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === idx}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Photo Grid ────────────────────────────────────────────────────────────────

// Placeholder SVG shapes per tile index (shown when no real image)
function PlaceholderTile({ idx }: { idx: number }) {
  const fills = ["#EA580C", "#C8955C", "#F59E0B", "#6EE7B7", "#FDE68A"];
  const color = fills[idx % fills.length]!;
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, #fff4ec, #fde8cc)` }}
      aria-hidden="true"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <polygon points="4,44 24,8 44,44" fill={color} opacity=".25" />
        <circle cx="36" cy="12" r="8" fill="#FDE68A" opacity=".4" />
      </svg>
    </div>
  );
}

export function PackagePhotoGrid({ images, tourTitle, className }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Ensure we always have 5 slots
  const slots = Array.from({ length: 5 }, (_, i) => images[i] ?? null);
  const totalPhotos = images.length;
  const extraCount  = Math.max(0, totalPhotos - 5);

  return (
    <>
      <div
        className={cn(
          // Mobile: 2 rows, 2-col grid with first tile spanning
          // Desktop: 3-col, 2-row grid
          "grid h-[300px] overflow-hidden rounded-xl sm:h-[360px] lg:h-[400px]",
          "grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-[3px]",
          className,
        )}
      >
        {/* Tile 0 — large hero, spans both rows */}
        <button
          type="button"
          className="group relative col-span-1 row-span-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          onClick={() => setLightboxIdx(0)}
          aria-label={`Open photo gallery — photo 1 of ${totalPhotos}`}
        >
          {slots[0] ? (
            <Image
              src={slots[0]}
              alt={tourTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 66vw, 50vw"
              priority
            />
          ) : (
            <PlaceholderTile idx={0} />
          )}
          {/* Subtle dark gradient at bottom for "see all photos" hint */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" aria-hidden />
        </button>

        {/* Tiles 1–4 — 2×2 right grid */}
        {[1, 2, 3, 4].map((tileIdx) => {
          const src      = slots[tileIdx];
          const isLast   = tileIdx === 4;
          const showMore = isLast && extraCount > 0;

          return (
            <button
              key={tileIdx}
              type="button"
              className="group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              onClick={() => setLightboxIdx(tileIdx)}
              aria-label={
                showMore
                  ? `View all ${totalPhotos} photos`
                  : `Open photo gallery — photo ${tileIdx + 1} of ${totalPhotos}`
              }
            >
              {src ? (
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 33vw, 25vw"
                  loading="lazy"
                />
              ) : (
                <PlaceholderTile idx={tileIdx} />
              )}

              {/* +N overlay on last tile */}
              {showMore && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white backdrop-blur-[2px]">
                  <Grid2X2 className="h-5 w-5 opacity-90" aria-hidden />
                  <span className="text-sm font-semibold">+{extraCount} photos</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox — portal into body */}
      {lightboxIdx !== null && (
        <Lightbox
          images={images.length ? images : []}
          startIdx={lightboxIdx}
          title={tourTitle}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}
