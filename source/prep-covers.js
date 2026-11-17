// Collection covers -> web WebPs; plus a matching "sets" cover composed from product 13
// on the same wine studio backdrop the GPT covers use (none was supplied for that category).
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const path = require('path');
const SRC = process.argv[2], PROD = process.argv[3], OUT = process.argv[4];

const MAP = {
  'PUREY-Mixed-01-Cotton-Closeup.png': 'cover-cotton.webp',
  'PUREY-Satin-Atelier-Colour-Study.png': 'cover-satin.webp',
  'PUREY-Mixed-04-Lingerie-Gold-Closeup.png': 'cover-lingerie.webp',
  'PUREY-Mixed-03-Robes-and-Slips-After-Dark.png': 'cover-robes.webp',
};

(async () => {
  for (const [src, out] of Object.entries(MAP)) {
    await sharp(path.join(SRC, src)).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(path.join(OUT, out));
    const m = await sharp(path.join(OUT, out)).metadata();
    console.log(out, m.width + 'x' + m.height);
  }

  // sample the robes cover backdrop so the composed cover matches its wine
  const { data: rb, info: ri } = await sharp(path.join(SRC, 'PUREY-Mixed-03-Robes-and-Slips-After-Dark.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const i = (Math.round(y) * ri.width + Math.round(x)) * 3; return [rb[i], rb[i + 1], rb[i + 2]]; };
  const edge = at(ri.width * 0.08, ri.height * 0.5), mid = at(ri.width * 0.3, ri.height * 0.35);
  console.log('robes backdrop edge', edge, 'mid', mid);

  // cut product 13 out of its white ground (de-matted so no white fringe on dark)
  const { data, info } = await sharp(path.join(PROD, '13-burgundy-lace-bra-and-thong-set.png')).removeAlpha()
    .linear([255 / 238, 255 / 238, 255 / 238], [0, 0, 0]).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const a = Math.max(0, Math.min(1, (255 - Math.min(r, g, b)) / 255 * 3.2));
    const un = (c) => a > 0.01 ? Math.max(0, Math.min(255, (c - 255 * (1 - a)) / a)) : 0;
    rgba[i * 4] = un(r); rgba[i * 4 + 1] = un(g); rgba[i * 4 + 2] = un(b); rgba[i * 4 + 3] = Math.round(a * 255);
  }
  const cut = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
  const C = 1200;
  const item = await sharp(cut).resize({ width: Math.round(C * 0.40), height: Math.round(C * 0.40), fit: 'inside' }).png().toBuffer();
  const im = await sharp(item).metadata();

  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${C}" height="${C}">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="70%">
        <stop offset="0" stop-color="${hex(mid.map((v) => Math.min(255, Math.round(v * 1.35))))}"/>
        <stop offset="0.55" stop-color="${hex(mid)}"/>
        <stop offset="1" stop-color="${hex(edge.map((v) => Math.round(v * 0.85)))}"/>
      </radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="28"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <ellipse cx="${C / 2}" cy="${Math.round(C * 0.29 + im.height / 2 + 18)}" rx="${Math.round(im.width * 0.42)}" ry="34" fill="#000" opacity=".35" filter="url(#b)"/>
  </svg>`);
  // a soft light sweep from the upper right, like the GPT covers
  const sweep = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${C}" height="${C}">
    <defs><linearGradient id="s" x1="1" y1="0" x2="0.3" y2="0.7"><stop offset="0" stop-color="#ffd9c8" stop-opacity=".22"/><stop offset=".5" stop-color="#ffd9c8" stop-opacity="0"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#s)"/></svg>`);
  await sharp(bg).composite([
    { input: item, left: Math.round((C - im.width) / 2), top: Math.round(C * 0.29 - im.height / 2) },
    { input: sweep, blend: 'screen' },
  ]).webp({ quality: 80 }).toFile(path.join(OUT, 'cover-sets.webp'));
  console.log('cover-sets.webp', C + 'x' + C);
})();
