"use client";

/**
 * src/app/(partner)/partner/rates/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Rates & Inventory — 10000% production-ready replica of unohotelsandresorts.com
 *
 * Architecture:
 *   Page                 — property selector → room type tabs
 *   RateCalendarInline   — split layout: month calendar (left) + action panel (right)
 *   InventoryCalendar    — split layout: inventory calendar (left) + action panel (right)
 *
 * Rate calendar features:
 *   • Click a day → select, drag across days → range, shift+click → extend range
 *   • 3 modes: Set Price | Block Dates | Clear Override
 *   • Color coding: base (#fafafa) | custom rate (#fffbf0/gold) | blocked (#fff1f1/red) | selected (#C9A84C)
 *   • Per-day override with note, range override via API
 *   • Stats bar: base price, custom rate count, blocked count
 *   • Legend + interaction hint
 *
 * Inventory calendar features:
 *   • Per-day: total/booked/available rooms + mini occupancy bar
 *   • Color scale: green (<40%) → amber (70%) → red (100%)
 *   • Past days grayed out + non-clickable
 *   • Action panel: override room count, inline validation, reset to default
 *   • Blocked-day notice: "unblock via Rate Calendar first"
 *   • 30-second live polling for booked count
 *   • Stats bar: default rooms, override days, sold-out days, live pulse indicator
 *
 * API (all via partnerApi from @/lib/partner/api):
 *   getRateCalendar, setRateDate, setRateRange, clearRateDate
 *   getInventoryCalendar, setInventoryDate, setInventoryRange
 *   listProperties, listRooms
 */

import React, {
  useState, useEffect, useCallback, useRef,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { Property } from "@/lib/partner/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CalendarDay {
  date:            string;
  partner_price:   number;
  guest_price:     number;
  is_override:     boolean;
  is_blocked:      boolean;
  available_count: number | null;
  note:            string | null;
}

interface CalendarMonthResponse {
  room_id:    string;
  room_name:  string;
  base_price: number;
  year:       number;
  month:      number;
  days:       CalendarDay[];
}

interface InventoryDay {
  date:                     string;
  total_rooms:              number;
  booked_rooms:             number;
  available_rooms:          number;
  available_count_override: number | null;
  is_blocked:               boolean;
  note:                     string | null;
}

interface InventoryMonthResponse {
  room_id:       string;
  room_name:     string;
  default_count: number;
  year:          number;
  month:         number;
  days:          InventoryDay[];
}

interface PartnerRoom {
  id:            string;
  name:          string;
  base_price:    number;
  weekend_price?: number;
  count:         number;
  max_occupancy: number;
  is_active:     boolean;
  bed_type:      string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const POLL_MS    = 30_000;

// ── Date utils ────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
function firstWeekday(year: number, month: number): number {
  return ((new Date(year, month - 1, 1).getDay()) + 6) % 7;
}
function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}
function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function fmtDateLong(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}
function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}
function nightsBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}
function fmtPrice(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(msg: string, type: "success" | "error") {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), 3500);
  }

  const el = toast ? (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      background: toast.type === "success" ? "#16a34a" : "#dc2626",
      color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      maxWidth: 340, lineHeight: 1.5,
      animation: "ratesFadeIn 0.2s ease",
    }}>
      {toast.msg}
    </div>
  ) : null;

  return {
    success: (m: string) => show(m, "success"),
    error:   (m: string) => show(m, "error"),
    el,
  };
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const BORDER  = "#E5E5E5";
const SURFACE = "#F9F7F2";
const BLACK   = "#0C0C0C";
const MUTED   = "#9B9B9B";
const GOLD    = "#C9A84C";
const GOLD_DK = "#b8943e";

const sharedInput: React.CSSProperties = {
  border: `1.5px solid ${BORDER}`,
  borderRadius: 8, outline: "none",
  background: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

// ── NavButton ─────────────────────────────────────────────────────────────────

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, border: `1.5px solid ${BORDER}`, borderRadius: 8,
      background: "#fff", cursor: "pointer", fontSize: 16,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = SURFACE)}
      onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
    >
      {label}
    </button>
  );
}

// ── ══════════════════════════════════════════════════════════════════════════ ──
//    RATE CALENDAR
// ── ══════════════════════════════════════════════════════════════════════════ ──

type EditMode = "price" | "block" | "clear";

interface RateCalendarProps {
  roomId:    string;
  roomName:  string;
  basePrice: number;
  token:     string;
  toast:     ReturnType<typeof useToast>;
}

