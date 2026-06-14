"use client";

/**
 * src/app/(partner)/partner/account/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Partner Account page — 1000% production-ready replica of unohotelsandresorts.com
 *
 * Three sections, each with its own Save button:
 *   1. Business Info  → PATCH /v1/partner/account/business   (partnerApi.updateBusiness)
 *   2. KYC Documents  → PATCH /v1/partner/account/kyc        (partnerApi.updateKyc)
 *   3. Bank Details   → PATCH /v1/partner/account/bank       (partnerApi.updateBank)
 *                       + Verify Bank Account                 (partnerApi.verifyBank)
 *
 * Bank section 3 states:
 *   State A — No details saved      → editable form
 *   State B — Saved, NOT verified   → read-only + gold "Verify Bank Account" button
 *   State C — Saved AND verified    → read-only + green badge + verified date
 *
 * Auth: getAccessToken() from useAuth (new frontend pattern)
 * API:  partnerApi.{getAccount, updateBusiness, updateKyc, updateBank, verifyBank}
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { partnerApi } from "@/lib/partner/api";
import type { AccountOut } from "@/lib/partner/api";

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background:    "#fff",
  border:        "1px solid #E5E5E5",
  borderRadius:  14,
  padding:       "24px 26px",
  marginBottom:  20,
  boxShadow:     "0 1px 6px rgba(10,10,10,0.04)",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 15, fontWeight: 700,
  color: "#0C0C0C", marginBottom: 4,
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: 12, color: "#9B9B9B",
  marginBottom: 20, lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12, fontWeight: 600,
  color: "#6B7280",
  marginBottom: 6,
  letterSpacing: "0.02em",
};

const inputBase: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  border: "1px solid #E5E5E5",
  borderRadius: 8, fontSize: 13,
  color: "#0C0C0C", background: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
  outline: "none",
  transition: "border-color 0.18s",
};

const inputLocked: React.CSSProperties = {
  ...inputBase,
  background:   "#F9F7F2",
  color:        "#6B7280",
  cursor:       "not-allowed",
  borderColor:  "#E5E5E5",
};

const row2: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
};

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState { msg: string; type: "success" | "error"; }

function useInlineToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(msg: string, type: "success" | "error") {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), 4000);
  }

  const el = toast ? (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      background: toast.type === "success" ? "#16a34a" : "#dc2626",
      color: "#fff",
      boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
      maxWidth: 340, lineHeight: 1.5,
      animation: "accFadeIn 0.2s ease",
    }}>
      {toast.msg}
    </div>
  ) : null;

  return {
    success: (m: string) => show(m, "success"),
    error:   (m: string) => show(m, "error"),
    el,
  };
}

// ── SaveBtn ───────────────────────────────────────────────────────────────────

function SaveBtn({
  loading, label = "Save Changes", disabled = false,
}: { loading: boolean; label?: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        marginTop: 18,
        padding: "9px 22px",
        background: (loading || disabled)
          ? "rgba(201,168,76,0.4)"
          : "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
        color: "#fff", border: "none", borderRadius: 9999,
        fontSize: 13, fontWeight: 600,
        cursor: (loading || disabled) ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        boxShadow: (loading || disabled) ? "none" : "0 2px 8px rgba(201,168,76,0.3)",
        transition: "opacity 0.2s",
        display: "inline-flex", alignItems: "center", gap: 8,
      }}
    >
      {loading && (
        <span style={{
          width: 13, height: 13, borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.35)",
          borderTopColor: "#fff",
          animation: "accSpin 0.7s linear infinite",
          display: "inline-block", flexShrink: 0,
        }} />
      )}
      {loading ? "Saving…" : label}
    </button>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({
  status, label: badgeLabel,
}: { status: "verified" | "pending" | "done"; label: string }) {
  const configs = {
    verified: { bg: "rgba(22,163,74,0.08)",   color: "#15803d", dot: "#16a34a", border: "rgba(22,163,74,0.2)",   text: `${badgeLabel} ✓`       },
    done:     { bg: "rgba(22,163,74,0.08)",   color: "#15803d", dot: "#16a34a", border: "rgba(22,163,74,0.2)",   text: `${badgeLabel} ✓`       },
    pending:  { bg: "rgba(201,168,76,0.08)", color: "#9B7D32", dot: "#C9A84C", border: "rgba(201,168,76,0.25)", text: `${badgeLabel} pending`  },
  };
  const cfg = configs[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 9999,
      fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap" as const,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.text}
    </span>
  );
}

// ── EditBankModal ─────────────────────────────────────────────────────────────

function EditBankModal({
  isVerified, onConfirm, onCancel,
}: { isVerified: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        padding: "28px 28px 24px",
        maxWidth: 400, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "accFadeIn 0.2s ease",
      }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#0C0C0C" }}>
          Edit Bank Details?
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
          {isVerified
            ? "Your bank account is currently verified. Editing your account number or IFSC will reset verification — you will need to verify again before payouts resume."
            : "You can edit your bank details. You will need to verify the account before payouts can be processed."}
        </p>

        {isVerified && (
          <div style={{
            padding: "10px 14px", marginBottom: 20,
            background: "rgba(220,38,38,0.05)",
            border: "1px solid rgba(220,38,38,0.2)",
            borderRadius: 8, fontSize: 12, color: "#dc2626",
          }}>
            ⚡ Payouts will be paused until re-verification is complete.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 18px", borderRadius: 9,
              border: "1px solid #E5E5E5", background: "#fff",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              color: "#6B7280",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0C0C0C"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 18px", borderRadius: 9, border: "none",
              background: isVerified ? "#dc2626" : "#C9A84C",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {isVerified ? "Edit & Reset Verification" : "Edit Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BankSection — 3 states ────────────────────────────────────────────────────

function BankSection({
  account, onSaved, onVerified, token, toast,
}: {
  account:    AccountOut;
  onSaved:    (updated: AccountOut) => void;
  onVerified: (updated: AccountOut) => void;
  token:      string;
  toast:      { success: (m: string) => void; error: (m: string) => void };
}) {
  const hasDetails = account.has_bank_details;
  const isVerified = account.bank_account_verified;
  const verifiedAt = account.bank_verified_at;

  // Form state — synced from account prop
  const [bankHolder,  setBankHolder]  = useState(account.bank_account_holder  ?? "");
  const [bankAccount, setBankAccount] = useState(account.bank_account_number  ?? "");
  const [bankIfsc,    setBankIfsc]    = useState(account.bank_ifsc             ?? "");

  // UI state
  const [isEditing, setIsEditing] = useState(!hasDetails); // open immediately if no details
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Sync form when account prop changes (after save or verify)
  useEffect(() => {
    setBankHolder(account.bank_account_holder  ?? "");
    setBankAccount(account.bank_account_number ?? "");
    setBankIfsc(account.bank_ifsc              ?? "");
  }, [account.bank_account_holder, account.bank_account_number, account.bank_ifsc]);

  // ── Save bank details ─────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!bankHolder.trim() || !bankAccount.trim() || !bankIfsc.trim()) {
      toast.error("All three bank fields are required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await partnerApi.updateBank(token, {
        bank_account_number: bankAccount.trim(),
        bank_ifsc:           bankIfsc.toUpperCase().trim(),
        bank_account_holder: bankHolder.trim(),
      });
      onSaved(updated);
      setIsEditing(false);
      toast.success("Bank details saved. Please verify your account to enable payouts.");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Failed to save bank details.");
    } finally {
      setSaving(false);
    }
  }

  // ── Verify bank account ───────────────────────────────────────────────────

  async function handleVerify() {
    if (verifying) return;
    setVerifying(true);
    try {
      const res = await partnerApi.verifyBank(token);
      if (res.verified) {
        // Reload full account to get bank_account_verified + bank_verified_at
        const fresh = await partnerApi.getAccount(token);
        onVerified(fresh);
        toast.success("Bank account verified successfully! Payouts are now enabled.");
      } else {
        toast.error(res.message ?? "Verification failed. Please check your details and try again.");
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // ── Edit button click ─────────────────────────────────────────────────────

  function handleEditClick() {
    if (hasDetails) {
      setShowModal(true); // always show modal warning when details exist
    } else {
      setIsEditing(true);
    }
  }

  function handleModalConfirm() {
    setShowModal(false);
    setIsEditing(true);
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const badgeStatus = isVerified ? "verified" : "pending";
  const badgeLabel  = isVerified ? "Bank Verified" : hasDetails ? "Verification Pending" : "Bank Details";

  // Mask all but last 4 digits
  const maskedAccount = bankAccount.length > 4
    ? "•".repeat(bankAccount.length - 4) + bankAccount.slice(-4)
    : bankAccount;

  const topBarColor = isVerified
    ? "linear-gradient(90deg, #16a34a, #86efac)"
    : hasDetails
    ? "linear-gradient(90deg, #C9A84C, #E8D5A0)"
    : "#E5E5E5";

  const borderColor = isVerified
    ? "rgba(22,163,74,0.2)"
    : hasDetails
    ? "rgba(201,168,76,0.3)"
    : "#E5E5E5";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {showModal && (
        <EditBankModal
          isVerified={isVerified}
          onConfirm={handleModalConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div style={{ ...card, padding: 0, overflow: "hidden", borderColor }}>
        {/* Coloured top bar */}
        <div style={{ height: 3, background: topBarColor }} />

        <div style={{ padding: "20px 26px 24px" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={sectionTitle}>Bank Details</h2>
              <p style={{ ...sectionSubtitle, marginBottom: 0 }}>
                {isVerified
                  ? "Your bank account is verified. Payouts will be transferred here."
                  : hasDetails
                  ? "Details saved. Verify your account to enable payouts."
                  : "Required for receiving payouts. All fields are mandatory."}
              </p>
            </div>
            <StatusBadge status={badgeStatus as "verified" | "pending"} label={badgeLabel} />
          </div>

          {/* Info note */}
          <div style={{
            padding: "10px 14px", marginBottom: 18,
            background: "rgba(59,130,246,0.04)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 8, fontSize: 12, color: "#1d4ed8", lineHeight: 1.6,
          }}>
            💡 Payouts are processed within 2–3 business days after admin approval.
            TDS (0.1%) is deducted as per government mandate.
          </div>

          {/* ── State B / C: Read-only view ── */}
          {hasDetails && !isEditing && (
            <div>
              {/* Verified date banner (State C only) */}
              {isVerified && verifiedAt && (
                <div style={{
                  padding: "10px 14px", marginBottom: 16,
                  background: "rgba(22,163,74,0.05)",
                  border: "1px solid rgba(22,163,74,0.2)",
                  borderRadius: 8, fontSize: 12, color: "#15803d",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>✓</span>
                  <span>
                    Verified on{" "}
                    {new Date(verifiedAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* Read-only fields */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Account Holder Name</label>
                <input style={inputLocked} value={bankHolder} readOnly tabIndex={-1} />
              </div>
              <div style={row2}>
                <div>
                  <label style={labelStyle}>Account Number</label>
                  <input style={inputLocked} value={maskedAccount} readOnly tabIndex={-1} />
                </div>
                <div>
                  <label style={labelStyle}>IFSC Code</label>
                  <input style={inputLocked} value={bankIfsc} readOnly tabIndex={-1} />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                {/* Verify button — State B only */}
                {!isVerified && (
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    style={{
                      padding: "9px 22px", borderRadius: 9999, border: "none",
                      background: verifying
                        ? "rgba(201,168,76,0.4)"
                        : "linear-gradient(135deg, #C9A84C 0%, #b8943e 100%)",
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: verifying ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      boxShadow: verifying ? "none" : "0 2px 8px rgba(201,168,76,0.3)",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {verifying ? (
                      <>
                        <span style={{
                          width: 14, height: 14, borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          animation: "accSpin 0.7s linear infinite",
                          display: "inline-block", flexShrink: 0,
                        }} />
                        Verifying…
                      </>
                    ) : (
                      "🔐 Verify Bank Account"
                    )}
                  </button>
                )}

                {/* Edit details button — both State B and C */}
                <button
                  onClick={handleEditClick}
                  style={{
                    padding: "9px 16px", borderRadius: 9,
                    border: "1px solid #E5E5E5", background: "#fff",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", color: "#6B7280",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#0C0C0C";
                    (e.currentTarget as HTMLButtonElement).style.color = "#0C0C0C";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
                  }}
                >
                  ✏️ Edit Details
                </button>
              </div>

              {/* Penny-drop helper text — State B only */}
              {!isVerified && (
                <p style={{ marginTop: 12, fontSize: 11, color: "#9B9B9B", lineHeight: 1.6 }}>
                  Click <strong>Verify Bank Account</strong> to confirm your account via a ₹1 penny drop.
                  The amount is returned instantly. Payouts will only be released after verification.
                </p>
              )}
            </div>
          )}

          {/* ── State A / Edit: Editable form ── */}
          {(!hasDetails || isEditing) && (
            <form onSubmit={handleSave}>
              {/* Warning when editing existing details */}
              {hasDetails && isEditing && (
                <div style={{
                  padding: "10px 14px", marginBottom: 16,
                  background: "rgba(220,38,38,0.05)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: 8, fontSize: 12, color: "#dc2626", lineHeight: 1.6,
                }}>
                  ⚠️ Changing your account number or IFSC will reset verification.
                  You must verify again before payouts resume.
                </div>
              )}

              {/* Account Holder Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Account Holder Name <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  style={inputBase}
                  value={bankHolder}
                  onChange={e => setBankHolder(e.target.value)}
                  placeholder="Name exactly as per bank records"
                  required
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
                />
              </div>

              {/* Account Number + IFSC */}
              <div style={row2}>
                <div>
                  <label style={labelStyle}>
                    Account Number <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    style={inputBase}
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="e.g. 1234567890123456"
                    required
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    IFSC Code <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    style={inputBase}
                    value={bankIfsc}
                    onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0014639"
                    maxLength={11}
                    required
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
                  />
                </div>
              </div>

              {/* Save + Cancel (cancel only when editing existing) */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <SaveBtn loading={saving} label="Save Bank Details" />
                {hasDetails && isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset to stored values
                      setBankHolder(account.bank_account_holder  ?? "");
                      setBankAccount(account.bank_account_number ?? "");
                      setBankIfsc(account.bank_ifsc              ?? "");
                    }}
                    style={{
                      marginTop: 18, padding: "9px 18px", borderRadius: 9,
                      border: "1px solid #E5E5E5", background: "#fff",
                      fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      color: "#6B7280", transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#0C0C0C")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E5E5")}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function PartnerAccountPage() {
  const { user, refreshUser, getAccessToken } = useAuth();
  const toast = useInlineToast();
  const token = getAccessToken();

  const [account,  setAccount]  = useState<AccountOut | null>(null);
  const [fetching, setFetching] = useState(true);

  // Section saving states
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingKyc,      setSavingKyc]      = useState(false);

  // Business form state
  const [businessName,    setBusinessName]    = useState("");
  const [businessEmail,   setBusinessEmail]   = useState("");
  const [businessPhone,   setBusinessPhone]   = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  // KYC form state
  const [pan,   setPan]   = useState("");
  const [gstin, setGstin] = useState("");

  // ── Load account on mount ──────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;
    setFetching(true);

    partnerApi.getAccount(token)
      .then(data => {
        setAccount(data);
        setBusinessName(data.business_name     ?? "");
        setBusinessEmail(data.business_email   ?? "");
        setBusinessPhone(data.business_phone   ?? "");
        setBusinessAddress(data.business_address ?? "");
        setPan(data.pan    ?? "");
        setGstin(data.gstin ?? "");
      })
      .catch(() => toast.error("Failed to load account details. Please refresh."))
      .finally(() => setFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Save Business Info ─────────────────────────────────────────────────────

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingBusiness(true);
    try {
      const updated = await partnerApi.updateBusiness(token, {
        business_name:    businessName    || undefined,
        business_email:   businessEmail   || undefined,
        business_phone:   businessPhone   || undefined,
        business_address: businessAddress || undefined,
      });
      setAccount(updated);
      toast.success("Business information saved.");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Failed to save business info.");
    } finally {
      setSavingBusiness(false);
    }
  }

  // ── Save KYC ──────────────────────────────────────────────────────────────

  async function handleSaveKyc(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!pan.trim()) { toast.error("PAN number is required."); return; }

    setSavingKyc(true);
    try {
      const updated = await partnerApi.updateKyc(token, {
        pan:   pan.toUpperCase().trim(),
        gstin: gstin.toUpperCase().trim() || undefined,
      });
      setAccount(updated);
      // Refresh auth context so KYC badge in sidebar updates immediately
      await refreshUser().catch(() => {});
      toast.success("KYC verified! You can now submit properties for review.");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Failed to save KYC details.");
    } finally {
      setSavingKyc(false);
    }
  }

  // ── Loading spinner ────────────────────────────────────────────────────────

  if (fetching || !account) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "3px solid #E5E5E5", borderTopColor: "#C9A84C",
          animation: "accSpin 0.7s linear infinite",
        }} />
        <style dangerouslySetInnerHTML={{ __html: `@keyframes accSpin { to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  const kycDone      = account.has_kyc;
  const bankDone     = account.has_bank_details;
  const bankVerified = account.bank_account_verified;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {toast.el}

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "inherit", fontSize: 22,
          fontWeight: 700, color: "#0C0C0C", marginBottom: 4,
        }}>
          Account
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280" }}>
          Manage your business details, KYC documents, and bank account for payouts.
        </p>

        {/* Completion summary badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <StatusBadge status="done" label="Business Info" />
          <StatusBadge
            status={kycDone ? "verified" : "pending"}
            label="KYC"
          />
          <StatusBadge
            status={bankVerified ? "verified" : "pending"}
            label={bankVerified ? "Bank Verified" : bankDone ? "Bank — Verify Needed" : "Bank Details"}
          />
        </div>
      </div>

      {/* ── Section 1: Business Info ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={sectionTitle}>Business Information</h2>
            <p style={sectionSubtitle}>Your hotel or property management company details.</p>
          </div>
          <StatusBadge status="done" label="Business Info" />
        </div>

        <form onSubmit={handleSaveBusiness}>
          <div style={row2}>
            <div>
              <label style={labelStyle}>Business Name</label>
              <input
                style={inputBase} value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Sunrise Hotels Pvt Ltd"
                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
              />
            </div>
            <div>
              <label style={labelStyle}>Business Email</label>
              <input
                style={inputBase} type="email" value={businessEmail}
                onChange={e => setBusinessEmail(e.target.value)}
                placeholder="business@example.com"
                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
              />
            </div>
          </div>
          <div style={{ ...row2, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Business Phone</label>
              <input
                style={inputBase} value={businessPhone}
                onChange={e => setBusinessPhone(e.target.value)}
                placeholder="+91 9876543210"
                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
              />
            </div>
            <div>
              <label style={labelStyle}>Business Address</label>
              <input
                style={inputBase} value={businessAddress}
                onChange={e => setBusinessAddress(e.target.value)}
                placeholder="Full registered address"
                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
              />
            </div>
          </div>
          <SaveBtn loading={savingBusiness} />
        </form>
      </div>

      {/* ── Section 2: KYC Documents ── */}
      <div style={{
        ...card,
        padding: 0, overflow: "hidden",
        borderColor: kycDone ? "rgba(22,163,74,0.2)" : "rgba(201,168,76,0.3)",
      }}>
        <div style={{
          height: 3,
          background: kycDone
            ? "linear-gradient(90deg, #16a34a, #86efac)"
            : "linear-gradient(90deg, #C9A84C, #E8D5A0)",
        }} />

        <div style={{ padding: "20px 26px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={sectionTitle}>KYC Documents</h2>
              <p style={{ ...sectionSubtitle, marginBottom: 0 }}>
                {kycDone
                  ? "Your KYC is verified. You can update GSTIN if needed."
                  : "Submit your PAN to verify your business. Verification is instant."}
              </p>
            </div>
            <StatusBadge status={kycDone ? "verified" : "pending"} label="KYC" />
          </div>

          <form onSubmit={handleSaveKyc}>
            <div style={row2}>
              <div>
                <label style={labelStyle}>
                  PAN Number <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  style={kycDone ? inputLocked : inputBase}
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  readOnly={kycDone}
                  tabIndex={kycDone ? -1 : undefined}
                  onFocus={e  => { if (!kycDone) e.target.style.borderColor = "#C9A84C"; }}
                  onBlur={e   => (e.target.style.borderColor = "#E5E5E5")}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  GSTIN{" "}
                  <span style={{ color: "#9B9B9B", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  style={inputBase}
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e  => (e.target.style.borderColor = "#E5E5E5")}
                />
              </div>
            </div>
            {!kycDone && (
              <p style={{ marginTop: 10, fontSize: 11, color: "#9B9B9B", lineHeight: 1.6 }}>
                Verification is instant. Once complete, you can submit properties for review.
              </p>
            )}
            <SaveBtn
              loading={savingKyc}
              label={kycDone ? "Update GSTIN" : "Verify & Save KYC"}
            />
          </form>
        </div>
      </div>

      {/* ── Section 3: Bank Details (3-state) ── */}
      {token && (
        <BankSection
          account={account}
          token={token}
          toast={toast}
          onSaved={updated   => setAccount(updated)}
          onVerified={updated => setAccount(updated)}
        />
      )}

      {/* Global animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes accSpin   { to { transform: rotate(360deg); } }
        @keyframes accFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 600px) {
          .acc-row2 { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </div>
  );
}