"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { PayoutRecord, PayoutSummary } from "@/lib/partner/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconWallet  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconClock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconAlert   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IconArrow   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconEmpty   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; bg: string; color: string; border: string; Icon: () => JSX.Element }> = {
  pending:    { label: "Queued",     bg: "rgba(201,168,76,0.08)", color: "#9B7D32", border: "rgba(201,168,76,0.25)", Icon: IconClock   },
  processing: { label: "In Transit", bg: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)", Icon: IconRefresh },
  paid:       { label: "Paid",       bg: "rgba(22,163,74,0.08)",  color: "#15803d", border: "rgba(22,163,74,0.2)",   Icon: IconCheck   },
  failed:     { label: "Failed",     bg: "rgba(220,38,38,0.08)",  color: "#dc2626", border: "rgba(220,38,38,0.2)",   Icon: IconAlert   },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <cfg.Icon /> {cfg.label}
    </span>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)" : "#fff", border: accent ? "none" : "1px solid #E5E5E5", borderRadius: 14, padding: "20px 22px", boxShadow: accent ? "0 4px 20px rgba(201,168,76,0.25)" : "0 1px 4px rgba(10,10,10,0.04)", color: accent ? "#fff" : "inherit" }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, opacity: accent ? 0.85 : 1, color: accent ? "#fff" : "#9B9B9B", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "inherit", color: accent ? "#fff" : "#0C0C0C", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 6, opacity: 0.75, color: accent ? "#fff" : "#9B9B9B" }}>{sub}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ h = 14, w = "100%", r = 4 }: { h?: number; w?: number | string; r?: number }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,#f0efe8 0%,#e8e7df 50%,#f0efe8 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite" }} />;
}

// ── Payout Row ────────────────────────────────────────────────────────────────
const TD: React.CSSProperties = { padding: "14px 16px", fontSize: 13, color: "#6B7280", borderBottom: "1px solid #E5E5E5", whiteSpace: "nowrap" as const };
const TH: React.CSSProperties = { padding: "11px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#9B9B9B", textAlign: "left" as const, whiteSpace: "nowrap" as const, background: "#F9F7F2", borderBottom: "1px solid #E5E5E5" };

