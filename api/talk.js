<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
<title>WHOAI Gem</title>
<style>
  html,body{margin:0;height:100%;overflow:hidden;background:#000;color:#fff;
    font-family:system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans JP',sans-serif;
    touch-action:none; overscroll-behavior:none}

  .bg{position:fixed;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .7s}
  .bg.show{opacity:1}

  #whoaiWrap{position:fixed;left:5vw;bottom:12vh;z-index:5;touch-action:none;display:none}
  #whoai{width:clamp(82px,12vw,140px);user-select:none;animation:hop 2s infinite}
  @keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  .bubble{position:absolute;left:50%;bottom:100%;transform:translate(-50%,-8px);
          background:#fff;color:#111;border-radius:10px;padding:4px 8px;font-size:14px;
          box-shadow:0 2px 6px rgba(0,0,0,.25);opacity:0;transition:.18s}
  .bubble.show{opacity:1;transform:translate(-50%,-12px)}

  #bucket{position:fixed;right:2vw;bottom:7vh;z-index:4;width:clamp(74px,14vw,160px)}
  #bucket img{width:100%;display:block}
  #counter{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
           background:#fff;color:#111;border-radius:999px;padding:4px 8px;font-weight:600;pointer-events:none}

  #sand{position:fixed;inset:0;z-index:2;touch-action:none}
  .shell{position:fixed;z-index:3;width:clamp(48px,6vw,72px);height:clamp(48px,6vw,72px);
         transform:translate(-50%,-50%) scale(.92);
         background-size:contain;background-repeat:no-repeat;background-position:center;
         cursor:grab;touch-action:none;opacity:0;transition:opacity .18s, transform .18s}
  .shell.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
  .shell.drag{opacity:.95;transform:translate(-50%,-50%) scale(1.03)}

  #toast{position:fixed;left:10px;top:10px;z-index:10;background:rgba(0,0,0,.6);padding:6px 12px;border-radius:8px}
  .ui{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);display:flex;gap:8px;z-index:10}
  .ui button{padding:6px 12px;border:none;border-radius:10px;cursor:pointer}

  .panel{position:fixed;inset:0;z-index:12;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center}
  .panel.show{display:flex}
  .card{background:#fff;color:#111;border-radius:14px;padding:16px;width:min(92svw,980px);max-height:80svh;overflow:auto}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}
  .choice{border:1px solid #eee;border-radius:12px;padding:8px;text-align:center;cursor:pointer;transition:transform .12s}
  .choice:hover{transform:translateY(-2px)}
  .choice img{max-width:100%;height:auto;display:block;margin:0 auto 6px}
  .close{margin-top:10px;padding:6px 12px;border:none;border-radius:8px;cursor:pointer}

  .row{display:flex;gap:16px;flex-wrap:wrap}
  .pill{display:inline-block;background:#222;border:1px solid #444;border-radius:999px;padding:6px 10px;margin:4px 4px 0 0}
  #chatBox{display:flex;flex-direction:column;gap:8px;margin-top:8px}
  #chatLog{background:#0b1224;color:#e6ecff;border:1px solid #2b3a6b;border-radius:10px;padding:10px;min-height:140px;max-height:50svh;overflow:auto}
  .msg{margin:6px 0}
  .msg.me{color:#b7f}
  .msg.ai{color:#9fe}
  #chatCtrl{display:flex;gap:8px}
  #chatInput{flex:1;padding:8px;border-radius:8px;border:1px solid #ddd}
</style>
</head>
<body>
  <div id="bg-sunrise" class="bg" style="background-image:url('./public/bg/sunrise.jpg')"></div>
  <div id="bg-beach"   class="bg" style="background-image:url('./public/bg/beach_day.jpg')"></div>
  <div id="bg-night"   class="bg" style="background-image:url('./public/bg/night_beach.jpg')"></div>

  <div id="whoaiWrap">
    <img id="whoai" src="./assets/stage1/green_open.png" alt="whoai">
    <div id="bubble" class="bubble">やったね！</div>
  </div>

  <div id="bucket">
    <img id="bucketImg" src="./public/bucket.png.png" alt="bucket">
    <div id="counter">0</div>
  </div>

  <canvas id="sand"></canvas>

  <div id="toast"></div>
  <div class="ui">
    <button id="btnStart">スタート</button>
    <button id="btnBegin">はじめに</button>
    <button id="btnNight">夜へ</button>
  </div>

  <div id="charPanel" class="panel">
    <div class="card">
      <h2 style="margin-top:0">キャラを選んでね</h2>
      <div id="charGrid" class="grid"></div>
      <button class="close" onclick="closeCharPanel()">閉じる</button>
    </div>
  </div>

  <div id="nightPanel" class="panel">
    <div class="card">
      <h2 style="margin-top:0">また明日</h2>
      <p>今日のコレクションは保存しました。夜空を見ながら、話そうか。</p>
      <div class="row">
        <div style="flex:1;min-width:260px">
          <h3>今日のまとめ</h3>
          <div id="daySummary" class="row"></div>
          <div style="margin-top:10px">
            <button id="btnExport" class="close">JSONを書き出す</button>
          </div>
        </div>
        <div style="flex:1.2;min-width:300px">
          <h3>会話</h3>
          <div id="chatBox">
            <div id="chatLog"></div>
            <div id="chatCtrl">
              <input id="chatInput" type="text" placeholder="夜空を見ながら、何を話そう？">
              <button id="chatSend" class="close">送信</button>
            </div>
            <small style="opacity:.8">API設定は <code>api/talk.js</code> と <code>window.WHOAI_API</code> を参照します。</small>
          </div>
        </div>
      </div>
      <div style="text-align:right;margin-top:8px">
        <button class="close" onclick="closeNight()">閉じる</button>
      </div>
    </div>
  </div>

<script>
const toast = document.getElementById('toast');
const say = (s)=>toast.textContent=s;
const bg = {
  sunrise: document.getElementById('bg-sunrise'),
  beach  : document.getElementById('bg-beach'),
  night  : document.getElementById('bg-night')
};
let currentScene='sunrise';
function scene(name){ Object.values(bg).forEach(e=>e.classList.remove('show')); bg[name].classList.add('show'); currentScene=name; }

/* WHOAI & 吹き出し */
const whoaiWrap = document.getElementById('whoaiWrap');
const whoai     = document.getElementById('whoai');
const bubble    = document.getElementById('bubble');
function showBubble(text){ bubble.textContent=text; bubble.classList.add('show'); setTimeout(()=>bubble.classList.remove('show'),900); }

/* バケツ */
const bucket  = document.getElementById('bucket');
const counter = document.getElementById('counter');
let count=0;

/* 砂キャンバス（深さあり） */
const sand = document.getElementById('sand');
const ctx  = sand.getContext('2d',{willReadFrequently:true});
const TILE=90, BRUSH=28;
let depth={}, brushed={};

function resizeSand(){
  sand.width = innerWidth; sand.height= innerHeight;
  const g=ctx.createLinearGradient(0,0,0,sand.height);
  g.addColorStop(0,'#E7D9B7'); g.addColorStop(.6,'#D9C79E'); g.addColorStop(1,'#C8B68F');
  ctx.fillStyle=g; ctx.fillRect(0,0,sand.width,sand.height);
}
function initDepth(){
  depth={}; brushed={};
  const cols=Math.ceil(sand.width/TILE), rows=Math.ceil(sand.height/TILE);
  for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
    const p=Math.random(); depth[`${c},${r}`]=(p<.10)?3:(p<.45)?2:1; brushed[`${c},${r}`]=0;
  }
}
function brushAt(x,y){
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath(); ctx.arc(x,y,BRUSH,0,Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation='source-over';
  const c=Math.floor(x/TILE), r=Math.floor(y/TILE), key=`${c},${r}`;
  if(depth[key]===Infinity || depth[key]==null) return;
  if(++brushed[key] >= depth[key]){ depth[key]=Infinity; maybeSpawnNear(x,y); }
}

/* WHOAIドラッグ＝砂を削る */
let wpid=null;
whoaiWrap.addEventListener('pointerdown',e=>{
  e.preventDefault(); wpid=e.pointerId; whoaiWrap.setPointerCapture(wpid);
},{passive:false});
whoaiWrap.addEventListener('pointermove',e=>{
  if(e.pointerId!==wpid) return; e.preventDefault();
  const w=whoaiWrap.offsetWidth, h=whoaiWrap.offsetHeight;
  const x=Math.max(0,Math.min(innerWidth -w, e.clientX - w/2));
  const y=Math.max(0,Math.min(innerHeight-h, e.clientY - h/2));
  whoaiWrap.style.left=x+'px'; whoaiWrap.style.top=y+'px';
  if(currentScene==='beach') brushAt(e.clientX,e.clientY);
},{passive:false});
whoaiWrap.addEventListener('pointerup',()=>{ wpid=null; },{passive:false});
whoaiWrap.addEventListener('pointercancel',()=>{ wpid=null; },{passive:false});

/* コレクション */
const COMMON=['./public/items/asari1.png','./public/items/asari2.png','./public/items/asari3.png'];
const RARE  =['./public/items/aurora_shell.png','./public/items/flame_shell.png','./public/items/luminous_shell.png','./public/items/mystic_shell.png','./public/items/night_sky_shell.png','./public/items/rare_pearl.png','./public/items/rare_rainbow.png','./public/items/wave_shell.png'];
const shells=[]; const MAX_SHELLS=9, MIN_DIST=90, SPAWN_PROB=.32;

const inventory=[];           // {kind, src, at}
const uniqueKinds=new Map();  // kind -> count
function kindFromSrc(src){ const n=src.split('/').pop().replace(/\.(png|jpe?g|webp)$/i,''); return /asari/i.test(n)?'asari':n; }

function tooClose(x,y){ return shells.some(s=>Math.hypot(s.x-x,s.y-y)<MIN_DIST); }
function avoidBucket(x,y){ const b=bucket.getBoundingClientRect(); const cx=b.left+b.width/2, cy=b.top+b.height/2; return Math.hypot(cx-x,cy-y)<120; }
function maybeSpawnNear(x,y){
  if(shells.length>=MAX_SHELLS) return;
  if(Math.random()>SPAWN_PROB) return;
  let px=x+(Math.random()*2-1)*90, py=y+(Math.random()*2-1)*90;
  px=Math.max(50,Math.min(innerWidth -50,px));
  py=Math.max(90,Math.min(innerHeight-90,py));
  if(tooClose(px,py) || avoidBucket(px,py)) return;

  const pool=Math.random()<0.8?COMMON:RARE; const src=pool[Math.floor(Math.random()*pool.length)];
  const el=document.createElement('div'); el.className='shell'; el.style.left=px+'px'; el.style.top=py+'px';
  el.style.backgroundImage=`url(${src})`; el.dataset.src=src; el.dataset.kind=kindFromSrc(src);
  document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('show'));
  enableShellDrag(el); shells.push({el,x:px,y:py});
}
function enableShellDrag(el){
  let pid=null, dx=0, dy=0;
  el.addEventListener('pointerdown',e=>{
    e.preventDefault(); pid=e.pointerId; el.setPointerCapture(pid);
    dx=e.clientX-parseFloat(el.style.left); dy=e.clientY-parseFloat(el.style.top);
    el.classList.add('drag');
  },{passive:false});
  el.addEventListener('pointermove',e=>{
    if(e.pointerId!==pid) return; e.preventDefault();
    el.style.left=(e.clientX-dx)+'px'; el.style.top=(e.clientY-dy)+'px';
  },{passive:false});
  function end(e){
    if(e.pointerId!==pid) return; e.preventDefault();
    el.classList.remove('drag'); el.releasePointerCapture(pid); pid=null;
    const b=bucket.getBoundingClientRect(), s=el.getBoundingClientRect(), pad=18;
    const hit=!(s.right<b.left-pad || s.left>b.right+pad || s.bottom<b.top-pad || s.top>b.bottom+pad);
    if(hit){
      const kind=el.dataset.kind, src=el.dataset.src;
      inventory.push({kind,src,at:Date.now()});
      uniqueKinds.set(kind,(uniqueKinds.get(kind)||0)+1);
      el.remove();
      const i=shells.findIndex(o=>o.el===el); if(i>-1) shells.splice(i,1);
      counter.textContent=++count; showBubble('やったね！');
    }
  }
  el.addEventListener('pointerup',end,{passive:false});
  el.addEventListener('pointercancel',end,{passive:false});
}

/* 指でも砂を削れる */
sand.addEventListener('pointerdown',e=>{ if(currentScene!=='beach')return; e.preventDefault(); brushAt(e.clientX,e.clientY);},{passive:false});
sand.addEventListener('pointermove',e=>{ if(currentScene!=='beach'||e.pressure===0) return; e.preventDefault(); brushAt(e.clientX,e.clientY);},{passive:false});

/* キャラ選択 */
const CHAR_LIST = [
  'blue_closed.png','green_open.png','orange_closed.png','pink_closed.png','purple_closed.png',
  'tane_green.png','tane_pink.png','tane_purple.png','tane_blue.png'
].map(n=>`./assets/stage1/${n}`);
const charPanel=document.getElementById('charPanel');
const charGrid =document.getElementById('charGrid');
function openCharPanel(){
  if(!charGrid.dataset.ready){
    CHAR_LIST.forEach(src=>{
      const div=document.createElement('div'); div.className='choice';
      div.innerHTML=`<img src="${src}" alt=""><div>${src.split('/').pop().replace('.png','')}</div>`;
      div.onclick=()=>{ whoai.src=src; whoaiWrap.style.display='block'; closeCharPanel(); say('いっしょに探そう'); };
      charGrid.appendChild(div);
    });
    charGrid.dataset.ready='1';
  }
  charPanel.classList.add('show');
}
function closeCharPanel(){ charPanel.classList.remove('show'); }

/* 夜：保存＆会話 */
const nightPanel = document.getElementById('nightPanel');
const daySummary = document.getElementById('daySummary');
const btnExport  = document.getElementById('btnExport');
const chatLog    = document.getElementById('chatLog');
const chatInput  = document.getElementById('chatInput');
const chatSend   = document.getElementById('chatSend');

function openNight(){
  const save = {
    date: new Date().toISOString(),
    total: count,
    byKind: Object.fromEntries([...uniqueKinds.entries()]),
    items: inventory.slice(-100)
  };
  const all = JSON.parse(localStorage.getItem('whoaiGemSaves')||'[]'); all.push(save);
  localStorage.setItem('whoaiGemSaves', JSON.stringify(all));
  renderSummary(save);
  addMsg('ai','夜空がきれいですね。今日はどんな一日でしたか？');
  nightPanel.classList.add('show');
}
function closeNight(){ nightPanel.classList.remove('show'); }

function renderSummary(save){
  daySummary.innerHTML = '';
  const pills=[pill(`合計 ${save.total} 個`), ...Object.entries(save.byKind).map(([k,v])=>pill(`${k}: ${v}`))];
  pills.forEach(p=>daySummary.appendChild(p));
}
function pill(text){ const span=document.createElement('span'); span.className='pill'; span.textContent=text; return span; }

btnExport.onclick = ()=>{
  const data = {history: JSON.parse(localStorage.getItem('whoaiGemSaves')||'[]')};
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='whoai_gem_history.json'; a.click();
  URL.revokeObjectURL(a.href);
};

/* 会話 */
function addMsg(role,text){
  const div=document.createElement('div'); div.className='msg ' + (role==='user'?'me':'ai'); div.textContent=text;
  chatLog.appendChild(div); chatLog.scrollTop = chatLog.scrollHeight;
}
chatSend.onclick = async ()=>{
  const text = chatInput.value.trim(); if(!text) return;
  addMsg('user', text); chatInput.value='';
  try{
    const { reply } = await WHOAI_TALK.talk(text, { state:{ totalCollected:count } });
    addMsg('ai', reply);
  }catch(err){
    addMsg('ai','（接続できませんでした）'); console.error(err);
  }
};

/* ボタン */
document.getElementById('btnStart').onclick = ()=>{ openCharPanel(); };
document.getElementById('btnBegin').onclick = ()=>{ scene('beach'); say('砂をやさしくなでてみよう'); resizeSand(); initDepth(); };
document.getElementById('btnNight').onclick = ()=>{ scene('night'); say('また明日'); openNight(); };

/* 初期化 */
function init(){ scene('sunrise'); say('おはよう。朝日がきれいだね'); resizeSand(); }
addEventListener('resize', resizeSand);
init();

/* スクロール抑止（保険） */
function blockScroll(e){ e.preventDefault(); }
addEventListener('touchmove', blockScroll, {passive:false});
addEventListener('wheel',      blockScroll, {passive:false});
</script>

<script src="./api/talk.js"></script>
</body>
</html>
