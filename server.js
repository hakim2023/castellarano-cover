import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { biz } from './config.js';
import { ICON_CHOICES } from './icons.js';
import { asset, home, privacy, adminLogin, adminPanel, notFound, sitemap, robots, llms, T } from './views.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(root, '.env');

// Local first run: create .env with a random secret admin path + password (printed once, only the hash is stored).
// On a host, set SITE_URL, ADMIN_PATH, ADMIN_HASH (and DATA_DIR, TRUST_PROXY) as environment variables instead.
if (fs.existsSync(envFile)) process.loadEnvFile(envFile); // never overrides variables already set by the host
else if (!process.env.ADMIN_HASH) {
  const pw = crypto.randomBytes(9).toString('base64url');
  const salt = crypto.randomBytes(16);
  const hash = `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
  const adminPath = '/admin-' + crypto.randomBytes(10).toString('hex');
  fs.writeFileSync(envFile, `SITE_URL=http://localhost:3000\nADMIN_PATH=${adminPath}\nADMIN_HASH=${hash}\n`, { mode: 0o600 });
  console.log(`\n=== FIRST RUN: save these, the password is not stored ===\nAdmin URL : http://localhost:3000${adminPath}\nPassword  : ${pw}\n==========================================\n`);
  process.loadEnvFile(envFile);
}
for (const k of ['SITE_URL', 'ADMIN_PATH', 'ADMIN_HASH']) if (!process.env[k]) throw new Error(`Missing environment variable ${k}`);
if (!/^\/[A-Za-z0-9_-]{12,}$/.test(process.env.ADMIN_PATH)) throw new Error('ADMIN_PATH must look like /admin-<random letters/digits>');
const A = process.env.ADMIN_PATH;
asset.v = crypto.createHash('sha1').update(fs.readFileSync(path.join(root, 'public', 'style.css'))).update(fs.readFileSync(path.join(root, 'public', 'app.js'))).update(fs.readFileSync(path.join(root, 'public', 'favicon.svg'))).digest('hex').slice(0, 10);
const BASE = process.env.SITE_URL.replace(/\/$/, '');
const SECURE = BASE.startsWith('https');
const PORT = process.env.PORT || 3000;

