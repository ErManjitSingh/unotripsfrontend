"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { HotelPhotoCategory } from "@/lib/hotels-catalog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  hotelName: string;
  photoCategories: HotelPhotoCategory[];
  allPhotos: string[];
};

function PhotoGrid({
  images,
  onPhotoClick,
}: {
  images: string[];
  onPhotoClick: (index: number) => void;
}) {
  if (images.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No photos in this category.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
      {images.map((src, i) => (
        <button
          key={src + i}
          type="button"
          onClick={() => onPhotoClick(i)}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200"
        >
          <Image
            src={src}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </button>
      ))}
    </div>
  );
}

function SinglePhotoView({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => setCurrent(initialIndex), [initialIndex]);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-white/60">
          {current + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10"
          aria-label="Back to gallery"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="relative flex-1 select-none">
        <Image
          src={images[current]}
          alt=""
          fill
          unoptimized
          className="object-contain"
          priority
        />
        {/* Prev / Next overlays */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="shrink-0 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded transition",
                  i === current ? "ring-2 ring-white" : "opacity-50 hover:opacity-80",
                )}
              >
                <Image src={src} alt="" fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HotelPhotoGalleryModal({
  open,
  onClose,
  hotelName,
  photoCategories,
  allPhotos,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightbox, setLightbox] = useState<{ open: boolean; images: string[]; index: number }>({
    open: false,
    images: [],
    index: 0,
  });

  useEffect(() => setMounted(true), []);

  // Lock body scroll & reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setActiveCategory("all");
      setLightbox((s) => ({ ...s, open: false }));
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard: Escape closes gallery if lightbox isn't open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightbox.open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, lightbox.open, onClose]);

  if (!open || !mounted) return null;

  const hasCategories = photoCategories.length > 0;

  const tabs = [
    { id: "all", label: "All Photos" },
    ...photoCategories.map((c) => ({ id: c.category, label: c.label })),
  ];

  const gridPhotos =
    activeCategory === "all"
      ? allPhotos
      : (photoCategories.find((c) => c.category === activeCategory)?.images ?? []);

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ open: true, images, index });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-white"
      role="dialog"
      aria-modal
      aria-label={`${hotelName} – Photo Gallery`}
    >
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{hotelName}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Category tabs ── */}
      {hasCategories && (
        <div className="shrink-0 overflow-x-auto border-b border-slate-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex px-4 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3 text-[13px] font-medium transition sm:text-sm",
                  activeCategory === tab.id
                    ? "border-[#EF6614] font-bold text-[#EF6614]"
                    : "border-transparent text-slate-500 hover:text-slate-800",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Photo grid ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {activeCategory === "all" && hasCategories ? (
          /* All tab: grouped by category */
          <div className="space-y-8">
            {photoCategories.map((cat) => (
              <div key={cat.category}>
                <h3 className="mb-3 text-sm font-bold text-slate-800">{cat.label}</h3>
                <PhotoGrid
                  images={cat.images}
                  onPhotoClick={(i) => openLightbox(cat.images, i)}
                />
              </div>
            ))}
            {/* Any photos not in categories (e.g., room images) */}
            {(() => {
              const categorised = new Set(photoCategories.flatMap((c) => c.images));
              const extra = allPhotos.filter((p) => !categorised.has(p));
              return extra.length > 0 ? (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-800">More Photos</h3>
                  <PhotoGrid images={extra} onPhotoClick={(i) => openLightbox(extra, i)} />
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <PhotoGrid
            images={gridPhotos}
            onPhotoClick={(i) => openLightbox(gridPhotos, i)}
          />
        )}
      </div>

      {/* ── Single-photo lightbox (slides over the grid) ── */}
      {lightbox.open && (
        <SinglePhotoView
          images={lightbox.images}
          initialIndex={lightbox.index}
          onClose={() => setLightbox((s) => ({ ...s, open: false }))}
        />
      )}
    </div>,
    document.body,
  );
}
