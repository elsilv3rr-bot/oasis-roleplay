import jwt from "jsonwebtoken";
import { crearConexion, cerrarConexion } from "../lib/api/database.js";
import { aplicarHeaders } from "../lib/api/seguridad.js";
import { sanitizar } from "../lib/api/validacion.js";

const COSTO_ENTRADA_CASINO = 45000;
const COTIZACIONES_CRYPTO = {
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

function parseSlot(value) {
  const slot = parseInt(value || "1", 10);
  if (!slot || slot < 1) return 1;
  return slot;
}

function generarMatricula() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letras[Math.floor(Math.random() * 26)];
  const l2 = letras[Math.floor(Math.random() * 26)];
  const nums = Math.floor(1000 + Math.random() * 9000);
  return `OA-${l1}${l2}${nums}`;
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarIdMercado() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 8; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function obtenerPersonaje(connection, discordId, slotNumber, conBloqueo = false) {
  const query = conBloqueo
    ? "SELECT id, discord_id, slot_number, stateid, nombre, rol, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1 FOR UPDATE"
    : "SELECT id, discord_id, slot_number, stateid, nombre, rol, dinero FROM usuarios WHERE discord_id = ? AND slot_number = ? LIMIT 1";

  const [rows] = await connection.execute(query, [discordId, slotNumber]);
  return rows.length > 0 ? rows[0] : null;
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

    if (req.method === "GET") {
      const accion = String(req.query.accion || "saldo").trim();
      const slotNumber = parseSlot(req.query.slotNumber);
      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber);

      if (!personaje) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      if (accion === "saldo") {
        return res.status(200).json({ ok: true, dinero: Number(personaje.dinero) });
      }

      if (accion === "multas") {
        const [multas] = await connection.execute(
          "SELECT * FROM multas WHERE stateid_infractor = ? ORDER BY fecha DESC",
          [personaje.stateid]
        );

        const [cargos] = await connection.execute(
          "SELECT * FROM cargos_judiciales WHERE stateid_acusado = ? ORDER BY fecha DESC",
          [personaje.stateid]
        );

        return res.status(200).json({ ok: true, multas, cargos });
      }

      if (accion === "tienda_catalogo") {
        const hayCategoria = await tieneCategoriaVehiculo(connection);
        const [rows] = await connection.execute(
          hayCategoria
            ? "SELECT id_vehiculo AS id, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen, categoria FROM vehiculos_tienda ORDER BY id_vehiculo ASC"
            : "SELECT id_vehiculo AS id, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen, 'standard' AS categoria FROM vehiculos_tienda ORDER BY id_vehiculo ASC"
        );
        return res.status(200).json({ ok: true, vehiculos: rows });
      }

      if (accion === "tienda_items") {
        const [rows] = await connection.execute(
          "SELECT id_item AS id, tipo, nombre, precio_actual AS precio, stock_global AS stock, imagen_url AS imagen FROM mercado_items ORDER BY tipo ASC, id_item ASC"
        );
        return res.status(200).json({ ok: true, items: rows });
      }

      if (accion === "casino_estado") {
        const [accesoRows] = await connection.execute(
          "SELECT id FROM casino_accesos WHERE discord_id = ? LIMIT 1",
          [decoded.discordId]
        );

        const [historialRows] = await connection.execute(
          "SELECT juego, apuesta, ganancia, resultado, created_at FROM casino_jugadas WHERE discord_id = ? AND slot_number = ? ORDER BY id DESC LIMIT 10",
          [decoded.discordId, slotNumber]
        );

        return res.status(200).json({
          ok: true,
          accesoPagado: accesoRows.length > 0,
          costoEntrada: COSTO_ENTRADA_CASINO,
          saldo: Number(personaje.dinero),
          historial: historialRows,
        });
      }

      if (accion === "crypto_estado") {
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
          cotizaciones: COTIZACIONES_CRYPTO,
          cartera,
        });
      }

      return res.status(400).json({ error: "Accion GET no reconocida" });
    }

    const body = parseBody(req.body);
    const action = String(body.action || body.accion || "").trim();
    const slotNumber = parseSlot(body.slotNumber || body.slot_number);

    if (action === "transfer") {
      const parsedAmount = Math.floor(Number(body.amount));
      const toStateId = String(body.toStateId || "").trim();

      if (!parsedAmount || parsedAmount <= 0) {
        return res.status(400).json({ error: "Monto invalido" });
      }

      if (!toStateId) {
        return res.status(400).json({ error: "StateID destinatario requerido" });
      }

      await connection.beginTransaction();

      const sender = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!sender) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje remitente no encontrado" });
      }

      const senderBalance = Number(sender.dinero);
      if (senderBalance < parsedAmount) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      const [recipientRows] = await connection.execute(
        "SELECT id FROM usuarios WHERE stateid = ? LIMIT 1 FOR UPDATE",
        [toStateId]
      );

      if (recipientRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "El StateID destinatario no existe" });
      }

      if (sender.id === recipientRows[0].id) {
        await connection.rollback();
        return res.status(400).json({ error: "No puedes transferirte a ti mismo" });
      }

      const [debitResult] = await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ? AND dinero >= ?",
        [parsedAmount, sender.id, parsedAmount]
      );

      if (debitResult.affectedRows !== 1) {
        await connection.rollback();
        return res.status(409).json({ error: "No se pudo procesar la transferencia de forma segura" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero + ? WHERE id = ?", [parsedAmount, recipientRows[0].id]);
      await connection.commit();

      return res.status(200).json({ ok: true, dinero: senderBalance - parsedAmount });
    }

    if (action === "debit") {
      const parsedAmount = Math.floor(Number(body.amount));
      if (!parsedAmount || parsedAmount <= 0) {
        return res.status(400).json({ error: "Monto invalido" });
      }

      await connection.beginTransaction();
      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);

      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const saldoActual = Number(personaje.dinero);
      if (saldoActual < parsedAmount) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      const [debitResult] = await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ? AND dinero >= ?",
        [parsedAmount, personaje.id, parsedAmount]
      );

      if (debitResult.affectedRows !== 1) {
        await connection.rollback();
        return res.status(409).json({ error: "No se pudo procesar el debito de forma segura" });
      }

      await connection.commit();

      return res.status(200).json({ ok: true, dinero: saldoActual - parsedAmount });
    }

    if (action === "pagar_multa") {
      const multaId = Number(body.multa_id);
      if (!multaId) {
        return res.status(400).json({ error: "multa_id requerido" });
      }

      await connection.beginTransaction();
      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const [multaRows] = await connection.execute(
        "SELECT id, monto FROM multas WHERE id = ? AND stateid_infractor = ? AND pagada = 0 LIMIT 1 FOR UPDATE",
        [multaId, personaje.stateid]
      );

      if (multaRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Multa no encontrada o ya pagada" });
      }

      const monto = Number(multaRows[0].monto);
      if (Number(personaje.dinero) < monto) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [monto, personaje.id]);
      await connection.execute("UPDATE multas SET pagada = 1 WHERE id = ?", [multaRows[0].id]);
      await connection.commit();

      return res.status(200).json({ ok: true, dinero: Number(personaje.dinero) - monto });
    }

    if (action === "pagar_todas") {
      await connection.beginTransaction();
      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const [multasRows] = await connection.execute(
        "SELECT id, monto FROM multas WHERE stateid_infractor = ? AND pagada = 0 FOR UPDATE",
        [personaje.stateid]
      );

      if (multasRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "No hay multas pendientes" });
      }

      const total = multasRows.reduce((acc, multa) => acc + Number(multa.monto), 0);
      if (Number(personaje.dinero) < total) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente para pagar todas" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [total, personaje.id]);
      await connection.execute("UPDATE multas SET pagada = 1 WHERE stateid_infractor = ? AND pagada = 0", [personaje.stateid]);
      await connection.commit();

      return res.status(200).json({ ok: true, dinero: Number(personaje.dinero) - total });
    }

    if (action === "registrar_vehiculo") {
      const nombreVehiculo = String(body.nombre_vehiculo || "").trim();
      if (!nombreVehiculo) {
        return res.status(400).json({ error: "nombre_vehiculo requerido" });
      }

      await connection.beginTransaction();
      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const tarifa = 2500;
      if (Number(personaje.dinero) < tarifa) {
        await connection.rollback();
        return res.status(400).json({ error: `Saldo insuficiente. El registro cuesta $${tarifa}` });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [tarifa, personaje.id]);

      let matricula = generarMatricula();
      for (let intentos = 0; intentos < 10; intentos += 1) {
        const [existe] = await connection.execute("SELECT id FROM vehiculos_registrados WHERE matricula = ? LIMIT 1", [matricula]);
        if (existe.length === 0) break;
        matricula = generarMatricula();
      }

      await connection.execute(
        "INSERT INTO vehiculos_registrados (stateid_propietario, nombre_vehiculo, matricula) VALUES (?, ?, ?)",
        [personaje.stateid, sanitizar(nombreVehiculo), matricula]
      );

      await connection.commit();

      return res.status(200).json({
        ok: true,
        matricula,
        dinero: Number(personaje.dinero) - tarifa,
        mensaje: `Vehiculo registrado con matricula ${matricula}`,
      });
    }

    if (action === "tienda_sincronizar_catalogo") {
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

    if (action === "tienda_sincronizar_items") {
      const { items } = body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items invalidos" });
      }

      await connection.beginTransaction();
      for (const item of items) {
        const id = Number(item.id);
        const precio = Math.floor(Number(item.precio));
        const stock = Math.max(0, Math.floor(Number(item.stock)));
        const nombre = sanitizar(String(item.nombre || "")).trim();
        const tipo = sanitizar(String(item.tipo || "")).toLowerCase().trim();
        const imagen = String(item.imagen || "").trim();

        if (!id || !nombre || !precio || !["arma", "documento"].includes(tipo)) continue;

        await connection.execute(
          `INSERT INTO mercado_items (id_item, tipo, nombre, precio_actual, stock_global, imagen_url)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             tipo = VALUES(tipo),
             nombre = VALUES(nombre),
             precio_actual = VALUES(precio_actual),
             imagen_url = VALUES(imagen_url)`,
          [id, tipo, nombre, precio, stock, imagen]
        );
      }

      await connection.commit();
      return res.status(200).json({ ok: true });
    }

    if (action === "tienda_comprar_vehiculo") {
      const vehiculoId = Number(body.vehiculoId);
      if (!vehiculoId) {
        return res.status(400).json({ error: "vehiculoId requerido" });
      }

      await connection.beginTransaction();

      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

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

      const [debitResult] = await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ? AND dinero >= ?",
        [precio, personaje.id, precio]
      );

      if (debitResult.affectedRows !== 1) {
        await connection.rollback();
        return res.status(409).json({ error: "No se pudo procesar la compra de forma segura" });
      }

      await connection.execute("UPDATE vehiculos_tienda SET stock_global = stock_global - 1 WHERE id_vehiculo = ?", [vehiculoId]);

      const itemUid = generarIdMercado();

      const datosExtra = JSON.stringify({
        itemUid,
        vehiculoId,
        imagen: vehiculo.imagen_url,
        precio,
        estado: "INSCRITO",
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
          itemUid,
          nombre: vehiculo.nombre,
          precio,
          imagen: vehiculo.imagen_url,
          stock: stock - 1,
        },
        dinero: saldo - precio,
      });
    }

    if (action === "tienda_comprar_item") {
      const itemId = Number(body.itemId);
      if (!itemId) {
        return res.status(400).json({ error: "itemId requerido" });
      }

      await connection.beginTransaction();

      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const [itemRows] = await connection.execute(
        "SELECT id_item, tipo, nombre, precio_actual, stock_global, imagen_url FROM mercado_items WHERE id_item = ? LIMIT 1 FOR UPDATE",
        [itemId]
      );

      if (itemRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "Item no disponible" });
      }

      const item = itemRows[0];
      const precio = Number(item.precio_actual);
      const stock = Number(item.stock_global);
      const saldo = Number(personaje.dinero);

      if (stock <= 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Sin stock disponible" });
      }

      if (saldo < precio) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      const [debitResult] = await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? WHERE id = ? AND dinero >= ?",
        [precio, personaje.id, precio]
      );

      if (debitResult.affectedRows !== 1) {
        await connection.rollback();
        return res.status(409).json({ error: "No se pudo procesar la compra de forma segura" });
      }

      await connection.execute("UPDATE mercado_items SET stock_global = stock_global - 1 WHERE id_item = ?", [itemId]);

      const itemUid = generarIdMercado();
      const tipoInventario = item.tipo === "documento" ? "documento" : "arma";
      const datosExtra = JSON.stringify({
        itemUid,
        itemId,
        tipo: item.tipo,
        imagen: item.imagen_url,
        precio,
      });

      await connection.execute(
        "INSERT INTO inventario (discord_id, slot_number, nombre_item, tipo, datos_extra) VALUES (?, ?, ?, ?, ?)",
        [personaje.discord_id, personaje.slot_number, item.nombre, tipoInventario, datosExtra]
      );

      await connection.commit();

      return res.status(200).json({
        ok: true,
        item: {
          id: itemId,
          itemUid,
          nombre: item.nombre,
          tipo: item.tipo,
          precio,
          imagen: item.imagen_url,
          stock: stock - 1,
        },
        dinero: saldo - precio,
      });
    }

    if (action === "casino_comprar_entrada") {
      await connection.beginTransaction();

      const [accesoRows] = await connection.execute(
        "SELECT id FROM casino_accesos WHERE discord_id = ? LIMIT 1 FOR UPDATE",
        [decoded.discordId]
      );

      if (accesoRows.length > 0) {
        await connection.commit();
        return res.status(200).json({ ok: true, accesoPagado: true, yaPagado: true });
      }

      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const saldo = Number(personaje.dinero);
      if (saldo < COSTO_ENTRADA_CASINO) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente para pagar la entrada" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [COSTO_ENTRADA_CASINO, personaje.id]);
      await connection.execute("INSERT INTO casino_accesos (discord_id) VALUES (?)", [decoded.discordId]);

      await connection.commit();
      return res.status(200).json({ ok: true, accesoPagado: true, saldo: saldo - COSTO_ENTRADA_CASINO });
    }

    if (action === "jugar_ruleta" || action === "jugar_blackjack" || action === "jugar_tragamonedas") {
      const apuesta = Math.floor(Number(body.apuesta));
      if (!apuesta || apuesta <= 0) {
        return res.status(400).json({ error: "Apuesta invalida" });
      }

      const [accesoRows] = await connection.execute(
        "SELECT id FROM casino_accesos WHERE discord_id = ? LIMIT 1",
        [decoded.discordId]
      );

      if (accesoRows.length === 0) {
        return res.status(403).json({ error: "Debes pagar la entrada del casino" });
      }

      await connection.beginTransaction();
      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const saldoActual = Number(personaje.dinero);
      if (saldoActual < apuesta) {
        await connection.rollback();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }

      let ganancia = 0;
      let resultado = "";
      let juego = "";

      if (action === "jugar_ruleta") {
        juego = "ruleta";
        const colorElegido = String(body.color || "").toLowerCase();
        if (!["rojo", "negro", "verde"].includes(colorElegido)) {
          await connection.rollback();
          return res.status(400).json({ error: "Color invalido" });
        }

        const numero = numeroAleatorio(0, 36);
        let colorResultado = "verde";
        if (numero !== 0) colorResultado = numero % 2 === 0 ? "negro" : "rojo";

        if (colorElegido === colorResultado) {
          ganancia = colorResultado === "verde" ? apuesta * 14 : apuesta * 2;
        }

        resultado = `Numero ${numero} (${colorResultado})`;
      }

      if (action === "jugar_blackjack") {
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
      }

      if (action === "jugar_tragamonedas") {
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
      }

      const saldoFinal = saldoActual - apuesta + ganancia;

      const [casinoDebit] = await connection.execute(
        "UPDATE usuarios SET dinero = dinero - ? + ? WHERE id = ? AND dinero >= ?",
        [apuesta, ganancia, personaje.id, apuesta]
      );

      if (casinoDebit.affectedRows !== 1) {
        await connection.rollback();
        return res.status(409).json({ error: "No se pudo procesar la jugada de forma segura" });
      }
      await connection.execute(
        "INSERT INTO casino_jugadas (discord_id, slot_number, juego, apuesta, ganancia, resultado) VALUES (?, ?, ?, ?, ?, ?)",
        [decoded.discordId, slotNumber, juego, apuesta, ganancia, resultado]
      );

      await connection.commit();

      return res.status(200).json({ ok: true, juego, apuesta, ganancia, resultado, saldo: saldoFinal });
    }

    if (action === "crypto_comprar" || action === "crypto_vender") {
      const token = String(body.moneda || "").toUpperCase();
      const cotizacion = Number(COTIZACIONES_CRYPTO[token]);
      const cantidad = Math.floor(Number(body.cantidad));

      if (!cotizacion) return res.status(400).json({ error: "Moneda no valida" });
      if (!cantidad || cantidad <= 0) return res.status(400).json({ error: "Cantidad invalida" });

      await connection.beginTransaction();

      const personaje = await obtenerPersonaje(connection, decoded.discordId, slotNumber, true);
      if (!personaje) {
        await connection.rollback();
        return res.status(404).json({ error: "Personaje no encontrado" });
      }

      const saldoActual = Number(personaje.dinero);
      const monto = cotizacion * cantidad;

      const [walletRows] = await connection.execute(
        "SELECT id, cantidad FROM crypto_billeteras WHERE discord_id = ? AND slot_number = ? AND moneda = ? LIMIT 1 FOR UPDATE",
        [decoded.discordId, slotNumber, token]
      );

      const cantidadActual = walletRows.length > 0 ? Number(walletRows[0].cantidad) : 0;

      if (action === "crypto_comprar") {
        if (saldoActual < monto) {
          await connection.rollback();
          return res.status(400).json({ error: "Saldo insuficiente" });
        }

        await connection.execute("UPDATE usuarios SET dinero = dinero - ? WHERE id = ?", [monto, personaje.id]);

        if (walletRows.length > 0) {
          await connection.execute("UPDATE crypto_billeteras SET cantidad = cantidad + ? WHERE id = ?", [cantidad, walletRows[0].id]);
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

      if (cantidadActual < cantidad) {
        await connection.rollback();
        return res.status(400).json({ error: "No tienes suficiente saldo de esa moneda" });
      }

      await connection.execute("UPDATE usuarios SET dinero = dinero + ? WHERE id = ?", [monto, personaje.id]);
      await connection.execute("UPDATE crypto_billeteras SET cantidad = cantidad - ? WHERE id = ?", [cantidad, walletRows[0].id]);
      await connection.execute(
        "INSERT INTO crypto_movimientos (discord_id, slot_number, moneda, tipo, cantidad, precio_unitario, monto_total) VALUES (?, ?, ?, 'venta', ?, ?, ?)",
        [decoded.discordId, slotNumber, token, cantidad, cotizacion, monto]
      );

      await connection.commit();
      return res.status(200).json({ ok: true, saldo: saldoActual + monto, moneda: token, cantidad: cantidadActual - cantidad });
    }

    return res.status(400).json({ error: "Accion no reconocida" });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    console.error("[BANCO] Error:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    await cerrarConexion(connection);
  }
}
