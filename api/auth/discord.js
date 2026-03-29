// RUTA DE LOGIN CON DISCORD //
// Redirige al usuario a la pantalla de autorizacion de Discord //

export default function handler(req, res) {
  // PARAMETROS DE OAUTH2 //
  const requiredEnv = ["DISCORD_CLIENT_ID", "DISCORD_REDIRECT_URI"];
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length > 0) {
    console.error("Variables de entorno faltantes:", missingEnv);
    return res.status(500).json({
      error: "Faltan variables de entorno de Discord",
      missing: missingEnv,
    });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const scope = "identify";

  // CONSTRUIR URL DE AUTORIZACION //
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
  });

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  
  console.log("Iniciando OAuth Discord con URL:", discordAuthUrl);

  // REDIRIGIR AL USUARIO A DISCORD //
  res.writeHead(302, { Location: discordAuthUrl });
  res.end();
}
