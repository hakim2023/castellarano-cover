// Builds the site as static files for GitHub Pages (no server: no review form, no admin, no database).
// Content comes from content/*.json, editable directly on github.com (your GitHub login protects it).
// Usage: SITE_URL=https://user.github.io/repo node scripts/build-static.mjs   -> dist/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { biz } from '../config.js';
import { asset, home, privacy, notFound, sitemap, robots, llms, T } from '../views.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE_URL = (process.env.SITE_URL || 'http://localhost:8080').replace(/\/$/, '');
const BASE_PATH = new URL(SITE_URL).pathname.replace(/\/$/, ''); // e.g. "/castellarano-cover" on github.io project sites
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'content', f), 'utf8'));

// settings (same keys the admin page edits in the server version)
const settings = read('settings.json');
for (const k of ['phoneDisplay', 'email', 'instagram', 'hoursText', 'announce_it', 'announce_en']) biz[k] = String(settings[k] ?? biz[k] ?? '');
biz.phone = '+' + biz.phoneDisplay.replace(/\D/g, '');

const cats = read('products.json').map((x, i) => ({ id: i + 1, pos: i, ...x }));
const reviews = read('reviews.json')
  .filter((r) => r.published !== false)
  .map((r) => {
    const rating = Number(r.rating);
    if (!r.name || !r.text || !(rating >= 1 && rating <= 5) || !/^\d{4}-\d{2}-\d{2}$/.test(r.date || '')) throw new Error('Invalid review in content/reviews.json: ' + JSON.stringify(r));
    if (r.photo && !/^[\w.-]+\.(jpe?g|png|webp)$/i.test(r.photo)) throw new Error('Review photo must be a file name inside content/uploads/: ' + r.photo);
    return { name: String(r.name).slice(0, 40), rating, body: String(r.text).slice(0, 600), photo: r.photo || '', created_at: r.date + ' 12:00:00' };
  })
  .sort((a, b) => b.created_at.localeCompare(a.created_at));
const stats = { count: reviews.length, avg: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0 };

asset.v = crypto.createHash('sha1').update(fs.readFileSync(path.join(root, 'public/style.css'))).update(fs.readFileSync(path.join(root, 'public/app.js'))).update(fs.readFileSync(path.join(root, 'public/favicon.svg'))).digest('hex').slice(0, 10);

// GitHub Pages cannot send HTTP security headers, so the CSP goes in a meta tag.
const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; frame-src https://www.google.com; base-uri 'none'; form-action 'none'"><meta name="referrer" content="strict-origin-when-cross-origin">`;
// Root-relative links ("/style.css", "/en") must include the repo sub-path on github.io.
const prefix = (html) => html.replace(/(href|src|action)="\/(?!\/)/g, `$1="${BASE_PATH}/`);
const page = (html) => prefix(html.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + CSP));

fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), dist, { recursive: true });
if (fs.existsSync(path.join(root, 'content/uploads'))) fs.cpSync(path.join(root, 'content/uploads'), path.join(dist, 'uploads'), { recursive: true });
const write = (rel, data) => { fs.mkdirSync(path.dirname(path.join(dist, rel)), { recursive: true }); fs.writeFileSync(path.join(dist, rel), data); };

const ctx = { base: SITE_URL, cats, reviews, stats, flash: null, static: true };
write('index.html', page(home(ctx, T.it)));
write('en.html', page(home(ctx, T.en))); // GitHub Pages serves /en from en.html
write('privacy.html', page(privacy(ctx, T.it)));
write('en/privacy.html', page(privacy(ctx, T.en)));
write('404.html', page(notFound(ctx)));
write('sitemap.xml', sitemap(SITE_URL));
write('robots.txt', robots(SITE_URL));
write('llms.txt', llms(SITE_URL, cats));
write('.nojekyll', '');
// asset files that contain root-relative URLs
const css = path.join(dist, 'style.css');
fs.writeFileSync(css, fs.readFileSync(css, 'utf8').replace(/url\(\/fonts\//g, `url(${BASE_PATH}/fonts/`));
const mf = path.join(dist, 'site.webmanifest');
fs.writeFileSync(mf, fs.readFileSync(mf, 'utf8').replace(/"\/icon-/g, `"${BASE_PATH}/icon-`));
console.log(`Built dist/ for ${SITE_URL} (${reviews.length} reviews, ${cats.length} products)`);
