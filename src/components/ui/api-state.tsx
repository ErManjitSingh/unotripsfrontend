"use client";

import type { ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ApiStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  skeleton?: ReactNode;
  children: ReactNode;
};

export function ApiState({ isLoading, isError, isEmpty, errorMessage = "Could not load data. Please try again.", emptyMessage = "No results found.", onRetry, skeleton, children }: ApiStateProps) {
  if (isLoading) return <>{skeleton ?? <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></div>}</>;
  if (isError) return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
      <AlertCircle className="h-8 w-8 text-red-500" aria-hidden />
      <p className="text-sm text-red-800">{errorMessage}</p>
      {onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button> : null}
    </div>
  );
  if (isEmpty) return <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">{emptyMessage}</p>;
  return <>{children}</>;
}