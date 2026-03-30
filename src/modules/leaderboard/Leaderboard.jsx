// MODULO: Leaderboard - Rankings de Oasis //
import { useState, useEffect } from "react";
import { obtenerLeaderboard } from "../../api";

const CATEGORIAS = [
  { id: "dinero", label: "💰 Dinero", color: "#f59e0b" },
  { id: "nivel", label: "⭐ Nivel", color: "#6366f1" },
  { id: "reputacion", label: "👑 Reputación", color: "#10b981" },
  { id: "facciones", label: "🏛️ Facciones", color: "#7c3aed" },
];

function Leaderboard() {
  const [categoria, setCategoria] = useState("dinero");
  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    obtenerLeaderboard(categoria, 15)
      .then((data) => setRanking(data.ranking || []))
      .catch(() => setRanking([]))
      .finally(() => setCargando(false));
  }, [categoria]);

  const catInfo = CATEGORIAS.find(c => c.id === categoria);

  function getMedalla(i) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}.`;
  }

  function getValor(item) {
    if (categoria === "dinero") return `$${(item.dinero || 0).toLocaleString()}`;
    if (categoria === "nivel") return `Nv.${item.nivel || 1} (${item.xp || 0} XP)`;
    if (categoria === "reputacion") return `${item.reputacion || 0} rep`;
    if (categoria === "facciones") return `Nv.${item.nivel} | ${item.miembros} miembros | Rep: ${item.reputacion_global}`;
    return "";
  }

  return (
    <div className="modulo-leaderboard">
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {CATEGORIAS.map((c) => (
          <button key={c.id} onClick={() => setCategoria(c.id)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: categoria === c.id ? c.color : "#2d2640",
              color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13,
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {cargando ? (
        <p style={{ color: "#a0a0a0" }}>Cargando ranking...</p>
      ) : ranking.length === 0 ? (
        <p style={{ color: "#a0a0a0" }}>No hay datos disponibles.</p>
      ) : (
        <div>
          {ranking.map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: i < 3 ? "#1e1b2e" : "transparent",
              borderRadius: 10,
              marginBottom: 4,
              borderLeft: i < 3 ? `3px solid ${catInfo.color}` : "3px solid transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: i < 3 ? 24 : 14, width: 36, textAlign: "center" }}>
                  {getMedalla(i)}
                </span>
                <div>
                  <strong style={{ color: "#fff" }}>{item.nombre || item.nombre}</strong>
                  {item.titulo_activo && <span style={{ color: "#a0a0a0", fontSize: 11, marginLeft: 8 }}>🏅 {item.titulo_activo}</span>}
                  {item.rol && <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 8 }}>{item.rol}</span>}
                </div>
              </div>
              <span style={{ color: catInfo.color, fontWeight: 600 }}>{getValor(item)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
