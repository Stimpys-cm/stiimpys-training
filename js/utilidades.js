/**
 * utilidades.js — Funciones puras de soporte
 */
function fmtT(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}

function nowStamp(){const d=new Date();
  return{iso:d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),
    time:String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}}

function fmtDate(iso){const[y,m,d]=iso.split("-");return d+" "+MESES[+m-1]}
function fmtDateFull(iso){const[y,m,d]=iso.split("-");return d+" "+MESES[+m-1]+" "+y}
function epley(w,r){w=parseFloat(w)||0;r=parseFloat(r)||0;if(!w||!r)return 0;return Math.round(w*(1+r/30))}

function volumen(sets){return sets.reduce((t,s)=>t+(parseFloat(s.w)||0)*(parseFloat(s.r)||0),0)}

function fmtNum(n){return n>=1000?(n/1000).toFixed(1)+"k":String(n)}

function estrellas(n){let s="";for(let i=0;i<5;i++)s+=i<n?"●":"○";return s}

function tipoEjercicio(ex){
  const s=(ex.s||"").toLowerCase();
  if(/min/.test(s))return {tipo:"tiempo",unidad:"min",labelRep:"min",sinPeso:true};
  if(/\d+\s*s\b|seg/.test(s))return {tipo:"tiempo",unidad:"seg",labelRep:"seg",sinPeso:true};
  if(/máx|max/.test(s))return {tipo:"reps",unidad:"reps",labelRep:"reps",sinPeso:false};
  return {tipo:"reps",unidad:"reps",labelRep:"reps",sinPeso:false};
}

/* Refrescar el contador del botón concluir sin re-renderizar toda la lista */

function musculosDe(nombre){
  const M={};
  const add=(m,w)=>{M[m]=Math.max(M[m]||0,w)};
  // 1) Buscar en la librería (fuente de verdad)
  const info=typeof ejPorNombre==="function"?ejPorNombre(nombre):null;
  if(info){
    if(info.g==="Cardio")return {};
    if(info.g==="Cuerpo completo"){
      add("Pierna",1);add("Espalda",.5);add("Hombro",.5);add("Core",.5);
      // mapear "Pierna" a cuádriceps
      delete M["Pierna"];add("Cuádriceps",1);add("Glúteo",.5);
      return M;
    }
    if(MUSCULOS.includes(info.g))add(info.g,1);
    // secundarios desde el texto de músculos
    const mm=(info.m||"").toLowerCase();
    if(/tríceps|triceps/.test(mm)&&info.g!=="Tríceps")add("Tríceps",.5);
    if(/bíceps|biceps|braquial/.test(mm)&&info.g!=="Bíceps")add("Bíceps",.5);
    if(/hombro|deltoide/.test(mm)&&info.g!=="Hombro")add("Hombro",.5);
    if(/glúteo|gluteo/.test(mm)&&info.g!=="Glúteo")add("Glúteo",.5);
    if(/femoral|isquio/.test(mm)&&info.g!=="Femoral")add("Femoral",.5);
    if(/cuádriceps|cuadriceps/.test(mm)&&info.g!=="Cuádriceps")add("Cuádriceps",.5);
    if(/core|abdominal|transverso|oblicuo/.test(mm)&&info.g!=="Core")add("Core",.5);
    if(/dorsal|espalda|romboides|trapecio/.test(mm)&&info.g!=="Espalda")add("Espalda",.5);
    if(/pectoral/.test(mm)&&info.g!=="Pecho")add("Pecho",.5);
    if(Object.keys(M).length)return M;
  }
  // 2) Fallback: heurística por nombre (ejercicios que no estén en la librería)
  const n=(nombre||"").toLowerCase();
  // Pecho
  if(/press (plano|inclinado|banca|declinado)|pec-?fly|apertura|flexion|fondo|pullover|press de pecho/.test(n)){
    add("Pecho",1);add("Tríceps",.5);add("Hombro",.5);
  }
  // Espalda
  if(/jal[oó]n|domina|remo|pull-?up|peso muerto|pullover|encogimiento|face pull/.test(n)){
    add("Espalda",1);
    if(/remo|jal[oó]n|domina/.test(n))add("Bíceps",.5);
    if(/peso muerto/.test(n)){add("Femoral",1);add("Glúteo",1);add("Core",.5)}
    if(/encogimiento/.test(n)){M["Espalda"]=1}
  }
  // Hombro
  if(/press (militar|arnold|de hombro)|elevaci[oó]n(es)? lateral|p[aá]jaro|face pull|elevaci[oó]n frontal/.test(n)){
    add("Hombro",1);
    if(/press/.test(n))add("Tríceps",.5);
  }
  // Bíceps
  if(/curl/.test(n)&&!/femoral/.test(n)){add("Bíceps",1)}
  // Tríceps
  if(/tr[ií]ceps|extensi[oó]n (de )?(codo|tras nuca)|press cerrado|patada|fondo/.test(n)){add("Tríceps",1)}
  // Pierna
  if(/sentadilla|prensa|extensi[oó]n de rodilla|zancada|bulgara|b[uú]lgara|hack/.test(n)){
    add("Cuádriceps",1);add("Glúteo",.5);
    if(/sentadilla|zancada|b[uú]lgara/.test(n))add("Core",.5);
  }
  if(/curl femoral|femoral|peso muerto rumano|buenos d[ií]as/.test(n)){add("Femoral",1);add("Glúteo",.5)}
  if(/gl[uú]teo|hip thrust|puente|abductor/.test(n)){add("Glúteo",1)}
  if(/talon|gemelo|pantorrilla/.test(n)){add("Gemelo",1)}
  // Core
  if(/plancha|crunch|abdominal|russian|elevaci[oó]n de piernas|core|twist/.test(n)){add("Core",1)}
  // Cardio/otros: sin músculo
  return M;
}

