(function(){
'use strict';
var html=document.documentElement;
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}
function isMr(){return html.lang==='mr';}
function T(en,mr){return isMr()?mr:en;}
var $=function(id){return document.getElementById(id);};
var hooks=[];
function runHooks(){hooks.forEach(function(f){f();});}
var NS='http://www.w3.org/2000/svg';

/* ---------- stars ---------- */
(function(){
  var s=$('stars'),seed=7;if(!s)return;
  function r(){seed=(seed*9301+49297)%233280;return seed/233280;}
  for(var i=0;i<55;i++){
    var c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',(r()*100).toFixed(2));c.setAttribute('cy',(r()*58).toFixed(2));
    c.setAttribute('r',(0.12+r()*0.28).toFixed(2));
    if(i%2===0)c.setAttribute('class','twinkle');
    s.appendChild(c);
  }
})();

/* ---------- menu ---------- */
var nav=$('nav'),menuBtn=$('menuBtn');
menuBtn.addEventListener('click',function(){var o=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o);});
nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');}});

/* ---------- comfort ---------- */
var comfortBtn=$('comfortBtn'),comfortPanel=$('comfortPanel');
comfortBtn.addEventListener('click',function(){var o=comfortPanel.classList.toggle('open');comfortBtn.setAttribute('aria-expanded',o);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&comfortPanel.classList.contains('open')){comfortPanel.classList.remove('open');comfortBtn.setAttribute('aria-expanded','false');comfortBtn.focus();}});
[['optCalm','calm'],['optBig','big'],['optRoomy','roomy']].forEach(function(p){
  var el=$(p[0]);
  if(store('mb_'+p[1])==='1'){el.checked=true;html.classList.add(p[1]);}
  el.addEventListener('change',function(){html.classList.toggle(p[1],el.checked);store('mb_'+p[1],el.checked?'1':'0');});
});

/* ---------- language ---------- */
var langBtns=document.querySelectorAll('.langtoggle button');
function setLang(l){
  html.lang=l;
  document.querySelectorAll('[data-en]').forEach(function(el){el.innerHTML=l==='mr'?el.dataset.mr:el.dataset.en;});
  var em=$('email');if(em)em.placeholder=l==='mr'?em.dataset.phMr:em.dataset.phEn;
  langBtns.forEach(function(b){var on=b.dataset.lang===l;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
  store('mb_lang',l);
  runHooks();
}
langBtns.forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang);});});

