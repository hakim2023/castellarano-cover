// Self-checks for scripts/qr.js against published reference values plus structural read-back.
import assert from 'node:assert/strict';
import { qr, rsRemainder, formatBits } from './qr.js';

// Reed-Solomon: "HELLO WORLD" 1-M example (thonky.com QR tutorial, error correction coding step).
assert.deepEqual(rsRemainder([32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17], 10), [196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
// Format string table: level L (bits 01) + mask 4 = 110011000101111; level M (00) + mask 0 = 101010000010010.
assert.equal(formatBits(1, 4).toString(2).padStart(15, '0'), '110011000101111');
assert.equal(formatBits(0, 0).toString(2).padStart(15, '0'), '101010000010010');

const gfMul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z & 0xff; };
const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];

for (const text of ['https://wa.me/393889004487', 'https://www.castellaranocover.it/', 'https://www.example.com/' + 'x'.repeat(120)]) {
  const r = qr(text);
  // 1) Read the grid back: unmask, walk the zig-zag, must give the exact codewords.
  const bits = [];
  for (let right = r.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < r.size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, y = ((right + 1) & 2) === 0 ? r.size - 1 - vert : vert;
      if (!r.fn[y][x]) bits.push(r.modules[y][x] !== MASKS[r.mask](x, y) ? 1 : 0);
    }
  }
  const read = []; for (let i = 0; i + 8 <= r.codewords.length * 8; i += 8) read.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  assert.deepEqual(read, r.codewords, 'read-back mismatch for ' + text);
  // 2) Both format-info copies decode to level M + chosen mask.
  const fb = formatBits(0, r.mask), s = r.size, m = r.modules;
  const copyA = [...[0, 1, 2, 3, 4, 5].map((i) => m[i][8]), m[7][8], m[8][8], m[8][7], ...[9, 10, 11, 12, 13, 14].map((i) => m[8][14 - i])];
  const copyB = [...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => m[8][s - 1 - i]), ...[8, 9, 10, 11, 12, 13, 14].map((i) => m[s - 15 + i][8])];
  for (const copy of [copyA, copyB]) assert.equal(copy.reduce((a, b, i) => a | ((b ? 1 : 0) << i), 0), fb);
  // 3) Finder pattern rows are correct (dark 7, light ring, dark 3x3 centre).
  assert.deepEqual(m[0].slice(0, 7), [true, true, true, true, true, true, true]);
  assert.deepEqual(m[3].slice(0, 7), [true, false, true, true, true, false, true]);
  assert.equal(m[s - 8][8], true, 'dark module');
  // 4) Every block's codeword polynomial has zero syndromes (independent RS validity check).
  const data = r.codewords; // de-interleave using the same block layout
  const v = r.version, ec = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26][v], nb = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5][v];
  const raw = data.length, shortLen = Math.floor(raw / nb), numShort = nb - (raw % nb);
  const lens = Array.from({ length: nb }, (_, i) => shortLen - ec + (i < numShort ? 0 : 1));
  const blocks = lens.map(() => []); let k = 0;
  for (let i = 0; i <= shortLen - ec; i++) lens.forEach((len, b) => { if (i < len) blocks[b].push(data[k++]); });
  for (let i = 0; i < ec; i++) blocks.forEach((b) => b.push(data[k++]));
  for (const cw of blocks) for (let root = 0, a = 1; root < ec; root++, a = gfMul(a, 2)) {
    let syn = 0; for (const c of cw) syn = gfMul(syn, a) ^ c;
    assert.equal(syn, 0, 'non-zero syndrome');
  }
}
console.log('qr checks passed');
