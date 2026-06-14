"use client";

/**
 * src/app/(partner)/partner/properties/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 1000% replica of unohotelsandresorts.com/partner/properties
 *
 * Features:
 *   • 3-card KPI grid (Approved/Pending/Draft) — clickable status filters
 *   • RecentApproved strip — top 3 approved with thumbnail, stats, revenue
 *   • Filters bar — search + status tabs + sort select + date range picker + clear
 *   • Active filter pills
 *   • PropertyList — cards with thumbnail, status badge, stats, action buttons
 *
 * API: partnerApi.listProperties(token, { page, limit })
 */

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { Property } from "@/lib/partner/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "approved" | "pending_review" | "draft";
type SortOption   = "newest" | "oldest" | "revenue" | "rating" | "bookings";

interface FilterState {
  search:   string;
  status:   StatusFilter;
  sort:     SortOption;
  dateFrom: string;
  dateTo:   string;
}

const DEFAULT_FILTERS: FilterState = {
  search: "", status: "all", sort: "newest", dateFrom: "", dateTo: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconSearch   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconX        = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconArrow    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconBuilding = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconBuildingSm = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconBack     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12H5M12 5l-7 7 7 7"/></svg>;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Sk({ h = 14, w = "100%", r = 6 }: { h?: number; w?: number | string; r?: number }) {
  return (
    <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "propShimmer 1.4s infinite" }} />
  );
}

