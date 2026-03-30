// UTILIDADES DE SLOTS DE PERSONAJE //

export const MAX_CHARACTER_SLOTS = 4;

// slot 1 es gratis por defecto //
export const SLOT_UNLOCK_COSTS = {
  1: 0,
  2: 25000,
  3: 35000,
  4: 50000,
};

// slot a numero y valida rango permitido //
export function parseSlotNumber(rawValue) {
  const slotNumber = Number.parseInt(rawValue, 10);
  if (Number.isNaN(slotNumber)) return null;
  if (slotNumber < 1 || slotNumber > MAX_CHARACTER_SLOTS) return null;
  return slotNumber;
}

// Normaliza una fila de personaje para que el frontend reciba nombres consistentes //
export function mapCharacter(row) {
  if (!row) return null;

  return {
    id: row.id,
    slotNumber: row.slot_number,
    stateId: row.stateid,
    nombre: row.nombre,
    edad: row.edad,
    nacionalidad: row.nacionalidad,
    rol: row.rol,
    dinero: row.dinero,
    discordId: row.discord_id,
    discordUsername: row.discord_username,
    discordAvatar: row.discord_avatar,
  };
}

// Crea los 4 slots por usuario si aun no existen. INSERT IGNORE evita duplicados sin lanzar error //
export async function ensureUserSlotsInitialized(connection, discordId) {
  const values = [];
  const placeholders = [];

  for (let slotNumber = 1; slotNumber <= MAX_CHARACTER_SLOTS; slotNumber += 1) {
    placeholders.push("(?, ?, ?)");
    values.push(discordId, slotNumber, slotNumber === 1 ? 1 : 0);
  }

  await connection.execute(
    `INSERT IGNORE INTO user_character_slots (discord_id, slot_number, is_unlocked)
     VALUES ${placeholders.join(", ")}`,
    values
  );
}

// Devuelve el estado completo de slots, incluyendo personaje asociado cuando exista //
export async function getUserCharacterSlots(connection, discordId) {
  await ensureUserSlotsInitialized(connection, discordId);

  const [rows] = await connection.execute(
    `SELECT
      slots.slot_number,
      slots.is_unlocked,
      slots.unlocked_at,
      user_character.id,
      user_character.stateid,
      user_character.nombre,
      user_character.edad,
      user_character.nacionalidad,
      user_character.rol,
      user_character.dinero,
      user_character.discord_id,
      user_character.discord_username,
      user_character.discord_avatar,
      user_character.slot_number AS character_slot_number
     FROM user_character_slots AS slots
     LEFT JOIN usuarios AS user_character
       ON user_character.discord_id = slots.discord_id
      AND user_character.slot_number = slots.slot_number
     WHERE slots.discord_id = ?
     ORDER BY slots.slot_number ASC`,
    [discordId]
  );

  return rows.map((row) => {
    const hasCharacter = Boolean(row.id);

    return {
      slotNumber: row.slot_number,
      isUnlocked: row.is_unlocked === 1,
      unlockCost: SLOT_UNLOCK_COSTS[row.slot_number] || 0,
      unlockedAt: row.unlocked_at,
      character: hasCharacter
        ? mapCharacter({
            id: row.id,
            slot_number: row.character_slot_number,
            stateid: row.stateid,
            nombre: row.nombre,
            edad: row.edad,
            nacionalidad: row.nacionalidad,
            rol: row.rol,
            dinero: row.dinero,
            discord_id: row.discord_id,
            discord_username: row.discord_username,
            discord_avatar: row.discord_avatar,
          })
        : null,
    };
  });
}

// Obtiene un personaje por defecto para compatibilidad con codigo legado de un solo personaje //
export function getPrimaryCharacter(slots) {
  const slotWithCharacter = slots.find((slot) => slot.character);
  return slotWithCharacter ? slotWithCharacter.character : null;
}
