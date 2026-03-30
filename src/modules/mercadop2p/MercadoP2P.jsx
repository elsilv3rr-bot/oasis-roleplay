// MODULO: Mercado P2P - Comercio entre jugadores //
import { useState, useEffect } from "react";
import { obtenerOfertasMercado, crearOfertaMercado, comprarOfertaMercado } from "../../api";

const TIPOS = ["todos", "vehiculo", "arma", "item", "propiedad", "otro"];

function MercadoP2P() {
  const [ofertas, setOfertas] = useState([]);
  const [tipo, setTipo] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ tipo: "item", titulo: "", descripcion: "", precio: "" });
  const [msg, setMsg] = useState("");

  function cargar() {
    setCargando(true);
    const filtro = tipo === "todos" ? undefined : tipo;
    obtenerOfertasMercado(filtro)
      .then((data) => setOfertas(data.ofertas || []))
      .catch(() => setOfertas([]))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); }, [tipo]);

  async function publicar(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.precio) return;
    try {
      await crearOfertaMercado(form.tipo, form.titulo.trim(), form.descripcion.trim(), parseInt(form.precio));
      setMsg("✅ Oferta publicada");
      setCreando(false);
      setForm({ tipo: "item", titulo: "", descripcion: "", precio: "" });
      cargar();
    } catch (err) {
      setMsg("❌ " + (err.message || "Error al publicar"));
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function comprar(ofertaId) {
    if (!window.confirm("¿Seguro que quieres comprar esta oferta? Se cobrará comisión del 5%.")) return;
    try {
      const res = await comprarOfertaMercado(ofertaId);
      setMsg(`✅ Compra exitosa. Total: $${res.total?.toLocaleString() || "?"}`);
      cargar();
    } catch (err) {
      setMsg("❌ " + (err.message || "Error al comprar"));
    }
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div className="modulo-mercado">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TIPOS.map((t) => (
            <button key={t} onClick={() => setTipo(t)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none",
              background: tipo === t ? "#6366f1" : "#2d2640",
              color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize",
            }}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setCreando(!creando)} style={{
          padding: "8px 18px", borderRadius: 8, border: "none",
          background: "#10b981", color: "#fff", cursor: "pointer", fontWeight: 600,
        }}>
          {creando ? "Cancelar" : "➕ Publicar"}
        </button>
      </div>

      {msg && <div style={{ padding: 10, background: "#1e1b2e", borderRadius: 8, marginBottom: 12, color: "#fff" }}>{msg}</div>}

      {creando && (
        <form onSubmit={publicar} style={{ background: "#1e1b2e", padding: 16, borderRadius: 12, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            style={{ padding: 8, borderRadius: 6, background: "#2d2640", color: "#fff", border: "none" }}>
            {TIPOS.filter(t => t !== "todos").map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Título de la oferta" value={form.titulo} maxLength={100}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            style={{ padding: 8, borderRadius: 6, background: "#2d2640", color: "#fff", border: "none" }} />
          <textarea placeholder="Descripción (opcional)" value={form.descripcion} maxLength={500}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            style={{ padding: 8, borderRadius: 6, background: "#2d2640", color: "#fff", border: "none", minHeight: 60 }} />
          <input placeholder="Precio ($)" type="number" min="1" value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            style={{ padding: 8, borderRadius: 6, background: "#2d2640", color: "#fff", border: "none" }} />
          <button type="submit" style={{
            padding: 10, borderRadius: 8, border: "none", background: "#6366f1",
            color: "#fff", cursor: "pointer", fontWeight: 600,
          }}>
            Publicar oferta
          </button>
        </form>
      )}

      {cargando ? (
        <p style={{ color: "#a0a0a0" }}>Cargando ofertas...</p>
      ) : ofertas.length === 0 ? (
        <p style={{ color: "#a0a0a0" }}>No hay ofertas activas.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {ofertas.map((o) => (
            <div key={o.id} style={{
              background: "#1e1b2e", borderRadius: 12, padding: 16,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "#2d2640", padding: "3px 10px", borderRadius: 6, fontSize: 11, color: "#a78bfa", textTransform: "capitalize" }}>
                  {o.tipo}
                </span>
                <span style={{ color: "#6b7280", fontSize: 11 }}>{o.vendedor_nombre}</span>
              </div>
              <strong style={{ color: "#fff", fontSize: 15 }}>{o.titulo}</strong>
              {o.descripcion && <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>{o.descripcion}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 18 }}>${o.precio?.toLocaleString()}</span>
                <button onClick={() => comprar(o.id)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: "#f59e0b", color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 12,
                }}>
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MercadoP2P;
