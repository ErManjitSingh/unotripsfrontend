"use client";

import Link from "next/link";

export default function SetupChecklist() {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--black)", marginBottom: 3 }}>Complete Your Setup</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Verify your business to list properties and start receiving bookings.</p>
        </div>
        <Link href="/partner/account" style={{
          padding: "9px 20px",
          background: "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
          color: "#fff", border: "none", borderRadius: 9999,
          fontSize: 13, fontWeight: 600, textDecoration: "none",
          whiteSpace: "nowrap" as const,
          boxShadow: "0 2px 10px rgba(201,168,76,0.3)",
        }}>
          Start Verification →
        </Link>
      </div>

      <div style={{
        background: "#fff", border: "1px solid rgba(201,168,76,0.3)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(201,168,76,0.06)",
      }}>
        <div style={{ height: 2, background: "linear-gradient(90deg, #C9A84C, #E8D5A0)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 22px" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "rgba(201,168,76,0.06)", border: "1.5px solid rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--black)", marginBottom: 3 }}>Business KYC</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>Submit your PAN, GSTIN, and business details for verification.</div>
          </div>
          <Link href="/partner/account" style={{
            padding: "8px 18px", background: "transparent", color: "#9B7D32",
            border: "1px solid rgba(201,168,76,0.4)", borderRadius: 9999,
            fontSize: 12, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" as const,
          }}>Start →</Link>
        </div>
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Verification is instant. Once complete, you can list properties and start receiving bookings immediately.
      </p>
    </div>
  );
}