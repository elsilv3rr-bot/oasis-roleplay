// REGISTRO DE PERSONAJE //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";
import { sanitizar } from "./_lib/validacion.js";
import {
  getPrimaryCharacter,
  getUserCharacterSlots,
  parseSlotNumber,
  ensureUserSlotsInitialized,
} from "./_lib/characterSlots.js";

const START_MONEY = 20000;

// Error HTTP controlado //
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

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

export default async function handler(req, res) {
  aplicarHeaders(res);

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  let decoded;
  try {
    const token = authHeader.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }

  let connection;
  try {
    connection = await crearConexion();

    if (req.method === "GET") {
      // slots compatibilidad con usuarios existentes //
      const slots = await getUserCharacterSlots(connection, decoded.discordId);

      return res.status(200).json({
        ok: true,
        slots,
        // campo legacy para no romper pantallas antiguas //
        character: getPrimaryCharacter(slots),
      });
    }

    const body = parseBody(req.body);
    const slotNumber = parseSlotNumber(body.slotNumber ?? 1);
    const stateId = sanitizar(String(body.stateId || ""));
    const nombre = sanitizar(String(body.nombre || ""));
    const edad = parseInt(body.edad, 10);
    const nacionalidad = sanitizar(String(body.nacionalidad || ""));
    const rol = sanitizar(String(body.rol || "civil")) || "civil";

    // estricta de payload para evitar crear registros invalidos //
    if (!slotNumber || !stateId || !nombre || !nacionalidad || Number.isNaN(edad)) {
      return res.status(400).json({ error: "Datos incompletos o invalidos" });
    }

    await connection.beginTransaction();

    const [userRows] = await connection.execute(
      "SELECT id FROM users WHERE discord_id = ? LIMIT 1 FOR UPDATE",
      [decoded.discordId]
    );

    if (userRows.length === 0) {
      throw new HttpError(404, "Usuario de Discord no encontrado");
    }

    await ensureUserSlotsInitialized(connection, decoded.discordId);

    // Sslot solicitado para validar que este desbloqueado antes de escribir //
    const [slotRows] = await connection.execute(
      `SELECT is_unlocked
       FROM user_character_slots
       WHERE discord_id = ? AND slot_number = ?
       LIMIT 1
       FOR UPDATE`,
      [decoded.discordId, slotNumber]
    );

    if (slotRows.length === 0) {
      throw new HttpError(400, "Slot invalido");
    }

    if (slotRows[0].is_unlocked !== 1) {
      throw new HttpError(403, "El slot seleccionado aun esta bloqueado");
    }

    const [existingCharacterRows] = await connection.execute(
      `SELECT id
       FROM usuarios
       WHERE discord_id = ? AND slot_number = ?
       LIMIT 1
       FOR UPDATE`,
      [decoded.discordId, slotNumber]
    );

    if (existingCharacterRows.length > 0) {
      // Si el personaje ya existe en ese slot, se actualiza sin alterar su dinero //
      await connection.execute(
        `UPDATE usuarios
         SET stateid = ?, nombre = ?, edad = ?, nacionalidad = ?, rol = ?, discord_username = ?, discord_avatar = ?
         WHERE discord_id = ? AND slot_number = ?`,
        [
          stateId,
          nombre,
          edad,
          nacionalidad,
          rol,
          decoded.username || null,
          decoded.avatar || null,
          decoded.discordId,
          slotNumber,
        ]
      );
    } else {
      // En alta inicial del slot se asigna dinero por defecto //
      await connection.execute(
        `INSERT INTO usuarios
         (slot_number, stateid, nombre, edad, nacionalidad, rol, dinero, discord_id, discord_username, discord_avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slotNumber,
          stateId,
          nombre,
          edad,
          nacionalidad,
          rol,
          START_MONEY,
          decoded.discordId,
          decoded.username || null,
          decoded.avatar || null,
        ]
      );
    }

    await connection.commit();

    const slots = await getUserCharacterSlots(connection, decoded.discordId);
    const selectedSlot = slots.find((slot) => slot.slotNumber === slotNumber);

    return res.status(200).json({
      ok: true,
      slots,
      // Campo legado + campo objetivo para frontend nuevo //
      character: selectedSlot ? selectedSlot.character : getPrimaryCharacter(slots),
      selectedSlotNumber: slotNumber,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (_) {
        // No se corta el flujo si el rollback falla //
      }
    }

    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Error registrando personaje:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}