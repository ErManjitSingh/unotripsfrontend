"use client";

import { BadgeCheck, Heart, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TagStyle = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const TAG_STYLES: Record<string, TagStyle> = {
  "Couple Friendly": {
    label: "Couple Friendly",
    icon: Heart,
    className:
      "border-[#f48fb1] bg-gradient-to-r from-[#fce4ec] via-[#f8bbd0] to-[#f48fb1]/40 text-[#880e4f] shadow-[0_1px_3px_rgba(233,30,99,0.2)]",
  },
  "Local IDs Accepted": {
    label: "Local IDs Accepted",
    icon: BadgeCheck,
    className:
      "border-[#64b5f6] bg-gradient-to-r from-[#e3f2fd] via-[#bbdefb] to-[#90caf9]/50 text-[#0d47a1] shadow-[0_1px_3px_rgba(25,118,210,0.2)]",
  },
};

const DEFAULT_STYLE: TagStyle = {
  label: "",
  icon: BadgeCheck,
  className: "border-[#e0e0e0] bg-[#f5f5f5] text-[#616161]",
};

function getTagStyle(tag: string): TagStyle {
  return TAG_STYLES[tag] ?? { ...DEFAULT_STYLE, label: tag };
}

export function HotelTagBadge({ tag, className }: { tag: string; className?: string }) {
  const style = getTagStyle(tag);
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
        style.className,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
      {style.label || tag}
    </span>
  );
}

export function HotelTagBadgeList({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <HotelTagBadge key={tag} tag={tag} />
      ))}
    </div>
  );
}
