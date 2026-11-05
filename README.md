# Castellarano Cover Center – website

Shop website for Castellarano Cover Center (Via Radici Nord 31, Castellarano RE). Italian + English, reviews with admin moderation, no online sales.

No dependencies: Node.js 22.13+ (uses the built-in `node:sqlite`).

```bash
npm start            # http://localhost:3000 – first run prints the secret admin URL + password
npm test             # smoke tests + QR encoder checks
npm run set-password "new password"   # change admin password (prints ADMIN_HASH for hosting)
npm run card [url]   # business card PDF/PNGs + share image (needs Google Chrome); default QR = WhatsApp
```

## Deploy

Needs a host with a **persistent disk** (the SQLite database and uploaded photos live in `DATA_DIR`).
Serverless hosts (Vercel, Netlify) would lose reviews. The `Dockerfile` works on Railway, Fly.io, Render (with disk) or any VPS.

Environment variables:

| Variable | Example | Notes |
|---|---|---|
| `SITE_URL` | `https://www.example.it` | Public URL, used for canonical links/sitemap. Must be https in production. |
| `ADMIN_PATH` | `/admin-<20 random hex chars>` | Secret admin URL. Never link it. |
| `ADMIN_HASH` | output of `npm run set-password` | Only the hash, never the password. |
| `DATA_DIR` | `/data` | Mount the persistent volume here (set in Dockerfile). |
| `TRUST_PROXY` | `1` | Set when behind the host's proxy (set in Dockerfile). |

Back up `DATA_DIR/store.db` and `DATA_DIR/uploads/` regularly.

`config.js` holds the address and defaults; phone, email, Instagram, hours, banner, products and reviews are editable in the admin.