function PayoutRow({ record }: { record: PayoutRecord }) {
  const [open, setOpen] = useState(false);

  const periodLabel = (() => {
    if (record.period_start === record.period_end) {
      return new Date(record.period_start).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
    const s = new Date(record.period_start).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const e = new Date(record.period_end).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return `${s} – ${e}`;
  })();

  return (
    <>
      <tr onClick={() => setOpen(o => !o)}
        style={{ cursor: "pointer", background: open ? "rgba(201,168,76,0.04)" : "transparent", transition: "background 0.15s" }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = "#F9F7F2"; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
        <td style={TD}>{periodLabel}</td>
        <td style={TD}>{record.booking_count} booking{record.booking_count !== 1 ? "s" : ""}</td>
        <td style={TD}>{fmt(record.gross_amount)}</td>
        <td style={{ ...TD, color: "#dc2626" }}>−{fmt(record.commission)}</td>
        <td style={{ ...TD, color: "#dc2626" }}>−{fmt(record.tds_amount)}</td>
        <td style={{ ...TD, fontWeight: 700, color: "#0C0C0C" }}>{fmt(record.net_amount)}</td>
        <td style={TD}><StatusBadge status={record.status} /></td>
        <td style={{ ...TD, fontSize: 18, color: "#9B9B9B", textAlign: "right" as const, paddingRight: 16 }}>{open ? "▾" : "›"}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} style={{ padding: 0, borderBottom: "1px solid #E5E5E5" }}>
            <div style={{ background: "rgba(250,250,248,0.8)", padding: "16px 20px", display: "flex", gap: 32, flexWrap: "wrap", fontSize: 12 }}>
              {record.utr && <div><div style={{ color: "#9B9B9B", marginBottom: 3 }}>UTR Reference</div><div style={{ fontWeight: 600, color: "#0C0C0C", fontFamily: "monospace", fontSize: 13 }}>{record.utr}</div></div>}
              {record.paid_at && <div><div style={{ color: "#9B9B9B", marginBottom: 3 }}>Paid On</div><div style={{ fontWeight: 600, color: "#0C0C0C" }}>{new Date(record.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div></div>}
              <div><div style={{ color: "#9B9B9B", marginBottom: 3 }}>Payout ID</div><div style={{ fontWeight: 500, color: "#6B7280", fontFamily: "monospace", fontSize: 11 }}>{record.id.slice(0, 8).toUpperCase()}</div></div>
              <div><div style={{ color: "#9B9B9B", marginBottom: 3 }}>Currency</div><div style={{ fontWeight: 600 }}>{record.currency}</div></div>
              <div><div style={{ color: "#9B9B9B", marginBottom: 3 }}>Created</div><div style={{ fontWeight: 500 }}>{new Date(record.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div></div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
const LIMIT = 20;

export default function PartnerPayoutsPage() {
  const { user, isLoading: authLoading, getAccessToken } = useAuth();
  const token = getAccessToken();

  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !token) return;
    partnerApi.getPayoutSummary(token).then(res => setSummary(res)).catch(() => {});
  }, [token, authLoading]);

  useEffect(() => {
    if (authLoading || !token) return;
    let cancelled = false;
    setLoading(true);
    partnerApi.listPayouts(token, { page, limit: LIMIT })
      .then(res => { if (!cancelled) { setPayouts(res.items ?? []); setTotal(res.total ?? 0); } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, authLoading, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ maxWidth: 1100 }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}` }} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ color: "#C9A84C" }}><IconWallet /></span>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "inherit", color: "#0C0C0C" }}>Payouts</h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#9B9B9B" }}>Your earnings history — generated automatically after each guest checks out.</p>
      </div>

      {/* Bank not verified banner */}
      {summary && !summary.bank_account_verified && (
        <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>🏦</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>Bank account not verified</div>
              <div style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }}>Verify your bank account to start receiving payouts.</div>
            </div>
          </div>
          <Link href="/partner/account" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 9, border: "none", background: "#C9A84C", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" as const }}>
            Go to Account Settings <IconArrow />
          </Link>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 16, marginBottom: 28 }}>
        {summary ? (
          <>
            <KpiCard label="Total Earned" value={fmt(summary.total_earned)} sub={`${summary.total_bookings_paid_out} bookings paid out`} accent />
            <KpiCard label="Pending Transfer" value={fmt(summary.pending_amount)} sub="Queued for bank transfer" />
            <KpiCard label="In Transit" value={fmt(summary.processing_amount)} sub="Should arrive within 2 hrs" />
            <KpiCard label="Bank Status" value={summary.bank_account_verified ? "Verified ✓" : "Unverified"} sub={summary.bank_account_verified ? "Payouts enabled" : "Go to Account → Bank Details to verify"} />
          </>
        ) : (
          [0,1,2,3].map(i => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 14, padding: "20px 22px" }}>
              <Sk h={10} w="50%" /><div style={{ marginTop: 12 }}><Sk h={24} w="70%" /></div><div style={{ marginTop: 8 }}><Sk h={10} w="80%" /></div>
            </div>
          ))
        )}
      </div>

      {/* Payout history table */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(10,10,10,0.04)" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C" }}>Payout History</div>
          {total > 0 && <div style={{ fontSize: 12, color: "#9B9B9B" }}>{total} total record{total !== 1 ? "s" : ""}</div>}
        </div>

        {loading ? (
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[0,1,2,3].map(i => <Sk key={i} />)}
          </div>
        ) : payouts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B9B9B" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, opacity: 0.35 }}><IconEmpty /></div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0C0C0C", marginBottom: 6 }}>No payouts yet</div>
            <div style={{ fontSize: 13 }}>Payouts are generated automatically after guests check out.<br />Confirmed bookings appear here once the stay is complete.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Period</th><th style={TH}>Bookings</th><th style={TH}>Gross</th>
                  <th style={TH}>Commission</th><th style={TH}>TDS</th><th style={TH}>Net Payout</th>
                  <th style={TH}>Status</th><th style={{ ...TH, textAlign: "right" as const, paddingRight: 16 }}></th>
                </tr>
              </thead>
              <tbody>{payouts.map(r => <PayoutRow key={r.id} record={r} />)}</tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#9B9B9B" }}>Page {page} of {totalPages}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E5E5", background: page <= 1 ? "#F9F7F2" : "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit", opacity: page <= 1 ? 0.5 : 1 }}>← Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E5E5", background: page >= totalPages ? "#F9F7F2" : "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "inherit", opacity: page >= totalPages ? 0.5 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#F9F7F2", border: "1px solid #E5E5E5", borderRadius: 10, fontSize: 12, color: "#9B9B9B", lineHeight: 1.6 }}>
        <strong style={{ color: "#6B7280" }}>How payouts work:</strong>{" "}
        After a guest checks out, a payout is queued automatically. Admin reviews and initiates bank transfers within 2–3 business days via IMPS. Once paid, you receive a UTR reference by email. To manage your bank account,{" "}
        <Link href="/partner/account" style={{ color: "#C9A84C" }}>go to Account Settings</Link>.
      </div>
    </div>
  );
}