"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth-context";
import { navigateAfterAuth } from "@/lib/auth-navigation";
import { cn } from "@/lib/utils";

type SignupFormProps = {
  redirectTo?: string;
  /** When provided, pre-fills name/email/phone from the booking form. */
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  /** When provided, called instead of navigateAfterAuth — prevents full page reload inside modals. */
  onAuthComplete?: () => void;
};

export function SignupForm({
  redirectTo = "/account",
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  onAuthComplete,
}: SignupFormProps) {
  const { register } = useAuth();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "").slice(-10);
    if (phoneDigits.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phoneDigits,
      });
      if (onAuthComplete) {
        onAuthComplete();
      } else {
        navigateAfterAuth(redirectTo);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="rounded-md bg-[#FFF3E0] px-3 py-1.5 text-[11px] leading-relaxed text-[#E65100]">
        Your account will be created as a <strong>Guest</strong> — book hotels and manage trips easily.
      </p>

      <div>
        <label htmlFor="signup-name" className="mb-1 block text-[13px] font-medium text-[#424242]">
          Full name
        </label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border-[#e0e0e0]"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1 block text-[13px] font-medium text-[#424242]">
          Email
        </label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border-[#e0e0e0]"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="signup-phone" className="mb-1 block text-[13px] font-medium text-[#424242]">
          Mobile
        </label>
        <div className="flex gap-2">
          <span className="flex h-10 items-center rounded-xl border border-slate-200/80 bg-slate-50 px-3 text-sm text-[#616161]">
            +91
          </span>
          <Input
            id="signup-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit number"
            maxLength={10}
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="rounded-lg border-[#e0e0e0]"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="signup-password" className="mb-1 block text-[13px] font-medium text-[#424242]">
          Password
        </label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border-[#e0e0e0]"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="signup-confirm" className="mb-1 block text-[13px] font-medium text-[#424242]">
          Confirm password
        </label>
        <Input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-lg border-[#e0e0e0]"
          disabled={loading}
        />
      </div>

      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-10 w-full rounded-md bg-[#EF6614] text-sm font-bold uppercase tracking-wide text-white hover:bg-[#E65100]",
        )}
      >
        {loading ? "Connecting… first signup may take up to 60 sec" : "Sign up as Guest"}
      </Button>

      <p className="text-center text-[12px] text-[#757575]">
        Already have an account?{" "}
        <Link
          href={`/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-semibold text-[#2196F3] hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}