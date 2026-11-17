// Wide banner for the sets category page: two sets standing on the right two-thirds of the
// same wine studio backdrop, empty left third for the title.
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const path = require('path');
const PROD = 'C:/Users/Admin/Desktop/Client Accounts/Purey Wholesale/';
const OUT = process.argv[2];
async function cutout(file) {
  const { data, info } = await sharp(file).removeAlpha().linear([255 / 238, 255 / 238, 255 / 238], [0, 0, 0]).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const a = Math.max(0, Math.min(1, (255 - Math.min(r, g, b)) / 255 * 3.2));
    const un = (c) => a > 0.01 ? Math.max(0, Math.min(255, (c - 255 * (1 - a)) / a)) : 0;
    rgba[i * 4] = un(r); rgba[i * 4 + 1] = un(g); rgba[i * 4 + 2] = un(b); rgba[i * 4 + 3] = Math.round(a * 255);
  }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
}
(async () => {
  const W = 2000, H = 760;
  const picks = ['Products/13-burgundy-lace-bra-and-thong-set.png', 'Underwear/Edited Photos/25-black-crystal-lace-set.png', 'Underwear/Edited Photos/21-black-pearl-strap-set.png'];
  const items = [];
  for (const p of picks) {
    const buf = await sharp(await cutout(PROD + p)).resize({ height: Math.round(H * 0.74), width: Math.round(W * 0.2), fit: 'inside' }).png().toBuffer();
    items.push({ buf, m: await sharp(buf).metadata() });
  }
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="g" cx="62%" cy="45%" r="75%"><stop offset="0" stop-color="#3a0712"/><stop offset=".55" stop-color="#1c020a"/><stop offset="1" stop-color="#110005"/></radialGradient>
      <linearGradient id="s" x1="1" y1="0" x2=".35" y2=".8"><stop offset="0" stop-color="#ffd9c8" stop-opacity=".16"/><stop offset=".5" stop-color="#ffd9c8" stop-opacity="0"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="26"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#s)"/>
    ${items.map((it, i) => `<ellipse cx="${Math.round(W * (0.46 + i * 0.19))}" cy="${Math.round(H * 0.5 + it.m.height / 2 + 14)}" rx="${Math.round(it.m.width * 0.42)}" ry="26" fill="#000" opacity=".4" filter="url(#b)"/>`).join('')}
  </svg>`);
  await sharp(bg).composite(items.map((it, i) => ({ input: it.buf, left: Math.round(W * (0.46 + i * 0.19) - it.m.width / 2), top: Math.round(H * 0.5 - it.m.height / 2) })))
    .webp({ quality: 80 }).toFile(path.join(OUT, 'banner-sets.webp'));
  console.log('banner-sets.webp', W + 'x' + H);
})();
