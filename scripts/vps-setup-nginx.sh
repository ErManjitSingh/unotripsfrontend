#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx
install -d -m 755 /var/www/unotrips.com/public_html
cat > /etc/nginx/sites-available/unotrips.com <<'"'"'NGINX'"'"'
server {
    listen 80;
    listen [::]:80;
    server_name unotrips.com www.unotrips.com;
    root /var/www/unotrips.com/public_html;
    index index.html;
    location /api/hotels/ {
        proxy_pass https://unohotels-backend.onrender.com/;
        proxy_ssl_server_name on;
        proxy_set_header Host unohotels-backend.onrender.com;
    }
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/unotrips.com /etc/nginx/sites-enabled/unotrips.com
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx
echo NGINX_OK