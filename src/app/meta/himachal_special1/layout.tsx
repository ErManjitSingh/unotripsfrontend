import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HIMACHAL_SPECIAL1_ADS } from "@/lib/meta/himachal-special1-data";
import "@/components/meta/himachal-special1/himachal-special1.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: HIMACHAL_SPECIAL1_ADS.defaultH1,
  },
  description: HIMACHAL_SPECIAL1_ADS.description,
  alternates: {
    canonical: HIMACHAL_SPECIAL1_ADS.path,
  },
  openGraph: {
    title: HIMACHAL_SPECIAL1_ADS.defaultH1,
    description: HIMACHAL_SPECIAL1_ADS.description,
    url: HIMACHAL_SPECIAL1_ADS.path,
    images: [`${HIMACHAL_SPECIAL1_ADS.img}/hero.webp`],
  },
};

export default function HimachalSpecial1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${plusJakarta.variable} ${plusJakarta.className}`}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17928878008"
        strategy="afterInteractive"
      />
      <Script id="google-ads-himachal-special1" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17928878008');
        `}
      </Script>
      {children}
    </div>
  );
}