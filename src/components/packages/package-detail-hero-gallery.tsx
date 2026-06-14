"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroTestimonial = {
  quote: string;
  name: string;
  metaLine: string;
};

type Props = {
  tourTitle: string;
  images: string[];
  testimonials: HeroTestimonial[];
  guestPhotoExtraCount: number;
};

export function PackageDetailHeroGallery({
  tourTitle,
  images,
  testimonials,
  guestPhotoExtraCount,
}: Props) {
  const safeImages = useMemo(() => {
    const u = images.filter((img) => !!img && (/^https?:\/\//i.test(img) || img.startsWith("data:")));
    return u.length ? u : ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"];
  }, [images]);

  const [mainIdx, setMainIdx] = useState(0);
  const [tIdx, setTIdx] = useState(0);

  const mainSrc = safeImages[mainIdx % safeImages.length]!;
  const thumbSlots = [0, 1, 2].map((i) => safeImages[Math.min(i, safeImages.length - 1)]!);
  const t = testimonials[tIdx % testimonials.length]!;

  const prevT = useCallback(() => {
    setTIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const nextT = useCallback(() => {
    setTIdx((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 sm:gap-3 lg:flex-row lg:items-stretch">
      <div className="relative min-h-[220px] flex-1 overflow-hidden rounded-xl bg-slate-200 sm:min-h-[280px] sm:rounded-2xl lg:h-full lg:min-h-[min(52vw,420px)]">
        <Image
          src={mainSrc}
          alt={tourTitle}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 75vw"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent sm:from-black/45"
          aria-hidden
        />

        <div className="absolute inset-0 hidden p-4 sm:p-5 lg:block">
          <div className="pointer-events-auto ml-auto flex h-full max-w-[min(100%,300px)] flex-col justify-center">
            <div className="rounded-xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] leading-snug text-slate-800 sm:text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={prevT}
                    className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 shadow-sm transition hover:bg-slate-50"
                    aria-label="Previous review"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextT}
                    className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 shadow-sm transition hover:bg-slate-50"
                    aria-label="Next review"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="mt-0.5">{t.metaLine}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 sm:hidden">
          <div className="rounded-lg border border-white/15 bg-black/55 p-3 text-white backdrop-blur-md">
            <p className="text-xs leading-snug">&ldquo;{t.quote.slice(0, 140)}{t.quote.length > 140 ? "…" : ""}&rdquo;</p>
            <p className="mt-2 text-[11px] font-semibold">{t.name}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2 sm:gap-2 lg:h-full lg:w-[92px] lg:flex-col lg:justify-stretch xl:w-[100px]">
        {thumbSlots.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setMainIdx(i % safeImages.length)}
            className={cn(
              "relative aspect-[4/3] flex-1 overflow-hidden rounded-lg border-2 bg-slate-200 shadow-sm transition sm:aspect-square lg:aspect-auto lg:h-[calc((100%-16px)/3)] lg:flex-none lg:w-full",
              mainIdx % safeImages.length === i % safeImages.length
                ? "border-primary ring-2 ring-primary/25"
                : "border-transparent opacity-90 hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="100px" />
            {i === 2 ? (
              <span className="absolute inset-0 flex items-end justify-center bg-black/55 pb-2 text-[10px] font-bold uppercase tracking-wide text-white">
                +{guestPhotoExtraCount} guest photos
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}