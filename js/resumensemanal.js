/**
 * ============================================================
 *  resumen-semanal.js — "Wrapped" semanal del usuario
 * ============================================================
 *  Dos tarjetas compartibles, estilo historia de Instagram:
 *   · PÚBLICA  — resumen de pesos y cómo estuvo tu semana.
 *   · PRIVADA  — promedios de reps/pesos, puntos de mejora y
 *                recomendaciones (solo para ti).
 *  Se pueden descargar como imagen (para compartir como las
 *  "letras de Spotify") o copiar como texto para WhatsApp.
 * ============================================================
 */

/* Rango de los últimos 7 días (incluye hoy) */
function semanaRango(){
  const now=new Date();
  const fin=new Date(now);fin.setHours(23,59,59,999);
  const ini=new Date(now);ini.setDate(now.getDate()-6);ini.setHours(0,0,0,0);
  return {ini,fin};
}

/* Métricas por ejercicio de la semana + agregados */
function statsSemana(){
  const {ini,fin}=semanaRango();
  const perEx=[];
  const fechas=new Set();
  allExercises().forEach(ex=>{
    const hist=DB[ex.id]||[];
    const w=[],r=[];let exVol=0,exSeries=0,best=0;const exFechas=new Set();
    hist.forEach(e=>{
      const d=new Date(e.date+"T00:00:00");
      if(d<ini||d>fin)return;
      exFechas.add(e.date);fechas.add(e.date);
      e.sets.forEach(s=>{
        const sw=parseFloat(s.w)||0,sr=parseFloat(s.r)||0;
        if(sw||sr)exSeries++;
        if(sw>0)w.push(sw);
        if(sr>0)r.push(sr);
        exVol+=sw*sr;
      });
      const v=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));
      if(v>best)best=v;
    });
    if(!exFechas.size)return;
    perEx.push({
      name:ex.name,
      group:(typeof grupoPrincipal==="function"&&grupoPrincipal(ex.name))||"",
      sesiones:exFechas.size,
      topW:w.length?Math.max(...w):0,
      avgW:w.length?Math.round(w.reduce((a,b)=>a+b,0)/w.length):0,
      avgR:r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length):0,
      vol:Math.round(exVol),
      best1rm:best,
      series:exSeries
    });
  });
  perEx.sort((a,b)=>b.best1rm-a.best1rm);
  const rs=resumenSemanal();
  // RPE promedio de la semana
  const rpes=[];
  allExercises().forEach(ex=>{(DB[ex.id]||[]).forEach(e=>{
    const d=new Date(e.date+"T00:00:00");if(d<ini||d>fin)return;
    e.sets.forEach(s=>{if(s.rpe)rpes.push(parseFloat(s.rpe)||0)});
  })});
  const rpeAvg=rpes.length?rpes.reduce((a,b)=>a+b,0)/rpes.length:0;
  // ánimo promedio de la semana
  const feels=getFeels().filter(f=>{const d=new Date(f.date+"T00:00:00");return d>=ini&&d<=fin});
  const feelAvg=feels.length?feels.reduce((a,b)=>a+(b.v||0),0)/feels.length:0;
  return {
    ...rs,               // vol, sesiones, series, prs, deltaVol
    perEx, rpeAvg, feelAvg,
    dias:fechas.size,
    musculos:seriesPorMusculo(7)
  };
}

/* Frase de "cómo estuvo tu semana" (pública) */
function fraseSemana(st){
  if(!st.dias)return "Semana de descanso. La próxima volvemos con todo.";
  if(st.deltaVol!==null&&st.deltaVol>=15)return `¡Semana en subida! +${st.deltaVol}% de volumen. Vas encendido.`;
  if(st.prs>=3)return `Semana de récords: ${st.prs} PR nuevos. Imparable.`;
  if(st.dias>=5)return `${st.dias} días de gym esta semana. Constancia de élite.`;
  if(st.feelAvg>=4)return "Te sentiste fuerte casi toda la semana. Sigue así.";
  return `${st.sesiones} ${st.sesiones===1?"sesión":"sesiones"} completadas. Ladrillo a ladrillo.`;
}

