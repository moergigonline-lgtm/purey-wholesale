// Purey: home + one page per category, generated from one source (purey-src.html)
// so header, footer, basket, quick view and chat stay identical everywhere.
//   node build-pages.js <purey-src.html> <out-dir>
const fs = require('fs'), path = require('path');
const all = require('./catalog-data.js');
const [SRC, OUT] = process.argv.slice(2);
const src = fs.readFileSync(SRC, 'utf8');

function cut(a, b, from = 0) {
  const i = src.indexOf(a, from); if (i < 0) throw new Error('miss start: ' + a);
  const j = b == null ? src.length : src.indexOf(b, i + a.length); if (j < 0) throw new Error('miss end: ' + b);
  return src.slice(i, j);
}
function rep(s, a, b) { if (!s.includes(a)) throw new Error('miss: ' + a.slice(0, 70)); return s.split(a).join(b); }

const CATS = [
  { k: 'c', slug: 'cotton', ar: 'بجامات قطني', en: 'Cotton', cover: 'cover-cotton', pos: 'l', obj: '40% 62%' },
  { k: 's', slug: 'satin', ar: 'بجامات ستان', en: 'Satin', cover: 'cover-satin', pos: 'c', obj: '50% 50%' },
  { k: 'r', slug: 'robes', ar: 'ارواب وعرائيسي', en: 'Robes · Bridal', cover: 'cover-robes', pos: 'l', obj: '62% 50%' },
  { k: 'l', slug: 'lingerie', ar: 'لانجري', en: 'Lingerie', cover: 'cover-lingerie', pos: 'l', obj: '75% 40%' },
  { k: 'u', slug: 'sets', ar: 'طواقم داخلي', en: 'Sets', cover: 'cover-sets', pos: 'l', obj: '50% 40%', banner: 'banner-sets', bobj: '70% 50%' },
];
const count = {}; for (const p of all) count[p.c] = (count[p.c] || 0) + 1;

// ── pieces of the source ──
let style = cut('<style>', '</style>') + '</style>';
const fonts = cut('<link rel="stylesheet" href="https://fonts.googleapis.com', '\n');
let header = cut('  <!-- HEADER -->', '  <main id="top">');
let homeTop = cut('    <!-- HERO -->', '    <!-- CATALOGUE -->');
// product data always comes from catalog-data.js, never the copy embedded in the source page
const dataScript = '    <script type="application/json" id="catalog-data">' + JSON.stringify(all.map((p) => ({ id: p.id, c: p.c, n: p.n, i: p.img }))) + '</script>\n';
let about = cut('    <!-- ABOUT -->', '    <!-- BAND -->');
const band = cut('    <!-- BAND -->', '  </main>');
let footer = cut('  <!-- FOOTER -->', '<!-- SHOP:');
const shop = cut('<!-- SHOP:', '<!-- FLANN WEBSITE CHAT -->');
const chat = cut('<!-- FLANN WEBSITE CHAT -->', '<script>\n// Client strip');
let script = cut('<script>\n// Client strip', null);

