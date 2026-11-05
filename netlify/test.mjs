// Tests the Netlify handlers with in-memory stand-ins for Netlify Blobs and the email provider.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const salt = crypto.randomBytes(16);
process.env.ADMIN_PATH = '/admin-test-path-1234';
process.env.ADMIN_HASH = `${salt.toString('hex')}:${crypto.scryptSync('correct horse', salt, 64).toString('hex')}`;
delete process.env.RESEND_API_KEY;
const { useTestStore, useTestMailer, handleSite, handleReview, handleLogin, handleReset } = await import('./lib/core.mjs');

const mem = new Map();
useTestStore({
  async get(k, o = {}) { if (!mem.has(k)) return null; const v = mem.get(k); return o.type === 'json' ? JSON.parse(v) : o.type === 'arrayBuffer' ? v : String(v); },
  async set(k, v) { mem.set(k, v); }, async setJSON(k, v) { mem.set(k, JSON.stringify(v)); },
  async delete(k) { mem.delete(k); }, async list({ prefix = '' } = {}) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
});

const B = 'https://castellarano-cover.store', A = process.env.ADMIN_PATH, ctx = { site: { url: B }, deploy: { id: 'abc123' } };
const get = (p, h = {}) => handleSite(new Request(B + p, { headers: h }), ctx);
const form = (p, o, h = {}) => new Request(B + p, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: B, ...h }, body: new URLSearchParams(o) });
const login = async (pw) => { const r = await handleLogin(form('/api/admin-login', { password: pw })); return r.headers.get('set-cookie') ? r.headers.get('set-cookie').split(';')[0] : null; };

let r = await get('/');
assert.equal(r.status, 200); const home = await r.text();
assert.match(home, /application\/ld\+json/); assert.match(home, /action="\/review"/); assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
assert.equal((await get('/en')).status, 200);
assert.match(home, /search\.google\.com\/local\/writereview\?placeid=ChIJ4YrdQwD9f0cRwze_2II61zE/); assert.match(home, /class="scrollcue"/);
assert.equal((await get('/nope')).status, 404);
assert.equal((await get('/admin')).status, 404);

// public review -> pending, hidden from the page, email never shown
const rev = { lang: 'it', name: 'Mario', email: 'm@x.it', rating: '4', body: 'Ottimo negozio <b>x</b>', consent: '1' };
assert.match((await handleReview(form('/review', { ...rev, consent: '' }))).headers.get('location'), /r=consent/);
assert.equal((await handleReview(form('/review', rev, { origin: 'https://evil.example' }))).status, 403);
assert.match((await handleReview(form('/review', rev))).headers.get('location'), /r=ok/);
assert.doesNotMatch(await (await get('/')).text(), /Mario/);

// login page: rate-limited endpoint, forgot-password link, languages (Arabic = RTL)
const loginPage = await (await get(A)).text();
assert.match(loginPage, /action="\/api\/admin-login"/); assert.match(loginPage, /Password dimenticata/); assert.match(loginPage, /h\*+5@gmail\.com/);
assert.doesNotMatch(loginPage, /hawkdown15@gmail\.com/, 'full admin email must not be shown');
// no redirect on ?lang= (Netlify keeps the query on redirects -> it looped live)
r = await get(A + '?lang=ar');
assert.equal(r.status, 200); assert.match(r.headers.get('set-cookie'), /alang=ar/); assert.match(await r.text(), /dir="rtl"/);
const ar = await (await get(A, { cookie: 'alang=ar' })).text();
assert.match(ar, /dir="rtl"/); assert.match(ar, /تسجيل الدخول/);

// Origin header edge cases (bug seen live: "Origin: null" crashed the login function)
let nul = await handleLogin(form('/api/admin-login', { password: 'correct horse' }, { origin: 'null', 'sec-fetch-site': 'same-origin' }));
assert.equal(nul.status, 303); assert.match(nul.headers.get('set-cookie') || '', /^sid=/, 'Origin: null from the same site can log in');
assert.equal((await handleLogin(form('/api/admin-login', { password: 'correct horse' }, { origin: 'null', 'sec-fetch-site': 'cross-site' }))).status, 403);
assert.equal((await handleLogin(form('/api/admin-login', { password: 'x' }, { origin: 'not a url' }))).status, 403);
assert.match((await handleReview(form('/review', rev, { origin: 'null' }))).headers.get('location'), /r=ok/);

// wrong / right password, forged cookie, CSRF
assert.match((await handleLogin(form('/api/admin-login', { password: 'nope' }))).headers.get('location'), /m=wrongPw/);
assert.match(await (await get(A + '?m=wrongPw')).text(), /Password errata/);
let cookie = await login('correct horse');
assert.ok(cookie);
const forged = await (await get(A, { cookie: 'sid=9999999999999.' + 'a'.repeat(64) })).text();
assert.doesNotMatch(forged, /m@x\.it/);
let panel = await (await get(A, { cookie })).text();
assert.match(panel, /m@x\.it/); assert.match(panel, /Ripristina impostazioni iniziali/);
let csrf = /name="csrf" value="([a-f0-9]+)"/.exec(panel)[1];
const id = /name="op" value="review_status"><input type="hidden" name="csrf" value="[a-f0-9]+"><input type="hidden" name="id" value="(\d+)"/.exec(panel)[1];
const adminPost = (o, file, c = cookie) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.append(k, v); if (file) f.append('photo', new Blob([file]), 'x.png'); return handleSite(new Request(B + A, { method: 'POST', body: f, headers: { cookie: c, origin: B } }), ctx); };
assert.equal((await adminPost({ op: 'review_delete', id, csrf: 'bad' })).status, 403);

