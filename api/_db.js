// ============================================================
// Configuración compartida: conexión a MongoDB + helpers
// Los archivos que empiezan con "_" NO son endpoints en Vercel.
// ============================================================
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
// En producción exige un secreto real. El fallback solo aplica en desarrollo local.
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => { throw new Error("Falta la variable de entorno JWT_SECRET"); })()
    : "dev-secret-solo-local");

let cached = global._mongo;
if (!cached) cached = global._mongo = { client: null, promise: null };

export async function getDb() {
  if (cached.client) return cached.client.db("stimpys");
  if (!cached.promise) {
    cached.promise = new MongoClient(MONGO_URI, { maxPoolSize: 5 }).connect();
  }
  cached.client = await cached.promise;
  return cached.client.db("stimpys");
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.end(JSON.stringify(body));
}

export function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
  });
}

export function getToken(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

// Un usuario se considera "en línea" si su lastSeen es de hace <= 2 min
export const ONLINE_MS = 2 * 60 * 1000;

// ---- Cálculo de estadísticas a partir de data.db (mismo modelo que el front) ----
function epley(w, r) { w = parseFloat(w) || 0; r = parseFloat(r) || 0; return Math.round(w * (1 + r / 30)); }
function volumen(sets) { return (sets || []).reduce((t, s) => t + (parseFloat(s.w) || 0) * (parseFloat(s.r) || 0), 0); }

export function computeStats(data) {
  const db = (data && data.db) || {};
  let registros = 0, mejorPR = 0, volTotal = 0;
  const fechas = new Set();

  Object.values(db).forEach((arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((e) => {
      registros++;
      if (e && e.date) fechas.add(e.date);
      (e.sets || []).forEach((s) => {
        const one = epley(s.w, s.r);
        if (one > mejorPR) mejorPR = one;
      });
      volTotal += volumen(e.sets);
    });
  });

  let racha = 0;
  const d = new Date();
  for (;;) {
    const iso = d.toISOString().slice(0, 10);
    if (fechas.has(iso)) { racha++; d.setDate(d.getDate() - 1); }
    else break;
  }

  return {
    registros,
    diasEntrenados: fechas.size,
    mejorPR,
    volumenTotal: Math.round(volTotal),
    racha,
  };
}
