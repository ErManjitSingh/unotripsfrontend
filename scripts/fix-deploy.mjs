import { createReadStream } from "node:fs";
import { Client } from "ssh2";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const password = process.env.VPS_PASSWORD || "Manjitsingh-123";

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => resolve(conn))
      .on("error", reject)
      .connect({
        host: "69.62.76.249",
        port: 22,
        username: "root",
        password,
        readyTimeout: 120000,
      });
  });
}

function exec(conn, cmd, timeoutMs = 900000) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      let stdout = "";
      stream.on("data", (d) => {
        stdout += d.toString();
        process.stdout.write(d);
      });
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
  console.log("Connected — uploading source bundle (no Windows .next)...\n");
  await upload(conn, join(root, "app-deploy.tar.gz"), "/root/app-deploy.tar.gz");
  await upload(conn, join(root, "scripts/vps-nginx-dynamic.conf"), "/etc/nginx/sites-available/unotrips.com");

  await exec(
    conn,
    [
      "set -e",
      "rm -rf /var/www/unotrips-app/*",
      "tar -xzf /root/app-deploy.tar.gz -C /var/www/unotrips-app",
      "cd /var/www/unotrips-app",
      "if [ ! -f .env.production ]; then printf '%s\\n' 'NEXT_PUBLIC_SITE_URL=https://unotrips.com' 'NEXT_PUBLIC_API_URL=https://website.travelwithuno.com' 'HOTELS_API_URL=https://unohotels-backend.onrender.com' 'NEXT_PUBLIC_HOTELS_API_URL=https://unohotels-backend.onrender.com' 'NEXT_PUBLIC_API_BASE=/api/hotels' > .env.production; fi",
      "grep -q NEXT_PUBLIC_API_BASE .env.production || echo 'NEXT_PUBLIC_API_BASE=/api/hotels' >> .env.production",
      "export NODE_ENV=production",
      "npm ci",
      "npm run build",
      "pm2 delete unotrips 2>/dev/null || true",
      "pm2 start npm --name unotrips --cwd /var/www/unotrips-app -- start",
      "pm2 save",
      "ln -sf /etc/nginx/sites-available/unotrips.com /etc/nginx/sites-enabled/unotrips.com",
      "nginx -t",
      "systemctl reload nginx",
      "sleep 4",
      "curl -sI http://127.0.0.1:3000/ | head -5",
      "curl -s -o /dev/null -w 'auth_register:%{http_code}\\n' -X POST http://127.0.0.1:3000/api/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"deploy-check@test.com\",\"password\":\"TestPass123\",\"name\":\"Deploy\",\"phone\":\"9876543210\"}'",
    ].join(" && "),
  );

  conn.end();
  console.log("\nLinux build deploy done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
