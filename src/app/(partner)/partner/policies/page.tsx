"use client";

/**
 * src/app/(partner)/partner/policies/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 1000% replica of unohotelsandresorts.com/partner/policies
 *
 * Three SectionCards: Terms & Conditions | Privacy Policy | Payout Policy
 * Four AgreementRow checkboxes below, required ones marked with *
 * Save Agreements button — validates required checkboxes before saving
 *
 * Note: Backend endpoint for saving agreements (POST /v1/partner/agreements)
 * is not yet wired — we show a TODO comment and fall back to a simulated save.
 * The UI is 100% complete and ready to wire when the endpoint exists.
 */

import React, { useState } from "react";
import Link from "next/link";

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconFile    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconShield  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconPayout  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IconExt     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const IconCheck   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

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
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 320, animation: "polFadeIn 0.2s ease" }}>
      {toast.msg}
    </div>
  ) : null;
  return { success: (m: string) => show(m, "success"), error: (m: string) => show(m, "error"), el };
}

// ── SectionCard ───────────────────────────────────────────────────────────────

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid #E5E5E5", background: "#F9F7F2" }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C" }}>{title}</h2>
      </div>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </div>
  );
}

// ── PolicyLink ────────────────────────────────────────────────────────────────

function PolicyLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "1px solid #E5E5E5", borderRadius: 10, marginBottom: 10, background: "#fff", transition: "border-color 0.2s, background 0.2s", textDecoration: "none" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.background = "rgba(201,168,76,0.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.background = "#fff"; }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0C0C0C", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#9B9B9B" }}>{description}</div>
      </div>
      <span style={{ color: "#9B7D32", flexShrink: 0, marginLeft: 12 }}><IconExt /></span>
    </Link>
  );
}

// ── AgreementRow ──────────────────────────────────────────────────────────────

