// VERIFICAR EL SERVS //
// get /api/health
// vercel serverless function

import { aplicarHeaders } from "./_lib/seguridad.js";

export default function handler(req, res) {
  aplicarHeaders(res);

  const sshPassphraseRaw =
    process.env.SSH_PRIVATE_KEY_PASSPHRASE ||
    process.env.SSH_PASSPHRASE ||
    "";
  const sshPassphraseTrimmed = sshPassphraseRaw.trim();
  
  const checks = {
    status: "ok",
    servidor: "Oasis RolePlay API",
    environment: {
      DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
      DISCORD_REDIRECT_URI: !!process.env.DISCORD_REDIRECT_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      FRONTEND_URL: !!process.env.FRONTEND_URL,
      SSH_HOST: !!process.env.SSH_HOST,
      SSH_USER: !!process.env.SSH_USER,
      SSH_PRIVATE_KEY_BASE64: !!process.env.SSH_PRIVATE_KEY_BASE64,
      SSH_PRIVATE_KEY_PASSPHRASE: !!process.env.SSH_PRIVATE_KEY_PASSPHRASE,
      SSH_PASSPHRASE: !!process.env.SSH_PASSPHRASE,
      SSH_PASSPHRASE_EFFECTIVE: !!sshPassphraseTrimmed,
      DB_HOST: !!process.env.DB_HOST,
      DB_NAME: !!process.env.DB_NAME,
      DB_USER: !!process.env.DB_USER,
      DB_PASS: !!process.env.DB_PASS,
    },
    debug: {
      sshPassphraseRawLength: sshPassphraseRaw.length,
      sshPassphraseTrimmedLength: sshPassphraseTrimmed.length,
    },
    urls: {
      DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || "No configurado",
      FRONTEND_URL: process.env.FRONTEND_URL || "No configurado",
    }
  };
  
  return res.json(checks);
}
