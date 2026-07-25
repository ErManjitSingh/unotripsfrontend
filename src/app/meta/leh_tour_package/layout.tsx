import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { LEH_ADS } from "@/lib/meta/leh-tour-data";
import {
  HIMACHAL_GOOGLE_ADS_ID,
  HIMACHAL_GOOGLE_ADS_PHONE_CONVERSION,
  HIMACHAL_PHONE_CONVERSION_NUMBER,
} from "@/lib/meta/himachal-ads-conversion";
import "@/components/meta/leh-tour/leh-ads.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-plus-jakarta", display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Leh Ladakh Tour Packages 2026 | Starting ₹18,999 | Uno Trips" },
  description: LEH_ADS.description,
  alternates: { canonical: LEH_ADS.path },
  openGraph: {
    title: "Leh Ladakh Tour Packages 2026 | Starting ₹18,999 | Uno Trips",
    description: LEH_ADS.description,
    url: LEH_ADS.path,
    images: [`${LEH_ADS.img}/hero.jpg`],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leh Ladakh Tour Packages 2026 | Starting ₹18,999",
    description: LEH_ADS.description,
    images: [`${LEH_ADS.img}/hero.jpg`],
  },
};

export default function LehTourLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${plusJakarta.variable} ${plusJakarta.className}`}>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${HIMACHAL_GOOGLE_ADS_ID}`} strategy="afterInteractive" />
    <Script id="google-ads-leh-tour" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${HIMACHAL_GOOGLE_ADS_ID}', { allow_enhanced_conversions: true });
      gtag('config', '${HIMACHAL_GOOGLE_ADS_PHONE_CONVERSION}', { phone_conversion_number: '${HIMACHAL_PHONE_CONVERSION_NUMBER}' });
    `}</Script>
    {children}
  </div>;
}