// DATA_DIR must point at a persistent disk/volume in production (reviews + uploaded photos live here).
const DATA = process.env.DATA_DIR || path.join(root, 'data');
fs.mkdirSync(DATA, { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'store.db'));
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS reviews(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','approved','hidden')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
try { db.exec("ALTER TABLE reviews ADD COLUMN photo TEXT NOT NULL DEFAULT ''"); } catch {} // already migrated
db.exec(`CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY, pos INTEGER NOT NULL DEFAULT 0, icon TEXT NOT NULL, title_it TEXT NOT NULL, title_en TEXT NOT NULL, desc_it TEXT NOT NULL DEFAULT '', desc_en TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
try { fs.chmodSync(path.join(DATA, 'store.db'), 0o600); } catch {}
const UPLOADS = path.join(DATA, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

// Seed product categories once; the owner edits them from admin afterwards.
if (!db.prepare('SELECT 1 FROM categories').get()) {
  const icons = ['smartphone', 'shield-check', 'plug-zap', 'battery-charging', 'headphones', 'car'];
  T.it.cats.forEach(([ti, di], i) => db.prepare('INSERT INTO categories(pos,icon,title_it,title_en,desc_it,desc_en) VALUES(?,?,?,?,?,?)').run(i, icons[i], ti, T.en.cats[i][0], di, T.en.cats[i][1]));
}
// Editable settings override config.js defaults.
const SETTING_KEYS = ['phoneDisplay', 'email', 'instagram', 'hoursText', 'announce_it', 'announce_en'];
biz.announce_it = ''; biz.announce_en = '';
function applySettings() {
  for (const { key, value } of db.prepare('SELECT key,value FROM settings').all()) if (SETTING_KEYS.includes(key)) biz[key] = value;
  biz.phone = '+' + biz.phoneDisplay.replace(/\D/g, '');
}
applySettings();

const q = {
  approved: db.prepare("SELECT name,rating,body,photo,created_at FROM reviews WHERE status='approved' ORDER BY id DESC LIMIT 50"),
  stats: db.prepare("SELECT COUNT(*) count, COALESCE(AVG(rating),0) avg FROM reviews WHERE status='approved'"),
  all: db.prepare("SELECT * FROM reviews ORDER BY status='pending' DESC, id DESC"),
  insert: db.prepare('INSERT INTO reviews(name,email,rating,body,status) VALUES(?,?,?,?,?)'),
  one: db.prepare('SELECT * FROM reviews WHERE id=?'),
  insert2: db.prepare('INSERT INTO reviews(name,email,rating,body,status,photo) VALUES(?,?,?,?,?,?)'),
  update: db.prepare('UPDATE reviews SET name=?,rating=?,body=?,status=?,photo=? WHERE id=?'),
  del: db.prepare('DELETE FROM reviews WHERE id=?'),
  cats: db.prepare('SELECT * FROM categories ORDER BY pos,id'),
  catIns: db.prepare('INSERT INTO categories(pos,icon,title_it,title_en,desc_it,desc_en) VALUES(?,?,?,?,?,?)'),
  catUpd: db.prepare('UPDATE categories SET pos=?,icon=?,title_it=?,title_en=?,desc_it=?,desc_en=? WHERE id=?'),
  catDel: db.prepare('DELETE FROM categories WHERE id=?'),
  setting: db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'),
};

// ---- helpers ----
const SEC = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; frame-src https://www.google.com; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  ...(SECURE && { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' }),
};
const MIME = { '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function send(req, res, status, body, type = 'text/html; charset=utf-8', h = {}) {
  let out = Buffer.from(body);
  const headers = { 'Content-Type': type, 'Cache-Control': 'no-cache', Vary: 'Accept-Encoding', ...SEC, ...h };
  if (out.length > 1024 && /text|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    out = zlib.gzipSync(out);
    headers['Content-Encoding'] = 'gzip';
  }
  headers['Content-Length'] = out.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : out);
}
const redirect = (res, to, h = {}) => { res.writeHead(303, { Location: to, ...SEC, ...h }); res.end(); };

const clientIp = (req) => (process.env.TRUST_PROXY ? (req.headers['x-forwarded-for'] || '').split(',').pop().trim() : '') || req.socket.remoteAddress;
const hits = new Map();
function limited(key, max, ms) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < ms);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (now - v[v.length - 1] > 3600e3) hits.delete(k); for (const [k, s] of sessions) if (s.exp < now) sessions.delete(k); }, 600e3).unref();

function readBuf(req, max) {
  return new Promise((ok, bad) => {
    const chunks = []; let n = 0;
    req.on('data', (d) => { n += d.length; if (n > max) { bad(new Error('big')); req.destroy(); } else chunks.push(d); });
    req.on('end', () => ok(Buffer.concat(chunks)));
    req.on('error', bad);
  });
}
// Returns { p: URLSearchParams, file: {data}|null } for urlencoded or multipart bodies.
async function readForm(req, max = 10_000) {
  const buf = await readBuf(req, max);
  const m = /multipart\/form-data;.*boundary=(?:"([^"]+)"|([^;]+))/i.exec(req.headers['content-type'] || '');
  if (!m) return { p: new URLSearchParams(buf.toString()), file: null };
  const delim = Buffer.from('--' + (m[1] || m[2]));
  const p = new URLSearchParams(); let file = null;
  let pos = buf.indexOf(delim);
  while (pos !== -1) {
    const start = pos + delim.length;
    if (buf.subarray(start, start + 2).toString() === '--') break;
    const hEnd = buf.indexOf('\r\n\r\n', start), next = buf.indexOf(delim, hEnd);
    if (hEnd < 0 || next < 0) break;
    const head = buf.subarray(start, hEnd).toString('latin1');
    const data = buf.subarray(hEnd + 4, next - 2);
    const name = /name="([^"]*)"/.exec(head)?.[1];
    if (/filename="/.test(head)) { if (data.length) file = { data }; } else if (name) p.append(name, data.toString('utf8'));
    pos = next;
  }
  return { p, file };
}
// Accept only real JPEG/PNG/WebP (checked by magic bytes); stored under a random name.
function savePhoto(file) {
  if (!file || file.data.length > 4 * 1024 * 1024) return '';
  const d = file.data;
  const tag = d.subarray(0, 4).toString('latin1');
  const ext = d[0] === 0xff && d[1] === 0xd8 && d[2] === 0xff ? 'jpg' : tag === '\x89PNG' ? 'png' : tag === 'RIFF' && d.subarray(8, 12).toString('latin1') === 'WEBP' ? 'webp' : '';
  if (!ext) return '';
  const name = crypto.randomBytes(16).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(UPLOADS, name), d);
  return name;
}
const dropPhoto = (name) => { if (/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(name || '')) fs.rmSync(path.join(UPLOADS, name), { force: true }); };
const str = (p, k, max) => (p.get(k) || '').trim().slice(0, max);

// ---- admin sessions ----
const sessions = new Map();
function session(req) {
  const m = /(?:^|; )sid=([a-f0-9]{64})/.exec(req.headers.cookie || '');
  const s = m && sessions.get(m[1]);
  return s && s.exp > Date.now() ? { id: m[1], ...s } : null;
}
function passwordOk(pw) {
  const [salt, h] = process.env.ADMIN_HASH.split(':');
  const x = crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 64);
  return crypto.timingSafeEqual(x, Buffer.from(h, 'hex'));
}
const csrfOk = (s, given) => s && given.length === s.csrf.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(s.csrf));

async function admin(req, res) {
  const NS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  const s = session(req);
  if (req.method === 'GET' || req.method === 'HEAD') {
    return send(req, res, 200, s ? adminPanel(A, s.csrf, { reviews: q.all.all(), cats: q.cats.all() }) : adminLogin(A), undefined, NS);
  }
  const { p, file } = await readForm(req, 5.5 * 1024 * 1024);
  const op = p.get('op');
  if (op === 'login') {
    if (limited('login:' + clientIp(req), 5, 15 * 60e3)) return send(req, res, 429, adminLogin(A, 'Too many attempts. Try again in 15 minutes.'), undefined, NS);
    if (!passwordOk(str(p, 'password', 200))) return send(req, res, 401, adminLogin(A, 'Wrong password.'), undefined, NS);
    const id = crypto.randomBytes(32).toString('hex');
    sessions.set(id, { csrf: crypto.randomBytes(24).toString('hex'), exp: Date.now() + 2 * 3600e3 });
    return redirect(res, A, { ...NS, 'Set-Cookie': `sid=${id}; HttpOnly; SameSite=Strict; Path=${A}; Max-Age=7200${SECURE ? '; Secure' : ''}` });
  }
  if (!csrfOk(s, str(p, 'csrf', 100))) return send(req, res, 403, 'Forbidden', 'text/plain', NS);
  const id = Number(p.get('id'));
  const rev = () => {
    const rating = Number(p.get('rating')), name = str(p, 'name', 40), body = str(p, 'body', 600), status = p.get('status');
    return name && body.length >= 10 && rating >= 1 && rating <= 5 && ['approved', 'pending', 'hidden'].includes(status) ? { rating, name, body, status } : null;
  };
  const cat = () => {
    const icon = p.get('icon'), pos = Math.min(999, Math.max(0, parseInt(p.get('pos')) || 0));
    const v = [pos, icon, str(p, 'title_it', 60), str(p, 'title_en', 60), str(p, 'desc_it', 160), str(p, 'desc_en', 160)];
    return ICON_CHOICES.includes(icon) && v[2] && v[3] ? v : null;
  };
  if (op === 'logout') { sessions.delete(s.id); return redirect(res, A, { ...NS, 'Set-Cookie': `sid=; Path=${A}; Max-Age=0` }); }
  if (op === 'review_save' && q.one.get(id)) {
    const old = q.one.get(id), r = rev();
    if (r) {
      let photo = old.photo;
      const np = savePhoto(file);
      if (np || p.get('remove_photo')) { dropPhoto(old.photo); photo = np; }
      q.update.run(r.name, r.rating, r.body, r.status, photo, id);
    }
  } else if (op === 'review_delete') { dropPhoto(q.one.get(id)?.photo); q.del.run(id); }
  else if (op === 'review_add') { const r = rev(); if (r) q.insert2.run(r.name, '', r.rating, r.body, r.status, savePhoto(file)); }
  else if (op === 'cat_save') { const v = cat(); if (v) (id ? q.catUpd.run(...v, id) : q.catIns.run(...v)); }
  else if (op === 'cat_delete') q.catDel.run(id);
  else if (op === 'settings_save') {
    const phoneDisplay = str(p, 'phoneDisplay', 30), email = str(p, 'email', 120), instagram = str(p, 'instagram', 200);
    if (phoneDisplay.replace(/\D/g, '').length >= 8 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && /^https:\/\//.test(instagram)) {
      for (const [k, v] of Object.entries({ phoneDisplay, email, instagram, hoursText: str(p, 'hoursText', 400), announce_it: str(p, 'announce_it', 160), announce_en: str(p, 'announce_en', 160) })) q.setting.run(k, v);
      applySettings();
    }
  }
  redirect(res, A, NS);
}

// ---- public review ----
async function postReview(req, res) {
  const { p } = await readForm(req);
  const lang = p.get('lang') === 'en' ? 'en' : 'it';
  const back = (code) => redirect(res, `${T[lang].home}?r=${code}#review-form`);
  if (p.get('website')) return back('ok'); // honeypot: pretend success to bots
  if (limited('rev:' + clientIp(req), 3, 3600e3)) return back('rate');
  const name = str(p, 'name', 40), email = str(p, 'email', 120), body = str(p, 'body', 600), rating = Number(p.get('rating'));
  if (name.length < 2 || body.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return back('invalid');
  if (p.get('consent') !== '1') return back('consent');
  q.insert.run(name, email.toLowerCase(), rating, body, 'pending');
  back('ok');
}

// ---- router ----
const PAGES = { '/': 'it', '/en': 'en', '/en/': 'en' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, BASE);
    const p = decodeURIComponent(url.pathname);
    const isRead = req.method === 'GET' || req.method === 'HEAD';

    if (!isRead && req.method !== 'POST') return send(req, res, 405, 'Method Not Allowed', 'text/plain');
    if (req.method === 'POST') {
      const o = req.headers.origin;
      if (o && new URL(o).host !== req.headers.host) return send(req, res, 403, 'Forbidden', 'text/plain');
      if (p === '/review') return await postReview(req, res);
      if (p === A) return await admin(req, res);
      return send(req, res, 404, 'Not found', 'text/plain');
    }
    if (p === A) return await admin(req, res);

    const ctx = { base: BASE, cats: q.cats.all() };
    if (PAGES[p]) {
      ctx.reviews = q.approved.all();
      ctx.stats = q.stats.get();
      ctx.flash = url.searchParams.get('r');
      return send(req, res, 200, home(ctx, T[PAGES[p]]));
    }
    if (p === '/privacy') return send(req, res, 200, privacy(ctx, T.it));
    if (p === '/en/privacy') return send(req, res, 200, privacy(ctx, T.en));
    if (p === '/sitemap.xml') return send(req, res, 200, sitemap(BASE), MIME['.xml']);
    if (p === '/robots.txt') return send(req, res, 200, robots(BASE), MIME['.txt']);
    if (p === '/llms.txt') return send(req, res, 200, llms(BASE, ctx.cats), MIME['.txt']);

    const up = /^\/uploads\/([a-f0-9]{32}\.(jpg|png|webp))$/.exec(p);
    if (up && fs.existsSync(path.join(UPLOADS, up[1]))) return send(req, res, 200, fs.readFileSync(path.join(UPLOADS, up[1])), up[2] === 'jpg' ? 'image/jpeg' : 'image/' + up[2], { 'Cache-Control': 'public, max-age=604800' });

    const file = path.join(root, 'public', p);
    if (file.startsWith(path.join(root, 'public') + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      return send(req, res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream', { 'Cache-Control': /^\/(img|fonts)\//.test(p) ? 'public, max-age=2592000' : 'public, max-age=86400' });
    }
    send(req, res, 404, notFound(ctx));
  } catch (e) {
    if (e.message === 'big') return send(req, res, 413, 'Too large', 'text/plain');
    console.error(e);
    send(req, res, 500, 'Server error', 'text/plain');
  }
});
server.listen(PORT, () => console.log(`Listening on :${PORT}`));
// Hosts stop containers with SIGTERM: finish requests and close the database cleanly.
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => { db.close(); process.exit(0); }));
