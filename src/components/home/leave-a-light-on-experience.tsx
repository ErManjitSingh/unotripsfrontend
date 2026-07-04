"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useAnimation, useReducedMotion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function LeaveALightOnExperience() {
  const reduceMotion = useReducedMotion();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const shakeControls = useAnimation();

  async function triggerShake() {
    if (reduceMotion) {
      await shakeControls.start({ opacity: [1, 0.5, 1], transition: { duration: 0.3 } });
      return;
    }
    await shakeControls.start({
      x: [0, -6, 6, -4, 4, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!emailRef.current?.checkValidity()) {
      emailRef.current?.reportValidity();
      void triggerShake();
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
        Before you go
      </p>

      <h2 className="mx-auto mt-3 max-w-[18ch] font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        We&rsquo;ll tell you when it&rsquo;s the right time to go.
      </h2>

      <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-slate-600 sm:text-base">
        Fare drops, new stays, and the exact week a destination is at its
        best — straight to your inbox, nothing else.
      </p>

      <div className="mx-auto mt-8 max-w-[440px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeIn" }}
              className="flex flex-col items-stretch gap-3 sm:flex-row"
            >
              <motion.div
                animate={shakeControls}
                className="relative flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <Mail className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden />
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Your email address"
                  className="h-12 w-full min-w-0 bg-transparent pl-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </motion.div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                Notify Me
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: EASE_OUT }}
              role="status"
              aria-live="polite"
              className={cn(
                "flex items-center justify-center gap-2.5 rounded-xl border px-5 py-3.5 text-sm font-medium",
                "border-primary/20 bg-primary/5 text-ink",
              )}
            >
              <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
              You&rsquo;re on the list. We&rsquo;ll write when it&rsquo;s time.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