/* Puntos de mejora (privado): músculos bajos, exceso, estancamientos */
function mejorasSemana(st){
  const out=[];
  const bajos=[],exceso=[];
  MUSCULOS.forEach(m=>{
    const s=st.musculos[m]||0;
    if(s>0&&s<VOL_REC.min)bajos.push(m+" ("+s+" series)");
    else if(s===0)bajos.push(m+" (0 series)");
    else if(s>VOL_REC.max)exceso.push(m+" ("+s+" series)");
  });
  if(bajos.length)out.push({t:"Músculos por debajo del óptimo",d:bajos.slice(0,4).join(", ")+". Súmales alguna serie la próxima semana."});
  if(exceso.length)out.push({t:"Posible exceso de volumen",d:exceso.slice(0,3).join(", ")+". Vigila la recuperación para no estancarte."});
  // estancamientos
  const est=[];
  allExercises().forEach(ex=>{const e=(typeof estancamiento==="function")&&estancamiento(ex.id);if(e)est.push(ex.name)});
  if(est.length)out.push({t:"Ejercicios estancados",d:est.slice(0,3).join(", ")+". Considera una semana de descarga (~-10%) y vuelve a subir."});
  if(st.rpeAvg&&st.rpeAvg>=9.2)out.push({t:"Esfuerzo muy alto",d:`Tu RPE promedio fue ${st.rpeAvg.toFixed(1)}. Entrenar tan cerca del fallo cansa el sistema nervioso: deja 1-2 reps en reserva.`});
  return out;
}

/* Recomendaciones accionables para la próxima semana (privado) */
function recomendacionesSemana(st){
  const rec=[];
  if(!st.dias){rec.push("Agenda al menos 3 sesiones para retomar el ritmo.");return rec;}
  if(st.sesiones<3)rec.push("Apunta a 3-5 sesiones por semana para progresar de forma sostenida.");
  if(st.deltaVol!==null&&st.deltaVol<-15)rec.push(`Tu volumen bajó ${Math.abs(st.deltaVol)}%. Si no fue una semana de descarga, recupera series la próxima.`);
  if(st.deltaVol!==null&&st.deltaVol>40)rec.push("Subiste el volumen muy rápido. Sube de forma gradual (~10%/semana) para evitar lesiones.");
  if(st.rpeAvg&&st.rpeAvg<7)rec.push(`RPE promedio ${st.rpeAvg.toFixed(1)}: te sobra margen. Sube algo de peso o reps en los básicos.`);
  // músculo más rezagado
  let peor=null,peorV=Infinity;
  MUSCULOS.forEach(m=>{const s=st.musculos[m]||0;if(s<peorV){peorV=s;peor=m}});
  if(peor&&peorV<VOL_REC.min)rec.push(`Prioriza ${peor}: es tu músculo con menos trabajo esta semana.`);
  if(st.feelAvg&&st.feelAvg<=2.2)rec.push("Te sentiste cansado varios días: cuida el sueño, la hidratación y la proteína.");
  if(!rec.length)rec.push("Vas muy bien. Mantén la progresión: pequeño incremento de peso o reps cada semana.");
  return rec.slice(0,5);
}

