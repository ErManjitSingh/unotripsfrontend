import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://website.travelwithuno.com";

const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/lib/package-catalog.json",
);

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1523906834658-2e24ef238147?w=800&q=80";

function coerceNumber(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function buildMediaUrl(pathLike, apiRoot) {
  const p = String(pathLike ?? "").trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, "");
  const normalized = clean.startsWith("storage/") ? clean : `storage/${clean}`;
  return `${apiRoot.replace(/\/$/, "")}/${normalized}`;
}

function stripHtmlLite(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
}

function mapItinerary(raw) {
  if (!Array.isArray(raw) || !raw.length) return undefined;
  const outDays = [];
  let day = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const title = String(item.title ?? "").trim();
    const desc = stripHtmlLite(item.description);
    const bits = [];
    if (item.meals) bits.push(String(item.meals).trim());
    if (item.hotel) bits.push(`Stay: ${String(item.hotel).trim()}`);
    if (item.transport) bits.push(`Transport: ${String(item.transport).trim()}`);
    const body = bits.length
      ? desc
        ? `${desc}\n\n${bits.join(" · ")}`
        : bits.join(" · ")
      : desc;
    if (!title && !body) continue;
    day += 1;
    outDays.push({ day, title: title || `Day ${day}`, body: body || "—" });
  }
  return outDays.length ? outDays : undefined;
}

function mapPackageRow(p, apiRoot) {
  const id = String(p.id);
  const title = p.title ?? `Package ${id}`;
  const slugFromTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const price = coerceNumber(p.offer_price ?? p.discount_price ?? p.price) ?? 0;
  const oldPrice = coerceNumber(p.price);
  const discountPct =
    oldPrice && oldPrice > 0 && price > 0 && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : undefined;

  const durationDays = p.days ?? 0;
  const durationNights = p.nights ?? Math.max(0, durationDays - 1);
  const image =
    typeof p.featured_image === "string" && p.featured_image.trim()
      ? buildMediaUrl(p.featured_image, apiRoot)
      : PLACEHOLDER_IMAGE;

  return {
    id,
    slug: (p.slug ?? "").trim() || slugFromTitle || `pkg-${id}`,
    title,
    image,
    durationDays,
    durationNights,
    rating: 4.8,
    reviewCount: 120,
    priceINR: Math.round(price),
    oldPriceINR: oldPrice && oldPrice > price ? Math.round(oldPrice) : undefined,
    discountPct,
    description: (p.short_description ?? p.description ?? "").trim() || undefined,
    packageType: "Holiday package",
    location: (p.destination ?? p.location_name ?? "").trim() || undefined,
    showMemberPrice: true,
    itinerary: mapItinerary(p.itinerary),
  };
}

async function fetchPackagesPage(page) {
  const res = await fetch(`${root}/api/v1/packages?page=${page}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Packages API failed on page ${page}: ${res.status}`);
  }
  return res.json();
}

const first = await fetchPackagesPage(1);
const firstRows = first?.packages?.data ?? [];
if (!firstRows.length) {
  console.error("Packages API returned no rows on page 1");
  process.exit(1);
}

const lastPage = Math.max(1, first.packages?.last_page ?? 1);
const allRows = [...firstRows];

for (let page = 2; page <= lastPage; page += 1) {
  const next = await fetchPackagesPage(page);
  const rows = next?.packages?.data ?? [];
  if (rows.length) allRows.push(...rows);
}

const catalog = allRows.map((row) => mapPackageRow(row, root));
writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${catalog.length} packages (${lastPage} API page(s)) to src/lib/package-catalog.json`,
);
