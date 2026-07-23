import Link from "next/link";
import { HIMACHAL_SPECIAL1_ADS } from "@/lib/meta/himachal-special1-data";
import "@/components/meta/himachal-special1/himachal-special1.css";

export const metadata = {
  title: { absolute: "Thank you | Uno Trips Himachal" },
  robots: { index: false, follow: false },
};

export default function HimachalSpecial1ThankYouPage() {
  const ads = HIMACHAL_SPECIAL1_ADS;
  const wa = `https://wa.me/${ads.whatsapp}`;

  return (
    <div className="hs1-ty-root">
      <div className="hs1-ty-card">
        <p className="hs1-ty-brand">Uno Trips</p>
        <h1>Thank you — we got your enquiry</h1>
        <p>
          Our Himachal expert will call you shortly. For faster help, call or WhatsApp now.
        </p>
        <div className="hs1-ty-cta">
          <a className="hs1-btn hs1-btn-primary" href={`tel:${ads.phoneTel}`}>
            Call {ads.phoneDisplay}
          </a>
          <a
            className="hs1-btn hs1-btn-wa"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
        <p>
          <Link href={ads.path} style={{ color: "#ea580c", fontWeight: 600 }}>
            ← Back to packages
          </Link>
        </p>
      </div>
    </div>
  );
}