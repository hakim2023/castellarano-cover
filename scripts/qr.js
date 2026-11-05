// Minimal QR Code encoder (ISO/IEC 18004): byte mode, error correction level M, versions 1-10.
// Enough for URLs up to ~200 characters. Algorithm follows the reference approach used by Nayuki's library.
const EC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // level M, index = version
const NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const EC_BITS_M = 0;

const gfMul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 0xff; };
function rsDivisor(degree) {
  const r = new Array(degree).fill(0); r[degree - 1] = 1; let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) { r[j] = gfMul(r[j], root); if (j + 1 < degree) r[j] ^= r[j + 1]; }
    root = gfMul(root, 2);
  }
  return r;
}
export function rsRemainder(data, degree) {
  const div = rsDivisor(degree), r = new Array(degree).fill(0);
  for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((d, i) => { r[i] ^= gfMul(d, f); }); }
  return r;
}
export function formatBits(ecBits, mask) {
  const data = (ecBits << 3) | mask; let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}
const rawModules = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
const alignPositions = (v) => {
  if (v === 1) return [];
  const n = Math.floor(v / 7) + 2, step = Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2, out = [6];
  for (let pos = v * 4 + 17 - 7; out.length < n; pos -= step) out.splice(1, 0, pos);
  return out;
};
const MASKS = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** Returns { size, modules: boolean[y][x], version, codewords } */
export function qr(text) {
  const bytes = [...Buffer.from(text, 'utf8')];
  let v = 1, dataCap;
  for (; v <= 10; v++) {
    dataCap = Math.floor(rawModules(v) / 8) - EC_PER_BLOCK[v] * NUM_BLOCKS[v];
    if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= dataCap * 8) break;
  }
  if (v > 10) throw new Error('Text too long for this QR encoder');
  // bit stream: mode 0100, length, data, terminator, byte padding, pad codewords
  const bits = [];
  const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8));
  put(0, Math.min(4, dataCap * 8 - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < dataCap * 8; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  // split into blocks, add error correction, interleave
  const nb = NUM_BLOCKS[v], ecLen = EC_PER_BLOCK[v], raw = Math.floor(rawModules(v) / 8);
  const shortLen = Math.floor(raw / nb), numShort = nb - (raw % nb);
  const blocks = []; let k = 0;
  for (let i = 0; i < nb; i++) { const len = shortLen - ecLen + (i < numShort ? 0 : 1); const d = data.slice(k, k + len); k += len; blocks.push({ d, e: rsRemainder(d, ecLen) }); }
  const codewords = [];
  for (let i = 0; i <= shortLen - ecLen; i++) blocks.forEach((b) => { if (i < b.d.length) codewords.push(b.d[i]); });
  for (let i = 0; i < ecLen; i++) blocks.forEach((b) => codewords.push(b.e[i]));

  const size = v * 4 + 17;
  const grid = () => Array.from({ length: size }, () => new Array(size).fill(false));
  const base = grid(), fn = grid();
  const setF = (x, y, dark) => { base[y][x] = dark; fn[y][x] = true; };
  for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]])
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d !== 2 && d !== 4);
    }
  const ap = alignPositions(v), last = ap.length - 1;
  ap.forEach((ax, i) => ap.forEach((ay, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const drawFormat = (m, mask) => {
    const b = formatBits(EC_BITS_M, mask), bit = (i) => ((b >>> i) & 1) === 1;
    const s = (x, y, d) => { m[y][x] = d; fn[y][x] = true; };
    for (let i = 0; i <= 5; i++) s(8, i, bit(i));
    s(8, 7, bit(6)); s(8, 8, bit(7)); s(7, 8, bit(8));
    for (let i = 9; i < 15; i++) s(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) s(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) s(8, size - 15 + i, bit(i));
    s(8, size - 8, true);
  };
  drawFormat(base, 0); // reserve format areas before placing data
  if (v >= 7) {
    let rem = v; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const b = (v << 12) | rem;
    for (let i = 0; i < 18; i++) { const d = ((b >>> i) & 1) === 1, a = size - 11 + (i % 3), c = Math.floor(i / 3); setF(a, c, d); setF(c, a, d); }
  }
  // zig-zag data placement
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
      if (!fn[y][x] && i < codewords.length * 8) { base[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
    }
  }
  // try all 8 masks, keep the lowest penalty
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const m = base.map((row, y) => row.map((d, x) => (fn[y][x] ? d : d !== MASKS[mask](x, y))));
    drawFormat(m, mask);
    const p = penalty(m);
    if (!best || p < best.p) best = { p, m, mask };
  }
  return { size, modules: best.m, version: v, mask: best.mask, codewords, fn };
}

function penalty(m) {
  const n = m.length; let p = 0, dark = 0;
  const lines = [...m, ...m[0].map((_, x) => m.map((row) => row[x]))];
  for (const line of lines) {
    let run = 1;
    for (let i = 1; i <= n; i++) {
      if (i < n && line[i] === line[i - 1]) run++;
      else { if (run >= 5) p += run - 2; run = 1; }
    }
    const s = line.map((d) => (d ? 1 : 0)).join('');
    for (const pat of ['10111010000', '00001011101']) for (let k = s.indexOf(pat); k !== -1; k = s.indexOf(pat, k + 1)) p += 40;
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (m[y][x]) dark++;
    if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
  }
  return p + Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
}

/** SVG string, quiet zone of 4 modules, crisp square modules. */
export function qrSvg(text, { dark = '#0a0a0a', light = '#ffffff' } = {}) {
  const { size, modules } = qr(text), q = 4, w = size + q * 2;
  let d = '';
  modules.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + q} ${y + q}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${w}" shape-rendering="crispEdges"><rect width="${w}" height="${w}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}
