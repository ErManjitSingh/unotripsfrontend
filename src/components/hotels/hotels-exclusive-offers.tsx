"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Percent, Sparkles } from "lucide-react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiState } from "@/components/ui/api-state";
import { HotelsSectionHeader } from "@/components/hotels/hotels-section-header";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getActiveOffers } from "@/services/packages";
import { DEMO_EXCLUSIVE_OFFERS } from "@/lib/hotels-demo-offers";

type OfferItem = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge?: string;
};

function OfferCard({ title, subtitle, href, image, badge }: Omit<OfferItem, "key">) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={href}
      className="group relative flex h-[200px] w-full overflow-hidden rounded-2xl border border-slate-200/70 shadow-[0_12px_36px_-14px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_44px_-14px_rgba(234,88,12,0.35)] sm:h-[220px]"
    >
      {!loaded ? <Skeleton className="absolute inset-0 z-[1]" /> : null}
      <Image
        src={image}
        alt=""
        fill
        className={cn(
          "object-cover transition duration-700 group-hover:scale-110",
          loaded ? "opacity-100" : "opacity-0",
        )}
        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 400px"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
          <Sparkles className="h-3 w-3" aria-hidden />
          {badge ?? "Exclusive"}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-md transition group-hover:scale-110">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="line-clamp-2 text-lg font-bold leading-snug">{title}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
          <Percent className="h-3.5 w-3.5 shrink-0 text-orange-300" aria-hidden />
          <span className="line-clamp-1">{subtitle}</span>
        </p>
      </div>
    </Link>
  );
}

export function HotelsExclusiveOffers() {
  const offersQ = useQuery({ queryKey: ["packages", "offers", "active"], queryFn: getActiveOffers });

  const apiCards = useMemo(() => {
    const out: OfferItem[] = [];
    for (const o of offersQ.data ?? []) {
      if (!o.homepage_banner) continue;
      const href = o.linked_packages[0] ? `/packages/${o.linked_packages[0].slug}` : "/packages";
      out.push({
        key: o.id,
        title: o.name,
        subtitle: o.description ?? `${o.discount_value}% off selected stays`,
        href,
        image:
          o.banner_url?.startsWith("http")
            ? o.banner_url
            : "https://images.unsplash.com/photo-1566073771259-6a850609ee90?w=640&q=80",
        badge: "Package deal",
      });
    }
    return out;
  }, [offersQ.data]);

  const cards = apiCards.length > 0 ? apiCards.slice(0, 10) : DEMO_EXCLUSIVE_OFFERS;

  const isLoading = offersQ.isLoading;
  const isError = offersQ.isError;

  return (
    <section className="border-b border-slate-200/60 bg-gradient-to-b from-white to-orange-50/25 py-10 sm:py-12 lg:py-14">
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <HotelsSectionHeader
          eyebrow="Save more"
          title="Exclusive Offers"
          description="Limited-time deals on top hotels and holiday packages — grab them before they are gone."
        />

        <div className="relative mt-6 sm:mt-8">
          <ApiState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && cards.length === 0}
            emptyMessage="No offers available right now."
            onRetry={() => offersQ.refetch()}
            skeleton={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[220px] rounded-2xl" />
                ))}
              </div>
            }
          >
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={14}
                slidesPerView={1.08}
                slidesPerGroup={1}
                watchOverflow
                breakpoints={{
                  640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
                  1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 18 },
                }}
                className="handpicked-hotels-swiper trending-packages-swiper !pb-3 !pt-1"
              >
              {cards.map(({ key, ...cardProps }) => (
                <SwiperSlide key={key} className="h-auto">
                  <OfferCard {...cardProps} />
                </SwiperSlide>
              ))}
            </Swiper>
          </ApiState>
        </div>
      </div>
    </section>
  );
}
