"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type HotelPhotoLightboxProps = {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  title?: string;
};

export function HotelPhotoLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  title,
}: HotelPhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const count = images.length;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    if (count < 2) return;
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    if (count < 2) return;
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !mounted || count === 0) return null;

  const current = images[index]!;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} photos` : "Hotel photos"}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white">
        <p className="min-w-0 truncate text-sm font-medium sm:text-base">
          {title ? <span className="opacity-90">{title} · </span> : null}
          Photo {index + 1} of {count}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-4"
        onClick={onClose}
      >
        <div
          className="relative h-[min(72vh,720px)] w-full max-w-[1100px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={current}
            alt={title ? `${title} photo ${index + 1}` : `Photo ${index + 1}`}
            fill
            unoptimized
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:left-4 sm:h-12 sm:w-12"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:right-4 sm:h-12 sm:w-12"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.5} aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition",
                i === index ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80",
              )}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
