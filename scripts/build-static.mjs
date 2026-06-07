import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  patchForStaticExport,
  restorePatchedPages,
} from "./patch-static-pages.mjs";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiRoute = join(rootDir, "src/app/api/hotels/[...path]/route.ts");
const apiRouteBackup = join(rootDir, "scripts/.api-hotels-route.backup.ts");

function run(nodeScript) {
  const result = spawnSync(process.execPath, [join(rootDir, "scripts", nodeScript)], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function hideApiRoute() {
  if (!existsSync(apiRoute)) return;
  mkdirSync(dirname(apiRouteBackup), { recursive: true });
  copyFileSync(apiRoute, apiRouteBackup);
  unlinkSync(apiRoute);
  console.log("Temporarily removed API route for static export.");
}

function restoreApiRoute() {
  if (!existsSync(apiRouteBackup)) return;
  mkdirSync(dirname(apiRoute), { recursive: true });
  copyFileSync(apiRouteBackup, apiRoute);
  unlinkSync(apiRouteBackup);
  console.log("Restored API route.");
}

const env = { ...process.env, BUILD_STATIC: "1" };

console.log("=== Static export build (out/) ===\n");

hideApiRoute();
patchForStaticExport();

let exitCode = 0;
try {
  run("prepare-static-build.mjs");

  const nextBin = join(rootDir, "node_modules/next/dist/bin/next");
  const build = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: rootDir,
    stdio: "inherit",
    env,
  });
  if (build.status !== 0) exitCode = build.status ?? 1;

  if (exitCode === 0) {
    const copy = spawnSync(process.execPath, [join(rootDir, "scripts/copy-static-export.mjs")], {
      cwd: rootDir,
      stdio: "inherit",
      env,
    });
    if (copy.status !== 0) exitCode = copy.status ?? 1;
  }
} finally {
  restorePatchedPages();
  restoreApiRoute();
}

if (exitCode !== 0) process.exit(exitCode);
console.log("\nDone - deploy the out/ folder to your static host.");
