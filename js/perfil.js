/**
 * perfil.js — XP, logros, progreso y perfil Steam
 */
function calcXP(){
  // 10 XP por serie + 1 XP por cada 100 lb de volumen + 50 XP por PR histórico + 30 por día entrenado
  const series=totalSeries();
  const vol=Math.floor(volumenTotal()/100);
  const dias=diasEntrenados();
  let prs=0;
  allExercises().forEach(ex=>{const h=DB[ex.id];if(!h||h.length<2)return;
    let best=0;h.forEach(e=>{const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));if(v>best){best=v;prs++}})});
  return series*10 + vol + prs*50 + dias*30;
}
// Nivel: curva suave, cada nivel cuesta un poco más
function xpToLevel(xp){
  let lvl=1, need=100, acc=0;
  while(xp>=acc+need){acc+=need;lvl++;need=Math.round(need*1.35)}
  return {level:lvl, cur:xp-acc, need, pct:Math.round((xp-acc)/need*100)};
}
function nivelTitulo(lvl){
  const t=["Novato","Aprendiz","Constante","Dedicado","Fuerte","Atleta","Élite","Bestia","Titán","Leyenda"];
  return t[Math.min(t.length-1,Math.floor((lvl-1)/3))];
}

const LOGROS=[
  /* ---------- PRIMEROS PASOS (común) ---------- */
  {id:"first",   ic:"bolt",    r:1, n:"Primer paso",      d:"Registra tu primera serie",           chk:()=>totalSeries()>=1},
  {id:"ses1",    ic:"check2",  r:1, n:"Arrancamos",       d:"Concluye tu primera sesión",          chk:()=>getSesionesDone().length>=1},
  {id:"bw",      ic:"target",  r:1, n:"Autoconciencia",   d:"Registra tu peso corporal",           chk:()=>getBW().length>=1},
  {id:"nota1",   ic:"list",    r:1, n:"Tomando apuntes",  d:"Escribe tu primera nota",             chk:()=>Object.keys(getNotas()).length>=1},
  {id:"rpe1",    ic:"chart",   r:1, n:"Escucha al cuerpo",d:"Registra tu primer RPE",              chk:()=>conRPE()>=1},

  /* ---------- SERIES (común → raro) ---------- */
  {id:"s50",     ic:"dumbbell",r:1, n:"50 series",        d:"Acumula 50 series",                   chk:()=>totalSeries()>=50},
  {id:"s200",    ic:"dumbbell",r:2, n:"200 series",       d:"Acumula 200 series",                  chk:()=>totalSeries()>=200},
  {id:"s500",    ic:"dumbbell",r:2, n:"500 series",       d:"Acumula 500 series",                  chk:()=>totalSeries()>=500},
  {id:"s1000",   ic:"dumbbell",r:3, n:"Mil series",       d:"Acumula 1,000 series",                chk:()=>totalSeries()>=1000},
  {id:"s2500",   ic:"dumbbell",r:4, n:"Máquina de series",d:"Acumula 2,500 series",                chk:()=>totalSeries()>=2500},

  /* ---------- VOLUMEN ---------- */
  {id:"vol10k",  ic:"chart",   r:1, n:"10 toneladas",     d:"10,000 lb de volumen total",          chk:()=>volumenTotal()>=10000},
  {id:"vol50k",  ic:"chart",   r:2, n:"50 toneladas",     d:"50,000 lb de volumen total",          chk:()=>volumenTotal()>=50000},
  {id:"vol100k", ic:"chart",   r:2, n:"100 toneladas",    d:"100,000 lb de volumen total",         chk:()=>volumenTotal()>=100000},
  {id:"vol500k", ic:"chart",   r:3, n:"Medio millón",     d:"500,000 lb de volumen total",         chk:()=>volumenTotal()>=500000},
  {id:"vol1m",   ic:"trophy2", r:4, n:"Un millón",        d:"1,000,000 lb de volumen total",       chk:()=>volumenTotal()>=1000000},
  {id:"volDia",  ic:"flame",   r:2, n:"Día bestia",       d:"20,000 lb en una sola sesión",        chk:()=>maxVolDia()>=20000},

  /* ---------- CONSTANCIA ---------- */
  {id:"d7",      ic:"calendar",r:1, n:"Una semana",       d:"Entrena 7 días distintos",            chk:()=>diasEntrenados()>=7},
  {id:"d30",     ic:"calendar",r:2, n:"Un mes",           d:"Entrena 30 días distintos",           chk:()=>diasEntrenados()>=30},
  {id:"d100",    ic:"calendar",r:3, n:"Centenario",       d:"Entrena 100 días distintos",          chk:()=>diasEntrenados()>=100},
  {id:"d365",    ic:"trophy2", r:4, n:"Un año entero",    d:"Entrena 365 días distintos",          chk:()=>diasEntrenados()>=365},
  {id:"ses10",   ic:"check2",  r:1, n:"10 sesiones",      d:"Concluye 10 sesiones completas",      chk:()=>getSesionesDone().length>=10},
  {id:"ses50",   ic:"check2",  r:2, n:"50 sesiones",      d:"Concluye 50 sesiones completas",      chk:()=>getSesionesDone().length>=50},
  {id:"ses200",  ic:"check2",  r:3, n:"200 sesiones",     d:"Concluye 200 sesiones completas",     chk:()=>getSesionesDone().length>=200},

  /* ---------- RACHAS ---------- */
  {id:"streak3", ic:"fire",    r:1, n:"En racha",         d:"3 días seguidos",                     chk:()=>racha()>=3},
  {id:"streak7", ic:"fire",    r:2, n:"Imparable",        d:"7 días seguidos",                     chk:()=>racha()>=7},
  {id:"streak14",ic:"fire",    r:3, n:"Dos semanas",      d:"14 días seguidos",                    chk:()=>racha()>=14},
  {id:"streak30",ic:"fire",    r:4, n:"Mes de fuego",     d:"30 días seguidos",                    chk:()=>racha()>=30},
  {id:"streak100",ic:"trophy2",r:5, n:"Leyenda viva",     d:"100 días seguidos",                   chk:()=>racha()>=100},

  /* ---------- RÉCORDS ---------- */
  {id:"pr1",     ic:"medal",   r:1, n:"Nuevo récord",     d:"Consigue tu primer PR",               chk:()=>contarPRs()>=1},
  {id:"pr10",    ic:"medal",   r:2, n:"Rompe-récords",    d:"Consigue 10 PRs",                     chk:()=>contarPRs()>=10},
  {id:"pr25",    ic:"medal",   r:2, n:"Coleccionista",    d:"Consigue 25 PRs",                     chk:()=>contarPRs()>=25},
  {id:"pr50",    ic:"medal",   r:3, n:"Imparable en PRs", d:"Consigue 50 PRs",                     chk:()=>contarPRs()>=50},
  {id:"pr100",   ic:"trophy2", r:4, n:"Cazador de récords",d:"Consigue 100 PRs",                   chk:()=>contarPRs()>=100},
  {id:"pr3dia",  ic:"flame",   r:3, n:"Triplete",         d:"3 PRs en un mismo día",               chk:()=>maxPRsDia()>=3},

  /* ---------- FUERZA (1RM) ---------- */
  {id:"f100",    ic:"dumbbell",r:1, n:"Tres dígitos",     d:"1RM de 100 lb en cualquier ejercicio",chk:()=>mejorPR().best>=100},
  {id:"f200",    ic:"dumbbell",r:2, n:"200 lb",           d:"1RM de 200 lb",                       chk:()=>mejorPR().best>=200},
  {id:"f300",    ic:"medal",   r:3, n:"300 lb",           d:"1RM de 300 lb",                       chk:()=>mejorPR().best>=300},
  {id:"f400",    ic:"trophy2", r:4, n:"400 lb",           d:"1RM de 400 lb",                       chk:()=>mejorPR().best>=400},
  {id:"f500",    ic:"trophy2", r:5, n:"Club de las 500",  d:"1RM de 500 lb",                       chk:()=>mejorPR().best>=500},
  {id:"bw2x",    ic:"star",    r:3, n:"Doble de tu peso", d:"Levanta el doble de tu peso corporal",chk:()=>ratioPeso()>=2},

  /* ---------- NIVELES ---------- */
  {id:"lvl5",    ic:"star",    r:1, n:"Nivel 5",          d:"Alcanza el nivel 5",                  chk:()=>xpToLevel(calcXP()).level>=5},
  {id:"lvl10",   ic:"star",    r:2, n:"Nivel 10",         d:"Alcanza el nivel 10",                 chk:()=>xpToLevel(calcXP()).level>=10},
  {id:"lvl20",   ic:"star",    r:3, n:"Nivel 20",         d:"Alcanza el nivel 20",                 chk:()=>xpToLevel(calcXP()).level>=20},
  {id:"lvl30",   ic:"trophy2", r:4, n:"Nivel 30",         d:"Alcanza el nivel 30",                 chk:()=>xpToLevel(calcXP()).level>=30},

  /* ---------- MÚSCULOS Y EQUILIBRIO ---------- */
  {id:"todos",   ic:"target",  r:2, n:"Cuerpo completo",  d:"Entrena los 10 grupos musculares",    chk:()=>gruposEntrenados()>=10},
  {id:"balance", ic:"check2",  r:3, n:"Equilibrado",      d:"5 grupos en zona óptima esta semana", chk:()=>gruposOptimos()>=5},
  {id:"nopierna",ic:"bolt",    r:2, n:"No saltes pierna", d:"20 sesiones de pierna",               chk:()=>seriesDeGrupo("Cuádriceps")>=60},
  {id:"core",    ic:"shield",  r:2, n:"Núcleo de acero",  d:"100 series de core",                  chk:()=>seriesDeGrupo("Core")>=100},

  /* ---------- VARIEDAD ---------- */
  {id:"ex10",    ic:"book",    r:1, n:"Explorador",       d:"Prueba 10 ejercicios distintos",      chk:()=>ejerciciosDistintos()>=10},
  {id:"ex30",    ic:"book",    r:2, n:"Aventurero",       d:"Prueba 30 ejercicios distintos",      chk:()=>ejerciciosDistintos()>=30},
  {id:"ex60",    ic:"book",    r:3, n:"Enciclopedia",     d:"Prueba 60 ejercicios distintos",      chk:()=>ejerciciosDistintos()>=60},
  {id:"rutina1", ic:"edit",    r:2, n:"Arquitecto",       d:"Crea tu primera rutina personalizada",chk:()=>Object.keys(getMisRutinas()).length>=1},
  {id:"rutina3", ic:"edit",    r:3, n:"Entrenador",       d:"Crea 3 rutinas personalizadas",       chk:()=>Object.keys(getMisRutinas()).length>=3},

  /* ---------- HÁBITOS ---------- */
  {id:"perfil",  ic:"users",   r:1, n:"Tu cara",          d:"Personaliza tu perfil con una foto",  chk:()=>!!(getPerfil().avatar)},
  {id:"feel10",  ic:"bolt",    r:2, n:"Introspectivo",    d:"Registra 10 sensaciones post-entreno",chk:()=>getFeels().length>=10},
  {id:"rpe100",  ic:"chart",   r:2, n:"Auto-regulado",    d:"Registra RPE en 100 series",          chk:()=>conRPE()>=100},
  {id:"bw10",    ic:"target",  r:2, n:"Bajo control",     d:"Registra tu peso 10 veces",           chk:()=>getBW().length>=10},
  {id:"madrug",  ic:"clock",   r:2, n:"Madrugador",       d:"Entrena antes de las 7 AM",           chk:()=>entrenoAntesDe(7)},
  {id:"noctur",  ic:"clock",   r:2, n:"Nocturno",         d:"Entrena después de las 10 PM",        chk:()=>entrenoDespuesDe(22)},
  {id:"finde",   ic:"calendar",r:2, n:"Sin excusas",     d:"Entrena 10 fines de semana",          chk:()=>findesEntrenados()>=10},
  {id:"perfecta",ic:"trophy2", r:3, n:"Semana perfecta", d:"Completa todos los días de tu plan",  chk:()=>semanaPerfecta()},
];
/* Rarezas: 1 común · 2 raro · 3 épico · 4 legendario · 5 mítico */
const RAREZAS={
  1:{n:"Común",    c:"#7d8494"},
  2:{n:"Raro",     c:"#4DB8FF"},
  3:{n:"Épico",    c:"#a855f7"},
  4:{n:"Legendario",c:"#FFCC4D"},
  5:{n:"Mítico",   c:"#FF5470"},
};

