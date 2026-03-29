// API MULTAS - Consulta y pago de multas desde municipalidad //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";

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

    // Obtener personaje //
    const [personaje] = await connection.execute(
      "SELECT id, stateid, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [decoded.discordId, slotNumber]
    );

    if (personaje.length === 0) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const p = personaje[0];

    // GET: obtener multas pendientes //
    if (req.method === "GET") {
      const [multas] = await connection.execute(
        "SELECT * FROM multas WHERE stateid_infractor = ? AND pagada = 0 ORDER BY fecha DESC",
        [p.stateid]
      );

      const [cargos] = await connection.execute(
        "SELECT * FROM cargos_judiciales WHERE stateid_acusado = ? ORDER BY fecha DESC",
        [p.stateid]
      );

      return res.status(200).json({ ok: true, multas, cargos });
    }

    // POST: pagar multa o pagar todas //
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { accion, multa_id } = body;

    if (accion === "pagar_multa" && multa_id) {
      await connection.beginTransaction();

      const [multa] = await connection.execute(
        "SELECT id, monto FROM multas WHERE id = ? AND stateid_infractor = ? AND pagada = 0 LIMIT 1 FOR UPDATE",
        [Number(multa_id), p.stateid]
      );

      if (multa.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Multa no encontrada o ya pagada" });
      }

      const monto = Number(multa[0].monto);

      const [saldoRows] = await connection.execute(
        "SELECT dinero FROM usuarios WHERE id = ? FOR UPDATE",
        [p.id]
      );

      if (Number(saldoRows[0].dinero) < monto) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [monto, p.id]);
      await connection.execute("UPDATE multas SET pagada = 1 WHERE id = ?", [multa[0].id]);

      await connection.commit();
      return res.status(200).json({ ok: true, dinero: Number(saldoRows[0].dinero) - monto });
    }

    if (accion === "pagar_todas") {
      await connection.beginTransaction();

      const [multas] = await connection.execute(
        "SELECT id, monto FROM multas WHERE stateid_infractor = ? AND pagada = 0 FOR UPDATE",
        [p.stateid]
      );

      if (multas.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "No hay multas pendientes" });
      }

      const total = multas.reduce((acc, m) => acc + Number(m.monto), 0);

      const [saldoRows] = await connection.execute(
        "SELECT dinero FROM usuarios WHERE id = ? FOR UPDATE",
        [p.id]
      );

      if (Number(saldoRows[0].dinero) < total) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente para pagar todas" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [total, p.id]);
      await connection.execute(
        "UPDATE multas SET pagada = 1 WHERE stateid_infractor = ? AND pagada = 0",
        [p.stateid]
      );

      await connection.commit();
      return res.status(200).json({ ok: true, dinero: Number(saldoRows[0].dinero) - total });
    }

    return res.status(400).json({ error: "Accion no reconocida" });

  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[MULTAS] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
