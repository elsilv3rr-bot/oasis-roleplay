import React from "react"
import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useSearchParams } from "react-router-dom"
import { iniciarLoginDiscord, obtenerSlotsPersonajes, desbloquearSlotPersonaje, obtenerUsuario, registrarPersonaje, setToken, cerrarSesion } from "./api"
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
      <div className="registro-card registro-card-wide">
        <h2>SLOTS DE PERSONAJE</h2>
        <p className="registro-subtitle">Selecciona o desbloquea un slot para jugar.</p>

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
                    <span>Slot {slot.slotNumber}</span>
                    <AppIcon name="lock" size={16} />
                  </div>
                  <p className="slot-price">Precio: ${slot.unlockCost.toLocaleString("es-CL")}</p>
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
                    <span>Slot {slot.slotNumber}</span>
                    <span className="slot-badge">Disponible</span>
                  </div>
                  <h4>{slot.character.nombre}</h4>
                  <p>State ID: {slot.character.stateId}</p>
                  <p>Saldo: ${Number(slot.character.dinero || 0).toLocaleString("es-CL")}</p>
                  <button className="portal-button" onClick={() => seleccionarPersonaje(slot.character)}>
                    Jugar con este personaje
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
                  <span>Slot {slot.slotNumber}</span>
                  <span className="slot-badge">Libre</span>
                </div>
                <p>Crear personaje en este slot</p>
              </button>
            );
          })}
        </div>

        {selectedSlotData?.isUnlocked && !selectedSlotData?.character && (
          <div className="registro-form-wrap">
            <h3>Crear Personaje en Slot {selectedSlot}</h3>

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
    </div>
  );
}

