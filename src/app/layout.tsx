import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { HERO_SLIDES, SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = SITE.url;
const defaultTitle =
  "Best Tour Packages in India | Affordable Holiday Packages | Wanderlux Voyages";
const defaultDescription =
  "Book premium India and international tour packages with curated stays, private transfers, and 24/7 concierge. Luxury honeymoons, family holidays, and bespoke itineraries.";

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
    "Wanderlux Voyages",
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
};

export const viewport: Viewport = {
  themeColor: "#0D4C92",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen font-sans">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
