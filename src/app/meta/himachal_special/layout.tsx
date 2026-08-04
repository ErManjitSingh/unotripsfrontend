import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HIMACHAL_ADS } from "@/lib/meta/himachal-special-data";
import {
  HIMACHAL_GOOGLE_ADS_ID,
  HIMACHAL_GOOGLE_ADS_PHONE_CONVERSION,
  HIMACHAL_PHONE_CONVERSION_NUMBER,
} from "@/lib/meta/himachal-ads-conversion";
import "@/components/meta/himachal-special/himachal-special.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: HIMACHAL_ADS.defaultH1,
  },
  description: HIMACHAL_ADS.description,
  alternates: {
    canonical: HIMACHAL_ADS.path,
  },
  openGraph: {
    title: HIMACHAL_ADS.defaultH1,
    description: HIMACHAL_ADS.description,
    url: HIMACHAL_ADS.path,
    images: [`${HIMACHAL_ADS.img}/hero.webp`],
  },
};

export default function HimachalSpecialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${plusJakarta.variable} ${plusJakarta.className}`}>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${HIMACHAL_GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-himachal-special" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${HIMACHAL_GOOGLE_ADS_ID}', {
            allow_enhanced_conversions: true
          });
          gtag('config', '${HIMACHAL_GOOGLE_ADS_PHONE_CONVERSION}', {
            phone_conversion_number: '${HIMACHAL_PHONE_CONVERSION_NUMBER}'
          });
        `}
      </Script>
      {children}
    </div>
  );
}