/* ================== EXPEDIENTE ================== */
function Expediente() {
  const navigate = useNavigate();
  const datos = JSON.parse(localStorage.getItem("usuario"));

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
        navigate("/registro");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(selectedCharacter));
      localStorage.setItem("active_slot_number", String(selectedCharacter.slotNumber));
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
];

  const [active, setActive] = React.useState("identidad");
  const [tiendaTab, setTiendaTab] = React.useState("vehiculos");
  const [compraSeleccionada, setCompraSeleccionada] = React.useState(null);
  const [vehiculoPreview, setVehiculoPreview] = React.useState(null);

  const [toast, setToast] = React.useState(null);

  const [vehiculosTienda, setVehiculosTienda] = React.useState([
    { id: 1, nombre: "Wolfsburgo Marin", precio: 15000, stock: 250, imagen: "/autos/Marin.png" },
    { id: 2, nombre: "Wolfsburg Discovery", precio: 16500, stock: 200, imagen: "/autos/Discovery.png" },
    { id: 3, nombre: "Wolfsburg Classic", precio: 18000, stock: 200, imagen: "/autos/Classic.png" },
    { id: 4, nombre: "BKM 1 Cabriolet", precio: 18500, stock: 150, imagen: "/autos/Cabriolet.png" },
    { id: 5, nombre: "Quad", precio: 18500, stock: 90, imagen: "/autos/Quad.png" },
    { id: 6, nombre: "Wolfsburg Handel", precio: 19000, stock: 200, imagen: "/autos/Handel.png" },
    { id: 7, nombre: "Avantismo S5", precio: 15000, stock: 180, imagen: "/autos/S5.png" },
    { id: 8, nombre: "Wolfsburg Karen", precio: 15400, stock: 180, imagen: "/autos/Karen.png" },
    { id: 9, nombre: "UTV", precio: 17500, stock: 100, imagen: "/autos/UTV.png" },
    { id: 10, nombre: "Stuttgart W123", precio: 19000, stock: 100, imagen: "/autos/W123.png" },
    { id: 11, nombre: "Nordforge Striker 450", precio: 19000, stock: 85, imagen: "/autos/Striker-450.png" },
    { id: 12, nombre: "Stuttgart Kasten", precio: 20000, stock: 120, imagen: "/autos/Kasten.png" },
    { id: 13, nombre: "Stuttgart eKasten", precio: 21000, stock: 120, imagen: "/autos/eKasten.png" },
    { id: 14, nombre: "Stuttgart Executive", precio: 35000, stock: 100, imagen: "/autos/Executive.png" },
    { id: 15, nombre: "Avantismo A3", precio: 17500, stock: 180, imagen: "/autos/A3.png" },
    { id: 16, nombre: "Stuttgart Jogger", precio: 20000, stock: 50, imagen: "/autos/Jogger.png" },
    { id: 17, nombre: "Wolfsburg T6", precio: 21000, stock: 90, imagen: "/autos/T6.png" },
    { id: 18, nombre: "BKM M3 E90", precio: 20000, stock: 85, imagen: "/autos/E90.png" },
    { id: 19, nombre: "Stuttgart GMA 63", precio: 25000, stock: 85, imagen: "/autos/63.png" },
    { id: 20, nombre: "Falcon Traveller", precio: 20500, stock: 180, imagen: "/autos/Traveller.png" },
    { id: 21, nombre: "Wolfsburg Pickup", precio: 27500, stock: 140, imagen: "/autos/Pickup.png" },
    { id: 22, nombre: "Avantismo Q4 Electron", precio: 21000, stock: 85, imagen: "/autos/Electron.png" },
    { id: 23, nombre: "Tractor", precio: 9000, stock: 5, imagen: "/autos/Tractor.png" },
    { id: 24, nombre: "Avantismo A6", precio: 30000, stock: 120, imagen: "/autos/A6.png" },
    { id: 25, nombre: "Cuvora Atrica", precio: 27000, stock: 140, imagen: "/autos/Atrica.png" },
    { id: 26, nombre: "Celestial Type S", precio: 25000, stock: 150, imagen: "/autos/Type-S.png" },
    { id: 27, nombre: "Avantismo Q5", precio: 30000, stock: 120, imagen: "/autos/Q5.png" },
    { id: 28, nombre: "Stuttgart GMA C63 Facelift", precio: 34000, stock: 145, imagen: "/autos/Facelift.png" },
    { id: 29, nombre: "BKM M2", precio: 38500, stock: 90, imagen: "/autos/M2.png" },
    { id: 30, nombre: "Stuttgart Landschaft", precio: 40000, stock: 50, imagen: "/autos/Landschaft.png" },
    { id: 31, nombre: "Avantismo R8", precio: 50000, stock: 15, imagen: "/autos/R8.png" },
    { id: 32, nombre: "Stuttgart GMA Roadster", precio: 52000, stock: 8, imagen: "/autos/Roadster.png" },
    { id: 33, nombre: "BKM X3", precio: 49500, stock: 60, imagen: "/autos/X3.png" },
    { id: 34, nombre: "BKM M5", precio: 54000, stock: 75, imagen: "/autos/M5.png" },
    { id: 35, nombre: "Stuttgart GMA Sport", precio: 55500, stock: 25, imagen: "/autos/Sport.png" },
    { id: 36, nombre: "BKM M3 G80", precio: 50000, stock: 35, imagen: "/autos/G80.png" },
    { id: 37, nombre: "Ferdinand 911", precio: 48500, stock: 15, imagen: "/autos/911.png" },
    { id: 38, nombre: "Ferdinand 911 Cabriolet", precio: 49000, stock: 10, imagen: "/autos/911-cabriolet.png" },
    { id: 39, nombre: "Stuttgart GMA Commute", precio: 38500, stock: 80, imagen: "/autos/Commute.png" },
    { id: 40, nombre: "Bullhorn Prancer SFP Fury", precio: 38000, stock: 80, imagen: "/autos/Fury.png" },
    { id: 41, nombre: "Avantismo RS4", precio: 51000, stock: 85, imagen: "/autos/RS4.png" },
    { id: 42, nombre: "Ferdinand Jalapeno", precio: 51000, stock: 65, imagen: "/autos/Jalapeno.png" },
    { id: 43, nombre: "Silhouette Urano", precio: 54500, stock: 45, imagen: "/autos/Urano.png" },
    { id: 44, nombre: "Maranello Catania", precio: 60000, stock: 25, imagen: "/autos/Catania.png" },
    { id: 45, nombre: "Chryslus Champion Limousine", precio: 50000, stock: 10, imagen: "/autos/Limousine.png" },
    { id: 46, nombre: "Ferdinand Vivo", precio: 58000, stock: 10, imagen: "/autos/Vivo.png" },
    { id: 47, nombre: "Stuttgart Royal Majestic", precio: 55500, stock: 25, imagen: "/autos/Majestic.png" },
    { id: 48, nombre: "Silhouette Carbon", precio: 80000, stock: 5, imagen: "/autos/Carbon.png" },
    { id: 49, nombre: "Mauntley National GT", precio: 85000, stock: 4, imagen: "/autos/GT.png" },
    { id: 50, nombre: "Strugatti Ettore", precio: 100000, stock: 3, imagen: "/autos/Ettore.png" },
    { id: 51, nombre: "Nyberg Eskon", precio: 150000, stock: 2, imagen: "/autos/Eskon.png" },
    { id: 52, nombre: "BKM 1200 Tourer", precio: 9000, stock: 20, imagen: "/autos/Tourer.png" },
    { id: 53, nombre: "Vellfire XY6", precio: 12000, stock: 20, imagen: "/autos/XY6.png" },
    { id: 54, nombre: "Vellfire R1", precio: 18500, stock: 20, imagen: "/autos/R1.png" },
  ]);
  const documentosTienda = [
  { id: 1, nombre: "Licencia de Conducir", precio: 1500, imagen: "/licencias/licencia.png" },
  { id: 2, nombre: "Licencia de Motos", precio: 1000, imagen: "/licencias/licencia.png" },
  { id: 3, nombre: "Licencia de Camiones", precio: 2000, imagen: "/licencias/licencia.png" },
  { id: 4, nombre: "Licencia de Buses", precio: 1500, imagen: "/licencias/licencia.png" },
  { id: 5, nombre: "Licencia de Tractor", precio: 1500, imagen: "/licencias/licencia.png" },
  { id: 6, nombre: "Licencia de Armas", precio: 2500, imagen: "/licencias/licencia.png" },
];
const armasTienda = [
  { id: 1, nombre: "Glock  17", precio: 15000, imagen: "/armas/glock.png" },
];

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

  // ================== REGISTRO DE STATEIDs EXISTENTES ==================
  React.useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("stateIDs")) || [];
    if (datos?.stateId && !lista.includes(datos.stateId)) {
      lista.push(datos.stateId);
      localStorage.setItem("stateIDs", JSON.stringify(lista));
    }
  }, [datos?.stateId]);

  // ================== MULTAS (Identidad / Municipalidad) ==================
  const multasKey = `multas_${datos.nombre}`;
  const [multasState, setMultasState] = React.useState(() => {
    const saved = localStorage.getItem(multasKey);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  });

  React.useEffect(() => {
    localStorage.setItem(multasKey, JSON.stringify(multasState));
  }, [multasState, multasKey]);

  const estadoJudicial = multasState.length > 0 ? "CON ANTECEDENTES" : "LIMPIO";

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

  const toggleHideBalance = () => {
    setBank((prev) => ({ ...prev, hideBalance: !prev.hideBalance }));
  };

  const setActiveAccount = (id) => {
    setBank((prev) => ({ ...prev, activeAccountId: id }));
  };

  // ================== COMPRA TIENDA (SIMPLIFICADO) ==================
