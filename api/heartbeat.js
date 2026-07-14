// POST /api/heartbeat  (header Authorization: Bearer <token>)
// Marca al usuario como activo ahora. El front lo llama cada ~45s.
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb, send, getToken, JWT_SECRET } from "./_db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });

  try {
    const token = getToken(req);
    if (!token) return send(res, 401, { error: "No autorizado" });

    let uid;
    try { uid = jwt.verify(token, JWT_SECRET).uid; }
    catch { return send(res, 401, { error: "Sesión expirada" }); }

    const db = await getDb();
    await db.collection("users").updateOne(
      { _id: new ObjectId(uid) },
      { $set: { lastSeen: new Date() } }
    );
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { error: "Error del servidor: " + (e.message || "desconocido") });
  }
}
