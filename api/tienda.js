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

    if (req.method === "GET") {
      const [rows] = await connection.execute(
        "SELECT id_vehiculo AS id, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen FROM vehiculos_tienda ORDER BY id_vehiculo ASC"
      );
      return res.status(200).json({ ok: true, vehiculos: rows });
    }

    const body = parseBody(req.body);
    const { accion } = body;

    if (accion === "sincronizar_catalogo") {
      const { vehiculos } = body;
      if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
        return res.status(400).json({ error: "Catalogo invalido" });
      }

      await connection.beginTransaction();

      for (const vehiculo of vehiculos) {
        const id = Number(vehiculo.id);
        const precio = Math.floor(Number(vehiculo.precio));
        const stock = Math.max(0, Math.floor(Number(vehiculo.stock)));
        const nombre = sanitizar(String(vehiculo.nombre || ""));
        const imagen = String(vehiculo.imagen || "").trim();

        if (!id || !nombre || !precio) continue;

        await connection.execute(
          `INSERT INTO vehiculos_tienda (id_vehiculo, nombre, precio_actual, stock_global, imagen_url)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             nombre = VALUES(nombre),
             precio_actual = VALUES(precio_actual),
             imagen_url = VALUES(imagen_url)`,
          [id, nombre, precio, stock, imagen]
        );
      }

      await connection.commit();
      return res.status(200).json({ ok: true });
    }

    if (accion === "comprar_vehiculo") {
      const slotNumber = parseInt(body.slotNumber || "1", 10);
      const vehiculoId = Math.floor(Number(body.vehiculoId));

      if (!vehiculoId) {
        return res.status(400).json({ error: "vehiculoId requerido" });
      }

      await connection.beginTransaction();

      const [personajeRows] = await connection.execute(
        "SELECT id, nombre, stateid, discord_id, slot_number, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE",
        [decoded.discordId, slotNumber]
      );

      if (personajeRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const personaje = personajeRows[0];

      const [vehiculoRows] = await connection.execute(
        "SELECT id_vehiculo, nombre, precio_actual, stock_global, imagen_url FROM vehiculos_tienda WHERE id_vehiculo = ? LIMIT 1 FOR UPDATE",
        [vehiculoId]
      );

      if (vehiculoRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Vehiculo no disponible" });
      }

      const vehiculo = vehiculoRows[0];
      const precio = Number(vehiculo.precio_actual);
      const stock = Number(vehiculo.stock_global);
      const saldo = Number(personaje.dinero);

      if (stock <= 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Sin stock disponible" });
      }

      if (saldo < precio) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
        [precio, personaje.id]
      );

      await connection.execute(
        "UPDATE vehiculos_tienda SET stock_global = stock_global - 1 WHERE id_vehiculo = ?",
        [vehiculoId]
      );

      const datosExtra = JSON.stringify({
        vehiculoId,
        imagen: vehiculo.imagen_url,
        precio,
        estado: "INSCRITO"
      });

      await connection.execute(
        "INSERT INTO inventario (discord_id, slot_number, nombre_item, tipo, datos_extra) VALUES (?, ?, ?, 'vehiculo', ?)",
        [personaje.discord_id, personaje.slot_number, vehiculo.nombre, datosExtra]
      );

      await connection.commit();

      return res.status(200).json({
        ok: true,
        vehiculo: {
          id: vehiculoId,
          nombre: vehiculo.nombre,
          precio,
          imagen: vehiculo.imagen_url,
          stock: stock - 1,
        },
        dinero: saldo - precio,
      });
    }

    return res.status(400).json({ error: "Accion no reconocida" });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[TIENDA] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
