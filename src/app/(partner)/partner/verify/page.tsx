"use client";

/**
 * src/app/(partner)/partner/verify/page.tsx
 *
 * Verification is handled inside the partner dashboard via the account page.
 * Anyone who lands directly on this URL gets redirected to the dashboard.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PartnerVerifyPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/partner/dashboard"); }, [router]);
  return null;
}