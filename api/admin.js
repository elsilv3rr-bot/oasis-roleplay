// API ADMIN - Panel administrativo //
// Todas las operaciones requieren ser admin verificado por discord_id //

import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "../lib/api/database.js";
import { aplicarHeaders } from "../lib/api/seguridad.js";
import { sanitizar } from "../lib/api/validacion.js";
import { ensureUserSlotsInitialized, parseSlotNumber } from "../lib/api/characterSlots.js";

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

function serializeVipStack(vips) {
  if (!Array.isArray(vips) || vips.length === 0) {
    return "ninguno";
  }
  return vips.join(",");
}

function esPeticionWebAdmin(req, body) {
  const host = String(req.headers.host || "").trim().toLowerCase();
  const origin = String(req.headers.origin || "").trim().toLowerCase();
  const referer = String(req.headers.referer || "").trim().toLowerCase();
  const marcaWeb = body?.webAdmin === true;

  if (!host || !marcaWeb) return false;
  return origin.includes(host) || referer.includes(host);
}

// Verificar que el discord_id es admin //
async function esAdmin(connection, discordId) {
  const [rows] = await connection.execute(
    "SELECT id FROM admins WHERE discord_id = ? LIMIT 1",
    [discordId]
  );
  return rows.length > 0;
}

// Registrar accion en admin_logs //
async function registrarLogAdmin(connection, adminDiscordId, accion, objetivoDiscordId, detalles) {
  await connection.execute(
    "INSERT INTO admin_logs (admin_discord_id, accion, objetivo_discord_id, detalles) VALUES (?, ?, ?, ?)",
    [adminDiscordId, accion, objetivoDiscordId || null, detalles || null]
  );
}

