import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label?: string };
}

export function StatCard({ label, value, sub, icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/10", trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
          {trend !== undefined && (
            <p className={cn("mt-1 text-xs font-semibold", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
              {trend.label && <span className="ml-1 font-normal text-slate-400">{trend.label}</span>}
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}