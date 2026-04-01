import React from "react"
import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom"
import { iniciarLoginDiscord, obtenerSlotsPersonajes, desbloquearSlotPersonaje, obtenerUsuario, registrarPersonaje, setToken, cerrarSesion, obtenerSaldoDB, transferirDineroDB, verificarAdmin, obtenerDatosAdmin, accionAdmin, consultaPolicial, accionPolicial, obtenerRecompensaDiaria, cobrarRecompensaDiaria, registrarVehiculoDB, obtenerMultasDB, pagarMultaDB, pagarTodasMultasDB, obtenerCatalogoVehiculos, obtenerItemsMercado, sincronizarCatalogoVehiculos, sincronizarItemsMercado, comprarVehiculoTienda, comprarItemTienda, obtenerEstadoCasino, comprarEntradaCasino, jugarCasino, obtenerEstadoCrypto, operarCrypto, obtenerCatalogoTiendaCompleto } from "./api"
import Misiones from "./modules/misiones/Misiones"
import Facciones from "./modules/facciones/Facciones"
import Leaderboard from "./modules/leaderboard/Leaderboard"
import MercadoP2P from "./modules/mercadop2p/MercadoP2P"
import Eventos from "./modules/eventos/Eventos"
import "./App.css"

function AppIcon({ name, size = 20, className = "" }) {
  const iconProps = {
    className: ["app-icon", className].filter(Boolean).join(" "),
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
  };

  switch (name) {
    case "discord":
      return (
        <svg className={["app-icon", className].filter(Boolean).join(" ")} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>
      );
    case "id-card":
      return (
        <svg {...iconProps}>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <circle cx="8" cy="12" r="2.2" />
          <path d="M13 10h4" />
          <path d="M13 13h5" />
        </svg>
      );
    case "card":
      return (
        <svg {...iconProps}>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <path d="M3 10.5h18" />
          <path d="M7 15h3" />
        </svg>
      );
    case "box":
      return (
        <svg {...iconProps}>
          <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
          <path d="M4 7l8 4 8-4" />
          <path d="M12 11v10" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...iconProps}>
          <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5a2 2 0 0 1 2-2Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );
    case "store":
      return (
        <svg {...iconProps}>
          <path d="M4 10h16" />
          <path d="M5 10l1.5-5h11L19 10" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "chip":
      return (
        <svg {...iconProps}>
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M9 3v4" />
          <path d="M15 3v4" />
          <path d="M9 17v4" />
          <path d="M15 17v4" />
          <path d="M3 9h4" />
          <path d="M3 15h4" />
          <path d="M17 9h4" />
          <path d="M17 15h4" />
        </svg>
      );
    case "eye":
      return (
        <svg {...iconProps}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...iconProps}>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.3A11.8 11.8 0 0 1 12 6c6.5 0 10 6 10 6a17.6 17.6 0 0 1-3.2 3.9" />
          <path d="M6.7 6.8A17.5 17.5 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.3-.8" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...iconProps}>
          <rect x="3" y="7" width="18" height="12" rx="2.5" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          <path d="M3 12h18" />
        </svg>
      );
    case "send":
      return (
        <svg {...iconProps}>
          <path d="M21 3 10 14" />
          <path d="m21 3-7 18-4-7-7-4 18-7Z" />
        </svg>
      );
    case "copy":
      return (
        <svg {...iconProps}>
          <rect x="9" y="9" width="10" height="11" rx="2" />
          <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "user-plus":
      return (
        <svg {...iconProps}>
          <circle cx="10" cy="8" r="3" />
          <path d="M4 18a6 6 0 0 1 12 0" />
          <path d="M19 8v6" />
          <path d="M16 11h6" />
        </svg>
      );
    case "close":
      return (
        <svg {...iconProps}>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case "car":
      return (
        <svg {...iconProps}>
          <path d="M5 16h14" />
          <path d="m7 16 1.5-5h7L17 16" />
          <path d="M6 16v2" />
          <path d="M18 16v2" />
          <circle cx="8" cy="16" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
        </svg>
      );
    case "document":
      return (
        <svg {...iconProps}>
          <path d="M8 3h6l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v4h4" />
          <path d="M10 12h6" />
          <path d="M10 16h6" />
        </svg>
      );
    case "backpack":
      return (
        <svg {...iconProps}>
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          <rect x="5" y="8" width="14" height="12" rx="3" />
          <path d="M9 12h6" />
          <path d="M8 8h8" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...iconProps}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      );
    case "money":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8" />
          <path d="M9.5 10.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 2-1.1 2-2.5 2-2.5.9-2.5 2 1.1 2 2.5 2 2.5-.9 2.5-2" />
        </svg>
      );
    case "scale":
      return (
        <svg {...iconProps}>
          <path d="M12 4v16" />
          <path d="M7 7h10" />
          <path d="m7 7-3 5h6L7 7Z" />
          <path d="m17 7-3 5h6l-3-5Z" />
          <path d="M8 20h8" />
        </svg>
      );
    case "check":
      return (
        <svg {...iconProps}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...iconProps}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "gun":
      return (
        <svg {...iconProps}>
          <path d="M4 10h8l5-3v4l-3 1 1 3h-3l-1-3H8v3H4Z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...iconProps}>
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="17" cy="19" r="1.5" />
          <path d="M3 5h2l2.3 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...iconProps}>
          <path d="M12 3l7 4v5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V7l7-4Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "crown":
      return (
        <svg {...iconProps}>
          <path d="M2 17l3-8 5 4 2-10 2 10 5-4 3 8H2Z" />
          <path d="M4 17h16v2H4z" />
        </svg>
      );
    case "gift":
      return (
        <svg {...iconProps}>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <rect x="5" y="12" width="14" height="8" rx="1" />
          <path d="M12 8v12" />
          <path d="M12 8c-2-2-5-2.5-5 0s3 2 5 2" />
          <path d="M12 8c2-2 5-2.5 5 0s-3 2-5 2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    case "target":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "users":
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...iconProps}>
          <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
          <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
          <path d="M4 22h16" />
          <path d="M10 22V8a6 6 0 0 0 4 0v14" />
          <path d="M6 5v4c0 3.3 2.7 6 6 6s6-2.7 6-6V5" />
        </svg>
      );
    case "handshake":
      return (
        <svg {...iconProps}>
          <path d="M11 17l-1 4-4-1 1-4" />
          <path d="M13 17l1 4 4-1-1-4" />
          <path d="M2 9l5-5 3 3 2-2 2 2 3-3 5 5" />
          <path d="M2 9l7 7h6l7-7" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...iconProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      );
    default:
      return null;
  }
}

/* ================== APP ================== */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/expediente" element={<Expediente />} />
    </Routes>
  );
}

/* ================== HOME ================== */
function Home() {
  const navigate = useNavigate();
  const [error, setError] = React.useState("");

  // VERIFICAR SI YA ESTA AUTENTICADO //
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setError("Error al iniciar sesion con Discord. Intenta de nuevo.");
    }

    const verificar = async () => {
      const user = await obtenerUsuario();
      if (user) {
        // GUARDAR DATOS DE DISCORD EN LOCALSTORAGE //
        localStorage.setItem("discord_user", JSON.stringify(user));

        // Siempre se redirige al selector para soportar multiples personajes //
        navigate("/registro");
      }
    };
    verificar();
  }, [navigate]);

  // INICIAR SESION CON DISCORD //
  const entrar = () => {
    iniciarLoginDiscord();
  };

return (
  <div className="home-container">

    {/* VIDEO FONDO */}
    <video className="video-bg" autoPlay loop muted playsInline preload="auto">
      <source src="/video/video.mp4" type="video/mp4" />
    </video>

    {/* CONTENIDO */}
    <div className="home-content">

      <div className="home-card">
        <h1>¡BIENVENIDO A OASIS ROLEPLAY!</h1>

        {error && <div className="discord-error">{error}</div>}

        <button className="discord-btn" onClick={entrar}>
          <span className="discord-icon-wrap" aria-hidden="true">
            <svg className="discord-login-icon" viewBox="0 0 24 24" role="img" focusable="false">
              <path
                fill="currentColor"
                d="M17.54 7.18a12.05 12.05 0 0 0-2.8-.9l-.14.28a8.4 8.4 0 0 0-3.2 0l-.14-.28c-.98.16-1.92.46-2.8.9A10.67 10.67 0 0 0 6.3 15.3c.87.63 1.84 1.09 2.87 1.36l.4-.66c-.47-.17-.92-.39-1.34-.65.11-.09.22-.19.33-.29 2.26 1.06 4.62 1.06 6.88 0 .11.1.22.2.33.29-.42.26-.87.48-1.34.65l.4.66a10.2 10.2 0 0 0 2.87-1.36 10.67 10.67 0 0 0-2.16-8.12Zm-6.53 6.46a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm3.98 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
              />
            </svg>
          </span>
          Iniciar con Discord
        </button>

      </div>

    </div>

  </div>
);
}

/* AUTH CALLBACK  */
// Recibe jwt desde url despues de Discord OAuth //
function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/?error=sin_token");
      return;
    }

    // GUARDAR TOKEN Y VERIFICAR USUARIO //
    setToken(token);

    const verificar = async () => {
      const user = await obtenerUsuario();
      if (user) {
        localStorage.setItem("discord_user", JSON.stringify(user));
        // Siempre se muestra el selector de slots tras autenticacion.
        navigate("/registro");
      } else {
        navigate("/?error=token_invalido");
      }
    };

    verificar();
  }, [navigate, searchParams]);

  return (
    <div className="registro-container">
      <div className="registro-card" style={{ textAlign: "center" }}>
        <h2>Autenticando...</h2>
        <p>Conectando con Discord...</p>
      </div>
    </div>
  );
}

