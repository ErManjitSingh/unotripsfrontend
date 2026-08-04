import { redirect } from "next/navigation";

/**
 * Legacy admin-catalog cab checkout.
 * Travellers book through the quote marketplace instead.
 */
export default function LegacyCabBookPage() {
  redirect("/cabs");
}
