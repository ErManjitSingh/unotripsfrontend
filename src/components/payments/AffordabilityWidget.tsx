"use client";

/**
 * src/components/payments/AffordabilityWidget.tsx
 *
 * Reusable Razorpay Affordability Widget — shows the customer which EMI plans,
 * Pay Later options and cardless-EMI providers they qualify for, BEFORE they
 * open checkout.
 *
 * DISPLAY-ONLY. This component never creates a Razorpay order, never calls our
 * backend, and never touches booking state. The existing checkout flow
 * (razorpay-checkout.ts → POST /{slug}/book → /verify-payment → webhooks) is
 * completely untouched.
 *
 * ── THE ONE RULE ───────────────────────────────────────────────────────────
 * `amountInr` MUST be the exact rupee amount Razorpay Checkout will charge:
 *
 *   payment_type === "full"   → grand_total   (GST-inclusive)
 *   payment_type === "token"  → token_amount  (grand_total × chosen advance %)
 *
 * both read from POST /v1/packages/{slug}/fulfillment-price. If the widget
 * advertises EMI on ₹17,426 and checkout charges ₹6,970, every plan shown is
 * wrong. See src/lib/razorpay-affordability.ts for the full contract.
 *
 * ── RE-RENDER SEMANTICS ────────────────────────────────────────────────────
 * The widget is torn down and re-created whenever the payable amount changes.
 * (The SDK does expose setAmount(), but a full re-render is the path the
 * bundle itself documents through render()'s option merge, and it keeps the
 * container's contents deterministic.) Because every price input (travel date,
 * hotel, rooms, activities, add-ons, payment type, token percentage) resolves
 * into a single `amountInr` prop, one effect keyed on the paise value covers
 * all of them. A `generation` counter discards any init whose script load
 * resolved after a newer amount arrived, so the last amount always wins.
 */

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { CreditCard } from "lucide-react";

import { cn } from "@/lib/utils";
import { getRazorpayKeyId } from "@/lib/razorpay-checkout";
import {
  RAZORPAY_AFFORDABILITY_DEFAULT_TARGET_ID,
  RAZORPAY_AFFORDABILITY_SCRIPT_ID,
  RAZORPAY_AFFORDABILITY_SRC,
  isAffordabilitySdkReady,
  toPaise,
  type RazorpayAffordabilityConfig,
  type RazorpayAffordabilityInstance,
  type RazorpayAffordabilityOptions,
} from "@/lib/razorpay-affordability";

export type AffordabilityWidgetProps = {
  /**
   * The exact amount Razorpay Checkout will charge, in RUPEES.
   * Pass grand_total for full payment, token_amount for token payment.
   */
  amountInr: number;
  /**
   * Set false while the quote is loading, stale, or incomplete
   * (is_complete === false). The widget unmounts rather than advertising EMI
   * on an estimate. Defaults to true.
   */
  enabled?: boolean;
  /** Razorpay public key id. Defaults to NEXT_PUBLIC_RAZORPAY_KEY_ID. */
  keyId?: string;
  /**
   * Optional SDK presentation overrides. Compared by value, so an inline
   * object literal is safe and will not cause a re-init on every render.
   */
  config?: RazorpayAffordabilityConfig;
  /** Wrapper classes. */
  className?: string;
  /**
   * Reserve vertical space while the SDK loads so the surrounding form does
   * not jump. Set 0 to disable. Defaults to 72px.
   */
  minHeight?: number;
  /**
   * Heading rendered ABOVE the widget. Supplying it switches the component to
   * the framed "payment plan" panel; omitting it renders the bare widget.
   *
   * Everything inside the widget itself — the monthly figure, "View plans",
   * the provider logos, "Secured by Razorpay" — is painted by Razorpay inside
   * a cross-origin iframe and cannot be restyled or relabelled from here. The
   * frame is chrome around that iframe, nothing more.
   */
  title?: string;
  /** Supporting line under `title`. Only rendered when `title` is set. */
  subtitle?: string;
  /** Reported for logging. The widget always fails silently in the UI. */
  onError?: (error: Error) => void;
};

type SdkState = "loading" | "ready" | "failed";