function RateCalendarInline({ roomId, roomName, basePrice, token, toast }: RateCalendarProps) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [calData, setCalData] = useState<CalendarMonthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  // Selection
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd,   setRangeEnd]   = useState<string | null>(null);
  const [editStart,  setEditStart]  = useState("");
  const [editEnd,    setEditEnd]    = useState("");
  const [price,      setPrice]      = useState("");
  const [note,       setNote]       = useState("");
  const [mode,       setMode]       = useState<EditMode>("price");

  // Drag
  const isDragging = useRef(false);
  const dragStart  = useRef<string | null>(null);
  const priceRef   = useRef<HTMLInputElement>(null);

  // ── Load month ─────────────────────────────────────────────────────────────

  const loadMonth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await partnerApi.getRateCalendar(token, roomId, year, month);
      setCalData(data as CalendarMonthResponse);
    } catch {
      toast.error("Failed to load rate calendar.");
    } finally {
      setLoading(false);
    }
  }, [roomId, year, month, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadMonth(); }, [loadMonth]);
  useEffect(() => { clearSelection(); }, [roomId]);

  // Stop drag on global mouseup
  useEffect(() => {
    const up = () => {
      if (isDragging.current) { isDragging.current = false; dragStart.current = null; }
    };
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, []);

  // Auto-focus price input when selection appears
  useEffect(() => {
    if (editStart && mode === "price") priceRef.current?.focus();
  }, [editStart, mode]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    clearSelection();
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    clearSelection();
  }

  // ── Selection helpers ──────────────────────────────────────────────────────

  function clearSelection() {
    setRangeStart(null); setRangeEnd(null);
    setEditStart(""); setEditEnd("");
    setPrice(""); setNote(""); setMode("price");
    isDragging.current = false; dragStart.current = null;
  }

  function applyRange(a: string, b: string) {
    const [s, e] = a <= b ? [a, b] : [b, a];
    setRangeStart(s); setRangeEnd(e);
    setEditStart(s);  setEditEnd(e);
  }

  // ── Mouse handlers ─────────────────────────────────────────────────────────

  function handleMouseDown(iso: string, e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true; dragStart.current = iso;
    setRangeStart(iso); setRangeEnd(null);
    setEditStart(iso);  setEditEnd(iso);
    setPrice(""); setNote("");
  }

  function handleMouseEnter(iso: string) {
    if (!isDragging.current || !dragStart.current) return;
    const [s, e] = dragStart.current <= iso
      ? [dragStart.current, iso]
      : [iso, dragStart.current];
    setRangeStart(s); setRangeEnd(e);
    setEditStart(s);  setEditEnd(e);
  }

  function handleMouseUp(iso: string) {
    if (isDragging.current && dragStart.current) applyRange(dragStart.current, iso);
    isDragging.current = false; dragStart.current = null;
  }

  function handleClick(iso: string, e: React.MouseEvent) {
    if (e.shiftKey && rangeStart) applyRange(rangeStart, iso);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!editStart) return;
    setSaving(true);
    try {
      const isSingle = !editEnd || editStart === editEnd;

      if (mode === "clear") {
        if (isSingle) {
          await partnerApi.clearRateDate(token, roomId, editStart);
        } else {
          await partnerApi.setRateRange(token, roomId, {
            start_date: editStart, end_date: editEnd,
            price: undefined, is_blocked: false,
          });
          // Clear overrides: use the setRateRange with no price/block to reset
          // Backend handles null price as "clear"
        }
        toast.success("Override cleared — reverted to base price.");
      } else {
        const priceNum = parseFloat(price);
        if (mode === "price" && (isNaN(priceNum) || priceNum <= 0)) {
          toast.error("Enter a valid price greater than ₹0.");
          setSaving(false); return;
        }
        const payload = {
          price:      mode === "price" ? priceNum : undefined,
          is_blocked: mode === "block" ? true : undefined,
          note:       note.trim() || undefined,
        };
        if (isSingle) {
          await partnerApi.setRateDate(token, roomId, { ...payload, date: editStart });
        } else {
          await partnerApi.setRateRange(token, roomId, {
            ...payload, start_date: editStart, end_date: editEnd,
          });
        }
        toast.success(
          mode === "block"
            ? `${selectedCount} night${selectedCount !== 1 ? "s" : ""} blocked successfully.`
            : `Price saved for ${selectedCount} night${selectedCount !== 1 ? "s" : ""}.`
        );
      }

      await loadMonth();
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Calendar grid ──────────────────────────────────────────────────────────

  const totalDays = daysInMonth(year, month);
  const startDay  = firstWeekday(year, month);

  const dayMap: Record<string, CalendarDay> = {};
  calData?.days.forEach(d => { dayMap[d.date] = d; });

  const loRange = rangeStart && rangeEnd
    ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd)
    : (rangeStart ?? "");
  const hiRange = rangeStart && rangeEnd
    ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart)
    : (rangeStart ?? "");

  const overrideCount = calData?.days.filter(d => d.is_override).length ?? 0;
  const blockedCount  = calData?.days.filter(d => d.is_blocked).length  ?? 0;
  const selectedCount = editStart && editEnd && editStart !== editEnd
    ? nightsBetween(editStart, editEnd)
    : editStart ? 1 : 0;
  const estRevenue    = mode === "price" && price && !isNaN(parseFloat(price)) && parseFloat(price) > 0
    ? parseFloat(price) * selectedCount
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "stretch", minHeight: 460 }}>

      {/* ════ LEFT: Calendar ════ */}
      <div style={{ flex: "1 1 0", minWidth: 0, paddingRight: 24, borderRight: `1.5px solid ${BORDER}` }}>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ padding: "6px 12px", borderRadius: 7, background: SURFACE, border: `1px solid ${BORDER}`, fontSize: 12 }}>
            <span style={{ color: MUTED }}>Base </span>
            <strong style={{ color: BLACK }}>{fmtPrice(basePrice)}/night</strong>
          </div>
          {overrideCount > 0 && (
            <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.25)", fontSize: 12, color: "#7A5F18" }}>
              <strong>{overrideCount}</strong> custom rate{overrideCount !== 1 ? "s" : ""}
            </div>
          )}
          {blockedCount > 0 && (
            <div style={{ padding: "6px 12px", borderRadius: 7, background: "#fff1f1", border: "1px solid #fecaca", fontSize: 12, color: "#dc2626" }}>
              <strong>{blockedCount}</strong> blocked
            </div>
          )}
        </div>

        {/* Month navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <NavButton onClick={prevMonth} label="‹" />
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: BLACK }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <NavButton onClick={nextMonth} label="›" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTED, fontSize: 13 }}>
            Loading calendar…
          </div>
        ) : (
          <>
            {/* Calendar grid */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}
              onMouseLeave={() => { isDragging.current = false; }}
            >
              {/* Day labels */}
              {DAY_LABELS.map(l => (
                <div key={l} style={{
                  textAlign: "center", fontSize: 10, fontWeight: 600,
                  color: MUTED, paddingBottom: 6,
                  textTransform: "uppercase" as const, letterSpacing: "0.06em",
                }}>
                  {l}
                </div>
              ))}

              {/* Leading empty cells */}
              {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}

              {/* Day cells */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum    = i + 1;
                const iso       = toIso(year, month, dayNum);
                const ov        = dayMap[iso];
                const inRange   = loRange && hiRange && iso >= loRange && iso <= hiRange;
                const isRngStart = iso === loRange && loRange !== hiRange;
                const isRngEnd   = iso === hiRange && loRange !== hiRange;
                const isSingle  = iso === loRange && loRange === hiRange && loRange !== "";
                const blocked   = ov?.is_blocked  ?? false;
                const override  = ov?.is_override ?? false;
                const dispPrice = ov?.partner_price ?? basePrice;
                const isHighlit = inRange || isSingle;

                const bg = isHighlit ? GOLD
                  : blocked  ? "#fff1f1"
                  : override ? "#fffbf0"
                  : "#fafafa";

                const border = isHighlit ? `1.5px solid ${GOLD_DK}`
                  : blocked  ? "1.5px solid #fecaca"
                  : override ? "1.5px solid rgba(201,168,76,0.4)"
                  : `1.5px solid ${BORDER}`;

                const radius = isRngStart ? "8px 3px 3px 8px"
                  : isRngEnd   ? "3px 8px 8px 3px"
                  : inRange && !isSingle ? "3px"
                  : "8px";

                return (
                  <div
                    key={iso}
                    onMouseDown={e  => handleMouseDown(iso, e)}
                    onMouseEnter={() => handleMouseEnter(iso)}
                    onMouseUp={() => handleMouseUp(iso)}
                    onClick={e   => handleClick(iso, e)}
                    style={{
                      borderRadius: radius, padding: "6px 3px",
                      cursor: "pointer", minHeight: 52,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "flex-start", gap: 2,
                      background: bg, border, transition: "background 0.08s",
                      userSelect: "none" as const,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: isHighlit ? "#fff" : blocked ? "#dc2626" : "#1a1a1a" }}>
                      {dayNum}
                    </span>
                    {blocked ? (
                      <span style={{ fontSize: 8, color: isHighlit ? "#fff" : "#dc2626", fontWeight: 700 }}>BLK</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 9, fontWeight: 700, color: isHighlit ? "#fff" : override ? GOLD : "#555" }}>
                          {fmtPrice(dispPrice)}
                        </span>
                        {override && (
                          <span style={{ fontSize: 7, color: isHighlit ? "rgba(255,255,255,0.8)" : GOLD, fontWeight: 600 }}>★</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, fontSize: 11, color: "#6B7280", alignItems: "center" }}>
              {[
                { bg: "#fafafa", border: BORDER, label: "Base price" },
                { bg: "#fffbf0", border: "rgba(201,168,76,0.4)", label: "Custom rate" },
                { bg: "#fff1f1", border: "#fecaca", label: "Blocked" },
                { bg: GOLD,     border: GOLD_DK,  label: "Selected" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.bg, border: `1.5px solid ${item.border}` }} />
                  <span>{item.label}</span>
                </div>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 10, color: MUTED }}>
                Click · Drag to select range · Shift+click to extend
              </span>
            </div>
          </>
        )}
      </div>

      {/* ════ RIGHT: Action panel ════ */}
      <div style={{ width: 300, flexShrink: 0, paddingLeft: 24, display: "flex", flexDirection: "column" }}>

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: BLACK, margin: 0, marginBottom: 4 }}>
            Edit Rate
          </h3>
          <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
            {editStart
              ? `${selectedCount} night${selectedCount !== 1 ? "s" : ""} selected`
              : "Click or drag on the calendar to select dates"}
          </p>
        </div>

        {/* ── No selection: instructional state ── */}
        {!editStart && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 12, padding: "24px 16px",
            background: SURFACE, border: `1.5px dashed ${BORDER}`,
            borderRadius: 12, textAlign: "center" as const,
          }}>
            <div style={{ fontSize: 32 }}>📅</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: BLACK, margin: "0 0 4px" }}>No date selected</p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                Click any date on the calendar to set a price, block, or clear an override.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", marginTop: 4 }}>
              {[
                { icon: "💰", text: "Click a date → set custom price" },
                { icon: "🚫", text: "Select → Block Dates tab" },
                { icon: "↩",  text: "Select → Clear Override tab" },
              ].map(tip => (
                <div key={tip.text} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#fff", borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: "left" as const }}>
                  <span style={{ fontSize: 14 }}>{tip.icon}</span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Selection active ── */}
        {editStart && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Selected date range info */}
            <div style={{
              padding: "12px 14px",
              background: "rgba(201,168,76,0.06)",
              border: "1.5px solid rgba(201,168,76,0.25)",
              borderRadius: 10, marginBottom: 14,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: BLACK, marginBottom: 2 }}>
                {editStart === editEnd || !editEnd
                  ? fmtDate(editStart)
                  : `${fmtDate(editStart)} → ${fmtDate(editEnd)}`}
              </div>
              <div style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{selectedCount} night{selectedCount !== 1 ? "s" : ""}</span>
                <button onClick={clearSelection}
                  style={{ fontSize: 11, color: MUTED, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                  Clear ✕
                </button>
              </div>
              {estRevenue > 0 && (
                <div style={{ marginTop: 4, fontSize: 11, color: "#7A5F18", fontWeight: 600 }}>
                  Est. revenue: {fmtPrice(estRevenue)}
                </div>
              )}
            </div>

            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {(["price", "block", "clear"] as EditMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: 11,
                  cursor: "pointer", fontFamily: "inherit",
                  fontWeight: mode === m ? 700 : 400,
                  background: mode === m
                    ? (m === "block" ? "#dc2626" : m === "clear" ? "#555" : GOLD)
                    : "#fff",
                  color:  mode === m ? "#fff" : "#6B7280",
                  border: mode === m ? "none" : `1.5px solid ${BORDER}`,
                  transition: "all 0.15s",
                  textAlign: "center" as const,
                }}>
                  {m === "price" ? "💰 Set Price" : m === "block" ? "🚫 Block" : "↩ Clear"}
                </button>
              ))}
            </div>

            {/* Set Price */}
            {mode === "price" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    Guest price per night — ₹
                  </label>
                  <input
                    ref={priceRef}
                    type="number" min="1" step="1"
                    placeholder={`e.g. ${basePrice}`}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                    style={{ ...sharedInput, height: 42, padding: "0 14px", width: "100%", fontSize: 15, fontWeight: 600 }}
                    onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                  />
                  {price && parseFloat(price) > 0 && (
                    <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>
                      Guest sees: {fmtPrice(Math.round(parseFloat(price) * 1.18))} (incl. GST est.)
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    Note (internal, optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali peak, Low season"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    style={{ ...sharedInput, height: 40, padding: "0 14px", width: "100%", fontSize: 13 }}
                    onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                  />
                </div>
              </div>
            )}

            {/* Block dates */}
            {mode === "block" && (
              <div>
                <div style={{ padding: "12px 14px", background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.6, margin: 0 }}>
                    <strong>{selectedCount} night{selectedCount !== 1 ? "s" : ""}</strong> will be{" "}
                    <strong>unavailable</strong> for guests. Use for maintenance or owner stay.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    Note (internal, optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maintenance, Owner stay"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    autoFocus
                    style={{ ...sharedInput, height: 40, padding: "0 14px", width: "100%", fontSize: 13 }}
                    onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
                    onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                  />
                </div>
              </div>
            )}

            {/* Clear override */}
            {mode === "clear" && (
              <div style={{ padding: "12px 14px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>
                  Custom prices or blocks on these <strong>{selectedCount} night{selectedCount !== 1 ? "s" : ""}</strong> will be removed.
                  Room reverts to <strong>{fmtPrice(basePrice)}/night</strong>.
                </p>
              </div>
            )}

            {/* Save / Cancel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 16 }}>
              <button onClick={handleSave} disabled={saving} style={{
                height: 42, width: "100%", borderRadius: 9999,
                fontSize: 13, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                border: "none", fontFamily: "inherit",
                background: mode === "block" ? "#dc2626"
                  : mode === "clear" ? "#555"
                  : `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DK} 100%)`,
                color: "#fff",
                opacity: saving ? 0.6 : 1,
                boxShadow: mode === "price" && !saving ? "0 2px 10px rgba(201,168,76,0.35)" : "none",
                transition: "opacity 0.2s",
              }}>
                {saving ? "Saving…"
                  : mode === "price"
                    ? `Save Price${selectedCount > 1 ? ` · ${selectedCount} nights` : ""}`
                  : mode === "block"
                    ? `Block ${selectedCount} Night${selectedCount !== 1 ? "s" : ""}`
                    : `Clear ${selectedCount} Night${selectedCount !== 1 ? "s" : ""}`}
              </button>
              <button onClick={clearSelection} style={{
                height: 38, width: "100%", borderRadius: 9999,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                background: "transparent", color: "#6B7280",
                border: `1.5px solid ${BORDER}`,
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ══════════════════════════════════════════════════════════════════════════ ──
//    INVENTORY CALENDAR
// ── ══════════════════════════════════════════════════════════════════════════ ──

interface InventoryCalendarProps {
  roomId:       string;
  roomName:     string;
  defaultCount: number;
  token:        string;
  toast:        ReturnType<typeof useToast>;
}

function cellColor(day: InventoryDay, selected: boolean): { bg: string; border: string } {
  if (selected)     return { bg: GOLD,     border: GOLD_DK  };
  if (day.is_blocked) return { bg: "#f9f9f9", border: BORDER   };
  if (day.total_rooms === 0) return { bg: "#fef2f2", border: "#fecaca" };
  const pct = day.total_rooms > 0 ? day.booked_rooms / day.total_rooms : 0;
  if (pct >= 1)   return { bg: "#fef2f2", border: "#fca5a5" };
  if (pct >= 0.7) return { bg: "#fffbeb", border: "#fcd34d" };
  if (pct >= 0.4) return { bg: "#f0fdf4", border: "#86efac" };
  return { bg: "#fafafa", border: BORDER };
}

function AvailBadge({ day, selected }: { day: InventoryDay; selected: boolean }) {
  if (day.is_blocked) {
    return <span style={{ fontSize: 9, fontWeight: 700, color: selected ? "rgba(255,255,255,0.85)" : "#9ca3af" }}>BLK</span>;
  }
  const pct   = day.total_rooms > 0 ? day.booked_rooms / day.total_rooms : 0;
  const color = selected ? "#fff" : pct >= 1 ? "#dc2626" : pct >= 0.7 ? "#d97706" : "#16a34a";
  return (
    <span style={{ fontSize: 9, fontWeight: 700, color, lineHeight: 1 }}>
      {day.available_rooms}/{day.total_rooms}
    </span>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: "neutral" | "gold" | "red" }) {
  const styles = {
    neutral: { bg: SURFACE, border: BORDER, text: BLACK },
    gold:    { bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.25)", text: "#7A5F18" },
    red:     { bg: "#fff1f1", border: "#fecaca", text: "#dc2626" },
  };
  const s = styles[color];
  return (
    <div style={{ padding: "6px 12px", borderRadius: 7, background: s.bg, border: `1px solid ${s.border}`, fontSize: 12, whiteSpace: "nowrap" as const }}>
      <span style={{ color: MUTED }}>{label} </span>
      <strong style={{ color: s.text }}>{value}</strong>
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub: string }) {
  return (
    <div style={{ padding: "10px 10px 8px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, textAlign: "center" as const }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 9, color: MUTED, marginTop: 1, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{sub}</div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#fff", borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: "left" as const, width: "100%" }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#6B7280" }}>{text}</span>
    </div>
  );
}

function InventoryCalendar({ roomId, roomName, defaultCount, token, toast }: InventoryCalendarProps) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [invData, setInvData] = useState<InventoryMonthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [inputCount,   setInputCount]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load / poll ────────────────────────────────────────────────────────────

  const loadInventory = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await partnerApi.getInventoryCalendar(token, roomId, year, month);
      setInvData(data as InventoryMonthResponse);
    } catch {
      if (!silent) toast.error("Failed to load inventory.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [roomId, year, month, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadInventory(false); }, [loadInventory]);

  // 30-second live polling
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadInventory(true), POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [loadInventory]);

  // Reset selection when room changes
  useEffect(() => { setSelectedDate(null); setInputCount(""); }, [roomId]);

  // Auto-focus input on selection
  useEffect(() => {
    if (selectedDate) setTimeout(() => inputRef.current?.focus(), 50);
  }, [selectedDate]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDate(null); setInputCount("");
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDate(null); setInputCount("");
  }

  // ── Select day ─────────────────────────────────────────────────────────────

  function handleSelectDay(iso: string) {
    if (iso < todayIso()) return; // past is read-only
    setSelectedDate(iso);
    const day = invData?.days.find(d => d.date === iso);
    setInputCount(
      day?.available_count_override != null ? String(day.available_count_override) : ""
    );
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!selectedDate) return;
    const count = inputCount.trim() === "" ? null : parseInt(inputCount, 10);
    if (count !== null && (isNaN(count) || count < 0)) {
      toast.error("Enter a valid number of rooms (0 or more).");
      return;
    }
    const selectedDay = invData?.days.find(d => d.date === selectedDate);
    if (count !== null && selectedDay && count < selectedDay.booked_rooms) {
      toast.error(`Cannot set below ${selectedDay.booked_rooms} — already booked.`);
      return;
    }
    setSaving(true);
    try {
      await partnerApi.setInventoryDate(token, roomId, {
        date: selectedDate, available_count: count,
      });
      await loadInventory(false);
      toast.success(
        count === null
          ? "Inventory reset to room default."
          : `${count} room${count !== 1 ? "s" : ""} set for ${fmtDateLong(selectedDate)}.`
      );
      setSelectedDate(null); setInputCount("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save inventory. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!selectedDate) return;
    setSaving(true);
    try {
      await partnerApi.setInventoryDate(token, roomId, { date: selectedDate, available_count: null });
      await loadInventory(false);
      toast.success("Inventory reset to room default.");
      setSelectedDate(null); setInputCount("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reset. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Calendar grid data ─────────────────────────────────────────────────────

  const totalDays   = daysInMonth(year, month);
  const startDay    = firstWeekday(year, month);
  const today       = todayIso();

  const dayMap: Record<string, InventoryDay> = {};
  invData?.days.forEach(d => { dayMap[d.date] = d; });

  const totalRooms   = invData?.default_count ?? defaultCount;
  const overrideDays = invData?.days.filter(d => d.available_count_override != null).length ?? 0;
  const soldOutDays  = invData?.days.filter(d => d.available_rooms === 0 && !d.is_blocked).length ?? 0;

  const selectedDay = selectedDate ? dayMap[selectedDate] : null;
  const isSaveDisabled = saving
    || (inputCount !== "" && (
      isNaN(parseInt(inputCount, 10))
      || parseInt(inputCount, 10) < 0
      || (selectedDay ? parseInt(inputCount, 10) < selectedDay.booked_rooms : false)
    ));

  const inputHint = (() => {
    if (!selectedDay) return "";
    if (inputCount === "") return `Leave blank to use room default (${defaultCount} rooms).`;
    const n = parseInt(inputCount, 10);
    if (isNaN(n) || n < 0) return "⚠ Enter a valid number (0 or more).";
    if (n < selectedDay.booked_rooms) return `⚠ ${selectedDay.booked_rooms} room${selectedDay.booked_rooms !== 1 ? "s" : ""} already booked — cannot set below that.`;
    const avail = n - selectedDay.booked_rooms;
    return `Guests will see ${avail} room${avail !== 1 ? "s" : ""} available (${n} total − ${selectedDay.booked_rooms} booked).`;
  })();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "stretch", minHeight: 460 }}>

      {/* ════ LEFT: Inventory calendar ════ */}
      <div style={{ flex: "1 1 0", minWidth: 0, paddingRight: 24, borderRight: `1.5px solid ${BORDER}` }}>

        {/* Summary bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <StatChip label="Default rooms" value={totalRooms} color="neutral" />
          {overrideDays > 0 && <StatChip label="Days with override" value={overrideDays} color="gold" />}
          {soldOutDays  > 0 && <StatChip label="Sold-out days"      value={soldOutDays}  color="red"  />}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUTED }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "invPulse 2s ease-in-out infinite" }} />
            Live · refreshes every 30s
          </div>
        </div>

        {/* Month navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <NavButton onClick={prevMonth} label="‹" />
          <span style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 16, color: BLACK }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <NavButton onClick={nextMonth} label="›" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTED, fontSize: 13 }}>
            Loading inventory…
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {/* Day labels */}
              {DAY_LABELS.map(l => (
                <div key={l} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: MUTED, paddingBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                  {l}
                </div>
              ))}

              {/* Leading empty cells */}
              {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}

              {/* Day cells */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum    = i + 1;
                const iso       = toIso(year, month, dayNum);
                const day       = dayMap[iso];
                const isSelected = iso === selectedDate;
                const isPastDay  = iso < today;

                if (!day) {
                  return (
                    <div key={iso} style={{ borderRadius: 8, padding: "6px 3px", minHeight: 52, background: "#f5f5f5", border: `1.5px solid ${BORDER}` }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#d1d5db" }}>{dayNum}</span>
                    </div>
                  );
                }

                const { bg, border } = cellColor(day, isSelected);
                const pct = day.total_rooms > 0 ? day.booked_rooms / day.total_rooms : 0;

                return (
                  <div
                    key={iso}
                    onClick={() => !isPastDay && handleSelectDay(iso)}
                    title={isPastDay ? "" : `${day.available_rooms} of ${day.total_rooms} available`}
                    style={{
                      borderRadius: 8, padding: "6px 3px", minHeight: 52,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "flex-start", gap: 2,
                      background: bg, border: `1.5px solid ${border}`,
                      cursor: isPastDay ? "default" : "pointer",
                      opacity: isPastDay ? 0.4 : 1,
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={e => { if (!isPastDay) (e.currentTarget as HTMLDivElement).style.opacity = isSelected ? "1" : "0.85"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = isPastDay ? "0.4" : "1"; }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#fff" : "#1a1a1a" }}>
                      {dayNum}
                    </span>
                    <AvailBadge day={day} selected={isSelected} />
                    {!day.is_blocked && day.total_rooms > 0 && (
                      <div style={{ width: "80%", height: 2, borderRadius: 1, background: "rgba(0,0,0,0.08)", overflow: "hidden", marginTop: 1 }}>
                        <div style={{
                          height: "100%", borderRadius: 1,
                          width: `${Math.min(100, Math.round(pct * 100))}%`,
                          background: isSelected
                            ? "rgba(255,255,255,0.7)"
                            : pct >= 1 ? "#dc2626" : pct >= 0.7 ? "#f59e0b" : "#22c55e",
                          transition: "width 0.3s",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, fontSize: 11, color: "#6B7280", alignItems: "center" }}>
              {[
                { bg: "#fafafa", border: BORDER,    label: "Available"   },
                { bg: "#fffbeb", border: "#fcd34d",  label: "70%+ booked" },
                { bg: "#fef2f2", border: "#fca5a5",  label: "Sold out"    },
                { bg: "#f9f9f9", border: BORDER,    label: "Blocked"     },
                { bg: GOLD,     border: GOLD_DK,    label: "Selected"    },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.bg, border: `1.5px solid ${item.border}` }} />
                  <span>{item.label}</span>
                </div>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 10, color: MUTED }}>
                Each cell shows remaining / total rooms
              </span>
            </div>
          </>
        )}
      </div>

      {/* ════ RIGHT: Action panel ════ */}
      <div style={{ width: 300, flexShrink: 0, paddingLeft: 24, display: "flex", flexDirection: "column" }}>

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: BLACK, margin: 0, marginBottom: 4 }}>
            Set Room Count
          </h3>
          <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
            {selectedDate ? fmtDateLong(selectedDate) : "Click a date to set how many rooms are available"}
          </p>
        </div>

        {/* ── No date selected ── */}
        {!selectedDate && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 12, padding: "24px 16px",
            background: SURFACE, border: `1.5px dashed ${BORDER}`,
            borderRadius: 12, textAlign: "center" as const,
          }}>
            <div style={{ fontSize: 32 }}>📦</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: BLACK, margin: "0 0 4px" }}>No date selected</p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
                Click any future date on the calendar to override how many rooms guests can book that night.
              </p>
            </div>
            <InfoRow icon="🏨" text={`Default: ${defaultCount} room${defaultCount !== 1 ? "s" : ""} available`} />
            <InfoRow icon="📅" text="Override applies to that night only" />
            <InfoRow icon="🔄" text="Resets to default when cleared" />
          </div>
        )}

        {/* ── Date selected ── */}
        {selectedDate && selectedDay && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <StatCard
                label="Total" value={selectedDay.total_rooms} color={BLACK}
                sub={selectedDay.available_count_override != null ? "override" : "default"}
              />
              <StatCard
                label="Booked" value={selectedDay.booked_rooms}
                color={selectedDay.booked_rooms > 0 ? "#d97706" : "#9ca3af"}
                sub="confirmed"
              />
              <StatCard
                label="Left" value={selectedDay.available_rooms}
                color={selectedDay.available_rooms === 0 ? "#dc2626" : selectedDay.available_rooms <= 2 ? "#d97706" : "#16a34a"}
                sub={selectedDay.is_blocked ? "blocked" : "available"}
              />
            </div>

            {/* Blocked notice */}
            {selectedDay.is_blocked && (
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "#fff1f1", border: "1px solid #fecaca", fontSize: 12, color: "#7f1d1d", lineHeight: 1.5 }}>
                🚫 This night is <strong>blocked</strong> via the Rate Calendar.
                Unblock it there first before setting inventory.
              </div>
            )}

            {/* Set rooms input */}
            {!selectedDay.is_blocked && (
              <>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    Available rooms for this night
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      ref={inputRef}
                      type="number" min="0" max={9999} step="1"
                      placeholder={String(defaultCount)}
                      value={inputCount}
                      onChange={e => setInputCount(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                      disabled={saving}
                      style={{
                        ...sharedInput, flex: 1, height: 44, padding: "0 14px",
                        fontSize: 18, fontWeight: 700,
                        opacity: saving ? 0.6 : 1,
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
                      onBlur={e  => (e.currentTarget.style.borderColor = BORDER)}
                    />
                    <span style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>rooms</span>
                  </div>
                  <p style={{ fontSize: 11, color: inputHint.startsWith("⚠") ? "#dc2626" : MUTED, margin: "6px 0 0", lineHeight: 1.4 }}>
                    {inputHint}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                  <button onClick={handleSave} disabled={isSaveDisabled} style={{
                    height: 44, width: "100%", borderRadius: 9999,
                    fontSize: 13, fontWeight: 700,
                    cursor: isSaveDisabled ? "not-allowed" : "pointer",
                    border: "none", fontFamily: "inherit",
                    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DK} 100%)`,
                    color: "#fff",
                    opacity: isSaveDisabled ? 0.5 : 1,
                    boxShadow: !isSaveDisabled ? "0 2px 10px rgba(201,168,76,0.3)" : "none",
                    transition: "opacity 0.2s",
                  }}>
                    {saving ? "Saving…"
                      : inputCount === ""
                        ? "Reset to Default"
                        : `Set ${inputCount} Room${parseInt(inputCount, 10) !== 1 ? "s" : ""}`}
                  </button>

                  {selectedDay.available_count_override != null && (
                    <button onClick={handleReset} disabled={saving} style={{
                      height: 40, width: "100%", borderRadius: 9999,
                      fontSize: 12, cursor: saving ? "not-allowed" : "pointer",
                      fontFamily: "inherit", background: "transparent",
                      color: "#6B7280", border: `1.5px solid ${BORDER}`,
                      opacity: saving ? 0.5 : 1,
                    }}>
                      ↩ Reset to room default ({defaultCount} rooms)
                    </button>
                  )}

                  <button onClick={() => { setSelectedDate(null); setInputCount(""); }} style={{
                    height: 38, width: "100%", borderRadius: 9999,
                    fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    background: "transparent", color: MUTED, border: "none",
                  }}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Blocked: only a cancel button */}
            {selectedDay.is_blocked && (
              <button onClick={() => { setSelectedDate(null); setInputCount(""); }} style={{
                marginTop: "auto", height: 40, width: "100%", borderRadius: 9999,
                fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                background: "transparent", color: "#6B7280",
                border: `1.5px solid ${BORDER}`,
              }}>
                Go back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ══════════════════════════════════════════════════════════════════════════ ──
//    SECTION HEADER (used for Manage Rates / Manage Inventory)
// ── ══════════════════════════════════════════════════════════════════════════ ──

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: BLACK, margin: 0, marginBottom: 2 }}>{title}</h3>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ── ══════════════════════════════════════════════════════════════════════════ ──
//    PAGE
// ── ══════════════════════════════════════════════════════════════════════════ ──

export default function RatesInventoryPage() {
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const toast = useToast();
  const token = getAccessToken();

  const [properties,     setProperties]     = useState<Property[]>([]);
  const [selectedPropId, setSelectedPropId] = useState("");
  const [rooms,          setRooms]          = useState<PartnerRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loadingProps,   setLoadingProps]   = useState(true);
  const [loadingRooms,   setLoadingRooms]   = useState(false);

  // ── Load properties ───────────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading || !token) return;
    setLoadingProps(true);

    partnerApi.listProperties(token, { status: "approved", limit: 50 })
      .then(res => {
        const list = res.properties ?? [];
        setProperties(list);
        if (list.length > 0) setSelectedPropId(list[0].id);
      })
      .catch(() => toast.error("Failed to load properties."))
      .finally(() => setLoadingProps(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  // ── Load rooms when property changes ──────────────────────────────────────

  const loadRooms = useCallback(async (propertyId: string) => {
    if (!token) return;
    setLoadingRooms(true);
    setRooms([]); setSelectedRoomId("");
    try {
      const data = await partnerApi.listRooms(token, propertyId);
      const active = (data ?? []).filter((r: any) => r.is_active) as PartnerRoom[];
      setRooms(active);
      if (active.length > 0) setSelectedRoomId(active[0].id);
    } catch {
      toast.error("Failed to load rooms.");
    } finally {
      setLoadingRooms(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedPropId || !token) return;
    loadRooms(selectedPropId);
  }, [selectedPropId, loadRooms]);

  const selectedProp = properties.find(p => p.id === selectedPropId);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {toast.el}

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: BLACK, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Rates &amp; Inventory
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          Set nightly prices, block dates, and manage room inventory — all in one place.
        </p>
      </div>

      {/* ── Loading state ── */}
      {loadingProps && (
        <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
          <p style={{ fontSize: 14 }}>Loading your properties…</p>
        </div>
      )}

      {/* ── No properties ── */}
      {!loadingProps && properties.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏨</div>
          <h3 style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 600, marginBottom: 8, color: BLACK }}>
            No approved properties yet
          </h3>
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            Your properties need to be approved before you can manage rates and inventory.
          </p>
        </div>
      )}

      {/* ── Main content ── */}
      {!loadingProps && properties.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Property selector */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>
              Select Property
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {properties.map(prop => (
                <button key={prop.id} onClick={() => setSelectedPropId(prop.id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                  border: `1.5px solid ${selectedPropId === prop.id ? GOLD : BORDER}`,
                  background: selectedPropId === prop.id ? "rgba(201,168,76,0.06)" : "#fff",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (selectedPropId !== prop.id) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.4)"; }}
                  onMouseLeave={e => { if (selectedPropId !== prop.id) (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; }}
                >
                  {prop.thumbnail_url && (
                    <img src={prop.thumbnail_url} alt={prop.name}
                      style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                  )}
                  <div style={{ textAlign: "left" as const }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>{prop.name}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{prop.city}, {prop.state}</div>
                  </div>
                  {selectedPropId === prop.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 4 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Room type selector */}
          {selectedPropId && (
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>
                Select Room Type
              </label>

              {loadingRooms ? (
                <div style={{ color: MUTED, fontSize: 13 }}>Loading rooms…</div>
              ) : rooms.length === 0 ? (
                <div style={{ color: MUTED, fontSize: 13 }}>No active room types for this property.</div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {rooms.map(room => (
                    <button key={room.id} onClick={() => setSelectedRoomId(room.id)} style={{
                      padding: "8px 16px", borderRadius: 9999, cursor: "pointer",
                      border: `1.5px solid ${selectedRoomId === room.id ? GOLD : BORDER}`,
                      background: selectedRoomId === room.id ? GOLD : "#fff",
                      color: selectedRoomId === room.id ? "#fff" : "#6B7280",
                      fontSize: 13, fontWeight: selectedRoomId === room.id ? 600 : 400,
                      fontFamily: "inherit", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { if (selectedRoomId !== room.id) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.4)"; }}
                      onMouseLeave={e => { if (selectedRoomId !== room.id) (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; }}
                    >
                      {room.name}
                      <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>
                        · {fmtPrice(room.base_price)}/night
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rate + Inventory calendars */}
          {selectedRoom && token && (
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px" }}>

              {/* Room info header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 700, color: BLACK, margin: 0, marginBottom: 6 }}>
                    {selectedRoom.name}
                  </h2>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>
                      Base: <strong style={{ color: BLACK }}>{fmtPrice(selectedRoom.base_price)}/night</strong>
                    </span>
                    {selectedRoom.weekend_price && (
                      <span style={{ fontSize: 13, color: "#6B7280" }}>
                        Weekend: <strong style={{ color: BLACK }}>{fmtPrice(selectedRoom.weekend_price)}/night</strong>
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: "#6B7280" }}>
                      {selectedRoom.count} room{selectedRoom.count !== 1 ? "s" : ""}
                    </span>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>
                      Max {selectedRoom.max_occupancy} guests
                    </span>
                  </div>
                </div>
                <div style={{ padding: "6px 14px", borderRadius: 9999, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", fontSize: 12, color: "#7A5F18" }}>
                  {selectedProp?.name}
                </div>
              </div>

              {/* ── Manage Rates ── */}
              <div style={{ marginBottom: 12 }}>
                <SectionHeader icon="💰" title="Manage Rates" subtitle="Set nightly prices and block unavailable dates" />
              </div>

              <RateCalendarInline
                key={`rate-${selectedRoom.id}`}
                roomId={selectedRoom.id}
                roomName={selectedRoom.name}
                basePrice={selectedRoom.base_price}
                token={token}
                toast={toast}
              />

              {/* Divider */}
              <div style={{ height: 1, background: BORDER, margin: "32px 0" }} />

              {/* ── Manage Inventory ── */}
              <div style={{ marginBottom: 12 }}>
                <SectionHeader
                  icon="📦"
                  title="Manage Inventory"
                  subtitle={`Control how many of your ${selectedRoom.count} room${selectedRoom.count !== 1 ? "s" : ""} are available per night. Updates live as guests book.`}
                />
              </div>

              <InventoryCalendar
                key={`inv-${selectedRoom.id}`}
                roomId={selectedRoom.id}
                roomName={selectedRoom.name}
                defaultCount={selectedRoom.count}
                token={token}
                toast={toast}
              />
            </div>
          )}
        </div>
      )}

      {/* Global animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ratesFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes invPulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }
      ` }} />
    </div>
  );
}