const comprarVehiculo = () => {
  if (!compraSeleccionada) return;

  const precio = Number(compraSeleccionada.precio);

  const cuentaActiva =
    bank.accounts.find((a) => a.id === bank.activeAccountId) ||
    bank.accounts?.[0];

  if (!cuentaActiva) return alert("No hay cuenta activa.");
  if (cuentaActiva.balance < precio)
    return alert("Saldo insuficiente.");

  // Descontar del banco
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance - precio }
        : a
    ),
    transactions: [
      {
        id: Date.now(),
        type: "COMPRA_VEHICULO",
        from: cuentaActiva.name,
        to: "Tienda Oficial",
        amount: precio,
        motivo: `Compra vehículo: ${compraSeleccionada.nombre}`,
        date: new Date().toLocaleString("es-US"),
      },
      ...prev.transactions,
    ],
  }));

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
  const nuevoVehiculo = {
    id: Date.now(),
    nombre: compraSeleccionada.nombre,
    precio,
    imagen: compraSeleccionada.imagen,
    estado: "INSCRITO",
    comprado: new Date().toLocaleString("es-US")
  };

  setPertenencias((prev) => ({
    ...prev,
    vehiculos: [...(prev.vehiculos || []), nuevoVehiculo],
  }));
} 

  // Bajar stock
  setVehiculosTienda((prev) =>
    prev.map((v) =>
      v.id === compraSeleccionada.id
        ? { ...v, stock: Math.max(0, Number(v.stock) - 1) }
        : v
    )
  );

  // Toast
  setToast({ type: "success", message: "Vehículo comprado con éxito" });
  setTimeout(() => setToast(null), 3000);

  // Cerrar modal
  setCompraSeleccionada(null);
};

