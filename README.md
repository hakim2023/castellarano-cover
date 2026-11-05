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

## GitHub Pages (free, static)

Pushing to `main` runs `.github/workflows/pages.yml`: tests, `npm run build:static`, publish `dist/`.
The static version has **no server**: reviews come from `content/reviews.json` (see `content/README.md`), the review form becomes
Google / WhatsApp / email buttons, and there is no admin page (edit `content/*.json` on github.com instead).
For a custom domain, add it in Settings → Pages and set the repository variable `SITE_URL` to `https://your-domain`.

## Netlify (live site: https://castellarano-cover.store)

`netlify/` holds the live version: same templates, data in Netlify Blobs (EU), rate-limited functions for the review form,
admin login and password reset. Environment variables on Netlify:

| Variable | Notes |
|---|---|
| `ADMIN_PATH` | Secret admin URL path. |
| `ADMIN_HASH` | From `npm run set-password`. Changing it on Netlify overrides a password set by email. |
| `SITE_URL` | `https://castellarano-cover.store` |
| `RESEND_API_KEY` | Resend.com key for the "forgot / change password" emails to `adminEmail` in `config.js`. |
| `MAIL_FROM` | Optional, e.g. `Castellarano Cover <admin@castellarano-cover.store>` once the domain is verified in Resend. |

Admin: Italian / English / Arabic, reset-to-initial-settings button (reviews are kept).
