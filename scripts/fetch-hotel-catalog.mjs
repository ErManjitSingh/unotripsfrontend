import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const apiRoot =
  process.env.HOTELS_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_HOTELS_API_URL?.replace(/\/$/, "") ||
  "https://unohotels-backend.onrender.com";
const out = join(root, "../src/lib/hotels-build-cache.json");

const TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;

function citySlugFromName(city) {
  return String(city ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

async function fetchJson(path, attempt = 1) {
  const url = `${apiRoot}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return fetchJson(path, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`Fetching hotel catalog from ${apiRoot} ...`);

  const slugsEnvelope = await fetchJson("/v1/hotels/slugs");
  const slugs = slugsEnvelope?.data ?? [];
  if (!slugs.length) {
    console.warn("Warning: /v1/hotels/slugs returned no hotels — static hotel pages may be empty.");
  }

  let popular = [];
  try {
    const popularEnvelope = await fetchJson("/v1/destinations/popular");
    popular = popularEnvelope?.data ?? [];
  } catch {
    console.warn("Warning: /v1/destinations/popular failed — using slug cities only.");
  }

  const citySlugs = [
    ...new Set(slugs.map((s) => citySlugFromName(s.city)).filter(Boolean)),
  ];

  const searches = {};
  for (const slug of citySlugs) {
    const match = slugs.find((s) => citySlugFromName(s.city) === slug);
    const apiCity = match?.city?.trim() || slug.replace(/-/g, " ");
    try {
      const q = new URLSearchParams({
        city: apiCity,
        limit: "50",
        sort: "popular",
      });
      const searchEnvelope = await fetchJson(`/v1/hotels/search?${q.toString()}`);
      const data = searchEnvelope?.data;
      searches[slug] = {
        apiCity,
        hotels: data?.hotels ?? [],
        total: data?.total ?? 0,
      };
      console.log(`  ${slug}: ${searches[slug].total} hotel(s)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  ${slug}: search failed — ${message}`);
      searches[slug] = { apiCity, hotels: [], total: 0 };
    }
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    apiRoot,
    slugs,
    popular,
    searches,
  };

  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `Wrote hotel build cache (${slugs.length} slugs, ${citySlugs.length} cities) to src/lib/hotels-build-cache.json`,
  );
}

main().catch((err) => {
  console.error("fetch-hotel-catalog failed:", err);
  process.exit(1);
});
