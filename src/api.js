// CLIENTE HTTP PARA DISCORD OAUTH2 //
// Funciones para autenticacion con Discord //

const API_URL = "/api";

// OBTENER TOKEN GUARDADO //
function getToken() {
  return localStorage.getItem("discord_token");
}

// GUARDAR TOKEN //

function setToken(token) {
  localStorage.setItem("discord_token", token);
}

// ELIMINAR TOKEN (LOGOUT) //
function removeToken() {
  localStorage.removeItem("discord_token");
  localStorage.removeItem("discord_user");
}

// INICIAR LOGIN CON DISCORD //
// Redirige al usuario a Discord para autorizar //
function iniciarLoginDiscord() {
  window.location.href = `${API_URL}/auth/discord`;
}

// OBTENER USUARIO ACTUAL //
// Verifica el JWT con el backend y retorna los datos //
async function obtenerUsuario() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      removeToken();
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

// REGISTRAR PERSONAJE //
async function registrarPersonaje(payload) {
  const token = getToken();

  if (!token) {
    throw new Error("Sesion expirada. Inicia sesion con Discord de nuevo.");
  }

  const res = await fetch(`${API_URL}/character`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "No se pudo registrar el personaje");
  }

  return data;
}

// OBTENER ESTADO DE SLOTS DE PERSONAJE //
// slots desbloqueados/bloqueados y personaje asociado por slot //
async function obtenerSlotsPersonajes() {
  const token = getToken();
  if (!token) return { slots: [] };

  const res = await fetch(`${API_URL}/character`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "No se pudieron obtener los slots");
  }

  return {
    slots: Array.isArray(data.slots) ? data.slots : [],
    character: data.character || null,
  };
}

// DESBLOQUEAR SLOT DE PERSONAJE //
async function desbloquearSlotPersonaje(slotNumber) {
  const token = getToken();

  if (!token) {
    throw new Error("Sesion expirada. Inicia sesion con Discord de nuevo.");
  }

  const res = await fetch(`${API_URL}/character-slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ slotNumber }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "No se pudo desbloquear el slot");
  }

  return data;
}

// OBTENER PERSONAJE DEL USUARIO AUTENTICADO //
async function obtenerPersonaje() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/character`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.character) return data.character;

    // Compatibilidad: si no hay campo character, busca el primero desde slots //
    if (Array.isArray(data.slots)) {
      const slotConPersonaje = data.slots.find((slot) => slot?.character);
      return slotConPersonaje ? slotConPersonaje.character : null;
    }

    return data.character || null;
  } catch {
    return null;
  }
}

// CERRAR SESION //
function cerrarSesion() {
  removeToken();
  localStorage.removeItem("usuario");
  window.location.href = "/";
}

// OBTENER SALDO ACTUAL DEL PERSONAJE DESDE LA BASE DE DATOS //
async function obtenerSaldoDB(slotNumber = 1) {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/banco?slotNumber=${slotNumber}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return typeof data.dinero === "number" ? data.dinero : null;
  } catch {
    return null;
  }
}

// TRANSFERIR DINERO A OTRO PERSONAJE POR STATEID //
async function transferirDineroDB(toStateId, amount, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada. Inicia sesion de nuevo.");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "transfer", toStateId, amount, slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al realizar la transferencia");
  return data;
}

// DEBITAR DINERO DEL PERSONAJE (COMPRAS, MULTAS, ETCETC) //
async function debitarDineroDB(amount, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada. Inicia sesion de nuevo.");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "debit", amount, slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al debitar dinero");
  return data;
}

// ============ ADMIN API ============ //

// Verificar si el usuario es admin //
async function verificarAdmin() {
  const token = getToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/admin?accion=verificar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.esAdmin === true;
  } catch {
    return false;
  }
}

// Obtener datos del panel admin //
async function obtenerDatosAdmin(accion, params = "") {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/admin?accion=${accion}${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener datos admin");
  return data;
}

// Ejecutar accion admin //
async function accionAdmin(payload) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const body = {
    ...payload,
    webAdmin: true,
  };

  const res = await fetch(`${API_URL}/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error en accion admin");
  return data;
}

// ============ POLICIA API ============ //

// Consulta policial //
async function consultaPolicial(accion, params = "", slotNumber = 1) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(
    `${API_URL}/policia?accion=${accion}&slotNumber=${slotNumber}${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en consulta policial");
  return data;
}

// Accion policial //
async function accionPolicial(payload) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/policia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error en accion policial");
  return data;
}

// ============ RECOMPENSAS API ============ //

// Obtener estado de recompensa diaria //
async function obtenerRecompensaDiaria(slotNumber = 1) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/recompensas?slotNumber=${slotNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al consultar recompensa");
  return data;
}

// Cobrar recompensa diaria //
async function cobrarRecompensaDiaria(slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/recompensas?slotNumber=${slotNumber}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Error al cobrar recompensa");
    if (typeof data.proximoCobroEnSegundos === "number") {
      err.proximoCobroEnSegundos = data.proximoCobroEnSegundos;
    }
    throw err;
  }
  return data;
}