async function tieneCategoriaVehiculo(connection) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS total
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'vehiculos_tienda'
       AND COLUMN_NAME = 'categoria'`
  );
  return Number(rows?.[0]?.total || 0) > 0;
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
    const admin = await esAdmin(connection, decoded.discordId);

    // GET: verificar si es admin y obtener datos del panel //
    if (req.method === "GET") {
      if (!admin) {
        return res.status(200).json({ ok: true, esAdmin: false });
      }

      const accion = req.query.accion || "verificar";

      if (accion === "verificar") {
        return res.status(200).json({ ok: true, esAdmin: true });
      }

      if (accion === "usuarios") {
        const busqueda = sanitizar(String(req.query.busqueda || ""));
        let query = `SELECT u.id, u.stateid, u.nombre, u.edad, u.nacionalidad, u.rol, u.nivel_vip, u.dinero, u.discord_id, u.slot_number, u.placa_policial
          FROM usuarios u`;
        const params = [];

        if (busqueda) {
          query += " WHERE u.nombre LIKE ? OR u.stateid LIKE ? OR u.discord_id LIKE ?";
          const term = `%${busqueda}%`;
          params.push(term, term, term);
        }

        query += " ORDER BY u.id DESC LIMIT 50";
        const [rows] = await connection.execute(query, params);
        return res.status(200).json({ ok: true, usuarios: rows });
      }

      if (accion === "usuarios_registrados") {
        const busqueda = sanitizar(String(req.query.busqueda || "")).trim();

        let perfilesQuery = `
          SELECT u.discord_id, u.username, u.avatar, u.created_at,
                 COUNT(p.id) AS total_personajes
          FROM users u
          LEFT JOIN usuarios p ON p.discord_id = u.discord_id
        `;
        const perfilesParams = [];

        if (busqueda) {
          perfilesQuery += " WHERE u.username LIKE ? OR u.discord_id LIKE ? OR p.nombre LIKE ? OR p.stateid LIKE ?";
          const term = `%${busqueda}%`;
          perfilesParams.push(term, term, term, term);
        }

        perfilesQuery += " GROUP BY u.discord_id, u.username, u.avatar, u.created_at ORDER BY u.created_at DESC LIMIT 250";

        const [perfiles] = await connection.execute(perfilesQuery, perfilesParams);
        if (perfiles.length === 0) {
          return res.status(200).json({ ok: true, perfiles: [] });
        }

        const discordIds = perfiles.map((p) => String(p.discord_id));
        const placeholders = discordIds.map(() => "?").join(",");

        const [personajesRows] = await connection.execute(
          `SELECT id, discord_id, slot_number, stateid, nombre, edad, nacionalidad, rol, nivel_vip, dinero, placa_policial, created_at
           FROM usuarios
           WHERE discord_id IN (${placeholders})
           ORDER BY discord_id ASC, slot_number ASC`,
          discordIds
        );

        const personajesPorDiscord = new Map();
        for (const personaje of personajesRows) {
          const key = String(personaje.discord_id);
          if (!personajesPorDiscord.has(key)) personajesPorDiscord.set(key, []);
          personajesPorDiscord.get(key).push(personaje);
        }

        const perfilesConPersonajes = perfiles.map((perfil) => ({
          ...perfil,
          total_personajes: Number(perfil.total_personajes || 0),
          personajes: personajesPorDiscord.get(String(perfil.discord_id)) || [],
        }));

        return res.status(200).json({ ok: true, perfiles: perfilesConPersonajes });
      }

      if (accion === "mercado_stock") {
        const hayCategoria = await tieneCategoriaVehiculo(connection);
        const [vehiculos] = await connection.execute(
          hayCategoria
            ? "SELECT id_vehiculo AS id, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen, categoria FROM vehiculos_tienda ORDER BY id_vehiculo ASC"
            : "SELECT id_vehiculo AS id, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen, 'standard' AS categoria FROM vehiculos_tienda ORDER BY id_vehiculo ASC"
        );

        const [items] = await connection.execute(
          "SELECT id_item AS id, tipo, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen FROM mercado_items ORDER BY tipo ASC, id_item ASC"
        );

        return res.status(200).json({ ok: true, vehiculos, items });
      }

      if (accion === "facciones") {
        const [rows] = await connection.execute(
          "SELECT id, nombre, color, max_miembros, activa FROM facciones WHERE activa = 1 ORDER BY nombre ASC"
        );
        return res.status(200).json({ ok: true, facciones: rows });
      }

      if (accion === "profesiones") {
        const [rows] = await connection.execute("SELECT * FROM profesiones ORDER BY nombre ASC");
        return res.status(200).json({ ok: true, profesiones: rows });
      }

      if (accion === "admins") {
        const [rows] = await connection.execute(
          `SELECT a.id, a.discord_id, a.agregado_por, a.created_at, u.username
           FROM admins a LEFT JOIN users u ON a.discord_id = u.discord_id
           ORDER BY a.created_at DESC`
        );
        return res.status(200).json({ ok: true, admins: rows });
      }

      if (accion === "niveles_vip") {
        const [rows] = await connection.execute("SELECT * FROM niveles_vip ORDER BY recompensa_diaria ASC");
        return res.status(200).json({ ok: true, niveles: rows });
      }

      if (accion === "logs") {
        const [rows] = await connection.execute(
          `SELECT l.id, l.accion, l.detalles, l.created_at,
                  l.admin_discord_id, l.objetivo_discord_id,
                  u.username AS admin_username,
                  ou.username AS objetivo_username
           FROM admin_logs l
           LEFT JOIN users u ON u.discord_id = l.admin_discord_id
           LEFT JOIN users ou ON ou.discord_id = l.objetivo_discord_id
           ORDER BY l.created_at DESC
           LIMIT 150`
        );
        return res.status(200).json({ ok: true, logs: rows });
      }

      return res.status(400).json({ error: "Accion GET no reconocida" });
    }

    // POST: requiere ser admin //
    if (!admin) {
      return res.status(403).json({ error: "No tienes permisos de administrador" });
    }

    const body = parseBody(req.body);
    const { accion } = body;

    // Modificar dinero //
    if (accion === "modificar_dinero") {
      const { stateid, cantidad, operacion } = body;
      if (!stateid || !cantidad) return res.status(400).json({ error: "stateid y cantidad requeridos" });

      if (operacion !== "agregar" && operacion !== "quitar") {
        return res.status(400).json({ error: "Operacion invalida. Debe ser 'agregar' o 'quitar'" });
      }

      const monto = Math.floor(Number(cantidad));
      if (!monto || monto <= 0) return res.status(400).json({ error: "Cantidad invalida" });

      await connection.beginTransaction();

      const [rows] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
        [sanitizar(stateid)]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const actual = Number(rows[0].dinero);
      let nuevo;

      if (operacion === "quitar") {
        nuevo = Math.max(0, actual - monto);
      } else {
        nuevo = actual + monto;
      }

      await connection.execute("UPDATE usuarios SET dinero = ? WHERE id = ?", [nuevo, rows[0].id]);
      await connection.commit();

      await registrarLogAdmin(connection, decoded.discordId,
        `${operacion === "quitar" ? "Quito" : "Agrego"} $${monto} a ${stateid}`,
        null, `Saldo anterior: $${actual}, Nuevo: $${nuevo}`
      );

      return res.status(200).json({ ok: true, dinero: nuevo });
    }

    // Modificar dinero global a todos los stateID (solo web) //
    if (accion === "modificar_dinero_global") {
      if (!esPeticionWebAdmin(req, body)) {
        return res.status(403).json({ error: "Accion permitida solo desde el panel web" });
      }

      if (body.operacion !== "agregar" && body.operacion !== "quitar") {
        return res.status(400).json({ error: "Operacion invalida. Debe ser 'agregar' o 'quitar'" });
      }

      const confirmacion = String(body.confirmacion || "").trim();
      if (confirmacion !== "CONFIRMAR_GLOBAL") {
        return res.status(400).json({ error: "Se requiere confirmacion: envia confirmacion='CONFIRMAR_GLOBAL'" });
      }

      const { cantidad, operacion } = body;
      const monto = Math.floor(Number(cantidad));
      if (!monto || monto <= 0) return res.status(400).json({ error: "Cantidad invalida" });

      await connection.beginTransaction();

      const [beforeRows] = await connection.execute(
        "SELECT COUNT(*) AS total, COALESCE(SUM(dinero), 0) AS suma FROM usuarios FOR UPDATE"
      );

      let updateResult;
      if (operacion === "quitar") {
        [updateResult] = await connection.execute(
          "UPDATE usuarios SET dinero = GREATEST(0, dinero - ?)"
          , [monto]
        );
      } else {
        [updateResult] = await connection.execute(
          "UPDATE usuarios SET dinero = dinero + ?"
          , [monto]
        );
      }

      const [afterRows] = await connection.execute(
        "SELECT COUNT(*) AS total, COALESCE(SUM(dinero), 0) AS suma FROM usuarios"
      );

      const antes = Number(beforeRows[0]?.suma || 0);
      const despues = Number(afterRows[0]?.suma || 0);
      const totalUsuarios = Number(afterRows[0]?.total || 0);

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `${operacion === "quitar" ? "Quito" : "Agrego"} $${monto} global`,
        null,
        `Usuarios: ${totalUsuarios}, Total antes: $${antes}, Total despues: $${despues}`
      );

      await connection.commit();

      return res.status(200).json({
        ok: true,
        afectados: updateResult?.affectedRows || 0,
        totalUsuarios,
        totalAntes: antes,
        totalDespues: despues,
      });
    }

    // Desbloquear slot de personaje para un usuario //
    if (accion === "desbloquear_slot_usuario") {
      const { stateid, slotNumber } = body;
      if (!stateid) return res.status(400).json({ error: "stateid requerido" });

      const slot = parseSlotNumber(slotNumber);
      if (!slot || slot === 1) {
        return res.status(400).json({ error: "Slot invalido para desbloqueo administrativo" });
      }

      const [targetRows] = await connection.execute(
        "SELECT discord_id FROM usuarios WHERE stateid = ? LIMIT 1",
        [sanitizar(stateid)]
      );

      if (targetRows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const targetDiscordId = String(targetRows[0].discord_id || "").trim();
      if (!targetDiscordId) {
        return res.status(400).json({ error: "El usuario no tiene discord_id valido" });
      }

      await ensureUserSlotsInitialized(connection, targetDiscordId);

      const [slotRows] = await connection.execute(
        `SELECT is_unlocked
         FROM user_character_slots
         WHERE discord_id = ? AND slot_number = ?
         LIMIT 1`,
        [targetDiscordId, slot]
      );

      if (slotRows.length === 0) {
        return res.status(404).json({ error: "Slot no encontrado" });
      }

      if (slotRows[0].is_unlocked === 1) {
        return res.status(200).json({ ok: true, yaDesbloqueado: true, slotNumber: slot });
      }

      await connection.execute(
        `UPDATE user_character_slots
         SET is_unlocked = 1, unlocked_at = NOW()
         WHERE discord_id = ? AND slot_number = ?`,
        [targetDiscordId, slot]
      );

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `Desbloqueo slot ${slot} de ${stateid}`,
        targetDiscordId,
        `Desbloqueo manual desde panel admin web`
      );

      return res.status(200).json({ ok: true, slotNumber: slot, discordId: targetDiscordId });
    }

    // Asignar rol/profesion //
    if (accion === "asignar_rol") {
      const { stateid, rol } = body;
      if (!stateid || !rol) return res.status(400).json({ error: "stateid y rol requeridos" });

      const [result] = await connection.execute(
        "UPDATE usuarios SET rol = ? WHERE stateid = ?",
        [sanitizar(rol), sanitizar(stateid)]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      await registrarLogAdmin(connection, decoded.discordId, `Asigno rol "${rol}" a ${stateid}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "quitar_rol") {
      const { stateid } = body;
      if (!stateid) return res.status(400).json({ error: "stateid requerido" });

      const [result] = await connection.execute(
        "UPDATE usuarios SET rol = 'civil', placa_policial = NULL WHERE stateid = ?",
        [sanitizar(stateid)]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      await registrarLogAdmin(connection, decoded.discordId, `Quito rol especial de ${stateid}`, null, "Rol restablecido a civil");
      return res.status(200).json({ ok: true });
    }

    // Asignar placa policial //
    if (accion === "asignar_placa") {
      const { stateid, placa } = body;
      if (!stateid || !placa) return res.status(400).json({ error: "stateid y placa requeridos" });

      const [result] = await connection.execute(
        "UPDATE usuarios SET placa_policial = ?, rol = 'policia' WHERE stateid = ?",
        [sanitizar(placa), sanitizar(stateid)]
      );

      if (result.affectedRows === 0) return res.status(404).json({ error: "Personaje no encontrado" });

      await registrarLogAdmin(connection, decoded.discordId, `Asigno placa "${placa}" a ${stateid}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "quitar_placa") {
      const { stateid } = body;
      if (!stateid) return res.status(400).json({ error: "stateid requerido" });

      const [result] = await connection.execute(
        "UPDATE usuarios SET placa_policial = NULL WHERE stateid = ?",
        [sanitizar(stateid)]
      );

      if (result.affectedRows === 0) return res.status(404).json({ error: "Personaje no encontrado" });

      await registrarLogAdmin(connection, decoded.discordId, `Quito placa policial de ${stateid}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "agregar_miembro_faccion") {
      const stateid = sanitizar(String(body.stateid || "")).trim();
      const faccionId = Number(body.faccion_id);
      const rango = sanitizar(String(body.rango || "recluta")).toLowerCase();
      const rangosValidos = ["lider", "oficial", "miembro", "recluta"];

      if (!stateid || !faccionId) {
        return res.status(400).json({ error: "stateid y faccion_id requeridos" });
      }
      if (!rangosValidos.includes(rango)) {
        return res.status(400).json({ error: "Rango invalido" });
      }

      await connection.beginTransaction();
      try {
        const [userRows] = await connection.execute(
          "SELECT discord_id, slot_number FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
          [stateid]
        );
        if (userRows.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: "Personaje no encontrado" });
        }

        const [faccionRows] = await connection.execute(
          "SELECT id, nombre, max_miembros FROM facciones WHERE id = ? AND activa = 1 LIMIT 1",
          [faccionId]
        );
        if (faccionRows.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: "Faccion no encontrada" });
        }

        const objetivoDiscordId = String(userRows[0].discord_id || "");
        const objetivoSlot = Number(userRows[0].slot_number || 1);

        const [membresiaRows] = await connection.execute(
          "SELECT id, faccion_id FROM faccion_miembros WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
          [objetivoDiscordId, objetivoSlot]
        );

        if (membresiaRows.length === 0 || Number(membresiaRows[0].faccion_id) !== faccionId) {
          const [countRows] = await connection.execute(
            "SELECT COUNT(*) AS total FROM faccion_miembros WHERE faccion_id = ?",
            [faccionId]
          );
          if (Number(countRows[0].total || 0) >= Number(faccionRows[0].max_miembros || 0)) {
            await connection.rollback();
            return res.status(400).json({ error: "La faccion esta llena" });
          }
        }

        if (membresiaRows.length > 0) {
          await connection.execute(
            "UPDATE faccion_miembros SET faccion_id = ?, rango = ? WHERE id = ?",
            [faccionId, rango, Number(membresiaRows[0].id)]
          );
        } else {
          await connection.execute(
            "INSERT INTO faccion_miembros (faccion_id, discord_id, slot_number, rango) VALUES (?, ?, ?, ?)",
            [faccionId, objetivoDiscordId, objetivoSlot, rango]
          );
        }

        await connection.commit();

        await registrarLogAdmin(
          connection,
          decoded.discordId,
          `Agrego miembro ${stateid} a faccion ${faccionRows[0].nombre}`,
          objetivoDiscordId,
          `Faccion ID: ${faccionId} · Rango: ${rango}`
        );

        return res.status(200).json({ ok: true, faccion: faccionRows[0].nombre, rango });
      } catch (err) {
        await connection.rollback();
        throw err;
      }
    }

    if (accion === "quitar_miembro_faccion") {
      const stateid = sanitizar(String(body.stateid || "")).trim();
      if (!stateid) return res.status(400).json({ error: "stateid requerido" });

      const [userRows] = await connection.execute(
        "SELECT discord_id, slot_number FROM usuarios WHERE stateid = ? LIMIT 1",
        [stateid]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const objetivoDiscordId = String(userRows[0].discord_id || "");
      const objetivoSlot = Number(userRows[0].slot_number || 1);

      const [result] = await connection.execute(
        "DELETE FROM faccion_miembros WHERE discord_id = ? AND slot_number = ?",
        [objetivoDiscordId, objetivoSlot]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "El usuario no pertenece a ninguna faccion" });
      }

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `Quito miembro ${stateid} de faccion`,
        objetivoDiscordId,
        "Expulsion manual desde panel admin"
      );

      return res.status(200).json({ ok: true });
    }

    // Asignar nivel VIP //
    if (accion === "asignar_vip") {
      const { stateid, nivel } = body;
      const stateidSanitizado = sanitizar(String(stateid || "")).trim();
      const nivelSanitizado = sanitizar(String(nivel || "")).trim();

      if (!stateidSanitizado || !nivelSanitizado) {
        return res.status(400).json({ error: "stateid y nivel requeridos" });
      }

      if (nivelSanitizado.toLowerCase() === "ninguno") {
        return res.status(400).json({ error: "No puedes asignar el nivel base 'ninguno'" });
      }

      const [vipRows] = await connection.execute(
        "SELECT id FROM niveles_vip WHERE nombre = ? LIMIT 1",
        [nivelSanitizado]
      );

      if (vipRows.length === 0) {
        return res.status(404).json({ error: "Nivel VIP no encontrado" });
      }

      await connection.beginTransaction();

      const [userRows] = await connection.execute(
        "SELECT id, nivel_vip FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
        [stateidSanitizado]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const actuales = parseVipStack(userRows[0].nivel_vip);
      const yaExiste = actuales.some((vip) => vip.toLowerCase() === nivelSanitizado.toLowerCase());

      if (yaExiste) {
        await connection.rollback();
        return res.status(400).json({ error: "El usuario ya tiene asignado ese VIP" });
      }

      if (actuales.length >= 10) {
        await connection.rollback();
        return res.status(400).json({ error: "El usuario ya tiene el maximo de 10 VIPs" });
      }

      const nuevos = [...actuales, nivelSanitizado];
      await connection.execute(
        "UPDATE usuarios SET nivel_vip = ? WHERE id = ?",
        [serializeVipStack(nuevos), userRows[0].id]
      );

      await connection.commit();

      await registrarLogAdmin(connection, decoded.discordId, `Asigno VIP "${nivelSanitizado}" a ${stateidSanitizado}`, null, `Stack: ${nuevos.join(", ")}`);
      return res.status(200).json({ ok: true, nivel_vip: serializeVipStack(nuevos), total_vips: nuevos.length });
    }

    if (accion === "quitar_vip") {
      const { stateid, nivel } = body;
      const stateidSanitizado = sanitizar(String(stateid || "")).trim();
      const nivelSanitizado = sanitizar(String(nivel || "")).trim();

      if (!stateidSanitizado) return res.status(400).json({ error: "stateid requerido" });

      await connection.beginTransaction();

      const [userRows] = await connection.execute(
        "SELECT id, nivel_vip FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
        [stateidSanitizado]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const actuales = parseVipStack(userRows[0].nivel_vip);
      let nuevos = [];
      let detalle = "Nivel VIP restablecido a ninguno";

      if (nivelSanitizado) {
        nuevos = actuales.filter((vip) => vip.toLowerCase() !== nivelSanitizado.toLowerCase());
        if (nuevos.length === actuales.length) {
          await connection.rollback();
          return res.status(400).json({ error: "Ese VIP no esta asignado al usuario" });
        }
        detalle = nuevos.length > 0
          ? `Stack restante: ${nuevos.join(", ")}`
          : "Sin VIPs restantes";
      }

      await connection.execute(
        "UPDATE usuarios SET nivel_vip = ? WHERE id = ?",
        [serializeVipStack(nivelSanitizado ? nuevos : []), userRows[0].id]
      );

      await connection.commit();

      const accionLog = nivelSanitizado
        ? `Quito VIP "${nivelSanitizado}" de ${stateidSanitizado}`
        : `Quito VIP de ${stateidSanitizado}`;
      await registrarLogAdmin(connection, decoded.discordId, accionLog, null, detalle);
      return res.status(200).json({ ok: true, nivel_vip: serializeVipStack(nivelSanitizado ? nuevos : []), total_vips: nivelSanitizado ? nuevos.length : 0 });
    }

    if (accion === "eliminar_personaje") {
      const stateid = sanitizar(String(body.stateid || "")).trim();
      const personajeId = Number(body.personaje_id);

      if (!stateid && !personajeId) {
        return res.status(400).json({ error: "Debes enviar stateid o personaje_id" });
      }

      await connection.beginTransaction();

      let rows;
      if (personajeId) {
        [rows] = await connection.execute(
          "SELECT id, discord_id, slot_number, stateid, nombre FROM usuarios WHERE id = ? LIMIT 1 FOR UPDATE",
          [personajeId]
        );
      } else {
        [rows] = await connection.execute(
          "SELECT id, discord_id, slot_number, stateid, nombre FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
          [stateid]
        );
      }

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const personaje = rows[0];

      await connection.execute(
        "DELETE FROM inventario WHERE discord_id = ? AND slot_number = ?",
        [personaje.discord_id, Number(personaje.slot_number)]
      );

      await connection.execute(
        "DELETE FROM recompensas_diarias WHERE discord_id = ? AND slot_number = ?",
        [personaje.discord_id, Number(personaje.slot_number)]
      );

      await connection.execute(
        "DELETE FROM crypto_billeteras WHERE discord_id = ? AND slot_number = ?",
        [personaje.discord_id, Number(personaje.slot_number)]
      );

      await connection.execute(
        "DELETE FROM crypto_movimientos WHERE discord_id = ? AND slot_number = ?",
        [personaje.discord_id, Number(personaje.slot_number)]
      );

      await connection.execute(
        "DELETE FROM casino_jugadas WHERE discord_id = ? AND slot_number = ?",
        [personaje.discord_id, Number(personaje.slot_number)]
      );

      await connection.execute(
        "DELETE FROM multas WHERE stateid_infractor = ? OR stateid_oficial = ?",
        [personaje.stateid, personaje.stateid]
      );

      await connection.execute(
        "DELETE FROM cargos_judiciales WHERE stateid_acusado = ? OR stateid_oficial = ?",
        [personaje.stateid, personaje.stateid]
      );

      await connection.execute(
        "DELETE FROM vehiculos_registrados WHERE stateid_propietario = ?",
        [personaje.stateid]
      );

      await connection.execute("DELETE FROM usuarios WHERE id = ?", [personaje.id]);

      await connection.commit();

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `Elimino personaje ${personaje.stateid}`,
        personaje.discord_id,
        `Nombre: ${personaje.nombre} · Slot: ${personaje.slot_number}`
      );

      return res.status(200).json({ ok: true });
    }

    if (accion === "eliminar_perfil") {
      const discordIdObjetivo = sanitizar(String(body.discord_id || "")).trim();
      if (!discordIdObjetivo) {
        return res.status(400).json({ error: "discord_id requerido" });
      }

      await connection.beginTransaction();

      const [personajesRows] = await connection.execute(
        "SELECT id, stateid, slot_number, nombre FROM usuarios WHERE discord_id = ? FOR UPDATE",
        [discordIdObjetivo]
      );

      await connection.execute("DELETE FROM inventario WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM recompensas_diarias WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM crypto_billeteras WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM crypto_movimientos WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM casino_jugadas WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM casino_accesos WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM user_character_slots WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM admins WHERE discord_id = ?", [discordIdObjetivo]);

      const stateids = personajesRows.map((p) => String(p.stateid || "")).filter(Boolean);
      if (stateids.length > 0) {
        const placeholders = stateids.map(() => "?").join(",");
        await connection.execute(
          `DELETE FROM multas WHERE stateid_infractor IN (${placeholders}) OR stateid_oficial IN (${placeholders})`,
          [...stateids, ...stateids]
        );
        await connection.execute(
          `DELETE FROM cargos_judiciales WHERE stateid_acusado IN (${placeholders}) OR stateid_oficial IN (${placeholders})`,
          [...stateids, ...stateids]
        );
        await connection.execute(
          `DELETE FROM vehiculos_registrados WHERE stateid_propietario IN (${placeholders})`,
          stateids
        );
      }

      await connection.execute("DELETE FROM usuarios WHERE discord_id = ?", [discordIdObjetivo]);
      await connection.execute("DELETE FROM users WHERE discord_id = ?", [discordIdObjetivo]);

      await connection.commit();

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `Elimino perfil completo ${discordIdObjetivo}`,
        discordIdObjetivo,
        `Personajes eliminados: ${personajesRows.length}`
      );

      return res.status(200).json({ ok: true, personajesEliminados: personajesRows.length });
    }

    if (accion === "ajustar_stock_vehiculo") {
      const vehiculoId = Number(body.vehiculo_id);
      const delta = Math.floor(Number(body.delta));

      if (!vehiculoId || !delta) {
        return res.status(400).json({ error: "vehiculo_id y delta requeridos" });
      }

      const [rows] = await connection.execute(
        "SELECT stock_global, nombre FROM vehiculos_tienda WHERE id_vehiculo = ? LIMIT 1",
        [vehiculoId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Vehiculo no encontrado" });
      }

      const actual = Number(rows[0].stock_global || 0);
      const nuevo = Math.max(0, actual + delta);

      await connection.execute(
        "UPDATE vehiculos_tienda SET stock_global = ? WHERE id_vehiculo = ?",
        [nuevo, vehiculoId]
      );

      await registrarLogAdmin(connection, decoded.discordId, `Ajusto stock vehiculo ${vehiculoId}`, null, `${rows[0].nombre}: ${actual} -> ${nuevo}`);
      return res.status(200).json({ ok: true, stock: nuevo });
    }

    if (accion === "ajustar_stock_item") {
      const itemId = Number(body.item_id);
      const delta = Math.floor(Number(body.delta));

      if (!itemId || !delta) {
        return res.status(400).json({ error: "item_id y delta requeridos" });
      }

      const [rows] = await connection.execute(
        "SELECT stock_global, nombre, tipo FROM mercado_items WHERE id_item = ? LIMIT 1",
        [itemId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      const actual = Number(rows[0].stock_global || 0);
      const nuevo = Math.max(0, actual + delta);

      await connection.execute(
        "UPDATE mercado_items SET stock_global = ? WHERE id_item = ?",
        [nuevo, itemId]
      );

      await registrarLogAdmin(connection, decoded.discordId, `Ajusto stock item ${itemId}`, null, `${rows[0].tipo}/${rows[0].nombre}: ${actual} -> ${nuevo}`);
      return res.status(200).json({ ok: true, stock: nuevo });
    }

    // Agregar admin //
    if (accion === "agregar_admin") {
      const { discord_id } = body;
      if (!discord_id) return res.status(400).json({ error: "discord_id requerido" });

      try {
        await connection.execute(
          "INSERT INTO admins (discord_id, agregado_por) VALUES (?, ?)",
          [sanitizar(discord_id), decoded.discordId]
        );
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Ya es administrador" });
        }
        throw err;
      }

      await registrarLogAdmin(connection, decoded.discordId, `Agrego admin ${discord_id}`);
      return res.status(200).json({ ok: true });
    }

    // Eliminar admin //
    if (accion === "eliminar_admin") {
      const { discord_id } = body;
      if (!discord_id) return res.status(400).json({ error: "discord_id requerido" });

      if (discord_id === decoded.discordId) {
        return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
      }

      await connection.execute("DELETE FROM admins WHERE discord_id = ?", [sanitizar(discord_id)]);
      await registrarLogAdmin(connection, decoded.discordId, `Elimino admin ${discord_id}`);
      return res.status(200).json({ ok: true });
    }

    // Crear profesion //
    if (accion === "crear_profesion") {
      const { nombre, descripcion, salario_diario } = body;
      if (!nombre) return res.status(400).json({ error: "Nombre de profesion requerido" });

      try {
        await connection.execute(
          "INSERT INTO profesiones (nombre, descripcion, salario_diario) VALUES (?, ?, ?)",
          [sanitizar(nombre), sanitizar(descripcion || ""), Math.floor(Number(salario_diario) || 0)]
        );
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Esa profesion ya existe" });
        }
        throw err;
      }

      await registrarLogAdmin(connection, decoded.discordId, `Creo profesion "${nombre}"`);
      return res.status(200).json({ ok: true });
    }

    // Eliminar profesion //
    if (accion === "eliminar_profesion") {
      const { id } = body;
      if (!id) return res.status(400).json({ error: "ID de profesion requerido" });

      await connection.execute("DELETE FROM profesiones WHERE id = ?", [Number(id)]);
      await registrarLogAdmin(connection, decoded.discordId, `Elimino profesion ID ${id}`);
      return res.status(200).json({ ok: true });
    }

    // Modificar nivel VIP //
    if (accion === "modificar_vip") {
      const { id, nombre, recompensa_diaria } = body;

      if (id) {
        await connection.execute(
          "UPDATE niveles_vip SET nombre = ?, recompensa_diaria = ? WHERE id = ?",
          [sanitizar(nombre), Math.floor(Number(recompensa_diaria) || 0), Number(id)]
        );
      } else {
        try {
          await connection.execute(
            "INSERT INTO niveles_vip (nombre, recompensa_diaria) VALUES (?, ?)",
            [sanitizar(nombre), Math.floor(Number(recompensa_diaria) || 0)]
          );
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Ese nivel VIP ya existe" });
          }
          throw err;
        }
      }

      await registrarLogAdmin(connection, decoded.discordId, `Modifico VIP "${nombre}"`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "eliminar_vip") {
      const { id, nombre } = body;

      let vipNombre = sanitizar(String(nombre || "")).trim();

      if (!vipNombre && id) {
        const [vipRows] = await connection.execute(
          "SELECT nombre FROM niveles_vip WHERE id = ? LIMIT 1",
          [Number(id)]
        );
        if (vipRows.length > 0) {
          vipNombre = String(vipRows[0].nombre || "").trim();
        }
      }

      if (!vipNombre) {
        return res.status(400).json({ error: "Nivel VIP invalido" });
      }

      if (vipNombre.toLowerCase() === "ninguno") {
        return res.status(400).json({ error: "No puedes eliminar el nivel base 'ninguno'" });
      }

      await connection.beginTransaction();

      const [usuariosRows] = await connection.execute(
        "SELECT id, nivel_vip FROM usuarios WHERE nivel_vip IS NOT NULL AND nivel_vip <> 'ninguno' FOR UPDATE"
      );

      let usuariosAfectados = 0;
      for (const usuario of usuariosRows) {
        const stackActual = parseVipStack(usuario.nivel_vip);
        const stackNuevo = stackActual.filter((vip) => vip.toLowerCase() !== vipNombre.toLowerCase());

        if (stackNuevo.length === stackActual.length) {
          continue;
        }

        await connection.execute(
          "UPDATE usuarios SET nivel_vip = ? WHERE id = ?",
          [serializeVipStack(stackNuevo), usuario.id]
        );
        usuariosAfectados += 1;
      }

      const [result] = await connection.execute(
        "DELETE FROM niveles_vip WHERE nombre = ?",
        [vipNombre]
      );

      await connection.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Nivel VIP no encontrado" });
      }

      await registrarLogAdmin(connection, decoded.discordId, `Elimino VIP \"${vipNombre}\"`, null, `Usuarios afectados: ${usuariosAfectados}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "agregar_item_usuario") {
      const { stateid, tipo, nombre } = body;
      const tipoItem = sanitizar(String(tipo || "")).toLowerCase();
      const nombreItem = sanitizar(String(nombre || "")).trim();

      if (!stateid || !nombreItem) {
        return res.status(400).json({ error: "stateid y nombre requeridos" });
      }

      if (!["vehiculo", "arma"].includes(tipoItem)) {
        return res.status(400).json({ error: "tipo invalido. Usa vehiculo o arma" });
      }

      const [userRows] = await connection.execute(
        "SELECT discord_id, slot_number FROM usuarios WHERE stateid = ? LIMIT 1",
        [sanitizar(stateid)]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      await connection.execute(
        "INSERT INTO inventario (discord_id, slot_number, nombre_item, tipo, datos_extra) VALUES (?, ?, ?, ?, ?)",
        [
          userRows[0].discord_id,
          Number(userRows[0].slot_number),
          nombreItem,
          tipoItem,
          JSON.stringify({ origen: "panel_admin" }),
        ]
      );

      await registrarLogAdmin(connection, decoded.discordId, `Agrego ${tipoItem} a ${stateid}`, userRows[0].discord_id, `Item: ${nombreItem}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "quitar_item_usuario") {
      const { stateid, tipo, nombre, item_id } = body;
      const tipoItem = sanitizar(String(tipo || "")).toLowerCase();
      const nombreItem = sanitizar(String(nombre || "")).trim();

      if (!stateid) {
        return res.status(400).json({ error: "stateid requerido" });
      }

      const [userRows] = await connection.execute(
        "SELECT discord_id, slot_number FROM usuarios WHERE stateid = ? LIMIT 1",
        [sanitizar(stateid)]
      );

      if (userRows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      let result;
      if (item_id) {
        [result] = await connection.execute(
          "DELETE FROM inventario WHERE id = ? AND discord_id = ? AND slot_number = ? LIMIT 1",
          [Number(item_id), userRows[0].discord_id, Number(userRows[0].slot_number)]
        );
      } else {
        if (!["vehiculo", "arma"].includes(tipoItem) || !nombreItem) {
          return res.status(400).json({ error: "Debes enviar item_id o tipo + nombre" });
        }

        [result] = await connection.execute(
          `DELETE FROM inventario
           WHERE discord_id = ? AND slot_number = ? AND tipo = ? AND nombre_item = ?
           ORDER BY id DESC
           LIMIT 1`,
          [userRows[0].discord_id, Number(userRows[0].slot_number), tipoItem, nombreItem]
        );
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      await registrarLogAdmin(connection, decoded.discordId, `Quito item de ${stateid}`, userRows[0].discord_id, `Tipo: ${tipoItem || "por_id"} · Nombre: ${nombreItem || "-"} · ItemID: ${item_id || "-"}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "agregar_multa_admin") {
      const { stateid, motivo, monto } = body;
      const montoNum = Math.floor(Number(monto));
      const motivoTexto = sanitizar(String(motivo || "")).trim();

      if (!stateid || !motivoTexto || !montoNum || montoNum <= 0) {
        return res.status(400).json({ error: "stateid, motivo y monto validos son requeridos" });
      }

      const [targetRows] = await connection.execute(
        "SELECT discord_id, stateid FROM usuarios WHERE stateid = ? LIMIT 1",
        [sanitizar(stateid)]
      );

      if (targetRows.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      await connection.execute(
        "INSERT INTO multas (stateid_infractor, stateid_oficial, motivo, monto) VALUES (?, NULL, ?, ?)",
        [sanitizar(stateid), motivoTexto, montoNum]
      );

      await registrarLogAdmin(connection, decoded.discordId, `Agrego multa a ${stateid}`, targetRows[0].discord_id, `${motivoTexto} - $${montoNum}`);
      return res.status(200).json({ ok: true });
    }

    if (accion === "quitar_multa_admin") {
      const { multa_id } = body;
      const multaIdNum = Number(multa_id);
      if (!multaIdNum) {
        return res.status(400).json({ error: "multa_id requerido" });
      }

      const [multaRows] = await connection.execute(
        "SELECT stateid_infractor FROM multas WHERE id = ? LIMIT 1",
        [multaIdNum]
      );

      if (multaRows.length === 0) {
        return res.status(404).json({ error: "Multa no encontrada" });
      }

      const [userRows] = await connection.execute(
        "SELECT discord_id FROM usuarios WHERE stateid = ? LIMIT 1",
        [String(multaRows[0].stateid_infractor || "")]
      );

      await connection.execute("DELETE FROM multas WHERE id = ?", [multaIdNum]);

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `Elimino multa ID ${multaIdNum}`,
        userRows.length > 0 ? userRows[0].discord_id : null,
        `Infractor StateID: ${multaRows[0].stateid_infractor}`
      );

      return res.status(200).json({ ok: true });
    }

    if (accion === "quitar_cargo_admin") {
      const { cargo_id } = body;
      const cargoIdNum = Number(cargo_id);
      if (!cargoIdNum) {
        return res.status(400).json({ error: "cargo_id requerido" });
      }

      const [cargoRows] = await connection.execute(
        "SELECT stateid_acusado, cargo, gravedad FROM cargos_judiciales WHERE id = ? LIMIT 1",
        [cargoIdNum]
      );

      if (cargoRows.length === 0) {
        return res.status(404).json({ error: "Cargo no encontrado" });
      }

      const [userRows] = await connection.execute(
        "SELECT discord_id FROM usuarios WHERE stateid = ? LIMIT 1",
        [String(cargoRows[0].stateid_acusado || "")]
      );

      await connection.execute("DELETE FROM cargos_judiciales WHERE id = ?", [cargoIdNum]);

      await registrarLogAdmin(
        connection,
        decoded.discordId,
        `Elimino cargo judicial ID ${cargoIdNum}`,
        userRows.length > 0 ? userRows[0].discord_id : null,
        `Acusado StateID: ${cargoRows[0].stateid_acusado} · Cargo: ${cargoRows[0].cargo} · Gravedad: ${cargoRows[0].gravedad}`
      );

      return res.status(200).json({ ok: true });
    }

    // ═══════════ CRUD TIENDA DINAMICA ═══════════ //

    // Crear vehiculo en tienda //
    if (accion === "crear_vehiculo_tienda") {
      const nombre = sanitizar(String(body.nombre || "")).trim();
      const precio = Math.floor(Number(body.precio));
      const stock = Math.max(0, Math.floor(Number(body.stock || 0)));
      const imagen = String(body.imagen || "").trim();
      const categoria = sanitizar(String(body.categoria || "standard")).toLowerCase().trim();

      if (!nombre || !precio || precio <= 0) {
        return res.status(400).json({ error: "nombre y precio validos son requeridos" });
      }

      const hayCategoria = await tieneCategoriaVehiculo(connection);
      const [result] = await connection.execute(
        hayCategoria
          ? `INSERT INTO vehiculos_tienda (nombre, precio_actual, stock_global, imagen_url, categoria)
             VALUES (?, ?, ?, ?, ?)`
          : `INSERT INTO vehiculos_tienda (nombre, precio_actual, stock_global, imagen_url)
             VALUES (?, ?, ?, ?)`,
        hayCategoria
          ? [nombre, precio, stock, imagen, categoria]
          : [nombre, precio, stock, imagen]
      );

      await registrarLogAdmin(connection, decoded.discordId, `Creo vehiculo tienda "${nombre}"`, null, `Precio: $${precio} · Stock: ${stock}`);
      return res.status(200).json({ ok: true, id: result.insertId });
    }

    // Editar vehiculo en tienda //
    if (accion === "editar_vehiculo_tienda") {
      const vehiculoId = Number(body.vehiculo_id);
      if (!vehiculoId) return res.status(400).json({ error: "vehiculo_id requerido" });

      const nombre = sanitizar(String(body.nombre || "")).trim();
      const precio = Math.floor(Number(body.precio));
      const stock = Math.max(0, Math.floor(Number(body.stock)));
      const imagen = String(body.imagen || "").trim();
      const categoria = sanitizar(String(body.categoria || "")).toLowerCase().trim();

      if (!nombre || !precio || precio <= 0) {
        return res.status(400).json({ error: "nombre y precio validos son requeridos" });
      }

      const hayCategoria = await tieneCategoriaVehiculo(connection);
      const [result] = await connection.execute(
        hayCategoria
          ? `UPDATE vehiculos_tienda SET nombre = ?, precio_actual = ?, stock_global = ?, imagen_url = ?, categoria = ?
             WHERE id_vehiculo = ?`
          : `UPDATE vehiculos_tienda SET nombre = ?, precio_actual = ?, stock_global = ?, imagen_url = ?
             WHERE id_vehiculo = ?`,
        hayCategoria
          ? [nombre, precio, stock, imagen, categoria || "standard", vehiculoId]
          : [nombre, precio, stock, imagen, vehiculoId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Vehiculo no encontrado" });
      }

      await registrarLogAdmin(connection, decoded.discordId, `Edito vehiculo tienda ID ${vehiculoId}`, null, `${nombre} · $${precio} · Stock: ${stock}`);
      return res.status(200).json({ ok: true });
    }

    // Eliminar vehiculo de tienda //
    if (accion === "eliminar_vehiculo_tienda") {
      const vehiculoId = Number(body.vehiculo_id);
      if (!vehiculoId) return res.status(400).json({ error: "vehiculo_id requerido" });

      const [rows] = await connection.execute(
        "SELECT nombre FROM vehiculos_tienda WHERE id_vehiculo = ? LIMIT 1",
        [vehiculoId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Vehiculo no encontrado" });
      }

      await connection.execute("DELETE FROM vehiculos_tienda WHERE id_vehiculo = ?", [vehiculoId]);
      await registrarLogAdmin(connection, decoded.discordId, `Elimino vehiculo tienda ID ${vehiculoId}`, null, `Nombre: ${rows[0].nombre}`);
      return res.status(200).json({ ok: true });
    }

    // Crear item en tienda (documento/arma) //
    if (accion === "crear_item_tienda") {
      const tipo = sanitizar(String(body.tipo || "")).toLowerCase().trim();
      const nombre = sanitizar(String(body.nombre || "")).trim();
      const precio = Math.floor(Number(body.precio));
      const stock = Math.max(0, Math.floor(Number(body.stock || 0)));
      const imagen = String(body.imagen || "").trim();

      if (!["arma", "documento"].includes(tipo)) {
        return res.status(400).json({ error: "tipo debe ser arma o documento" });
      }

      if (!nombre || !precio || precio <= 0) {
        return res.status(400).json({ error: "nombre y precio validos son requeridos" });
      }

      const [result] = await connection.execute(
        `INSERT INTO mercado_items (tipo, nombre, precio_actual, stock_global, imagen_url)
         VALUES (?, ?, ?, ?, ?)`,
        [tipo, nombre, precio, stock, imagen]
      );

      await registrarLogAdmin(connection, decoded.discordId, `Creo item tienda "${nombre}"`, null, `Tipo: ${tipo} · Precio: $${precio} · Stock: ${stock}`);
      return res.status(200).json({ ok: true, id: result.insertId });
    }

    // Editar item de tienda //
    if (accion === "editar_item_tienda") {
      const itemId = Number(body.item_id);
      if (!itemId) return res.status(400).json({ error: "item_id requerido" });

      const tipo = sanitizar(String(body.tipo || "")).toLowerCase().trim();
      const nombre = sanitizar(String(body.nombre || "")).trim();
      const precio = Math.floor(Number(body.precio));
      const stock = Math.max(0, Math.floor(Number(body.stock)));
      const imagen = String(body.imagen || "").trim();

      if (!["arma", "documento"].includes(tipo)) {
        return res.status(400).json({ error: "tipo debe ser arma o documento" });
      }

      if (!nombre || !precio || precio <= 0) {
        return res.status(400).json({ error: "nombre y precio validos son requeridos" });
      }

      const [result] = await connection.execute(
        `UPDATE mercado_items SET tipo = ?, nombre = ?, precio_actual = ?, stock_global = ?, imagen_url = ?
         WHERE id_item = ?`,
        [tipo, nombre, precio, stock, imagen, itemId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      await registrarLogAdmin(connection, decoded.discordId, `Edito item tienda ID ${itemId}`, null, `${tipo}/${nombre} · $${precio} · Stock: ${stock}`);
      return res.status(200).json({ ok: true });
    }

    // Eliminar item de tienda //
    if (accion === "eliminar_item_tienda") {
      const itemId = Number(body.item_id);
      if (!itemId) return res.status(400).json({ error: "item_id requerido" });

      const [rows] = await connection.execute(
        "SELECT nombre, tipo FROM mercado_items WHERE id_item = ? LIMIT 1",
        [itemId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Item no encontrado" });
      }

      await connection.execute("DELETE FROM mercado_items WHERE id_item = ?", [itemId]);
      await registrarLogAdmin(connection, decoded.discordId, `Elimino item tienda ID ${itemId}`, null, `${rows[0].tipo}/${rows[0].nombre}`);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Accion no reconocida" });

  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[ADMIN] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
