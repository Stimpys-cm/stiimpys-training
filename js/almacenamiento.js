/**
 * ============================================================
 *  almacenamiento.js — Capa de datos local
 * ============================================================
 */
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return{}}}
function save(db){localStorage.setItem(KEY,JSON.stringify(db))}
let DB=load();

// exId ahora se basa en el NOMBRE del ejercicio, para compartir historial
// entre planes y días. Acepta un objeto ejercicio o un string con el nombre.
function exId(ex){return "ex:"+normEx(typeof ex==="string"?ex:(ex&&ex.n)||"")}

// Migración: historial viejo usaba "Día|índice". Lo pasamos a "ex:nombre".
(function migrarHistorial(){
  if(CFG.migratedV2)return;
  const legacy=/^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)\|(\d+)$/;
  const oldPlan=PLANES["ppl-arnold"].semana;
  let changed=false;
  Object.keys(DB).forEach(k=>{
    const m=k.match(legacy);
    if(!m)return;
    const day=m[1],idx=+m[2];
    const ex=oldPlan[day]&&oldPlan[day].ex[idx];
    if(!ex)return;
    const nid=exId(ex);
    if(!DB[nid])DB[nid]=[];
    DB[nid]=DB[nid].concat(DB[k]);
    delete DB[k];changed=true;
  });
  if(changed)save(DB);
  CFG.migratedV2=true;saveCfg(CFG);
})();

// Migración V3: registros antiguos no tienen el campo `day`. Se lo asignamos
// infiriéndolo del día de la semana de su fecha (los registros viejos siempre
// se creaban el mismo día en que se entrenaba, así que el día de la semana
// coincide con el día de rutina en que se registró).
(function migrarDayEnRegistros(){
  if(CFG.migratedV3)return;
  let changed=false;
  Object.keys(DB).forEach(id=>{
    const hist=DB[id];
    if(!Array.isArray(hist))return;
    hist.forEach(e=>{
      if(e&&e.date&&!e.day){e.day=diaDeFecha(e.date);changed=true}
    });
  });
  if(changed)save(DB);
  CFG.migratedV3=true;saveCfg(CFG);
})();

function getSkipped(){try{const o=JSON.parse(localStorage.getItem("stimpys_skip"))||{};return o.date===nowStamp().iso?(o.ids||[]):[]}catch(e){return[]}}
function setSkipped(ids){localStorage.setItem("stimpys_skip",JSON.stringify({date:nowStamp().iso,ids}))}

const DRAFT_KEY="stimpys_drafts";
/* Clave de borrador: un ejercicio puede estar en varios días de la rutina */
function draftKey(id,dia){return dia?id+"@"+dia:id}
/* Devuelve el registro de HOY de un ejercicio en un día concreto de la rutina */
function registroDe(id,dia,iso){
  const d=iso||nowStamp().iso;
  return (DB[id]||[]).find(e=>e.date===d&&(e.day||dia)===dia);
}
function getDrafts(){try{const o=JSON.parse(localStorage.getItem(DRAFT_KEY))||{};
  return o.date===nowStamp().iso?(o.data||{}):{}}catch(e){return{}}}
function setDraft(id,sets){
  const d=getDrafts();d[id]=sets;
  localStorage.setItem(DRAFT_KEY,JSON.stringify({date:nowStamp().iso,data:d}));
}
function clearDrafts(){localStorage.removeItem(DRAFT_KEY)}

/* días saltados completos: rompen la racha */
const SKIPDAY_KEY="stimpys_skipdays";
function getSkipDays(){try{const v=JSON.parse(localStorage.getItem(SKIPDAY_KEY))||[];
  // compat: si eran strings, convertir a objetos
  return v.map(x=>typeof x==="string"?{date:x,day:"",label:""}:x)}catch(e){return[]}}
function setSkipDays(a){localStorage.setItem(SKIPDAY_KEY,JSON.stringify(a));pushData&&pushData()}
function isSkipDay(iso){return getSkipDays().some(d=>d.date===iso)}

const DONESETS_KEY="stimpys_done_sets";
function getDoneSets(){try{const o=JSON.parse(localStorage.getItem(DONESETS_KEY))||{};
  return o.date===nowStamp().iso?(o.data||{}):{}}catch(e){return{}}}
function setDoneSet(id,idx,val){
  const d=getDoneSets();
  if(!d[id])d[id]=[];
  d[id][idx]=!!val;
  localStorage.setItem(DONESETS_KEY,JSON.stringify({date:nowStamp().iso,data:d}));
}
function isSetDone(id,idx){const d=getDoneSets();return !!(d[id]&&d[id][idx])}
function clearDoneSets(){localStorage.removeItem(DONESETS_KEY)}

/* Datos de la última sesión, serie por serie (para mostrar "anterior") */
function prevSets(id){
  const h=DB[id];if(!h||!h.length)return [];
  const {iso}=nowStamp();
  // buscar el último registro que NO sea de hoy
  for(let i=h.length-1;i>=0;i--){
    if(h[i].date!==iso)return h[i].sets||[];
  }
  return [];
}
function prevSetTxt(id,idx){
  const p=prevSets(id);
  const s=p[idx];
  if(!s)return "";
  const w=s.w?s.w:"";
  const r=s.r?s.r:"";
  if(!w&&!r)return "";
  return (w?w+"×":"")+r+(s.rpe?" @"+s.rpe:"");
}
/* Mejor serie histórica del ejercicio */
function bestSetTxt(id){
  const h=DB[id];if(!h||!h.length)return "";
  let best=0,txt="";
  h.forEach(e=>e.sets.forEach(s=>{
    const v=epley(s.w,s.r);
    if(v>best){best=v;txt=(s.w||"")+"×"+(s.r||"")}
  }));
  return best?txt+" ("+best+" lb 1RM)":"";
}


