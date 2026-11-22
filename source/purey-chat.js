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

  // ── ordering from the chat: codes + quantities → basket; never confirms an order itself ──
  const NUM={'واحد':1,'وحده':1,'اثنين':2,'اتنين':2,'زوز':2,'جوز':2,'ثلاث':3,'ثلاثه':3,'تلاته':3,'تلات':3,'اربع':4,'اربعه':4,'خمس':5,'خمسه':5,'ست':6,'سته':6,'سبع':7,'سبعه':7,'ثمن':8,'ثمانيه':8,'ثمان':8,'تسع':9,'تسعه':9,'عشر':10,'عشره':10,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10};
  const digits=s=>String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  function parseOrder(q,data){
    const codes=[],unknown=[];
    // quantities are read with the product codes taken out, so «S42 دستة» is one dozen, not 42
    const n=norm(digits(q)).replace(/(?:^|[^a-z0-9])[a-z]\s?-?\d{1,3}(?=$|[^0-9])/gi,' ');
    for(const m of digits(q).matchAll(/(?:^|[^a-zA-Z0-9])([a-zA-Z])\s?-?(\d{1,3})(?=$|[^0-9])/g)){
      const id=(m[1]+m[2]).toLowerCase(),pad=m[1].toLowerCase()+m[2].padStart(2,'0');
      const hit=data.find(p=>p.id===id)||data.find(p=>p.id===pad);
      if(hit){if(!codes.includes(hit.id))codes.push(hit.id);}else unknown.push(id.toUpperCase());
    }
    const word='(\\d{1,4}|'+Object.keys(NUM).join('|')+')';
    const num=w=>/^\d+$/.test(w)?+w:NUM[w];
    let dozens=null,pieces=null,m;
    if(/دستتين|دستين|زوز دست|جوز دست/.test(n))dozens=2;
    else if((m=n.match(new RegExp(word+'\\s*(?:دستات|دست|دسته|دستا|دزينه|دزن|dozens|dozen|doz)'))))dozens=num(m[1]);
    else if((m=n.match(new RegExp('(?:دستات|دست|دسته|دستا)\\s*'+word+'(?![0-9])'))))dozens=num(m[1]);
    else if(/(?:^|\s)(?:دسته|دستا|دست)(?:\s|$|،|\.)/.test(n))dozens=1;
    if((m=n.match(new RegExp(word+'\\s*(?:قطعه|قطع|حبه|حبات|pcs|pieces|piece|قطعا)'))))pieces=num(m[1]);
    const qty=pieces||(dozens?dozens*12:null);
    return {codes,unknown,qty,dozens:pieces?null:dozens};
  }
  function orderIntent(q,parsed){
    const n=norm(digits(q));
    if(/كيف.*(نطلب|الطلب)|طريقه الطلب/.test(n)&&!parsed.codes.length)return null;
    if(/(شيل|احذف|امسح|نحي|الغي|ازيل|remove)/.test(n)&&parsed.codes.length)return 'remove';
    if(/(فرغ|فضي|امسح|الغي|صفر).*(الطلب|السله|سلتي|طلبي).*(كامل|كله|كلها)|(فرغ|فضي) (السله|الطلب)/.test(n))return 'clear';
    if(parsed.codes.length&&(parsed.qty||/(ضيف|اضف|زيد|حط|نبي|نبو|نبغي|نحب|ابي|اطلب|نطلب|بدي|عايز|خوذ|خذ|سجل|add|order|want|need)/.test(n)))return 'add';
    if(parsed.unknown.length&&/(ضيف|اضف|حط|نبي|نبو|اطلب|نطلب|دست|قطع)/.test(n))return 'unknown';
    if(/(كمل|اكمل|ارسل|ابعت|نبعت|نرسل|اكد|تاكيد|ثبت|خلص|نخلص|ابعثو|ارسلو|send|checkout).{0,12}(طلب|الطلبيه|الطلبية|order)|(اطلب|نطلب) (توا|الان|هلبا)$|^(ارسل|ابعت|اكد)(و|وا)? (الطلب|طلبي)/.test(n))return 'checkout';
    if(/(شن|شنو|وريني|ورينا|كم|افتح|اعرض).{0,10}(طلبي|في الطلب|السله|سلتي|طلبيتي)|^(السله|طلبي|سلتي)$/.test(n))return 'show';
    return null;
  }
  function known(q){
    const n=norm(q);
    if(priceQuestion(q))return PRICE;
    if(/نص|نصف/.test(n)&&packQuestion(q))return 'نص دستا ممكن يكون خيار مع طلب أكثر من موديل، لكن شرط عدد الموديلات يتأكد مع الفريق حسب طلبكم. ما نقدرش نأكد خمسة أو عشرة موديلات كشرط ثابت. اختاروا الموديلات والكميات ونأكدولكم التفاصيل.';
    if(/(3|4|5|٣|٤|٥)\s*x\s*l|xxxl|كبير جدا|مقاسات كبيره|بلس سايز|plus size/i.test(n))return 'مقاسات Lavermo المعروفة من S لـ XXL. مقاسات أكبر من XXL (3XL وفوق) ما نقدروش نأكدوها من هنا؛ اسألوا الفريق على واتساب 0919282214 على الموديل اللي يهمكم.';
    if(/اطفال|طفل|بناتي|صغار|بيبي|kids|children|baby/.test(n))return 'الكتالوج عندنا ملابس نسائية: بجامات قطني وستان، أرواب وعرائسي، لانجري وطواقم داخلي. ملابس الأطفال مش ضمن الكتالوج المعروض؛ لو تبوا تتأكدوا، اسألوا الفريق على واتساب 0919282214.';
    if(/امت[يى] تفتح|امتي تفتحو|تفتحو|تسكرو|ساعات|دوام|مفتوحين|مواعيد العمل|opening|hours/.test(n))return 'مواعيد الدوام ما نقدروش نأكدوها من هنا. الطلب من الموقع متاح أي وقت، والفريق يرد عليكم على واتساب 0919282214. والمقر في طرابلس، شارع الرشيد.';
    if(/كتالوج|كاتالوج|catalog/.test(n)&&/pdf|ابعت|ارسل|بعت|نسخه|ملف/.test(n))return 'الكتالوج كامل في الموقع بالصور والرموز، مقسّم حسب الأقسام. ولو تبوا نسخة PDF للمحل، اطلبوها من الفريق على واتساب 0919282214. وتقدروا تجهزوا PDF لطلبكم أنتم من السلة.';
    if(/كوبون|كوبونه|قسيمه|coupon|10 دستات|عشر دستات/.test(n))return 'عرض الكوبون: اشتروا أكثر من 10 دستات وثلاثة هدية، لفترة محدودة واستعمال واحد. تحصلوا عليه من قسم «مكافآت بيوري» في الصفحة الرئيسية بزر «احصلوا على الكوبون»، والفريق يأكد تطبيقه على طلبكم.';
    if(/مقاس|سايز|size/.test(n))return 'مقاسات Lavermo من S لـ XXL: S، M، L، XL وXXL. المقاسات والتوزيع المتوفر في كل موديل يأكدهم الفريق قبل تأكيد الطلب.';
    if(packQuestion(q))return 'في Lavermo، الدستا معناها باك، وأقل طلب دستا وحدة: 6 أو 12 قطعة حسب الموديل. ما نفترضوش إن كل الموديلات نفس العدد؛ الفريق يأكد عدد القطع وتوزيع المقاسات لكل موديل.';
    if(brandQuestion(q))return BRAND;
    if(/بالقطعه|حبه وحده|حبه واحده|وحده لنفسي|لنفسي|قطاعي|للأفراد|للافراد/.test(n))return 'البيع عندنا جملة للتجار وأصحاب المحلات، ما نبيعوش بالحبة للأفراد. نقدروا نعاونوا محلكم يختار تشكيلة مناسبة.';
    if(/كيف.*نطلب|طريقه الطلب|كيف.*الطلب|نبي نطلب|نبوا نطلب/.test(n))return 'اختاروا الموديلات واضغطوا «أضف للطلب»، وبعدها افتحوا السلة وحددوا الكميات وبيانات المحل. تقدروا تجهزوا PDF بالصور وتبعتوا الطلب للفريق للتأكيد، أو تكملوا على واتساب.';
    if(/بطاقه الولاء|بطاقة الولاء|ولاء|نقاط|كاش باك|كاشباك|cashback|loyalty/.test(n))return 'بطاقة الولاء متاع بيوري فيها 3% كاش باك على مشترياتكم. تحصلوا عليها من قسم «مكافآت بيوري» في الصفحة الرئيسية بزر «احصلوا على البطاقة»، وتفاصيل استعمالها يأكدها الفريق على واتساب 0919282214.';
    if(/لوجو|لوغو|logo|براند خاص بي|ماركه خاصه بي|اسم محلي|علامه خاصه بي/.test(n))return 'Lavermo هي العلامة الخاصة ببيوري. طباعة لوجو محلكم أو تصنيع براند باسمكم ما نقدروش نأكدوه هنا؛ ابعتوا طلبكم للفريق على واتساب 0919282214 ويردوا عليكم.';
    if(/موزع|توزيع|وكيل|توكيل|distribut/.test(n))return 'طلبات التوزيع والوكالة يراجعها الفريق مباشرة. ابعتوا اسم المحل والمدينة على واتساب 0919282214 ويتواصلوا معاكم.';
    if(/موظف|انسان|شخص حقيقي|نكلم الفريق|نتكلم مع|staff|human|agent/.test(n))return 'أكيد. تواصلوا مع فريق بيوري مباشرة على واتساب 0919282214.';
    if(/وين|عنوان|مقر|مكانكم|رقمكم|واتساب/.test(n))return 'مقر بيوري في طرابلس، شارع الرشيد. واتساب الفريق 0919282214.';
    if(/توصيل|شحن|استلام|دفع|استرجاع|استبدال|مخزون|متوفر|توفر/.test(n))return 'الفريق يأكدلكم التوفر وتفاصيل الدفع والاستلام أو التوصيل حسب الموديلات والمدينة. تواصلوا على واتساب 0919282214، من غير ما نفترض توفر أو موعد قبل التأكيد.';
    return null;
  }
  function safeReply(reply){
    // Remote text is never a source of quoted prices, quantities or commercial promises.
    if(typeof reply!=='string'||!reply.trim()||/^[\s0-9٠-٩۰-۹.,:+\-]+$/.test(reply)||/[$€£]/.test(reply)||/[0-9٠-٩۰-۹][0-9٠-٩۰-۹.,\s]*(?:د\.?ل|دينار|lyd|usd|dollar|dinar)/i.test(reply)||/سعر|اسعار|ثمن|مبلغ|مجموع|اجمالي|حساب|دينار|دولار|خصم|تخفيض|price|cost|amount|total|lyd|usd|dinar|dollar|pound|euro|hundred|thousand|مائه|مئه|مائة|مئة|عشرين|خمسين/i.test(norm(reply)))return null;
    if(/اثاث|كنب|furniture|reservation|booking|حجز|تم.*(?:تاكيد|تسجيل|ارسال).*طلب|متوفر (?:حاليا|الان|دايما)|مضمون|نضمن/.test(norm(reply)))return null;
    // The backend sometimes points to a team-contact button/form this site doesn't have: swap that sentence for the real WhatsApp channel.
    const lines=reply.trim().split(/\n+|(?<=[.؟!])\s+/),fake=/نبي نتواصل مع الفريق|الفورم|inquiry form|نموذج|(?:^|\s)ال?زر(?:\s|$)|button/i;
    const kept=lines.filter(l=>!fake.test(norm(l)));
    if(kept.length<lines.length)kept.push('للتأكيد، تواصلوا مع الفريق على واتساب 0919282214.');
    return kept.join('\n').trim()||null;
  }
  const policy={norm,known,safeReply,selectProducts,category,priceQuestion,brandQuestion,productQuestion,bestQuestion,parseOrder,orderIntent,PRICE,BRAND};
  root.PureyChatPolicy=policy;
  if(typeof module!=='undefined')module.exports=policy;
  if(!root.document)return;
  const $=id=>document.getElementById(id),panel=$('aiPanel');if(!panel)return;
  const data=root.PUREY_CATALOG||JSON.parse($('catalog-data').textContent);
  const thread=$('aiThread'),body=panel.querySelector('.ai-body'),text=$('aiText'),send=$('aiSend');
  const form=$('pureyAskForm'),inlineText=$('pureyAskText'),inlineSend=form?.querySelector('button[type="submit"]');
  const threads=[thread];
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches,phone=()=>matchMedia('(max-width:520px)').matches;
  // iOS keeps position:fixed on the layout viewport; size the sheet to the visible area instead
  const vv=root.visualViewport;
  function syncViewport(){const r=document.documentElement;if(!vv)return;r.style.setProperty('--vvh',vv.height+'px');r.style.setProperty('--vvtop',vv.offsetTop+'px');r.classList.toggle('kb-open',vv.height<root.innerHeight-60);}
  if(vv){vv.addEventListener('resize',syncViewport);vv.addEventListener('scroll',syncViewport);}syncViewport();
  // freeze the page behind the phone sheet so focusing the field never scrolls it away
  let lockY=0,locked=false;
  function lockPage(on){const b=document.body;if(on===locked)return;if(on){lockY=root.scrollY;Object.assign(b.style,{position:'fixed',top:-lockY+'px',left:'0',right:'0',width:'100%'});}else{Object.assign(b.style,{position:'',top:'',left:'',right:'',width:''});root.scrollTo(0,lockY);}locked=on;}
  const state={category:null,brand:false,last:[]};let busy=false;
  let session;try{session=sessionStorage.getItem('purey.thread');if(!session){session=crypto.randomUUID();sessionStorage.setItem('purey.thread',session);}}catch{session='purey-'+Date.now();}
  function scroll(){body.scrollTop=body.scrollHeight;}
  function append(el){const nodes=threads.map(t=>{const node=el.cloneNode(true);t.append(node);return node;});scroll();return nodes;}
  function bubble(value,who){const el=document.createElement('div');el.className='bub '+who;el.textContent=value;const nodes=append(el);return {remove(){nodes.forEach(n=>n.remove());},setAttribute(k,v){nodes.forEach(n=>n.setAttribute(k,v));}};}
  function open(on){panel.toggleAttribute('data-open',on);panel.inert=!on;$('aiLaunch').setAttribute('aria-expanded',String(on));document.documentElement.classList.toggle('ai-open',on);thread.setAttribute('aria-live',on?'polite':'off');lockPage(on&&phone());syncViewport();if(on){panel.dataset.view='chat';scroll();setTimeout(()=>(fine?text:$('aiClose')).focus({preventScroll:true}),60);}}
  function view(v){panel.dataset.view=v;if(v==='chat'&&fine)setTimeout(()=>text.focus({preventScroll:true}),80);}
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

  // basket card inside the chat: what's in the order and the three ways to send it
  function basketCard(){
    const B=root.PureyBag;if(!B)return;
    const items=B.items();
    const box=document.createElement('div');box.className='chat-basket';
    if(!items.length){const p=document.createElement('p');p.textContent='طلبكم فاضي الآن.';box.append(p);append(box);return;}
    const head=document.createElement('p');head.className='chat-basket-head';head.textContent='طلبكم · '+items.length+' صنف · '+B.pieces()+' قطعة';box.append(head);
    const ul=document.createElement('ul');
    for(const it of items.slice(0,6)){const li=document.createElement('li');const im=document.createElement('img');im.src=it.i;im.alt='';im.width=36;im.height=44;im.loading='lazy';const t=document.createElement('span');t.textContent=it.n+' · '+it.id.toUpperCase();const q=document.createElement('b');q.textContent=it.qty+' قطعة';li.append(im,t,q);ul.append(li);}
    if(items.length>6){const li=document.createElement('li');li.textContent='+ '+(items.length-6)+' أصناف أخرى';ul.append(li);}
    box.append(ul);
    const acts=document.createElement('div');acts.className='chat-basket-actions';
    const send=document.createElement('button');send.type='button';send.className='cb-primary';send.dataset.act='open';send.textContent='كمّلوا بيانات المحل وأرسلوا الطلب';
    const pdf=document.createElement('button');pdf.type='button';pdf.dataset.act='pdf';pdf.textContent='احفظوا الطلب PDF';
    const wa=document.createElement('a');wa.href=B.waLink();wa.target='_blank';wa.rel='noopener';wa.textContent='ابعتوا الطلب على واتساب';
    acts.append(send,pdf,wa);box.append(acts);append(box);
  }
  function handleOrder(kind,parsed,q){
    const B=root.PureyBag;
    if(!B){bubble('تقدروا تبعتوا الموديلات والكميات للفريق على واتساب 0919282214 ويأكدولكم الطلب.','bot');link('ابعتوا الطلب على واتساب ←','https://wa.me/218919282214?text='+encodeURIComponent(q));return;}
    const name=id=>{const p=data.find(x=>x.id===id);return p?p.n+' ('+id.toUpperCase()+')':id.toUpperCase();};
    if(kind==='add'){
      const qty=parsed.qty||6;
      parsed.codes.forEach(id=>B.add(id,qty));
      const what=parsed.codes.map(name).join('، ');
      const dz=d=>d===1?'دستة وحدة':d===2?'دستتين':d<=10?d+' دستات':d+' دستة';
      const pc=k=>k===1?'قطعة وحدة':k===2?'قطعتين':k<=10?k+' قطع':k+' قطعة';
      const per=parsed.dozens?dz(parsed.dozens)+' ('+pc(qty)+(parsed.codes.length>1?' لكل موديل':'')+')':pc(qty)+(parsed.codes.length>1?' لكل موديل':'');
      let msg='حطّينا '+what+' في طلبكم: '+per+'.';
      if(parsed.dozens)msg+=' حسبنا الدستة 12 قطعة؛ في بعض الموديلات الدستة 6، والفريق يأكد العدد. تقدروا تعدلوا الكمية من السلة.';
      else if(!parsed.qty)msg+=' هذي الكمية المبدئية، تقدروا تعدلوها من السلة.';
      if(parsed.unknown.length)msg+=' وما لقيناش الرمز '+parsed.unknown.join('، ')+' في الكتالوج.';
      msg+=' الطلب يتأكد بعد ما يراجعه الفريق.';
      bubble(msg,'bot');basketCard();return;
    }
    if(kind==='unknown'){bubble('ما لقيناش الرمز '+parsed.unknown.join('، ')+' في الكتالوج. تأكدوا من الرمز المكتوب تحت صورة الموديل، أو اكتبوا اسم القسم ونورّوكم الموديلات.','bot');return;}
    if(kind==='remove'){const gone=parsed.codes.filter(id=>B.remove(id));bubble(gone.length?'شلنا '+gone.map(name).join('، ')+' من طلبكم.':'الموديل هذا مش في طلبكم.','bot');basketCard();return;}
    if(kind==='clear'){B.clear();bubble('فرّغنا طلبكم. اختاروا الموديلات من جديد وقتما تحبوا.','bot');return;}
    if(kind==='show'){bubble(B.items().length?'هذا اللي في طلبكم الآن:':'طلبكم فاضي الآن. اكتبوا رمز الموديل والكمية، مثلاً «ضيف C55 دستتين».','bot');if(B.items().length)basketCard();return;}
    if(kind==='checkout'){
      if(!B.items().length){bubble('طلبكم فاضي الآن. اكتبوا رمز الموديل والكمية (مثلاً «ضيف C55 دستتين») أو اضغطوا «أضف للطلب» تحت أي موديل.','bot');return;}
      bubble('ما نقدروش نأكدوا الطلب من الشات؛ الفريق يراجعه ويأكد السعر والتوفر. كمّلوا اسم المحل والهاتف والمدينة وأرسلوا الطلب، ويوصل للفريق ملف PDF بالصور. أو ابعتوه مباشرة على واتساب.','bot');basketCard();return;
    }
  }
  async function ask(q){
    q=q.trim();if(!q||busy)return;busy=true;send.disabled=true;if(inlineSend)inlineSend.disabled=true;threads.forEach(t=>t.setAttribute('aria-busy','true'));bubble(q,'me');
    const dots=document.createElement('div');dots.className='bub bot typing';dots.setAttribute('role','status');dots.setAttribute('aria-label','نجهزولكم الرد…');dots.innerHTML='<i></i><i></i><i></i>';thread.append(dots);scroll();const typing={remove(){dots.remove();}};
    try{
      if(!priceQuestion(q)){const parsed=parseOrder(q,data),kind=orderIntent(q,parsed);if(kind){typing.remove();handleOrder(kind,parsed,q);return;}}
      const confirmed=known(q),wantProducts=!/اطفال|طفل|بناتي|صغار|بيبي|kids|children|baby/.test(norm(q))&&productQuestion(q)||bestQuestion(q)||brandQuestion(q)||/\b[cosulv]\d{2,3}\b/i.test(q);
      let reply=confirmed;
      const CATN={c:'بجامات قطني',s:'بجامات ستان',r:'أرواب وعرائسي',l:'لانجري',u:'طواقم داخلي'};
      const one=parseOrder(q,data).codes;
      if(!reply&&one.length===1){const p=data.find(x=>x.id===one[0]);reply='الموديل '+p.id.toUpperCase()+' هو «'+p.n+'»، من قسم '+(CATN[p.c]||'الكتالوج')+(p.brand==='lavermo'?'، من علامتنا الخاصة Lavermo':'')+'. افتحوا الصورة للتفاصيل، أو اكتبوا «ضيف '+p.id.toUpperCase()+' دستة» ونحطوه في طلبكم.';}
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
  panel.inert=!panel.hasAttribute('data-open');
  $('aiLaunch').addEventListener('click',()=>open(!panel.hasAttribute('data-open')));
  $('aiClose').addEventListener('click',()=>{open(false);$('aiLaunch').focus();});
  $('aiScrim').addEventListener('click',()=>{open(false);$('aiLaunch').focus();});
  thread.addEventListener('click',e=>{const b=e.target.closest('.chat-basket [data-act]');if(!b||!root.PureyBag)return;if(b.dataset.act==='open'){open(false);root.PureyBag.open();}if(b.dataset.act==='pdf')root.PureyBag.pdf();});
  $('aiChips').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b){view('chat');ask(b.dataset.q);}});
  text.addEventListener('input',()=>{text.style.height='auto';text.style.height=Math.min(text.scrollHeight,180)+'px';send.toggleAttribute('data-ready',!!text.value.trim());});
  text.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}});send.addEventListener('click',submit);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.hasAttribute('data-open')){open(false);$('aiLaunch').focus();}});
  const askSection=document.getElementById('ask-purey');
  if(askSection&&'IntersectionObserver' in root)new IntersectionObserver(e=>document.documentElement.classList.toggle('ask-visible',e[0].isIntersecting),{threshold:.15}).observe(askSection);
  // the home-page ask box hands the question to the chat sheet instead of growing a thread in the page
  function handOff(q){q=String(q||'').trim();if(!q||busy)return;inlineText&&inlineText.blur();open(true);ask(q);}
  if(form)form.addEventListener('submit',e=>{e.preventDefault();const q=inlineText.value;inlineText.value='';handOff(q);});
  document.querySelectorAll('[data-ask-purey]').forEach(button=>button.addEventListener('click',()=>handOff(button.dataset.askPurey)));
})(typeof window!=='undefined'?window:globalThis);
