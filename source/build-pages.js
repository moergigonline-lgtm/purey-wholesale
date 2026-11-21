// Purey: home + one page per category, generated from one source (purey-src.html)
// so header, footer, basket, quick view and chat stay identical everywhere.
//   node build-pages.js <purey-src.html> <out-dir>
const fs = require('fs'), path = require('path');
const all = require('./catalog-data.js');
const [SRC, OUT] = process.argv.slice(2);
const src = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const chatVersion = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(path.dirname(SRC), 'purey-chat.js'))).digest('hex').slice(0,12);

function cut(a, b, from = 0) {
  const i = src.indexOf(a, from); if (i < 0) throw new Error('miss start: ' + a);
  const j = b == null ? src.length : src.indexOf(b, i + a.length); if (j < 0) throw new Error('miss end: ' + b);
  return src.slice(i, j);
}
function rep(s, a, b) { if (!s.includes(a)) throw new Error('miss: ' + a.slice(0, 70)); return s.split(a).join(b); }

const CATS = [
  { k: 'c', slug: 'cotton', ar: 'بجامات قطني', en: 'Cotton', obj: '40% 62%' },
  { k: 's', slug: 'satin', ar: 'بجامات ستان', en: 'Satin', obj: '50% 50%' },
  { k: 'r', slug: 'robes', ar: 'أرواب وعرائسي', en: 'Robes · Bridal', obj: '62% 50%' },
  { k: 'l', slug: 'lingerie', ar: 'لانجري', en: 'Lingerie', obj: '75% 40%' },
  { k: 'u', slug: 'sets', ar: 'طواقم داخلي', en: 'Sets', obj: '50% 40%' },
];
const count = {}; for (const p of all) count[p.c] = (count[p.c] || 0) + 1;
// The current collection photographs (same as the home lookbook); the old collection-* crops are retired.
const COLLECTION_IMG = { lingerie: 'lookbook-edit-lingerie', satin: 'lookbook-edit-satin', robes: 'home-edit-robes', cotton: 'lookbook-edit-cotton', sets: 'lookbook-edit-sets' };
// Home bestsellers per brand tab: PUREY shows only Purey pieces, Lavermo only Lavermo pieces.
const BEST = {
  all: ['o07', 'u64', 'o12', 's42', 'o11'],
  lavermo: ['o10', 'o13', 'l029', 'o09', 's33'],
};
for (const [b, ids] of Object.entries(BEST)) for (const id of ids) {
  const p = all.find((x) => x.id === id);
  if (!p) throw new Error('bestseller missing: ' + id);
  if ((p.brand === 'lavermo') !== (b === 'lavermo')) throw new Error('bestseller ' + id + ' is in the wrong brand list');
}

// ── pieces of the source ──
let style = cut('<style>', '</style>') + '</style>';
const fonts = cut('<link rel="stylesheet" href="https://fonts.googleapis.com', '\n');
let header = cut('  <!-- HEADER -->', '  <main id="top">');
let homeTop = cut('    <!-- HERO -->', '    <!-- CATALOGUE -->');
{ // first paint shows the PUREY bestsellers; the brand tabs swap the list in place
  const CAT_AR = { c: 'بجامات قطني', s: 'بجامات ستان', r: 'ارواب وعرائيسي', l: 'لانجري', u: 'طواقم داخلي' };
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const art = (id) => { const p = all.find((x) => x.id === id); return `        <article data-id="${p.id}" tabindex="0" role="button"><div class="cut"><img src="${p.img}" alt="${esc(p.n)}" loading="lazy" decoding="async"></div><h3>${esc(p.n)}</h3><p class="meta">${CAT_AR[p.c]}</p></article>`; };
  const before = homeTop;
  homeTop = homeTop.replace(/(<div class="best">\n)[\s\S]*?(\n      <\/div>\n      <div class="center">)/, (m, a, b) => a + BEST.all.map(art).join('\n') + b);
  if (homeTop === before) throw new Error('bestseller block not found');
}
// product data always comes from catalog-data.js, never the copy embedded in the source page
const catalogJSON = JSON.stringify(all.map((p) => ({ id: p.id, c: p.c, n: p.n, i: p.img, ...(p.brand ? {brand:p.brand} : {}) })));
const dataScript = '    <script type="application/json" id="catalog-data">' + catalogJSON + '</script>\n';
let about = cut('    <!-- ABOUT -->', '    <!-- BAND -->');
const band = cut('    <!-- BAND -->', '  </main>');
let footer = cut('  <!-- FOOTER -->', '<!-- SHOP:');
const shop = cut('<!-- SHOP:', '<!-- FLANN WEBSITE CHAT -->');
const chat = cut('<!-- FLANN WEBSITE CHAT -->', '<script>\n// Product carousels.');
let script = cut('<script>\n// Product carousels.', null);

