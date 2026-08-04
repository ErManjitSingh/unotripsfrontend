import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CabQuoteDetailsRedirect({ searchParams }: Props) {
  const params = await searchParams;
  const request = typeof params.request === "string" ? params.request : "";
  redirect(request ? `/cabs/quotes?request=${encodeURIComponent(request)}` : "/cabs");
}
