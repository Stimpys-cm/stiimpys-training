// POST /api/login  { email, password }
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, send, readBody, emailOk, JWT_SECRET } from "./_db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") return send(res, 405, { error: "Método no permitido" });

  try {
    const db = await getDb();
    const users = db.collection("users");

    const { email, password } = await readBody(req);
    if (!emailOk(email)) return send(res, 400, { error: "Correo inválido" });

    const user = await users.findOne({ email: (email || "").toLowerCase() });
    if (!user) return send(res, 401, { error: "Correo o contraseña incorrectos" });

    const match = await bcrypt.compare(password || "", user.password);
    if (!match) return send(res, 401, { error: "Correo o contraseña incorrectos" });

    await users.updateOne({ _id: user._id }, { $set: { lastSeen: new Date() } });

    const token = jwt.sign({ uid: user._id.toString() }, JWT_SECRET, { expiresIn: "60d" });
    return send(res, 200, { token, name: user.name, email: user.email, id: user._id.toString() });
  } catch (e) {
    return send(res, 500, { error: "Error del servidor: " + (e.message || "desconocido") });
  }
}
