// Split hero: Lavermo look (noir campaign, piece O10) on the left, Purey satin on the right,
// graded into one wine-dark room with a soft seam.  node prep-split-hero.js  (writes ../site/img)
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const path = require('path');
const IMG = path.join(__dirname, '../site/img');
const P = (f) => path.join(IMG, f);

async function blend({ w, h, L, lx, lw, R, rx, rw, f }) {
  const crop = (img, x, cw) => sharp(P(img)).resize({ height: h }).extract({ left: x, top: 0, width: cw, height: h });
  // pull the sunlit stone toward the wine room: darker, warmer, less saturated
  let left = await crop(L, lx, lw).modulate({ brightness: 0.74, saturation: 0.82 }).toBuffer();
  const tint = await sharp({ create: { width: lw, height: h, channels: 4, background: { r: 120, g: 28, b: 40, alpha: 0.34 } } }).png().toBuffer();
  // the sunlit arch beside the seam falls into the same shadow as the velvet curtain
  const edge = Buffer.from(`<svg width="${lw}" height="${h}"><defs><linearGradient id="e" x1="0" x2="1"><stop offset=".5" stop-color="#1a0609" stop-opacity="0"/><stop offset="1" stop-color="#1a0609" stop-opacity=".78"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#e)"/></svg>`);
  left = await sharp(left).composite([{ input: tint, blend: 'soft-light' }, { input: tint, blend: 'multiply' }, { input: edge }]).toBuffer();
  const right = await crop(R, rx, rw).toBuffer();
  const mask = Buffer.from(`<svg width="${rw}" height="${h}"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${f / rw}" stop-color="#fff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
  const rightM = await sharp(right).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const seam = w - rw;
  const shade = Buffer.from(`<svg width="${w}" height="${h}"><defs>
    <linearGradient id="s" x1="0" x2="1"><stop offset="${(seam - f * 0.4) / w}" stop-color="#14060a" stop-opacity="0"/><stop offset="${(seam + f * 0.5) / w}" stop-color="#14060a" stop-opacity=".45"/><stop offset="${(seam + f * 1.3) / w}" stop-color="#14060a" stop-opacity="0"/></linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14060a" stop-opacity=".25"/><stop offset=".35" stop-color="#14060a" stop-opacity="0"/><stop offset=".7" stop-color="#14060a" stop-opacity="0"/><stop offset="1" stop-color="#14060a" stop-opacity=".55"/></linearGradient>
    </defs><rect width="100%" height="100%" fill="url(#s)"/><rect width="100%" height="100%" fill="url(#v)"/></svg>`);
  return sharp({ create: { width: w, height: h, channels: 3, background: '#1a0609' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: rightM, left: seam, top: 0 }, { input: shade, left: 0, top: 0 }]).png().toBuffer();
}

(async () => {
  const wide = await blend({ w: 1600, h: 960, L: 'purey-noir-wide-1440.webp', lx: 60, lw: 880, R: 'purey-satin-wide-1440.webp', rx: 0, rw: 900, f: 260 });
  await sharp(wide).webp({ quality: 82 }).toFile(P('hero-split-1600.webp'));
  await sharp(wide).resize({ width: 1000 }).webp({ quality: 80 }).toFile(P('hero-split-1000.webp'));
  const mob = await blend({ w: 680, h: 1200, L: 'purey-noir-mobile-800.webp', lx: 120, lw: 370, R: 'purey-satin-mobile-800.webp', rx: 225, rw: 340, f: 34 });
  await sharp(mob).webp({ quality: 80 }).toFile(P('hero-split-mobile-680.webp'));
  await sharp(mob).resize({ width: 440 }).webp({ quality: 80 }).toFile(P('hero-split-mobile-440.webp'));
  console.log('split hero written');
})().catch((e) => { console.error(e); process.exit(1); });
