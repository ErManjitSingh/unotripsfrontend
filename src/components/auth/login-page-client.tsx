"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { GuestLoginForm } from "@/components/auth/guest-login-form";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { useAuthOptional } from "@/contexts/auth-context";
import { getCabPartnerContext } from "@/lib/cab-partner-api";
import { navigateAfterAuth } from "@/lib/auth-navigation";
import { cn } from "@/lib/utils";

type AuthTab = "guest" | "email";

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const auth = useAuthOptional();
  const [tab, setTab] = useState<AuthTab>("guest");
  const explicitRedirect = searchParams.get("redirect");
  const requestedRole = searchParams.get("role");
  const redirectTo = useMemo(() => {
    if (requestedRole === "cab-partner") return "/cabs/partner/entry";
    if (explicitRedirect) return explicitRedirect;
    return "/account";
  }, [explicitRedirect, requestedRole]);
  const signupHref = useMemo(() => {
    const params = new URLSearchParams();
    if (explicitRedirect) params.set("redirect", explicitRedirect);
    if (requestedRole) params.set("role", requestedRole);
    const query = params.toString();
    return query ? `/signup?${query}` : "/signup";
  }, [explicitRedirect, requestedRole]);

  /**
   * Keep routing in this screen rather than letting a form immediately send
   * every signed-in user to /account. That gives us one reliable place to
   * resolve the cab-partner membership first.
   */
  const routeSignedInUser = useCallback(async () => {
    if (requestedRole === "cab-partner") {
      navigateAfterAuth("/cabs/partner/entry");
      return;
    }
    if (explicitRedirect) {
      navigateAfterAuth(explicitRedirect);
      return;
    }

    const token = auth?.getAccessToken();
    if (!token) {
      navigateAfterAuth("/account");
      return;
    }

    try {
      const partnerContext = await getCabPartnerContext(token);
      const isPartner = partnerContext.is_cab_partner || Boolean(partnerContext.application);
      navigateAfterAuth(isPartner ? "/cabs/partner/entry" : "/account");
    } catch {
      navigateAfterAuth("/account");
    }
  }, [auth, explicitRedirect, requestedRole]);

  useEffect(() => {
    if (!auth?.isAuthenticated || auth.isLoading) return;
    void routeSignedInUser();
  }, [auth?.isAuthenticated, auth?.isLoading, routeSignedInUser]);

  if (auth?.isLoading || auth?.isAuthenticated) {
    return (
      <p className="flex items-center justify-center gap-2 py-8 text-sm text-[#757575]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Redirecting…
      </p>
    );
  }

  return (
    <>
      <div className="mb-5 flex rounded-xl bg-[#f4efeb] p-1">
        {(
          [
            { id: "guest" as const, label: "Phone OTP" },
            { id: "email" as const, label: "Email" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-[13px] font-bold transition",
              tab === t.id
                ? "bg-white text-[#1f1820] shadow-sm ring-1 ring-[#e6ddd7]"
                : "text-[#7a7178] hover:text-[#403842]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "guest" ? (
        <GuestLoginForm redirectTo={redirectTo} onAuthComplete={() => void routeSignedInUser()} />
      ) : (
        <EmailLoginForm redirectTo={redirectTo} onAuthComplete={() => void routeSignedInUser()} />
      )}

      <p className="mt-4 text-center text-[12px] text-[#757575]">
        New here?{" "}
        <Link href={signupHref} className="font-bold text-[#ef6614] hover:underline">
          Create account
        </Link>
      </p>
    </>
  );
}
