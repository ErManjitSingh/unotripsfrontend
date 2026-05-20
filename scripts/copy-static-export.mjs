import { cpSync, existsSync, mkdirSync, rmSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(rootDir, ".next-build");
const destDir = join(rootDir, "out");

if (!existsSync(join(srcDir, "index.html"))) {
  console.error("Static export missing in .next-build/index.html — run `next build` first.");
  process.exit(1);
}

try {
  rmSync(destDir, { recursive: true, force: true });
} catch {
  // ignore
}

mkdirSync(destDir, { recursive: true });
cpSync(srcDir, destDir, { recursive: true, force: true });

for (const junk of ["blog.zip"]) {
  const p = join(destDir, junk);
  if (existsSync(p)) {
    try {
      unlinkSync(p);
      console.log(`Removed deploy junk: ${junk}`);
    } catch {
      /* ignore */
    }
  }
}

console.log(`Copied static export to ${destDir}`);