/* ================== REGISTRO ================== */
function Registro() {
  const navigate = useNavigate();

  const [slots, setSlots] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(true);
  const [selectedSlot, setSelectedSlot] = React.useState(1);
  const [nombre, setNombre] = React.useState("");
  const [edad, setEdad] = React.useState("");
  const [nacionalidad, setNacionalidad] = React.useState("");
  const [feedback, setFeedback] = React.useState(null);
  const [savingCharacter, setSavingCharacter] = React.useState(false);
  const [unlockingSlot, setUnlockingSlot] = React.useState(null);

  // Carga inicial: valida sesion y obtiene slots/personajes disponibles //
  React.useEffect(() => {
    const cargarDatos = async () => {
      try {
        const user = await obtenerUsuario();
        if (!user) {
          navigate("/");
          return;
        }

        localStorage.setItem("discord_user", JSON.stringify(user));

        const slotsResult = await obtenerSlotsPersonajes();
        const loadedSlots = Array.isArray(slotsResult.slots) ? slotsResult.slots : [];
        setSlots(loadedSlots);

        // Se selecciona por defecto el primer slot libre/desbloqueado //
        const firstEmptyUnlocked = loadedSlots.find((slot) => slot.isUnlocked && !slot.character);
        const firstUnlocked = loadedSlots.find((slot) => slot.isUnlocked);
        if (firstEmptyUnlocked) {
          setSelectedSlot(firstEmptyUnlocked.slotNumber);
        } else if (firstUnlocked) {
          setSelectedSlot(firstUnlocked.slotNumber);
        }
      } catch (error) {
        setFeedback({ type: "error", text: error.message || "No se pudieron cargar los slots" });
      } finally {
        setLoadingSlots(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  //  StateID de 4 digitos para registro inicial del personaje //
  const generarStateID = React.useCallback(() => {
    const numero = Math.floor(1000 + Math.random() * 9000);
    return numero.toString().padStart(4, "0");
  }, []);

  // activo para mantener compatibilidad con la pantalla de expediente //
  const seleccionarPersonaje = React.useCallback((character) => {
    localStorage.setItem("usuario", JSON.stringify(character));
    localStorage.setItem("active_slot_number", String(character.slotNumber));
    navigate("/expediente");
  }, [navigate]);

  const selectedSlotData = React.useMemo(
    () => slots.find((slot) => slot.slotNumber === selectedSlot) || null,
    [slots, selectedSlot]
  );

  // refresh slots despues de crear personaje o desbloquear slot //
  const recargarSlots = React.useCallback(async () => {
    const slotsResult = await obtenerSlotsPersonajes();
    setSlots(Array.isArray(slotsResult.slots) ? slotsResult.slots : []);
    return slotsResult;
  }, []);

  const enviarDatos = async () => {
    if (!selectedSlotData || !selectedSlotData.isUnlocked) {
      setFeedback({ type: "error", text: "Debes seleccionar un slot desbloqueado" });
      return;
    }

    if (selectedSlotData.character) {
      setFeedback({ type: "error", text: "Este slot ya tiene un personaje" });
      return;
    }

    if (!nombre || !edad || !nacionalidad) {
      setFeedback({ type: "error", text: "Completa todos los campos para crear el personaje" });
      return;
    }

    setSavingCharacter(true);
    setFeedback(null);

    try {
      const result = await registrarPersonaje({
        slotNumber: selectedSlot,
        stateId: generarStateID(),
        nombre,
        edad,
        nacionalidad,
        rol: "civil",
      });

      await recargarSlots();

      if (result?.character) {
        setFeedback({ type: "success", text: "Personaje creado correctamente. Ingresando..." });
        seleccionarPersonaje(result.character);
        return;
      }

      setFeedback({ type: "success", text: "Personaje creado correctamente" });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "No se pudo crear el personaje" });
    } finally {
      setSavingCharacter(false);
    }
  };

  // Compra de slot con feedback inmediato de exito o error //
  const desbloquearSlot = async (slotNumber) => {
    setUnlockingSlot(slotNumber);
    setFeedback(null);

    try {
      const result = await desbloquearSlotPersonaje(slotNumber);
      setSlots(Array.isArray(result.slots) ? result.slots : []);
      setSelectedSlot(slotNumber);
      setFeedback({ type: "success", text: result.message || `Slot ${slotNumber} desbloqueado` });
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "No se pudo desbloquear el slot" });
    } finally {
      setUnlockingSlot(null);
    }
  };

  return (
    <div className="registro-container">
      <video className="video-bg" autoPlay loop muted playsInline preload="auto">
        <source src="/video/video.mp4" type="video/mp4" />
      </video>

      <div className="registro-overlay" />

      <div className="registro-layout">
        <aside className="registro-showcase">
          <div className="registro-showcase-panel registro-showcase-shop">
            <div className="registro-panel-head">
              <span className="registro-panel-kicker">Tienda</span>
              <h3>Vehículos destacados</h3>
            </div>

            <a
              className="registro-shop-card"
              href="/expediente"
              onClick={(event) => {
                event.preventDefault();
                navigate("/expediente");
              }}
            >
              <img src="/autos/Marin.png" alt="Wolfsburgo Marin" className="registro-shop-image" />
              <div className="registro-shop-content">
                <span className="registro-shop-tag">Tienda Oficial</span>
                <strong>Wolfsburgo Marin</strong>
                <span>Ver catálogo completo y comprar autos dentro del juego.</span>
              </div>
            </a>
          </div>

          <div className="registro-showcase-panel">
            <div className="registro-panel-head">
              <span className="registro-panel-kicker">VIP</span>
              <h3>Mejora tu experiencia</h3>
            </div>

            <div className="registro-vip-list">
              <a className="registro-vip-card ruby" href="https://www.roblox.com/catalog/118394118154104" target="_blank" rel="noreferrer">
                <span className="registro-vip-name">VIP Ruby</span>
                <span className="registro-vip-link">Abrir en Roblox</span>
              </a>

              <a className="registro-vip-card zafiro" href="https://www.roblox.com/catalog/103769339745826" target="_blank" rel="noreferrer">
                <span className="registro-vip-name">VIP Zafiro</span>
                <span className="registro-vip-link">Abrir en Roblox</span>
              </a>

              <a className="registro-vip-card diamante" href="https://www.roblox.com/es/catalog/80266207412414/VIP-Diamante-Oasis-RP" target="_blank" rel="noreferrer">
                <span className="registro-vip-name">VIP Diamante</span>
                <span className="registro-vip-link">Abrir en Roblox</span>
              </a>
            </div>
          </div>
        </aside>

        <section className="registro-selector-panel">
          <div className="registro-selector-card">
            <div className="registro-selector-header">
              <span className="registro-panel-kicker">Usuarios</span>
              <h2>Bienvenido a Oasis Roleplay</h2>
              <p className="registro-subtitle">Selecciona un personaje para continuar o crea uno nuevo en un slot libre.</p>
            </div>

            {feedback && (
              <div className={`registro-feedback ${feedback.type === "success" ? "ok" : "error"}`}>
                {feedback.text}
              </div>
            )}

            <div className="character-slots-grid">
              {loadingSlots && <div className="slot-loading">Cargando slots...</div>}

              {!loadingSlots && slots.map((slot) => {
                const isCurrentSelection = selectedSlot === slot.slotNumber;

                if (!slot.isUnlocked) {
                  return (
                    <div key={slot.slotNumber} className="slot-card locked">
                      <div className="slot-header">
                        <span>Personaje {slot.slotNumber}</span>
                        <AppIcon name="lock" size={16} />
                      </div>
                      <p className="slot-title">Slot bloqueado</p>
                      <p className="slot-meta">Precio: ${slot.unlockCost.toLocaleString("es-CL")}</p>
                      <button
                        className="portal-button"
                        onClick={() => desbloquearSlot(slot.slotNumber)}
                        disabled={unlockingSlot === slot.slotNumber}
                      >
                        {unlockingSlot === slot.slotNumber ? "Desbloqueando..." : "Desbloquear"}
                      </button>
                    </div>
                  );
                }

                if (slot.character) {
                  return (
                    <div key={slot.slotNumber} className={`slot-card ${isCurrentSelection ? "active" : ""}`}>
                      <div className="slot-header">
                        <span>Personaje {slot.slotNumber}</span>
                        <span className="slot-badge">Activo</span>
                      </div>
                      <h4 className="slot-title">{slot.character.nombre}</h4>
                      <p className="slot-meta">State ID: {slot.character.stateId}</p>
                      <p className="slot-meta">Saldo: ${Number(slot.character.dinero || 0).toLocaleString("es-CL")}</p>
                      <button className="portal-button" onClick={() => seleccionarPersonaje(slot.character)}>
                        Entrar con este personaje
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={slot.slotNumber}
                    className={`slot-card empty ${isCurrentSelection ? "active" : ""}`}
                    onClick={() => setSelectedSlot(slot.slotNumber)}
                  >
                    <div className="slot-header">
                      <span>Personaje {slot.slotNumber}</span>
                      <span className="slot-badge">Libre</span>
                    </div>
                    <p className="slot-title">Crear personaje</p>
                    <p className="slot-meta">Selecciona este slot para registrarlo.</p>
                  </button>
                );
              })}
            </div>

            {selectedSlotData?.isUnlocked && !selectedSlotData?.character && (
              <div className="registro-form-wrap">
                <h3>Crear personaje en Personaje {selectedSlot}</h3>

                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Edad"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Nacionalidad"
                  value={nacionalidad}
                  onChange={(e) => setNacionalidad(e.target.value)}
                />

                <button className="portal-button" onClick={enviarDatos} disabled={savingCharacter}>
                  {savingCharacter ? "Guardando..." : "Finalizar Registro"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================== EXPEDIENTE ================== */
function Expediente() {
  const navigate = useNavigate();
  const [datos, setDatos] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  });

  // DATOS DE DISCORD DEL USUARIO //
  const discordUser = JSON.parse(localStorage.getItem("discord_user") || "null");

  // ESTADO DEL PANEL FLOTANTE DE DISCORD //
  const [discordPanelOpen, setDiscordPanelOpen] = React.useState(false);

  React.useEffect(() => {
    const verificarAcceso = async () => {
      if (!discordUser) {
        navigate("/");
        return;
      }

      // Se respeta el slot activo guardado por el selector de personajes.
      const activeSlotNumber = Number.parseInt(localStorage.getItem("active_slot_number") || "1", 10);
      const slotsResult = await obtenerSlotsPersonajes();
      const slots = Array.isArray(slotsResult.slots) ? slotsResult.slots : [];
      const activeSlot = slots.find((slot) => slot.slotNumber === activeSlotNumber && slot.character);
      const firstAvailable = slots.find((slot) => slot.character);
      const selectedCharacter = activeSlot?.character || firstAvailable?.character || null;

      if (!selectedCharacter) {
        localStorage.removeItem("usuario");
        setDatos(null);
        navigate("/registro");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(selectedCharacter));
      localStorage.setItem("active_slot_number", String(selectedCharacter.slotNumber));
      setDatos(selectedCharacter);
    };

    verificarAcceso();
  }, [discordUser, navigate]);

  if (!datos) return null;

  // ================== SECCIONES (sidebar) ==================
const secciones = [
  { id: "identidad", label: "Identidad", icon: "id-card" },
  { id: "finanzas", label: "Finanzas", icon: "card" },
  { id: "pertenencias", label: "Pertenencias", icon: "box" },
  { id: "municipalidad", label: "Gestión de Multas", icon: "receipt" },
  { id: "tienda", label: "Mercado", icon: "store" },
  { id: "casino", label: "Casino", icon: "crown" },
  { id: "crypto", label: "Crypto", icon: "money" },
  { id: "recompensas", label: "Collect Diario", icon: "gift" },
  { id: "misiones", label: "Misiones", icon: "target" },
  { id: "facciones", label: "Facciones", icon: "users" },
  { id: "leaderboard", label: "Rankings", icon: "trophy" },
  { id: "mercadop2p", label: "Mercado P2P", icon: "handshake" },
  { id: "eventos", label: "Eventos", icon: "calendar" },
];

  // Seccion policia: solo visible si el rol es policia //
  const esPolicia = datos.rol === "policia";

  if (esPolicia) {
    secciones.push({ id: "policia", label: "Policía", icon: "shield" });
  }

  const [active, setActive] = React.useState("identidad");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [tiendaTab, setTiendaTab] = React.useState("vehiculos");
  const [compraSeleccionada, setCompraSeleccionada] = React.useState(null);
  const [vehiculoPreview, setVehiculoPreview] = React.useState(null);
  const [registrarLegalmente, setRegistrarLegalmente] = React.useState(false);
  const [compraEnProceso, setCompraEnProceso] = React.useState(false);
  const [compraCompletada, setCompraCompletada] = React.useState(false);

  const [toast, setToast] = React.useState(null);

  // Estado admin //
  const [esAdminUsuario, setEsAdminUsuario] = React.useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = React.useState(false);

  // Verificar admin al cargar //
  React.useEffect(() => {
    verificarAdmin().then(setEsAdminUsuario).catch(() => {});
  }, []);

  const [vehiculosTienda, setVehiculosTienda] = React.useState([]);
  const [documentosTienda, setDocumentosTienda] = React.useState([]);
  const [armasTienda, setArmasTienda] = React.useState([]);
  const [tiendaCargando, setTiendaCargando] = React.useState(true);

const cargarCatalogoTienda = React.useCallback(async () => {
  try {
    const data = await obtenerCatalogoTiendaCompleto();
    setVehiculosTienda(data.vehiculos);
    const docs = data.items.filter((item) => String(item.tipo) === "documento");
    const armas = data.items.filter((item) => String(item.tipo) === "arma");
    setDocumentosTienda(docs);
    setArmasTienda(armas);
  } catch {
    // Silenciar errores de carga
  } finally {
    setTiendaCargando(false);
  }
}, []);

React.useEffect(() => {
  cargarCatalogoTienda();
}, [cargarCatalogoTienda]);

React.useEffect(() => {
  const id = setInterval(() => {
    cargarCatalogoTienda();
  }, 20000);
  return () => clearInterval(id);
}, [cargarCatalogoTienda]);

const registrarLogAdmin = (accion) => {
  const logs = JSON.parse(localStorage.getItem("admin_logs")) || [];

  logs.push({
    id: Date.now(),
    admin: datos.nombre,
    accion,
    fecha: new Date().toLocaleString("es-CL"),
  });

  localStorage.setItem("admin_logs", JSON.stringify(logs));
};

const banearJugador = () => {
  const banned = JSON.parse(localStorage.getItem("banned_users")) || [];

  if (!banned.includes(adminTarget)) {
    banned.push(adminTarget);
    localStorage.setItem("banned_users", JSON.stringify(banned));

    registrarLogAdmin(`Baneó a ${adminTarget}`);
  }
};

const verInventarioAdmin = () => {
  const key = `pertenencias_${adminTarget}`;
  const data = JSON.parse(localStorage.getItem(key));

  if (!data) return alert("Jugador no encontrado");

  alert(JSON.stringify(data, null, 2));
};

useEffect(() => {
  const banned = JSON.parse(localStorage.getItem("banned_users")) || [];

  if (banned.includes(datos.nombre)) {
    alert("Estás baneado.");
    localStorage.clear();
    window.location.reload();
  }
}, []);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSectionChange = (sectionId) => {
    setActive(sectionId);
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  // ================== REGISTRO DE STATEIDs EXISTENTES ==================
  React.useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("stateIDs")) || [];
    if (datos?.stateId && !lista.includes(datos.stateId)) {
      lista.push(datos.stateId);
      localStorage.setItem("stateIDs", JSON.stringify(lista));
    }
  }, [datos?.stateId]);

  // ================== MULTAS (Identidad / Municipalidad) ==================
  const [multasState, setMultasState] = React.useState([]);
  const [cargosState, setCargosState] = React.useState([]);
  const multasPendientesState = React.useMemo(
    () => multasState.filter((multa) => !multa.pagada),
    [multasState]
  );

  const cargarMultas = React.useCallback(async () => {
    try {
      const data = await obtenerMultasDB(datos.slotNumber || 1);
      setMultasState(Array.isArray(data?.multas) ? data.multas : []);
      setCargosState(Array.isArray(data?.cargos) ? data.cargos : []);
    } catch {
      setMultasState([]);
      setCargosState([]);
    }
  }, [datos.slotNumber]);

  React.useEffect(() => {
    cargarMultas();
  }, [cargarMultas]);

  const estadoJudicial = (multasState.length > 0 || cargosState.length > 0) ? "CON ANTECEDENTES" : "LIMPIO";

  // ================== PERTENENCIAS ==================
  const pertenenciasKey = `pertenencias_${datos.nombre}`;
  const defaultPertenencias = { vehiculos: [], documentos: [], mochila: [] };

  const licenciasKey = `licencias_${datos.nombre}`;

const [licencias, setLicencias] = React.useState(() => {
  const saved = localStorage.getItem(licenciasKey);
  return saved ? JSON.parse(saved) : [];
});

React.useEffect(() => {
  localStorage.setItem(licenciasKey, JSON.stringify(licencias));
}, [licencias]);

  const [pertenencias, setPertenencias] = React.useState(() => {
    const saved = localStorage.getItem(pertenenciasKey);
    const parsed = saved ? JSON.parse(saved) : defaultPertenencias;
    return {
      vehiculos: Array.isArray(parsed?.vehiculos) ? parsed.vehiculos : [],
      documentos: Array.isArray(parsed?.documentos) ? parsed.documentos : [],
      mochila: Array.isArray(parsed?.mochila) ? parsed.mochila : [],
    };
  });

  React.useEffect(() => {
    localStorage.setItem(pertenenciasKey, JSON.stringify(pertenencias));
  }, [pertenencias, pertenenciasKey]);

  const [subTab, setSubTab] = React.useState("vehiculos");

  // ================== BANCO (Finanzas) ==================
  const bankKey = `bank_${datos.stateId}`;

  const defaultBank = React.useMemo(
  () => ({
    titular: datos.nombre,
    stateId: datos.stateId,
    accounts: [
      {
        id: "principal",
        name: "Cuenta Principal",
        balance: 20000, // dinero inicial
      },
    ],
    activeAccountId: "principal",
    contacts: [],
    transactions: [
      {
        id: Date.now(),
        type: "deposit",
        amount: 20000,
        description: "Bono inicial del Estado",
        date: new Date().toLocaleDateString("es-US"),
      },
    ],
    hideBalance: true,
    brand: "Oasis Bank",
  }),
  [datos.nombre, datos.stateId]
);

  const [bank, setBank] = React.useState(() => {
    const saved = localStorage.getItem(bankKey);
    return saved ? JSON.parse(saved) : defaultBank;
  });

  React.useEffect(() => {
    localStorage.setItem(bankKey, JSON.stringify(bank));
  }, [bank, bankKey]);

  const activeAccount =
    bank.accounts?.find((a) => a.id === bank.activeAccountId) ||
    bank.accounts?.[0];

  const formatUSD = (n) =>
    "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0 });

  const profesionActual = String(datos?.rol || "civil").trim();
  const profesionLabel = profesionActual
    ? profesionActual.charAt(0).toUpperCase() + profesionActual.slice(1)
    : "Ciudadano";

  // SINCRONIZAR SALDO CON DB AL CARGAR //
  React.useEffect(() => {
    const slotNumber = datos?.slotNumber || 1;
    obtenerSaldoDB(slotNumber).then((dinero) => {
      if (dinero !== null) {
        setBank((prev) => ({
          ...prev,
          accounts: prev.accounts.map((a) =>
            a.id === "principal" ? { ...a, balance: dinero } : a
          ),
        }));
      }
    }).catch(() => {});
  }, [datos?.slotNumber]);

  const toggleHideBalance = () => {
    setBank((prev) => ({ ...prev, hideBalance: !prev.hideBalance }));
  };

  const setActiveAccount = (id) => {
    setBank((prev) => ({ ...prev, activeAccountId: id }));
  };

  // ================== COMPRA TIENDA (SIMPLIFICADO) ==================
const comprarVehiculo = async () => {
  if (!compraSeleccionada || compraEnProceso) return;

  setCompraEnProceso(true);
  setCompraCompletada(false);

  try {
    const precio = Number(compraSeleccionada.precio);

    const cuentaActiva =
      bank.accounts.find((a) => a.id === bank.activeAccountId) ||
      bank.accounts?.[0];

    if (!cuentaActiva) return alert("No hay cuenta activa.");
    if (cuentaActiva.balance < precio)
      return alert("Saldo insuficiente.");

    let result;
    try {
      result = await comprarVehiculoTienda(compraSeleccionada.id, datos.slotNumber || 1);
    } catch (err) {
      return alert(err.message || "Error al procesar el pago.");
    }

    // Descontar del banco
    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId
          ? { ...a, balance: result.dinero }
          : a
      ),
      transactions: [
        {
          id: Date.now(),
          type: "COMPRA_VEHICULO",
          from: cuentaActiva.name,
          to: "Tienda Oficial",
          amount: precio,
          motivo: `Compra vehículo: ${result?.vehiculo?.nombre || compraSeleccionada.nombre}`,
          date: new Date().toLocaleString("es-US"),
        },
        ...prev.transactions,
      ],
    }));

    let matriculaAsignada = null;

    // Agregar a pertenencias
    if (compraSeleccionada.tipo === "licencia") {
      setLicencias((prev) => [
        ...prev,
        {
          id: Date.now(),
          nombre: compraSeleccionada.nombre,
          emitida: new Date().toLocaleDateString("es-US")
        }
      ]);
    } else {
      if (registrarLegalmente) {
        try {
          const regResult = await registrarVehiculoDB(compraSeleccionada.nombre, datos.slotNumber || 1);
          matriculaAsignada = regResult.matricula;
          // Actualizar saldo con el debito extra //
          if (regResult.dinero !== undefined) {
            setBank((prev) => ({
              ...prev,
              accounts: prev.accounts.map((a) =>
                a.id === prev.activeAccountId
                  ? { ...a, balance: regResult.dinero }
                  : a
              ),
            }));
          }
        } catch (err) {
          // No interrumpir la compra si falla el registro //
          console.error("Error al registrar vehículo:", err);
        }
      }

      const nuevoVehiculo = {
        id: Date.now(),
        itemUid: result?.vehiculo?.itemUid,
        nombre: result?.vehiculo?.nombre || compraSeleccionada.nombre,
        precio: Number(result?.vehiculo?.precio || precio),
        imagen: result?.vehiculo?.imagen || compraSeleccionada.imagen,
        estado: matriculaAsignada ? "REGISTRADO" : "INSCRITO",
        matricula: matriculaAsignada || null,
        comprado: new Date().toLocaleString("es-US")
      };

      setPertenencias((prev) => ({
        ...prev,
        vehiculos: [...(prev.vehiculos || []), nuevoVehiculo],
      }));
    }

    await cargarCatalogoTienda();

    // Toast
    setToast({ type: "success", message: matriculaAsignada ? `Vehículo comprado y registrado: ${matriculaAsignada}` : "Vehículo comprado con éxito" });
    setTimeout(() => setToast(null), 4000);

    setCompraCompletada(true);
    setTimeout(() => {
      setCompraSeleccionada(null);
      setRegistrarLegalmente(false);
      setCompraCompletada(false);
    }, 700);
  } finally {
    setCompraEnProceso(false);
  }
};