// ── shared CSS additions: nav state, category page ──
style = rep(style, '@media (prefers-reduced-motion:reduce)', `/* ── navigation + category pages ────────────────────────────────────── */
nav a[aria-current="page"]{color:var(--wine)}
/* ── site header ─────────────────────────────────────────────────────── */
.page{overflow:clip;margin-block:0}
.page:has(.site-head--campaign){max-width:none}
.announce{display:block; background:var(--wine); color:#f6e9e8; text-align:center; font:400 13px/1.5 var(--f-sans); padding:9px var(--pad); transition:color .15s}
.announce:hover{color:#fff}
.announce bdi{font-weight:500}
.site-head{position:sticky; top:0; z-index:60; background:rgba(255,255,255,.95); -webkit-backdrop-filter:saturate(1.2) blur(10px); backdrop-filter:saturate(1.2) blur(10px); transition:box-shadow .3s}
.site-head.scrolled{box-shadow:0 12px 30px -20px rgba(60,12,20,.4)}
.hbar{display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:16px; padding-block:10px 8px; transition:padding .3s}
.site-head.scrolled .hbar{padding-block:6px 5px}
.h-start{justify-self:start; display:flex; align-items:center; gap:14px}
.h-loc{display:inline-flex; align-items:center; gap:8px; font:400 13.5px/1 var(--f-sans); color:var(--ink-2); transition:color .15s}
.h-loc:hover{color:var(--wine)}
.h-loc svg,.h-icons svg,.menu-btn svg{width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round}
.site-head .logo{justify-self:center}
.site-head .logo img{height:clamp(40px,3.6vw,52px); width:auto; display:block; transition:height .3s}
.site-head.scrolled .logo img{height:32px}
.h-icons{justify-self:end; display:flex; align-items:center; gap:clamp(14px,1.6vw,22px)}
.h-icons a,.h-icons button,.menu-btn{display:grid; place-items:center; color:var(--ink); background:none; border:0; padding:4px; cursor:pointer; transition:color .15s}
.h-icons a:hover,.h-icons button:hover,.menu-btn:hover{color:var(--wine)}
.h-icons .sep{width:1px; height:22px; background:rgba(17,17,17,.14)}
.menu-btn{display:none}
.mainnav{display:flex; justify-content:center; flex-wrap:nowrap; gap:clamp(20px,3vw,50px); padding:0; margin:0; border-top:1px solid rgba(17,17,17,.08); font:inherit}
.mainnav a{position:relative; padding:15px 2px 16px; font:500 clamp(16.5px,1.3vw,19px)/1 var(--f-serif); color:var(--ink); white-space:nowrap; transition:color .2s}
.mainnav a::after{content:""; position:absolute; left:50%; right:50%; bottom:9px; height:1px; background:var(--wine); transition:left .3s cubic-bezier(.2,.7,.2,1), right .3s cubic-bezier(.2,.7,.2,1)}
.mainnav a:hover,.mainnav a[aria-current="page"]{color:var(--wine)}
.mainnav a:hover::after,.mainnav a[aria-current="page"]::after{left:0; right:0}
@media (min-width:921px){
  .hbar{grid-template-columns:minmax(0,1fr) auto;padding-block:8px 4px;column-gap:24px;row-gap:2px}
  .h-start{display:none}
  .site-head .logo{grid-column:1/-1;grid-row:1}
  .mainnav{grid-column:1;grid-row:2;justify-content:flex-start;gap:clamp(10px,1.75vw,30px);border:0}
  .mainnav a{font:600 clamp(13px,1.25vw,17px)/1.1 var(--f-sans);padding:12px 1px}
  .mainnav a::after{bottom:5px}
  .h-icons{grid-column:2;grid-row:2}
}
@media (max-width:920px){
  .h-loc,.h-icons .hide-m,.h-icons .sep,.mainnav{display:none}
  .menu-btn{display:grid}
  .site-head .logo img{height:40px}
}
.site-head--campaign{
  position:relative;height:0;overflow:visible;background:transparent;color:#fff;
  backdrop-filter:none;-webkit-backdrop-filter:none;
}
.site-head--campaign .hbar{
  position:relative;grid-template-columns:1fr auto 1fr;
  gap:0 20px;max-width:none;margin:0;padding:8px clamp(18px,4vw,66px) 0;transition:background-color .24s,color .24s;
}
.site-head--campaign .logo{grid-column:1/-1;grid-row:1;color:inherit}
.campaign-wordmark{
  display:flex;align-items:center;gap:.11em;
  font:600 clamp(46px,6.4vw,92px)/.78 var(--f-latin-script);letter-spacing:.08em;
}
.site-head--campaign .logo .campaign-icon{
  height:.59em;width:auto;flex:none;filter:brightness(0) invert(1);
}
.site-head--campaign .mainnav{
  grid-column:1/3;grid-row:2;justify-content:flex-start;align-items:center;gap:clamp(20px,3.25vw,54px);
}
.site-head--campaign .mainnav a,.mega-trigger{
  padding:8px 0 10px;color:inherit;font:500 clamp(16px,1.3vw,19px)/1.3 var(--f-sans);
}
.site-head--campaign .mainnav a::after{background:currentColor}
.site-head--campaign .h-icons{grid-column:3;grid-row:2;gap:clamp(7px,1vw,14px)}
.site-head--campaign .h-icons :is(a,button),.site-head--campaign .menu-btn{
  color:inherit;padding:0;min-width:40px;min-height:44px;
}
.site-head--campaign .h-icons .sep{display:none}
.mega-trigger,.editorial-drawer button{background:none;border:0;color:inherit;cursor:pointer;font-family:inherit}
.mega-trigger[aria-expanded="true"]{text-decoration:underline;text-underline-offset:7px}
.mega-panel{
  position:absolute;inset-inline:0;top:100%;background:#fff;
  display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(8px,1.2vw,18px);
  padding:22px clamp(18px,4vw,66px) 30px;
}
.site-head--campaign.is-mega-open .hbar{background:#fff;color:#111}
.site-head--campaign.is-mega-open .campaign-icon{filter:brightness(0)}
@media (min-width:921px) and (hover:hover) and (pointer:fine){
  .site-head--campaign .hbar:hover{background:#fff;color:#111}
  .site-head--campaign .hbar:hover .campaign-icon{filter:brightness(0)}
}

.mega-panel[hidden],.editorial-drawer [hidden]{display:none}
.site-head--campaign .mega-panel a,.drawer-collections a{position:relative;display:block;padding:0;color:#fff6ed;font-size:13px}
.mega-panel a::after{content:none}
.mega-panel img,.drawer-collections img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;filter:brightness(.74)}
.mega-panel a span,.drawer-collections a span{
  position:absolute;inset-inline:10px;bottom:10px;text-shadow:0 1px 5px #110507;
}
.site-head--campaign .mega-panel a{color:#111;font-size:clamp(14px,1.4vw,21px)}
.mega-panel img{filter:none}
.mega-panel a span{position:static;display:block;margin-top:8px;text-shadow:none}
.mega-panel small,.drawer-collections small{display:block;font-size:11px}
.site-head--campaign :focus-visible,.editorial-drawer :focus-visible{outline:2px solid currentColor;outline-offset:3px}
dialog.sheet.editorial-drawer{
  position:fixed;inset:0;margin:0;width:100%;max-width:none;height:100dvh;max-height:none;
  padding:24px;color:#fff6ed;background:transparent;border-radius:0;overflow:auto;
}
.editorial-drawer::backdrop{background:#39121eba;backdrop-filter:blur(9px)}
.editorial-drawer .drawer-controls{display:flex;align-items:center;justify-content:flex-end;gap:16px}
.editorial-drawer .drawer-controls button{min-height:44px;font-size:17px}
.drawer-main{display:grid;justify-items:start;gap:24px;margin-top:clamp(44px,12vh,120px)}
.drawer-main :is(a,button){padding:0;font-size:clamp(27px,7vw,42px);font-weight:500}
.drawer-collections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:24px}
@media(prefers-reduced-motion:no-preference){
  .mega-panel:not([hidden]),.editorial-drawer[open],.editorial-drawer [data-menu-view]:not([hidden]){
    animation:editorial-menu-in .28s ease both;
  }
  @keyframes editorial-menu-in{from{opacity:0;transform:translateY(-9px)}to{opacity:1;transform:none}}
}
@media (max-width:920px){
  .site-head--campaign .hbar{padding-inline:14px;gap:0 5px}
  .site-head--campaign .mainnav{display:none}
  .site-head--campaign .hbar{padding-block:6px}
  .site-head--campaign .logo{grid-row:1;justify-self:center}
  .site-head--campaign .h-start{grid-column:1;grid-row:1;position:relative;z-index:2;justify-self:start}
  .site-head--campaign .h-icons{grid-column:3;grid-row:1;gap:0;position:relative;z-index:2;justify-self:end}
  .campaign-wordmark{font-size:clamp(34px,10.6vw,52px)}
}
.menu-d{position:fixed; inset-block:0; right:0; left:auto; margin:0; width:min(360px,88vw); max-width:88vw; height:100dvh; max-height:100dvh; border-radius:24px 0 0 24px; display:flex; flex-direction:column}
.menu-d:not([open]){display:none}
.md-head{display:flex; align-items:center; padding:16px 20px; border-bottom:1px solid rgba(17,17,17,.08)}
.md-head img{height:44px; width:auto}
.md-list{list-style:none; margin:0; padding:6px 20px; overflow-y:auto; overscroll-behavior:contain; flex:1}
.md-list a{display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid rgba(17,17,17,.06); font:500 21px/1.2 var(--f-serif); color:var(--ink)}
.md-list a[aria-current="page"]{color:var(--wine)}
.md-list img{width:54px; height:54px; border-radius:14px; object-fit:cover; flex:none}
.md-list .md-lavermo{object-fit:contain;background:#952053;padding:7px}
.md-list .tx small{display:block; margin-top:5px; font:500 10px/1 var(--f-latin-script); letter-spacing:.28em; text-transform:uppercase; color:var(--grey-2); direction:ltr; text-align:right}
.md-list .plain{padding-inline-start:68px}
.md-foot{padding:16px 20px 22px; display:grid; gap:10px; border-top:1px solid rgba(17,17,17,.08)}
@media (max-width:760px){
  .announce{font-size:12px; padding-block:7px}
  .h-loc,.h-icons .hide-m,.h-icons .sep{display:none}
  .menu-btn{display:grid}
  .hbar{padding-block:6px}
  .site-head .logo img{height:38px}
  .site-head.scrolled .logo img:not(.campaign-icon){height:32px}
  .mainnav{display:none}
}
.crumbs{display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:13.5px; color:var(--grey-2); margin:0 0 14px; padding:0}
.crumbs a:hover{color:var(--wine)}
.crumbs [aria-current]{color:var(--ink)}
.cat-hero{
  position:relative; display:flex; align-items:center; isolation:isolate; overflow:hidden;
  min-height:clamp(265px,40vw,590px); background:#260e13; color:#fff3ed;
  padding:clamp(26px,5vw,72px); container-type:inline-size;
}
.cat-hero .cover{
  position:absolute; z-index:-2; inset:0; width:100%; height:100%; object-fit:cover;
  object-position:left center;
}
.cat-hero .lab{
  position:relative; align-items:flex-start; text-align:start; max-width:57%;
  margin:0; --fs:clamp(47px,8.5cqi,107px);
}
.cat-hero .lab .ar{white-space:normal; text-wrap:balance}
.cat-hero.satin{padding-block:clamp(22px,3vw,44px)}
.cat-hero.satin::before{content:none}
.cat-hero.satin .cover{object-position:left 22%}
.cat-hero.satin .lab{
  max-width:80%; gap:0; --fs:clamp(84px,16cqi,185px);
  margin-inline-start:23%; transform:translateY(-10%); color:#f4d9d0;
}
.cat-hero.satin .lab .ar{white-space:nowrap; line-height:.73}
.cat-hero.satin .satin-foreground{z-index:2; pointer-events:none}
@media (max-width:620px){
  .cat-hero.satin .cover{object-position:left center}
  .cat-hero.satin .lab{--fs:clamp(51px,17.5cqi,82px); margin-inline-start:4%; transform:translateY(-23%)}
}
.cat-hero.robes{padding-block:clamp(24px,3vw,44px)}
.cat-hero.robes .cover{object-position:left 22%}
.cat-hero.robes .lab{
  align-items:flex-start; gap:0; margin-inline-start:3%; max-width:55%;
  --fs:clamp(65px,12.8cqi,143px);
}
.cat-hero.robes .lab .ar{white-space:nowrap}
@media (max-width:620px){
  .cat-hero.robes .lab{--fs:clamp(44px,14cqi,69px); margin-inline-start:0}
}
.cat-hero:is(.cotton,.sets) .lab{margin-inline-start:7%; --fs:clamp(64px,12cqi,144px)}
.cat-hero.cotton .lab{margin-inline-start:2%; --fs:clamp(42px,8.4cqi,112px); max-width:65%}
.cat-hero.sets .lab .ar + .ar{font-size:calc(var(--fs) * 1.23)}
.cat-hero.lingerie .lab{margin-inline-start:5%; --fs:clamp(56px,12cqi,144px)}
.cat-hero.sets .lab .ar{line-height:.83; white-space:nowrap}
.lavermo-hero{min-height:clamp(255px,35vw,500px); border-radius:24px}
.lavermo-hero .lavermo-mark{width:clamp(210px,36vw,435px)}
.lavermo-details{text-align:center; padding-block:clamp(21px,4vw,44px)}
.lavermo-details h1{font:600 clamp(30px,4.8vw,57px)/1.2 var(--f-sans); color:#7c204e; margin:0}
.lavermo-details p{max-width:43ch;margin:13px auto 0;color:var(--ink);font:400 17px/1.55 var(--f-sans)}
.lavermo-details .pill{font-size:16px; margin-top:16px; background:#7c204e; color:#fff; padding-block:11px}
.lavermo-details .pill:hover{background:#64173e}
@media (max-width:620px){
  .cat-hero:is(.sets,.lingerie) .lab{margin-inline-start:0; --fs:clamp(36px,15cqi,68px)}
  .cat-hero.cotton .lab{margin-inline-start:0; --fs:clamp(29px,11cqi,56px)}
}
.toolbar{display:flex; justify-content:space-between; align-items:center; gap:14px 24px; flex-wrap:wrap; margin:clamp(26px,3vw,40px) 0 clamp(26px,3vw,40px)}
.toolbar .count{margin:0; font-size:14.5px; color:var(--grey-2); line-height:1.7}
.toolbar .count b{color:var(--ink); font-weight:600}
.search{position:relative; width:min(340px,100%)}
.search input{width:100%; height:48px; border:1px solid rgba(17,17,17,.14); border-radius:12px; background:#fff; padding:0 44px 0 14px; font:400 15px var(--f-sans); color:var(--ink)}
.search input:focus{outline:none; border-color:var(--wine)}
.search svg{position:absolute; top:50%; right:14px; transform:translateY(-50%); width:19px; height:19px; fill:none; stroke:var(--grey-2); stroke-width:1.7; stroke-linecap:round; pointer-events:none}
.empty{text-align:center; color:var(--grey-2); font-size:15px; padding:40px 0}
.others{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:clamp(12px,1.6vw,22px)}
.other{display:block; text-align:center}
.other .ph{display:block; aspect-ratio:4/5; overflow:hidden; background:#2a1418}
.other .ph img{width:100%; height:100%; object-fit:cover; transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.other:hover .ph img{transform:scale(1.04)}
.other .nm{display:block; font-family:var(--f-script); font-weight:400; font-size:clamp(24px,2.2vw,32px); line-height:1.15; margin-top:12px; transition:color .15s}
.other:hover .nm{color:var(--wine)}
.other .en{display:block; font-family:var(--f-latin-script); font-weight:500; text-transform:uppercase; letter-spacing:.3em; font-size:11px; color:var(--grey-2); direction:ltr; margin-top:6px}
@media (max-width:620px){
  .cat-hero .lab{--fs:clamp(33px,11cqi,62px)}
}
@media (max-width:760px){ .others{grid-template-columns:repeat(2,minmax(0,1fr))} .toolbar{flex-direction:column; align-items:stretch} .search{width:100%} }

.catalog-intro{padding-block:clamp(28px,4vw,58px) 0}
.catalog-intro p{margin:0;font-size:clamp(17px,2vw,23px);color:var(--ink-2);max-width:50ch}
.catalog-controls{display:grid;grid-template-columns:minmax(180px,2fr) minmax(115px,1fr) minmax(140px,1fr);gap:12px}
.catalog-controls .search{width:auto}
#catalogSort{grid-column:-2/-1}
.catalog-controls select,.catalog-controls input{
  width:100%;min-height:48px;border:1px solid #d9bec7;border-radius:0;background:#fff;
  color:var(--ink);font:inherit;padding:0 12px
}
.catalog-controls input{padding-inline-start:42px}
.catalog-controls :focus-visible,.product-view :focus-visible,.related-product:focus-visible{outline:2px solid var(--wine);outline-offset:3px}
.catalog-controls .search input:focus-visible{outline:2px solid var(--wine);outline-offset:3px}
#catalog .toolbar{display:block}
#catalog .grid{gap:clamp(27px,4vw,56px) clamp(10px,2vw,28px)}
#catalog .pc{text-align:start}
#catalog .pc h3{min-height:0;margin:12px 0 4px;font-weight:600}
#catalog .pc h3 a:hover,.related-product:hover{color:var(--wine);text-decoration:underline;text-underline-offset:4px}
.pc .pc-meta{margin:0 0 11px;color:var(--grey-2);font-size:12px}
.pc .act{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.pc .act .step{border-radius:100px}
.pc .act .step{width:fit-content;min-width:128px}
.quick-shop{
  border-radius:100px;  min-height:44px;padding-block:6px;border:1px solid #ddcbd0;background:#fff;
  color:var(--wine);font:500 13px var(--f-sans);cursor:pointer;transition:background-color .2s
}
.quick-shop:hover{background:#faf0f4}
.product-view{
  display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);direction:ltr;
  gap:clamp(22px,5vw,76px);align-items:start;margin-block:12px clamp(45px,8vw,100px)
}
.product-view > *{direction:rtl}
.product-stage{margin:0;position:relative;overflow:hidden;background:#f8f3f5;aspect-ratio:4/5;max-height:74svh}
.product-stage img{display:block;width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;transition:transform .35s}
.product-stage.is-zoomed img{transform:scale(1.65)}
.product-zoom{
  border-radius:100px;  position:absolute;inset:auto 12px 12px auto;min-height:44px;padding-block:7px;
  border:1px solid #d9bec7;background:var(--cream);color:var(--wine);font:inherit;cursor:pointer
}
.product-info{padding-block:clamp(10px,3vw,40px);display:grid;gap:16px}
.product-info > *{margin:0}
.product-info h1{font:600 clamp(32px,4.4vw,62px)/1.22 var(--f-sans);text-wrap:balance}
.product-kicker{color:var(--wine);font-weight:600}
.product-note{max-width:47ch;color:var(--ink-2);line-height:1.8}
.product-info .qty{justify-content:flex-start}
.product-info .product-add,.product-info .product-ask{min-height:46px}
.product-feedback{color:var(--wine);min-height:1.6em}
.product-related{padding-block-end:clamp(36px,7vw,90px)}
.related-product{display:grid;gap:8px;font-weight:600}
.related-product img{width:100%;aspect-ratio:4/5;object-fit:contain;background:#f8f3f5;mix-blend-mode:multiply}
@media (max-width:700px){
  .catalog-controls{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .catalog-controls .search{grid-column:1/-1}
  .product-view{grid-template-columns:minmax(0,1fr);gap:12px}
  .product-stage{aspect-ratio:1}
  .pc .act .add{padding-inline:20px;font-size:13px}
}
@media (prefers-reduced-motion:reduce)`);

