/**
 * ============================================================
 *  entrenamiento.js — Lógica de rutinas y entreno
 * ============================================================
 */
function diaDeHoy(){return ALL_DAYS[new Date().getDay()===0?6:new Date().getDay()-1]||"Lunes"}
let activeDay=diaDeHoy();

function buildSetRow(opts){
  const {id,ex,set,idx,draft,onChange,onDelete,compact}=opts;
  const T=tipoEjercicio(ex);
  const done=isSetDone(id,idx);
  const prev=prevSetTxt(id,idx);
  const row=document.createElement("div");
  row.className="setrow"+(T.sinPeso?" no-weight":"")+(done?" done":"")+(compact?" compact":"");

  row.innerHTML=`
    <div class="set-main">
      <button class="set-check" title="Marcar serie completada">${done?ICON('check',14):""}</button>
      <span class="setno">${idx+1}</span>
      <div class="set-vals">
        ${T.sinPeso?"":`
        <div class="fld-w">
          <button class="stp minus" data-d="-5">−</button>
          <input class="in-w" inputmode="decimal" placeholder="lb" value="${set.w}">
          <button class="stp plus" data-d="5">+</button>
        </div>`}
        <div class="fld-r">
          <input class="in-r" inputmode="numeric" placeholder="${T.labelRep}" value="${set.r}">
          <span class="unit">${T.labelRep}</span>
        </div>
      </div>
      <button class="del">${ICON('close',15)}</button>
    </div>
    <div class="set-sub">
      ${prev?`<div class="set-prev">${ICON('back',10)} ${prev}</div>`:`<div class="set-prev empty">—</div>`}
      <div class="rpe-quick">
        <span class="rpe-lbl">RPE</span>
        ${[7,8,9,10].map(n=>`<button class="rq${String(set.rpe)===String(n)?" on":""}" data-rpe="${n}">${n}</button>`).join("")}
      </div>
    </div>`;

  // referencias
  const chk=row.querySelector(".set-check");
  const inW=row.querySelector(".in-w");
  const inR=row.querySelector(".in-r");

  function completa(){
    // Una serie está completa si tiene reps (y peso, si aplica)
    const okR=(set.r||"").trim()!=="";
    const okW=T.sinPeso||((set.w||"").trim()!=="");
    return okR&&okW;
  }
  function marcarDone(val,auto){
    setDoneSet(id,idx,val);
    row.classList.toggle("done",val);
    chk.innerHTML=val?ICON('check',14):"";
    if(val){
      soundSetDone();
      if(navigator.vibrate)navigator.vibrate(35);
      if(auto)startTimer(restFor(ex)); // temporizador automático de descanso
    }
    onChange&&onChange();
  }
  // check manual
  chk.onclick=()=>{
    const nuevo=!isSetDone(id,idx);
    if(nuevo&&!completa()){flashMsg("Completa peso y reps para marcar la serie");return}
    marcarDone(nuevo,nuevo);
  };
  // peso
  if(inW){
    inW.oninput=e=>{set.w=e.target.value.trim();onChange&&onChange();autoDone()};
    row.querySelectorAll(".stp").forEach(b=>b.onclick=()=>{
      const d=parseFloat(b.dataset.d);
      const cur=parseFloat(set.w)||0;
      const nv=Math.max(0,Math.round((cur+d)*10)/10);
      set.w=String(nv);inW.value=set.w;
      if(navigator.vibrate)navigator.vibrate(12);
      onChange&&onChange();autoDone();
    });
  }
  // reps
  inR.oninput=e=>{
    if(T.sinPeso){set.r=e.target.value.trim();set.w=""}
    else set.r=e.target.value.trim();
    onChange&&onChange();autoDone();
  };
  // RPE rápido
  row.querySelectorAll(".rq").forEach(b=>b.onclick=()=>{
    const v=b.dataset.rpe;
    set.rpe=(String(set.rpe)===v)?"":v; // toggle
    row.querySelectorAll(".rq").forEach(x=>x.classList.toggle("on",String(set.rpe)===x.dataset.rpe));
    if(navigator.vibrate)navigator.vibrate(12);
    onChange&&onChange();
  });
  // borrar serie
  row.querySelector(".del").onclick=()=>{onDelete&&onDelete(idx)};

  // auto-marcar cuando la serie queda completa (una sola vez)
  let yaAuto=isSetDone(id,idx);
  function autoDone(){
    if(!yaAuto&&completa()){yaAuto=true;marcarDone(true,true)}
  }
  return row;
}

function badgeVal(sets,id){
  const w=Math.max(0,...sets.map(s=>parseFloat(s.w)||0));
  if(w>0)return w+" lb";
  const r=Math.max(0,...sets.map(s=>parseFloat(s.r)||0));
  if(!r)return "registrado";
  // buscar la unidad del ejercicio
  let unidad="reps";
  if(id){
    const sem=rutinaSemana();
    ALL_DAYS.forEach(d=>{((sem[d]&&sem[d].ex)||[]).forEach(ex=>{
      if(exId(ex)===id)unidad=tipoEjercicio(ex).labelRep;
    })});
  }
  return r+" "+unidad;
}

/* ============ MOTOR DE SERIES UNIFICADO ============ */

function contarHoy(){
  const {iso}=nowStamp();
  const dayEx=ejerciciosDelDia(activeDay);
  const drafts=getDrafts();
  const skipped=getSkipped();
  let done=0,skip=0;
  dayEx.forEach(ex=>{
    const id=exId(ex);
    if(skipped.includes(id)){skip++;return}
    const guardado=!!registroDe(id,activeDay,iso);
    const dk=draftKey(id,activeDay);
    const tieneDraft=Object.prototype.hasOwnProperty.call(drafts,dk);
    const dr=(drafts[dk]||[]).filter(s=>s.w!==""||s.r!=="");
    // si vaciaste el borrador, NO cuenta aunque siga guardado
    if(tieneDraft&&!dr.length)return;
    if(guardado||dr.length)done++;
  });
  return {done,skip,total:dayEx.length};
}
function refreshConcluirBtn(){
  const btn=document.querySelector(".conclude-btn");if(!btn)return;
  const {done,skip,total}=contarHoy();
  const small=btn.querySelector("small");
  if(small)small.textContent=`${done} de ${total} registrados${skip?" · "+skip+" saltados":""}`;
}
function refreshBadge(card,id){
  const {iso}=nowStamp();
  const head=card.querySelector(".ex-head");if(!head)return;
  const cont=head.firstElementChild;if(!cont)return;
  const old=cont.querySelector(".ex-badge")||cont.querySelector(".ex-last");
  if(!old)return;
  const guardado=registroDe(id,activeDay,iso);
  const drafts=getDrafts();
  const dk=draftKey(id,activeDay);
  const tieneDraft=Object.prototype.hasOwnProperty.call(drafts,dk);
  const dr=(drafts[dk]||[]).filter(s=>s.w!==""||s.r!=="");
  const skipped=getSkipped().includes(id);
  let html="";
  if(skipped){
    html=`<span class="ex-badge skip">${ICON('close',12)} Saltado</span>`;
  }else if(tieneDraft&&!dr.length&&guardado){
    // vaciaste los campos de un registro que ya estaba guardado
    html=`<span class="ex-badge warn">${ICON('warn',12)} Vaciado · guarda para borrar</span>`;
    card.classList.remove("done-today");card.classList.add("has-draft");
  }else if(dr.length&&(!guardado||!mismosSets(dr,guardado.sets))){
    // hay cambios sin guardar respecto a lo que está en la base
    html=`<span class="ex-badge draft">${ICON('save',12)} Sin guardar: ${badgeVal(dr,id)}</span>`;
    card.classList.add("has-draft");card.classList.remove("done-today");
  }else if(guardado){
    html=`<span class="ex-badge done">${ICON('check',12)} Hoy: ${badgeVal(guardado.sets,id)}</span>`;
    card.classList.add("done-today");card.classList.remove("has-draft");
  }else if(dr.length){
    html=`<span class="ex-badge draft">${ICON('save',12)} Sin guardar: ${badgeVal(dr,id)}</span>`;
    card.classList.add("has-draft");
  }else{
    card.classList.remove("done-today","has-draft");
    const ls=lastSummary(id);
    html=ls?`<div class="ex-last">Última: ${ls.top} lb · ${fmtDate(ls.date)} ${ls.time}</div>`
           :`<div class="ex-last">Sin registros aún</div>`;
  }
  if(html)old.outerHTML=html;
}
/* Limpiar los checks de un ejercicio */
function clearDoneSetsOf(id){
  const d=getDoneSets();
  delete d[id];
  localStorage.setItem(DONESETS_KEY,JSON.stringify({date:nowStamp().iso,data:d}));
}

