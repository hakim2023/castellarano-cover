// Netlify version of server.js: same templates, data in Netlify Blobs instead of SQLite.
// Env vars (Netlify UI): ADMIN_PATH, ADMIN_HASH (from `npm run set-password`), SITE_URL,
// RESEND_API_KEY (password-reset emails), optional MAIL_FROM.
import crypto from 'node:crypto';
import { biz } from '../../config.js';
import { ICON_CHOICES } from '../../icons.js';
import { asset, home, privacy, notFound, sitemap, robots, llms, T } from '../../views.js';
import { adminLogin, adminPanel, adminResetForm, adminLang, resetEmail, NOTICES } from '../../admin-views.js';

// EU region: reviews contain customer emails (GDPR). Must be passed on every getStore call.
const REGION = 'eu-central-1';
let testStore = null, testMailer = null;
export const useTestStore = (s) => { testStore = s; };
export const useTestMailer = (m) => { testMailer = m; };
async function store() {
  if (testStore) return testStore;
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: 'cover', region: REGION, consistency: 'strong' });
}
const env = (k) => globalThis.Netlify?.env?.get(k) ?? process.env[k];
export const LOGIN_PATH = '/api/admin-login';
export const RESET_PATH = '/api/admin-reset';

const SEC = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; frame-src https://www.google.com; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()', 'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};
const NS = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
const html = (body, status = 200, h = {}) => new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SEC, ...h } });
const text = (body, type, status = 200, h = {}) => new Response(body, { status, headers: { 'Content-Type': type, ...SEC, ...h } });
const redirect = (to, h = {}) => new Response(null, { status: 303, headers: { Location: to, ...SEC, ...h } });
// Public pages: browsers revalidate, Netlify's CDN keeps them up to 60 s (admin changes show within a minute).
const CDN = { 'Cache-Control': 'public, max-age=0, must-revalidate', 'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=60, stale-while-revalidate=300' };
const str = (p, k, max) => String(p.get(k) ?? '').trim().slice(0, max);
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const sameOrigin = (req) => { const o = req.headers.get('origin'); return !o || new URL(o).host === new URL(req.url).host; };
const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
const safeEq = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const mask = (e) => e.replace(/^(.)(.*)(.@)/, (_, a, m, b) => a + '*'.repeat(Math.max(3, m.length)) + b);
const baseUrl = (req, context = {}) => (env('SITE_URL') || context.site?.url || new URL(req.url).origin).replace(/\/$/, '');
const adminPathOk = (A) => A && /^\/[A-Za-z0-9_-]{12,}$/.test(A);

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

// ---- admin password: a hash set via the email link (Blobs) wins, unless ADMIN_HASH on Netlify was changed after it ----
async function currentHash(s) {
  const saved = await s.get('admin/password', { type: 'json' });
  return saved && saved.envAtSave === env('ADMIN_HASH') ? saved.hash : env('ADMIN_HASH');
}
function passwordOk(pw, hash) {
  const [salt, h] = String(hash || '').split(':');
  if (!salt || !h) return false;
  return crypto.timingSafeEqual(crypto.scryptSync(pw, Buffer.from(salt, 'hex'), 64), Buffer.from(h, 'hex'));
}
const hashPassword = (pw) => { const salt = crypto.randomBytes(16); return `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`; };

