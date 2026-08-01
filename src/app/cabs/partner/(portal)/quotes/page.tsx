"use client";

import { Suspense } from "react";
import PartnerQuotesContent from "@/components/cabs/partner/PartnerQuotesContent";

export default function PartnerQuotesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-64 place-items-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-[#ef6614]" />
        </div>
      }
    >
      <PartnerQuotesContent />
    </Suspense>
  );
}
