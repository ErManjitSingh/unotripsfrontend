import { createReadStream } from "node:fs";
import { Client } from "ssh2";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const password = process.env.VPS_PASSWORD || "Manjitsingh-123";

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on("ready", () => resolve(conn)).on("error", reject).connect({
      host: "69.62.76.249", port: 22, username: "root", password, readyTimeout: 120000,
    });
  });
}

function exec(conn, cmd, timeoutMs = 600000) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      stream.on("data", (d) => process.stdout.write(d));
      stream.stderr.on("data", (d) => process.stderr.write(d));
      const t = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      stream.on("close", (code) => { clearTimeout(t); code ? reject(new Error(`exit ${code}`)) : resolve(); });
    });
  });
}

function upload(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const ws = sftp.createWriteStream(remote);
      ws.on("close", resolve);
      ws.on("error", reject);
      createReadStream(local).pipe(ws);
    });
  });
}

const fileUploads = [
  ["meta/himachal_special/index.php", "/var/www/unotrips-meta/himachal_special/index.php"],
  ["meta/himachal_special/script.js", "/var/www/unotrips-meta/himachal_special/script.js"],
  ["meta/himachal_special/style.ads-fix.css", "/var/www/unotrips-meta/himachal_special/style.ads-fix.css"],
  ["meta/himachal_special/thankyou.html", "/var/www/unotrips-meta/himachal_special/thankyou.html"],
  ["meta/himachal_special/img/hero.webp", "/var/www/unotrips-meta/himachal_special/img/hero.webp"],
  ["meta/himachal_special/img/solang.webp", "/var/www/unotrips-meta/himachal_special/img/solang.webp"],
  ["meta/himachal_special/img/shimla.webp", "/var/www/unotrips-meta/himachal_special/img/shimla.webp"],
  ["meta/himachal_special/img/kullu.webp", "/var/www/unotrips-meta/himachal_special/img/kullu.webp"],
  ["meta/himachal_special/img/romantic-opt.webp", "/var/www/unotrips-meta/himachal_special/img/romantic-opt.webp"],
  ["meta/himachal_special/img/himachal-opt.webp", "/var/www/unotrips-meta/himachal_special/img/himachal-opt.webp"],
  ["meta/himachal_special/img/himachal-group-opt.webp", "/var/www/unotrips-meta/himachal_special/img/himachal-group-opt.webp"],
  ["meta/himachal_special/img/dharamshala-opt.webp", "/var/www/unotrips-meta/himachal_special/img/dharamshala-opt.webp"],
  ["meta/leh/index.html", "/var/www/unotrips-meta/leh/index.html"],
  ["meta/leh/thank-you.html", "/var/www/unotrips-meta/leh/thank-you.html"],
];

async function main() {
  const conn = await connect();
  const localTar = join(root, "meta-himachal-ads-deploy.tar.gz");
  const remoteTar = "/root/meta-himachal-ads-deploy.tar.gz";
  console.log("Uploading Himachal ads tar...");
  await upload(conn, localTar, remoteTar);
  console.log("Extracting on VPS...");
  await exec(
    conn,
    [
      "mkdir -p /var/www/unotrips-meta",
      "tar -xzf /root/meta-himachal-ads-deploy.tar.gz -C /var/www/unotrips-meta",
      "chown -R www-data:www-data /var/www/unotrips-meta/himachal_special || true",
      "ls -la /var/www/unotrips-meta/himachal_special/style.ads-fix.css /var/www/unotrips-meta/himachal_special/img/hero.webp",
      "echo himachal_ok: $(curl -sL https://unotrips.com/meta/himachal_special/ | grep -oE 'TouristTrip|WhatsApp Quote|Only 2 slots|style.ads-fix' | sort -u | tr '\\n' ',')",
      "echo himachal_css: $(curl -sL -o /dev/null -w '%{http_code}' https://unotrips.com/meta/himachal_special/style.ads-fix.css)",
      "echo himachal_hero: $(curl -sL -o /dev/null -w '%{http_code}' https://unotrips.com/meta/himachal_special/img/hero.webp)",
    ].join(" && "),
  );
  conn.end();
  console.log("\nHimachal ads live deploy done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
