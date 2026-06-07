export type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency?: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
};

type RazorpayInstance = { open: () => void; on: (event: string, handler: () => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window { Razorpay?: RazorpayConstructor; }
}

let scriptPromise: Promise<void> | null = null;

export function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? "";
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay can only load in the browser."));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable.");
  return new Promise((resolve, reject) => {
    let completed = false;
    const rzp = new window.Razorpay!({
      key: options.keyId,
      amount: options.amountPaise,
      currency: options.currency ?? "INR",
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill,
      theme: { color: "#EF6614" },
      handler(response: RazorpaySuccessResponse) {
        completed = true;
        options.onSuccess(response);
        resolve();
      },
      modal: {
        ondismiss() {
          if (!completed) {
            options.onDismiss?.();
            reject(new Error("Payment cancelled."));
          }
        },
      },
    });
    rzp.on("payment.failed", () => reject(new Error("Payment failed. Please try again.")));
    rzp.open();
  });
}