function renderEntreno(){
  const wrap=document.getElementById("tab-entreno");
  const today=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][new Date().getDay()];
  const sem=rutinaSemana();
  const hoy=diaDeHoy();
  // Reordenar: HOY siempre primero, luego los días siguientes en orden circular
  const hoyIdx=ALL_DAYS.indexOf(hoy);
  const dias=hoyIdx>=0
    ? [...ALL_DAYS.slice(hoyIdx),...ALL_DAYS.slice(0,hoyIdx)]
    : ALL_DAYS;
  if(!dias.includes(activeDay))activeDay=hoy;
  const esHoy=(activeDay===hoy);
  const {iso:todayIso}=nowStamp();
  const diaSaltado=esHoy&&isSkipDay(todayIso);
  const yaConcluida=esHoy&&sesionConcluida(todayIso);

  let tabs=`<div class="sec-title">${esHoy?"Entrenamiento de hoy":"Consultando · "+activeDay}</div>
    <div class="sec-sub">${today} · ${new Date().getDate()}/${new Date().getMonth()+1} · ${planActual().nombre}</div><div class="days">`;
  dias.forEach(d=>{
    const isRest=!((sem[d]&&sem[d].ex)||[]).length;
    tabs+=`<button class="daytab${d===activeDay?" active":""}${d===hoy?" is-today":""}${isRest?" rest":""}" data-d="${d}">
      <span class="d">${SHORT[d]}${d===hoy?" · HOY":""}</span>${d}</button>`;
  });
  tabs+=`</div>`;

  const dayEx=ejerciciosDelDia(activeDay);
  const dayLabel=(sem[activeDay]&&sem[activeDay].label)||"";

  if(yaConcluida){
    // pantalla: sesión ya concluida hoy
    const s=getSesionesDone().find(x=>x.date===todayIso)||{};
    tabs+=`<div class="rest-day done-session">${ICON('trophy2',34)}
      <div class="rest-t">Sesión completada</div>
      <div class="rest-s">Terminaste tu entrenamiento de hoy${s.time?" a las "+s.time:""}.<br>Vuelve mañana para la siguiente sesión.</div>
      <div class="done-stats">
        <div><b>${s.ejercicios||0}/${s.total||0}</b><span>Ejercicios</span></div>
        <div><b>${fmtNum(s.volumen||0)}</b><span>Volumen</span></div>
        <div><b>${racha()}</b><span>Racha</span></div>
      </div>
      <button class="rest-undo" id="undoDone">${ICON('back',16)} Reabrir sesión</button>
      </div><div id="exList"></div>`;
  }else if(diaSaltado){
    // pantalla: día saltado, vuelve mañana
    tabs+=`<div class="rest-day skipped-day">${ICON('calendar',34)}
      <div class="rest-t">Día saltado</div>
      <div class="rest-s">Marcaste hoy como día sin entrenamiento.<br>Vuelve mañana para registrar tu próxima sesión.</div>
      <button class="rest-undo" id="undoSkipDay">${ICON('back',16)} Deshacer y entrenar hoy</button>
      </div><div id="exList"></div>`;
  }else if(!dayEx.length){
    // pantalla: día de descanso
    tabs+=`<div class="rest-day">${ICON('shield',34)}
      <div class="rest-t">Día de descanso</div>
      <div class="rest-s">${esHoy?"Hoy toca recuperarse. El músculo crece cuando descansas.":"Este día no tiene ejercicios en tu plan."}</div>
      ${esHoy?`<div class="rest-tip">${ICON('bolt',14)} Duerme bien, hidrátate y come suficiente proteína.</div>`:""}
      </div><div id="exList"></div>`;
  }else{
    if(!esHoy){
      tabs+=`<div class="notice-day">${ICON('warn',15)}<div>Estás viendo <b>${activeDay}</b>, no el día de hoy (<b>${hoy}</b>). Si registras algo, quedará como sesión de <b>${activeDay}</b> pero con la fecha de hoy (${new Date().getDate()}/${new Date().getMonth()+1}).</div></div>`;
    }
    tabs+=`<button class="start-session" id="startSession">${ICON('play2',20)}<span>Iniciar sesión guiada</span><small>${dayLabel}</small></button>
      <div class="quick-modes">
        <button class="qm" id="qmBusy">${ICON('users',15)}<span>Gym lleno</span></button>
        <button class="qm" id="qmFast">${ICON('clock',15)}<span>Poco tiempo</span></button>
      </div>
      <div id="exList"></div>`;
  }
  wrap.innerHTML=tabs;
  wrap.querySelectorAll(".daytab").forEach(b=>b.onclick=()=>{activeDay=b.dataset.d;renderEntreno()});
  const undoD=document.getElementById("undoDone");
  if(undoD)undoD.onclick=async()=>{
    const ok=await showDialog({title:"¿Reabrir la sesión?",msg:"Podrás seguir registrando o editando los ejercicios de hoy.",icon:"back",confirmText:"Reabrir",cancelText:"Cancelar"});
    if(ok){setSesionesDone(getSesionesDone().filter(s=>s.date!==todayIso));renderEntreno()}
  };
  const undo=document.getElementById("undoSkipDay");
  if(undo)undo.onclick=()=>saltarDiaCompleto(true,todayIso);
  const ssBtn=document.getElementById("startSession");
  if(ssBtn)ssBtn.onclick=()=>startGuidedSession(activeDay);
  const qb=document.getElementById("qmBusy");
  if(qb)qb.onclick=abrirGymLleno;
  const qf=document.getElementById("qmFast");
  if(qf)qf.onclick=abrirPocoTiempo;
  if(diaSaltado||yaConcluida)return; // no renderizar ejercicios si el día está saltado o la sesión ya concluida
  const list=document.getElementById("exList");
  const {iso:todayISO}=nowStamp();
  const skipped=getSkipped();
  let doneCount=0,skipCount=0;
  const draftsHoy=getDrafts();
  dayEx.forEach((ex,i)=>{
    const id=exId(ex);const ls=lastSummary(id);
    const hoy=registroDe(id,activeDay,todayISO);
    const dkey=draftKey(id,activeDay);
    const tieneDraft=Object.prototype.hasOwnProperty.call(draftsHoy,dkey);
    const dr=(draftsHoy[dkey]||[]).filter(s=>s.w!==""||s.r!=="");
    const vaciado=tieneDraft&&!dr.length&&hoy;   // borró un registro ya guardado
    const cambiado=dr.length&&hoy&&!mismosSets(dr,hoy.sets);
    const isSkip=skipped.includes(id);
    let badge="";
    if(isSkip){badge=`<span class="ex-badge skip">${ICON('close',12)} Saltado</span>`;skipCount++}
    else if(vaciado){badge=`<span class="ex-badge warn">${ICON('warn',12)} Vaciado · guarda para borrar</span>`}
    else if(cambiado){badge=`<span class="ex-badge draft">${ICON('save',12)} Editado: ${badgeVal(dr,id)}</span>`;doneCount++}
    else if(hoy){badge=`<span class="ex-badge done">${ICON('check',12)} Hoy: ${badgeVal(hoy.sets,id)}</span>`;doneCount++}
    else if(dr.length){badge=`<span class="ex-badge draft">${ICON('save',12)} Sin guardar: ${badgeVal(dr,id)}</span>`;doneCount++}
    const card=document.createElement("div");card.className="ex"+(isSkip?" skipped":"")+(hoy&&!isSkip&&!vaciado&&!cambiado?" done-today":"")+((dr.length||vaciado)&&!isSkip&&(!hoy||cambiado||vaciado)?" has-draft":"");
    card.innerHTML=`<div class="ex-head"><div style="flex:1">
      <div class="ex-name">${ex.n}</div>
      ${badge||(ls?`<div class="ex-last">Última: ${ls.top} lb · ${fmtDate(ls.date)} ${ls.time}</div>`:`<div class="ex-last">Sin registros aún</div>`)}
      </div><span class="ex-scheme">${ex.s}</span><span class="chev">${ICON('chevron',18)}</span></div>
      <div class="ex-body"></div>`;
    card.querySelector(".ex-head").onclick=()=>{
      const wasOpen=card.classList.contains("open");
      document.querySelectorAll("#exList .ex.open").forEach(c=>c.classList.remove("open"));
      if(!wasOpen){card.classList.add("open");buildBody(card,id,ex)}
    };
    list.appendChild(card);
  });
  // Botones de sesión: SOLO en el día de hoy (no al consultar otros días)
  if(dayEx.length && esHoy){
    const total=dayEx.length;
    const concluir=document.createElement("button");
    concluir.className="conclude-btn";
    concluir.innerHTML=`${ICON('check2',20)}<span>Concluir sesión de entrenamiento</span><small>${doneCount} de ${total} registrados${skipCount?" · "+skipCount+" saltados":""}</small>`;
    concluir.onclick=()=>concluirSesion(doneCount,total,dayLabel);
    list.appendChild(concluir);

    // card: saltar día completo (rompe la racha)
    const dayIsSkipped=isSkipDay(todayISO);
    const skipDay=document.createElement("button");
    skipDay.className="skipday-btn"+(dayIsSkipped?" active":"");
    skipDay.innerHTML=dayIsSkipped
      ? `${ICON('back',18)}<span>Día saltado · Deshacer</span><small>Tu racha se restaurará</small>`
      : `${ICON('close',18)}<span>Saltar día completo</span><small>${ICON('warn',12)} Esto romperá tu racha actual (${racha()} días)</small>`;
    skipDay.onclick=()=>saltarDiaCompleto(dayIsSkipped,todayISO);
    list.appendChild(skipDay);
  }
}
async function saltarDiaCompleto(yaSaltado,iso){
  if(yaSaltado){
    const ok=await showDialog({title:"¿Deshacer día saltado?",
      msg:"Se restaurará tu racha y el día volverá a contar normalmente.",
      icon:"back",confirmText:"Deshacer",cancelText:"Cancelar"});
    if(!ok)return;
    setSkipDays(getSkipDays().filter(d=>d.date!==iso));
    renderEntreno();
    return;
  }
  const r=racha();
  const ok=await showDialog({title:"¿Saltar el día completo?",
    msg:r>0
      ? `Tu racha actual de ${r} ${r===1?"día":"días"} se perderá.\n\nQuedará registrado en tu historial. Podrás deshacerlo.`
      : "Se marcará hoy como día sin entrenamiento. Quedará registrado en tu historial. Podrás deshacerlo.",
    icon:"warn",danger:true,confirmText:"Sí, saltar día",cancelText:"Cancelar"});
  if(!ok)return;
  // guardar registro completo: fecha, día de la semana, rutina que tocaba, hora
  const sem=rutinaSemana();
  const hoyNombre=diaDeHoy();
  const {time}=nowStamp();
  setSkipDays([...getSkipDays(),{
    date:iso,
    day:hoyNombre,
    label:(sem[hoyNombre]&&sem[hoyNombre].label)||"Descanso",
    time,
    rachaPerdida:r
  }]);
  if(navigator.vibrate)navigator.vibrate([50,80,50]);
  renderEntreno();
  await alertDlg("Día marcado como saltado y registrado en tu historial. Tu racha se reinició.",{title:"Día saltado",icon:"calendar"});
}
// Guarda en DB todos los borradores pendientes de hoy. Devuelve cuántos ejercicios quedaron registrados.
function guardarBorradoresPendientes(){
  const drafts=getDrafts();
  const {iso,time}=nowStamp();
  let guardados=0;
  Object.entries(drafts).forEach(([clave,sets])=>{
    const clean=(sets||[]).filter(s=>s.w!==""||s.r!=="");
    if(!clean.length)return;
    // La clave puede ser "ex:nombre@Lunes" (nuevo) o "ex:nombre" (antiguo)
    const at=clave.lastIndexOf("@");
    const id=at>0?clave.slice(0,at):clave;
    const dia=at>0?clave.slice(at+1):activeDay;
    if(!DB[id])DB[id]=[];
    const entry={date:iso,day:dia,time,sets:clean.map(s=>({w:s.w,r:s.r,rpe:s.rpe||""}))};
    const i=DB[id].findIndex(e=>e.date===iso&&(e.day||dia)===dia);
    if(i>=0)DB[id][i]=entry;else DB[id].push(entry);
    guardados++;
  });
  if(guardados)save(DB);
  return guardados;
}

