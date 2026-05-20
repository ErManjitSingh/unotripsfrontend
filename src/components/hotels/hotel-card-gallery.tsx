"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HotelCardGalleryProps = {
  hotelId: string;
  hotelName: string;
  images: string[];
  dealOfDay?: boolean;
  className?: string;
};

const FALLBACK =
  "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=800&q=80";

export function HotelCardGallery({ hotelId, hotelName, images, dealOfDay, className }: HotelCardGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

  const markFailed = useCallback((src: string) => {
    setFailedUrls((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const slides = useMemo(() => {
    const ok = images.filter((src) => src && !failedUrls.has(src));
    if (ok.length > 0) return ok;
    if (!failedUrls.has(FALLBACK)) return [FALLBACK];
    return [];
  }, [images, failedUrls]);

  const slideCount = slides.length;
  const activeSrc = slideCount > 0 ? slides[activeIndex % slideCount]! : null;
  const canSlide = slideCount > 1;

  useEffect(() => {
    if (activeIndex >= slideCount && slideCount > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, slideCount]);

  const goPrev = useCallback(() => {
    if (!canSlide) return;
    setActiveIndex((i) => (i - 1 + slideCount) % slideCount);
  }, [canSlide, slideCount]);

  const goNext = useCallback(() => {
    if (!canSlide) return;
    setActiveIndex((i) => (i + 1) % slideCount);
  }, [canSlide, slideCount]);

  const goTo = useCallback(
    (index: number) => {
      if (slideCount < 1) return;
      setActiveIndex(index % slideCount);
    },
    [slideCount],
  );

  const navBtnClass =
    "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#212121] shadow-md transition hover:bg-white";

  const thumbSlots = [0, 1, 2] as const;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-200">
        {dealOfDay ? (
          <span className="absolute right-2 top-2 z-20 rounded-sm bg-[#EF6614] px-2.5 py-1 text-[10px] font-bold uppercase leading-tight tracking-wide text-white shadow-md">
            Deal of the Day
          </span>
        ) : null}
        {activeSrc ? (
          <Image
            key={`${hotelId}-${activeIndex}-${activeSrc}`}
            src={activeSrc}
            alt={`${hotelName} — photo ${activeIndex + 1}`}
            fill
            unoptimized
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 260px"
            priority={activeIndex === 0}
            onError={() => markFailed(activeSrc)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-300 text-neutral-600">
            <Building2 className="h-10 w-10 opacity-50" strokeWidth={1.5} aria-hidden />
            <span className="text-xs font-medium">Photo unavailable</span>
          </div>
        )}

        {canSlide && activeSrc ? (
          <>
            <button
              type="button"
              className={cn(navBtnClass, "left-2")}
              aria-label="Previous photo"
              onClick={goPrev}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              className={cn(navBtnClass, "right-2")}
              aria-label="Next photo"
              onClick={goNext}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {slides.map((_, index) => (
                <button
                  key={`${hotelId}-dot-${index}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    activeIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/60",
                  )}
                  aria-label={`Photo ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {slideCount > 0 ? (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {thumbSlots.map((slot) => {
            const src = slides[slot];
            if (!src) {
              return (
                <div
                  key={`${hotelId}-thumb-empty-${slot}`}
                  className="aspect-[4/3] rounded bg-neutral-100"
                  aria-hidden
                />
              );
            }
            return (
              <button
                key={`${hotelId}-thumb-${slot}`}
                type="button"
                onClick={() => goTo(slot)}
                className={cn(
                  "relative aspect-[4/3] w-full overflow-hidden rounded ring-2 ring-transparent transition",
                  activeIndex === slot && "ring-[#2196F3]",
                )}
                aria-label={`Show photo ${slot + 1}`}
                aria-current={activeIndex === slot ? "true" : undefined}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="64px"
                  onError={() => markFailed(src)}
                />
              </button>
            );
          })}
          <button
            type="button"
            onClick={goNext}
            disabled={!canSlide}
            className={cn(
              "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded text-[10px] font-semibold text-white transition",
              canSlide ? "bg-black/65 hover:bg-black/75" : "cursor-default bg-neutral-300 text-neutral-500",
            )}
          >
            {canSlide ? "View All" : `${slideCount} Photo`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
