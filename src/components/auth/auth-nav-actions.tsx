"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type AuthNavActionsProps = {
  variant?: "overlay" | "solid" | "ease";
  className?: string;
  onNavigate?: () => void;
};

export function AuthNavActions({ variant = "solid", className, onNavigate }: AuthNavActionsProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isOverlay = variant === "overlay";
  const isEase = variant === "ease";

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    onNavigate?.();
    await logout();
    router.push("/");
  };

  // Render a neutral placeholder on server AND client until hydration is complete.
  // This prevents the server skeleton vs. client auth-state mismatch.
  if (!mounted || isLoading) {
    return (
      <div
        className={cn("h-9 w-20 rounded-full sm:h-10", mounted && isLoading ? "animate-pulse bg-slate-200/80" : "bg-transparent", className)}
        aria-hidden
      />
    );
  }

  if (isAuthenticated && user) {
    const displayName = user.name?.split(" ")[0] || user.email?.split("@")[0] || "Guest";
    const roleLabel = user.role === "guest" ? "Guest" : user.role;

    return (
      <div className={cn("relative", className)}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "inline-flex h-9 max-w-[160px] items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold sm:h-10 sm:max-w-[200px] sm:px-3 sm:text-sm",
            isOverlay
              ? "border-white/30 bg-black/25 text-white backdrop-blur-sm"
              : isEase
                ? "border-[#E0E0E0] bg-white text-[#212121] hover:border-[#2196F3]/40"
                : "border-slate-200 bg-white text-slate-800 shadow-sm",
          )}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              isEase ? "bg-[#E3F2FD] text-[#1976D2]" : "bg-primary/15 text-primary",
            )}
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-lg border border-[#e0e0e0] bg-white py-1 shadow-lg"
              role="menu"
            >
              <div className="border-b border-[#eee] px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-[#212121]">{user.name}</p>
                <p className="truncate text-[11px] text-[#757575]">{user.email}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#EF6614]">
                  {roleLabel}
                </p>
              </div>
              <Link
                href="/account"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-[#424242] hover:bg-[#f5f5f5]"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate?.();
                }}
              >
                <User className="h-4 w-4" aria-hidden />
                My account
              </Link>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Logout
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  if (isEase) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Button
          asChild
          variant="ghost"
          className="hidden h-8 rounded-full px-3 text-[11px] font-semibold text-[#616161] hover:bg-[#F5F5F5] sm:inline-flex sm:h-9 sm:text-xs"
        >
          <Link href="/login" onClick={onNavigate}>
            Login
          </Link>
        </Button>
        <Button
          asChild
          className="h-8 rounded-full border-0 bg-[#2196F3] px-4 text-[11px] font-semibold text-white shadow-sm hover:bg-[#1E88E5] sm:h-9 sm:px-5 sm:text-xs"
        >
          <Link href="/signup" onClick={onNavigate}>
            Sign up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", className)}>
      <Button
        asChild
        variant="ghost"
        className={cn(
          "h-9 rounded-full px-3 text-xs font-semibold sm:h-10 sm:px-4 sm:text-sm",
          isOverlay
            ? "text-white hover:bg-white/15 hover:text-white"
            : "text-slate-700 hover:bg-slate-100",
        )}
      >
        <Link href="/login" onClick={onNavigate}>
          Login
        </Link>
      </Button>
      <Button
        asChild
        className={cn(
          "h-9 rounded-full px-3 text-xs font-semibold shadow-md sm:h-10 sm:px-4 sm:text-sm",
          isOverlay
            ? "border border-white/90 bg-transparent text-white shadow-none hover:bg-white/15 hover:text-white"
            : "bg-primary text-white hover:bg-primary/90",
        )}
      >
        <Link href="/signup" onClick={onNavigate}>
          Sign up
        </Link>
      </Button>
    </div>
  );
}
