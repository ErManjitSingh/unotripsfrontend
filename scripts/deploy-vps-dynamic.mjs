import { createReadStream } from "node:fs";
import { Client } from "ssh2";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const password = process.env.VPS_PASSWORD || "Manjitsingh-123";

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on("ready", () => resolve(conn)).on("error", reject)
      .connect({ host: "69.62.76.249", port: 22, username: "root", password, readyTimeout: 120000 });
  });
}

function exec(conn, cmd, timeoutMs = 600000) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      let stdout = "";
      stream.on("data", (d) => { stdout += d.toString(); process.stdout.write(d); });
      stream.stderr.on("data", (d) => process.stderr.write(d));
      const t = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      stream.on("close", (code) => {
        clearTimeout(t);
        if (code !== 0) reject(new Error(`exit ${code}`));
        else resolve(stdout);
      });
    });
  });
}

function upload(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const ws = sftp.createWriteStream(remote);
      ws.on("close", () => resolve());
      ws.on("error", reject);
      createReadStream(local).pipe(ws);
    });
  });
}

async function main() {
  const conn = await connect();
  console.log("Connected\n");
  await upload(conn, join(root, "scripts/vps-setup-node.sh"), "/root/vps-setup-node.sh");
  await exec(conn, "bash /root/vps-setup-node.sh");
  await upload(conn, join(root, "scripts/vps-nginx-dynamic.conf"), "/etc/nginx/sites-available/unotrips.com");
  await upload(conn, join(root, "app-deploy.tar.gz"), "/root/app-deploy.tar.gz");
  console.log("\nInstalling app...\n");
  await exec(conn, [
    "set -e",
    "rm -rf /var/www/unotrips-app/*",
    "tar -xzf /root/app-deploy.tar.gz -C /var/www/unotrips-app",
    "cd /var/www/unotrips-app",
    "npm ci",
    "pm2 delete unotrips 2>/dev/null || true",
    "cd /var/www/unotrips-app && pm2 start npm --name unotrips -- start",
    "pm2 save",
    "ln -sf /etc/nginx/sites-available/unotrips.com /etc/nginx/sites-enabled/unotrips.com",
    "rm -f /etc/nginx/sites-enabled/default",
    "nginx -t",
    "systemctl reload nginx",
    "sleep 3",
    "curl -sI http://127.0.0.1:3000/ | head -5",
    "curl -sI -k https://127.0.0.1/ -H 'Host: unotrips.com' | head -6",
  ].join(" && "));
  conn.end();
  console.log("\nDynamic deploy done.");
}

main().catch((e) => { console.error(e); process.exit(1); });