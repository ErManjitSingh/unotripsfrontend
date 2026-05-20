"use client";

import {
  type FormEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/constants";
import { packageWhatsAppPrefill, siteTelHref, siteWhatsAppChatUrl } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

export type QuickEnquiryPayload = {
  tourTitle?: string;
  /** Short code line for description, e.g. ASJW- Tour name */
  sku?: string;
};

type QuickEnquiryContextValue = {
  open: (payload?: QuickEnquiryPayload) => void;
  close: () => void;
};

const QuickEnquiryContext = createContext<QuickEnquiryContextValue | null>(null);

export function useQuickEnquiry(): QuickEnquiryContextValue {
  const ctx = useContext(QuickEnquiryContext);
  if (!ctx) {
    throw new Error("useQuickEnquiry must be used within QuickEnquiryProvider");
  }
  return ctx;
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function defaultDescription(payload: QuickEnquiryPayload): string {
  const sku = (payload.sku ?? "").trim();
  const title = (payload.tourTitle ?? "").trim();
  if (sku && title) return `${sku.toUpperCase()} — ${title}`;
  if (title) return title;
  return "";
}

function QuickEnquiryDrawerPanel({
  open,
  onClose,
  payload,
}: {
  open: boolean;
  onClose: () => void;
  payload: QuickEnquiryPayload;
}) {
  const mounted = useMounted();
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);

  useEffect(() => {
    if (open) {
      setDescription(defaultDescription(payload));
    }
  }, [open, payload]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            key="qe-backdrop"
            aria-label="Close enquiry"
            className="fixed inset-0 z-[220] bg-slate-900/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
          <motion.aside
            key="qe-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-enquiry-title"
            className="fixed right-0 top-0 z-[230] flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-[-12px_0_48px_-12px_rgba(15,23,42,0.35)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2
                id="quick-enquiry-title"
                className="font-display text-sm font-bold uppercase tracking-[0.12em] text-slate-900 sm:text-base"
              >
                Quick enquiry
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="qe-name">
                    Full name<span className="text-primary">*</span>
                  </label>
                  <Input
                    id="qe-name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-11 rounded-lg border-slate-200"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="qe-mobile">
                    Mobile no.<span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex h-11 shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700">
                      🇮🇳 +91
                    </span>
                    <Input
                      id="qe-mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      className="h-11 min-w-0 flex-1 rounded-lg border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="qe-email">
                    Email ID<span className="text-primary">*</span>
                  </label>
                  <Input
                    id="qe-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-lg border-slate-200"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700" htmlFor="qe-desc">
                    Drop us a small description
                  </label>
                  <textarea
                    id="qe-desc"
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/30"
                    placeholder="Tell us dates, travellers, budget…"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-primary/30"
                  />
                  <span>Receive itinerary on</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </span>
                </label>
                <details className="group rounded-lg border border-slate-200 bg-slate-50/80">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                    Additional details
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-200 px-3 py-3">
                    <label className="mb-1 block text-xs text-slate-600" htmlFor="qe-city">
                      Departure city (optional)
                    </label>
                    <Input id="qe-city" name="city" placeholder="e.g. Delhi" className="h-10 rounded-lg border-slate-200" />
                  </div>
                </details>
              </div>

              <div className="mt-auto shrink-0 border-t border-slate-100 pt-5">
                <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold">
                  <a href={siteTelHref()} className="text-primary hover:underline">
                    Call {SITE.phone}
                  </a>
                  <a
                    href={siteWhatsAppChatUrl(
                      description.trim() || packageWhatsAppPrefill(payload.tourTitle ?? "", payload.sku),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full rounded-lg border-0 bg-accent text-sm font-bold text-slate-900 shadow-md hover:bg-accent/90"
                >
                  Submit enquiry
                </Button>
              </div>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function QuickEnquiryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<QuickEnquiryPayload>({});

  const openDrawer = useCallback((p?: QuickEnquiryPayload) => {
    setPayload(p ?? {});
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      open: openDrawer,
      close: closeDrawer,
    }),
    [openDrawer, closeDrawer],
  );

  return (
    <QuickEnquiryContext.Provider value={value}>
      {children}
      <QuickEnquiryDrawerPanel open={open} onClose={closeDrawer} payload={payload} />
    </QuickEnquiryContext.Provider>
  );
}

export type QuickEnquiryTriggerProps = {
  tourTitle: string;
  tourSku?: string;
  label?: string;
  className?: string;
  icon?: boolean;
  variant?: "link" | "button";
};

/** Opens the quick enquiry drawer (must be under `QuickEnquiryProvider`). */
export function QuickEnquiryTrigger({
  tourTitle,
  tourSku,
  label = "Enquire now",
  className,
  icon = true,
  variant = "link",
}: QuickEnquiryTriggerProps) {
  const { open } = useQuickEnquiry();
  return (
    <button
      type="button"
      onClick={() => open({ tourTitle, sku: tourSku })}
      className={cn(
        variant === "button" &&
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border-0 bg-primary px-4 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 hover:no-underline",
        variant === "link" &&
          "inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline sm:text-xs",
        className,
      )}
    >
      {icon ? <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden /> : null}
      {label}
    </button>
  );
}

export type FloatingEnquireButtonProps = {
  tourTitle: string;
  tourSku?: string;
  label?: string;
  className?: string;
};

/** Fixed bottom-right CTA — opens the enquiry drawer. */
export function FloatingEnquireButton({
  tourTitle,
  tourSku,
  label = "Enquire Now",
  className,
}: FloatingEnquireButtonProps) {
  const { open } = useQuickEnquiry();

  return (
    <button
      type="button"
      onClick={() => open({ tourTitle, sku: tourSku })}
      className={cn(
        "fixed bottom-6 right-4 z-[200] inline-flex items-center gap-2 rounded-full border border-white/20 bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_8px_28px_-4px_rgba(234,88,12,0.55)] transition hover:bg-primary/90 sm:right-6",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}

export type WhatsAppEnquiryLinkProps = {
  tourTitle: string;
  tourSku?: string;
  label?: string;
  className?: string;
  icon?: boolean;
  variant?: "link" | "button";
};

/** Opens WhatsApp chat with this tour prefilled (`wa.me` uses `SITE.whatsappPhoneDigits`). */
export function WhatsAppEnquiryLink({
  tourTitle,
  tourSku,
  label = "Chat on WhatsApp",
  className,
  icon = true,
  variant = "link",
}: WhatsAppEnquiryLinkProps) {
  const href = siteWhatsAppChatUrl(packageWhatsAppPrefill(tourTitle, tourSku));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        variant === "button" &&
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border-0 bg-primary px-4 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 hover:no-underline",
        variant === "link" &&
          "inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline sm:text-xs",
        className,
      )}
    >
      {icon ? <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden /> : null}
      {label}
    </a>
  );
}
