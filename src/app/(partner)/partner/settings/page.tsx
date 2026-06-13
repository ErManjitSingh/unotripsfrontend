"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  function show(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  }
  const el = toast ? (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 320 }}>{toast.msg}</div>
  ) : null;
  return { success: (m: string) => show(m, "success"), error: (m: string) => show(m, "error"), el };
}

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid #E5E5E5", background: "#F9F7F2" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>{title}</h2>
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder, hint, error, disabled, autoComplete }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; error?: string; disabled?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} autoComplete={autoComplete}
        style={{ width: "100%", height: 44, padding: "0 14px", border: `1px solid ${error ? "#dc2626" : "#E5E5E5"}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, background: disabled ? "#F9F7F2" : "#fff", opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "text" }}
        onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = "#C9A84C"; }}
        onBlur={e  => { e.currentTarget.style.borderColor = error ? "#dc2626" : "#E5E5E5"; }}
      />
      {hint  && <div style={{ fontSize: 11, color: "#9B9B9B", marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E5E5E5" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#0C0C0C", marginBottom: sub ? 2 : 0 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "#9B9B9B" }}>{sub}</div>}
      </div>
      <button onClick={() => onChange(!checked)}
        style={{ width: 42, height: 24, borderRadius: 12, flexShrink: 0, background: checked ? "#C9A84C" : "#E5E5E5", border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", boxShadow: checked ? "0 0 0 3px rgba(201,168,76,0.15)" : "none" }}>
        <span style={{ position: "absolute", top: 3, borderRadius: "50%", width: 18, height: 18, background: "#fff", left: checked ? 21 : 3, transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

// ── SaveBtn ───────────────────────────────────────────────────────────────────
function SaveBtn({ loading, label = "Save Changes" }: { loading: boolean; label?: string }) {
  return (
    <button type="submit" disabled={loading}
      style={{ marginTop: 16, padding: "9px 22px", background: loading ? "rgba(201,168,76,0.4)" : "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)", color: "#fff", border: "none", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 2px 8px rgba(201,168,76,0.3)" }}>
      {loading ? "Saving…" : label}
    </button>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function PartnerSettingsPage() {
  const { user, getAccessToken } = useAuth();
  const toast = useToast();
  const token = getAccessToken();

  // Profile
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [savingPwd, setSavingPwd] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]    = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({ new_booking: true, cancellation: true, payout: true, review: false, marketing: false });

  useEffect(() => {
    if (user) setProfile({ name: user.name ?? "", email: user.email ?? "", phone: (user as any).phone ?? "" });
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // TODO: wire to API once endpoint available
      toast.success("Profile updated successfully.");
    } catch { toast.error("Failed to update profile."); }
    finally { setSavingProfile(false); }
  }

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwd.current)             errs.current = "Required";
    if (pwd.next.length < 8)      errs.next    = "Minimum 8 characters";
    if (pwd.next !== pwd.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }

    setSavingPwd(true);
    try {
      if (token) await partnerApi.changePassword(token, { current_password: pwd.current, new_password: pwd.next });
      toast.success("Password changed successfully.");
      setPwd({ current: "", next: "", confirm: "" });
    } catch (err: any) { toast.error(err?.message ?? "Failed to change password."); }
    finally { setSavingPwd(false); }
  }

  return (
    <div>
      {toast.el}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E5E5E5" }}>
        <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em" }}>Settings</h1>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", marginTop: 3 }} />
      </div>

      {/* Profile */}
      <SectionCard icon={<IconUser />} title="Profile Information">
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
            <Input label="Mobile Number" type="tel" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} placeholder="9876543210" />
          </div>
          <Input label="Email Address" type="email" value={profile.email} onChange={() => {}} disabled hint="Email cannot be changed. Contact support if needed." />
          <div><SaveBtn loading={savingProfile} /></div>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard icon={<IconLock />} title="Change Password">
        <form onSubmit={handleChangePwd} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <Input label="Current Password" type={showCurrent ? "text" : "password"} value={pwd.current}
              onChange={v => { setPwd(p => ({ ...p, current: v })); setPwdErrors(e => ({ ...e, current: "" })); }}
              error={pwdErrors.current} autoComplete="current-password" />
            <button type="button" onClick={() => setShowCurrent(o => !o)}
              style={{ position: "absolute", right: 13, top: 33, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#9B9B9B" }}>
              {showCurrent ? "Hide" : "Show"}
            </button>
          </div>
          <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Input label="New Password" type={showNext ? "text" : "password"} value={pwd.next}
                onChange={v => { setPwd(p => ({ ...p, next: v })); setPwdErrors(e => ({ ...e, next: "" })); }}
                error={pwdErrors.next} hint="Min. 8 characters" autoComplete="new-password" />
              <button type="button" onClick={() => setShowNext(o => !o)}
                style={{ position: "absolute", right: 13, top: 33, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#9B9B9B" }}>
                {showNext ? "Hide" : "Show"}
              </button>
            </div>
            <Input label="Confirm New Password" type="password" value={pwd.confirm}
              onChange={v => { setPwd(p => ({ ...p, confirm: v })); setPwdErrors(e => ({ ...e, confirm: "" })); }}
              error={pwdErrors.confirm} autoComplete="new-password" />
          </div>
          <div>
            <button type="submit" disabled={savingPwd}
              style={{ marginTop: 4, padding: "9px 22px", background: savingPwd ? "rgba(201,168,76,0.4)" : "transparent", color: savingPwd ? "#fff" : "#6B7280", border: "1.5px solid #E5E5E5", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: savingPwd ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { if (!savingPwd) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0C0C0C"; (e.currentTarget as HTMLButtonElement).style.color = "#0C0C0C"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5"; (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}>
              {savingPwd ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={<IconBell />} title="Notification Preferences">
        <div>
          <Toggle checked={notifs.new_booking}  onChange={v => setNotifs(n => ({ ...n, new_booking: v }))}  label="New booking alerts"    sub="Get notified when a new booking is made" />
          <Toggle checked={notifs.cancellation} onChange={v => setNotifs(n => ({ ...n, cancellation: v }))} label="Cancellation alerts"   sub="Get notified when a booking is cancelled" />
          <Toggle checked={notifs.payout}       onChange={v => setNotifs(n => ({ ...n, payout: v }))}       label="Payout notifications" sub="Weekly payout confirmation emails" />
          <Toggle checked={notifs.review}       onChange={v => setNotifs(n => ({ ...n, review: v }))}       label="Guest review alerts"  sub="Get notified when a guest leaves a review" />
          <div style={{ borderBottom: "none" }}>
            <Toggle checked={notifs.marketing}  onChange={v => setNotifs(n => ({ ...n, marketing: v }))}    label="Marketing & tips"     sub="Product updates and performance tips from Uno" />
          </div>
        </div>
      </SectionCard>

      <style dangerouslySetInnerHTML={{ __html: `@media(max-width:600px){.settings-grid{grid-template-columns:1fr!important}}` }} />
    </div>
  );
}