async function concluirSesion(done,total,label){
  // Autoguardar todo lo escrito antes de concluir
  guardarBorradoresPendientes();
  // Recontar tras el autoguardado
  const {iso}=nowStamp();
  const sem0=rutinaSemana();
  const exsHoy=(sem0[activeDay]&&sem0[activeDay].ex)||[];
  done=exsHoy.filter(ex=>!!registroDe(exId(ex),activeDay,iso)).length;
  if(done===0){await alertDlg("Aún no has registrado ningún ejercicio hoy.",{title:"Sesión vacía",icon:"warn"});return}
  const ok=await showDialog({title:"¿Concluir sesión?",
    msg:`${done} de ${total} ejercicios registrados.\nTodo lo que escribiste se guardará automáticamente.`,
    icon:"check2",confirmText:"Concluir",cancelText:"Seguir"});
  if(!ok)return;
  clearDrafts(); // sesión cerrada: limpiar borradores del día
  // registrar la sesión como concluida
  const sem2=rutinaSemana();
  let volTotal=0;
  const exsDia=(sem2[activeDay]&&sem2[activeDay].ex)||[];
  exsDia.forEach(ex=>{const h=registroDe(exId(ex),activeDay,iso);if(h)volTotal+=volumen(h.sets)});
  setSesionesDone([...getSesionesDone().filter(s=>s.date!==iso),{
    date:iso,day:activeDay,label:label||"",
    ejercicios:done,total,volumen:Math.round(volTotal),
    time:nowStamp().time
  }]);
  // mostrar resumen festivo
  let vol=0;const skipped=getSkipped();
  const sem=rutinaSemana();const dayEx=(sem[activeDay]&&sem[activeDay].ex)||[];
  dayEx.forEach(ex=>{const hoy=registroDe(exId(ex),activeDay,iso);if(hoy)vol+=volumen(hoy.sets)});
  lanzarConfetti();
  const body=document.getElementById("ssBody");
  document.getElementById("session").classList.add("show");
  document.body.style.overflow="hidden";
  document.getElementById("ssFill").style.width="100%";
  document.getElementById("ssCount").textContent="";
  body.innerHTML=`<div class="ss-summary">
    <div class="ss-trophy">${ICON('trophy2',48)}</div>
    <div class="ss-sum-title">¡Sesión concluida!</div>
    <div class="ss-sum-sub">${label||""}</div>
    <div class="ss-stats">
      <div class="ss-stat"><div class="v">${done}/${total}</div><div class="l">Ejercicios</div></div>
      <div class="ss-stat"><div class="v">${fmtNum(Math.round(vol))}</div><div class="l">Volumen</div></div>
      <div class="ss-stat"><div class="v">${racha()}</div><div class="l">Racha</div></div>
    </div>
    <div class="feel-block">
      <div class="feel-q">¿Cómo te sentiste hoy?</div>
      <div class="feel-opts">
        ${FEELS.map(f=>`<button class="feel" data-v="${f.v}" style="--fc:${f.col}">
          <div class="feel-ic">${ICON(f.ic,20)}</div><span>${f.n}</span></button>`).join("")}
      </div>
    </div>
    <button class="ss-btn finish" id="ssDone2">Finalizar</button>
  </div>`;
  body.querySelectorAll(".feel").forEach(b=>b.onclick=()=>{
    body.querySelectorAll(".feel").forEach(x=>x.classList.remove("on"));
    b.classList.add("on");
    setFeel({date:iso,v:parseInt(b.dataset.v),vol:Math.round(vol),ejercicios:done});
    if(navigator.vibrate)navigator.vibrate(15);
    soundSave();
  });
  body.querySelector("#ssDone2").onclick=()=>{
    document.getElementById("session").classList.remove("show");
    document.body.style.overflow="";
    renderEntreno();
  };
  checkNuevosLogros();
}

