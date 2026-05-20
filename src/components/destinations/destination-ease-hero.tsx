"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_FROM_CITY = "New Delhi";

export type DestinationEaseHeroProps = {
  title: string;
  image: string;
  destinationName: string;
  fromCity?: string;
  className?: string;
};

export function DestinationEaseHero({
  title,
  image,
  destinationName,
  fromCity = DEFAULT_FROM_CITY,
  className,
}: DestinationEaseHeroProps) {
  const router = useRouter();

  const onSearch = () => {
    router.push(
      `/packages?q=${encodeURIComponent(destinationName)}&from=${encodeURIComponent(fromCity)}`,
    );
  };

  return (
    <section
      className={cn("relative z-10 w-full overflow-hidden bg-[#1a1208]", className)}
      aria-label={title}
    >
      <div className="relative h-[min(300px,42vw)] min-h-[260px] w-full sm:h-[300px] sm:min-h-[300px]">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-[4.5rem] pt-8 text-center sm:px-6 sm:pb-20">
          <h1 className="max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-4xl md:text-[2.75rem]">
            {title}
          </h1>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-5 sm:px-4 sm:pb-6">
          <div className="flex w-full max-w-[920px] flex-col overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-[0_12px_40px_-8px_rgba(15,23,42,0.2)] sm:flex-row sm:items-stretch sm:rounded-full sm:pr-2">
            <div className="flex min-w-0 flex-1 flex-col border-b border-[#EEEEEE] sm:flex-row sm:border-b-0 sm:border-r sm:border-[#EEEEEE]">
              <div className="flex min-w-0 flex-1 items-center px-4 py-3 sm:py-0 sm:pl-6 sm:pr-4">
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[11px] font-medium text-[#9E9E9E]">From</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold text-[#212121] sm:text-base">
                    <MapPin className="h-4 w-4 shrink-0 text-[#4CAF50]" strokeWidth={2} aria-hidden />
                    <span className="truncate">{fromCity}</span>
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 items-center px-4 py-3 sm:py-0 sm:pr-4">
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[11px] font-medium text-[#9E9E9E]">To Destination/Category</p>
                  <p className="mt-0.5 flex items-center justify-between gap-2 text-[15px] font-semibold text-[#212121] sm:text-base">
                    <span className="truncate">{destinationName}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#9E9E9E]" strokeWidth={2} aria-hidden />
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onSearch}
              className="mx-2 mb-2 flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#EF6614] px-8 text-base font-bold text-white shadow-[0_4px_14px_-2px_rgba(239,102,20,0.45)] transition-colors hover:bg-[#E65100] sm:m-0 sm:h-auto sm:min-h-[52px] sm:rounded-full sm:px-10"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
