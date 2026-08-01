import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CabBookingContactRedirect({ searchParams }: Props) {
  const params = await searchParams;
  const request = typeof params.request === "string" ? params.request : "";
  const quote = typeof params.quote === "string" ? params.quote : "";
  if (request && quote) {
    redirect(`/cabs/quotes/book?request=${encodeURIComponent(request)}&quote=${encodeURIComponent(quote)}`);
  }
  if (request) {
    redirect(`/cabs/quotes?request=${encodeURIComponent(request)}`);
  }
  redirect("/cabs");
}
