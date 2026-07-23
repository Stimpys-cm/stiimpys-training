/**
 * panel-admin.js — Vista de administrador (solo escritorio, solo lectura)
 * ---------------------------------------------------------------------------
 * En pantallas anchas (>=1000px) reemplaza la app de entreno por un panel
 * de estadísticas detalladas de TODOS los entrenamientos. Es solo lectura:
 * no hay inputs de peso ni acciones de registro, es una consola de análisis.
 * En móvil no se activa nunca; la app funciona igual que siempre.
 */
(function () {
  "use strict";

  const DESKTOP = window.matchMedia("(min-width:1000px)");

  /* ---------- Vista elegida en escritorio: 'admin' | 'app' ---------- */
  const MODE_KEY = "stimpys_desktop_view";
  function getMode() {
    return localStorage.getItem(MODE_KEY) === "app" ? "app" : "admin";
  }
  function setMode(m) {
    localStorage.setItem(MODE_KEY, m === "app" ? "app" : "admin");
    update();
  }

  /* ---------- ¿Estamos en escritorio y con sesión iniciada? ---------- */
  function isAuthed() {
    const auth = document.getElementById("auth");
    const authVisible = auth && auth.classList.contains("show");
    const guest = document.body.classList.contains("guest-mode");
    return !authVisible && !guest;
  }
  function desktopActive() {
    return DESKTOP.matches && isAuthed();
  }

  /* ---------- Contenedor (se crea una sola vez) ---------- */
  function ensurePanel() {
    let p = document.getElementById("adminPanel");
    if (!p) {
      p = document.createElement("div");
      p.id = "adminPanel";
      document.body.appendChild(p);
    }
    return p;
  }

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function num(n) {
    return (typeof fmtNum === "function") ? fmtNum(Math.round(n || 0)) : String(Math.round(n || 0));
  }
  function fecha(iso) {
    if (!iso) return "—";
    const p = iso.split("-");
    if (p.length !== 3) return iso;
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return parseInt(p[2], 10) + " " + (meses[parseInt(p[1], 10) - 1] || "") + " " + p[0];
  }
  function e1rm(sets) {
    return Math.max(0, ...(sets || []).map(s => (typeof epley === "function" ? epley(s.w, s.r) : 0)));
  }

  /* ---------- Estadísticas por ejercicio ---------- */
  function statExercises() {
    const rows = [];
    const lista = (typeof allExercises === "function") ? allExercises() : [];
    lista.forEach(ex => {
      const h = DB[ex.id];
      if (!h || !h.length) return;
      let series = 0, vol = 0, best = 0;
      h.forEach(e => {
        series += (e.sets || []).length;
        vol += (typeof volumen === "function" ? volumen(e.sets) : 0);
        const b = e1rm(e.sets);
        if (b > best) best = b;
      });
      const orden = h.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
      const last = orden[0];
      let ultimoPeso = "";
      if (last) {
        const pesos = (last.sets || []).map(s => parseFloat(s.w) || 0).filter(x => x > 0);
        if (pesos.length) ultimoPeso = Math.max(...pesos);
      }
      rows.push({
        name: ex.name,
        group: (typeof grupoPrincipal === "function" && grupoPrincipal(ex.name)) || "—",
        sesiones: h.length,
        series,
        volumen: Math.round(vol),
        best,
        ultimoPeso,
        ultimaFecha: last ? last.date : ""
      });
    });
    return rows;
  }

  /* ---------- Estadísticas por músculo ---------- */
  function statGroups(rows) {
    const g = {};
    rows.forEach(r => {
      const k = r.group || "—";
      if (!g[k]) g[k] = { grupo: k, series: 0, volumen: 0, ejercicios: 0 };
      g[k].series += r.series;
      g[k].volumen += r.volumen;
      g[k].ejercicios++;
    });
    return Object.values(g).sort((a, b) => b.volumen - a.volumen);
  }

  /* ---------- KPI card ---------- */
  function kpi(v, l, accent) {
    return `<div class="adm-kpi${accent ? " accent" : ""}"><div class="adm-kpi-v">${v}</div><div class="adm-kpi-l">${esc(l)}</div></div>`;
  }

  /* ---------- Render principal ---------- */
  function render() {
    const p = ensurePanel();

    const rows = statExercises().sort((a, b) => b.volumen - a.volumen);
    const groups = statGroups(rows);
    const sesiones = (typeof getSesionesDone === "function" ? getSesionesDone() : [])
      .slice().sort((a, b) => (a.date < b.date ? 1 : -1));

    const xp = (typeof calcXP === "function") ? calcXP() : 0;
    const lvl = (typeof xpToLevel === "function") ? xpToLevel(xp) : { level: 1, pct: 0 };
    const titulo = (typeof nivelTitulo === "function") ? nivelTitulo(lvl.level) : "";
    const pr = (typeof mejorPR === "function") ? mejorPR() : { best: 0, name: "—" };
    const cuenta = (typeof getAuth === "function" && getAuth()) || {};
    const nombre = cuenta.name || cuenta.email || "Tu cuenta";

    const sesionesDone = (typeof getSesionesDone === "function") ? getSesionesDone().length : 0;
    const maxG = Math.max(1, ...groups.map(g => g.volumen));

    const kpis =
      kpi(sesionesDone, "Sesiones completadas", true) +
      kpi(num(typeof volumenTotal === "function" ? volumenTotal() : 0) + " lb", "Volumen total") +
      kpi((typeof racha === "function" ? racha() : 0), "Racha (días)") +
      kpi((typeof contarPRs === "function" ? contarPRs() : 0), "Récords (PR)") +
      kpi((typeof diasEntrenados === "function" ? diasEntrenados() : 0), "Días entrenados") +
      kpi((typeof totalSeries === "function" ? totalSeries() : 0), "Series totales");

    const barras = groups.length
      ? groups.map(g => `
        <div class="adm-bar-row">
          <div class="adm-bar-lbl">${esc(g.grupo)}</div>
          <div class="adm-bar-track"><div class="adm-bar-fill" style="width:${Math.max(3, g.volumen / maxG * 100)}%"></div></div>
          <div class="adm-bar-val">${num(g.volumen)} lb</div>
          <div class="adm-bar-sub">${g.series} series · ${g.ejercicios} ejerc.</div>
        </div>`).join("")
      : `<div class="adm-empty">Aún no hay entrenamientos registrados.</div>`;

    const filasEj = rows.length
      ? rows.map(r => `
        <tr>
          <td class="adm-td-name">${esc(r.name)}</td>
          <td><span class="adm-tag">${esc(r.group)}</span></td>
          <td class="adm-num">${r.sesiones}</td>
          <td class="adm-num">${r.series}</td>
          <td class="adm-num">${num(r.volumen)}</td>
          <td class="adm-num adm-strong">${r.best ? r.best + " lb" : "—"}</td>
          <td class="adm-num">${r.ultimoPeso !== "" ? r.ultimoPeso + " lb" : "—"}</td>
          <td class="adm-num adm-dim">${fecha(r.ultimaFecha)}</td>
        </tr>`).join("")
      : `<tr><td colspan="8" class="adm-empty">Sin ejercicios registrados todavía.</td></tr>`;

    const filasSes = sesiones.length
      ? sesiones.map(s => `
        <tr>
          <td class="adm-num adm-dim">${fecha(s.date)}</td>
          <td class="adm-td-name">${esc(s.label || s.day || "—")}</td>
          <td class="adm-num">${(s.ejercicios != null ? s.ejercicios : "—")}${s.total != null ? " / " + s.total : ""}</td>
          <td class="adm-num">${num(s.volumen || 0)} lb</td>
          <td class="adm-num adm-dim">${s.duracion ? s.duracion + " min" : "—"}</td>
        </tr>`).join("")
      : `<tr><td colspan="5" class="adm-empty">Aún no has concluido ninguna sesión.</td></tr>`;

    p.innerHTML = `
      <div class="adm-wrap">
        <header class="adm-top">
          <div class="adm-brand">STIMPYS <em>TRAINING</em></div>
          <div class="adm-mode">Vista administrador · solo lectura</div>
          <button class="adm-switch" id="admToApp" type="button">✎ Registrar entreno</button>
          <div class="adm-account">
            <div class="adm-acc-name">${esc(nombre)}</div>
            <div class="adm-acc-lvl">Nivel ${lvl.level} · ${esc(titulo)}</div>
            <div class="adm-acc-bar"><i style="width:${lvl.pct || 0}%"></i></div>
          </div>
        </header>

        <section class="adm-block">
          <h2 class="adm-h2">Resumen global</h2>
          <div class="adm-kpis">${kpis}</div>
          <div class="adm-pr">
            <span class="adm-pr-ic">🏆</span>
            <span>Mejor récord: <b>${esc(pr.name)}</b> · <b>${pr.best || 0} lb</b> (1RM estimado)</span>
          </div>
        </section>

        <div class="adm-cols">
          <section class="adm-block">
            <h2 class="adm-h2">Volumen por músculo</h2>
            <div class="adm-bars">${barras}</div>
          </section>

          <section class="adm-block">
            <h2 class="adm-h2">Historial de sesiones</h2>
            <div class="adm-table-scroll">
              <table class="adm-table">
                <thead><tr>
                  <th>Fecha</th><th>Rutina</th><th class="adm-num">Ejercicios</th>
                  <th class="adm-num">Volumen</th><th class="adm-num">Duración</th>
                </tr></thead>
                <tbody>${filasSes}</tbody>
              </table>
            </div>
          </section>
        </div>

        <section class="adm-block">
          <h2 class="adm-h2">Detalle por ejercicio <small>(${rows.length})</small></h2>
          <div class="adm-table-scroll">
            <table class="adm-table">
              <thead><tr>
                <th>Ejercicio</th><th>Grupo</th>
                <th class="adm-num">Sesiones</th><th class="adm-num">Series</th>
                <th class="adm-num">Volumen</th><th class="adm-num">1RM est.</th>
                <th class="adm-num">Último peso</th><th class="adm-num">Última vez</th>
              </tr></thead>
              <tbody>${filasEj}</tbody>
            </table>
          </div>
        </section>

        <div class="adm-foot">Consola de estadísticas · solo lectura · pulsa “Registrar entreno” para cambiar al modo de registro.</div>
      </div>`;

    const toApp = p.querySelector("#admToApp");
    if (toApp) toApp.onclick = () => setMode("app");
  }

  /* ---------- Botón flotante para volver al panel (en modo registro) ---------- */
  function ensureFloatBtn() {
    let b = document.getElementById("adminToggleBtn");
    if (!b) {
      b = document.createElement("button");
      b.id = "adminToggleBtn";
      b.type = "button";
      b.innerHTML = "📊 Vista administrador";
      b.onclick = () => setMode("admin");
      document.body.appendChild(b);
    }
    b.style.display = "";
  }
  function removeFloatBtn() {
    const b = document.getElementById("adminToggleBtn");
    if (b) b.style.display = "none";
  }

  /* ---------- Mostrar / ocultar (con guard anti-reentrada) ---------- */
  let busy = false;
  function update() {
    if (busy) return;               // evita cualquier bucle de reentrada
    busy = true;
    try {
      const body = document.body;
      // Móvil o sin sesión: nada de escritorio, app normal intacta.
      if (!desktopActive()) {
        body.classList.remove("admin-on", "desktop-app");
        removeFloatBtn();
        return;
      }
      if (getMode() === "app") {
        // Modo registro adaptado a escritorio.
        body.classList.remove("admin-on");
        body.classList.add("desktop-app");
        ensureFloatBtn();
        try { markConclude(); } catch (e) {}
      } else {
        // Panel de administrador (solo lectura).
        body.classList.remove("desktop-app");
        body.classList.add("admin-on");
        removeFloatBtn();
        render();
      }
    } catch (e) {
      // Nunca dejar que un fallo del panel congele o rompa la app.
      console.error("[panel-admin]", e);
    } finally {
      busy = false;
    }
  }

  // Debounce para eventos que pueden dispararse en ráfaga (resize, scroll de barra…)
  let deb = null;
  function updateSoon() {
    clearTimeout(deb);
    deb = setTimeout(update, 120);
  }

  /* ---------- Enganches ---------- */
  // Cambio de breakpoint escritorio/móvil
  if (DESKTOP.addEventListener) DESKTOP.addEventListener("change", updateSoon);
  else if (DESKTOP.addListener) DESKTOP.addListener(updateSoon); // Safari viejo
  window.addEventListener("resize", updateSoon);

  // Volver a la pestaña o recuperar foco: refrescar datos
  window.addEventListener("focus", updateSoon);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) updateSoon(); });

  // Detectar login/logout observando SOLO el muro de autenticación (lo controla
  // la app, no este script, así que no puede realimentarse en bucle).
  const authEl = document.getElementById("auth");
  if (authEl && "MutationObserver" in window) {
    new MutationObserver(updateSoon).observe(authEl, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- Jerarquía del botón "Concluir sesión" ----------
     Solo debe destacar (verde intenso) cuando ya hay al menos un ejercicio
     registrado. Marcamos .has-progress leyendo el contador "X de N". */
  function markConclude() {
    const btn = document.querySelector("#exList .conclude-btn");
    if (!btn) return;
    const small = btn.querySelector("small");
    const m = small && small.textContent.match(/^\s*(\d+)/);
    const hechos = m ? parseInt(m[1], 10) : 0;
    btn.classList.toggle("has-progress", hechos > 0);
  }
  // Envolver renderEntreno para re-marcar tras cada repintado (sin tocar su código)
  if (typeof window.renderEntreno === "function") {
    const _renderEntreno = window.renderEntreno;
    window.renderEntreno = function () {
      const r = _renderEntreno.apply(this, arguments);
      try { markConclude(); } catch (e) {}
      return r;
    };
  }

  // Exponer para poder refrescar manualmente si hiciera falta
  window.renderAdminPanel = update;

  // Reintentos tempranos: los datos se cargan de la nube ~1.3s tras el arranque
  update();
  [500, 1500, 2800, 4200].forEach(t => setTimeout(update, t));
})();
