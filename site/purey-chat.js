(function(root){
  'use strict';
  const norm=s=>String(s||'').toLowerCase().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
  const PRICE='الأسعار يأكدها الفريق على الخاص. اختاروا الموديلات والكميات في الطلب، أو تواصلوا معانا على واتساب 0919282214.';
  const BRAND='Lavermo هي علامة بيوري الخاصة: موديلات محدودة وتصاميم خاصة بالبراند، مصنّعة باهتمام بأدق التفاصيل من الأزرار لحد التغليف الكامل. خيار مميز لتنويع تشكيلة محلكم.';
  const priceQuestion=q=>/سعر|اسعار|بكم|بقداش|قداش\s*(?:سوم|ثمن|حق)|ثمن|تكلف|سوم|بشحال|خصم|تخفيض|دينار|دولار|price|cost|how much|discount|lyd|usd|[$€£]/i.test(norm(q));
  const brandQuestion=q=>/lavermo|lavero|la\s*vera\s*mo|لافيرم|لافيرما|لافيرمو|لا\s*فيرمو|لافيروا/i.test(norm(q));
  const packQuestion=q=>/دستا|دسته|دستة|باك|pack|اقل كمي|ادني طلب|كم قطع|قداش قطع|كميه|نص دست|نصف دست/.test(norm(q));
  const productQuestion=q=>/صور|صوره|وريني|ورونا|شوف|بجام|بيجام|ستان|ساتان|قطن|لانجري|روب|ارواب|عرائس|عرائسي|عروس|عرايس|طقم|طواقم|موديل|كولكشن|تشكيل|بديل|لون|الوان|اسود|احمر|وردي|ابيض|عاجي|خمري|عنابي|نبيتي|نبيذي|كحلي|ازرق|بيج|رمادي|satin|cotton|lingerie|photo|robe|collection|product|recommend/i.test(norm(q));
  const bestQuestion=q=>/اكثر.*طلب|اكثر.*بيع|افضل|تنصح|ترشح|اقتراح|ماشي|يمشي|bestsell|best sell|recommend/.test(norm(q));
  const featured=['o07','o13','o09','o04','o11'];
  function category(q){
    q=norm(q);
    if(/قطن|cotton/.test(q))return 'c';
    if(/ستان|ساتان|satin/.test(q))return 's';
    if(/روب|ارواب|عرايس|عرائس|عرائسي|عروس|bridal|robe/.test(q))return 'r';
    if(/لانجري|lingerie/.test(q))return 'l';
    if(/داخلي|طقم|طواقم|underwear/.test(q))return 'u';
    return null;
  }
  function selectProducts(data,q,state){
    const exact=data.find(p=>new RegExp('(?:^|[^a-z0-9])'+p.id+'(?:$|[^a-z0-9])','i').test(q));
    const best=bestQuestion(q);
    const explicitCat=category(q)||(exact&&exact.c);
    const cat=explicitCat||(!best?state.category:null);
    if(best&&!explicitCat&&!brandQuestion(q))state.brand=false;
    if(cat)state.category=cat;
    if(brandQuestion(q))state.brand=true;
    else if(category(q))state.brand=false;
    const colors=[['خمري','عنابي','نبيتي','نبيذي','بوردو','burgundy'],['خوخي','peach'],['فضي','silver'],['اسود','black'],['ابيض','white'],['عاجي','كريمي','اوف وايت','ivory'],['احمر','red'],['وردي','بمبي','زهري','pink'],['فوشي','fuchsia'],['ازرق','سماوي','blue'],['كحلي','navy'],['بيج','beige'],['رمادي','gray','grey'],['بني','brown'],['اخضر','زيتي','نعناعي','green'],['ليلكي','موف','بنفسجي','purple'],['فحمي'],['نمري','leopard'],['ذهبي','شامبين','gold'],['اصفر','yellow'],['برتقالي','orange']];
    const nq=norm(q),color=colors.find(g=>g.some(c=>nq.includes(c)));
    let items=data.filter(p=>(!cat||p.c===cat)&&(!state.brand||p.brand==='lavermo')&&(!color||color.some(c=>norm(p.n).includes(c))));
    if(!items.length&&color)items=data.filter(p=>(!state.brand||p.brand==='lavermo')&&color.some(c=>norm(p.n).includes(c)));
    if(!items.length&&color)items=data.filter(p=>(!cat||p.c===cat)&&(!state.brand||p.brand==='lavermo'));
    if(best&&!cat&&!state.brand)items=featured.map(id=>data.find(p=>p.id===id)).filter(Boolean);
    else items.sort((a,b)=>(b.brand==='lavermo')-(a.brand==='lavermo'));
    if(exact)items=[exact,...items.filter(p=>p.id!==exact.id)];
    if(/غير|بديل|اخر/.test(norm(q))){const fresh=items.filter(p=>!state.last.includes(p.id));if(fresh.length)items=fresh;}
    const picked=items.slice(0,3);state.last=picked.map(p=>p.id);
    const relatedCat={s:'r',c:'s',l:'r',r:'l',u:'s'}[cat||picked[0]?.c];
    const extra=data.find(p=>p.c===relatedCat&&p.brand==='lavermo'&&!state.last.includes(p.id))||data.find(p=>p.c===relatedCat&&!state.last.includes(p.id));
    return {picked,extra};
  }
  function known(q){
    const n=norm(q);
    if(priceQuestion(q))return PRICE;
    if(/نص|نصف/.test(n)&&packQuestion(q))return 'نص دستا ممكن يكون خيار مع طلب أكثر من موديل، لكن شرط عدد الموديلات يتأكد مع الفريق حسب طلبكم. ما نقدرش نأكد خمسة أو عشرة موديلات كشرط ثابت. اختاروا الموديلات والكميات ونأكدولكم التفاصيل.';
    if(/مقاس|سايز|size/.test(n))return 'مقاسات Lavermo من S لـ XXL: S، M، L، XL وXXL. المقاسات والتوزيع المتوفر في كل موديل يأكدهم الفريق قبل تأكيد الطلب.';
    if(packQuestion(q))return 'في Lavermo، الدستا معناها باك، وأقل طلب دستا وحدة: 6 أو 12 قطعة حسب الموديل. ما نفترضوش إن كل الموديلات نفس العدد؛ الفريق يأكد عدد القطع وتوزيع المقاسات لكل موديل.';
    if(brandQuestion(q))return BRAND;
    if(/بالقطعه|حبه وحده|حبه واحده|وحده لنفسي|لنفسي|قطاعي|للأفراد|للافراد/.test(n))return 'البيع عندنا جملة للتجار وأصحاب المحلات، ما نبيعوش بالحبة للأفراد. نقدروا نعاونوا محلكم يختار تشكيلة مناسبة.';
    if(/كيف.*نطلب|طريقه الطلب|كيف.*الطلب|نبي نطلب|نبوا نطلب/.test(n))return 'اختاروا الموديلات واضغطوا «أضف للطلب»، وبعدها افتحوا السلة وحددوا الكميات وبيانات المحل. تقدروا تجهزوا PDF بالصور وتبعتوا الطلب للفريق للتأكيد، أو تكملوا على واتساب.';
    if(/وين|عنوان|مقر|مكانكم|رقمكم|واتساب/.test(n))return 'مقر بيوري في طرابلس، شارع الرشيد. واتساب الفريق 0919282214.';
    if(/توصيل|شحن|استلام|دفع|استرجاع|استبدال|مخزون|متوفر|توفر|ساعات|امتي تفتح/.test(n))return 'الفريق يأكدلكم التوفر وتفاصيل الدفع والاستلام أو التوصيل حسب الموديلات والمدينة. تواصلوا على واتساب 0919282214، من غير ما نفترض توفر أو موعد قبل التأكيد.';
    return null;
  }
  function safeReply(reply){
    // Remote text is never a source of quoted prices, quantities or commercial promises.
    if(typeof reply!=='string'||!reply.trim()||/[$€£]/.test(reply)||/[0-9٠-٩۰-۹][0-9٠-٩۰-۹.,\s]*(?:د\.?ل|دينار|lyd|usd|dollar|dinar)/i.test(reply)||/سعر|اسعار|ثمن|دينار|دولار|خصم|تخفيض|price|cost|lyd|usd|dinar|dollar|pound|euro|hundred|thousand|مائه|مئه|مائة|مئة|عشرين|خمسين/i.test(norm(reply)))return null;
    if(/اثاث|كنب|furniture|reservation|booking|حجز|تم.*(?:تاكيد|تسجيل|ارسال).*طلب|متوفر (?:حاليا|الان|دايما)|مضمون|نضمن/.test(norm(reply)))return null;
    // The backend sometimes points to a team-contact button/form this site doesn't have: swap that sentence for the real WhatsApp channel.
    const lines=reply.trim().split(/\n+/),fake=/نبي نتواصل مع الفريق|الفورم|inquiry form|زر/;
    const kept=lines.filter(l=>!fake.test(norm(l)));
    if(kept.length<lines.length)kept.push('للتأكيد، تواصلوا مع الفريق على واتساب 0919282214.');
    return kept.join('\n').trim()||null;
  }
  const policy={norm,known,safeReply,selectProducts,category,priceQuestion,brandQuestion,productQuestion,bestQuestion,PRICE,BRAND};
  root.PureyChatPolicy=policy;
  if(typeof module!=='undefined')module.exports=policy;
  if(!root.document)return;
  const $=id=>document.getElementById(id),panel=$('aiPanel');if(!panel)return;
  const data=root.PUREY_CATALOG||JSON.parse($('catalog-data').textContent);
  const thread=$('aiThread'),body=panel.querySelector('.ai-body'),text=$('aiText'),send=$('aiSend');
  const inline=$('pureyInlineChat'),inlineThread=$('pureyInlineThread'),form=$('pureyAskForm'),inlineText=$('pureyAskText'),inlineSend=form?.querySelector('button[type="submit"]');
  const threads=[thread,inlineThread].filter(Boolean);
  const state={category:null,brand:false,last:[]};let busy=false;
  let session;try{session=sessionStorage.getItem('purey.thread');if(!session){session=crypto.randomUUID();sessionStorage.setItem('purey.thread',session);}}catch{session='purey-'+Date.now();}
  function scroll(){body.scrollTop=body.scrollHeight;if(inline)inline.scrollTop=inline.scrollHeight;}
  function append(el){const nodes=threads.map(t=>{const node=el.cloneNode(true);t.append(node);return node;});scroll();return nodes;}
  function bubble(value,who){const el=document.createElement('div');el.className='bub '+who;el.textContent=value;const nodes=append(el);return {remove(){nodes.forEach(n=>n.remove());},setAttribute(k,v){nodes.forEach(n=>n.setAttribute(k,v));}};}
  function activateInline(){if(inline){inline.hidden=false;inlineThread.setAttribute('aria-live','polite');thread.setAttribute('aria-live','off');}}
  function open(on){panel.toggleAttribute('data-open',on);$('aiLaunch').setAttribute('aria-expanded',String(on));document.documentElement.classList.toggle('ai-open',on);thread.setAttribute('aria-live',on?'polite':'off');if(inlineThread)inlineThread.setAttribute('aria-live',on?'off':'polite');if(on)setTimeout(()=>$('aiClose').focus(),40);}
  function view(v){panel.dataset.view=v;if(v==='chat')setTimeout(()=>text.focus(),80);}
  function link(label,href){const a=document.createElement('a');a.className='ai-feature';a.href=href;a.textContent=label;append(a);}
  function productCards(products,label){
    if(!products.length)return;
    const group=document.createElement('div');group.className='chat-products';group.setAttribute('aria-label',label);
    const heading=document.createElement('p');heading.className='chat-product-label';heading.textContent=label;group.append(heading);
    for(const p of products){
      const a=document.createElement('a');a.className='chat-product';a.href='product-'+p.id+'.html';
      const image=document.createElement('img');image.src=p.i;image.alt=p.n;image.width=90;image.height=125;image.loading='lazy';
      const copy=document.createElement('span'),name=document.createElement('strong'),code=document.createElement('small'),cta=document.createElement('span');
      name.textContent=p.n;code.textContent=p.id.toUpperCase()+(p.brand==='lavermo'?' · Lavermo':'');cta.textContent='شوفوا التفاصيل ←';cta.className='chat-product-action';copy.append(name,code,cta);a.append(image,copy);group.append(a);
    }append(group);
  }
  function recommendations(q){const result=selectProducts(data,q,state);productCards(result.picked,'من التشكيلة');if(result.extra)productCards([result.extra],'ويكمل معاها');return result.picked.length;}
  async function ask(q){
    q=q.trim();if(!q||busy)return;busy=true;send.disabled=true;if(inlineSend)inlineSend.disabled=true;threads.forEach(t=>t.setAttribute('aria-busy','true'));bubble(q,'me');
    const typing=bubble('نجهزولكم الرد…','bot');typing.setAttribute('role','status');
    try{
      const confirmed=known(q),wantProducts=productQuestion(q)||bestQuestion(q)||brandQuestion(q)||/\b[cosulv]\d{2,3}\b/i.test(q);
      let reply=confirmed;
      if(!reply&&wantProducts)reply=bestQuestion(q)?'هذي اختيارات من قسم «الأكثر طلباً» في الموقع، ومعاها اقتراح يكمل التشكيلة. ترتيب المبيعات الفعلي والتوفر يأكدهم الفريق. وLavermo علامتنا الخاصة بموديلات محدودة وتفاصيل مميزة.':'هذي موديلات من الكتالوج تناسب طلبكم. افتحوا الصورة للتفاصيل وإضافة الموديل للطلب. ونرشحوا Lavermo، علامة بيوري الخاصة، لتشكيلة محلكم.';
      if(!reply){
        const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),45000);
        try{const response=await fetch('https://getflann.com/api/site-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({site:'purey',message:q,thread:session}),signal:ctrl.signal});if(response.ok){const result=await response.json();if(result.ok)reply=safeReply(result.reply);}}catch{}finally{clearTimeout(timer);}
      }
      typing.remove();bubble(reply||'نقدروا نعاونوا محلكم في Lavermo والموديلات والمقاسات وطريقة الطلب بالجملة. شن نوع التشكيلة اللي تبوها؟ ولأي تفاصيل تحتاج تأكيد، واتساب الفريق 0919282214.','bot');
      if(wantProducts)recommendations(q);
      if(brandQuestion(q)||wantProducts)link('تصفّحوا Lavermo، علامة بيوري الخاصة ←','lavermo.html');
      if(!reply||priceQuestion(q)||/توصيل|شحن|دفع|مخزون|توفر/.test(norm(q)))link('تواصلوا مع الفريق على واتساب ←','https://wa.me/218919282214?text='+encodeURIComponent(q));
    }finally{typing.remove();busy=false;send.disabled=false;if(inlineSend)inlineSend.disabled=false;threads.forEach(t=>t.setAttribute('aria-busy','false'));scroll();}
  }
  function submit(){const q=text.value;if(!q.trim()||busy)return;view('chat');text.value='';text.style.height='auto';send.removeAttribute('data-ready');ask(q);}
  $('aiLaunch').addEventListener('click',()=>open(!panel.hasAttribute('data-open')));
  $('aiClose').addEventListener('click',()=>{open(false);$('aiLaunch').focus();});
  $('aiScrim').addEventListener('click',()=>open(false));$('aiStart').addEventListener('click',()=>view('chat'));$('aiBack').addEventListener('click',()=>view('home'));
  $('aiChips').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b){view('chat');ask(b.dataset.q);}});
  text.addEventListener('input',()=>{text.style.height='auto';text.style.height=Math.min(text.scrollHeight,180)+'px';send.toggleAttribute('data-ready',!!text.value.trim());});
  text.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}});send.addEventListener('click',submit);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.hasAttribute('data-open')){open(false);$('aiLaunch').focus();}});
  const askSection=document.getElementById('ask-purey');
  if(askSection&&'IntersectionObserver' in root)new IntersectionObserver(e=>document.documentElement.classList.toggle('ask-visible',e[0].isIntersecting),{threshold:.15}).observe(askSection);
  if(form)form.addEventListener('submit',e=>{e.preventDefault();if(!inlineText.value.trim()||busy)return;activateInline();ask(inlineText.value);inlineText.value='';inlineText.focus();});
  document.querySelectorAll('[data-ask-purey]').forEach(button=>button.addEventListener('click',()=>{if(busy)return;activateInline();ask(button.dataset.askPurey);}));
})(typeof window!=='undefined'?window:globalThis);
