import Image from "next/image";
import { Heart, MapPin, Plane, Star, TreePalm } from "lucide-react";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

function TripIcon({ icon }: { icon: Testimonial["tripIcon"] }) {
  if (icon === "heart") return <Heart className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  if (icon === "palm") return <TreePalm className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  return <Plane className="h-3.5 w-3.5 shrink-0" aria-hidden />;
}

export function TestimonialCard({ item: t }: { item: Testimonial }) {
  return (
    <figure
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm",
        t.featured
          ? "ring-2 ring-primary"
          : "border border-slate-100",
      )}
    >
      {/* Featured badge */}
      {t.featured && (
        <div className="absolute -top-px left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-b-xl bg-primary px-3 py-1">
          <Star className="h-3 w-3 fill-white text-white" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-wide text-white">Featured</span>
        </div>
      )}

      {/* Avatar + name + location */}
      <div className="flex items-center gap-4 pt-2">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
          <Image
            src={t.avatar}
            alt={t.name}
            fill
            className="object-cover"
            sizes="56px"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <figcaption className="text-[15px] font-bold text-slate-900">{t.name}</figcaption>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
            <MapPin className="h-3 w-3 shrink-0 text-primary" aria-hidden />
            {t.location}
          </p>
        </div>
        {/* Decorative quote mark */}
        <span
          className="pointer-events-none ml-auto select-none font-serif text-[80px] leading-none text-slate-100"
          aria-hidden
        >
          &ldquo;
        </span>
      </div>

      {/* Stars */}
      <div
        className="mt-5 flex gap-1"
        aria-label={`${t.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < t.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-100",
            )}
            aria-hidden
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
        &ldquo;{t.text}&rdquo;
      </blockquote>

      {/* Trip tag */}
      {t.trip && (
        <div className="mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary">
            <TripIcon icon={t.tripIcon} />
            {t.trip}
          </span>
        </div>
      )}
    </figure>
  );
}
