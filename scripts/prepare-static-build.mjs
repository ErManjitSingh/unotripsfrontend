import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
if (/localhost|127\.0\.0\.1/i.test(siteUrl)) {
  console.warn(
    "\n⚠  NEXT_PUBLIC_SITE_URL is set to a local URL for production build:",
    siteUrl,
    "\n   Set NEXT_PUBLIC_SITE_URL=https://unotrips.com in .env.production before `npm run build`.\n",
  );
}

for (const dir of [".next-build", "out"]) {
  try {
    rmSync(join(rootDir, dir), { recursive: true, force: true });
  } catch {
    // ignore locked paths — next build will surface a clear error
  }
}

function run(script) {
  const result = spawnSync(process.execPath, [join(rootDir, "scripts", script)], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("fetch-blog-slugs.mjs");
run("fetch-package-catalog.mjs");
run("fetch-hotel-catalog.mjs");
