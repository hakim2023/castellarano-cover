// Netlify version of server.js: same templates (views.js), data in Netlify Blobs instead of SQLite.
// Env vars (Netlify UI, scope Functions): ADMIN_PATH, ADMIN_HASH (from `npm run set-password`), optional SITE_URL.
import crypto from 'node:crypto';
import { biz } from '../../config.js';
import { ICON_CHOICES } from '../../icons.js';
import { asset, home, privacy, adminLogin, adminPanel, notFound, sitemap, robots, llms, T } from '../../views.js';

// EU region: reviews contain customer emails (GDPR). Must be passed on every getStore call.
const REGION = 'eu-central-1';
let testStore = null;
export const useTestStore = (s) => { testStore = s; };
async function store() {
  if (testStore) return testStore;
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: 'cover', region: REGION, consistency: 'strong' });
}
const env = (k) => globalThis.Netlify?.env?.get(k) ?? process.env[k];
export const LOGIN_PATH = '/api/admin-login';

const SEC = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; frame-src https://www.google.com; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()', 'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};
const NS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const html = (body, status = 200, h = {}) => new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SEC, ...h } });
const text = (body, type, status = 200, h = {}) => new Response(body, { status, headers: { 'Content-Type': type, ...SEC, ...h } });
const redirect = (to, h = {}) => new Response(null, { status: 303, headers: { Location: to, ...SEC, ...h } });
// Public pages: browsers revalidate, Netlify's CDN keeps them up to 60 s (admin changes show within a minute).
const CDN = { 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=60, stale-while-revalidate=300' };
const str = (p, k, max) => String(p.get(k) ?? '').trim().slice(0, max);
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const sameOrigin = (req) => { const o = req.headers.get('origin'); return !o || new URL(o).host === new URL(req.url).host; };

// ---- data ----
const DEFAULT_ICONS = ['smartphone', 'shield-check', 'plug-zap', 'battery-charging', 'headphones', 'car'];
const defaultCats = () => T.it.cats.map(([ti, di], i) => ({ id: i + 1, pos: i, icon: DEFAULT_ICONS[i], title_it: ti, title_en: T.en.cats[i][0], desc_it: di, desc_en: T.en.cats[i][1] }));
const getCats = async (s) => ((await s.get('products', { type: 'json' })) ?? defaultCats()).sort((a, b) => a.pos - b.pos || a.id - b.id);
async function allReviews(s) {
  const { blobs } = await s.list({ prefix: 'reviews/' });
  return (await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' })))).filter(Boolean);
}
const SETTING_KEYS = ['phoneDisplay', 'email', 'instagram', 'hoursText', 'announce_it', 'announce_en'];
const DEFAULTS = Object.fromEntries(SETTING_KEYS.map((k) => [k, biz[k] ?? '']));
async function applySettings(s) {
  const saved = (await s.get('settings', { type: 'json' })) ?? {};
  for (const k of SETTING_KEYS) biz[k] = String(saved[k] ?? DEFAULTS[k]);
  biz.phone = '+' + biz.phoneDisplay.replace(/\D/g, '');
}

// ---- admin session: stateless signed cookie (functions keep no memory between requests) ----
const key = () => crypto.createHash('sha256').update('session:' + env('ADMIN_HASH')).digest(); // new password = old sessions invalid
const sign = (v) => crypto.createHmac('sha256', key()).update(v).digest('hex');
const safeEq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function newSessionCookie() {
  const exp = String(Date.now() + 2 * 3600e3);
  return `sid=${exp}.${sign(exp)}; HttpOnly; Secure; SameSite=Strict; Path=${env('ADMIN_PATH')}; Max-Age=7200`;
}
function session(req) {
  const m = /(?:^|; )sid=(\d+)\.([a-f0-9]{64})/.exec(req.headers.get('cookie') || '');
  if (!m || Number(m[1]) < Date.now() || !safeEq(m[2], sign(m[1]))) return null;
  return { csrf: sign('csrf:' + m[1] + m[2]) };
}
export function passwordOk(pw) {
  const [salt, h] = String(env('ADMIN_HASH')).split(':');
  if (!salt || !h) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 64), Buffer.from(h, 'hex'));
}