const comprarDocumento = () => {
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

  // Descontar dinero
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance - precio }
        : a
    ),
  }));

  // Agregar a pertenencias
  const nuevoDoc = {
    id: Date.now(),
    tipo: compraSeleccionada.nombre,
    emitida: new Date().toLocaleDateString("es-US"),
    vence: "Indefinido",
  };

  setPertenencias((prev) => ({
    ...prev,
    documentos: [...(prev.documentos || []), nuevoDoc],
  }));

  // Cerrar modal
  setCompraSeleccionada(null);

  // Toast
  setToast({
    type: "success",
    message: "Documento comprado con éxito",
  });

  setTimeout(() => setToast(null), 3000);
};

const comprarArma = () => {
  if (!compraSeleccionada) return;

  const precio = Number(compraSeleccionada.precio);

  const cuentaActiva =
    bank.accounts.find((a) => a.id === bank.activeAccountId) ||
    bank.accounts?.[0];

  if (!cuentaActiva) return alert("No hay cuenta activa.");
  if (cuentaActiva.balance < precio)
    return alert("Saldo insuficiente.");

  // Descontar banco
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance - precio }
        : a
    ),
  }));

  // Agregar a mochila
  const nuevaArma = {
    id: Date.now(),
    nombre: compraSeleccionada.nombre,
    tipo: "arma",
  };

  setPertenencias((prev) => ({
    ...prev,
    mochila: [...(prev.mochila || []), nuevaArma],
  }));

  setCompraSeleccionada(null);

  setToast({
    type: "success",
    message: "Arma comprada con éxito",
  });

  setTimeout(() => setToast(null), 3000);
};