// quick publish, then edit with photo
assert.match((await adminPost({ op: 'review_status', id, status: 'approved', csrf })).headers.get('location'), /m=saved/);
assert.match(await (await get('/')).text(), /Mario/);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]), Buffer.alloc(20)]);
await adminPost({ op: 'review_save', id, csrf, name: 'Mario', rating: '4', status: 'approved', body: 'Ottimo negozio <b>x</b>' }, png);
let page = await (await get('/')).text();
assert.match(page, /&lt;b&gt;x&lt;\/b&gt;/); assert.doesNotMatch(page, /m@x\.it/); assert.match(page, /★★★★☆/);
const photo = /\/uploads\/([a-f0-9]{32}\.png)/.exec(page)[1];
r = await get('/uploads/' + photo); assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'image/png');
assert.match((await adminPost({ op: 'review_save', id, csrf, name: 'X', rating: '9', status: 'approved', body: 'short' })).headers.get('location'), /m=invalid/);

// products + settings, then reset to defaults (reviews kept)
await adminPost({ op: 'cat_save', id: '0', pos: '0', icon: 'car', title_it: 'Nuova', title_en: 'NewCat', desc_it: 'x', desc_en: 'y', csrf });
assert.match(await (await get('/en')).text(), /NewCat/);
await adminPost({ op: 'settings_save', phoneDisplay: '+39 111 222 3333', email: 'a@b.it', instagram: 'https://instagram.com/x', hoursText: 'Mo-Sa 09:00-19:30', announce_it: 'Ciao', announce_en: '', csrf });
page = await (await get('/')).text();
assert.match(page, /tel:\+391112223333/); assert.match(page, /Mo-Sa 09:00-19:30/); assert.match(page, /class="announce"/);
assert.match((await adminPost({ op: 'reset_defaults', csrf })).headers.get('location'), /m=invalid/, 'reset needs the confirm box');
assert.match((await adminPost({ op: 'reset_defaults', confirm: '1', csrf })).headers.get('location'), /m=resetDone/);
page = await (await get('/en')).text();
assert.doesNotMatch(page, /NewCat/); assert.match(page, /tel:\+393889004487/); assert.doesNotMatch(page, /class="announce"/);
assert.match(page, /Mario/, 'reset keeps reviews');

// password reset by email: not configured -> mailOff; configured -> link, cooldown, single use, sessions end
assert.match((await handleReset(form('/api/admin-reset', { op: 'request', lang: 'it' }))).headers.get('location'), /m=mailOff/);
const sent = [];
useTestMailer(async (m) => { sent.push(m); });
assert.match((await handleReset(form('/api/admin-reset', { op: 'request', lang: 'en' }), ctx)).headers.get('location'), /m=linkSent/);
assert.equal(sent.length, 1); assert.equal(sent[0].to, 'hawkdown15@gmail.com');
assert.match((await handleReset(form('/api/admin-reset', { op: 'request', lang: 'en' }), ctx)).headers.get('location'), /m=wait/);
const link = /https:\/\/castellarano-cover\.store\/admin-test-path-1234\?reset=([a-f0-9]{64})&lang=en/.exec(sent[0].text);
assert.ok(link, 'email contains the reset link'); const token = link[1];
assert.match(await (await get(`${A}?reset=${'0'.repeat(64)}`)).text(), /Invalid or expired|non valido/);
assert.match(await (await get(`${A}?reset=${token}&lang=en`)).text(), /name="password2"/);
assert.equal((await handleReset(form('/api/admin-reset', { op: 'set', token, password: 'short', password2: 'short' }))).status, 400);
assert.match((await handleReset(form('/api/admin-reset', { op: 'set', token, password: 'brand new pass 1', password2: 'brand new pass 1' }))).headers.get('location'), /m=pwChanged/);
assert.match((await handleReset(form('/api/admin-reset', { op: 'set', token, password: 'another pass 22', password2: 'another pass 22' }))).headers.get('location'), /m=badLink/, 'token is single use');
assert.equal(await login('correct horse'), null, 'old password no longer works');
assert.doesNotMatch(await (await get(A, { cookie })).text(), /m@x\.it/, 'old session ended');
cookie = await login('brand new pass 1');
assert.ok(cookie, 'new password works');
// owner changes ADMIN_HASH on Netlify -> that one wins again (no lock-out)
const salt2 = crypto.randomBytes(16);
process.env.ADMIN_HASH = `${salt2.toString('hex')}:${crypto.scryptSync('env password 99', salt2, 64).toString('hex')}`;
assert.ok(await login('env password 99'));
assert.equal(await login('brand new pass 1'), null);
cookie = await login('env password 99');
panel = await (await get(A, { cookie })).text();
csrf = /name="csrf" value="([a-f0-9]+)"/.exec(panel)[1];

// delete removes review and its photo
await adminPost({ op: 'review_delete', id, csrf });
assert.doesNotMatch(await (await get('/')).text(), /Mario/);
assert.equal((await get('/uploads/' + photo)).status, 404);
assert.ok(![...mem.keys()].some((k) => k.startsWith('photos/')));
console.log('netlify checks passed');
