"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { CabPromoProvider } from "@/contexts/cab-promo-context";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CabPromoProvider>{children}</CabPromoProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
