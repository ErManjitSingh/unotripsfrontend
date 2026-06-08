"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { useAuthOptional } from "@/contexts/auth-context";
import { navigateAfterAuth } from "@/lib/auth-navigation";

export function SignupPageClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const auth = useAuthOptional();

  useEffect(() => {
    if (auth?.isAuthenticated && !auth.isLoading) {
      navigateAfterAuth(redirectTo);
    }
  }, [auth?.isAuthenticated, auth?.isLoading, redirectTo]);

  if (auth?.isLoading || auth?.isAuthenticated) {
    return (
      <p className="flex items-center justify-center gap-2 py-8 text-sm text-[#757575]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Redirecting…
      </p>
    );
  }

  return <SignupForm redirectTo={redirectTo} />;
}
