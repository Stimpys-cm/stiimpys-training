// GET  /api/data   (header Authorization: Bearer <token>)
// POST /api/data   { db, bw, rutinas, notas, feels, skipdays, sesiones, logros }
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb, send, readBody, getToken, JWT_SECRET } from "./_db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });

  try {
    const db = await getDb();
    const users = db.collection("users");

    const token = getToken(req);
    if (!token) return send(res, 401, { error: "No autorizado" });

    let uid;
    try { uid = jwt.verify(token, JWT_SECRET).uid; }
    catch { return send(res, 401, { error: "Sesión expirada, inicia sesión de nuevo" }); }

    const _id = new ObjectId(uid);

    if (req.method === "GET") {
      const user = await users.findOne({ _id }, { projection: { data: 1, name: 1 } });
      if (!user) return send(res, 404, { error: "Usuario no encontrado" });
      const d = user.data || {};
      // Siempre devolvemos TODOS los campos. Si un usuario nuevo no tiene alguno,
      // va vacío: así el cliente lo sobrescribe y nunca hereda datos de otra cuenta.
      return send(res, 200, {
        data: {
          db: d.db || {},
          bw: d.bw || [],
          rutinas: d.rutinas || {},
          notas: d.notas || {},
          feels: d.feels || [],
          skipdays: d.skipdays || [],
          sesiones: d.sesiones || [],
          logros: d.logros || [],
        },
        name: user.name,
      });
    }

    if (req.method === "POST") {
      const b = await readBody(req);
      const set = { updatedAt: new Date() };

      // Solo se escriben los campos que vengan en la petición
      if (b.db !== undefined) set["data.db"] = b.db || {};
      if (b.bw !== undefined) set["data.bw"] = Array.isArray(b.bw) ? b.bw : [];
      if (b.rutinas !== undefined) set["data.rutinas"] = b.rutinas || {};
      if (b.notas !== undefined) set["data.notas"] = b.notas || {};
      if (b.feels !== undefined) set["data.feels"] = Array.isArray(b.feels) ? b.feels : [];
      if (b.skipdays !== undefined) set["data.skipdays"] = Array.isArray(b.skipdays) ? b.skipdays : [];
      if (b.sesiones !== undefined) set["data.sesiones"] = Array.isArray(b.sesiones) ? b.sesiones : [];
      if (b.logros !== undefined) set["data.logros"] = Array.isArray(b.logros) ? b.logros : [];

      await users.updateOne({ _id }, { $set: set });
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: "Método no permitido" });
  } catch (e) {
    return send(res, 500, { error: "Error del servidor: " + (e.message || "desconocido") });
  }
}
