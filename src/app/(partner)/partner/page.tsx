"use client";

/**
 * src/app/(partner)/partner/page.tsx
 *
 * 1000% replica of unohotelsandresorts.com/partner
 * ─────────────────────────────────────────────────
 * Sections:
 *   1. Hero  — dark left panel + form card right (Create Account / Sign In tabs)
 *   2. Problems section  — dark bg, 2-col grid
 *   3. Testimonials      — cream bg, 2-col grid
 *   4. FAQ accordion     — dark bg
 *   5. Bottom CTA        — gold gradient, scroll-to-form
 *
 * Auth wiring:
 *   - Uses useAuth() from src/contexts/auth-context.tsx
 *   - Register → registerUser with role:"partner" via auth-context register()
 *     NOTE: the auth-context register() sets role:"guest" by default.
 *     We call the API directly with role:"partner" to bypass that.
 *   - Login    → login() from auth-context
 *   - After success: saveAuthSession + router.push("/partner/dashboard")
 *
 * Styling:
 *   - Inline styles only (no Tailwind) to match unohotelsandresorts design exactly.
 *   - Colors: black #0C0C0C, gold #C9A84C, gold-dark #9B7D32, gold-accent #E8D5A0
 *   - Font: inherits site font (Roboto via --font-roboto)
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { registerUser } from "@/lib/hotels-auth-api";
import {
  saveAuthSession,
  sessionFromAuthResponse,
  loadAuthSession,
  clearAuthSession,
} from "@/lib/auth-session";

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const IconRevenue = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconAnalytics = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 17V13" /><path d="M12 17V9" /><path d="M16 17V11" />
  </svg>
);
const IconPayout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconEyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9A84C" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const BENEFITS = [
  { Icon: IconRevenue,   title: "Grow your revenue",   sub: "Reach thousands of verified travellers across India" },
  { Icon: IconAnalytics, title: "Real-time analytics", sub: "Track bookings, revenue, and occupancy in one dashboard" },
  { Icon: IconPayout,    title: "Weekly payouts",       sub: "Payouts credited directly to your bank account every week" },
  { Icon: IconShield,    title: "Zero setup cost",      sub: "Free to list. We earn only when you earn." },
];

const PROBLEMS = [
  { icon: "📉", problem: "Empty rooms costing you money",        solution: "Uno Trips fills your calendar with verified, paying travellers from across India — no marketing budget needed." },
  { icon: "💸", problem: "Platforms charging 25–30% commission", solution: "We charge a flat 15% only when you earn. No setup fee, no monthly fee, no surprise deductions." },
  { icon: "🕐", problem: "Waiting weeks for your money",          solution: "Every confirmed stay triggers a payout to your bank within 7 days. No holding periods." },
  { icon: "😤", problem: "Complicated dashboards nobody explains", solution: "Rate calendar, booking inbox, payout history — all on one screen. Built for owners, not tech people." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", initials: "PS", property: "Heritage Haveli",    location: "Jaipur, Rajasthan",     nights: "312 nights booked", rating: 5, text: "First booking in 3 days of listing. Revenue up 40% in just 6 months. The support team is always available." },
  { name: "Arjun Nair",   initials: "AN", property: "Hillside Retreat",   location: "Munnar, Kerala",        nights: "520 nights booked", rating: 5, text: "Occupancy from 45% to 82% in four months. Managing everything from my phone is completely effortless." },
  { name: "Meera Kapoor", initials: "MK", property: "Riverside Camps",    location: "Rishikesh, Uttarakhand", nights: "180 nights booked", rating: 5, text: "Weekly payouts changed everything. No waiting 30 days like other platforms. The support team picks up the phone." },
  { name: "Suresh Pillai", initials: "SP", property: "Spice Garden Villa", location: "Wayanad, Kerala",      nights: "290 nights booked", rating: 5, text: "Listing took 20 minutes. Verified in a day. I can block dates from my phone and prices update instantly for guests." },
];

const FAQS = [
  { q: "How long does it take to get listed?",           a: "You can complete your listing in under 20 minutes. Our verification team reviews and approves within 24 hours. After that, your property goes live and starts appearing in guest searches." },
  { q: "What commission does Uno Trips charge?",         a: "We charge 15% commission only on confirmed, completed bookings. No setup fee, no monthly subscription, and no fee if you receive zero bookings. We earn only when you earn." },
  { q: "When and how do I get paid?",                    a: "Payouts are processed weekly, directly to your registered bank account. For every confirmed stay, the payout is released within 7 days of the check-in date. Track everything from your dashboard." },
  { q: "Can I control my own pricing and availability?", a: "Yes — completely. You set your base price, weekend price, and seasonal rates. The rate calendar lets you block dates, set custom prices for any day, or limit availability any time." },
  { q: "Can I pause or cancel my listing?",              a: "You can pause or deactivate your listing at any time — no questions asked, no penalty. Confirmed bookings are honoured before the pause takes effect." },
  { q: "Do I need GST registration to list?",            a: "GST registration is optional at listing time. If you have a GSTIN, we generate GST-compliant invoices automatically. You can always add it later." },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#9B7D32",
  display: "block", marginBottom: 5,
  textTransform: "uppercase", letterSpacing: "0.06em",
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%", height: 44, padding: "0 14px",
  border: `1.5px solid ${hasError ? "#dc2626" : "rgba(201,168,76,0.25)"}`,
  borderRadius: 10, fontSize: 13, fontFamily: "inherit",
  color: "#0C0C0C", background: "rgba(255,251,240,0.5)",
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
});

// ─────────────────────────────────────────────────────────────────────────────
// FIELD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  autoComplete: string; error?: string; right?: React.ReactNode;
}

function Field({ label, type = "text", value, onChange, placeholder, autoComplete, error, right }: FieldProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} placeholder={placeholder} autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle(!!error), paddingRight: right ? 44 : 14 }}
          onFocus={e => {
            e.currentTarget.style.borderColor = error ? "#dc2626" : "#C9A84C";
            e.currentTarget.style.boxShadow   = error ? "none" : "0 0 0 3px rgba(201,168,76,0.1)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? "#dc2626" : "rgba(201,168,76,0.25)";
            e.currentTarget.style.boxShadow   = "none";
          }}
        />
        {right && (
          <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
            {right}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "15px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span className="fp-faq-q" style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4, flex: 1 }}>{q}</span>
        <span style={{ color: "#C9A84C", fontSize: 20, fontWeight: 300, flexShrink: 0, lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.58)", lineHeight: 1.75, paddingBottom: 16, marginTop: -4 }}>{a}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      style={{ width: "100%", padding: "13px", background: loading ? "#aaa" : "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)", color: "#fff", border: "none", borderRadius: 9999, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : "0 4px 16px rgba(201,168,76,0.35)", transition: "all 0.2s", marginTop: 4 }}
    >
      {loading && <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
      {loading ? "Please wait…" : label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB TYPE
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "register" | "login";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PartnerPage() {
  const router = useRouter(); // kept for potential future use
  const { login: doLogin, updateUser } = useAuth();

  const [tab, setTab] = useState<Tab>("register");

  // ── Register state ──────────────────────────────────────────────────────
  const [regName,    setRegName]    = useState("");
  const [regEmail,   setRegEmail]   = useState("");
  const [regPhone,   setRegPhone]   = useState("");
  const [regPwd,     setRegPwd]     = useState("");
  const [regErrors,  setRegErrors]  = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);
  const [regShowPwd, setRegShowPwd] = useState(false);

  // ── Login state ─────────────────────────────────────────────────────────
  const [logEmail,   setLogEmail]   = useState("");
  const [logPwd,     setLogPwd]     = useState("");
  const [logErrors,  setLogErrors]  = useState<Record<string, string>>({});
  const [logLoading, setLogLoading] = useState(false);
  const [logShowPwd, setLogShowPwd] = useState(false);

  // ── Password strength ───────────────────────────────────────────────────
  const strength = !regPwd ? 0 : regPwd.length < 8 ? 1 : /[A-Z]/.test(regPwd) && /[0-9]/.test(regPwd) && /[^A-Za-z0-9]/.test(regPwd) ? 3 : /[A-Z]/.test(regPwd) && /[0-9]/.test(regPwd) ? 2 : 1;
  const strengthColor = ["transparent", "#dc2626", "#d97706", "#16a34a"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];

  // ── Toast helper (inline — no dep on unohotels toast system) ────────────
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Register handler ────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!regName.trim() || regName.trim().length < 2) errs.name     = "Enter your full name (min. 2 characters)";
    if (!regEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email   = "Enter a valid email address";
    if (!regPhone.match(/^[6-9]\d{9}$/))               errs.phone   = "Enter a valid 10-digit Indian mobile number";
    if (regPwd.length < 8)                             errs.password = "Minimum 8 characters required";
    if (Object.keys(errs).length) { setRegErrors(errs); return; }

    setRegLoading(true);
    try {
      // Call registerUser directly with role:"partner"
      // auth-context.register() hardcodes role:"guest" so we bypass it
      const response = await registerUser({
        name:     regName.trim(),
        email:    regEmail.trim().toLowerCase(),
        phone:    regPhone.trim(),
        password: regPwd,
        role:     "partner",
      });

      if (response.user.role !== "partner") {
        showToast("Could not create a partner account. Please contact support.", "error");
        return;
      }

      // 1. Save to localStorage + set uno_auth_session cookie (done by saveAuthSession)
      const stored = sessionFromAuthResponse(response.user, response.tokens);
      saveAuthSession(stored);

      // 2. Sync auth-context React state so the layout guard sees isAuthenticated=true
      updateUser(response.user);

      showToast(`Welcome, ${response.user.name.split(" ")[0]}! Let's set up your property.`);

      // 3. Small delay to let cookie settle, then hard-navigate
      //    (hard nav re-bootstraps auth-context cleanly from the saved session)
      setTimeout(() => { window.location.href = "/partner/dashboard"; }, 300);

    } catch (err: any) {
      if (err?.status === 409)      showToast("An account with this email already exists.", "error");
      else if (err?.status === 422) showToast(err.message ?? "Validation error.", "error");
      else if (err?.status === 429) showToast("Too many attempts. Please wait.", "error");
      else                          showToast(err?.message ?? "Registration failed. Please try again.", "error");
    } finally {
      setRegLoading(false);
    }
  }

  // ── Login handler ───────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!logEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email    = "Enter a valid email";
    if (logPwd.length < 8)                              errs.password = "Minimum 8 characters";
    if (Object.keys(errs).length) { setLogErrors(errs); return; }

    setLogLoading(true);
    try {
      // doLogin() calls loginUser → saves session → updates auth-context state
      await doLogin(logEmail.trim().toLowerCase(), logPwd);

      // Read role directly from localStorage (saveAuthSession writes it synchronously)
      const session = loadAuthSession();
      const role    = session?.user?.role;

      if (role !== "partner" && role !== "admin") {
        // Guest tried the partner login — clear and tell them
        clearAuthSession();
        showToast("This is a guest account. Please use the guest sign in.", "error");
        return;
      }

      showToast(`Welcome back, ${session?.user?.name?.split(" ")[0] ?? ""}!`);

      // Hard navigate so auth-context re-bootstraps cleanly on the dashboard
      setTimeout(() => { window.location.href = "/partner/dashboard"; }, 300);

    } catch (err: any) {
      if (err?.status === 401)      showToast("Invalid email or password.", "error");
      else if (err?.status === 403) showToast("Account deactivated. Please contact support.", "error");
      else if (err?.status === 429) showToast("Too many attempts. Please wait.", "error");
      else                          showToast(err?.message ?? "Sign in failed. Please try again.", "error");
    } finally {
      setLogLoading(false);
    }
  }

  // ── Form card (reused in hero and bottom CTA) ───────────────────────────
  const FormCard = (
    <div id="partner-form" className="fp-form-card" style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(201,168,76,0.2)", padding: "clamp(28px,4vw,44px)", boxShadow: "0 2px 20px rgba(10,10,10,0.06)" }}>

      {/* Tab switcher */}
      <div style={{ display: "flex", background: "#F5F3EE", borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
        {(["register", "login"] as Tab[]).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className="fp-tab-btn"
            style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              background: tab === t ? "#fff" : "transparent",
              color:      tab === t ? "#0C0C0C" : "#9B9B9B",
              boxShadow:  tab === t ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t === "register" ? "Create Account" : "Sign In"}
          </button>
        ))}
      </div>

      {/* ── REGISTER TAB ─────────────────────────────────────────── */}
      {tab === "register" && (
        <>
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ width: 40, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #C9A84C, #E8D5A0)", margin: "0 auto 12px" }} />
            <h2 className="fp-form-heading" style={{ fontFamily: "inherit", fontSize: 22, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em", marginBottom: 6 }}>Create partner account</h2>
            <p style={{ fontSize: 13, color: "#6B7280" }}>Join 500+ property owners earning with Uno Trips</p>
          </div>

          <form onSubmit={handleRegister} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Full Name" value={regName} onChange={v => { setRegName(v); setRegErrors(e => ({ ...e, name: "" })) }} placeholder="Raj Mehta" autoComplete="name" error={regErrors.name} />
            <Field label="Work Email" type="email" value={regEmail} onChange={v => { setRegEmail(v); setRegErrors(e => ({ ...e, email: "" })) }} placeholder="raj@grandraj.com" autoComplete="email" error={regErrors.email} />

            {/* Mobile */}
            <div>
              <label style={labelStyle}>Mobile Number</label>
              <div style={{ display: "flex" }}>
                <span style={{ display: "flex", alignItems: "center", padding: "0 10px", height: 44, border: `1.5px solid ${regErrors.phone ? "#dc2626" : "rgba(201,168,76,0.25)"}`, borderRight: "none", borderRadius: "10px 0 0 10px", background: "rgba(255,251,240,0.5)", fontSize: 13, color: "#9B7D32", fontWeight: 600, flexShrink: 0 }}>+91</span>
                <input
                  type="tel" value={regPhone} placeholder="9876543210"
                  autoComplete="tel" maxLength={10} inputMode="numeric"
                  onChange={e => { setRegPhone(e.target.value); setRegErrors(er => ({ ...er, phone: "" })) }}
                  style={{ ...inputStyle(!!regErrors.phone), borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                  onFocus={e => { e.currentTarget.style.borderColor = regErrors.phone ? "#dc2626" : "#C9A84C"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = regErrors.phone ? "#dc2626" : "rgba(201,168,76,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              {regErrors.phone && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{regErrors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={regShowPwd ? "text" : "password"} value={regPwd}
                  onChange={e => { setRegPwd(e.target.value); setRegErrors(er => ({ ...er, password: "" })) }}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  style={{ ...inputStyle(!!regErrors.password), paddingRight: 44 }}
                  onFocus={e => { e.currentTarget.style.borderColor = regErrors.password ? "#dc2626" : "#C9A84C"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = regErrors.password ? "#dc2626" : "rgba(201,168,76,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setRegShowPwd(o => !o)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B9B9B", display: "flex", padding: 0 }}>
                  {regShowPwd ? <IconEyeOpen /> : <IconEyeOff />}
                </button>
              </div>
              {regErrors.password && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{regErrors.password}</p>}
              {regPwd && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(201,168,76,0.15)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(strength / 3) * 100}%`, background: strengthColor, borderRadius: 2, transition: "all 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, fontWeight: 500, minWidth: 32 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <SubmitBtn loading={regLoading} label="Create Partner Account →" />
          </form>

          <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#9B9B9B" }}>
            Already have an account?{" "}
            <button type="button" onClick={() => setTab("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7D32", fontWeight: 600, fontSize: 12, fontFamily: "inherit", borderBottom: "1px solid rgba(201,168,76,0.4)", padding: 0 }}>
              Sign in instead
            </button>
          </p>
        </>
      )}

      {/* ── LOGIN TAB ─────────────────────────────────────────────── */}
      {tab === "login" && (
        <>
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{ width: 40, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #C9A84C, #E8D5A0)", margin: "0 auto 12px" }} />
            <h2 className="fp-form-heading" style={{ fontFamily: "inherit", fontSize: 22, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em", marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: 13, color: "#6B7280" }}>Sign in to your Uno Partner account</p>
          </div>

          <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Email Address" type="email" value={logEmail}
              onChange={v => { setLogEmail(v); setLogErrors(e => ({ ...e, email: "" })) }}
              placeholder="raj@grandraj.com" autoComplete="email" error={logErrors.email}
            />
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={logShowPwd ? "text" : "password"} value={logPwd}
                  onChange={e => { setLogPwd(e.target.value); setLogErrors(er => ({ ...er, password: "" })) }}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ ...inputStyle(!!logErrors.password), paddingRight: 44 }}
                  onFocus={e => { e.currentTarget.style.borderColor = logErrors.password ? "#dc2626" : "#C9A84C"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = logErrors.password ? "#dc2626" : "rgba(201,168,76,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setLogShowPwd(o => !o)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B9B9B", display: "flex", padding: 0 }}>
                  {logShowPwd ? <IconEyeOpen /> : <IconEyeOff />}
                </button>
              </div>
              {logErrors.password && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{logErrors.password}</p>}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6 }}>
              <Link href="/forgot-password?role=partner" style={{ fontSize: 11, color: "#9B7D32", borderBottom: "1px solid rgba(201,168,76,0.4)", paddingBottom: 1 }}>
                Forgot password?
              </Link>
            </div>

            <SubmitBtn loading={logLoading} label="Sign in to Partner Portal" />
          </form>

          <p style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#9B9B9B" }}>
            New partner?{" "}
            <button type="button" onClick={() => setTab("register")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B7D32", fontWeight: 600, fontSize: 12, fontFamily: "inherit", borderBottom: "1px solid rgba(201,168,76,0.4)", padding: 0 }}>
              Create an account
            </button>
          </p>
        </>
      )}

      {/* Legal footer */}
      <p style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "#9B9B9B", lineHeight: 1.7 }}>
        By continuing you agree to our{" "}
        <Link href="/partner/terms" style={{ borderBottom: "1px solid rgba(201,168,76,0.3)" }}>Partner Terms</Link>{" "}and{" "}
        <Link href="/privacy-policy" style={{ borderBottom: "1px solid rgba(201,168,76,0.3)" }}>Privacy Policy</Link>
      </p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="fp-root">

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          animation: "fadeIn 0.2s ease",
          maxWidth: 320,
        }}>
          {toast.msg}
        </div>
      )}

      {/* ══ SECTION 1: HERO ══════════════════════════════════════════════════ */}
      <div className="fp-hero">

        {/* LEFT — dark panel */}
        <div className="fp-left">
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "clamp(24px,4vw,40px)" }}>
            <span className="fp-logo-text" style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
              <span style={{ color: "#fff" }}>UNO</span>
              <span style={{ color: "#C9A84C" }}>Trips</span>
            </span>
            <span style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginTop: 4 }}>Partner Portal</span>
          </Link>

          {/* Badge */}
          <div className="fp-left-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "5px 14px", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 9999, width: "fit-content" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C" }} />
            <span style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>For Property Owners</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "inherit", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, color: "#fff", lineHeight: 1.12, letterSpacing: "-0.025em", marginBottom: 28 }}>
            Grow your<br />hospitality business<br /><span style={{ color: "#C9A84C" }}>with Uno Hotels</span>
          </h1>

          {/* Benefits */}
          <div className="fp-benefits" style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
            {BENEFITS.map(({ Icon, title, sub }) => (
              <div key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA scroll */}
          <a href="#partner-form" className="fp-left-cta-btn"
            onClick={e => { e.preventDefault(); setTab("register"); document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" }); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#C9A84C", color: "#0C0C0C", borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: "none", marginBottom: 32, boxShadow: "0 3px 12px rgba(201,168,76,0.28)" }}>
            List Your Property Free →
          </a>

          <div className="fp-left-footer-line" style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            500+ properties trust Uno Hotels across India
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="fp-right">
          <div style={{ width: "100%", maxWidth: 440 }}>
            {FormCard}
          </div>
        </div>
      </div>

      {/* Mobile CTA strip */}
      <div className="fp-mobile-cta">
        <a href="#partner-form"
          onClick={e => { e.preventDefault(); setTab("register"); document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" }); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "linear-gradient(135deg,#C9A84C,#b8943e)", color: "#fff", borderRadius: 9999, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(201,168,76,0.4)" }}>
          List Your Property Free →
        </a>
        <p style={{ fontSize: 12, color: "#6B7280", marginTop: 10 }}>Takes 2 minutes · No credit card · Free forever</p>
      </div>

      {/* ══ SECTION 2: PROBLEMS ══════════════════════════════════════════════ */}
      <section className="fp-section-problems" style={{ background: "#0C0C0C", padding: "clamp(48px,8vw,80px) clamp(20px,6vw,80px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(32px,5vw,52px)" }}>
            <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>We built this for you</p>
            <h2 className="fp-section-heading" style={{ fontFamily: "inherit", fontSize: "clamp(24px,4vw,38px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Problems every property owner faces.<br />
              <span style={{ color: "#C9A84C" }}>We've solved them all.</span>
            </h2>
          </div>
          <div className="fp-grid-2">
            {PROBLEMS.map(p => (
              <div key={p.problem} className="fp-problem-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px 20px" }}>
                <div className="fp-problem-icon" style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 8, lineHeight: 1.4 }}>{p.problem}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{p.solution}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3: TESTIMONIALS ══════════════════════════════════════════ */}
      <section className="fp-section-testimonials" style={{ background: "#F9F7F2", padding: "clamp(48px,8vw,80px) clamp(20px,6vw,80px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,48px)" }}>
            <p style={{ fontSize: 11, color: "#9B7D32", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Partner stories</p>
            <h2 className="fp-section-heading" style={{ fontFamily: "inherit", fontSize: "clamp(22px,4vw,36px)", fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em", marginBottom: 16 }}>Real partners. Real results.</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 3 }}>{Array.from({ length: 5 }).map((_, i) => <IconStar key={i} />)}</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0C0C0C" }}>4.8 out of 5</span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>from 500+ partners</span>
            </div>
          </div>
          <div className="fp-grid-2">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="fp-testimonial-card" style={{ background: "#fff", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 3 }}>{Array.from({ length: t.rating }).map((_, i) => <IconStar key={i} />)}</div>
                <p className="fp-testimonial-text" style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.75, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(201,168,76,0.12)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#9B7D32", flexShrink: 0 }}>{t.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0C0C0C" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#9B9B9B" }}>{t.property} · {t.location}</div>
                  </div>
                  <div className="fp-nights-badge" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#15803d", whiteSpace: "nowrap" }}>{t.nights}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 4: FAQ ═══════════════════════════════════════════════════ */}
      <section className="fp-section-faq" style={{ background: "#0C0C0C", padding: "clamp(48px,8vw,80px) clamp(20px,6vw,80px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px,4vw,44px)" }}>
            <p style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Got questions?</p>
            <h2 className="fp-section-heading" style={{ fontFamily: "inherit", fontSize: "clamp(22px,4vw,36px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Everything you need to know</h2>
          </div>
          <div>{FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}</div>
        </div>
      </section>

      {/* ══ SECTION 5: BOTTOM CTA ═══════════════════════════════════════════ */}
      <section className="fp-section-cta" style={{ background: "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)", padding: "clamp(40px,6vw,64px) clamp(20px,6vw,60px)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "inherit", fontSize: "clamp(22px,4vw,34px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 10 }}>
          Ready to start earning?
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 28 }}>
          No setup fee. No monthly charges. We earn only when you earn.
        </p>
        <a href="#partner-form" className="fp-bottom-cta-btn"
          onClick={e => { e.preventDefault(); setTab("register"); document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" }); }}
          style={{ display: "inline-block", background: "#fff", color: "#9B7D32", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 9999, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", cursor: "pointer" }}>
          List Your Property Free →
        </a>
        <p style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Takes 2 minutes · No credit card · Approved within 24 hrs</p>
      </section>

      {/* ── CSS ──────────────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }

        /* ── Reset box-sizing globally inside this component ── */
        .fp-root *, .fp-root *::before, .fp-root *::after { box-sizing: border-box; }

        .fp-root {
          font-family: var(--font-roboto, Roboto, system-ui, sans-serif);
          -webkit-text-size-adjust: 100%;
        }

        /* ── DESKTOP: 2-col hero ── */
        .fp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100svh;
        }
        .fp-left {
          background: #0C0C0C;
          padding: clamp(36px,6vw,80px);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .fp-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(36px,5vw,64px) clamp(20px,5vw,56px);
          background: #F5F3EE;
          overflow-y: auto;
        }

        /* 2-col section grids */
        .fp-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        /* Mobile CTA strip — hidden on desktop */
        .fp-mobile-cta { display: none !important; }

        /* Benefits list — visible on desktop */
        .fp-benefits { display: flex; flex-direction: column; gap: 18px; margin-bottom: 32px; }

        /* ── ≤860px: tablet / large phone ── */
        @media (max-width: 860px) {
          .fp-hero {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .fp-left {
            padding: 28px 20px 28px;
          }
          /* Hide only the CTA button and footer line — benefits list stays visible */
          .fp-left-cta-btn     { display: none !important; }
          .fp-left-footer-line { display: none !important; }
          /* Hide the mobile CTA strip — form is already visible below */
          .fp-mobile-cta       { display: none !important; }

          .fp-right {
            padding: 24px 20px 40px;
            align-items: stretch;
            justify-content: flex-start;
          }
          .fp-right > div { max-width: 100% !important; }
        }

        /* ── ≤600px: standard phone ── */
        @media (max-width: 600px) {
          /* Section grids go 1-col */
          .fp-grid-2 { grid-template-columns: 1fr; gap: 12px; }

          /* Left panel: even tighter */
          .fp-left { padding: 24px 16px 24px; }

          /* Left panel headline size */
          .fp-left h1 { font-size: 26px !important; }

          /* Form card padding */
          .fp-form-card { padding: 24px 18px !important; }

          /* Tab switcher text */
          .fp-tab-btn { font-size: 12px !important; }

          /* Right panel */
          .fp-right { padding: 20px 16px 36px; }

          /* Section padding */
          .fp-section-problems,
          .fp-section-testimonials,
          .fp-section-faq,
          .fp-section-cta {
            padding: 40px 16px !important;
          }

          /* Testimonial cards — tighter */
          .fp-testimonial-card { padding: 16px !important; }

          /* Problem cards */
          .fp-problem-card { padding: 18px 16px !important; }

          /* Bottom CTA button full width */
          .fp-bottom-cta-btn {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
            padding: 14px 20px !important;
          }

          /* Mobile CTA */
          .fp-mobile-cta { padding: 20px 16px; }
        }

        /* ── ≤480px: small phone (iPhone SE, Moto G) ── */
        @media (max-width: 480px) {
          /* Logo text */
          .fp-logo-text { font-size: 22px !important; }

          /* Left panel badge */
          .fp-left-badge { display: none !important; }

          /* Left headline */
          .fp-left h1 { font-size: 24px !important; line-height: 1.15 !important; margin-bottom: 20px !important; }

          /* Form card */
          .fp-form-card { padding: 20px 14px !important; border-radius: 12px !important; }

          /* Form heading */
          .fp-form-heading { font-size: 18px !important; }

          /* Input height */
          .fp-input { height: 42px !important; font-size: 14px !important; }

          /* Submit button */
          .fp-submit-btn { font-size: 14px !important; padding: 12px !important; }

          /* Tab buttons */
          .fp-tab-btn { padding: 8px 0 !important; font-size: 12px !important; }

          /* Section headings */
          .fp-section-heading { font-size: 20px !important; }

          /* FAQ question text */
          .fp-faq-q { font-size: 13px !important; }

          /* Testimonial text */
          .fp-testimonial-text { font-size: 12px !important; }

          /* Problem icon */
          .fp-problem-icon { font-size: 22px !important; }
        }

        /* ── ≤360px: very small phone (Galaxy A series, older budget phones) ── */
        @media (max-width: 360px) {
          .fp-left { padding: 20px 14px; }

          .fp-left h1 { font-size: 22px !important; }

          .fp-form-card { padding: 18px 12px !important; }

          .fp-form-heading { font-size: 17px !important; }

          /* Stack +91 prefix and phone input naturally — already flex, fine */

          /* Mobile CTA button */
          .fp-mobile-cta a {
            font-size: 13px !important;
            padding: 12px 20px !important;
          }

          /* Bottom CTA */
          .fp-section-cta h2 { font-size: 20px !important; }
          .fp-section-cta p  { font-size: 13px !important; }

          /* Stats badges in testimonials */
          .fp-nights-badge { display: none !important; }
        }
      ` }} />
    </div>
  );
}