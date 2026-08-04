"use client";

import { useState } from "react";
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
          placeholder="you@example.com"
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
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border-[#e0e0e0]"
          disabled={loading}
        />
      </div>
      {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-11 w-full rounded-xl border-0 bg-[#EF6614] bg-none text-sm font-bold text-white shadow-[0_12px_24px_-12px_rgba(239,102,20,0.9)] hover:bg-[#E65100] hover:brightness-100",
        )}
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
