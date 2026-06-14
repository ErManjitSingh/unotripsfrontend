import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  colors: { bg: string; text: string; border: string };
  className?: string;
}

export function StatusBadge({ label, colors, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
      colors.bg, colors.text, colors.border, className
    )}>
      {label}
    </span>
  );
}