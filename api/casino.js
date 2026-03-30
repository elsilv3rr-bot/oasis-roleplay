import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "./_lib/database.js";
import { aplicarHeaders } from "./_lib/seguridad.js";

const COSTO_ENTRADA = 45000;

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return body;
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
      "SELECT id, discord_id, slot_number, nombre, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1",
      [decoded.discordId, slotNumber]
    );

    if (personajeRows.length === 0) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const personaje = personajeRows[0];

    if (req.method === "GET") {
      const [accesoRows] = await connection.execute(
        "SELECT id, pagado_en FROM casino_accesos WHERE discord_id = ? LIMIT 1",
        [decoded.discordId]
      );

      const [historialRows] = await connection.execute(
        "SELECT juego, apuesta, ganancia, resultado, created_at FROM casino_jugadas WHERE discord_id = ? AND slot_number = ? ORDER BY id DESC LIMIT 10",
        [decoded.discordId, slotNumber]
      );

      return res.status(200).json({
        ok: true,
        accesoPagado: accesoRows.length > 0,
        costoEntrada: COSTO_ENTRADA,
        saldo: Number(personaje.dinero),
        historial: historialRows,
      });
    }

    const { accion } = body;

    if (accion === "comprar_entrada") {
      await connection.beginTransaction();

      const [accesoRows] = await connection.execute(
        "SELECT id FROM casino_accesos WHERE discord_id = ? LIMIT 1 FOR UPDATE",
        [decoded.discordId]
      );

      if (accesoRows.length > 0) {
        await connection.commit();
        return res.status(200).json({ ok: true, accesoPagado: true, yaPagado: true });
      }

      const [saldoRows] = await connection.execute(
        "SELECT id, dinero FROM usuarios WHERE id = ? LIMIT 1 FOR UPDATE",
        [personaje.id]
      );

      const saldo = Number(saldoRows[0].dinero);
      if (saldo < COSTO_ENTRADA) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente para pagar la entrada" });
      }

      await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ?",
        [COSTO_ENTRADA, personaje.id]
      );

      await connection.execute(
        "INSERT INTO casino_accesos (discord_id) VALUES (?)",
        [decoded.discordId]
      );

      await connection.commit();

      return res.status(200).json({
        ok: true,
        accesoPagado: true,
        saldo: saldo - COSTO_ENTRADA,
      });
    }

    const [accesoRows] = await connection.execute(
      "SELECT id FROM casino_accesos WHERE discord_id = ? LIMIT 1",
      [decoded.discordId]
    );

    if (accesoRows.length === 0) {
      return res.status(403).json({ error: "Debes pagar la entrada del casino" });
    }

    const apuesta = Math.floor(Number(body.apuesta));
    if (!apuesta || apuesta <= 0) {
      return res.status(400).json({ error: "Apuesta invalida" });
    }

    await connection.beginTransaction();

    const [saldoRows] = await connection.execute(
      "SELECT dinero FROM usuarios WHERE id = ? LIMIT 1 FOR UPDATE",
      [personaje.id]
    );

    const saldoActual = Number(saldoRows[0].dinero);
    if (saldoActual < apuesta) {
      await connection.rollback();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    let ganancia = 0;
    let resultado = "";
    let juego = "";

    if (accion === "jugar_ruleta") {
      juego = "ruleta";
      const colorElegido = String(body.color || "").toLowerCase();
      if (!["rojo", "negro", "verde"].includes(colorElegido)) {
        await connection.rollback();
        return res.status(400).json({ error: "Color invalido" });
      }

      const numero = numeroAleatorio(0, 36);
      let colorResultado = "verde";
      if (numero !== 0) {
        colorResultado = numero % 2 === 0 ? "negro" : "rojo";
      }

      if (colorElegido === colorResultado) {
        ganancia = colorResultado === "verde" ? apuesta * 14 : apuesta * 2;
      }

      resultado = `Numero ${numero} (${colorResultado})`;
    } else if (accion === "jugar_blackjack") {
      juego = "blackjack";
      const manoJugador = numeroAleatorio(15, 23);
      const manoCasa = numeroAleatorio(15, 23);

      const jugadorSePasa = manoJugador > 21;
      const casaSePasa = manoCasa > 21;

      if ((!jugadorSePasa && casaSePasa) || (!jugadorSePasa && manoJugador > manoCasa)) {
        ganancia = apuesta * 2;
      } else if (!jugadorSePasa && !casaSePasa && manoJugador === manoCasa) {
        ganancia = apuesta;
      }

      resultado = `Jugador ${manoJugador} vs Casa ${manoCasa}`;
    } else if (accion === "jugar_tragamonedas") {
      juego = "tragamonedas";
      const simbolos = ["7", "BAR", "DIAMANTE", "CEREZA", "CAMPANA"];
      const a = simbolos[numeroAleatorio(0, simbolos.length - 1)];
      const b = simbolos[numeroAleatorio(0, simbolos.length - 1)];
      const c = simbolos[numeroAleatorio(0, simbolos.length - 1)];

      if (a === b && b === c) {
        ganancia = apuesta * 6;
      } else if (a === b || b === c || a === c) {
        ganancia = apuesta * 2;
      }

      resultado = `${a} | ${b} | ${c}`;
    } else {
      await connection.rollback();
      return res.status(400).json({ error: "Juego no reconocido" });
    }

    const saldoFinal = saldoActual - apuesta + ganancia;

    await connection.execute(
      "UPDATE usuarios SET dinero = ? WHERE id = ?",
      [saldoFinal, personaje.id]
    );

    await connection.execute(
      "INSERT INTO casino_jugadas (discord_id, slot_number, juego, apuesta, ganancia, resultado) VALUES (?, ?, ?, ?, ?, ?)",
      [decoded.discordId, slotNumber, juego, apuesta, ganancia, resultado]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      juego,
      apuesta,
      ganancia,
      resultado,
      saldo: saldoFinal,
    });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[CASINO] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
