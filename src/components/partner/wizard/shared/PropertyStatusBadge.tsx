"use client";

type AnyStatus = string;

const CONFIG: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  draft:          { label: "Draft",          bg: "#f8f8f8", color: "#666",    border: "#ddd",    dot: "#999"    },
  pending_review: { label: "Pending Review", bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#d97706" },
  approved:       { label: "Approved",       bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
  rejected:       { label: "Rejected",       bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
  inactive:       { label: "Inactive",       bg: "#f8f8f8", color: "#888",    border: "#e0e0e0", dot: "#aaa"    },
  pending:        { label: "Pending",        bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#d97706" },
  kyc_submitted:  { label: "KYC Submitted",  bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  suspended:      { label: "Suspended",      bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
  not_started:    { label: "Not Started",    bg: "#f8f8f8", color: "#888",    border: "#e0e0e0", dot: "#aaa"    },
  submitted:      { label: "Submitted",      bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
  verified:       { label: "Verified",       bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
};

export default function PropertyStatusBadge({ status, size = "md" }: { status: AnyStatus; size?: "sm" | "md" }) {
  const c = CONFIG[status] ?? CONFIG["draft"];
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: sm ? "2px 8px" : "4px 10px",
      borderRadius: 9999,
      fontSize: sm ? 10 : 12, fontWeight: 600, letterSpacing: "0.03em",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}