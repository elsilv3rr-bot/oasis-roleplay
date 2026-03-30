// MODELO DE EVENTOS (web + bot) //
// Bus de eventos internos para auditoria y sincronizacion //

import { crearConexion, cerrarConexion } from "./database.js";

/**
 * Registra un evento de auditoria en la base de datos.
 * @param {string} origen - 'web' | 'bot' | 'sistema'
 * @param {string} actorDiscordId - Discord ID del actor (o null para sistema)
 * @param {string} accion - Nombre de la accion (ej: 'transferir_dinero', 'crear_multa')
 * @param {object} opciones - { entidadTipo, entidadId, datosAntes, datosDespues, ipAddress }
 */
async function registrarEvento(origen, actorDiscordId, accion, opciones = {}) {
  let connection;
  try {
    connection = await crearConexion();
    await connection.execute(
      `INSERT INTO auditoria (origen, actor_discord_id, accion, entidad_tipo, entidad_id, datos_antes, datos_despues, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        origen,
        actorDiscordId || null,
        accion,
        opciones.entidadTipo || null,
        opciones.entidadId || null,
        opciones.datosAntes ? JSON.stringify(opciones.datosAntes) : null,
        opciones.datosDespues ? JSON.stringify(opciones.datosDespues) : null,
        opciones.ipAddress || null,
      ]
    );
  } catch (err) {
    console.error("[EVENTO] Error registrando evento:", err.message);
  } finally {
    await cerrarConexion(connection);
  }
}

/**
 * Envía una notificacion a un webhook de Discord.
 * @param {string} webhookUrl - URL del webhook de Discord
 * @param {object} embed - Embed de Discord
 */
async function notificarDiscord(webhookUrl, embed) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error("[WEBHOOK] Error enviando notificacion:", err.message);
  }
}

/**
 * Obtiene el historial de auditoria con filtros.
 */
async function obtenerHistorial(filtros = {}, limite = 50) {
  let connection;
  try {
    connection = await crearConexion();
    let query = "SELECT * FROM auditoria WHERE 1=1";
    const params = [];

    if (filtros.actorDiscordId) {
      query += " AND actor_discord_id = ?";
      params.push(filtros.actorDiscordId);
    }
    if (filtros.accion) {
      query += " AND accion = ?";
      params.push(filtros.accion);
    }
    if (filtros.origen) {
      query += " AND origen = ?";
      params.push(filtros.origen);
    }
    if (filtros.desde) {
      query += " AND created_at >= ?";
      params.push(filtros.desde);
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limite);

    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    await cerrarConexion(connection);
  }
}

export { registrarEvento, notificarDiscord, obtenerHistorial };