// ---- photos (admin uploads only): real JPEG/PNG/WebP, max 4 MB ----
async function savePhoto(s, file) {
  if (!file || typeof file === 'string' || !file.size || file.size > 4 * 1024 * 1024) return '';
  const d = Buffer.from(await file.arrayBuffer()), tag = d.subarray(0, 4).toString('latin1');
  const ext = d[0] === 0xff && d[1] === 0xd8 && d[2] === 0xff ? 'jpg' : tag === '\x89PNG' ? 'png' : tag === 'RIFF' && d.subarray(8, 12).toString('latin1') === 'WEBP' ? 'webp' : '';
  if (!ext) return '';
  const name = crypto.randomBytes(16).toString('hex') + '.' + ext;
  await s.set('photos/' + name, d);
  return name;
}
const dropPhoto = async (s, name) => { if (/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(name || '')) await s.delete('photos/' + name); };

// ---- handlers ----
const PAGES = { '/': 'it', '/en': 'en', '/en/': 'en' };
export async function handleSite(req, context = {}) {
  const url = new URL(req.url), p = decodeURIComponent(url.pathname);
  const base = (env('SITE_URL') || context.site?.url || url.origin).replace(/\/$/, '');
  asset.v = String(context.deploy?.id || 'dev').slice(-10);
  const A = env('ADMIN_PATH');
  if (!A || !/^\/[A-Za-z0-9_-]{12,}$/.test(A) || !env('ADMIN_HASH')) return text('Site not configured: set ADMIN_PATH and ADMIN_HASH.', 'text/plain', 500);
  const s = await store();
  if (p === A) return admin(req, s, A);
  if (req.method !== 'GET' && req.method !== 'HEAD') return text('Method Not Allowed', 'text/plain', 405);
  await applySettings(s);
  const ctx = { base, cats: await getCats(s) };
  if (PAGES[p]) {
    const rows = (await allReviews(s)).filter((r) => r.status === 'approved').sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 50);
    ctx.reviews = rows;
    ctx.stats = { count: rows.length, avg: rows.length ? rows.reduce((t, r) => t + r.rating, 0) / rows.length : 0 };
    ctx.flash = url.searchParams.get('r');
    return html(home(ctx, T[PAGES[p]]), 200, ctx.flash ? { 'Cache-Control': 'no-store' } : CDN);
  }
  if (p === '/privacy') return html(privacy(ctx, T.it), 200, CDN);
  if (p === '/en/privacy') return html(privacy(ctx, T.en), 200, CDN);
  if (p === '/sitemap.xml') return text(sitemap(base), 'application/xml; charset=utf-8', 200, CDN);
  if (p === '/robots.txt') return text(robots(base), 'text/plain; charset=utf-8', 200, CDN);
  if (p === '/llms.txt') return text(llms(base, ctx.cats), 'text/plain; charset=utf-8', 200, CDN);
  const up = /^\/uploads\/([a-f0-9]{32}\.(jpg|png|webp))$/.exec(p);
  if (up) {
    const data = await s.get('photos/' + up[1], { type: 'arrayBuffer' });
    if (data) return new Response(data, { headers: { 'Content-Type': up[2] === 'jpg' ? 'image/jpeg' : 'image/' + up[2], 'Cache-Control': 'public, max-age=604800', ...SEC } });
  }
  return html(notFound(ctx), 404);
}

