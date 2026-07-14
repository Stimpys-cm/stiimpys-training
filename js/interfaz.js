/**
 * ============================================================
 *  interfaz.js — Componentes visuales genericos
 * ============================================================
 *  Dialogos, sheet/overlay, toast, confetti, popup de logros,
 *  calculadora de discos e iconos estaticos.
 * ============================================================
 */

function showDialog(opts){
  return new Promise(resolve=>{
    const pop=document.getElementById("dlgPop");
    const ic=document.getElementById("dlgIc");
    const title=document.getElementById("dlgTitle");
    const msg=document.getElementById("dlgMsg");
    const btns=document.getElementById("dlgBtns");
    if(opts.icon){ic.style.display="grid";ic.innerHTML=ICON(opts.icon,26);ic.className="dlg-ic"+(opts.danger?" danger":"")}
    else ic.style.display="none";
    title.textContent=opts.title||"";
    title.style.display=opts.title?"block":"none";
    msg.textContent=opts.msg||"";
    btns.innerHTML="";
    const hasCancel=opts.cancelText!==null;
    if(hasCancel){
      const c=document.createElement("button");
      c.className="dlg-btn ghost";c.textContent=opts.cancelText||"Cancelar";
      c.onclick=()=>{close();resolve(false)};
      btns.appendChild(c);
    }
    const ok=document.createElement("button");
    ok.className="dlg-btn"+(opts.danger?" danger":"");
    ok.textContent=opts.confirmText||"Aceptar";
    ok.onclick=()=>{close();resolve(true)};
    btns.appendChild(ok);
    function close(){pop.classList.remove("show")}
    pop.onclick=e=>{if(e.target.id==="dlgPop"){close();resolve(false)}};
    pop.classList.add("show");
    if(navigator.vibrate)navigator.vibrate(15);
  });
}
// Atajos
function confirmDlg(msg,opts={}){return showDialog({msg,confirmText:opts.confirmText||"Confirmar",cancelText:opts.cancelText||"Cancelar",...opts})}
function alertDlg(msg,opts={}){return showDialog({msg,confirmText:"Entendido",cancelText:null,...opts})}

const overlay=document.getElementById("overlay"),sheet=document.getElementById("sheet"),
  sheetTitle=document.getElementById("sheetTitle"),sheetBody=document.getElementById("sheetBody");
function openSheet(){overlay.classList.add("show");sheet.classList.add("show")}
function openMenu(){openSheet();showMenu()}
function closeSheet(){overlay.classList.remove("show");sheet.classList.remove("show")}

function flashMsg(txt){
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}
  t.textContent=txt;t.classList.add("show");
  clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),1900);
}


function lanzarConfetti(){
  const cv=document.getElementById("confetti");
  cv.width=innerWidth;cv.height=innerHeight;
  cv.classList.add("show");
  const ctx=cv.getContext("2d");
  const colors=["#2b5cff","#4db8ff","#ffcc4d","#00d09c","#ff5470","#fff"];
  const N=140;
  const parts=Array.from({length:N},()=>({
    x:innerWidth/2+(Math.random()-.5)*120,
    y:innerHeight/2-40,
    vx:(Math.random()-.5)*14,
    vy:Math.random()*-14-4,
    g:.35+Math.random()*.2,
    s:6+Math.random()*7,
    rot:Math.random()*6.28,
    vr:(Math.random()-.5)*.4,
    c:colors[Math.floor(Math.random()*colors.length)],
    life:1
  }));
  let frame=0;
  function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    let alive=false;
    parts.forEach(p=>{
      p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.vx*=.99;
      if(p.y<cv.height+20){alive=true}
      if(frame>60)p.life-=.02;
      ctx.save();ctx.globalAlpha=Math.max(0,p.life);
      ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);
      ctx.restore();
    });
    frame++;
    if(alive&&frame<160)requestAnimationFrame(draw);
    else{ctx.clearRect(0,0,cv.width,cv.height);cv.classList.remove("show")}
  }
  draw();
  if(navigator.vibrate)navigator.vibrate([30,40,30,40,60]);
}
function mostrarLogro(l,extra){
  if(!l)return;
  const rar=RAREZAS[l.r||1];
  const card=document.querySelector("#logroPop .logro-card");
  if(card)card.style.setProperty("--rc",rar.c);
  const ic=document.getElementById("logroIc");
  ic.innerHTML=ICON(l.ic,40);
  ic.style.background=rar.c;
  ic.style.color="#0a0a0c";
  document.getElementById("logroName").innerHTML=
    `<span class="logro-rar" style="background:${rar.c}22;color:${rar.c}">${rar.n}</span><br>`+
    l.n+(extra>1?"  +"+(extra-1)+" más":"");
  document.getElementById("logroDesc").textContent=l.d;
  document.getElementById("logroPop").classList.add("show");
  lanzarConfetti();
  // los logros raros suenan más épico
  if((l.r||1)>=4){soundPR();setTimeout(soundPR,300)}else soundPR();
}
document.getElementById("logroBtn").onclick=()=>document.getElementById("logroPop").classList.remove("show");
document.getElementById("logroPop").onclick=e=>{if(e.target.id==="logroPop")document.getElementById("logroPop").classList.remove("show")};

