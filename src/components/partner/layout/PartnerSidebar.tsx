"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconGrid     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const IconBuilding = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
const IconChart    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const IconSettings = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IconAccount  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconLogout   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconPlus     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconRates    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
const IconPayouts  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
const IconClose    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

// ── Nav config ─────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/partner/dashboard",  label: "Dashboard",         Icon: IconGrid,     exact: true  },
  { href: "/partner/properties", label: "Properties",        Icon: IconBuilding, exact: false },
  { href: "/partner/bookings",   label: "Bookings",          Icon: IconCalendar, exact: false },
  { href: "/partner/rates",      label: "Rates & Inventory", Icon: IconRates,    exact: false },
  { href: "/partner/analytics",  label: "Analytics",         Icon: IconChart,    exact: false },
  { href: "/partner/payouts",    label: "Payouts",           Icon: IconPayouts,  exact: false },
  { href: "/partner/settings",   label: "Settings",          Icon: IconSettings, exact: false },
  { href: "/partner/account",    label: "Account",           Icon: IconAccount,  exact: false },
];

// ── KYC badge ─────────────────────────────────────────────────────────────────
function KycBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 9999,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
      background: isVerified ? "rgba(22,163,74,0.08)" : "rgba(201,168,76,0.1)",
      color:      isVerified ? "#15803d" : "#9B7D32",
      border:     `1px solid ${isVerified ? "rgba(22,163,74,0.2)" : "rgba(201,168,76,0.25)"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isVerified ? "#16a34a" : "#C9A84C" }} />
      {isVerified ? "KYC Verified" : "KYC Pending"}
    </div>
  );
}

// ── Sidebar inner content (shared by desktop + mobile drawer) ─────────────────
function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isVerified =
    user?.kyc_status === "verified" ||
    user?.partner_status === "approved";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid #E5E5E5", flexShrink: 0 }}>
        <Link
          href="/"
          onClick={onNavClick}
          style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #0C0C0C, #2a2a2a)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 800, color: "#C9A84C", letterSpacing: "-0.02em" }}>U</span>
          </div>
          <div>
            <div style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", color: "#0C0C0C", lineHeight: 1.1 }}>UNO</div>
            <div style={{ fontSize: 9, color: "#C9A84C", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, lineHeight: 1.3 }}>Partner Portal</div>
          </div>
        </Link>
      </div>

      {/* Add Property CTA */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #E5E5E5", flexShrink: 0 }}>
        <Link
          href="/partner/properties/new"
          onClick={onNavClick}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 16px", width: "100%",
            background: "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
            color: "#fff", borderRadius: 9999,
            fontSize: 13, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 2px 12px rgba(201,168,76,0.35)",
          }}
        >
          <IconPlus /> Add Property
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px", scrollbarWidth: "none" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9B9B9B", padding: "0 10px", marginBottom: 8 }}>
          Main Menu
        </div>

        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "10px 12px", borderRadius: 10, marginBottom: 2,
                background: active ? "rgba(201,168,76,0.09)" : "transparent",
                color:      active ? "#9B7D32" : "#6B7280",
                fontSize: 13, fontWeight: active ? 600 : 400,
                borderLeft: `3px solid ${active ? "#C9A84C" : "transparent"}`,
                transition: "all 0.15s", textDecoration: "none",
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "rgba(201,168,76,0.12)" : "#F5F3EE",
                color:      active ? "#9B7D32" : "#9B9B9B",
              }}>
                <Icon />
              </span>

              {label}

              {/* Pending dot on Account when KYC not done */}
              {label === "Account" && !isVerified && (
                <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", flexShrink: 0 }} />
              )}
              {active && !(label === "Account" && !isVerified) && (
                <span style={{ marginLeft: "auto", color: "#C9A84C", fontSize: 18, lineHeight: 1, fontWeight: 300 }}>›</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* KYC badge */}
      <div style={{ padding: "10px 18px 12px", borderTop: "1px solid #E5E5E5", flexShrink: 0 }}>
        <Link href="/partner/account" onClick={onNavClick} style={{ textDecoration: "none" }}>
          <KycBadge isVerified={isVerified} />
        </Link>
      </div>

      {/* User info + Sign out */}
      <div style={{ borderTop: "1px solid #E5E5E5", padding: "14px 16px 18px", flexShrink: 0, background: "rgba(250,250,248,0.9)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", marginBottom: 10,
          borderRadius: 10, background: "#fff", border: "1px solid #E5E5E5",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))",
            border: "1.5px solid rgba(201,168,76,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: "#9B7D32",
          }}>
            {user?.name?.charAt(0).toUpperCase() ?? "P"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0C0C0C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name ?? "Partner"}
            </div>
            <div style={{ fontSize: 10, color: "#9B9B9B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email ?? ""}
            </div>
          </div>
        </div>

        <button
          onClick={async () => { await logout(); window.location.href = "/partner"; }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "9px 14px", width: "100%", borderRadius: 9,
            border: "1px solid #fecaca", background: "transparent", color: "#dc2626",
            fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <IconLogout /> Sign out
        </button>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface PartnerSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function PartnerSidebar({ mobileOpen, onClose }: PartnerSidebarProps) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop sidebar — always visible ≥ 901px ─────────────────────── */}
      <aside
        className="partner-sidebar-desktop"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 260, height: "100vh", zIndex: 100,
          background: "#fff",
          borderRight: "1px solid #E5E5E5",
          boxShadow: "2px 0 16px rgba(10,10,10,0.05)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            animation: "fadeInBackdrop 0.2s ease",
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <aside
        className="partner-sidebar-mobile"
        style={{
          position: "fixed", top: 0, left: 0,
          width: 280, maxWidth: "85vw",
          height: "100vh", zIndex: 201,
          background: "#fff",
          borderRight: "1px solid #E5E5E5",
          boxShadow: "4px 0 32px rgba(0,0,0,0.18)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        aria-label="Partner navigation"
      >
        {/* Close button inside drawer */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 10,
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 8, border: "1px solid #E5E5E5",
            background: "#fff", cursor: "pointer",
            color: "#6B7280",
          }}
        >
          <IconClose />
        </button>

        <SidebarContent onNavClick={onClose} />
      </aside>

      {/* ── Styles ────────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Desktop: show fixed sidebar, hide mobile drawer */
        .partner-sidebar-desktop { display: flex; flex-direction: column; }
        .partner-sidebar-mobile  { display: none; }

        @media (max-width: 900px) {
          /* Hide desktop sidebar on mobile */
          .partner-sidebar-desktop { display: none !important; }
          /* Show mobile drawer (visibility controlled by transform) */
          .partner-sidebar-mobile  { display: block; }
        }

        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Hide scrollbar inside nav */
        .partner-sidebar-desktop nav::-webkit-scrollbar,
        .partner-sidebar-mobile  nav::-webkit-scrollbar { display: none; }
      ` }} />
    </>
  );
}