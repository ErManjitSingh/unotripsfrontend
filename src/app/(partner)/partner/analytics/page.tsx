"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { AnalyticsSummary, RevenueDataPoint, Property } from "@/lib/partner/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const EMPTY: AnalyticsSummary = {
  period: "Last 30 days", total_revenue: 0, total_bookings: 0, avg_occupancy_pct: 0,
  avg_daily_rate: 0, cancellation_rate: 0, top_room_type: "—", revenue_change_pct: 0, booking_change_pct: 0,
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconRevenue  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const IconBook     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IconOcc      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconRate     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17V13"/><path d="M12 17V9"/><path d="M16 17V11"/></svg>;

// ── Period Selector ───────────────────────────────────────────────────────────
type Period = "7d" | "30d" | "90d" | "1y";
const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 days" }, { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" }, { value: "1y", label: "1 year" },
];

function PeriodSelector({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  return (
    <div style={{ display: "flex", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10, overflow: "hidden" }}>
      {PERIODS.map(p => (
        <button key={p.value} onClick={() => onChange(p.value)}
          style={{ padding: "7px 14px", border: "none", background: value === p.value ? "#0C0C0C" : "transparent", color: value === p.value ? "#fff" : "#6B7280", fontSize: 12, fontWeight: value === p.value ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ h = 14, w = "100%", r = 6 }: { h?: number; w?: number | string; r?: number }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />;
}

// ── Analytics KPI Grid ────────────────────────────────────────────────────────
function AnalyticsKpiGrid({ summary, loading }: { summary: AnalyticsSummary; loading: boolean }) {
  const kpis = [
    { Icon: IconRevenue, label: "Total Revenue",   value: fmt(summary.total_revenue),       sub: "This period",        change: summary.revenue_change_pct },
    { Icon: IconBook,    label: "Total Bookings",  value: String(summary.total_bookings),    sub: "This period",        change: summary.booking_change_pct },
    { Icon: IconOcc,     label: "Avg Occupancy",   value: `${summary.avg_occupancy_pct}%`,   sub: "Room nights filled", change: undefined },
    { Icon: IconRate,    label: "Avg Daily Rate",  value: fmt(summary.avg_daily_rate),       sub: "Per room per night", change: undefined },
  ];

  if (loading) {
    return (
      <div className="analytics-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ height: 130, borderRadius: 12, background: "#f4f4f4" }} />)}
      </div>
    );
  }

  return (
    <div className="analytics-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
      {kpis.map((k, i) => {
        const pos = k.change !== undefined && k.change >= 0;
        return (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, padding: "20px 22px", position: "relative", overflow: "hidden", transition: "border-color 0.2s,box-shadow 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#C9A84C"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(201,168,76,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#C9A84C,#E8D5A0)" }} />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><k.Icon /></div>
              {k.change !== undefined && <span style={{ fontSize: 11, fontWeight: 600, color: pos ? "#15803d" : "#dc2626", background: pos ? "#f0fdf4" : "#fef2f2", padding: "3px 9px", borderRadius: 9999 }}>{pos ? "+" : ""}{k.change}%</span>}
            </div>
            <div style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: "#9B9B9B" }}>{k.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Analytics Summary Row ─────────────────────────────────────────────────────
function AnalyticsSummaryRow({ summary, loading }: { summary: AnalyticsSummary; loading: boolean }) {
  const items = [
    { label: "Cancellation Rate", value: `${summary.cancellation_rate}%`, color: summary.cancellation_rate > 10 ? "#dc2626" : "#15803d" },
    { label: "Top Room Type",     value: summary.top_room_type,           color: "#0C0C0C" },
    { label: "Period",            value: summary.period,                   color: "#0C0C0C" },
  ];

  return (
    <div className="analytics-summary" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, padding: "16px 20px" }}>
          {loading ? (<><Sk h={11} w="50%" r={4} /><div style={{ marginTop: 10 }}><Sk h={20} w="70%" r={4} /></div></>)
          : (<><div style={{ fontSize: 11, fontWeight: 600, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>{item.label}</div><div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div></>)}
        </div>
      ))}
    </div>
  );
}

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
function RevenueChart({ data, loading }: { data: RevenueDataPoint[]; loading: boolean }) {
  if (loading) return <div style={{ height: 200, borderRadius: 10, background: "#f4f4f4" }} />;
  if (data.length === 0) return <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#9B9B9B", fontSize: 13 }}>No revenue data for this period.</div>;

  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
          <div title={fmt(d.revenue)} style={{ width: "100%", background: "linear-gradient(180deg,#C9A84C,#b8943e)", borderRadius: "4px 4px 0 0", height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue > 0 ? 4 : 0, transition: "height 0.3s", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"} />
          {data.length <= 14 && <div style={{ fontSize: 9, color: "#9B9B9B", whiteSpace: "nowrap" as const, transform: "rotate(-45deg)", transformOrigin: "top center" }}>{d.label?.slice(0, 5)}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Property Selector ─────────────────────────────────────────────────────────
function PropertySelector({ properties, selectedId, onChange }: { properties: Pick<Property, "id" | "name" | "city">[]; selectedId: string; onChange: (id: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={selectedId} onChange={e => onChange(e.target.value)}
        style={{ padding: "9px 32px 9px 14px", border: "1.5px solid #E5E5E5", borderRadius: 9, fontSize: 13, fontFamily: "inherit", background: "#fff", outline: "none", cursor: "pointer", appearance: "none" as const, color: "#0C0C0C" }}>
        {properties.map(p => <option key={p.id} value={p.id}>{p.name}, {p.city}</option>)}
      </select>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PartnerAnalyticsPage() {
  const { user, isLoading: authLoading, getAccessToken } = useAuth();

  const [loading,       setLoading]       = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [period,        setPeriod]        = useState<Period>("30d");
  const [properties,    setProperties]    = useState<Pick<Property, "id" | "name" | "city">[]>([]);
  const [selectedId,    setSelectedId]    = useState("");
  const [summary,       setSummary]       = useState<AnalyticsSummary>(EMPTY);
  const [revenueData,   setRevenueData]   = useState<RevenueDataPoint[]>([]);

  const token = getAccessToken();

  // Fetch properties
  useEffect(() => {
    if (authLoading || !token) return;
    partnerApi.listProperties(token!, { page: 1, limit: 50 })
      .then(res => {
        const opts = (res.properties ?? []).map((p: any) => ({ id: p.id, name: p.name, city: p.city }));
        setProperties(opts);
        if (opts.length > 0) setSelectedId(opts[0].id);
      }).catch(() => {});
  }, [authLoading, token]);

  // Fetch KPI summary
  useEffect(() => {
    if (authLoading || !token) return;
    setLoading(true);
    partnerApi.getAnalyticsSummary(token!, period)
      .then(res => setSummary(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authLoading, token, period]);

  // Fetch chart data
  useEffect(() => {
    if (authLoading || !token || !selectedId) return;
    setChartsLoading(true);
    partnerApi.getRevenueChart(token!, period, selectedId)
      .then(d => setRevenueData(d ?? []))
      .catch(() => setRevenueData([]))
      .finally(() => setChartsLoading(false));
  }, [authLoading, token, selectedId, period]);

  const selectedProp = properties.find(p => p.id === selectedId);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12, paddingBottom: 20, borderBottom: "1px solid #E5E5E5" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em" }}>Analytics</h1>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", marginTop: 2 }} />
          </div>
          <p style={{ fontSize: 13, color: "#9B9B9B" }}>Overall performance across all properties — {summary.period}</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <AnalyticsKpiGrid summary={summary} loading={loading} />
      <AnalyticsSummaryRow summary={summary} loading={loading} />

      {/* Per-property chart section */}
      {properties.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingTop: 8, flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: 2 }}>Property Analytics</p>
              <p style={{ fontSize: 12, color: "#9B9B9B" }}>Select a property to view its detailed performance graphs</p>
            </div>
            <PropertySelector properties={properties} selectedId={selectedId} onChange={setSelectedId} />
          </div>

          <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            {/* Revenue chart */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E5E5", background: "#F9F7F2", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 16, borderRadius: 2, background: "#C9A84C" }} />
                <h2 style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#0C0C0C" }}>Revenue — {selectedProp?.name}</h2>
              </div>
              <div style={{ padding: "20px" }}>
                <RevenueChart data={revenueData} loading={chartsLoading} />
              </div>
            </div>

            {/* Occupancy summary */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E5E5", background: "#F9F7F2", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 16, borderRadius: 2, background: "#C9A84C" }} />
                <h2 style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#0C0C0C" }}>Occupancy Overview</h2>
              </div>
              <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Average Occupancy", value: `${summary.avg_occupancy_pct}%`, bar: summary.avg_occupancy_pct },
                  { label: "Cancellation Rate", value: `${summary.cancellation_rate}%`, bar: summary.cancellation_rate, danger: summary.cancellation_rate > 10 },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#6B7280" }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.danger ? "#dc2626" : "#0C0C0C" }}>{item.value}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "#E5E5E5", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, item.bar)}%`, background: item.danger ? "#dc2626" : "linear-gradient(90deg,#C9A84C,#E8D5A0)", borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: 8, borderTop: "1px solid #E5E5E5" }}>
                  <div style={{ fontSize: 11, color: "#9B9B9B", marginBottom: 4 }}>Top Performing Room Type</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0C0C0C" }}>{summary.top_room_type}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && properties.length === 0 && (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0C0C0C", marginBottom: 6 }}>No property data yet</div>
          <div style={{ fontSize: 13, color: "#9B9B9B" }}>Add and get your first property approved to see analytics here.</div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @media(max-width:1100px){.analytics-kpi{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:860px){.chart-grid{grid-template-columns:1fr!important}.analytics-summary{grid-template-columns:1fr!important}}
      ` }} />
    </div>
  );
}