const comprarDocumento = async () => {
  if (!compraSeleccionada || compraEnProceso) return;

  setCompraEnProceso(true);
  setCompraCompletada(false);

  try {
    const precio = Number(compraSeleccionada.precio);

    const cuentaActiva =
      bank.accounts.find((a) => a.id === bank.activeAccountId) ||
      bank.accounts?.[0];

    if (!cuentaActiva) {
      alert("No hay cuenta activa.");
      return;
    }

    if (cuentaActiva.balance < precio) {
      alert("Saldo insuficiente.");
      return;
    }

    let result;
    try {
      result = await comprarItemTienda(compraSeleccionada.id, datos.slotNumber || 1);
    } catch (err) {
      return alert(err.message || "Error al procesar el pago.");
    }

    // Descontar dinero
    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId
          ? { ...a, balance: result.dinero }
          : a
      ),
    }));

    // Agregar a pertenencias
    const nuevoDoc = {
      id: Date.now(),
      tipo: compraSeleccionada.nombre,
      itemUid: result?.item?.itemUid,
      emitida: new Date().toLocaleDateString("es-US"),
      vence: "Indefinido",
    };

    setPertenencias((prev) => ({
      ...prev,
      documentos: [...(prev.documentos || []), nuevoDoc],
    }));

    await cargarItemsMercado();

    // Toast
    setToast({
      type: "success",
      message: "Documento comprado con éxito",
    });

    setTimeout(() => setToast(null), 3000);

    setCompraCompletada(true);
    setTimeout(() => {
      setCompraSeleccionada(null);
      setCompraCompletada(false);
    }, 700);
  } finally {
    setCompraEnProceso(false);
  }
};

const comprarArma = async () => {
  if (!compraSeleccionada || compraEnProceso) return;

  setCompraEnProceso(true);
  setCompraCompletada(false);

  try {
    const precio = Number(compraSeleccionada.precio);

    const cuentaActiva =
      bank.accounts.find((a) => a.id === bank.activeAccountId) ||
      bank.accounts?.[0];

    if (!cuentaActiva) return alert("No hay cuenta activa.");
    if (cuentaActiva.balance < precio)
      return alert("Saldo insuficiente.");

    let result;
    try {
      result = await comprarItemTienda(compraSeleccionada.id, datos.slotNumber || 1);
    } catch (err) {
      return alert(err.message || "Error al procesar el pago.");
    }

    // Descontar banco
    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId
          ? { ...a, balance: result.dinero }
          : a
      ),
    }));

    // Agregar a mochila
    const nuevaArma = {
      id: Date.now(),
      nombre: compraSeleccionada.nombre,
      tipo: "arma",
      itemUid: result?.item?.itemUid,
    };

    setPertenencias((prev) => ({
      ...prev,
      mochila: [...(prev.mochila || []), nuevaArma],
    }));

    await cargarItemsMercado();

    setToast({
      type: "success",
      message: "Arma comprada con éxito",
    });

    setTimeout(() => setToast(null), 3000);

    setCompraCompletada(true);
    setTimeout(() => {
      setCompraSeleccionada(null);
      setCompraCompletada(false);
    }, 700);
  } finally {
    setCompraEnProceso(false);
  }
};