if($('scene')){
/* ---------- colour game ---------- */
var COLORS=[
  {n:1,hex:'#5B46A0',en:'Plum',mr:'जांभळा'},
  {n:2,hex:'#FFD66B',en:'Moon yellow',mr:'पिवळा'},
  {n:3,hex:'#4FB286',en:'Leaf green',mr:'हिरवा'},
  {n:4,hex:'#FF6F91',en:'Berry pink',mr:'गुलाबी'},
  {n:5,hex:'#6EC1E4',en:'Sky blue',mr:'निळा'},
  {n:6,hex:'#FF9A5A',en:'Sunset orange',mr:'नारंगी'}
];
function star(cx,cy,R){var p=[],r=R*0.45;for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:R;p.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy+rr*Math.sin(a)).toFixed(1));}return p.join(' ');}
var REGIONS=[
  {id:'sky',code:1,en:'Sky',mr:'आकाश',shapes:[{t:'rect',a:{x:0,y:0,width:400,height:280},l:[34,34]}]},
  {id:'moon',code:2,en:'Moon',mr:'चंद्र',shapes:[{t:'circle',a:{cx:315,cy:68,r:40},l:[315,68]}]},
  {id:'stars',pl:1,code:2,en:'Stars',mr:'ताऱ्या',shapes:[{t:'polygon',a:{points:star(80,62,19)},l:[80,63]},{t:'polygon',a:{points:star(170,34,15)},l:[170,35]}]},
  {id:'far',code:5,en:'Far hill',mr:'दूरची टेकडी',shapes:[{t:'path',a:{d:'M0,190 Q100,120 200,165 T400,150 L400,280 L0,280 Z'},l:[60,185]}]},
  {id:'near',code:3,en:'Near hill',mr:'जवळची टेकडी',shapes:[{t:'path',a:{d:'M0,232 Q120,184 240,226 T400,212 L400,280 L0,280 Z'},l:[60,255]}]},
  {id:'house',code:6,en:'House',mr:'घर',shapes:[{t:'rect',a:{x:135,y:160,width:100,height:70,rx:4},l:[160,200]}]},
  {id:'roof',code:4,en:'Roof',mr:'छप्पर',shapes:[{t:'polygon',a:{points:'124,162 185,112 246,162'},l:[185,148]}]},
  {id:'door',code:1,en:'Door',mr:'दार',shapes:[{t:'path',a:{d:'M172,230 V204 a13,13 0 0 1 26,0 V230 Z'},l:[185,213]}]},
  {id:'bush',code:4,en:'Berry bush',mr:'बेरीचं झुडूप',shapes:[{t:'circle',a:{cx:318,cy:226,r:34},l:[298,240]}]},
  {id:'berries',pl:1,code:2,en:'Berries',mr:'बेरी',shapes:[{t:'circle',a:{cx:306,cy:212,r:10},l:[306,212]},{t:'circle',a:{cx:332,cy:222,r:10},l:[332,222]},{t:'circle',a:{cx:316,cy:240,r:10},l:[316,240]}]}
];
var scene=$('scene'),painted={},mode='guided',picked=null,lastMsg=null;
function lum(h){var r=parseInt(h.substr(1,2),16),g=parseInt(h.substr(3,2),16),b=parseInt(h.substr(5,2),16);return (0.299*r+0.587*g+0.114*b)/255;}
function col(n){return COLORS[n-1];}
function buildScene(){
  REGIONS.forEach(function(r){
    var g=document.createElementNS(NS,'g');
    g.setAttribute('class','reg');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.dataset.id=r.id;
    r.shapes.forEach(function(s){
      var e=document.createElementNS(NS,s.t);for(var k in s.a)e.setAttribute(k,s.a[k]);
      e.setAttribute('class','shape');e.setAttribute('fill','#FFFBF2');g.appendChild(e);
    });
    r.shapes.forEach(function(s){
      var t=document.createElementNS(NS,'text');t.setAttribute('class','num');t.setAttribute('x',s.l[0]);t.setAttribute('y',s.l[1]);
      t.textContent=r.code;t.setAttribute('fill','#2E2440');g.appendChild(t);
    });
    g.addEventListener('click',function(){paint(r);});
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();paint(r);}});
    scene.appendChild(g);r.el=g;
  });
}
function renderPalette(){
  var p=$('palette');p.innerHTML='';
  COLORS.forEach(function(c){
    var b=document.createElement('button');b.type='button';b.className='sw';b.setAttribute('role','radio');
    b.setAttribute('aria-checked',picked===c.n);
    b.style.background=c.hex;b.style.color=lum(c.hex)<0.55?'#fff':'#2E2440';
    b.setAttribute('aria-label',c.n+', '+T(c.en,c.mr));
    b.innerHTML=c.n+'<small>'+T(c.en,c.mr)+'</small>';
    b.addEventListener('click',function(){pick(c.n);});
    p.appendChild(b);
  });
}
function pick(n){picked=n;renderPalette();setMsg(function(){return T('Now tap a shape to paint it '+col(n).en.toLowerCase()+'.','आता '+col(n).mr+' रंगवण्यासाठी एका आकारावर टॅप करा.');});}
function setMsg(fn){lastMsg=fn;$('status').textContent=fn();}
function refreshLabels(){
  REGIONS.forEach(function(r){
    var c=col(r.code);
    r.el.setAttribute('aria-label',T(r.en,r.mr)+(mode==='guided'?', '+T('number ','क्रमांक ')+r.code:'')+(painted[r.id]?', '+T('painted ','रंगवलेलं ')+T(col(painted[r.id]).en,col(painted[r.id]).mr):', '+T('not painted yet','अजून रंगवलेलं नाही')));
  });
  scene.setAttribute('aria-label',T('Colour by number picture: a house under the moon','क्रमांकानुसार रंगवायचं चित्र: चंद्राखालचं घर'));
  $('legend').innerHTML=COLORS.map(function(c){return '<span><i></i>'+c.n+' = '+T(c.en,c.mr)+'</span>';}).join('');
}
function paint(r){
  if(picked===null){setMsg(function(){return T('Pick a colour first. Try number '+r.code+'.','आधी रंग निवडा. क्रमांक '+r.code+' वापरून पहा.');});return;}
  if(mode==='guided'&&picked!==r.code){
    var need=col(r.code);
    r.el.classList.remove('nope');void r.el.getBoundingClientRect();r.el.classList.add('nope');
    setMsg(function(){return T('Almost! The '+r.en.toLowerCase()+(r.pl?' are':' is')+' number '+r.code+'. Try '+need.en.toLowerCase()+'.',r.mr+' चा क्रमांक '+r.code+' आहे, जवळपास! '+need.mr+' रंग वापरून पहा.');});
    return;
  }
  painted[r.id]=picked;
  var c=col(picked);
  r.el.querySelectorAll('.shape').forEach(function(s){s.setAttribute('fill',c.hex);});
  r.el.querySelectorAll('.num').forEach(function(t){t.setAttribute('fill',lum(c.hex)<0.55?'#fff':'#2E2440');});
  r.el.classList.add('done');
  setMsg(function(){return T('Lovely! The '+r.en.toLowerCase()+(r.pl?' are':' is')+' painted.','छान! '+r.mr+' रंगवलं.');});
  refreshLabels();update();
}
function update(){
  var done=Object.keys(painted).length,total=REGIONS.length;
  $('bar').style.width=(done/total*100)+'%';
  var win=$('win');
  if(done===total){
    win.textContent=T('You painted the whole moonberry night! Goodnight, little moon.','तुम्ही संपूर्ण मूनबेरी रात्र रंगवली! शुभ रात्री, छोट्या चंद्रा.');
    win.classList.add('show');
  }else win.classList.remove('show');
}
function updateStatus(){
  var done=Object.keys(painted).length,total=REGIONS.length;
  if(!lastMsg){$('status').textContent=T('Pick a colour to begin. '+done+' of '+total+' shapes painted.','सुरू करण्यासाठी रंग निवडा. '+total+' पैकी '+done+' आकार रंगवले.');}
  else $('status').textContent=lastMsg();
  update();
}
function reset(){
  painted={};lastMsg=null;
  REGIONS.forEach(function(r){r.el.classList.remove('done');r.el.querySelectorAll('.shape').forEach(function(s){s.setAttribute('fill','#FFFBF2');});r.el.querySelectorAll('.num').forEach(function(t){t.setAttribute('fill','#2E2440');});});
  refreshLabels();update();updateStatus();
}
function setMode(m){
  mode=m;scene.classList.toggle('free',m==='free');
  $('modeGuided').setAttribute('aria-pressed',m==='guided');$('modeFree').setAttribute('aria-pressed',m==='free');
  reset();
  setMsg(function(){return m==='free'?T('Free paint: any colour, any shape. Make it yours.','मुक्त रंगकाम: कोणताही रंग, कोणताही आकार. तुमच्या मनासारखं करा.'):T('Pick a colour to begin.','सुरू करण्यासाठी रंग निवडा.');});
}
$('modeGuided').addEventListener('click',function(){setMode('guided');});
$('modeFree').addEventListener('click',function(){setMode('free');});
$('resetBtn').addEventListener('click',reset);
$('printBtn').addEventListener('click',function(){document.body.classList.add('print-activity');window.print();});
window.addEventListener('afterprint',function(){document.body.classList.remove('print-activity');});
document.addEventListener('keydown',function(e){
  if(e.target.matches&&e.target.matches('input,textarea'))return;
  if(e.key>='1'&&e.key<='6'&&!e.ctrlKey&&!e.metaKey&&!e.altKey)pick(+e.key);
});


