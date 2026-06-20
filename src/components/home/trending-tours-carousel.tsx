"use client";

import { Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

type Props = {
  children: React.ReactNode;
  className?: string;
  onSwiper?: (swiper: SwiperType) => void;
};

/** Booking-style row: up to 4 packages visible on xl; external nav buttons control it. */
export function TrendingToursCarousel({ children, className, onSwiper }: Props) {
  return (
    <Swiper
      onSwiper={onSwiper}
      spaceBetween={16}
      slidesPerView={1.5}
      slidesPerGroup={1}
      watchOverflow
      breakpoints={{
        640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
        1024: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
        1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 },
      }}
      className={cn("trending-packages-swiper", className)}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return null;
        return (
          <SwiperSlide key={child.key ?? `tour-slide-${index}`} className="h-auto">
            <div className="h-full">{child}</div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
