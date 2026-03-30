//  CONEXION SSH + MARIADB - Base de datos en servidor propiedad de https://duohnson.com/ //
// SSH a MariaDB a vercel serverless functions //

import { Client } from "ssh2";
import mysql from "mysql2/promise";

const SSH_PASSPHRASE = (
  process.env.SSH_PRIVATE_KEY_PASSPHRASE ||
  process.env.SSH_PASSPHRASE ||
  ""
).trim();

//  CONFIG //
const SSH_CONFIG = {
  host: process.env.SSH_HOST || process.env.IP,
  port: parseInt(process.env.SSH_PORT) || 22,
  username: process.env.SSH_USER,
  privateKey: process.env.SSH_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.SSH_PRIVATE_KEY_BASE64, "base64")
    : undefined,
  passphrase: SSH_PASSPHRASE || undefined,
};

const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || "",
  charset: "utf8mb4",
};

const SSH_FORWARD_HOST = DB_CONFIG.host === "127.0.0.1" ? "localhost" : DB_CONFIG.host;

// TUNNEL SSH Y CONEXION DB //
function crearConexion() {
  return new Promise((resolve, reject) => {
    console.log("[SSH] Iniciando conexion SSH...");
    console.log("[SSH] Debug vars:", {
      hasPrivateKey: !!SSH_CONFIG.privateKey,
      hasPassphrase: !!SSH_CONFIG.passphrase,
      passphraseLength: SSH_CONFIG.passphrase ? SSH_CONFIG.passphrase.length : 0,
    });
    const ssh = new Client();

    ssh.on("ready", () => {
      console.log("[SSH] Cliente SSH listo");
      // Redirigir //
      ssh.forwardOut(
        "127.0.0.1", 0,
        SSH_FORWARD_HOST, DB_CONFIG.port,
        async (err, stream) => {
          if (err) {
            ssh.end();
            console.error("[SSH] Error en forwardOut:", err.message);
            return reject(new Error("Error en SSH forwardOut: " + err.message));
          }

          console.log("[SSH] Forward creado hacia", SSH_FORWARD_HOST);
          try {
            // Conexion SSH como socket //
            console.log("[DB] Conectando a MariaDB...");
            const connection = await mysql.createConnection({
              ...DB_CONFIG,
              stream: stream,
            });

            console.log("[DB] Conectado a MariaDB");
            // Guardar y cerrar despues //
            connection.__ssh = ssh;
            resolve(connection);
          } catch (dbErr) {
            ssh.end();
            console.error("[DB] Error conectando a MariaDB:", dbErr.message);
            reject(new Error("Error conectando a MariaDB: " + dbErr.message));
          }
        }
      );
    });

    ssh.on("error", (err) => {
      console.error("[SSH] Error en conexion SSH:", err.message);
      reject(new Error("Error en conexion SSH: " + err.message));
    });

    // Timeout de 15 segundos (aumentado de 10)
    try {
      ssh.connect({
        ...SSH_CONFIG,
        readyTimeout: 15000,
      });
    } catch (err) {
      console.error("[SSH] Error al iniciar conexion SSH:", err.message);
      reject(new Error("Error iniciando SSH: " + err.message));
    }
  });
}

//  CERRAR CONEXION // Importante!
async function cerrarConexion(connection) {
  if (!connection) return;
  try {
    await connection.end();
  } catch (_) {}
  try {
    if (connection.__ssh) connection.__ssh.end();
  } catch (_) {}
}

export { crearConexion, cerrarConexion };
