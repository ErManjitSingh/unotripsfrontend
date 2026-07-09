import Image from "next/image";
import { Heart, MapPin, Plane, Quote, Star, TreePalm } from "lucide-react";
import type { Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

function TripIcon({ icon }: { icon: Testimonial["tripIcon"] }) {
  if (icon === "heart") return <Heart className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  if (icon === "palm") return <TreePalm className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  return <Plane className="h-3.5 w-3.5 shrink-0" aria-hidden />;
}

export function TestimonialCard({ item: t }: { item: Testimonial }) {
  return (
    <figure className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-orange-100/80 bg-white/90 p-5 shadow-[0_16px_44px_-34px_rgba(15,23,42,0.55)]">
      <Quote className="absolute -right-1 -top-1 h-12 w-12 rotate-6 text-orange-50" strokeWidth={1.5} />

      <div className="relative flex items-center gap-3.5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-4 ring-orange-50">
          <Image
            src={t.avatar}
            alt={t.name}
            fill
            className="object-cover"
            sizes="48px"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <figcaption className="text-[15px] font-black text-slate-950">{t.name}</figcaption>
          <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            {t.location}
          </p>
        </div>
      </div>

      <div
        className="mt-4 flex gap-0.5"
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

      <blockquote className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-600">
        &ldquo;{t.text}&rdquo;
      </blockquote>

      {t.trip && (
        <div className="mt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[12px] font-bold text-primary">
            <TripIcon icon={t.tripIcon} />
            {t.trip}
          </span>
        </div>
      )}
    </figure>
  );
}