function buildBody(card,id,ex){
  const body=card.querySelector(".ex-body");
  const nSets=parseInt(ex.s)||3;
  const {iso:todayISO}=nowStamp();
  const T=tipoEjercicio(ex);
  // Fuente única: borrador de hoy > registro guardado de hoy > vacío
  const drafts=getDrafts();
  const diaRut=activeDay;   // día de la rutina que se está viendo
  // Un ejercicio puede repetirse en varios días (p.ej. Elevaciones el lunes y el jueves).
  // El registro pertenece al día de rutina en el que se hizo, no solo a la fecha.
  const hoyEntry=(DB[id]||[]).find(e=>e.date===todayISO&&(e.day||diaRut)===diaRut);
  let draft;
  const dk=draftKey(id,diaRut);
  if(drafts[dk]&&drafts[dk].length){
    draft=drafts[dk].map(s=>({w:s.w||"",r:s.r||"",rpe:s.rpe||""}));
  }else if(hoyEntry&&hoyEntry.sets&&hoyEntry.sets.length){
    draft=hoyEntry.sets.map(s=>({w:s.w||"",r:s.r||"",rpe:s.rpe||""}));
  }else{
    draft=Array.from({length:nSets},()=>({w:"",r:"",rpe:""}));
  }
  function persistDraft(){
    setDraft(draftKey(id,diaRut),draft.map(s=>({w:s.w,r:s.r,rpe:s.rpe})));
    refreshConcluirBtn();
    refreshBadge(card,id);
    upd1rm();
  }
  function paint(){
    body.innerHTML="";
    // SUGERENCIA INTELIGENTE DE PESO
    const sug=sugerirPeso(id,ex);
    if(sug){
      const sg=document.createElement("div");sg.className="sug sug-"+sug.tipo;
      sg.innerHTML=`<div class="sug-ic">${ICON(sug.tipo==="sube"?"up":sug.tipo==="baja"?"down":sug.tipo==="info"?"bolt":"target",16)}</div>
        <div class="sug-txt">${sug.txt}</div>
        ${sug.tipo==="sube"||sug.tipo==="mantiene"?`<button class="sug-apply">Usar</button>`:""}`;
      const ap=sg.querySelector(".sug-apply");
      if(ap)ap.onclick=()=>{
        draft.forEach(s=>{if(!s.w)s.w=String(sug.peso)});
        persistDraft();paint();flashMsg("Peso aplicado: "+sug.peso+" lb");
      };
      body.appendChild(sg);
    }
    // ESTANCAMIENTO
    const est=estancamiento(id);
    if(est){
      const e=document.createElement("div");e.className="stall";
      e.innerHTML=`<div class="stall-ic">${ICON('warn',15)}</div>
        <div><b>Estancado ${est.semanas} semanas</b><br>
        <small>Tu récord sigue en ${est.pr} lb. Considera una semana de descarga (~${est.sugerencia} lb) y vuelve a subir.</small></div>`;
      body.appendChild(e);
    }
    // CALENTAMIENTO
    const objetivo=draft.find(s=>s.w)?parseFloat(draft.find(s=>s.w).w):(sug?sug.peso:0);
    const cal=calentamiento(objetivo);
    if(cal.length&&!T.sinPeso){
      const c=document.createElement("details");c.className="warmup";
      c.innerHTML=`<summary>${ICON('flame',13)} Calentamiento sugerido para ${objetivo} lb</summary>
        <div class="wu-list">${cal.map((x,i)=>`<div class="wu-row"><span>${i+1}</span> ${x.peso} lb × ${x.reps} reps</div>`).join("")}
        <div class="wu-row final"><span>${ICON('check',11)}</span> ${objetivo} lb · serie efectiva</div></div>`;
      body.appendChild(c);
    }
    // mejor marca histórica
    const best=bestSetTxt(id);
    if(best){
      const bh=document.createElement("div");bh.className="ex-best";
      bh.innerHTML=`${ICON('trophy2',12)} Mejor: <b>${best}</b>`;
      body.appendChild(bh);
    }
    draft.forEach((set,idx)=>{
      body.appendChild(buildSetRow({
        id,ex,set,idx,draft,
        onChange:persistDraft,
        onDelete:i=>{draft.splice(i,1);shiftDoneSets(id,i);persistDraft();paint()}
      }));
    });
    const rm=document.createElement("div");rm.className="rpe-1rm";rm.id="rm1";body.appendChild(rm);

    // botones
    const btns=document.createElement("div");btns.className="exbtns";
    btns.innerHTML=`<button class="btn btn-add">${ICON('plus',16)}Serie</button>
      <button class="btn btn-copy">${ICON('copy',16)}Copiar</button>
      ${T.sinPeso?"":`<button class="btn btn-plate">${ICON('calc',16)}Discos</button>`}
      <button class="btn btn-save">${ICON('save',16)}Guardar</button>`;
    btns.querySelector(".btn-add").onclick=()=>{draft.push({w:"",r:"",rpe:""});persistDraft();paint()};
    btns.querySelector(".btn-copy").onclick=()=>{
      const last=draft[draft.length-1];
      draft.push(last?{w:last.w,r:last.r,rpe:last.rpe}:{w:"",r:"",rpe:""});
      persistDraft();paint();
      if(navigator.vibrate)navigator.vibrate(15);
    };
    const bp=btns.querySelector(".btn-plate");
    if(bp)bp.onclick=()=>{const last=draft.filter(s=>s.w).pop();openPlate(last?last.w:"")};
    btns.querySelector(".btn-save").onclick=saveDay;
    body.appendChild(btns);

    // nota del ejercicio
    const noteWrap=document.createElement("div");noteWrap.className="ex-note";
    noteWrap.innerHTML=`<label>${ICON('list',12)} Nota</label>
      <textarea placeholder="Ej: me molestó el hombro, probé agarre cerrado..." rows="2">${getNota(id)||""}</textarea>`;
    const ta=noteWrap.querySelector("textarea");
    ta.oninput=()=>setNota(id,ta.value);
    body.appendChild(noteWrap);

    // saltar ejercicio
    const skip=document.createElement("button");skip.className="btn-skip";
    const isSkipped=(getSkipped().includes(id));
    skip.innerHTML=isSkipped?`${ICON('check',14)} Ejercicio saltado (deshacer)`:`${ICON('close',14)} Saltar este ejercicio hoy`;
    if(isSkipped)skip.classList.add("undone");
    skip.onclick=async()=>{
      if(isSkipped){setSkipped(getSkipped().filter(x=>x!==id));renderEntreno();return}
      const ok=await showDialog({title:"¿Saltar ejercicio?",msg:"Se marcará como omitido en la sesión de hoy. Podrás deshacerlo.",icon:"close",confirmText:"Saltar",cancelText:"Cancelar"});
      if(ok){setSkipped([...getSkipped(),id]);renderEntreno()}
    };
    body.appendChild(skip);

    const msg=document.createElement("div");msg.className="savedmsg";body.appendChild(msg);
    upd1rm();renderHist();
  }
  function upd1rm(){
    const el=body.querySelector("#rm1");if(!el)return;
    if(T.sinPeso){el.textContent="";return}
    const best=Math.max(0,...draft.map(s=>epley(s.w,s.r)));
    el.textContent=best?"1RM estimado: "+best+" lb":"";
  }
  async function saveDay(){
    const clean=draft.filter(s=>s.w!==""||s.r!=="");
    const {iso,time}=nowStamp();
    const yaExiste=!!registroDe(id,diaRut,iso);
    // Si vaciaste todo y ya había registro hoy: BORRARLO (no es un registro nuevo)
    if(!clean.length){
      if(yaExiste){
        const ok=await showDialog({title:"¿Borrar el registro de hoy?",
          msg:"Dejaste todas las series vacías. Se eliminará lo que registraste hoy en este ejercicio.",
          icon:"trash",danger:true,confirmText:"Borrar",cancelText:"Cancelar"});
        if(!ok)return;
        DB[id]=(DB[id]||[]).filter(e=>!(e.date===iso&&(e.day||diaRut)===diaRut));
        if(!DB[id].length)delete DB[id];
        save(DB);
        setDraft(draftKey(id,diaRut),[]);            // limpiar borrador
        clearDoneSetsOf(id);        // limpiar los checks
        flash("Registro de hoy borrado");
        renderHist();refreshConcluirBtn();refreshBadge(card,id);
        return;
      }
      flash("Escribe al menos una serie");return;
    }
    if(!DB[id])DB[id]=[];
    const prevPR=DB[id].length?Math.max(0,...DB[id].filter(e=>e.date!==iso).map(e=>Math.max(0,...e.sets.map(s=>epley(s.w,s.r))))):0;
    const entry={date:iso,day:diaRut,time,sets:clean.map(s=>({w:s.w,r:s.r,rpe:s.rpe||""}))};
    // Busca el registro de HOY para ESTE día de rutina (no pisa el de otro día)
    const ex_i=DB[id].findIndex(e=>e.date===iso&&(e.day||diaRut)===diaRut);
    if(ex_i>=0)DB[id][ex_i]=entry;else DB[id].push(entry);   // EDITA, no duplica
    const newBest=Math.max(0,...entry.sets.map(s=>epley(s.w,s.r)));
    save(DB);
    if(newBest>prevPR&&prevPR>0){flashPR("¡Nuevo récord! "+newBest+" lb");soundPR()}
    else{flash(yaExiste?"Actualizado · "+time:"Guardado · "+time);soundSave()}
    renderHist();
    refreshConcluirBtn();
    refreshBadge(card,id);
    checkNuevosLogros();
  }
  function flashPR(t){const m=body.querySelector(".savedmsg");if(!m)return;
    m.innerHTML=ICON('flame',13)+" "+t;m.classList.add("show","pr");
    setTimeout(()=>{m.classList.remove("show","pr");m.innerHTML=""},2600)}
  function flash(t){const m=body.querySelector(".savedmsg");if(!m)return;m.textContent=t;m.classList.add("show");setTimeout(()=>m.classList.remove("show"),1800)}
  function renderHist(){
    let h=body.querySelector(".hist");if(h)h.remove();
    const hist=DB[id]||[];h=document.createElement("div");h.className="hist";
    if(!hist.length){h.innerHTML=`<h4>Progreso</h4><div class="empty">Guarda tu primer día para ver la gráfica.</div>`;body.appendChild(h);return}
    h.innerHTML=`<h4>Progreso</h4>`;
    // PREDICCIÓN DE PR
    const pred=predecirPR(id);
    if(pred&&pred.tipo==="prediccion"){
      const pd=document.createElement("div");pd.className="pred";
      pd.innerHTML=`${ICON('target',14)} <div>Al ritmo actual romperás tu récord de <b>${pred.pr} lb</b> en ~<b>${pred.semanas} ${pred.semanas===1?"semana":"semanas"}</b><br><small>+${pred.pend} lb/semana de tendencia</small></div>`;
      h.appendChild(pd);
    }else if(pred&&pred.tipo==="pr_hoy"){
      const pd=document.createElement("div");pd.className="pred at-pr";
      pd.innerHTML=`${ICON('flame',14)} <div>Estás en tu mejor momento: <b>${pred.pr} lb</b><br><small>Tu última sesión igualó o superó tu récord. Sigue así.</small></div>`;
      h.appendChild(pd);
    }
    // GEMELO DEL PASADO
    const hace90=valorHace(id,90);
    const actual=Math.max(0,...hist.map(e=>Math.max(0,...e.sets.map(s=>epley(s.w,s.r)))));
    if(hace90&&actual>hace90){
      const pct=Math.round((actual-hace90)/hace90*100);
      const gp=document.createElement("div");gp.className="ghost-past";
      gp.innerHTML=`${ICON('up',13)} Hace 3 meses: <b>${hace90} lb</b> → hoy <b>${actual} lb</b> <span class="gp-pct">+${pct}%</span>`;
      h.appendChild(gp);
    }
    if(!T.sinPeso)h.appendChild(chartEl(hist));
    // RÉCORDS POR RANGO DE REPS
    const rr=recordsPorRango(id);
    if(rr.length>1){
      const rw=document.createElement("div");rw.className="rr-wrap";
      rw.innerHTML=`<div class="rr-title">Récords por rango</div>
        <div class="rr-grid">${rr.map(x=>`<div class="rr-item"><div class="rr-rango">${x.rango} reps</div><div class="rr-val">${x.txt}</div></div>`).join("")}</div>`;
      h.appendChild(rw);
    }
    const recs=document.createElement("div");recs.className="recs";
    const maxE=Math.max(0,...hist.map(e=>Math.max(0,...e.sets.map(s=>epley(s.w,s.r)))));
    hist.slice().reverse().forEach((e,ri)=>{
      const i=hist.length-1-ri;
      const best=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));
      const prevE=i>0?Math.max(0,...hist[i-1].sets.map(s=>epley(s.w,s.r))):0;
      const up=prevE&&best>prevE, dn=prevE&&best<prevE;
      const isPR=best===maxE&&best>0;
      const detail=e.sets.map(s=>`${s.w||"–"}×${s.r||"–"}${s.rpe?" @"+s.rpe:""}`).join("  ·  ");
      const r=document.createElement("div");r.className="rec"+(isPR?" pr":"");
      r.innerHTML=`<span class="rd">${fmtDate(e.date)}${e.time?" · "+e.time:""}</span>
        <span class="rv">${isPR&&best?`<span class="prtag">${ICON('flame',10)} PR</span>`:""}
        ${best?`<b>${best} lb</b>`:""}${up?`<i class="up">${ICON('up',11)}</i>`:""}${dn?`<i class="dn">${ICON('down',11)}</i>`:""}
        <br><small>${detail}</small></span>
        <button class="rdel" data-i="${i}">${ICON('trash',13)}</button>`;
      r.querySelector(".rdel").onclick=async()=>{
        const ok=await showDialog({title:"¿Borrar registro?",msg:"Se eliminará este día del historial de este ejercicio.",icon:"trash",danger:true,confirmText:"Borrar",cancelText:"Cancelar"});
        if(ok){DB[id].splice(i,1);if(!DB[id].length)delete DB[id];save(DB);paint();refreshConcluirBtn();refreshBadge(card,id)}
      };
      recs.appendChild(r);
    });
    h.appendChild(recs);body.appendChild(h);
  }
  paint();
}

