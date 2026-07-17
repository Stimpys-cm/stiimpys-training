/**
 * sesion-guiada.js — Timer y sesión guiada
 */
const TIMER_KEY="stimpys_timer";
let timerInt=null,timerTotal=180;
const timerEl=document.getElementById("timer"),tTime=document.getElementById("tTime"),tFill=document.getElementById("tFill");
function fmtT(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}

/* ============ SONIDO (Web Audio, sin archivos, offline) ============ */

function startTimer(sec){
  const dur=Math.max(180,sec||180); // mínimo 3:00
  timerTotal=dur;
  const endAt=Date.now()+dur*1000;
  localStorage.setItem(TIMER_KEY,JSON.stringify({endAt,total:dur}));
  runTimer();
}
function runTimer(){
  clearInterval(timerInt);
  let saved;try{saved=JSON.parse(localStorage.getItem(TIMER_KEY))}catch(e){saved=null}
  if(!saved){timerEl.classList.remove("show");return}
  timerTotal=saved.total||180;
  timerEl.classList.add("show");
  tickTimer();
  timerInt=setInterval(tickTimer,250);
}
function tickTimer(){
  let saved;try{saved=JSON.parse(localStorage.getItem(TIMER_KEY))}catch(e){saved=null}
  if(!saved){clearInterval(timerInt);timerEl.classList.remove("show");return}
  const left=(saved.endAt-Date.now())/1000;
  if(left<=0){
    clearInterval(timerInt);
    tTime.textContent="¡Listo!";tFill.style.width="0%";
    timerEl.classList.add("done");
    soundRestDone();
    if(navigator.vibrate)navigator.vibrate([120,80,120,80,200]);
    localStorage.removeItem(TIMER_KEY);
    setTimeout(()=>{timerEl.classList.remove("show","done")},2400);
    return;
  }
  tTime.textContent=fmtT(left);
  tFill.style.width=(left/timerTotal*100)+"%";
}
function addTimer(sec){
  let saved;try{saved=JSON.parse(localStorage.getItem(TIMER_KEY))}catch(e){saved=null}
  if(!saved)return;
  saved.endAt+=sec*1000;saved.total=Math.max(saved.total,(saved.endAt-Date.now())/1000);
  localStorage.setItem(TIMER_KEY,JSON.stringify(saved));
  tickTimer();
}
function stopTimer(){clearInterval(timerInt);localStorage.removeItem(TIMER_KEY);timerEl.classList.remove("show")}
document.getElementById("tAdd").onclick=()=>addTimer(30);
document.getElementById("tClose").onclick=stopTimer;
// Al volver a la app / recargar, retomar el timer si seguía corriendo
document.addEventListener("visibilitychange",()=>{if(!document.hidden)runTimer()});
runTimer();

let ssState=null;
let ssTimerStart=null;
const SSPOS_KEY="stimpys_ss_pos";
function getSSPos(){try{const o=JSON.parse(localStorage.getItem(SSPOS_KEY));
  return (o&&o.date===nowStamp().iso)?o.cur:null}catch(e){return null}}
function setSSPos(cur){localStorage.setItem(SSPOS_KEY,JSON.stringify({date:nowStamp().iso,cur}))}

function startGuidedSession(day){
  const sem=rutinaSemana();
  const exs=((sem[day]&&sem[day].ex)||[]).map((ex,i)=>({...ex,id:exId(ex),idx:i}));
  if(!exs.length)return;
  // 1) retomar exactamente donde lo dejaste hoy
  let start=getSSPos();
  if(start===null||start<0||start>=exs.length){
    // 2) si es la primera vez: primer ejercicio sin registrar
    const drafts=getDrafts();
    const {iso}=nowStamp();
    start=0;
    for(let i=0;i<exs.length;i++){
      const id=exs[i].id;
      const g=!!registroDe(id,day,iso);
      const d=(drafts[draftKey(id,day)]||[]).filter(s=>s.w!==""||s.r!=="");
      if(!g&&!d.length){start=i;break}
      if(i===exs.length-1)start=i;
    }
  }
  ssState={day,exs,cur:start};
  if(!ssTimerStart)ssTimerStart=Date.now();
  document.getElementById("session").classList.add("show");
  document.body.style.overflow="hidden";
  renderSession();
}
function closeSession(){
  document.getElementById("session").classList.remove("show");
  document.body.style.overflow="";
  ssState=null;
  renderEntreno(); // reflejar todo lo escrito en la vista normal
}

