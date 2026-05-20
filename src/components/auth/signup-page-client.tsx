"use client";

import { useSearchParams } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";

export function SignupPageClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  return <SignupForm redirectTo={redirectTo} />;
}
