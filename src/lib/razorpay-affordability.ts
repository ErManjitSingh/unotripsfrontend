/**
 * src/lib/razorpay-affordability.ts
 *
 * Types + helpers for the Razorpay Affordability Widget (EMI / Pay Later /
 * Cardless EMI eligibility shown BEFORE checkout opens).
 *
 * This module is deliberately separate from razorpay-checkout.ts:
 *   - checkout.js                → opens the payment modal (order-bound)
 *   - affordability.js           → renders the eligibility widget (amount-bound)
 * They are two different SDKs from two different CDNs and must not be mixed.
 *
 * NOTHING HERE TOUCHES THE CHECKOUT FLOW. The widget is display-only: it never
 * creates an order, never posts to our backend, and never mutates booking state.
 *
 * ── AMOUNT CONTRACT ────────────────────────────────────────────────────────
 * The widget MUST be fed the exact amount Razorpay Checkout will charge, or the
 * EMI plans it advertises are a lie. For packages that amount is:
 *
 *   payment_type === "full"   → FulfillmentPricingResponse.grand_total
 *   payment_type === "token"  → FulfillmentPricingResponse.token_amount
 *
 * Both come from POST /v1/packages/{slug}/fulfillment-price — the single
 * authoritative pricing source (GST-inclusive). Never use /calculate-price or
 * /day-options: those return a PRE-GST subtotal and would under-quote the
 * customer by the full GST amount.
 */

export const RAZORPAY_AFFORDABILITY_SRC =
  "https://cdn.razorpay.com/widgets/affordability/affordability.js";

/** Stable DOM id for the single Next.js <Script> tag, so it is injected once. */
export const RAZORPAY_AFFORDABILITY_SCRIPT_ID = "razorpay-affordability-sdk";

/**
 * ── VERIFIED SDK CONTRACT ──────────────────────────────────────────────────
 * Read directly out of the shipped bundle
 * (https://cdn.razorpay.com/widgets/affordability/affordability.js), because
 * the earlier hand-written contract here did not match it and the widget could
 * never have rendered. What the bundle actually does:
 *
 *   window.RazorpayAffordabilitySuite   is a constructor (class).
 *   .render(opts?)                      is the entry point. There is NO
 *                                       init() and NO destroy() — the string
 *                                       "init" appears nowhere in the bundle.
 *   render() merges `opts` into the options given to the constructor, so the
 *   same instance can be re-rendered with a new amount.
 *
 *   target      Accepts ONLY an HTMLElement (`instanceof HTMLElement` /
 *               nodeType===1 check) — a CSS selector or an id string is
 *               rejected. When absent/invalid the SDK falls back to
 *               document.getElementById("razorpay-affordability-widget") and,
 *               failing that, throws { code: 1002, "Invalid target passed" }.
 *               There is no `containerId` option — that key is never read.
 *   key         Missing → { code: 1003, "Invalid key passed" }.
 *   amount      Must be typeof "number" (PAISE) → else
 *               { code: 1001, "Invalid amount passed" }.
 *
 * Other options the bundle reads: `features`, `display`, `checkout_callback`.
 * `currency` and `config` are NOT read and are therefore not sent.
 *
 * ── WHY WE NEVER PASS `target` ─────────────────────────────────────────────
 * ⚠️ Passing `target` crashes the widget with
 *      "Uncaught TypeError: Converting circular structure to JSON"
 * once the merchant account is affordability-enabled. The bundle keeps the
 * options object verbatim —
 *      constructor:  e.options = r;  e.targetElement = r.target;
 *      render():     this.options = ht({ ...this.options, ...r });
 * — and `ht()` only normalises display.offers / features.offers; it does NOT
 * strip `target`. When the eligibility response arrives with enabled === true
 * the SDK does:
 *      sendMessageToFrame(detailIFrame, "apiResponse",
 *        { apiData, affordabilityMerchantOptions: e.options })
 * and sendMessageToFrame serialises with JSON.stringify(). A DOM node in
 * `options.target` is a circular structure, so the stringify throws.
 * (render() nulls `target` only in its ANALYTICS meta copy — not in
 * this.options — which is why the crash is invisible until an account is live.)
 *
 * The safe contract: keep the options object strictly JSON-serialisable and
 * let the SDK find its container by the default element id above. That is why
 * AffordabilityWidget puts RAZORPAY_AFFORDABILITY_DEFAULT_TARGET_ID on its own
 * container div and passes no `target`.
 * ───────────────────────────────────────────────────────────────────────────
 */

/** Default element id the SDK falls back to when `target` is not an element. */
export const RAZORPAY_AFFORDABILITY_DEFAULT_TARGET_ID = "razorpay-affordability-widget";

/**
 * Presentation options forwarded verbatim to render(). Deliberately loose: the
 * shapes are not documented in the bundle beyond the key names, so this stays
 * a passthrough rather than inventing a type the SDK may not honour.
 */
export type RazorpayAffordabilityConfig = {
  /** Feature toggles, e.g. which affordability methods to surface. */
  features?: Record<string, unknown>;
  /** Display/theme configuration (applied via setDisplayConfig). */
  display?: Record<string, unknown>;
};

/**
 * Options we send. MUST stay JSON-serialisable — the SDK posts this object
 * into its iframe via JSON.stringify(). Note the deliberate absence of
 * `target`: see "WHY WE NEVER PASS `target`" above. It is typed as
 * `never` so a future edit cannot reintroduce the crash silently.
 */
export type RazorpayAffordabilityOptions = {
  /** Razorpay public key id (rzp_test_… / rzp_live_…). */
  key: string;
  /** Amount in PAISE. Must equal the amount Checkout will charge. */
  amount: number;
  /** Never set this. The SDK resolves the container by element id instead. */
  target?: never;
} & RazorpayAffordabilityConfig;

type RazorpayAffordabilityInstance = {
  /** Entry point. Options passed here are merged over the constructor's. */
  render: (options?: Partial<RazorpayAffordabilityOptions>) => void;
  /** Present in the bundle; updates the amount on an existing instance. */
  setAmount?: (amountInPaise: number) => void;
  /**
   * NOT present in the current bundle — kept optional and always called
   * defensively in case a future build adds it.
   */
  destroy?: () => void;
};

type RazorpayAffordabilityConstructor = new (
  options: RazorpayAffordabilityOptions,
) => RazorpayAffordabilityInstance;

declare global {
  interface Window {
    RazorpayAffordabilitySuite?: RazorpayAffordabilityConstructor;
  }
}

export type { RazorpayAffordabilityInstance, RazorpayAffordabilityConstructor };

/** True once the SDK global is present in this document. */
export function isAffordabilitySdkReady(): boolean {
  return typeof window !== "undefined" && typeof window.RazorpayAffordabilitySuite === "function";
}

/**
 * Rupees → paise, matching the backend's charge amount as closely as float
 * arithmetic allows.
 *
 * Math.round (not Math.trunc): 17426.55 * 100 evaluates to 1742654.9999…, and
 * truncating there would advertise EMI on an amount one paise below what is
 * actually charged.
 */
export function toPaise(amountInr: number): number {
  if (!Number.isFinite(amountInr) || amountInr <= 0) return 0;
  return Math.round(amountInr * 100);
}

// toSafeElementId() removed: the container id is no longer per-instance. The
// SDK resolves its target with getElementById(RAZORPAY_AFFORDABILITY_DEFAULT_
// TARGET_ID), so the id is fixed and a useId()-derived token is meaningless.