// ── header/nav/footer: real links between pages ──
const ICO = {
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.6a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.4" r="2.5"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.6 8.6 0 0 1-12.7 7.5L3.5 20.3l1.3-4.1A8.6 8.6 0 1 1 20.5 11.6Z"/><path d="M9 8.6c.3 2.6 2 4.4 4.6 5.2l1.2-1.2 1.8.8-.4 1.6c-3.8.4-7.6-3.3-7.4-7.2l1.6-.4.8 1.8Z"/></svg>',
  tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.6a3.6 3.6 0 1 1-3.6-3.6"/><path d="M14 3c.5 2.7 2.4 4.5 5.2 4.8"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M10 17h10"/></svg>',
};
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Al+Rasheed+Street+Tripoli+Libya';
// Brand switch on top of the hero (home and category pages): PUREY shows everything,
// Lavermo shows only the house label. The choice is remembered across pages.
function brandTabs() {
  return `    <div class="brand-tabs" role="tablist" aria-label="العلامة">
      <button type="button" role="tab" class="brand-tab" data-brand="all" aria-selected="true"><span class="bt-purey" lang="en" dir="ltr" aria-hidden="true">PUREY</span><span class="bt-sr">كل منتجات بيوري</span></button>
      <button type="button" role="tab" class="brand-tab" data-brand="lavermo" aria-selected="false" tabindex="-1"><span class="bt-lavermo" aria-hidden="true"></span><span class="bt-sr">منتجات Lavermo فقط</span></button>
    </div>`;
}
function headerFor(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const campaign = active === 'home';
  const links = [['index.html', 'الرئيسية', 'home'],
    ...CATS.map((c) => [c.slug + '.html', c.ar, c.slug]),
    ['lavermo.html', 'Lavermo', 'lavermo'], ['#contact', 'تواصل معنا', 'contact']];
  const collectionTiles = `
      ${['lingerie','satin','cotton','robes','sets'].map(slug => CATS.find(c => c.slug === slug)).map((c) => `<a href="${c.slug}.html"><img src="img/home-edit-${c.slug}-480.webp" alt="" loading="lazy"><span>${c.ar}</span></a>`).join('')}
      <a href="lavermo.html"><img src="img/home-edit-lavermo-480.webp" alt="" loading="lazy"><span><bdi lang="en">Lavermo</bdi><small>إصدار محدود</small></span></a>
  `;
  const mega = campaign ? `<div class="mega-panel" id="collectionNav" hidden>${collectionTiles}</div>` : '';
  const drawer = [
    `<li><a class="plain" href="index.html"${cur('home')}>الرئيسية</a></li>`,
    ...CATS.map((c) => `<li><a href="${c.slug}.html"${cur(c.slug)}><img src="${campaign ? `img/home-edit-${c.slug}-480.webp` : `img/${COLLECTION_IMG[c.slug]}-480.webp`}" alt="" loading="lazy" style="object-position:center"><span class="tx">${c.ar}<small>${c.en} · ${count[c.k]}</small></span></a></li>`),
    `<li><a href="lavermo.html"${cur('lavermo')}><img ${campaign ? 'src="img/home-edit-lavermo-480.webp"' : 'class="md-lavermo" src="img/lavermo-lockup.webp"'} alt="" loading="lazy"><span class="tx"><bdi lang="en">Lavermo</bdi><small>إصدار محدود</small></span></a></li>`,
    `<li><a class="plain" href="#contact">تواصل معنا</a></li>`,
  ].join('\n        ');
  return `  <a class="announce" href="https://wa.me/218919282214" target="_blank" rel="noopener">جملة فقط للتجار وأصحاب المحلات · اطلب على واتساب <bdi dir="ltr">0919282214</bdi></a>
  <header class="site-head${active === 'home' ? ' site-head--campaign' : ''}" id="siteHead">
    <div class="hbar in">
      <div class="h-start">
        <button class="menu-btn" id="menuBtn" type="button" aria-label="القائمة" aria-controls="menuD" aria-expanded="false">${ICO.menu}</button>
        <a class="h-loc" href="${MAPS}" target="_blank" rel="noopener">${ICO.pin}طرابلس، شارع الرشيد</a>
      </div>
      <a class="logo" href="index.html">${campaign
        ? '<span class="campaign-wordmark" dir="ltr" lang="en"><img class="campaign-icon" src="img/logo-icon-white.png" width="293" height="179" alt="">PUREY</span>'
        : '<img src="img/logo-mark.png" alt="بيـوري Purey" width="293" height="240">'}</a>
      <nav class="mainnav" aria-label="القائمة">
  ${campaign ? `<a href="index.html" aria-current="page">الرئيسية</a>
        <button type="button" class="mega-trigger" id="collectionTrigger" aria-expanded="false" aria-controls="collectionNav">التشكيلات</button>
        ${mega}
        <a href="lavermo.html"><bdi lang="en">Lavermo</bdi></a>
        <a href="#contact">تواصل معنا</a>` : links.map(([href, label, key]) => `      <a href="${href}"${cur(key)}>${label}</a>`).join('\n')}
      </nav>
      <div class="h-icons">
        <a class="hide-m" href="https://www.tiktok.com/@purey116" target="_blank" rel="noopener" aria-label="تيك توك">${ICO.tt}</a>
        <a href="https://wa.me/218919282214" target="_blank" rel="noopener" aria-label="واتساب">${ICO.wa}</a>
        <span class="sep" aria-hidden="true"></span>
        <button class="bag-btn" id="bagBtn" type="button" aria-label="طلبك">${ICO.bag}<span class="badge" id="bagBadge"></span></button>
      </div>
    </div>${campaign ? '\n' + brandTabs() : ''}
  </header>
  ${campaign ? `<dialog class="sheet editorial-drawer" id="menuD" aria-label="القائمة">
    <div class="drawer-controls">
      <button type="button" data-menu-back hidden>رجوع</button>
      <button type="button" data-close>إغلاق</button>
    </div>
    <nav class="drawer-main" data-menu-view="main" aria-label="القائمة الرئيسية">
      <a href="index.html" aria-current="page">الرئيسية</a>
      <button type="button" data-menu-collections aria-expanded="false" aria-controls="drawerCollections">التشكيلات</button>
      <a href="lavermo.html"><bdi lang="en">Lavermo</bdi></a>
      <a href="#contact">تواصل معنا</a>
    </nav>
    <nav class="drawer-collections" id="drawerCollections" data-menu-view="collections" aria-label="التشكيلات" hidden>${collectionTiles}</nav>
  </dialog>` : `<dialog class="sheet menu-d" id="menuD" aria-label="القائمة">
    <button class="x" type="button" data-close aria-label="إغلاق">✕</button>
    <div class="md-head"><img src="img/logo-mark.png" alt="بيـوري Purey"></div>
    <ul class="md-list">
        ${drawer}
    </ul>
    <div class="md-foot">
      <a class="btn solid" href="https://wa.me/218919282214" target="_blank" rel="noopener">${ICO.wa} اطلب على واتساب</a>
      <a class="btn line" href="https://www.tiktok.com/@purey116" target="_blank" rel="noopener">تيك توك <bdi dir="ltr">@purey116</bdi></a>
    </div>
  </dialog>`}
`;
}
function navFor(active) {
  const items = [['index.html', 'الرئيسية', 'home'], ...CATS.map((c) => [c.slug + '.html', c.ar, c.slug]), ['lavermo.html', 'Lavermo', 'lavermo'], ['#contact', 'تواصل معنا', 'contact']];
  return `    <nav aria-label="القائمة">\n${items.map(([href, label, key]) => `      <a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}\n    </nav>`;
}
header = rep(header, '<a class="logo" href="#top">', '<a class="logo" href="index.html">');
header = header.replace(/    <nav aria-label="الأقسام">[\s\S]*?<\/nav>/, '%%NAV%%');
footer = rep(footer, '<!-- FOOTER COLLECTION LINKS -->',
  [...CATS.map(({slug,ar}) => `<a href="${slug}.html">${ar}</a>`), '<a href="lavermo.html">Lavermo</a>'].join('\n        '));

// home: tiles → pages, "all collections" → the tiles
for (const c of CATS) homeTop = rep(homeTop, `href="#c-${c.slug}"`, `href="${c.slug}.html"`);
homeTop = rep(homeTop, '<a class="pill" href="https://wa.me/218919282214" target="_blank" rel="noopener">كل التشكيلات</a>', '<a class="pill" href="#cats">كل الأقسام</a>');

// ── script: page-agnostic catalogue (grid only on category pages) ──
script = rep(script, '// ── Catalogue + order basket', `// ── Header: condense on scroll, phone menu ──────────────────────────
(function(){
  const head = document.getElementById('siteHead'); if (!head) return;
  const on = () => head.classList.toggle('scrolled', !head.classList.contains('site-head--campaign') && scrollY > 60);
  addEventListener('scroll', on, {passive: true}); on();
  const m = document.getElementById('menuD'), b = document.getElementById('menuBtn');
  if (m && b) {
    b.addEventListener('click', () => {
      m.showModal();
      b.setAttribute('aria-expanded', 'true');
      head.classList.add('is-drawer-open');
    });
    m.addEventListener('close', () => {
      b.setAttribute('aria-expanded', 'false');
      head.classList.remove('is-drawer-open');
    });
    m.addEventListener('click', e => { if (e.target.closest('a')) m.close(); });
  }
  const trigger = document.getElementById('collectionTrigger');
  if (!trigger) return;
  const panel = document.getElementById('collectionNav');
  const bar = trigger.closest('.hbar');
  const desktop = matchMedia('(min-width:921px)');
  const setOpen = open => {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    head.classList.toggle('is-mega-open', open);
  };
  trigger.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('pointerdown', e => {
    if (!trigger.contains(e.target) && !panel.contains(e.target)) setOpen(false);
  });
  const openCollections = m.querySelector('[data-menu-collections]');
  const back = m.querySelector('[data-menu-back]');
  const mainView = m.querySelector('[data-menu-view="main"]');
  const collectionView = m.querySelector('[data-menu-view="collections"]');
  const showCollections = open => {
    mainView.hidden = open;
    collectionView.hidden = !open;
    back.hidden = !open;
    openCollections.setAttribute('aria-expanded', String(open));
  };
  openCollections.addEventListener('click', () => { showCollections(true); back.focus(); });
  back.addEventListener('click', () => { showCollections(false); openCollections.focus(); });
  m.addEventListener('close', () => showCollections(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      if (bar.contains(document.activeElement)) trigger.focus();
    }
  });
  desktop.addEventListener('change', () => setOpen(false));

  if (matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('campaign-copy-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: 0.25});
    document.querySelectorAll('.campaign:not(:first-child) .campaign-copy').forEach(copy => observer.observe(copy));
  }
})();
// ── Catalogue + order basket`);
script = script.replace(/\/\/ Product carousels\.[\s\S]*?\n\}\);\n(?=\/\/ ── Catalogue)/, '');
script = rep(script, "  const tabs = [...document.querySelectorAll('.tabs [data-cat]')];\n", '');
script = rep(script, "    const el = grid.querySelector(", "    if (!grid) return;\n    const el = grid.querySelector(");
{
  const a = script.indexOf('  // catalogue\n'), b = script.indexOf('  // basket state');
  if (a < 0 || b < 0) throw new Error('catalogue block');
  script = script.slice(0, a) + `  // category page: one category's products, searchable, 24 at a time
  const PAGE = grid ? grid.dataset.cat : null, PER = 24;
  // brand: 'all' (PUREY) or 'lavermo'; ?brand= wins, then the remembered choice
  let BRAND = (() => {
    const u = new URLSearchParams(location.search).get('brand');
    if (u) return u === 'lavermo' ? 'lavermo' : 'all';
    try { return localStorage.getItem('purey.brand') === 'lavermo' ? 'lavermo' : 'all'; } catch { return 'all'; }
  })();
  const inCollection = p => PAGE === 'lavermo' ? p.brand === 'lavermo' : p.c === PAGE && (BRAND !== 'lavermo' || p.brand === 'lavermo');
  const norm = s => String(s).toLowerCase().replace(/[\\u064B-\\u0652\\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  let items = [], shown = 0;
  function status(){ shownEl.textContent = items.length ? 'عرض ' + shown + ' من ' + items.length : ''; more.hidden = shown >= items.length; $('empty').hidden = !!items.length; }
  function addMore(){ const next = items.slice(shown, shown + PER); grid.insertAdjacentHTML('beforeend', next.map(card).join('')); shown += next.length; status(); }
  function filter(){
    const color = $('catalogColor').value, sort = $('catalogSort').value;
    const words = norm($('q').value).split(/\\s+/).filter(Boolean);
    items = DATA.filter(p => inCollection(p) && norm(p.n).includes(color) && words.every(w => norm(p.n + ' ' + p.id).includes(w)));
    if (sort === 'name') items.sort((a, b) => a.n.localeCompare(b.n, 'ar'));
    if (sort === 'code') items.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric:true}));
    shown = 0; grid.innerHTML = ''; addMore();
  }
  if (grid) {
    more.addEventListener('click', addMore);
    const q = $('q'), color = $('catalogColor'), sort = $('catalogSort');
    const catalog = DATA.filter(p => PAGE === 'lavermo' ? p.brand === 'lavermo' : p.c === PAGE);
    for (const label of ['أسود','أبيض','عاجي','وردي','أحمر','أزرق','أخضر','رمادي','بني','بيج','كحلي','بنفسجي']) {
      if (catalog.some(p => norm(p.n).includes(norm(label)))) color.add(new Option(label, norm(label)));
    }
    if (color.options.length === 1) color.hidden = true;
    q.addEventListener('input', filter);
    color.addEventListener('change', filter);
    sort.addEventListener('change', filter);
    grid.addEventListener('click', e => {
      const pc = e.target.closest('.pc'); if (!pc) return;
      const id = pc.dataset.id;
      if (e.target.closest('.quick-shop')) return openQV(id);
      if (e.target.closest('.add')) return setQty(id, DEFAULT_QTY, true);
      const d = e.target.closest('[data-d]'); if (d) setQty(id, (bag[id] || 0) + Number(d.dataset.d));
    });
  }

` + script.slice(b);
}
script = rep(script, `  const start = SLUG[(location.hash || '').slice(3)];
  select(start || 'c', false);
  if (start) addEventListener('load', () => { $('catalog').scrollIntoView(); select(start, false); });
  renderBag();`, `  // ── brand tabs: PUREY (everything) | Lavermo (house label only) ──
  {
    const tabs = [...document.querySelectorAll('.brand-tab')];
    const best = document.querySelector('.best');
    // each tab has its own hand-picked bestsellers; the two lists never share a product
    const BEST = ${JSON.stringify(BEST)};
    const bestOrig = best ? [...best.children] : [];
    const bestSets = {};
    const lavCount = k => DATA.filter(p => p.c === k && p.brand === 'lavermo').length;
    const keep = new Map();
    const remember = (el, prop) => { if (el && !keep.has(el)) keep.set(el, el[prop]); return el; };
    function bestFor(b) {
      if (!best) return;
      bestSets[b] = bestSets[b] || BEST[b].map(id => {
        const orig = bestOrig.find(a => a.dataset.id === id); if (orig) return orig;
        const p = DATA.find(p => p.id === id), a = document.createElement('article');
        a.dataset.id = id; a.tabIndex = 0; a.setAttribute('role', 'button');
        a.innerHTML = '<div class="cut"><img src="' + p.i + '" alt="' + esc(p.n) + '" loading="lazy" decoding="async"></div><h3>' + esc(p.n) + '</h3><p class="meta">' + CAT[p.c] + '</p>';
        a.addEventListener('click', () => openQV(id));
        a.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQV(id); } });
        return a;
      });
      best.replaceChildren(...bestSets[b]);
    }
    function applyBrand() {
      const lav = BRAND === 'lavermo';
      document.documentElement.dataset.brand = BRAND;
      tabs.forEach(t => { const on = t.dataset.brand === BRAND; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      bestFor(BRAND);
      for (const [slug, k] of Object.entries(SLUG)) {
        const n = remember(document.getElementById('lookbook-count-' + slug), 'textContent');
        if (n) n.textContent = lav ? lavCount(k) + ' موديل من Lavermo' : keep.get(n);
        const tile = remember(document.querySelector('.lookbook-' + slug), 'href');
        if (tile) tile.href = keep.get(tile) + (lav ? '?brand=lavermo' : '');
      }
      const sub = remember(document.querySelector('.gallery-sub'), 'textContent');
      if (sub) sub.textContent = lav ? DATA.filter(p => p.brand === 'lavermo').length + ' موديل من علامتنا الخاصة Lavermo، بإصدار محدود.' : keep.get(sub);
      const title = remember(document.querySelector('.campaign-title'), 'textContent');
      if (title) title.textContent = lav ? 'تشكيلة Lavermo الخاصة' : keep.get(title);
      const act = remember(document.querySelector('.campaign-action'), 'href');
      const actLabel = remember(document.querySelector('.campaign-action-label'), 'textContent');
      if (act) act.href = lav ? 'lavermo.html' : keep.get(act);
      if (actLabel) actLabel.textContent = lav ? 'تصفّح Lavermo' : keep.get(actLabel);
      if (grid) filter();
    }
    const pick = b => { BRAND = b; try { localStorage.setItem('purey.brand', b); } catch {} applyBrand(); };
    tabs.forEach(t => {
      t.addEventListener('click', () => pick(t.dataset.brand));
      t.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault(); const o = tabs.find(x => x !== t); o.focus(); pick(o.dataset.brand);
      });
    });
    if (tabs.length || BRAND === 'lavermo') applyBrand(); else if (grid) filter();
  }
  const product = document.querySelector('.product-view');
  if (product) {
    const id = product.dataset.product;
    const qty = $('productQty'), add = $('productAdd');
    qty.textContent = bag[id] || DEFAULT_QTY;
    if (bag[id]) add.textContent = 'حدّث الكمية في الطلب';
    const changeQty = step => { qty.textContent = Math.min(9999, Math.max(1, Number(qty.textContent) + step)); };
    $('productMinus').addEventListener('click', () => changeQty(-1));
    $('productPlus').addEventListener('click', () => changeQty(1));
    add.addEventListener('click', () => {
      setQty(id, Number(qty.textContent), false);
      add.textContent = 'حدّث الكمية في الطلب';
      $('productFeedback').textContent = 'الكمية في طلبك: ' + qty.textContent + ' قطعة';
    });
    $('productZoom').addEventListener('click', e => {
      const zoomed = e.currentTarget.closest('.product-stage').classList.toggle('is-zoomed');
      e.currentTarget.setAttribute('aria-pressed', String(zoomed));
      e.currentTarget.textContent = zoomed ? 'تصغير الصورة' : 'تكبير الصورة';
    });
  }
  renderBag();`);
