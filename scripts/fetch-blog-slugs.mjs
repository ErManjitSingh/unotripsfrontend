import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://website.travelwithuno.com";

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/lib/blog-slugs.json");

const allRows = [];
let page = 1;
let lastPage = 1;

do {
  const res = await fetch(`${root}/api/v1/blog/posts?per_page=50&page=${page}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    console.error(`Blog API failed on page ${page}: ${res.status}`);
    process.exit(1);
  }

  const data = await res.json();
  const rows = data.posts?.data ?? [];
  allRows.push(...rows);
  lastPage = Math.max(1, data.posts?.last_page ?? 1);
  page += 1;
} while (page <= lastPage);

const slugs = allRows
  .map((p) => (p.slug ?? "").trim())
  .filter(Boolean);

writeFileSync(out, `${JSON.stringify(slugs, null, 2)}\n`, "utf8");
console.log(`Wrote ${slugs.length} blog slugs to src/lib/blog-slugs.json`);
