// API POLICIA - Funciones policiales //
// Multas, cargos judiciales, consulta de matriculas //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";
import { sanitizar } from "./_lib/validacion.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return body;
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

    // Verificar que el usuario es policia (tiene placa o rol policia) //
    const slotNumber = parseInt(req.query.slotNumber || req.body?.slotNumber || "1", 10);

    const [oficialRows] = await connection.execute(
      "SELECT id, stateid, nombre, rol, placa_policial FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [decoded.discordId, slotNumber]
    );

    if (oficialRows.length === 0) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const oficial = oficialRows[0];

    if (oficial.rol !== "policia" || !oficial.placa_policial) {
      return res.status(403).json({ error: "No tienes acceso policial. Necesitas rol de policia y placa asignada." });
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
          ciudadano: ciudadano[0],
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
    const body = parseBody(req.body);
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
        "INSERT INTO multas (stateid_infractor, stateid_oficial, motivo, monto) VALUES (?, ?, ?, ?)",
        [sanitizar(stateid_infractor), oficial.stateid, sanitizar(motivo), montoNum]
      );

      return res.status(200).json({ ok: true, mensaje: "Multa impuesta correctamente" });
    }

    // Agregar cargo judicial //
    if (accion === "agregar_cargo") {
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
