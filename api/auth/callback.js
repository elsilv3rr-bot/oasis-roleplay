// CALLBACK DISC OAUTH2 //
// Discord envia aqui despues de autorizar //
// Intercambia el codigo por un token, obtiene datos del usuario //
// Crea o actualiza el usuario en la base de datos //
// Genera un jwt y redirige al frontend //

import { crearConexion, cerrarConexion } from "../../lib/api/database.js";
import { aplicarHeaders } from "../../lib/api/seguridad.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  aplicarHeaders(res);
  
  console.log("[CALLBACK] INICIO CALLBACK DISCORD ");
  console.log("[CALLBACK] Timestamp:", new Date().toISOString());
  console.log("[CALLBACK] Query params:", req.query);

  const requiredEnv = [
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_REDIRECT_URI",
    "JWT_SECRET",
    "FRONTEND_URL",
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    console.error("[CALLBACK] Faltan variables de entorno:", missingEnv);
    return res.writeHead(302, { Location: "/?error=discord_env_incompleto" }).end();
  }
  
  console.log("[CALLBACK] Variables de entorno configuradas");
  console.log("[CALLBACK] FRONTEND_URL:", process.env.FRONTEND_URL);

  // OBTENER CODIGO DE AUTORIZACION //
  const { code } = req.query;

  if (!code) {
    console.error("[CALLBACK] No hay código de autorización");
    return res.writeHead(302, { Location: "/?error=sin_codigo" }).end();
  }
  
  console.log("[CALLBACK] Codigo recibido:", code.substring(0, 20) + "...");

  let connection;

  try {
    // INTERCAMBIAR CODIGO POR TOKEN DE ACCESO //
    console.log("[CALLBACK] Intercambiando codigo por token de Discord...");
    
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.text();
      console.error("[CALLBACK] Error en respuesta de Discord:", tokenRes.status, errorData);
      return res.writeHead(302, { Location: "/?error=token_error" }).end();
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[CALLBACK] No se obtuvo access_token:", tokenData);
      return res.writeHead(302, { Location: "/?error=token_invalido" }).end();
    }
    
    console.log("[CALLBACK] Token de Discord obtenido");

    // OBTENER DATOS DEL USUARIO DE DISCORD //
    console.log("[CALLBACK] Obteniendo datos del usuario de Discord...");
    
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userRes.json();

    if (!discordUser.id) {
      console.error("[CALLBACK] No se obtuvo ID de usuario:", discordUser);
      return res.writeHead(302, { Location: "/?error=usuario_invalido" }).end();
    }
    
    console.log("[CALLBACK] Datos de usuario obtenidos. Discord ID:", discordUser.id);

    // DATOS DEL USUARIO //
    const discordId = discordUser.id;
    const username = discordUser.username;
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : null;

    // CREAR O ACTUALIZAR USUARIO EN BASE DE DATOS //
    console.log("[CALLBACK] Conectando a la base de datos...");
    
    connection = await crearConexion();
    console.log("[CALLBACK] Conexion a BD establecida");

    // Verificar si el usuario ya existe //
    console.log("[CALLBACK] Verificando si el usuario existe en la BD...");
    
    const [rows] = await connection.execute(
      "SELECT id, discord_id, username, avatar FROM users WHERE discord_id = ?",
      [discordId]
    );

    let userId;

    if (rows.length === 0) {
      // CREAR USUARIO NUEVO //
      console.log("[CALLBACK] Creando usuario nuevo en la BD...");
      
      const [result] = await connection.execute(
        "INSERT INTO users (discord_id, username, avatar) VALUES (?, ?, ?)",
        [discordId, username, avatar]
      );
      userId = result.insertId;
      console.log("[CALLBACK] Usuario creado. ID:", userId);
    } else {
      // ACTUALIZAR DATOS EXISTENTES //
      console.log("[CALLBACK] Actualizando usuario existente...");
      
      userId = rows[0].id;
      await connection.execute(
        "UPDATE users SET username = ?, avatar = ? WHERE discord_id = ?",
        [username, avatar, discordId]
      );
      console.log("[CALLBACK] Usuario actualizado. ID:", userId);
    }

    // GENERAR JWT //
    console.log("[CALLBACK] Generando JWT...");
    
    const token = jwt.sign(
      {
        userId: userId,
        discordId: discordId,
        username: username,
        avatar: avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log("[CALLBACK] JWT generado");

    // REDIRIGIR AL FRONTEND CON EL TOKEN //
    const frontendUrl = process.env.FRONTEND_URL || "";
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;
    
    console.log("[CALLBACK] Redirigiendo a:", redirectUrl);
    console.log("[CALLBACK] ========== FIN CALLBACK - EXITOSO ==========");
    
    res.writeHead(302, {
      Location: redirectUrl,
    });
    res.end();
  } catch (err) {
    console.error("[CALLBACK] ERROR EN CALLBACK:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    console.error("[CALLBACK] ========== FIN CALLBACK - ERROR ==========");
    res.writeHead(302, { Location: "/?error=servidor" }).end();
  } finally {
    await cerrarConexion(connection);
  }
}
