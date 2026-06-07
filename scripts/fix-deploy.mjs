import { createReadStream } from "node:fs";
import { Client } from "ssh2";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const conn = new Client();
conn.on("ready", async () => {
  const exec = (cmd) => new Promise((res, rej) => {
    conn.exec(cmd, { pty: true }, (err, s) => {
      let o = ""; s.on("data", d => o += d); s.stderr.on("data", d => o += d);
      s.on("close", c => c ? rej(new Error(o)) : res(o));
    });
  });
  const upload = (local, remote) => new Promise((res, rej) => {
    conn.sftp((err, sftp) => {
      const ws = sftp.createWriteStream(remote);
      ws.on("close", res); ws.on("error", rej);
      createReadStream(local).pipe(ws);
    });
  });
  try {
    console.log("Uploading...");
    await upload(join(root, "app-deploy.tar.gz"), "/root/app-deploy.tar.gz");
    await upload(join(root, "scripts/vps-nginx-dynamic.conf"), "/etc/nginx/sites-available/unotrips.com");
    console.log(await exec(`set -e
rm -rf /var/www/unotrips-app/*
tar -xzf /root/app-deploy.tar.gz -C /var/www/unotrips-app
cd /var/www/unotrips-app && npm ci --omit=dev
pm2 delete unotrips 2>/dev/null || true
pm2 start npm --name unotrips --cwd /var/www/unotrips-app -- start
pm2 save
ln -sf /etc/nginx/sites-available/unotrips.com /etc/nginx/sites-enabled/unotrips.com
nginx -t && systemctl reload nginx
sleep 4
curl -s http://127.0.0.1:3000/api/hotels/v1/hotels/search?limit=5 | head -c 200
echo
curl -sI http://127.0.0.1:3000/hotels | head -3
`));
  } catch (e) { console.error(e.message); }
  conn.end();
}).connect({ host: "69.62.76.249", port: 22, username: "root", password: "Manjitsingh-123" });