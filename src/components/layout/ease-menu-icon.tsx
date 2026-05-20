import { MoreHorizontal } from "lucide-react";
import { easeMenuSpritePosition, type EaseMenuIconId } from "@/lib/ease-menu-sprite";
import { cn } from "@/lib/utils";

export type EaseMenuIconProps = {
  id: EaseMenuIconId;
  active?: boolean;
  size?: number;
  className?: string;
  label?: string;
};

/** Menu icon — sprite from `menu.png`, except **More** (three dots). */
export function EaseMenuIcon({
  id,
  active = false,
  size = 28,
  className,
  label,
}: EaseMenuIconProps) {
  if (id === "more") {
    return (
      <MoreHorizontal
        className={cn(
          "shrink-0",
          "text-[#EF6614]",
          className,
        )}
        style={{ width: size, height: size }}
        strokeWidth={2.25}
        aria-hidden={label ? undefined : true}
        aria-label={label}
      />
    );
  }

  const style = easeMenuSpritePosition(id, active, size);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
      style={{ width: style.width, height: style.height }}
    >
      <span
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className="block shrink-0 bg-no-repeat mix-blend-multiply"
        style={style}
      />
    </span>
  );
}