function chartEl(hist){
  const pts=hist.map(e=>({d:e.date,v:Math.max(0,...e.sets.map(s=>epley(s.w,s.r)))})).filter(p=>p.v>0);
  const allB=pts.map(p=>p.v);const pr=allB.length?Math.max(...allB):0;
  return lineChart(pts,allB.lastIndexOf(pr),"lb");
}

/* ============ TEMPORIZADOR ============ */
// Timer basado en RELOJ REAL: guarda el instante de fin, así sigue correcto

function showMenu(){
  sheetTitle.textContent="Opciones";
  const auth=getAuth();
  const acctBlock=auth
    ? `<div class="acct"><div class="acct-ic">${ICON('check2',20)}</div><div class="acct-info"><b>${auth.name||"Mi cuenta"}</b><small>${auth.email} · sincronizado</small></div></div>`
    : `<div class="acct off"><div class="acct-ic">${ICON('cloud',20)}</div><div class="acct-info"><b>Sin cuenta</b><small>Datos solo en este dispositivo</small></div></div>`;
  sheetBody.innerHTML=`${acctBlock}<div class="stat-row">
      <div class="stat"><div class="n">${totalRegistros()}</div><div class="l">Registros</div></div>
      <div class="stat"><div class="n">${diasEntrenados()}</div><div class="l">Días entrenados</div></div></div>
    <div class="menu">
      <button id="mPlan"><span class="ic">${ICON('dumbbell',22)}</span><div>Cambiar plan de entrenamiento<small>${planActual().nombre} · ${planActual().nivel}</small></div></button>
      <button id="mWeekend"><span class="ic">${ICON('calendar',22)}</span><div>Fin de semana<small>${CFG.weekend?"Sábado y domingo visibles":"Solo Lunes a Viernes"}</small></div></button>
      <button id="mRest"><span class="ic">${ICON('clock',22)}</span><div>Descansos entre series<small>Por defecto 3:00 · editable por ejercicio</small></div></button>
      <button id="mAmigo"><span class="ic">${ICON('users',22)}</span><div>Modo Amigos<small>Comparte tu rutina de hoy con un enlace</small></div></button>
      <button id="mCal"><span class="ic">${ICON('calendar',22)}</span><div>Calendario<small>Ver y editar lo que registraste cada día</small></div></button>
      <button id="mPerfil"><span class="ic">${ICON('users',22)}</span><div>Mi perfil<small>Foto, sobre mí, insignias y vitrinas</small></div></button>
      <button id="mProg"><span class="ic">${ICON('list',22)}</span><div>Ver todo mi historial<small>Pesos, RPE, fechas y horas de cada ejercicio</small></div></button>
      <button id="mExport"><span class="ic">${ICON('download',22)}</span><div>Exportar respaldo<small>Guarda un archivo con todo tu historial</small></div></button>
      <button id="mImport"><span class="ic">${ICON('upload',22)}</span><div>Importar respaldo<small>Restaura datos desde un archivo</small></div></button>
      ${auth?`<button id="mLogout"><span class="ic">${ICON('logout',22)}</span><div>Cerrar sesión<small>${auth.email}</small></div></button>`:`<button id="mLoginNow"><span class="ic">${ICON('cloud',22)}</span><div>Iniciar sesión / crear cuenta<small>Sincroniza tus datos en la nube</small></div></button>`}
      <button id="mSound"><span class="ic">${ICON(CFG.mute?'mute':'sound',22)}</span><div>Sonido${CFG.mute?" desactivado":" activado"}<small>Alarma al terminar el descanso</small></div></button>
      <button id="mClear" class="danger"><span class="ic">${ICON('trash',22)}</span><div>Borrar todos los datos<small>No se puede deshacer</small></div></button></div>`;
  document.getElementById("mSound").onclick=()=>{CFG.mute=!CFG.mute;saveCfg(CFG);if(!CFG.mute)beep(880,0.1,0.2);showMenu()};
  document.getElementById("mPlan").onclick=showPlanes;
  document.getElementById("mWeekend").onclick=()=>{CFG.weekend=!CFG.weekend;saveCfg(CFG);renderEntreno();showMenu()};
  document.getElementById("mRest").onclick=showDescansos;
  document.getElementById("mAmigo").onclick=()=>{
    if(typeof abrirModoAmigos==="function")abrirModoAmigos();
    else alertDlg("No se cargó modo-amigos.js. Sube ese archivo y el index.html actualizado.",{title:"Modo Amigos no disponible",icon:"warn"});
  };
  document.getElementById("mCal").onclick=()=>{closeSheet();abrirCalendario()};
  document.getElementById("mPerfil").onclick=()=>{closeSheet();abrirPerfil()};
  document.getElementById("mProg").onclick=showHistorial;
  document.getElementById("mExport").onclick=exportData;
  document.getElementById("mImport").onclick=()=>document.getElementById("importFile").click();
  const lo=document.getElementById("mLogout");if(lo)lo.onclick=async()=>{const ok=await showDialog({title:"¿Cerrar sesión?",msg:"Tus datos quedan guardados en la nube. Podrás volver a iniciar sesión cuando quieras.",icon:"logout",confirmText:"Cerrar sesión",cancelText:"Cancelar"});if(ok)logout()};
  const ln=document.getElementById("mLoginNow");if(ln)ln.onclick=()=>{closeSheet();showAuth()};
  document.getElementById("mClear").onclick=async()=>{const ok=await showDialog({title:"¿Borrar todo?",msg:"Se eliminará todo tu historial de este dispositivo. Esta acción no se puede deshacer.",icon:"trash",danger:true,confirmText:"Borrar todo",cancelText:"Cancelar"});if(ok){localStorage.removeItem(KEY);DB={};save(DB);renderEntreno();showMenu()}};
}
function estrellas(n){let s="";for(let i=0;i<5;i++)s+=i<n?"●":"○";return s}
function showPlanes(){
  sheetTitle.textContent="Rutinas";
  let html=`<button class="btn btn-add" style="margin-bottom:12px" onclick="showMenu()">${ICON('back',15)} Volver</button>
    <button class="btn btn-save" id="crearRut" style="width:100%;margin-bottom:18px">${ICON('plus',16)} Crear rutina personalizada</button>`;
  const mias=getMisRutinas();
  if(Object.keys(mias).length){
    html+=`<div class="plan-sec">Mis rutinas</div>`;
  }
  Object.entries(todosLosPlanes()).forEach(([id,p])=>{
    const esMia=!!mias[id];
    if(!esMia&&Object.keys(mias).length&&id===Object.keys(PLANES)[0]){
      html+=`<div class="plan-sec">Rutinas de fábrica</div>`;
    }
    const activo=id===CFG.plan;
    const nDias=Object.values(p.semana).filter(d=>d.ex&&d.ex.length).length;
    html+=`<div class="plan-card${activo?" active":""}" data-plan="${id}">
      <div class="plan-top">
        <div class="plan-name">${p.nombre}${activo?`<span class="plan-badge">ACTIVO</span>`:""}</div>
      </div>
      <div class="plan-tags">
        <span class="ptag obj">${p.objetivo}</span>
        <span class="ptag niv">${p.nivel}</span>
        <span class="ptag">${nDias} días/sem</span>
      </div>
      <div class="plan-inten">Intensidad <b>${estrellas(p.intensidad)}</b></div>
      <div class="plan-desc">${p.desc}</div>
      <button class="plan-prev" data-prev="${id}">${ICON('list',14)} Previsualizar semana</button>
      <div class="plan-preview hidden" id="prev-${id}"></div>
      <div class="plan-acts">
        <button class="pact" data-edit="${id}">${ICON('edit',13)} ${esMia?"Editar":"Copiar y editar"}</button>
        ${esMia?`<button class="pact del" data-del="${id}">${ICON('trash',13)} Borrar</button>`:""}
      </div>
      ${activo?"":`<button class="plan-choose" data-choose="${id}">Usar este plan</button>`}
    </div>`;
  });
  sheetBody.innerHTML=html;
  const cr=document.getElementById("crearRut");
  if(cr)cr.onclick=()=>{closeSheet();nuevaRutina()};
  sheetBody.querySelectorAll("[data-edit]").forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    closeSheet();
    editarRutina(b.dataset.edit);
  });
  sheetBody.querySelectorAll("[data-del]").forEach(b=>b.onclick=async e=>{
    e.stopPropagation();
    const id=b.dataset.del;
    const p=getMisRutinas()[id];
    const ok=await showDialog({title:"¿Borrar rutina?",
      msg:`Se eliminará "${p?p.nombre:""}". Tus registros de entrenamiento NO se borran.`,
      icon:"trash",danger:true,confirmText:"Borrar",cancelText:"Cancelar"});
    if(ok){borrarRutina(id);showPlanes();renderEntreno();flashMsg("Rutina borrada")}
  });
  sheetBody.querySelectorAll("[data-prev]").forEach(b=>{
    b.onclick=()=>{
      const id=b.dataset.prev,box=document.getElementById("prev-"+id);
      if(!box.classList.contains("hidden")){box.classList.add("hidden");return}
      const sem=PLANES[id].semana;
      box.innerHTML=ALL_DAYS.filter(d=>sem[d]).map(d=>{
        const day=sem[d];
        if(!day.ex||!day.ex.length)return `<div class="pv-day rest"><b>${d}</b> <span>Descanso</span></div>`;
        return `<div class="pv-day"><b>${d}</b> <span>${day.label}</span>
          <div class="pv-exs">${day.ex.map(e=>`<div class="pv-ex">${e.n} <em>${e.s}</em></div>`).join("")}</div></div>`;
      }).join("");
      box.classList.remove("hidden");
    };
  });
  sheetBody.querySelectorAll("[data-choose]").forEach(b=>{
    b.onclick=()=>{
      CFG.plan=b.dataset.choose;saveCfg(CFG);
      activeDay=diasVisibles()[0]||"Lunes";
      renderEntreno();showPlanes();
      if(navigator.vibrate)navigator.vibrate(30);
    };
  });
}
function showDescansos(){
  sheetTitle.textContent="Descansos entre series";
  let html=`<button class="btn btn-add" style="margin-bottom:12px" onclick="showMenu()">${ICON('back',15)} Volver</button>
    <div class="rest-hint">Tiempo de descanso tras cada serie. Mínimo 3:00. Editable por ejercicio del plan actual.</div>`;
  const sem=rutinaSemana();
  const vistos=new Set();
  diasVisibles().forEach(d=>{
    (sem[d].ex||[]).forEach(ex=>{
      const key=normEx(ex.n);if(vistos.has(key))return;vistos.add(key);
      const cur=restFor(ex);
      html+=`<div class="rest-row">
        <div class="rest-name">${ex.n}</div>
        <div class="rest-ctl">
          <button class="rest-b" data-ex="${key}" data-delta="-30">−30</button>
          <span class="rest-val" id="rest-${key.replace(/[^a-z0-9]/gi,'')}">${fmtT(cur)}</span>
          <button class="rest-b" data-ex="${key}" data-delta="30">+30</button>
        </div>
      </div>`;
    });
  });
  sheetBody.innerHTML=html;
  // guardo el mapa key->id para actualizar el label
  const labelId=k=>"rest-"+k.replace(/[^a-z0-9]/gi,'');
  sheetBody.querySelectorAll("[data-delta]").forEach(b=>{
    b.onclick=()=>{
      const key=b.dataset.ex,delta=+b.dataset.delta;
      const actual=CFG.rest[key]||REST_DEFAULT;
      const nuevo=Math.max(180,actual+delta); // nunca menos de 3:00
      CFG.rest[key]=nuevo;saveCfg(CFG);
      const el=document.getElementById(labelId(key));if(el)el.textContent=fmtT(nuevo);
      if(navigator.vibrate)navigator.vibrate(10);
    };
  });
}
function showHistorial(){
  sheetTitle.textContent="Todo mi historial";
  let html=`<button class="btn btn-add" style="margin-bottom:16px" onclick="showMenu()">${ICON('back',15)} Volver</button>`,any=false;
  // días saltados
  const skips=getSkipDays().slice().sort((a,b)=>b.date<a.date?-1:1);
  if(skips.length){
    any=true;
    html+=`<div class="prog-day"><h3 style="color:var(--gold)">Días saltados · ${skips.length}</h3>`;
    skips.forEach(s=>{
      html+=`<div class="skip-rec">
        <div class="skip-rec-ic">${ICON('calendar',16)}</div>
        <div class="skip-rec-info">
          <b>${fmtDateFull(s.date)}${s.time?" · "+s.time:""}</b>
          <small>${s.day?s.day+" · ":""}${s.label||"Sin registrar"}${s.rachaPerdida?" · racha de "+s.rachaPerdida+" perdida":""}</small>
        </div></div>`;
    });
    html+=`</div>`;
  }
  const exs=allExercises().filter(ex=>(DB[ex.id]||[]).length);
  exs.sort((a,b)=>a.name.localeCompare(b.name));
  exs.forEach(ex=>{
    const hist=DB[ex.id]||[];
    let d=`<div class="prog-day"><h3>${ex.name}</h3><div class="prog-ex">`;
    any=true;hist.slice().reverse().forEach(e=>{
      const detail=e.sets.map(s=>`${s.w||"–"}×${s.r||"–"}${s.rpe?" @RPE"+s.rpe:""}`).join("  ·  ");
      const best=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));
      d+=`<div class="rec"><span class="rd">${fmtDateFull(e.date)}${e.time?" · "+e.time:""}</span><span class="rv"><b>${best} lb 1RM</b><br>${detail}</span></div>`;
    });
    d+=`</div></div>`;html+=d;
  });
  sheetBody.innerHTML=html;
  if(!any)sheetBody.innerHTML+=`<div class="empty">Aún no hay registros.</div>`;
}
function exportData(){
  const blob=new Blob([JSON.stringify(DB,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a"),{iso}=nowStamp();
  a.href=url;a.download="respaldo-stimpys-"+iso+".json";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.getElementById("importFile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=async()=>{try{const data=JSON.parse(r.result);if(typeof data!=="object")throw 0;
    const ok=await showDialog({title:"¿Importar respaldo?",msg:"Se reemplazarán tus datos actuales con los del archivo.",icon:"upload",confirmText:"Importar",cancelText:"Cancelar"});
    if(ok){DB=data;save(DB);renderEntreno();showMenu();await alertDlg("Respaldo importado correctamente.",{title:"Listo",icon:"check2"})}
  }catch(err){await alertDlg("El archivo no es un respaldo válido.",{title:"Error",icon:"warn"})}};
  r.readAsText(f);e.target.value="";
};



function abrirGymLleno(){
  const sem=rutinaSemana();
  const dayEx=(sem[activeDay]&&sem[activeDay].ex)||[];
  const subs=getSubs();
  sheetTitle.textContent="Gym lleno";
  let html=`<div class="busy-hint">${ICON('bolt',14)} Elige una alternativa si la máquina está ocupada. Solo aplica hoy.</div><div class="busy-list">`;
  dayEx.forEach(ex=>{
    const id=exId(ex);
    const alt=sustitutosDe(ex.n);
    const actual=subs[id];
    html+=`<div class="busy-row${actual?" changed":""}">
      <div class="busy-name">${actual?`<s>${ex.n}</s> → <b>${actual}</b>`:ex.n}</div>
      <div class="busy-alts">
        ${alt.length?alt.map(a=>`<button class="balt${actual===a?" on":""}" data-id="${id}" data-a="${a}">${a}</button>`).join(""):`<span class="busy-none">Sin alternativas</span>`}
        ${actual?`<button class="balt undo" data-id="${id}" data-a="">${ICON('back',12)} Original</button>`:""}
      </div></div>`;
  });
  html+=`</div><button class="btn btn-add" id="resetSubs" style="width:100%;margin-top:14px">${ICON('back',15)} Restaurar todos</button>`;
  sheetBody.innerHTML=html;
  sheetBody.querySelectorAll(".balt").forEach(b=>b.onclick=()=>{
    setSub(b.dataset.id,b.dataset.a||null);
    renderEntreno();
    flashMsg(b.dataset.a?"Cambiado a "+b.dataset.a:"Restaurado");
    abrirGymLleno();
  });
  document.getElementById("resetSubs").onclick=()=>{
    clearSubs();renderEntreno();closeSheet();flashMsg("Rutina original restaurada");
  };
  openSheet();
}

function abrirPocoTiempo(){
  const sem=rutinaSemana();
  const dayEx=(sem[activeDay]&&sem[activeDay].ex)||[];
  sheetTitle.textContent="Poco tiempo";
  sheetBody.innerHTML=`<div class="busy-hint">${ICON('clock',14)} ¿Cuánto tiempo tienes? Priorizamos los ejercicios más importantes.</div>
    <div class="time-opts">${[20,30,45,60].map(m=>`<button class="topt" data-m="${m}">${m} min</button>`).join("")}</div>
    <div id="timeResult"></div>`;
  sheetBody.querySelectorAll(".topt").forEach(b=>b.onclick=()=>{
    sheetBody.querySelectorAll(".topt").forEach(x=>x.classList.remove("on"));
    b.classList.add("on");
    const mins=parseInt(b.dataset.m);
    const r=priorizarEjercicios(dayEx,mins);
    const omit=dayEx.filter(e=>!r.ejercicios.includes(e));
    const res=document.getElementById("timeResult");
    res.innerHTML=`<div class="tr-head">${r.ejercicios.length} de ${r.total} ejercicios · ~${r.minutos} min</div>
      ${r.ejercicios.map(ex=>`<div class="tr-ex">${ICON('check',13)} ${ex.n} <small>${ex.s}</small></div>`).join("")}
      ${omit.length?`<div class="tr-skip">Se omitirán: ${omit.map(e=>e.n).join(", ")}</div>`:""}
      <button class="btn btn-save" id="applyTime" style="width:100%;margin-top:14px">${ICON('check2',15)} Aplicar</button>`;
    document.getElementById("applyTime").onclick=()=>{
      setSkipped([...new Set([...getSkipped(),...omit.map(e=>exId(e))])]);
      closeSheet();renderEntreno();
      flashMsg("Sesión ajustada a "+mins+" min");
    };
  });
  openSheet();
}

let edRutinaId=null, edRutina=null, edDia="Lunes";

function nuevaRutina(){
  edRutinaId="mia_"+Date.now();
  edRutina=rutinaVacia("");
  edDia="Lunes";
  abrirEditorRutina(true);
}
function editarRutina(id){
  const todos=todosLosPlanes();
  const base=todos[id];
  if(!base)return;
  // copia profunda
  edRutinaId=esRutinaMia(id)?id:"mia_"+Date.now();
  edRutina=JSON.parse(JSON.stringify(base));
  if(!esRutinaMia(id)){
    edRutina.nombre=base.nombre+" (mi versión)";
    edRutina.desc="Basada en "+base.nombre;
    edRutina.objetivo=base.objetivo||"Personalizada";
    edRutina.nivel=base.nivel||"Tuyo";
    edRutina.intensidad=base.intensidad||3;
  }
  edRutina.mia=true;
  edDia="Lunes";
  abrirEditorRutina(false);
}

function abrirEditorRutina(esNueva){
  document.getElementById("rutEditor").classList.add("show");
  document.body.style.overflow="hidden";
  document.getElementById("rutName").value=edRutina.nombre||"";
  document.getElementById("rutTitle").textContent=esNueva?"Nueva rutina":"Editar rutina";
  pintarEditorRutina();
}
function cerrarEditorRutina(){
  document.getElementById("rutEditor").classList.remove("show");
  document.body.style.overflow="";
  edRutinaId=null;edRutina=null;
}

function pintarEditorRutina(){
  // pestañas de días
  const tabs=document.getElementById("rutDias");
  tabs.innerHTML=ALL_DAYS.map(d=>{
    const dd=edRutina.semana[d]||{ex:[]};
    const n=(dd.ex||[]).length;
    return `<button class="rd-tab${d===edDia?" on":""}" data-d="${d}">
      <span class="rd-d">${d.slice(0,3)}</span>
      <span class="rd-n">${n?n+" ej":"–"}</span>
    </button>`;
  }).join("");
  tabs.querySelectorAll(".rd-tab").forEach(b=>b.onclick=()=>{edDia=b.dataset.d;pintarEditorRutina()});

  const dia=edRutina.semana[edDia]||{label:"Descanso",ex:[]};
  const body=document.getElementById("rutBody");
  const esDescanso=!dia.ex||!dia.ex.length;

  let html=`<div class="rut-day">
    <label class="fld">
      <span>Nombre del día</span>
      <input type="text" id="rutLabel" maxlength="40" placeholder="Ej. Pecho · Tríceps" value="${esDescanso&&dia.label==="Descanso"?"":(dia.label||"")}">
    </label>`;

  if(esDescanso){
    html+=`<div class="rut-rest">${ICON('shield',22)}
      <div><b>Día de descanso</b><br><small>Añade ejercicios para convertirlo en día de entreno.</small></div></div>`;
  }else{
    html+=`<div class="rut-exs" id="rutExs"></div>`;
  }
  html+=`<button class="btn btn-save" id="rutAdd" style="width:100%;margin-top:12px">
    ${ICON('plus',16)} Añadir ejercicio</button>
  </div>`;
  body.innerHTML=html;

  // nombre del día
  document.getElementById("rutLabel").oninput=e=>{
    if(!edRutina.semana[edDia])edRutina.semana[edDia]={label:"",ex:[]};
    edRutina.semana[edDia].label=e.target.value;
  };
  // lista de ejercicios del día
  const exs=document.getElementById("rutExs");
  if(exs){
    exs.innerHTML="";
    dia.ex.forEach((ex,i)=>{
      const row=document.createElement("div");row.className="rut-ex";
      row.innerHTML=`
        <div class="rut-ex-main">
          <div class="rut-ex-n">${ex.n}</div>
          <div class="rut-ex-s">
            <input class="rs-in" data-f="sets" inputmode="numeric" value="${(ex.s||"3x8").split("x")[0]}" maxlength="2">
            <span>×</span>
            <input class="rs-in wide" data-f="reps" value="${(ex.s||"3x8").split("x")[1]||"8"}" maxlength="7">
          </div>
        </div>
        <div class="rut-ex-btns">
          <button class="rx up" ${i===0?"disabled":""}>${ICON('up',14)}</button>
          <button class="rx down" ${i===dia.ex.length-1?"disabled":""}>${ICON('down',14)}</button>
          <button class="rx del">${ICON('trash',14)}</button>
        </div>`;
      const sIn=row.querySelector('[data-f="sets"]');
      const rIn=row.querySelector('[data-f="reps"]');
      const upd=()=>{ex.s=(sIn.value||"3")+"x"+(rIn.value||"8")};
      sIn.oninput=upd;rIn.oninput=upd;
      row.querySelector(".up").onclick=()=>{if(i>0){[dia.ex[i-1],dia.ex[i]]=[dia.ex[i],dia.ex[i-1]];pintarEditorRutina()}};
      row.querySelector(".down").onclick=()=>{if(i<dia.ex.length-1){[dia.ex[i+1],dia.ex[i]]=[dia.ex[i],dia.ex[i+1]];pintarEditorRutina()}};
      row.querySelector(".del").onclick=()=>{dia.ex.splice(i,1);pintarEditorRutina()};
      exs.appendChild(row);
    });
  }
  document.getElementById("rutAdd").onclick=abrirSelectorEj;
}

/* Selector de ejercicios (de la librería) */
let selQ="",selG="Todos",selE="Todo";
function abrirSelectorEj(){
  selQ="";selG="Todos";selE="Todo";
  document.getElementById("ejPicker").classList.add("show");
  pintarSelector();
  setTimeout(()=>{const s=document.getElementById("ejSearch");if(s)s.focus()},250);
}
function cerrarSelectorEj(){
  document.getElementById("ejPicker").classList.remove("show");
}
function pintarSelector(){
  const wrap=document.getElementById("ejPickBody");
  const res=buscarEjs(selQ,selG==="Todos"?null:selG,selE==="Todo"?null:selE);
  document.getElementById("ejCount").textContent=res.length+" de "+EJS.length;
  let html=`<div class="chips">${["Todos",...GRUPOS].map(g=>
    `<button class="chip${g===selG?" active":""}" data-g="${g}">${g}</button>`).join("")}</div>
    <div class="chips eq">${["Todo",...EQUIPOS].map(e=>
    `<button class="chip sm${e===selE?" active":""}" data-e="${e}">${e}</button>`).join("")}</div>
    <div class="ej-list">`;
  if(!res.length){
    html+=`<div class="dic-empty">${ICON('book',22)}<div>Sin resultados</div></div>`;
  }else{
    res.slice(0,120).forEach(e=>{
      const tipo=e.t==="c"?"Compuesto":e.t==="cardio"?"Cardio":"Aislamiento";
      html+=`<button class="ej-item" data-n="${escapeHtml(e.n)}">
        <div class="ej-i-main">
          <div class="ej-i-n">${e.n}</div>
          <div class="ej-i-m">${e.m}</div>
          <div class="ej-i-tags"><span>${e.e}</span><span class="t-${e.t}">${tipo}</span></div>
        </div>
        <span class="ej-i-add">${ICON('plus',16)}</span>
      </button>`;
    });
    if(res.length>120)html+=`<div class="ej-more">Refina la búsqueda para ver más (${res.length-120} restantes)</div>`;
  }
  html+=`</div>`;
  wrap.innerHTML=html;
  wrap.querySelectorAll(".chips .chip[data-g]").forEach(c=>c.onclick=()=>{selG=c.dataset.g;pintarSelector()});
  wrap.querySelectorAll(".chips .chip[data-e]").forEach(c=>c.onclick=()=>{selE=c.dataset.e;pintarSelector()});
  wrap.querySelectorAll(".ej-item").forEach(b=>b.onclick=()=>{
    const nombre=b.dataset.n;
    const info=ejPorNombre(nombre);
    if(!edRutina.semana[edDia])edRutina.semana[edDia]={label:"",ex:[]};
    const dia=edRutina.semana[edDia];
    if(!dia.ex)dia.ex=[];
    // sets/reps por defecto según el tipo
    const def=info&&info.t==="cardio"?"1x20min":(info&&info.t==="c"?"4x6-8":"3x10-12");
    dia.ex.push({n:nombre,s:def});
    if(!dia.label||dia.label==="Descanso")dia.label=info?info.g:"Entreno";
    cerrarSelectorEj();
    pintarEditorRutina();
    flashMsg(nombre+" añadido");
    if(navigator.vibrate)navigator.vibrate(15);
  });
}

/* Guardar la rutina */
async function guardarRutinaActual(){
  const nombre=document.getElementById("rutName").value.trim();
  if(nombre.length<2){flashMsg("Ponle un nombre a tu rutina");return}
  // contar días con ejercicios
  let dias=0;
  ALL_DAYS.forEach(d=>{
    const dd=edRutina.semana[d];
    if(dd&&dd.ex&&dd.ex.length){dias++;if(!dd.label)dd.label="Entreno"}
    else edRutina.semana[d]={label:"Descanso",ex:[]};
  });
  if(!dias){flashMsg("Añade ejercicios al menos a un día");return}
  edRutina.nombre=nombre;
  edRutina.desc=edRutina.desc||"Rutina personalizada";
  edRutina.objetivo=edRutina.objetivo||"Personalizada";
  edRutina.nivel=edRutina.nivel||"Tuyo";
  edRutina.intensidad=edRutina.intensidad||3;
  edRutina.mia=true;
  guardarRutina(edRutinaId,edRutina);
  const usar=await showDialog({title:"Rutina guardada",
    msg:`"${nombre}" tiene ${dias} ${dias===1?"día":"días"} de entreno. ¿Quieres usarla ahora?`,
    icon:"check2",confirmText:"Usar ahora",cancelText:"Después"});
  if(usar){CFG.plan=edRutinaId;saveCfg(CFG)}
  cerrarEditorRutina();
  renderEntreno();
  soundSave();
}

document.getElementById("rutClose").onclick=async()=>{
  const ok=await showDialog({title:"¿Salir sin guardar?",msg:"Perderás los cambios de esta rutina.",
    icon:"warn",danger:true,confirmText:"Salir",cancelText:"Seguir editando"});
  if(ok)cerrarEditorRutina();
};
document.getElementById("rutSave").onclick=guardarRutinaActual;
document.getElementById("ejPickClose").onclick=cerrarSelectorEj;
document.getElementById("ejSearch").oninput=e=>{selQ=e.target.value;pintarSelector()};

