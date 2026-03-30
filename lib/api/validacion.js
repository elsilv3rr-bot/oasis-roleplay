// VALIDAR INPUTS //

// SANITIZAR STRING //
function sanitizar(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
}

// VALIDAR USUARIO //
// Entre 3 y 30, solo let, nums, - y _

function validarUsuario(username) {
  if (!username || username.length === 0) {
    return { valido: false, error: "El nombre de usuario es obligatorio" };
  }
  if (username.length < 3 || username.length > 30) {
    return { valido: false, error: "El nombre de usuario debe tener entre 3 y 30 caracteres" };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valido: false, error: "El usuario solo puede contener letras, numeros, guiones y guiones bajos" };
  }
  return { valido: true, error: null };
}

// VALIDAR CONTRAs //
// Min 6, max 100
function validarContrasena(password) {
  if (!password || password.length === 0) {
    return { valido: false, error: "La contrasena es obligatoria" };
  }
  if (password.length < 6) {
    return { valido: false, error: "La contrasena debe tener al menos 6 caracteres" };
  }
  if (password.length > 100) {
    return { valido: false, error: "La contrasena es demasiado larga" };
  }
  return { valido: true, error: null };
}

export { sanitizar, validarUsuario, validarContrasena };
