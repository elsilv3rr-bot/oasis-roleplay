// VERIFICAR EL SERVS //
// get /api/health
// vercel serverless function

import { aplicarHeaders } from "../lib/api/seguridad.js";

export default function handler(req, res) {
  aplicarHeaders(res);

  const requiredEnv = [
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "DISCORD_REDIRECT_URI",
    "JWT_SECRET",
    "FRONTEND_URL",
    "SSH_HOST",
    "SSH_USER",
    "SSH_PRIVATE_KEY_BASE64",
    "DB_HOST",
    "DB_NAME",
    "DB_USER",
    "DB_PASS",
  ];

  const configured = requiredEnv.every((key) => !!process.env[key]);

  return res.json({
    status: configured ? "ok" : "degraded",
    servidor: "Oasis RolePlay API",
    timestamp: new Date().toISOString(),
    envConfigured: configured,
  });
}