export default function AffordabilityWidget({
  amountInr,
  enabled = true,
  keyId,
  config,
  className,
  minHeight = 72,
  title,
  subtitle,
  onError,
}: AffordabilityWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<RazorpayAffordabilityInstance | null>(null);
  const generationRef = useRef(0);
  const onErrorRef = useRef(onError);
  const configRef = useRef(config);

  // Keep the latest callback/config without making them effect dependencies —
  // a parent passing an inline arrow or object literal would otherwise re-init
  // the widget on every render. `configKey` below drives the actual re-init.
  useEffect(() => {
    onErrorRef.current = onError;
    configRef.current = config;
  }, [onError, config]);

  const configKey = config ? JSON.stringify(config) : "";

  const [sdkState, setSdkState] = useState<SdkState>(() =>
    isAffordabilitySdkReady() ? "ready" : "loading",
  );

  const resolvedKey = (keyId ?? getRazorpayKeyId()).trim();
  const amountPaise = toPaise(amountInr);

  // ─── TEMPORARY DEBUG (remove after diagnosis) ───────────────────────────
  const AW = "[AFFORDABILITY-DEBUG]";
  // eslint-disable-next-line no-console
  console.log(AW, "1. preconditions", {
    enabled,
    amountInr,
    amountPaise,
    resolvedKey,
    keyLength: resolvedKey.length,
  });
  // ─── END TEMPORARY DEBUG ────────────────────────────────────────────────

  // Every precondition for rendering, evaluated in one place.
  const shouldRender = enabled && amountPaise > 0 && resolvedKey.length > 0;

  // ─── TEMPORARY DEBUG (remove after diagnosis) ───────────────────────────
  // eslint-disable-next-line no-console
  console.log(AW, "2. shouldRender", { shouldRender });
  // eslint-disable-next-line no-console
  console.log(AW, "3. AffordabilityWidget mounted");
  // eslint-disable-next-line no-console
  console.log(AW, "6. script src", RAZORPAY_AFFORDABILITY_SRC);
  // ─── END TEMPORARY DEBUG ────────────────────────────────────────────────

  useEffect(() => {
    // ─── TEMPORARY DEBUG (remove after diagnosis) ─────────────────────────
    // eslint-disable-next-line no-console
    console.log(AW, "5. effect", {
      sdkState,
      shouldRender,
      suite: typeof window !== "undefined" ? window.RazorpayAffordabilitySuite : "no-window",
      suiteType: typeof window !== "undefined" ? typeof window.RazorpayAffordabilitySuite : "no-window",
    });
    // ─── END TEMPORARY DEBUG ──────────────────────────────────────────────

    if (!shouldRender || sdkState !== "ready") return;

    const container = containerRef.current;
    if (!container) return;

    const SuiteConstructor = window.RazorpayAffordabilitySuite;
    if (typeof SuiteConstructor !== "function") {
      onErrorRef.current?.(new Error("Razorpay affordability SDK unavailable."));
      return;
    }

    const generation = ++generationRef.current;

    // The SDK appends its iframe into the target; clear it so a re-render
    // after an amount change replaces the previous widget instead of stacking
    // a second one underneath it.
    container.innerHTML = "";

    // The SDK locates its container with
    // document.getElementById(RAZORPAY_AFFORDABILITY_DEFAULT_TARGET_ID), so
    // exactly one such element may exist. Bail rather than let two widget
    // instances fight over the same node.
    const claimed = document.getElementById(RAZORPAY_AFFORDABILITY_DEFAULT_TARGET_ID);
    if (claimed && claimed !== container) {
      onErrorRef.current?.(
        new Error(
          "Duplicate affordability container: only one AffordabilityWidget may be mounted per page.",
        ),
      );
      return;
    }

    try {
      const activeConfig = configRef.current;
      // ⚠️ NO `target` KEY. The SDK stores this object verbatim and later
      // JSON.stringify()s it into its iframe (affordabilityMerchantOptions),
      // so a DOM node here throws "Converting circular structure to JSON" the
      // moment the account is affordability-enabled. Everything below is
      // JSON-serialisable; the container is found by element id instead.
      // `amount` must be a number in paise.
      const options: RazorpayAffordabilityOptions = {
        key: resolvedKey,
        amount: amountPaise,
        ...(activeConfig ?? {}),
      };

      if (process.env.NODE_ENV !== "production") {
        // Final payload, immediately before render() — the object the SDK
        // will serialise. Must contain no DOM nodes, no React refs.
        console.debug("[AffordabilityWidget] render options", JSON.stringify(options));
      }

      const created = new SuiteConstructor(options);
      // render() is the entry point; the bundle has no init(). Called with no
      // arguments: the constructor already carries key + amount, and passing
      // options again would only re-merge them.
      created.render();
      instanceRef.current = created;
    } catch (error) {
      // A widget failure must never block booking — log and stay invisible.
      onErrorRef.current?.(
        error instanceof Error ? error : new Error("Affordability widget failed to render."),
      );
    }

    return () => {
      // Reading generationRef.current at cleanup time is the point: it tells us
      // whether a newer run has already claimed the container, in which case
      // this teardown must not wipe the newer widget.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (generation !== generationRef.current) return;
      try {
        // Not present in the current bundle; called defensively in case a
        // future build adds it. innerHTML is the guaranteed cleanup path.
        instanceRef.current?.destroy?.();
      } catch {
        /* no-op */
      }
      instanceRef.current = null;
      container.innerHTML = "";
    };
  }, [shouldRender, sdkState, resolvedKey, amountPaise, configKey]);

  if (!shouldRender) {
    // ─── TEMPORARY DEBUG (remove after diagnosis) ─────────────────────────
    // eslint-disable-next-line no-console
    console.log(AW, "EARLY RETURN null — <Script> never renders", {
      enabled,
      amountPaiseOk: amountPaise > 0,
      keyOk: resolvedKey.length > 0,
    });
    // ─── END TEMPORARY DEBUG ────────────────────────────────────────────────
    return null;
  }

  return (
    <div className={cn("w-full", className)} data-testid="affordability-widget">
      <Script
        id={RAZORPAY_AFFORDABILITY_SCRIPT_ID}
        src={RAZORPAY_AFFORDABILITY_SRC}
        // TEMPORARY DEBUG: was strategy="lazyOnload" — afterInteractive loads
        // earlier and makes the network request easier to observe. REVERT.
        strategy="afterInteractive"
        onLoad={() => {
          // eslint-disable-next-line no-console
          console.log(AW, "4a. Script onLoad fired");
        }}
        onReady={() => {
          // eslint-disable-next-line no-console
          console.log(AW, "4b. Script onReady fired");
          setSdkState("ready");
        }}
        onError={(e) => {
          // eslint-disable-next-line no-console
          console.log(AW, "4c. Script onError fired", e);
          setSdkState("failed");
          onErrorRef.current?.(new Error("Failed to load Razorpay affordability widget."));
        }}
      />

      {sdkState === "failed" ? null : (
        <Frame title={title} subtitle={subtitle}>
          <div
            // The id IS the integration point — the SDK resolves its container
            // with getElementById on exactly this value. Do not change it.
            id={RAZORPAY_AFFORDABILITY_DEFAULT_TARGET_ID}
            ref={containerRef}
            style={minHeight > 0 ? { minHeight } : undefined}
            aria-live="polite"
          />
        </Frame>
      )}
    </div>
  );
}

/**
 * Chrome around Razorpay's iframe: a tinted panel with a heading, holding the
 * widget in an inset white card. Without a `title` it renders nothing of its
 * own, so unframed call sites are byte-for-byte unchanged.
 *
 * No "View plans" affordance is added here — the widget already draws its own
 * inside the iframe, and a second one outside it could not be wired to open
 * the plans sheet (cross-origin), so it would be a dead control.
 */
function Frame({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!title) return <>{children}</>;

  return (
    <section
      className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-3.5"
      aria-label={title}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#2563EB] text-white"
          aria-hidden
        >
          <CreditCard className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold leading-tight text-[#0F172A]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-[12px] leading-snug text-[#475569]">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {/* Inset card. The SDK measures its target's clientWidth to size the
          iframe, so this stays a plain block with padding — no flex/grid that
          could collapse the measured width to 0. */}
      <div className="mt-3 rounded-xl border border-[#DBEAFE] bg-white px-3 py-2.5">
        {children}
      </div>
    </section>
  );
}
