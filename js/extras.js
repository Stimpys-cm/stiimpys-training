/**
 * extras.js — Ejercicios extra "solo por hoy"
 * ---------------------------------------------------------------------------
 * Añade un botón "Agregar ejercicio" encima de "Concluir sesión" que permite
 * sumar ejercicios ÚNICAMENTE a la sesión del día actual, sin modificar la
 * rutina. Los extras se guardan por fecha (ISO) en localStorage, así solo
 * aparecen ese día. Funciona igual en móvil y escritorio.
 *
 * No modifica el código existente: envuelve ejerciciosDelDia() para inyectar
 * los extras del día y renderEntreno() para pintar el botón y las marcas.
 */
(function () {
  var KEY = "stimpys_extras";

  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function set(o) { localStorage.setItem(KEY, JSON.stringify(o)); }
  function hoyIso() { return (typeof nowStamp === "function" ? nowStamp().iso : new Date().toISOString().slice(0, 10)); }

  function extrasHoy() { return get()[hoyIso()] || []; }
  function addExtra(nombre) {
    var o = get(), k = hoyIso();
    if (!o[k]) o[k] = [];
    if (o[k].some(function (e) { return e.n === nombre; })) return false; // ya está
    // Esquema por defecto; el usuario ajusta series con +Serie
    o[k].push({ n: nombre, s: "3×8-12", extra: true });
    set(o);
    return true;
  }
  function removeExtra(nombre) {
    var o = get(), k = hoyIso();
    if (!o[k]) return;
    o[k] = o[k].filter(function (e) { return e.n !== nombre; });
    if (!o[k].length) delete o[k];
    set(o);
  }

  // Exponer por si se necesitan desde otro sitio
  window.extrasDeHoy = extrasHoy;
  window.addExtraHoy = addExtra;
  window.removeExtraHoy = removeExtra;

  /* ---- 1) Inyectar los extras SOLO en el día de hoy ---- */
  if (typeof ejerciciosDelDia === "function") {
    var _ejerciciosDelDia = ejerciciosDelDia;
    window.ejerciciosDelDia = function (day) {
      var lista = _ejerciciosDelDia.apply(this, arguments);
      try {
        if (typeof diaDeHoy === "function" && day === diaDeHoy()) {
          var nombres = {};
          lista.forEach(function (x) { nombres[x.n] = true; });
          extrasHoy().forEach(function (e) {
            if (!nombres[e.n]) lista.push({ n: e.n, s: e.s || "3×8-12", extra: true });
          });
        }
      } catch (err) {}
      return lista;
    };
  }

  /* ---- 2) Abrir el selector para agregar un extra ---- */
  function openAdd() {
    if (typeof elegirEjercicio !== "function") return;
    elegirEjercicio({
      titulo: "Agregar ejercicio (solo hoy)",
      onPick: function (nombre) {
        var ok = addExtra(nombre);
        if (typeof renderEntreno === "function") renderEntreno();
        if (typeof flashMsg === "function") flashMsg(ok ? "Ejercicio agregado a hoy" : "Ese ejercicio ya está en la sesión");
      }
    });
  }

  /* ---- 3) Pintar el botón y marcar las tarjetas extra tras cada render ---- */
  function decorate() {
    var list = document.getElementById("exList");
    if (!list) return;

    // a) Botón "Agregar ejercicio" justo encima de "Concluir sesión"
    var conclude = list.querySelector(".conclude-btn");
    if (conclude && !list.querySelector(".add-ex-btn")) {
      var b = document.createElement("button");
      b.className = "add-ex-btn";
      b.type = "button";
      b.innerHTML = "<span>" + (typeof ICON === "function" ? ICON("plus", 18) : "+") +
        "Agregar ejercicio</span><small>Solo para la sesión de hoy</small>";
      b.onclick = openAdd;
      conclude.parentNode.insertBefore(b, conclude);
    }

    // b) Marcar tarjetas de ejercicios extra y darles un botón de quitar
    var extras = {};
    extrasHoy().forEach(function (e) { extras[e.n] = true; });
    list.querySelectorAll(".ex").forEach(function (card) {
      var nameEl = card.querySelector(".ex-name");
      if (!nameEl) return;
      var nombre = nameEl.textContent.trim();
      if (!extras[nombre]) return;
      card.classList.add("is-extra");
      var head = card.querySelector(".ex-head");
      if (head && !head.querySelector(".ex-remove")) {
        var rm = document.createElement("button");
        rm.className = "ex-remove";
        rm.type = "button";
        rm.title = "Quitar de hoy";
        rm.innerHTML = (typeof ICON === "function" ? ICON("close", 15) : "×");
        rm.onclick = function (ev) {
          ev.stopPropagation();           // no abrir/cerrar la tarjeta
          removeExtra(nombre);
          if (typeof renderEntreno === "function") renderEntreno();
          if (typeof flashMsg === "function") flashMsg("Ejercicio quitado de hoy");
        };
        // Insertar antes del chevron para que quede a la derecha del nombre
        var chev = head.querySelector(".chev");
        if (chev) head.insertBefore(rm, chev); else head.appendChild(rm);
      }
    });
  }

  // Envolver renderEntreno para decorar después de cada repintado
  if (typeof renderEntreno === "function") {
    var _renderEntreno = renderEntreno;
    window.renderEntreno = function () {
      var r = _renderEntreno.apply(this, arguments);
      try { decorate(); } catch (e) {}
      return r;
    };
  }

  // Decorar el render inicial (ya ocurrió al cargar principal.js)
  try { decorate(); } catch (e) {}
})();
