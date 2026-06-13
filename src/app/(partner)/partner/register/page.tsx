"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { SITE } from "@/lib/constants";
import Image from "next/image";

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20";

export default function PartnerRegisterPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const returnTo     = searchParams.get("return") ?? "/partner/dashboard";
  const { login, register } = useAuth();

  const [mode,    setMode]    = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Register form
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });

  async function handleRegister() {
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!form.name || !form.email || !form.phone || !form.password) { setError("All fields are required."); return; }
    setLoading(true); setError("");
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      router.push(returnTo);
    } catch (e: any) { setError(e.message ?? "Registration failed."); }
    finally { setLoading(false); }
  }

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) { setError("Email and password are required."); return; }
    setLoading(true); setError("");
    try {
      await login(loginForm.email, loginForm.password);
      router.push(returnTo);
    } catch (e: any) { setError(e.message ?? "Login failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="relative h-10 w-32">
            <Image src={SITE.logoUrl} alt="UNO Trips" fill className="object-contain" sizes="128px" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-slate-900">Partner Portal</h1>
          </div>
          <p className="text-center text-sm text-slate-500">
            List your property on UNO Trips and reach thousands of travellers.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(["register", "login"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {m === "register" ? "Sign Up" : "Login"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {mode === "register" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
                <input className={inputCls} placeholder="Ramesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                <input className={inputCls} type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</label>
                <input className={inputCls} type="tel" placeholder="9800000000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
                <input className={inputCls} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Confirm Password</label>
                <input className={inputCls} type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              <Button onClick={handleRegister} disabled={loading} className="w-full gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Partner Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                <input className={inputCls} type="email" placeholder="you@email.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
                <input className={inputCls} type="password" placeholder="Your password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              <Button onClick={handleLogin} disabled={loading} className="w-full gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Login to Partner Portal
              </Button>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-slate-500">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-primary hover:underline">← Back to UNO Trips</Link>
        </p>
      </div>
    </div>
  );
}