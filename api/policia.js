// API POLICIA - Funciones policiales //
// Multas, cargos judiciales, consulta de matriculas //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "../lib/api/database.js";
import { aplicarHeaders } from "../lib/api/seguridad.js";
import { sanitizar } from "../lib/api/validacion.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return body;
}

function parseVipStack(rawValue) {
  const text = String(rawValue || "").trim();
  if (!text) return [];

  const values = text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== "ninguno");

  const unique = [];
  const seen = new Set();
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(value);
  }
  return unique;
}

function normalizarTexto(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function esFaccionPoliciaOasis(nombreFaccion) {
  const nombreNormalizado = normalizarTexto(nombreFaccion);
  return nombreNormalizado === "policia de oasis"
    || (nombreNormalizado.includes("policia") && nombreNormalizado.includes("oasis"));
}

export default async function handler(req, res) {
  aplicarHeaders(res);

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }

  let connection;
  try {
    connection = await crearConexion();
    const body = parseBody(req.body);

    // Verificar que el usuario es policia o pertenece a la faccion Policia de Oasis //
    const slotNumber = parseInt(req.query.slotNumber || body?.slotNumber || "1", 10);

    const [oficialRows] = await connection.execute(
      "SELECT id, stateid, nombre, rol, placa_policial FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [decoded.discordId, slotNumber]
    );

    if (oficialRows.length === 0) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const oficial = oficialRows[0];

    const [membresiaRows] = await connection.execute(
      `SELECT f.nombre AS faccion_nombre
       FROM faccion_miembros fm
       JOIN facciones f ON f.id = fm.faccion_id
       WHERE fm.discord_id = ? AND fm.slot_number = ?
       LIMIT 1`,
      [decoded.discordId, slotNumber]
    );

    const faccionNombre = membresiaRows[0]?.faccion_nombre || "";
    const tieneAccesoPolicial = oficial.rol === "policia" || esFaccionPoliciaOasis(faccionNombre);

    if (!tieneAccesoPolicial) {
      return res.status(403).json({ error: "No tienes acceso policial. Necesitas rol de policia o pertenecer a Policia de Oasis." });
    }

    // GET: consultas //
    if (req.method === "GET") {
      const accion = req.query.accion;

      // Consultar expediente de un ciudadano por stateid //
      if (accion === "consultar_ciudadano") {
        const stateid = sanitizar(String(req.query.stateid || ""));
        if (!stateid) return res.status(400).json({ error: "stateid requerido" });

        const [ciudadano] = await connection.execute(
          "SELECT stateid, nombre, edad, nacionalidad, rol, nivel_vip FROM usuarios WHERE stateid = ? LIMIT 1",
          [stateid]
        );

        if (ciudadano.length === 0) {
          return res.status(404).json({ error: "Ciudadano no encontrado" });
        }

        const ciudadanoData = ciudadano[0];
        const nivelesVip = parseVipStack(ciudadanoData.nivel_vip);
        ciudadanoData.nivel_vip = nivelesVip.length > 0 ? nivelesVip.join(", ") : "ninguno";
        ciudadanoData.niveles_vip = nivelesVip;

        const [multas] = await connection.execute(
          "SELECT * FROM multas WHERE stateid_infractor = ? ORDER BY fecha DESC",
          [stateid]
        );

        const [cargos] = await connection.execute(
          "SELECT * FROM cargos_judiciales WHERE stateid_acusado = ? ORDER BY fecha DESC",
          [stateid]
        );

        return res.status(200).json({
          ok: true,
          ciudadano: ciudadanoData,
          multas,
          cargos
        });
      }

      // Consultar matriculas por stateid //
      if (accion === "consultar_matriculas") {
        const stateid = sanitizar(String(req.query.stateid || ""));

        let query = "SELECT * FROM vehiculos_registrados";
        const params = [];

        if (stateid) {
          query += " WHERE stateid_propietario = ?";
          params.push(stateid);
        }

        query += " ORDER BY fecha_registro DESC LIMIT 50";
        const [rows] = await connection.execute(query, params);
        return res.status(200).json({ ok: true, vehiculos: rows });
      }

      // Consultar matricula especifica //
      if (accion === "consultar_matricula") {
        const matricula = sanitizar(String(req.query.matricula || ""));
        if (!matricula) return res.status(400).json({ error: "matricula requerida" });

        const [rows] = await connection.execute(
          `SELECT v.*, u.nombre AS nombre_propietario
           FROM vehiculos_registrados v
           LEFT JOIN usuarios u ON u.stateid = v.stateid_propietario
           WHERE v.matricula = ? LIMIT 1`,
          [matricula]
        );

        if (rows.length === 0) return res.status(404).json({ error: "Matricula no encontrada" });
        return res.status(200).json({ ok: true, vehiculo: rows[0] });
      }

      return res.status(400).json({ error: "Accion GET no reconocida" });
    }

    // POST: acciones policiales //
    const { accion } = body;

    // Imponer multa //
    if (accion === "imponer_multa") {
      const { stateid_infractor, motivo, monto } = body;
      if (!stateid_infractor || !motivo || !monto) {
        return res.status(400).json({ error: "stateid_infractor, motivo y monto requeridos" });
      }

      const montoNum = Math.floor(Number(monto));
      if (!montoNum || montoNum <= 0) return res.status(400).json({ error: "Monto invalido" });

      // Verificar que el infractor existe //
      const [infractor] = await connection.execute(
        "SELECT id FROM usuarios WHERE stateid = ? LIMIT 1",
        [sanitizar(stateid_infractor)]
      );

      if (infractor.length === 0) {
        return res.status(404).json({ error: "Infractor no encontrado" });
      }

      await connection.execute(
        "INSERT INTO multas (stateid_infractor, stateid_oficial, motivo, monto, pagada) VALUES (?, ?, ?, ?, 0)",
        [sanitizar(stateid_infractor), oficial.stateid, sanitizar(motivo), montoNum]
      );

      return res.status(200).json({ ok: true, mensaje: "Multa impuesta correctamente" });
    }

    // Agregar cargo judicial //
    if (accion === "agregar_cargo" || accion === "imponer_cargo") {
      const { stateid_acusado, cargo, gravedad } = body;
      if (!stateid_acusado || !cargo) {
        return res.status(400).json({ error: "stateid_acusado y cargo requeridos" });
      }

      const gravedadValida = ["leve", "moderado", "grave"].includes(gravedad) ? gravedad : "leve";

      const [acusado] = await connection.execute(
        "SELECT id FROM usuarios WHERE stateid = ? LIMIT 1",
        [sanitizar(stateid_acusado)]
      );

      if (acusado.length === 0) {
        return res.status(404).json({ error: "Acusado no encontrado" });
      }

      await connection.execute(
        "INSERT INTO cargos_judiciales (stateid_acusado, stateid_oficial, cargo, gravedad) VALUES (?, ?, ?, ?)",
        [sanitizar(stateid_acusado), oficial.stateid, sanitizar(cargo), gravedadValida]
      );

      return res.status(200).json({ ok: true, mensaje: "Cargo judicial registrado" });
    }

    return res.status(400).json({ error: "Accion no reconocida" });

  } catch (err) {
    console.error("[POLICIA] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