/* Series por músculo en un rango de días */
function seriesPorMusculo(dias){
  dias=dias||7;
  const now=new Date();
  const desde=new Date(now);desde.setDate(now.getDate()-(dias-1));
  const out={};MUSCULOS.forEach(m=>out[m]=0);
  allExercises().forEach(ex=>{
    const hist=DB[ex.id]||[];
    const M=musculosDe(ex.name);
    if(!Object.keys(M).length)return;
    hist.forEach(e=>{
      const d=new Date(e.date+"T00:00:00");
      if(d<desde||d>now)return;
      const nSets=(e.sets||[]).filter(s=>s.w!==""||s.r!=="").length;
      Object.entries(M).forEach(([m,w])=>{out[m]+=nSets*w});
    });
  });
  Object.keys(out).forEach(m=>out[m]=Math.round(out[m]*10)/10);
  return out;
}

/* Última vez que se entrenó cada músculo (días desde hoy) */
function recuperacionMuscular(){
  const out={};
  MUSCULOS.forEach(m=>out[m]={dias:null,vol:0});
  const hoy=new Date();hoy.setHours(0,0,0,0);
  allExercises().forEach(ex=>{
    const hist=DB[ex.id]||[];
    const M=musculosDe(ex.name);
    if(!Object.keys(M).length)return;
    hist.forEach(e=>{
      const d=new Date(e.date+"T00:00:00");
      const diff=Math.round((hoy-d)/86400000);
      if(diff<0)return;
      const nSets=(e.sets||[]).filter(s=>s.w!==""||s.r!=="").length;
      Object.entries(M).forEach(([m,w])=>{
        if(w<1)return; // solo primarios cuentan para fatiga
        if(out[m].dias===null||diff<out[m].dias){out[m].dias=diff;out[m].vol=nSets}
      });
    });
  });
  return out;
}
// Estado de recuperación: 0=fatigado, 1=recuperando, 2=listo
function estadoMusculo(dias){
  if(dias===null||dias===undefined)return {n:2,txt:"Listo",col:"var(--ok)"};
  if(dias<=1)return {n:0,txt:"En recuperación",col:"var(--hot)"};
  if(dias===2)return {n:1,txt:"Casi listo",col:"var(--gold)"};
  return {n:2,txt:"Listo",col:"var(--ok)"};
}

