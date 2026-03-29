// BANCO API - Saldo y transferencias de personajes //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";

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

    // get: devolver saldo actual //
    if (req.method === "GET") {
      const slotNumber = parseInt(req.query.slotNumber || "1", 10);

      const [rows] = await connection.execute(
        "SELECT dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
        [decoded.discordId, slotNumber]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      return res.status(200).json({ ok: true, dinero: Number(rows[0].dinero) });
    }

    // post: realizar acciones de banco (transferir, debitar) //
    const body = parseBody(req.body);
    const { action, toStateId, amount, slotNumber: rawSlot } = body;

    const parsedAmount = Math.floor(Number(amount));
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ error: "Monto invalido" });
    }

    const slotNumber = parseInt(rawSlot || "1", 10);

    // transfer //
    if (action === "transfer") {
      if (!toStateId || typeof toStateId !== "string" || !toStateId.trim()) {
        return res.status(400).json({ error: "StateID destinatario requerido" });
      }

      await connection.beginTransaction();

      // bloquear remitente //
      const [senderRows] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
        [decoded.discordId, slotNumber]
      );

      if (senderRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje remitente no encontrado" });
      }

      const sender = senderRows[0];
      const senderBalance = Number(sender.dinero);

      if (senderBalance < parsedAmount) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      // bloquear destinatario //
      const [recipientRows] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
        [toStateId.trim()]
      );

      if (recipientRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "El StateID destinatario no existe" });
      }

      if (sender.id === recipientRows[0].id) {
        await connection.rollback();
        return res.status(400).json({ error: "No puedes transferirte a ti mismo" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
        [parsedAmount, sender.id]
      );

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero + ? WHERE id = ?",
        [parsedAmount, recipientRows[0].id]
      );

      await connection.commit();

      return res.status(200).json({ ok: true, dinero: senderBalance - parsedAmount });
    }

    // debit //
    if (action === "debit") {
      await connection.beginTransaction();

      const [rows] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
        [decoded.discordId, slotNumber]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const character = rows[0];
      const currentBalance = Number(character.dinero);

      if (currentBalance < parsedAmount) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
        [parsedAmount, character.id]
      );

      await connection.commit();

      return res.status(200).json({ ok: true, dinero: currentBalance - parsedAmount });
    }

    return res.status(400).json({ error: "Accion no reconocida" });

  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[BANCO] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
