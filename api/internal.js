// API PRIVADA UNIFICADA — Router por dominio //
// Consolida personaje, misiones, facciones, leaderboard y mercado en una sola serverless function.
// Vercel free tier permite hasta 12 funciones; esto ahorra 4 slots.
//
// Uso: /api/internal?domain=personaje&action=buscar&discordId=X
//       /api/internal?domain=misiones&action=disponibles&...
//       POST body puede incluir { domain, action, ... }

import { crearConexion, cerrarConexion } from "../lib/api/database.js";
import { aplicarHeaders } from "../lib/api/seguridad.js";
import { verificarOrigenBot } from "../lib/api/auth.js";
import { registrarEvento } from "../lib/api/eventos.js";
import { sanitizar } from "../lib/api/validacion.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return body;
}

export default async function handler(req, res) {
  aplicarHeaders(res);

  const auth = verificarOrigenBot(req);
  if (!auth.ok) return res.status(401).json({ error: auth.error });

  const body = parseBody(req.body);
  const domain = req.query?.domain || body?.domain;
  const action = req.query?.action || body?.action;

  if (!domain) return res.status(400).json({ error: "domain requerido (personaje|misiones|facciones|leaderboard|mercado)" });
  if (!action) return res.status(400).json({ error: "action requerida" });

  let connection;
  try {
    connection = await crearConexion();

    switch (domain) {
      case "personaje":
        return await handlePersonaje(req, res, connection, auth, action, body);
      case "misiones":
        return await handleMisiones(req, res, connection, auth, action, body);
      case "facciones":
        return await handleFacciones(req, res, connection, auth, action, body);
      case "leaderboard":
        return await handleLeaderboard(req, res, connection, auth, action, body);
      case "mercado":
        return await handleMercado(req, res, connection, auth, action, body);
      default:
        return res.status(400).json({ error: `Dominio desconocido: ${domain}` });
    }
  } catch (err) {
    console.error(`[API/INTERNAL/${domain}] Error:`, err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}

// ╔══════════════════════════════════════════════════════════╗
// ║  PERSONAJE                                               ║
// ╚══════════════════════════════════════════════════════════╝
async function handlePersonaje(req, res, connection, auth, action, body) {

  // ─── BUSCAR por Discord ID + slot ───
  if (action === "buscar" && req.method === "GET") {
    const discordId = sanitizar(req.query.discordId || "");
    const slot = parseInt(req.query.slot || "1", 10);
    if (!discordId) return res.status(400).json({ error: "discordId requerido" });

    const [rows] = await connection.execute(
      `SELECT id, discord_id, slot_number, stateid, nombre, edad, genero, nacionalidad,
              rol, dinero, nivel, xp, reputacion, nivel_vip, placa_policial, titulo_activo,
              apariencia, historia, created_at
       FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1`,
      [discordId, slot]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Personaje no encontrado" });
    return res.status(200).json({ ok: true, personaje: rows[0] });
  }

  // ─── BUSCAR por StateID ───
  if (action === "buscar_stateid" && req.method === "GET") {
    const stateid = sanitizar(req.query.stateid || "");
    if (!stateid) return res.status(400).json({ error: "stateid requerido" });

    const [rows] = await connection.execute(
      `SELECT id, discord_id, slot_number, stateid, nombre, edad, genero, nacionalidad,
              rol, dinero, nivel, xp, reputacion, nivel_vip, placa_policial, titulo_activo,
              apariencia, historia, created_at
       FROM usuarios WHERE stateid = ? LIMIT 1`,
      [stateid]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Personaje no encontrado" });
    return res.status(200).json({ ok: true, personaje: rows[0] });
  }

  // ─── LISTAR todos los personajes de un usuario ───
  if (action === "listar" && req.method === "GET") {
    const discordId = sanitizar(req.query.discordId || "");
    if (!discordId) return res.status(400).json({ error: "discordId requerido" });

    const [rows] = await connection.execute(
      `SELECT id, slot_number, stateid, nombre, rol, dinero, nivel, xp, reputacion, nivel_vip, titulo_activo
       FROM usuarios WHERE discord_id = ? ORDER BY slot_number ASC`,
      [discordId]
    );

    return res.status(200).json({ ok: true, personajes: rows });
  }

  // ─── ACTUALIZAR SALDO (atomico) ───
  if (action === "actualizar_saldo" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const monto = parseInt(body.monto, 10);
    const motivo = sanitizar(body.motivo || "ajuste");

    if (!discordId || isNaN(monto)) {
      return res.status(400).json({ error: "discordId y monto requeridos" });
    }

    await connection.beginTransaction();
    try {
      const [rows] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
        [discordId, slot]
      );
      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const nuevoSaldo = rows[0].dinero + monto;
      if (nuevoSaldo < 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = ? WHERE id = ?",
        [nuevoSaldo, rows[0].id]
      );
      await connection.commit();

      await registrarEvento(auth.origen, discordId, "actualizar_saldo", {
        entidadTipo: "usuario",
        entidadId: String(rows[0].id),
        datosAntes: { dinero: rows[0].dinero },
        datosDespues: { dinero: nuevoSaldo, motivo },
      });

      return res.status(200).json({ ok: true, saldoAnterior: rows[0].dinero, nuevoSaldo });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  // ─── TRANSFERIR DINERO (atomico, con FOR UPDATE) ───
  if (action === "transferir" && req.method === "POST") {
    const origenId = sanitizar(body.origenDiscordId || "");
    const origenSlot = parseInt(body.origenSlot || "1", 10);
    const destinoId = sanitizar(body.destinoDiscordId || "");
    const destinoSlot = parseInt(body.destinoSlot || "1", 10);
    const monto = parseInt(body.monto, 10);
    const motivo = sanitizar(body.motivo || "transferencia");

    if (!origenId || !destinoId || isNaN(monto) || monto <= 0) {
      return res.status(400).json({ error: "Datos de transferencia incompletos" });
    }
    if (origenId === destinoId && origenSlot === destinoSlot) {
      return res.status(400).json({ error: "No puedes transferir a ti mismo" });
    }

    await connection.beginTransaction();
    try {
      const lockId1 = origenId < destinoId ? origenId : destinoId;
      const lockSlot1 = origenId < destinoId ? origenSlot : destinoSlot;
      const lockId2 = origenId < destinoId ? destinoId : origenId;
      const lockSlot2 = origenId < destinoId ? destinoSlot : origenSlot;

      await connection.execute(
        "SELECT id FROM usuarios WHERE discord_id = ? AND slot_number = ? FOR UPDATE",
        [lockId1, lockSlot1]
      );
      await connection.execute(
        "SELECT id FROM usuarios WHERE discord_id = ? AND slot_number = ? FOR UPDATE",
        [lockId2, lockSlot2]
      );

      const [origen] = await connection.execute(
        "SELECT id, dinero, nombre FROM usuarios WHERE discord_id = ? AND slot_number = ?",
        [origenId, origenSlot]
      );
      const [destino] = await connection.execute(
        "SELECT id, dinero, nombre FROM usuarios WHERE discord_id = ? AND slot_number = ?",
        [destinoId, destinoSlot]
      );

      if (origen.length === 0 || destino.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje origen o destino no encontrado" });
      }

      if (origen[0].dinero < monto) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente", saldoActual: origen[0].dinero });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [monto, origen[0].id]);
      await connection.execute("UPDATE usuarios SET dinero = dinero + ? WHERE id = ?", [monto, destino[0].id]);
      await connection.commit();

      await registrarEvento(auth.origen, origenId, "transferir_dinero", {
        entidadTipo: "transferencia",
        datosAntes: { origenSaldo: origen[0].dinero, destinoSaldo: destino[0].dinero },
        datosDespues: { origenSaldo: origen[0].dinero - monto, destinoSaldo: destino[0].dinero + monto, monto, motivo },
      });

      return res.status(200).json({
        ok: true,
        origen: { nombre: origen[0].nombre, saldoAnterior: origen[0].dinero, nuevoSaldo: origen[0].dinero - monto },
        destino: { nombre: destino[0].nombre, saldoAnterior: destino[0].dinero, nuevoSaldo: destino[0].dinero + monto },
        monto,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  return res.status(400).json({ error: `Accion desconocida: ${action}` });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  MISIONES                                                ║
// ╚══════════════════════════════════════════════════════════╝
async function handleMisiones(req, res, connection, auth, action, body) {

  // ─── MISIONES DISPONIBLES HOY ───
  if (action === "disponibles" && req.method === "GET") {
    const discordId = sanitizar(req.query.discordId || "");
    const slot = parseInt(req.query.slot || "1", 10);
    if (!discordId) return res.status(400).json({ error: "discordId requerido" });

    const [personaje] = await connection.execute(
      "SELECT rol FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [discordId, slot]
    );
    const profesion = personaje.length > 0 ? personaje[0].rol : null;

    const [misiones] = await connection.execute(
      `SELECT m.*, mp.progreso_actual, mp.completada, mp.recompensa_cobrada
       FROM misiones m
       LEFT JOIN misiones_progreso mp ON mp.mision_id = m.id
         AND mp.discord_id = ? AND mp.slot_number = ? AND mp.fecha_asignada = CURDATE()
       WHERE m.activa = 1
         AND (m.profesion_requerida IS NULL OR m.profesion_requerida = ?)
         AND m.tipo = 'diaria'
       ORDER BY m.id`,
      [discordId, slot, profesion]
    );

    const [semanales] = await connection.execute(
      `SELECT m.*, mp.progreso_actual, mp.completada, mp.recompensa_cobrada
       FROM misiones m
       LEFT JOIN misiones_progreso mp ON mp.mision_id = m.id
         AND mp.discord_id = ? AND mp.slot_number = ?
         AND mp.fecha_asignada = DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
       WHERE m.activa = 1
         AND (m.profesion_requerida IS NULL OR m.profesion_requerida = ?)
         AND m.tipo = 'semanal'
       ORDER BY m.id`,
      [discordId, slot, profesion]
    );

    return res.status(200).json({ ok: true, diarias: misiones, semanales });
  }

  // ─── PROGRESO ACTUAL ───
  if (action === "progreso" && req.method === "GET") {
    const discordId = sanitizar(req.query.discordId || "");
    const slot = parseInt(req.query.slot || "1", 10);
    if (!discordId) return res.status(400).json({ error: "discordId requerido" });

    const [progreso] = await connection.execute(
      `SELECT mp.*, m.nombre, m.descripcion, m.objetivo_cantidad,
              m.recompensa_dinero, m.recompensa_xp, m.recompensa_reputacion
       FROM misiones_progreso mp
       JOIN misiones m ON m.id = mp.mision_id
       WHERE mp.discord_id = ? AND mp.slot_number = ?
         AND (mp.fecha_asignada = CURDATE() OR (m.tipo = 'semanal' AND mp.fecha_asignada >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)))
       ORDER BY mp.completada ASC, mp.created_at DESC`,
      [discordId, slot]
    );

    return res.status(200).json({ ok: true, progreso });
  }

  // ─── AVANZAR PROGRESO DE MISION ───
  if (action === "avanzar" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const misionId = parseInt(body.misionId, 10);
    const cantidad = parseInt(body.cantidad || "1", 10);

    if (!discordId || isNaN(misionId)) {
      return res.status(400).json({ error: "discordId y misionId requeridos" });
    }

    const [mision] = await connection.execute(
      "SELECT * FROM misiones WHERE id = ? AND activa = 1 LIMIT 1",
      [misionId]
    );
    if (mision.length === 0) return res.status(404).json({ error: "Mision no encontrada" });

    const fechaAsignada = mision[0].tipo === "diaria"
      ? new Date().toISOString().slice(0, 10)
      : (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); })();

    await connection.execute(
      `INSERT INTO misiones_progreso (discord_id, slot_number, mision_id, progreso_actual, fecha_asignada)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE progreso_actual = LEAST(progreso_actual + ?, ?)`,
      [discordId, slot, misionId, cantidad, fechaAsignada, cantidad, mision[0].objetivo_cantidad]
    );

    const [mp] = await connection.execute(
      `SELECT * FROM misiones_progreso
       WHERE discord_id = ? AND slot_number = ? AND mision_id = ? AND fecha_asignada = ?`,
      [discordId, slot, misionId, fechaAsignada]
    );

    let completada = false;
    if (mp.length > 0 && mp[0].progreso_actual >= mision[0].objetivo_cantidad && !mp[0].completada) {
      await connection.execute(
        "UPDATE misiones_progreso SET completada = 1, fecha_completada = NOW() WHERE id = ?",
        [mp[0].id]
      );
      completada = true;
    }

    return res.status(200).json({
      ok: true,
      progreso: mp[0]?.progreso_actual || cantidad,
      objetivo: mision[0].objetivo_cantidad,
      completada,
      nombre: mision[0].nombre,
    });
  }

  // ─── COBRAR RECOMPENSA DE MISION ───
  if (action === "cobrar" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const misionId = parseInt(body.misionId, 10);

    if (!discordId || isNaN(misionId)) {
      return res.status(400).json({ error: "discordId y misionId requeridos" });
    }

    await connection.beginTransaction();
    try {
      const [mp] = await connection.execute(
        `SELECT mp.*, m.recompensa_dinero, m.recompensa_xp, m.recompensa_reputacion, m.nombre
         FROM misiones_progreso mp
         JOIN misiones m ON m.id = mp.mision_id
         WHERE mp.discord_id = ? AND mp.slot_number = ? AND mp.mision_id = ?
           AND mp.completada = 1 AND mp.recompensa_cobrada = 0
         LIMIT 1 FOR UPDATE`,
        [discordId, slot, misionId]
      );

      if (mp.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Mision no completada o ya cobrada" });
      }

      await connection.execute(
        `UPDATE usuarios SET
          dinero = dinero + ?,
          xp = xp + ?,
          reputacion = reputacion + ?
         WHERE discord_id = ? AND slot_number = ?`,
        [mp[0].recompensa_dinero, mp[0].recompensa_xp, mp[0].recompensa_reputacion, discordId, slot]
      );

      await connection.execute(
        "UPDATE misiones_progreso SET recompensa_cobrada = 1 WHERE id = ?",
        [mp[0].id]
      );

      await connection.commit();

      await registrarEvento(auth.origen, discordId, "cobrar_mision", {
        entidadTipo: "mision",
        entidadId: String(misionId),
        datosDespues: {
          dinero: mp[0].recompensa_dinero,
          xp: mp[0].recompensa_xp,
          reputacion: mp[0].recompensa_reputacion,
        },
      });

      return res.status(200).json({
        ok: true,
        mision: mp[0].nombre,
        recompensas: {
          dinero: mp[0].recompensa_dinero,
          xp: mp[0].recompensa_xp,
          reputacion: mp[0].recompensa_reputacion,
        },
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  return res.status(400).json({ error: `Accion desconocida: ${action}` });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  FACCIONES                                               ║
// ╚══════════════════════════════════════════════════════════╝
async function handleFacciones(req, res, connection, auth, action, body) {

  // ─── LISTAR FACCIONES ───
  if (action === "listar" && req.method === "GET") {
    const [facciones] = await connection.execute(
      `SELECT f.*, COUNT(fm.id) AS total_miembros
       FROM facciones f
       LEFT JOIN faccion_miembros fm ON fm.faccion_id = f.id
       WHERE f.activa = 1
       GROUP BY f.id
       ORDER BY f.reputacion_global DESC`
    );
    return res.status(200).json({ ok: true, facciones });
  }

  // ─── DETALLE DE FACCION ───
  if (action === "detalle" && req.method === "GET") {
    const faccionId = parseInt(req.query.faccionId, 10);
    if (isNaN(faccionId)) return res.status(400).json({ error: "faccionId requerido" });

    const [faccion] = await connection.execute(
      "SELECT * FROM facciones WHERE id = ? LIMIT 1",
      [faccionId]
    );
    if (faccion.length === 0) return res.status(404).json({ error: "Faccion no encontrada" });

    const [miembros] = await connection.execute(
      `SELECT fm.*, u.nombre, u.stateid, u.nivel, u.rol
       FROM faccion_miembros fm
       JOIN usuarios u ON u.discord_id = fm.discord_id AND u.slot_number = fm.slot_number
       WHERE fm.faccion_id = ?
       ORDER BY FIELD(fm.rango, 'lider', 'oficial', 'miembro', 'recluta'), fm.contribucion_total DESC`,
      [faccionId]
    );

    const [objetivos] = await connection.execute(
      "SELECT * FROM faccion_objetivos WHERE faccion_id = ? AND completado = 0 ORDER BY id",
      [faccionId]
    );

    return res.status(200).json({ ok: true, faccion: faccion[0], miembros, objetivos });
  }

  // ─── MI FACCION ───
  if (action === "mi_faccion" && req.method === "GET") {
    const discordId = sanitizar(req.query.discordId || "");
    const slot = parseInt(req.query.slot || "1", 10);
    if (!discordId) return res.status(400).json({ error: "discordId requerido" });

    const [miembro] = await connection.execute(
      `SELECT fm.*, f.nombre AS faccion_nombre, f.color, f.nivel AS faccion_nivel,
              f.fondos, f.reputacion_global
       FROM faccion_miembros fm
       JOIN facciones f ON f.id = fm.faccion_id
       WHERE fm.discord_id = ? AND fm.slot_number = ?
       LIMIT 1`,
      [discordId, slot]
    );

    if (miembro.length === 0) {
      return res.status(200).json({ ok: true, enFaccion: false });
    }

    return res.status(200).json({ ok: true, enFaccion: true, membresia: miembro[0] });
  }

  // ─── UNIRSE A FACCION ───
  if (action === "unirse" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const faccionId = parseInt(body.faccionId, 10);
    const aprobacionExamen = body.aprobacionExamen === true;

    if (!discordId || isNaN(faccionId)) {
      return res.status(400).json({ error: "discordId y faccionId requeridos" });
    }

    if (!aprobacionExamen) {
      return res.status(403).json({ error: "No puedes unirte directamente. Debes aprobar el examen y ser agregado por un administrador." });
    }

    if (auth.origen !== "web" || !auth?.usuario?.discordId) {
      return res.status(403).json({ error: "Solo un administrador puede aprobar ingresos a facciones." });
    }

    const [adminRows] = await connection.execute(
      "SELECT id FROM admins WHERE discord_id = ? LIMIT 1",
      [String(auth.usuario.discordId)]
    );
    if (adminRows.length === 0) {
      return res.status(403).json({ error: "No tienes permisos para aprobar examenes de faccion." });
    }

    const [ya] = await connection.execute(
      "SELECT id FROM faccion_miembros WHERE discord_id = ? AND slot_number = ?",
      [discordId, slot]
    );
    if (ya.length > 0) return res.status(400).json({ error: "Ya perteneces a una faccion" });

    const [faccion] = await connection.execute(
      "SELECT id, max_miembros, nombre FROM facciones WHERE id = ? AND activa = 1 LIMIT 1",
      [faccionId]
    );
    if (faccion.length === 0) return res.status(404).json({ error: "Faccion no encontrada" });

    const [count] = await connection.execute(
      "SELECT COUNT(*) as total FROM faccion_miembros WHERE faccion_id = ?",
      [faccionId]
    );
    if (count[0].total >= faccion[0].max_miembros) {
      return res.status(400).json({ error: "La faccion esta llena" });
    }

    await connection.execute(
      "INSERT INTO faccion_miembros (faccion_id, discord_id, slot_number, rango) VALUES (?, ?, ?, 'recluta')",
      [faccionId, discordId, slot]
    );

    await registrarEvento(auth.origen, discordId, "unirse_faccion", {
      entidadTipo: "faccion",
      entidadId: String(faccionId),
      datosDespues: { faccion: faccion[0].nombre },
    });

    return res.status(200).json({ ok: true, faccion: faccion[0].nombre, rango: "recluta" });
  }

  // ─── SALIR DE FACCION ───
  if (action === "salir" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);

    const [result] = await connection.execute(
      "DELETE FROM faccion_miembros WHERE discord_id = ? AND slot_number = ?",
      [discordId, slot]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "No perteneces a ninguna faccion" });
    }

    await registrarEvento(auth.origen, discordId, "salir_faccion", {
      entidadTipo: "faccion",
    });

    return res.status(200).json({ ok: true, mensaje: "Has salido de la faccion" });
  }

  // ─── DEPOSITAR FONDOS A FACCION ───
  if (action === "depositar" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const monto = parseInt(body.monto, 10);

    if (!discordId || isNaN(monto) || monto <= 0) {
      return res.status(400).json({ error: "discordId y monto positivo requeridos" });
    }

    await connection.beginTransaction();
    try {
      const [miembro] = await connection.execute(
        "SELECT fm.faccion_id FROM faccion_miembros fm WHERE fm.discord_id = ? AND fm.slot_number = ?",
        [discordId, slot]
      );
      if (miembro.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "No perteneces a ninguna faccion" });
      }

      const [persona] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
        [discordId, slot]
      );
      if (persona.length === 0 || persona[0].dinero < monto) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [monto, persona[0].id]);
      await connection.execute("UPDATE facciones SET fondos = fondos + ? WHERE id = ?", [monto, miembro[0].faccion_id]);
      await connection.execute(
        "UPDATE faccion_miembros SET contribucion_total = contribucion_total + ? WHERE discord_id = ? AND slot_number = ?",
        [monto, discordId, slot]
      );

      await connection.commit();

      await registrarEvento(auth.origen, discordId, "depositar_faccion", {
        entidadTipo: "faccion",
        entidadId: String(miembro[0].faccion_id),
        datosDespues: { monto },
      });

      return res.status(200).json({ ok: true, monto, nuevoSaldo: persona[0].dinero - monto });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  // ─── PROMOVER MIEMBRO ───
  if (action === "promover" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const targetDiscordId = sanitizar(body.targetDiscordId || "");
    const targetSlot = parseInt(body.targetSlot || "1", 10);
    const nuevoRango = body.nuevoRango;

    const rangosValidos = ["oficial", "miembro", "recluta"];
    if (!rangosValidos.includes(nuevoRango)) {
      return res.status(400).json({ error: "Rango invalido" });
    }

    const [actor] = await connection.execute(
      "SELECT faccion_id, rango FROM faccion_miembros WHERE discord_id = ? AND slot_number = ?",
      [discordId, slot]
    );
    if (actor.length === 0 || !["lider", "oficial"].includes(actor[0].rango)) {
      return res.status(403).json({ error: "No tienes permisos para promover" });
    }

    const [result] = await connection.execute(
      "UPDATE faccion_miembros SET rango = ? WHERE discord_id = ? AND slot_number = ? AND faccion_id = ?",
      [nuevoRango, targetDiscordId, targetSlot, actor[0].faccion_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Miembro no encontrado en tu faccion" });
    }

    return res.status(200).json({ ok: true, nuevoRango });
  }

  return res.status(400).json({ error: `Accion desconocida: ${action}` });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  LEADERBOARD                                             ║
// ╚══════════════════════════════════════════════════════════╝
async function handleLeaderboard(req, res, connection, auth, action) {

  if (req.method !== "GET") return res.status(405).json({ error: "Solo GET" });

  const limite = Math.min(parseInt(req.query.limit || "10", 10), 50);

  if (action === "top_dinero") {
    const [rows] = await connection.execute(
      `SELECT stateid, nombre, dinero, rol, nivel, nivel_vip, titulo_activo
       FROM usuarios ORDER BY dinero DESC LIMIT ?`,
      [limite]
    );
    return res.status(200).json({ ok: true, ranking: rows, tipo: "dinero" });
  }

  if (action === "top_nivel") {
    const [rows] = await connection.execute(
      `SELECT stateid, nombre, nivel, xp, dinero, rol, titulo_activo
       FROM usuarios ORDER BY nivel DESC, xp DESC LIMIT ?`,
      [limite]
    );
    return res.status(200).json({ ok: true, ranking: rows, tipo: "nivel" });
  }

  if (action === "top_reputacion") {
    const [rows] = await connection.execute(
      `SELECT stateid, nombre, reputacion, nivel, rol, titulo_activo
       FROM usuarios ORDER BY reputacion DESC LIMIT ?`,
      [limite]
    );
    return res.status(200).json({ ok: true, ranking: rows, tipo: "reputacion" });
  }

  if (action === "top_facciones") {
    const [rows] = await connection.execute(
      `SELECT f.nombre, f.color, f.nivel, f.reputacion_global, f.fondos,
              COUNT(fm.id) AS miembros
       FROM facciones f
       LEFT JOIN faccion_miembros fm ON fm.faccion_id = f.id
       WHERE f.activa = 1
       GROUP BY f.id
       ORDER BY f.reputacion_global DESC
       LIMIT ?`,
      [limite]
    );
    return res.status(200).json({ ok: true, ranking: rows, tipo: "facciones" });
  }

  if (action === "estadisticas_globales") {
    const [usuarios] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(dinero) as dinero_total, AVG(dinero) as dinero_promedio, AVG(nivel) as nivel_promedio FROM usuarios"
    );
    const [facciones] = await connection.execute(
      "SELECT COUNT(*) as total FROM facciones WHERE activa = 1"
    );
    const [multas] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(monto) as monto_total FROM multas WHERE 1=1"
    );
    const [vehiculos] = await connection.execute(
      "SELECT COUNT(*) as total FROM vehiculos_registrados WHERE 1=1"
    );

    return res.status(200).json({
      ok: true,
      estadisticas: {
        usuarios: usuarios[0],
        facciones: facciones[0].total,
        multas: multas[0],
        vehiculos: vehiculos[0].total,
      },
    });
  }

  if (action === "perfil_completo") {
    const discordId = sanitizar(req.query.discordId || "");
    const slot = parseInt(req.query.slot || "1", 10);
    if (!discordId) return res.status(400).json({ error: "discordId requerido" });

    const [personaje] = await connection.execute(
      `SELECT * FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1`,
      [discordId, slot]
    );
    if (personaje.length === 0) return res.status(404).json({ error: "Personaje no encontrado" });

    const [faccion] = await connection.execute(
      `SELECT fm.rango, fm.contribucion_total, f.nombre AS faccion_nombre, f.color
       FROM faccion_miembros fm
       JOIN facciones f ON f.id = fm.faccion_id
       WHERE fm.discord_id = ? AND fm.slot_number = ? LIMIT 1`,
      [discordId, slot]
    );

    const [multas] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(monto) as monto_total FROM multas WHERE stateid = ? AND pagada = 0",
      [personaje[0].stateid]
    );

    const [vehiculos] = await connection.execute(
      "SELECT COUNT(*) as total FROM vehiculos_registrados WHERE stateid = ?",
      [personaje[0].stateid]
    );

    const [logros] = await connection.execute(
      `SELECT l.nombre, l.icono, lj.fecha_desbloqueo
       FROM logros_jugador lj
       JOIN logros l ON l.id = lj.logro_id
       WHERE lj.discord_id = ? AND lj.slot_number = ? AND lj.desbloqueado = 1
       ORDER BY lj.fecha_desbloqueo DESC LIMIT 10`,
      [discordId, slot]
    );

    return res.status(200).json({
      ok: true,
      perfil: {
        personaje: personaje[0],
        faccion: faccion.length > 0 ? faccion[0] : null,
        multas: multas[0],
        vehiculos: vehiculos[0].total,
        logros,
      },
    });
  }

  return res.status(400).json({ error: `Accion desconocida: ${action}` });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  MERCADO & EVENTOS                                       ║
// ╚══════════════════════════════════════════════════════════╝
async function handleMercado(req, res, connection, auth, action, body) {

  // ═══════════ EVENTOS ═══════════

  if (action === "eventos_activos" && req.method === "GET") {
    const [eventos] = await connection.execute(
      `SELECT e.*, COUNT(ei.id) AS inscritos
       FROM eventos e
       LEFT JOIN eventos_inscripciones ei ON ei.evento_id = e.id
       WHERE e.estado IN ('programado', 'inscripciones', 'en_curso')
       GROUP BY e.id
       ORDER BY e.fecha_inicio ASC`
    );
    return res.status(200).json({ ok: true, eventos });
  }

  if (action === "inscribir_evento" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const eventoId = parseInt(body.eventoId, 10);

    if (!discordId || isNaN(eventoId)) {
      return res.status(400).json({ error: "discordId y eventoId requeridos" });
    }

    await connection.beginTransaction();
    try {
      const [evento] = await connection.execute(
        "SELECT * FROM eventos WHERE id = ? AND estado = 'inscripciones' LIMIT 1",
        [eventoId]
      );
      if (evento.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Evento no disponible para inscripcion" });
      }

      const [ya] = await connection.execute(
        "SELECT id FROM eventos_inscripciones WHERE evento_id = ? AND discord_id = ? AND slot_number = ?",
        [eventoId, discordId, slot]
      );
      if (ya.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Ya estas inscrito" });
      }

      if (evento[0].max_participantes) {
        const [count] = await connection.execute(
          "SELECT COUNT(*) as total FROM eventos_inscripciones WHERE evento_id = ?",
          [eventoId]
        );
        if (count[0].total >= evento[0].max_participantes) {
          await connection.rollback();
          return res.status(400).json({ error: "Evento lleno" });
        }
      }

      if (evento[0].costo_inscripcion > 0) {
        const [persona] = await connection.execute(
          "SELECT id, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
          [discordId, slot]
        );
        if (persona.length === 0 || persona[0].dinero < evento[0].costo_inscripcion) {
          await connection.rollback();
          return res.status(400).json({ error: "Saldo insuficiente para la inscripcion" });
        }
        await connection.execute(
          "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
          [evento[0].costo_inscripcion, persona[0].id]
        );
        await connection.execute(
          "UPDATE eventos SET premio_pool = premio_pool + ? WHERE id = ?",
          [evento[0].costo_inscripcion, eventoId]
        );
      }

      await connection.execute(
        "INSERT INTO eventos_inscripciones (evento_id, discord_id, slot_number) VALUES (?, ?, ?)",
        [eventoId, discordId, slot]
      );

      await connection.commit();
      return res.status(200).json({ ok: true, evento: evento[0].nombre });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  // ═══════════ MERCADO P2P ═══════════

  if (action === "ofertas" && req.method === "GET") {
    const tipo = req.query.tipo || null;
    let query = `SELECT mo.*, u.nombre AS vendedor_nombre, u.stateid AS vendedor_stateid
                 FROM mercado_ofertas mo
                 JOIN usuarios u ON u.discord_id = mo.vendedor_discord_id AND u.slot_number = mo.vendedor_slot
                 WHERE mo.estado = 'activa'`;
    const params = [];

    if (tipo) {
      query += " AND mo.tipo_item = ?";
      params.push(tipo);
    }

    query += " ORDER BY mo.created_at DESC LIMIT 50";

    const [ofertas] = await connection.execute(query, params);
    return res.status(200).json({ ok: true, ofertas });
  }

  if (action === "crear_oferta" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const tipoItem = body.tipoItem;
    const nombreItem = sanitizar(body.nombreItem || "");
    const precio = parseInt(body.precio, 10);
    const descripcion = sanitizar(body.descripcion || "");

    const tiposValidos = ["vehiculo", "arma", "documento", "propiedad", "otro"];
    if (!tiposValidos.includes(tipoItem)) {
      return res.status(400).json({ error: "Tipo de item invalido" });
    }
    if (!discordId || !nombreItem || isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const [activas] = await connection.execute(
      "SELECT COUNT(*) as total FROM mercado_ofertas WHERE vendedor_discord_id = ? AND vendedor_slot = ? AND estado = 'activa'",
      [discordId, slot]
    );
    if (activas[0].total >= 10) {
      return res.status(400).json({ error: "Maximo 10 ofertas activas por personaje" });
    }

    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 7);

    await connection.execute(
      `INSERT INTO mercado_ofertas (vendedor_discord_id, vendedor_slot, tipo_item, nombre_item, descripcion, precio, expira_en)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [discordId, slot, tipoItem, nombreItem, descripcion, precio, expiraEn]
    );

    await registrarEvento(auth.origen, discordId, "crear_oferta_mercado", {
      entidadTipo: "mercado",
      datosDespues: { tipoItem, nombreItem, precio },
    });

    return res.status(200).json({ ok: true, mensaje: "Oferta creada" });
  }

  if (action === "comprar_oferta" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const ofertaId = parseInt(body.ofertaId, 10);

    if (!discordId || isNaN(ofertaId)) {
      return res.status(400).json({ error: "discordId y ofertaId requeridos" });
    }

    await connection.beginTransaction();
    try {
      const [oferta] = await connection.execute(
        "SELECT * FROM mercado_ofertas WHERE id = ? AND estado = 'activa' LIMIT 1 FOR UPDATE",
        [ofertaId]
      );
      if (oferta.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Oferta no disponible" });
      }

      if (oferta[0].vendedor_discord_id === discordId && oferta[0].vendedor_slot === slot) {
        await connection.rollback();
        return res.status(400).json({ error: "No puedes comprar tu propia oferta" });
      }

      const [comprador] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
        [discordId, slot]
      );
      if (comprador.length === 0 || comprador[0].dinero < oferta[0].precio) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      const comision = Math.floor(oferta[0].precio * 0.05);
      const pagoVendedor = oferta[0].precio - comision;

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [oferta[0].precio, comprador[0].id]);
      await connection.execute(
        "UPDATE usuarios SET dinero = dinero + ? WHERE discord_id = ? AND slot_number = ?",
        [pagoVendedor, oferta[0].vendedor_discord_id, oferta[0].vendedor_slot]
      );

      await connection.execute(
        `UPDATE mercado_ofertas SET estado = 'vendida', comprador_discord_id = ?, comprador_slot = ?,
         comision = ?, fecha_venta = NOW() WHERE id = ?`,
        [discordId, slot, comision, ofertaId]
      );

      await connection.commit();

      await registrarEvento(auth.origen, discordId, "comprar_oferta_mercado", {
        entidadTipo: "mercado",
        entidadId: String(ofertaId),
        datosDespues: { precio: oferta[0].precio, comision, vendedor: oferta[0].vendedor_discord_id },
      });

      return res.status(200).json({
        ok: true,
        item: oferta[0].nombre_item,
        precio: oferta[0].precio,
        comision,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }

  if (action === "cancelar_oferta" && req.method === "POST") {
    const discordId = sanitizar(body.discordId || "");
    const slot = parseInt(body.slot || "1", 10);
    const ofertaId = parseInt(body.ofertaId, 10);

    const [result] = await connection.execute(
      "UPDATE mercado_ofertas SET estado = 'cancelada' WHERE id = ? AND vendedor_discord_id = ? AND vendedor_slot = ? AND estado = 'activa'",
      [ofertaId, discordId, slot]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Oferta no encontrada o no eres el vendedor" });
    }

    return res.status(200).json({ ok: true, mensaje: "Oferta cancelada" });
  }

  return res.status(400).json({ error: `Accion desconocida: ${action}` });
}