buildScene();renderPalette();refreshLabels();update();
hooks.push(function(){renderPalette();updateStatus();refreshLabels();});
}

if($('rituals')){
/* ---------- rituals ---------- */
var RITUALS=[
  {m:15,en:'Colour for calm',mr:'शांततेसाठी रंगकाम',de:'One page, no goal. Soft music, a warm drink, your favourite pencils.',dm:'एक पान, कोणतंही ध्येय नाही. हळू संगीत, गरम पेय आणि तुमच्या आवडत्या पेन्सिली.'},
  {m:10,en:'Journal one page',mr:'एक पान लिहा',de:'Three lines: what happened, what you felt, what you are grateful for.',dm:'तीन ओळी: काय घडलं, काय वाटलं, कशाबद्दल आभारी आहात.'},
  {m:15,en:'Write a postcard',mr:'पोस्टकार्ड लिहा',de:'Pick someone you miss. Write four warm sentences. Actually post it.',dm:'ज्यांची आठवण येते अशी एक व्यक्ती निवडा. चार प्रेमळ वाक्यं लिहा. आणि खरंच पोस्ट करा.'},
  {m:10,en:'Doodle your day',mr:'आपला दिवस काढा',de:'Draw today as five tiny pictures. Stick figures are welcome.',dm:'आजचा दिवस पाच छोट्या चित्रांत काढा. काडीची माणसंही चालतील.'},
  {m:20,en:'Tell a story aloud',mr:'गोष्ट सांगा',de:'Retell a story you grew up with, to a child, a friend or the mirror.',dm:'तुम्ही ऐकत मोठे झालात ती गोष्ट एखाद्या मुलाला, मित्राला किंवा आरशाला सांगा.'}
];
var pickedRitual=-1;
function renderRituals(){
  var w=$('rituals');w.innerHTML='';
  RITUALS.forEach(function(r,i){
    var d=document.createElement('div');d.className='ritual'+(i===pickedRitual?' pick':'');
    d.innerHTML='<span class="min">'+r.m+' '+T('min','मि.')+'</span><h3>'+T(r.en,r.mr)+'</h3><p>'+T(r.de,r.dm)+'</p>';
    w.appendChild(d);
  });
  if(pickedRitual>=0)$('pickMsg').textContent=T('Tonight: '+RITUALS[pickedRitual].en+'. Go on, set a timer and begin.','आज रात्री: '+RITUALS[pickedRitual].mr+'. चला, घड्याळ लावा आणि सुरू करा.');
}
$('pickBtn').addEventListener('click',function(){
  var n;do{n=Math.floor(Math.random()*RITUALS.length);}while(n===pickedRitual&&RITUALS.length>1);
  pickedRitual=n;renderRituals();
});


hooks.push(renderRituals);
}

