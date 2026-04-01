// MODULO: Facciones - Panel de facciones del jugador //
import { useState, useEffect, useCallback } from "react";
import { listarFacciones, detalleFaccion, miFaccion, depositarFaccion } from "../../api";

function Facciones({ slotNumber = 1 }) {
  const [vista, setVista] = useState("mi_faccion");
  const [miFaccionData, setMiFaccion] = useState(null);
  const [faccionesLista, setFaccionesLista] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [montoDeposito, setMontoDeposito] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      if (vista === "mi_faccion") {
        const data = await miFaccion(slotNumber);
        setMiFaccion(data);
      } else if (vista === "listar") {
        const data = await listarFacciones();
        setFaccionesLista(data.facciones || []);
      }
    } catch (err) {
      setMensaje("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  }, [vista, slotNumber]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleDepositar() {
    const monto = parseInt(montoDeposito, 10);
    if (!monto || monto <= 0) { setMensaje("Monto invalido"); return; }
    try {
      const data = await depositarFaccion(monto, slotNumber);
      setMensaje(`✅ Depositaste $${monto.toLocaleString()}. Saldo restante: $${data.nuevoSaldo.toLocaleString()}`);
      setMontoDeposito("");
      cargar();
    } catch (err) {
      setMensaje("Error: " + err.message);
    }
  }

  async function handleVerDetalle(faccionId) {
    try {
      const data = await detalleFaccion(faccionId);
      setDetalle(data);
      setVista("detalle");
    } catch (err) {
      setMensaje("Error: " + err.message);
    }
  }

  const cardStyle = {
    background: "#1e1b2e", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #2d2640",
  };

  return (
    <div className="modulo-facciones">
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {["mi_faccion", "listar"].map((v) => (
          <button key={v} onClick={() => { setVista(v); setDetalle(null); }}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: vista === v ? "#7c3aed" : "#2d2640", color: "#fff", cursor: "pointer", fontWeight: 600,
            }}>
            {v === "mi_faccion" ? "🏛️ Mi Faccion" : "📜 Todas"}
          </button>
        ))}
      </div>

      {mensaje && (
        <div style={{ background: "#1a1730", padding: 12, borderRadius: 8, marginBottom: 12, borderLeft: "3px solid #7c3aed" }}>
          {mensaje}
          <button onClick={() => setMensaje("")} style={{ marginLeft: 10, background: "none", border: "none", color: "#a0a0a0", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {cargando ? <p style={{ color: "#a0a0a0" }}>Cargando...</p> : (
        <>
          {/* MI FACCION */}
          {vista === "mi_faccion" && (
            miFaccionData?.enFaccion ? (
              <div style={cardStyle}>
                <h3 style={{ color: miFaccionData.membresia.color || "#7c3aed", margin: "0 0 12px" }}>
                  🏛️ {miFaccionData.membresia.faccion_nombre}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Tu rango</span><br /><strong style={{ color: "#fff" }}>{miFaccionData.membresia.rango}</strong></div>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Nivel faccion</span><br /><strong style={{ color: "#fff" }}>{miFaccionData.membresia.faccion_nivel}</strong></div>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Fondos</span><br /><strong style={{ color: "#10b981" }}>${(miFaccionData.membresia.fondos || 0).toLocaleString()}</strong></div>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Tu contribucion</span><br /><strong style={{ color: "#f59e0b" }}>${(miFaccionData.membresia.contribucion_total || 0).toLocaleString()}</strong></div>
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <input
                    type="number" placeholder="Monto a depositar" value={montoDeposito}
                    onChange={(e) => setMontoDeposito(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #2d2640", background: "#13111f", color: "#fff" }}
                  />
                  <button onClick={handleDepositar}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                    Depositar
                  </button>
                </div>
              </div>
            ) : (
              <div style={cardStyle}>
                <p style={{ color: "#a0a0a0" }}>No perteneces a ninguna faccion.</p>
                <p style={{ color: "#d1d5db", margin: "8px 0 0" }}>
                  Un administrador debe asignarte manualmente a una faccion.
                </p>
              </div>
            )
          )}

          {/* LISTAR FACCIONES */}
          {vista === "listar" && faccionesLista.map((f) => (
            <div key={f.id} style={{ ...cardStyle, borderLeft: `3px solid ${f.color || "#7c3aed"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ color: f.color || "#fff", margin: 0 }}>{f.nombre}</h4>
                <span style={{ fontSize: 12, color: "#a0a0a0" }}>
                  {f.total_miembros}/{f.max_miembros} miembros
                </span>
              </div>
              <p style={{ color: "#a0a0a0", margin: "8px 0", fontSize: 14 }}>{f.descripcion}</p>
              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#a0a0a0" }}>
                <span>Nv.{f.nivel}</span>
                <span>Rep: {f.reputacion_global}</span>
                <span>Fondos: ${(f.fondos || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => handleVerDetalle(f.id)}
                  style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #2d2640", background: "transparent", color: "#7c3aed", cursor: "pointer", fontSize: 12 }}>
                  Ver detalle
                </button>
                <span style={{ fontSize: 12, color: "#a0a0a0", alignSelf: "center" }}>
                  El ingreso lo gestiona un administrador desde el panel admin
                </span>
              </div>
            </div>
          ))}

          {/* DETALLE */}
          {vista === "detalle" && detalle && (
            <div>
              <button onClick={() => setVista("listar")} style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", marginBottom: 12 }}>
                ← Volver a la lista
              </button>
              <div style={{ ...cardStyle, borderLeft: `3px solid ${detalle.faccion.color || "#7c3aed"}` }}>
                <h3 style={{ color: detalle.faccion.color || "#fff", margin: "0 0 12px" }}>🏛️ {detalle.faccion.nombre}</h3>
                <p style={{ color: "#a0a0a0" }}>{detalle.faccion.descripcion}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Nivel</span><br /><strong style={{ color: "#fff" }}>{detalle.faccion.nivel}</strong></div>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Fondos</span><br /><strong style={{ color: "#10b981" }}>${(detalle.faccion.fondos || 0).toLocaleString()}</strong></div>
                  <div><span style={{ color: "#a0a0a0", fontSize: 12 }}>Reputacion</span><br /><strong style={{ color: "#f59e0b" }}>{detalle.faccion.reputacion_global}</strong></div>
                </div>

                {detalle.miembros && detalle.miembros.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ color: "#fff", margin: "0 0 8px" }}>Miembros ({detalle.miembros.length})</h4>
                    {detalle.miembros.map((m, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2d2640" }}>
                        <span style={{ color: "#fff" }}>{rangoIcon(m.rango)} {m.nombre} ({m.stateid})</span>
                        <span style={{ color: "#a0a0a0", fontSize: 12 }}>{m.rango} • ${(m.contribucion_total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function rangoIcon(rango) {
  const icons = { lider: "👑", oficial: "⭐", miembro: "🔹", recluta: "🔸" };
  return icons[rango] || "•";
}

export default Facciones;
