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
  const tarPath = join(root, "meta-assam-deploy.tar.gz");
  execSync(`tar -czf "${tarPath}" -C meta assam`, { stdio: "inherit" });
  const conn = await connect();
  console.log("Uploading assam meta...");
  await upload(conn, tarPath, "/root/meta-assam-deploy.tar.gz");
  await upload(conn, join(root, "scripts/vps-nginx-dynamic.conf"), "/etc/nginx/sites-available/unotrips.com");
  await exec(conn, [
    "set -e",
    "mkdir -p /var/www/unotrips-meta",
    "rm -rf /var/www/unotrips-meta/assam",
    "tar -xzf /root/meta-assam-deploy.tar.gz -C /var/www/unotrips-meta",
    "chown -R www-data:www-data /var/www/unotrips-meta/assam || true",
    "ln -sf /etc/nginx/sites-available/unotrips.com /etc/nginx/sites-enabled/unotrips.com",
    "nginx -t",
    "systemctl reload nginx",
    "curl -s -o /dev/null -w 'assam_page:%{http_code}\\n' https://unotrips.com/meta/assam/",
    "curl -s https://unotrips.com/meta/assam/ | head -c 500",
  ].join(" && "));
  conn.end();
  console.log("\nassam meta deploy done.");
}

main().catch((e) => { console.error(e); process.exit(1); });

