// ENDPOINT DE SLOTS DE PERSONAJE //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";
import {
  getUserCharacterSlots,
  parseSlotNumber,
  SLOT_UNLOCK_COSTS,
  ensureUserSlotsInitialized,
} from "./_lib/characterSlots.js";

// Error HTTP controlado para respuestas //
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Parser defensivo para soportar body en string u objeto //
function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

// Verifica token y retorna payload //
function getDecodedToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "No autorizado");
  }

  try {
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Token invalido o expirado");
  }
}

export default async function handler(req, res) {
  aplicarHeaders(res);

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  let connection;
  try {
    const decoded = getDecodedToken(req);
    connection = await crearConexion();

    // get: retorna //
    if (req.method === "GET") {
      const slots = await getUserCharacterSlots(connection, decoded.discordId);
      return res.status(200).json({ ok: true, slots });
    }

    const body = parseBody(req.body);
    const slotNumber = parseSlotNumber(body.slotNumber);

    // comprar slots 2- 3 o 4 //
    if (!slotNumber || slotNumber === 1) {
      return res.status(400).json({ error: "Slot invalido para desbloqueo" });
    }

    const unlockCost = SLOT_UNLOCK_COSTS[slotNumber] || 0;
    if (unlockCost <= 0) {
      return res.status(400).json({ error: "Slot invalido para desbloqueo" });
    }

    await connection.beginTransaction();

    // bloq fila de usuario para serializar operaciones de compra //
    const [userRows] = await connection.execute(
      "SELECT id FROM users WHERE discord_id = ? LIMIT 1 FOR UPDATE",
      [decoded.discordId]
    );

    if (userRows.length === 0) {
      throw new HttpError(404, "Usuario de Discord no encontrado");
    }

    await ensureUserSlotsInitialized(connection, decoded.discordId);

    // bloq el slot objetivo para impedir compras duplicadas concurrentes //
    const [targetSlotRows] = await connection.execute(
      `SELECT is_unlocked
       FROM user_character_slots
       WHERE discord_id = ? AND slot_number = ?
       LIMIT 1
       FOR UPDATE`,
      [decoded.discordId, slotNumber]
    );

    if (targetSlotRows.length === 0) {
      throw new HttpError(400, "Slot invalido");
    }

    if (targetSlotRows[0].is_unlocked === 1) {
      throw new HttpError(409, "Este slot ya fue desbloqueado");
    }

    // compra se descuenta del dinero del personaje del slot 1 //
    const [walletRows] = await connection.execute(
      `SELECT id, dinero
       FROM usuarios
       WHERE discord_id = ? AND slot_number = 1
       LIMIT 1
       FOR UPDATE`,
      [decoded.discordId]
    );

    if (walletRows.length === 0) {
      throw new HttpError(409, "Debes crear tu personaje principal antes de desbloquear slots");
    }

    const mainCharacter = walletRows[0];
    if (mainCharacter.dinero < unlockCost) {
      throw new HttpError(400, "Saldo insuficiente para desbloquear este slot");
    }

    // condicion dinero >= costo para evitar saldos negativos por carrera //
    const [balanceUpdateResult] = await connection.execute(
      `UPDATE usuarios
       SET dinero = dinero - ?
       WHERE id = ? AND dinero >= ?`,
      [unlockCost, mainCharacter.id, unlockCost]
    );

    if (balanceUpdateResult.affectedRows !== 1) {
      throw new HttpError(409, "No se pudo procesar la compra de forma segura");
    }

    await connection.execute(
      `UPDATE user_character_slots
       SET is_unlocked = 1, unlocked_at = NOW()
       WHERE discord_id = ? AND slot_number = ?`,
      [decoded.discordId, slotNumber]
    );

    await connection.commit();

    const slots = await getUserCharacterSlots(connection, decoded.discordId);
    const walletSlot = slots.find((slot) => slot.slotNumber === 1);

    return res.status(200).json({
      ok: true,
      message: `Slot ${slotNumber} desbloqueado correctamente`,
      unlockedSlot: slotNumber,
      costPaid: unlockCost,
      currentBalance: walletSlot?.character?.dinero ?? null,
      slots,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (_) {
        // devolver el error principal //
      }
    }

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Error gestionando slots:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
