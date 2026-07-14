// POST /api/register  { name, email, password }
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, send, readBody, emailOk, JWT_SECRET } from "./_db.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  if (req.method !== "POST") return send(res, 405, { error: "Método no permitido" });

  try {
    const db = await getDb();
    const users = db.collection("users");

    const { name, email, password } = await readBody(req);
    if (!name || name.trim().length < 2) return send(res, 400, { error: "Nombre inválido" });
    if (!emailOk(email)) return send(res, 400, { error: "Correo inválido" });
    if (!password || password.length < 6) return send(res, 400, { error: "La contraseña debe tener al menos 6 caracteres" });

    const exists = await users.findOne({ email: email.toLowerCase() });
    if (exists) return send(res, 409, { error: "Ese correo ya está registrado" });

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const doc = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hash,
      data: { db: {}, bw: [] },
      createdAt: now,
      lastSeen: now,
    };
    const r = await users.insertOne(doc);
    const token = jwt.sign({ uid: r.insertedId.toString() }, JWT_SECRET, { expiresIn: "60d" });
    return send(res, 200, { token, name: doc.name, email: doc.email, id: r.insertedId.toString() });
  } catch (e) {
    return send(res, 500, { error: "Error del servidor: " + (e.message || "desconocido") });
  }
}