/* ---- Funciones auxiliares de logros ---- */
function conRPE(){
  let n=0;
  allExercises().forEach(ex=>(DB[ex.id]||[]).forEach(e=>e.sets.forEach(s=>{if(s.rpe)n++})));
  return n;
}
function maxVolDia(){
  const dias={};
  allExercises().forEach(ex=>(DB[ex.id]||[]).forEach(e=>{
    dias[e.date]=(dias[e.date]||0)+volumen(e.sets);
  }));
  return Math.round(Math.max(0,...Object.values(dias),0));
}
function maxPRsDia(){
  const dias={};
  allExercises().forEach(ex=>{
    const h=DB[ex.id]||[];
    let best=0;
    h.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{
      const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));
      if(v>best&&best>0)dias[e.date]=(dias[e.date]||0)+1;
      if(v>best)best=v;
    });
  });
  return Math.max(0,...Object.values(dias),0);
}
function ejerciciosDistintos(){
  return allExercises().filter(ex=>(DB[ex.id]||[]).length>0).length;
}
function gruposEntrenados(){
  const g=new Set();
  allExercises().forEach(ex=>{
    if(!(DB[ex.id]||[]).length)return;
    Object.entries(musculosDe(ex.name)).forEach(([m,w])=>{if(w>=1)g.add(m)});
  });
  return g.size;
}
function gruposOptimos(){
  const v=seriesPorMusculo(7);
  return Object.values(v).filter(s=>s>=VOL_REC.min&&s<=VOL_REC.max).length;
}
function seriesDeGrupo(grupo){
  let n=0;
  allExercises().forEach(ex=>{
    const M=musculosDe(ex.name);
    if(!M[grupo]||M[grupo]<1)return;
    (DB[ex.id]||[]).forEach(e=>{n+=e.sets.filter(s=>s.w!==""||s.r!=="").length});
  });
  return n;
}
function ratioPeso(){
  const bw=getBW();
  if(!bw.length)return 0;
  const kg=parseFloat(bw[bw.length-1].v)||0;
  if(!kg)return 0;
  const lb=kg*2.20462;
  return mejorPR().best/lb;
}
function findesEntrenados(){
  const f=new Set();
  allExercises().forEach(ex=>(DB[ex.id]||[]).forEach(e=>{
    const d=new Date(e.date+"T00:00:00").getDay();
    if(d===0||d===6)f.add(e.date);
  }));
  return f.size;
}
function semanaPerfecta(){
  // ¿los últimos 7 días cubren todos los días con ejercicios del plan?
  const sem=rutinaSemana();
  const conEx=ALL_DAYS.filter(d=>sem[d]&&sem[d].ex&&sem[d].ex.length);
  if(!conEx.length)return false;
  const hoy=new Date();
  const hechos=new Set();
  getSesionesDone().forEach(s=>{
    const d=new Date(s.date+"T00:00:00");
    const dif=Math.round((hoy-d)/86400000);
    if(dif>=0&&dif<7&&s.day)hechos.add(s.day);
  });
  return conEx.every(d=>hechos.has(d));
}
function entrenoAntesDe(hora){
  let ok=false;
  allExercises().forEach(ex=>(DB[ex.id]||[]).forEach(e=>{
    if(!e.time)return;
    const h=parseInt(e.time.split(":")[0]);
    if(h<hora)ok=true;
  }));
  return ok;
}
function entrenoDespuesDe(hora){
  let ok=false;
  allExercises().forEach(ex=>(DB[ex.id]||[]).forEach(e=>{
    if(!e.time)return;
    const h=parseInt(e.time.split(":")[0]);
    if(h>=hora)ok=true;
  }));
  return ok;
}
function contarPRs(){let prs=0;allExercises().forEach(ex=>{const h=DB[ex.id];if(!h||h.length<2)return;
  let best=0;h.forEach(e=>{const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));if(v>best){if(best>0)prs++;best=v}})});return prs}