// ---- admin session: stateless signed cookie; key derives from the password hash, so a new password logs everyone out ----
const signer = (hash) => (v) => crypto.createHmac('sha256', sha('session:' + hash)).update(v).digest('hex');
function newSessionCookie(hash, A) {
  const exp = String(Date.now() + 2 * 3600e3);
  return `sid=${exp}.${signer(hash)(exp)}; HttpOnly; Secure; SameSite=Strict; Path=${A}; Max-Age=7200`;
}
function session(req, hash) {
  const m = /(?:^|; )sid=(\d+)\.([a-f0-9]{64})/.exec(req.headers.get('cookie') || '');
  const sign = signer(hash);
  if (!m || Number(m[1]) < Date.now() || !safeEq(m[2], sign(m[1]))) return null;
  return { csrf: sign('csrf:' + m[1] + m[2]) };
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

// ---- public site ----
const PAGES = { '/': 'it', '/en': 'en', '/en/': 'en' };
export async function handleSite(req, context = {}) {
  const url = new URL(req.url), p = decodeURIComponent(url.pathname), base = baseUrl(req, context);
  asset.v = String(context.deploy?.id || 'dev').slice(-10);
  const A = env('ADMIN_PATH');
  if (!adminPathOk(A) || !env('ADMIN_HASH')) return text('Site not configured: set ADMIN_PATH and ADMIN_HASH.', 'text/plain', 500);
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

// ---- admin page ----
async function admin(req, s, A) {
  const url = new URL(req.url), lang = adminLang(req.url, req.headers.get('cookie') || '');
  // ?lang= switches the admin language and remembers it
  if (url.searchParams.has('lang') && !url.searchParams.has('reset')) return redirect(A, { ...NS, 'Set-Cookie': `alang=${lang}; Path=${A}; Max-Age=31536000; SameSite=Lax; Secure` });
  const hash = await currentHash(s), sess = session(req, hash);
  const notice = NOTICES.includes(url.searchParams.get('m')) ? url.searchParams.get('m') : '';
  const mailOpts = { resetAction: RESET_PATH, adminEmail: mask(biz.adminEmail) };
  await applySettings(s);
  if (req.method === 'GET' || req.method === 'HEAD') {
    const token = url.searchParams.get('reset');
    if (token) return html(adminResetForm(A, { lang, token, valid: await resetTokenOk(s, token), action: RESET_PATH }), 200, NS);
    if (!sess) return html(adminLogin(A, { lang, notice, action: LOGIN_PATH, ...mailOpts }), 200, NS);
    const reviews = (await allReviews(s)).sort((a, b) => (b.status === 'pending') - (a.status === 'pending') || b.created_at.localeCompare(a.created_at)); // pending first, then newest
    return html(adminPanel(A, sess.csrf, { reviews, cats: await getCats(s) }, { lang, notice, biz, ...mailOpts }), 200, NS);
  }
  if (req.method !== 'POST' || !sameOrigin(req)) return text('Forbidden', 'text/plain', 403, NS);
  const form = await req.formData();
  const p = new URLSearchParams([...form.entries()].filter(([, v]) => typeof v === 'string'));
  if (!sess || !safeEq(str(p, 'csrf', 100), sess.csrf)) return text('Forbidden', 'text/plain', 403, NS);
  const op = p.get('op'), id = str(p, 'id', 40), file = form.get('photo');
  const done = (m) => redirect(`${A}?m=${m}`, NS);
  const rev = () => {
    const rating = Number(p.get('rating')), name = str(p, 'name', 40), body = str(p, 'body', 600), status = p.get('status');
    return name && body.length >= 10 && rating >= 1 && rating <= 5 && ['approved', 'pending', 'hidden'].includes(status) ? { rating, name, body, status } : null;
  };
  const reviewKey = /^\d{1,30}$/.test(id) ? 'reviews/' + id : null;
  if (op === 'logout') return redirect(A, { ...NS, 'Set-Cookie': `sid=; Path=${A}; Max-Age=0; Secure` });
  if (op === 'review_status' && reviewKey) {
    const old = await s.get(reviewKey, { type: 'json' }), status = p.get('status');
    if (!old || !['approved', 'pending', 'hidden'].includes(status)) return done('invalid');
    await s.setJSON(reviewKey, { ...old, status });
    return done('saved');
  }
  if (op === 'review_save' && reviewKey) {
    const old = await s.get(reviewKey, { type: 'json' }), r = rev();
    if (!old || !r) return done('invalid');
    let photo = old.photo;
    const np = await savePhoto(s, file);
    if (np || p.get('remove_photo')) { await dropPhoto(s, old.photo); photo = np; }
    await s.setJSON(reviewKey, { ...old, ...r, photo });
    return done('saved');
  }
  if (op === 'review_delete' && reviewKey) {
    const old = await s.get(reviewKey, { type: 'json' });
    if (old) { await dropPhoto(s, old.photo); await s.delete(reviewKey); }
    return done('deleted');
  }
  if (op === 'review_add') {
    const r = rev();
    if (!r) return done('invalid');
    const nid = String(Date.now()) + String(crypto.randomInt(1000)).padStart(3, '0');
    await s.setJSON('reviews/' + nid, { id: nid, email: '', created_at: now(), ...r, photo: await savePhoto(s, file) });
    return done('saved');
  }
  if (op === 'cat_delete') {
    await s.setJSON('products', (await getCats(s)).filter((c) => c.id !== Number(id)));
    return done('deleted');
  }
  if (op === 'cat_save') {
    const cats = await getCats(s), cid = Number(id), icon = p.get('icon'), pos = Math.min(999, Math.max(0, parseInt(p.get('pos')) || 0));
    const v = { pos, icon, title_it: str(p, 'title_it', 60), title_en: str(p, 'title_en', 60), desc_it: str(p, 'desc_it', 160), desc_en: str(p, 'desc_en', 160) };
    if (!ICON_CHOICES.includes(icon) || !v.title_it || !v.title_en) return done('invalid');
    await s.setJSON('products', cid ? cats.map((c) => (c.id === cid ? { ...c, ...v } : c)) : [...cats, { id: Math.max(0, ...cats.map((c) => c.id)) + 1, ...v }]);
    return done('saved');
  }
  if (op === 'settings_save') {
    const v = { phoneDisplay: str(p, 'phoneDisplay', 30), email: str(p, 'email', 120), instagram: str(p, 'instagram', 200), hoursText: str(p, 'hoursText', 400), announce_it: str(p, 'announce_it', 160), announce_en: str(p, 'announce_en', 160) };
    if (v.phoneDisplay.replace(/\D/g, '').length < 8 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email) || !/^https:\/\//.test(v.instagram)) return done('invalid');
    await s.setJSON('settings', v);
    return done('saved');
  }
  if (op === 'reset_defaults' && p.get('confirm') === '1') {
    await s.delete('settings'); await s.delete('products'); // reviews are kept
    return done('resetDone');
  }
  return done('invalid');
}

// ---- public review form (own function, rate-limited by Netlify) ----
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

// ---- login (own function, rate-limited by Netlify) ----
export async function handleLogin(req) {
  const A = env('ADMIN_PATH');
  if (req.method !== 'POST' || !sameOrigin(req) || !adminPathOk(A)) return text('Forbidden', 'text/plain', 403, NS);
  const p = new URLSearchParams(await req.text()), s = await store(), hash = await currentHash(s);
  if (!passwordOk(str(p, 'password', 200), hash)) return redirect(`${A}?m=wrongPw`, NS);
  return redirect(A, { ...NS, 'Set-Cookie': newSessionCookie(hash, A) });
}

// ---- forgot / change password by email (own function, rate-limited by Netlify) ----
async function resetTokenOk(s, token) {
  const r = await s.get('admin/reset', { type: 'json' });
  return !!(r && /^[a-f0-9]{64}$/.test(token || '') && r.exp > Date.now() && safeEq(r.tokenHash, sha(token)));
}
async function sendMail(to, { subject, text: body, html: htmlBody }) {
  if (testMailer) return testMailer({ to, subject, text: body, html: htmlBody });
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env('MAIL_FROM') || 'Castellarano Cover <onboarding@resend.dev>', to: [to], subject, text: body, html: htmlBody }),
  });
  if (!res.ok) throw new Error(`Email provider error ${res.status}: ${await res.text()}`);
}
export async function handleReset(req, context = {}) {
  const A = env('ADMIN_PATH');
  if (req.method !== 'POST' || !sameOrigin(req) || !adminPathOk(A)) return text('Forbidden', 'text/plain', 403, NS);
  const p = new URLSearchParams(await req.text()), s = await store();
  const lang = ['it', 'en', 'ar'].includes(p.get('lang')) ? p.get('lang') : 'it';
  if (p.get('op') === 'request') {
    if (!env('RESEND_API_KEY') && !testMailer) return redirect(`${A}?m=mailOff`, NS);
    const prev = await s.get('admin/reset', { type: 'json' });
    if (prev && prev.created > Date.now() - 2 * 60e3) return redirect(`${A}?m=wait`, NS);
    const token = crypto.randomBytes(32).toString('hex');
    await s.setJSON('admin/reset', { tokenHash: sha(token), exp: Date.now() + 30 * 60e3, created: Date.now() });
    try {
      await sendMail(biz.adminEmail, resetEmail(lang, `${baseUrl(req, context)}${A}?reset=${token}&lang=${lang}`));
    } catch (e) {
      console.error(e);
      await s.delete('admin/reset');
      return redirect(`${A}?m=mailOff`, NS);
    }
    return redirect(`${A}?m=linkSent`, NS);
  }
  if (p.get('op') === 'set') {
    const token = str(p, 'token', 100), pw = String(p.get('password') || ''), pw2 = String(p.get('password2') || '');
    if (!(await resetTokenOk(s, token))) return redirect(`${A}?m=badLink`, NS);
    if (pw.length < 10 || pw.length > 200 || pw !== pw2) return html(adminResetForm(A, { lang, token, valid: true, action: RESET_PATH, notice: 'pwMismatch' }), 400, NS);
    await s.setJSON('admin/password', { hash: hashPassword(pw), envAtSave: env('ADMIN_HASH'), changed: now() });
    await s.delete('admin/reset'); // single use
    return redirect(`${A}?m=pwChanged`, NS);
  }
  return text('Bad request', 'text/plain', 400, NS);
}
