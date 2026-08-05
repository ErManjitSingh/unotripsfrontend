"use client";

import { Headphones } from "lucide-react";

export default function PartnerSupportPage() {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <Headphones className="mx-auto h-10 w-10 text-[#ef6614]" />
      <h2 className="mt-4 text-2xl font-black tracking-tight">Need help?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Message us for onboarding, trip requests, or account help. We usually reply within a few hours.
      </p>
      <div className="mt-6 space-y-3 text-sm">
        <a
          href="mailto:partners@unocabs.com"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ef6614] px-5 text-sm font-extrabold text-white"
        >
          Email partners@unocabs.com
        </a>
        <p className="text-[12px] text-slate-500">
          Prefer WhatsApp later? Ask support and we’ll share the partner number.
        </p>
      </div>
    </section>
  );
}
