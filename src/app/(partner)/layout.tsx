"use client";

/**
 * src/app/(partner)/layout.tsx
 *
 * Auth guard + shell for the partner portal.
 *
 * Public paths  (no auth needed): /partner, /partner/register
 * Protected:     everything else — requires role === 'partner' | 'admin'
 *
 * LAYOUT
 * ──────
 * Desktop (> 900px):
 *   Fixed 260px sidebar on the left.
 *   Main content: marginLeft 260px, padding 36px 40px 60px.
 *
 * Mobile (≤ 900px):
 *   No sidebar visible by default.
 *   Sticky top header: UNO logo + page title + hamburger button.
 *   Hamburger opens PartnerSidebar as a slide-in drawer with backdrop.
 *   Main content: no left margin, padding 0 0 40px (header handles top space).
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PartnerSidebar } from "@/components/partner/layout/PartnerSidebar";

// ── Public path helpers ───────────────────────────────────────────────────────
const PUBLIC_EXACT    = new Set(["/partner", "/partner/register"]);
const PUBLIC_PREFIXES = ["/partner/register"];

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

// ── Page title from pathname ──────────────────────────────────────────────────
function getPageTitle(pathname: string): string {
  if (pathname.includes("/dashboard"))  return "Dashboard";
  if (pathname.includes("/properties")) return "Properties";
  if (pathname.includes("/bookings"))   return "Bookings";
  if (pathname.includes("/rates"))      return "Rates & Inventory";
  if (pathname.includes("/analytics"))  return "Analytics";
  if (pathname.includes("/payouts"))    return "Payouts";
  if (pathname.includes("/settings"))   return "Settings";
  if (pathname.includes("/account"))    return "Account";
  return "Partner Portal";
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F7F2" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid rgba(201,168,76,0.2)",
        borderTopColor: "#C9A84C",
        animation: "spin 0.7s linear infinite",
      }} />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg) } }` }} />
    </div>
  );
}

// ── Mobile header ─────────────────────────────────────────────────────────────
function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const title    = getPageTitle(pathname);

  return (
    <header
      className="partner-mobile-header"
      style={{
        display: "none",           // shown via CSS media query
        position: "sticky",
        top: 0,
        zIndex: 150,
        height: 56,
        background: "#fff",
        borderBottom: "1px solid #E5E5E5",
        boxShadow: "0 1px 8px rgba(10,10,10,0.06)",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 38, height: 38, borderRadius: 9,
          border: "1px solid #E5E5E5", background: "#FAFAF8",
          cursor: "pointer", color: "#0C0C0C", flexShrink: 0,
        }}
      >
        <IconMenu />
      </button>

      {/* Logo mark */}
      <div style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        background: "linear-gradient(135deg, #0C0C0C, #2a2a2a)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#C9A84C", letterSpacing: "-0.02em" }}>U</span>
      </div>

      {/* Page title */}
      <span style={{
        fontSize: 15, fontWeight: 700, color: "#0C0C0C",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        flex: 1,
      }}>
        {title}
      </span>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // AUDIT FIX (hydration mismatch): AuthProvider deliberately initialises
  // `isLoading` / `isAuthenticated` SYNCHRONOUSLY from localStorage (see
  // auth-context.tsx's own comment — done to avoid a loading flash on the
  // rest of the site). That's fine for a plain client render, but it means
  // the SERVER (no localStorage) and the CLIENT'S FIRST hydration pass can
  // disagree: server always sees isLoading=true/not-authenticated and
  // renders <Spinner/>, while an already-logged-in partner's browser
  // resolves isAuthenticated=true synchronously on that very first render
  // and tries to hydrate the real sidebar+content layout onto the
  // server's Spinner markup — a hard hydration mismatch (recoverable, but
  // logged as an error and forces a client-side re-render every time).
  //
  // `mounted` starts false identically on the server and on the client's
  // first render (a plain useState(false) has no environment-dependent
  // input, unlike auth state), so both sides render <Spinner/> for that
  // first pass no matter what auth-context already knows. Only after
  // hydration commits does the effect below flip it to true — a normal
  // post-mount client update, not part of hydration, so React handles the
  // Spinner → real-layout swap the ordinary way instead of erroring.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const pub = isPublic(pathname);

  // Auth guard
  useEffect(() => {
    if (isLoading || pub) return;
    if (!isAuthenticated) {
      router.replace(`/partner?return=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && user.role !== "partner" && user.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user, pathname, router, pub]);

  // Public pages — no shell at all
  if (pub) return <>{children}</>;

  // Spinner while auth bootstraps — ALSO shown pre-mount so the server
  // render and the client's first hydration pass always match (see
  // `mounted` comment above), even when a cached session would otherwise
  // let the real auth state resolve as "ready" immediately on the client.
  if (!mounted || isLoading || !isAuthenticated) return <Spinner />;

  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F2" }}>

      {/* Sidebar — handles both desktop fixed panel + mobile drawer */}
      <PartnerSidebar
        mobileOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Mobile sticky header — only visible on ≤ 900px */}
      <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />

      {/* Main content */}
      <main
        className="partner-main"
        style={{
          marginLeft: 260,
          minHeight: "100vh",
          padding: "36px 40px 60px",
        }}
      >
        {children}
      </main>

      {/* Responsive overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          /* Show mobile header */
          .partner-mobile-header {
            display: flex !important;
          }
          /* Remove desktop sidebar margin; header takes the top */
          .partner-main {
            margin-left: 0 !important;
            padding: 20px 16px 60px !important;
            min-height: calc(100vh - 56px) !important;
          }
        }
      ` }} />
    </div>
  );
}