// ── PropertyStatusBadge ───────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  draft:          { label: "Draft",          bg: "#f8f8f8", color: "#666",    border: "#ddd",    dot: "#999"    },
  pending_review: { label: "Pending Review", bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#d97706" },
  approved:       { label: "Approved",       bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
  rejected:       { label: "Rejected",       bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
  inactive:       { label: "Inactive",       bg: "#f8f8f8", color: "#888",    border: "#e0e0e0", dot: "#aaa"    },
  pending:        { label: "Pending",        bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#d97706" },
};

function StatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.draft;
  const sm = size === "sm";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: sm ? "2px 8px" : "4px 10px", borderRadius: 9999, fontSize: sm ? 10 : 12, fontWeight: 600, letterSpacing: "0.03em", background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" as const }}>
      <span style={{ width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── KPI Grid ──────────────────────────────────────────────────────────────────

const KPI_ITEMS = [
  { key: "approved"      as StatusFilter, label: "Approved",      sub: "Live on platform",   color: "#15803d" },
  { key: "pending_review" as StatusFilter, label: "Pending Review", sub: "Under verification", color: "#b45309" },
  { key: "draft"         as StatusFilter, label: "Draft",         sub: "Not yet submitted",  color: "#888888" },
];

function PropertyKpiGrid({ counts, activeFilter, loading, onFilter }: {
  counts: Record<StatusFilter, number>; activeFilter: StatusFilter;
  loading: boolean; onFilter: (s: StatusFilter) => void;
}) {
  if (loading) {
    return (
      <>
        <div className="prop-kpi-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 96, borderRadius: 12, background: "#f4f4f4" }} />)}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes propShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}.prop-kpi-mobile{display:none}@media(max-width:640px){.prop-kpi-desktop{display:none!important}.prop-kpi-mobile{display:block!important}}` }} />
      </>
    );
  }

  return (
    <>
      {/* Desktop: 3 cards */}
      <div className="prop-kpi-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {KPI_ITEMS.map(item => {
          const active = activeFilter === item.key;
          return (
            <div key={item.key} role="button" aria-pressed={active}
              onClick={() => onFilter(active ? "all" : item.key)}
              style={{ background: "#fff", border: `1.5px solid ${active ? item.color : "#E5E5E5"}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", boxShadow: active ? `0 4px 18px ${item.color}22` : "none", position: "relative", overflow: "hidden", userSelect: "none" as const }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderColor = item.color + "66"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5"; }}
            >
              {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: item.color }} />}
              <div style={{ fontFamily: "inherit", fontSize: 32, fontWeight: 700, color: "#0C0C0C", lineHeight: 1, marginBottom: 6 }}>{counts[item.key]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: active ? item.color : "#6B7280", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#9B9B9B" }}>{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Mobile: single card */}
      <div className="prop-kpi-mobile" style={{ marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1.5px solid #E5E5E5", borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#C9A84C,#E8D5A0)", zIndex: 1 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 2 }}>
            {KPI_ITEMS.map((item, i) => {
              const active = activeFilter === item.key;
              const isLast = i === KPI_ITEMS.length - 1;
              return (
                <div key={item.key} role="button" aria-pressed={active}
                  onClick={() => onFilter(active ? "all" : item.key)}
                  style={{ padding: "18px 16px 16px", cursor: "pointer", userSelect: "none" as const, position: "relative", gridColumn: isLast ? "1 / -1" : undefined, borderRight: !isLast && i % 2 === 0 ? "1px solid #E5E5E5" : "none", borderBottom: !isLast ? "1px solid #E5E5E5" : "none", background: active ? `${item.color}08` : "transparent", transition: "background 0.15s" }}>
                  {active && <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 3, background: item.color, borderRadius: "0 2px 2px 0" }} />}
                  <div style={{ fontFamily: "inherit", fontSize: 28, fontWeight: 700, color: active ? item.color : "#0C0C0C", lineHeight: 1, marginBottom: 5 }}>{counts[item.key]}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? item.color : "#6B7280", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9B9B9B" }}>{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes propShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}.prop-kpi-mobile{display:none}@media(max-width:640px){.prop-kpi-desktop{display:none!important}.prop-kpi-mobile{display:block!important}}` }} />
    </>
  );
}

// ── RecentApproved ────────────────────────────────────────────────────────────

function RecentApproved({ properties }: { properties: Partial<Property>[] }) {
  const approved = properties.filter(p => p.status === "approved").slice(0, 3);
  if (approved.length === 0) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "2px solid #E5E5E5", background: "#F9F7F2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: "#C9A84C" }} />
          <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>Recently Approved</h2>
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 10px", borderRadius: 9999 }}>
          {approved.length} live
        </span>
      </div>

      {approved.map((p, i) => (
        <Link key={p.id} href={`/partner/properties/${p.id}`}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: i < approved.length - 1 ? "1px solid #E5E5E5" : "none", transition: "background 0.15s", textDecoration: "none" }}
          onMouseEnter={e => e.currentTarget.style.background = "#F9F7F2"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ width: 44, height: 38, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#F9F7F2", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <IconBuildingSm />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#9B9B9B" }}>{p.city}, {p.state}</div>
          </div>
          <div style={{ display: "flex", gap: 20, flexShrink: 0, textAlign: "center" as const }}>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: "#0C0C0C" }}>{p.room_count ?? 0}</div><div style={{ fontSize: 10, color: "#9B9B9B" }}>Rooms</div></div>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: "#0C0C0C" }}>{p.booking_count ?? 0}</div><div style={{ fontSize: 10, color: "#9B9B9B" }}>Bookings</div></div>
            <div><div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>{fmtPrice(p.total_revenue ?? 0)}</div><div style={{ fontSize: 10, color: "#9B9B9B" }}>Revenue</div></div>
          </div>
          <span style={{ color: "#9B9B9B", flexShrink: 0 }}><IconArrow /></span>
        </Link>
      ))}
    </div>
  );
}

// ── PropertyFilters ───────────────────────────────────────────────────────────

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",            label: "All"      },
  { key: "approved",       label: "Approved" },
  { key: "pending_review", label: "Pending"  },
  { key: "draft",          label: "Draft"    },
];

const STATUS_COLORS: Record<StatusFilter, string> = {
  all:            "#0C0C0C",
  approved:       "#15803d",
  pending_review: "#b45309",
  draft:          "#888888",
};

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 9999, fontSize: 11, color: "#9B7D32", fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9B7D32", display: "flex" }}><IconX /></button>
    </span>
  );
}

