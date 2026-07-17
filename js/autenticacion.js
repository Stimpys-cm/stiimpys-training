/**
 * autenticacion.js — Auth y sincronización
 */
const API_BASE = window.location.origin;  // mismo dominio (API en /api)

/* Auto-cargador del módulo Modo Amigos: si el index.html no incluye sus archivos,
   los cargamos aquí. Evita el fallo típico de "olvidé subir el index.html nuevo".
   Si el <script> ya está en el index.html, no hace nada (no duplica). */
(function cargarModoAmigos(){
  if(!document.querySelector('script[src*="modo-amigos.js"]')){
    var s=document.createElement("script"); s.src="js/modo-amigos.js"; s.defer=true;
    document.head.appendChild(s);
  }
  if(!document.querySelector('link[href*="modo-amigos.css"]')){
    var l=document.createElement("link"); l.rel="stylesheet"; l.href="css/modo-amigos.css";
    document.head.appendChild(l);
  }
})();

const AUTH_KEY="stimpys_auth";
function getAuth(){try{return JSON.parse(localStorage.getItem(AUTH_KEY))}catch(e){return null}}
function setAuth(a){a?localStorage.setItem(AUTH_KEY,JSON.stringify(a)):localStorage.removeItem(AUTH_KEY)}

let authMode="login"; // 'login' | 'signup'

function showAuth(){document.getElementById("auth").classList.add("show")}
function hideAuth(){document.getElementById("auth").classList.remove("show")}

function switchAuthMode(m){
  authMode=m;
  document.getElementById("tabLogin").classList.toggle("active",m==="login");
  document.getElementById("tabSignup").classList.toggle("active",m==="signup");
  document.getElementById("fldName").style.display=m==="signup"?"flex":"none";
  document.getElementById("fldPass2").style.display=m==="signup"?"flex":"none";
  document.getElementById("authSubmit").textContent=m==="signup"?"Crear cuenta":"Iniciar sesión";
  document.getElementById("auPass").setAttribute("autocomplete",m==="signup"?"new-password":"current-password");
  clearAuthErrors();
  document.getElementById("authMsg").textContent="";
}
function clearAuthErrors(){
  ["errName","errEmail","errPass","errPass2"].forEach(id=>document.getElementById(id).textContent="");
  ["auName","auEmail","auPass","auPass2"].forEach(id=>document.getElementById(id).classList.remove("invalid"));
}
function setErr(field,input,msg){document.getElementById(field).textContent=msg;document.getElementById(input).classList.add("invalid")}

function validateAuth(){
  clearAuthErrors();let ok=true;
  const name=document.getElementById("auName").value.trim();
  const email=document.getElementById("auEmail").value.trim();
  const pass=document.getElementById("auPass").value;
  const pass2=document.getElementById("auPass2").value;
  if(authMode==="signup"&&name.length<2){setErr("errName","auName","Escribe tu nombre");ok=false}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr("errEmail","auEmail","Correo inválido");ok=false}
  if(pass.length<6){setErr("errPass","auPass","Mínimo 6 caracteres");ok=false}
  if(authMode==="signup"&&pass!==pass2){setErr("errPass2","auPass2","Las contraseñas no coinciden");ok=false}
  return ok?{name,email,pass}:null;
}

async function apiCall(path,method,body,token){
  if(!API_BASE)throw new Error("La app aún no está conectada a un servidor. Usa 'sin cuenta' por ahora.");
  const headers={"Content-Type":"application/json"};
  if(token)headers.Authorization="Bearer "+token;
  const r=await fetch(API_BASE+path,{method,headers,body:body?JSON.stringify(body):undefined});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||"Error de conexión");
  return data;
}

/* ============ AISLAMIENTO ENTRE CUENTAS ============ */
/* Todas las claves con datos del usuario. Al cambiar de cuenta se borran TODAS
   para que ninguna cuenta vea los datos de otra en el mismo dispositivo. */
