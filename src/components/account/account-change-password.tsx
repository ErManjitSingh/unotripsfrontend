"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth-context";
import { changeAccountPassword } from "@/lib/hotels-account-api";

export function AccountChangePassword() {
  const { getAccessToken } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }
    setLoading(true);
    try {
      const res = await changeAccountPassword(token, {
        current_password: current,
        new_password: next,
      });
      setSuccess(res.message ?? "Password updated successfully.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-[#eee] bg-[#fafafa] p-5">
      <div>
        <h3 className="text-base font-bold text-[#212121]">Change password</h3>
        <p className="mt-1 text-[13px] text-[#757575]">Update your account password (API: Account → Change Password)</p>
      </div>
      <div>
        <label htmlFor="acct-current-pw" className="mb-1.5 block text-sm font-semibold text-[#424242]">Current password</label>
        <Input id="acct-current-pw" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required disabled={loading} className="h-11 rounded-xl" />
      </div>
      <div>
        <label htmlFor="acct-new-pw" className="mb-1.5 block text-sm font-semibold text-[#424242]">New password</label>
        <Input id="acct-new-pw" type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required disabled={loading} className="h-11 rounded-xl" />
      </div>
      <div>
        <label htmlFor="acct-confirm-pw" className="mb-1.5 block text-sm font-semibold text-[#424242]">Confirm new password</label>
        <Input id="acct-confirm-pw" type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required disabled={loading} className="h-11 rounded-xl" />
      </div>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p> : null}
      {success ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">{success}</p> : null}
      <Button type="submit" disabled={loading} className="h-11 rounded-xl bg-[#2196F3] font-bold hover:bg-[#1976D2]">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Update password"}
      </Button>
    </form>
  );
}