function logrosDesbloqueados(){return LOGROS.filter(l=>l.chk())}
// Guardamos qué logros ya notificamos para disparar confetti solo en el nuevo
const SEEN_KEY="stimpys_seen_logros";
function getSeen(){try{return JSON.parse(localStorage.getItem(SEEN_KEY))||[]}catch(e){return[]}}
function setSeen(a){localStorage.setItem(SEEN_KEY,JSON.stringify(a))}
function checkNuevosLogros(){
  const seen=getSeen();
  const now=logrosDesbloqueados().map(l=>l.id);
  const nuevos=now.filter(id=>!seen.includes(id));
  if(nuevos.length){setSeen(now);
    const l=LOGROS.find(x=>x.id===nuevos[0]);
    setTimeout(()=>mostrarLogro(l,nuevos.length),400);
  }
}
function mejorPR(){
  let best=0,name="—";
  allExercises().forEach(ex=>{const h=DB[ex.id];if(!h)return;
    h.forEach(e=>{const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));if(v>best){best=v;name=ex.name}})});
  return{best,name};
}
function fmtNum(n){return n>=1000?(n/1000).toFixed(1)+"k":String(n)}
/* peso corporal */
function getBW(){try{return JSON.parse(localStorage.getItem("stimpys_bw"))||[]}catch(e){return[]}}
function saveBW(a){localStorage.setItem("stimpys_bw",JSON.stringify(a))}

