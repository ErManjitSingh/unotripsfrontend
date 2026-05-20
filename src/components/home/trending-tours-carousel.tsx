"use client";

import { Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Booking-style row: up to 4 packages visible on xl; arrows step a full “page”. */
export function TrendingToursCarousel({ children, className }: Props) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={16}
      slidesPerView={1.08}
      slidesPerGroup={1}
      watchOverflow
      breakpoints={{
        640: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 14,
        },
        1024: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 16,
        },
        1280: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          spaceBetween: 16,
        },
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
