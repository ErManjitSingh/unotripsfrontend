"use client";

import { ArrowRight, Mail } from "lucide-react";

export function NewsletterForm() {
  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="relative flex-1">
        <Mail
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="email"
          required
          name="email"
          placeholder="you@example.com"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
      >
        Subscribe
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
