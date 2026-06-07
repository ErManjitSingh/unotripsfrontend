import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const PAGE_FILES = [
  "src/app/blog/[slug]/page.tsx",
  "src/app/packages/[slug]/page.tsx",
  "src/app/destinations/[slug]/page.tsx",
  "src/app/hotel/layout.tsx",
  "src/app/hotel/[slug]/page.tsx",
  "src/app/hotel/[slug]/[hotelId]/page.tsx",
  "src/app/hotel/[slug]/[hotelId]/book/page.tsx",
  "src/app/hotel/view/page.tsx",
  "src/app/hotels/page.tsx",
  "src/app/checkout/resume/page.tsx",
];

const DYNAMIC_BLOCK =
  /export const dynamic\s*=\s*(?:"force-dynamic"|(?:\r?\n\s*)?process\.env\.BUILD_STATIC === "1" \? "force-static" : "force-dynamic");/g;

/** @type {Map<string, string>} */
export const backups = new Map();

export function patchForStaticExport() {
  for (const rel of PAGE_FILES) {
    const path = join(rootDir, rel);
    const original = readFileSync(path, "utf8");
    backups.set(path, original);
    const next = original.replace(
      DYNAMIC_BLOCK,
      'export const dynamic = "force-static";',
    );
    if (next === original) {
      console.warn(`patch-static-pages: no dynamic export updated in ${rel}`);
    }
    writeFileSync(path, next, "utf8");
  }
  console.log(`Patched ${PAGE_FILES.length} pages for static export.`);
}

export function restorePatchedPages() {
  for (const [path, content] of backups) {
    writeFileSync(path, content, "utf8");
  }
  backups.clear();
  console.log("Restored page sources after static export.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  patchForStaticExport();
}
