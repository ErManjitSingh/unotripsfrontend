import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Dancing_Script, Playfair_Display, Roboto } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { TopBanner } from "@/components/layout/top-banner";
import { JsonLd } from "@/components/seo/JsonLd";
import { HERO_SLIDES, SITE } from "@/lib/constants";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

/**
 * EaseMyTrip holidays (easemytrip.com/holidays) — primary UI is Roboto / system sans.
 * @see https://www.easemytrip.com/holidays/
 */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

const siteUrl = SITE.url;
const defaultTitle =
  "Best Tour Packages in India | Luxury Travel Experiences | UNO Trips";
const defaultDescription =
  "Luxury curated travel across India and beyond — hand-picked stays, clear pricing, and 24×7 support. Himalayan escapes, Kerala backwaters, international holidays.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: defaultDescription,
  keywords: [
    "tour packages India",
    "international holiday packages",
    "luxury travel India",
    "honeymoon packages",
    "custom itineraries",
    "UNO Trips",
    "Rajasthan tour",
    "Europe packages",
    "Maldives honeymoon",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: SITE.name,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: HERO_SLIDES[0].src,
        width: 1920,
        height: 1080,
        alt: HERO_SLIDES[0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [HERO_SLIDES[0].src],
  },
  category: "travel",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/images/homelogo.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#EA580C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dancingScript.variable} ${roboto.variable} ${playfairDisplay.variable}`}
    >
      <body className="min-h-screen font-sans" suppressHydrationWarning>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1749891646008468');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1749891646008468&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <JsonLd />
        <AppProviders>
          <TopBanner />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
