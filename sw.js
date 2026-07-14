// Service Worker — Stimpys Training
// Estrategia: la app (index.html + iconos) se cachea para funcionar offline.
// Las llamadas a /api/* NUNCA se cachean (siempre red; si falla, la app usa localStorage).
const CACHE = "stimpys-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Nunca cachear la API ni peticiones que no sean GET → siempre a la red
  if (url.pathname.startsWith("/api/") || req.method !== "GET") {
    return; // deja pasar a la red normal; el front ya maneja errores/offline
  }

  // Navegación (abrir la app): network-first, con fallback a index.html cacheado
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Resto de assets (iconos, manifest): cache-first
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit)
    )
  );
});
