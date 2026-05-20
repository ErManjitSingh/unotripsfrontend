"use client";

import { Children, isValidElement } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function TestimonialsCarousel({ children, className }: Props) {
  return (
    <Swiper
      modules={[Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5200, disableOnInteraction: false }}
      breakpoints={{
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
      }}
      className={className}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return null;
        return (
          <SwiperSlide key={child.key ?? `testimonial-slide-${index}`}>
            {child}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
