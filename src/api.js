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
};

