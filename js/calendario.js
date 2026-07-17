/**
 * ============================================================
 *  calendario.js — Calendario e historial
 * ============================================================
 */
let calMes=new Date().getMonth();
let calAnio=new Date().getFullYear();
let calSel=null;

function isoDe(y,m,d){return y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0")}

/* Todo lo registrado en una fecha concreta */
function resumenDia(iso){
  const ejercicios=[];
  let vol=0,series=0,prs=[];
  allExercises().forEach(ex=>{
    const h=DB[ex.id]||[];
    // Un ejercicio puede tener varios registros en la MISMA fecha (p.ej. registrado
    // bajo distintos días de rutina). Los mostramos todos, no solo el primero.
    const es=h.filter(x=>x.date===iso);
    if(!es.length)return;
    es.forEach(e=>{
      const v=volumen(e.sets);
      vol+=v;
      const ns=e.sets.filter(s=>s.w!==""||s.r!=="").length;
      series+=ns;
      const best=Math.max(0,...e.sets.map(s=>epley(s.w,s.r)));
      // ¿fue PR en esa fecha?
      const antes=h.filter(x=>x.date<iso);
      const prevBest=antes.length?Math.max(0,...antes.map(x=>Math.max(0,...x.sets.map(s=>epley(s.w,s.r))))):0;
      const esPR=best>prevBest&&prevBest>0;
      if(esPR)prs.push({n:ex.name,v:best});
      ejercicios.push({id:ex.id,name:ex.name,day:e.day||"",sets:e.sets,time:e.time,best,vol:v,esPR});
    });
  });
  const skip=getSkipDays().find(s=>s.date===iso);
  const feel=getFeels().find(f=>f.date===iso);
  const sesion=getSesionesDone().find(s=>s.date===iso);
  return {iso,ejercicios,vol:Math.round(vol),series,prs,skip,feel,sesion};
}

function abrirCalendario(){
  document.getElementById("calView").classList.add("show");
  document.body.style.overflow="hidden";
  const hoy=new Date();
  calMes=hoy.getMonth();calAnio=hoy.getFullYear();
  calSel=nowStamp().iso;
  pintarCalendario();
  verDia(calSel);
}
function cerrarCalendario(){
  document.getElementById("calView").classList.remove("show");
  document.body.style.overflow="";
  renderEntreno();
}

function pintarCalendario(){
  const MESES_L=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  document.getElementById("calMonth").textContent=MESES_L[calMes]+" "+calAnio;
  const grid=document.getElementById("calGrid");
  const primero=new Date(calAnio,calMes,1);
  // lunes = 0
  let off=primero.getDay()-1; if(off<0)off=6;
  const dias=new Date(calAnio,calMes+1,0).getDate();
  const hoyIso=nowStamp().iso;
  let html="";
  for(let i=0;i<off;i++)html+=`<div class="cd empty"></div>`;
  for(let d=1;d<=dias;d++){
    const iso=isoDe(calAnio,calMes,d);
    const r=resumenDia(iso);
    const entreno=r.ejercicios.length>0;
    const saltado=!!r.skip;
    const conPR=r.prs.length>0;
    const esHoy=iso===hoyIso;
    const futuro=iso>hoyIso;
    let cls="cd";
    if(esHoy)cls+=" hoy";
    if(futuro)cls+=" futuro";
    if(entreno)cls+=" entreno";
    if(saltado)cls+=" saltado";
    if(conPR)cls+=" conpr";
    if(iso===calSel)cls+=" sel";
    html+=`<button class="${cls}" data-iso="${iso}" ${futuro?"disabled":""}>
      <span class="cd-n">${d}</span>
      ${entreno?`<span class="cd-dot"></span>`:""}
      ${saltado?`<span class="cd-dot sk"></span>`:""}
    </button>`;
  }
  grid.innerHTML=html;
  grid.querySelectorAll(".cd[data-iso]").forEach(b=>{
    b.onclick=()=>{
      calSel=b.dataset.iso;
      grid.querySelectorAll(".cd").forEach(x=>x.classList.remove("sel"));
      b.classList.add("sel");
      verDia(calSel);
      if(navigator.vibrate)navigator.vibrate(10);
    };
  });
}

function verDia(iso){
  const el=document.getElementById("calDetail");
  const r=resumenDia(iso);
  const hoyIso=nowStamp().iso;
  const esHoy=iso===hoyIso;
  const [y,m,d]=iso.split("-");
  const fecha=new Date(+y,+m-1,+d);
  const DOWS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const titulo=DOWS[fecha.getDay()]+" "+(+d)+" "+MESES[+m-1]+(esHoy?" · HOY":"");

  let html=`<div class="cdt-head">${titulo}</div>`;

  if(r.skip){
    html+=`<div class="cdt-skip">${ICON('calendar',20)}
      <div><b>Día saltado</b><br><small>${r.skip.label||""}${r.skip.rachaPerdida?" · racha de "+r.skip.rachaPerdida+" perdida":""}</small></div>
      <button class="cdt-undo" data-undo="${iso}">Deshacer</button></div>`;
  }
  if(!r.ejercicios.length&&!r.skip){
    html+=`<div class="cdt-empty">${ICON('shield',22)}<div>Sin registros este día</div></div>`;
  }
  if(r.ejercicios.length){
    html+=`<div class="cdt-stats">
      <div><b>${r.ejercicios.length}</b><span>Ejercicios</span></div>
      <div><b>${fmtNum(r.vol)}</b><span>Volumen</span></div>
      <div><b>${r.series}</b><span>Series</span></div>
      ${r.feel?`<div><b style="color:${(FEELS.find(f=>f.v===r.feel.v)||{}).col}">${(FEELS.find(f=>f.v===r.feel.v)||{}).n||"–"}</b><span>Sensación</span></div>`:""}
    </div>`;
    if(r.prs.length){
      html+=`<div class="cdt-prs">${r.prs.map(p=>`<div class="cdt-pr">${ICON('flame',13)} <b>${p.n}</b> · ${p.v} lb</div>`).join("")}</div>`;
    }
    html+=`<div class="cdt-list">`;
    r.ejercicios.forEach(ex=>{
      const detalle=ex.sets.map(s=>`${s.w||"–"}${s.w?"×":""}${s.r||"–"}${s.rpe?" @"+s.rpe:""}`).join("  ·  ");
      html+=`<div class="cdt-ex" data-edit="${ex.id}|${iso}|${ex.day||""}">
        <div class="cdt-ex-top">
          <div class="cdt-ex-n">${ex.name}${ex.day?` <span class="cdt-day">· ${ex.day}</span>`:""}${ex.esPR?`<span class="cdt-prtag">${ICON('flame',9)} PR</span>`:""}</div>
          <button class="cdt-editb">${ICON('edit',13)} Editar</button>
        </div>
        <div class="cdt-ex-d">${detalle}</div>
        <div class="cdt-ex-m">${ex.best?ex.best+" lb 1RM · ":""}${ex.time||""}</div>
      </div>`;
    });
    html+=`</div>`;
  }
  el.innerHTML=html;
  const u=el.querySelector("[data-undo]");
  if(u)u.onclick=async()=>{
    const ok=await showDialog({title:"¿Deshacer día saltado?",msg:"El día volverá a contar normalmente.",
      icon:"back",confirmText:"Deshacer",cancelText:"Cancelar"});
    if(ok){setSkipDays(getSkipDays().filter(s=>s.date!==iso));pintarCalendario();verDia(iso)}
  };
  el.querySelectorAll("[data-edit]").forEach(b=>{
    b.onclick=()=>{
      const [exid,fecha,dia]=b.dataset.edit.split("|");
      editarRegistro(exid,fecha,dia);
    };
  });
}

/* EDITAR un registro existente (no crea uno nuevo) */
function editarRegistro(id,iso,dia){
  const h=DB[id]||[];
  // Coincidir por fecha Y día de rutina, para no editar el registro equivocado
  // cuando hay varios el mismo día.
  const match=x=>x.date===iso&&(x.day||dia||"")===(dia||"");
  const e=h.find(match);
  if(!e)return;
  const exObj=allExercises().find(x=>x.id===id);
  const nombre=exObj?exObj.name:"Ejercicio";
  const T=tipoEjercicio({s:"",n:nombre});
  let sets=e.sets.map(s=>({w:s.w||"",r:s.r||"",rpe:s.rpe||""}));

  sheetTitle.textContent="Editar · "+fmtDateFull(iso);
  function pintar(){
    let html=`<div class="edit-hint">${ICON('warn',14)} Estás editando el registro del <b>${fmtDateFull(iso)}</b>. Los cambios reemplazan lo que ya estaba, no crean un registro nuevo.</div>
      <div class="edit-name">${nombre}</div><div id="editSets"></div>
      <div class="exbtns" style="margin-top:14px">
        <button class="btn btn-add" id="edAdd">${ICON('plus',15)} Serie</button>
        <button class="btn btn-save" id="edSave">${ICON('save',15)} Guardar cambios</button>
      </div>
      <button class="btn-skip" id="edDel" style="margin-top:12px;color:var(--hot);border-color:rgba(255,84,112,.3)">
        ${ICON('trash',14)} Borrar el registro de este día</button>`;
    sheetBody.innerHTML=html;
    const cont=document.getElementById("editSets");
    sets.forEach((set,i)=>{
      const row=document.createElement("div");row.className="setrow";
      row.innerHTML=`<div class="set-main">
        <span class="setno">${i+1}</span>
        <div class="set-vals">
          <div class="fld-w"><input class="in-w" inputmode="decimal" placeholder="lb" value="${set.w}"></div>
          <div class="fld-r"><input class="in-r" inputmode="numeric" placeholder="reps" value="${set.r}"><span class="unit">reps</span></div>
        </div>
        <button class="del">${ICON('close',15)}</button>
      </div>
      <div class="set-sub">
        <div class="set-prev empty">—</div>
        <div class="rpe-quick"><span class="rpe-lbl">RPE</span>
          ${[7,8,9,10].map(n=>`<button class="rq${String(set.rpe)===String(n)?" on":""}" data-rpe="${n}">${n}</button>`).join("")}
        </div>
      </div>`;
      row.querySelector(".in-w").oninput=ev=>set.w=ev.target.value.trim();
      row.querySelector(".in-r").oninput=ev=>set.r=ev.target.value.trim();
      row.querySelectorAll(".rq").forEach(b=>b.onclick=()=>{
        set.rpe=(String(set.rpe)===b.dataset.rpe)?"":b.dataset.rpe;
        row.querySelectorAll(".rq").forEach(x=>x.classList.toggle("on",String(set.rpe)===x.dataset.rpe));
      });
      row.querySelector(".del").onclick=()=>{sets.splice(i,1);pintar()};
      cont.appendChild(row);
    });
    document.getElementById("edAdd").onclick=()=>{sets.push({w:"",r:"",rpe:""});pintar()};
    document.getElementById("edSave").onclick=()=>{
      const clean=sets.filter(s=>s.w!==""||s.r!=="");
      if(!clean.length){flashMsg("Deja al menos una serie o usa Borrar");return}
      const i=DB[id].findIndex(match);
      DB[id][i]={...DB[id][i],sets:clean.map(s=>({w:s.w,r:s.r,rpe:s.rpe||""}))};  // REEMPLAZA
      save(DB);
      closeSheet();
      pintarCalendario();verDia(iso);
      flashMsg("Registro actualizado");soundSave();
    };
    document.getElementById("edDel").onclick=async()=>{
      const ok=await showDialog({title:"¿Borrar este registro?",
        msg:`Se eliminará ${nombre} del ${fmtDateFull(iso)}. No se puede deshacer.`,
        icon:"trash",danger:true,confirmText:"Borrar",cancelText:"Cancelar"});
      if(!ok)return;
      DB[id]=DB[id].filter(x=>!match(x));
      if(!DB[id].length)delete DB[id];
      save(DB);
      closeSheet();
      pintarCalendario();verDia(iso);
      flashMsg("Registro borrado");
    };
  }
  pintar();
  openSheet();
}

document.getElementById("calBack").onclick=cerrarCalendario;
document.getElementById("calPrev").onclick=()=>{
  calMes--;if(calMes<0){calMes=11;calAnio--}
  pintarCalendario();
};
document.getElementById("calNext").onclick=()=>{
  const hoy=new Date();
  if(calAnio>hoy.getFullYear()||(calAnio===hoy.getFullYear()&&calMes>=hoy.getMonth()))return;
  calMes++;if(calMes>11){calMes=0;calAnio++}
  pintarCalendario();
};

