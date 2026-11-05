// Smoke test: runs the server in a temp copy with a known admin password.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cover-'));
for (const f of ['server.js', 'views.js', 'admin-views.js', 'config.js', 'icons.js', 'package.json']) fs.copyFileSync(f, path.join(dir, f));
fs.cpSync('public', path.join(dir, 'public'), { recursive: true });
const salt = crypto.randomBytes(16);
fs.writeFileSync(path.join(dir, '.env'), `SITE_URL=http://localhost:3111\nADMIN_PATH=/secret-test-path-x\nADMIN_HASH=${salt.toString('hex')}:${crypto.scryptSync('pw123', salt, 64).toString('hex')}\n`);
// Drop real deployment settings (e.g. on Netlify builds) so the test server uses the temp .env above.
const { ADMIN_PATH, ADMIN_HASH, SITE_URL, DATA_DIR, ...cleanEnv } = process.env;
const srv = spawn('node', ['server.js'], { cwd: dir, env: { ...cleanEnv, PORT: 3111 }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1200));
const B = 'http://localhost:3111';
const post = (p, o, h = {}) => fetch(B + p, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded', ...h }, body: new URLSearchParams(o) });
try {
  const home = await (await fetch(B + '/')).text();
  assert.match(home, /application\/ld\+json/); assert.match(home, /Via Radici Nord/);
  assert.equal((await fetch(B + '/admin')).status, 404);
  assert.equal((await fetch(B + '/en')).status, 200);
  assert.equal((await fetch(B + '/../server.js')).status, 404);
  assert.equal((await fetch(B + '/%2e%2e/.env')).status, 404);
  const rev = { lang: 'it', name: 'Mario', email: 'm@x.it', rating: '5', body: 'Negozio ottimo <b>x</b>', consent: '1' };
  assert.match((await post('/review', { ...rev, consent: '' })).headers.get('location'), /r=consent/);
  assert.match((await post('/review', rev)).headers.get('location'), /r=ok/);
  assert.doesNotMatch(await (await fetch(B + '/')).text(), /Mario/); // pending = hidden
  assert.equal((await post('/secret-test-path-x', { op: 'login', password: 'bad' })).status, 401);
  const login = await post('/secret-test-path-x', { op: 'login', password: 'pw123' });
  assert.equal(login.status, 303);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const panel = await (await fetch(B + '/secret-test-path-x', { headers: { cookie } })).text();
  const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(panel)[1];
  assert.match(panel, /m@x\.it/);
  assert.equal((await post('/secret-test-path-x', { op: 'review_delete', id: 1, csrf: 'nope' }, { cookie })).status, 403);
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10]), Buffer.alloc(20)]);
  const save = (extra, file) => { const f = new FormData(); for (const [k, v] of Object.entries({ op: 'review_save', id: 1, csrf, name: 'Mario', rating: 4, status: 'approved', body: 'Negozio ottimo <b>x</b>', ...extra })) f.append(k, v); if (file) f.append('photo', new Blob([file]), 'x.png'); return fetch(B + '/secret-test-path-x', { method: 'POST', body: f, redirect: 'manual', headers: { cookie } }); };
  await save({}, Buffer.from('<script>not an image</script>')); // fake image rejected
  assert.doesNotMatch(await (await fetch(B + '/')).text(), /src="\/uploads\//);
  await save({}, png);
  const photo = /\/uploads\/([a-f0-9]{32}\.png)/.exec(await (await fetch(B + '/')).text())[1];
  assert.equal((await fetch(B + '/uploads/' + photo)).status, 200);
  assert.equal((await fetch(B + '/uploads/..%2f..%2f.env')).status, 404);
  const after = await (await fetch(B + '/')).text();
  assert.match(after, /Mario/); assert.match(after, /★★★★☆/); assert.match(after, /&lt;b&gt;x&lt;\/b&gt;/); assert.doesNotMatch(after, /m@x\.it/);
  assert.equal((await post('/review', rev, { origin: 'http://evil.com' })).status, 403);
  assert.equal((await post('/review', rev, { origin: 'not a url' })).status, 403); // must not crash
  assert.equal((await post('/review', rev, { origin: 'null', 'sec-fetch-site': 'same-origin' })).status, 303);
  await post('/secret-test-path-x', { op: 'cat_save', id: 0, pos: 0, icon: 'car', title_it: 'Nuova', title_en: 'NewCat', desc_it: 'x', desc_en: 'y', csrf }, { cookie });
  assert.match(await (await fetch(B + '/en')).text(), /NewCat/);
  await post('/secret-test-path-x', { op: 'settings_save', phoneDisplay: '+39 111 222 3333', email: 'a@b.it', instagram: 'https://instagram.com/x', hoursText: 'Mo-Sa 09:00-19:30', announce_it: 'Ciao', announce_en: '', csrf }, { cookie });
  const h = await (await fetch(B + '/')).text();
  assert.match(h, /tel:\+391112223333/); assert.match(h, /Mo-Sa 09:00-19:30/); assert.match(h, /class="announce"/);
  // quick hide/publish, then reset to initial settings (needs the confirm box; reviews kept)
  await post('/secret-test-path-x', { op: 'review_status', id: 1, status: 'hidden', csrf }, { cookie });
  assert.doesNotMatch(await (await fetch(B + '/')).text(), /Mario/);
  await post('/secret-test-path-x', { op: 'review_status', id: 1, status: 'approved', csrf }, { cookie });
  assert.match((await post('/secret-test-path-x', { op: 'reset_defaults', csrf }, { cookie })).headers.get('location'), /m=invalid/);
  assert.match((await post('/secret-test-path-x', { op: 'reset_defaults', confirm: '1', csrf }, { cookie })).headers.get('location'), /m=resetDone/);
  const fresh = await (await fetch(B + '/en')).text();
  assert.match(fresh, /tel:\+393889004487/); assert.doesNotMatch(fresh, /NewCat|class="announce"/); assert.match(fresh, /Mario/);
  assert.match(await (await fetch(B + '/secret-test-path-x?lang=ar', { redirect: 'manual' })).headers.get('set-cookie'), /alang=ar/);
  await post('/secret-test-path-x', { op: 'review_delete', id: 1, csrf }, { cookie });
  assert.doesNotMatch(await (await fetch(B + '/')).text(), /Mario/);
  assert.equal((await fetch(B + '/uploads/' + photo)).status, 404); // photo file removed with review
  console.log('all checks passed');
} finally { srv.kill(); }
