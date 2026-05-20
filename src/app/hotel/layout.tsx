/** All hotel routes fetch live API data at request time — no static HTML. */
export const dynamic = "force-dynamic";

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return children;
}