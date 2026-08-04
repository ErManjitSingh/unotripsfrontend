import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/meta/leh_tour_package" },
  robots: { index: false, follow: true },
};

export default function LehLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}