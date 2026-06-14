"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { AnalyticsSummary, Property, PartnerBooking } from "@/lib/partner/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(dateStr));
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconPlus     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconRevenue  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
const IconBookings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
const IconOccupancy= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconRate     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17V13"/><path d="M12 17V9"/><path d="M16 17V11"/></svg>
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconKyc      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>

// ── Empty state ────────────────────────────────────────────────────────────────

const EMPTY_SUMMARY: AnalyticsSummary = {
  period:             "this_month",
  total_revenue:      0,
  total_bookings:     0,
  avg_occupancy_pct:  0,
  avg_daily_rate:     0,
  cancellation_rate:  0,
  top_room_type:      "—",
  revenue_change_pct: 0,
  booking_change_pct: 0,
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ width, height, radius }: { width?: number | string; height: number; radius?: number }) {
  return (
    <div style={{
      width: width ?? "100%", height,
      borderRadius: radius ?? 6,
      background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── PropertyStatusBadge ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  draft:          { label: "Draft",          bg: "#f8f8f8", color: "#666",    border: "#ddd",    dot: "#999"    },
  pending_review: { label: "Pending Review", bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#d97706" },
  approved:       { label: "Approved",       bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
  rejected:       { label: "Rejected",       bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
  inactive:       { label: "Inactive",       bg: "#f8f8f8", color: "#888",    border: "#e0e0e0", dot: "#aaa"    },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG["draft"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 9999,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.03em",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── KYC Banner ────────────────────────────────────────────────────────────────

function KycBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, flexWrap: "wrap",
      padding: "12px 18px", marginTop: 20,
      background: "rgba(201,168,76,0.06)",
      border: "1px solid rgba(201,168,76,0.25)",
      borderLeft: "3px solid #C9A84C",
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "rgba(201,168,76,0.1)", border: "1.5px solid rgba(201,168,76,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
        }}>
          💳
        </div>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
          Add your KYC &amp; bank details in{" "}
          <Link href="/partner/account" style={{ color: "#9B7D32", fontWeight: 600, textDecoration: "none" }}>
            Account
          </Link>
          {" "}to start receiving payouts.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <Link
          href="/partner/account"
          style={{
            padding: "6px 14px",
            background: "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
            color: "#fff", borderRadius: 9999,
            fontSize: 12, fontWeight: 600, textDecoration: "none",
            whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(201,168,76,0.3)",
          }}
        >
          Complete Account →
        </Link>
        <button
          onClick={onDismiss}
          style={{ background: "none", border: "none", fontSize: 18, color: "#9B9B9B", cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── DashboardHeader ───────────────────────────────────────────────────────────

function DashboardHeader({ isVerified, onAddProperty }: { isVerified: boolean; onAddProperty: () => void }) {
  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 20px",
    background: "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
    color: "#fff", borderRadius: 9999,
    fontSize: 13, fontWeight: 600,
    boxShadow: "0 2px 12px rgba(201,168,76,0.3)",
    transition: "opacity 0.2s, transform 0.15s",
    border: "none", cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 24, flexWrap: "wrap", gap: 12,
      paddingBottom: 20, borderBottom: "1px solid #E5E5E5",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", marginTop: 2 }} />
        </div>
        <p style={{ fontSize: 13, color: "#9B9B9B" }}>Here's your performance this month</p>
      </div>

      {isVerified ? (
        <Link
          href="/partner/properties/new"
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <IconPlus /> Add Property
        </Link>
      ) : (
        <button
          onClick={onAddProperty}
          style={btnStyle}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <IconPlus /> Add Property
        </button>
      )}
    </div>
  );
}

// ── KpiGrid ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, change, Icon }: {
  label: string; value: string; sub?: string; change?: number; Icon: () => JSX.Element;
}) {
  const positive = change !== undefined && change >= 0;
  return (
    <div
      style={{
        background: "#fff", border: "1px solid #E5E5E5",
        borderRadius: 12, padding: "20px 22px",
        position: "relative", overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#C9A84C"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(201,168,76,0.1)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
    >
      {/* Gold top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #C9A84C, #E8D5A0)" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon />
        </div>
        {change !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: positive ? "#15803d" : "#dc2626",
            background: positive ? "#f0fdf4" : "#fef2f2",
            padding: "3px 9px", borderRadius: 9999,
          }}>
            {positive ? "+" : ""}{change}%
          </span>
        )}
      </div>

      <div style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", marginBottom: sub ? 2 : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9B9B9B" }}>{sub}</div>}
    </div>
  );
}

function KpiGrid({ summary, loading }: { summary: AnalyticsSummary; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }} className="kpi-grid">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={138} />)}
      </div>
    );
  }

  const kpiItems = [
    { label: "Revenue",        value: formatPrice(summary.total_revenue),  sub: "This month",         change: summary.revenue_change_pct, Icon: IconRevenue   },
    { label: "Bookings",       value: String(summary.total_bookings),       sub: "This month",         change: summary.booking_change_pct, Icon: IconBookings  },
    { label: "Avg Occupancy",  value: `${summary.avg_occupancy_pct}%`,      sub: "Room nights filled", change: undefined,                  Icon: IconOccupancy },
    { label: "Avg Daily Rate", value: formatPrice(summary.avg_daily_rate), sub: "Per room per night", change: undefined,                  Icon: IconRate      },
  ] as const;

  return (
    <>
      {/* Desktop: 4 separate cards */}
      <div className="kpi-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {kpiItems.map(item => (
          <StatCard key={item.label} label={item.label} value={item.value} sub={item.sub} change={item.change as number | undefined} Icon={item.Icon} />
        ))}
      </div>

      {/* Mobile: single card, 2×2 internal grid */}
      <div className="kpi-mobile" style={{ marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #C9A84C, #E8D5A0)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 2 }}>
            {kpiItems.map((item, i) => {
              const positive = item.change !== undefined && (item.change as number) >= 0;
              return (
                <div key={item.label} style={{ padding: "18px 16px 16px", borderRight: i % 2 === 0 ? "1px solid #E5E5E5" : "none", borderBottom: i < 2 ? "1px solid #E5E5E5" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <item.Icon />
                    </div>
                    {item.change !== undefined && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: positive ? "#15803d" : "#dc2626", background: positive ? "#f0fdf4" : "#fef2f2", padding: "2px 7px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                        {positive ? "+" : ""}{item.change}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: "inherit", fontSize: 22, fontWeight: 700, color: "#0C0C0C", lineHeight: 1, marginBottom: 4 }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9B9B9B" }}>{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .kpi-mobile { display: none; }
        @media (max-width: 640px) {
          .kpi-desktop { display: none !important; }
          .kpi-mobile  { display: block !important; }
        }
      ` }} />
    </>
  );
}

// ── PropertiesList ────────────────────────────────────────────────────────────

function PropertiesList({ properties, loading, onAddProperty }: {
  properties: Partial<Property>[]; loading: boolean; onAddProperty: (e: React.MouseEvent) => void;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: "2px solid #E5E5E5", background: "#F9F7F2",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: "#C9A84C" }} />
          <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>
            My Properties
          </h2>
        </div>
        <Link href="/partner/properties" style={{
          fontSize: 12, color: "#9B7D32", fontWeight: 500,
          padding: "4px 10px", borderRadius: 9999,
          border: "1px solid rgba(201,168,76,0.35)",
          background: "rgba(201,168,76,0.06)", textDecoration: "none",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.06)"}
        >
          View all
        </Link>
      </div>

      {/* Body */}
      <div>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "14px 20px", borderBottom: "1px solid #E5E5E5" }}>
              <Skeleton width={52} height={44} radius={8} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton height={13} width="70%" />
                <Skeleton height={11} width="40%" />
              </div>
            </div>
          ))
        ) : properties.length === 0 ? (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#9B9B9B", fontSize: 13 }}>
            No properties listed yet.
          </div>
        ) : (
          properties.map((p, i) => (
            <Link key={p.id} href={`/partner/properties/${p.id}`} style={{
              display: "flex", gap: 12, padding: "14px 20px",
              borderBottom: i < properties.length - 1 ? "1px solid #E5E5E5" : "none",
              transition: "background 0.15s", textDecoration: "none",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#F9F7F2"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Thumbnail */}
              <div style={{
                width: 52, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                background: "#F5F3EE", border: "1px solid #E5E5E5",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {p.thumbnail_url
                  ? <img src={p.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "#9B9B9B" }}><IconBuilding /></span>
                }
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: "#9B9B9B", marginBottom: 6 }}>{(p as any).city}</div>
                <StatusBadge status={(p as any).status ?? "draft"} />
              </div>
            </Link>
          ))
        )}

        {/* Add property row */}
        <Link href="/partner/properties/new" onClick={onAddProperty} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "12px 20px", fontSize: 13, fontWeight: 500, color: "#9B7D32",
          borderTop: "1px solid #E5E5E5", background: "rgba(201,168,76,0.03)",
          transition: "background 0.15s", textDecoration: "none",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.03)"}
        >
          <IconPlus /> Add new property
        </Link>
      </div>
    </div>
  );
}

// ── RecentBookings ────────────────────────────────────────────────────────────

const BOOKING_STATUS_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  confirmed: { color: "#15803d", bg: "#f0fdf4", dot: "#22c55e" },
  completed: { color: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" },
  cancelled: { color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
  pending:   { color: "#b45309", bg: "#fffbeb", dot: "#f59e0b" },
  no_show:   { color: "#6b7280", bg: "#f9fafb", dot: "#9ca3af" },
};

function RecentBookings({ bookings, loading }: { bookings: PartnerBooking[]; loading: boolean }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 22px", borderBottom: "2px solid #E5E5E5", background: "#F9F7F2",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: "#C9A84C" }} />
          <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>
            Recent Bookings
          </h2>
        </div>
        <Link href="/partner/bookings" style={{
          fontSize: 12, color: "#9B7D32", fontWeight: 500,
          padding: "4px 10px", borderRadius: 9999,
          border: "1px solid rgba(201,168,76,0.35)",
          background: "rgba(201,168,76,0.06)", textDecoration: "none",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.06)"}
        >
          View all
        </Link>
      </div>

      {/* Rows */}
      <div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: "14px 22px", borderBottom: "1px solid #E5E5E5", display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton height={13} width="50%" />
              <Skeleton height={11} width="70%" />
            </div>
          ))
        ) : bookings.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", color: "#9B9B9B", fontSize: 13 }}>
            No bookings yet. Add a property to start receiving bookings.
          </div>
        ) : (
          bookings.map((b, i) => {
            const sc = BOOKING_STATUS_STYLE[b.status] ?? { color: "#666", bg: "#f9f9f9", dot: "#ccc" };
            const guestName = (b as any).guest_name ?? `${(b as any).guest_first_name ?? ""} ${(b as any).guest_last_name ?? ""}`.trim();
            return (
              <div key={b.id} style={{
                padding: "14px 22px", borderBottom: i < bookings.length - 1 ? "1px solid #E5E5E5" : "none",
                display: "flex", alignItems: "center", gap: 14, transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F9F7F2"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
              >
                {/* Guest avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13, color: "#9B7D32",
                }}>
                  {guestName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0C0C0C", marginBottom: 2 }}>{guestName}</div>
                  <div style={{ fontSize: 11, color: "#9B9B9B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.room_name} · {formatDateShort(b.check_in)} → {formatDateShort(b.check_out)}
                  </div>
                </div>

                {/* Amount + status */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: 4 }}>
                    {formatPrice(b.partner_payout)}
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontWeight: 500,
                    color: sc.color, background: sc.bg,
                    padding: "2px 8px", borderRadius: 9999, textTransform: "capitalize",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                    {b.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── SetupChecklist ────────────────────────────────────────────────────────────

function SetupChecklist({ onStartVerify }: { onStartVerify: () => void }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: "#0C0C0C", marginBottom: 3 }}>Complete Your Setup</h2>
          <p style={{ fontSize: 13, color: "#6B7280" }}>Verify your business to list properties and start receiving bookings.</p>
        </div>
        <button
          onClick={onStartVerify}
          style={{
            padding: "9px 20px",
            background: "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
            color: "#fff", border: "none", borderRadius: 9999,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(201,168,76,0.3)",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Start Verification →
        </button>
      </div>

      <div style={{
        background: "#fff", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12,
        overflow: "hidden", boxShadow: "0 2px 12px rgba(201,168,76,0.06)",
      }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, #C9A84C, #E8D5A0)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "rgba(201,168,76,0.06)", border: "1.5px solid rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconKyc />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#0C0C0C", marginBottom: 3 }}>Business KYC</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.55 }}>Submit your PAN, GSTIN, and business details for verification.</div>
          </div>
          <button
            onClick={onStartVerify}
            style={{
              padding: "8px 18px", background: "transparent", color: "#9B7D32",
              border: "1px solid rgba(201,168,76,0.4)", borderRadius: 9999,
              fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Start →
          </button>
        </div>
      </div>

      <p style={{ marginTop: 10, fontSize: 12, color: "#9B9B9B", lineHeight: 1.6 }}>
        Verification is instant. Once complete, you can list properties and start receiving bookings immediately.
      </p>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PartnerDashboardPage() {
  const router = useRouter();
  const { user, refreshUser, isLoading: authLoading, getAccessToken } = useAuth();

  const isVerified =
    user?.kyc_status === "verified" ||
    user?.partner_status === "approved";

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = !isVerified && !bannerDismissed;

  // ── Data state ──────────────────────────────────────────────────────────
  const [summary,    setSummary]    = useState<AnalyticsSummary>(EMPTY_SUMMARY);
  const [properties, setProperties] = useState<Partial<Property>[]>([]);
  const [bookings,   setBookings]   = useState<PartnerBooking[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Refresh user on mount so KYC badge in sidebar is current
  useEffect(() => {
    if (authLoading || !user?.id) return;
    refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (authLoading || !user?.id) return;

    let cancelled = false;
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);

    async function load() {
      try {
        const [summaryRes, propsRes, bookingsRes] = await Promise.allSettled([
          partnerApi.getAnalyticsSummary(token!, "this_month"),
          partnerApi.listProperties(token!, { page: 1, limit: 5 }),
          partnerApi.listBookings(token!, { sort: "newest", page: 1, limit: 5 }),
        ]);

        if (cancelled) return;

        if (summaryRes.status === "fulfilled")  setSummary(summaryRes.value);
        if (propsRes.status === "fulfilled")    setProperties(propsRes.value.properties ?? []);
        if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.bookings ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  return (
    <>
      <DashboardHeader
        isVerified={isVerified}
        onAddProperty={() => router.push("/partner/properties/new")}
      />

      <KpiGrid summary={summary} loading={loading} />

      {/* Soft KYC banner */}
      {showBanner && <KycBanner onDismiss={() => setBannerDismissed(true)} />}

      {/* Two-column lower section */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 28 }}
        className="dashboard-lower-grid"
      >
        <PropertiesList
          properties={properties}
          loading={loading}
          onAddProperty={() => router.push("/partner/properties/new")}
        />
        <RecentBookings bookings={bookings} loading={loading} />
      </div>

      {/* Quick links footer */}
      <div style={{
        marginTop: 28, paddingTop: 20,
        borderTop: "1px solid #E5E5E5",
        display: "flex", gap: 16, flexWrap: "wrap",
        fontSize: 13, color: "#6B7280",
      }}>
        <Link href="/partner/analytics" style={{ color: "#9B7D32", textDecoration: "none", fontWeight: 600 }}>View full analytics →</Link>
        <Link href="/partner/bookings"  style={{ color: "#9B7D32", textDecoration: "none", fontWeight: 600 }}>All bookings →</Link>
        <Link href="/partner/properties" style={{ color: "#9B7D32", textDecoration: "none", fontWeight: 600 }}>Manage properties →</Link>
        <Link href="/partner/account"   style={{ color: "#9B7D32", textDecoration: "none", fontWeight: 600 }}>Account & KYC →</Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (max-width: 900px) {
          .dashboard-lower-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
        }
      ` }} />
    </>
  );
}