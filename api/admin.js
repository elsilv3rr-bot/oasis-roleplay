// API ADMIN - Panel administrativo //
// Todas las operaciones requieren ser admin verificado por discord_id //

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
          "SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100"
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

    // Asignar nivel VIP //
    if (accion === "asignar_vip") {
      const { stateid, nivel } = body;
      if (!stateid || !nivel) return res.status(400).json({ error: "stateid y nivel requeridos" });

      const [result] = await connection.execute(
        "UPDATE usuarios SET nivel_vip = ? WHERE stateid = ?",
        [sanitizar(nivel), sanitizar(stateid)]
      );

      if (result.affectedRows === 0) return res.status(404).json({ error: "Personaje no encontrado" });

      await registrarLogAdmin(connection, decoded.discordId, `Asigno VIP "${nivel}" a ${stateid}`);
      return res.status(200).json({ ok: true });
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
