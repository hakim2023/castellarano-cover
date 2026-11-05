const fs = require('fs');
const edit = (f, pairs) => { let s = fs.readFileSync(f, 'utf8'); for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(f + ' missing: ' + a.slice(0, 80)); s = s.split(a).join(b); } fs.writeFileSync(f, s); };

edit('views.js', [
  // hero row
  ['<a class="btn light" href="tel:${biz.phone}">', '<a class="btn call" href="tel:${biz.phone}">'],
  ['<a class="btn ghost" href="${mapLink}" target="_blank" rel="noopener">${icon(\'googlemaps\')} <span>', '<a class="btn maps" href="${mapLink}" target="_blank" rel="noopener">${icon(\'googlemaps\')} <span>'],
  ['<a class="btn ghost ig iconly"', '<a class="btn ig iconly"'],
  // "find us" card: Maps, WhatsApp, Instagram (+ Call)
  ['<div class="vbtns"><a class="btn" href="${mapLink}" target="_blank" rel="noopener">${icon(\'googlemaps\')} Google Maps</a><a class="btn wa" href="${wa(\'\')}" target="_blank" rel="noopener">${icon(\'whatsapp\')} ${t.whatsapp}</a><a class="btn ghost dk" href="${esc(biz.instagram)}" target="_blank" rel="me noopener">${icon(\'instagram\')} Instagram</a></div>',
   '<div class="vbtns"><a class="btn call" href="tel:${biz.phone}">${icon(\'phone\')} ${t.call}</a><a class="btn wa" href="${wa(\'\')}" target="_blank" rel="noopener">${icon(\'whatsapp\')} ${t.whatsapp}</a><a class="btn maps" href="${mapLink}" target="_blank" rel="noopener">${icon(\'googlemaps\')} Google Maps</a><a class="btn ig" href="${esc(biz.instagram)}" target="_blank" rel="me noopener">${icon(\'instagram\')} Instagram</a></div>'],
  // review buttons on the static (GitHub Pages) build
  ['<div class="rbtns"><a class="btn" href="${mapLink}"', '<div class="rbtns"><a class="btn maps" href="${mapLink}"'],
  // mobile bottom bar: coloured tiles
  ['<nav class="dock" aria-label="Quick contact"><a href="tel:${biz.phone}">', '<nav class="dock" aria-label="Quick contact"><a class="call" href="tel:${biz.phone}">'],
  ['<a href="${mapLink}" target="_blank" rel="noopener">${icon(\'googlemaps\')}<span>${t.directions}</span></a></nav>', '<a class="maps" href="${mapLink}" target="_blank" rel="noopener">${icon(\'googlemaps\')}<span>${t.directions}</span></a></nav>'],
]);

edit('public/style.css', [
  // hero rule that turned every non-WhatsApp button white
  ['.hero .btn:not(.wa):not(.ghost){background:#fff;color:var(--ink);border-color:#fff}', ''],
]);

fs.appendFileSync('public/style.css', `
/* brand-coloured contact buttons: Call blue, WhatsApp green, Maps red (Google pin), Instagram gradient */
:root{--c-call:#2563eb;--c-wa:#15803d;--c-maps:#d93025;--c-ig:#c13584}
.btn.call{background:var(--c-call);border-color:var(--c-call);color:#fff}
.btn.wa{background:var(--c-wa);border-color:var(--c-wa);color:#fff}
.btn.maps{background:var(--c-maps);border-color:var(--c-maps);color:#fff}
.btn.ig{background:linear-gradient(135deg,#6d3fc9 0%,#c13584 55%,#d9442f 100%);border-color:transparent;color:#fff}
.btn.call:hover{box-shadow:0 10px 22px rgba(37,99,235,.45)}
.btn.wa:hover{box-shadow:0 10px 22px rgba(21,128,61,.45)}
.btn.maps:hover{box-shadow:0 10px 22px rgba(217,48,37,.4)}
.btn.ig:hover{box-shadow:0 10px 22px rgba(193,53,132,.45)}
.btn .ic{width:1.25em;height:1.25em}
.dock a.call{background:var(--c-call)}.dock a.wa{background:var(--c-wa)}.dock a.maps{background:var(--c-maps)}
.dock a{border-radius:14px}
/* footer + contact lists: icon sits in its brand-coloured badge */
.flist a .ic,.contact a .ic{box-sizing:content-box;padding:6px;border-radius:50%;width:1em;height:1em;color:#fff}
.flist a[href^="tel:"] .ic{background:var(--c-call)}
.flist a[href*="wa.me"] .ic{background:var(--c-wa)}
.flist a[href*="instagram"] .ic{background:linear-gradient(135deg,#6d3fc9,#c13584 60%,#d9442f)}
.flist a[href^="mailto:"] .ic{background:#475569}
.fmap .ic{box-sizing:content-box;padding:6px;border-radius:50%;width:1em;height:1em;color:#fff;background:var(--c-maps)}
.vbtns{grid-template-columns:1fr 1fr}
`);