let progSel=null;
function renderProgreso(){
  const wrap=document.getElementById("tab-progreso");
  const exs=allExercises().filter(e=>DB[e.id]&&DB[e.id].length);
  if(!progSel&&exs.length)progSel=exs[0].id;
  const pr=mejorPR();
  let html=`<div class="sec-title">Progreso</div>
    <div class="dash">
      <div class="dcard"><div class="dn">${racha()}</div><div class="dl">Racha (días)</div></div>
      <div class="dcard"><div class="dn">${fmtNum(volumenSemana())}</div><div class="dl">Volumen 7 días (lb)</div></div>
      <div class="dcard"><div class="dn">${diasEntrenados()}</div><div class="dl">Días totales</div></div>
      <div class="dcard"><div class="dn">${totalRegistros()}</div><div class="dl">Registros</div></div>
    </div>`;
  // nivel y XP
  const xp=calcXP(),lv=xpToLevel(xp);
  html+=`<div class="level-card">
    <div class="level-top">
      <div class="level-badge">${lv.level}</div>
      <div class="level-info">
        <div class="level-name">${nivelTitulo(lv.level)}</div>
        <div class="level-xp">${xp.toLocaleString()} XP totales</div>
      </div>
      <div class="level-star">${ICON('bolt',22)}</div>
    </div>
    <div class="level-bar"><div class="level-fill" style="width:${lv.pct}%"></div></div>
    <div class="level-next">${lv.need-lv.cur} XP para nivel ${lv.level+1}</div>
  </div>`;
  // logros
  const desb=logrosDesbloqueados().map(l=>l.id);
  const pct=Math.round(desb.length/LOGROS.length*100);
  html+=`<div class="card-plain"><h5>Logros · ${desb.length}/${LOGROS.length}</h5>
    <div class="lg-prog"><div class="lg-prog-fill" style="width:${pct}%"></div></div>
    <div class="lg-prog-txt">${pct}% completado</div>`;
  // agrupados por rareza
  [1,2,3,4,5].forEach(r=>{
    const grupo=LOGROS.filter(l=>(l.r||1)===r);
    if(!grupo.length)return;
    const n=grupo.filter(l=>desb.includes(l.id)).length;
    const rar=RAREZAS[r];
    html+=`<div class="lg-sec" style="--rc:${rar.c}">
        <span class="lg-dot"></span>${rar.n}
        <span class="lg-sec-n">${n}/${grupo.length}</span>
      </div>
      <div class="logros-grid">${grupo.map(l=>{
        const on=desb.includes(l.id);
        return `<div class="logro-item${on?" on":""}" style="--rc:${rar.c}" title="${l.d}">
          <div class="logro-item-ic">${on?ICON(l.ic,22):ICON('lock',18)}</div>
          <div class="logro-item-n">${on?l.n:"?"}</div>
          <div class="logro-item-d">${l.d}</div></div>`;
      }).join("")}</div>`;
  });
  html+=`</div>`;
  if(pr.best>0)html+=`<div class="pr-hero"><div class="pr-hero-lbl">Tu mejor marca</div>
    <div class="pr-hero-val">${pr.best} lb <span>1RM</span></div><div class="pr-hero-ex">${pr.name}</div></div>`;
  // heatmap calendario
  // RESUMEN SEMANAL
  const rs=resumenSemanal();
  if(rs.sesiones>0){
    const dv=rs.deltaVol;
    html+=`<div class="week-card">
      <div class="wk-head">${ICON('calendar',16)}<span>Tu semana</span></div>
      <div class="wk-grid">
        <div><b>${rs.sesiones}</b><span>Sesiones</span></div>
        <div><b>${fmtNum(rs.vol)}</b><span>Volumen</span></div>
        <div><b>${rs.series}</b><span>Series</span></div>
        <div><b>${rs.prs}</b><span>Récords</span></div>
      </div>
      ${dv!==null?`<div class="wk-delta ${dv>=0?"up":"down"}">
        ${ICON(dv>=0?'up':'down',13)} ${dv>=0?"+":""}${dv}% de volumen vs. la semana pasada
      </div>`:""}
      <button class="wk-share" id="wkShare">${ICON('share',15)} Compartir mi semana</button>
    </div>`;
  }
  // MAPA CORPORAL DE RECUPERACIÓN
  html+=`<div class="card-plain"><h5>Recuperación muscular</h5>
    <div class="body-map" id="bodyMap"></div>
    <div class="bm-legend">
      <span><i style="background:var(--hot)"></i> En recuperación</span>
      <span><i style="background:var(--gold)"></i> Casi listo</span>
      <span><i style="background:var(--ok)"></i> Listo</span>
    </div>
    <div class="bm-info" id="bmInfo">Toca un músculo para ver detalles.</div>
  </div>`;
  // VOLUMEN SEMANAL POR MÚSCULO
  html+=`<div class="card-plain"><h5>Volumen semanal por músculo</h5>
    <div class="vol-sub">Series efectivas · últimos 7 días · óptimo ${VOL_REC.min}–${VOL_REC.max}</div>
    <div id="volMusc"></div></div>`;
  html+=`<div class="card-plain"><h5>Actividad · últimas 16 semanas</h5><div id="heatmap"></div></div>`;
  // peso corporal
  const bw=getBW();
  html+=`<div class="card-plain"><h5>Peso corporal</h5>
    <div class="bw-input"><input id="bwVal" inputmode="decimal" placeholder="Ej. 79"><span>kg</span>
      <button class="btn btn-save" id="bwSave" style="flex:0 0 auto;padding:11px 18px">Registrar</button></div>
    <div id="bwChart"></div></div>`;
  if(exs.length){
    let opts=exs.map(e=>`<option value="${e.id}"${e.id===progSel?" selected":""}>${e.name} (${e.day})</option>`).join("");
    html+=`<select class="pick" id="progPick">${opts}</select>
      <div class="card-plain"><h5 id="t1rm">1RM estimado</h5><div id="c1rm"></div></div>
      <div class="card-plain"><h5>Volumen por día (lb)</h5><div id="cvol"></div></div>`;
  }else{
    html+=`<div class="empty">Aún no hay datos de ejercicios. Guarda series en Entreno para ver tus gráficas de fuerza.</div>`;
  }
  wrap.innerHTML=html;
  // eventos peso corporal
  document.getElementById("bwSave").onclick=()=>{
    const v=parseFloat(document.getElementById("bwVal").value);
    if(!v||v<=0){return}
    const{iso,time}=nowStamp();const arr=getBW();
    const i=arr.findIndex(x=>x.date===iso);
    if(i>=0)arr[i]={date:iso,time,v};else arr.push({date:iso,time,v});
    arr.sort((a,b)=>a.date<b.date?-1:1);saveBW(arr);renderProgreso();
  };
  const wkS=document.getElementById("wkShare");
  if(wkS)wkS.onclick=()=>{if(typeof abrirResumenSemanal==="function")abrirResumenSemanal()};
  drawBW();
  drawBodyMap();
  drawVolMusc();
  drawHeatmap();
  if(exs.length){document.getElementById("progPick").onchange=e=>{progSel=e.target.value;renderProgreso()};drawProgCharts()}
}

