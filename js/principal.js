/**
 * ============================================================
 *  principal.js — Punto de entrada (Bootstrapper)
 * ============================================================
 *  Desbloqueo de audio, navegacion por tabs, listeners del
 *  header, importacion, calculadora, autenticacion y arranque
 *  de la aplicacion (splash -> auth/app).
 * ============================================================
 */

/* ============ DESBLOQUEO DE AUDIO (iOS / Safari) ============ */
document.addEventListener("touchstart",()=>{const c=initAudio();if(c&&c.state==="suspended")c.resume()},{once:true});
document.addEventListener("click",()=>{const c=initAudio();if(c&&c.state==="suspended")c.resume()},{once:true});

/* ============ NAVEGACION INFERIOR ============ */
document.querySelectorAll("#bnav button").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll("#bnav button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const t=b.dataset.tab;
    ["entreno","progreso","diccionario","prevencion","usuarios"].forEach(name=>{
      const el=document.getElementById("tab-"+name);
      const show=name===t;
      el.classList.toggle("hidden",!show);
      if(show){el.style.animation="none";void el.offsetWidth;el.style.animation=""}
    });
    if(navigator.vibrate)navigator.vibrate(8);
    if(t==="progreso")renderProgreso();
    if(t==="diccionario")renderDiccionario();
    if(t==="prevencion")renderPrevencion();
    if(t==="usuarios")renderUsuarios();
  };
});

/* ============ TAB ENTRENO ============ */

/* ============ BOTONES DEL HEADER ============ */
document.getElementById("openOpts").onclick=openMenu;
document.getElementById("openCal").onclick=abrirCalendario;
document.getElementById("closeSheet").onclick=closeSheet;
overlay.onclick=closeSheet;

/* ============ IMPORTAR RESPALDO ============ */
document.getElementById("importFile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=async()=>{try{const data=JSON.parse(r.result);if(typeof data!=="object")throw 0;
    const ok=await showDialog({title:"¿Importar respaldo?",msg:"Se reemplazarán tus datos actuales con los del archivo.",icon:"upload",confirmText:"Importar",cancelText:"Cancelar"});
    if(ok){DB=data;save(DB);renderEntreno();showMenu();await alertDlg("Respaldo importado correctamente.",{title:"Listo",icon:"check2"})}
  }catch(err){await alertDlg("El archivo no es un respaldo válido.",{title:"Error",icon:"warn"})}};
  r.readAsText(f);e.target.value="";
};



/* ============ TEMPORIZADOR ============ */
document.getElementById("tAdd").onclick=()=>addTimer(30);
document.getElementById("tClose").onclick=stopTimer;

document.addEventListener("visibilitychange",()=>{if(!document.hidden)runTimer()});
runTimer();

/* ============ AUTENTICACION ============ */
document.getElementById("tabLogin").onclick=()=>switchAuthMode("login");
document.getElementById("tabSignup").onclick=()=>switchAuthMode("signup");
document.getElementById("authSubmit").onclick=submitAuth;
["auName","auEmail","auPass","auPass2"].forEach(id=>{
  const el=document.getElementById(id);
  el.addEventListener("keydown",e=>{if(e.key==="Enter")submitAuth()});
});


/* ============ CALCULADORA DE DISCOS ============ */
document.getElementById("plateClose").onclick=closePlate;
document.getElementById("platePop").onclick=e=>{if(e.target.id==="platePop")closePlate()};
document.getElementById("plateWeight").oninput=calcPlates;
document.querySelectorAll(".plate-units .pu").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".plate-units .pu").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");plateUnit=btn.dataset.u;plateBar=BARS[plateUnit][0];renderPlateBars();calcPlates();
});

/* ============ ARRANQUE ============ */
paintStaticIcons();
renderEntreno();
// inicializar logros ya obtenidos sin disparar confetti la primera carga
if(getSeen().length===0){setSeen(logrosDesbloqueados().map(l=>l.id))}
// Arranque: tras el splash, decidir auth o app
switchAuthMode("login");
setTimeout(async ()=>{
  document.getElementById("splash").classList.add("hide");
  // Modo Amigos: si el link trae la rutina de un amigo y no hay cuenta,
  // arrancar el flujo de invitado en vez del muro de login.
  if(typeof GUEST_MODE!=="undefined" && GUEST_MODE){ arrancarModoAmigo(); return; }
  const auth=getAuth();
  if(auth){
    // sesión existente: cargar datos de la nube y marcar online
    await pullData();renderEntreno();startHeartbeat();
  }else{
    // sin sesión: obligar a iniciar sesión / crear cuenta
    showAuth();
  }
},1250);
