// Builds the business card (print PDF + PNG previews) and the social share image (public/img/og.jpg).
// Usage: node scripts/make-assets.mjs [qr-url]   (default QR: WhatsApp chat; pass the website URL once it is online)
// Needs Google Chrome installed (set CHROME=path if it is not in the default Windows location).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { biz } from '../config.js';
import { icon } from '../icons.js';
import { qrSvg } from './qr.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'print');
fs.mkdirSync(out, { recursive: true });
const qrUrl = process.argv[2] || `https://wa.me/${biz.phone.slice(1)}`;
const qrLabel = qrUrl.includes('wa.me') ? 'Scansiona e scrivici su WhatsApp' : 'Scansiona e visita il sito';
const font = fs.readFileSync(path.join(root, 'public/fonts/space-grotesk.woff2')).toString('base64');

const mark = (w) => `<svg class="mark" viewBox="100 116 824 168" width="${w}"><g transform="translate(90 90) scale(2.2)"><path d="M73 30.7 A30 30 0 1 0 73 69.3" fill="none" stroke="#22E678" stroke-width="12" stroke-linecap="round"/><polygon points="54,30 38,54 49,54 45,70 62,45 51,45 56,30" fill="#22E678"/></g><text x="340" y="215" font-size="104" font-weight="700" letter-spacing="-4" fill="#fff">castellarano</text><text x="346" y="268" font-size="34" font-weight="500" letter-spacing="21" fill="#22E678">COVER</text></svg>`;
const iconMark = (w) => `<svg viewBox="0 0 100 100" width="${w}"><rect width="100" height="100" rx="24" fill="#0A0A0A"/><path d="M71 33 A27 27 0 1 0 71 67" fill="none" stroke="#22E678" stroke-width="10" stroke-linecap="round"/><polygon points="54,30 38,54 49,54 45,70 62,45 51,45 56,30" fill="#22E678"/></svg>`;
const base = `@font-face{font-family:SG;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:300 700}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:SG,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}svg text{font-family:SG,sans-serif}.ic{width:1em;height:1em;flex:none}`;

