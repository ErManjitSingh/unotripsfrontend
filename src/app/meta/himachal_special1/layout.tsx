import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/meta/himachal_special" },
};

export default function HimachalSpecial1RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}