function PropertyFilters({ filters, counts, onFilterChange, onClearAll }: {
  filters: FilterState; counts: Record<StatusFilter, number>;
  onFilterChange: (p: Partial<FilterState>) => void; onClearAll: () => void;
}) {
  const [showDate, setShowDate] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  const hasDate   = !!(filters.dateFrom || filters.dateTo);
  const hasActive = filters.status !== "all" || !!filters.search || hasDate;

  const dateLabel = filters.dateFrom && filters.dateTo ? `${filters.dateFrom} → ${filters.dateTo}`
    : filters.dateFrom ? `From ${filters.dateFrom}`
    : filters.dateTo   ? `Until ${filters.dateTo}`
    : "Date range";

  useEffect(() => {
    if (!showDate) return;
    const h = (e: MouseEvent) => { if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDate(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showDate]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 180, background: "#F9F7F2", border: "1px solid #E5E5E5", borderRadius: 9, padding: "7px 12px" }}>
          <span style={{ color: "#9B9B9B", flexShrink: 0 }}><IconSearch /></span>
          <input value={filters.search} onChange={e => onFilterChange({ search: e.target.value })}
            placeholder="Search by name or city…"
            style={{ border: "none", background: "transparent", fontSize: 13, color: "#0C0C0C", outline: "none", width: "100%" }} />
          {filters.search && <button onClick={() => onFilterChange({ search: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9B9B", padding: 0, display: "flex" }}><IconX /></button>}
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {STATUS_TABS.map(tab => {
            const active = filters.status === tab.key;
            const color  = STATUS_COLORS[tab.key];
            return (
              <button key={tab.key} onClick={() => onFilterChange({ status: tab.key })} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${active ? color : "#E5E5E5"}`, background: active ? color + "14" : "#fff", color: active ? color : "#6B7280", fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const, transition: "all 0.15s" }}>
                {tab.label}
                {counts[tab.key] > 0 && <span style={{ opacity: 0.65, marginLeft: 4 }}>({counts[tab.key]})</span>}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select value={filters.sort} onChange={e => onFilterChange({ sort: e.target.value as SortOption })}
          style={{ padding: "7px 12px", borderRadius: 9, border: "1px solid #E5E5E5", background: "#F9F7F2", fontSize: 12, color: "#6B7280", cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="revenue">Highest revenue</option>
          <option value="rating">Highest rating</option>
          <option value="bookings">Most bookings</option>
        </select>

        {/* Date picker */}
        <div ref={dateRef} style={{ position: "relative" }}>
          <button onClick={() => setShowDate(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9, border: `1px solid ${hasDate ? "#C9A84C" : "#E5E5E5"}`, background: hasDate ? "rgba(201,168,76,0.06)" : "#F9F7F2", color: hasDate ? "#9B7D32" : "#6B7280", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
            <IconCalendar />{dateLabel}
            {hasDate && (
              <span onClick={e => { e.stopPropagation(); onFilterChange({ dateFrom: "", dateTo: "" }); }} style={{ marginLeft: 2, display: "flex", color: "#9B7D32" }}><IconX /></span>
            )}
          </button>
          {showDate && (
            <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 240 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Filter by date added</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#9B9B9B", display: "block", marginBottom: 4 }}>From</label>
                  <input type="date" value={filters.dateFrom} onChange={e => onFilterChange({ dateFrom: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #E5E5E5", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", color: "#0C0C0C", boxSizing: "border-box" as const }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#9B9B9B", display: "block", marginBottom: 4 }}>To</label>
                  <input type="date" value={filters.dateTo} onChange={e => onFilterChange({ dateTo: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: "1px solid #E5E5E5", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", color: "#0C0C0C", boxSizing: "border-box" as const }} />
                </div>
                <button onClick={() => setShowDate(false)} style={{ padding: "8px", background: "#0C0C0C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Apply</button>
              </div>
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasActive && (
          <button onClick={onClearAll} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
            <IconX /> Clear filters
          </button>
        )}
      </div>

      {/* Active pills */}
      {hasActive && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
          {filters.status !== "all" && <FilterPill label={`Status: ${STATUS_TABS.find(t => t.key === filters.status)?.label}`} onRemove={() => onFilterChange({ status: "all" })} />}
          {filters.search && <FilterPill label={`"${filters.search}"`} onRemove={() => onFilterChange({ search: "" })} />}
          {hasDate && <FilterPill label={dateLabel} onRemove={() => onFilterChange({ dateFrom: "", dateTo: "" })} />}
        </div>
      )}
    </div>
  );
}

// ── PropertyListItem ──────────────────────────────────────────────────────────

function Stat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{ textAlign: "center" as const }}>
      <div style={{ fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: color ?? "#0C0C0C" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#9B9B9B" }}>{label}</div>
    </div>
  );
}

function StatusHint({ bg, border, color, children }: { bg: string; border: string; color: string; children: React.ReactNode }) {
  return <div style={{ padding: "8px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 8, fontSize: 12, color }}>{children}</div>;
}

function PropertyListItem({ property: p }: { property: Partial<Property> }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", display: "flex", transition: "box-shadow 0.2s, border-color 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.4)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5"; }}
    >
      {/* Thumbnail */}
      <div className="prop-img" style={{ width: 130, flexShrink: 0, minHeight: 110, background: "#F9F7F2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {p.thumbnail_url
          ? <img src={p.thumbnail_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <IconBuilding />
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        {/* Left — name, location, status, date */}
        <div style={{ minWidth: 160 }}>
          <div style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: "#0C0C0C", marginBottom: 3 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>{p.city}, {p.state}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {p.status && <StatusBadge status={p.status} />}
            <span style={{ fontSize: 11, color: "#9B9B9B" }}>Added {fmtDate(p.created_at ?? "")}</span>
          </div>
        </div>

        {/* Middle — stats (approved) or status hint */}
        {p.status === "approved" && (
          <div style={{ display: "flex", gap: 20, flexShrink: 0, textAlign: "center" as const }}>
            <Stat value={p.room_count ?? 0}                         label="Rooms"    />
            <Stat value={p.booking_count ?? 0}                      label="Bookings" />
            <Stat value={(p.avg_rating ?? 0).toFixed(1)}            label="Rating"   />
            <Stat value={fmtPrice(p.total_revenue ?? 0)}            label="Revenue"  color="#15803d" />
          </div>
        )}
        {p.status === "draft"          && <StatusHint bg="#f8f8f8" border="#e0e0e0" color="#666">Complete and submit to list on platform</StatusHint>}
        {p.status === "pending_review" && <StatusHint bg="#fffbeb" border="#fde68a" color="#b45309">Under review · Est. 24–48 hrs</StatusHint>}
        {p.status === "rejected"       && <StatusHint bg="#fef2f2" border="#fecaca" color="#dc2626">Rejected — edit and resubmit</StatusHint>}

        {/* Right — action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {p.status === "approved" && (
            <Link href={`/partner/properties/${p.id}/rooms`}
              style={{ padding: "7px 14px", borderRadius: 9999, border: "1px solid #E5E5E5", background: "#fff", fontSize: 12, color: "#6B7280", fontWeight: 500, textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#0C0C0C"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E5E5"}
            >
              Rooms
            </Link>
          )}
          <Link href={`/partner/properties/${p.id}`}
            style={{ padding: "7px 14px", borderRadius: 9999, background: "#0C0C0C", color: "#fff", fontSize: 12, fontWeight: 500, textDecoration: "none", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {p.status === "draft" ? "Continue →" : "Edit"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── PropertyList ──────────────────────────────────────────────────────────────

function PropertyList({ properties, loading, hasFilters, onClear }: {
  properties: Partial<Property>[]; loading: boolean; hasFilters: boolean; onClear: () => void;
}) {
  if (loading) return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{Array.from({ length: 3 }).map((_, i) => <Sk key={i} h={110} />)}</div>;

  if (properties.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{hasFilters ? "🔍" : "🏨"}</div>
        <h3 style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 600, color: "#0C0C0C", marginBottom: 8 }}>
          {hasFilters ? "No properties match your filters" : "No properties yet"}
        </h3>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
          {hasFilters ? "Try adjusting or clearing your filters." : "List your first property to start receiving bookings."}
        </p>
        {hasFilters ? (
          <button onClick={onClear} style={{ padding: "9px 20px", background: "#0C0C0C", color: "#fff", border: "none", borderRadius: 9999, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Clear filters</button>
        ) : (
          <Link href="/partner/properties/new" style={{ display: "inline-block", padding: "9px 20px", background: "#0C0C0C", color: "#fff", borderRadius: 9999, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Add first property</Link>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {properties.map(p => <PropertyListItem key={p.id} property={p} />)}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PartnerPropertiesPage() {
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const token = getAccessToken();

  const [loading,    setLoading]    = useState(true);
  const [properties, setProperties] = useState<Partial<Property>[]>([]);
  const [filters,    setFilters]    = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    if (authLoading || !token) return;
    let cancelled = false;
    setLoading(true);

    partnerApi.listProperties(token, { page: 1, limit: 100 })
      .then(res => { if (!cancelled) setProperties(res.properties ?? []); })
      .catch(() => { if (!cancelled) setProperties([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [authLoading, token]);

  const counts = useMemo(() => ({
    all:            properties.length,
    approved:       properties.filter(p => p.status === "approved").length,
    pending_review: properties.filter(p => p.status === "pending_review").length,
    draft:          properties.filter(p => p.status === "draft").length,
  }), [properties]);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (filters.status !== "all") list = list.filter(p => p.status === filters.status);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q) || p.state?.toLowerCase().includes(q));
    }
    if (filters.dateFrom) list = list.filter(p => p.created_at && p.created_at >= filters.dateFrom);
    if (filters.dateTo)   list = list.filter(p => p.created_at && p.created_at <= filters.dateTo + "T23:59:59Z");

    list.sort((a, b) => {
      switch (filters.sort) {
        case "newest":   return (b.created_at ?? "").localeCompare(a.created_at ?? "");
        case "oldest":   return (a.created_at ?? "").localeCompare(b.created_at ?? "");
        case "revenue":  return (b.total_revenue  ?? 0) - (a.total_revenue  ?? 0);
        case "rating":   return (b.avg_rating     ?? 0) - (a.avg_rating     ?? 0);
        case "bookings": return (b.booking_count  ?? 0) - (a.booking_count  ?? 0);
        default: return 0;
      }
    });
    return list;
  }, [properties, filters]);

  const hasActiveFilters = filters.status !== "all" || !!filters.search || !!filters.dateFrom || !!filters.dateTo;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12, paddingBottom: 20, borderBottom: "1px solid #E5E5E5" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em" }}>Properties</h1>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", marginTop: 2 }} />
          </div>
          <div style={{ fontSize: 13, color: "#9B9B9B" }}>
            {loading ? <Sk w={120} h={14} /> : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"} listed`}
          </div>
        </div>
        <Link href="/partner/properties/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)", color: "#fff", borderRadius: 9999, fontSize: 13, fontWeight: 600, boxShadow: "0 2px 12px rgba(201,168,76,0.3)", textDecoration: "none" }}>
          + Add Property
        </Link>
      </div>

      <PropertyKpiGrid counts={counts as Record<StatusFilter, number>} activeFilter={filters.status} loading={loading} onFilter={s => setFilters(p => ({ ...p, status: s }))} />
      {!loading && properties.length > 0 && <RecentApproved properties={properties} />}
      <PropertyFilters filters={filters} counts={counts as Record<StatusFilter, number>} onFilterChange={p => setFilters(prev => ({ ...prev, ...p }))} onClearAll={() => setFilters(DEFAULT_FILTERS)} />
      {!loading && hasActiveFilters && <p style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 10 }}>Showing {filtered.length} of {properties.length} propert{properties.length !== 1 ? "ies" : "y"}</p>}
      <PropertyList properties={filtered} loading={loading} hasFilters={hasActiveFilters} onClear={() => setFilters(DEFAULT_FILTERS)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes propShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @media(max-width:640px){.prop-img{display:none!important}}
      ` }} />
    </div>
  );
}