function drawBodyMap(){
  const el=document.getElementById("bodyMap");if(!el)return;
  const rec=recuperacionMuscular();
  const col=m=>{const e=estadoMusculo(rec[m].dias);return e.col};
  // Cuerpo estilizado: frente y espalda
  el.innerHTML=`
  <svg viewBox="0 0 300 210" class="bm-svg">
    <!-- FRENTE -->
    <g class="bm-side">
      <text x="72" y="12" class="bm-lbl">FRENTE</text>
      <!-- cabeza -->
      <circle cx="72" cy="30" r="10" fill="#2a2e3d"/>
      <!-- cuello -->
      <rect x="68" y="39" width="8" height="6" fill="#2a2e3d"/>
      <!-- hombros -->
      <ellipse class="m" data-m="Hombro" cx="52" cy="52" rx="9" ry="8" fill="${col('Hombro')}"/>
      <ellipse class="m" data-m="Hombro" cx="92" cy="52" rx="9" ry="8" fill="${col('Hombro')}"/>
      <!-- pecho -->
      <path class="m" data-m="Pecho" d="M60 47 h24 q6 0 6 7 v10 q0 6 -6 6 h-24 q-6 0 -6 -6 v-10 q0 -7 6 -7z" fill="${col('Pecho')}"/>
      <!-- biceps -->
      <ellipse class="m" data-m="Bíceps" cx="46" cy="70" rx="6" ry="11" fill="${col('Bíceps')}"/>
      <ellipse class="m" data-m="Bíceps" cx="98" cy="70" rx="6" ry="11" fill="${col('Bíceps')}"/>
      <!-- core -->
      <rect class="m" data-m="Core" x="60" y="71" width="24" height="24" rx="4" fill="${col('Core')}"/>
      <!-- antebrazo -->
      <rect x="42" y="82" width="8" height="18" rx="4" fill="#2a2e3d"/>
      <rect x="94" y="82" width="8" height="18" rx="4" fill="#2a2e3d"/>
      <!-- cuadriceps -->
      <path class="m" data-m="Cuádriceps" d="M58 97 h10 v34 q0 5 -5 5 t-5 -5z" fill="${col('Cuádriceps')}"/>
      <path class="m" data-m="Cuádriceps" d="M76 97 h10 v34 q0 5 -5 5 t-5 -5z" fill="${col('Cuádriceps')}"/>
      <!-- gemelos -->
      <ellipse class="m" data-m="Gemelo" cx="63" cy="152" rx="6" ry="13" fill="${col('Gemelo')}"/>
      <ellipse class="m" data-m="Gemelo" cx="81" cy="152" rx="6" ry="13" fill="${col('Gemelo')}"/>
      <rect x="59" y="168" width="8" height="8" rx="2" fill="#2a2e3d"/>
      <rect x="77" y="168" width="8" height="8" rx="2" fill="#2a2e3d"/>
    </g>
    <!-- ESPALDA -->
    <g class="bm-side">
      <text x="212" y="12" class="bm-lbl">ESPALDA</text>
      <circle cx="212" cy="30" r="10" fill="#2a2e3d"/>
      <rect x="208" y="39" width="8" height="6" fill="#2a2e3d"/>
      <!-- hombro post -->
      <ellipse class="m" data-m="Hombro" cx="192" cy="52" rx="9" ry="8" fill="${col('Hombro')}"/>
      <ellipse class="m" data-m="Hombro" cx="232" cy="52" rx="9" ry="8" fill="${col('Hombro')}"/>
      <!-- espalda -->
      <path class="m" data-m="Espalda" d="M200 46 h24 q7 0 7 8 l-3 22 q-1 6 -7 6 h-18 q-6 0 -7 -6 l-3 -22 q0 -8 7 -8z" fill="${col('Espalda')}"/>
      <!-- triceps -->
      <ellipse class="m" data-m="Tríceps" cx="186" cy="70" rx="6" ry="11" fill="${col('Tríceps')}"/>
      <ellipse class="m" data-m="Tríceps" cx="238" cy="70" rx="6" ry="11" fill="${col('Tríceps')}"/>
      <rect x="182" y="82" width="8" height="18" rx="4" fill="#2a2e3d"/>
      <rect x="234" y="82" width="8" height="18" rx="4" fill="#2a2e3d"/>
      <!-- gluteo -->
      <path class="m" data-m="Glúteo" d="M198 84 h28 q5 0 5 6 v8 q0 5 -5 5 h-28 q-5 0 -5 -5 v-8 q0 -6 5 -6z" fill="${col('Glúteo')}"/>
      <!-- femoral -->
      <path class="m" data-m="Femoral" d="M198 105 h10 v30 q0 5 -5 5 t-5 -5z" fill="${col('Femoral')}"/>
      <path class="m" data-m="Femoral" d="M216 105 h10 v30 q0 5 -5 5 t-5 -5z" fill="${col('Femoral')}"/>
      <!-- gemelos -->
      <ellipse class="m" data-m="Gemelo" cx="203" cy="155" rx="6" ry="13" fill="${col('Gemelo')}"/>
      <ellipse class="m" data-m="Gemelo" cx="221" cy="155" rx="6" ry="13" fill="${col('Gemelo')}"/>
      <rect x="199" y="171" width="8" height="8" rx="2" fill="#2a2e3d"/>
      <rect x="217" y="171" width="8" height="8" rx="2" fill="#2a2e3d"/>
    </g>
  </svg>`;
  // interacción
  el.querySelectorAll(".m").forEach(p=>{
    p.onclick=()=>{
      const m=p.dataset.m;
      const r=rec[m];const e=estadoMusculo(r.dias);
      const vol=seriesPorMusculo(7)[m]||0;
      const info=document.getElementById("bmInfo");
      info.innerHTML=`<b style="color:${e.col}">${m}</b> · ${e.txt}<br>
        <small>${r.dias===null?"Sin registros aún":
          r.dias===0?"Entrenado hoy":r.dias===1?"Entrenado ayer":"Hace "+r.dias+" días"}
        ${vol?" · "+vol+" series esta semana":""}</small>`;
      el.querySelectorAll(".m").forEach(x=>x.classList.remove("sel"));
      el.querySelectorAll(`.m[data-m="${m}"]`).forEach(x=>x.classList.add("sel"));
      if(navigator.vibrate)navigator.vibrate(12);
    };
  });
}

/* ============ VOLUMEN SEMANAL POR MÚSCULO ============ */
function drawVolMusc(){
  const el=document.getElementById("volMusc");if(!el)return;
  const v=seriesPorMusculo(7);
  const max=Math.max(VOL_REC.max+6,...Object.values(v));
  const rows=MUSCULOS.map(m=>{
    const s=v[m]||0;
    let cls="low",txt="Bajo";
    if(s>=VOL_REC.min&&s<=VOL_REC.max){cls="ok";txt="Óptimo"}
    else if(s>VOL_REC.max){cls="high";txt="Exceso"}
    else if(s===0){cls="none";txt="Sin trabajar"}
    const pct=Math.min(100,s/max*100);
    const zMin=VOL_REC.min/max*100, zMax=VOL_REC.max/max*100;
    return `<div class="vm-row">
      <div class="vm-name">${m}</div>
      <div class="vm-bar">
        <div class="vm-zone" style="left:${zMin}%;width:${zMax-zMin}%"></div>
        <div class="vm-fill ${cls}" style="width:${pct}%"></div>
      </div>
      <div class="vm-val ${cls}">${s}<small>${txt}</small></div>
    </div>`;
  }).join("");
  el.innerHTML=rows;
}

function drawHeatmap(){
  const el=document.getElementById("heatmap");if(!el)return;
  const set=new Set(allDates());
  // volumen por fecha para intensidad
  const volByDate={};
  Object.values(DB).forEach(a=>{if(Array.isArray(a))a.forEach(e=>{volByDate[e.date]=(volByDate[e.date]||0)+volumen(e.sets)});});
  const maxVol=Math.max(1,...Object.values(volByDate));
  const weeks=16,today=new Date();
  // alinear al domingo de hace 16 semanas
  const start=new Date(today);start.setDate(today.getDate()-(weeks*7-1));
  let cells="";const dayLabels=["","L","","M","","V",""];
  let grid=`<div class="hm-grid">`;
  for(let w=0;w<weeks;w++){
    grid+=`<div class="hm-col">`;
    for(let d=0;d<7;d++){
      const cur=new Date(start);cur.setDate(start.getDate()+w*7+d);
      if(cur>today){grid+=`<div class="hm-cell empty"></div>`;continue}
      const iso=cur.getFullYear()+"-"+String(cur.getMonth()+1).padStart(2,"0")+"-"+String(cur.getDate()).padStart(2,"0");
      if(isSkipDay(iso)){grid+=`<div class="hm-cell skipped" title="${iso} · saltado"></div>`;continue}
      let lvl=0;
      if(set.has(iso)){const v=volByDate[iso]||0;lvl=v>=maxVol*0.66?4:v>=maxVol*0.33?3:v>0?2:1;}
      grid+=`<div class="hm-cell l${lvl}" title="${iso}"></div>`;
    }
    grid+=`</div>`;
  }
  grid+=`</div>`;
  el.innerHTML=grid+`<div class="hm-legend"><span>Menos</span><div class="hm-cell l1"></div><div class="hm-cell l2"></div><div class="hm-cell l3"></div><div class="hm-cell l4"></div><span>Más</span></div>`;
}
function drawBW(){
  const el=document.getElementById("bwChart");if(!el)return;
  const bw=getBW();
  if(!bw.length){el.innerHTML=`<div class="empty" style="padding:12px 0">Registra tu peso para ver la tendencia.</div>`;return}
  el.appendChild(lineChart(bw.map(x=>({d:x.date,v:x.v})),-1,"kg"));
}
function drawProgCharts(){
  const hist=DB[progSel]||[];
  const oneRM=hist.map(e=>({d:e.date,v:Math.max(0,...e.sets.map(s=>epley(s.w,s.r)))})).filter(p=>p.v>0);
  const vol=hist.map(e=>({d:e.date,v:Math.round(volumen(e.sets))})).filter(p=>p.v>0);
  const pr=oneRM.length?Math.max(...oneRM.map(p=>p.v)):0;
  const prIdx=oneRM.findIndex(p=>p.v===pr);
  document.getElementById("t1rm").innerHTML=`1RM estimado`+(pr?` <span class="pr-badge">PR ${pr} lb</span>`:"");
  document.getElementById("c1rm").appendChild(lineChart(oneRM,prIdx,"lb"));
  document.getElementById("cvol").appendChild(barChart(vol));
}

