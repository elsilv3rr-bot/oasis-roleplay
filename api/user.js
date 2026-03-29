// OBTENER USUARIO AUTENTICADO //
// get /api/user //
// Verifica el jwt y retorna los datos del usuario //

import { aplicarHeaders } from "./_lib/seguridad.js";
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  aplicarHeaders(res);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  // EXTRAER TOKEN DEL HEADER //
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // VERIFICAR Y DECODIFICAR JWT //
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // RETORNAR DATOS DEL USUARIO //
    return res.status(200).json({
      ok: true,
      user: {
        userId: decoded.userId,
        discordId: decoded.discordId,
        username: decoded.username,
        avatar: decoded.avatar,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
}
