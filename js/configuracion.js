/**
 * ============================================================
 *  configuracion.js — Configuración global y planes
 * ============================================================
 */
const PLANES={
  "ppl-arnold":{
    nombre:"Push · Pull · Legs (original)",
    objetivo:"Hipertrofia", nivel:"Intermedio", intensidad:4,
    desc:"Tu rutina base. Empuje, jalón y pierna repartidos, con enfoque en pecho/hombro y cadena posterior.",
    semana:{
      "Lunes":{label:"Pecho · Hombro · Tríceps",ex:[
        {n:"Press Inclinado (máquina)",s:"3×6-8",rest:180},{n:"Pec-fly",s:"2×6-8",rest:150},
        {n:"Elevaciones Laterales",s:"3×8",rest:120},{n:"Extensión de tríceps con barra",s:"2×6-8",rest:150}]},
      "Martes":{label:"Espalda · Bíceps",ex:[
        {n:"Jalón al pecho (agarre abierto)",s:"3×6-8",rest:180},{n:"Remo unilateral en polea",s:"2×6-8",rest:150},
        {n:"Curl con polea en banco",s:"2×6-8",rest:120},{n:"Curl de bíceps con mancuerna",s:"2×8-10",rest:120}]},
      "Miércoles":{label:"Pierna · Cuádriceps",ex:[
        {n:"Prensa",s:"3×6-8",rest:210},{n:"Extensión de rodilla",s:"2×6-8",rest:150},{n:"Curl femoral",s:"2×6-8",rest:150},
        {n:"Abductores",s:"2×6-8",rest:120},{n:"Elevación de talones",s:"2×6-8",rest:120}]},
      "Jueves":{label:"Upper",ex:[
        {n:"Press Inclinado",s:"2×6-8",rest:180},{n:"Press Plano",s:"2×6-8",rest:180},{n:"Remo alto en máquina",s:"3×6-8",rest:150},
        {n:"Jalón / Remo en polea",s:"2×6-8",rest:150},{n:"Elevaciones Laterales",s:"2×6-8",rest:120},
        {n:"Extensión codo tras nuca (polea)",s:"2×6-8",rest:120},{n:"Curl en polea en banco",s:"2×6-8",rest:120}]},
      "Viernes":{label:"Pierna · Femoral · Glúteo",ex:[
        {n:"Peso Muerto Rumano con barra",s:"2×6-8",rest:210},{n:"Extensión de rodilla",s:"2×6-8",rest:150},
        {n:"Curl femoral",s:"2×6-8",rest:150},{n:"Abductores",s:"2×6-8",rest:120},{n:"Elevación de talones",s:"2×6-8",rest:120}]},
      "Sábado":{label:"Descanso",ex:[]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "fullbody-principiante":{
    nombre:"Full Body 3 días",
    objetivo:"Fuerza", nivel:"Principiante", intensidad:2,
    desc:"Ideal para empezar. Tres sesiones de cuerpo completo con los patrones básicos: sentadilla, empuje, jalón y bisagra. Mucha técnica, poco volumen.",
    semana:{
      "Lunes":{label:"Full Body A",ex:[
        {n:"Sentadilla con barra",s:"3×5",rest:180},{n:"Press de banca",s:"3×5",rest:180},
        {n:"Remo con barra",s:"3×6-8",rest:150},{n:"Plancha abdominal",s:"3×30s",rest:90}]},
      "Martes":{label:"Descanso",ex:[]},
      "Miércoles":{label:"Full Body B",ex:[
        {n:"Peso Muerto Rumano con barra",s:"3×6",rest:210},{n:"Press militar",s:"3×6-8",rest:150},
        {n:"Jalón al pecho (agarre abierto)",s:"3×8-10",rest:150},{n:"Elevación de talones",s:"3×10-12",rest:90}]},
      "Jueves":{label:"Descanso",ex:[]},
      "Viernes":{label:"Full Body C",ex:[
        {n:"Prensa",s:"3×8-10",rest:180},{n:"Press Inclinado (máquina)",s:"3×8-10",rest:150},
        {n:"Remo unilateral en polea",s:"3×8-10",rest:120},{n:"Curl de bíceps con mancuerna",s:"2×10-12",rest:90}]},
      "Sábado":{label:"Descanso",ex:[]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "upper-lower":{
    nombre:"Upper / Lower 4 días",
    objetivo:"Hipertrofia", nivel:"Intermedio", intensidad:3,
    desc:"Divide tren superior e inferior dos veces por semana. Buen equilibrio entre frecuencia y recuperación para ganar músculo de forma sostenible.",
    semana:{
      "Lunes":{label:"Upper (fuerza)",ex:[
        {n:"Press de banca",s:"4×5-6",rest:210},{n:"Remo con barra",s:"4×6-8",rest:180},
        {n:"Press militar",s:"3×6-8",rest:150},{n:"Jalón al pecho (agarre abierto)",s:"3×8-10",rest:150},
        {n:"Curl de bíceps con mancuerna",s:"3×8-10",rest:90}]},
      "Martes":{label:"Lower (fuerza)",ex:[
        {n:"Sentadilla con barra",s:"4×5-6",rest:240},{n:"Peso Muerto Rumano con barra",s:"3×6-8",rest:210},
        {n:"Prensa",s:"3×8-10",rest:180},{n:"Curl femoral",s:"3×10-12",rest:120},{n:"Elevación de talones",s:"4×10-12",rest:90}]},
      "Miércoles":{label:"Descanso",ex:[]},
      "Jueves":{label:"Upper (hipertrofia)",ex:[
        {n:"Press Inclinado (máquina)",s:"4×8-10",rest:150},{n:"Remo alto en máquina",s:"4×10-12",rest:150},
        {n:"Elevaciones Laterales",s:"4×12-15",rest:90},{n:"Extensión de tríceps con barra",s:"3×10-12",rest:90},
        {n:"Curl con polea en banco",s:"3×10-12",rest:90}]},
      "Viernes":{label:"Lower (hipertrofia)",ex:[
        {n:"Prensa",s:"4×10-12",rest:180},{n:"Extensión de rodilla",s:"4×12-15",rest:120},
        {n:"Curl femoral",s:"4×12-15",rest:120},{n:"Abductores",s:"3×15",rest:90},{n:"Elevación de talones",s:"4×12-15",rest:90}]},
      "Sábado":{label:"Descanso",ex:[]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "ppl-6dias":{
    nombre:"Push Pull Legs x2 (6 días)",
    objetivo:"Hipertrofia", nivel:"Avanzado", intensidad:5,
    desc:"Alto volumen para atletas experimentados. Cada patrón dos veces por semana. Exige buena recuperación, sueño y nutrición. No apto para empezar.",
    semana:{
      "Lunes":{label:"Push (pesado)",ex:[
        {n:"Press de banca",s:"4×5-6",rest:210},{n:"Press Inclinado (máquina)",s:"4×8-10",rest:150},
        {n:"Press militar",s:"3×6-8",rest:150},{n:"Elevaciones Laterales",s:"4×12-15",rest:90},
        {n:"Extensión de tríceps con barra",s:"4×8-10",rest:90}]},
      "Martes":{label:"Pull (pesado)",ex:[
        {n:"Peso Muerto Rumano con barra",s:"4×5-6",rest:240},{n:"Remo con barra",s:"4×6-8",rest:180},
        {n:"Jalón al pecho (agarre abierto)",s:"4×8-10",rest:150},{n:"Remo unilateral en polea",s:"3×10-12",rest:120},
        {n:"Curl de bíceps con mancuerna",s:"4×10-12",rest:90}]},
      "Miércoles":{label:"Legs (pesado)",ex:[
        {n:"Sentadilla con barra",s:"4×5-6",rest:240},{n:"Prensa",s:"4×8-10",rest:180},
        {n:"Curl femoral",s:"4×10-12",rest:120},{n:"Extensión de rodilla",s:"4×12-15",rest:120},{n:"Elevación de talones",s:"5×12-15",rest:90}]},
      "Jueves":{label:"Push (volumen)",ex:[
        {n:"Press Inclinado (máquina)",s:"4×10-12",rest:150},{n:"Pec-fly",s:"4×12-15",rest:90},
        {n:"Elevaciones Laterales",s:"5×15-20",rest:75},{n:"Extensión codo tras nuca (polea)",s:"4×12-15",rest:90}]},
      "Viernes":{label:"Pull (volumen)",ex:[
        {n:"Remo alto en máquina",s:"4×10-12",rest:150},{n:"Jalón / Remo en polea",s:"4×12-15",rest:120},
        {n:"Curl con polea en banco",s:"4×12-15",rest:90},{n:"Curl en polea en banco",s:"4×15",rest:75}]},
      "Sábado":{label:"Legs (volumen)",ex:[
        {n:"Prensa",s:"4×12-15",rest:180},{n:"Extensión de rodilla",s:"5×15-20",rest:90},
        {n:"Curl femoral",s:"5×15-20",rest:90},{n:"Abductores",s:"4×20",rest:75},{n:"Elevación de talones",s:"5×15-20",rest:75}]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "powerbuilding":{
    nombre:"Powerbuilding 4 días",
    objetivo:"Powerbuilding", nivel:"Avanzado", intensidad:5,
    desc:"Combina fuerza pura en los básicos (bajas repeticiones, cargas altas) con trabajo de hipertrofia accesorio. Para quienes quieren ser fuertes y grandes.",
    semana:{
      "Lunes":{label:"Fuerza · Pecho/Hombro",ex:[
        {n:"Press de banca",s:"5×3-5",rest:240},{n:"Press Inclinado",s:"4×6-8",rest:180},
        {n:"Press militar",s:"4×6-8",rest:150},{n:"Elevaciones Laterales",s:"4×12-15",rest:90},
        {n:"Extensión de tríceps con barra",s:"3×8-10",rest:90}]},
      "Martes":{label:"Fuerza · Pierna",ex:[
        {n:"Sentadilla con barra",s:"5×3-5",rest:240},{n:"Prensa",s:"4×8-10",rest:180},
        {n:"Curl femoral",s:"4×10-12",rest:120},{n:"Elevación de talones",s:"4×12-15",rest:90}]},
      "Miércoles":{label:"Descanso",ex:[]},
      "Jueves":{label:"Fuerza · Espalda",ex:[
        {n:"Peso Muerto Rumano con barra",s:"5×3-5",rest:240},{n:"Remo con barra",s:"4×6-8",rest:180},
        {n:"Jalón al pecho (agarre abierto)",s:"4×8-10",rest:150},{n:"Curl de bíceps con mancuerna",s:"4×10-12",rest:90}]},
      "Viernes":{label:"Hipertrofia · Full",ex:[
        {n:"Press Inclinado (máquina)",s:"4×10-12",rest:150},{n:"Remo alto en máquina",s:"4×10-12",rest:150},
        {n:"Extensión de rodilla",s:"4×12-15",rest:120},{n:"Elevaciones Laterales",s:"4×15-20",rest:75},
        {n:"Curl con polea en banco",s:"3×12-15",rest:75}]},
      "Sábado":{label:"Descanso",ex:[]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "arnold-split":{
    nombre:"Arnold Split (6 días)",
    objetivo:"Hipertrofia", nivel:"Avanzado", intensidad:5,
    desc:"Pecho+espalda, hombro+brazo y pierna, dos veces por semana. Volumen alto, clásico de la vieja escuela.",
    semana:{
      "Lunes":{label:"Pecho · Espalda",ex:[
        {n:"Press Plano con barra",s:"4×8-10",rest:180},{n:"Dominadas",s:"4×8-10",rest:180},
        {n:"Press Inclinado con mancuernas",s:"3×10-12",rest:150},{n:"Remo con barra",s:"3×10-12",rest:150},
        {n:"Aperturas en polea",s:"3×12-15",rest:90},{n:"Jalón al pecho",s:"3×12-15",rest:90}]},
      "Martes":{label:"Hombro · Brazo",ex:[
        {n:"Press Militar con barra",s:"4×8-10",rest:180},{n:"Elevaciones Laterales",s:"4×12-15",rest:90},
        {n:"Curl con barra",s:"4×10-12",rest:120},{n:"Press cerrado",s:"4×10-12",rest:120},
        {n:"Curl martillo",s:"3×12",rest:90},{n:"Extensión de tríceps en polea",s:"3×12",rest:90}]},
      "Miércoles":{label:"Pierna",ex:[
        {n:"Sentadilla con barra",s:"4×8-10",rest:210},{n:"Peso Muerto Rumano",s:"4×8-10",rest:180},
        {n:"Prensa",s:"3×12-15",rest:150},{n:"Curl femoral",s:"3×12-15",rest:120},
        {n:"Elevación de talones",s:"4×15-20",rest:90}]},
      "Jueves":{label:"Pecho · Espalda",ex:[
        {n:"Press Inclinado con barra",s:"4×8-10",rest:180},{n:"Remo en polea baja",s:"4×8-10",rest:180},
        {n:"Fondos en paralelas",s:"3×10-12",rest:150},{n:"Remo unilateral con mancuerna",s:"3×10-12",rest:120},
        {n:"Pec-fly",s:"3×12-15",rest:90},{n:"Pullover",s:"3×12-15",rest:90}]},
      "Viernes":{label:"Hombro · Brazo",ex:[
        {n:"Press Arnold",s:"4×10-12",rest:150},{n:"Pájaros en polea",s:"4×12-15",rest:90},
        {n:"Curl predicador",s:"4×10-12",rest:120},{n:"Extensión tras nuca",s:"4×10-12",rest:120},
        {n:"Curl concentrado",s:"3×12-15",rest:90},{n:"Patada de tríceps",s:"3×12-15",rest:90}]},
      "Sábado":{label:"Pierna",ex:[
        {n:"Sentadilla frontal",s:"4×8-10",rest:210},{n:"Zancadas con mancuernas",s:"3×10-12",rest:150},
        {n:"Extensión de rodilla",s:"4×12-15",rest:120},{n:"Curl femoral",s:"4×12-15",rest:120},
        {n:"Elevación de talones",s:"4×15-20",rest:90}]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "bro-split":{
    nombre:"Bro Split (5 días)",
    objetivo:"Hipertrofia", nivel:"Intermedio", intensidad:4,
    desc:"Un grupo muscular por día. Clásico de gym: mucho volumen por músculo y una semana entera de recuperación entre sesiones.",
    semana:{
      "Lunes":{label:"Pecho",ex:[
        {n:"Press Plano con barra",s:"4×6-8",rest:180},{n:"Press Inclinado con mancuernas",s:"4×8-10",rest:150},
        {n:"Pec-fly",s:"3×12-15",rest:90},{n:"Fondos en paralelas",s:"3×10-12",rest:120},
        {n:"Aperturas en polea",s:"3×15",rest:90}]},
      "Martes":{label:"Espalda",ex:[
        {n:"Dominadas",s:"4×6-8",rest:180},{n:"Remo con barra",s:"4×8-10",rest:180},
        {n:"Jalón al pecho",s:"3×10-12",rest:120},{n:"Remo en polea baja",s:"3×12-15",rest:120},
        {n:"Pullover",s:"3×12-15",rest:90}]},
      "Miércoles":{label:"Pierna",ex:[
        {n:"Sentadilla con barra",s:"4×6-8",rest:210},{n:"Prensa",s:"4×10-12",rest:180},
        {n:"Peso Muerto Rumano",s:"3×10-12",rest:180},{n:"Extensión de rodilla",s:"3×12-15",rest:120},
        {n:"Curl femoral",s:"3×12-15",rest:120},{n:"Elevación de talones",s:"4×15-20",rest:90}]},
      "Jueves":{label:"Hombro",ex:[
        {n:"Press Militar con barra",s:"4×6-8",rest:180},{n:"Elevaciones Laterales",s:"4×12-15",rest:90},
        {n:"Pájaros en polea",s:"4×12-15",rest:90},{n:"Face pull",s:"3×15-20",rest:90},
        {n:"Encogimientos con mancuernas",s:"4×12-15",rest:90}]},
      "Viernes":{label:"Brazo",ex:[
        {n:"Curl con barra",s:"4×8-10",rest:120},{n:"Press cerrado",s:"4×8-10",rest:120},
        {n:"Curl predicador",s:"3×10-12",rest:90},{n:"Extensión de tríceps en polea",s:"3×12-15",rest:90},
        {n:"Curl martillo",s:"3×12",rest:90},{n:"Extensión tras nuca",s:"3×12",rest:90}]},
      "Sábado":{label:"Descanso",ex:[]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "fuerza-5x5":{
    nombre:"Fuerza 5×5 (3 días)",
    objetivo:"Fuerza", nivel:"Principiante", intensidad:3,
    desc:"Basado en StrongLifts. Pocos ejercicios, mucho peso, progresión lineal. La forma más simple de hacerte fuerte.",
    semana:{
      "Lunes":{label:"Fuerza A",ex:[
        {n:"Sentadilla con barra",s:"5×5",rest:210},{n:"Press Plano con barra",s:"5×5",rest:210},
        {n:"Remo con barra",s:"5×5",rest:180}]},
      "Martes":{label:"Descanso",ex:[]},
      "Miércoles":{label:"Fuerza B",ex:[
        {n:"Sentadilla con barra",s:"5×5",rest:210},{n:"Press Militar con barra",s:"5×5",rest:210},
        {n:"Peso Muerto",s:"1×5",rest:240}]},
      "Jueves":{label:"Descanso",ex:[]},
      "Viernes":{label:"Fuerza A",ex:[
        {n:"Sentadilla con barra",s:"5×5",rest:210},{n:"Press Plano con barra",s:"5×5",rest:210},
        {n:"Remo con barra",s:"5×5",rest:180}]},
      "Sábado":{label:"Descanso",ex:[]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },

  "recomp-casa":{
    nombre:"Recomposición en casa (4 días)",
    objetivo:"Recomposición", nivel:"Principiante", intensidad:2,
    desc:"Sin gym. Peso corporal y mancuernas básicas. Ideal para mantener o empezar desde cero.",
    semana:{
      "Lunes":{label:"Torso empuje",ex:[
        {n:"Flexiones",s:"4×10-15",rest:90},{n:"Press de hombro con mancuernas",s:"3×10-12",rest:120},
        {n:"Fondos en silla",s:"3×10-12",rest:90},{n:"Elevaciones Laterales",s:"3×15",rest:60}]},
      "Martes":{label:"Pierna",ex:[
        {n:"Sentadilla goblet",s:"4×12-15",rest:120},{n:"Zancadas con mancuernas",s:"3×12",rest:120},
        {n:"Peso Muerto Rumano con mancuernas",s:"3×12-15",rest:120},{n:"Elevación de talones",s:"4×20",rest:60}]},
      "Miércoles":{label:"Descanso",ex:[]},
      "Jueves":{label:"Torso jalón",ex:[
        {n:"Remo con mancuerna",s:"4×10-12",rest:120},{n:"Dominadas",s:"3×máx",rest:150},
        {n:"Curl con mancuernas",s:"3×12",rest:90},{n:"Face pull con banda",s:"3×15",rest:60}]},
      "Viernes":{label:"Descanso",ex:[]},
      "Sábado":{label:"Full Body · Core",ex:[
        {n:"Burpees",s:"3×10",rest:90},{n:"Sentadilla goblet",s:"3×15",rest:90},
        {n:"Flexiones",s:"3×12",rest:90},{n:"Plancha",s:"3×45s",rest:60},
        {n:"Crunch",s:"3×20",rest:60}]},
      "Domingo":{label:"Descanso",ex:[]},
    }
  },
};

const REST_DEFAULT=180; // 3:00 mínimo por defecto
const ALL_DAYS=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const SHORT={"Lunes":"LUN","Martes":"MAR","Miércoles":"MIÉ","Jueves":"JUE","Viernes":"VIE","Sábado":"SÁB","Domingo":"DOM"};

const CFG_KEY="stimpys_cfg";
function loadCfg(){
  try{return JSON.parse(localStorage.getItem(CFG_KEY))||{}}catch(e){return{}}
}
function saveCfg(c){localStorage.setItem(CFG_KEY,JSON.stringify(c))}
let CFG=loadCfg();
if(!CFG.plan||!PLANES[CFG.plan])CFG.plan="ppl-arnold";
if(typeof CFG.weekend!=="boolean")CFG.weekend=false; // sáb/dom ocultos por defecto
if(!CFG.rest)CFG.rest={};   // { "nombre ejercicio normalizado": segundos }

saveCfg(CFG);

// RUTINA activa derivada del plan elegido
/* ============ RUTINAS PERSONALIZADAS ============ */

const MIS_KEY="stimpys_mis_rutinas";
function getMisRutinas(){try{return JSON.parse(localStorage.getItem(MIS_KEY))||{}}catch(e){return{}}}
function setMisRutinas(r){
  localStorage.setItem(MIS_KEY,JSON.stringify(r));
  if(typeof pushData==="function")pushData();
}
function guardarRutina(id,rutina){
  const r=getMisRutinas();
  r[id]=rutina;
  setMisRutinas(r);
}
function borrarRutina(id){
  const r=getMisRutinas();
  delete r[id];
  setMisRutinas(r);
  if(CFG.plan===id){CFG.plan="ppl-arnold";saveCfg(CFG)}
}
/* Todos los planes: los de fábrica + los míos */
function todosLosPlanes(){
  return {...PLANES,...getMisRutinas()};
}
function planActual(){
  const todos=todosLosPlanes();
  return todos[CFG.plan]||todos["ppl-arnold"];
}
function rutinaSemana(){return planActual().semana}
function esRutinaMia(id){return !!getMisRutinas()[id]}

/* Rutina vacía nueva */
function rutinaVacia(nombre){
  const sem={};
  ALL_DAYS.forEach(d=>{sem[d]={label:"Descanso",ex:[]}});
  return {nombre:nombre||"",desc:"Rutina personalizada",objetivo:"Personalizada",nivel:"Tuyo",intensidad:3,semana:sem,mia:true};
}

// Días visibles: L-V siempre; sáb/dom solo si weekend activo Y el plan los usa
function diasVisibles(){
  const sem=rutinaSemana();
  return ALL_DAYS.filter(d=>{
    if(d==="Sábado"||d==="Domingo") return CFG.weekend;
    return true;
  }).filter(d=>sem[d]); // que exista en el plan
}

function normEx(n){return (n||"").toLowerCase().replace(/\s+/g," ").trim()}
function restFor(ex){
  const key=normEx(ex.n||ex);
  if(CFG.rest[key])return CFG.rest[key];
  if(ex&&ex.rest)return ex.rest;
  return REST_DEFAULT;
}

const KEY="stimpys_v1";
const MESES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

/* ============ MOTOR MUSCULAR ============ */
/* Cada ejercicio aporta series a uno o más músculos. 1 = primario, 0.5 = secundario. */
const MUSCULOS=["Pecho","Espalda","Hombro","Bíceps","Tríceps","Cuádriceps","Femoral","Glúteo","Gemelo","Core"];
// Series semanales recomendadas por grupo (ciencia de hipertrofia: 10-20)
const VOL_REC={min:10,max:20};

