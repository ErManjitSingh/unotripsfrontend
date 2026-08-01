import { redirect } from "next/navigation";

/**
 * Legacy admin-catalog search results.
 * UnoCabs travellers now post trip requests and collect partner quotes at /cabs.
 */
export default function LegacyCabResultsPage() {
  redirect("/cabs");
}