const comprarItem = () => {
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

  // DESCONTAR DINERO
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance - precio }
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

    // Evitar duplicados
    const yaExiste = licencias.some(
      (l) => l.nombre === compraSeleccionada.nombre
    );

    if (yaExiste) {
      alert("Ya tienes esta licencia.");
      setCompraSeleccionada(null);
      return;
    }

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

  const submitTransfer = () => {
    const amount = Number(String(monto).replace(/[^\d]/g, ""));
    if (!amount || amount <= 0) return alert("Monto inválido");

    const from = bank.accounts.find((a) => a.id === fromAccountId);
    if (!from) return;

    if (from.balance < amount) return alert("Saldo insuficiente");

    const stateId = stateIdDest.trim();
    if (!stateId) return alert("Ingresa StateID destinatario");

    if (stateId === bank.stateId) return alert("No puedes transferirte a ti mismo.");

    const lista = JSON.parse(localStorage.getItem("stateIDs")) || [];
    if (!lista.includes(stateId)) return alert("El StateID no existe.");

    const ok = confirm(`¿Enviar ${formatUSD(amount)} al StateID ${stateId}?`);
    if (!ok) return;

    setBank((prev) => {
      const newAccounts = prev.accounts.map((a) =>
        a.id === fromAccountId ? { ...a, balance: a.balance - amount } : a
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
  const totalMultas = multasState.reduce((acc, m) => acc + parseMonto(m.monto), 0);

  const pagarMulta = (multaId) => {
    const multa = multasState.find((m) => m.id === multaId);
    if (!multa) return;

    const amount = parseMonto(multa.monto);
    if (amount <= 0) return alert("Monto inválido");

    const from = bank.accounts.find((a) => a.id === bank.activeAccountId);
    if (!from) return;

    if (from.balance < amount) return alert("Saldo insuficiente en tu cuenta.");

    const ok = confirm(`¿Pagar multa por ${formatUSD(amount)}?`);
    if (!ok) return;

    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId ? { ...a, balance: a.balance - amount } : a
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

    setMultasState((prev) => prev.filter((m) => m.id !== multaId));
  };

  const pagarTodo = () => {
    if (multasState.length === 0) return;

    const amount = totalMultas;
    const from = bank.accounts.find((a) => a.id === bank.activeAccountId);
    if (!from) return;

    if (from.balance < amount) return alert("Saldo insuficiente para pagar todo.");

    const ok = confirm(`¿Pagar TODAS las multas por ${formatUSD(amount)}?`);
    if (!ok) return;

    setBank((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === prev.activeAccountId ? { ...a, balance: a.balance - amount } : a
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

    setMultasState([]);
  };

  // ================== UI ==================
  return (
    <div className="expediente-layout">

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

      {/* SIDEBAR (derecha) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img
            className="sidebar-logo"
            src="/logo.png"
            alt="Logo"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="sidebar-title">Oasis RolePlay</div>
        </div>

        <div className="sidebar-divider" />

        <ul className="sidebar-menu">
          {secciones.map((s) => (
            <li
              key={s.id}
              className={`sidebar-item ${active === s.id ? "active" : ""}`}
              onClick={() => setActive(s.id)}
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
                {multasState.length === 0 ? (
                  <p>Sin multas registradas.</p>
                ) : (
                  multasState.map((multa) => (
                    <div key={multa.id} className="multa-item">
                      <p><strong>Fecha:</strong> {multa.fecha}</p>
                      <p><strong>Motivo:</strong> {multa.motivo}</p>
                      <p><strong>Monto:</strong> {multa.monto}</p>
                      <hr />
                    </div>
                  ))
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
                  <span>Posee infracciones registradas.</span>
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
                      <div className="user-title">Ciudadano</div>
                      <div className="user-sub">Nómina al día. Próximo pago pronto.</div>
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
                    {multasState.length === 0 ? (
                      <div className="muni-empty">No tienes multas pendientes.</div>
                    ) : (
                      <div className="muni-fines">
                        {multasState.map((m) => (
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
                        : "Posees antecedentes: existen infracciones registradas."}
                    </div>

                    <div className="muni-history-title">Historial</div>

                    {multasState.length === 0 ? (
                      <div className="muni-empty">Sin registros.</div>
                    ) : (
                      <div className="muni-history">
                        {multasState.map((m) => (
                          <div key={m.id} className="muni-history-item">
                            <div className="muni-history-top">
                              <span className="tag">{m.fecha}</span>
                              <span className="tag money">{formatUSD(parseMonto(m.monto))}</span>
                            </div>
                            <div className="muni-history-motivo">{m.motivo}</div>
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

    {toast && (
      <div className={`toast toast-${toast.type}`}>
        <span className="toast-icon">
          <AppIcon name={toast.type === "error" ? "close" : "check"} size={16} />
        </span>
        <span>{toast.message}</span>
      </div>
    )}

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
  <div className="modal-backdrop" onClick={() => setCompraSeleccionada(null)}>
    <div className="modal-compra" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Confirmar Compra</h3>
        <button className="icon-btn" onClick={() => setCompraSeleccionada(null)} aria-label="Cerrar compra">
          <AppIcon name="close" size={18} />
        </button>
      </div>

      <div className="modal-body">
        <h4>{compraSeleccionada.nombre}</h4>

        <p>
          Precio: $
          {Number(compraSeleccionada.precio).toLocaleString("es-US")}
        </p>

        <button
          className="modal-pay"
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
          PAGAR AHORA
        </button>
      </div>
    </div>
  </div>
)}

      {/* ================= DOCUMENTOS ================= */}
      {tiendaTab === "documentos" && (
        <div className="vehicle-grid">
          {documentosTienda.map((doc) => (
            <div className="vehicle-card" key={doc.id}>
              <div className="vehicle-image-section">
                <span className="vehicle-tag">DOCUMENTO</span>
                <img src={doc.imagen} alt={doc.nombre} />
              </div>

              <div className="vehicle-info">
                <h3>{doc.nombre}</h3>

                <div className="vehicle-footer">
                  <span className="vehicle-price">
                    ${doc.precio.toLocaleString("es-US")}
                  </span>

                  <button
                    className="buy-btn"
                    aria-label={`Comprar ${doc.nombre}`}
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
          {armasTienda.map((arma) => (
            <div className="vehicle-card" key={arma.id}>
              <div className="vehicle-image-section">
                <span className="vehicle-tag">ARMA</span>
                <img src={arma.imagen} alt={arma.nombre} />
              </div>

              <div className="vehicle-info">
                <h3>{arma.nombre}</h3>

                <div className="vehicle-footer">
                  <span className="vehicle-price">
                    ${arma.precio.toLocaleString("es-US")}
                  </span>

                  <button
                    className="buy-btn"
                    aria-label={`Comprar ${arma.nombre}`}
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

               {/* ================= OTRAS ================= */}
              {active !== "identidad" &&
                active !== "finanzas" &&
                active !== "pertenencias" &&
                active !== "municipalidad" &&
                active !== "tienda" && (
                  <div className="right-empty">
                  </div>
                )}
            </div> {/* right-list-card */}
          </main>
        </div>
      );
    }