function sugerirPeso(id,ex){
  const T=tipoEjercicio(ex);
  if(T.sinPeso)return null;
  const h=DB[id];if(!h||!h.length)return null;
  const {iso}=nowStamp();
  // última sesión que NO sea hoy
  let last=null;
  for(let i=h.length-1;i>=0;i--){if(h[i].date!==iso){last=h[i];break}}
  if(!last)return null;
  const sets=last.sets.filter(s=>s.w&&s.r);
  if(!sets.length)return null;
  // serie más pesada
  const top=sets.reduce((a,b)=>(parseFloat(b.w)||0)>(parseFloat(a.w)||0)?b:a);
  const w=parseFloat(top.w)||0;
  const rpe=parseFloat(top.rpe)||0;
  const r=parseInt(top.r)||0;
  if(!w)return null;
  const inc=w>=100?5:2.5; // incremento según carga
  if(!rpe)return {txt:`Última vez: ${w} lb × ${r}. Registra el RPE para recibir sugerencias.`,tipo:"info",peso:w};
  if(rpe<=7)return {txt:`Última vez ${w} lb × ${r} @RPE${rpe} (te sobraron reps). Prueba ${w+inc} lb.`,tipo:"sube",peso:w+inc};
  if(rpe===8)return {txt:`Última vez ${w} lb × ${r} @RPE8. Puedes subir a ${w+inc} lb o sumar 1 rep.`,tipo:"sube",peso:w+inc};
  if(rpe===9)return {txt:`Última vez ${w} lb × ${r} @RPE9. Mantén ${w} lb y busca 1 rep más.`,tipo:"mantiene",peso:w};
  return {txt:`Última vez ${w} lb × ${r} @RPE10 (al fallo). Mantén ${w} lb o baja a ${Math.max(0,w-inc)} lb.`,tipo:"baja",peso:w};
}

/* Detección de estancamiento */
function estancamiento(id){
  const h=(DB[id]||[]).map(e=>({
    d:new Date(e.date+"T00:00:00"),
    v:Math.max(0,...e.sets.map(s=>epley(s.w,s.r)))
  })).filter(p=>p.v>0);
  if(h.length<4)return null;
  const ult=h.slice(-4);
  const best=Math.max(...h.map(p=>p.v));
  const bestUlt=Math.max(...ult.map(p=>p.v));
  if(bestUlt>=best&&ult[ult.length-1].v>=best)return null; // sigue progresando
  const dias=Math.round((new Date()-ult[0].d)/86400000);
  const semanas=Math.round(dias/7);
  if(semanas<3)return null;
  const prevBest=Math.max(...h.slice(0,-4).map(p=>p.v));
  if(bestUlt>prevBest)return null;
  return {semanas,pr:best,sugerencia:Math.round(best*0.9)};
}

/* Récords por rango de reps */
function recordsPorRango(id){
  const h=DB[id]||[];
  const rangos=[{n:"1-3",min:1,max:3},{n:"4-6",min:4,max:6},{n:"7-9",min:7,max:9},{n:"10-12",min:10,max:12},{n:"13+",min:13,max:99}];
  const out=[];
  rangos.forEach(r=>{
    let best=0,txt="";
    h.forEach(e=>e.sets.forEach(s=>{
      const reps=parseInt(s.r)||0,w=parseFloat(s.w)||0;
      if(reps>=r.min&&reps<=r.max&&w>best){best=w;txt=w+" × "+reps}
    }));
    if(best)out.push({rango:r.n,txt,peso:best});
  });
  return out;
}

/* Calentamiento automático */
function calentamiento(pesoObjetivo){
  const w=parseFloat(pesoObjetivo)||0;
  if(w<45)return [];
  const pcts=[{p:0.4,r:10},{p:0.6,r:5},{p:0.8,r:3}];
  return pcts.map(x=>({
    peso:Math.round(w*x.p/5)*5,
    reps:x.r
  })).filter(x=>x.peso>=45);
}

function valorHace(id,dias){
  const h=DB[id];if(!h||!h.length)return null;
  const lim=new Date();lim.setDate(lim.getDate()-dias);
  let best=null;
  h.forEach(e=>{
    const d=new Date(e.date+"T00:00:00");
    if(d<=lim){const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));if(v>0)best=v}
  });
  return best;
}

/* 14. Predicción de PR: tendencia lineal simple */
function predecirPR(id){
  const h=(DB[id]||[]).map(e=>({
    t:new Date(e.date+"T00:00:00").getTime(),
    v:Math.max(0,...e.sets.map(s=>epley(s.w,s.r)))
  })).filter(p=>p.v>0);
  if(h.length<3)return null;
  const pr=Math.max(...h.map(p=>p.v));
  // regresión lineal sobre los últimos 8 puntos
  const pts=h.slice(-8);
  const n=pts.length;
  const t0=pts[0].t;
  const xs=pts.map(p=>(p.t-t0)/86400000); // días
  const ys=pts.map(p=>p.v);
  const mx=xs.reduce((a,b)=>a+b,0)/n, my=ys.reduce((a,b)=>a+b,0)/n;
  let num=0,den=0;
  xs.forEach((x,i)=>{num+=(x-mx)*(ys[i]-my);den+=(x-mx)*(x-mx)});
  if(den===0)return null;
  const pend=num/den; // lb por día
  if(pend<=0.02)return null; // sin progreso claro
  const ultimo=ys[ys.length-1];
  if(ultimo>=pr)return {tipo:"pr_hoy",pr};
  const faltan=(pr-ultimo)/pend;
  if(faltan<0||faltan>120)return null;
  return {tipo:"prediccion",dias:Math.ceil(faltan),semanas:Math.max(1,Math.round(faltan/7)),pr,pend:Math.round(pend*70)/10};
}