const BANNERS={
  azul:{n:"Azul",css:"linear-gradient(135deg,#1a3a8f,#2b5cff,#4db8ff)"},
  fuego:{n:"Fuego",css:"linear-gradient(135deg,#7a1f1f,#ff5470,#ffcc4d)"},
  esmeralda:{n:"Esmeralda",css:"linear-gradient(135deg,#064e3b,#00d09c,#4ade80)"},
  oro:{n:"Oro",css:"linear-gradient(135deg,#78350f,#ffcc4d,#fef3c7)"},
  purpura:{n:"Púrpura",css:"linear-gradient(135deg,#4c1d95,#8b5cf6,#c4b5fd)"},
  medianoche:{n:"Medianoche",css:"linear-gradient(135deg,#0a0a0c,#1e293b,#334155)"},
  neon:{n:"Neón",css:"linear-gradient(135deg,#2b5cff,#ff5470,#00d09c)"},
  acero:{n:"Acero",css:"linear-gradient(135deg,#1f2937,#6b7280,#d1d5db)"},
};
const SHOWCASES={
  stats:{n:"Estadísticas",ic:"chart"},
  logros:{n:"Insignias",ic:"medal"},
  pr:{n:"Mejor marca",ic:"trophy2"},
  cuerpo:{n:"Recuperación",ic:"target"},
  semana:{n:"Esta semana",ic:"calendar"},
  records:{n:"Récords",ic:"flame"},
};

const PF_KEY="stimpys_perfil";
function getPerfil(){try{return JSON.parse(localStorage.getItem(PF_KEY))||{}}catch(e){return{}}}
function setPerfil(p){localStorage.setItem(PF_KEY,JSON.stringify(p))}

function misStats(){
  const xp=calcXP(),lv=xpToLevel(xp),pr=mejorPR();
  return {
    nivel:lv.level,xp,titulo:nivelTitulo(lv.level),
    logros:logrosDesbloqueados().map(l=>l.id),
    racha:racha(),pr:pr.best,prEx:pr.name,
    volumen:volumenTotal(),dias:diasEntrenados()
  };
}

let pfViendo=null; // perfil que se está viendo

async function abrirPerfil(userId){
  const el=document.getElementById("profile");
  el.classList.add("show");
  document.body.style.overflow="hidden";
  document.getElementById("pfBody").innerHTML=`<div class="pf-loading">${ICON('bolt',22)} Cargando perfil...</div>`;
  const auth=getAuth();
  const esMio=!userId||(auth&&userId===auth.id);
  try{
    let p;
    if(esMio&&auth&&API_BASE){
      // 1) BAJAR primero: el servidor es la fuente de verdad de MI perfil
      const r=await apiCall("/api/profile","GET",null,auth.token);
      p=r.profile;
      // 2) Guardar en local solo lo que vino del servidor (así nunca queda
      //    la foto ni la bio de otra cuenta que usó este dispositivo)
      setPerfil({
        nombre:p.nombre||"",avatar:p.avatar||"",bio:p.bio||"",
        banner:p.banner||"azul",insigniaDestacada:p.insigniaDestacada||"",
        showcases:p.showcases||["stats","logros","pr"]
      });
      // 3) Subir solo los stats calculados (que sí dependen de mis entrenos)
      apiCall("/api/profile","POST",{stats:misStats()},auth.token).catch(()=>{});
      p.stats=misStats();
    }else if(userId&&API_BASE){
      const r=await apiCall("/api/profile?id="+encodeURIComponent(userId),"GET",null,auth?auth.token:null);
      p=r.profile;
    }else{
      // modo local sin cuenta
      const local=getPerfil();
      p={id:"local",nombre:local.nombre||"Atleta",avatar:local.avatar||"",bio:local.bio||"",
        banner:local.banner||"azul",insigniaDestacada:local.insigniaDestacada||"",
        showcases:local.showcases||["stats","logros","pr"],
        stats:misStats(),online:true,esMio:true,miembroDesde:null};
    }
    pfViendo=p;
    pintarPerfil(p,esMio||p.esMio);
  }catch(e){
    document.getElementById("pfBody").innerHTML=`<div class="pf-loading">${e.message}</div>`;
  }
}
function cerrarPerfil(){
  document.getElementById("profile").classList.remove("show");
  document.body.style.overflow="";
  pfViendo=null;
}

