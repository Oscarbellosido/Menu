// Genera icon-192.png i icon-512.png (el mateix dibuix que icon.svg) sense dependències:
// rasteritza els rectangles arrodonits amb supermostreig i escriu el PNG a mà amb zlib.
// Ús: node genera-icones.js
const fs = require('fs');
const zlib = require('zlib');

const FONS = [0x0c, 0x16, 0x26];
const QUADRES = [ // x, y, costat, radi, color (sobre 512)
  [116, 116, 128, 34, [0x3b, 0x82, 0xf6]],
  [268, 116, 128, 34, [0x38, 0xbd, 0xf8]],
  [116, 268, 128, 34, [0xf5, 0x9e, 0x0b]],
  [268, 268, 128, 34, [0xd9, 0x59, 0x26]],
];

const dinsRect = (px, py, x, y, w, r) => {
  if (px < x || py < y || px > x + w || py > y + w) return false;
  const cx = Math.min(Math.max(px, x + r), x + w - r);
  const cy = Math.min(Math.max(py, y + r), y + w - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};

function pixel(px, py) { // coordenades sobre 512; retorna [r,g,b,a]
  if (!dinsRect(px, py, 0, 0, 512, 112)) return [0, 0, 0, 0];
  for (const [x, y, w, r, c] of QUADRES) if (dinsRect(px, py, x, y, w, r)) return [...c, 255];
  return [...FONS, 255];
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = b => { let c = ~0; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
const chunk = (tipus, dades) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(dades.length);
  const td = Buffer.concat([Buffer.from(tipus), dades]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(mida) {
  const S = 4, esc = 512 / mida;
  const files = [];
  for (let y = 0; y < mida; y++) {
    const fila = Buffer.alloc(1 + mida * 4);
    for (let x = 0; x < mida; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
        const p = pixel((x + (sx + .5) / S) * esc, (y + (sy + .5) / S) * esc);
        r += p[0] * p[3]; g += p[1] * p[3]; b += p[2] * p[3]; a += p[3];
      }
      const o = 1 + x * 4;
      if (a) { fila[o] = r / a; fila[o + 1] = g / a; fila[o + 2] = b / a; }
      fila[o + 3] = a / (S * S);
    }
    files.push(fila);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(mida, 0); ihdr.writeUInt32BE(mida, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(files))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const m of [192, 512]) fs.writeFileSync(`${__dirname}/icon-${m}.png`, png(m));
console.log('Icones generades');
