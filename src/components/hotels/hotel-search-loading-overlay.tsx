import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type HotelSearchLoadingOverlayProps = {
  className?: string;
  title?: string;
  subtitle?: string;
};

export function HotelSearchLoadingOverlay({
  className,
  title = "Searching hotels…",
  subtitle = "Finding the best prices for your stay",
}: HotelSearchLoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-white/92 backdrop-blur-[2px] sm:rounded-2xl",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#EF6614]/20"
          aria-hidden
        />
        <span
          className="absolute inset-1 animate-pulse rounded-full border-2 border-[#EF6614]/30"
          aria-hidden
        />
        <Loader2 className="relative h-9 w-9 animate-spin text-[#EF6614]" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-bold tracking-wide text-[#212121]">{title}</p>
      <p className="mt-1 text-xs text-[#757575]">{subtitle}</p>
    </div>
  );
}