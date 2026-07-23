import Link from "next/link";
import { HIMACHAL_ADS } from "@/lib/meta/himachal-special-data";
import "@/components/meta/himachal-special/himachal-special.css";

export const metadata = {
  title: { absolute: "Thank you | Uno Trips Himachal" },
  robots: { index: false, follow: false },
};

export default function HimachalThankYouPage() {
  return (
    <div className="hs-root">
      <div className="hs-thanks">
        <div>
          <p className="hs-brand" style={{ color: "var(--hs-pine-deep)" }}>
            Uno Trips
          </p>
          <h1>Thank you — we got your enquiry</h1>
          <p style={{ color: "var(--hs-muted)", maxWidth: 420, margin: "0.75rem auto 1.5rem" }}>
            Our Himachal expert will call you shortly. For faster help, call or WhatsApp now.
          </p>
          <div className="hs-hero-cta" style={{ justifyContent: "center" }}>
            <a className="hs-btn hs-btn-primary" href={`tel:${HIMACHAL_ADS.phoneTel}`}>
              Call {HIMACHAL_ADS.phoneDisplay}
            </a>
            <a
              className="hs-btn hs-btn-wa"
              href={`https://wa.me/${HIMACHAL_ADS.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href={HIMACHAL_ADS.path} style={{ color: "var(--hs-pine)", fontWeight: 600 }}>
              ← Back to packages
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