function shiftDoneSets(id,idx){
  const d=getDoneSets();
  if(!d[id])return;
  d[id].splice(idx,1);
  localStorage.setItem(DONESETS_KEY,JSON.stringify({date:nowStamp().iso,data:d}));
}


function clearDoneSetsOf(id){
  const d=getDoneSets();
  delete d[id];
  localStorage.setItem(DONESETS_KEY,JSON.stringify({date:nowStamp().iso,data:d}));
}

function lastSummary(id){const h=DB[id];if(!h||!h.length)return null;
  const last=h[h.length-1];const sets=last.sets.filter(s=>s.w!==""||s.r!=="");
  if(!sets.length)return null;
  return{date:last.date,time:last.time||"",top:Math.max(...sets.map(s=>parseFloat(s.w)||0))}}

const DONE_KEY="stimpys_sessions_done";
function getSesionesDone(){try{return JSON.parse(localStorage.getItem(DONE_KEY))||[]}catch(e){return[]}}
function setSesionesDone(a){localStorage.setItem(DONE_KEY,JSON.stringify(a));if(typeof pushData==="function")pushData()}
function sesionConcluida(iso){return getSesionesDone().some(s=>s.date===iso)}

const NOTAS_KEY="stimpys_notas";
function getNotas(){try{return JSON.parse(localStorage.getItem(NOTAS_KEY))||{}}catch(e){return{}}}
function getNota(id){return getNotas()[id]||""}
function setNota(id,txt){
  const n=getNotas();
  if(txt&&txt.trim())n[id]=txt;else delete n[id];
  localStorage.setItem(NOTAS_KEY,JSON.stringify(n));
  if(typeof pushData==="function")pushData();
}

const FEEL_KEY="stimpys_feels";
function getFeels(){try{return JSON.parse(localStorage.getItem(FEEL_KEY))||[]}catch(e){return[]}}
function setFeel(f){
  const a=getFeels().filter(x=>x.date!==f.date);
  a.push(f);
  localStorage.setItem(FEEL_KEY,JSON.stringify(a));
  if(typeof pushData==="function")pushData();
}
const FEELS=[
  {v:1,n:"Agotado",ic:"down",col:"#FF5470"},
  {v:2,n:"Cansado",ic:"target",col:"#FFCC4D"},
  {v:3,n:"Normal",ic:"check",col:"#4DB8FF"},
  {v:4,n:"Fuerte",ic:"bolt",col:"#00D09C"},
  {v:5,n:"Imparable",ic:"fire",col:"#2B5CFF"},
];

function getBW(){try{return JSON.parse(localStorage.getItem("stimpys_bw"))||[]}catch(e){return[]}}
function saveBW(a){localStorage.setItem("stimpys_bw",JSON.stringify(a))}

function allExercises(){
  const seen=new Map();
  // recorre todos los planes para catalogar ejercicios únicos por nombre
  Object.values(PLANES).forEach(p=>Object.values(p.semana).forEach(day=>{
    (day.ex||[]).forEach(ex=>{const id=exId(ex);if(!seen.has(id))seen.set(id,{id,name:ex.n})});
  }));
  // incluye también ejercicios que tengan historial pero ya no estén en ningún plan
  Object.keys(DB).forEach(id=>{if(id.startsWith("ex:")&&!seen.has(id))seen.set(id,{id,name:id.slice(3)})});
  return [...seen.values()];
}
function totalRegistros(){let n=0;Object.values(DB).forEach(a=>{if(Array.isArray(a))n+=a.length});return n}
function diasEntrenados(){const s=new Set();Object.values(DB).forEach(a=>{if(Array.isArray(a))a.forEach(e=>s.add(e.date))});return s.size}
function volumen(sets){return sets.reduce((t,s)=>t+(parseFloat(s.w)||0)*(parseFloat(s.r)||0),0)}
function allDates(){const s=new Set();Object.values(DB).forEach(a=>{if(Array.isArray(a))a.forEach(e=>s.add(e.date))});return [...s].sort()}

function racha(){
  const dates=allDates();if(!dates.length)return 0;
  const set=new Set(dates);
  const skips=new Set(getSkipDays().map(d=>d.date));
  let streak=0;const d=new Date();
  for(let i=0;i<400;i++){
    const iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    if(skips.has(iso))break;           // día saltado explícitamente: corta la racha
    if(set.has(iso))streak++;
    else if(i>0)break;                 // permite que hoy aún no se entrene
    d.setDate(d.getDate()-1);
  }
  return streak;
}
function volumenSemana(){
  const now=new Date();const wk=new Date(now);wk.setDate(now.getDate()-6);
  let total=0;
  Object.values(DB).forEach(a=>{if(Array.isArray(a))a.forEach(e=>{
    const d=new Date(e.date+"T00:00:00");if(d>=wk&&d<=now)total+=volumen(e.sets);
  })});
  return Math.round(total);
}
function volumenTotal(){let t=0;Object.values(DB).forEach(a=>{if(Array.isArray(a))a.forEach(e=>t+=volumen(e.sets))});return Math.round(t)}
function totalSeries(){let n=0;Object.values(DB).forEach(a=>{if(Array.isArray(a))a.forEach(e=>n+=(e.sets||[]).length)});return n}

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