if($('week')){
/* ---------- screen-free week ---------- */
var DAYS=[
  {en:'Monday',mr:'सोमवार',ae:'Colour one page together',am:'एक पान एकत्र रंगवा'},
  {en:'Tuesday',mr:'मंगळवार',ae:'Write a postcard to someone far away',am:'दूरच्या कुणाला पोस्टकार्ड लिहा'},
  {en:'Wednesday',mr:'बुधवार',ae:'Draw your day, then tell its story',am:'आपला दिवस काढा आणि त्याची गोष्ट सांगा'},
  {en:'Thursday',mr:'गुरुवार',ae:'Read aloud for 15 minutes',am:'१५ मिनिटं मोठ्याने वाचा'},
  {en:'Friday',mr:'शुक्रवार',ae:'After-dinner walk: spot 5 colours',am:'जेवणानंतर फेरफटका: ५ रंग शोधा'},
  {en:'Saturday',mr:'शनिवार',ae:'Make something with your hands',am:'हातांनी काहीतरी बनवा'},
  {en:'Sunday',mr:'रविवार',ae:'Family story night',am:'कुटुंबाची गोष्टरात्र'}
];
var week;try{week=JSON.parse(store('mb_week')||'null');}catch(e){week=null;}
if(!Array.isArray(week)||week.length!==7)week=[0,0,0,0,0,0,0];
function renderWeek(){
  var ul=$('week');ul.innerHTML='';
  DAYS.forEach(function(d,i){
    var li=document.createElement('li');
    var lab=document.createElement('label');lab.className='day';
    var cb=document.createElement('input');cb.type='checkbox';cb.checked=!!week[i];
    cb.addEventListener('change',function(){week[i]=cb.checked?1:0;store('mb_week',JSON.stringify(week));weekStatus();});
    var tx=document.createElement('div');tx.innerHTML='<b>'+T(d.en,d.mr)+'</b><span>'+T(d.ae,d.am)+'</span>';
    lab.appendChild(cb);lab.appendChild(tx);li.appendChild(lab);ul.appendChild(li);
  });
  weekStatus();
}
function weekStatus(){
  var n=week.reduce(function(a,b){return a+b;},0);
  $('weekBar').style.width=(n/7*100)+'%';
  $('weekCount').textContent=T(n+' of 7 evenings screen-free',n+' / ७ संध्याकाळी स्क्रीनशिवाय');
  var m=[
    T('Start with just one. One is plenty.','फक्त एकापासून सुरू करा. एकही पुरे.'),
    T('One evening down. That is how habits begin.','एक संध्याकाळ झाली. सवयी अशाच सुरू होतात.'),
    T('Two evenings. Your child will remember these.','दोन संध्याकाळी. तुमच्या मुलाला या आठवतील.'),
    T('Three. You are building something lovely.','तीन. तुम्ही काहीतरी सुंदर घडवताय.'),
    T('Four! Over halfway there.','चार! अर्ध्याहून जास्त झालं.'),
    T('Five evenings. Look at you both.','पाच संध्याकाळी. तुम्हा दोघांचं कौतुक.'),
    T('Six. So close, and already a win.','सहा. अगदी जवळ, आणि हे आधीच यश आहे.'),
    T('A whole screen-free week! Be proud, then do it again.','संपूर्ण स्क्रीनशिवायचा आठवडा! अभिमान बाळगा, मग पुन्हा करा.')
  ];
  $('weekMsg').textContent=m[n];
}
$('weekReset').addEventListener('click',function(){week=[0,0,0,0,0,0,0];store('mb_week',JSON.stringify(week));renderWeek();});


hooks.push(renderWeek);
}

/* ---------- notify ---------- */
if($('notifyForm'))$('notifyForm').addEventListener('submit',function(e){
  e.preventDefault();var v=$('email').value.trim();if(!v)return;
  location.href='mailto:hello@themoonberryhouse.com?subject='+encodeURIComponent('Notify me when Moonberry House opens')+'&body='+encodeURIComponent('Please add this email to the list: '+v);
});
if($('yr'))$('yr').textContent=new Date().getFullYear();

/* ---------- init ---------- */
var MARATHI_ENABLED=false;   // set to true (and delete the .langtoggle rule in site.css) to bring Marathi back
var saved=store('mb_lang');
if(MARATHI_ENABLED&&saved==='mr')setLang('mr');else{if(saved==='mr')store('mb_lang','en');runHooks();}
})();
