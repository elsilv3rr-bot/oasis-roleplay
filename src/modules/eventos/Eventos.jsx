// MODULO: Eventos del servidor //
import { useState, useEffect } from "react";
import { obtenerEventosActivos, inscribirEvento } from "../../api";

const TIPO_ICONS = {
  subasta: "🔨",
  carrera: "🏎️",
  redada: "🚔",
  juicio: "⚖️",
  torneo: "🏆",
  fiesta: "🎉",
  otro: "📌",
};

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState("");

  function cargar() {
    setCargando(true);
    obtenerEventosActivos()
      .then((data) => setEventos(data.eventos || []))
      .catch(() => setEventos([]))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); }, []);

  async function inscribirse(eventoId) {
    try {
      await inscribirEvento(eventoId);
      setMsg("✅ Te has inscrito al evento");
      cargar();
    } catch (err) {
      setMsg("❌ " + (err.message || "Error al inscribirse"));
    }
    setTimeout(() => setMsg(""), 3000);
  }

  function formatFecha(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function estadoBadge(estado) {
    const colores = { programado: "#6366f1", activo: "#10b981", finalizado: "#6b7280", cancelado: "#ef4444" };
    return (
      <span style={{
        background: colores[estado] || "#6b7280",
        color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        textTransform: "capitalize",
      }}>
        {estado}
      </span>
    );
  }

  return (
    <div className="modulo-eventos">
      {msg && <div style={{ padding: 10, background: "#1e1b2e", borderRadius: 8, marginBottom: 12, color: "#fff" }}>{msg}</div>}

      {cargando ? (
        <p style={{ color: "#a0a0a0" }}>Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p style={{ color: "#a0a0a0" }}>No hay eventos activos en este momento.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {eventos.map((ev) => (
            <div key={ev.id} style={{
              background: "#1e1b2e", borderRadius: 14, padding: 18,
              display: "flex", flexDirection: "column", gap: 10,
              borderTop: `3px solid ${ev.estado === "activo" ? "#10b981" : "#6366f1"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{TIPO_ICONS[ev.tipo] || "📌"}</span>
                {estadoBadge(ev.estado)}
              </div>
              <strong style={{ color: "#fff", fontSize: 16 }}>{ev.nombre}</strong>
              {ev.descripcion && <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{ev.descripcion}</p>}
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6b7280" }}>
                <span>📅 {formatFecha(ev.fecha_inicio)}</span>
                {ev.ubicacion && <span>📍 {ev.ubicacion}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <div style={{ fontSize: 12, color: "#a78bfa" }}>
                  {ev.inscritos !== undefined && ev.max_participantes
                    ? `${ev.inscritos}/${ev.max_participantes} inscritos`
                    : ev.inscritos !== undefined ? `${ev.inscritos} inscritos` : ""}
                  {ev.costo_inscripcion > 0 && <span style={{ marginLeft: 10, color: "#f59e0b" }}>💰 ${ev.costo_inscripcion.toLocaleString()}</span>}
                </div>
                {ev.estado === "programado" || ev.estado === "activo" ? (
                  <button onClick={() => inscribirse(ev.id)} style={{
                    padding: "7px 16px", borderRadius: 8, border: "none",
                    background: "#6366f1", color: "#fff", fontWeight: 600,
                    cursor: "pointer", fontSize: 12,
                  }}>
                    Inscribirse
                  </button>
                ) : null}
              </div>
              {ev.premio_descripcion && (
                <div style={{ background: "#2d2640", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#fbbf24" }}>
                  🎁 {ev.premio_descripcion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Eventos;