// Card: 85x55 mm trim + 3 mm bleed each side = 91x61 mm. Keep text 4 mm inside the trim line (7 mm from page edge).
const card = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Biglietto da visita - ${biz.name}</title><style>${base}
@page{size:91mm 61mm;margin:0}
.card{width:91mm;height:61mm;position:relative;overflow:hidden;page-break-after:always}
.front{background:#0a0a0a;color:#fff}
.front .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:4mm 4mm;-webkit-mask-image:radial-gradient(ellipse at 85% 30%,#000,transparent 70%)}
.front .glow{position:absolute;width:60mm;height:60mm;right:-18mm;top:-22mm;border-radius:50%;background:radial-gradient(circle,rgba(34,230,120,.35),transparent 65%)}
.front .arc{position:absolute;right:-16mm;bottom:-24mm;width:58mm;height:58mm;border-radius:50%;border:5mm solid #22e678;border-right-color:transparent;opacity:.16;transform:rotate(-20deg)}
.front .in{position:absolute;inset:7mm;display:flex;flex-direction:column;justify-content:center;gap:4.5mm}
.front .mark{width:50mm;height:auto;margin-left:-.6mm}
.front .tag{font-size:2.6mm;font-weight:500;color:#cfd8d2;letter-spacing:.02em}
.front .tag b{color:#22e678;font-weight:600}
.front .foot{position:absolute;left:7mm;bottom:7mm;font-size:2.1mm;letter-spacing:.24em;text-transform:uppercase;color:#7d8a83}
.back{background:#f5f6f3;color:#0a0a0a}
.back .bar{position:absolute;left:0;right:0;top:0;height:6mm;background:#0a0a0a}
.back .bar::after{content:"";position:absolute;left:0;bottom:0;height:.8mm;width:100%;background:linear-gradient(90deg,#15803d,#22e678)}
.back .in{position:absolute;left:7mm;right:7mm;top:10mm;bottom:7mm;display:grid;grid-template-columns:1fr 21mm;gap:4mm;align-items:center}
.back h1{display:flex;align-items:center;gap:2mm;font-size:3.4mm;font-weight:700;letter-spacing:-.01em;margin-bottom:2.6mm}
.back ul{list-style:none;display:grid;gap:1.55mm;font-size:2.35mm;font-weight:500}
.back li{display:flex;align-items:center;gap:1.8mm;line-height:1.2}
.back li .ic{width:2.8mm;height:2.8mm;color:#15803d}
.back .qr{display:grid;gap:1.4mm;justify-items:center;text-align:center}
.back .qr svg{width:21mm;height:21mm;display:block;border-radius:1.2mm}
.back .qr p{font-size:1.75mm;font-weight:600;line-height:1.25;color:#3b4540}
.back .note{position:absolute;left:7mm;bottom:7mm;font-size:1.9mm;color:#5b6660;font-weight:500}
</style></head><body>
<section class="card front"><div class="grid"></div><div class="glow"></div><div class="arc"></div>
<div class="in">${mark(190)}<p class="tag"><b>Cover</b> · Pellicole · Caricabatterie · Accessori telefonia</p></div>
<p class="foot">Castellarano (RE)</p></section>
<section class="card back"><div class="bar"></div><div class="in"><div>
<h1>${iconMark(16)} ${biz.name}</h1>
<ul>
<li>${icon('phone')} ${biz.phoneDisplay}</li>
<li>${icon('whatsapp')} WhatsApp ${biz.phoneDisplay}</li>
<li>${icon('instagram')} @cover.castellarano</li>
<li>${icon("map-pin")} ${biz.street.replace(",", "")} · ${biz.city} (${biz.region})</li>
<li>${icon('mail')} ${biz.email}</li>
</ul></div>
<div class="qr">${qrSvg(qrUrl)}<p>${qrLabel}</p></div></div>
<p class="note">Vendita solo in negozio</p></section>
</body></html>`;
fs.writeFileSync(path.join(out, 'business-card.html'), card);
// Standalone QR: SVG for print (scales to any size), PNG rendered below for screens/social posts.
fs.writeFileSync(path.join(out, 'qr-code.svg'), qrSvg(qrUrl));
const qrPage = path.join(os.tmpdir(), 'cover-qr.html');
fs.writeFileSync(qrPage, `<!doctype html><html><head><style>html,body{margin:0;overflow:hidden}svg{display:block}</style></head><body>${qrSvg(qrUrl).replace("<svg ", "<svg width=\"1024\" height=\"1024\" ")}</body></html>`);

// Social share image 1200x630.
const og = `<!doctype html><html><head><meta charset="utf-8"><style>${base}
body{width:1200px;height:630px;background:#0a0a0a;color:#fff;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(ellipse at 75% 35%,#000 5%,transparent 70%)}
.glow{position:absolute;width:640px;height:640px;right:-120px;top:-220px;border-radius:50%;background:radial-gradient(circle,rgba(34,230,120,.32),transparent 65%)}
.in{position:absolute;left:84px;top:84px;right:84px;bottom:84px;display:flex;flex-direction:column;justify-content:space-between}
.mark{width:560px;height:auto;margin-left:-6px}
h1{font-size:62px;line-height:1.05;letter-spacing:-.03em;font-weight:700;max-width:900px}
h1 span{color:#22e678}
.row{display:flex;gap:14px;flex-wrap:wrap}
.pill{display:flex;align-items:center;gap:10px;padding:12px 20px;border-radius:99px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);font-size:24px;font-weight:500}
.pill .ic{color:#22e678;width:26px;height:26px}
</style></head><body><div class="grid"></div><div class="glow"></div><div class="in">
${mark(560)}
<h1>Cover, pellicole e accessori <span>per il tuo telefono</span></h1>
<div class="row"><span class="pill">${icon('map-pin')} ${biz.street}, ${biz.city} (${biz.region})</span><span class="pill">${icon('store')} Solo in negozio</span></div>
</div></body></html>`;
const ogFile = path.join(os.tmpdir(), 'cover-og.html');
fs.writeFileSync(ogFile, og);

// ---- render with headless Chrome over the DevTools protocol ----
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cover-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9341', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let ws;
  for (let i = 0; i < 40 && !ws; i++) { await wait(300); try { const pg = (await (await fetch('http://127.0.0.1:9341/json')).json()).find((t) => t.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch {} }
  if (!ws) throw new Error('Could not start Chrome at ' + CHROME);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); }).then((m) => { if (m.error) throw new Error(method + ': ' + m.error.message); return m.result; });
  const load = async (file) => { await send('Page.navigate', { url: 'file:///' + file.replace(/\\/g, '/') }); await wait(900); await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true }); };

  await load(path.join(out, 'business-card.html'));
  const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
  fs.writeFileSync(path.join(out, 'business-card-print.pdf'), Buffer.from(pdf.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 400, height: 600, deviceScaleFactor: 4, mobile: false });
  const rects = JSON.parse((await send('Runtime.evaluate', { expression: 'JSON.stringify([...document.querySelectorAll(".card")].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}))', returnByValue: true })).result.value);
  for (const [i, name] of [[0, 'front'], [1, 'back']]) {
    const [x, y, w, h] = rects[i], bleed = (w * 3) / 91; // previews are cropped to the 85x55 trim size
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: x + bleed, y: y + bleed, width: w - 2 * bleed, height: h - 2 * bleed, scale: 1 } });
    fs.writeFileSync(path.join(out, `business-card-${name}.png`), Buffer.from(shot.data, 'base64'));
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await load(ogFile);
  const ogShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  fs.writeFileSync(path.join(root, 'public/img/og.jpg'), Buffer.from(ogShot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 1024, deviceScaleFactor: 1, mobile: false });
  await load(qrPage);
  const qrShot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1024, height: 1024, scale: 1 } });
  fs.writeFileSync(path.join(out, 'qr-code.png'), Buffer.from(qrShot.data, 'base64'));
  ws.close();
  console.log('QR points to:', qrUrl);
  console.log('Wrote print/business-card-print.pdf, print/business-card-front.png, print/business-card-back.png, print/qr-code.svg, print/qr-code.png, public/img/og.jpg');
} finally {
  chrome.kill();
}
