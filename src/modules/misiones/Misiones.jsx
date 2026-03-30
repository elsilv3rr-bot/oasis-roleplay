// MODULO: Misiones - Panel de misiones diarias y semanales //
import { useState, useEffect, useCallback } from "react";
import { obtenerMisiones, obtenerProgresoMisiones, cobrarMision } from "../../api";

function Misiones({ slotNumber = 1 }) {
  const [misiones, setMisiones] = useState({ diarias: [], semanales: [] });
  const [progreso, setProgreso] = useState([]);
  const [vista, setVista] = useState("disponibles");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      if (vista === "disponibles") {
        const data = await obtenerMisiones(slotNumber);
        setMisiones({ diarias: data.diarias || [], semanales: data.semanales || [] });
      } else {
        const data = await obtenerProgresoMisiones(slotNumber);
        setProgreso(data.progreso || []);
      }
    } catch (err) {
      setMensaje("Error cargando misiones: " + err.message);
    } finally {
      setCargando(false);
    }
  }, [vista, slotNumber]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  async function handleCobrar(misionId) {
    try {
      const data = await cobrarMision(misionId, slotNumber);
      setMensaje(`🎉 ¡${data.mision} completada! +$${data.recompensas.dinero.toLocaleString()} +${data.recompensas.xp} XP`);
      cargarDatos();
    } catch (err) {
      setMensaje("Error: " + err.message);
    }
  }

  function BarraProgreso({ actual, total }) {
    const porcentaje = Math.min((actual / total) * 100, 100);
    return (
      <div style={{ background: "#1e1b2e", borderRadius: 8, height: 20, overflow: "hidden", width: "100%" }}>
        <div style={{
          background: porcentaje >= 100 ? "#10b981" : "#7c3aed",
          height: "100%",
          width: `${porcentaje}%`,
          transition: "width 0.5s ease",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#fff",
          fontWeight: 600,
        }}>
          {actual}/{total}
        </div>
      </div>
    );
  }

  return (
    <div className="modulo-misiones">
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setVista("disponibles")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: vista === "disponibles" ? "#7c3aed" : "#2d2640",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          📋 Disponibles
        </button>
        <button
          onClick={() => setVista("progreso")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: vista === "progreso" ? "#7c3aed" : "#2d2640",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          📊 Mi Progreso
        </button>
      </div>

      {mensaje && (
        <div style={{ background: "#1a1730", padding: 12, borderRadius: 8, marginBottom: 12, borderLeft: "3px solid #7c3aed" }}>
          {mensaje}
        </div>
      )}

      {cargando ? (
        <p style={{ color: "#a0a0a0" }}>Cargando misiones...</p>
      ) : vista === "disponibles" ? (
        <>
          {misiones.diarias.length > 0 && (
            <div>
              <h3 style={{ color: "#f59e0b", marginBottom: 12 }}>📅 Misiones Diarias</h3>
              {misiones.diarias.map((m) => (
                <div key={m.id} style={{
                  background: "#1e1b2e",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  border: m.completada ? "1px solid #10b981" : "1px solid #2d2640",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, color: "#fff" }}>{m.completada ? "✅" : "⏳"} {m.nombre}</h4>
                    <span style={{ fontSize: 12, color: "#a0a0a0" }}>
                      +${m.recompensa_dinero.toLocaleString()} | +{m.recompensa_xp} XP
                    </span>
                  </div>
                  <p style={{ color: "#a0a0a0", margin: "8px 0", fontSize: 14 }}>{m.descripcion}</p>
                  <BarraProgreso actual={m.progreso_actual || 0} total={m.objetivo_cantidad} />
                </div>
              ))}
            </div>
          )}

          {misiones.semanales.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ color: "#3b82f6", marginBottom: 12 }}>📆 Misiones Semanales</h3>
              {misiones.semanales.map((m) => (
                <div key={m.id} style={{
                  background: "#1e1b2e",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  border: m.completada ? "1px solid #10b981" : "1px solid #2d2640",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, color: "#fff" }}>{m.completada ? "✅" : "⏳"} {m.nombre}</h4>
                    <span style={{ fontSize: 12, color: "#a0a0a0" }}>
                      +${m.recompensa_dinero.toLocaleString()} | +{m.recompensa_xp} XP
                    </span>
                  </div>
                  <p style={{ color: "#a0a0a0", margin: "8px 0", fontSize: 14 }}>{m.descripcion}</p>
                  <BarraProgreso actual={m.progreso_actual || 0} total={m.objetivo_cantidad} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <h3 style={{ color: "#7c3aed", marginBottom: 12 }}>📊 Tu Progreso</h3>
          {progreso.length === 0 ? (
            <p style={{ color: "#a0a0a0" }}>No tienes misiones en progreso.</p>
          ) : (
            progreso.map((mp) => (
              <div key={mp.id} style={{
                background: "#1e1b2e",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                border: mp.completada ? "1px solid #10b981" : "1px solid #2d2640",
              }}>
                <h4 style={{ margin: 0, color: "#fff" }}>
                  {mp.completada ? (mp.recompensa_cobrada ? "💰" : "✅") : "⏳"} {mp.nombre}
                </h4>
                <p style={{ color: "#a0a0a0", margin: "8px 0", fontSize: 14 }}>{mp.descripcion}</p>
                <BarraProgreso actual={mp.progreso_actual || 0} total={mp.objetivo_cantidad} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: "#a0a0a0" }}>
                    +${mp.recompensa_dinero.toLocaleString()} | +{mp.recompensa_xp} XP | +{mp.recompensa_reputacion} Rep
                  </span>
                  {mp.completada && !mp.recompensa_cobrada && (
                    <button
                      onClick={() => handleCobrar(mp.mision_id)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 8,
                        border: "none",
                        background: "#10b981",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Cobrar 🎉
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Misiones;