/* Carga el draft de un ejercicio (misma fuente que la vista normal) */
function ssDraft(id,ex){
  const drafts=getDrafts();
  const {iso}=nowStamp();
  const dia=ssState?ssState.day:activeDay;
  const dk=draftKey(id,dia);
  const hoy=registroDe(id,dia,iso);
  if(drafts[dk]&&drafts[dk].length)return drafts[dk].map(s=>({w:s.w||"",r:s.r||"",rpe:s.rpe||""}));
  if(hoy&&hoy.sets&&hoy.sets.length)return hoy.sets.map(s=>({w:s.w||"",r:s.r||"",rpe:s.rpe||""}));
  const n=parseInt(ex.s)||3;
  return Array.from({length:n},()=>({w:"",r:"",rpe:""}));
}

function renderSession(){
  if(!ssState)return;
  const {exs,cur}=ssState;
  setSSPos(cur);  // recordar dónde vamos
  const ex=exs[cur];
  const id=ex.id;
  const total=exs.length;
  const T=tipoEjercicio(ex);
  const {iso}=nowStamp();

  // progreso general
  document.getElementById("ssFill").style.width=(cur/total*100)+"%";
  document.getElementById("ssCount").textContent=`${cur+1} / ${total}`;

  const draft=ssDraft(id,ex);
  function persist(){
    setDraft(draftKey(id,ssState.day),draft.map(s=>({w:s.w,r:s.r,rpe:s.rpe})));
    updSSHeader();
  }
  function updSSHeader(){
    // contador de series completas
    const hechas=draft.filter((s,i)=>isSetDone(id,i)).length;
    const el=document.getElementById("ssSetCount");
    if(el)el.textContent=`${hechas} / ${draft.length} series`;
    const bar=document.getElementById("ssSetFill");
    if(bar)bar.style.width=(draft.length?hechas/draft.length*100:0)+"%";
    // 1RM
    const rm=document.getElementById("ss1rm");
    if(rm){
      if(T.sinPeso)rm.textContent="";
      else{const b=Math.max(0,...draft.map(s=>epley(s.w,s.r)));rm.textContent=b?"1RM estimado: "+b+" lb":""}
    }
  }

  const body=document.getElementById("ssBody");
  const best=bestSetTxt(id);
  const isSkip=getSkipped().includes(id);

  body.innerHTML=`
    <div class="ss-jump" id="ssJump"></div>
    <div class="ss-exname">${ex.n}</div>
    <div class="ss-scheme">${ex.s} · ${(rutinaSemana()[ssState.day]||{}).label||""}</div>
    ${best?`<div class="ex-best">${ICON('trophy2',12)} Mejor: <b>${best}</b></div>`:""}
    <div class="ss-setbar"><div class="ss-setbar-fill" id="ssSetFill"></div></div>
    <div class="ss-setcount" id="ssSetCount"></div>
    <div class="ss-rest-hint">${ICON('clock',12)} Descanso sugerido: ${fmtT(restFor(ex))}</div>
    <div class="ss-sets" id="ssSets"></div>
    <div class="ss-actions">
      <button class="ss-mini" id="ssAddSet">${ICON('plus',15)} Serie</button>
      <button class="ss-mini" id="ssCopySet">${ICON('copy',15)} Copiar</button>
      ${T.sinPeso?"":`<button class="ss-mini" id="ssPlate">${ICON('calc',15)} Discos</button>`}
      <button class="ss-mini save" id="ssSave">${ICON('save',15)} Guardar</button>
    </div>
    <div class="ss-1rm" id="ss1rm"></div>
    <div class="ex-note">
      <label>${ICON('list',12)} Nota</label>
      <textarea id="ssNota" placeholder="Ej: me molestó el hombro..." rows="2">${getNota(id)||""}</textarea>
    </div>
    <button class="btn-skip${isSkip?" undone":""}" id="ssSkip">
      ${isSkip?`${ICON('check',14)} Ejercicio saltado (deshacer)`:`${ICON('close',14)} Saltar este ejercicio`}
    </button>
    <div class="ss-nav">
      ${cur>0?`<button class="ss-btn ghost" id="ssPrev">${ICON('arrowLeft',16)}</button>`:`<span style="flex:0 0 auto;width:0"></span>`}
      ${cur<total-1
        ? `<button class="ss-btn" id="ssNext">Siguiente ${ICON('arrowRight',16)}</button>`
        : `<button class="ss-btn finish" id="ssFinish">${ICON('check2',16)} Terminar sesión</button>`}
    </div>`;

  // índice para saltar entre ejercicios
  const jump=document.getElementById("ssJump");
  exs.forEach((e,i)=>{
    const g=!!registroDe(e.id,ssState.day,iso);
    const d=(getDrafts()[draftKey(e.id,ssState.day)]||[]).filter(s=>s.w!==""||s.r!=="");
    const sk=getSkipped().includes(e.id);
    const b=document.createElement("button");
    b.className="ss-dot"+(i===cur?" cur":"")+(sk?" skip":(g||d.length?" done":""));
    b.textContent=i+1;
    b.title=e.n;
    b.onclick=()=>{ssState.cur=i;renderSession()};
    jump.appendChild(b);
  });

  // series con el motor unificado
  const setsWrap=document.getElementById("ssSets");
  function paintSets(){
    setsWrap.innerHTML="";
    draft.forEach((set,idx)=>{
      setsWrap.appendChild(buildSetRow({
        id,ex,set,idx,draft,compact:true,
        onChange:persist,
        onDelete:i=>{draft.splice(i,1);shiftDoneSets(id,i);persist();paintSets()}
      }));
    });
    updSSHeader();
  }
  paintSets();

  document.getElementById("ssAddSet").onclick=()=>{draft.push({w:"",r:"",rpe:""});persist();paintSets()};
  document.getElementById("ssCopySet").onclick=()=>{
    const last=draft[draft.length-1];
    draft.push(last?{w:last.w,r:last.r,rpe:last.rpe}:{w:"",r:"",rpe:""});
    persist();paintSets();
    if(navigator.vibrate)navigator.vibrate(15);
  };
  const pl=document.getElementById("ssPlate");
  if(pl)pl.onclick=()=>{const last=draft.filter(s=>s.w).pop();openPlate(last?last.w:"")};
  document.getElementById("ssSave").onclick=()=>{ssSave(id,draft);};
  document.getElementById("ssNota").oninput=e=>setNota(id,e.target.value);
  document.getElementById("ssSkip").onclick=async()=>{
    if(isSkip){setSkipped(getSkipped().filter(x=>x!==id));renderSession();return}
    const ok=await showDialog({title:"¿Saltar ejercicio?",msg:"Se marcará como omitido en la sesión de hoy.",icon:"close",confirmText:"Saltar",cancelText:"Cancelar"});
    if(ok){setSkipped([...getSkipped(),id]);
      if(cur<total-1){ssState.cur++;renderSession()}else renderSession();}
  };
  const prev=document.getElementById("ssPrev");
  if(prev)prev.onclick=()=>{ssSave(id,draft,true);ssState.cur--;renderSession()};
  const next=document.getElementById("ssNext");
  if(next)next.onclick=()=>{ssSave(id,draft,true);ssState.cur++;renderSession()};
  const fin=document.getElementById("ssFinish");
  if(fin)fin.onclick=()=>{ssSave(id,draft,true);finishSession()};

  document.getElementById("ssBody").scrollTop=0;
}

