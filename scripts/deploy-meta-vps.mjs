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

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream.on("data", (d) => { const s = d.toString(); out += s; process.stdout.write(s); });
      stream.stderr.on("data", (d) => process.stderr.write(d));
      stream.on("close", (code) => code !== 0 ? reject(new Error(`exit ${code}`)) : resolve(out));
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
  await exec(conn, "export DEBIAN_FRONTEND=noninteractive && apt-get update -qq && apt-get install -y -qq php8.3-fpm php8.3-cli php8.3-mbstring php8.3-xml 2>&1 | tail -5");
  await upload(conn, join(root, "meta-deploy.tar.gz"), "/root/meta-deploy.tar.gz");
  console.log("\nExtracting meta...\n");
  await exec(conn, "mkdir -p /var/www/unotrips-meta && rm -rf /var/www/unotrips-meta/* && tar -xzf /root/meta-deploy.tar.gz -C /var/www/unotrips-meta && ls -la /var/www/unotrips-meta");
  await upload(conn, join(root, "scripts/vps-nginx-dynamic.conf"), "/etc/nginx/sites-available/unotrips.com");
  await exec(conn, "nginx -t && systemctl enable php8.3-fpm && systemctl restart php8.3-fpm && systemctl reload nginx");
  await exec(conn, "curl -sI -k https://127.0.0.1/meta/arunachal/ -H 'Host: unotrips.com' | head -10");
  await exec(conn, "curl -s -k https://127.0.0.1/meta/arunachal/ -H 'Host: unotrips.com' | head -c 300");
  conn.end();
  console.log("\n\nMeta deploy done.");
}

main().catch((e) => { console.error(e); process.exit(1); });