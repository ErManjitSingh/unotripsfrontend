import { redirect } from "next/navigation";

export default function MyQuotesRedirectPage() {
  redirect("/account?tab=quotes");
}
