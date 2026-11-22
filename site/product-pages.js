
// Product carousels. Tracks run left-to-right (direction:ltr), so 'next' scrolls right.
document.querySelectorAll('.car').forEach(c=>{
  const t=c.querySelector('.track');
  const step=()=>{const card=t.querySelector('.pc'); return card ? card.getBoundingClientRect().width+20 : 300;};
  c.querySelector('.nx').addEventListener('click',()=>t.scrollBy({left:step(), behavior:'smooth'}));
  c.querySelector('.pv').addEventListener('click',()=>t.scrollBy({left:-step(), behavior:'smooth'}));
});
// ── Header: condense on scroll, phone menu ──────────────────────────
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
// ── Catalogue + order basket ───────────────────────────────────────
// Wholesale: no prices. The basket becomes one itemised WhatsApp message to the team.
(function(){
  const DATA = window.PUREY_CATALOG || JSON.parse(document.getElementById('catalog-data').textContent);
  const BY = Object.fromEntries(DATA.map(p => [p.id, p]));
  const CAT = {c:'بجامات قطني', s:'بجامات ستان', r:'ارواب وعرائيسي', l:'لانجري', u:'طواقم داخلي'};
  const SLUG = {cotton:'c', satin:'s', robes:'r', lingerie:'l', sets:'u'};
  const WA = 'https://wa.me/218919282214?text=';
  const STEP = 12, DEFAULT_QTY = 6;
  const $ = id => document.getElementById(id);
  const grid = $('grid'), more = $('more'), shownEl = $('shown');
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const BAGI = '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>';

  // basket: {id: qty}, kept in this browser only
  let bag = {};
  try { bag = JSON.parse(localStorage.getItem('purey.bag') || '{}') || {}; } catch { bag = {}; }
  for (const k of Object.keys(bag)) if (!BY[k] || !(bag[k] > 0)) delete bag[k];
  const save = () => { try { localStorage.setItem('purey.bag', JSON.stringify(bag)); } catch {} };
  const pieces = () => Object.values(bag).reduce((a, b) => a + b, 0);

  function act(p){
    const q = bag[p.id];
    return q ? '<div class="step"><button type="button" data-d="-1" aria-label="أقل">−</button><output>' + q + '<small>قطعة</small></output><button type="button" data-d="1" aria-label="أكثر">+</button></div>'
             : '<button class="add" type="button">' + BAGI + ' أضف للطلب</button>';
  }
  function card(p){
    const href = 'product-' + p.id + '.html', name = esc(p.n);
    return '<article class="pc" data-id="' + p.id + '"><a class="pc-hit" href="' + href + '" aria-label="عرض ' + name + '"><div class="photo">' +
      (bag[p.id] ? '<span class="tag">في طلبك</span>' : '') + '<img src="' + p.i + '" alt="" loading="lazy" decoding="async"></div></a>' +
      '<h3><a href="' + href + '">' + name + '</a></h3><p class="pc-meta">السعر عند الطلب · <bdi>' + p.id.toUpperCase() + '</bdi></p>' +
      '<div class="act"><div class="pc-order">' + act(p) + '</div><button class="quick-shop" type="button" aria-label="عرض سريع ' + name + '">عرض سريع</button></div></article>';
  }
  function refreshCard(id){
    if (!grid) return;
    const el = grid.querySelector('.pc[data-id="' + id + '"]'); if (!el) return;
    el.querySelector('.pc-order').innerHTML = act(BY[id]);
    const ph = el.querySelector('.photo'), tag = ph.querySelector('.tag');
    if (bag[id] && !tag) ph.insertAdjacentHTML('afterbegin', '<span class="tag">في طلبك</span>');
    if (!bag[id] && tag) tag.remove();
  }

  // category page: one category's products, searchable, 24 at a time
  const PAGE = grid ? grid.dataset.cat : null, PER = 24;
  // brand: 'all' (PUREY) or 'lavermo'; ?brand= wins, then the remembered choice
  let BRAND = (() => {
    const u = new URLSearchParams(location.search).get('brand');
    if (u) return u === 'lavermo' ? 'lavermo' : 'all';
    try { return localStorage.getItem('purey.brand') === 'lavermo' ? 'lavermo' : 'all'; } catch { return 'all'; }
  })();
  const inCollection = p => PAGE === 'lavermo' ? p.brand === 'lavermo' : p.c === PAGE && (BRAND !== 'lavermo' || p.brand === 'lavermo');
  const norm = s => String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  let items = [], shown = 0;
  function status(){ shownEl.textContent = items.length ? 'عرض ' + shown + ' من ' + items.length : ''; more.hidden = shown >= items.length; $('empty').hidden = !!items.length; }
  function addMore(){ const next = items.slice(shown, shown + PER); grid.insertAdjacentHTML('beforeend', next.map(card).join('')); shown += next.length; status(); }
  function filter(){
    const color = $('catalogColor').value, sort = $('catalogSort').value;
    const words = norm($('q').value).split(/\s+/).filter(Boolean);
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

  // basket state
  function setQty(id, q, announce){
    q = Math.max(0, Math.min(9999, q|0));
    if (q) bag[id] = q; else delete bag[id];
    save(); refreshCard(id); renderBag();
    if (announce) toast('أُضيفت ' + q + ' قطع للطلب');
  }
  const bagBadge = $('bagBadge'), bagFloat = $('bagFloat'), bagFloatTxt = $('bagFloatTxt');
  function renderBag(){
    const ids = Object.keys(bag), n = pieces();
    bagBadge.textContent = n ? (n > 99 ? '99+' : n) : '';
    bagFloat.hidden = !n; bagFloatTxt.textContent = 'طلبك · ' + n + ' قطعة';
    if (n) { bagFloat.classList.remove('bump'); void bagFloat.offsetWidth; bagFloat.classList.add('bump'); }
    $('bagSub').textContent = ids.length ? ids.length + ' صنف · ' + n + ' قطعة' : '';
    $('bagEmpty').hidden = !!ids.length; $('bagFoot').hidden = !ids.length;
    $('bagTotal').textContent = n + ' قطعة';
    $('bagList').innerHTML = ids.map(id => { const p = BY[id]; return '<li data-id="' + id + '"><img src="' + p.i + '" alt=""><div><p class="nm">' + esc(p.n) + '</p>' +
      '<div class="step"><button type="button" data-d="-1" aria-label="أقل">−</button><output>' + bag[id] + '</output><button type="button" data-d="1" aria-label="أكثر">+</button></div></div>' +
      '<button class="rm" type="button" aria-label="حذف ' + esc(p.n) + '">حذف</button></li>'; }).join('');
  }
  $('bagList').addEventListener('click', e => {
    const li = e.target.closest('li'); if (!li) return; const id = li.dataset.id;
    if (e.target.closest('.rm')) return setQty(id, 0);
    const d = e.target.closest('[data-d]'); if (d) setQty(id, (bag[id] || 0) + Number(d.dataset.d));
  });
  const bagDlg = $('bag');
  const openBag = () => { renderBag(); if (!bagDlg.open) bagDlg.showModal(); };
  $('bagBtn').addEventListener('click', openBag);
  bagFloat.addEventListener('click', openBag);
  // ── Order submission ──
  // The order goes to Purey's Flann account (POST /api/site-order), which stores
  // it, renders the order-sheet PDF and WhatsApps it to the owner/manager.
  // WhatsApp stays as a backup: if Flann can't be reached, the buyer is offered
  // the same basket as a ready-made WhatsApp message instead of losing it.
  const ORDER_ENDPOINT = 'https://getflann.com/api/site-order';
  const ORDER_SITE = 'purey';
  const form = $('bagFoot'), errEl = $('formErr'), sendBtn = $('send');
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  const store = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const read = k => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
  // Same basket, same ref: a retry after a dropped connection is still one order.
  let orderRef = read('purey.orderRef') || uuid(); store('purey.orderRef', orderRef);
  ['oName', 'oShop', 'oPhone', 'oCity'].forEach(id => { const el = $(id); el.value = read('purey.' + id); el.addEventListener('input', () => { store('purey.' + id, el.value); el.removeAttribute('aria-invalid'); errEl.hidden = true; }); });

  let receipt;
  const orderSnapshot = ref => ({
    ref, customer:{
      name:$('oName').value.trim(), shop:$('oShop').value.trim(), phone:$('oPhone').value.trim(),
      city:$('oCity').value.trim(), note:$('oNote').value.trim(),
    }, items:Object.entries(bag).map(([id, qty]) => ({...BY[id], qty})), total:pieces(),
  });
  async function printOrder(order){
    if (!order?.items.length) return;
    const popup = window.open('', '_blank');
    if (!popup) return toast('اسمح بفتح نافذة جديدة عشان تحفظ الطلب PDF.');
    popup.opener = null;
    const doc = popup.document;
    const details = [
      ['اسم العميل', order.customer.name], ['اسم المحل', order.customer.shop],
      ['رقم الهاتف', order.customer.phone], ['المدينة', order.customer.city],
    ].map(([label,value]) => '<div><dt>' + label + '</dt><dd dir="auto">' + esc(value || '—') + '</dd></div>').join('');
    const notes = order.customer.note ? '<p class="notes"><b>ملاحظات الطلب</b><br>' + esc(order.customer.note) + '</p>' : '';
    doc.open();
    doc.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>PUREY Order ' + esc(order.ref) + '</title>' +
      '<style>@page{size:A4;margin:16mm}body{font:16px/1.5 Arial,sans-serif;color:#39121e;margin:0}' +
      'header{display:flex;justify-content:space-between;gap:18px;align-items:center;border-bottom:3px solid #550f25;padding:0 0 15px;margin-bottom:18px}h1,p,h2,dl,dd{margin:0}h1{font-size:26px}h2{font-size:17px;margin:16px 0 8px}' +
      '.brand{font:bold 31px Georgia;letter-spacing:.12em}.ref{display:block;font-size:12px;overflow-wrap:anywhere}.details{display:grid;grid-template-columns:1fr 1fr;column-gap:20px;row-gap:8px;border:1px solid #e8d8dc;padding:12px 15px;break-inside:avoid}dt{color:#72535a;font-size:12px}dd{text-align:right;font-weight:600;overflow-wrap:anywhere}.notes{margin-top:10px;white-space:pre-wrap;overflow-wrap:anywhere}.totals{border-top:2px solid #550f25;margin-top:15px;padding-top:9px;font-weight:600;break-inside:avoid}' +
      'article{display:flex;align-items:center;gap:18px;border-bottom:1px solid #ddd;padding:10px 0;break-inside:avoid}' +
      'img{width:90px;height:100px;object-fit:contain}strong{display:block}button{margin:14px 0;padding:8px 14px}' +
      '@media print{button{display:none}}</style>' +
      '<header><div><h1>ملخّص طلب الجملة</h1><bdi class="ref">' + esc(order.ref) + '</bdi></div><bdi class="brand">PUREY</bdi></header>' +
      '<h2>بيانات العميل</h2><dl class="details">' + details + '</dl>' + notes +
      '<button type="button">حفظ PDF / طباعة</button><h2>المنتجات المطلوبة</h2>' +
      order.items.map(item => '<article><img alt="" src="' + esc(new URL(item.i, location.href).href) + '"><div><strong>' +
        esc(item.n) + '</strong><p>رمز <bdi>' + esc(item.id.toUpperCase()) + '</bdi> · ' + item.qty + ' قطعة</p></div></article>').join('') +
      '<p class="totals">المجموع: ' + order.total + ' قطعة · ' + order.items.length + ' صنف</p>');
    doc.close();
    const button = doc.querySelector('button');
    button.disabled = true;
    try {
      await Promise.all(Array.from(doc.images, image => image.decode()));
      button.disabled = false;
      button.addEventListener('click', () => popup.print());
      if (!popup.closed) popup.print();
    } catch {
      if (!popup.closed) button.textContent = 'ما قدرناش نحمّل كل الصور. سكّر النافذة وجرّب مرة ثانية.';
    }
  }
  $('orderPdf').addEventListener('click', () => printOrder(orderSnapshot(orderRef)));
  $('receiptPdf').addEventListener('click', () => printOrder(receipt));

  function waText(){
    const ids = Object.keys(bag);
    const lines = ids.map((id, i) => (i + 1) + ') ' + BY[id].n + ' — ' + bag[id] + ' قطعة (رمز ' + id.toUpperCase() + ')');
    const name = $('oName').value.trim(), phone = $('oPhone').value.trim(), city = $('oCity').value.trim(), note = $('oNote').value.trim();
    const shop = $('oShop').value.trim();
    const extra = [name && ('الاسم: ' + name), shop && ('اسم المحل: ' + shop), phone && ('الهاتف: ' + phone), city && ('المدينة: ' + city), note && ('ملاحظات: ' + note)].filter(Boolean);
    return ['مرحباً بيـوري، أبي أطلب جملة:', '', ...lines, '', 'المجموع: ' + pieces() + ' قطعة · ' + ids.length + ' صنف', ...extra].join(String.fromCharCode(10));
  }
  $('sendWa').addEventListener('click', () => { if (Object.keys(bag).length) window.open(WA + encodeURIComponent(waText()), '_blank', 'noopener'); });
  const orderWaText = (order, no) => ['مرحباً بيـوري، هذا طلب جملة' + (no ? ' رقم ' + no : '') + ':', '',
    ...order.items.map((it, i) => (i + 1) + ') ' + it.n + ' — ' + it.qty + ' قطعة (رمز ' + it.id.toUpperCase() + ')'), '',
    'المجموع: ' + order.total + ' قطعة · ' + order.items.length + ' صنف',
    ...[['الاسم', order.customer.name], ['اسم المحل', order.customer.shop], ['الهاتف', order.customer.phone], ['المدينة', order.customer.city], ['ملاحظات', order.customer.note]]
      .filter(([, v]) => v).map(([k, v]) => k + ': ' + v)].join(String.fromCharCode(10));

  // Public basket API, used by the shopping chat to add pieces, show the order and hand off to the form.
  window.PureyBag = {
    items: () => Object.entries(bag).map(([id, qty]) => ({...BY[id], qty})),
    pieces: () => pieces(),
    has: id => !!BY[String(id).toLowerCase()],
    add: (id, qty) => { id = String(id).toLowerCase(); if (!BY[id]) return false; setQty(id, (bag[id] || 0) + Math.max(1, qty|0), false); return true; },
    remove: id => { id = String(id).toLowerCase(); if (!bag[id]) return false; setQty(id, 0); return true; },
    clear: () => { Object.keys(bag).forEach(id => setQty(id, 0)); },
    open: () => openBag(),
    pdf: () => printOrder(orderSnapshot(orderRef)),
    waLink: () => WA + encodeURIComponent(waText()),
  };

  const toWestern = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const phoneOk = v => { const d = toWestern(v).replace(/\D/g, '').replace(/^00/, ''); return /^0?9[1-5]\d{7}$/.test(d) || /^2189[1-5]\d{7}$/.test(d) || (d.length >= 10 && d.length <= 15 && !d.startsWith('0')); };
  function fail(msg, field){ errEl.textContent = msg; errEl.hidden = false; if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); } }
  const ERR = {
    name: ['اكتب اسم العميل.', 'oName'], phone: ['اكتب رقم هاتف صحيح، مثلاً 0912345678.', 'oPhone'], city: ['اكتب المدينة.', 'oCity'],
    items: ['في صنف في طلبك مش متوفر الآن. احذفه وجرّب مرة ثانية.'], rate: ['وصلت طلبات كثيرة من نفس الجهاز. استنى شوية وجرّب، أو ابعت الطلب على واتساب.'],
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ids = Object.keys(bag); if (!ids.length || sendBtn.getAttribute('aria-busy') === 'true') return;
    errEl.hidden = true;
    const name = $('oName').value.trim(), phone = $('oPhone').value.trim(), city = $('oCity').value.trim();
    if (name.length < 2) return fail(ERR.name[0], $('oName'));
    if (!phoneOk(phone)) return fail(ERR.phone[0], $('oPhone'));
    if (city.length < 2) return fail(ERR.city[0], $('oCity'));
    const submitted = orderSnapshot(orderRef);
    sendBtn.setAttribute('aria-busy', 'true'); sendBtn.textContent = 'جاري الإرسال…';
    let data = null, status = 0;
    try {
      const ctrl = new AbortController(); const bail = setTimeout(() => ctrl.abort(), 25000);
      const res = await fetch(ORDER_ENDPOINT, { method: 'POST', headers: {'Content-Type': 'application/json'}, signal: ctrl.signal,
        body: JSON.stringify({ site: ORDER_SITE, ref: orderRef, website: $('oWebsite').value,
          customer: { name, phone: toWestern(phone), city, note: $('oNote').value.trim() },
          items: submitted.items.map(item => ({ code: item.id.toUpperCase(), qty: item.qty })) }) });
      clearTimeout(bail); status = res.status; data = await res.json().catch(() => null);
    } catch { /* offline / blocked — handled below */ }
    sendBtn.removeAttribute('aria-busy'); sendBtn.textContent = 'إرسال الطلب';
    if (data && data.ok && data.order_no) {
      receipt = {...submitted, ref:String(data.order_no)};
      $('doneNo').textContent = data.order_no;
      $('doneWa').href = WA + encodeURIComponent(orderWaText(receipt, data.order_no));
      bag = {}; save(); grid && grid.querySelectorAll('.pc').forEach(el => refreshCard(el.dataset.id)); renderBag();
      orderRef = uuid(); store('purey.orderRef', orderRef);
      form.hidden = true; $('bagList').hidden = true; $('bagEmpty').hidden = true; $('bagDone').hidden = false;
      return;
    }
    const k = data && data.error;
    if (k && ERR[k]) return fail(ERR[k][0], ERR[k][1] ? $(ERR[k][1]) : null);
    fail('ما قدرناش نرسل الطلب الآن. ابعته على واتساب بالزر تحت، وبيوصل لنفس الفريق.');
    $('sendWa').classList.add('solid'); $('sendWa').classList.remove('line');
  });
  bagDlg.addEventListener('close', () => {
    if (!$('bagDone').hidden) { $('bagDone').hidden = true; form.hidden = false; $('bagList').hidden = false; renderBag(); }
  });

  // quick view
  const qv = $('qv'); let qvId = null, qvQty = DEFAULT_QTY;
  function openQV(id){
    const p = BY[id]; if (!p) return; qvId = id; qvQty = bag[id] || DEFAULT_QTY;
    $('qvImg').src = p.i; $('qvImg').alt = p.n; $('qvName').textContent = p.n; $('qvCat').textContent = CAT[p.c];
    $('qvCode').textContent = 'رمز القطعة: ' + id.toUpperCase(); $('qvQty').textContent = qvQty;
    $('qvAdd').lastChild.textContent = bag[id] ? ' تحديث الكمية في الطلب' : ' أضف للطلب';
    $('qvAsk').href = WA + encodeURIComponent('مرحباً، عندي سؤال على: ' + p.n + ' (رمز ' + id.toUpperCase() + ')');
    if (!qv.open) qv.showModal();
  }
  $('qvMinus').addEventListener('click', () => { qvQty = Math.max(1, qvQty - 1); $('qvQty').textContent = qvQty; });
  $('qvPlus').addEventListener('click', () => { qvQty = Math.min(9999, qvQty + 1); $('qvQty').textContent = qvQty; });
  $('qvAdd').addEventListener('click', () => { setQty(qvId, qvQty, true); qv.close(); });
  document.querySelectorAll('.best article[data-id]').forEach(a => {
    a.addEventListener('click', () => openQV(a.dataset.id));
    a.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQV(a.dataset.id); } });
  });

  // dialogs close on ✕ and on backdrop click
  document.querySelectorAll('dialog.sheet').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });

  // toast
  let tt; const toastEl = $('toast');
  function toast(t){ $('toastTxt').textContent = t; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 3200); }
  $('toastGo').addEventListener('click', () => { toastEl.classList.remove('on'); openBag(); });

  // ── brand tabs: PUREY (everything) | Lavermo (house label only) ──
  {
    const tabs = [...document.querySelectorAll('.brand-tab')];
    const best = document.querySelector('.best');
    // each tab has its own hand-picked bestsellers; the two lists never share a product
    const BEST = {"all":["o07","u64","o12","s42","o11"],"lavermo":["o10","o13","l029","o09","s33"]};
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
    function loadLavermoLook() {
      document.querySelectorAll('.look-lavermo [data-srcset], .look-lavermo [data-src]').forEach(el => {
        if (el.dataset.srcset) { el.srcset = el.dataset.srcset; delete el.dataset.srcset; }
        if (el.dataset.src) { el.src = el.dataset.src; delete el.dataset.src; }
      });
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
      // Lavermo gets its own photographs: hero look and dark product stills on the collection cards
      if (lav) loadLavermoLook();
      for (const slug of [...Object.keys(SLUG), 'lavermo']) {
        const img = document.querySelector('.lookbook-' + slug + ' img');
        if (!img) continue;
        if (!img.dataset.pureySrc) { img.dataset.pureySrc = img.getAttribute('src'); img.dataset.pureySrcset = img.getAttribute('srcset') || ''; }
        img.srcset = lav ? 'img/lavermo-col-' + slug + '-480.webp 480w, img/lavermo-col-' + slug + '-800.webp 800w' : img.dataset.pureySrcset;
        img.src = lav ? 'img/lavermo-col-' + slug + '-800.webp' : img.dataset.pureySrc;
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
    // the Lavermo photograph downloads only when someone heads for its tab (hover, focus or touch)
    tabs.filter(t => t.dataset.brand === 'lavermo').forEach(t => ['pointerenter','focus','touchstart'].forEach(e => t.addEventListener(e, loadLavermoLook, { once: true, passive: true })));
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
  renderBag();
})();

