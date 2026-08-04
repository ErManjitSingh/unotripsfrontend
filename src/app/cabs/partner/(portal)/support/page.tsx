"use client";

import { Headphones } from "lucide-react";

export default function PartnerSupportPage() {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <Headphones className="mx-auto h-10 w-10 text-[#ef6614]" />
      <h2 className="mt-4 text-2xl font-black tracking-tight">Partner support</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Our team is available 24×7 for onboarding, quotes, and account help.
      </p>
      <div className="mt-6 space-y-2 text-sm">
        <p>
          <a href="mailto:partners@unocabs.com" className="font-extrabold text-[#ef6614]">
            partners@unocabs.com
          </a>
        </p>
        <p>
          <a href="tel:+919876543210" className="font-extrabold text-slate-700">
            +91 98765 43210
          </a>
        </p>
      </div>
    </section>
  );
}
