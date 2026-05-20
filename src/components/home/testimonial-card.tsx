import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TestimonialCard({ item: t }: { item: Testimonial }) {
  return (
    <figure className="glass-panel flex h-full flex-col rounded-3xl p-6 shadow-glass">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white shadow-sm">
          <Image
            src={t.avatar}
            alt={t.name}
            fill
            className="object-cover"
            sizes="48px"
            loading="lazy"
          />
        </div>
        <div>
          <figcaption className="font-semibold text-ink">{t.name}</figcaption>
          <p className="text-xs text-slate-500">{t.location}</p>
        </div>
      </div>
      <div
        className="mt-4 flex gap-0.5 text-amber-400"
        aria-label={`${t.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < t.rating ? "fill-amber-400" : "fill-transparent",
            )}
            aria-hidden
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
        “{t.text}”
      </blockquote>
    </figure>
  );
}
