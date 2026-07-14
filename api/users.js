// GET /api/users  (header Authorization: Bearer <token>)
// Devuelve TODOS los usuarios con su estado (online / última vez) y estadísticas.
import jwt from "jsonwebtoken";
import { getDb, send, getToken, JWT_SECRET, computeStats, ONLINE_MS } from "./_db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "GET") return send(res, 405, { error: "Método no permitido" });

  try {
    const token = getToken(req);
    if (!token) return send(res, 401, { error: "No autorizado" });

    let me;
    try { me = jwt.verify(token, JWT_SECRET).uid; }
    catch { return send(res, 401, { error: "Sesión expirada" }); }

    const db = await getDb();
    // Trae lo necesario para stats, sin la contraseña
    const docs = await db.collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    const now = Date.now();
    const list = docs.map((u) => {
      const last = u.lastSeen ? new Date(u.lastSeen).getTime() : 0;
      const online = now - last <= ONLINE_MS;
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        online,
        lastSeen: u.lastSeen || null,
        createdAt: u.createdAt || null,
        me: u._id.toString() === me,
        stats: computeStats(u.data),
      };
    });

    // Online primero, luego por PR
    list.sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1;
      return (b.stats.mejorPR || 0) - (a.stats.mejorPR || 0);
    });

    return send(res, 200, { users: list, onlineCount: list.filter((u) => u.online).length });
  } catch (e) {
    return send(res, 500, { error: "Error del servidor: " + (e.message || "desconocido") });
  }
}