/* ============ RENDER DEL OVERLAY ============ */
let weekTab="publico";
function abrirResumenSemanal(){
  const st=statsSemana();
  let app=document.getElementById("weekApp");
  if(!app){app=document.createElement("div");app.id="weekApp";document.body.appendChild(app);}
  app.classList.add("show");
  document.body.style.overflow="hidden";
  weekTab="publico";
  pintarResumenSemanal(st);
}
function cerrarResumenSemanal(){
  const app=document.getElementById("weekApp");
  if(app)app.classList.remove("show");
  document.body.style.overflow="";
}
function pintarResumenSemanal(st){
  const app=document.getElementById("weekApp");if(!app)return;
  const rango=(()=>{const{ini,fin}=semanaRango();return fmtDate(isoDe(ini))+" – "+fmtDate(isoDe(fin))})();
  const card=weekTab==="publico"?cardPublicoHTML(st,rango):cardPrivadoHTML(st,rango);
  app.innerHTML=`
    <div class="week-brand">
      <div class="wb-title">STIMPYS <em>TRAINING</em></div>
      <button class="week-x" id="weekClose">${ICON('close',18)}</button>
    </div>
    <div class="week-top">
      <div class="week-tabs">
        <button class="week-tab${weekTab==="publico"?" on":""}" data-t="publico">${ICON('users',14)} Público</button>
        <button class="week-tab${weekTab==="privado"?" on":""}" data-t="privado">${ICON('lock',14)} Privado</button>
      </div>
    </div>
    <div class="week-scroll"><div class="wsem-card ${weekTab}" id="weekCard">${card}</div></div>
    <div class="week-actions">
      <button class="wrap-btn img" id="weekImg">${ICON('download',16)} Descargar imagen para compartir</button>
      <button class="wrap-btn wa" id="weekTxt">${ICON('list',16)} Copiar texto</button>
    </div>`;
  document.getElementById("weekClose").onclick=cerrarResumenSemanal;
  app.querySelectorAll(".week-tab").forEach(b=>b.onclick=()=>{weekTab=b.dataset.t;pintarResumenSemanal(st)});
  document.getElementById("weekImg").onclick=()=>exportarResumenImagen(st,weekTab);
  document.getElementById("weekTxt").onclick=async()=>{
    const txt=weekTab==="publico"?textoPublico(st,rango):textoPrivado(st,rango);
    try{await navigator.clipboard.writeText(txt);flashMsg("Texto copiado");}
    catch(e){window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank");}
  };
}
function isoDe(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}

function cardPublicoHTML(st,rango){
  const top=st.perEx.filter(e=>e.topW>0).slice(0,5);
  const auth=(typeof getAuth==="function"&&getAuth())||null;
  const nombre=(auth&&auth.name)||"Mi semana";
  return `
    <div class="wrap-brand">STIMPYS · MI SEMANA</div>
    <div class="wrap-title2">${escapeHtml(nombre)}</div>
    <div class="wrap-date">${rango}</div>
    <div class="wrap-metrics">
      <div class="wrap-tile"><div class="wrap-val">${fmtNum(st.vol)}</div><div class="wrap-lbl">Volumen (lb)</div></div>
      <div class="wrap-tile"><div class="wrap-val">${st.sesiones}</div><div class="wrap-lbl">Sesiones</div></div>
      <div class="wrap-tile"><div class="wrap-val">${st.prs}</div><div class="wrap-lbl">Récords</div></div>
    </div>
    <div class="week-phrase">${fraseSemana(st)}</div>
    ${top.length?`<div class="wrap-section">
      <div class="wrap-section-h">${ICON('flame',13)} Mejores pesos</div>
      ${top.map(e=>`<div class="wrap-pr"><span>${escapeHtml(e.name)}</span><b>${e.topW} lb</b></div>`).join("")}
    </div>`:`<div class="week-empty">Registra series esta semana para ver tu resumen.</div>`}
    <div class="wrap-foot">stiimpys.app · comparte tu semana</div>`;
}
function cardPrivadoHTML(st,rango){
  const mejoras=mejorasSemana(st);
  const recs=recomendacionesSemana(st);
  const top=st.perEx.slice(0,6);
  return `
    <div class="wrap-brand">STIMPYS · INFORME PRIVADO</div>
    <div class="wrap-title2">Análisis de tu semana</div>
    <div class="wrap-date">${rango} · solo para ti</div>
    <div class="wrap-metrics four">
      <div class="wrap-tile"><div class="wrap-val">${st.series}</div><div class="wrap-lbl">Series</div></div>
      <div class="wrap-tile"><div class="wrap-val">${st.rpeAvg?st.rpeAvg.toFixed(1):"–"}</div><div class="wrap-lbl">RPE prom</div></div>
      <div class="wrap-tile"><div class="wrap-val">${st.deltaVol!==null?(st.deltaVol>=0?"+":"")+st.deltaVol+"%":"–"}</div><div class="wrap-lbl">Vol vs sem.</div></div>
      <div class="wrap-tile"><div class="wrap-val">${st.dias}</div><div class="wrap-lbl">Días</div></div>
    </div>
    ${top.length?`<div class="wrap-section">
      <div class="wrap-section-h">${ICON('chart',13)} Promedios por ejercicio</div>
      <div class="week-tbl">
        <div class="week-tr head"><span>Ejercicio</span><span>Prom.</span><span>Top</span></div>
        ${top.map(e=>`<div class="week-tr"><span>${escapeHtml(e.name)}</span><span>${e.avgW?e.avgW+"lb×"+e.avgR:e.avgR+" rep"}</span><span>${e.topW?e.topW+" lb":"–"}</span></div>`).join("")}
      </div>
    </div>`:""}
    ${mejoras.length?`<div class="wrap-section">
      <div class="wrap-section-h">${ICON('target',13)} Puntos de mejora</div>
      ${mejoras.map(m=>`<div class="week-note"><b>${escapeHtml(m.t)}</b><span>${escapeHtml(m.d)}</span></div>`).join("")}
    </div>`:""}
    <div class="wrap-section">
      <div class="wrap-section-h">${ICON('bolt',13)} Recomendaciones</div>
      ${recs.map(r=>`<div class="week-rec">${ICON('check',12)} ${escapeHtml(r)}</div>`).join("")}
    </div>
    <div class="wrap-foot">Informe privado · no se comparte automáticamente</div>`;
}

/* ============ TEXTO ============ */
function textoPublico(st,rango){
  let t=`🏋️ Mi semana en Stimpys (${rango})\n`;
  t+=`\n📊 Volumen: ${fmtNum(st.vol)} lb`;
  t+=`\n📅 Sesiones: ${st.sesiones}`;
  t+=`\n🔥 Récords: ${st.prs}\n`;
  t+=`\n${fraseSemana(st)}\n`;
  st.perEx.filter(e=>e.topW>0).slice(0,5).forEach(e=>{t+=`\n• ${e.name}: ${e.topW} lb`});
  t+=`\n\nHecho en Stiimpys 💥`;
  return t;
}
function textoPrivado(st,rango){
  let t=`🔒 Informe privado — Stimpys (${rango})\n`;
  t+=`\nSeries: ${st.series} · RPE prom: ${st.rpeAvg?st.rpeAvg.toFixed(1):"–"} · Días: ${st.dias}`;
  t+=`\n\nPromedios:`;
  st.perEx.slice(0,6).forEach(e=>{t+=`\n• ${e.name}: ${e.avgW?e.avgW+"lb x "+e.avgR+" reps":e.avgR+" reps"} (top ${e.topW} lb)`});
  const mej=mejorasSemana(st);
  if(mej.length){t+=`\n\nMejoras:`;mej.forEach(m=>t+=`\n• ${m.t}: ${m.d}`)}
  t+=`\n\nRecomendaciones:`;
  recomendacionesSemana(st).forEach(r=>t+=`\n• ${r}`);
  return t;
}

/* ============ EXPORTAR IMAGEN (canvas, sin librerías) ============ */
function wrapText2(c,text,x,y,maxW,lh){
  const words=(text||"").split(" ");let line="";let yy=y;
  words.forEach(w=>{
    const test=line?line+" "+w:w;
    if(c.measureText(test).width>maxW&&line){c.fillText(line,x,yy);line=w;yy+=lh}
    else line=test;
  });
  if(line)c.fillText(line,x,yy);
  return yy+lh;
}
function exportarResumenImagen(st,tab){
  const rango=(()=>{const{ini,fin}=semanaRango();return fmtDate(isoDe(ini))+" – "+fmtDate(isoDe(fin))})();
  const W=1080,P=64,dpr=2;
  const fS='-apple-system,system-ui,"Segoe UI",Roboto,sans-serif';
  const big=document.createElement("canvas");
  big.width=W*dpr;big.height=4200*dpr;
  const c=big.getContext("2d");c.scale(dpr,dpr);c.textBaseline="top";
  // fondo degradado
  const g=c.createLinearGradient(0,0,W,4200);
  if(tab==="publico"){g.addColorStop(0,"#0b1b3a");g.addColorStop(1,"#0a0a0c");}
  else{g.addColorStop(0,"#0d0d0d");g.addColorStop(1,"#12100a");}
  c.fillStyle=g;c.fillRect(0,0,W,4200);

  let y=P+10;
  const acc=tab==="publico"?"#4db8ff":"#ffcc4d";
  c.fillStyle="#8b8f9c";c.font=`800 24px ${fS}`;
  c.fillText(tab==="publico"?"STIMPYS · MI SEMANA":"STIMPYS · INFORME PRIVADO",P,y);y+=46;
  const auth=(typeof getAuth==="function"&&getAuth())||null;
  const titulo=tab==="publico"?((auth&&auth.name)||"Mi semana"):"Análisis de tu semana";
  c.fillStyle="#f2f3f7";c.font=`800 60px ${fS}`;c.fillText(titulo.slice(0,22),P,y);y+=76;
  c.fillStyle="#8b8f9c";c.font=`500 26px ${fS}`;c.fillText(rango+(tab==="privado"?" · solo para ti":""),P,y);y+=58;

  // tiles
  const tiles=tab==="publico"
    ?[["#4db8ff",fmtNum(st.vol),"VOLUMEN (LB)"],["#f2f3f7",String(st.sesiones),"SESIONES"],["#ffcc4d",String(st.prs),"RÉCORDS"]]
    :[["#f2f3f7",String(st.series),"SERIES"],["#4db8ff",st.rpeAvg?st.rpeAvg.toFixed(1):"–","RPE PROM"],["#ffcc4d",st.deltaVol!==null?(st.deltaVol>=0?"+":"")+st.deltaVol+"%":"–","VOL VS SEM"]];
  const gap=18,tw=(W-2*P-2*gap)/3,th=160;
  tiles.forEach((t,i)=>{
    const x=P+i*(tw+gap);
    c.fillStyle="rgba(255,255,255,0.04)";wrapRoundRect(c,x,y,tw,th,18);c.fill();
    c.strokeStyle="#23232c";c.lineWidth=1.5;wrapRoundRect(c,x,y,tw,th,18);c.stroke();
    c.textAlign="center";
    c.fillStyle=t[0];c.font=`800 52px ${fS}`;c.fillText(t[1],x+tw/2,y+42);
    c.fillStyle="#8b8f9c";c.font=`600 19px ${fS}`;c.fillText(t[2],x+tw/2,y+116);
    c.textAlign="left";
  });
  y+=th+48;

  if(tab==="publico"){
    c.fillStyle="#cdd0d8";c.font=`600 30px ${fS}`;
    y=wrapText2(c,fraseSemana(st),P,y,W-2*P,42)+18;
    const top=st.perEx.filter(e=>e.topW>0).slice(0,5);
    if(top.length){
      c.fillStyle=acc;c.font=`800 24px ${fS}`;c.fillText("MEJORES PESOS",P,y);y+=44;
      top.forEach(e=>{
        c.fillStyle="#f2f3f7";c.font=`600 28px ${fS}`;c.fillText(e.name.slice(0,26),P,y);
        c.fillStyle=acc;c.font=`800 28px ${fS}`;c.textAlign="right";c.fillText(e.topW+" lb",W-P,y);c.textAlign="left";
        y+=40;c.strokeStyle="rgba(255,255,255,0.06)";c.beginPath();c.moveTo(P,y);c.lineTo(W-P,y);c.stroke();y+=16;
      });
    }
  }else{
    const top=st.perEx.slice(0,6);
    if(top.length){
      c.fillStyle=acc;c.font=`800 24px ${fS}`;c.fillText("PROMEDIOS POR EJERCICIO",P,y);y+=44;
      top.forEach(e=>{
        c.fillStyle="#f2f3f7";c.font=`600 26px ${fS}`;c.fillText(e.name.slice(0,24),P,y);
        c.fillStyle="#9aa0ad";c.font=`500 23px ${fS}`;c.textAlign="right";
        c.fillText((e.avgW?e.avgW+"lb×"+e.avgR:e.avgR+" rep")+"  ·  top "+e.topW,W-P,y+2);c.textAlign="left";
        y+=42;
      });
      y+=14;
    }
    const mej=mejorasSemana(st);
    if(mej.length){
      c.fillStyle=acc;c.font=`800 24px ${fS}`;c.fillText("PUNTOS DE MEJORA",P,y);y+=44;
      mej.forEach(m=>{
        c.fillStyle="#f2f3f7";c.font=`700 25px ${fS}`;c.fillText(m.t.slice(0,40),P,y);y+=34;
        c.fillStyle="#9aa0ad";c.font=`400 22px ${fS}`;y=wrapText2(c,m.d,P,y,W-2*P,32)+10;
      });
      y+=6;
    }
    c.fillStyle=acc;c.font=`800 24px ${fS}`;c.fillText("RECOMENDACIONES",P,y);y+=44;
    recomendacionesSemana(st).forEach(r=>{
      c.fillStyle="#cdd0d8";c.font=`400 24px ${fS}`;
      y=wrapText2(c,"• "+r,P,y,W-2*P,34)+8;
    });
  }

  y+=10;
  c.strokeStyle="rgba(255,255,255,0.06)";c.beginPath();c.moveTo(P,y);c.lineTo(W-P,y);c.stroke();y+=22;
  c.fillStyle="#5c5f6b";c.font=`600 20px ${fS}`;c.textAlign="center";
  c.fillText(tab==="publico"?"REGISTRADO EN STIIMPYS · stiimpys.app":"INFORME PRIVADO · STIIMPYS",W/2,y);
  c.textAlign="left";y+=44;

  c.strokeStyle="#2c2c37";c.lineWidth=2;wrapRoundRect(c,3,3,W-6,y-6,26);c.stroke();

  const H=y+P;
  const out=document.createElement("canvas");out.width=W*dpr;out.height=H*dpr;
  out.getContext("2d").drawImage(big,0,0);
  out.toBlob(async(blob)=>{
    if(!blob){flashMsg("No se pudo generar la imagen");return;}
    const nombre=tab==="publico"?"stiimpys-semana.png":"stiimpys-informe.png";
    const file=new File([blob],nombre,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:"Mi semana en Stiimpys"});return;}
      catch(e){if(e&&e.name==="AbortError")return;}
    }
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=nombre;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    flashMsg("Imagen descargada");
  },"image/png");
}
