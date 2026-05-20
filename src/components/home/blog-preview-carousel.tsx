"use client";

import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { BlogPost } from "@/lib/constants";
import { BlogPreviewCard } from "@/components/home/blog-preview-card";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type BlogPreviewCarouselProps = {
  posts: BlogPost[];
  className?: string;
};

export function BlogPreviewCarousel({ posts, className }: BlogPreviewCarouselProps) {
  if (posts.length === 0) return null;

  return (
    <div className={cn("blog-preview-swiper relative mt-8 sm:mt-10", className)}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true, dynamicBullets: true }}
        spaceBetween={20}
        slidesPerView={1.08}
        slidesPerGroup={1}
        watchOverflow
        breakpoints={{
          640: {
            slidesPerView: 2,
            slidesPerGroup: 2,
            spaceBetween: 18,
          },
          1024: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            spaceBetween: 24,
          },
        }}
        className="!overflow-visible pb-12"
      >
        {posts.map((post, index) => (
          <SwiperSlide key={post.id} className="!h-auto">
            <BlogPreviewCard post={post} priority={index < 3} className="h-full" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
