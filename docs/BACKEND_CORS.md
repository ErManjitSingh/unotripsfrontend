# Backend CORS configuration (Uno Hotels API)

Frontend: **UNO Trips** (`uno_nextjs_front`)  
API: **https://unohotels-backend.onrender.com**

## Problem

Browser requests from the website send an `Origin` header. If that origin is not in the API allowlist, the browser blocks the response with a **CORS error** — even when the API returns 200 on the server.

**Currently allowed (tested):**

| Origin | CORS preflight |
|--------|----------------|
| `http://localhost:3000` | Allowed |
| `http://localhost:3001` | Blocked |
| `http://127.0.0.1:3000` | Blocked |
| `https://unotrips.com` | Blocked |
| `https://www.unotrips.com` | Blocked |

Next.js dev often runs on **port 3001** when 3000 is busy — that alone breaks login/signup/bookings if the frontend calls the API directly.

## Origins to add on the backend

Add these to `CORS_ORIGINS` (or equivalent) on Render / `.env`:

```env
# Development
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
http://127.0.0.1:3001

# Production (UNO Trips)
https://unotrips.com
https://www.unotrips.com

# Staging / preview (add your real preview URLs)
# https://staging.unotrips.com
```

Optional (if you test from other tools):

```env
http://localhost:5173
https://website.travelwithuno.com
```

## FastAPI example

If the API is FastAPI, something like:

```python
import os

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001,https://unotrips.com,https://www.unotrips.com",
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # or: Content-Type, Authorization, Accept
)
```

**Important:**

- `allow_credentials=True` if the frontend sends cookies (we use `Authorization: Bearer` — still fine with explicit origins, not `*`).
- Do **not** use `allow_origins=["*"]` with `allow_credentials=True`.
- Handle **OPTIONS** preflight for all `/v1/*` routes.

## How to verify after deploy

```bash
curl -i -X OPTIONS "https://unohotels-backend.onrender.com/v1/auth/login" \
  -H "Origin: https://unotrips.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
```

Expected headers in response:

```
Access-Control-Allow-Origin: https://unotrips.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: content-type, authorization
```

Repeat with `Origin: http://localhost:3001`.

## Frontend workaround (already in this repo)

The Next.js app calls **`/api/hotels/v1/...`** (same origin), not the Render URL directly:

- **Dev:** `next.config.ts` rewrites `/api/hotels/*` → backend
- **Apache static host:** `public/.htaccess` — `ProxyPass /api/hotels/` (needs `mod_proxy`)
- **Netlify:** `public/_redirects`
- **Vercel:** `vercel.json` rewrites

### Signup shows “Could not reach server” on live

Static export (`output: "export"`) does **not** run Next.js rewrites in production. If `/api/hotels` is not proxied on the host, signup/login get **404 HTML** instead of JSON.

**Fix (pick one):**

1. Enable proxy on the host (recommended) — deploy `out/` with `.htaccess` / `_redirects` / `vercel.json` from this repo.
2. Set `NEXT_PUBLIC_HOTELS_USE_PROXY=false` at build time **and** add `https://unotrips.com` (+ `www`) to backend `CORS_ORIGINS`.

Test proxy after deploy:

```bash
curl -i "https://unotrips.com/api/hotels/v1/auth/login" -X OPTIONS
```

Expect JSON or CORS headers from the backend, not an HTML 404 page.

So CORS is avoided for normal users **if** the proxy is enabled. Backend CORS is still required for:

- Swagger UI “Try it out” from another domain
- Mobile apps / Postman is fine (no CORS)
- Any client that calls `https://unohotels-backend.onrender.com` directly from the browser

## Render.com

Set environment variable on the backend service:

```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://unotrips.com,https://www.unotrips.com
```

Redeploy after changing env vars.
