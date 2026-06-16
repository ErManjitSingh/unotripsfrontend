"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthErrorMessage, useAuth } from "@/contexts/auth-context";
import { navigateAfterAuth } from "@/lib/auth-navigation";
import { cn } from "@/lib/utils";

type EmailLoginFormProps = {
  redirectTo?: string;
  /** When provided, called instead of navigateAfterAuth — prevents full page reload inside modals. */
  onAuthComplete?: () => void;
};

export function EmailLoginForm({ redirectTo = "/account", onAuthComplete }: EmailLoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[#424242]">
          Email
        </label>
        <Input
          id="login-email"
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
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[#424242]">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border-[#e0e0e0]"
          disabled={loading}
        />
      </div>
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-11 w-full rounded-md bg-[#2196F3] text-sm font-bold uppercase tracking-wide text-white hover:bg-[#1976D2]",
        )}
      >
        {loading ? "Signing in…" : "Login"}
      </Button>
      <p className="text-center text-[12px] text-[#757575]">
        New here?{" "}
        <Link
          href={`/signup${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-semibold text-[#2196F3] hover:underline"
        >
          Create guest account
        </Link>
      </p>
    </form>
  );
}