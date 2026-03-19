import React from "react";

export default function Pertenencias({
  vehiculos = [],
  documentos = [],
  mochila = []
}) {

const [tab,setTab] = React.useState("vehiculos");

/* ================= VALOR GARAJE ================= */

const valorGaraje = vehiculos.reduce(
(acc,v)=> acc + (v.valor || 0),
0
);

/* ================= UI ================= */

return(

<div className="pertenencias-container">

<h1 className="pertenencias-title">
Mis Pertenencias
</h1>


{/* TABS */}

<div className="pertenencias-tabs">

<button
className={tab==="vehiculos"?"active":""}
onClick={()=>setTab("vehiculos")}
>
🚗 VEHÍCULOS
</button>

<button
className={tab==="documentos"?"active":""}
onClick={()=>setTab("documentos")}
>
📄 DOCUMENTOS
</button>

<button
className={tab==="mochila"?"active":""}
onClick={()=>setTab("mochila")}
>
🎒 MOCHILA
</button>

</div>


{/* ================= VEHICULOS ================= */}

{tab==="vehiculos" && (

<>

<div className="garaje-info">

<div className="garaje-card">

<div className="garaje-label">
VALOR DE MI GARAJE
</div>

<div className="garaje-value">
${valorGaraje.toLocaleString("es-CL")}
</div>

</div>


<div className="garaje-card">

<div className="garaje-label">
VEHÍCULOS
</div>

<div className="garaje-value">
{vehiculos.length}
</div>

</div>

</div>


<div className="vehiculos-grid">

{vehiculos.map(v=>(
<div key={v.id} className="vehiculo-card">

{v.imagen && (
<img
src={v.imagen}
className="vehiculo-img"
/>
)}

<div className="vehiculo-plate">
{v.patente}
</div>

<div className="vehiculo-modelo">
{v.modelo}
</div>

<div className="vehiculo-bar">

<div
className="vehiculo-progress"
style={{width:(v.estado||50)+"%"}}
/>

</div>

<div className="vehiculo-expira">
Vence en {v.vence || 30} días
</div>

<div className="vehiculo-actions">

<button>🏷</button>
<button>🔁</button>
<button>📄</button>
<button>⚠</button>

</div>

</div>
))}

</div>

</>

)}



{/* ================= DOCUMENTOS ================= */}

{tab==="documentos" && (

<div className="documentos-grid">

{documentos.map(doc=>(
<div key={doc.id} className="documento-card">

<div className="documento-icon">
📇
</div>

<div className="documento-info">

<div className="documento-titulo">
{doc.nombre}
</div>

<div className="documento-fecha">
{doc.fecha}
</div>

</div>

<div className="documento-arrow">
›
</div>

</div>
))}

</div>

)}



{/* ================= MOCHILA ================= */}

{tab==="mochila" && (

<div className="mochila-grid">

{mochila.map(item=>(
<div key={item.id} className="mochila-item">

{item.imagen && (
<img
src={item.imagen}
className="mochila-img"
/>
)}

<div className="mochila-nombre">
{item.nombre}
</div>

<div className="mochila-cantidad">
x{item.cantidad || 1}
</div>

</div>
))}

</div>

)}

</div>

);

}