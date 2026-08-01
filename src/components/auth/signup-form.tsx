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
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
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
      <p className="text-[12px] leading-snug text-[#7a7178]">
        Book hotels, holidays, and cab quotes with one account.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-name" className="mb-1 block text-[12px] font-semibold text-[#403842]">
            Full name
          </label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-xl border-[#e4dbd5]"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-1 block text-[12px] font-semibold text-[#403842]">
            Email
          </label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 rounded-xl border-[#e4dbd5]"
            disabled={loading}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="signup-phone" className="mb-1 block text-[12px] font-semibold text-[#403842]">
            Mobile
          </label>
          <div className="flex gap-2">
            <span className="flex h-10 items-center rounded-xl border border-[#e4dbd5] bg-[#faf7f5] px-3 text-sm font-semibold text-[#616161]">
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
              className="h-10 rounded-xl border-[#e4dbd5]"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-1 block text-[12px] font-semibold text-[#403842]">
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-xl border-[#e4dbd5]"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="signup-confirm" className="mb-1 block text-[12px] font-semibold text-[#403842]">
            Confirm password
          </label>
          <Input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-10 rounded-xl border-[#e4dbd5]"
            disabled={loading}
          />
        </div>
      </div>

      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-10 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(239,102,20,0.9)] hover:bg-[#E65100] hover:brightness-100",
        )}
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-[12px] text-[#757575]">
        Already have an account?{" "}
        <Link
          href={`/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-bold text-[#ef6614] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
