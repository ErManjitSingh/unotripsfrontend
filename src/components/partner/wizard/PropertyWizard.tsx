"use client";

/**
 * PropertyWizard.tsx — 10000% replica of unohotelsandresorts.com add property wizard
 *
 * All 8 steps inline in one file:
 *   Step 1 — Basic Info      (property name, type, star, total rooms, description)
 *   Step 2 — Location        (address, city, state, pincode, lat/lng)
 *   Step 3 — Amenities       (amenities pills + tags)
 *   Step 4 — Policies        (check-in/out, payment methods, policy text fields)
 *   Step 5 — Contact         (phone, email, whatsapp, website, GST + nearby attractions)
 *   Step 6 — Rooms           (add/edit/delete room types with meal plans)
 *   Step 7 — Dining          (optional dining venues)
 *   Step 8 — Photos          (property photo categories + room photos + agreements)
 *
 * Auth: uses useAuth() from contexts/auth-context
 * API:  uses partnerApi from lib/partner/api (token-based, proxied via /api/partner)
 * Photo upload: direct to /api/partner/v1/partner/photos/upload (multipart)
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";

// ── Utility: Generate UUID v4 ────────────────────────────────────────────────
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import WizardShell, { type StepConfig } from "./shared/WizardShell";
import type {
  PropertyWizardData, PropertyType, BedType, PartnerMealKey,
  MealPlans, RoomTypePayload, DiningVenue, NearbyAttraction,
} from "./shared/types";
import {
  MEAL_DEFAULT_PRICES, MEAL_PLAN_CODES,
  PARTNER_MEAL_PLAN_LABELS, PARTNER_MEAL_DESCRIPTIONS,
} from "./shared/types";

// ── Shared style helpers ──────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: "#3d3b37",
  display: "block", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: 44, padding: "0 14px",
  border: "1px solid #E5E5E5", borderRadius: 10,
  fontSize: 14, fontFamily: "inherit",
  outline: "none", boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
};

const textareaStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  border: "1px solid #E5E5E5", borderRadius: 10,
  fontSize: 14, fontFamily: "inherit",
  resize: "vertical" as const, outline: "none",
  lineHeight: 1.7, boxSizing: "border-box" as const,
};

const pillBase: React.CSSProperties = {
  padding: "7px 16px", borderRadius: 9999,
  fontSize: 13, cursor: "pointer",
  fontFamily: "inherit", transition: "all 0.15s",
  border: "none", outline: "none",
};

const sectionCard: React.CSSProperties = {
  padding: "20px", borderRadius: 12,
  border: "1px solid #E5E5E5", background: "#fff",
  display: "flex", flexDirection: "column", gap: 16,
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: "#C9A84C" }}> *</span>}</label>
      {children}
    </div>
  );
}

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function FocusTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...textareaStyle, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; props.onFocus?.(e); }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; props.onBlur?.(e); }}
    />
  );
}

function FocusSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        height: 44, padding: "0 14px", width: "100%",
        border: "1px solid #E5E5E5", borderRadius: 10, fontSize: 14,
        fontFamily: "inherit", appearance: "none" as const, cursor: "pointer", outline: "none",
        ...props.style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = "#C9A84C"; }}
      onBlur={e  => { e.currentTarget.style.borderColor = "#E5E5E5"; }}
    />
  );
}

// ── Step icons ────────────────────────────────────────────────────────────────

const IconHotel      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconResort     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 16c2.5-2 5-2 7.5 0s5 2 7.5 0M2 20h20"/><path d="M12 2v8"/><path d="M8 6s1-3 4-3 4 3 4 3"/></svg>
const IconBoutique   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
const IconHeritage   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
const IconVilla      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/><path d="M3 21h18"/><rect x="10" y="14" width="4" height="7"/></svg>
const IconHomestay   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="2"/><path d="M12 15v4"/></svg>
const IconServiceApt = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
const IconHostel     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 16h20"/><path d="M6 8v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>
const IconStarFill   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconPlus       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconInfo       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const IconCheck      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconTrash      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>

// Photo category icons
const IconBuilding2  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconBed        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 16h20"/><path d="M6 8v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>
const IconLobby      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
const IconPool       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 20h20"/><path d="M2 16c2.5-2 5-2 7.5 0s5 2 7.5 0"/><path d="M2 8c2.5-2 5-2 7.5 0s5 2 7.5 0"/></svg>
const IconSpa        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4.97 0-9-4.03-9-9 0-3.54 2.04-6.61 5-8.1V3a7 7 0 0 1 8 0v1.9c2.96 1.49 5 4.56 5 8.1 0 4.97-4.03 9-9 9z"/></svg>
const IconGym        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h1a4 4 0 0 0 0 8H2"/><path d="M6 8h12v8H6z"/><line x1="6" y1="12" x2="18" y2="12"/></svg>
const IconDining     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
const IconBar        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8M12 11v11M3 3h18l-5 8H8L3 3z"/></svg>
const IconGarden     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z"/><path d="M12 12c0 0-3 2-6 1"/><path d="M12 12c0 0 3 2 6 1"/><path d="M5 22h14"/></svg>
const IconLibrary    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconConference = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-8M12 3v4"/><path d="M8 12h8M8 16h5"/></svg>
const IconRooftop    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/><path d="M3 21h18"/></svg>
const IconViews      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
const IconKids       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 11a5.5 5.5 0 0 1 11 0L19 17H5l1.5-6z"/><path d="M9 21l1-4h4l1 4"/></svg>

// ── STEP 1 ────────────────────────────────────────────────────────────────────

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: "hotel",             label: "Hotel",          icon: <IconHotel />      },
  { value: "resort",            label: "Resort",         icon: <IconResort />     },
  { value: "boutique_hotel",    label: "Boutique Hotel", icon: <IconBoutique />   },
  { value: "heritage_hotel",    label: "Heritage Hotel", icon: <IconHeritage />   },
  { value: "villa",             label: "Villa",          icon: <IconVilla />      },
  { value: "homestay",          label: "Homestay",       icon: <IconHomestay />   },
  { value: "service_apartment", label: "Service Apt.",   icon: <IconServiceApt /> },
  { value: "hostel",            label: "Hostel",         icon: <IconHostel />     },
];

function Step1BasicInfo({ data, setField }: StepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Property Name */}
      <Field label="Property Name" required>
        <FocusInput
          value={data.name}
          onChange={e => setField("name", e.target.value)}
          placeholder="e.g. The Grand Uno Palace"
        />
      </Field>

      {/* Property Type */}
      <div>
        <label style={labelStyle}>Property Type <span style={{ color: "#C9A84C" }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="type-grid">
          {PROPERTY_TYPES.map(t => {
            const active = data.property_type === t.value;
            return (
              <button
                key={t.value} type="button"
                onClick={() => setField("property_type", t.value)}
                style={{
                  padding: "16px 10px", borderRadius: 10,
                  border: `2px solid ${active ? "#0C0C0C" : "#E5E5E5"}`,
                  background: active ? "#0C0C0C" : "#fff",
                  color: active ? "#fff" : "#6B7280",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Star Category */}
      <div>
        <label style={labelStyle}>Star Category</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map(s => {
            const active = data.star_category === s;
            return (
              <button
                key={s} type="button"
                onClick={() => setField("star_category", s)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  padding: "0 16px", height: 44, borderRadius: 10,
                  border: `2px solid ${active ? "#C9A84C" : "#E5E5E5"}`,
                  background: active ? "#FBF3DE" : "#fff",
                  color: active ? "#9B7D32" : "#9B9B9B",
                  cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                <IconStarFill />
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Rooms */}
      <Field label="Total Number of Rooms" required>
        <FocusInput
          type="number"
          value={String(data.total_rooms || "")}
          onChange={e => setField("total_rooms", Number(e.target.value))}
          placeholder="e.g. 45"
        />
        <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>Overall capacity across all room types</div>
      </Field>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description <span style={{ color: "#C9A84C" }}>*</span></label>
        <FocusTextarea
          value={data.description}
          onChange={e => setField("description", e.target.value)}
          rows={5}
          maxLength={2500}
          placeholder="Describe your property — location highlights, vibe, unique features, nearby attractions, what makes it special..."
        />
        <div style={{ textAlign: "right", fontSize: 11, marginTop: 4, color: data.description.length > 2200 ? "#b45309" : "#9B9B9B" }}>
          {data.description.length} / 2500 chars
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 560px) { .type-grid { grid-template-columns: repeat(2, 1fr) !important; } }` }} />
    </div>
  );
}

// ── STEP 2 ────────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
];

function Step2Location({ data, setField }: StepProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Street Address" required>
        <FocusInput value={data.address} onChange={e => setField("address", e.target.value)} placeholder="123, Marine Drive" />
      </Field>
      <Field label="Landmark / Area Name">
        <FocusInput value={data.landmark} onChange={e => setField("landmark", e.target.value)} placeholder="e.g. Near City Palace, Beachfront, Old Quarter" />
        <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>Helps guests find and recognize your location</div>
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="City" required>
          <FocusInput value={data.city} onChange={e => setField("city", e.target.value)} placeholder="Mumbai" />
        </Field>
        <div>
          <label style={labelStyle}>State <span style={{ color: "#C9A84C" }}>*</span></label>
          <FocusSelect value={data.state} onChange={e => setField("state", e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </FocusSelect>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Pincode">
          <FocusInput value={data.pincode} onChange={e => setField("pincode", e.target.value)} placeholder="400001" maxLength={6} />
        </Field>
        <div />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Latitude">
          <FocusInput type="number" value={String(data.latitude || "")} onChange={e => setField("latitude", Number(e.target.value))} placeholder="18.9388" />
          <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>From Google Maps</div>
        </Field>
        <Field label="Longitude">
          <FocusInput type="number" value={String(data.longitude || "")} onChange={e => setField("longitude", Number(e.target.value))} placeholder="72.8354" />
          <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>From Google Maps</div>
        </Field>
      </div>

      <div style={{ padding: "12px 16px", background: "#F9F7F2", borderRadius: 8, fontSize: 12, color: "#6B7280", lineHeight: 1.7 }}>
        💡 To get coordinates: open <strong>Google Maps</strong> → right-click your property location → copy the latitude and longitude shown.
      </div>
    </div>
  );
}

// ── STEP 3 ────────────────────────────────────────────────────────────────────

const MAX_TAGS = 2;

const ALL_AMENITIES = [
  "WiFi","Pool","Spa","Gym","Restaurant","Bar","Parking","Valet Parking",
  "Room Service","Concierge","Laundry","Business Center","Conference Room",
  "Airport Transfer","Kids Club","Pet Friendly","Beach Access","Garden",
  "Terrace","Rooftop","EV Charging","Wheelchair Accessible",
  "24hr Front Desk","Doctor on Call","Kids Pool","Steam Room",
  "Yoga Studio","Library","Currency Exchange","Helipad",
];

const ALL_TAGS = [
  "Luxury","Beachfront","Heritage","Boutique","Family Friendly",
  "Pet Friendly","Romantic","Business","Budget","Eco-friendly",
  "Wellness","Adventure","Adults Only","Wedding Venue","Backpacker",
];

function Step3Amenities({ data, setField }: StepProps) {
  const [tagWarning, setTagWarning] = useState(false);

  function toggleAmenity(a: string) {
    const cur = data.amenities;
    setField("amenities", cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  }

  function toggleTag(t: string) {
    const cur = data.tags;
    if (cur.includes(t)) { setTagWarning(false); setField("tags", cur.filter(x => x !== t)); return; }
    if (cur.length >= MAX_TAGS) { setTagWarning(true); setTimeout(() => setTagWarning(false), 2500); return; }
    setTagWarning(false);
    setField("tags", [...cur, t]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Amenities */}
      <div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C" }}>Amenities</div>
          <div style={{ fontSize: 12, color: "#9B9B9B", marginTop: 3 }}>Select all facilities your property offers — {data.amenities.length} selected</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_AMENITIES.map(a => {
            const on = data.amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                ...pillBase,
                border: `1.5px solid ${on ? "#0C0C0C" : "#E5E5E5"}`,
                background: on ? "#0C0C0C" : "#fff",
                color: on ? "#fff" : "#6B7280",
                fontWeight: on ? 500 : 400,
              }}>
                {on && "✓ "}{a}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E5E5E5" }} />

      {/* Tags */}
      <div>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C" }}>Property Tags</div>
            <div style={{ fontSize: 12, color: "#9B9B9B", marginTop: 3 }}>Tags help guests discover your property — select up to {MAX_TAGS}</div>
          </div>
          <div style={{
            flexShrink: 0, padding: "3px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
            background: data.tags.length === MAX_TAGS ? "#FBF3DE" : "#F9F7F2",
            color: data.tags.length === MAX_TAGS ? "#9B7D32" : "#9B9B9B",
            border: `1px solid ${data.tags.length === MAX_TAGS ? "#C9A84C" : "#E5E5E5"}`,
          }}>
            {data.tags.length} / {MAX_TAGS} selected
          </div>
        </div>

        {tagWarning && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 8, marginBottom: 12, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 12, color: "#dc2626" }}>
            <IconInfo /> Maximum {MAX_TAGS} tags allowed. Remove a selected tag to add another.
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_TAGS.map(t => {
            const on      = data.tags.includes(t);
            const blocked = !on && data.tags.length >= MAX_TAGS;
            return (
              <button key={t} type="button" onClick={() => toggleTag(t)} style={{
                ...pillBase,
                border: `1.5px solid ${on ? "#C9A84C" : "#E5E5E5"}`,
                background: on ? "#FBF3DE" : "#fff",
                color: on ? "#9B7D32" : blocked ? "#9B9B9B" : "#6B7280",
                fontWeight: on ? 600 : 400,
                cursor: blocked ? "not-allowed" : "pointer",
                opacity: blocked ? 0.5 : 1,
              }}>
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── STEP 4 ────────────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = ["Cash","Credit Card","Debit Card","UPI","Net Banking","Cheque"];

const POLICY_FIELDS = [
  { key: "cancellation",    label: "Cancellation Policy",   placeholder: "e.g. Free cancellation up to 24 hours before check-in." },
  { key: "children",        label: "Children Policy",       placeholder: "e.g. Children of all ages are welcome." },
  { key: "pets",            label: "Pet Policy",            placeholder: "e.g. Pets are not allowed." },
  { key: "smoking",         label: "Smoking Policy",        placeholder: "e.g. Non-smoking property." },
  { key: "extra_bed",       label: "Extra Bed Policy",      placeholder: "e.g. Extra beds available on request at ₹1,500/night." },
  { key: "early_check_in",  label: "Early Check-in Policy", placeholder: "e.g. Early check-in available from 10:00 AM at ₹500 extra." },
  { key: "late_check_out",  label: "Late Check-out Policy", placeholder: "e.g. Late check-out until 2:00 PM on request." },
  { key: "age_restriction", label: "Age Restriction",       placeholder: "e.g. Guests must be 18+ to check-in." },
  { key: "alcohol",         label: "Alcohol Policy",        placeholder: "e.g. Alcohol is served at the bar." },
] as const;

function Step4Policies({ data, setField }: StepProps) {
  function togglePayment(method: string) {
    const cur = data.payment_methods;
    setField("payment_methods", cur.includes(method) ? cur.filter(x => x !== method) : [...cur, method]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Check-in / out */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Check-in Time</label>
          <input type="time" value={data.check_in_time} onChange={e => setField("check_in_time", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={e => e.currentTarget.style.borderColor = "#C9A84C"}
            onBlur={e  => e.currentTarget.style.borderColor = "#E5E5E5"}
          />
        </div>
        <div>
          <label style={labelStyle}>Check-out Time</label>
          <input type="time" value={data.check_out_time} onChange={e => setField("check_out_time", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={e => e.currentTarget.style.borderColor = "#C9A84C"}
            onBlur={e  => e.currentTarget.style.borderColor = "#E5E5E5"}
          />
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label style={{ ...labelStyle, marginBottom: 10 }}>
          Accepted Payment Methods ({data.payment_methods.length} selected)
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PAYMENT_OPTIONS.map(method => {
            const on = data.payment_methods.includes(method);
            return (
              <button key={method} type="button" onClick={() => togglePayment(method)} style={{
                ...pillBase,
                border: `1.5px solid ${on ? "#C9A84C" : "#E5E5E5"}`,
                background: on ? "#FBF3DE" : "#fff",
                color: on ? "#9B7D32" : "#6B7280",
                fontWeight: on ? 600 : 400,
              }}>
                {on && "✓ "}{method}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E5E5E5" }} />

      {/* Policy text fields */}
      {POLICY_FIELDS.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label style={labelStyle}>{label}</label>
          <FocusTextarea
            value={(data as any)[key]}
            onChange={e => setField(key as any, e.target.value)}
            rows={2}
            placeholder={placeholder}
            style={{ ...textareaStyle, fontSize: 13 }}
          />
        </div>
      ))}
    </div>
  );
}

// ── STEP 5 ────────────────────────────────────────────────────────────────────

function AttractionInputInline({ attractions, onChange }: { attractions: NearbyAttraction[]; onChange: (list: NearbyAttraction[]) => void }) {
  const [name, setName] = useState("");
  const [dist, setDist] = useState("");

  function add() {
    if (!name.trim() || !dist.trim()) return;
    onChange([...attractions, { name: name.trim(), distance_km: dist.trim() }]);
    setName(""); setDist("");
  }

  function remove(i: number) { onChange(attractions.filter((_, idx) => idx !== i)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {attractions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {attractions.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7D32", background: "#FBF3DE", border: "1px solid #C9A84C", padding: "2px 8px", borderRadius: 9999 }}>{a.distance_km} km</span>
                <span style={{ fontSize: 13, color: "#0C0C0C", fontWeight: 500 }}>{a.name}</span>
              </div>
              <button type="button" onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B9B9B", fontSize: 16, lineHeight: 1, padding: "2px 6px", borderRadius: 4 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: 10, alignItems: "flex-end" }}>
        <FocusInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. City Palace, Lake Pichola" />
        <FocusInput type="number" value={dist} onChange={e => setDist(e.target.value)} placeholder="2.5" />
        <button type="button" onClick={add} disabled={!name.trim() || !dist.trim()}
          style={{ height: 44, padding: "0 16px", borderRadius: 10, border: "1.5px solid #E5E5E5", background: "#fff", cursor: (!name.trim() || !dist.trim()) ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "inherit", color: "#6B7280", opacity: (!name.trim() || !dist.trim()) ? 0.5 : 1, whiteSpace: "nowrap" as const }}>
          + Add
        </button>
      </div>
    </div>
  );
}

function Step5Contact({ data, setField }: StepProps) {
  const c = data.contact;
  function setC(k: string, v: string) { setField("contact", { ...c, [k]: v }); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", marginBottom: 4 }}>Contact Details</div>
        <div style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 16 }}>Shown to guests on your property page for reservations and enquiries</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Property Phone *">
              <FocusInput type="tel" value={c.phone} onChange={e => setC("phone", e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="WhatsApp Number">
              <FocusInput type="tel" value={c.whatsapp} onChange={e => setC("whatsapp", e.target.value)} placeholder="+91 98765 43210" />
              <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>Leave blank if same as phone</div>
            </Field>
          </div>
          <Field label="Reservation Email *">
            <FocusInput type="email" value={c.email} onChange={e => setC("email", e.target.value)} placeholder="reservations@yourproperty.com" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Property Website">
              <FocusInput value={c.website} onChange={e => setC("website", e.target.value)} placeholder="https://www.yourproperty.com" />
            </Field>
            <Field label="GST Number">
              <FocusInput value={c.gst} onChange={e => setC("gst", e.target.value)} placeholder="e.g. 27AAPFU0939F1ZV" />
              <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>Required for tax invoices</div>
            </Field>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #E5E5E5" }} />

      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", marginBottom: 4 }}>Nearby Attractions</div>
        <div style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 16 }}>Shown on your property page under Experiences — helps guests plan their visit</div>
        <AttractionInputInline attractions={data.nearby_attractions} onChange={list => setField("nearby_attractions", list)} />
      </div>
    </div>
  );
}

// ── STEP 6 ────────────────────────────────────────────────────────────────────

const BED_TYPES_LIST: { value: BedType; label: string }[] = [
  { value: "single", label: "Single Bed" }, { value: "double", label: "Double Bed" },
  { value: "twin",   label: "Twin Beds"  }, { value: "queen",  label: "Queen Bed"  },
  { value: "king",   label: "King Bed"   }, { value: "bunk",   label: "Bunk Beds"  },
];

const BED_LABELS: Record<string, string> = { single: "Single", double: "Double", twin: "Twin", queen: "Queen", king: "King", bunk: "Bunk" };
const ROOM_AMENITIES = ["AC","WiFi","TV","Mini Bar","Safe","Balcony","Sea View","Lake View","Garden View","Jacuzzi","Bathtub","Coffee Maker","Microwave","Kitchenette"];
const MEAL_ICONS: Record<PartnerMealKey, string> = { breakfast: "☕", lunch: "🍱", dinner: "🍽️" };

const rLabelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6, display: "block" };

function formatRoomPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

interface RoomFormInlineProps { initial?: Partial<RoomTypePayload>; onSave: (r: RoomTypePayload) => void; onCancel: () => void; }

function RoomFormInline({ initial, onSave, onCancel }: RoomFormInlineProps) {
  const [form, setForm] = useState<RoomTypePayload>({
    name: initial?.name ?? "", description: initial?.description ?? "",
    bed_type: initial?.bed_type ?? "king", max_occupancy: initial?.max_occupancy ?? 2,
    size_sqft: initial?.size_sqft ?? 300, count: initial?.count ?? 1,
    amenities: initial?.amenities ?? [], images: initial?.images ?? [],
    base_price: initial?.base_price ?? 0, weekend_price: initial?.weekend_price,
    is_active: initial?.is_active ?? true, meal_plans: initial?.meal_plans ?? {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof RoomTypePayload>(key: K, val: RoomTypePayload[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  }

  function toggleAmenity(a: string) { set("amenities", form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]); }
  function isMealEnabled(meal: PartnerMealKey): boolean { return meal in (form.meal_plans ?? {}); }
  function toggleMeal(meal: PartnerMealKey) {
    const u: MealPlans = { ...(form.meal_plans ?? {}) };
    if (meal in u) delete u[meal]; else u[meal] = MEAL_DEFAULT_PRICES[meal];
    set("meal_plans", u);
  }
  function setMealPrice(meal: PartnerMealKey, price: number) { set("meal_plans", { ...(form.meal_plans ?? {}), [meal]: price }); }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim())      e.name          = "Room name is required";
    if (form.base_price <= 0)   e.base_price    = "Base price must be greater than 0";
    if (form.max_occupancy < 1) e.max_occupancy = "At least 1 guest required";
    if (form.count < 1)         e.count         = "At least 1 room required";
    for (const meal of MEAL_PLAN_CODES) {
      if (meal in (form.meal_plans ?? {}) && (form.meal_plans?.[meal] ?? 0) <= 0) {
        e.meal_plans = `${PARTNER_MEAL_PLAN_LABELS[meal]} price must be greater than 0`; break;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Basic info */}
      <div style={sectionCard}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: -4 }}>Room Details</div>
        <div>
          <label style={rLabelStyle}>Room Name *</label>
          <FocusInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Deluxe King Room" />
          {errors.name && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.name}</p>}
        </div>
        <div>
          <label style={rLabelStyle}>Description</label>
          <FocusTextarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Briefly describe this room type…" rows={3} style={{ fontSize: 13 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={rLabelStyle}>Bed Type *</label>
            <FocusSelect value={form.bed_type} onChange={e => set("bed_type", e.target.value as BedType)}>
              {BED_TYPES_LIST.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </FocusSelect>
          </div>
          <div>
            <label style={rLabelStyle}>Max Occupancy *</label>
            <FocusInput type="number" min={1} max={10} value={form.max_occupancy} onChange={e => set("max_occupancy", Number(e.target.value))} />
            {errors.max_occupancy && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.max_occupancy}</p>}
          </div>
          <div>
            <label style={rLabelStyle}>Size (sq ft)</label>
            <FocusInput type="number" min={0} value={form.size_sqft} onChange={e => set("size_sqft", Number(e.target.value))} />
          </div>
          <div>
            <label style={rLabelStyle}>Number of Rooms *</label>
            <FocusInput type="number" min={1} value={form.count} onChange={e => set("count", Number(e.target.value))} />
            {errors.count && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.count}</p>}
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div style={sectionCard}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: -4 }}>Room Amenities</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ROOM_AMENITIES.map(a => {
            const checked = form.amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                padding: "6px 14px", borderRadius: 9999, fontSize: 12,
                border: `1.5px solid ${checked ? "#C9A84C" : "#E5E5E5"}`,
                background: checked ? "rgba(201,168,76,0.08)" : "#fff",
                color: checked ? "#7A5F18" : "#6B7280",
                fontWeight: checked ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div style={sectionCard}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: -4 }}>Pricing</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={rLabelStyle}>Base Price / Night (₹) *</label>
            <FocusInput type="number" min={0} value={form.base_price} onChange={e => set("base_price", Number(e.target.value))} />
            {errors.base_price && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.base_price}</p>}
          </div>
          <div>
            <label style={rLabelStyle}>Weekend Price / Night (₹)</label>
            <FocusInput type="number" min={0} value={form.weekend_price ?? ""} placeholder="Optional" onChange={e => set("weekend_price", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>
      </div>

      {/* Meal Options */}
      <div style={sectionCard}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C", marginBottom: 4 }}>Meal Options</div>
          <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>Optional — enable each meal you want to offer and set a price per person per night.</p>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 12, background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", color: "#6B7280", lineHeight: 1.6 }}>
          🍽️ Prices are per person per night and added on top of the room rate.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MEAL_PLAN_CODES.map(meal => {
            const enabled = isMealEnabled(meal);
            const price   = form.meal_plans?.[meal] ?? 0;
            return (
              <div key={meal} style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${enabled ? "#C9A84C" : "#E5E5E5"}`, background: enabled ? "rgba(201,168,76,0.04)" : "#fafaf9", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
                    <input type="checkbox" checked={enabled} onChange={() => toggleMeal(meal)} style={{ width: 16, height: 16, accentColor: "#C9A84C", cursor: "pointer" }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>{MEAL_ICONS[meal]} {PARTNER_MEAL_PLAN_LABELS[meal]}</div>
                      <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 1 }}>{PARTNER_MEAL_DESCRIPTIONS[meal]}</div>
                    </div>
                  </label>
                  {enabled && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>₹</span>
                      <input type="number" min={1} value={price} onChange={e => setMealPrice(meal, Number(e.target.value))}
                        style={{ width: 100, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #C9A84C", fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "right" as const }}
                      />
                      <span style={{ fontSize: 11, color: "#9B9B9B", whiteSpace: "nowrap" as const }}>/person/night</span>
                    </div>
                  )}
                </div>
                {enabled && price > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#7A5F18", paddingLeft: 26 }}>
                    Example: 2 guests × 2 nights = {formatRoomPrice(price * 2 * 2)} extra
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.meal_plans && <p style={{ fontSize: 11, color: "#dc2626", marginTop: -4 }}>{errors.meal_plans}</p>}
      </div>

      {/* Status */}
      <div style={{ ...sectionCard, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0C0C0C" }}>Room Status</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Inactive rooms are hidden from guests</div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#C9A84C", cursor: "pointer" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: form.is_active ? "#16a34a" : "#9B9B9B" }}>{form.is_active ? "Active" : "Inactive"}</span>
        </label>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E5E5E5", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#6B7280" }}>Cancel</button>
        <button type="button" onClick={() => { if (validate()) onSave(form); }} style={{ padding: "9px 22px", borderRadius: 9999, background: "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 2px 10px rgba(201,168,76,0.3)" }}>
          Save Room
        </button>
      </div>
    </div>
  );
}

function Step6Rooms({ data, setField }: StepProps) {
  const [showForm,  setShowForm]  = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function saveRoom(room: RoomTypePayload) {
    if (editIndex !== null) {
      const u = [...data.room_types]; u[editIndex] = room;
      setField("room_types", u); setEditIndex(null);
    } else { setField("room_types", [...data.room_types, room]); }
    setShowForm(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, background: "#fffbf0", border: "1px solid #C9A84C", color: "#92400e", lineHeight: 1.6 }}>
        💡 Rooms are the first thing guests see on your property page. Add at least <strong>1 room type</strong> to complete your listing.
      </div>

      {data.room_types.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.room_types.map((room, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>{room.name}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9B9B9B" }}>
                  <span>{BED_LABELS[room.bed_type]} bed</span><span>·</span>
                  <span>Max {room.max_occupancy} guests</span>
                  {room.size_sqft > 0 && <><span>·</span><span>{room.size_sqft} sq ft</span></>}
                  <span>·</span><span>{room.count} room{room.count > 1 ? "s" : ""}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0C0C0C" }}>₹{room.base_price.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "#9B9B9B" }}>per night</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => { setEditIndex(i); setShowForm(true); }}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, border: "1px solid #E5E5E5", background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#6B7280" }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => setField("room_types", data.room_types.filter((_, idx) => idx !== i))}
                    style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", fontFamily: "inherit", color: "#dc2626" }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <RoomFormInline
          initial={editIndex !== null ? data.room_types[editIndex] : undefined}
          onSave={saveRoom}
          onCancel={() => { setShowForm(false); setEditIndex(null); }}
        />
      ) : (
        <button type="button" onClick={() => setShowForm(true)}
          style={{ alignSelf: "flex-start", padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E5E5E5", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#6B7280", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0C0C0C"; e.currentTarget.style.color = "#0C0C0C"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.color = "#6B7280"; }}
        >
          + Add Room Type
        </button>
      )}

      {data.room_types.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "32px 24px", color: "#9B9B9B", fontSize: 13, border: "2px dashed #E5E5E5", borderRadius: 12 }}>
          No room types added yet. Click "Add Room Type" to start.
        </div>
      )}
    </div>
  );
}

// ── STEP 7 ────────────────────────────────────────────────────────────────────

const CUISINE_TYPES = [
  "Multi-cuisine","Indian","North Indian","South Indian","Continental",
  "Chinese","Italian","Japanese","Mediterranean","Bar & Cocktails",
  "Café & Light Bites","Seafood","BBQ & Grill","Vegetarian","Vegan",
];

const EMPTY_VENUE: DiningVenue = { name: "", cuisine: "Multi-cuisine", timing: "", description: "", open_to_public: false };

interface DiningFormInlineProps { initial?: DiningVenue; onSave: (v: DiningVenue) => void; onCancel: () => void; }

function DiningFormInline({ initial, onSave, onCancel }: DiningFormInlineProps) {
  const [venue, setVenue] = useState<DiningVenue>(initial ?? EMPTY_VENUE);
  function set<K extends keyof DiningVenue>(key: K, val: DiningVenue[K]) { setVenue(v => ({ ...v, [key]: val })); }
  const canSave = !!venue.name.trim() && !!venue.timing.trim();

  return (
    <div style={{ border: "1.5px solid #C9A84C", borderRadius: 12, padding: "20px 22px", background: "#fffdf7", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Venue Name *">
          <FocusInput value={venue.name} onChange={e => set("name", e.target.value)} placeholder="e.g. The Signature Restaurant" />
        </Field>
        <div>
          <label style={labelStyle}>Cuisine Type *</label>
          <FocusSelect value={venue.cuisine} onChange={e => set("cuisine", e.target.value)}>
            {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </FocusSelect>
        </div>
      </div>
      <Field label="Operating Hours *">
        <FocusInput value={venue.timing} onChange={e => set("timing", e.target.value)} placeholder="e.g. 7:00 AM – 11:00 PM" />
      </Field>
      <div>
        <label style={labelStyle}>Description</label>
        <FocusTextarea value={venue.description} onChange={e => set("description", e.target.value)} rows={2} placeholder="Describe the dining experience, specialities, ambience..." style={{ fontSize: 13 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" id="open_public" checked={venue.open_to_public} onChange={e => set("open_to_public", e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#C9A84C" }} />
        <label htmlFor="open_public" style={{ fontSize: 13, color: "#3d3b37", cursor: "pointer" }}>This venue is open to outside guests (non-residents)</label>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid #E5E5E5" }}>
        <button type="button" onClick={onCancel} style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E5E5E5", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#6B7280" }}>Cancel</button>
        <button type="button" onClick={() => { if (canSave) onSave(venue); }} disabled={!canSave}
          style={{ padding: "9px 22px", borderRadius: 9999, background: canSave ? "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)" : "#E5E5E5", color: canSave ? "#fff" : "#9B9B9B", border: "none", cursor: canSave ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
          Save Venue
        </button>
      </div>
    </div>
  );
}

function Step7Dining({ data, setField }: StepProps) {
  const [showForm,  setShowForm]  = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function saveVenue(venue: DiningVenue) {
    if (editIndex !== null) {
      const u = [...data.dining_venues]; u[editIndex] = venue;
      setField("dining_venues", u); setEditIndex(null);
    } else { setField("dining_venues", [...data.dining_venues, venue]); }
    setShowForm(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, background: "#F9F7F2", border: "1px solid #E5E5E5", color: "#6B7280", lineHeight: 1.6 }}>
        🍽️ This step is <strong>optional</strong> — skip if your property has no dining facilities.
      </div>

      {data.dining_venues.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.dining_venues.map((venue, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>{venue.name}</div>
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#9B9B9B" }}>
                  <span style={{ color: "#9B7D32", fontWeight: 500 }}>{venue.cuisine}</span>
                  <span>·</span><span>{venue.timing}</span>
                  {venue.open_to_public && <><span>·</span><span style={{ color: "#15803d", fontWeight: 500 }}>Open to public</span></>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => { setEditIndex(i); setShowForm(true); }}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, border: "1px solid #E5E5E5", background: "#fff", cursor: "pointer", fontFamily: "inherit", color: "#6B7280" }}>Edit</button>
                <button type="button" onClick={() => setField("dining_venues", data.dining_venues.filter((_, idx) => idx !== i))}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", fontFamily: "inherit", color: "#dc2626" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <DiningFormInline initial={editIndex !== null ? data.dining_venues[editIndex] : undefined} onSave={saveVenue} onCancel={() => { setShowForm(false); setEditIndex(null); }} />
      ) : (
        <button type="button" onClick={() => setShowForm(true)}
          style={{ alignSelf: "flex-start", padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E5E5E5", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#6B7280", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0C0C0C"; e.currentTarget.style.color = "#0C0C0C"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.color = "#6B7280"; }}
        >+ Add Dining Venue</button>
      )}

      {data.dining_venues.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: "32px 24px", color: "#9B9B9B", fontSize: 13, border: "2px dashed #E5E5E5", borderRadius: 12 }}>
          No dining venues added. Skip this step if not applicable.
        </div>
      )}
    </div>
  );
}

// ── STEP 8 ────────────────────────────────────────────────────────────────────

const MIN_PHOTOS_PER_CATEGORY = 3;
const MAX_PHOTOS_PER_CATEGORY = 10;
const MIN_ROOM_PHOTOS         = 1;
const MAX_ROOM_PHOTOS         = 8;

interface CategoryDef { key: string; label: string; required: boolean; icon: React.ReactNode; }

const REQUIRED_CATEGORIES: CategoryDef[] = [
  { key: "exterior", label: "Exterior",       required: true, icon: <IconBuilding2 /> },
  { key: "rooms",    label: "Rooms",          required: true, icon: <IconBed />      },
  { key: "lobby",    label: "Lobby & Common", required: true, icon: <IconLobby />    },
];

const OPTIONAL_CATEGORIES: CategoryDef[] = [
  { key: "pool",       label: "Pool",            required: false, icon: <IconPool />       },
  { key: "spa",        label: "Spa & Wellness",  required: false, icon: <IconSpa />        },
  { key: "gym",        label: "Gym & Fitness",   required: false, icon: <IconGym />        },
  { key: "dining",     label: "Dining",          required: false, icon: <IconDining />     },
  { key: "bar",        label: "Bar & Lounge",    required: false, icon: <IconBar />        },
  { key: "garden",     label: "Garden",          required: false, icon: <IconGarden />     },
  { key: "library",    label: "Library",         required: false, icon: <IconLibrary />    },
  { key: "conference", label: "Conference Room", required: false, icon: <IconConference /> },
  { key: "rooftop",    label: "Rooftop",         required: false, icon: <IconRooftop />    },
  { key: "views",      label: "Views",           required: false, icon: <IconViews />      },
  { key: "kids",       label: "Kids Area",       required: false, icon: <IconKids />       },
];

// Photo uploader — parallel uploads, correct category key, live progress
function PhotoUploader({
  label, categoryKey, images, onUpdate, onPendingChange, token,
  maxPhotos = MAX_PHOTOS_PER_CATEGORY,
}: {
  label:       string;
  categoryKey: string;
  images:      string[];
  onUpdate:    (imgs: string[]) => void;
  onPendingChange?: (n: number) => void;
  token:       string | null;
  maxPhotos?:  number;
}) {
  const [pending,  setPending]  = useState(0);
  const [done,     setDone]     = useState(0);
  const [failed,   setFailed]   = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);

  const isUploading = pending > 0;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !token) return;
    const remaining = maxPhotos - images.length - previews.length;
    if (remaining <= 0) return;

    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) return;

    const blobs = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...blobs]);
    setPending(n => n + files.length);
    setDone(0);
    setFailed(0);
    onPendingChange?.(files.length);

    const results = await Promise.allSettled(
      files.map(async (file, idx) => {
        const form = new FormData();
        form.append("file", file);
        form.append("category", categoryKey);

        const res = await fetch("/api/partner/v1/partner/photos/upload", {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
          body:    form,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail ?? err?.message ?? `HTTP ${res.status}`);
        }

        const json = await res.json();
        const url  = json?.data?.url ?? json?.url;
        if (!url) throw new Error("No URL in response");

        setDone(n => n + 1);
        setPending(n => n - 1);
        onPendingChange?.(Math.max(0, files.length - idx - 1));
        URL.revokeObjectURL(blobs[idx]);

        return url as string;
      })
    );

    const uploaded: string[] = [];
    let failCount = 0;
    for (const r of results) {
      if (r.status === "fulfilled") uploaded.push(r.value);
      else failCount++;
    }

    setPreviews([]);
    setPending(0);
    setDone(0);
    setFailed(failCount);
    onPendingChange?.(0);

    if (uploaded.length > 0) {
      onUpdate([...images, ...uploaded]);
    }

    if (failCount > 0) {
      setTimeout(() => setFailed(0), 4000);
    }
  }

  const allThumbs = [
    ...images.map(url => ({ url, isPending: false })),
    ...previews.map(url => ({ url, isPending: true })),
  ];
  const totalShown = images.length + previews.length;

  return (
    <div>
      {/* Thumbnail grid — confirmed + in-progress previews */}
      {allThumbs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {allThumbs.map(({ url, isPending }, i) => (
            <div key={i} style={{
              position: "relative", width: 80, height: 64, borderRadius: 8,
              overflow: "hidden", border: `1.5px solid ${isPending ? "#C9A84C" : "#E5E5E5"}`,
              opacity: isPending ? 0.65 : 1, transition: "opacity 0.3s",
            }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Uploading spinner overlay */}
              {isPending && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "wizSpin 0.7s linear infinite", display: "block" }} />
                </div>
              )}
              {/* Remove button only for confirmed photos */}
              {!isPending && (
                <button type="button" onClick={() => onUpdate(images.filter((_, idx) => idx !== i))}
                  style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress bar during upload */}
      {isUploading && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9B7D32", marginBottom: 4 }}>
            <span>Uploading {done + 1} of {done + pending}…</span>
            <span>{Math.round((done / (done + pending)) * 100)}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 9999, background: "#F4F1EB", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 9999, background: "linear-gradient(90deg, #C9A84C, #b8943e)", transition: "width 0.3s", width: `${Math.round((done / (done + pending)) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Error notice */}
      {failed > 0 && (
        <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 12, color: "#dc2626" }}>
          {failed} photo{failed > 1 ? "s" : ""} failed to upload — please try again.
        </div>
      )}

      {/* Upload button */}
      {totalShown < maxPhotos && (
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 10,
          border: `1.5px dashed ${isUploading ? "#E5E5E5" : "#C9A84C"}`,
          background: isUploading ? "#F9F7F2" : "#fffbf0",
          cursor: isUploading ? "not-allowed" : "pointer",
          fontSize: 13, color: isUploading ? "#9B9B9B" : "#9B7D32",
          fontWeight: 500, transition: "all 0.15s",
          pointerEvents: isUploading ? "none" : "auto",
        }}
          onMouseEnter={e => { if (!isUploading) e.currentTarget.style.background = "#FBF3DE"; }}
          onMouseLeave={e => { if (!isUploading) e.currentTarget.style.background = "#fffbf0"; }}
        >
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }}
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            disabled={isUploading}
          />
          {isUploading
            ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(155,125,50,0.3)", borderTopColor: "#9B7D32", animation: "wizSpin 0.8s linear infinite", display: "inline-block" }} />Uploading…</>
            : <><IconPlus /> Upload Photos</>
          }
        </label>
      )}

      <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 6 }}>
        {images.length} / {maxPhotos} photos
        {isUploading && <span style={{ color: "#C9A84C", marginLeft: 6 }}>• {pending} uploading</span>}
      </div>
    </div>
  );
}

const AGREEMENTS = [
  {
    key: "terms_accepted" as const, emoji: "📋", title: "Terms & Conditions",
    label: "I have read and agree to the Uno Hotels Partner Terms & Conditions",
    content: `By listing your property on Uno Hotels & Resorts, you agree to the following:\n\n1. LISTING ACCURACY\n   All information provided must be accurate and kept up to date. Misleading listings may result in immediate suspension.\n\n2. PRICING INTEGRITY\n   Room prices are final and inclusive of all mandatory charges. Collecting additional charges from guests not disclosed on the platform is strictly prohibited.\n\n3. AVAILABILITY MANAGEMENT\n   You are responsible for keeping your availability calendar accurate. Failure to honour a confirmed booking may result in penalties and account suspension.\n\n4. PLATFORM COMMISSION\n   Uno Hotels retains a platform service commission (currently 15%) on every confirmed booking, automatically deducted from your payout.\n\n5. NO SOLICITATION\n   You agree not to solicit direct bookings from guests who were introduced through the Uno Hotels platform.\n\n6. CONTENT LICENSE\n   By uploading content, you grant Uno Hotels a non-exclusive, royalty-free, worldwide license to display and promote this content across all marketing channels.\n\n7. ACCOUNT INTEGRITY\n   You are responsible for all activity under your account. Report any suspected unauthorised access immediately.`,
  },
  {
    key: "cancellation_accepted" as const, emoji: "🔄", title: "Cancellation Policy",
    label: "I understand and accept the Uno Hotels Cancellation & Refund Policy",
    content: `GUEST CANCELLATIONS\n\n• Free cancellation: Guests may cancel at no charge up to 48 hours before check-in.\n• Late cancellation (within 48 hrs): Guest forfeits the first night's room charge.\n• No-show: You may mark the booking as "No Show" — first night charge is retained and credited in the next payout cycle.\n\nPARTNER-INITIATED CANCELLATIONS\n\nPartners must not cancel confirmed bookings except in genuine force majeure situations.\n\nREFUND PROCESSING\n\n• Guest refunds are processed by Uno Hotels within 5–7 business days.`,
  },
  {
    key: "payment_accepted" as const, emoji: "💳", title: "Payment & Payout Terms",
    label: "I understand and accept the Uno Hotels Payment & Payout Terms",
    content: `GUEST PAYMENT COLLECTION\n\n• All guest payments are collected exclusively by Uno Hotels through Razorpay.\n• You must NOT collect any payment directly from guests for platform bookings.\n\nPAYOUT CALCULATION\n\n  Room Charges                              = Base price × nights × rooms\n  (–) Platform Commission (15%)             = Room Charges × 0.15\n  (–) TDS — Tax Deducted at Source (0.1%)   = Room Charges × 0.001\n  ──────────────────────────────────────────────────────────\n  Partner Payout                            = Room Charges – Commission – TDS\n\nPAYOUT SCHEDULE\n\n• Payouts processed every 7 calendar days for completed check-outs.`,
  },
  {
    key: "legal_accepted" as const, emoji: "⚖️", title: "Legal Declarations",
    label: "I confirm the legal declarations and compliance requirements",
    content: `By submitting this property listing, I declare and confirm:\n\n1. OWNERSHIP & AUTHORITY\n   I am the owner or duly authorised representative with full legal authority to list this property.\n\n2. STATUTORY LICENSING\n   This property holds all applicable licences required by law.\n\n3. GST REGISTRATION\n   My GSTIN, if applicable, is valid and current.\n\n4. TDS ACKNOWLEDGEMENT — SECTION 194-O\n   I acknowledge TDS at 0.1% will be deducted from every payout.\n\n5. ACCURACY OF INFORMATION\n   All information provided is true and accurate.\n\n6. DISPUTE RESOLUTION\n   Disputes are subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra, India.`,
  },
];

type AgreementKey = "terms_accepted" | "cancellation_accepted" | "payment_accepted" | "legal_accepted";

function AgreementAccordion({ agreement, checked, onChange }: { agreement: typeof AGREEMENTS[0]; checked: boolean; onChange: (v: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { emoji, title, label, content } = agreement;
  const borderColor = checked ? "#bbf7d0" : "#E5E5E5";
  const headerBg    = checked ? "#f0fdf4" : "#F9F7F2";

  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
      <button type="button" onClick={() => setIsOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: headerBg, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "background 0.2s" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C" }}>{title}</div>
          <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 2 }}>{isOpen ? "Click to collapse ▲" : "Click to read full policy ▼"}</div>
        </div>
        {checked && <span style={{ fontSize: 18, fontWeight: 800, color: "#15803d", flexShrink: 0 }}>✓</span>}
      </button>

      {isOpen && (
        <div style={{ borderTop: "1px solid #E5E5E5", background: "#FAFAF9" }}>
          <div style={{ margin: "14px 18px 0", maxHeight: 260, overflowY: "auto", padding: "14px 16px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: 8, fontSize: 12, color: "#6B7280", lineHeight: 1.85, whiteSpace: "pre-line" as const, fontFamily: "inherit" }}>
            {content}
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, margin: "14px 18px 16px", padding: "12px 16px", cursor: "pointer", background: checked ? "#f0fdf4" : "#fffbf0", border: `1px solid ${checked ? "#bbf7d0" : "#C9A84C"}`, borderRadius: 8 }}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, cursor: "pointer", accentColor: "#C9A84C", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: checked ? "#15803d" : "#92400e", lineHeight: 1.55 }}>{label}</span>
          </label>
        </div>
      )}

      {!isOpen && (
        <div style={{ padding: "10px 18px", borderTop: "1px solid #E5E5E5", background: "#fff" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={e => { onChange(e.target.checked); if (!checked) setIsOpen(true); }} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#C9A84C", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>
              {label}{!checked && <span style={{ color: "#92400e", marginLeft: 6, fontSize: 11 }}>— Expand above to read first.</span>}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

function Step8Photos({ data, setField, pendingUploads, onPendingChange, token }: StepProps & { pendingUploads: number; onPendingChange: (n: number) => void; token: string | null }) {
  const [pendingByCat, setPendingByCat] = useState<Record<string, number>>({});
  const [roomPending,  setRoomPending]  = useState<Record<number, number>>({});

  const totalCatPending  = Object.values(pendingByCat).reduce((s, n) => s + n, 0);
  const totalRoomPending = Object.values(roomPending).reduce((s, n) => s + n, 0);
  const totalPending     = totalCatPending + totalRoomPending;

  useEffect(() => { onPendingChange(totalPending); }, [totalPending]);

  const requiredDone    = REQUIRED_CATEGORIES.filter(rc => {
    const cat = data.photo_categories.find(c => c.category === rc.key);
    return (cat?.images.length ?? 0) >= MIN_PHOTOS_PER_CATEGORY;
  }).length;
  const allRequiredDone = requiredDone === REQUIRED_CATEGORIES.length;

  const hasRooms        = data.room_types.length > 0;
  const roomsWithPhotos = data.room_types.filter(rt => (rt.images?.length ?? 0) >= MIN_ROOM_PHOTOS).length;
  const allRoomsCovered = !hasRooms || roomsWithPhotos === data.room_types.length;

  const { terms_accepted, cancellation_accepted, payment_accepted, legal_accepted } = data.agreements;
  const allAgreements   = terms_accepted && cancellation_accepted && payment_accepted && legal_accepted;
  const agrCount        = [terms_accepted, cancellation_accepted, payment_accepted, legal_accepted].filter(Boolean).length;

  const readyToSubmit   = allRequiredDone && allRoomsCovered && totalPending === 0 && allAgreements;

  function setAgreement(key: AgreementKey, value: boolean) { setField("agreements", { ...data.agreements, [key]: value }); }

  const activeOptional = data.photo_categories.map(c => c.category).filter(k => OPTIONAL_CATEGORIES.some(o => o.key === k));

  function getOrCreate(key: string) {
    return data.photo_categories.find(c => c.category === key) ?? { category: key, label: key, images: [] };
  }

  function updateCategory(key: string, images: string[]) {
    const label = [...REQUIRED_CATEGORIES, ...OPTIONAL_CATEGORIES].find(c => c.key === key)?.label ?? key;
    if (data.photo_categories.find(c => c.category === key)) {
      setField("photo_categories", data.photo_categories.map(c => c.category === key ? { ...c, images } : c));
    } else {
      setField("photo_categories", [...data.photo_categories, { category: key, label, images }]);
    }
  }

  function toggleOptional(key: string) {
    if (activeOptional.includes(key)) {
      setField("photo_categories", data.photo_categories.filter(c => c.category !== key));
    } else {
      const label = OPTIONAL_CATEGORIES.find(c => c.key === key)?.label ?? key;
      setField("photo_categories", [...data.photo_categories, { category: key, label, images: [] }]);
    }
  }

  function updateRoomImages(roomIndex: number, images: string[]) {
    setField("room_types", data.room_types.map((rt, i) => i === roomIndex ? { ...rt, images } : rt));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Overall status bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, border: "1px solid #E5E5E5", borderRadius: 10, overflow: "hidden", background: "#E5E5E5" }}>
        {[
          { label: "Property Photos", value: `${requiredDone}/${REQUIRED_CATEGORIES.length} required`, done: allRequiredDone },
          { label: "Room Photos",     value: hasRooms ? `${roomsWithPhotos}/${data.room_types.length} rooms` : "No rooms", done: allRoomsCovered },
          { label: "Uploads",         value: totalPending > 0 ? `${totalPending} uploading…` : "All uploaded", done: totalPending === 0 },
          { label: "Agreements",      value: `${agrCount}/4 accepted`, done: allAgreements },
        ].map(({ label, value, done }) => (
          <div key={label} style={{ padding: "12px 14px", background: done ? "#f0fdf4" : "#F9F7F2" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: done ? "#15803d" : "#0C0C0C" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Section A — Property Photos */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Section A — Property Photos</div>

        <div style={{ padding: "14px 16px", borderRadius: 10, fontSize: 13, lineHeight: 1.6, marginBottom: 16, background: allRequiredDone ? "#f0fdf4" : "#fffbf0", border: `1px solid ${allRequiredDone ? "#bbf7d0" : "#C9A84C"}`, color: allRequiredDone ? "#15803d" : "#92400e" }}>
          {allRequiredDone ? "✓ All required categories complete. You can add optional categories below." : `Upload at least ${MIN_PHOTOS_PER_CATEGORY} photos in each required category. ${requiredDone} of ${REQUIRED_CATEGORIES.length} done.`}
        </div>

        {/* Optional picker */}
        <div style={{ border: "1.5px solid #E5E5E5", borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 18px", background: "#F9F7F2", borderBottom: "1px solid #E5E5E5" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", marginBottom: 2 }}>Optional Photo Categories</div>
            <div style={{ fontSize: 12, color: "#9B9B9B" }}>Select the categories that apply to your property.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#E5E5E5" }}>
            {OPTIONAL_CATEGORIES.map(opt => {
              const isActive = activeOptional.includes(opt.key);
              return (
                <button key={opt.key} type="button" onClick={() => toggleOptional(opt.key)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: isActive ? "#fffbf0" : "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "background 0.15s" }}>
                  <div style={{ width: 32, height: 32, flexShrink: 0, border: `1.5px solid ${isActive ? "#C9A84C" : "#E5E5E5"}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#C9A84C" : "#9B9B9B", background: isActive ? "#fffbf0" : "#fafaf9" }}>
                    {opt.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "#9B7D32" : "#6B7280", flex: 1 }}>{opt.label}</span>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? "#C9A84C" : "#F9F7F2", border: `1px solid ${isActive ? "#C9A84C" : "#E5E5E5"}`, color: isActive ? "#fff" : "#9B9B9B" }}>
                    {isActive ? <IconCheck /> : <IconPlus />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Required label */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Required Categories</div>

        {/* Required blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {REQUIRED_CATEGORIES.map(def => {
            const cat   = getOrCreate(def.key);
            const count = cat.images.length;
            const done  = count >= MIN_PHOTOS_PER_CATEGORY;
            return (
              <div key={def.key} style={{ border: `1.5px solid ${done ? "#bbf7d0" : "#E5E5E5"}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: done ? "#f0fdf4" : "#F9F7F2", borderBottom: "1px solid #E5E5E5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, flexShrink: 0, border: "1.5px solid #C9A84C", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C", background: "#fffbf0" }}>{def.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", display: "flex", alignItems: "center", gap: 6 }}>
                        {def.label}
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#9B7D32", background: "#FBF3DE", border: "1px solid #C9A84C", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Required</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 1 }}>Min {MIN_PHOTOS_PER_CATEGORY} · Max {MAX_PHOTOS_PER_CATEGORY} photos</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: done ? "#dcfce7" : count > 0 ? "#fffbeb" : "#f4f1eb", color: done ? "#15803d" : count > 0 ? "#92400e" : "#9B9B9B", border: `1px solid ${done ? "#bbf7d0" : count > 0 ? "#fde68a" : "#E5E5E5"}` }}>
                    {count} / {MAX_PHOTOS_PER_CATEGORY}{done ? " ✓" : ""}
                  </span>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <PhotoUploader label={def.label} categoryKey={def.key} images={cat.images} onUpdate={imgs => updateCategory(def.key, imgs)}
                    onPendingChange={n => setPendingByCat(p => ({ ...p, [def.key]: n }))} token={token} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active optional blocks */}
        {activeOptional.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 24, marginBottom: 12 }}>Optional Categories</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {OPTIONAL_CATEGORIES.filter(o => activeOptional.includes(o.key)).map(def => {
                const cat   = getOrCreate(def.key);
                const count = cat.images.length;
                return (
                  <div key={def.key} style={{ border: "1.5px solid #E5E5E5", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#F9F7F2", borderBottom: "1px solid #E5E5E5" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, flexShrink: 0, border: "1.5px solid #C9A84C", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C", background: "#fffbf0" }}>{def.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C" }}>{def.label}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: "#F9F7F2", color: "#9B9B9B", border: "1px solid #E5E5E5" }}>{count} / {MAX_PHOTOS_PER_CATEGORY}</span>
                        <button type="button" onClick={() => toggleOptional(def.key)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", color: "#dc2626" }}>
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      <PhotoUploader label={def.label} categoryKey={def.key} images={cat.images} onUpdate={imgs => updateCategory(def.key, imgs)}
                        onPendingChange={n => setPendingByCat(p => ({ ...p, [def.key]: n }))} token={token} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Section B — Room Photos */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Section B — Room Photos</div>
        {!hasRooms ? (
          <div style={{ padding: "28px", textAlign: "center", border: "2px dashed #E5E5E5", borderRadius: 12, color: "#9B9B9B", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🛏️</div>
            No room types added yet. Go back to Step 6 to add room types.
          </div>
        ) : (
          <>
            <div style={{ padding: "12px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14, background: "#fffbf0", border: "1px solid #C9A84C", color: "#92400e", lineHeight: 1.6 }}>
              Upload at least {MIN_ROOM_PHOTOS} photo per room type. These are the photos guests see on each room card.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.room_types.map((room, roomIdx) => {
                const images  = room.images ?? [];
                const isDone  = images.length >= MIN_ROOM_PHOTOS;
                return (
                  <div key={roomIdx} style={{ border: `1.5px solid ${isDone ? "#bbf7d0" : "#E5E5E5"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", background: isDone ? "#f0fdf4" : "#F9F7F2", borderBottom: "1px solid #E5E5E5" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🛏️</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0C0C0C", display: "flex", alignItems: "center", gap: 8 }}>
                            {room.name || `Room ${roomIdx + 1}`}
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#9B7D32", background: "#FBF3DE", border: "1px solid #C9A84C", padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Required</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 2 }}>
                            {room.bed_type} · Max {room.max_occupancy} guests · ₹{room.base_price.toLocaleString("en-IN")}/night · Min {MIN_ROOM_PHOTOS} · Max {MAX_ROOM_PHOTOS} photos
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: isDone ? "#dcfce7" : images.length > 0 ? "#fffbeb" : "#f4f1eb", color: isDone ? "#15803d" : images.length > 0 ? "#92400e" : "#9B9B9B", border: `1px solid ${isDone ? "#bbf7d0" : images.length > 0 ? "#fde68a" : "#E5E5E5"}` }}>
                        {images.length} / {MAX_ROOM_PHOTOS}{isDone ? " ✓" : ""}
                      </span>
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      <PhotoUploader label={`Room ${roomIdx + 1}`} categoryKey="rooms" images={images} maxPhotos={MAX_ROOM_PHOTOS}
                        onUpdate={imgs => updateRoomImages(roomIdx, imgs)}
                        onPendingChange={n => setRoomPending(p => ({ ...p, [roomIdx]: n }))} token={token} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Section C — Agreements */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9B9B9B", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Section C — Partner Agreements</div>
        <div style={{ padding: "12px 14px", borderRadius: 8, fontSize: 12, marginBottom: 14, background: allAgreements ? "#f0fdf4" : "#fffbf0", border: `1px solid ${allAgreements ? "#bbf7d0" : "#C9A84C"}`, color: allAgreements ? "#15803d" : "#92400e" }}>
          {allAgreements ? "✓ All four agreements accepted. Submit for Review is now unlocked." : `Read and accept all ${AGREEMENTS.length} agreements. Submit unlocks when every box is checked.`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AGREEMENTS.map(ag => (
            <AgreementAccordion key={ag.key} agreement={ag} checked={data.agreements[ag.key]} onChange={v => setAgreement(ag.key, v)} />
          ))}
        </div>
      </div>

      {/* Submit readiness checklist */}
      <div style={{ padding: "18px 20px", border: `2px solid ${readyToSubmit ? "#bbf7d0" : "#E5E5E5"}`, borderRadius: 12, background: readyToSubmit ? "#f0fdf4" : "#F9F7F2", transition: "all 0.25s" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0C0C0C", marginBottom: 12 }}>
          {readyToSubmit ? "✅ All done — ready to submit for review." : "⏳ Complete everything below to unlock Submit."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {([
            { done: allRequiredDone,       label: `Property photos — ${requiredDone}/${REQUIRED_CATEGORIES.length} required categories complete` },
            { done: allRoomsCovered,       label: hasRooms ? `Room photos — ${roomsWithPhotos}/${data.room_types.length} room types have photos` : "Room photos — no rooms added (go back to Step 6)" },
            { done: totalPending === 0,    label: totalPending > 0 ? `${totalPending} photo${totalPending > 1 ? "s" : ""} still uploading` : "All photos uploaded to CDN" },
            { done: terms_accepted,        label: "Terms & Conditions accepted" },
            { done: cancellation_accepted, label: "Cancellation Policy accepted" },
            { done: payment_accepted,      label: "Payment & Payout Terms accepted" },
            { done: legal_accepted,        label: "Legal Declarations accepted" },
          ] as { done: boolean; label: string }[]).map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: item.done ? "#15803d" : "#6B7280", fontWeight: item.done ? 600 : 400 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.done ? "✓" : "○"}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── WIZARD STEPS CONFIG ───────────────────────────────────────────────────────

const STEPS: StepConfig[] = [
  { key: "basics",    label: "Basic Info",  description: "Tell us your property name, type, star rating, and description."    },
  { key: "location",  label: "Location",    description: "Help guests find you with an accurate address and map pin."          },
  { key: "amenities", label: "Amenities",   description: "Select all facilities and tags that describe your property."        },
  { key: "policies",  label: "Policies",    description: "Set check-in/out times, house rules, and accepted payment methods." },
  { key: "contact",   label: "Contact",     description: "Add your contact details and nearby attractions for guests."        },
  { key: "rooms",     label: "Rooms",       description: "Add your room types — this is what guests browse and book."         },
  { key: "dining",    label: "Dining",      description: "Add dining venues if your property offers food and beverage."       },
  { key: "photos",    label: "Photos",      description: "Upload at least 3 photos in each required category (max 10 each)." },
];

const EMPTY: PropertyWizardData = {
  name: "", property_type: "hotel", star_category: 3, description: "", total_rooms: 0,
  address: "", city: "", state: "", pincode: "", landmark: "", latitude: 0, longitude: 0,
  amenities: [], tags: [],
  check_in_time: "14:00", check_out_time: "12:00",
  cancellation:    "Free cancellation up to 24 hours before check-in.",
  children:        "Children of all ages are welcome.",
  pets:            "Pets are not allowed.",
  smoking:         "Non-smoking property.",
  extra_bed:       "Extra beds available on request.",
  early_check_in:  "Early check-in available from 10:00 AM on request, subject to availability.",
  late_check_out:  "Late check-out until 2:00 PM on request, subject to availability.",
  age_restriction: "No age restrictions. All guests welcome.",
  alcohol:         "Alcohol is served at our bar. Outside alcohol is not permitted.",
  payment_methods: ["Cash", "Credit Card", "Debit Card", "UPI"],
  contact:         { phone: "", email: "", whatsapp: "", website: "", gst: "" },
  nearby_attractions: [],
  room_types:     [],
  dining_venues:  [],
  photo_categories: REQUIRED_CATEGORIES.map(c => ({ category: c.key, label: c.label, images: [] })),
  agreements: { terms_accepted: false, cancellation_accepted: false, payment_accepted: false, legal_accepted: false },
};

function canProceed(step: number, data: PropertyWizardData): boolean {
  switch (step) {
    case 0: return !!data.name.trim() && !!data.description.trim() && data.total_rooms > 0;
    case 1: return !!data.address.trim() && !!data.city.trim() && !!data.state;
    case 2: return true;
    case 3: return true;
    case 4: return !!data.contact.phone.trim() && !!data.contact.email.trim();
    case 5: return data.room_types.length > 0;
    case 6: return true;
    case 7: {
      const photosOk = REQUIRED_CATEGORIES.every(rc => {
        const cat = data.photo_categories.find(c => c.category === rc.key);
        return (cat?.images.length ?? 0) >= MIN_PHOTOS_PER_CATEGORY;
      });
      const roomPhotosOk = data.room_types.length === 0 || data.room_types.every(rt => (rt.images?.length ?? 0) >= MIN_ROOM_PHOTOS);
      const agrOk = data.agreements.terms_accepted && data.agreements.cancellation_accepted && data.agreements.payment_accepted && data.agreements.legal_accepted;
      return photosOk && roomPhotosOk && agrOk;
    }
    default: return true;
  }
}

interface StepProps {
  data: PropertyWizardData;
  setField: <K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) => void;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function useSimpleToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  function show(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }
  const el = toast ? (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 320, animation: "fadeIn 0.2s ease" }}>
      {toast.msg}
    </div>
  ) : null;
  return { show, el };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

export default function PropertyWizard() {
  const router             = useRouter();
  const { user, getAccessToken } = useAuth();
  const toast              = useSimpleToast();

  const [step,          setStep]         = useState(0);
  const [data,          setData]         = useState<PropertyWizardData>(EMPTY);
  const [saving,        setSaving]       = useState(false);
  const [savingDraft,   setSavingDraft]  = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Generate stable wizard_session_id on mount (survives re-renders)
  const wizardSessionIdRef = useRef<string>(generateUUID());

  const token = getAccessToken();

  function setField<K extends keyof PropertyWizardData>(key: K, val: PropertyWizardData[K]) {
    setData(d => ({ ...d, [key]: val }));
  }

  function describeError(err: unknown, fallback: string): string {
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  }

  async function handleSaveDraft() {
    if (!token) { toast.show("Not logged in", "error"); return; }
    if (pendingUploads > 0) { toast.show(`${pendingUploads} photo${pendingUploads > 1 ? "s" : ""} still uploading. Please wait.`, "error"); return; }
    setSavingDraft(true);
    try {
      await partnerApi.createProperty(token, { ...data, status: "draft" } as any);
      toast.show("Property saved as draft.");
      router.push("/partner/properties");
    } catch (err) { toast.show(describeError(err, "Failed to save draft. Please try again."), "error"); }
    finally { setSavingDraft(false); }
  }

  // Check if property was created by looking at recent properties
  async function findRecentProperty(): Promise<any | null> {
    if (!token) return null;
    try {
      const resp = await partnerApi.listProperties(token);
      const properties = resp?.properties || [];
      const now = Date.now();
      const sixtySecondsAgo = now - 60000;

      // Find property with same name/city created in last 60 seconds
      return properties.find((p: any) => {
        const created = new Date(p.created_at).getTime();
        return (
          p.name === data.name &&
          p.city === data.city &&
          created >= sixtySecondsAgo &&
          created <= now
        );
      }) || null;
    } catch (err) {
      console.error("Error checking properties:", err);
      return null;
    }
  }

  async function handleSubmit() {
    if (!token) { toast.show("Not logged in", "error"); return; }
    if (pendingUploads > 0) { toast.show(`${pendingUploads} photo${pendingUploads > 1 ? "s" : ""} still uploading. Please wait.`, "error"); return; }
    setSaving(true);
    try {
      // Include wizard_session_id in payload for idempotency
      const payload = {
        ...data,
        status: "pending_review",
        wizard_session_id: wizardSessionIdRef.current,
      } as any;

      await partnerApi.createProperty(token, payload);
      toast.show("Property submitted for review! Approval takes 24–48 hours.");
      router.push("/partner/properties");
    } catch (err: any) {
      if (err?.message?.includes("PARTNER_NOT_APPROVED") || err?.status === 403) {
        toast.show("Complete business KYC before submitting your property.", "error");
        router.push("/partner/dashboard?verify=1");
        return;
      }

      // Handle 500 errors: check if property was actually created
      if (err?.status === 500 || !err?.status) {
        toast.show("Property is being created... checking status...");
        setCheckingStatus(true);

        try {
          // Wait 2 seconds then check
          await new Promise(r => setTimeout(r, 2000));
          const found = await findRecentProperty();

          if (found) {
            // Property was created successfully despite the error
            toast.show("Property submitted for review! Approval takes 24–48 hours.");
            router.push(`/partner/properties/${found.id}`);
            return;
          }

          // Property not found, show error with retry option
          toast.show("Failed to submit. Please try again.", "error");
        } catch (checkErr) {
          console.error("Error during status check:", checkErr);
          toast.show("Failed to submit. Please try again.", "error");
        } finally {
          setCheckingStatus(false);
        }
        return;
      }

      toast.show(describeError(err, "Failed to submit. Please try again."), "error");
    } finally { setSaving(false); }
  }

  const photosCanProceed = canProceed(step, data) && pendingUploads === 0;
  const stepProps: StepProps = { data, setField };

  return (
    <>
      {toast.el}
      <WizardShell
        steps={STEPS} current={step}
        onBack={() => setStep(s => s - 1)} onNext={() => setStep(s => s + 1)}
        onSubmit={handleSubmit} onSaveDraft={handleSaveDraft}
        canNext={step === 7 ? photosCanProceed : canProceed(step, data)}
        saving={saving || checkingStatus} savingDraft={savingDraft}
      >
        {step === 0 && <Step1BasicInfo  {...stepProps} />}
        {step === 1 && <Step2Location   {...stepProps} />}
        {step === 2 && <Step3Amenities  {...stepProps} />}
        {step === 3 && <Step4Policies   {...stepProps} />}
        {step === 4 && <Step5Contact    {...stepProps} />}
        {step === 5 && <Step6Rooms      {...stepProps} />}
        {step === 6 && <Step7Dining     {...stepProps} />}
        {step === 7 && (
          <Step8Photos
            {...stepProps}
            pendingUploads={pendingUploads}
            onPendingChange={setPendingUploads}
            token={token}
          />
        )}
      </WizardShell>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wizSpin { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
        @media (max-width: 560px) { .type-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      ` }} />
    </>
  );
}