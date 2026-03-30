import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";

const COTIZACIONES = {
  OAS: 145,
  KRM: 390,
  BLD: 760,
};

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
    const body = parseBody(req.body);
    const slotNumber = parseInt(req.query.slotNumber || body.slotNumber || "1", 10);

    const [personajeRows] = await connection.execute(
      "SELECT id, nombre, rol, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [decoded.discordId, slotNumber]
    );

    if (personajeRows.length === 0) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const personaje = personajeRows[0];

    if (req.method === "GET") {
      const [walletRows] = await connection.execute(
        "SELECT moneda, cantidad FROM crypto_billeteras WHERE discord_id = ? AND slot_number = ?",
        [decoded.discordId, slotNumber]
      );

      const cartera = walletRows.reduce((acc, item) => {
        acc[item.moneda] = Number(item.cantidad);
        return acc;
      }, {});

      return res.status(200).json({
        ok: true,
        saldo: Number(personaje.dinero),
        rol: personaje.rol,
        cotizaciones: COTIZACIONES,
        cartera,
      });
    }

    const { accion, moneda } = body;
    const token = String(moneda || "").toUpperCase();
    const cotizacion = Number(COTIZACIONES[token]);
    const cantidad = Math.floor(Number(body.cantidad));

    if (!cotizacion) {
      return res.status(400).json({ error: "Moneda no valida" });
    }

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: "Cantidad invalida" });
    }

    await connection.beginTransaction();

    const [saldoRows] = await connection.execute(
      "SELECT dinero FROM usuarios WHERE id = ? LIMIT 1 FOR UPDATE",
      [personaje.id]
    );

    const saldoActual = Number(saldoRows[0].dinero);
    const monto = cotizacion * cantidad;

    const [walletRows] = await connection.execute(
      "SELECT id, cantidad FROM crypto_billeteras WHERE discord_id = ? AND slot_number = ? AND moneda = ? LIMIT 1 FOR UPDATE",
      [decoded.discordId, slotNumber, token]
    );

    const cantidadActual = walletRows.length > 0 ? Number(walletRows[0].cantidad) : 0;

    if (accion === "comprar") {
      if (saldoActual < monto) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
        [monto, personaje.id]
      );

      if (walletRows.length > 0) {
        await connection.execute(
          "UPDATE crypto_billeteras SET cantidad = cantidad + ? WHERE id = ?",
          [cantidad, walletRows[0].id]
        );
      } else {
        await connection.execute(
          "INSERT INTO crypto_billeteras (discord_id, slot_number, moneda, cantidad) VALUES (?, ?, ?, ?)",
          [decoded.discordId, slotNumber, token, cantidad]
        );
      }

      await connection.execute(
        "INSERT INTO crypto_movimientos (discord_id, slot_number, moneda, tipo, cantidad, precio_unitario, monto_total) VALUES (?, ?, ?, 'compra', ?, ?, ?)",
        [decoded.discordId, slotNumber, token, cantidad, cotizacion, monto]
      );

      await connection.commit();
      return res.status(200).json({ ok: true, saldo: saldoActual - monto, moneda: token, cantidad: cantidadActual + cantidad });
    }

    if (accion === "vender") {
      if (cantidadActual < cantidad) {
        await connection.rollback();
        return res.status(400).json({ error: "No tienes suficiente saldo de esa moneda" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero + ? WHERE id = ?",
        [monto, personaje.id]
      );

      await connection.execute(
        "UPDATE crypto_billeteras SET cantidad = cantidad - ? WHERE id = ?",
        [cantidad, walletRows[0].id]
      );

      await connection.execute(
        "INSERT INTO crypto_movimientos (discord_id, slot_number, moneda, tipo, cantidad, precio_unitario, monto_total) VALUES (?, ?, ?, 'venta', ?, ?, ?)",
        [decoded.discordId, slotNumber, token, cantidad, cotizacion, monto]
      );

      await connection.commit();
      return res.status(200).json({ ok: true, saldo: saldoActual + monto, moneda: token, cantidad: cantidadActual - cantidad });
    }

    await connection.rollback();
    return res.status(400).json({ error: "Accion no reconocida" });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[CRYPTO] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
