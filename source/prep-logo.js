// Purey logos -> recoloured, tightly cropped transparent PNGs for the site.
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const path = require('path');
const DIR = process.argv[2], OUT = process.argv[3];
const BLACK = path.join(DIR, 'ChatGPT Image Nov 15, 2026, 02_04_45 AM.png');
const WHITE = path.join(DIR, 'ChatGPT Image Oct 18, 2026, 01_27_47 AM.png');

// alpha mask = ink coverage; for the black logo use alpha * darkness
async function mask(file, dark) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const m = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < m.length; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    const lum = (r + g + b) / 3;
    m[i] = Math.round(a * (dark ? (255 - lum) / 255 : lum / 255));
  }
  return { m, W: info.width, H: info.height };
}
function rows(mk) { const r = []; for (let y = 0; y < mk.H; y++) { let s = 0; for (let x = 0; x < mk.W; x++) s += mk.m[y * mk.W + x] > 40; r.push(s); } return r; }
function bbox(mk, y0, y1) {
  let x0 = mk.W, x1 = -1, yy0 = mk.H, yy1 = -1;
  for (let y = y0; y < y1; y++) for (let x = 0; x < mk.W; x++) if (mk.m[y * mk.W + x] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); yy0 = Math.min(yy0, y); yy1 = Math.max(yy1, y); }
  return { left: x0, top: yy0, width: x1 - x0 + 1, height: yy1 - yy0 + 1 };
}
async function paint(mk, rgb, box, out, h) {
  const px = Buffer.alloc(mk.W * mk.H * 4);
  for (let i = 0; i < mk.m.length; i++) { px[i * 4] = rgb[0]; px[i * 4 + 1] = rgb[1]; px[i * 4 + 2] = rgb[2]; px[i * 4 + 3] = mk.m[i]; }
  const pad = 6;
  const b = { left: Math.max(0, box.left - pad), top: Math.max(0, box.top - pad) };
  b.width = Math.min(mk.W - b.left, box.width + pad * 2); b.height = Math.min(mk.H - b.top, box.height + pad * 2);
  await sharp(px, { raw: { width: mk.W, height: mk.H, channels: 4 } }).extract(b)
    .resize({ height: h, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(OUT, out));
  const meta = await sharp(path.join(OUT, out)).metadata();
  console.log(out, meta.width + 'x' + meta.height);
}

(async () => {
  const k = await mask(BLACK, true);
  const r = rows(k);
  // find the blank gap between the mark and the wordmark (largest run of empty rows inside the ink span)
  const ink = r.map((v) => v > 0);
  const first = ink.indexOf(true), last = ink.lastIndexOf(true);
  let best = [0, 0], run = 0;
  for (let y = first; y <= last; y++) { if (!ink[y]) { run++; if (run > best[1]) best = [y - run + 1, run]; } else run = 0; }
  const gap = best[0] + Math.floor(best[1] / 2);
  console.log('ink', first, last, 'gap at', best[0], 'len', best[1]);
  const WINE = [0x8b, 0x11, 0x19];
  await paint(k, WINE, bbox(k, first, gap), 'logo-mark.png', 240);
  await paint(k, WINE, bbox(k, gap, last + 1), 'logo-word.png', 200);
  await paint(k, WINE, bbox(k, first, last + 1), 'logo-full.png', 520);
  await paint(k, [255, 255, 255], bbox(k, first, gap), 'logo-mark-white.png', 160);
  const w = await mask(WHITE, false);
  await paint(w, [255, 255, 255], bbox(w, 0, w.H), 'logo-alt-white.png', 520);
})();
