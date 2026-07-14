// ============================================================
// GET  /api/profile?id=<userId>   -> perfil público de un usuario
// GET  /api/profile               -> mi propio perfil (con token)
// POST /api/profile               -> actualizar mi perfil
//   { avatar, bio, banner, insigniaDestacada, showcases, nombre }
// ============================================================
import { getDb, JWT_SECRET, send, readBody, getToken } from "./_db.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });

  try {
    const db = await getDb();
    const users = db.collection("users");

    // ---------- Ver perfil (propio o de otro) ----------
    if (req.method === "GET") {
      const url = new URL(req.url, "http://x");
      const otherId = url.searchParams.get("id");

      if (otherId) {
        // perfil público de otro usuario
        let _id;
        try { _id = new ObjectId(otherId); }
        catch { return send(res, 400, { error: "ID inválido" }); }
        const u = await users.findOne(
          { _id },
          { projection: { password: 0, email: 0 } }
        );
        if (!u) return send(res, 404, { error: "Usuario no encontrado" });
        return send(res, 200, { profile: publicProfile(u) });
      }

      // mi perfil (requiere token)
      const token = getToken(req);
      if (!token) return send(res, 401, { error: "No autorizado" });
      let uid;
      try { uid = jwt.verify(token, JWT_SECRET).uid; }
      catch { return send(res, 401, { error: "Sesión expirada" }); }
      const u = await users.findOne({ _id: new ObjectId(uid) });
      if (!u) return send(res, 404, { error: "Usuario no encontrado" });
      return send(res, 200, { profile: { ...publicProfile(u), email: u.email, esMio: true } });
    }

    // ---------- Actualizar mi perfil ----------
    if (req.method === "POST") {
      const token = getToken(req);
      if (!token) return send(res, 401, { error: "No autorizado" });
      let uid;
      try { uid = jwt.verify(token, JWT_SECRET).uid; }
      catch { return send(res, 401, { error: "Sesión expirada" }); }

      const body = await readBody(req);
      const set = {};

      // Nombre
      if (typeof body.nombre === "string") {
        const n = body.nombre.trim();
        if (n.length < 2 || n.length > 30)
          return send(res, 400, { error: "El nombre debe tener entre 2 y 30 caracteres" });
        set.name = n;
      }
      // Avatar: data URL de imagen (limitado a ~400KB)
      if (typeof body.avatar === "string") {
        if (body.avatar && !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(body.avatar))
          return send(res, 400, { error: "Formato de imagen no válido" });
        if (body.avatar.length > 550000)
          return send(res, 400, { error: "La imagen es demasiado grande (máx ~400KB)" });
        set["perfil.avatar"] = body.avatar;
      }
      // Bio ("sobre mí")
      if (typeof body.bio === "string") {
        if (body.bio.length > 300)
          return send(res, 400, { error: "La descripción no puede pasar de 300 caracteres" });
        set["perfil.bio"] = body.bio;
      }
      // Banner (id de fondo predefinido)
      if (typeof body.banner === "string") set["perfil.banner"] = body.banner.slice(0, 40);
      // Insignia destacada
      if (typeof body.insigniaDestacada === "string")
        set["perfil.insigniaDestacada"] = body.insigniaDestacada.slice(0, 40);
      // Showcases (vitrinas activas)
      if (Array.isArray(body.showcases))
        set["perfil.showcases"] = body.showcases.slice(0, 6).map(s => String(s).slice(0, 30));
      // Stats públicos que el cliente calcula (nivel, xp, logros)
      if (body.stats && typeof body.stats === "object") {
        set["perfil.stats"] = {
          nivel: Number(body.stats.nivel) || 1,
          xp: Number(body.stats.xp) || 0,
          titulo: String(body.stats.titulo || "").slice(0, 20),
          logros: Array.isArray(body.stats.logros) ? body.stats.logros.slice(0, 40) : [],
          racha: Number(body.stats.racha) || 0,
          pr: Number(body.stats.pr) || 0,
          prEx: String(body.stats.prEx || "").slice(0, 50),
          volumen: Number(body.stats.volumen) || 0,
          dias: Number(body.stats.dias) || 0,
        };
      }

      if (!Object.keys(set).length)
        return send(res, 400, { error: "Nada que actualizar" });

      set.updatedAt = new Date();
      await users.updateOne({ _id: new ObjectId(uid) }, { $set: set });
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: "Método no permitido" });
  } catch (e) {
    return send(res, 500, { error: "Error del servidor: " + (e.message || "desconocido") });
  }
}

function publicProfile(u) {
  const p = u.perfil || {};
  const online = u.lastSeen && (Date.now() - new Date(u.lastSeen).getTime() < 90000);
  return {
    id: u._id.toString(),
    nombre: u.name || "Atleta",
    avatar: p.avatar || "",
    bio: p.bio || "",
    banner: p.banner || "azul",
    insigniaDestacada: p.insigniaDestacada || "",
    showcases: p.showcases || ["stats", "logros", "pr"],
    stats: p.stats || {},
    online: !!online,
    lastSeen: u.lastSeen || null,
    miembroDesde: u.createdAt || null,
  };
}
