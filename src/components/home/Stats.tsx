import { Award, MapPin, Star, Users } from "lucide-react";
import { STATS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAT_ICONS = [Users, MapPin, Star, Award] as const;

function formatStatValue(s: (typeof STATS)[number]): string {
  const decimals =
    "decimals" in s && typeof (s as { decimals?: number }).decimals === "number"
      ? (s as { decimals: number }).decimals
      : 0;
  const v = s.value;
  const suf = s.suffix;
  if (decimals > 0) return `${v.toFixed(decimals)}${suf}`;
  return `${v}${suf}`;
}

export type StatsProps = {
  className?: string;
};

export function Stats({ className }: StatsProps) {
  return (
    <section id="international" className={cn("pb-6 sm:pb-8", className)}>
      <div className="mx-auto w-full max-w-[1320px] px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:rounded-3xl lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = STAT_ICONS[i] ?? Star;
            return (
              <div
                key={s.id}
                className="flex flex-col items-center gap-3 px-6 py-8 sm:px-8 sm:py-10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="font-display text-3xl font-bold text-primary sm:text-4xl">
                  {formatStatValue(s)}
                </p>
                <p className="text-center text-sm font-medium text-slate-600">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
