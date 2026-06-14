"use client";

/**
 * src/app/(partner)/partner/properties/[propertyId]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Property edit page — 1000% replica of unohotelsandresorts.com
 *
 * 4 tabs: Basic Info | Amenities | Policies | Contact
 * Each saves via partnerApi.updateProperty(token, propertyId, payload)
 *
 * API: partnerApi.getProperty(token, propertyId)
 *      partnerApi.updateProperty(token, propertyId, data)
 */

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { Property } from "@/lib/partner/api";

// ── Status Badge (same as properties list) ────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  draft:          { label: "Draft",          bg: "#f8f8f8", color: "#666",    border: "#ddd",    dot: "#999"    },
  pending_review: { label: "Pending Review", bg: "#fffbeb", color: "#b45309", border: "#fde68a", dot: "#d97706" },
  approved:       { label: "Approved",       bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
  rejected:       { label: "Rejected",       bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#dc2626" },
  inactive:       { label: "Inactive",       bg: "#f8f8f8", color: "#888",    border: "#e0e0e0", dot: "#aaa"    },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" as const }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function show(msg: string, type: "success" | "error") {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), 3500);
  }
  const el = toast ? (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 320, animation: "propEditFade 0.2s ease" }}>
      {toast.msg}
    </div>
  ) : null;
  return { success: (m: string) => show(m, "success"), error: (m: string) => show(m, "error"), el };
}

