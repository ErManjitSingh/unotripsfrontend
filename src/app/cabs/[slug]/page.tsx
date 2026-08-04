import { redirect } from "next/navigation";

/**
 * Legacy admin-catalog cab detail.
 * Instant fixed-price catalog checkout is retired in favour of partner quotes.
 */
export default function LegacyCabDetailPage() {
  redirect("/cabs");
}
