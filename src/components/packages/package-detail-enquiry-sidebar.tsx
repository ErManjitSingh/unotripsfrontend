"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickEnquiryTrigger, WhatsAppEnquiryLink } from "@/components/enquiry/quick-enquiry";
import { siteTelHref } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

export type PackageDetailEnquirySidebarProps = {
  tourTitle: string;
  tourSku?: string;
  className?: string;
};

const PERSON_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 1);

/** Sidebar enquiry next to package hero — package title prefilled from the tour. */
export function PackageDetailEnquirySidebar({
  tourTitle,
  tourSku,
  className,
}: PackageDetailEnquirySidebarProps) {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2400);
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_40px_-16px_rgba(15,23,42,0.14)]",
        className,
      )}
    >
      <div className="shrink-0 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="font-display text-base font-bold text-slate-900">Quick enquiry</p>
        <p className="mt-0.5 text-xs text-slate-600">Share your details — we&apos;ll reach out with availability and pricing.</p>
      </div>

      <form className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-5" onSubmit={onSubmit}>
        <input type="hidden" name="package_title" defaultValue={tourTitle} />

        <Input
          id="pkg-enquiry-package"
          readOnly
          defaultValue={tourTitle}
          aria-label="Package"
          placeholder="Package"
          className="h-10 cursor-default border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400"
          tabIndex={-1}
        />

        <Input
          id="pkg-enquiry-name"
          name="name"
          required
          autoComplete="name"
          aria-label="Full name"
          placeholder="Full name"
          className="h-10 border-slate-200 text-sm"
        />

        <Input
          id="pkg-enquiry-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-label="Email"
          placeholder="Email"
          className="h-10 border-slate-200 text-sm"
        />

        <select
          id="pkg-enquiry-persons"
          name="persons"
          required
          defaultValue={2}
          aria-label="Number of travellers"
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <option value="" disabled hidden>
            Travellers
          </option>
          {PERSON_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "person" : "persons"}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          className="h-11 w-full gap-2 rounded-lg border-0 bg-[#FACC15] text-sm font-bold text-slate-900 shadow-sm hover:bg-[#EAB308]"
        >
          <Send className="h-4 w-4 shrink-0" aria-hidden />
          {sent ? "Thanks — we’ll be in touch" : "Submit enquiry"}
        </Button>

        {sent ? (
          <p className="text-center text-[11px] text-emerald-700" role="status">
            Thank you — we&apos;ll be in touch shortly.
          </p>
        ) : null}

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={siteTelHref()}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Call now
            </a>
            <WhatsAppEnquiryLink
              tourTitle={tourTitle}
              tourSku={tourSku}
              label="WhatsApp"
              variant="button"
              className="h-10 rounded-lg text-xs"
            />
          </div>
          <QuickEnquiryTrigger
            tourTitle={tourTitle}
            tourSku={tourSku}
            label="Detailed enquiry form"
            variant="link"
            icon={false}
            className="w-full justify-center text-[11px] text-slate-600 hover:text-primary"
          />
        </div>
      </form>
    </div>
  );
}
