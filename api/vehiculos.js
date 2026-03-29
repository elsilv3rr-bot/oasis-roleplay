// API VEHICULOS - Registro legal de vehiculos //
// Matriculas y consultas //

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

// Generar matricula aleatoria formato OA-XXXX //
function generarMatricula() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letras[Math.floor(Math.random() * 26)];
  const l2 = letras[Math.floor(Math.random() * 26)];
  const nums = Math.floor(1000 + Math.random() * 9000);
  return `OA-${l1}${l2}${nums}`;
}

export default async function handler(req, res) {
  aplicarHeaders(res);

  if (req.method !== "POST") {
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
    const { nombre_vehiculo, slotNumber: rawSlot } = body;
    const slotNumber = parseInt(rawSlot || "1", 10);

    if (!nombre_vehiculo) {
      return res.status(400).json({ error: "nombre_vehiculo requerido" });
    }

    // Obtener personaje //
    const [personaje] = await connection.execute(
      "SELECT id, stateid, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [decoded.discordId, slotNumber]
    );

    if (personaje.length === 0) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const tarifa = 2500;
    const p = personaje[0];

    if (Number(p.dinero) < tarifa) {
      return res.status(400).json({ error: `Saldo insuficiente. El registro cuesta $${tarifa}` });
    }

    await connection.beginTransaction();

    // Cobrar tarifa de registro //
    await connection.execute(
      "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
      [tarifa, p.id]
    );

    // Generar matricula unica //
    let matricula = generarMatricula();
    let intentos = 0;

    while (intentos < 10) {
      const [existe] = await connection.execute(
        "SELECT id FROM vehiculos_registrados WHERE matricula = ? LIMIT 1",
        [matricula]
      );
      if (existe.length === 0) break;
      matricula = generarMatricula();
      intentos++;
    }

    // Registrar vehiculo //
    await connection.execute(
      "INSERT INTO vehiculos_registrados (stateid_propietario, nombre_vehiculo, matricula) VALUES (?, ?, ?)",
      [p.stateid, sanitizar(nombre_vehiculo), matricula]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      matricula,
      dinero: Number(p.dinero) - tarifa,
      mensaje: `Vehiculo registrado con matricula ${matricula}`
    });

  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[VEHICULOS] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
