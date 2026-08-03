"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuthOptional } from "@/contexts/auth-context";
import { usePartnerPortal } from "@/components/cabs/partner/PartnerPortalProvider";
import {
  getPartnerBank,
  updatePartnerBank,
  type PartnerBankDetails,
} from "@/lib/cab-partner-api";

export default function PartnerSettingsPage() {
  const { application } = usePartnerPortal();
  const auth = useAuthOptional();
  const name = application.business_name || application.owner_name;

  const [bank, setBank] = useState<PartnerBankDetails | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holder, setHolder] = useState("");
  const [loadingBank, setLoadingBank] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = auth?.getAccessToken();
    if (!token) return;
    let cancelled = false;
    setLoadingBank(true);
    getPartnerBank(token)
      .then((data) => {
        if (cancelled) return;
        setBank(data);
        setIfsc(data.bank_ifsc || "");
        setHolder(data.bank_account_holder || "");
        setAccountNumber("");
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load bank details.");
      })
      .finally(() => {
        if (!cancelled) setLoadingBank(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  async function onSaveBank(event: FormEvent) {
    event.preventDefault();
    const token = auth?.getAccessToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updatePartnerBank(token, {
        bank_account_number: accountNumber.trim(),
        bank_ifsc: ifsc.trim().toUpperCase(),
        bank_account_holder: holder.trim(),
      });
      setBank(updated);
      setAccountNumber("");
      setSuccess("Bank details saved. Account number is stored securely.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save bank details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Account profile and settlement bank details.</p>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Account</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-slate-400">Business / Name</dt>
            <dd className="mt-1 text-sm font-bold">{name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400">Type</dt>
            <dd className="mt-1 text-sm font-bold capitalize">{application.registration_type}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400">Phone</dt>
            <dd className="mt-1 text-sm font-bold">{application.primary_phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400">Email</dt>
            <dd className="mt-1 text-sm font-bold">{application.email || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold text-slate-400">Location</dt>
            <dd className="mt-1 text-sm font-bold">
              {application.city}, {application.state}
              {application.pincode ? ` · ${application.pincode}` : ""}
            </dd>
          </div>
        </dl>
        <Link
          href="/cabs/list-your-cab"
          className="mt-5 inline-flex rounded-lg border border-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-[#ef6614]"
        >
          View application profile
        </Link>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">Bank account</h3>
            <p className="mt-1 text-xs text-slate-500">
              Used for settling completed trip payouts. Account number is encrypted at rest.
            </p>
          </div>
          {bank?.has_bank_details && (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                bank.bank_account_verified
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {bank.bank_account_verified ? "Verified" : "Saved · pending verify"}
            </span>
          )}
        </div>

        {loadingBank ? (
          <div className="mt-6 grid place-items-center py-6">
            <span className="h-6 w-6 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
          </div>
        ) : (
          <form onSubmit={onSaveBank} className="mt-5 space-y-3">
            {bank?.has_bank_details && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                On file: {bank.bank_account_holder} · {bank.bank_ifsc} · {bank.bank_account_number}
              </p>
            )}
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">Account holder</span>
              <input
                required
                minLength={2}
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">IFSC</span>
              <input
                required
                minLength={11}
                maxLength={11}
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="HDFC0001234"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold uppercase outline-none focus:border-[#ef6614]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                Account number {bank?.has_bank_details ? "(re-enter to update)" : ""}
              </span>
              <input
                required
                minLength={9}
                maxLength={18}
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder={bank?.bank_account_number || "Enter account number"}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#ef6614]"
              />
            </label>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            {success && <p className="text-xs font-semibold text-emerald-600">{success}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#ef6614] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save bank details"}
            </button>
          </form>
        )}
      </article>

      <p className="text-xs text-slate-400">
        Automated Razorpay X transfers will use these details once bank verification is enabled.
      </p>
    </section>
  );
}
