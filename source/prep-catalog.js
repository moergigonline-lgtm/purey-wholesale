// Edited product photos -> img/p/<id>.webp: studio grey lifted to white (so multiply
// melts it into the card tint), sized for a ~260px card at 2x.
const sharp = require('C:/Users/Admin/GitHub/flann-dashboard/node_modules/sharp');
const fs = require('fs'), path = require('path');
const all = require('./catalog-data.js');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  let total = 0, n = 0;
  const ONLY = process.argv[3] ? new RegExp(process.argv[3]) : null;
  const todo = all.filter((p) => p.src && (!ONLY || ONLY.test(p.id)));
  const work = async (p) => {
    const out = path.join(OUT, p.id + '.webp');
    const { data, info } = await sharp(p.src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, C = info.channels;
    const pts = [];
    for (let k = 0; k < 16; k++) {
      for (const [x, y] of [[Math.round((W - 1) * k / 15), 3], [3, Math.round((H - 1) * k / 15)], [W - 4, Math.round((H - 1) * k / 15)]]) {
        const i = (y * W + x) * C; pts.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    const med = [0, 1, 2].map((c) => { const v = pts.map((q) => q[c]).sort((a, b) => a - b); return v[v.length >> 1]; });
    const scale = med.map((v) => (v > 200 ? 255 / Math.max(v - 4, 1) : 1));
    await sharp(p.src).removeAlpha().linear(scale, [0, 0, 0])
      .resize({ width: 560, height: 840, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 76 }).toFile(out);
    total += fs.statSync(out).size; n++;
  };
  for (let i = 0; i < todo.length; i += 6) await Promise.all(todo.slice(i, i + 6).map(work));
  console.log(n, 'images,', Math.round(total / 1024 / 1024 * 10) / 10, 'MB');
})();
