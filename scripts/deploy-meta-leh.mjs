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

async function main() {
  const tarPath = join(root, "meta-leh-deploy.tar.gz");
  execSync(`tar -czf "${tarPath}" -C meta leh_tour_package`, { stdio: "inherit" });
  const conn = await connect();
  console.log("Uploading leh_tour_package...");
  await upload(conn, tarPath, "/root/meta-leh-deploy.tar.gz");
  await upload(conn, join(root, "scripts/vps-nginx-dynamic.conf"), "/etc/nginx/sites-available/unotrips.com");
  await exec(conn, [
    "set -e",
    "mkdir -p /var/www/unotrips-meta",
    "rm -rf /var/www/unotrips-meta/leh_tour_package",
    "tar -xzf /root/meta-leh-deploy.tar.gz -C /var/www/unotrips-meta",
    "chown -R www-data:www-data /var/www/unotrips-meta/leh_tour_package || true",
    "ln -sf /etc/nginx/sites-available/unotrips.com /etc/nginx/sites-enabled/unotrips.com",
    "nginx -t",
    "systemctl reload nginx",
    "curl -s -o /dev/null -w 'send_lead:%{http_code}\\n' -X POST https://unotrips.com/meta/leh_tour_package/send_lead.php -H 'Content-Type: application/json' -d '{\"_subject\":\"Deploy test\",\"source\":\"Deploy\",\"phone\":\"+919876543210\",\"message\":\"Test from deploy script\"}'",
  ].join(" && "));
  conn.end();
  console.log("\nLeh tour package meta deploy done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
