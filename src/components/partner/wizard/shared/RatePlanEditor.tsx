"use client";

/**
 * src/components/partner/wizard/shared/RatePlanEditor.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Website rate-plan matrix — Room Rate / Extra Bed × EP / CP / MAP / AP.
 *
 * Replaces the retired base_price + weekend_price + meal_plans model.
 * Partner only edits the "website" channel of RatePlans; staff/agent stay
 * zeroed and are sent as-is (Ops-exclusive, enforced server-side).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Fragment } from "react";
import type { RatePlanChannel } from "./types";

type TierKey = "ep" | "cp" | "map" | "ap";
type RowKey  = "room" | "extra_bed";

const TIERS: { key: TierKey; code: string; desc: string }[] = [
  { key: "ep",  code: "EP",  desc: "Room only" },
  { key: "cp",  code: "CP",  desc: "Room + breakfast" },
  { key: "map", code: "MAP", desc: "Room + breakfast + dinner" },
  { key: "ap",  code: "AP",  desc: "Room + all meals" },
];

const ROWS: { key: RowKey; label: string }[] = [
  { key: "room",      label: "Room Rate" },
  { key: "extra_bed", label: "Extra Bed" },
];

const wrapSt: React.CSSProperties = {
  border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", background: "#fff",
};
const headerSt: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "12px 16px",
  background: "#FAF7EF", borderBottom: "1px solid #E5E5E5",
  fontSize: 13, fontWeight: 700, color: "#0C0C0C",
};
const gridSt: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "110px repeat(4, 1fr)",
};
const cellHeadSt: React.CSSProperties = {
  padding: "10px 10px", borderBottom: "1px solid #F0EDE6", background: "#FFFBF3",
};
const cellHeadCodeSt: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#8A6D1F",
  textTransform: "uppercase" as const, letterSpacing: "0.04em",
};
const cellHeadDescSt: React.CSSProperties = {
  fontSize: 10, fontWeight: 500, color: "#9B9B9B", marginTop: 2,
};
const cellLabelSt: React.CSSProperties = {
  padding: "12px 12px", fontSize: 13, fontWeight: 600, color: "#0C0C0C",
  display: "flex", alignItems: "center", borderTop: "1px solid #F0EDE6",
};
const cellInputWrapSt: React.CSSProperties = {
  padding: "8px 10px", borderTop: "1px solid #F0EDE6", borderLeft: "1px solid #F5F1E8",
  display: "flex", alignItems: "center",
};
const inputSt: React.CSSProperties = {
  width: "100%", height: 38, padding: "0 10px",
  border: "1.5px solid #E5E5E5", borderRadius: 8,
  fontSize: 13, fontFamily: "inherit", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.15s",
};

interface RatePlanEditorProps {
  value:    RatePlanChannel;
  onChange: (next: RatePlanChannel) => void;
  error?:   string;
}

export default function RatePlanEditor({ value, onChange, error }: RatePlanEditorProps) {
  function setCell(row: RowKey, tier: TierKey, n: number) {
    onChange({ ...value, [row]: { ...value[row], [tier]: n } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={wrapSt}>
        <div style={headerSt}>
          🌐 Website <span style={{ color: "#C9A84C" }}>*</span>
        </div>
        <div style={gridSt}>
          <div style={cellHeadSt} />
          {TIERS.map(t => (
            <div key={t.key} style={cellHeadSt}>
              <div style={cellHeadCodeSt}>{t.code}</div>
              <div style={cellHeadDescSt}>{t.desc}</div>
            </div>
          ))}

          {ROWS.map(row => (
            <Fragment key={row.key}>
              <div style={cellLabelSt}>{row.label}</div>
              {TIERS.map(t => (
                <div key={`${row.key}-${t.key}`} style={cellInputWrapSt}>
                  <input
                    type="number"
                    min={0}
                    value={value[row.key][t.key] || ""}
                    placeholder="0"
                    onChange={e => setCell(row.key, t.key, e.target.value ? Number(e.target.value) : 0)}
                    style={inputSt}
                    onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; }}
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
      {error && <p style={{ fontSize: 11, color: "#dc2626", margin: 0 }}>{error}</p>}
    </div>
  );
}