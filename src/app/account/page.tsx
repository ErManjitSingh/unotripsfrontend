"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { HeroGlassNavbar } from "@/components/home/hero-glass-navbar";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { useAuth } from "@/contexts/auth-context";

const ACCOUNT_TABS = new Set(["bookings", "quotes", "reviews", "profile"]);

function AccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isAuthenticated, logout } = useAuth();
  // The server cannot read the browser's saved session. Keep the initial
  // browser render identical to the server render, then reveal account data
  // after hydration so React never has to replace this tree.
  const [hasMounted, setHasMounted] = useState(false);
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam && ACCOUNT_TABS.has(tabParam)
      ? (tabParam as "bookings" | "quotes" | "reviews" | "profile")
      : "bookings";

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    if (!isLoading && !isAuthenticated) {
      const next = tabParam === "quotes" ? "/account?tab=quotes" : "/account";
      router.replace(`/login?redirect=${encodeURIComponent(next)}`);
    }
  }, [hasMounted, isLoading, isAuthenticated, router, tabParam]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!hasMounted || isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <HeroGlassNavbar solid activeId="" showActiveUnderline={false} />
        <div className="flex flex-col items-center justify-center gap-3 px-4 pb-24 pt-28">
          <Loader2 className="h-9 w-9 animate-spin text-[#EF6614]" aria-hidden />
          <p className="text-sm font-medium text-[#757575]">Preparing your dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
        <HeroGlassNavbar solid activeId="" showActiveUnderline={false} />
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-32 lg:px-8">
          <AccountDashboard onLogout={handleLogout} initialTab={initialTab} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f5] text-[#212121] antialiased">
          <HeroGlassNavbar solid activeId="" showActiveUnderline={false} />
          <div className="flex flex-col items-center justify-center gap-3 px-4 pb-24 pt-28">
            <Loader2 className="h-9 w-9 animate-spin text-[#EF6614]" aria-hidden />
            <p className="text-sm font-medium text-[#757575]">Preparing your dashboard…</p>
          </div>
        </main>
      }
    >
      <AccountPageInner />
    </Suspense>
  );
}