function pintarPerfil(p,esMio){
  const st=p.stats||{};
  const bn=BANNERS[p.banner]||BANNERS.azul;
  document.getElementById("pfBanner").style.background=bn.css;
  document.getElementById("pfEdit").style.display=esMio?"grid":"none";
  const lv=st.nivel||1;
  const logrosIds=st.logros||[];
  const insignia=LOGROS.find(l=>l.id===p.insigniaDestacada);
  const shows=p.showcases&&p.showcases.length?p.showcases:["stats","logros","pr"];

  let html=`
    <div class="pf-top">
      <div class="pf-avatar ${p.online?"online":""}">
        ${p.avatar?`<img src="${p.avatar}" alt="">`:`<div class="pf-av-ph">${(p.nombre||"A").charAt(0).toUpperCase()}</div>`}
        <div class="pf-lvl">${lv}</div>
      </div>
      <div class="pf-id">
        <div class="pf-name">${p.nombre||"Atleta"}
          ${insignia?`<span class="pf-insig" title="${insignia.n}">${ICON(insignia.ic,14)}</span>`:""}
        </div>
        <div class="pf-title">${st.titulo||"Novato"} · Nivel ${lv}</div>
        <div class="pf-status ${p.online?"on":""}">${p.online?"En línea":"Desconectado"}</div>
      </div>
    </div>`;

  if(p.bio)html+=`<div class="pf-bio"><div class="pf-bio-t">Sobre mí</div>${escapeHtml(p.bio)}</div>`;

  // VITRINAS
  shows.forEach(s=>{
    if(s==="stats"){
      html+=`<div class="pf-show">
        <div class="pf-show-t">${ICON('chart',13)} Estadísticas</div>
        <div class="pf-stats">
          <div><b>${fmtNum(st.volumen||0)}</b><span>Volumen total</span></div>
          <div><b>${st.dias||0}</b><span>Días entrenados</span></div>
          <div><b>${st.racha||0}</b><span>Racha</span></div>
          <div><b>${fmtNum(st.xp||0)}</b><span>XP</span></div>
        </div></div>`;
    }
    if(s==="pr"&&st.pr){
      html+=`<div class="pf-show">
        <div class="pf-show-t">${ICON('trophy2',13)} Mejor marca</div>
        <div class="pf-pr"><div class="pf-pr-v">${st.pr}<small>lb 1RM</small></div>
          <div class="pf-pr-n">${st.prEx||""}</div></div></div>`;
    }
    if(s==="logros"){
      const desb=LOGROS.filter(l=>logrosIds.includes(l.id));
      html+=`<div class="pf-show">
        <div class="pf-show-t">${ICON('medal',13)} Insignias · ${desb.length}/${LOGROS.length}</div>
        <div class="pf-badges">${desb.length?desb.map(l=>`
          <div class="pf-badge" title="${l.n}">
            <div class="pf-badge-ic">${ICON(l.ic,18)}</div>
            <span>${l.n}</span>
          </div>`).join(""):`<div class="pf-empty">Aún sin insignias</div>`}
        </div></div>`;
    }
    if(s==="semana"&&esMio){
      const rs=resumenSemanal();
      html+=`<div class="pf-show">
        <div class="pf-show-t">${ICON('calendar',13)} Esta semana</div>
        <div class="pf-stats">
          <div><b>${rs.sesiones}</b><span>Sesiones</span></div>
          <div><b>${fmtNum(rs.vol)}</b><span>Volumen</span></div>
          <div><b>${rs.series}</b><span>Series</span></div>
          <div><b>${rs.prs}</b><span>Récords</span></div>
        </div></div>`;
    }
    if(s==="cuerpo"&&esMio){
      const v=seriesPorMusculo(7);
      const top=Object.entries(v).filter(([m,s])=>s>0).sort((a,b)=>b[1]-a[1]).slice(0,5);
      html+=`<div class="pf-show">
        <div class="pf-show-t">${ICON('target',13)} Músculos más trabajados</div>
        ${top.length?top.map(([m,s])=>`<div class="pf-musc"><span>${m}</span><b>${s} series</b></div>`).join(""):`<div class="pf-empty">Sin datos esta semana</div>`}
      </div>`;
    }
    if(s==="records"&&esMio){
      const exs=allExercises().filter(ex=>(DB[ex.id]||[]).length);
      const tops=exs.map(ex=>({n:ex.name,v:Math.max(0,...(DB[ex.id]||[]).map(e=>Math.max(0,...e.sets.map(x=>epley(x.w,x.r)))))}))
        .filter(x=>x.v>0).sort((a,b)=>b.v-a.v).slice(0,5);
      html+=`<div class="pf-show">
        <div class="pf-show-t">${ICON('flame',13)} Top récords</div>
        ${tops.length?tops.map(t=>`<div class="pf-musc"><span>${t.n}</span><b>${t.v} lb</b></div>`).join(""):`<div class="pf-empty">Sin récords aún</div>`}
      </div>`;
    }
  });

  if(p.miembroDesde){
    const d=new Date(p.miembroDesde);
    html+=`<div class="pf-since">Miembro desde ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}</div>`;
  }
  document.getElementById("pfBody").innerHTML=html;
}
function escapeHtml(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML.replace(/\n/g,"<br>")}

/* ---- Editor de perfil ---- */
function abrirEditor(){
  const local=getPerfil();
  const auth=getAuth();
  document.getElementById("pfeName").value=(auth&&auth.name)||local.nombre||"";
  document.getElementById("pfeBio").value=local.bio||"";
  document.getElementById("pfeCount").textContent=(local.bio||"").length+" / 300";
  pintarAvatarEditor(local.avatar);
  // banners
  const bw=document.getElementById("pfeBanners");
  bw.innerHTML=Object.entries(BANNERS).map(([k,v])=>
    `<button class="pfe-bn${(local.banner||"azul")===k?" on":""}" data-b="${k}" style="background:${v.css}" title="${v.n}"></button>`).join("");
  bw.querySelectorAll(".pfe-bn").forEach(b=>b.onclick=()=>{
    bw.querySelectorAll(".pfe-bn").forEach(x=>x.classList.remove("on"));
    b.classList.add("on");
  });
  // insignias
  const desb=logrosDesbloqueados();
  const bg=document.getElementById("pfeBadges");
  bg.innerHTML=desb.length?desb.map(l=>
    `<button class="pfe-bg${local.insigniaDestacada===l.id?" on":""}" data-i="${l.id}" title="${l.n}">${ICON(l.ic,18)}</button>`).join("")
    :`<div class="pf-empty">Gana insignias entrenando para poder destacarlas.</div>`;
  bg.querySelectorAll(".pfe-bg").forEach(b=>b.onclick=()=>{
    const yaOn=b.classList.contains("on");
    bg.querySelectorAll(".pfe-bg").forEach(x=>x.classList.remove("on"));
    if(!yaOn)b.classList.add("on");
  });
  // showcases
  const sel=local.showcases||["stats","logros","pr"];
  const sw=document.getElementById("pfeShows");
  sw.innerHTML=Object.entries(SHOWCASES).map(([k,v])=>
    `<button class="pfe-sh${sel.includes(k)?" on":""}" data-s="${k}">${ICON(v.ic,14)} ${v.n}</button>`).join("");
  sw.querySelectorAll(".pfe-sh").forEach(b=>b.onclick=()=>{
    const on=b.classList.contains("on");
    const n=sw.querySelectorAll(".pfe-sh.on").length;
    if(!on&&n>=4){flashMsg("Máximo 4 vitrinas");return}
    b.classList.toggle("on");
  });
  document.getElementById("pfeMsg").textContent="";
  document.getElementById("pfEditor").classList.add("show");
}
function cerrarEditor(){document.getElementById("pfEditor").classList.remove("show")}
let pfeAvatarData=null;
function pintarAvatarEditor(data){
  pfeAvatarData=data||null;
  const el=document.getElementById("pfeAvatar");
  el.innerHTML=data?`<img src="${data}">`:`<div class="pf-av-ph">?</div>`;
}
document.getElementById("pfePick").onclick=()=>document.getElementById("pfeFile").click();
document.getElementById("pfeClear").onclick=()=>pintarAvatarEditor(null);
document.getElementById("pfeFile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  if(!/^image\//.test(f.type)){flashMsg("Elige una imagen");return}
  // redimensionar a 256x256 para que pese poco
  const img=new Image();
  const rd=new FileReader();
  rd.onload=()=>{
    img.onload=()=>{
      const S=256;
      const cv=document.createElement("canvas");cv.width=S;cv.height=S;
      const cx=cv.getContext("2d");
      const min=Math.min(img.width,img.height);
      cx.drawImage(img,(img.width-min)/2,(img.height-min)/2,min,min,0,0,S,S);
      pintarAvatarEditor(cv.toDataURL("image/jpeg",0.82));
    };
    img.src=rd.result;
  };
  rd.readAsDataURL(f);
  e.target.value="";
};
document.getElementById("pfeBio").oninput=e=>{
  document.getElementById("pfeCount").textContent=e.target.value.length+" / 300";
};
document.getElementById("pfeClose").onclick=cerrarEditor;
document.getElementById("pfEditor").onclick=e=>{if(e.target.id==="pfEditor")cerrarEditor()};
document.getElementById("pfeSave").onclick=async()=>{
  const name=document.getElementById("pfeName").value.trim();
  const bio=document.getElementById("pfeBio").value;
  const errN=document.getElementById("pfeErrName");
  errN.textContent="";
  if(name.length<2){errN.textContent="Escribe tu nombre (mínimo 2 caracteres)";return}
  const bnEl=document.querySelector(".pfe-bn.on");
  const banner=bnEl?bnEl.dataset.b:"azul";
  const bgEl=document.querySelector(".pfe-bg.on");
  const insignia=bgEl?bgEl.dataset.i:"";
  const shows=[...document.querySelectorAll(".pfe-sh.on")].map(b=>b.dataset.s);
  const perfil={nombre:name,bio,banner,insigniaDestacada:insignia,
    showcases:shows.length?shows:["stats","logros","pr"],avatar:pfeAvatarData||""};
  setPerfil(perfil);
  const btn=document.getElementById("pfeSave");
  const msg=document.getElementById("pfeMsg");
  const auth=getAuth();
  if(auth&&API_BASE){
    btn.disabled=true;btn.textContent="Guardando...";
    try{
      await apiCall("/api/profile","POST",{...perfil,stats:misStats()},auth.token);
      setAuth({...auth,name});
      msg.className="auth-msg ok";msg.textContent="Perfil guardado";
      soundSave();
      setTimeout(()=>{cerrarEditor();abrirPerfil();},600);
    }catch(e){
      msg.className="auth-msg error";msg.textContent=e.message;
    }finally{btn.disabled=false;btn.textContent="Guardar perfil"}
  }else{
    flashMsg("Perfil guardado (solo en este dispositivo)");
    cerrarEditor();abrirPerfil();
  }
};
document.getElementById("pfBack").onclick=cerrarPerfil;
document.getElementById("pfEdit").onclick=abrirEditor;