/* 15. Resumen semanal */
function resumenSemanal(){
  const now=new Date();
  const semActual=(d0,d1)=>{
    let vol=0,sesiones=new Set(),prs=0,series=0;
    allExercises().forEach(ex=>{
      const h=DB[ex.id]||[];
      let bestPrev=0;
      h.forEach(e=>{
        const d=new Date(e.date+"T00:00:00");
        const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));
        if(d<d0){if(v>bestPrev)bestPrev=v;return}
        if(d>d1)return;
        vol+=volumen(e.sets);
        sesiones.add(e.date);
        series+=e.sets.filter(s=>s.w!==""||s.r!=="").length;
        if(v>bestPrev&&bestPrev>0)prs++;
        if(v>bestPrev)bestPrev=v;
      });
    });
    return {vol:Math.round(vol),sesiones:sesiones.size,prs,series};
  };
  const finEsta=new Date(now);
  const iniEsta=new Date(now);iniEsta.setDate(now.getDate()-6);
  const finAnt=new Date(iniEsta);finAnt.setDate(iniEsta.getDate()-1);
  const iniAnt=new Date(finAnt);iniAnt.setDate(finAnt.getDate()-6);
  const a=semActual(iniEsta,finEsta);
  const b=semActual(iniAnt,finAnt);
  const dv=b.vol?Math.round((a.vol-b.vol)/b.vol*100):null;
  return {...a,prev:b,deltaVol:dv};
}

/* 16. Modo "no hay tiempo": prioriza ejercicios */
function priorizarEjercicios(dayEx,minutos){
  // Estimar: cada serie ~ (descanso + 40s de trabajo)
  const conCosto=dayEx.map((ex,i)=>{
    const nSets=parseInt(ex.s)||3;
    const rest=restFor(ex);
    const costo=nSets*(rest+40)/60; // minutos
    // Prioridad: compuestos primero (más músculos), y los primeros del día
    const M=musculosDe(ex.n);
    const nMusc=Object.values(M).filter(w=>w>=1).length;
    const prio=nMusc*10-i; // más músculos = más prioridad
    return {ex,i,costo,prio};
  });
  conCosto.sort((a,b)=>b.prio-a.prio);
  const sel=[];let acum=0;
  conCosto.forEach(c=>{
    if(acum+c.costo<=minutos){sel.push(c);acum+=c.costo}
  });
  sel.sort((a,b)=>a.i-b.i); // devolver en orden original
  return {ejercicios:sel.map(c=>c.ex),minutos:Math.round(acum),total:dayEx.length};
}

