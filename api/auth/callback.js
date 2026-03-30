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

  const requiredEnv = [
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_REDIRECT_URI",
    "JWT_SECRET",
    "FRONTEND_URL",
  ];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    console.error("[CALLBACK] Faltan variables de entorno");
    return res.writeHead(302, { Location: "/?error=discord_env_incompleto" }).end();
  }

  // OBTENER CODIGO DE AUTORIZACION //
  const { code } = req.query;

  if (!code) {
    return res.writeHead(302, { Location: "/?error=sin_codigo" }).end();
  }

  let connection;

  try {
    // INTERCAMBIAR CODIGO POR TOKEN DE ACCESO //
    
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
      console.error("[CALLBACK] Error token exchange:", tokenRes.status);
      return res.writeHead(302, { Location: "/?error=token_error" }).end();
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("[CALLBACK] No access_token received");
      return res.writeHead(302, { Location: "/?error=token_invalido" }).end();
    }

    // OBTENER DATOS DEL USUARIO DE DISCORD //
    
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const discordUser = await userRes.json();

    if (!discordUser.id) {
      console.error("[CALLBACK] No se obtuvo ID de usuario");
      return res.writeHead(302, { Location: "/?error=usuario_invalido" }).end();
    }

    // DATOS DEL USUARIO //
    const discordId = discordUser.id;
    const username = discordUser.username;
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : null;

    // CREAR O ACTUALIZAR USUARIO EN BASE DE DATOS //
    connection = await crearConexion();

    // Verificar si el usuario ya existe //
    const [rows] = await connection.execute(
      "SELECT id, discord_id, username, avatar FROM users WHERE discord_id = ?",
      [discordId]
    );

    let userId;

    if (rows.length === 0) {
      // CREAR USUARIO NUEVO //
      const [result] = await connection.execute(
        "INSERT INTO users (discord_id, username, avatar) VALUES (?, ?, ?)",
        [discordId, username, avatar]
      );
      userId = result.insertId;
    } else {
      // ACTUALIZAR DATOS EXISTENTES //
      userId = rows[0].id;
      await connection.execute(
        "UPDATE users SET username = ?, avatar = ? WHERE discord_id = ?",
        [username, avatar, discordId]
      );
    }

    // GENERAR JWT //
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

    // REDIRIGIR AL FRONTEND CON EL TOKEN //
    const frontendUrl = process.env.FRONTEND_URL || "";
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;
    
    res.writeHead(302, {
      Location: redirectUrl,
    });
    res.end();
  } catch (err) {
    console.error("[CALLBACK] ERROR:", err.message);
    res.writeHead(302, { Location: "/?error=servidor" }).end();
  } finally {
    await cerrarConexion(connection);
  }
}
