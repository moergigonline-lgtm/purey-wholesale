// Split hero: Lavermo look (noir campaign, piece O10) on the left, Purey satin on the right,
// side by side at full colour, joined by a soft seam.  node prep-split-hero.js  (writes ../site/img)
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const path = require('path');
const IMG = path.join(__dirname, '../site/img');
const P = (f) => path.join(IMG, f);

async function blend({ w, h, L, lx, lw, R, rx, rw, f }) {
  const crop = (img, x, cw) => sharp(P(img)).resize({ height: h }).extract({ left: x, top: 0, width: cw, height: h });
  // both looks keep their own colour (VS / PINK style): no grading, only a soft blend at the seam
  const left = await crop(L, lx, lw).toBuffer();
  const right = await crop(R, rx, rw).toBuffer();
  const mask = Buffer.from(`<svg width="${rw}" height="${h}"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${f / rw}" stop-color="#fff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  const rightM = await sharp(right).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const seam = w - rw;
  if (lw < seam + f) throw new Error('left look must reach under the whole seam');
  const shade = Buffer.from(`<svg width="${w}" height="${h}"><defs>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14060a" stop-opacity="0"/><stop offset=".35" stop-color="#14060a" stop-opacity="0"/><stop offset=".7" stop-color="#14060a" stop-opacity="0"/><stop offset="1" stop-color="#14060a" stop-opacity=".35"/></linearGradient>
    </defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`);
  return sharp({ create: { width: w, height: h, channels: 3, background: '#1a0609' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: rightM, left: seam, top: 0 }, { input: shade, left: 0, top: 0 }]).png().toBuffer();
}

(async () => {
  const wide = await blend({ w: 1600, h: 960, L: 'purey-noir-wide-1440.webp', lx: 60, lw: 960, R: 'purey-satin-wide-1440.webp', rx: 0, rw: 900, f: 260 });
  await sharp(wide).webp({ quality: 82 }).toFile(P('hero-split-1600.webp'));
  await sharp(wide).resize({ width: 1000 }).webp({ quality: 80 }).toFile(P('hero-split-1000.webp'));
  console.log('split hero written');
})().catch((e) => { console.error(e); process.exit(1); });