const ULTIMO_KEY="stimpys_ultimo_user";
const CLAVES_USUARIO=[
  "stimpys_v1",            // entrenamientos
  "stimpys_bw",            // peso corporal
  "stimpys_perfil",        // foto, bio, banner, insignias
  "stimpys_mis_rutinas",   // rutinas personalizadas
  "stimpys_seen_logros",   // logros vistos
  "stimpys_drafts",        // borradores
  "stimpys_done_sets",     // series marcadas
  "stimpys_sessions_done", // sesiones concluidas
  "stimpys_skipdays",      // días saltados
  "stimpys_skip",          // ejercicios saltados
  "stimpys_subs",          // sustituciones
  "stimpys_notas",         // notas por ejercicio
  "stimpys_feels",         // sensaciones
  "stimpys_ss_pos",        // posición en sesión guiada
  "stimpys_timer",         // temporizador
  "stimpys_cfg",           // configuración (plan, unidades...)
  "stimpys_guest_workout", // datos de sesión invitado (Modo Amigos)
  "stimpys_guest_meta",    // meta de sesión invitado
];
function limpiarDatosLocales(){
  CLAVES_USUARIO.forEach(k=>localStorage.removeItem(k));
}

async function submitAuth(){
  const v=validateAuth();
  const msg=document.getElementById("authMsg");msg.className="auth-msg";msg.textContent="";
  if(!v)return;
  const btn=document.getElementById("authSubmit");
  btn.disabled=true;btn.textContent=authMode==="signup"?"Creando...":"Entrando...";
  try{
    let res;
    if(authMode==="signup")res=await apiCall("/api/register","POST",{name:v.name,email:v.email,password:v.pass});
    else res=await apiCall("/api/login","POST",{email:v.email,password:v.pass});
    // ¿Es una cuenta DISTINTA a la última que usó este dispositivo?
    const ultimo=localStorage.getItem(ULTIMO_KEY);
    const nuevoId=res.id||res.email;
    if(ultimo&&ultimo!==nuevoId){
      // Otra persona (u otra cuenta): borrar TODO lo local antes de cargar lo suyo
      limpiarDatosLocales();
      DB={};CFG=loadCfg();
    }
    localStorage.setItem(ULTIMO_KEY,nuevoId);
    setAuth({token:res.token,name:res.name,email:res.email,id:res.id||null});
    // Si venía en modo invitado, recargamos limpio: la app arranca como usuario
    // normal (el guardado deja de apuntar a la clave aislada) y, tras el pull,
    // importarInvitadoPendiente() fusiona lo que registró como invitado.
    if(typeof GUEST_MODE!=="undefined" && GUEST_MODE){ location.reload(); return; }
    msg.className="auth-msg ok";msg.textContent="¡Listo! Cargando tus datos...";
    await pullData(); // trae datos de la nube
    hideAuth();
    renderEntreno();
    startHeartbeat();
  }catch(e){
    msg.className="auth-msg error";msg.textContent=e.message;
  }finally{
    btn.disabled=false;btn.textContent=authMode==="signup"?"Crear cuenta":"Iniciar sesión";
  }
}

// Trae datos del backend y los fusiona en local
async function pullData(){
  const auth=getAuth();if(!auth||!API_BASE)return;
  try{
    const res=await apiCall("/api/data","GET",null,auth.token);
    if(res.data){
      const d=res.data;
      // Si el backend aún no guarda un campo, NO borramos lo local
      // (el aislamiento entre cuentas ya lo garantiza limpiarDatosLocales()).
      if(d.db)DB=d.db;
      if(d.bw)localStorage.setItem("stimpys_bw",JSON.stringify(d.bw));
      if(d.rutinas!==undefined)localStorage.setItem("stimpys_mis_rutinas",JSON.stringify(d.rutinas||{}));
      if(d.notas!==undefined)localStorage.setItem("stimpys_notas",JSON.stringify(d.notas||{}));
      if(d.feels!==undefined)localStorage.setItem("stimpys_feels",JSON.stringify(d.feels||[]));
      if(d.skipdays!==undefined)localStorage.setItem("stimpys_skipdays",JSON.stringify(d.skipdays||[]));
      if(d.sesiones!==undefined)localStorage.setItem("stimpys_sessions_done",JSON.stringify(d.sesiones||[]));
      if(d.logros!==undefined)localStorage.setItem("stimpys_seen_logros",JSON.stringify(d.logros||[]));
      save(DB);
    }
  }catch(e){/* offline: se usa lo local */}
  // El perfil (foto, bio, banner) SIEMPRE viene del servidor
  try{
    const r=await apiCall("/api/profile","GET",null,auth.token);
    if(r.profile){
      setPerfil({
        nombre:r.profile.nombre||"",avatar:r.profile.avatar||"",bio:r.profile.bio||"",
        banner:r.profile.banner||"azul",insigniaDestacada:r.profile.insigniaDestacada||"",
        showcases:r.profile.showcases||["stats","logros","pr"]
      });
    }
  }catch(e){/* sin conexión: se conserva el perfil local */}
  if(typeof importarInvitadoPendiente==="function") importarInvitadoPendiente(); // fusiona datos de invitado (modo-amigos.js)
}