const PLATES={lb:[45,35,25,10,5,2.5],kg:[25,20,15,10,5,2.5,1.25]};
const BARS={lb:[45,35,15,0],kg:[20,15,10,0]};
let plateUnit="lb",plateBar=45;
function openPlate(preset){
  document.getElementById("platePop").classList.add("show");
  document.body.style.overflow="hidden";
  if(preset)document.getElementById("plateWeight").value=preset;
  renderPlateBars();
  calcPlates();
}
function closePlate(){document.getElementById("platePop").classList.remove("show");document.body.style.overflow=""}
function renderPlateBars(){
  const el=document.getElementById("plateBars");
  el.innerHTML=BARS[plateUnit].map(b=>`<button class="pbar${b===plateBar?" active":""}" data-b="${b}">${b===0?"Sin barra":b+" "+plateUnit}</button>`).join("");
  el.querySelectorAll(".pbar").forEach(btn=>btn.onclick=()=>{plateBar=parseFloat(btn.dataset.b);renderPlateBars();calcPlates()});
}
function calcPlates(){
  const total=parseFloat(document.getElementById("plateWeight").value)||0;
  const viz=document.getElementById("plateViz"),res=document.getElementById("plateResult");
  if(total<=0){viz.innerHTML="";res.innerHTML=`<div class="plate-hint">Escribe el peso total que quieres levantar.</div>`;return}
  if(total<plateBar){viz.innerHTML="";res.innerHTML=`<div class="plate-hint">El peso total es menor que la barra (${plateBar} ${plateUnit}).</div>`;return}
  let perSide=(total-plateBar)/2;
  const plates=PLATES[plateUnit];
  const result=[];let rem=perSide;
  plates.forEach(pl=>{while(rem>=pl-1e-9){result.push(pl);rem=Math.round((rem-pl)*100)/100}});
  const leftover=Math.round(rem*100)/100;
  // visualización de la barra
  const colors={45:"#2b5cff",35:"#e24b4a",25:"#00d09c",20:"#2b5cff",15:"#ffcc4d",10:"#4db8ff",5:"#e24b4a",2.5:"#8b8f9c",1.25:"#8b8f9c"};
  let bars=`<div class="pv-bar"><div class="pv-rod"></div>`;
  result.forEach(pl=>{const h=40+pl/(plateUnit==="lb"?45:25)*70;
    bars+=`<div class="pv-plate" style="height:${h}px;background:${colors[pl]||"#8b8f9c"}"><span>${pl}</span></div>`});
  bars+=`<div class="pv-collar"></div></div>`;
  viz.innerHTML=bars;
  // resumen textual
  const counts={};result.forEach(p=>counts[p]=(counts[p]||0)+1);
  const summary=Object.entries(counts).map(([p,c])=>`${c}×${p}`).join(" + ")||"nada";
  res.innerHTML=`<div class="plate-perside">Por cada lado: <b>${perSide} ${plateUnit}</b></div>
    <div class="plate-list">${summary}</div>
    ${leftover>0?`<div class="plate-warn">${ICON('warn',14)} No se puede armar exacto con los discos estándar. Sobran ${leftover} ${plateUnit} por lado.</div>`:""}`;
}

function paintStaticIcons(){
  document.querySelectorAll('[data-ico]').forEach(el=>{el.innerHTML=ICON(el.dataset.ico);});
  document.getElementById('openOpts').innerHTML=ICON('gear',20);
  document.getElementById('closeSheet').innerHTML=ICON('close',18);
  document.getElementById('tClose').innerHTML=ICON('close',15);
  document.getElementById('ssClose').innerHTML=ICON('close',20);
  document.getElementById('plateClose').innerHTML=ICON('close',18);
  document.getElementById('calBack').innerHTML=ICON('close',18);
  document.getElementById('openCal').innerHTML=ICON('calendar',19);
  document.getElementById('rutClose').innerHTML=ICON('close',18);
  document.getElementById('ejPickClose').innerHTML=ICON('close',18);
  document.getElementById('pfBack').innerHTML=ICON('close',18);
  document.getElementById('pfEdit').innerHTML=ICON('edit',17);
  document.getElementById('pfeClose').innerHTML=ICON('close',18);
}

function escapeHtml(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML.replace(/\n/g,"<br>")}

