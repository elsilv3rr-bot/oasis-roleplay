// MIDDLEWARE: Autenticacion de servicio interno (bot -> API) //
// Usa un token secreto compartido entre bot y API //

import jwt from "jsonwebtoken";

const BOT_SERVICE_TOKEN = process.env.BOT_SERVICE_TOKEN;

/**
 * Verifica que la peticion venga del bot con token de servicio valido.
 * Acepta: Authorization: Service <BOT_SERVICE_TOKEN>
 * O bien: Authorization: Bearer <JWT> (para solicitudes desde la web)
 */
function verificarOrigenBot(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return { ok: false, error: "Sin autorizacion" };

  if (authHeader.startsWith("Service ")) {
    const token = authHeader.split(" ")[1];
    if (!BOT_SERVICE_TOKEN || token !== BOT_SERVICE_TOKEN) {
      return { ok: false, error: "Token de servicio invalido" };
    }
    return { ok: true, origen: "bot" };
  }

  if (authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { ok: true, origen: "web", usuario: decoded };
    } catch {
      return { ok: false, error: "JWT invalido" };
    }
  }

  return { ok: false, error: "Esquema de autorizacion no soportado" };
}

/**
 * Verifica autenticacion web (JWT) unicamente
 */
function verificarJWT(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, error: "No autorizado" };
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, usuario: decoded };
  } catch {
    return { ok: false, error: "Token invalido o expirado" };
  }
}

export { verificarOrigenBot, verificarJWT };
