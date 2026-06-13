"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { PartnerBooking, PartnerBookingStatus } from "@/lib/partner/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(d));
}
function fmtShort(d: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(d));
}

// ── Types ─────────────────────────────────────────────────────────────────────
type BookingStatusFilter = "all" | "confirmed" | "completed" | "cancelled" | "pending" | "no_show";
type BookingSortOption   = "newest" | "oldest" | "checkin_asc" | "checkin_desc" | "payout_desc" | "nights_desc";
type ActiveFilterType    = "none" | "checkin" | "checkout" | "booked";

interface FilterState {
  search: string; status: BookingStatusFilter; sort: BookingSortOption;
  filterType: ActiveFilterType; dateFrom: string; dateTo: string;
}

const DEFAULT_FILTERS: FilterState = { search: "", status: "all", sort: "newest", filterType: "none", dateFrom: "", dateTo: "" };

// ── Status config ─────────────────────────────────────────────────────────────
const SC: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  confirmed: { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  completed: { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe" },
  cancelled: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", border: "#fecaca" },
  pending:   { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b", border: "#fde68a" },
  no_show:   { bg: "#f8f8f8", color: "#6b7280", dot: "#9ca3af", border: "#e5e7eb" },
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconSearch  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconFilter  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
const IconX       = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevron = ({ open }: { open?: boolean }) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>;

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ h = 14, w = "100%", r = 6 }: { h?: number; w?: number | string; r?: number }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

// ── KPI Grid ──────────────────────────────────────────────────────────────────
const KPI_ITEMS = [
  { key: "all",       label: "Total Bookings", sub: "All time",           color: "#C9A84C" },
  { key: "confirmed", label: "Confirmed",       sub: "Active reservations", color: "#15803d" },
  { key: "cancelled", label: "Cancelled",       sub: "Guest cancellations", color: "#dc2626" },
  { key: "revenue",   label: "Total Revenue",   sub: "Your payout earned",  color: "#1d4ed8" },
] as const;

function BookingKpiGrid({ total, confirmed, cancelled, revenue, activeFilter, loading, onFilter }: {
  total: number; confirmed: number; cancelled: number; revenue: number;
  activeFilter: BookingStatusFilter; loading: boolean; onFilter: (s: BookingStatusFilter) => void;
}) {
  const values = [total, confirmed, cancelled, fmt(revenue)];

  if (loading) {
    return (
      <>
        <div className="bkg-kpi-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 96, borderRadius: 12, background: "#f4f4f4" }} />)}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.bkg-kpi-mobile{display:none}@media(max-width:640px){.bkg-kpi-desktop{display:none!important}.bkg-kpi-mobile{display:block!important}}` }} />
      </>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="bkg-kpi-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {KPI_ITEMS.map((item, i) => {
          const active = i !== 3 && activeFilter === item.key;
          return (
            <div key={i} role="button" aria-pressed={active}
              onClick={() => i !== 3 && onFilter(active ? "all" : item.key as BookingStatusFilter)}
              style={{ background: "#fff", border: `1.5px solid ${active ? item.color : "#E5E5E5"}`, borderRadius: 12, padding: "18px 20px", cursor: i !== 3 ? "pointer" : "default", transition: "all 0.2s", boxShadow: active ? `0 4px 18px ${item.color}22` : "none", position: "relative", overflow: "hidden", userSelect: "none" }}
              onMouseEnter={e => { if (!active && i !== 3) (e.currentTarget as HTMLDivElement).style.borderColor = item.color + "66"; }}
              onMouseLeave={e => { if (!active && i !== 3) (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5"; }}
            >
              {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: item.color }} />}
              <div style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", lineHeight: 1, marginBottom: 6 }}>{values[i]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: active ? item.color : "#6B7280", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#9B9B9B" }}>{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Mobile 2×2 */}
      <div className="bkg-kpi-mobile" style={{ marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1.5px solid #E5E5E5", borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#C9A84C,#E8D5A0)", zIndex: 1 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 2 }}>
            {KPI_ITEMS.map((item, i) => {
              const active = i !== 3 && activeFilter === item.key;
              return (
                <div key={i} role={i !== 3 ? "button" : undefined} onClick={() => i !== 3 && onFilter(active ? "all" : item.key as BookingStatusFilter)}
                  style={{ padding: "18px 16px 16px", cursor: i !== 3 ? "pointer" : "default", position: "relative", borderRight: i % 2 === 0 ? "1px solid #E5E5E5" : "none", borderBottom: i < 2 ? "1px solid #E5E5E5" : "none", background: active ? `${item.color}08` : "transparent", transition: "background 0.15s" }}>
                  {active && <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 3, background: item.color, borderRadius: "0 2px 2px 0" }} />}
                  <div style={{ fontFamily: "inherit", fontSize: 22, fontWeight: 700, color: active ? item.color : "#0C0C0C", lineHeight: 1, marginBottom: 5 }}>{values[i]}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? item.color : "#6B7280", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9B9B9B" }}>{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}.bkg-kpi-mobile{display:none}@media(max-width:640px){.bkg-kpi-desktop{display:none!important}.bkg-kpi-mobile{display:block!important}}` }} />
    </>
  );
}

// ── Recent Bookings strip ──────────────────────────────────────────────────────
function RecentBookings({ bookings }: { bookings: PartnerBooking[] }) {
  const recent = [...bookings].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "2px solid #E5E5E5", background: "#F9F7F2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, borderRadius: 2, background: "#C9A84C" }} />
          <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>Recent Bookings</h2>
        </div>
        <span style={{ fontSize: 11, color: "#9B9B9B" }}>Latest {recent.length}</span>
      </div>
      {recent.map((b, i) => (
        <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < recent.length - 1 ? "1px solid #E5E5E5" : "none", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F9F7F2"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#9B7D32" }}>{b.guest_name.charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.guest_name}</div>
            <div style={{ fontSize: 11, color: "#9B9B9B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.room_name} · {fmtShort(b.check_in)} → {fmtShort(b.check_out)}</div>
          </div>
          <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: 3 }}>{fmt(b.partner_payout)}</div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: SC[b.status]?.dot ?? "#888", textTransform: "capitalize" as const }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: SC[b.status]?.dot ?? "#888", flexShrink: 0 }} />
              {b.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Date Range Picker ─────────────────────────────────────────────────────────
interface DateRange { from: string; to: string; }

function toISO(d: Date) { return d.toISOString().split("T")[0]; }
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Mo","Tu","We","Th","Fr","Sa","Su"];

function MiniCal({ year, month, from, to, hov, onDay, onHov, onPrev, onNext, showPrev, showNext }: {
  year: number; month: number; from: string; to: string; hov: string;
  onDay: (d: string) => void; onHov: (d: string) => void;
  onPrev: () => void; onNext: () => void; showPrev: boolean; showNext: boolean;
}) {
  const first   = new Date(year, month, 1);
  const total   = new Date(year, month + 1, 0).getDate();
  const startOff = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(startOff).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const rangeEnd = hov && !to && from ? hov : to;

  return (
    <div style={{ minWidth: 220 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={onPrev} disabled={!showPrev} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #E5E5E5", background: showPrev ? "#fff" : "transparent", cursor: showPrev ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: showPrev ? "#0C0C0C" : "transparent" }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>{MONTHS[month]} {year}</span>
        <button onClick={onNext} disabled={!showNext} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid #E5E5E5", background: showNext ? "#fff" : "transparent", cursor: showNext ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: showNext ? "#0C0C0C" : "transparent" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "#9B9B9B", padding: "2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isFrom = iso === from; const isTo = iso === to; const isEndHov = iso === rangeEnd && !to;
          const inRange = from && rangeEnd && iso > from && iso < rangeEnd;
          const isToday = iso === toISO(new Date());
          let bg = "transparent", color = "#0C0C0C", fw = 400, radius = 6;
          if (isFrom || isTo || isEndHov) { bg = "#C9A84C"; color = "#fff"; fw = 700; }
          else if (inRange) { bg = "rgba(201,168,76,0.12)"; radius = 0; }
          return (
            <div key={iso} onClick={() => onDay(iso)} onMouseEnter={() => onHov(iso)} onMouseLeave={() => onHov("")}
              style={{ textAlign: "center", padding: "5px 2px", borderRadius: radius, background: bg, color, fontSize: 12, fontWeight: fw, cursor: "pointer", outline: isToday && !isFrom && !isTo ? "1.5px solid #C9A84C" : "none", outlineOffset: "-1px", transition: "background 0.1s", userSelect: "none" }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DATE_PRESETS = [
  { key: "today", label: "Today" }, { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" }, { key: "last30", label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" }, { key: "lastMonth", label: "Last Month" },
  { key: "custom", label: "Date Range" },
];

function getPreset(key: string): DateRange {
  const t = new Date(); const iso = toISO(t);
  if (key === "today") return { from: iso, to: iso };
  if (key === "yesterday") { const y = new Date(t); y.setDate(y.getDate() - 1); const s = toISO(y); return { from: s, to: s }; }
  if (key === "last7") { const f = new Date(t); f.setDate(f.getDate() - 6); return { from: toISO(f), to: iso }; }
  if (key === "last30") { const f = new Date(t); f.setDate(f.getDate() - 29); return { from: toISO(f), to: iso }; }
  if (key === "thisMonth") { const f = new Date(t.getFullYear(), t.getMonth(), 1); const e = new Date(t.getFullYear(), t.getMonth() + 1, 0); return { from: toISO(f), to: toISO(e) }; }
  if (key === "lastMonth") { const f = new Date(t.getFullYear(), t.getMonth() - 1, 1); const e = new Date(t.getFullYear(), t.getMonth(), 0); return { from: toISO(f), to: toISO(e) }; }
  return { from: "", to: "" };
}

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const t = new Date();
  const [lYear,  setLYear]  = useState(t.getFullYear());
  const [lMonth, setLMonth] = useState(t.getMonth());
  const [hov,    setHov]    = useState("");
  const [preset, setPreset] = useState("custom");

  const rMonth = (lMonth + 1) % 12; const rYear = lMonth === 11 ? lYear + 1 : lYear;

  function handleDay(iso: string) {
    setPreset("custom");
    if (!value.from || (value.from && value.to)) { onChange({ from: iso, to: "" }); }
    else { onChange(iso < value.from ? { from: iso, to: value.from } : { from: value.from, to: iso }); }
  }

  function handlePreset(key: string) {
    setPreset(key);
    if (key === "custom") { onChange({ from: "", to: "" }); return; }
    const r = getPreset(key); onChange(r);
    if (r.from) { const d = new Date(r.from); setLYear(d.getFullYear()); setLMonth(d.getMonth()); }
  }

  function prev() { if (lMonth === 0) { setLYear(y => y - 1); setLMonth(11); } else setLMonth(m => m - 1); }
  function next() { if (lMonth === 11) { setLYear(y => y + 1); setLMonth(0); } else setLMonth(m => m + 1); }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 130, borderRight: "1px solid #E5E5E5", flexShrink: 0 }}>
        {DATE_PRESETS.map(p => {
          const isActive = preset === p.key;
          return (
            <button key={p.key} onClick={() => handlePreset(p.key)} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 16px", fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "#9B7D32" : "#6B7280", background: isActive ? "rgba(201,168,76,0.08)" : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", borderLeft: `3px solid ${isActive ? "#C9A84C" : "transparent"}`, transition: "all 0.15s" }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "#F9F7F2"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
              {p.label}
            </button>
          );
        })}
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {["From", "To"].map((lbl, i) => (
            <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #E5E5E5", borderRadius: 7, fontSize: 12, background: "#F9F7F2", flex: 1 }}>
              <span style={{ fontSize: 10, color: "#9B9B9B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</span>
              <span style={{ fontWeight: 600 }}>{(i === 0 ? value.from : value.to) || "–"}</span>
            </div>
          ))}
          <span style={{ color: "#9B9B9B", fontSize: 12 }}>→</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <MiniCal year={lYear} month={lMonth} from={value.from} to={value.to} hov={hov} onDay={handleDay} onHov={setHov} onPrev={prev} onNext={next} showPrev showNext={false} />
          <div style={{ width: 1, background: "#E5E5E5" }} />
          <MiniCal year={rYear} month={rMonth} from={value.from} to={value.to} hov={hov} onDay={handleDay} onHov={setHov} onPrev={prev} onNext={next} showPrev={false} showNext />
        </div>
      </div>
    </div>
  );
}

// ── Booking Filters ───────────────────────────────────────────────────────────
const FILTER_TYPES = [
  { key: "checkin",  label: "Check-in Date",  sub: "Guest arrival date"        },
  { key: "checkout", label: "Check-out Date", sub: "Guest departure date"      },
  { key: "booked",   label: "Booking Date",   sub: "When reservation was made" },
] as const;

const STATUS_OPTS: { key: BookingStatusFilter; label: string; dot: string }[] = [
  { key: "all",       label: "All Bookings", dot: "#C9A84C" },
  { key: "confirmed", label: "Confirmed",    dot: "#22c55e" },
  { key: "completed", label: "Completed",    dot: "#3b82f6" },
  { key: "cancelled", label: "Cancelled",    dot: "#ef4444" },
  { key: "pending",   label: "Pending",      dot: "#f59e0b" },
  { key: "no_show",   label: "No Show",      dot: "#9ca3af" },
];

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 9999, fontSize: 11, color: "#9B7D32", fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9B7D32", display: "flex" }}><IconX /></button>
    </span>
  );
}

function BookingFilters({ filters, counts, onFilterChange, onClearAll }: {
  filters: FilterState; counts: Record<BookingStatusFilter, number>;
  onFilterChange: (p: Partial<FilterState>) => void; onClearAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [draftType,   setDraftType]   = useState<ActiveFilterType>("none");
  const [draftFrom,   setDraftFrom]   = useState("");
  const [draftTo,     setDraftTo]     = useState("");
  const [draftStatus, setDraftStatus] = useState<BookingStatusFilter>("all");

  useEffect(() => {
    if (open) { setDraftType(filters.filterType); setDraftFrom(filters.dateFrom); setDraftTo(filters.dateTo); setDraftStatus(filters.status); }
  }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const activeCount = [filters.status !== "all", !!(filters.dateFrom || filters.dateTo)].filter(Boolean).length;
  const hasAnyFilter = !!filters.search || activeCount > 0;
  const canApply = draftStatus !== "all" || (draftType !== "none" && !!(draftFrom || draftTo));
  const activeStatus = STATUS_OPTS.find(o => o.key === filters.status) ?? STATUS_OPTS[0];
  const activeTypeObj = FILTER_TYPES.find(f => f.key === filters.filterType);
  const hasDate = !!(filters.dateFrom || filters.dateTo);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, padding: "10px 14px" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, background: "#F9F7F2", border: "1px solid #E5E5E5", borderRadius: 9, padding: "8px 12px" }}>
          <span style={{ color: "#9B9B9B", flexShrink: 0 }}><IconSearch /></span>
          <input value={filters.search} onChange={e => onFilterChange({ search: e.target.value })}
            placeholder="Search guest, ref. number, room…"
            style={{ border: "none", background: "transparent", fontSize: 13, color: "#0C0C0C", outline: "none", width: "100%" }} />
          {filters.search && <button onClick={() => onFilterChange({ search: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9B9B", padding: 0, display: "flex" }}><IconX /></button>}
        </div>

        <div style={{ width: 1, height: 28, background: "#E5E5E5", flexShrink: 0 }} />

        {/* Filter button + dropdown */}
        <div ref={dropRef} style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${activeCount > 0 ? "#C9A84C" : "#E5E5E5"}`, background: activeCount > 0 ? "rgba(201,168,76,0.06)" : "#F9F7F2", color: activeCount > 0 ? "#9B7D32" : "#6B7280", fontSize: 13, fontWeight: activeCount > 0 ? 600 : 400, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const, transition: "all 0.15s" }}>
            <IconFilter /> Filters
            {activeCount > 0 && <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#C9A84C", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeCount}</span>}
            <IconChevron />
          </button>

          {open && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 400, background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden" }}>
              <div style={{ display: "flex" }}>
                {/* Left panel */}
                <div style={{ width: 200, borderRight: "1px solid #E5E5E5", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "12px 14px 8px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8 }}>Filter By</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {FILTER_TYPES.map(ft => {
                        const isActive = draftType === ft.key;
                        return (
                          <button key={ft.key} onClick={() => { if (draftType === ft.key) { setDraftType("none"); setDraftFrom(""); setDraftTo(""); } else { setDraftType(ft.key); setDraftFrom(""); setDraftTo(""); } }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, width: "100%", border: "none", background: isActive ? "rgba(201,168,76,0.08)" : "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, borderLeft: `3px solid ${isActive ? "#C9A84C" : "transparent"}`, transition: "all 0.15s" }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "#9B7D32" : "#0C0C0C" }}>{ft.label}</div>
                              <div style={{ fontSize: 10, color: "#9B9B9B" }}>{ft.sub}</div>
                            </div>
                            {isActive && <span style={{ color: "#C9A84C", fontWeight: 700, fontSize: 13 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#E5E5E5", margin: "4px 0" }} />

                  <div style={{ padding: "10px 14px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 8 }}>Status</p>
                    <div style={{ position: "relative" }}>
                      <select value={draftStatus} onChange={e => setDraftStatus(e.target.value as BookingStatusFilter)}
                        style={{ width: "100%", padding: "8px 28px 8px 10px", border: `1.5px solid ${draftStatus !== "all" ? "#C9A84C" : "#E5E5E5"}`, borderRadius: 8, fontSize: 12, color: draftStatus !== "all" ? "#9B7D32" : "#0C0C0C", background: draftStatus !== "all" ? "rgba(201,168,76,0.05)" : "#fff", fontWeight: draftStatus !== "all" ? 600 : 400, cursor: "pointer", outline: "none", fontFamily: "inherit", appearance: "none" as const }}>
                        {STATUS_OPTS.map(o => <option key={o.key} value={o.key}>{o.label} ({counts[o.key]})</option>)}
                      </select>
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9B9B9B" }}><IconChevron /></span>
                    </div>
                  </div>

                  <div style={{ flex: 1 }} />

                  <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid #E5E5E5" }}>
                    <button onClick={() => { onFilterChange({ filterType: draftType, dateFrom: draftFrom, dateTo: draftTo, status: draftStatus }); setOpen(false); }} disabled={!canApply}
                      style={{ width: "100%", padding: "9px", background: canApply ? "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)" : "#F5F3EE", color: canApply ? "#fff" : "#9B9B9B", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: canApply ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: canApply ? "0 2px 8px rgba(201,168,76,0.3)" : "none" }}>
                      Apply Filter
                    </button>
                    {hasAnyFilter && <button onClick={() => { onClearAll(); setOpen(false); }} style={{ width: "100%", padding: "8px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Clear all</button>}
                  </div>
                </div>

                {/* Dual calendar */}
                <DateRangePicker value={{ from: draftFrom, to: draftTo }} onChange={r => { setDraftFrom(r.from); setDraftTo(r.to); if (r.from && draftType === "none") setDraftType("booked"); }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active pills */}
      {hasAnyFilter && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
          {hasDate && activeTypeObj && <FilterPill label={`${activeTypeObj.label}: ${filters.dateFrom} → ${filters.dateTo || "…"}`} onRemove={() => onFilterChange({ filterType: "none", dateFrom: "", dateTo: "" })} />}
          {filters.status !== "all" && <FilterPill label={`${activeStatus.label} (${counts[filters.status]})`} onRemove={() => onFilterChange({ status: "all" })} />}
          {filters.search && <FilterPill label={`"${filters.search}"`} onRemove={() => onFilterChange({ search: "" })} />}
        </div>
      )}
    </div>
  );
}

// ── Booking List Item ─────────────────────────────────────────────────────────
function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#0C0C0C", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function BookingListItem({ booking: b }: { booking: PartnerBooking }) {
  const [expanded, setExpanded] = useState(false);
  const sc = SC[b.status] ?? SC.pending;

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", transition: "box-shadow 0.2s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}>
      {/* Main row */}
      <div onClick={() => setExpanded(v => !v)} className="booking-row"
        style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr auto auto", gap: 14, padding: "14px 20px", cursor: "pointer", alignItems: "center", transition: "background 0.15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F9F7F2"}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
        {/* Guest */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#9B7D32" }}>{b.guest_name.charAt(0)}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.guest_name}</div>
            <div style={{ fontSize: 11, color: "#9B9B9B" }}>{b.confirmation_number}</div>
          </div>
        </div>
        {/* Check-in */}
        <div><div style={{ fontSize: 13, fontWeight: 500, color: "#0C0C0C" }}>{fmtShort(b.check_in)}</div><div style={{ fontSize: 11, color: "#9B9B9B" }}>Check-in</div></div>
        {/* Check-out */}
        <div><div style={{ fontSize: 13, fontWeight: 500, color: "#0C0C0C" }}>{fmtShort(b.check_out)}</div><div style={{ fontSize: 11, color: "#9B9B9B" }}>{b.nights} night{b.nights > 1 ? "s" : ""}</div></div>
        {/* Room */}
        <div style={{ fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.room_name}</div>
        {/* Payout */}
        <div style={{ textAlign: "right" as const }}><div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C" }}>{fmt(b.partner_payout)}</div><div style={{ fontSize: 11, color: "#9B9B9B" }}>Payout</div></div>
        {/* Status + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: "nowrap" as const }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />{b.status.replace(/_/g, " ")}
          </span>
          <span style={{ color: "#9B9B9B", flexShrink: 0 }}><IconChevron open={expanded} /></span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ padding: "16px 20px 20px", background: "#F9F7F2", borderTop: "1px solid #E5E5E5" }}>
          <div className="booking-detail" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 14 }}>
            <DetailCell label="Property"     value={b.property_name} />
            <DetailCell label="Guest Email"  value={b.guest_email} />
            <DetailCell label="Phone"        value={b.guest_phone} />
            <DetailCell label="Guests"       value={`${b.adults} Adult${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} Child${b.children > 1 ? "ren" : ""}` : ""}`} />
            <DetailCell label="Total Amount" value={fmt(b.total_amount)} />
            <DetailCell label="Your Payout"  value={fmt(b.partner_payout)} />
            <DetailCell label="Booked On"    value={fmtDate(b.created_at)} />
            <DetailCell label="Rooms"        value={String(b.rooms)} />
          </div>
          {b.status === "cancelled" && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626" }}>This booking was cancelled. No payout will be processed.</div>}
          {b.status === "no_show"   && <div style={{ padding: "10px 14px", background: "#f8f8f8", border: "1px solid #E5E5E5", borderRadius: 8, fontSize: 12, color: "#6b7280" }}>Guest did not check in. Refer to your cancellation policy for applicable charges.</div>}
        </div>
      )}
    </div>
  );
}

// ── Booking List ──────────────────────────────────────────────────────────────
function BookingList({ bookings, loading, hasFilters, onClear }: {
  bookings: PartnerBooking[]; loading: boolean; hasFilters: boolean; onClear: () => void;
}) {
  if (loading) return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 4 }).map((_, i) => <Sk key={i} h={68} />)}</div>;

  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{hasFilters ? "🔍" : "📅"}</div>
        <h3 style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 600, color: "#0C0C0C", marginBottom: 8 }}>{hasFilters ? "No bookings match your filters" : "No bookings yet"}</h3>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>{hasFilters ? "Try adjusting your date range or status filter." : "Bookings will appear here once guests reserve your rooms."}</p>
        {hasFilters && <button onClick={onClear} style={{ padding: "9px 20px", background: "#0C0C0C", color: "#fff", border: "none", borderRadius: 9999, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Clear filters</button>}
      </div>
    );
  }

  return (
    <div>
      <div className="booking-header" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr auto auto", gap: 14, padding: "10px 20px", fontSize: 11, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
        <span>Guest</span><span>Check-in</span><span>Check-out</span><span>Room</span><span>Payout</span><span>Status</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {bookings.map(b => <BookingListItem key={b.id} booking={b} />)}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PartnerBookingsPage() {
  const { user, isLoading: authLoading, getAccessToken } = useAuth();

  const [loading,  setLoading]  = useState(true);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [filters,  setFilters]  = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoading(true);

    partnerApi.listBookings(token, { sort: "newest", page: 1, limit: 100 })
      .then(res => { if (!cancelled) setBookings(res.bookings ?? []); })
      .catch(() => { if (!cancelled) setBookings([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  const counts = useMemo(() => ({
    all:       bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    pending:   bookings.filter(b => b.status === "pending").length,
    no_show:   bookings.filter(b => b.status === "no_show").length,
  }), [bookings]);

  const totalRevenue = useMemo(() =>
    bookings.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + b.partner_payout, 0),
  [bookings]);

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (filters.status !== "all") list = list.filter(b => b.status === filters.status);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(b => b.guest_name.toLowerCase().includes(q) || b.confirmation_number.toLowerCase().includes(q) || b.room_name.toLowerCase().includes(q) || b.property_name.toLowerCase().includes(q));
    }
    if (filters.dateFrom || filters.dateTo) {
      const getField = (b: PartnerBooking) => filters.filterType === "checkin" ? b.check_in : filters.filterType === "checkout" ? b.check_out : b.created_at;
      if (filters.dateFrom) list = list.filter(b => getField(b) >= filters.dateFrom);
      if (filters.dateTo)   list = list.filter(b => getField(b) <= filters.dateTo + (filters.filterType === "booked" ? "T23:59:59Z" : ""));
    }
    list.sort((a, b) => {
      switch (filters.sort) {
        case "newest":       return b.created_at.localeCompare(a.created_at);
        case "oldest":       return a.created_at.localeCompare(b.created_at);
        case "checkin_asc":  return a.check_in.localeCompare(b.check_in);
        case "checkin_desc": return b.check_in.localeCompare(a.check_in);
        case "payout_desc":  return b.partner_payout - a.partner_payout;
        case "nights_desc":  return b.nights - a.nights;
        default: return 0;
      }
    });
    return list;
  }, [bookings, filters]);

  const hasActiveFilters = filters.status !== "all" || !!filters.search || !!filters.dateFrom || !!filters.dateTo;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12, paddingBottom: 20, borderBottom: "1px solid #E5E5E5" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em" }}>Bookings</h1>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", marginTop: 2 }} />
          </div>
          <p style={{ fontSize: 13, color: "#9B9B9B" }}>
            {loading ? "…" : <>{bookings.length} total bookings · Revenue: <strong style={{ color: "#0C0C0C" }}>{fmt(totalRevenue)}</strong></>}
          </p>
        </div>
      </div>

      <BookingKpiGrid total={counts.all} confirmed={counts.confirmed} cancelled={counts.cancelled} revenue={totalRevenue} activeFilter={filters.status} loading={loading} onFilter={s => setFilters(p => ({ ...p, status: s }))} />
      {!loading && <RecentBookings bookings={bookings} />}
      <BookingFilters filters={filters} counts={counts} onFilterChange={p => setFilters(prev => ({ ...prev, ...p }))} onClearAll={() => setFilters(DEFAULT_FILTERS)} />
      {!loading && hasActiveFilters && <p style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 10 }}>Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>}
      <BookingList bookings={filtered} loading={loading} hasFilters={hasActiveFilters} onClear={() => setFilters(DEFAULT_FILTERS)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @media(max-width:900px){.booking-header{display:none!important}.booking-row{grid-template-columns:1fr auto!important}.booking-detail{grid-template-columns:1fr 1fr!important}}
        @media(max-width:560px){.bkg-kpi-desktop{grid-template-columns:1fr 1fr!important}}
      ` }} />
    </div>
  );
}