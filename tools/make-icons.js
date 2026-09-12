/* Ilova ikonkalarini chizadi (PWA manifest uchun).
   Ishlatish:  node tools/make-icons.js
   Natija:     icons/icon-192.png, icon-512.png, icon-maskable-512.png

   Tashqi kutubxona ishlatilmaydi — PNG qo'lda kodlanadi (zlib Node ichida bor). */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BG = [0xf5, 0xa5, 0x24];   // amber
const FG = [0x1a, 0x12, 0x05];   // to'q jigarrang

/* --- PNG kodlash --- */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return buf => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // RGBA
  // 10-12: compression / filter / interlace = 0

  // har bir qatorga filtr bayti qo'shiladi
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* --- geometriya --- */
// nuqtadan kesmagacha bo'lgan masofa
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// yumaloq burchakli to'rtburchak ichidami
function inRoundRect(x, y, r) {
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  return Math.hypot(x - cx, y - cy) <= r;
}

/* "Y" harfi: ikki qiya yelka va vertikal oyoq */
function inY(x, y, scale) {
  // markazga nisbatan masshtab (maskable uchun kichraytiriladi)
  x = (x - 0.5) / scale + 0.5;
  y = (y - 0.5) / scale + 0.5;
  const th = 0.075;
  return distSeg(x, y, 0.315, 0.285, 0.5, 0.515) <= th
      || distSeg(x, y, 0.685, 0.285, 0.5, 0.515) <= th
      || distSeg(x, y, 0.5, 0.5, 0.5, 0.735) <= th;
}

/* --- rasm chizish (3x3 supersampling bilan silliqlash) --- */
function draw(size, maskable) {
  const buf = Buffer.alloc(size * size * 4);
  const SS = 3, radius = 0.22;
  const scale = maskable ? 0.78 : 1;   // maskable: xavfsiz zonaga siqamiz

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let bgHits = 0, fgHits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          const inBg = maskable ? true : inRoundRect(x, y, radius);
          if (!inBg) continue;
          bgHits++;
          if (inY(x, y, scale)) fgHits++;
        }
      }
      const total = SS * SS;
      const alpha = bgHits / total;
      const fg = fgHits / total;
      const i = (py * size + px) * 4;
      if (alpha === 0) { buf[i + 3] = 0; continue; }
      // fon ustiga harf rangini aralashtiramiz
      const k = alpha > 0 ? fg / alpha : 0;
      for (let c = 0; c < 3; c++) buf[i + c] = Math.round(BG[c] * (1 - k) + FG[c] * k);
      buf[i + 3] = Math.round(alpha * 255);
    }
  }
  return encodePNG(size, size, buf);
}

/* --- yozish --- */
const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });

const files = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true]
];

for (const [name, size, maskable] of files) {
  const png = draw(size, maskable);
  fs.writeFileSync(path.join(dir, name), png);
  console.log(name.padEnd(24), size + 'x' + size, (png.length / 1024).toFixed(1) + ' KB');
}
console.log('\nPapka:', dir);