// ── shared CSS additions: nav state, category page ──
style = rep(style, '@media (prefers-reduced-motion:reduce)', `/* ── navigation + category pages ────────────────────────────────────── */
nav a[aria-current="page"]{color:var(--wine)}
/* ── site header ─────────────────────────────────────────────────────── */
.page{overflow:clip}
.announce{display:block; background:var(--wine); color:#f6e9e8; text-align:center; font:400 13px/1.5 var(--f-sans); padding:9px var(--pad); transition:color .15s}
.announce:hover{color:#fff}
.announce bdi{font-weight:500}
.site-head{position:sticky; top:0; z-index:60; background:rgba(255,255,255,.95); -webkit-backdrop-filter:saturate(1.2) blur(10px); backdrop-filter:saturate(1.2) blur(10px); transition:box-shadow .3s}
.site-head.scrolled{box-shadow:0 12px 30px -20px rgba(60,12,20,.4)}
.hbar{display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:16px; padding-block:18px 14px; transition:padding .3s}
.site-head.scrolled .hbar{padding-block:9px 7px}
.h-start{justify-self:start; display:flex; align-items:center; gap:14px}
.h-loc{display:inline-flex; align-items:center; gap:8px; font:400 13.5px/1 var(--f-sans); color:var(--ink-2); transition:color .15s}
.h-loc:hover{color:var(--wine)}
.h-loc svg,.h-icons svg,.menu-btn svg{width:21px; height:21px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round}
.site-head .logo{justify-self:center}
.site-head .logo img{height:clamp(54px,5vw,72px); width:auto; display:block; transition:height .3s}
.site-head.scrolled .logo img{height:42px}
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
.menu-d{position:fixed; inset-block:0; right:0; left:auto; margin:0; width:min(360px,88vw); max-width:88vw; height:100dvh; max-height:100dvh; border-radius:24px 0 0 24px; display:flex; flex-direction:column}
.menu-d:not([open]){display:none}
.md-head{display:flex; align-items:center; padding:16px 20px; border-bottom:1px solid rgba(17,17,17,.08)}
.md-head img{height:44px; width:auto}
.md-list{list-style:none; margin:0; padding:6px 20px; overflow-y:auto; overscroll-behavior:contain; flex:1}
.md-list a{display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid rgba(17,17,17,.06); font:500 21px/1.2 var(--f-serif); color:var(--ink)}
.md-list a[aria-current="page"]{color:var(--wine)}
.md-list img{width:54px; height:54px; border-radius:14px; object-fit:cover; flex:none}
.md-list .tx small{display:block; margin-top:5px; font:500 10px/1 var(--f-latin-script); letter-spacing:.28em; text-transform:uppercase; color:var(--grey-2); direction:ltr; text-align:right}
.md-list .plain{padding-inline-start:68px}
.md-foot{padding:16px 20px 22px; display:grid; gap:10px; border-top:1px solid rgba(17,17,17,.08)}
@media (max-width:760px){
  .announce{font-size:12px; padding-block:7px}
  .h-loc,.h-icons .hide-m,.h-icons .sep{display:none}
  .menu-btn{display:grid}
  .hbar{padding-block:12px}
  .site-head .logo img{height:48px}
  .site-head.scrolled .logo img{height:38px}
  .mainnav{display:none}
}
.crumbs{display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:13.5px; color:var(--grey-2); margin:0 0 14px; padding:0}
.crumbs a:hover{color:var(--wine)}
.crumbs [aria-current]{color:var(--ink)}
.cat-hero{position:relative; border-radius:26px; overflow:hidden; height:clamp(230px,30vw,430px); background:#2a1418; color:#fff; container-type:inline-size}
.cat-hero .cover{position:absolute; inset:0; width:100%; height:100%; object-fit:cover}
.cat-hero .lab{margin:0; top:50%; transform:translateY(-50%); --fs:clamp(40px,7.4cqi,96px)}
.cat-hero .lab.c{transform:translate(-50%,-50%)}
.cat-hero .lab .en{font-size:clamp(11px,1.3cqi,14px)}
.cat-hero.sets .lab{--fs:clamp(34px,5.6cqi,70px)}
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
.other .ph{display:block; aspect-ratio:4/5; border-radius:20px; overflow:hidden; background:#2a1418}
.other .ph img{width:100%; height:100%; object-fit:cover; transition:transform .8s cubic-bezier(.2,.7,.2,1)}
.other:hover .ph img{transform:scale(1.04)}
.other .nm{display:block; font-family:var(--f-script); font-weight:400; font-size:clamp(24px,2.2vw,32px); line-height:1.15; margin-top:12px; transition:color .15s}
.other:hover .nm{color:var(--wine)}
.other .en{display:block; font-family:var(--f-latin-script); font-weight:500; text-transform:uppercase; letter-spacing:.3em; font-size:11px; color:var(--grey-2); direction:ltr; margin-top:6px}
@media (max-width:620px){ .cat-hero .lab{--fs:clamp(24px,7.4cqi,32px)} .cat-hero.sets .lab{--fs:clamp(22px,6.5cqi,30px)} .cat-hero.robes .cover{object-position:88% 50% !important} .cat-hero.sets .cover{object-position:0% 50% !important} }
@media (max-width:760px){ .others{grid-template-columns:repeat(2,minmax(0,1fr))} .toolbar{flex-direction:column; align-items:stretch} .search{width:100%} }

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
function headerFor(active) {
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  const links = [['index.html', 'الرئيسية', 'home'], ...CATS.map((c) => [c.slug + '.html', c.ar, c.slug]), ['#contact', 'تواصل معنا', 'contact']];
  const drawer = [
    `<li><a class="plain" href="index.html"${cur('home')}>الرئيسية</a></li>`,
    ...CATS.map((c) => `<li><a href="${c.slug}.html"${cur(c.slug)}><img src="img/${c.cover}.webp" alt="" loading="lazy" style="object-position:${c.obj}"><span class="tx">${c.ar}<small>${c.en} · ${count[c.k]}</small></span></a></li>`),
    `<li><a class="plain" href="#contact">تواصل معنا</a></li>`,
  ].join('\n        ');
  return `  <a class="announce" href="https://wa.me/218919282214" target="_blank" rel="noopener">جملة فقط للتجار وأصحاب المحلات · اطلب على واتساب <bdi dir="ltr">0919282214</bdi></a>
  <header class="site-head" id="siteHead">
    <div class="hbar in">
      <div class="h-start">
        <button class="menu-btn" id="menuBtn" type="button" aria-label="القائمة" aria-controls="menuD">${ICO.menu}</button>
        <a class="h-loc" href="${MAPS}" target="_blank" rel="noopener">${ICO.pin}طرابلس، شارع الرشيد</a>
      </div>
      <a class="logo" href="index.html"><img src="img/logo-mark.png" alt="بيـوري Purey" width="293" height="240"></a>
      <div class="h-icons">
        <a class="hide-m" href="https://www.tiktok.com/@purey116" target="_blank" rel="noopener" aria-label="تيك توك">${ICO.tt}</a>
        <a href="https://wa.me/218919282214" target="_blank" rel="noopener" aria-label="واتساب">${ICO.wa}</a>
        <span class="sep" aria-hidden="true"></span>
        <button class="bag-btn" id="bagBtn" type="button" aria-label="طلبك">${ICO.bag}<span class="badge" id="bagBadge"></span></button>
      </div>
    </div>
    <nav class="mainnav in" aria-label="القائمة">
${links.map(([href, label, key]) => `      <a href="${href}"${cur(key)}>${label}</a>`).join('\n')}
    </nav>
  </header>
  <dialog class="sheet menu-d" id="menuD" aria-label="القائمة">
    <button class="x" type="button" data-close aria-label="إغلاق">✕</button>
    <div class="md-head"><img src="img/logo-mark.png" alt="بيـوري Purey"></div>
    <ul class="md-list">
        ${drawer}
    </ul>
    <div class="md-foot">
      <a class="btn solid" href="https://wa.me/218919282214" target="_blank" rel="noopener">${ICO.wa} اطلب على واتساب</a>
      <a class="btn line" href="https://www.tiktok.com/@purey116" target="_blank" rel="noopener">تيك توك <bdi dir="ltr">@purey116</bdi></a>
    </div>
  </dialog>
`;
}
function navFor(active) {
  const items = [['index.html', 'الرئيسية', 'home'], ...CATS.map((c) => [c.slug + '.html', c.ar, c.slug]), ['#contact', 'تواصل معنا', 'contact']];
  return `    <nav aria-label="القائمة">\n${items.map(([href, label, key]) => `      <a href="${href}"${key === active ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}\n    </nav>`;
}
header = rep(header, '<a class="logo" href="#top">', '<a class="logo" href="index.html">');
header = header.replace(/    <nav aria-label="الأقسام">[\s\S]*?<\/nav>/, '%%NAV%%');
footer = rep(footer, `<li><a href="#c-cotton">بجامات قطني</a></li>
          <li><a href="#c-satin">بجامات ستان</a></li>
          <li><a href="#c-robes">ارواب وعرائيسي</a></li>
          <li><a href="#c-lingerie">لانجري</a></li>
          <li><a href="#c-sets">طواقم داخلي</a></li>`, CATS.map((c) => `<li><a href="${c.slug}.html">${c.ar}</a></li>`).join('\n          '));
footer = rep(footer, '<li><a href="#about">من نحن</a></li>', '<li><a href="index.html#about">من نحن</a></li>');

// home: tiles → pages, "all collections" → the tiles
for (const c of CATS) homeTop = rep(homeTop, `href="#c-${c.slug}"`, `href="${c.slug}.html"`);
homeTop = rep(homeTop, '<a class="pill" href="https://wa.me/218919282214" target="_blank" rel="noopener">كل التشكيلات</a>', '<a class="pill" href="#cats">كل الأقسام</a>');

// ── script: page-agnostic catalogue (grid only on category pages) ──
script = rep(script, '// ── Catalogue + order basket', `// ── Header: condense on scroll, phone menu ──────────────────────────
(function(){
  const head = document.getElementById('siteHead'); if (!head) return;
  const on = () => head.classList.toggle('scrolled', scrollY > 60);
  addEventListener('scroll', on, {passive: true}); on();
  const m = document.getElementById('menuD'), b = document.getElementById('menuBtn');
  if (m && b) {
    b.addEventListener('click', () => m.showModal());
    m.addEventListener('click', e => { if (e.target.closest('a')) m.close(); });
  }
})();
// ── Catalogue + order basket`);
script = rep(script, "  const strip=document.getElementById('clients');\n", "  const strip=document.getElementById('clients');\n  if(!strip) return;\n");
script = script.replace(/\/\/ Product carousels\.[\s\S]*?\n\}\);\n(?=\/\/ ── Catalogue)/, '');
script = rep(script, "  const tabs = [...document.querySelectorAll('.tabs [data-cat]')];\n", '');
script = rep(script, "    const el = grid.querySelector(", "    if (!grid) return;\n    const el = grid.querySelector(");
{
  const a = script.indexOf('  // catalogue\n'), b = script.indexOf('  // basket state');
  if (a < 0 || b < 0) throw new Error('catalogue block');
  script = script.slice(0, a) + `  // category page: one category's products, searchable, 24 at a time
  const PAGE = grid ? grid.dataset.cat : null, PER = 24;
  const norm = s => String(s).toLowerCase().replace(/[\\u064B-\\u0652\\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  let items = [], shown = 0;
  function status(){ shownEl.textContent = items.length ? 'عرض ' + shown + ' من ' + items.length : ''; more.hidden = shown >= items.length; $('empty').hidden = !!items.length; }
  function addMore(){ const next = items.slice(shown, shown + PER); grid.insertAdjacentHTML('beforeend', next.map(card).join('')); shown += next.length; status(); }
  function filter(q){
    const words = norm(q).split(/\\s+/).filter(Boolean);
    items = DATA.filter(p => p.c === PAGE && words.every(w => norm(p.n + ' ' + p.id).includes(w)));
    shown = 0; grid.innerHTML = ''; addMore();
  }
  if (grid) {
    more.addEventListener('click', addMore);
    const q = $('q'); if (q) q.addEventListener('input', () => filter(q.value));
    grid.addEventListener('click', e => {
      const pc = e.target.closest('.pc'); if (!pc) return;
      const id = pc.dataset.id;
      if (e.target.closest('.pc-hit')) return openQV(id);
      if (e.target.closest('.add')) return setQty(id, DEFAULT_QTY, true);
      const d = e.target.closest('[data-d]'); if (d) setQty(id, (bag[id] || 0) + Number(d.dataset.d));
    });
  }

` + script.slice(b);
}
script = rep(script, `  const start = SLUG[(location.hash || '').slice(3)];
  select(start || 'c', false);
  if (start) addEventListener('load', () => { $('catalog').scrollIntoView(); select(start, false); });
  renderBag();`, `  if (grid) filter('');
  renderBag();`);

