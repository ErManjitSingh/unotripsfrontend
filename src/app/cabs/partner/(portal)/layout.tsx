"use client";

import { PartnerPortalProvider } from "@/components/cabs/partner/PartnerPortalProvider";
import type { ReactNode } from "react";

export default function PartnerPortalLayout({ children }: { children: ReactNode }) {
  return <PartnerPortalProvider>{children}</PartnerPortalProvider>;
}
