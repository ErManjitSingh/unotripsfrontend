"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  className?: string;
};

/** Floating glass search module — form posts can wire to Laravel later. */
export function SearchBar({ className }: SearchBarProps) {
  return (
    <div
      className={cn(
        "glass-panel relative mx-auto w-full max-w-5xl rounded-3xl p-4 shadow-lift sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Search className="h-4 w-4" aria-hidden />
        </span>
        Tailor your journey
      </div>
      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Destination
          <Input placeholder="e.g. Switzerland" name="destination" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Duration
          <Input placeholder="5–7 nights" name="duration" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Budget (INR)
          <Input placeholder="From 75,000" name="budget" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Travel month
          <Input type="month" name="month" />
        </label>
        <div className="flex items-end">
          <Button type="submit" className="w-full" variant="accent" size="lg">
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