const comprarItem = async () => {
  if (!compraSeleccionada) return;

  const precio = Number(compraSeleccionada.precio);

  const cuentaActiva =
    bank.accounts.find((a) => a.id === bank.activeAccountId) ||
    bank.accounts?.[0];

  if (!cuentaActiva) {
    alert("No hay cuenta activa.");
    return;
  }

  if (cuentaActiva.balance < precio) {
    alert("Saldo insuficiente.");
    return;
  }

  // SI ES LICENCIA → verificar duplicado antes de cobrar //
  if (compraSeleccionada.tipo === "licencia") {
    const yaExiste = licencias.some(
      (l) => l.nombre === compraSeleccionada.nombre
    );
    if (yaExiste) {
      alert("Ya tienes esta licencia.");
      setCompraSeleccionada(null);
      return;
    }
  }

  let result;
  try {
    result = await comprarItemTienda(compraSeleccionada.id, datos.slotNumber || 1);
  } catch (err) {
    return alert(err.message || "Error al procesar el pago.");
  }

  // DESCONTAR DINERO
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: result.dinero }
        : a
    ),
    transactions: [
      {
        id: Date.now(),
        type: "COMPRA",
        from: cuentaActiva.name,
        to: "Tienda Oficial",
        amount: precio,
        motivo: `Compra: ${compraSeleccionada.nombre}`,
        date: new Date().toLocaleString("es-US"),
      },
      ...prev.transactions,
    ],
  }));

  // SI ES LICENCIA → AGREGAR A PERTENENCIAS
  if (compraSeleccionada.tipo === "licencia") {
    const nuevaLicencia = {
      id: Date.now(),
      nombre: compraSeleccionada.nombre,
      emitida: new Date().toLocaleDateString("es-US"),
    };

    setLicencias((prev) => [...prev, nuevaLicencia]);

    setPertenencias((prev) => ({
      ...prev,
      documentos: [
        ...(prev.documentos || []),
        {
          id: Date.now(),
          tipo: compraSeleccionada.nombre,
          emitida: new Date().toLocaleDateString("es-US"),
          vence: "Indefinido",
        },
      ],
    }));
  }

  // SI ES VEHICULO
  if (!compraSeleccionada.tipo) {
    setPertenencias((prev) => ({
      ...prev,
      vehiculos: [
        ...(prev.vehiculos || []),
        {
          ...compraSeleccionada,
          estado: "Activo",
          patente: "SIN ASIGNAR",
        },
      ],
    }));
  }

  // TOAST
  setToast({
    type: "success",
    message: "Compra realizada con éxito",
  });

  setTimeout(() => setToast(null), 3000);

  // CERRAR MODAL
  setCompraSeleccionada(null);
};

  // ================== MODALES FINANZAS ==================
  const [openTransfer, setOpenTransfer] = React.useState(false);
  const [openContact, setOpenContact] = React.useState(false);

  const [fromAccountId, setFromAccountId] = React.useState(bank.activeAccountId);
  const [stateIdDest, setStateIdDest] = React.useState("");
  const [monto, setMonto] = React.useState("");
  const [motivo, setMotivo] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  React.useEffect(() => {
    setFromAccountId(bank.activeAccountId);
  }, [bank.activeAccountId]);

  const copyDatos = async () => {
    const text = `Titular: ${bank.titular}\nCuenta: ${activeAccount?.name}\nStateID: ${bank.stateId}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Datos copiados");
    } catch {
      alert("No pude copiar. (Permisos del navegador)");
    }
  };

  const addContact = () => {
    const nombre = document.getElementById("contactName")?.value?.trim();
    const stateId = document.getElementById("contactStateId")?.value?.trim();

    if (!nombre || !stateId) return alert("Completa Nombre y StateID");

    setBank((prev) => {
      const exists = prev.contacts.some((c) => c.stateId === stateId);
      if (exists) return prev;

      return {
        ...prev,
        contacts: [...prev.contacts, { id: Date.now(), name: nombre, stateId }],
      };
    });

    setOpenContact(false);
  };

  const submitTransfer = async () => {
    const amount = Number(String(monto).replace(/[^\d]/g, ""));
    if (!amount || amount <= 0) return alert("Monto inválido");

    const from = bank.accounts.find((a) => a.id === fromAccountId);
    if (!from) return;

    if (from.balance < amount) return alert("Saldo insuficiente");

    const stateId = stateIdDest.trim();
    if (!stateId) return alert("Ingresa StateID destinatario");

    if (stateId === bank.stateId) return alert("No puedes transferirte a ti mismo.");

    const ok = confirm(`¿Enviar ${formatUSD(amount)} al StateID ${stateId}?`);
    if (!ok) return;

    let result;
    try {
      result = await transferirDineroDB(stateId, amount, datos.slotNumber || 1);
    } catch (err) {
      return alert(err.message || "Error al transferir. Intenta de nuevo.");
    }

    setBank((prev) => {
      const newAccounts = prev.accounts.map((a) =>
        a.id === fromAccountId ? { ...a, balance: result.dinero } : a
      );

      const tx = {
        id: Date.now(),
        type: "TERCEROS",
        from: from.name,
        to: stateId,
        amount,
        motivo: motivo?.trim() || "",
        date: new Date().toLocaleString("en-US"),
      };

      return { ...prev, accounts: newAccounts, transactions: [tx, ...prev.transactions] };
    });

    setOpenTransfer(false);
    setStateIdDest("");
    setMonto("");
    setMotivo("");

    setSuccessMessage("Transferencia realizada con éxito");
    setTimeout(() => setSuccessMessage(""), 2500);
  };

  // ================== MUNICIPALIDAD: PAGAR MULTAS ==================
  const parseMonto = (m) => Number(String(m ?? "").replace(/[^\d]/g, "")) || 0;
  const totalMultas = multasPendientesState.reduce((acc, m) => acc + parseMonto(m.monto), 0);

  const pagarMulta = async (multaId) => {
    const multa = multasPendientesState.find((m) => m.id === multaId);
    if (!multa) return;

    const amount = parseMonto(multa.monto);
    if (amount <= 0) return alert("Monto inválido");

    const from = bank.accounts.find((a) => a.id === bank.activeAccountId);
    if (!from) return;

    if (from.balance < amount) return alert("Saldo insuficiente en tu cuenta.");

    const ok = confirm(`¿Pagar multa por ${formatUSD(amount)}?`);
    if (!ok) return;

    let result;
    try {
      result = await pagarMultaDB(multaId, datos.slotNumber || 1);
    } catch (err) {
      return alert(err.message || "Error al pagar la multa. Intenta de nuevo.");
    }

    if (typeof result?.dinero !== "number" || result.dinero < 0) {
      return alert("Error: respuesta del servidor invalida al pagar multa.");
    }

    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId ? { ...a, balance: result.dinero } : a
      ),
      transactions: [
        {
          id: Date.now(),
          type: "PAGO_MULTA",
          from: from.name,
          to: "Municipalidad",
          amount,
          motivo: multa.motivo || "Pago de multa",
          date: new Date().toLocaleString("en-US"),
        },
        ...prev.transactions,
      ],
    }));

    await cargarMultas();
  };

  const pagarTodo = async () => {
    if (multasPendientesState.length === 0) return;

    const amount = totalMultas;
    const from = bank.accounts.find((a) => a.id === bank.activeAccountId);
    if (!from) return;

    if (from.balance < amount) return alert("Saldo insuficiente para pagar todo.");

    const ok = confirm(`¿Pagar TODAS las multas por ${formatUSD(amount)}?`);
    if (!ok) return;

    let result;
    try {
      result = await pagarTodasMultasDB(datos.slotNumber || 1);
    } catch (err) {
      return alert(err.message || "Error al pagar las multas. Intenta de nuevo.");
    }

    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId ? { ...a, balance: result.dinero } : a
      ),
      transactions: [
        {
          id: Date.now(),
          type: "PAGO_MULTAS_TOTAL",
          from: from.name,
          to: "Municipalidad",
          amount,
          motivo: "Pago total de multas",
          date: new Date().toLocaleString("en-US"),
        },
        ...prev.transactions,
      ],
    }));

    await cargarMultas();
  };

  // ================== UI ==================
  return (
    <div className="expediente-layout">

      {/* TOAST GLOBAL — fuera de cualquier stacking context para que aparezca sobre el sidebar */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            <AppIcon name={toast.type === "error" ? "close" : "check"} size={16} />
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* BOTON FLOTANTE DE DISCORD (IZQUIERDA) */}
      <div className="discord-flotante">
        <button
          className="discord-flotante-btn"
          onClick={() => setDiscordPanelOpen(!discordPanelOpen)}
        >
          {discordUser?.avatar ? (
            <img
              className="discord-flotante-avatar"
              src={discordUser.avatar}
              alt="Avatar"
            />
          ) : (
            <AppIcon name="discord" size={20} />
          )}
          <span>DISCORD</span>
        </button>

        {/* BOTON ADMIN (al lado de Discord) */}
        {esAdminUsuario && (
          <button
            className="admin-flotante-btn"
            onClick={() => { setAdminPanelOpen(true); setActive("admin"); }}
          >
            <AppIcon name="settings" size={18} />
            <span>ADMIN</span>
          </button>
        )}

        {/* PANEL DESPLEGABLE */}
        {discordPanelOpen && (
          <div className="discord-panel">
            <div className="discord-panel-header">
              {discordUser?.avatar && (
                <img
                  className="discord-panel-avatar"
                  src={discordUser.avatar}
                  alt="Avatar"
                />
              )}
              <div className="discord-panel-info">
                <div className="discord-panel-username">{discordUser?.username}</div>
                <div className="discord-panel-id">ID: {discordUser?.discordId}</div>
              </div>
            </div>
            <button className="discord-panel-logout" onClick={cerrarSesion}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      <div className="mobile-expediente-nav">
        <div className="mobile-expediente-brand">
          <img
            className="mobile-expediente-logo"
            src="/logo/logo.png"
            alt="Logo"
            onError={(e) => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = "1";
                e.currentTarget.src = "/logo.png";
                return;
              }
              e.currentTarget.style.display = "none";
            }}
          />
          <span>Expediente</span>
        </div>
        <button
          type="button"
          className="mobile-expediente-toggle"
          aria-label="Abrir menu del expediente"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`mobile-expediente-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* SIDEBAR (derecha) */}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <img
            className="sidebar-logo"
            src="/logo/logo.png"
            alt="Logo"
            onError={(e) => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = "1";
                e.currentTarget.src = "/logo.png";
                return;
              }
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="sidebar-title">Oasis RolePlay</div>
        </div>

        <div className="sidebar-divider" />

        <ul className="sidebar-menu">
          {secciones.map((s) => (
            <li
              key={s.id}
              className={`sidebar-item ${active === s.id ? "active" : ""}`}
              onClick={() => handleSectionChange(s.id)}
            >
              <span className="sidebar-icon">
                <AppIcon name={s.icon} size={18} />
              </span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-divider bottom" />
      </aside>

      {/* MAIN */}
      <main className="expediente-main">
        <h1 className="expediente-title">
          {secciones.find((s) => s.id === active)?.label}
        </h1>

        <div className="right-list-card">
          {/* ================= IDENTIDAD ================= */}
          {active === "identidad" && (
            <div className="identidad-grid">
              <div className="mini-card">
                <h3>Identidad</h3>
                <ul className="right-list">
                  <li><strong>Nombre:</strong> {datos.nombre}</li>
                  <li><strong>Edad:</strong> {datos.edad}</li>
                  <li><strong>Nacionalidad:</strong> {datos.nacionalidad}</li>
                  <li><strong>StateID:</strong> {datos.stateId}</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3>Licencias Activas</h3>
                <ul className="right-list">
  {licencias.length === 0 ? (
    <li>Sin licencias</li>
  ) : (
    licencias.map((lic) => (
      <li key={lic.id}>
        {lic.nombre} — Emitida: {lic.emitida}
      </li>
    ))
  )}
</ul>
              </div>

              <div className="mini-card mini-card-wide">
                <h3>Hoja de Vida</h3>
                {multasState.length === 0 && cargosState.length === 0 ? (
                  <p>Sin registros judiciales.</p>
                ) : (
                  <>
                    {multasState.map((multa) => (
                      <div key={`multa_${multa.id}`} className="multa-item">
                        <p><strong>Tipo:</strong> Multa</p>
                        <p><strong>Fecha:</strong> {multa.fecha}</p>
                        <p><strong>Motivo:</strong> {multa.motivo}</p>
                        <p><strong>Monto:</strong> {multa.monto}</p>
                        <p><strong>Estado:</strong> {multa.pagada ? "Pagada" : "Pendiente"}</p>
                        <hr />
                      </div>
                    ))}
                    {cargosState.map((cargo) => (
                      <div key={`cargo_${cargo.id}`} className="multa-item">
                        <p><strong>Tipo:</strong> Cargo judicial</p>
                        <p><strong>Fecha:</strong> {cargo.fecha}</p>
                        <p><strong>Cargo:</strong> {cargo.cargo}</p>
                        <p><strong>Gravedad:</strong> {cargo.gravedad}</p>
                        <hr />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mini-card">
                <h3>Estado Judicial</h3>
                <p className={`estado ${estadoJudicial === "LIMPIO" ? "limpio" : "con-antecedentes"}`}>
                  {estadoJudicial}
                </p>
                {estadoJudicial === "LIMPIO" ? (
                  <span>Sin antecedentes penales.</span>
                ) : (
                  <span>Posee multas y/o cargos judiciales registrados.</span>
                )}
              </div>
            </div>
          )}

          {/* ================= FINANZAS ================= */}
          {active === "finanzas" && (
            <div className="bank-wrap">
              {successMessage && <div className="success-toast">{successMessage}</div>}

              <div className="bank-topbar">
                <div className="bank-title">Banco Digital</div>
              </div>

              <div className="bank-grid">
                <div className="bank-left">
                  <div className="bank-card">
                    <div className="bank-card-row">
                      <div className="chip">
                        <AppIcon name="chip" size={16} />
                      </div>
                      <div className="bank-brand">{bank.brand}</div>
                    </div>

                    <div className="bank-label">SALDO DISPONIBLE</div>

                    <div className="bank-balance">
                      <span className="money">$</span>
                      <span className="money-amount">
                        {bank.hideBalance ? "****" : Number(activeAccount?.balance || 0).toLocaleString("en-US")}
                      </span>
                      <button className="eye" onClick={toggleHideBalance} title="Mostrar/Ocultar">
                        <AppIcon name={bank.hideBalance ? "eye" : "eye-off"} size={18} />
                      </button>
                    </div>

                    <div className="bank-card-footer">
                      <div>
                        <div className="small">TITULAR</div>
                        <div className="big">{bank.titular}</div>
                      </div>
                      <div className="right">
                        <div className="small">CUENTA / STATE ID</div>
                        <div className="big">{bank.stateId}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bank-accounts">
                    {(bank.accounts || []).map((acc) => (
                      <button
                        key={acc.id}
                        className={`acc-pill ${bank.activeAccountId === acc.id ? "active" : ""}`}
                        onClick={() => setActiveAccount(acc.id)}
                      >
                        <div className="acc-name">{acc.name.toUpperCase()}</div>
                        <div className="acc-balance">{formatUSD(acc.balance)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bank-right">
                  <div className="bank-usercard">
                    <div className="user-icon">
                      <AppIcon name="briefcase" size={20} />
                    </div>
                    <div>
                      <div className="user-title">{profesionLabel}</div>
                      <div className="user-sub">Nómina al día para {profesionLabel.toLowerCase()}.</div>
                    </div>
                  </div>

                  <div className="bank-ops">
                    <div className="ops-title">Operaciones</div>

                    <div className="ops-grid">
                      <button className="op-btn op-primary" onClick={() => setOpenTransfer(true)}>
                        <div className="op-icon">
                          <AppIcon name="send" size={20} />
                        </div>
                        <div className="op-text">Transferir</div>
                      </button>

                      <button className="op-btn" onClick={copyDatos}>
                        <div className="op-icon">
                          <AppIcon name="copy" size={20} />
                        </div>
                        <div className="op-text">Copiar Datos</div>
                      </button>

                      <button className="op-btn" onClick={() => setOpenContact(true)}>
                        <div className="op-icon">
                          <AppIcon name="user-plus" size={20} />
                        </div>
                        <div className="op-text">Nuevo Contacto</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bank-history">
                <div className="history-title">Historial de gastos e ingresos</div>

                {(bank.transactions || []).length === 0 ? (
                  <div className="history-empty">No hay movimientos registrados.</div>
                ) : (
                  <div className="history-list">
                    {(bank.transactions || []).slice(0, 15).map((tx) => {
                      const tipo = String(tx.type || "MOVIMIENTO").toUpperCase();
                      const esIngreso = ["INGRESO", "DEPOSIT", "DEPOSITO", "RECOMPENSA"].includes(tipo);
                      const montoTx = Number(tx.amount || 0);
                      const detalle = tx.motivo || tx.description || tx.to || "Sin detalle";

                      return (
                        <div key={tx.id} className="history-item">
                          <div className="history-left">
                            <div className="history-type">{tipo}</div>
                            <div className="history-date">{tx.date || "Sin fecha"}</div>
                            <div className="history-date">{detalle}</div>
                          </div>
                          <div className={`history-amount ${esIngreso ? "plus" : "minus"}`}>
                            {esIngreso ? "+" : "-"}{formatUSD(montoTx)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* MODAL TRANSFERIR */}
              {openTransfer && (
                <div className="modal-backdrop" onClick={() => setOpenTransfer(false)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-head">
                      <div className="modal-title">Transferencias</div>
                      <button className="modal-x icon-btn" onClick={() => setOpenTransfer(false)} aria-label="Cerrar transferencia">
                        <AppIcon name="close" size={18} />
                      </button>
                    </div>

                    <div className="modal-tabs">
                      <button className="tab active" style={{ width: "100%" }}>
                        A Terceros
                      </button>
                    </div>

                    <div className="modal-body">
                      <label>Cuenta de Origen</label>
                      <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
                        {(bank.accounts || []).map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({formatUSD(a.balance)})
                          </option>
                        ))}
                      </select>

                      <label>StateID Destinatario</label>
                      <input
                        value={stateIdDest}
                        onChange={(e) => setStateIdDest(e.target.value)}
                        placeholder="Ej: 1234"
                      />

                      <label>Monto</label>
                      <input value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="$ 0" />

                      <label>Motivo (Opcional)</label>
                      <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Pago de arriendo" />

                      <button className="modal-submit" onClick={submitTransfer}>
                        ENVIAR DINERO
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL CONTACTO */}
              {openContact && (
                <div className="modal-backdrop" onClick={() => setOpenContact(false)}>
                  <div className="modal small" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-head">
                      <div className="modal-title">Agregar Contacto</div>
                      <button className="modal-x icon-btn" onClick={() => setOpenContact(false)} aria-label="Cerrar contacto">
                        <AppIcon name="close" size={18} />
                      </button>
                    </div>

                    <div className="modal-body">
                      <label>Nombre del Contacto</label>
                      <input id="contactName" placeholder="Ej: Juan Mecánico" />

                      <label>StateID</label>
                      <input id="contactStateId" placeholder="Ej: 1234" />

                      <button className="modal-submit" onClick={addContact}>
                        GUARDAR CONTACTO
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= PERTENENCIAS ================= */}
          {active === "pertenencias" && (
            <div className="pertenencias-wrap">
              <div className="pertenencias-tabs">
                <button className={`tab-btn ${subTab === "vehiculos" ? "active" : ""}`} onClick={() => setSubTab("vehiculos")}>
                  <AppIcon name="car" size={18} />
                  <span>Vehículos</span>
                </button>
                <button className={`tab-btn ${subTab === "documentos" ? "active" : ""}`} onClick={() => setSubTab("documentos")}>
                  <AppIcon name="document" size={18} />
                  <span>Documentos</span>
                </button>
                <button className={`tab-btn ${subTab === "mochila" ? "active" : ""}`} onClick={() => setSubTab("mochila")}>
                  <AppIcon name="backpack" size={18} />
                  <span>Mochila</span>
                </button>
              </div>

              {subTab === "vehiculos" && (
                <div className="vehiculos-section">
                  <div className="garage-value">
                    Valor total:{" "}
                    {formatUSD((pertenencias.vehiculos || []).reduce((acc, v) => acc + (Number(v.precio) || 0), 0))}
                  </div>

                  <div className="vehiculos-grid">
                    {(pertenencias.vehiculos || []).length === 0 ? (
                      <p>No tienes vehículos.</p>
                    ) : (
                      (pertenencias.vehiculos || []).map((v) => (
                        <div key={v.id} className="vehiculo-card">
  <div><strong>{v.nombre}</strong></div>
  <div>{formatUSD(v.precio)}</div>
  {v.itemUid ? <div style={{ marginTop: 4, fontSize: 12 }}><strong>ID Mercado:</strong> {v.itemUid}</div> : null}
  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
    Estado: <strong>{v.estado}</strong>
    {v.patente ? <> · Patente: <strong>{v.patente}</strong></> : null}
    {v.color ? <> · Color: <strong>{v.color}</strong></> : null}
  </div>
</div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {subTab === "documentos" && (
  <div className="documentos-section">
    {(pertenencias.documentos || []).length === 0 ? (
      <p>No tienes documentos.</p>
    ) : (
      (pertenencias.documentos || []).map((doc) => (
        <div key={doc.id} className="doc-card">
          <h3>{doc.tipo}</h3>
          {doc.itemUid ? <p><strong>ID Mercado:</strong> {doc.itemUid}</p> : null}
          <p><strong>Nombre:</strong> {datos.nombre}</p>
          <p><strong>StateID:</strong> {datos.stateId}</p>
          <p><strong>Emitida:</strong> {doc.emitida}</p>
          <p><strong>Vence:</strong> {doc.vence}</p>
        </div>
      ))
    )}
  </div>
)}

{subTab === "mochila" && (
  <div className="mochila-section">
    <div className="mochila-grid">
      {(pertenencias.mochila || []).length === 0 ? (
        <p>Mochila vacía.</p>
      ) : (
        (pertenencias.mochila || []).map((item) => (
          <div key={item.id} className="vehicle-card">
  <div className="vehicle-image-section">
    <span className="vehicle-tag">ARMA</span>
    <img src="/armas/glock.png" alt={item.nombre} />
  </div>

  <div className="vehicle-info">
    <h3>{item.nombre}</h3>
    {item.itemUid ? <p className="stock">ID Mercado: {item.itemUid}</p> : null}
  </div>
</div>
        ))
      )}
    </div>
  </div>
)}

  </div>
)}

          {/* ================= MUNICIPALIDAD ================= */}
          {active === "municipalidad" && (
            <div className="muni-wrap">
              <div className="muni-hero">
                <div className="muni-crest" />
                <h2 className="muni-title">Oficina Virtual Municipal</h2>
                <p className="muni-subtitle">
                  Consulte y regularice su situación de multas y antecedentes.
                </p>
              </div>

              <button className="muni-back" onClick={() => setActive("identidad")}>
                <AppIcon name="arrow-left" size={18} />
                <span>Volver a Mi Expediente</span>
              </button>

              <div className="muni-grid">
                <div className="muni-card">
                  <div className="muni-card-head">
                    <span className="muni-card-icon">
                      <AppIcon name="receipt" size={18} />
                    </span>
                    <span className="muni-card-title">Multas Pendientes de Pago</span>
                  </div>

                  <div className="muni-card-body">
                    {multasPendientesState.length === 0 ? (
                      <div className="muni-empty">No tienes multas pendientes.</div>
                    ) : (
                      <div className="muni-fines">
                        {multasPendientesState.map((m) => (
                          <div key={m.id} className="muni-fine">
                            <div className="muni-fine-left">
                              <div className="muni-fine-code">{m.motivo}</div>
                              <div className="muni-fine-date">Emitido: {m.fecha}</div>
                            </div>

                            <button className="muni-pay" onClick={() => pagarMulta(m.id)}>
                              Pagar {formatUSD(parseMonto(m.monto))}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="muni-card muni-card-total">
                  <div className="muni-card-head">
                    <span className="muni-card-icon">
                      <AppIcon name="money" size={18} />
                    </span>
                    <span className="muni-card-title">Total a Pagar</span>
                  </div>

                  <div className="muni-card-body">
                    <div className="muni-total-amount">{formatUSD(totalMultas)}</div>

                    <button
                      className="muni-payall"
                      disabled={totalMultas <= 0}
                      onClick={pagarTodo}
                    >
                      Pagar Todo ({formatUSD(totalMultas)})
                    </button>

                    <div className="muni-note">
                      Se descontará desde tu cuenta activa del banco.
                    </div>
                  </div>
                </div>

                <div className="muni-card">
                  <div className="muni-card-head">
                    <span className="muni-card-icon">
                      <AppIcon name="scale" size={18} />
                    </span>
                    <span className="muni-card-title">Antecedentes Penales</span>
                  </div>

                  <div className="muni-card-body">
                    <div className={`muni-status ${estadoJudicial === "LIMPIO" ? "ok" : "bad"}`}>
                      {estadoJudicial === "LIMPIO"
                        ? "Tu expediente está limpio."
                        : "Posees antecedentes: existen multas y/o cargos judiciales registrados."}
                    </div>

                    <div className="muni-history-title">Historial</div>

                    {multasState.length === 0 && cargosState.length === 0 ? (
                      <div className="muni-empty">Sin registros.</div>
                    ) : (
                      <div className="muni-history">
                        {multasState.map((m) => (
                          <div key={`multa_${m.id}`} className="muni-history-item">
                            <div className="muni-history-top">
                              <span className="tag">Multa</span>
                              <span className="tag">{m.fecha}</span>
                              <span className="tag money">{formatUSD(parseMonto(m.monto))}</span>
                              <span className="tag">{m.pagada ? "PAGADA" : "PENDIENTE"}</span>
                            </div>
                            <div className="muni-history-motivo">{m.motivo}</div>
                          </div>
                        ))}
                        {cargosState.map((c) => (
                          <div key={`cargo_${c.id}`} className="muni-history-item">
                            <div className="muni-history-top">
                              <span className="tag">Cargo</span>
                              <span className="tag">{c.fecha}</span>
                              <span className="tag">{String(c.gravedad || "leve").toUpperCase()}</span>
                            </div>
                            <div className="muni-history-motivo">{c.cargo}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

{/* ================= TIENDA OFICIAL ================= */}
{active === "tienda" && (
  <div className="market-wrap">

    <div className="market-header">
      <h1 className="market-title">TIENDA OFICIAL</h1>
      <p className="market-sub">
        Tienda de artículos de Oasis RolePlay
      </p>
    </div>

    <div className="market-tabs">
  <button
    className={`tab-btn ${tiendaTab === "vehiculos" ? "active" : ""}`}
    onClick={() => setTiendaTab("vehiculos")}
  >
    <AppIcon name="car" size={18} />
    <span>Vehículos</span>
  </button>

  <button
    className={`tab-btn ${tiendaTab === "documentos" ? "active" : ""}`}
    onClick={() => setTiendaTab("documentos")}
  >
    <AppIcon name="document" size={18} />
    <span>Documentos</span>
  </button>

  <button
    className={`tab-btn ${tiendaTab === "armas" ? "active" : ""}`}
    onClick={() => setTiendaTab("armas")}
  >
    <AppIcon name="gun" size={18} />
    <span>Armas</span>
  </button>
</div>

    <div className="market-content">

{tiendaCargando && (
  <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>
    Cargando catálogo...
  </div>
)}

{vehiculoPreview && (
  <div className="modal-backdrop" onClick={() => setVehiculoPreview(null)}>
    <div className="vehiculo-preview-modal" onClick={(e) => e.stopPropagation()}>
      
      <div className="preview-header">
        <h2>{vehiculoPreview.nombre}</h2>
        <button className="icon-btn" onClick={() => setVehiculoPreview(null)} aria-label="Cerrar vista previa">
          <AppIcon name="close" size={18} />
        </button>
      </div>

      <div className="preview-body">
        <img 
          src={vehiculoPreview.imagen} 
          alt={vehiculoPreview.nombre} 
          className="preview-img"
        />

        <div className="preview-info">
          <p><strong>Precio:</strong> ${vehiculoPreview.precio.toLocaleString("es-US")}</p>
          <p><strong>Stock:</strong> {vehiculoPreview.stock}</p>

          <button
            className="preview-buy-btn"
            onClick={() => {
              setCompraSeleccionada({
                ...vehiculoPreview,
                tipo: "vehiculo"
              });
              setVehiculoPreview(null);
            }}
          >
            <AppIcon name="card" size={18} />
            <span>Confirmar Compra</span>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{compraSeleccionada && (
  <div className="modal-backdrop" onClick={() => {
    if (compraEnProceso) return;
    setCompraSeleccionada(null);
    setCompraCompletada(false);
  }}>
    <div className="modal-compra" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Confirmar Compra</h3>
        <button className="icon-btn" onClick={() => {
          if (compraEnProceso) return;
          setCompraSeleccionada(null);
          setCompraCompletada(false);
        }} aria-label="Cerrar compra" disabled={compraEnProceso}>
          <AppIcon name="close" size={18} />
        </button>
      </div>

      <div className="modal-body">
        <h4>{compraSeleccionada.nombre}</h4>

        <p>
          Precio: $
          {Number(compraSeleccionada.precio).toLocaleString("es-US")}
        </p>

        {compraSeleccionada.tipo === "vehiculo" && (
          <label className="registro-legal-check">
            <input type="checkbox" checked={registrarLegalmente} onChange={e => setRegistrarLegalmente(e.target.checked)} />
            Registrar legalmente (+$2,500 · incluye matrícula)
          </label>
        )}

        {compraSeleccionada.tipo === "vehiculo" && registrarLegalmente && (
          <p className="registro-legal-total">
            Total: ${(Number(compraSeleccionada.precio) + 2500).toLocaleString("es-US")}
          </p>
        )}

        <button
          className={`modal-pay ${compraEnProceso ? "is-loading" : ""} ${compraCompletada ? "is-success" : ""}`}
          disabled={compraEnProceso || compraCompletada}
          onClick={() => {
  if (compraSeleccionada.tipo === "vehiculo") {
    comprarVehiculo();
  } else if (compraSeleccionada.tipo === "documento") {
    comprarDocumento();
  } else if (compraSeleccionada.tipo === "arma") {
    comprarArma();
  }
}}
        >
          {compraCompletada ? "COMPRA EXITOSA" : compraEnProceso ? "PROCESANDO..." : "PAGAR AHORA"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* ================= DOCUMENTOS ================= */}
      {tiendaTab === "documentos" && (
        <div className="vehicle-grid">
          {documentosTienda.length === 0 && !tiendaCargando && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#aaa" }}>
              No hay documentos disponibles en la tienda.
            </div>
          )}
          {documentosTienda.map((doc) => (
            <div className="vehicle-card" key={doc.id}>
              <div className="vehicle-image-section">
                <span className="vehicle-tag">DOCUMENTO</span>
                <img src={doc.imagen} alt={doc.nombre} />
              </div>

              <div className="vehicle-info">
                <h3>{doc.nombre}</h3>
                <p className="stock">Stock: {doc.stock}</p>

                <div className="vehicle-footer">
                  <span className="vehicle-price">
                    ${doc.precio.toLocaleString("es-US")}
                  </span>

                  <button
                    className="buy-btn"
                    aria-label={`Comprar ${doc.nombre}`}
                    disabled={Number(doc.stock) <= 0}
                    onClick={() =>
                      setCompraSeleccionada({
                        ...doc,
                        tipo: "documento"
                      })
                    }
                  >
                    <AppIcon name="cart" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= VEHICULOS ================= */}
      {tiendaTab === "vehiculos" && (
        <div className="vehicle-grid">
          {vehiculosTienda.length === 0 && !tiendaCargando && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#aaa" }}>
              No hay vehículos disponibles en la tienda.
            </div>
          )}
          {vehiculosTienda.map((auto) => (
            <div className="vehicle-card" key={auto.id}>
              <div className="vehicle-image-section">
                <span className="vehicle-tag">VEHÍCULO</span>
                <img src={auto.imagen} alt={auto.nombre} />
              </div>

              <div className="vehicle-info">
                <h3>{auto.nombre}</h3>
                <p className="stock">Stock: {auto.stock}</p>

                <div className="vehicle-footer">
                  <span className="vehicle-price">
                    ${auto.precio.toLocaleString("es-US")}
                  </span>

                  <button
                    className="buy-btn"
                    aria-label={`Ver ${auto.nombre}`}
                    onClick={() => setVehiculoPreview(auto)}
                    disabled={auto.stock <= 0}
                  >
                    <AppIcon name="cart" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
            )}

      {/* ================= ARMAS ================= */}
      {tiendaTab === "armas" && (
        <div className="vehicle-grid">
          {armasTienda.length === 0 && !tiendaCargando && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#aaa" }}>
              No hay armas disponibles en la tienda.
            </div>
          )}
          {armasTienda.map((arma) => (
            <div className="vehicle-card" key={arma.id}>
              <div className="vehicle-image-section">
                <span className="vehicle-tag">ARMA</span>
                <img src={arma.imagen} alt={arma.nombre} />
              </div>

              <div className="vehicle-info">
                <h3>{arma.nombre}</h3>
                <p className="stock">Stock: {arma.stock}</p>

                <div className="vehicle-footer">
                  <span className="vehicle-price">
                    ${arma.precio.toLocaleString("es-US")}
                  </span>

                  <button
                    className="buy-btn"
                    aria-label={`Comprar ${arma.nombre}`}
                    disabled={Number(arma.stock) <= 0}
                    onClick={() =>
                      setCompraSeleccionada({
                        ...arma,
                        tipo: "arma",
                      })
                    }
                  >
                    <AppIcon name="cart" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
)}

              {active === "casino" && (
                <CasinoPanel datos={datos} setBank={setBank} />
              )}

              {active === "crypto" && (
                <CryptoPanel datos={datos} setBank={setBank} />
              )}

               {/* ================= OTRAS ================= */}
              {active !== "identidad" &&
                active !== "finanzas" &&
                active !== "pertenencias" &&
                active !== "municipalidad" &&
                active !== "tienda" &&
                active !== "casino" &&
                active !== "crypto" &&
                active !== "recompensas" &&
                active !== "policia" &&
                active !== "admin" &&
                active !== "misiones" &&
                active !== "facciones" &&
                active !== "leaderboard" &&
                active !== "mercadop2p" &&
                active !== "eventos" && (
                  <div className="right-empty">
                  </div>
                )}

              {/* ================= COLLECT DIARIO ================= */}
              {active === "recompensas" && (
                <RecompensasPanel datos={datos} setBank={setBank} />
              )}

              {/* ================= MISIONES ================= */}
              {active === "misiones" && <Misiones />}

              {/* ================= FACCIONES ================= */}
              {active === "facciones" && <Facciones slotNumber={datos.slotNumber || 1} />}

              {/* ================= LEADERBOARD ================= */}
              {active === "leaderboard" && <Leaderboard />}

              {/* ================= MERCADO P2P ================= */}
              {active === "mercadop2p" && <MercadoP2P />}

              {/* ================= EVENTOS ================= */}
              {active === "eventos" && <Eventos />}

              {/* ================= POLICIA ================= */}
              {active === "policia" && esPolicia && (
                <PoliciaPanel datos={datos} />
              )}

              {/* ================= ADMIN PANEL ================= */}
              {active === "admin" && esAdminUsuario && (
                <AdminPanel discordId={discordUser?.discordId} />
              )}
            </div> {/* right-list-card */}
          </main>
        </div>
      );
    }

/* ================== PANEL DE RECOMPENSAS (COLLECT DIARIO) ================== */
function RecompensasPanel({ datos, setBank }) {
  const [estado, setEstado] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [cobrando, setCobrando] = React.useState(false);
  const [mensaje, setMensaje] = React.useState(null);
  const [segundosRestantes, setSegundosRestantes] = React.useState(0);

  const cargarEstado = React.useCallback(async () => {
    try {
      const data = await obtenerRecompensaDiaria(datos.slotNumber || 1);
      setEstado(data);
      setSegundosRestantes(Number(data?.proximoCobroEnSegundos || 0));
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setCargando(false);
    }
  }, [datos.slotNumber]);

  React.useEffect(() => { cargarEstado(); }, [cargarEstado]);

  React.useEffect(() => {
    if (segundosRestantes <= 0) return;
    const id = setInterval(() => {
      setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [segundosRestantes]);

  const formatearTiempo = (totalSegundos) => {
    const h = Math.floor(totalSegundos / 3600);
    const m = Math.floor((totalSegundos % 3600) / 60);
    const s = totalSegundos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const cobrar = async () => {
    setCobrando(true);
    setMensaje(null);
    try {
      const data = await cobrarRecompensaDiaria(datos.slotNumber || 1);
      setMensaje({ tipo: "ok", texto: data.mensaje || `¡Cobraste $${data.monto?.toLocaleString()}!` });

      // Actualizar saldo en el banco //
      if (setBank && data.dinero !== undefined) {
        setBank(prev => ({
          ...prev,
          accounts: prev.accounts.map(a =>
            a.id === "principal" ? { ...a, balance: data.dinero } : a
          ),
        }));
      }

      await cargarEstado();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
      if (typeof err?.proximoCobroEnSegundos === "number") {
        setSegundosRestantes(err.proximoCobroEnSegundos);
      }
    } finally {
      setCobrando(false);
    }
  };

  if (cargando) return <div className="recompensas-wrap"><p>Cargando...</p></div>;

  return (
    <div className="recompensas-wrap">
      <div className="recompensas-hero">
        <AppIcon name="gift" size={40} />
        <h2>Collect Diario</h2>
        <p>Reclama tu recompensa diaria según tu stack VIP y profesión.</p>
      </div>

      {mensaje && (
        <div className={`recompensas-msg ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      {estado && (
        <div className="recompensas-grid">
          <div className="recompensas-card">
            <div className="recompensas-card-titulo">VIP: {(estado.desglose?.vip?.niveles || ["ninguno"]).join(" + ").toUpperCase()}</div>
            <div className="recompensas-card-valor">+${estado.desglose?.vip?.monto?.toLocaleString()}</div>
            {Array.isArray(estado.desglose?.vip?.detalle) && estado.desglose.vip.detalle.length > 1 && (
              <div className="recompensas-card-subdetalle">
                {estado.desglose.vip.detalle.map((item) => (
                  <div key={item.nivel}>{item.nivel}: +${Number(item.monto || 0).toLocaleString()}</div>
                ))}
              </div>
            )}
          </div>

          <div className="recompensas-card">
            <div className="recompensas-card-titulo">Profesión: {estado.desglose?.profesion?.rol?.toUpperCase()}</div>
            <div className="recompensas-card-valor">+${estado.desglose?.profesion?.monto?.toLocaleString()}</div>
          </div>

          <div className="recompensas-card recompensas-card-total">
            <div className="recompensas-card-titulo">TOTAL DIARIO</div>
            <div className="recompensas-card-total-valor">${estado.monto?.toLocaleString()}</div>
          </div>
        </div>
      )}

      <button
        className="recompensas-cobrar-btn"
        onClick={cobrar}
        disabled={cobrando || segundosRestantes > 0}
      >
        {segundosRestantes > 0
          ? `DISPONIBLE EN ${formatearTiempo(segundosRestantes)}`
          : cobrando
            ? "COBRANDO..."
            : "COBRAR RECOMPENSA"}
      </button>

      {estado?.personaje && (
        <div className="recompensas-saldo">
          Saldo actual: <strong>${estado.personaje.dinero?.toLocaleString()}</strong>
        </div>
      )}
    </div>
  );
}

function CasinoPanel({ datos, setBank }) {
  const [estado, setEstado] = React.useState(null);
  const [mensaje, setMensaje] = React.useState(null);
  const [apuesta, setApuesta] = React.useState(1000);
  const [colorRuleta, setColorRuleta] = React.useState("rojo");
  const [cargando, setCargando] = React.useState(false);

  const cargar = React.useCallback(async () => {
    try {
      const data = await obtenerEstadoCasino(datos.slotNumber || 1);
      setEstado(data);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  }, [datos.slotNumber]);

  React.useEffect(() => { cargar(); }, [cargar]);

  const actualizarSaldo = (saldo) => {
    if (saldo === undefined || !setBank) return;
    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === "principal" ? { ...a, balance: Number(saldo) } : a)),
    }));
  };

  const pagarEntrada = async () => {
    setCargando(true);
    try {
      const data = await comprarEntradaCasino(datos.slotNumber || 1);
      actualizarSaldo(data.saldo);
      setMensaje({ tipo: "ok", texto: "Entrada comprada. Acceso permanente desbloqueado." });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setCargando(false);
    }
  };

  const ejecutarJuego = async (juego) => {
    setCargando(true);
    try {
      const extra = juego === "jugar_ruleta" ? { color: colorRuleta } : {};
      const data = await jugarCasino(juego, Number(apuesta), extra, datos.slotNumber || 1);
      actualizarSaldo(data.saldo);
      const balance = Number(data.ganancia || 0) - Number(data.apuesta || 0);
      const signo = balance >= 0 ? "+" : "-";
      setMensaje({ tipo: "ok", texto: `${data.resultado} | ${signo}$${Math.abs(balance).toLocaleString("es-US")}` });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="casino-wrap">
      <h2>Casino Oasis</h2>
      <p className="casino-sub">Ruleta, BlackJack y Tragamonedas.</p>

      {mensaje && <div className={`casino-msg ${mensaje.tipo}`}>{mensaje.texto}</div>}

      {!estado?.accesoPagado ? (
        <div className="casino-entrada">
          <p>Entrada única: ${Number(estado?.costoEntrada || 45000).toLocaleString("es-US")}</p>
          <button className="casino-btn" disabled={cargando} onClick={pagarEntrada}>
            {cargando ? "PROCESANDO..." : "PAGAR ENTRADA"}
          </button>
        </div>
      ) : (
        <>
          <div className="casino-juegos">
            <input type="number" min="100" value={apuesta} onChange={(e) => setApuesta(e.target.value)} placeholder="Apuesta" />
            <select value={colorRuleta} onChange={(e) => setColorRuleta(e.target.value)}>
              <option value="rojo">Ruleta Rojo</option>
              <option value="negro">Ruleta Negro</option>
              <option value="verde">Ruleta Verde</option>
            </select>
            <button className="casino-btn" disabled={cargando} onClick={() => ejecutarJuego("jugar_ruleta")}>Jugar Ruleta</button>
            <button className="casino-btn" disabled={cargando} onClick={() => ejecutarJuego("jugar_blackjack")}>Jugar BlackJack</button>
            <button className="casino-btn" disabled={cargando} onClick={() => ejecutarJuego("jugar_tragamonedas")}>Jugar Tragamonedas</button>
          </div>

          <div className="casino-historial">
            <h3>Últimas jugadas</h3>
            {(estado?.historial || []).length === 0 ? (
              <p>Sin movimientos todavía.</p>
            ) : (
              estado.historial.map((item, idx) => (
                <div key={`${item.created_at}_${idx}`} className="casino-item">
                  <span>{String(item.juego || "").toUpperCase()}</span>
                  <span>{item.resultado}</span>
                  <span>Apuesta: ${Number(item.apuesta || 0).toLocaleString("es-US")}</span>
                  <span>Ganancia: ${Number(item.ganancia || 0).toLocaleString("es-US")}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CryptoPanel({ datos, setBank }) {
  const [estado, setEstado] = React.useState(null);
  const [mensaje, setMensaje] = React.useState(null);
  const [moneda, setMoneda] = React.useState("OAS");
  const [cantidad, setCantidad] = React.useState(10);
  const [cargando, setCargando] = React.useState(false);

  const cargar = React.useCallback(async () => {
    try {
      const data = await obtenerEstadoCrypto(datos.slotNumber || 1);
      setEstado(data);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  }, [datos.slotNumber]);

  React.useEffect(() => { cargar(); }, [cargar]);

  const actualizarSaldo = (saldo) => {
    if (saldo === undefined || !setBank) return;
    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === "principal" ? { ...a, balance: Number(saldo) } : a)),
    }));
  };

  const ejecutarOperacion = async (accion) => {
    setCargando(true);
    try {
      const data = await operarCrypto(accion, moneda, Number(cantidad), datos.slotNumber || 1);
      actualizarSaldo(data.saldo);
      setMensaje({ tipo: "ok", texto: `${accion === "comprar" ? "Compra" : "Venta"} ejecutada: ${moneda}` });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="crypto-wrap">
      <h2>Crypto Mercado Ficticio</h2>
      <p className="crypto-sub">Sistema financiero alternativo para operaciones clandestinas.</p>

      {mensaje && <div className={`crypto-msg ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="crypto-cotizaciones">
        {Object.entries(estado?.cotizaciones || {}).map(([sigla, precio]) => (
          <div key={sigla} className="crypto-card">
            <strong>{sigla}</strong>
            <span>${Number(precio).toLocaleString("es-US")}</span>
            <small>Saldo: {Number(estado?.cartera?.[sigla] || 0)}</small>
          </div>
        ))}
      </div>

      <div className="crypto-ops">
        <select value={moneda} onChange={(e) => setMoneda(e.target.value)}>
          {Object.keys(estado?.cotizaciones || {}).map((sigla) => (
            <option key={sigla} value={sigla}>{sigla}</option>
          ))}
        </select>
        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
        <button className="crypto-btn" disabled={cargando} onClick={() => ejecutarOperacion("comprar")}>Comprar</button>
        <button className="crypto-btn" disabled={cargando} onClick={() => ejecutarOperacion("vender")}>Vender</button>
      </div>
    </div>
  );
}

/* ================== PANEL POLICIAL ================== */
function PoliciaPanel({ datos }) {
  const [tab, setTab] = React.useState("buscar");
  const [busqueda, setBusqueda] = React.useState("");
  const [resultado, setResultado] = React.useState(null);
  const [cargando, setCargando] = React.useState(false);
  const [mensaje, setMensaje] = React.useState(null);

  // Campos multa //
  const [multaStateid, setMultaStateid] = React.useState("");
  const [multaMotivo, setMultaMotivo] = React.useState("");
  const [multaMonto, setMultaMonto] = React.useState("");

  // Campos cargo //
  const [cargoStateid, setCargoStateid] = React.useState("");
  const [cargoTexto, setCargoTexto] = React.useState("");
  const [cargoGravedad, setCargoGravedad] = React.useState("leve");

  // Campos matricula //
  const [matriculaBusqueda, setMatriculaBusqueda] = React.useState("");
  const [vehiculoResultado, setVehiculoResultado] = React.useState(null);

  const refrescarCiudadano = React.useCallback(async (stateid) => {
    if (!stateid) return;
    try {
      const data = await consultaPolicial("consultar_ciudadano", `&stateid=${stateid}`, datos.slotNumber || 1);
      setResultado(data);
    } catch {
      // No interrumpir el flujo principal si falla la recarga visual.
    }
  }, [datos.slotNumber]);

  const buscarCiudadano = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    setResultado(null);
    setMensaje(null);
    try {
      const data = await consultaPolicial("consultar_ciudadano", `&stateid=${busqueda.trim()}`, datos.slotNumber || 1);
      setResultado(data);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setCargando(false);
    }
  };

  const imponerMulta = async () => {
    if (!multaStateid || !multaMotivo || !multaMonto) return;
    setMensaje(null);
    try {
      const stateid = multaStateid.trim();
      await accionPolicial({
        accion: "imponer_multa",
        stateid_infractor: stateid,
        motivo: multaMotivo,
        monto: Number(multaMonto),
        slotNumber: datos.slotNumber || 1,
      });
      setMensaje({ tipo: "ok", texto: "Multa impuesta correctamente" });
      await refrescarCiudadano(stateid);
      setMultaStateid(""); setMultaMotivo(""); setMultaMonto("");
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const agregarCargo = async () => {
    if (!cargoStateid || !cargoTexto) return;
    setMensaje(null);
    try {
      const stateid = cargoStateid.trim();
      await accionPolicial({
        accion: "agregar_cargo",
        stateid_acusado: stateid,
        cargo: cargoTexto,
        gravedad: cargoGravedad,
        slotNumber: datos.slotNumber || 1,
      });
      setMensaje({ tipo: "ok", texto: "Cargo judicial registrado" });
      await refrescarCiudadano(stateid);
      setCargoStateid(""); setCargoTexto(""); setCargoGravedad("leve");
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const buscarMatricula = async () => {
    if (!matriculaBusqueda.trim()) return;
    setVehiculoResultado(null);
    try {
      const data = await consultaPolicial("consultar_matricula", `&matricula=${matriculaBusqueda.trim()}`, datos.slotNumber || 1);
      setVehiculoResultado(data.vehiculo);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  return (
    <div className="policia-wrap">
      <div className="policia-hero">
        <AppIcon name="shield" size={36} />
        <h2>Panel Policial</h2>
        <p>Placa: <strong>{datos.placa_policial || datos.placaPolicial || "---"}</strong> · Oficial: <strong>{datos.nombre}</strong></p>
      </div>

      {mensaje && (
        <div className={`policia-msg ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="policia-tabs">
        {["buscar", "multar", "cargos", "matriculas"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "buscar" && "Buscar Ciudadano"}
            {t === "multar" && "Imponer Multa"}
            {t === "cargos" && "Cargos Judiciales"}
            {t === "matriculas" && "Matrículas"}
          </button>
        ))}
      </div>

      {/* Buscar ciudadano */}
      {tab === "buscar" && (
        <div className="policia-seccion">
          <div className="policia-input-row">
            <input placeholder="StateID del ciudadano" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <button className="policia-btn" onClick={buscarCiudadano} disabled={cargando}>
              {cargando ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {resultado && resultado.ciudadano && (
            <div className="policia-resultado">
              <div className="policia-dato"><strong>Nombre:</strong> {resultado.ciudadano.nombre}</div>
              <div className="policia-dato"><strong>Edad:</strong> {resultado.ciudadano.edad}</div>
              <div className="policia-dato"><strong>Nacionalidad:</strong> {resultado.ciudadano.nacionalidad}</div>
              <div className="policia-dato"><strong>Rol:</strong> {resultado.ciudadano.rol}</div>
              <div className="policia-dato"><strong>VIP:</strong> {resultado.ciudadano.nivel_vip}</div>

              {resultado.multas?.length > 0 && (
                <>
                  <h4>Multas ({resultado.multas.length})</h4>
                  {resultado.multas.map(m => (
                    <div key={m.id} className="policia-multa-item">
                      <span>{m.motivo}</span>
                      <span>${Number(m.monto).toLocaleString()}</span>
                      <span className={m.pagada ? "pagada" : "pendiente"}>{m.pagada ? "Pagada" : "Pendiente"}</span>
                    </div>
                  ))}
                </>
              )}

              {resultado.cargos?.length > 0 && (
                <>
                  <h4>Cargos Judiciales ({resultado.cargos.length})</h4>
                  {resultado.cargos.map(c => (
                    <div key={c.id} className="policia-cargo-item">
                      <span>{c.cargo}</span>
                      <span className={`gravedad-${c.gravedad}`}>{c.gravedad}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Imponer multa */}
      {tab === "multar" && (
        <div className="policia-seccion">
          <input placeholder="StateID del infractor" value={multaStateid} onChange={e => setMultaStateid(e.target.value)} />
          <input placeholder="Motivo de la multa" value={multaMotivo} onChange={e => setMultaMotivo(e.target.value)} />
          <input placeholder="Monto ($)" type="number" value={multaMonto} onChange={e => setMultaMonto(e.target.value)} />
          <button className="policia-btn" onClick={imponerMulta}>Imponer Multa</button>
        </div>
      )}

      {/* Cargos judiciales */}
      {tab === "cargos" && (
        <div className="policia-seccion">
          <input placeholder="StateID del acusado" value={cargoStateid} onChange={e => setCargoStateid(e.target.value)} />
          <input placeholder="Descripción del cargo" value={cargoTexto} onChange={e => setCargoTexto(e.target.value)} />
          <select value={cargoGravedad} onChange={e => setCargoGravedad(e.target.value)}>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="grave">Grave</option>
          </select>
          <button className="policia-btn" onClick={agregarCargo}>Registrar Cargo</button>
        </div>
      )}

      {/* Matriculas */}
      {tab === "matriculas" && (
        <div className="policia-seccion">
          <div className="policia-input-row">
            <input placeholder="Buscar matrícula (ej: OA-AB1234)" value={matriculaBusqueda} onChange={e => setMatriculaBusqueda(e.target.value)} />
            <button className="policia-btn" onClick={buscarMatricula}>Buscar</button>
          </div>

          {vehiculoResultado && (
            <div className="policia-resultado">
              <div className="policia-dato"><strong>Matrícula:</strong> {vehiculoResultado.matricula}</div>
              <div className="policia-dato"><strong>Vehículo:</strong> {vehiculoResultado.nombre_vehiculo}</div>
              <div className="policia-dato"><strong>Propietario:</strong> {vehiculoResultado.nombre_propietario || vehiculoResultado.stateid_propietario}</div>
              <div className="policia-dato"><strong>Registro:</strong> {new Date(vehiculoResultado.fecha_registro).toLocaleDateString("es-CL")}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================== PANEL ADMINISTRATIVO ================== */
function AdminPanel({ discordId }) {
  const [tab, setTab] = React.useState("usuarios");
  const [profesiones, setProfesiones] = React.useState([]);
  const [admins, setAdmins] = React.useState([]);
  const [niveles, setNiveles] = React.useState([]);
  const [faccionesAdmin, setFaccionesAdmin] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [perfiles, setPerfiles] = React.useState([]);
  const [vehiculosStock, setVehiculosStock] = React.useState([]);
  const [itemsStock, setItemsStock] = React.useState([]);
  const [mensaje, setMensaje] = React.useState(null);
  const [adminBusquedaUsuarios, setAdminBusquedaUsuarios] = React.useState("");
  const [usuariosCargados, setUsuariosCargados] = React.useState(false);

  // Campos de accion //
  const [stateidObjetivo, setStateidObjetivo] = React.useState("");
  const [cantidadDinero, setCantidadDinero] = React.useState("");
  const [cantidadDineroGlobal, setCantidadDineroGlobal] = React.useState("");
  const [operacionDineroGlobal, setOperacionDineroGlobal] = React.useState("agregar");
  const [operacionDinero, setOperacionDinero] = React.useState("agregar");
  const [slotDesbloquear, setSlotDesbloquear] = React.useState("2");
  const [rolAsignar, setRolAsignar] = React.useState("");
  const [placaAsignar, setPlacaAsignar] = React.useState("");
  const [faccionAsignar, setFaccionAsignar] = React.useState("");
  const [rangoFaccionAsignar, setRangoFaccionAsignar] = React.useState("recluta");
  const [vipAsignar, setVipAsignar] = React.useState("");
  const [nuevoAdminId, setNuevoAdminId] = React.useState("");
  const [tipoItemAdmin, setTipoItemAdmin] = React.useState("vehiculo");
  const [nombreItemAdmin, setNombreItemAdmin] = React.useState("");
  const [itemIdQuitarAdmin, setItemIdQuitarAdmin] = React.useState("");
  const [multaMotivoAdmin, setMultaMotivoAdmin] = React.useState("");
  const [multaMontoAdmin, setMultaMontoAdmin] = React.useState("");
  const [multaIdQuitarAdmin, setMultaIdQuitarAdmin] = React.useState("");
  const [cargoIdQuitarAdmin, setCargoIdQuitarAdmin] = React.useState("");
  const [vehiculoStockId, setVehiculoStockId] = React.useState("");
  const [vehiculoStockDelta, setVehiculoStockDelta] = React.useState("1");
  const [itemStockId, setItemStockId] = React.useState("");
  const [itemStockDelta, setItemStockDelta] = React.useState("1");

  // Campos tienda CRUD //
  const [tiendaSubTab, setTiendaSubTab] = React.useState("vehiculos");
  const [tiendaEditando, setTiendaEditando] = React.useState(null);
  const [tiendaFormNombre, setTiendaFormNombre] = React.useState("");
  const [tiendaFormPrecio, setTiendaFormPrecio] = React.useState("");
  const [tiendaFormStock, setTiendaFormStock] = React.useState("");
  const [tiendaFormImagen, setTiendaFormImagen] = React.useState("");
  const [tiendaFormCategoria, setTiendaFormCategoria] = React.useState("standard");
  const [tiendaFormTipo, setTiendaFormTipo] = React.useState("documento");

  // Campos profesion //
  const [nuevaProfNombre, setNuevaProfNombre] = React.useState("");
  const [nuevaProfDesc, setNuevaProfDesc] = React.useState("");
  const [nuevaProfSalario, setNuevaProfSalario] = React.useState("");

  // Campos VIP //
  const [nuevoVipNombre, setNuevoVipNombre] = React.useState("");
  const [nuevoVipRecompensa, setNuevoVipRecompensa] = React.useState("");

  const limpiarMensaje = () => setTimeout(() => setMensaje(null), 3000);

  const cargarProfesiones = async () => {
    try {
      const data = await obtenerDatosAdmin("profesiones");
      setProfesiones(data.profesiones || []);
    } catch {}
  };

  const cargarAdmins = async () => {
    try {
      const data = await obtenerDatosAdmin("admins");
      setAdmins(data.admins || []);
    } catch {}
  };

  const cargarNiveles = async () => {
    try {
      const data = await obtenerDatosAdmin("niveles_vip");
      setNiveles(data.niveles || []);
    } catch {}
  };

  const cargarFaccionesAdmin = async () => {
    try {
      const data = await obtenerDatosAdmin("facciones");
      setFaccionesAdmin(Array.isArray(data?.facciones) ? data.facciones : []);
    } catch {}
  };

  const cargarLogs = async () => {
    try {
      const data = await obtenerDatosAdmin("logs");
      setLogs(data.logs || []);
    } catch {}
  };

  const cargarUsuariosRegistrados = async (busqueda = "") => {
    try {
      const extra = busqueda ? `&busqueda=${encodeURIComponent(busqueda)}` : "";
      const data = await obtenerDatosAdmin("usuarios_registrados", extra);
      setPerfiles(Array.isArray(data?.perfiles) ? data.perfiles : []);
      setUsuariosCargados(true);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const cargarStockMercado = async () => {
    try {
      const data = await obtenerDatosAdmin("mercado_stock");
      setVehiculosStock(Array.isArray(data?.vehiculos) ? data.vehiculos : []);
      setItemsStock(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  React.useEffect(() => {
    cargarProfesiones();
    cargarAdmins();
    cargarNiveles();
    cargarFaccionesAdmin();
    cargarLogs();
    cargarStockMercado();
  }, []);

  const ejecutarAccion = async (accion, payload) => {
    setMensaje(null);
    try {
      await accionAdmin({ accion, ...payload });
      setMensaje({ tipo: "ok", texto: "Acción ejecutada correctamente" });
      limpiarMensaje();

      if (accion.includes("profesion")) cargarProfesiones();
      if (accion.includes("admin")) cargarAdmins();
      if (accion.includes("vip")) cargarNiveles();
      if (accion.includes("stock") || accion.includes("vehiculo_tienda") || accion.includes("item_tienda")) cargarStockMercado();
      if (accion.includes("eliminar_personaje") || accion.includes("eliminar_perfil")) {
        if (usuariosCargados) cargarUsuariosRegistrados(adminBusquedaUsuarios);
      }
      cargarLogs();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const ejecutarAccionUsuario = (accion, payload = {}) => {
    const stateid = stateidObjetivo.trim();
    if (!stateid) {
      setMensaje({ tipo: "error", texto: "Debes ingresar un stateID" });
      return;
    }

    ejecutarAccion(accion, { stateid, ...payload });
  };

  return (
    <div className="admin-wrap">
      <div className="admin-hero">
        <AppIcon name="settings" size={36} />
        <h2>Panel Administrativo</h2>
      </div>

      {mensaje && (
        <div className={`admin-msg ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="admin-tabs">
        {[
          { id: "usuarios", label: "Usuarios" },
          { id: "administracion", label: "Administración" },
          { id: "tienda", label: "Tienda" },
          { id: "profesiones", label: "Profesiones" },
          { id: "vip", label: "Niveles VIP" },
          { id: "admins", label: "Administradores" },
          { id: "logs", label: "Logs" },
        ].map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); if (t.id === "logs") cargarLogs(); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* GESTION DE USUARIOS */}
      {tab === "usuarios" && (
        <div className="admin-seccion">
          <div className="admin-acciones">
            <h3>Usuario Objetivo</h3>
            <div className="admin-accion-grupo">
              <h4>StateID</h4>
              <div className="admin-input-row">
                <input
                  placeholder="Ingresa el stateID del usuario"
                  value={stateidObjetivo}
                  onChange={e => setStateidObjetivo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="admin-acciones">
            <h3>Economía Global</h3>
            <div className="admin-accion-grupo">
              <h4>Aplicar a todos los stateID</h4>
              <div className="admin-input-row">
                <select value={operacionDineroGlobal} onChange={e => setOperacionDineroGlobal(e.target.value)}>
                  <option value="agregar">Agregar</option>
                  <option value="quitar">Quitar</option>
                </select>
                <input type="number" placeholder="Cantidad" value={cantidadDineroGlobal} onChange={e => setCantidadDineroGlobal(e.target.value)} />
                <button className="admin-btn" onClick={() => {
                  ejecutarAccion("modificar_dinero_global", { cantidad: cantidadDineroGlobal, operacion: operacionDineroGlobal });
                  setCantidadDineroGlobal("");
                }}>Aplicar a todos</button>
              </div>
              <div className="admin-accion-ayuda">Esta acción solo se permite desde el panel web administrativo.</div>
            </div>
          </div>

          <div className="admin-acciones">
            <h3>Acciones por stateID</h3>

            <div className="admin-accion-grupo">
              <h4>Dinero</h4>
              <div className="admin-input-row">
                <select value={operacionDinero} onChange={e => setOperacionDinero(e.target.value)}>
                  <option value="agregar">Agregar</option>
                  <option value="quitar">Quitar</option>
                </select>
                <input type="number" placeholder="Cantidad" value={cantidadDinero} onChange={e => setCantidadDinero(e.target.value)} />
                <button className="admin-btn" onClick={() => {
                  ejecutarAccionUsuario("modificar_dinero", { cantidad: cantidadDinero, operacion: operacionDinero });
                  setCantidadDinero("");
                }}>Aplicar</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Rol / Profesión</h4>
              <div className="admin-input-row">
                <select value={rolAsignar} onChange={e => setRolAsignar(e.target.value)}>
                  <option value="">Seleccionar rol</option>
                  {profesiones.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                </select>
                <button className="admin-btn" onClick={() => { ejecutarAccionUsuario("asignar_rol", { rol: rolAsignar }); }}>Asignar</button>
                <button className="admin-btn-danger" onClick={() => { ejecutarAccionUsuario("quitar_rol"); }}>Quitar Rol</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Placa Policial</h4>
              <div className="admin-input-row">
                <input placeholder="N° de placa" value={placaAsignar} onChange={e => setPlacaAsignar(e.target.value)} />
                <button className="admin-btn" onClick={() => { ejecutarAccionUsuario("asignar_placa", { placa: placaAsignar }); setPlacaAsignar(""); }}>Asignar Placa</button>
                <button className="admin-btn-danger" onClick={() => { ejecutarAccionUsuario("quitar_placa"); }}>Quitar Placa</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Facciones (aprobar ingreso por examen)</h4>
              <div className="admin-input-row">
                <select value={faccionAsignar} onChange={e => setFaccionAsignar(e.target.value)}>
                  <option value="">Seleccionar faccion</option>
                  {faccionesAdmin.map(f => <option key={f.id} value={f.id}>{f.nombre} (ID {f.id})</option>)}
                </select>
                <select value={rangoFaccionAsignar} onChange={e => setRangoFaccionAsignar(e.target.value)}>
                  <option value="recluta">Recluta</option>
                  <option value="miembro">Miembro</option>
                  <option value="oficial">Oficial</option>
                  <option value="lider">Lider</option>
                </select>
                <button className="admin-btn" onClick={() => {
                  ejecutarAccionUsuario("agregar_miembro_faccion", {
                    faccion_id: Number(faccionAsignar),
                    rango: rangoFaccionAsignar,
                  });
                }}>Agregar a Faccion</button>
                <button className="admin-btn-danger" onClick={() => {
                  ejecutarAccionUsuario("quitar_miembro_faccion");
                }}>Quitar de Faccion</button>
              </div>
              <div className="admin-accion-ayuda">Usa stateID + faccion para aprobar ingresos luego del examen.</div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Nivel VIP</h4>
              <div className="admin-input-row">
                <select value={vipAsignar} onChange={e => setVipAsignar(e.target.value)}>
                  <option value="">Seleccionar VIP</option>
                  {niveles.map(n => <option key={n.id} value={n.nombre}>{n.nombre} (+${n.recompensa_diaria})</option>)}
                </select>
                <button className="admin-btn" onClick={() => { ejecutarAccionUsuario("asignar_vip", { nivel: vipAsignar }); }}>Agregar VIP al stack</button>
                <button className="admin-btn-danger" onClick={() => { ejecutarAccionUsuario("quitar_vip", vipAsignar ? { nivel: vipAsignar } : {}); }}>Quitar VIP</button>
              </div>
              <div className="admin-accion-ayuda">Tope: 10 VIPs por usuario. Si seleccionas un VIP, se quita solo ese; sin selección, limpia todo el stack.</div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Desbloquear Slots</h4>
              <div className="admin-input-row">
                <select value={slotDesbloquear} onChange={e => setSlotDesbloquear(e.target.value)}>
                  <option value="2">Slot 2</option>
                  <option value="3">Slot 3</option>
                  <option value="4">Slot 4</option>
                </select>
                <button className="admin-btn" onClick={() => {
                  ejecutarAccionUsuario("desbloquear_slot_usuario", { slotNumber: Number(slotDesbloquear) });
                }}>Desbloquear Slot</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Agregar Vehículo / Arma</h4>
              <div className="admin-input-row">
                <select value={tipoItemAdmin} onChange={e => setTipoItemAdmin(e.target.value)}>
                  <option value="vehiculo">Vehículo</option>
                  <option value="arma">Arma</option>
                </select>
                <input placeholder="Nombre del item" value={nombreItemAdmin} onChange={e => setNombreItemAdmin(e.target.value)} />
                <button className="admin-btn" onClick={() => {
                  ejecutarAccionUsuario("agregar_item_usuario", { tipo: tipoItemAdmin, nombre: nombreItemAdmin });
                  setNombreItemAdmin("");
                }}>Agregar</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Quitar Vehículo / Arma</h4>
              <div className="admin-input-row">
                <input placeholder="ID item (opcional)" value={itemIdQuitarAdmin} onChange={e => setItemIdQuitarAdmin(e.target.value)} />
                <input placeholder="Nombre exacto del item" value={nombreItemAdmin} onChange={e => setNombreItemAdmin(e.target.value)} />
                <button className="admin-btn-danger" onClick={() => {
                  ejecutarAccionUsuario("quitar_item_usuario", {
                    tipo: tipoItemAdmin,
                    nombre: nombreItemAdmin,
                    item_id: itemIdQuitarAdmin || undefined,
                  });
                  setItemIdQuitarAdmin("");
                  setNombreItemAdmin("");
                }}>Quitar</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Agregar Multa</h4>
              <div className="admin-input-row">
                <input placeholder="Motivo" value={multaMotivoAdmin} onChange={e => setMultaMotivoAdmin(e.target.value)} />
                <input type="number" placeholder="Monto" value={multaMontoAdmin} onChange={e => setMultaMontoAdmin(e.target.value)} />
                <button className="admin-btn" onClick={() => {
                  ejecutarAccionUsuario("agregar_multa_admin", { motivo: multaMotivoAdmin, monto: multaMontoAdmin });
                  setMultaMotivoAdmin("");
                  setMultaMontoAdmin("");
                }}>Agregar Multa</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Quitar Multa</h4>
              <div className="admin-input-row">
                <input type="number" placeholder="ID de multa" value={multaIdQuitarAdmin} onChange={e => setMultaIdQuitarAdmin(e.target.value)} />
                <button className="admin-btn-danger" onClick={() => {
                  ejecutarAccion("quitar_multa_admin", { multa_id: multaIdQuitarAdmin });
                  setMultaIdQuitarAdmin("");
                }}>Quitar Multa</button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Quitar Cargo Judicial</h4>
              <div className="admin-input-row">
                <input type="number" placeholder="ID de cargo" value={cargoIdQuitarAdmin} onChange={e => setCargoIdQuitarAdmin(e.target.value)} />
                <button className="admin-btn-danger" onClick={() => {
                  ejecutarAccion("quitar_cargo_admin", { cargo_id: cargoIdQuitarAdmin });
                  setCargoIdQuitarAdmin("");
                }}>Quitar Cargo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "administracion" && (
        <div className="admin-seccion">
          <div className="admin-acciones">
            <h3>Gestión de perfiles y personajes</h3>
            <div className="admin-accion-grupo">
              <h4>Cargar usuarios registrados</h4>
              <div className="admin-input-row">
                <input
                  placeholder="Buscar por username, discord_id, nombre o stateID"
                  value={adminBusquedaUsuarios}
                  onChange={(e) => setAdminBusquedaUsuarios(e.target.value)}
                />
                <button className="admin-btn" onClick={() => cargarUsuariosRegistrados(adminBusquedaUsuarios)}>
                  Cargar
                </button>
              </div>
            </div>

            {usuariosCargados && (
              <div className="admin-lista">
                {perfiles.length === 0 ? (
                  <div className="admin-list-item">Sin resultados.</div>
                ) : (
                  perfiles.map((perfil) => (
                    <div key={perfil.discord_id} className="admin-list-item">
                      <div>
                        <strong>{perfil.username || "Sin username"}</strong> · {perfil.discord_id}
                      </div>
                      <div className="admin-list-desc">Personajes: {Number(perfil.total_personajes || 0)}</div>
                      <button
                        className="admin-btn-danger"
                        onClick={() => ejecutarAccion("eliminar_perfil", { discord_id: perfil.discord_id })}
                      >
                        Borrar Perfil Completo
                      </button>

                      {(perfil.personajes || []).map((p) => (
                        <div key={p.id} className="admin-list-desc" style={{ marginTop: 8 }}>
                          <strong>{p.nombre}</strong> · StateID {p.stateid} · Slot {p.slot_number} · Rol {p.rol} · VIP {p.nivel_vip}
                          <button
                            className="admin-btn-danger"
                            style={{ marginLeft: 8 }}
                            onClick={() => ejecutarAccion("eliminar_personaje", { personaje_id: p.id })}
                          >
                            Borrar Personaje
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="admin-acciones">
            <h3>Stock de mercado</h3>

            <div className="admin-accion-grupo">
              <h4>Vehículos</h4>
              <div className="admin-input-row">
                <select value={vehiculoStockId} onChange={(e) => setVehiculoStockId(e.target.value)}>
                  <option value="">Seleccionar vehículo</option>
                  {vehiculosStock.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre} (Stock: {v.stock})</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={vehiculoStockDelta}
                  onChange={(e) => setVehiculoStockDelta(e.target.value)}
                  placeholder="Delta"
                />
                <button
                  className="admin-btn"
                  onClick={() => ejecutarAccion("ajustar_stock_vehiculo", { vehiculo_id: Number(vehiculoStockId), delta: Number(vehiculoStockDelta) })}
                >
                  Ajustar Stock
                </button>
              </div>
            </div>

            <div className="admin-accion-grupo">
              <h4>Objetos (Licencias y Armas)</h4>
              <div className="admin-input-row">
                <select value={itemStockId} onChange={(e) => setItemStockId(e.target.value)}>
                  <option value="">Seleccionar item</option>
                  {itemsStock.map((it) => (
                    <option key={`${it.tipo}-${it.id}`} value={it.id}>{it.tipo.toUpperCase()} · {it.nombre} (Stock: {it.stock})</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={itemStockDelta}
                  onChange={(e) => setItemStockDelta(e.target.value)}
                  placeholder="Delta"
                />
                <button
                  className="admin-btn"
                  onClick={() => ejecutarAccion("ajustar_stock_item", { item_id: Number(itemStockId), delta: Number(itemStockDelta) })}
                >
                  Ajustar Stock
                </button>
              </div>
            </div>

            <button className="admin-btn" onClick={cargarStockMercado}>Recargar stock</button>
          </div>
        </div>
      )}

      {/* GESTION DE TIENDA DINAMICA */}
      {tab === "tienda" && (
        <div className="admin-seccion">
          <div className="admin-acciones">
            <h3>Gestión de Catálogo de Tienda</h3>
            <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Agrega, edita o elimina los artículos que aparecen en la Tienda Oficial.
            </p>

            <div className="admin-tabs" style={{ marginBottom: "1rem" }}>
              {[
                { id: "vehiculos", label: "Vehículos" },
                { id: "documentos", label: "Documentos" },
                { id: "armas", label: "Armas" },
              ].map(st => (
                <button
                  key={st.id}
                  className={`tab-btn ${tiendaSubTab === st.id ? "active" : ""}`}
                  onClick={() => { setTiendaSubTab(st.id); setTiendaEditando(null); }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* FORMULARIO CREAR / EDITAR */}
            <div className="admin-form-crear" style={{ marginBottom: "1.5rem" }}>
              <h4>{tiendaEditando ? "Editar artículo" : "Crear artículo nuevo"}</h4>
              <input placeholder="Nombre" value={tiendaFormNombre} onChange={e => setTiendaFormNombre(e.target.value)} />
              <input type="number" placeholder="Precio" value={tiendaFormPrecio} onChange={e => setTiendaFormPrecio(e.target.value)} />
              <input type="number" placeholder="Stock" value={tiendaFormStock} onChange={e => setTiendaFormStock(e.target.value)} />
              <input placeholder="URL de imagen (ej: /autos/nombre.png)" value={tiendaFormImagen} onChange={e => setTiendaFormImagen(e.target.value)} />

              {tiendaSubTab === "vehiculos" && (
                <select value={tiendaFormCategoria} onChange={e => setTiendaFormCategoria(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="lujo">Lujo</option>
                  <option value="deportivo">Deportivo</option>
                  <option value="moto">Moto</option>
                  <option value="utilitario">Utilitario</option>
                </select>
              )}

              {(tiendaSubTab === "documentos" || tiendaSubTab === "armas") && (
                <select value={tiendaFormTipo} onChange={e => setTiendaFormTipo(e.target.value)}>
                  <option value="documento">Documento</option>
                  <option value="arma">Arma</option>
                </select>
              )}

              <div className="admin-input-row">
                <button className="admin-btn" onClick={async () => {
                  if (tiendaSubTab === "vehiculos") {
                    if (tiendaEditando) {
                      await ejecutarAccion("editar_vehiculo_tienda", {
                        vehiculo_id: tiendaEditando.id,
                        nombre: tiendaFormNombre,
                        precio: tiendaFormPrecio,
                        stock: tiendaFormStock,
                        imagen: tiendaFormImagen,
                        categoria: tiendaFormCategoria,
                      });
                    } else {
                      await ejecutarAccion("crear_vehiculo_tienda", {
                        nombre: tiendaFormNombre,
                        precio: tiendaFormPrecio,
                        stock: tiendaFormStock,
                        imagen: tiendaFormImagen,
                        categoria: tiendaFormCategoria,
                      });
                    }
                  } else {
                    const tipoFinal = tiendaSubTab === "armas" ? "arma" : tiendaFormTipo;
                    if (tiendaEditando) {
                      await ejecutarAccion("editar_item_tienda", {
                        item_id: tiendaEditando.id,
                        tipo: tipoFinal,
                        nombre: tiendaFormNombre,
                        precio: tiendaFormPrecio,
                        stock: tiendaFormStock,
                        imagen: tiendaFormImagen,
                      });
                    } else {
                      await ejecutarAccion("crear_item_tienda", {
                        tipo: tipoFinal,
                        nombre: tiendaFormNombre,
                        precio: tiendaFormPrecio,
                        stock: tiendaFormStock,
                        imagen: tiendaFormImagen,
                      });
                    }
                  }
                  setTiendaFormNombre(""); setTiendaFormPrecio(""); setTiendaFormStock("");
                  setTiendaFormImagen(""); setTiendaFormCategoria("standard"); setTiendaFormTipo("documento");
                  setTiendaEditando(null);
                  cargarStockMercado();
                }}>
                  {tiendaEditando ? "Guardar Cambios" : "Crear"}
                </button>

                {tiendaEditando && (
                  <button className="admin-btn-danger" onClick={() => {
                    setTiendaEditando(null);
                    setTiendaFormNombre(""); setTiendaFormPrecio(""); setTiendaFormStock("");
                    setTiendaFormImagen(""); setTiendaFormCategoria("standard"); setTiendaFormTipo("documento");
                  }}>Cancelar</button>
                )}
              </div>
            </div>

            {/* LISTA DE VEHICULOS */}
            {tiendaSubTab === "vehiculos" && (
              <div className="admin-lista">
                {vehiculosStock.length === 0 ? (
                  <div className="admin-list-item">No hay vehículos en la tienda.</div>
                ) : vehiculosStock.map(v => (
                  <div key={v.id} className="admin-list-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {v.imagen && <img src={v.imagen} alt={v.nombre} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 6, background: "#1a1a2e" }} />}
                      <div>
                        <strong>{v.nombre}</strong> · ${Number(v.precio).toLocaleString("es-US")}
                        <div className="admin-list-desc">ID: {v.id} · Stock: {v.stock} · Cat: {v.categoria || "standard"}</div>
                      </div>
                    </div>
                    <div className="admin-input-row" style={{ marginTop: 8 }}>
                      <button className="admin-btn" onClick={() => {
                        setTiendaEditando(v);
                        setTiendaFormNombre(v.nombre);
                        setTiendaFormPrecio(String(v.precio));
                        setTiendaFormStock(String(v.stock));
                        setTiendaFormImagen(v.imagen || "");
                        setTiendaFormCategoria(v.categoria || "standard");
                      }}>Editar</button>
                      <button className="admin-btn-danger" onClick={() => {
                        ejecutarAccion("eliminar_vehiculo_tienda", { vehiculo_id: v.id });
                      }}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LISTA DE DOCUMENTOS */}
            {tiendaSubTab === "documentos" && (
              <div className="admin-lista">
                {itemsStock.filter(it => it.tipo === "documento").length === 0 ? (
                  <div className="admin-list-item">No hay documentos en la tienda.</div>
                ) : itemsStock.filter(it => it.tipo === "documento").map(it => (
                  <div key={`doc-${it.id}`} className="admin-list-item">
                    <div>
                      <strong>{it.nombre}</strong> · ${Number(it.precio).toLocaleString("es-US")}
                      <div className="admin-list-desc">ID: {it.id} · Stock: {it.stock} · Tipo: documento</div>
                    </div>
                    <div className="admin-input-row" style={{ marginTop: 8 }}>
                      <button className="admin-btn" onClick={() => {
                        setTiendaEditando(it);
                        setTiendaFormNombre(it.nombre);
                        setTiendaFormPrecio(String(it.precio));
                        setTiendaFormStock(String(it.stock));
                        setTiendaFormImagen(it.imagen || "");
                        setTiendaFormTipo("documento");
                      }}>Editar</button>
                      <button className="admin-btn-danger" onClick={() => {
                        ejecutarAccion("eliminar_item_tienda", { item_id: it.id });
                      }}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LISTA DE ARMAS */}
            {tiendaSubTab === "armas" && (
              <div className="admin-lista">
                {itemsStock.filter(it => it.tipo === "arma").length === 0 ? (
                  <div className="admin-list-item">No hay armas en la tienda.</div>
                ) : itemsStock.filter(it => it.tipo === "arma").map(it => (
                  <div key={`arma-${it.id}`} className="admin-list-item">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {it.imagen && <img src={it.imagen} alt={it.nombre} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 6, background: "#1a1a2e" }} />}
                      <div>
                        <strong>{it.nombre}</strong> · ${Number(it.precio).toLocaleString("es-US")}
                        <div className="admin-list-desc">ID: {it.id} · Stock: {it.stock} · Tipo: arma</div>
                      </div>
                    </div>
                    <div className="admin-input-row" style={{ marginTop: 8 }}>
                      <button className="admin-btn" onClick={() => {
                        setTiendaEditando(it);
                        setTiendaFormNombre(it.nombre);
                        setTiendaFormPrecio(String(it.precio));
                        setTiendaFormStock(String(it.stock));
                        setTiendaFormImagen(it.imagen || "");
                        setTiendaFormTipo("arma");
                      }}>Editar</button>
                      <button className="admin-btn-danger" onClick={() => {
                        ejecutarAccion("eliminar_item_tienda", { item_id: it.id });
                      }}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="admin-btn" style={{ marginTop: "1rem" }} onClick={cargarStockMercado}>Recargar catálogo</button>
          </div>
        </div>
      )}

      {/* GESTION DE PROFESIONES */}
      {tab === "profesiones" && (
        <div className="admin-seccion">
          <div className="admin-lista">
            {profesiones.map(p => (
              <div key={p.id} className="admin-list-item">
                <div><strong>{p.nombre}</strong> · Salario: ${p.salario_diario?.toLocaleString()}</div>
                <div className="admin-list-desc">{p.descripcion}</div>
                <button className="admin-btn-danger" onClick={() => ejecutarAccion("eliminar_profesion", { id: p.id })}>Eliminar</button>
              </div>
            ))}
          </div>

          <div className="admin-form-crear">
            <h4>Crear Nueva Profesión</h4>
            <input placeholder="Nombre" value={nuevaProfNombre} onChange={e => setNuevaProfNombre(e.target.value)} />
            <input placeholder="Descripción" value={nuevaProfDesc} onChange={e => setNuevaProfDesc(e.target.value)} />
            <input type="number" placeholder="Salario diario" value={nuevaProfSalario} onChange={e => setNuevaProfSalario(e.target.value)} />
            <button className="admin-btn" onClick={() => {
              ejecutarAccion("crear_profesion", { nombre: nuevaProfNombre, descripcion: nuevaProfDesc, salario_diario: nuevaProfSalario });
              setNuevaProfNombre(""); setNuevaProfDesc(""); setNuevaProfSalario("");
            }}>Crear Profesión</button>
          </div>
        </div>
      )}

      {/* GESTION DE NIVELES VIP */}
      {tab === "vip" && (
        <div className="admin-seccion">
          <div className="admin-lista">
            {niveles.map(n => (
              <div key={n.id} className="admin-list-item">
                <div><strong>{n.nombre}</strong> · Recompensa: ${n.recompensa_diaria?.toLocaleString()}/día</div>
                {String(n.nombre || "").toLowerCase() !== "ninguno" && (
                  <button className="admin-btn-danger" onClick={() => ejecutarAccion("eliminar_vip", { id: n.id, nombre: n.nombre })}>Eliminar</button>
                )}
              </div>
            ))}
          </div>

          <div className="admin-form-crear">
            <h4>Crear / Modificar Nivel VIP</h4>
            <input placeholder="Nombre del nivel" value={nuevoVipNombre} onChange={e => setNuevoVipNombre(e.target.value)} />
            <input type="number" placeholder="Recompensa diaria ($)" value={nuevoVipRecompensa} onChange={e => setNuevoVipRecompensa(e.target.value)} />
            <button className="admin-btn" onClick={() => {
              ejecutarAccion("modificar_vip", { nombre: nuevoVipNombre, recompensa_diaria: nuevoVipRecompensa });
              setNuevoVipNombre(""); setNuevoVipRecompensa("");
            }}>Guardar VIP</button>
          </div>
        </div>
      )}

      {/* GESTION DE ADMINS */}
      {tab === "admins" && (
        <div className="admin-seccion">
          <div className="admin-lista">
            {admins.map(a => (
              <div key={a.id} className="admin-list-item">
                <div><strong>{a.username || a.discord_id}</strong> · {a.discord_id}</div>
                <div className="admin-list-desc">Agregado por: {a.agregado_por || "Sistema"}</div>
                {a.discord_id !== discordId && (
                  <button className="admin-btn-danger" onClick={() => ejecutarAccion("eliminar_admin", { discord_id: a.discord_id })}>Quitar Admin</button>
                )}
              </div>
            ))}
          </div>

          <div className="admin-form-crear">
            <h4>Agregar Administrador</h4>
            <input placeholder="Discord ID del nuevo admin" value={nuevoAdminId} onChange={e => setNuevoAdminId(e.target.value)} />
            <button className="admin-btn" onClick={() => {
              ejecutarAccion("agregar_admin", { discord_id: nuevoAdminId });
              setNuevoAdminId("");
            }}>Agregar Admin</button>
          </div>
        </div>
      )}

      {/* LOGS */}
      {tab === "logs" && (
        <div className="admin-seccion">
          <div className="admin-logs">
            {logs.length === 0 ? (
              <div className="admin-log-item">Sin logs registrados.</div>
            ) : (
              logs.map(l => (
                <div key={l.id} className="admin-log-item">
                  <span className="admin-log-fecha">{new Date(l.created_at).toLocaleString("es-CL")}</span>
                  <span className="admin-log-accion">{l.admin_username || l.admin_discord_id} · {l.accion}</span>
                  {l.detalles && <span className="admin-log-detalles">{l.detalles}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}