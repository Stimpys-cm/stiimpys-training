
/**
 * ============================================================
 *  modo-amigos.js — "Modo Amigos"
 * ============================================================
 *  El anfitrión genera un link que clona su rutina del día.
 *  El invitado abre el link en SU celular, entrena y registra
 *  todo AISLADO en localStorage (stimpys_guest_workout), sin
 *  cuenta y sin tocar MongoDB. Al finalizar ve un "Wrapped"
 *  optimizado para captura de pantalla.
 * ============================================================
 */

/* ============ ROUTER DE PERSISTENCIA (DB/Mongo  vs  LocalStorage) ============ */
const GUEST_KEY = "stimpys_guest_workout";   // DB del invitado (pesos/reps/RPE), aislada
const GUEST_META_KEY = "stimpys_guest_meta"; // meta: anfitrión, día, lista de ejercicios

// Detecta modo invitado UNA sola vez, al cargar el script.
// Condición: hay params de la sesión de un amigo Y no hay usuario logueado.
const GUEST_TTL = 24*60*60*1000;             // el link caduca en 24 h
const GUEST_IMPORT_KEY = "stimpys_guest_import"; // traspaso de datos invitado → cuenta

const GUEST_PARAMS = (function leerParams(){
  const p = new URLSearchParams(location.search);
  const sessionRef = p.get("sessionRef");
  const rutina     = p.get("rutina");
  const r          = p.get("r");            // payload de la rutina del día (base64)
  const host       = p.get("h") || "Un amigo";
  const ts         = parseInt(p.get("t")) || 0;   // generación (para caducidad)
  const msg        = p.get("m") || "";            // mensaje opcional del anfitrión
  if(!sessionRef || !r) return null;
  return { sessionRef, rutina, host, r, ts, msg };
})();

const GUEST_MODE = !!(GUEST_PARAMS && !getAuth());

// En modo invitado ANULAMOS cualquier subida a la nube: nada de POST a Mongo.
// (getAuth() ya es null aquí, pero lo blindamos por si acaso.)
if(GUEST_MODE && typeof pushData === "function"){
  pushData = function(){ return Promise.resolve(); };
}

/* ============ HELPERS ============ */
function b64e(s){ return btoa(unescape(encodeURIComponent(s))); }
function b64d(s){ return decodeURIComponent(escape(atob(s))); }
function attr(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
/* Sanitiza texto que viene del LINK (no confiable): sin HTML y acotado. Anti-XSS. */
function limpiarTexto(s, max){
  return String(s==null?"":s).replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0, max||80);
}

/* Meta de la sesión invitado (anfitrión, día, ejercicios) */
function cargarGuestMeta(){ try{ return JSON.parse(localStorage.getItem(GUEST_META_KEY)); }catch(e){ return null; } }
function guardarGuestMeta(m){ localStorage.setItem(GUEST_META_KEY, JSON.stringify(m)); }
/* DB del invitado (misma forma que la del usuario real: { "ex:nombre":[{date,day,time,sets}] }) */
function cargarGuestDB(){ try{ return JSON.parse(localStorage.getItem(GUEST_KEY))||{}; }catch(e){ return {}; } }

/* ============ ANFITRIÓN: generar el link ============ */
function generarLinkAmigo(msg){
  const dia = (typeof activeDay!=="undefined" && activeDay) || diaDeHoy();
  const sem = rutinaSemana();
  const day = sem[dia] || { label:"", ex:[] };
  const payload = {
    dayName: dia,
    label: day.label || "",
    ex: (day.ex || []).map(e => ({ n:e.n, s:e.s }))
  };
  const auth = getAuth();
  const params = new URLSearchParams({
    sessionRef: (auth && (auth.id || auth.email)) || "anon",
    rutina: CFG.plan || "ppl-arnold",
    h: (auth && auth.name) || "Un amigo",
    t: String(Date.now()),
    r: b64e(JSON.stringify(payload))
  });
  if(msg && msg.trim()) params.set("m", msg.trim().slice(0,140));
  return location.origin + location.pathname + "?" + params.toString();
}

