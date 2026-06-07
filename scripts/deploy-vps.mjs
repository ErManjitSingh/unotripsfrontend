import { createReadStream } from "node:fs";
import { Client } from "ssh2";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = "69.62.76.249";
const user = "root";
const password = process.env.VPS_PASSWORD || "Manjitsingh-123";

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on("ready", () => resolve(conn)).on("error", reject)
      .connect({ host, port: 22, username: user, password, readyTimeout: 60000 });
  });
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = "", stderr = "";
      stream.on("data", (d) => { stdout += d.toString(); });
      stream.stderr.on("data", (d) => { stderr += d.toString(); });
      stream.on("close", (code) => {
        if (code !== 0) reject(new Error(`exit ${code}: ${stderr || stdout}`));
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
  console.log("Connected to VPS");
  await upload(conn, join(root, "scripts/vps-setup-nginx.sh"), "/root/vps-setup-nginx.sh");
  console.log("Running nginx setup...");
  console.log((await exec(conn, "chmod +x /root/vps-setup-nginx.sh && bash /root/vps-setup-nginx.sh")).trim());
  console.log("Uploading site archive...");
  await upload(conn, join(root, "out-deploy.tar.gz"), "/root/out-deploy.tar.gz");
  console.log("Extracting...");
  console.log((await exec(conn, "rm -rf /var/www/unotrips.com/public_html/* && tar -xzf /root/out-deploy.tar.gz -C /var/www/unotrips.com/public_html && test -f /var/www/unotrips.com/public_html/index.html && echo SITE_OK")).trim());
  console.log("SSL...");
  try {
    console.log((await exec(conn, "certbot --nginx -d unotrips.com -d www.unotrips.com --non-interactive --agree-tos -m info@unotrips.com --redirect 2>&1 || true")).trim());
  } catch (e) { console.warn(e.message); }
  console.log((await exec(conn, "curl -sI http://127.0.0.1/ | head -5")).trim());
  conn.end();
  console.log("Done: https://unotrips.com");
}

main().catch((e) => { console.error(e); process.exit(1); });