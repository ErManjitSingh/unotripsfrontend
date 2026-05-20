import { STATS } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

/** Server-only stats so crawlers and “View Source” see real numbers, not animated zeros. */
export function Stats({ className }: StatsProps) {
  return (
    <section
      id="international"
      className={cn("relative overflow-hidden py-20 sm:py-24", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=70')] bg-cover bg-center opacity-25 motion-safe:md:animate-float"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/92 to-white" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-slate-100 bg-white/80 p-8 shadow-glass backdrop-blur-xl sm:grid-cols-2 sm:p-10 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.id} className="text-center">
              <p className="font-display text-4xl font-bold text-primary sm:text-5xl">
                {formatStatValue(s)}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