const SUSTITUTOS={
  "prensa":["Sentadilla con barra","Sentadilla goblet","Zancadas con mancuernas","Extensión de rodilla"],
  "sentadilla con barra":["Prensa","Sentadilla goblet","Zancadas con mancuernas","Sentadilla frontal"],
  "press plano con barra":["Press Inclinado con mancuernas","Press Inclinado (máquina)","Flexiones","Fondos en paralelas"],
  "press inclinado (máquina)":["Press Inclinado con mancuernas","Press Plano con barra","Flexiones"],
  "press inclinado con mancuernas":["Press Inclinado (máquina)","Press Plano con barra","Flexiones"],
  "press inclinado":["Press Inclinado con mancuernas","Press Plano","Flexiones"],
  "dominadas":["Jalón al pecho","Remo en polea baja","Remo con barra"],
  "jalón al pecho (agarre abierto)":["Dominadas","Remo en polea baja","Remo con barra"],
  "jalón al pecho":["Dominadas","Remo en polea baja","Remo con barra"],
  "remo con barra":["Remo en polea baja","Remo unilateral con mancuerna","Jalón al pecho"],
  "peso muerto rumano con barra":["Curl femoral","Peso Muerto Rumano","Buenos días"],
  "press militar con barra":["Press de hombro con mancuernas","Press Arnold","Elevaciones Laterales"],
  "curl femoral":["Peso Muerto Rumano","Peso Muerto Rumano con barra"],
  "extensión de rodilla":["Prensa","Sentadilla goblet","Zancadas con mancuernas"],
  "pec-fly":["Aperturas en polea","Press Plano con barra","Flexiones"],
  "elevaciones laterales":["Press Militar con barra","Press Arnold","Pájaros en polea"],
  "prensa ":["Sentadilla con barra","Zancadas con mancuernas"],
};
function sustitutosDe(nombre){
  const n=normEx(nombre);
  if(SUSTITUTOS[n])return SUSTITUTOS[n];
  const M=musculosDe(nombre);
  const prim=Object.entries(M).filter(([m,w])=>w>=1).map(([m])=>m);
  if(!prim.length)return [];
  const cands=[];
  DICC.forEach(d=>{
    if(normEx(d.n)===n)return;
    const dm=musculosDe(d.n);
    const dprim=Object.entries(dm).filter(([m,w])=>w>=1).map(([m])=>m);
    if(dprim.some(m=>prim.includes(m)))cands.push(d.n);
  });
  return cands.slice(0,4);
}
const SUBS_KEY="stimpys_subs";
function getSubs(){try{const o=JSON.parse(localStorage.getItem(SUBS_KEY))||{};
  return o.date===nowStamp().iso?(o.data||{}):{}}catch(e){return{}}}
function setSub(id,nombre){
  const s=getSubs();
  if(nombre)s[id]=nombre;else delete s[id];
  localStorage.setItem(SUBS_KEY,JSON.stringify({date:nowStamp().iso,data:s}));
}
function clearSubs(){localStorage.removeItem(SUBS_KEY)}
/* Devuelve los ejercicios del día con las sustituciones aplicadas */
function ejerciciosDelDia(day){
  const sem=rutinaSemana();
  const base=(sem[day]&&sem[day].ex)||[];
  const subs=getSubs();
  return base.map(ex=>{
    const id=exId(ex);
    const alt=subs[id];
    if(!alt)return ex;
    return {...ex,n:alt,_orig:ex.n,_sub:true};
  });
}

let audioCtx=null;
function initAudio(){
  if(audioCtx)return audioCtx;
  try{audioCtx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){audioCtx=null}
  return audioCtx;
}
// Desbloquear audio en el primer toque (política de Safari/iOS)
document.addEventListener("touchstart",()=>{const c=initAudio();if(c&&c.state==="suspended")c.resume()},{once:true});
document.addEventListener("click",()=>{const c=initAudio();if(c&&c.state==="suspended")c.resume()},{once:true});

function beep(freq=880,dur=0.14,vol=0.28,type="sine",delay=0){
  const c=initAudio();if(!c||CFG.mute)return;
  try{
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.value=freq;
    o.connect(g);g.connect(c.destination);
    const t=c.currentTime+delay;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol,t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.start(t);o.stop(t+dur+0.02);
  }catch(e){}
}
// Alarma de fin de descanso: 3 tonos ascendentes, claros y audibles
function soundRestDone(){
  beep(784,0.16,0.30,"sine",0);
  beep(988,0.16,0.30,"sine",0.20);
  beep(1319,0.30,0.34,"sine",0.40);
}
// Serie completada: click corto y satisfactorio
function soundSetDone(){beep(660,0.09,0.18,"triangle",0);beep(880,0.10,0.16,"triangle",0.07)}
// Guardado
function soundSave(){beep(523,0.10,0.16,"sine",0)}
// PR
function soundPR(){beep(659,0.12,0.28,"sine",0);beep(784,0.12,0.28,"sine",0.12);beep(1047,0.30,0.30,"sine",0.24)}