/* Guardar ejercicio de la sesión guiada: MISMA base que la vista normal, sin duplicados */
function ssSave(id,draft,silent){
  const clean=draft.filter(s=>s.w!==""||s.r!=="");
  if(!clean.length)return false;
  if(!DB[id])DB[id]=[];
  const {iso,time}=nowStamp();
  const prevPR=DB[id].length?Math.max(0,...DB[id].filter(e=>e.date!==iso).map(e=>Math.max(0,...e.sets.map(s=>epley(s.w,s.r))))):0;
  const dia=ssState?ssState.day:activeDay;
  const entry={date:iso,day:dia,time,sets:clean.map(s=>({w:s.w,r:s.r,rpe:s.rpe||""}))};
  const i=DB[id].findIndex(e=>e.date===iso&&(e.day||dia)===dia);
  if(i>=0)DB[id][i]=entry;else DB[id].push(entry);   // actualiza, no duplica
  save(DB);
  const newBest=Math.max(0,...entry.sets.map(s=>epley(s.w,s.r)));
  if(!silent){
    if(newBest>prevPR&&prevPR>0){flashMsg("¡Nuevo récord! "+newBest+" lb");soundPR();lanzarConfetti()}
    else{flashMsg("Guardado · "+time);soundSave()}
  }
  checkNuevosLogros();
  return true;
}