// ── Shared input styles ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 14px",
  border: "1px solid #E5E5E5", borderRadius: 10,
  fontSize: 14, fontFamily: "inherit", outline: "none",
  boxSizing: "border-box" as const, transition: "border-color 0.2s",
  color: "#0C0C0C", background: "#fff",
};

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function FocusTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} style={{ width: "100%", padding: "12px 14px", border: "1px solid #E5E5E5", borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical" as const, outline: "none", lineHeight: 1.6, boxSizing: "border-box" as const, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

// ── SaveBtn ───────────────────────────────────────────────────────────────────

function SaveBtn({ loading, label = "Save Changes", size = "md" }: { loading: boolean; label?: string; size?: "md" | "lg" }) {
  return (
    <button type="button" disabled={loading}
      style={{ padding: size === "lg" ? "11px 26px" : "9px 22px", background: loading ? "rgba(201,168,76,0.4)" : "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)", color: "#fff", border: "none", borderRadius: 9999, fontSize: size === "lg" ? 14 : 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 2px 8px rgba(201,168,76,0.3)", display: "inline-flex", alignItems: "center", gap: 8, transition: "opacity 0.2s" }}>
      {loading && <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "propEditSpin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />}
      {loading ? "Saving…" : label}
    </button>
  );
}

// ── Field constants ───────────────────────────────────────────────────────────

type TabKey = "info" | "amenities" | "policies" | "contact";

const TABS: { key: TabKey; label: string }[] = [
  { key: "info",      label: "Basic Info"  },
  { key: "amenities", label: "Amenities"   },
  { key: "policies",  label: "Policies"    },
  { key: "contact",   label: "Contact"     },
];

const ALL_AMENITIES = [
  "WiFi","Pool","Spa","Gym","Restaurant","Bar","Parking",
  "Room Service","Concierge","Laundry","Beach Access","Garden",
  "Terrace","Rooftop","EV Charging","Wheelchair Accessible",
  "Kids Club","Business Centre","Airport Shuttle","24hr Front Desk",
];

const ALL_TAGS = [
  "Luxury","Beachfront","Heritage","Boutique","Family Friendly",
  "Romantic","Business","Budget","Eco-friendly","Pet Friendly",
  "Mountain View","Lake View","City View",
];

const POLICY_FIELDS = [
  { key: "cancellation",   label: "Cancellation Policy" },
  { key: "children",       label: "Children Policy"     },
  { key: "pets",           label: "Pet Policy"          },
  { key: "smoking",        label: "Smoking Policy"      },
  { key: "extra_bed",      label: "Extra Bed Policy"    },
] as const;

type PolicyKey = typeof POLICY_FIELDS[number]["key"];

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PropertyEditPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { getAccessToken } = useAuth();
  const toast = useToast();
  const token = getAccessToken();

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [property,  setProperty]  = useState<Partial<Property>>({});
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  // Policies local state
  const [policies, setPolicies] = useState({
    cancellation: "", children: "", pets: "", smoking: "", extra_bed: "",
    check_in_time: "14:00", check_out_time: "12:00",
  });

  // Contact local state
  const [contact, setContact] = useState({
    phone: "", email: "", whatsapp: "", website: "", gst: "",
  });

  // ── Load ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token || !propertyId) return;
    setLoading(true);

    partnerApi.getProperty(token, propertyId)
      .then(data => {
        setProperty(data);

        // Seed policies from top-level or nested .policies
        const p = (data as any).policies ?? data;
        setPolicies({
          cancellation:   p.cancellation   ?? "",
          children:       p.children       ?? "",
          pets:           p.pets           ?? "",
          smoking:        p.smoking        ?? "",
          extra_bed:      p.extra_bed      ?? "",
          check_in_time:  p.check_in_time  ?? data.check_in_time  ?? "14:00",
          check_out_time: p.check_out_time ?? data.check_out_time ?? "12:00",
        });

        // Seed contact
        const c = (data as any).contact ?? {};
        setContact({
          phone:    c.phone    ?? "",
          email:    c.email    ?? "",
          whatsapp: c.whatsapp ?? "",
          website:  c.website  ?? "",
          gst:      c.gst      ?? "",
        });
      })
      .catch(() => toast.error("Failed to load property."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, propertyId]);

  function setField<K extends keyof Property>(key: K, val: Property[K]) {
    setProperty(p => ({ ...p, [key]: val }));
  }

  function toggleAmenity(a: string) {
    const cur = property.amenities ?? [];
    setField("amenities", cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  }

  function toggleTag(t: string) {
    const cur = (property as any).tags ?? [];
    setProperty(p => ({ ...p, tags: cur.includes(t) ? cur.filter((x: string) => x !== t) : [...cur, t] }));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name:           property.name,
        description:    property.description,
        city:           property.city,
        state:          property.state,
        address:        property.address,
        pincode:        property.pincode,
        star_category:  property.star_category,
        amenities:      property.amenities,
        tags:           (property as any).tags,
        check_in_time:  policies.check_in_time,
        check_out_time: policies.check_out_time,
        cancellation:   policies.cancellation,
        children:       policies.children,
        pets:           policies.pets,
        smoking:        policies.smoking,
        extra_bed:      policies.extra_bed,
        contact,
      };
      await partnerApi.updateProperty(token, propertyId, payload);
      toast.success("Property updated successfully.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ height: 36, width: 280, borderRadius: 8, background: "#f0f0f0" }} />
        <div style={{ height: 200, borderRadius: 12, background: "#f0f0f0" }} />
        <div style={{ height: 160, borderRadius: 12, background: "#f0f0f0" }} />
        <style dangerouslySetInnerHTML={{ __html: `@keyframes propEditSpin{to{transform:rotate(360deg)}}@keyframes propEditFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}` }} />
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: "#3d3b37", display: "block", marginBottom: 6,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {toast.el}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Link href="/partner/properties" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9B9B9B", marginBottom: 10, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0C0C0C"}
            onMouseLeave={e => e.currentTarget.style.color = "#9B9B9B"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12H5M12 5l-7 7 7 7"/></svg>
            All Properties
          </Link>
          <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em", marginBottom: 8 }}>
            {property.name || "Edit Property"}
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {property.status && <StatusBadge status={property.status} />}
            <Link href={`/partner/properties/${propertyId}/rooms`}
              style={{ fontSize: 13, color: "#C9A84C", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid rgba(201,168,76,0.5)" }}
              onMouseEnter={e => e.currentTarget.style.borderBottomColor = "#C9A84C"}
              onMouseLeave={e => e.currentTarget.style.borderBottomColor = "rgba(201,168,76,0.5)"}
            >
              🛏 Manage Rooms →
            </Link>
          </div>
        </div>
        <SaveBtn loading={saving} label="Save Changes" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E5E5E5", marginBottom: 28, gap: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "10px 20px", background: "transparent", border: "none",
            borderBottom: `2px solid ${activeTab === t.key ? "#0C0C0C" : "transparent"}`,
            fontSize: 14, fontWeight: activeTab === t.key ? 600 : 400,
            color: activeTab === t.key ? "#0C0C0C" : "#6B7280",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            marginBottom: -1, whiteSpace: "nowrap" as const,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, padding: 28 }}>

        {/* ── Basic Info ── */}
        {activeTab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Property Name</label>
              <FocusInput value={property.name ?? ""} onChange={e => setField("name", e.target.value as any)} placeholder="e.g. The Grand Palace Hotel" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>City</label><FocusInput value={property.city ?? ""} onChange={e => setField("city", e.target.value as any)} placeholder="Mumbai" /></div>
              <div><label style={labelStyle}>State</label><FocusInput value={property.state ?? ""} onChange={e => setField("state", e.target.value as any)} placeholder="Maharashtra" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Full Address</label><FocusInput value={property.address ?? ""} onChange={e => setField("address", e.target.value as any)} placeholder="123 Marine Drive" /></div>
              <div><label style={labelStyle}>Pincode</label><FocusInput value={property.pincode ?? ""} onChange={e => setField("pincode", e.target.value as any)} placeholder="400001" /></div>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <FocusTextarea value={property.description ?? ""} rows={4} onChange={e => setField("description", e.target.value as any)} placeholder="Describe your property…" />
            </div>
            <div>
              <label style={labelStyle}>Star Category</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setField("star_category", s as any)}
                    style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${property.star_category === s ? "#C9A84C" : "#E5E5E5"}`, background: property.star_category === s ? "#FBF3DE" : "#fff", color: property.star_category === s ? "#9B7D32" : "#9B9B9B", cursor: "pointer", fontSize: 16, fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s" }}>
                    {s}★
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Amenities ── */}
        {activeTab === "amenities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", marginBottom: 14 }}>
                Property Amenities ({(property.amenities ?? []).length} selected)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_AMENITIES.map(a => {
                  const on = (property.amenities ?? []).includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      style={{ padding: "7px 16px", borderRadius: 9999, border: `1.5px solid ${on ? "#0C0C0C" : "#E5E5E5"}`, background: on ? "#0C0C0C" : "#fff", color: on ? "#fff" : "#6B7280", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: on ? 500 : 400, transition: "all 0.15s" }}>
                      {on && "✓ "}{a}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", marginBottom: 10 }}>Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_TAGS.map(t => {
                  const on = ((property as any).tags ?? []).includes(t);
                  return (
                    <button key={t} type="button" onClick={() => toggleTag(t)}
                      style={{ padding: "5px 14px", borderRadius: 9999, border: `1px solid ${on ? "#C9A84C" : "#E5E5E5"}`, background: on ? "#FBF3DE" : "#fff", color: on ? "#9B7D32" : "#6B7280", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: on ? 600 : 400, transition: "all 0.15s" }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Policies ── */}
        {activeTab === "policies" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Check-in Time</label>
                <input type="time" value={policies.check_in_time} onChange={e => setPolicies(p => ({ ...p, check_in_time: e.target.value }))}
                  style={{ height: 44, padding: "0 14px", border: "1px solid #E5E5E5", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" as const }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C9A84C")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "#E5E5E5")} />
              </div>
              <div>
                <label style={labelStyle}>Check-out Time</label>
                <input type="time" value={policies.check_out_time} onChange={e => setPolicies(p => ({ ...p, check_out_time: e.target.value }))}
                  style={{ height: 44, padding: "0 14px", border: "1px solid #E5E5E5", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" as const }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#C9A84C")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "#E5E5E5")} />
              </div>
            </div>
            {POLICY_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <FocusTextarea value={policies[key as PolicyKey]} rows={2}
                  onChange={e => setPolicies(p => ({ ...p, [key]: e.target.value }))}
                  style={{ fontSize: 13 }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Contact ── */}
        {activeTab === "contact" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <FocusInput value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <FocusInput type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} placeholder="contact@yourhotel.com" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <FocusInput value={contact.whatsapp} onChange={e => setContact(c => ({ ...c, whatsapp: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <FocusInput value={contact.website} onChange={e => setContact(c => ({ ...c, website: e.target.value }))} placeholder="https://yourhotel.com" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>GSTIN</label>
              <FocusInput value={contact.gst} onChange={e => setContact(c => ({ ...c, gst: e.target.value }))} placeholder="22AAAAA0000A1Z5" style={{ maxWidth: 300 }} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom save button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <SaveBtn loading={saving} label="Save All Changes" size="lg" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes propEditSpin { to { transform: rotate(360deg); } }
        @keyframes propEditFade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
}