function AgreementRow({ checked, onChange, label, required }: { checked: boolean; onChange: () => void; label: React.ReactNode; required?: boolean }) {
  return (
    <div onClick={onChange}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: "1px solid #E5E5E5", cursor: "pointer", userSelect: "none" as const }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? "#C9A84C" : "#E5E5E5"}`, background: checked ? "#C9A84C" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s" }}>
        {checked && <span style={{ color: "#fff" }}><IconCheck /></span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#0C0C0C", lineHeight: 1.6 }}>
          {label}
          {required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
        </div>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  const toast = useToast();

  const [agreements, setAgreements] = useState({
    terms:   false,
    privacy: false,
    payout:  false,
    conduct: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const allRequired = agreements.terms && agreements.privacy;

  function toggle(key: keyof typeof agreements) {
    setAgreements(a => ({ ...a, [key]: !a[key] }));
    setSaved(false);
  }

  async function handleSave() {
    if (!allRequired) {
      toast.error("You must agree to Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    setSaving(true);
    try {
      // TODO: await partnerApi.saveAgreements(token, agreements)
      // Backend endpoint POST /v1/partner/agreements not yet available.
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      toast.success("Policy agreements saved.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {toast.el}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #E5E5E5" }}>
        <h1 style={{ fontFamily: "inherit", fontSize: 26, fontWeight: 700, color: "#0C0C0C", letterSpacing: "-0.02em" }}>Policies</h1>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A84C", marginTop: 3 }} />
      </div>

      {/* Terms & Conditions */}
      <SectionCard icon={<IconFile />} title="Terms & Conditions">
        <PolicyLink href="/partner/terms"             label="Partner Terms & Conditions"   description="Governs your use of the Uno Hotels partner platform, listing rules, and obligations." />
        <PolicyLink href="/partner/terms#commission"  label="Commission & Fee Structure"   description="Details on Uno's commission rates, fee deductions, and payout calculations." />
        <PolicyLink href="/partner/terms#cancellation" label="Cancellation & Refund Policy" description="Rules around guest cancellations, no-shows, and your payout impact." />
      </SectionCard>

      {/* Privacy Policy */}
      <SectionCard icon={<IconShield />} title="Privacy Policy">
        <PolicyLink href="/privacy-policy"      label="Privacy Policy"           description="How Uno Hotels collects, uses, and protects your personal and business data." />
        <PolicyLink href="/privacy-policy#data" label="Data Sharing & Third Parties" description="Information about what data is shared with guests, payment processors, and partners." />
      </SectionCard>

      {/* Payout Policy */}
      <SectionCard icon={<IconPayout />} title="Payout Policy">
        <PolicyLink href="/partner/terms#payouts" label="Payout Schedule & Process" description="Weekly payout cycles, bank transfer timelines, and dispute handling." />
        <PolicyLink href="/partner/terms#taxes"   label="Tax & GST Compliance"     description="Your responsibilities for GST, TDS deductions, and annual filings." />
      </SectionCard>

      {/* Agreements card */}
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: 3, background: "linear-gradient(90deg,#C9A84C,#E8D5A0)" }} />
        <div style={{ padding: "20px 24px 4px" }}>
          <h2 style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#0C0C0C", marginBottom: 4 }}>Your Agreements</h2>
          <p style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 0 }}>
            Required agreements are marked with <span style={{ color: "#dc2626" }}>*</span>
          </p>
        </div>
        <div style={{ padding: "0 24px 18px" }}>
          <AgreementRow checked={agreements.terms} onChange={() => toggle("terms")} required
            label={<>I have read and agree to the{" "}<Link href="/partner/terms" target="_blank" style={{ color: "#9B7D32", fontWeight: 600, borderBottom: "1px solid rgba(201,168,76,0.4)", textDecoration: "none" }}>Partner Terms & Conditions</Link></>}
          />
          <AgreementRow checked={agreements.privacy} onChange={() => toggle("privacy")} required
            label={<>I have read and agree to the{" "}<Link href="/privacy-policy" target="_blank" style={{ color: "#9B7D32", fontWeight: 600, borderBottom: "1px solid rgba(201,168,76,0.4)", textDecoration: "none" }}>Privacy Policy</Link>{" "}and consent to the processing of my business data</>}
          />
          <AgreementRow checked={agreements.payout} onChange={() => toggle("payout")}
            label={<>I understand and accept the{" "}<Link href="/partner/terms#payouts" target="_blank" style={{ color: "#9B7D32", fontWeight: 600, borderBottom: "1px solid rgba(201,168,76,0.4)", textDecoration: "none" }}>Payout Schedule & Policy</Link></>}
          />
          <div style={{ borderBottom: "none" }}>
            <AgreementRow checked={agreements.conduct} onChange={() => toggle("conduct")}
              label={<>I agree to maintain accurate property listings and adhere to Uno's{" "}<Link href="/partner/terms#conduct" target="_blank" style={{ color: "#9B7D32", fontWeight: 600, borderBottom: "1px solid rgba(201,168,76,0.4)", textDecoration: "none" }}>Partner Code of Conduct</Link></>}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: "10px 22px", background: saving ? "rgba(201,168,76,0.4)" : "linear-gradient(135deg,#C9A84C 0%,#b8943e 100%)", color: "#fff", border: "none", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: saving ? "none" : "0 2px 8px rgba(201,168,76,0.3)", display: "inline-flex", alignItems: "center", gap: 8 }}>
          {saving && <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "polSpin 0.7s linear infinite", display: "inline-block" }} />}
          {saving ? "Saving…" : "Save Agreements"}
        </button>

        {saved && (
          <span style={{ fontSize: 13, color: "#15803d", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
            <IconCheck /> Saved
          </span>
        )}

        {!allRequired && !saving && (
          <span style={{ fontSize: 12, color: "#9B9B9B" }}>
            Terms &amp; Privacy Policy agreement required
          </span>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes polFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes polSpin   { to{transform:rotate(360deg)} }
      ` }} />
    </div>
  );
}