function finishSession(){
  const {exs,day}=ssState;
  const {iso}=nowStamp();
  // autoguardar todos los borradores pendientes
  guardarBorradoresPendientes();
  let totalVol=0,completed=0,prs=[];
  exs.forEach(ex=>{
    const h=registroDe(ex.id,day,iso);
    if(!h)return;
    completed++;totalVol+=volumen(h.sets);
    const best=Math.max(0,...h.sets.map(s=>epley(s.w,s.r)));
    const hist=(DB[ex.id]||[]).filter(e=>e.date!==iso);
    const prevPR=hist.length?Math.max(0,...hist.map(e=>Math.max(0,...e.sets.map(s=>epley(s.w,s.r))))):0;
    if(best>prevPR&&prevPR>0)prs.push({n:ex.n,v:best});
  });
  const mins=ssTimerStart?Math.round((Date.now()-ssTimerStart)/60000):0;
  // registrar sesión concluida
  const sem=rutinaSemana();
  setSesionesDone([...getSesionesDone().filter(s=>s.date!==iso),{
    date:iso,day,label:(sem[day]&&sem[day].label)||"",
    ejercicios:completed,total:exs.length,volumen:Math.round(totalVol),
    time:nowStamp().time,duracion:mins
  }]);
  clearDrafts();clearDoneSets();
  localStorage.removeItem(SSPOS_KEY);
  ssTimerStart=null;
  lanzarConfetti();
  if(navigator.vibrate)navigator.vibrate([40,60,80]);
  soundPR();

  const body=document.getElementById("ssBody");
  document.getElementById("ssFill").style.width="100%";
  document.getElementById("ssCount").textContent="";
  body.innerHTML=`
    <div class="ss-summary">
      <div class="ss-trophy">${ICON('trophy2',48)}</div>
      <div class="ss-sum-title">¡Sesión completada!</div>
      <div class="ss-sum-sub">${(sem[day]&&sem[day].label)||""}</div>
      <div class="ss-stats">
        <div class="ss-stat"><div class="v">${completed}/${exs.length}</div><div class="l">Ejercicios</div></div>
        <div class="ss-stat"><div class="v">${fmtNum(Math.round(totalVol))}</div><div class="l">Volumen</div></div>
        <div class="ss-stat"><div class="v">${mins||"–"}</div><div class="l">Minutos</div></div>
      </div>
      ${prs.length?`<div class="ss-prs">${prs.map(p=>`<div class="ss-pr">${ICON('flame',14)} <b>${p.n}</b> · ${p.v} lb</div>`).join("")}</div>`:""}
      <button class="ss-btn finish" id="ssDone">Finalizar</button>
    </div>`;
  body.querySelector("#ssDone").onclick=()=>{closeSession()};
}

/* Cerrar sesión guiada: guarda lo escrito antes de salir */
document.getElementById("ssClose").onclick=async()=>{
  const ok=await showDialog({title:"¿Salir de la sesión?",
    msg:"Todo lo que escribiste ya quedó guardado. Puedes retomarla cuando quieras.",
    icon:"close",confirmText:"Salir",cancelText:"Seguir"});
  if(!ok)return;
  // Guardar en DB lo escrito y LUEGO limpiar los borradores: ya están persistidos,
  // así renderEntreno lee el registro guardado en vez de un draft huérfano que
  // tendría prioridad sobre él.
  guardarBorradoresPendientes();
  clearDrafts();
  closeSession();
};

