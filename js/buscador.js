/**
 * buscador.js — Motor de búsqueda mejorado + relaciones por mecánica + más ejercicios
 * ---------------------------------------------------------------------------
 * No modifica el código existente: reemplaza las funciones globales de búsqueda
 * (buscarEjs / coincideEj) por una versión tolerante a errores y con ranking,
 * añade "ejercicios similares" por patrón de movimiento, y suma ejercicios
 * populares a la librería EJS. Depende de diccionario.js y utilidades.js.
 */
(function () {
  "use strict";
  if (typeof EJS === "undefined") return;

  /* ===================================================================== *
   *  1) MÁS ALIAS (sinónimos ES/EN + errores comunes) para lo que ya existe
   * ===================================================================== */
  var MAS_ALIAS = {
    "Press de Banca con Barra": ["pecho barra", "press plano", "press recto"],
    "Sentadilla con Barra (Trasera)": ["sentadillas", "sentadia", "sentadilla peso", "squat barra"],
    "Peso Muerto Convencional": ["peso muerto barra", "levantamiento de peso muerto"],
    "Prensa de Piernas (45°)": ["prensa piernas", "prensa inclinada", "leg press 45"],
    "Extensión de Rodilla (Cuádriceps)": ["cuadriceps en maquina", "silla romana no", "extensiones piernas"],
    "Curl Femoral Tumbado": ["femoral acostado", "curl de pierna", "hamstring curl"],
    "Jalón al Pecho (Agarre Abierto)": ["polea dorsal", "jalon dorsal", "jalon frontal"],
    "Elevaciones Laterales con Mancuernas": ["laterales mancuerna", "vuelos", "hombro lateral"],
    "Curl con Mancuernas": ["curl alterno", "curl de biceps con mancuernas"],
    "Hip Thrust con Barra": ["hipthrust", "empuje cadera barra", "puente gluteo"],
    "Elevación de Talones de Pie": ["pantorrilla de pie", "gemelo de pie", "elevacion gemelos"]
  };
  if (typeof ALIAS_EJ !== "undefined" && typeof ALIAS_INDEX !== "undefined") {
    Object.keys(MAS_ALIAS).forEach(function (canon) {
      ALIAS_EJ[canon] = (ALIAS_EJ[canon] || []).concat(MAS_ALIAS[canon]);
      MAS_ALIAS[canon].forEach(function (a) { ALIAS_INDEX[stripAcc(a)] = canon; });
    });
  }

  /* ===================================================================== *
   *  2) EJERCICIOS NUEVOS (populares / recomendados). Se ignoran los que ya
   *     existan por nombre. Grupos deben coincidir con GRUPOS y equipos con
   *     EQUIPOS para que los filtros funcionen.
   * ===================================================================== */
  var NUEVOS = [
    // Pecho
    { n: "Press de Piso con Barra (Floor Press)", g: "Pecho", e: "Barra", m: "Pectoral, tríceps", t: "c", al: ["floor press", "press de piso", "press suelo"] },
    { n: "Press de Pecho en Máquina Convergente", g: "Pecho", e: "Máquina", m: "Pectoral mayor, tríceps", t: "c", al: ["press convergente", "chest press maquina"] },
    // Espalda
    { n: "Remo con Apoyo en Banco (Chest-Supported)", g: "Espalda", e: "Mancuernas", m: "Dorsal, romboides, trapecio medio", t: "c", al: ["remo apoyado", "chest supported row", "remo con pecho apoyado"] },
    { n: "Remo Gironda (Agarre Estrecho)", g: "Espalda", e: "Polea", m: "Dorsal, romboides, bíceps", t: "c", al: ["remo gironda", "remo estrecho polea", "seated row estrecho"] },
    { n: "Rack Pull (Peso Muerto Parcial)", g: "Espalda", e: "Barra", m: "Trapecio, dorsal, espalda baja, glúteo", t: "c", al: ["rack pull", "peso muerto parcial", "peso muerto rack"] },
    { n: "Pullover en Polea con Barra Recta", g: "Espalda", e: "Polea", m: "Dorsal ancho", t: "a", al: ["pullover polea", "pull over cuerda", "jalon con brazos rectos", "straight arm pulldown"] },
    // Hombro
    { n: "Elevaciones Laterales en Polea", g: "Hombro", e: "Polea", m: "Deltoide medio", t: "a", al: ["laterales en polea", "lateral raise cable", "vuelos en polea"] },
    { n: "Pájaros en Máquina (Reverse Pec Deck)", g: "Hombro", e: "Máquina", m: "Deltoide posterior, trapecio", t: "a", al: ["reverse pec deck", "pajaros maquina", "deltoide posterior maquina", "contractor inverso"] },
    { n: "Press Landmine de Hombro", g: "Hombro", e: "Barra", m: "Deltoide anterior, tríceps", t: "c", al: ["landmine press", "press landmine", "press en t"] },
    // Bíceps
    { n: "Curl en Banco Inclinado", g: "Bíceps", e: "Mancuernas", m: "Bíceps (cabeza larga)", t: "a", al: ["curl inclinado", "incline curl", "curl en inclinado"] },
    { n: "Curl Araña (Spider Curl)", g: "Bíceps", e: "Mancuernas", m: "Bíceps (cabeza corta)", t: "a", al: ["spider curl", "curl araña", "curl boca abajo"] },
    { n: "Curl en Polea", g: "Bíceps", e: "Polea", m: "Bíceps braquial", t: "a", al: ["curl polea", "cable curl", "curl de biceps en polea"] },
    { n: "Curl Inverso con Barra", g: "Antebrazo", e: "Barra", m: "Braquiorradial, antebrazo, bíceps", t: "a", al: ["curl inverso", "reverse curl", "curl prono"] },
    // Tríceps
    { n: "Extensión de Tríceps Sobre la Cabeza en Polea", g: "Tríceps", e: "Polea", m: "Tríceps (cabeza larga)", t: "a", al: ["overhead triceps polea", "extension sobre la cabeza", "frances en polea", "triceps encima cabeza"] },
    { n: "Fondos entre Bancos", g: "Tríceps", e: "Peso corporal", m: "Tríceps, pectoral inferior", t: "c", al: ["fondos banco", "bench dips", "fondos de triceps en banco"] },
    { n: "Extensión de Tríceps en Polea (Barra)", g: "Tríceps", e: "Polea", m: "Tríceps (3 cabezas)", t: "a", al: ["pushdown barra", "jalon triceps barra", "extension triceps barra"] },
    // Cuádriceps
    { n: "Subida al Cajón (Step-Up)", g: "Cuádriceps", e: "Mancuernas", m: "Cuádriceps, glúteo", t: "c", al: ["step up", "subida al banco", "subidas al cajon"] },
    { n: "Sentadilla Sissy", g: "Cuádriceps", e: "Peso corporal", m: "Cuádriceps (recto femoral)", t: "a", al: ["sissy squat", "sentadilla sisy"] },
    // Femoral / Glúteo
    { n: "Peso Muerto con Mancuernas", g: "Femoral", e: "Mancuernas", m: "Femoral, glúteo, espalda baja", t: "c", al: ["peso muerto mancuernas", "rdl mancuernas", "rumano con mancuernas"] },
    { n: "Buenos Días (Good Morning)", g: "Femoral", e: "Barra", m: "Femoral, glúteo, espalda baja", t: "c", al: ["good morning", "buenos dias barra"] },
    { n: "Patada de Glúteo en Polea", g: "Glúteo", e: "Polea", m: "Glúteo mayor", t: "a", al: ["patada de gluteo", "kickback gluteo", "gluteo en polea", "cable kickback"] },
    { n: "Extensión de Cadera en Máquina (Glute Kickback)", g: "Glúteo", e: "Máquina", m: "Glúteo mayor", t: "a", al: ["glute kickback maquina", "extension de cadera maquina", "patada gluteo maquina"] },
    // Gemelo
    { n: "Elevación de Talones Sentado", g: "Gemelo", e: "Máquina", m: "Sóleo", t: "a", al: ["gemelo sentado", "seated calf raise", "soleo sentado"] },
    { n: "Elevación de Talones en Prensa", g: "Gemelo", e: "Máquina", m: "Gastrocnemio, sóleo", t: "a", al: ["gemelos en prensa", "calf press", "pantorrilla en prensa"] },
    // Core
    { n: "Crunch en Polea (Cable Crunch)", g: "Core", e: "Polea", m: "Recto abdominal", t: "a", al: ["cable crunch", "crunch polea", "abdominal en polea"] },
    { n: "Leñador en Polea (Woodchopper)", g: "Core", e: "Polea", m: "Oblicuos, core", t: "a", al: ["woodchopper", "leñador", "lenador polea", "giro en polea"] },
    { n: "Dead Bug (Bicho Muerto)", g: "Core", e: "Peso corporal", m: "Core profundo, transverso", t: "a", al: ["dead bug", "bicho muerto"] },
    { n: "Plancha Lateral", g: "Core", e: "Peso corporal", m: "Oblicuos, core", t: "a", al: ["side plank", "plancha de lado", "plancha oblicua"] },
    { n: "Mountain Climbers (Escaladores)", g: "Core", e: "Peso corporal", m: "Core, flexores de cadera", t: "c", al: ["mountain climbers", "escaladores", "escalador"] },
    // Cuerpo completo / Cardio funcional
    { n: "Kettlebell Swing (Balanceo)", g: "Cuerpo completo", e: "Kettlebell", m: "Glúteo, femoral, espalda, core", t: "c", al: ["kettlebell swing", "swing con pesa rusa", "balanceo kettlebell"] },
    { n: "Thruster (Sentadilla + Press)", g: "Cuerpo completo", e: "Barra", m: "Cuádriceps, glúteo, hombro, tríceps", t: "c", al: ["thruster", "sentadilla con press"] },
    { n: "Burpees", g: "Cuerpo completo", e: "Peso corporal", m: "Cuerpo completo, cardio", t: "c", al: ["burpee", "burpees"] },
    { n: "Cargada y Envión (Clean and Press)", g: "Cuerpo completo", e: "Barra", m: "Cadena posterior, hombro, tríceps", t: "c", al: ["clean and press", "cargada y envion", "clean press"] },
    // Cardio
    { n: "Salto a la Cuerda", g: "Cardio", e: "Cardio", m: "Cardiovascular, gemelo", t: "cardio", al: ["saltar la cuerda", "comba", "jump rope", "cuerda para saltar"] },
    { n: "Escaladora (Stairmaster)", g: "Cardio", e: "Cardio", m: "Cardiovascular, pierna", t: "cardio", al: ["stairmaster", "escaladora", "escaleras maquina", "step mill"] },
    { n: "Remo Ergómetro (Cardio)", g: "Cardio", e: "Cardio", m: "Cardiovascular, espalda, pierna", t: "cardio", al: ["remo cardio", "rowing machine", "remo ergometro", "concept2"] }
  ];

  (function agregarNuevos() {
    var existentes = {};
    EJS.forEach(function (e) { existentes[normEx(e.n)] = true; });
    NUEVOS.forEach(function (nx) {
      if (existentes[normEx(nx.n)]) return; // no duplicar
      var al = nx.al || [];
      delete nx.al;
      EJS.push(nx);
      existentes[normEx(nx.n)] = true;
      if (typeof ALIAS_EJ !== "undefined") ALIAS_EJ[nx.n] = (ALIAS_EJ[nx.n] || []).concat(al);
      if (typeof ALIAS_INDEX !== "undefined") al.forEach(function (a) { ALIAS_INDEX[stripAcc(a)] = nx.n; });
    });
  })();

  /* ===================================================================== *
   *  3) MOTOR DE BÚSQUEDA: tolerante a errores + ranking por relevancia
   * ===================================================================== */
  // Distancia de edición (Levenshtein) con corte rápido
  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    if (Math.abs(m - n) > 2) return 3;
    var prev = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      var cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  // Puntuación de un ejercicio contra la consulta (mayor = mejor; -1 = no match)
  function scoreEj(e, nq) {
    if (!nq) return 0;
    var name = stripAcc(e.n);
    if (name === nq) return 10000;
    var hay = textoBuscable(e);
    var score = -1;
    if (name.indexOf(nq) === 0) score = Math.max(score, 6000);
    if (typeof ALIAS_INDEX !== "undefined" && ALIAS_INDEX[nq] === e.n) score = Math.max(score, 5000);
    if (name.indexOf(nq) >= 0) score = Math.max(score, 4000);
    if (hay.indexOf(nq) >= 0) score = Math.max(score, 2800);

    // Por tokens (con tolerancia a errores por palabra)
    var qToks = nq.split(" ").filter(Boolean);
    if (qToks.length) {
      var words = hay.split(" ").filter(Boolean);
      var matched = 0, fuzzy = 0;
      qToks.forEach(function (t) {
        if (hay.indexOf(t) >= 0) { matched++; return; }
        var ok = words.some(function (w) {
          if (w.length < 3) return false;
          if (w.indexOf(t) === 0) return true;                 // prefijo
          return t.length >= 4 && lev(t, w) <= 1;              // 1 error tipográfico
        });
        if (ok) { matched++; fuzzy++; }
      });
      if (matched === qToks.length) {
        score = Math.max(score, 1600 - fuzzy * 350 + matched * 40);
      }
    }
    return score;
  }
  window.scoreEj = scoreEj;

  // Boolean tolerante (lo usa el diccionario para filtrar)
  window.coincideEj = function (e, nq) {
    if (!nq) return true;
    return scoreEj(e, nq) >= 0;
  };

  // Búsqueda con ranking (lo usa el selector de ejercicios)
  window.buscarEjs = function (q, grupo, equipo) {
    var nq = stripAcc(q);
    var out = [];
    EJS.forEach(function (e) {
      if (grupo && e.g !== grupo) return;
      if (equipo && e.e !== equipo) return;
      var s = nq ? scoreEj(e, nq) : 0;
      if (s >= 0) out.push([s, e]);
    });
    out.sort(function (a, b) { return b[0] - a[0]; });
    return out.map(function (x) { return x[1]; });
  };

  /* ===================================================================== *
   *  4) RELACIÓN POR MECÁNICA (patrón de movimiento) + "Similares"
   * ===================================================================== */
  function patronDe(nombre) {
    var n = stripAcc(nombre);
    if (/press.*(banca|pecho|inclinad|declinad|plano|piso|guillotina|cerrad)|apertura|pec.?deck|pec.?fly|fondo.*(pecho|paralela)|flexion|cruce|contractor/.test(n)) return "empuje-horizontal";
    if (/press.*(militar|hombro|arnold|over.?head|landmine)|push press|elevacion.*frontal/.test(n)) return "empuje-vertical";
    if (/dominada|jalon|pull.?up|pull.?down|pullover/.test(n)) return "jalon-vertical";
    if (/remo|row|face.?pull|gironda/.test(n)) return "jalon-horizontal";
    if (/curl femoral|femoral (tumbad|sentad|acostad)|leg curl/.test(n)) return "femoral";
    if (/peso muerto|deadlift|rumano|rdl|hip thrust|buenos dias|good morning|puente|patada de gluteo|extension de cadera|glute/.test(n)) return "cadera";
    if (/sentadilla|squat|prensa|leg press|zancada|lunge|bulgara|búlgara|hack|sissy|step.?up|subida|extension de rodilla|extension de cuadriceps/.test(n)) return "rodilla";
    if (/curl/.test(n) && !/femoral/.test(n)) return "curl-codo";
    if (/triceps|extension.*(triceps|codo|nuca|cabeza)|press cerrado|patada de triceps|press frances|skull|pushdown|fondos entre/.test(n)) return "extension-codo";
    if (/elevacion.*(lateral|frontal)|pajaro|reverse (fly|pec)|deltoide posterior|vuelos/.test(n)) return "hombro-aislamiento";
    if (/talon|gemelo|pantorrilla|calf|soleo/.test(n)) return "gemelo";
    if (/encogimiento|shrug|trapecio/.test(n)) return "trapecio";
    if (/plancha|crunch|abdominal|russian|twist|elevacion de piernas|rueda|ab wheel|leñador|woodchopper|dead bug|mountain|core|hollow/.test(n)) return "core";
    return null;
  }
  // Caché del patrón por nombre (evita re-evaluar 12 regex por ejercicio)
  var _patCache = {};
  function patronCache(n) {
    var k = normEx(n);
    if (!(k in _patCache)) _patCache[k] = patronDe(n);
    return _patCache[k];
  }
  window.patronDe = patronDe;

  // Índice por grupo muscular (se reconstruye solo si cambia el tamaño de EJS)
  var _byGroup = null, _byGroupN = -1;
  function grupoIndex() {
    if (_byGroup && _byGroupN === EJS.length) return _byGroup;
    _byGroup = {}; _byGroupN = EJS.length;
    EJS.forEach(function (e) { (_byGroup[e.g] || (_byGroup[e.g] = [])).push(e); });
    return _byGroup;
  }

  // Ejercicios similares: mismo grupo (rápido) priorizando misma mecánica
  function relacionados(nombre, max) {
    max = max || 6;
    var base = (typeof ejPorNombre === "function" && ejPorNombre(nombre)) || null;
    var g = (base && base.g) || (typeof grupoPrincipal === "function" ? grupoPrincipal(nombre) : null);
    if (!g) return [];
    var pat = patronCache(nombre);
    var self = normEx(base ? base.n : nombre);
    var bm = base && base.m ? stripAcc(base.m).split(/[ ,]+/) : [];
    var lista = grupoIndex()[g] || [];      // solo el grupo, no los 634
    var scored = [];
    lista.forEach(function (e) {
      if (normEx(e.n) === self) return;
      var s = 2;                            // mismo grupo
      if (pat && patronCache(e.n) === pat) s += 4;   // misma mecánica
      if (bm.length && e.m) {
        var b = stripAcc(e.m);
        if (bm.some(function (w) { return w.length > 3 && b.indexOf(w) >= 0; })) s += 1;
      }
      scored.push([s, e]);
    });
    scored.sort(function (a, b) { return b[0] - a[0]; });
    return scored.slice(0, max).map(function (x) { return x[1]; });
  }
  window.relacionados = relacionados;

  /* ---- Inyectar "Similares" SOLO cuando se abre una tarjeta (perezoso) ---- */
  function inyectarEn(card) {
    if (card._simDone) return;
    card._simDone = true;
    var body = card.querySelector(".dic-body");
    var nmeEl = card.querySelector(".dn");
    if (!body || !nmeEl) return;
    var sims = relacionados(nmeEl.textContent.trim(), 6);
    if (!sims.length) return;
    var wrap = document.createElement("div");
    wrap.className = "dic-similares";
    wrap.innerHTML = '<span class="dm-lbl">Ejercicios similares</span>';
    var chips = document.createElement("div");
    chips.className = "sim-chips";
    sims.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sim-chip";
      b.textContent = s.n;
      b.onclick = function (ev) {
        ev.stopPropagation();
        try { dicSearch = s.n; } catch (e) {}
        if (typeof renderDiccionario === "function") renderDiccionario();
      };
      chips.appendChild(b);
    });
    wrap.appendChild(chips);
    body.appendChild(wrap);
  }

  /* ===================================================================== *
   *  5) DICCIONARIO POR LOTES (scroll infinito) — reemplaza paintDic
   *     Pinta pocas tarjetas al entrar y va cargando más al bajar. Así
   *     entrar y buscar es instantáneo aunque haya cientos de ejercicios.
   * ===================================================================== */
  var BATCH = 30;

  function crearCard(d, list) {
    var card = document.createElement("div");
    card.className = "dic-card";
    var tipo = d.t === "c" ? "Compuesto" : d.t === "cardio" ? "Cardio" : "Aislamiento";
    var pasos = d.pasos ? d.pasos.map(function (p, i) {
      return '<div class="check" data-i="' + i + '"><div class="box">' + ICON('check', 14) + '</div><div class="txt">' + p + '</div></div>';
    }).join("") : "";
    var yq = encodeURIComponent(d.n + " técnica correcta");
    card.innerHTML =
      '<div class="dic-head"><span class="dn">' + d.n + '</span><span class="dg">' + d.g + '</span><span class="chev">' + ICON('chevron', 18) + '</span></div>' +
      '<div class="dic-body">' +
        '<div class="dic-tags"><span class="dtag eq">' + ICON('dumbbell', 11) + ' ' + d.e + '</span><span class="dtag ' + d.t + '">' + tipo + '</span></div>' +
        '<div class="dic-meta"><span class="dm-lbl">Músculos</span> ' + (d.m || "—") + '</div>' +
        '<div class="videobox"><a href="https://www.youtube.com/results?search_query=' + yq + '" target="_blank" rel="noopener"><span class="play">' + ICON('play', 18) + '</span>Ver demostración en video</a></div>' +
        (pasos ? '<h4 class="dic-h">Técnica paso a paso</h4>' + pasos : "") +
        (d.err ? '<div class="dic-err">' + ICON('warn', 15) + '<div><b>Error común:</b> ' + d.err + '</div></div>' : "") +
      '</div>';
    card.querySelector(".dic-head").onclick = function () {
      var abierto = card.classList.contains("open");
      list.querySelectorAll(".dic-card.open").forEach(function (c) { c.classList.remove("open"); });
      if (!abierto) { card.classList.add("open"); inyectarEn(card); }
    };
    card.querySelectorAll(".check").forEach(function (c) {
      c.onclick = function () { c.classList.toggle("on"); };
    });
    return card;
  }

  window.paintDic = function () {
    var list = document.getElementById("dicList");
    if (!list) return;
    var q = stripAcc(dicSearch);
    // Filtrar + (si hay búsqueda) ordenar por relevancia
    var arr = [];
    EJS.forEach(function (d) {
      if (dicFilter !== "Todos" && d.g !== dicFilter) return;
      if (dicEquipo !== "Todo" && d.e !== dicEquipo) return;
      var s = q ? scoreEj(d, q) : 0;
      if (s >= 0) arr.push([s, d]);
    });
    if (q) arr.sort(function (a, b) { return b[0] - a[0]; });
    var res = arr.map(function (x) { return x[1]; });

    var cnt = document.getElementById("dicCount");
    if (cnt) cnt.textContent = res.length + (res.length === 1 ? " ejercicio" : " ejercicios");

    list.innerHTML = "";
    if (!res.length) {
      list.innerHTML = '<div class="dic-empty">' + ICON('book', 24) + '<div>Sin resultados</div><small>Prueba con otro nombre, grupo o equipo.</small></div>';
      return;
    }

    var i = 0;
    var sentinel = document.createElement("div");
    sentinel.className = "dic-sentinel";
    sentinel.style.height = "1px";
    var io = ("IntersectionObserver" in window)
      ? new IntersectionObserver(function (ents) { if (ents[0].isIntersecting) loadMore(); }, { rootMargin: "800px" })
      : null;

    function loadMore() {
      if (io) io.unobserve(sentinel);
      if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
      var frag = document.createDocumentFragment();
      var end = Math.min(i + BATCH, res.length);
      for (; i < end; i++) frag.appendChild(crearCard(res[i], list));
      list.appendChild(frag);
      if (i < res.length) {
        list.appendChild(sentinel);
        if (io) io.observe(sentinel);
      }
    }
    loadMore();

    // Respaldo por scroll si no hay IntersectionObserver
    if (!io) {
      var onScroll = function () {
        if (!sentinel.parentNode) { window.removeEventListener("scroll", onScroll); return; }
        var r = sentinel.getBoundingClientRect();
        if (r.top < (window.innerHeight + 800)) loadMore();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  };
})();