script = rep(script, "  const DATA = JSON.parse(document.getElementById('catalog-data').textContent);",
  "  const DATA = window.PUREY_CATALOG || JSON.parse(document.getElementById('catalog-data').textContent);");

const COLLECTION_INTROS = {
  cotton: 'بجامات قطنية بألوان ونقشات متنوعة، من القصّات البسيطة للموديلات المطرّزة.',
  satin: 'بجامات ستان بقصّات ناعمة ولمعة هادية، بدرجات سادة ونقشات مختلفة.',
  robes: 'أرواب وملابس عرائس بتفاصيل من الدانتيل والتطريز.',
  lingerie: 'تشكيلة لانجري بقصّات وتفاصيل مختلفة من الستان والدانتيل.',
  sets: 'أطقم داخلية متناسقة بألوان وقصّات متنوعة.',
};
const SEARCH_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>';
function lockup(c) {
  if (['satin','robes','sets'].includes(c.slug)) {
    const words = c.ar.split(' ').map((word) => `<span class="ar">${word}</span>`).join(' ');
    return `<h1 class="lab stack-title ${c.slug}-title">${words}</h1>`;
  }
  return `<h1 class="lab"><span class="ar">${c.ar}</span></h1>`;
}

const escapeHTML = value => String(value).replace(/[&<>"]/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[char]));
function page({ title, desc, active, main, full, product = false }) {
  const styles = product ? '<link rel="stylesheet" href="product-pages.css">' : style;
  const behavior = product ? '<script src="product-catalog.js"></script><script src="product-pages.js"></script>' : script;
  const body = `<div class="page" dir="rtl" lang="ar">\n\n${headerFor(active)}\n  <main id="top">\n\n${main}\n  </main>\n\n${footer}${shop}${chat}${behavior}<script defer src="purey-chat.js?v=${chatVersion}"></script>`;
  if (!full) return `<title>${title}</title>\n<meta name="description" content="${desc}">\n<link rel="icon" href="img/favicon.png">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="claude:viewport-fit-sides" content="cover">\n${fonts}\n${styles}\n\n${body}`;
  return `<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n<meta name="description" content="${desc}">\n<link rel="icon" href="img/favicon.png">\n${fonts}\n${styles}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
}

const askSection = `
    <section class="purey-ask" id="ask-purey" aria-labelledby="ask-purey-title">
      <div class="purey-ask-inner">
        <h2 id="ask-purey-title">اسألوا بيوري</h2>
        <p>من أول تشكيلة لطلب محلكم الجاي، نعاونوا في اختيار الموديلات والمقاسات ونورّوكم الصور.</p>
        <div class="purey-inline-chat" id="pureyInlineChat" hidden>
          <div class="ai-thread" id="pureyInlineThread" role="log" aria-live="polite" aria-relevant="additions" aria-label="المحادثة مع مساعد بيوري">
            <div class="bub bot">أهلاً بيك 🌸 شن تبي تعرف؟ الأقسام، الألوان، أو كيف تطلب بالجملة؟</div>
          </div>
        </div>
        <div class="purey-ask-prompts">
          <button type="button" data-ask-purey="شن يميّز Lavermo؟">شن يميّز Lavermo؟</button>
          <button type="button" data-ask-purey="قداش قطعة في الدستا؟">قداش قطعة في الدستا؟</button>
          <button type="button" data-ask-purey="وريني اختيارات من الأكثر طلباً">ورّونا اختياراتكم</button>
        </div>
        <form class="purey-ask-form" id="pureyAskForm">
          <input id="pureyAskText" type="text" placeholder="شن يميّز Lavermo؟" aria-label="سؤالكم لمساعد بيوري" aria-controls="pureyInlineThread" required>
          <button type="submit" aria-label="إرسال السؤال"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></button>
        </form>
        <span class="purey-ask-note">مساعد بيوري · جملة للتجار وأصحاب المحلات</span>
      </div>
    </section>`;
// ── brand tabs (PUREY | Lavermo), full width on top of the hero ──
style = style.replace(/<\/style>$/, `
.brand-tabs{display:grid;grid-template-columns:1fr 1fr;width:100%;background:#fff;border-block:1px solid #e7e7e7}
.brand-tab{position:relative;display:grid;place-items:center;min-height:clamp(54px,5.2vw,72px);margin:0;padding:0 12px;
  border:0;background:#f2f2f2;color:#9a9a9a;cursor:pointer;font:inherit;transition:background-color .25s,color .25s;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation}
.brand-tab + .brand-tab{border-inline-start:1px solid #e7e7e7}
.brand-tab:hover{color:#444}
.brand-tab[aria-selected="true"]{background:#fff;color:var(--wine)}
.brand-tab::after{content:"";position:absolute;inset:auto 0 -1px;height:2px;background:currentColor;transform:scaleX(0);transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.brand-tab[aria-selected="true"]::after{transform:none}
.brand-tab:focus-visible{outline:2px solid currentColor;outline-offset:-6px}
.bt-purey{font:600 clamp(21px,2.2vw,31px)/1 var(--f-latin-script);letter-spacing:.16em;padding-inline-start:.16em}
.bt-lavermo{display:block;width:clamp(92px,8.6vw,128px);aspect-ratio:791/209;background:currentColor;
  -webkit-mask:url(img/lavermo-word.webp) center/contain no-repeat;mask:url(img/lavermo-word.webp) center/contain no-repeat}
.bt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
/* home: the bar sits on the photograph, under the campaign header */
.site-head--campaign .brand-tabs{position:relative;margin-top:clamp(6px,1vw,14px);background:rgba(18,4,8,.3);
  -webkit-backdrop-filter:blur(10px) saturate(1.1);backdrop-filter:blur(10px) saturate(1.1);border-color:rgba(255,255,255,.16)}
.site-head--campaign .brand-tab{background:transparent;color:rgba(255,255,255,.55)}
.site-head--campaign .brand-tab + .brand-tab{border-color:rgba(255,255,255,.16)}
.site-head--campaign .brand-tab:hover{color:rgba(255,255,255,.85)}
.site-head--campaign .brand-tab[aria-selected="true"]{background:#fff;color:var(--wine)}
@media (max-width:920px){
  .site-head--campaign .brand-tabs{margin-top:4px}
  .brand-tab{min-height:50px}
  .bt-purey{font-size:20px}
  .bt-lavermo{width:86px}
}
@media (prefers-reduced-motion:reduce){.brand-tab,.brand-tab::after{transition:none}}
</style>`);
fs.copyFileSync(path.join(path.dirname(SRC), 'purey-chat.js'),path.join(OUT,'purey-chat.js'));
// home (the artifact wraps it in a document itself)
fs.writeFileSync(path.join(OUT, 'index.html'), page({
  title: 'بيـوري Purey', desc: 'بيـوري — جملة بجامات قطني وستان، ارواب وعرائيسي، لانجري وطواقم داخلي. طرابلس، شارع الرشيد.',
  active: 'home', main: homeTop + about + askSection + dataScript + band, full: false,
}));

for (const c of CATS) {
  const others = CATS.filter((o) => o !== c).map((o) => `        <a class="other" href="${o.slug}.html"><span class="ph"><img src="img/${COLLECTION_IMG[o.slug]}-480.webp" alt="" loading="lazy" decoding="async"></span><span class="nm">${o.ar}</span><span class="en">${o.en} · ${count[o.k]}</span></a>`).join('\n');
  const main = `    <div class="in">
      <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a><span aria-hidden="true">‹</span><a href="index.html#cats">الأقسام</a><span aria-hidden="true">‹</span><span aria-current="page">${c.ar}</span></nav>
    </div>
${brandTabs()}
    <div class="cat-hero ${c.slug}">
        <img class="cover" src="img/collection-${c.slug}.webp?v=cover-sync" srcset="img/collection-${c.slug}-480.webp?v=cover-sync 480w, img/collection-${c.slug}-800.webp?v=cover-sync 800w, img/collection-${c.slug}.webp?v=cover-sync 1440w" sizes="(max-width:1440px) 100vw, 1440px" alt="" fetchpriority="high">
        ${lockup(c)}${c.slug === 'satin' ? `\n        <img class="cover ${c.slug}-foreground" src="img/collection-${c.slug}-foreground.webp" srcset="img/collection-${c.slug}-foreground-480.webp 480w, img/collection-${c.slug}-foreground-800.webp 800w, img/collection-${c.slug}-foreground.webp 1440w" sizes="(max-width:1440px) 100vw, 1440px" alt="" aria-hidden="true">` : ''}
    </div>
    <div class="in catalog-intro"><p>${COLLECTION_INTROS[c.slug]} متوفرة بالجملة لأصحاب المحلات.</p></div>
    <section class="in" id="catalog" aria-label="${c.ar}">
      <div class="toolbar">
        <div class="catalog-controls">
          <label class="search">${SEARCH_ICO}<input id="q" type="search" placeholder="ابحث بالاسم أو الرمز" aria-label="ابحث في ${c.ar}"></label>
          <select id="catalogColor" aria-label="اللون"><option value="">كل الألوان</option></select>
          <select id="catalogSort" aria-label="ترتيب المنتجات">
            <option value="">ترتيب المجموعة</option><option value="name">الاسم</option><option value="code">رمز القطعة</option>
          </select>
        </div>
      </div>
      <div class="grid" id="grid" data-cat="${c.k}"></div>
      <p class="empty" id="empty" hidden>ما لقيناش قطع بهالوصف — جرّب كلمة ثانية.</p>
      <div class="more-row">
        <span class="shown" id="shown" role="status"></span>
        <button class="pill" id="more" type="button">عرض المزيد</button>
      </div>
    </section>

    <section class="sec in" aria-labelledby="t-others">
      <h2 class="ttl" id="t-others">أقسام أخرى</h2>
      <div class="others">
${others}
      </div>
    </section>
${dataScript}
${band}`;
  fs.writeFileSync(path.join(OUT, c.slug + '.html'), page({
    title: `${c.ar} — بيـوري Purey`, desc: `${c.ar} بالجملة من بيـوري، طرابلس — ${count[c.k]} قطعة. اطلب على واتساب.`,
    active: c.slug, main, full: true,
  }));
}
fs.writeFileSync(path.join(OUT, 'lavermo.html'), page({
  title: 'Lavermo — إصدار محدود | Purey',
  desc: 'تشكيلة Lavermo بإصدار محدود من بيـوري.',
  active: 'lavermo',
  main: `    <div class="in">
      <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a><span aria-hidden="true">‹</span><a href="index.html#cats">الأقسام</a><span aria-hidden="true">‹</span><span aria-current="page" lang="en">Lavermo</span></nav>
      <div class="lavermo-surface lavermo-hero">
        <img class="lavermo-mark" src="img/lavermo-lockup.webp" alt="Lavermo" lang="en" width="836" height="640" fetchpriority="high">
        <span class="lavermo-limited">إصدار محدود</span>
      </div>
      <section class="lavermo-details" aria-labelledby="lavermo-title">
        <h1 id="lavermo-title">تشكيلة <bdi lang="en">Lavermo</bdi> المحدودة</h1>
        <p>علامة بيوري الخاصة. تصاميم محدودة وحصرية لـ Lavermo، مصنّعة باهتمام بالتفاصيل من الأزرار لحد التغليف. كل موديل يجي بتغليفه الكامل.</p>
        <p>المقاسات من S إلى XXL. البيع بالدستا، 6 أو 12 قطعة حسب الموديل. اسألنا على التوفر وإمكانية طلب نص دستا لما تختار أكثر من موديل.</p>
        <a class="pill" href="#catalog">تصفّح التشكيلة</a>
      </section>
    </div>
    <section class="in" id="catalog" aria-label="تشكيلة Lavermo">
      <div class="toolbar"><div class="catalog-controls">
        <label class="search">${SEARCH_ICO}<input id="q" type="search" placeholder="ابحث بالاسم أو الرمز" aria-label="ابحث في Lavermo"></label>
        <select id="catalogColor" aria-label="اللون"><option value="">كل الألوان</option></select>
        <select id="catalogSort" aria-label="ترتيب المنتجات"><option value="">ترتيب المجموعة</option><option value="name">الاسم</option><option value="code">رمز القطعة</option></select>
      </div></div>
      <div class="grid" id="grid" data-cat="lavermo"></div>
      <p class="empty" id="empty" hidden>ما لقيناش قطع بهالوصف — جرّب كلمة ثانية.</p>
      <div class="more-row"><span class="shown" id="shown" role="status"></span><button class="pill" id="more" type="button">عرض المزيد</button></div>
    </section>
${dataScript}
${band}`,
  full: true,
}));
// Share assets across static product pages so navigating between items reuses the catalogue.
fs.writeFileSync(path.join(OUT, 'product-pages.css'), style.slice('<style>'.length, -'</style>'.length));
fs.writeFileSync(path.join(OUT, 'product-pages.js'), script.trim().slice('<script>'.length, -'</script>'.length));
fs.writeFileSync(path.join(OUT, 'product-catalog.js'), 'window.PUREY_CATALOG = ' + catalogJSON + ';\n');

for (const c of CATS) {
  const products = all.filter(p => p.c === c.k);
  products.forEach((p, index) => {
    const name = escapeHTML(p.n);
    const related = products.slice(index + 1).concat(products.slice(0, index)).slice(0, 4);
    const suggestions = related.map(item => `<a class="related-product" href="product-${item.id}.html"><img src="${item.img}" alt="" loading="lazy" decoding="async"><span>${escapeHTML(item.n)}</span></a>`).join('');
    const inquiry = encodeURIComponent('مرحباً، نبي نستفسر على ' + p.n + ' (' + p.id.toUpperCase() + ')');
    const main = `<div class="in">
      <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a><span aria-hidden="true">‹</span><a href="${c.slug}.html">${c.ar}</a><span aria-hidden="true">‹</span><span aria-current="page">${name}</span></nav>
      <section class="product-view" data-product="${p.id}" aria-labelledby="productTitle">
        <figure class="product-stage">
          <img src="${p.img}" alt="${name}" fetchpriority="high">
          <button class="product-zoom" id="productZoom" type="button" aria-pressed="false">تكبير الصورة</button>
        </figure>
        <div class="product-info">
          <a class="product-kicker" href="${c.slug}.html">${c.ar}</a>
          <h1 id="productTitle">${name}</h1>
          <p class="pc-meta">رمز القطعة <bdi>${p.id.toUpperCase()}</bdi></p>
          <p class="product-note">للبيع بالجملة. فريق بيوري يأكدلك السعر والمقاسات المتوفرة على واتساب.</p>
          <div class="qty"><span id="productQtyLabel">الكمية بالقطعة</span><div class="step" role="group" aria-labelledby="productQtyLabel">
            <button id="productMinus" type="button" aria-label="قلّل الكمية">−</button><output id="productQty" aria-labelledby="productQtyLabel">6</output><button id="productPlus" type="button" aria-label="زِد الكمية">+</button>
          </div></div>
          <button class="btn solid product-add" id="productAdd" type="button">أضف للطلب</button>
          <a class="btn line product-ask" href="https://wa.me/218919282214?text=${inquiry}" target="_blank" rel="noopener">استفسر على واتساب</a>
          <p class="product-feedback" id="productFeedback" role="status"></p>
        </div>
      </section>
      <section class="product-related" aria-labelledby="productRelated">
        <h2 class="ttl" id="productRelated">من نفس التشكيلة</h2>
        <div class="others">${suggestions}</div>
      </section>
    </div>`;
    fs.writeFileSync(path.join(OUT, 'product-' + p.id + '.html'), page({
      title: name + ' | بيـوري', desc: name + ' بالجملة من بيـوري، طرابلس.',
      active: c.slug, main, full: true, product: true,
    }));
  });
}
console.log('Built ' + all.length + ' product pages.');
console.log('ok', ['index', ...CATS.map((c) => c.slug), 'lavermo'].map((n) => n + ' ' + Math.round(fs.statSync(path.join(OUT, n + '.html')).size / 1024) + 'KB').join(', '));