const SEARCH_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>';
const lockup = (c, tag) => `<${tag} class="lab ${c.pos}"><span class="ar">${c.ar}</span><span class="rule" aria-hidden="true"></span><span class="en" lang="en">${c.en} · ${count[c.k]}</span></${tag}>`;

function page({ title, desc, active, main, full }) {
  const body = `<div class="page" dir="rtl" lang="ar">\n\n${headerFor(active)}\n  <main id="top">\n\n${main}\n  </main>\n\n${footer}${shop}${chat}${script}`;
  if (!full) return `<title>${title}</title>\n<meta name="description" content="${desc}">\n<link rel="icon" href="img/favicon.png">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="claude:viewport-fit-sides" content="cover">\n${fonts}\n${style}\n\n${body}`;
  return `<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n<meta name="description" content="${desc}">\n<link rel="icon" href="img/favicon.png">\n${fonts}\n${style}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
}

// home (the artifact wraps it in a document itself)
fs.writeFileSync(path.join(OUT, 'index.html'), page({
  title: 'بيـوري Purey', desc: 'بيـوري — جملة بجامات قطني وستان، ارواب وعرائيسي، لانجري وطواقم داخلي. طرابلس، شارع الرشيد.',
  active: 'home', main: homeTop + about + dataScript + band, full: false,
}));

for (const c of CATS) {
  const others = CATS.filter((o) => o !== c).map((o) => `        <a class="other" href="${o.slug}.html"><span class="ph"><img src="img/${o.cover}.webp" alt="" loading="lazy" decoding="async" style="object-position:${o.obj}"></span><span class="nm">${o.ar}</span><span class="en">${o.en} · ${count[o.k]}</span></a>`).join('\n');
  const main = `    <div class="in">
      <nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a><span aria-hidden="true">‹</span><a href="index.html#cats">الأقسام</a><span aria-hidden="true">‹</span><span aria-current="page">${c.ar}</span></nav>
      <div class="cat-hero ${c.slug}">
        <img class="cover" src="img/${c.banner || c.cover}.webp" alt="" decoding="async" style="object-position:${c.bobj || c.obj}">
        ${lockup(c, 'h1')}
      </div>
    </div>

    <section class="in" id="catalog" aria-label="${c.ar}">
      <div class="toolbar">
        <p class="count"><b>${count[c.k]}</b> قطعة · جملة فقط — أضف القطع والكميات وابعت الطلب كامل على واتساب</p>
        <label class="search">${SEARCH_ICO}<input id="q" type="search" placeholder="ابحث باللون أو النوع أو الرمز" aria-label="ابحث في ${c.ar}"></label>
      </div>
      <div class="grid" id="grid" data-cat="${c.k}"></div>
      <p class="empty" id="empty" hidden>ما لقيناش قطع بهالوصف — جرّب كلمة ثانية.</p>
      <div class="more-row">
        <span class="shown" id="shown"></span>
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
console.log('ok', ['index', ...CATS.map((c) => c.slug)].map((n) => n + ' ' + Math.round(fs.statSync(path.join(OUT, n + '.html')).size / 1024) + 'KB').join(', '));