/* Sheet del anfitrión para compartir el link */
function abrirModoAmigos(){
  const dia = (typeof activeDay!=="undefined" && activeDay) || diaDeHoy();
  const sem = rutinaSemana();
  const day = sem[dia] || { label:"", ex:[] };
  if(!(day.ex && day.ex.length)){
    alertDlg("Este día no tiene ejercicios para compartir. Elige un día de entreno.", {title:"Sin rutina", icon:"warn"});
    return;
  }
  sheetTitle.textContent = "Modo Amigos";
  const linkActual = ()=>generarLinkAmigo(document.getElementById("amigoMsg").value);
  const refrescarLink = ()=>{ document.getElementById("amigoLink").value = linkActual(); };
  sheetBody.innerHTML = `
    <button class="btn btn-add" style="margin-bottom:14px" onclick="showMenu()">${ICON('back',15)} Volver</button>
    <div class="amigo-hero">
      <div class="amigo-ic">${ICON('users',24)}</div>
      <div>
        <b>Comparte tu rutina de ${escapeHtml(dia)}</b>
        <small>Tu amigo entrena en su propio celular. Sus datos quedan en SU dispositivo, sin cuenta.</small>
      </div>
    </div>
    <div class="amigo-preview">
      <div class="amigo-preview-h">${escapeHtml(day.label||dia)} · ${day.ex.length} ejercicios</div>
      ${day.ex.map(e=>`<div class="amigo-preview-ex">${escapeHtml(e.n)} <em>${escapeHtml(e.s)}</em></div>`).join("")}
    </div>
    <div class="amigo-fld">
      <label>${ICON('list',12)} Mensaje para tu amigo <span>(opcional)</span></label>
      <textarea id="amigoMsg" rows="2" maxlength="140" placeholder="Ej: ¡Vamos con todo hoy! 💪"></textarea>
    </div>
    <div class="amigo-link"><input id="amigoLink" readonly value="${attr(generarLinkAmigo(''))}"></div>
    <div class="amigo-expira">${ICON('clock',12)} El enlace caduca en 24 h y muestra tu rutina de hoy.</div>
    <button class="btn btn-save" id="amigoCopy" style="width:100%;margin-top:12px">${ICON('copy',16)} Copiar enlace</button>
    <button class="btn btn-add" id="amigoWa" style="width:100%;margin-top:10px">${ICON('users',16)} Enviar por WhatsApp</button>`;
  document.getElementById("amigoMsg").oninput = refrescarLink;
  document.getElementById("amigoCopy").onclick = async()=>{
    const link = linkActual();
    try{ await navigator.clipboard.writeText(link); }catch(e){
      const i=document.getElementById("amigoLink"); i.value=link; i.select(); document.execCommand("copy");
    }
    flashMsg("Enlace copiado");
  };
  document.getElementById("amigoWa").onclick = ()=>{
    const txt = `¡Entrena conmigo! Abre mi rutina de ${dia} en Modo Amigo: ${linkActual()}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank");
  };
}

/* ============ INVITADO: arranque (dentro del shell real) ============ */
async function arrancarModoAmigo(){
  // Ocultar el muro de login; usamos la app real
  hideAuth && hideAuth();
  document.getElementById("splash") && document.getElementById("splash").classList.add("hide");

  // 0) CADUCIDAD: si el link tiene más de 24 h, no arrancamos la sesión.
  if(GUEST_PARAMS.ts && (Date.now() - GUEST_PARAMS.ts) > GUEST_TTL){
    mostrarLinkExpirado(limpiarTexto(GUEST_PARAMS.host, 40));
    return;
  }
  document.body.classList.add("guest-mode");

  // 1) META de la sesión (anfitrión, día, lista de ejercicios) — SANITIZADA (viene del link)
  let meta = cargarGuestMeta();
  if(!meta || meta.sessionRef !== GUEST_PARAMS.sessionRef){
    let payload = {};
    try{ payload = JSON.parse(b64d(GUEST_PARAMS.r)); }catch(e){ payload = { ex:[] }; }
    const ex = (Array.isArray(payload.ex) ? payload.ex : []).slice(0, 40).map(e => ({
      n: limpiarTexto(e && e.n, 80) || "Ejercicio",
      s: limpiarTexto(e && e.s, 20) || "3x10"
    }));
    meta = {
      sessionRef: GUEST_PARAMS.sessionRef,
      rutina: limpiarTexto(GUEST_PARAMS.rutina, 40),
      host: limpiarTexto(GUEST_PARAMS.host, 40) || "Un amigo",
      msg: limpiarTexto(GUEST_PARAMS.msg, 140),
      dayName: limpiarTexto(payload.dayName, 20),     // día original del anfitrión
      label: limpiarTexto(payload.label, 40),
      startedAt: Date.now(),
      finalizado: false,
      exercises: ex
    };
    meta.day = diaDeHoy();                       // el invitado entrena HOY
    guardarGuestMeta(meta);
    DB = {};                                     // sesión aislada nueva para este anfitrión
    localStorage.setItem(GUEST_KEY, JSON.stringify(DB));
  }else{
    DB = cargarGuestDB();                        // retomar la sesión del invitado
    meta.day = diaDeHoy();
    // Reanudar vs. empezar de nuevo si ya hay progreso
    const hayDatos = Object.values(DB).some(a => Array.isArray(a) && a.some(e => (e.sets||[]).some(s => s.w!=="" || s.r!=="")));
    if(hayDatos && !meta.finalizado){
      const seguir = await showDialog({
        title:"Sesión en progreso",
        msg:"Ya tienes datos registrados en esta rutina. ¿Quieres continuar donde quedaste o empezar de nuevo?",
        icon:"back", confirmText:"Continuar", cancelText:"Empezar de nuevo"
      });
      if(!seguir){ DB = {}; localStorage.setItem(GUEST_KEY, JSON.stringify(DB)); clearDrafts(); clearDoneSets(); meta.finalizado=false; meta.startedAt=Date.now(); guardarGuestMeta(meta); }
    }
  }

  // 2) Plan temporal: la rutina compartida cae en el día de HOY del invitado,
  //    para que sea "el entrenamiento de hoy" y funcione todo igual que el usuario.
  const hoy = diaDeHoy();
  const semana = {};
  ALL_DAYS.forEach(d => semana[d] = { label:"Descanso", ex:[] });
  semana[hoy] = { label: meta.label || "Modo Amigo", ex: meta.exercises.map(e => ({ n:e.n, s:e.s })) };
  PLANES["__amigo__"] = { nombre:"Rutina de "+meta.host, desc:"Modo Amigo", objetivo:"Amigo",
                          nivel:"Invitado", intensidad:3, semana };
  CFG.plan = "__amigo__";                        // en memoria (no persistimos cfg del invitado)
  activeDay = hoy;

  // 3) ROUTER DE GUARDADO: el invitado guarda EXACTAMENTE como el usuario (save(DB)),
  //    pero a su clave local aislada y SIN tocar MongoDB.
  save = function(db){ localStorage.setItem(GUEST_KEY, JSON.stringify(db)); };

  // 4) "Concluir sesión de entrenamiento" → resumen Wrapped del invitado.
  concluirSesion = function(){ return guestFinalizar(); };

  // 5) Shell: banner + barra de navegación del invitado (Progreso / Diccionario / Cuenta)
  montarShellInvitado(meta);

  renderEntreno();
  if(meta.finalizado) mostrarWrapped(meta);
}

/* Banner + barra inferior del invitado (reusa las vistas reales Progreso/Diccionario) */
function montarShellInvitado(meta){
  const tag = document.querySelector("header .tag");
  if(tag) tag.textContent = "Modo Amigo · " + (meta.dayName ? meta.dayName+" de " : "Rutina de ") + meta.host;

  const main = document.querySelector("main");
  if(main && !document.getElementById("guestBanner")){
    const b = document.createElement("div");
    b.id = "guestBanner";
    b.innerHTML = `${ICON('users',14)} <span>Estás como <b>invitado</b>. Tus datos quedan en este celular, sin cuenta.</span>`;
    main.insertBefore(b, main.firstChild);
    // Mensaje del anfitrión (si lo dejó)
    if(meta.msg){
      const m = document.createElement("div");
      m.id = "guestMsg";
      m.innerHTML = `${ICON('bolt',14)} <span><b>${escapeHtml(meta.host)}:</b> "${escapeHtml(meta.msg)}"</span>`;
      main.insertBefore(m, b.nextSibling);
    }
  }

  // Barra inferior: ocultamos Prevención/Usuarios (vía CSS) y añadimos "Cuenta".
  const bnav = document.getElementById("bnav");
  if(bnav && !document.getElementById("guestAccount")){
    const btn = document.createElement("button");
    btn.id = "guestAccount";
    btn.innerHTML = `<span class="ic">${ICON('cloud',20)}</span>Cuenta`;
    btn.onclick = ()=>{
      document.querySelectorAll("#bnav button").forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      prepararTraspasoInvitado();   // por si crea cuenta, no pierde lo registrado
      showAuth();
    };
    bnav.appendChild(btn);
  }
}

/* Pantalla de enlace caducado */
function mostrarLinkExpirado(host){
  let app = document.getElementById("guestApp");
  if(!app){ app = document.createElement("div"); app.id = "guestApp"; document.body.appendChild(app); }
  app.classList.add("show");
  document.body.style.overflow = "hidden";
  app.innerHTML = `
    <div class="guest-expired">
      ${ICON('clock',40)}
      <div class="ge-t">Enlace caducado</div>
      <div class="ge-s">Este enlace de <b>${escapeHtml(host||"tu amigo")}</b> ya no está activo (dura 24 h).<br>Pídele que te comparta uno nuevo.</div>
    </div>`;
}

/* Guarda una copia de los datos del invitado para importarlos si crea una cuenta */
function prepararTraspasoInvitado(){
  try{
    const db = cargarGuestDB();
    if(db && Object.keys(db).length) localStorage.setItem(GUEST_IMPORT_KEY, JSON.stringify(db));
  }catch(e){}
}

/* Finalizar sesión del invitado → Wrapped (los diálogos salen sobre el shell, se ven bien) */
async function guestFinalizar(){
  guardarBorradoresPendientes();               // autoguardar lo escrito
  const meta = cargarGuestMeta();
  if(!meta) return;
  const st = statsGuest(meta);
  if(!st.hechos){ await alertDlg("Registra al menos un ejercicio hoy antes de finalizar.", {title:"Sesión vacía", icon:"warn"}); return; }
  const ok = await showDialog({ title:"¿Finalizar sesión?", msg:`${st.hechos} de ${st.total} ejercicios registrados.\nVerás tu resumen para compartir.`, icon:"check2", confirmText:"Ver resumen", cancelText:"Seguir" });
  if(!ok) return;
  stopTimer && stopTimer();
  meta.finalizado = true; meta.finishedAt = Date.now();
  guardarGuestMeta(meta);
  lanzarConfetti && lanzarConfetti();
  mostrarWrapped(meta);
}

/* Todos los registros del día compartido (uno por ejercicio) */
function registrosGuest(meta){
  const {iso} = nowStamp();
  return meta.exercises.map(exm=>{
    const ex = { n:exm.n, s:exm.s };
    const rec = registroDe(exId(ex), meta.day, iso);
    return { ex, rec };
  });
}

/* ============ CÁLCULO DE MÉTRICAS (lee de DB, como el usuario real) ============ */
function statsGuest(meta){
  let vol=0, hechos=0; const rpes=[]; const prs=[];
  registrosGuest(meta).forEach(({ex,rec})=>{
    if(!rec) return;
    const done = rec.sets.filter(s => s.w!=="" || s.r!=="");
    if(done.length) hechos++;
    let best=0;
    rec.sets.forEach(s=>{
      vol += (parseFloat(s.w)||0)*(parseFloat(s.r)||0);
      if(s.rpe) rpes.push(parseFloat(s.rpe)||0);
      const e = epley(s.w, s.r);
      if(e>best) best=e;
    });
    if(best>0) prs.push({ n:ex.n, v:best });
  });
  prs.sort((a,b)=>b.v-a.v);
  const rpeAvg = rpes.length ? rpes.reduce((a,b)=>a+b,0)/rpes.length : 0;
  return { vol:Math.round(vol), hechos, total:meta.exercises.length, rpeAvg, prs };
}

/* ============ WRAPPED (resumen para screenshot) ============ */
function mostrarWrapped(meta){
  const st = statsGuest(meta);
  let app = document.getElementById("guestApp");
  if(!app){ app = document.createElement("div"); app.id = "guestApp"; document.body.appendChild(app); }
  app.classList.add("show");
  document.body.style.overflow = "hidden";
  const fecha = fmtDateFull(nowStamp().iso);
  const dur = (meta.startedAt && meta.finishedAt) ? Math.max(1, Math.round((meta.finishedAt - meta.startedAt)/60000)) : 0;
  const subt = `${escapeHtml(meta.host)}${meta.dayName?" · "+escapeHtml(meta.dayName):""} · ${fecha}${dur?` · ${dur} min`:""}`;

  const filas = registrosGuest(meta).map(({ex,rec})=>{
    if(!rec) return "";
    const done = rec.sets.filter(s => s.w!=="" || s.r!=="");
    if(!done.length) return "";
    const T = tipoEjercicio(ex);
    const lineas = done.map((s,i)=>{
      const cuerpo = T.sinPeso
        ? `${s.r||"–"} ${T.labelRep}`
        : `${s.w||"–"} lb x ${s.r||"–"} reps`;
      return `<div class="wrap-set">⤷ Serie ${i+1}: ${cuerpo}${s.rpe?` <span class="wrap-rpe">@${s.rpe}</span>`:""}</div>`;
    }).join("");
    const best = Math.max(0, ...rec.sets.map(s=>epley(s.w,s.r)));
    return `<div class="wrap-exblock">
      <div class="wrap-exname">${escapeHtml(ex.n)}${best?`<span class="wrap-1rm">${best} lb · 1RM est</span>`:""}</div>
      ${lineas}
    </div>`;
  }).join("");

  const prTop = st.prs.slice(0,3);

  app.innerHTML = `
    <div class="wrap-scroll">
      <div class="wrap-card" id="wrapCard">
        <div class="wrap-brand">STIIMPYS · MODO AMIGO</div>
        <div class="wrap-title2">${escapeHtml(meta.label || meta.dayName || meta.day)}</div>
        <div class="wrap-date">${subt}</div>

        <div class="wrap-metrics">
          <div class="wrap-tile">
            <div class="wrap-val">${fmtNum(st.vol)}</div>
            <div class="wrap-lbl">Volumen (lb)</div>
          </div>
          <div class="wrap-tile">
            <div class="wrap-val">${st.hechos}/${st.total}</div>
            <div class="wrap-lbl">Ejercicios</div>
          </div>
          <div class="wrap-tile">
            <div class="wrap-val">${st.rpeAvg?st.rpeAvg.toFixed(1):"–"}</div>
            <div class="wrap-lbl">RPE prom.</div>
          </div>
        </div>

        ${prTop.length?`<div class="wrap-section">
          <div class="wrap-section-h">${ICON('flame',13)} Hitos del día</div>
          ${prTop.map(p=>`<div class="wrap-pr"><span>${escapeHtml(p.n)}</span><b>${p.v} lb</b></div>`).join("")}
        </div>`:""}

        <div class="wrap-section">
          <div class="wrap-section-h">${ICON('list',13)} Series</div>
          <div class="wrap-table">${filas || `<div class="wrap-set">Sin series registradas</div>`}</div>
        </div>

        <div class="wrap-foot">Registrado en Stiimpys · stiimpys.app</div>
      </div>
    </div>

    <div class="wrap-actions">
      <button class="wrap-btn img" id="wrapImg">${ICON('download',16)} Descargar imagen</button>
      <button class="wrap-btn wa" id="wrapWa">${ICON('users',16)} Copiar texto para WhatsApp</button>
      <button class="wrap-btn pdf" id="wrapPdf">${ICON('download',16)} Exportar PDF</button>
      <button class="wrap-btn cta" id="wrapCta">${ICON('cloud',16)} Guardar esto en mi cuenta</button>
      <button class="wrap-btn ghost" id="wrapBack">${ICON('back',15)} Volver a editar</button>
    </div>`;

  document.getElementById("wrapImg").onclick = ()=>{ exportarWrappedImagen(meta, st); };
  document.getElementById("wrapWa").onclick = async()=>{
    const txt = textoWhatsApp(meta, st);
    try{ await navigator.clipboard.writeText(txt); flashMsg("Texto copiado · pégalo en WhatsApp"); }
    catch(e){ window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank"); }
  };
  document.getElementById("wrapPdf").onclick = ()=>{
    // Sin librerías externas: impresión nativa → "Guardar como PDF".
    window.print();
  };
  document.getElementById("wrapCta").onclick = ()=>{
    prepararTraspasoInvitado();   // conserva lo registrado para importarlo tras crear cuenta
    showAuth();
  };
  document.getElementById("wrapBack").onclick = ()=>{
    meta.finalizado = false; guardarGuestMeta(meta);
    app.classList.remove("show");
    document.body.style.overflow = "";
    renderEntreno();
  };
}

/* Texto plano para compartir por WhatsApp */
function textoWhatsApp(meta, st){
  let t = `🏋️ ${meta.host} · Modo Amigo — ${meta.label || meta.day}\n`;
  t += `\n📊 Volumen: ${fmtNum(st.vol)} lb`;
  t += `\n✅ Ejercicios: ${st.hechos}/${st.total}`;
  t += `\n💪 RPE prom: ${st.rpeAvg ? st.rpeAvg.toFixed(1) : "–"}\n`;
  registrosGuest(meta).forEach(({ex,rec})=>{
    if(!rec) return;
    const done = rec.sets.filter(s => s.w!=="" || s.r!=="");
    if(!done.length) return;
    const T = tipoEjercicio(ex);
    t += `\n${ex.n}`;
    done.forEach((s,i)=>{
      const cuerpo = T.sinPeso ? `${s.r||"–"} ${T.labelRep}` : `${s.w||"–"} lb x ${s.r||"–"} reps`;
      t += `\n  ⤷ Serie ${i+1}: ${cuerpo}${s.rpe?` @${s.rpe}`:""}`;
    });
    const best = Math.max(0, ...rec.sets.map(s=>epley(s.w,s.r)));
    if(best) t += `\n  🔥 1RM est: ${best} lb`;
  });
  t += `\n\nHecho en Stiimpys 💥`;
  return t;
}

/* ============ EXPORTAR IMAGEN (canvas, sin librerías externas) ============ */
function wrapRoundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function exportarWrappedImagen(meta, st){
  const regs = registrosGuest(meta).filter(x => x.rec && x.rec.sets.some(s => s.w!=="" || s.r!==""));
  const W=1080, P=56, dpr=2;
  const fS='-apple-system,system-ui,"Segoe UI",Roboto,sans-serif';
  const fM='ui-monospace,Menlo,Consolas,monospace';
  const big=document.createElement("canvas");
  big.width=W*dpr; big.height=4600*dpr;
  const c=big.getContext("2d"); c.scale(dpr,dpr); c.textBaseline="top";
  c.fillStyle="#0d0d0d"; c.fillRect(0,0,W,4600);

  let y=P+18;
  c.fillStyle="#8b8f9c"; c.font=`700 22px ${fS}`; c.fillText("STIIMPYS · MODO AMIGO", P, y); y+=42;
  c.fillStyle="#f2f3f7"; c.font=`800 62px ${fS}`; c.fillText((meta.label||meta.dayName||meta.day||"Entreno").slice(0,22), P, y); y+=80;
  const dur=(meta.startedAt&&meta.finishedAt)?Math.max(1,Math.round((meta.finishedAt-meta.startedAt)/60000)):0;
  c.fillStyle="#8b8f9c"; c.font=`500 25px ${fS}`;
  c.fillText(`${meta.host}${meta.dayName?" · "+meta.dayName:""} · ${fmtDateFull(nowStamp().iso)}${dur?` · ${dur} min`:""}`.slice(0,54), P, y); y+=60;

  const tiles=[["#4db8ff",fmtNum(st.vol),"VOLUMEN (LB)"],["#f2f3f7",`${st.hechos}/${st.total}`,"EJERCICIOS"],["#ffcc4d",st.rpeAvg?st.rpeAvg.toFixed(1):"–","RPE PROM"]];
  const gap=18, tw=(W-2*P-2*gap)/3, th=150;
  tiles.forEach((t,i)=>{
    const x=P+i*(tw+gap);
    c.fillStyle="rgba(255,255,255,0.03)"; wrapRoundRect(c,x,y,tw,th,18); c.fill();
    c.strokeStyle="#23232c"; c.lineWidth=1.5; wrapRoundRect(c,x,y,tw,th,18); c.stroke();
    c.textAlign="center";
    c.fillStyle=t[0]; c.font=`800 50px ${fS}`; c.fillText(t[1], x+tw/2, y+40);
    c.fillStyle="#8b8f9c"; c.font=`600 19px ${fS}`; c.fillText(t[2], x+tw/2, y+108);
    c.textAlign="left";
  });
  y+=th+46;

  const prTop=st.prs.slice(0,3);
  if(prTop.length){
    c.fillStyle="#ffcc4d"; c.font=`800 23px ${fS}`; c.fillText("HITOS DEL DÍA", P, y); y+=42;
    prTop.forEach(p=>{
      c.fillStyle="#f2f3f7"; c.font=`600 27px ${fS}`; c.fillText(p.n.slice(0,26), P, y);
      c.fillStyle="#ffcc4d"; c.font=`800 27px ${fS}`; c.textAlign="right"; c.fillText(p.v+" lb", W-P, y); c.textAlign="left";
      y+=38; c.strokeStyle="rgba(255,255,255,0.06)"; c.beginPath(); c.moveTo(P,y); c.lineTo(W-P,y); c.stroke(); y+=18;
    });
    y+=18;
  }

  c.fillStyle="#4db8ff"; c.font=`800 23px ${fS}`; c.fillText("SERIES", P, y); y+=44;
  regs.forEach(({ex,rec})=>{
    const T=tipoEjercicio(ex);
    const best=Math.max(0,...rec.sets.map(s=>epley(s.w,s.r)));
    c.fillStyle="#f2f3f7"; c.font=`700 26px ${fS}`; c.fillText(ex.n.slice(0,24), P, y);
    if(best){ c.fillStyle="#5c5f6b"; c.font=`600 19px ${fM}`; c.textAlign="right"; c.fillText(best+" lb · 1RM", W-P, y+5); c.textAlign="left"; }
    y+=40;
    rec.sets.filter(s=>s.w!==""||s.r!=="").forEach((s,i)=>{
      const cuerpo=T.sinPeso?`${s.r||"–"} ${T.labelRep}`:`${s.w||"–"} lb x ${s.r||"–"} reps`;
      const base=`⤷ Serie ${i+1}: ${cuerpo}`;
      c.fillStyle="#cdd0d8"; c.font=`400 23px ${fM}`; c.fillText(base, P+6, y);
      if(s.rpe){ c.fillStyle="#4db8ff"; c.fillText(` @${s.rpe}`, P+6+c.measureText(base).width, y); }
      y+=38;
    });
    y+=16;
  });

  y+=8;
  c.strokeStyle="rgba(255,255,255,0.06)"; c.beginPath(); c.moveTo(P,y); c.lineTo(W-P,y); c.stroke(); y+=24;
  c.fillStyle="#5c5f6b"; c.font=`600 19px ${fS}`; c.textAlign="center";
  c.fillText("REGISTRADO EN STIIMPYS · stiimpys.app", W/2, y); c.textAlign="left"; y+=42;

  // borde de la tarjeta
  c.strokeStyle="#2c2c37"; c.lineWidth=2; wrapRoundRect(c,3,3,W-6,y-6,26); c.stroke();

  const H=y+P;
  const out=document.createElement("canvas"); out.width=W*dpr; out.height=H*dpr;
  out.getContext("2d").drawImage(big,0,0);
  out.toBlob(async(blob)=>{
    if(!blob){ flashMsg("No se pudo generar la imagen"); return; }
    const file=new File([blob],"stiimpys-wrapped.png",{type:"image/png"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file], title:"Mi entreno en Stiimpys"}); return; }catch(e){ if(e && e.name==="AbortError") return; }
    }
    const url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url; a.download="stiimpys-wrapped.png"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    flashMsg("Imagen descargada");
  }, "image/png");
}

/* Fusiona los datos guardados como invitado en la cuenta recién iniciada */
function importarInvitadoPendiente(){
  if(!getAuth()) return;
  let imp; try{ imp = JSON.parse(localStorage.getItem(GUEST_IMPORT_KEY)); }catch(e){ imp=null; }
  localStorage.removeItem(GUEST_IMPORT_KEY);
  if(!imp || typeof imp!=="object") return;
  let added=0;
  Object.keys(imp).forEach(id=>{
    if(!Array.isArray(imp[id])) return;
    if(!DB[id]) DB[id]=[];
    imp[id].forEach(e=>{
      const dup = DB[id].some(x => x.date===e.date && (x.day||"")===(e.day||""));
      if(!dup){ DB[id].push(e); added++; }
    });
  });
  if(added){ save(DB); if(typeof pushData==="function") pushData(true); flashMsg("Tu sesión de invitado se guardó en tu cuenta"); }
  try{ history.replaceState(null,"",location.pathname); }catch(e){}  // limpiar params del link
}
