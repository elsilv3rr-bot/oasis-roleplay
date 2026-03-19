import React from "react";

export default function GestionMultas({ datos }) {

if (!datos) return null;

const multasKey = `multas_${datos.stateId}`;

const defaultMultas = [
{
id:1,
codigo:"AR103",
descripcion:"art 110 mal estacionado vía pública",
monto:100000,
fecha:"11-02-2026",
pagada:false
},
{
id:2,
codigo:"AR208",
descripcion:"art 110 mal estacionado vía pública",
monto:80000,
fecha:"14-02-2026",
pagada:false
}
];

const [multas,setMultas] = React.useState(()=>{

const saved = localStorage.getItem(multasKey);

return saved ? JSON.parse(saved) : defaultMultas;

});

React.useEffect(()=>{

localStorage.setItem(multasKey,JSON.stringify(multas));

},[multas]);

/* TOTAL */

const total = multas
.filter(m=>!m.pagada)
.reduce((acc,m)=>acc+m.monto,0);

/* PAGAR MULTA */

const pagarMulta = (id)=>{

setMultas(prev =>
prev.map(m =>
m.id===id ? {...m,pagada:true} : m
)
);

};

/* PAGAR TODO */

const pagarTodo = ()=>{

setMultas(prev =>
prev.map(m =>({...m,pagada:true}))
);

};

/* UI */

return(

<div className="multas-container">

<div className="multas-header">

<h1>Oficina Virtual Municipal</h1>

<p>
Consulte y regularice su situación de multas y antecedentes.
</p>

</div>

<div className="multas-grid">

{/* MULTAS */}

<div className="multas-card">

<h2>Multas Pendientes de Pago</h2>

{multas.filter(m=>!m.pagada).length===0 && (
<div className="multas-empty">
No tienes multas pendientes.
</div>
)}

{multas
.filter(m=>!m.pagada)
.map(m=>(
<div key={m.id} className="multa-item">

<div>

<b>{m.codigo}</b>

<p>{m.descripcion}</p>

<span>Emitido: {m.fecha}</span>

</div>

<button
className="btn-pagar"
onClick={()=>pagarMulta(m.id)}
>
Pagar ${m.monto.toLocaleString()}
</button>

</div>
))}

</div>


{/* TOTAL */}

<div className="multas-total">

<h3>Total a Pagar</h3>

<div className="multas-monto">
${total.toLocaleString()}
</div>

<button
className="btn-pagar-todo"
onClick={pagarTodo}
>
Pagar Todo (${total.toLocaleString()})
</button>

</div>


{/* ANTECEDENTES */}

<div className="multas-card">

<h2>Antecedentes Penales</h2>

{multas.filter(m=>!m.pagada).length===0 ? (

<div className="antecedente-limpio">

Tu expediente está limpio.  
No hay antecedentes registrados.

</div>

):(

<div className="antecedente-alert">

Tienes multas pendientes.

</div>

)}

</div>

</div>

</div>

);

}