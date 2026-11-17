// Product photos -> web WebPs whose studio-grey backdrop is lifted to pure white,
// so `mix-blend-mode:multiply` dissolves it into whatever tint sits behind.
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const fs = require('fs');
const path = require('path');
const SRC = process.argv[2];
const OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  let total = 0;
  for (const f of fs.readdirSync(SRC).filter((n) => n.endsWith('.png')).sort()) {
    const img = sharp(path.join(SRC, f)).removeAlpha();
    const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H, channels: C } = info;
    const px = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2]]; };
    // sample a band along the top and both sides
    const pts = [];
    for (let k = 0; k < 20; k++) {
      pts.push(px(Math.round((W - 1) * k / 19), 3));
      pts.push(px(3, Math.round((H - 1) * k / 19)));
      pts.push(px(W - 4, Math.round((H - 1) * k / 19)));
    }
    const ch = [0, 1, 2].map((c) => { const v = pts.map((p) => p[c]).sort((a, b) => a - b); return v[Math.floor(v.length * 0.5)]; });
    const lo = [0, 1, 2].map((c) => Math.min(...pts.map((p) => p[c])));
    const scale = ch.map((v) => 255 / Math.max(v - 4, 1));
    const out = path.join(OUT, f.slice(0, 2) + '.webp');
    await sharp(path.join(SRC, f)).removeAlpha()
      .linear(scale, [0, 0, 0])
      .resize({ width: 760, height: 1100, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
    const sz = fs.statSync(out).size; total += sz;
    console.log(f.slice(0, 2), W + 'x' + H, 'bg', ch.join(','), 'min', lo.join(','), Math.round(sz / 1024) + 'KB');
  }
  console.log('total', Math.round(total / 1024) + 'KB');
})();
