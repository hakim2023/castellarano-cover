// Tests the Netlify handlers with an in-memory stand-in for Netlify Blobs.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const salt = crypto.randomBytes(16);
process.env.ADMIN_PATH = '/admin-test-path-1234';
process.env.ADMIN_HASH = `${salt.toString('hex')}:${crypto.scryptSync('correct horse', salt, 64).toString('hex')}`;
const { useTestStore, handleSite, handleReview, handleLogin } = await import('./lib/core.mjs');

const mem = new Map();
useTestStore({
  async get(k, o = {}) { if (!mem.has(k)) return null; const v = mem.get(k); return o.type === 'json' ? JSON.parse(v) : o.type === 'arrayBuffer' ? v : String(v); },
  async set(k, v) { mem.set(k, v); }, async setJSON(k, v) { mem.set(k, JSON.stringify(v)); },
  async delete(k) { mem.delete(k); }, async list({ prefix = '' } = {}) { return { blobs: [...mem.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
});

const B = 'https://castellarano-cover.netlify.app', A = process.env.ADMIN_PATH, ctx = { site: { url: B }, deploy: { id: 'abc123' } };
const get = (p, h = {}) => handleSite(new Request(B + p, { headers: h }), ctx);
const form = (p, o, h = {}) => new Request(B + p, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', origin: B, ...h }, body: new URLSearchParams(o) });

let r = await get('/');
assert.equal(r.status, 200); const home = await r.text();
assert.match(home, /application\/ld\+json/); assert.match(home, /action="\/review"/); assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
assert.equal((await get('/en')).status, 200);
assert.equal((await get('/nope')).status, 404);
assert.equal((await get('/admin')).status, 404);

// public review -> pending, hidden from the page, email never shown
const rev = { lang: 'it', name: 'Mario', email: 'm@x.it', rating: '4', body: 'Ottimo negozio <b>x</b>', consent: '1' };
assert.match((await handleReview(form('/review', { ...rev, consent: '' }))).headers.get('location'), /r=consent/);
assert.equal((await handleReview(form('/review', rev, { origin: 'https://evil.example' }))).status, 403);
assert.match((await handleReview(form('/review', rev))).headers.get('location'), /r=ok/);
assert.doesNotMatch(await (await get('/')).text(), /Mario/);

// admin: login page posts to the rate-limited endpoint; wrong/right password; CSRF required
const loginPage = await (await get(A)).text();
assert.match(loginPage, /action="\/api\/admin-login"/);
assert.equal((await handleLogin(form('/api/admin-login', { password: 'nope' }))).status, 401);
const ok = await handleLogin(form('/api/admin-login', { password: 'correct horse' }));
assert.equal(ok.status, 303);
const cookie = ok.headers.get('set-cookie').split(';')[0];
assert.match(ok.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict; Path=\/admin-test-path-1234/);
assert.equal((await get(A, { cookie: 'sid=9999999999999.' + 'a'.repeat(64) })).status, 200); // forged cookie -> login page, not panel
assert.doesNotMatch(await (await get(A, { cookie: 'sid=9999999999999.' + 'a'.repeat(64) })).text(), /m@x\.it/);
const panel = await (await get(A, { cookie })).text();
assert.match(panel, /m@x\.it/);
const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(panel)[1];
const id = /name="id" value="(\d+)"/.exec(panel)[1];
const adminPost = (o, file) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.append(k, v); if (file) f.append('photo', new Blob([file]), 'x.png'); return handleSite(new Request(B + A, { method: 'POST', body: f, headers: { cookie, origin: B } }), ctx); };
assert.equal((await adminPost({ op: 'review_delete', id, csrf: 'bad' })).status, 403);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]), Buffer.alloc(20)]);
await adminPost({ op: 'review_save', id, csrf, name: 'Mario', rating: '4', status: 'approved', body: 'Ottimo negozio <b>x</b>' }, png);
let page = await (await get('/')).text();
assert.match(page, /Mario/); assert.match(page, /&lt;b&gt;x&lt;\/b&gt;/); assert.doesNotMatch(page, /m@x\.it/); assert.match(page, /★★★★☆/);
const photo = /\/uploads\/([a-f0-9]{32}\.png)/.exec(page)[1];
r = await get('/uploads/' + photo); assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'image/png');
await adminPost({ op: 'review_save', id, csrf, name: 'Mario', rating: '4', status: 'approved', body: 'Ottimo negozio <b>x</b>' }, Buffer.from('<script>not an image</script>'));
assert.equal((await get('/uploads/' + photo)).status, 200, 'fake image must not replace the photo');

// products + settings
await adminPost({ op: 'cat_save', id: '0', pos: '0', icon: 'car', title_it: 'Nuova', title_en: 'NewCat', desc_it: 'x', desc_en: 'y', csrf });
assert.match(await (await get('/en')).text(), /NewCat/);
await adminPost({ op: 'settings_save', phoneDisplay: '+39 111 222 3333', email: 'a@b.it', instagram: 'https://instagram.com/x', hoursText: 'Mo-Sa 09:00-19:30', announce_it: 'Ciao', announce_en: '', csrf });
page = await (await get('/')).text();
assert.match(page, /tel:\+391112223333/); assert.match(page, /Mo-Sa 09:00-19:30/); assert.match(page, /class="announce"/);

// delete removes review and its photo
await adminPost({ op: 'review_delete', id, csrf });
assert.doesNotMatch(await (await get('/')).text(), /Mario/);
assert.equal((await get('/uploads/' + photo)).status, 404);
assert.ok(![...mem.keys()].some((k) => k.startsWith('photos/')));
console.log('netlify checks passed');
