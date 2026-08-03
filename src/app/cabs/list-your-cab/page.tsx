import type { Metadata } from "next";
import { PartnerOnboarding } from "@/components/cabs/PartnerOnboarding";

export const metadata: Metadata = {
  title: "List Your Cab | UNO Cabs",
  description: "Join the UNO Cabs partner network.",
};

export default function ListYourCabPage() {
  return <PartnerOnboarding />;
}
