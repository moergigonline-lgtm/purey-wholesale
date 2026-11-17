// Turns build-pages.js output into a deployable folder, in place. Idempotent.
//   node build-pages.js purey-src.html ../site     (writes index + 5 category pages)
//   node make-deploy.js ../site                    (wraps the headless index, adds noindex)
// The img/ folder must already be in the output folder. Remove the noindex
// lines when the client approves the site for launch.
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
if (!dir) throw new Error('usage: node make-deploy.js <site-folder>');
const NOINDEX = '<meta name="robots" content="noindex">';
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.html') && !n.startsWith('_'))) {
  const p = path.join(dir, f);
  let t = fs.readFileSync(p, 'utf8');
  if (f === 'index.html' && !/^\s*<!doctype/i.test(t)) {
    t = '<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n' + NOINDEX + '\n' + t + '\n</html>\n';
  } else if (!/name="robots"/.test(t)) {
    t = t.replace(/<meta charset="utf-8">/, '<meta charset="utf-8">\n' + NOINDEX);
  }
  fs.writeFileSync(p, t);
}
console.log('deploy-ready:', dir);