// ============ VEHICULOS REGISTRO API ============ //

// Registrar vehiculo legalmente //
async function registrarVehiculoDB(nombreVehiculo, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "registrar_vehiculo", nombre_vehiculo: nombreVehiculo, slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al registrar vehiculo");
  return data;
}

// ============ MULTAS API ============ //

// Obtener multas pendientes //
async function obtenerMultasDB(slotNumber = 1) {
  const token = getToken();
  if (!token) return { multas: [], cargos: [] };

  const res = await fetch(`${API_URL}/banco?accion=multas&slotNumber=${slotNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) return { multas: [], cargos: [] };
  return data;
}

// Pagar multa //
async function pagarMultaDB(multaId, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "pagar_multa", multa_id: multaId, slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al pagar multa");
  return data;
}

// Pagar todas las multas //
async function pagarTodasMultasDB(slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "pagar_todas", slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al pagar multas");
  return data;
}

async function obtenerCatalogoVehiculos() {
  const token = getToken();
  if (!token) return { vehiculos: [] };

  const res = await fetch(`${API_URL}/banco?accion=tienda_catalogo`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al obtener catalogo");
  return data;
}

async function obtenerItemsMercado() {
  const token = getToken();
  if (!token) return { items: [] };

  const res = await fetch(`${API_URL}/banco?accion=tienda_items`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al obtener items del mercado");
  return data;
}

async function sincronizarCatalogoVehiculos(vehiculos) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "tienda_sincronizar_catalogo", vehiculos }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al sincronizar catalogo");
  return data;
}

async function sincronizarItemsMercado(items) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "tienda_sincronizar_items", items }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al sincronizar items");
  return data;
}

async function comprarVehiculoTienda(vehiculoId, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "tienda_comprar_vehiculo", vehiculoId, slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al comprar vehiculo");
  return data;
}

async function comprarItemTienda(itemId, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "tienda_comprar_item", itemId, slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al comprar item");
  return data;
}

async function obtenerEstadoCasino(slotNumber = 1) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/banco?accion=casino_estado&slotNumber=${slotNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al consultar casino");
  return data;
}

async function comprarEntradaCasino(slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: "casino_comprar_entrada", slotNumber }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al comprar entrada");
  return data;
}

async function jugarCasino(accion, apuesta, extra = {}, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: accion, apuesta, slotNumber, ...extra }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al jugar");
  return data;
}

async function obtenerEstadoCrypto(slotNumber = 1) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/banco?accion=crypto_estado&slotNumber=${slotNumber}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error al consultar crypto");
  return data;
}

async function operarCrypto(accion, moneda, cantidad, slotNumber = 1) {
  const token = getToken();
  if (!token) throw new Error("Sesion expirada");

  const res = await fetch(`${API_URL}/banco`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: accion === "comprar" ? "crypto_comprar" : "crypto_vender",
      moneda,
      cantidad,
      slotNumber,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error en operacion crypto");
  return data;
}

export {
  getToken,
  setToken,
  removeToken,
  iniciarLoginDiscord,
  obtenerUsuario,
  obtenerSlotsPersonajes,
  desbloquearSlotPersonaje,
  obtenerPersonaje,
  registrarPersonaje,
  cerrarSesion,
  obtenerSaldoDB,
  transferirDineroDB,
  debitarDineroDB,
  verificarAdmin,
  obtenerDatosAdmin,
  accionAdmin,
  consultaPolicial,
  accionPolicial,
  obtenerRecompensaDiaria,
  cobrarRecompensaDiaria,
  registrarVehiculoDB,
  obtenerMultasDB,
  pagarMultaDB,
  pagarTodasMultasDB,
  obtenerCatalogoVehiculos,
  obtenerItemsMercado,
  sincronizarCatalogoVehiculos,
  sincronizarItemsMercado,
  comprarVehiculoTienda,
  comprarItemTienda,
  obtenerEstadoCasino,
  comprarEntradaCasino,
  jugarCasino,
  obtenerEstadoCrypto,
  operarCrypto,
};

