import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { HotelResumeCheckoutClient } from "@/components/hotels/hotel-resume-checkout-client";
import { TRAVEL_HOME_BRAND } from "@/lib/travel-home-brand";

export const metadata = {
  title: `Complete payment | ${TRAVEL_HOME_BRAND.name}`,
  description: "Resume your hotel checkout and complete payment.",
};

function ResumeFallback() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center bg-[#f5f5f5]">
      <Loader2 className="h-9 w-9 animate-spin text-[#2196F3]" aria-hidden />
    </main>
  );
}

export const dynamic = "force-dynamic";

export default function CheckoutResumePage() {
  return (
    <Suspense fallback={<ResumeFallback />}>
      <HotelResumeCheckoutClient />
    </Suspense>
  );
}
