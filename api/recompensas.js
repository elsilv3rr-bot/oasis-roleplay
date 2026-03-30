// API RECOMPENSAS - Sistema de collect diario //
// Vinculado a nivel VIP y profesion //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "../lib/api/database.js";
import { aplicarHeaders } from "../lib/api/seguridad.js";

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
    const slotNumber = parseInt(req.query.slotNumber || req.body?.slotNumber || "1", 10);

    const ventana24hMs = 24 * 60 * 60 * 1000;

    // GET: estado de recompensa diaria //
    if (req.method === "GET") {
      const [personaje] = await connection.execute(
        "SELECT id, stateid, nombre, rol, nivel_vip, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
        [decoded.discordId, slotNumber]
      );

      if (personaje.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const p = personaje[0];
      const [ultimoCobroRows] = await connection.execute(
        `SELECT created_at
         FROM recompensas_diarias
         WHERE discord_id = ? AND slot_number = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [decoded.discordId, slotNumber]
      );

      const ultimoCobro = ultimoCobroRows.length > 0 ? new Date(ultimoCobroRows[0].created_at) : null;
      const ahoraMs = Date.now();
      const ultimoCobroMs = ultimoCobro ? ultimoCobro.getTime() : 0;
      const yaCobrado = ultimoCobro ? (ahoraMs - ultimoCobroMs) < ventana24hMs : false;
      const restanteMs = yaCobrado ? (ventana24hMs - (ahoraMs - ultimoCobroMs)) : 0;
      const proximoCobroEnSegundos = Math.max(0, Math.ceil(restanteMs / 1000));

      // Obtener recompensa VIP //
      const [vipRows] = await connection.execute(
        "SELECT recompensa_diaria FROM niveles_vip WHERE nombre = ? LIMIT 1",
        [p.nivel_vip || "ninguno"]
      );

      // Obtener salario por profesion //
      const [profRows] = await connection.execute(
        "SELECT salario_diario FROM profesiones WHERE nombre = ? LIMIT 1",
        [p.rol || "civil"]
      );

      const recompensaVip = vipRows.length > 0 ? Number(vipRows[0].recompensa_diaria) : 500;
      const salarioProfesion = profRows.length > 0 ? Number(profRows[0].salario_diario) : 500;
      const montoTotal = recompensaVip + salarioProfesion;

      return res.status(200).json({
        ok: true,
        yaCobrado,
        proximoCobroEnSegundos,
        ultimoCobro: ultimoCobro ? ultimoCobro.toISOString() : null,
        monto: montoTotal,
        desglose: {
          vip: { nivel: p.nivel_vip || "ninguno", monto: recompensaVip },
          profesion: { rol: p.rol || "civil", monto: salarioProfesion }
        },
        personaje: {
          nombre: p.nombre,
          rol: p.rol,
          nivelVip: p.nivel_vip,
          dinero: Number(p.dinero)
        }
      });
    }

    // POST: cobrar recompensa diaria //
    await connection.beginTransaction();

    const [personaje] = await connection.execute(
      "SELECT id, stateid, nombre, rol, nivel_vip, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
      [decoded.discordId, slotNumber]
    );

    if (personaje.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const p = personaje[0];
    const [ultimoCobroRows] = await connection.execute(
      `SELECT created_at
       FROM recompensas_diarias
       WHERE discord_id = ? AND slot_number = ?
       ORDER BY created_at DESC
       LIMIT 1 FOR UPDATE`,
      [decoded.discordId, slotNumber]
    );

    const ultimoCobro = ultimoCobroRows.length > 0 ? new Date(ultimoCobroRows[0].created_at) : null;
    const ahoraMs = Date.now();
    const ultimoCobroMs = ultimoCobro ? ultimoCobro.getTime() : 0;

    if (ultimoCobro && (ahoraMs - ultimoCobroMs) < ventana24hMs) {
      const restanteSegundos = Math.ceil((ventana24hMs - (ahoraMs - ultimoCobroMs)) / 1000);
      await connection.rollback();
      return res.status(400).json({
        error: "Aun no puedes cobrar. Deben pasar 24 horas.",
        proximoCobroEnSegundos: Math.max(0, restanteSegundos),
      });
    }

    // Calcular monto //
    const [vipRows] = await connection.execute(
      "SELECT recompensa_diaria FROM niveles_vip WHERE nombre = ? LIMIT 1",
      [p.nivel_vip || "ninguno"]
    );

    const [profRows] = await connection.execute(
      "SELECT salario_diario FROM profesiones WHERE nombre = ? LIMIT 1",
      [p.rol || "civil"]
    );

    const recompensaVip = vipRows.length > 0 ? Number(vipRows[0].recompensa_diaria) : 500;
    const salarioProfesion = profRows.length > 0 ? Number(profRows[0].salario_diario) : 500;
    const montoTotal = recompensaVip + salarioProfesion;

    // Acreditar dinero //
    await connection.execute(
      "UPDATE usuarios SET dinero = dinero + ? WHERE id = ?",
      [montoTotal, p.id]
    );

    // Registrar cobro //
    await connection.execute(
      "INSERT INTO recompensas_diarias (discord_id, slot_number, monto, fecha_cobro) VALUES (?, ?, ?, ?)",
      [decoded.discordId, slotNumber, montoTotal, new Date().toISOString().split("T")[0]]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      monto: montoTotal,
      dinero: Number(p.dinero) + montoTotal,
      mensaje: `Recompensa de $${montoTotal.toLocaleString()} cobrada`
    });

  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[RECOMPENSAS] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