// Envía datos al backend (con debounce)
let syncTimer=null;
function paqueteDatos(){
  const g=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
  return {
    db:DB,
    bw:getBW(),
    rutinas:getMisRutinas(),
    notas:g("stimpys_notas")||{},
    feels:g("stimpys_feels")||[],
    skipdays:g("stimpys_skipdays")||[],
    sesiones:g("stimpys_sessions_done")||[],
    logros:g("stimpys_seen_logros")||[],
  };
}
function pushData(inmediato){
  const auth=getAuth();if(!auth||!API_BASE)return Promise.resolve();
  clearTimeout(syncTimer);
  if(inmediato){
    return apiCall("/api/data","POST",paqueteDatos(),auth.token).catch(()=>{});
  }
  syncTimer=setTimeout(async()=>{
    try{await apiCall("/api/data","POST",paqueteDatos(),auth.token);}catch(e){}
  },800);
  return Promise.resolve();
}

// Envolver save() para que sincronice tras cada guardado
const _save=save;
save=function(db){_save(db);pushData()};

/* Cierra sesión borrando TODO rastro del usuario en este dispositivo */
async function logout(){
  const ok=await showDialog({
    title:"¿Cerrar sesión?",
    msg:"Se borrarán del dispositivo tus datos locales (foto, rutinas y registros). Todo sigue guardado en tu cuenta y volverá al iniciar sesión.",
    icon:"warn",confirmText:"Cerrar sesión",cancelText:"Cancelar"});
  if(!ok)return;
  stopHeartbeat();
  // subir lo pendiente antes de borrar
  try{const a=getAuth();if(a&&API_BASE)await pushData(true)}catch(e){}
  limpiarDatosLocales();
  setAuth(null);
  location.reload();
}

// Listeners de la pantalla auth
document.getElementById("tabLogin").onclick=()=>switchAuthMode("login");
document.getElementById("tabSignup").onclick=()=>switchAuthMode("signup");
document.getElementById("authSubmit").onclick=submitAuth;
["auName","auEmail","auPass","auPass2"].forEach(id=>{
  const el=document.getElementById(id);
  el.addEventListener("keydown",e=>{if(e.key==="Enter")submitAuth()});
});

/* ============ USUARIOS (global, online, desglose) ============ */


/* ============ HEARTBEAT (marca online cada 45s) ============ */
let _hbTimer=null;
async function heartbeat(){
  const auth=getAuth();if(!auth)return;
  try{await apiCall("/api/heartbeat","POST",{},auth.token);}catch(e){}
}
function startHeartbeat(){
  stopHeartbeat();
  heartbeat();
  _hbTimer=setInterval(heartbeat,45000);
}
function stopHeartbeat(){if(_hbTimer){clearInterval(_hbTimer);_hbTimer=null}}

// Pausa/reanuda con la visibilidad de la pestaña
document.addEventListener("visibilitychange",()=>{
  if(document.hidden)stopHeartbeat();
  else if(getAuth())startHeartbeat();
});