async function admin(req, s, A) {
  const sess = session(req);
  await applySettings(s);
  if (req.method === 'GET' || req.method === 'HEAD') {
    if (!sess) return html(adminLogin(A, '', LOGIN_PATH), 200, NS);
    // pending first, then newest
    const reviews = (await allReviews(s)).sort((a, b) => (b.status === 'pending') - (a.status === 'pending') || b.created_at.localeCompare(a.created_at));
    return html(adminPanel(A, sess.csrf, { reviews, cats: await getCats(s) }), 200, NS);
  }
  if (req.method !== 'POST' || !sameOrigin(req)) return text('Forbidden', 'text/plain', 403, NS);
  const form = await req.formData();
  const p = new URLSearchParams([...form.entries()].filter(([, v]) => typeof v === 'string'));
  if (!sess || !safeEq(str(p, 'csrf', 100), sess.csrf)) return text('Forbidden', 'text/plain', 403, NS);
  const op = p.get('op'), id = str(p, 'id', 40), file = form.get('photo');
  const rev = () => {
    const rating = Number(p.get('rating')), name = str(p, 'name', 40), body = str(p, 'body', 600), status = p.get('status');
    return name && body.length >= 10 && rating >= 1 && rating <= 5 && ['approved', 'pending', 'hidden'].includes(status) ? { rating, name, body, status } : null;
  };
  const reviewKey = /^\d{1,30}$/.test(id) ? 'reviews/' + id : null;
  if (op === 'logout') return redirect(A, { ...NS, 'Set-Cookie': `sid=; Path=${A}; Max-Age=0; Secure` });
  if (op === 'review_save' && reviewKey) {
    const old = await s.get(reviewKey, { type: 'json' }), r = rev();
    if (old && r) {
      let photo = old.photo;
      const np = await savePhoto(s, file);
      if (np || p.get('remove_photo')) { await dropPhoto(s, old.photo); photo = np; }
      await s.setJSON(reviewKey, { ...old, ...r, photo });
    }
  } else if (op === 'review_delete' && reviewKey) {
    const old = await s.get(reviewKey, { type: 'json' });
    if (old) { await dropPhoto(s, old.photo); await s.delete(reviewKey); }
  } else if (op === 'review_add') {
    const r = rev();
    if (r) { const nid = String(Date.now()) + String(crypto.randomInt(1000)).padStart(3, '0'); await s.setJSON('reviews/' + nid, { id: nid, email: '', created_at: now(), ...r, photo: await savePhoto(s, file) }); }
  } else if (op === 'cat_save' || op === 'cat_delete') {
    const cats = await getCats(s), cid = Number(id);
    if (op === 'cat_delete') await s.setJSON('products', cats.filter((c) => c.id !== cid));
    else {
      const icon = p.get('icon'), pos = Math.min(999, Math.max(0, parseInt(p.get('pos')) || 0));
      const v = { pos, icon, title_it: str(p, 'title_it', 60), title_en: str(p, 'title_en', 60), desc_it: str(p, 'desc_it', 160), desc_en: str(p, 'desc_en', 160) };
      if (ICON_CHOICES.includes(icon) && v.title_it && v.title_en) {
        const next = cid ? cats.map((c) => (c.id === cid ? { ...c, ...v } : c)) : [...cats, { id: Math.max(0, ...cats.map((c) => c.id)) + 1, ...v }];
        await s.setJSON('products', next);
      }
    }
  } else if (op === 'settings_save') {
    const v = { phoneDisplay: str(p, 'phoneDisplay', 30), email: str(p, 'email', 120), instagram: str(p, 'instagram', 200), hoursText: str(p, 'hoursText', 400), announce_it: str(p, 'announce_it', 160), announce_en: str(p, 'announce_en', 160) };
    if (v.phoneDisplay.replace(/\D/g, '').length >= 8 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) && /^https:\/\//.test(v.instagram)) await s.setJSON('settings', v);
  }
  return redirect(A, NS);
}

export async function handleReview(req) {
  if (req.method !== 'POST' || !sameOrigin(req)) return text('Forbidden', 'text/plain', 403);
  const p = new URLSearchParams(await req.text());
  const lang = p.get('lang') === 'en' ? 'en' : 'it';
  const back = (code) => redirect(`${T[lang].home}?r=${code}#review-form`);
  if (p.get('website')) return back('ok'); // honeypot
  const name = str(p, 'name', 40), email = str(p, 'email', 120), body = str(p, 'body', 600), rating = Number(p.get('rating'));
  if (name.length < 2 || body.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return back('invalid');
  if (p.get('consent') !== '1') return back('consent');
  const id = String(Date.now()) + String(crypto.randomInt(1000)).padStart(3, '0');
  await (await store()).setJSON('reviews/' + id, { id, name, email: email.toLowerCase(), rating, body, status: 'pending', photo: '', created_at: now() });
  return back('ok');
}

export async function handleLogin(req) {
  const A = env('ADMIN_PATH');
  if (req.method !== 'POST' || !sameOrigin(req) || !A) return text('Forbidden', 'text/plain', 403, NS);
  const p = new URLSearchParams(await req.text());
  if (!passwordOk(str(p, 'password', 200))) return html(adminLogin(A, 'Wrong password.', LOGIN_PATH), 401, NS);
  return redirect(A, { ...NS, 'Set-Cookie': newSessionCookie() });
}
