import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
if (/localhost|127\.0\.0\.1/i.test(siteUrl)) {
  console.warn(
    "\n  NEXT_PUBLIC_SITE_URL is set to a local URL for production build:",
    siteUrl,
    "\n   Set NEXT_PUBLIC_SITE_URL=https://unotrips.com in .env.production before npm run build.\n",
  );
}

// Skip aggressive cache wipe on Vercel — build must output to .next
if (!process.env.VERCEL) {
  for (const dir of [".next", "out"]) {
    try {
      rmSync(join(rootDir, dir), { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

console.log("Prepare build: dynamic app ready.");