function lineChart(pts,hi,unit){
  unit=unit||"lb";
  const wrap=document.createElement("div");wrap.className="chartwrap";
  if(!pts.length){wrap.innerHTML=`<div class="empty">Sin datos.</div>`;return wrap}
  const W=300,H=130,padL=8,padR=8,padT=14,padB=20;
  const xs=pts.length>1?pts.map((_,i)=>padL+i*(W-padL-padR)/(pts.length-1)):[W/2];
  const min=Math.min(...pts.map(p=>p.v)),max=Math.max(...pts.map(p=>p.v)),range=max-min||1;
  const y=v=>H-padB-((v-min)/range)*(H-padT-padB);
  let path="",dots="",labels="";
  // etiquetas de fecha: primera, media y última
  const lblIdx=pts.length>2?[0,Math.floor((pts.length-1)/2),pts.length-1]:pts.map((_,i)=>i);
  pts.forEach((p,i)=>{const X=xs[i],Y=y(p.v);path+=(i?"L":"M")+X+" "+Y+" ";
    const isPR=i===hi;
    dots+=`<circle data-i="${i}" cx="${X}" cy="${Y}" r="${isPR?5.5:4}" fill="${isPR?'#fff':'#4db8ff'}" ${isPR?'stroke="#4db8ff" stroke-width="2"':''}/>`;
    if(pts.length<=8)dots+=`<text x="${X}" y="${Y-10}" fill="${isPR?'#4db8ff':'#f0f2f7'}" font-size="9" font-weight="${isPR?800:700}" text-anchor="middle">${p.v}</text>`;
    if(lblIdx.includes(i)&&p.d)labels+=`<text x="${X}" y="${H-5}" fill="#8b8f9c" font-size="8" font-weight="600" text-anchor="${i===0?'start':i===pts.length-1?'end':'middle'}">${fmtDate(p.d)}</text>`;
  });
  // línea de tendencia (regresión lineal simple) si hay 3+ puntos
  let trendline="";
  if(pts.length>=3){
    const n=pts.length;let sx=0,sy=0,sxy=0,sxx=0;
    pts.forEach((p,i)=>{sx+=i;sy+=p.v;sxy+=i*p.v;sxx+=i*i});
    const m=(n*sxy-sx*sy)/(n*sxx-sx*sx||1),b0=(sy-m*sx)/n;
    trendline=`<line x1="${xs[0]}" y1="${y(b0)}" x2="${xs[n-1]}" y2="${y(m*(n-1)+b0)}" stroke="#ffcc4d" stroke-width="1.4" stroke-dasharray="4 4" opacity=".55"/>`;
  }
  const area=pts.length>1?`<path d="${path}L${xs[xs.length-1]} ${H-padB}L${xs[0]} ${H-padB}Z" fill="url(#gp)" opacity="0.22"/>`:"";
  wrap.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:140px">
    <defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b5cff"/><stop offset="1" stop-color="#2b5cff" stop-opacity="0"/></linearGradient></defs>
    ${area}${trendline}<path d="${path}" fill="none" stroke="#4db8ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>
    <div class="ctip" id="ctip"></div>`;
  // tooltip interactivo
  const tip=wrap.querySelector(".ctip");
  wrap.querySelectorAll("circle").forEach(c=>{
    const show=()=>{
      const i=+c.dataset.i,p=pts[i];
      const svg=wrap.querySelector("svg"),r=svg.getBoundingClientRect();
      const cx=parseFloat(c.getAttribute("cx"))/W*r.width;
      const cy=parseFloat(c.getAttribute("cy"))/H*r.height;
      tip.innerHTML=`${p.v} ${unit}${p.d?`<small>${fmtDateFull(p.d)}</small>`:""}`;
      tip.style.left=cx+"px";tip.style.top=cy+"px";
      tip.classList.add("show");
      clearTimeout(tip._t);tip._t=setTimeout(()=>tip.classList.remove("show"),2200);
    };
    c.addEventListener("click",show);
    c.addEventListener("touchstart",e=>{e.preventDefault();show()},{passive:false});
  });
  return wrap;
}
function barChart(pts){
  const wrap=document.createElement("div");wrap.className="chartwrap";
  if(!pts.length){wrap.innerHTML=`<div class="empty">Sin datos.</div>`;return wrap}
  const W=300,H=120,pad=8,max=Math.max(...pts.map(p=>p.v))||1;
  const bw=Math.min(38,(W-2*pad)/pts.length-6);
  let bars="";
  pts.forEach((p,i)=>{const x=pad+i*(W-2*pad)/pts.length+((W-2*pad)/pts.length-bw)/2;
    const h=(p.v/max)*(H-pad-18),Y=H-16-h;
    bars+=`<rect x="${x}" y="${Y}" width="${bw}" height="${h}" rx="4" fill="url(#gb)"/>
      <text x="${x+bw/2}" y="${Y-3}" fill="#8b8f9c" font-size="8" font-weight="700" text-anchor="middle">${p.v>999?(p.v/1000).toFixed(1)+'k':p.v}</text>`});
  wrap.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4db8ff"/><stop offset="1" stop-color="#2b5cff"/></linearGradient></defs>${bars}</svg>`;
  return wrap;
}