/* ============ AUTENTICACIÓN Y SYNC ============ */

function iniciales(n){return (n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"?"}
function haceCuanto(iso){
  if(!iso)return "nunca";
  const s=Math.floor((Date.now()-new Date(iso).getTime())/1000);
  if(s<60)return "hace instantes";
  const m=Math.floor(s/60);if(m<60)return `hace ${m} min`;
  const h=Math.floor(m/60);if(h<24)return `hace ${h} h`;
  const d=Math.floor(h/24);if(d<30)return `hace ${d} d`;
  return new Date(iso).toLocaleDateString();
}
let _usersCache=[];

async function renderUsuarios(){
  const wrap=document.getElementById("tab-usuarios");
  const auth=getAuth();
  if(!auth){wrap.innerHTML=`<div class="us-empty">Inicia sesión para ver la comunidad.</div>`;return}
  wrap.innerHTML=`<div class="sec-title">Comunidad</div><div class="us-empty">Cargando usuarios...</div>`;
  try{
    const res=await apiCall("/api/users","GET",null,auth.token);
    _usersCache=res.users||[];
    paintUsersList(res.onlineCount||0);
  }catch(e){
    wrap.innerHTML=`<div class="sec-title">Comunidad</div><div class="us-empty">No se pudo cargar: ${e.message}</div>`;
  }
}

function paintUsersList(onlineCount){
  const wrap=document.getElementById("tab-usuarios");
  if(!_usersCache.length){wrap.innerHTML=`<div class="us-empty">Aún no hay usuarios.</div>`;return}
  let h=`<div class="us-head"><div class="sec-title" style="margin:0">Comunidad · ${_usersCache.length}</div>
    <div class="us-online-pill"><span class="dot on"></span><b>${onlineCount}</b> en línea</div></div>`;
  _usersCache.forEach(u=>{
    h+=`<div class="us-card${u.me?" me":""}" data-uid="${u.id}">
      <div class="us-av">${iniciales(u.name)}<span class="dot ${u.online?"on":""}"></span></div>
      <div class="us-info">
        <div class="us-name">${u.name||"Sin nombre"}${u.me?`<span class="tagme">TÚ</span>`:""}</div>
        <div class="us-sub">${u.online?"En línea ahora":"Últ. vez "+haceCuanto(u.lastSeen)}</div>
      </div>
      <div class="us-mini">
        <div><b>${u.stats.mejorPR}</b><span>PR</span></div>
        <div><b>${u.stats.racha}</b><span>Racha</span></div>
      </div>
    </div>`;
  });
  wrap.innerHTML=h;
  wrap.querySelectorAll(".us-card").forEach(c=>{
    c.onclick=()=>abrirPerfil(c.dataset.uid);
  });
}

function renderUserDetail(uid){
  const wrap=document.getElementById("tab-usuarios");
  const u=_usersCache.find(x=>x.id===uid);
  if(!u)return renderUsuarios();
  const s=u.stats;
  wrap.innerHTML=`
    <button class="us-backb" id="usBack">${ICON('back',18)} Volver</button>
    <div class="ud-top">
      <div class="ud-av">${iniciales(u.name)}<span class="dot ${u.online?"on":""}"></span></div>
      <div>
        <div class="ud-name">${u.name||"Sin nombre"}${u.me?" (tú)":""}</div>
        <div class="ud-status ${u.online?"on":""}"><span class="dot ${u.online?"on":""}"></span>${u.online?"En línea ahora":"Últ. vez "+haceCuanto(u.lastSeen)}</div>
      </div>
    </div>
    <div class="ud-grid">
      <div class="ud-stat"><b>${s.mejorPR}</b><span>Mejor PR (lb)</span></div>
      <div class="ud-stat"><b>${s.racha}</b><span>Racha (días)</span></div>
      <div class="ud-stat"><b>${s.diasEntrenados}</b><span>Días entrenados</span></div>
      <div class="ud-stat"><b>${s.registros}</b><span>Registros</span></div>
      <div class="ud-stat"><b>${fmtNum(s.volumenTotal)}</b><span>Volumen total (lb)</span></div>
      <div class="ud-stat"><b>${u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</b><span>Miembro desde</span></div>
    </div>`;
  document.getElementById("usBack").onclick=()=>renderUsuarios();
}

