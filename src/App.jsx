import React from "react"
import { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { supabase } from "./supabase"
import "./App.css"

/* ================== APP ================== */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/expediente" element={<Expediente />} />
    </Routes>
  );
}

const [usuariosDB, setUsuariosDB] = useState([]);

/* ================== HOME ================== */
function Home() {
  const navigate = useNavigate();
const [usuarios, setUsuarios] = useState([]);

useEffect(() => {

  const cargarUsuarios = async () => {

    const { data, error } = await supabase
      .from("usuarios")
      .select("*");

    if (error) {
      console.error("Error cargando usuarios:", error);
    } else {
      console.log("Usuarios DB:", data);
      setUsuariosDB(data);
    }

  };

  cargarUsuarios();

}, []);

usuariosDB.map((user) => (

  <div key={user.id}>

    <p><b>{user.nombre}</b></p>
    <p>StateID: {user.stateid}</p>
    <p>Edad: {user.edad}</p>
    <p>Rol: {user.rol}</p>

  </div>

))

  const usuarioGuardado = localStorage.getItem("usuario");

  const entrar = () => {
    if (usuarioGuardado) navigate("/expediente");
    else navigate("/registro");
  };

  return (
    <div className="home-container">

  {/* VIDEO FONDO */}
  <video
    className="video-bg"
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
  >
    <source src="/video/video.mp4" type="video/mp4" />
  </video>

  {/* CONTENIDO */}
  <div className="home-content">
  <div className="home-card">
    <h1>¡BIENVENIDO A OASIS ROLEPLAY!</h1>
    <button
  className="home-btn"
  onClick={entrar}
>
  Ingresar
</button>
  </div>
</div>

</div>
  );
}

/* ================== REGISTRO ================== */
function Registro() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) navigate("/expediente");
  }, [navigate]);

  const [nombre, setNombre] = React.useState("");
  const [edad, setEdad] = React.useState("");
  const [nacionalidad, setNacionalidad] = React.useState("");

const enviarDatos = async () => {
    if (!nombre || !edad || !nacionalidad) {
      alert("Completa todos los campos");
      return;
    }

    // Generar StateID aleatoria 0001 - 9999
function generarStateID() {
  return Math.floor(1000 + Math.random() * 9000)
      return numero.toString().padStart(4, "0");
    };

    const datos = {
      nombre,
      edad,
      nacionalidad,
      stateId: generarStateID(),
    };

const nuevo = {
  stateId: datos.stateId,
  nombre: datos.nombre || "Sin nombre",
  rol: datos.rol || "civil",
  dinero: START_MONEY,
  inventario: [],
  multas: [],
  baneado:false,
  createdAt:Date.now(),
  updatedAt:Date.now()
}

console.log("Insertando usuario:", datos)

const { data, error } = await supabase
  .from("usuarios")
  .insert([
    {
      stateid: datos.stateId,
      nombre: datos.nombre,
      edad: datos.edad,
      nacionalidad: datos.nacionalidad,
      rol: datos.rol || "civil",
      dinero: START_MONEY
    }
  ])

if (error) {
  console.error("Error insertando usuario:", error)
} else {
  console.log("Usuario guardado en DB:", data)
}

    const jugadores = JSON.parse(localStorage.getItem("jugadores")) || [];

if (!jugadores.includes(nombre)) {
  jugadores.push(nombre);
  localStorage.setItem("jugadores", JSON.stringify(jugadores));
}

    localStorage.setItem("usuario", JSON.stringify(datos));
    localStorage.setItem(`multas_${nombre}`, JSON.stringify([]));

    navigate("/expediente");
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h2>REGISTRO DE PERSONAJE</h2>

        <input
          type="text"
          placeholder="Nombre"
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Edad"
          onChange={(e) => setEdad(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nacionalidad"
          onChange={(e) => setNacionalidad(e.target.value)}
        />

        <button className="portal-button" onClick={enviarDatos}>
          Finalizar Registro
        </button>
      </div>
    </div>
  );
}

/* ================== EXPEDIENTE ================== */
function Expediente() {
  const navigate = useNavigate();
  const datos = JSON.parse(localStorage.getItem("usuario"));

  React.useEffect(() => {
    if (!datos) navigate("/");
  }, [datos, navigate]);

  if (!datos) return null;

  const guardarUsuarioDB = async (datos) => {

  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        stateid: datos.stateId,
        nombre: datos.nombre,
        rol: datos.rol || "civil",
        dinero: START_MONEY
      }
    ]);

  if (error) {
    console.error("Error guardando usuario:", error);
  } else {
    console.log("Usuario guardado en DB:", data);
  }

};

/* ======================= STAFF SYSTEM (GLOBAL) ======================= */

const START_MONEY = 20000

/* ================= UTIL ================= */

const safeParse = (v,fallback)=>{
try{
const x = JSON.parse(v)
return x ?? fallback
}catch{
return fallback
}
}

const genId = ()=>`${Date.now()}_${Math.random().toString(16).slice(2)}`

/* ================= DATABASE GLOBAL ================= */

const [usuarios,setUsuarios] = React.useState(()=>{
return safeParse(localStorage.getItem("usuarios"),[])
})

React.useEffect(()=>{
localStorage.setItem("usuarios",JSON.stringify(usuarios))
},[usuarios])


/* ================= ADMIN LOGS ================= */

const [adminLogs,setAdminLogs] = React.useState(()=>{
return safeParse(localStorage.getItem("adminLogs"),[])
})

React.useEffect(()=>{
localStorage.setItem("adminLogs",JSON.stringify(adminLogs))
},[adminLogs])


/* ================= UI STAFF ================= */

const [staffTab,setStaffTab] = React.useState("usuarios")
const [staffTargetId,setStaffTargetId] = React.useState("")
const [staffMonto,setStaffMonto] = React.useState("")
const [staffSearch,setStaffSearch] = React.useState("")
const [staffArmaSeleccionada,setStaffArmaSeleccionada] = React.useState("")


/* ================= OBTENER USUARIO ================= */

const getUserById = React.useCallback((stateId)=>{
return usuarios.find(u=>String(u.stateId)===String(stateId))
},[usuarios])


/* ================= ADMIN LOG ================= */

const addLog = React.useCallback((accion)=>{

const who = datos?.stateId
? `${datos.nombre} (${datos.stateId})`
: "ADMIN"

const entry = {
id:genId(),
fecha:new Date().toLocaleString(),
admin:who,
accion
}

setAdminLogs(prev=>[entry,...prev].slice(0,500))

},[])


/* ================= REGISTRAR USUARIO ================= */

React.useEffect(()=>{

if(!datos?.stateId) return

setUsuarios(prev=>{

const idx = prev.findIndex(u=>String(u.stateId)===String(datos.stateId))

if(idx===-1){

const nuevo = {

stateId:datos.stateId,
nombre:datos.nombre || "Sin nombre",
rol:datos.rol || "civil",
dinero:START_MONEY,
inventario:[],
multas:[],
baneado:false,

createdAt:Date.now(),
updatedAt:Date.now()

}

return [...prev,nuevo]

}

const copia=[...prev]

copia[idx]={
...copia[idx],
nombre:datos.nombre,
rol:datos.rol,
updatedAt:Date.now()
}

return copia

})

}, [datos?.stateId])  


/* ================= USUARIO ACTUAL ================= */

const currentUser = React.useMemo(()=>{

if(!datos?.stateId) return null

return usuarios.find(u=>String(u.stateId)===String(datos.stateId)) || null

},[usuarios,datos])


/* ================= ACCIONES STAFF ================= */

/* ================= VER BANCO DE JUGADOR ================= */

const getBankByStateId = (stateId) => {

const bankKey = `bank_${stateId}`

const bank = safeParse(localStorage.getItem(bankKey), null)

return bank

}

/* CAMBIAR ROL */

const setRolByStateId=(stateId,rol)=>{

if(!stateId) return

setUsuarios(prev=>prev.map(u=>

String(u.stateId)===String(stateId)
? {...u,rol,updatedAt:Date.now()}
: u

))

addLog(`Rol cambiado: ${stateId} => ${rol}`)

}


/* DINERO */

const modificarDineroByStateId = (stateId, delta) => {

const sid = String(stateId).trim()
const monto = Number(delta)

if(!sid) return
if(!Number.isFinite(monto) || monto === 0) return

const bankKey = `bank_${sid}`

const bank = safeParse(localStorage.getItem(bankKey), null)

if(!bank){
addLog(`ERROR banco no encontrado ${sid}`)
return
}

/* modificar balance */

const newAccounts = bank.accounts.map(acc =>

acc.id === bank.activeAccountId
? {...acc,balance:Math.max(0,Number(acc.balance||0)+monto)}
: acc

)

const newBank = {
...bank,
accounts:newAccounts
}

/* guardar banco */

localStorage.setItem(bankKey,JSON.stringify(newBank))

/* actualizar usuario */

setUsuarios(prev => prev.map(u =>

String(u.stateId) === sid
? {...u,dinero:Math.max(0,(u.dinero||0)+monto)}
: u

))

/* si el staff modificó su propio banco actualizar UI */

if(datos?.stateId === sid){
setBank(newBank)
}

addLog(`Banco modificado ${monto > 0 ? "+" : ""}${monto} a ${sid}`)

}

{staffTargetId && (()=>{

const bank = getBankByStateId(staffTargetId)

if(!bank) return <p>Este jugador no tiene banco.</p>

return(

<div className="staff-bank-view">

<h3>Banco del jugador</h3>

{bank.accounts.map(acc =>(

<div key={acc.id} className="staff-bank-card">

<div><strong>Cuenta:</strong> {acc.name}</div>

<div><strong>Balance:</strong> ${Number(acc.balance||0).toLocaleString("es-CL")}</div>

</div>

))}

</div>

)

})()}

/* INVENTARIO */

/* ================= INVENTARIO STAFF SINCRONIZADO ================= */

/* obtener inventario */

const getInventarioByStateId = (stateId) => {

const user = getUserById(stateId)

if(!user) return []

const key = `pertenencias_${user.nombre}`

const data = safeParse(localStorage.getItem(key),{
vehiculos:[],
documentos:[],
mochila:[]
})

return Array.isArray(data.mochila) ? data.mochila : []

}


/* guardar inventario */

const setInventarioByStateId = (stateId, mochilaNueva) => {

const user = getUserById(stateId)

if(!user) return

const key = `pertenencias_${user.nombre}`

const data = safeParse(localStorage.getItem(key),{
vehiculos:[],
documentos:[],
mochila:[]
})

const nuevasPertenencias = {
...data,
mochila: mochilaNueva
}

/* guardar localStorage */

localStorage.setItem(key,JSON.stringify(nuevasPertenencias))

/* sincronizar usuarios */

setUsuarios(prev=>prev.map(u=>

String(u.stateId)===String(stateId)

?{
...u,
inventario:mochilaNueva,
updatedAt:Date.now()
}

:u

))

/* sincronizar jugador actual */

if(datos?.stateId===stateId){
setPertenencias(nuevasPertenencias)
}

}


/* ================= AGREGAR ARMA ================= */

const agregarArmaAInventario = (stateId, armaId) => {

const arma = armasTienda.find(a=>String(a.id)===String(armaId))

if(!arma) return

const inventario = getInventarioByStateId(stateId)

const nuevaArma = {

id: genId(),

nombre: arma.nombre,

imagen: arma.imagen || "",

tipo: "arma",

precio: arma.precio,

createdAt: Date.now()

}

const nuevaMochila = [nuevaArma,...inventario]

setInventarioByStateId(stateId,nuevaMochila)

addLog(`Staff agregó ${arma.nombre} a ${stateId}`)

}


/* ================= QUITAR ITEM ================= */

const eliminarItemInventario = (stateId,itemId) => {

const inventario = getInventarioByStateId(stateId)

const nuevaMochila = inventario.filter(

item=>String(item.id)!==String(itemId)

)

setInventarioByStateId(stateId,nuevaMochila)

addLog(`Staff quitó item ${itemId} a ${stateId}`)

}

/* MULTAS */

const getMultasByStateId=(stateId)=>{

const u=getUserById(stateId)

return u?.multas || []

}


/* ELIMINAR MULTA */

const eliminarMultaById=(stateId,multaId)=>{

setUsuarios(prev=>prev.map(u=>{

if(String(u.stateId)!==String(stateId)) return u

return{
...u,
multas:u.multas.filter(m=>m.id!==multaId)
}

}))

addLog(`Multa eliminada ${multaId} de ${stateId}`)

}


/* ================= INVENTARIO COMPRAS ================= */

const addItemToCurrentUserInventory = (item) => {

if(!datos?.stateId) return

/* crear item seguro */

const safeItem = {

id: item?.id || genId(),

nombre: item?.nombre || "Item",

imagen: item?.imagen || "",

tipo: item?.tipo || "item",   // IMPORTANTE para detectar armas

precio: Number(item?.precio || 0),

createdAt: Date.now()

}

/* actualizar inventario */

setUsuarios(prev => prev.map(u => {

if(String(u.stateId) !== String(datos.stateId)) return u

return {

...u,

inventario: [

safeItem,

...(Array.isArray(u.inventario) ? u.inventario : [])

]

}

}))

/* log admin */

addLog(`Item añadido al inventario: ${safeItem.nombre}`)

}


/* ================= ESTADISTICAS ================= */

const staffStats = React.useMemo(()=>{

return{

totalJugadores:usuarios.length,

totalStaff:usuarios.filter(u=>u.rol==="staff").length,

totalBaneados:usuarios.filter(u=>u.baneado).length,

dineroTotal:usuarios.reduce((a,u)=>a+(u.dinero||0),0),

totalItems:usuarios.reduce((a,u)=>a+(u.inventario||[]).length,0),

totalMultas:usuarios.reduce((a,u)=>a+(u.multas||[]).length,0)

}

},[usuarios])


/* ================= PERMISO STAFF ================= */

const canSeeStaff = React.useMemo(()=>{

return datos?.rol==="staff"

},[datos])


/* ===================== FIN STAFF SYSTEM ===================== */


  // ================== SECCIONES (sidebar) ==================
const secciones = [
  { id: "identidad", label: "Identidad", icon: "🪪" },
  { id: "finanzas", label: "Finanzas", icon: "💳" },
  { id: "pertenencias", label: "Pertenencias", icon: "📦" },
  { id: "municipalidad", label: "Gestión de Multas", icon: "🧾" },
  { id: "tienda", label: "Mercado", icon: "🏪" },

  ...(datos.rol === "staff"
    ? [{ id: "staff", label: "Panel Staff", icon: "🛠️" }]
    : []),
];

  const [active, setActive] = React.useState("identidad");
  const [tiendaTab, setTiendaTab] = React.useState("vehiculos");
  
const [adminTarget, setAdminTarget] = useState("");
const [adminMonto, setAdminMonto] = useState(0);
const [objetoEliminar, setObjetoEliminar] = useState("");

const agregarDineroAdmin = () => {
  const bankKey = `bank_${adminTarget}`;
  const bankData = JSON.parse(localStorage.getItem(bankKey));
  if (!bankData) return alert("Jugador no encontrado");

  bankData.accounts[0].balance += adminMonto;
  localStorage.setItem(bankKey, JSON.stringify(bankData));

  registrarLogAdmin(`Agregó $${adminMonto} a ${adminTarget}`);
  alert("Dinero agregado");
};

const quitarDineroAdmin = () => {
  const bankKey = `bank_${adminTarget}`;
  const bankData = JSON.parse(localStorage.getItem(bankKey));

  if (!bankData) return alert("Jugador no encontrado");

  bankData.accounts[0].balance -= adminMonto;

  localStorage.setItem(bankKey, JSON.stringify(bankData));
  alert("Dinero quitado correctamente");
};

const limpiarMultasAdmin = () => {
  const multasKey = `multas_${adminTarget}`;
  localStorage.setItem(multasKey, JSON.stringify([]));
  alert("Multas limpiadas");
};

const eliminarObjetoAdmin = () => {
  const pertenenciasKey = `pertenencias_${adminTarget}`;
  const data = JSON.parse(localStorage.getItem(pertenenciasKey));

  if (!data) return alert("Jugador no encontrado");

  data.mochila = (data.mochila || []).filter(
    (item) =>
      item.nombre.toLowerCase() !== objetoEliminar.toLowerCase()
  );

  localStorage.setItem(pertenenciasKey, JSON.stringify(data));
  alert("Objeto eliminado");
};

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

/* ================= SINCRONIZAR INVENTARIO ================= */

React.useEffect(()=>{

if(!datos?.stateId) return

setUsuarios(prev => prev.map(u => {

if(String(u.stateId) !== String(datos.stateId)) return u

return {

...u,

inventario: pertenencias?.mochila || []

}

}))

},[pertenencias])

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
        balance: 20000, // 💰 dinero inicial
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

  // 💳 Descontar del banco
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

  // 📦 Agregar a pertenencias
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

  // 📉 Bajar stock
  setVehiculosTienda((prev) =>
    prev.map((v) =>
      v.id === compraSeleccionada.id
        ? { ...v, stock: Math.max(0, Number(v.stock) - 1) }
        : v
    )
  );

  // 🔔 Toast
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

  // 💳 Descontar dinero
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance - precio }
        : a
    ),
  }));

  // 📄 Agregar a pertenencias
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

  // 💳 Descontar banco
  setBank((prev) => ({
    ...prev,
    accounts: prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance - precio }
        : a
    ),
  }));

  // 🎒 Agregar a mochila
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

  // 💳 DESCONTAR DINERO
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

  // 📄 SI ES LICENCIA → AGREGAR A PERTENENCIAS
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

  // 🚗 SI ES VEHÍCULO
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

  // 🔔 TOAST
  setToast({
    type: "success",
    message: "Compra realizada con éxito",
  });

  setTimeout(() => setToast(null), 3000);

  // ❌ CERRAR MODAL
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
      alert("Datos copiados ✅");
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

    setSuccessMessage("Transferencia realizada con éxito ✅");
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
              <span className="sidebar-icon">{s.icon}</span>
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
                      <div className="chip">▦</div>
                      <div className="bank-brand">{bank.brand}</div>
                    </div>

                    <div className="bank-label">SALDO DISPONIBLE</div>

                    <div className="bank-balance">
                      <span className="money">$</span>
                      <span className="money-amount">
                        {bank.hideBalance ? "****" : Number(activeAccount?.balance || 0).toLocaleString("en-US")}
                      </span>
                      <button className="eye" onClick={toggleHideBalance} title="Mostrar/Ocultar">
                        {bank.hideBalance ? "👁️" : "🙈"}
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
                    <div className="user-icon">💼</div>
                    <div>
                      <div className="user-title">Ciudadano</div>
                      <div className="user-sub">Nómina al día. Próximo pago pronto.</div>
                    </div>
                  </div>

                  <div className="bank-ops">
                    <div className="ops-title">Operaciones</div>

                    <div className="ops-grid">
                      <button className="op-btn op-primary" onClick={() => setOpenTransfer(true)}>
                        <div className="op-icon">✈️</div>
                        <div className="op-text">Transferir</div>
                      </button>

                      <button className="op-btn" onClick={copyDatos}>
                        <div className="op-icon">📋</div>
                        <div className="op-text">Copiar Datos</div>
                      </button>

                      <button className="op-btn" onClick={() => setOpenContact(true)}>
                        <div className="op-icon">👤➕</div>
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
                      <button className="modal-x" onClick={() => setOpenTransfer(false)}>✕</button>
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
                      <button className="modal-x" onClick={() => setOpenContact(false)}>✕</button>
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
                  🚗 Vehículos
                </button>
                <button className={`tab-btn ${subTab === "documentos" ? "active" : ""}`} onClick={() => setSubTab("documentos")}>
                  🪪 Documentos
                </button>
                <button className={`tab-btn ${subTab === "mochila" ? "active" : ""}`} onClick={() => setSubTab("mochila")}>
                  🎒 Mochila
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
                ← Volver a Mi Expediente
              </button>

              <div className="muni-grid">
                <div className="muni-card">
                  <div className="muni-card-head">
                    <span className="muni-card-icon">🧾</span>
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
                    <span className="muni-card-icon">💰</span>
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
                    <span className="muni-card-icon">⚖️</span>
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
        <span className="toast-icon">✔</span>
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
    🚗 Vehículos
  </button>

  <button
    className={`tab-btn ${tiendaTab === "documentos" ? "active" : ""}`}
    onClick={() => setTiendaTab("documentos")}
  >
    📄 Documentos
  </button>

  <button
    className={`tab-btn ${tiendaTab === "armas" ? "active" : ""}`}
    onClick={() => setTiendaTab("armas")}
  >
    🔫 Armas
  </button>
</div>

    <div className="market-content">

{vehiculoPreview && (
  <div className="modal-backdrop" onClick={() => setVehiculoPreview(null)}>
    <div className="vehiculo-preview-modal" onClick={(e) => e.stopPropagation()}>
      
      <div className="preview-header">
        <h2>{vehiculoPreview.nombre}</h2>
        <button onClick={() => setVehiculoPreview(null)}>✕</button>
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
            💳 Confirmar Compra
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
        <button onClick={() => setCompraSeleccionada(null)}>✕</button>
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
                    onClick={() =>
                      setCompraSeleccionada({
                        ...doc,
                        tipo: "documento"
                      })
                    }
                  >
                    🛒
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
                    onClick={() => setVehiculoPreview(auto)}
                    disabled={auto.stock <= 0}
                  >
                    🛒
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
                    onClick={() =>
                      setCompraSeleccionada({
                        ...arma,
                        tipo: "arma",
                      })
                    }
                  >
                    🛒
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

{/* ================= STAFF PANEL ================= */}
{active === "staff" && canSeeStaff && (

<div className="staff-wrap">

<h2 className="staff-title">Panel Administrativo</h2>

{/* ================= INPUTS ================= */}

<div className="staff-inputs">

<input
placeholder="StateID objetivo"
value={staffTargetId}
onChange={(e)=>setStaffTargetId(e.target.value)}
/>

<input
placeholder="Monto"
value={staffMonto}
onChange={(e)=>setStaffMonto(e.target.value)}
/>

</div>


{/* ================= TABS ================= */}

<div className="staff-tabs">

<button onClick={()=>setStaffTab("usuarios")}>👥 Usuarios</button>

<button onClick={()=>setStaffTab("dinero")}>💰 Dinero</button>

<button onClick={()=>setStaffTab("staff")}>⭐ Staff</button>

<button onClick={()=>setStaffTab("inventario")}>🎒 Inventario</button>

<button onClick={()=>setStaffTab("multas")}>🧾 Multas</button>

<button onClick={()=>setStaffTab("logs")}>📜 Logs</button>

<button onClick={()=>setStaffTab("stats")}>📊 Stats</button>

</div>


{/* ================= USUARIOS ================= */}

{staffTab === "usuarios" && (

<div className="staff-section">

<input
className="staff-search"
placeholder="Buscar usuario..."
value={staffSearch}
onChange={(e)=>setStaffSearch(e.target.value)}
/>

<div className="staff-user-grid">

{usuarios
.filter(u=>
u.nombre.toLowerCase().includes(staffSearch.toLowerCase()) ||
String(u.stateId).includes(staffSearch)
)
.map((u)=>(

<div
key={u.stateId}
className={`staff-user-card ${staffTargetId === String(u.stateId) ? "selected" : ""}`}
onClick={()=>setStaffTargetId(String(u.stateId))}
>

<strong>{u.nombre}</strong>

<div>StateID: {u.stateId}</div>

<div>Rol: {u.rol}</div>

<div className="staff-user-actions">

<button onClick={(e)=>{
e.stopPropagation()
setStaffTargetId(u.stateId)
setStaffTab("dinero")
}}>
💰 Dinero
</button>

<button onClick={(e)=>{
e.stopPropagation()
setStaffTargetId(u.stateId)
setStaffTab("inventario")
}}>
🎒 Inventario
</button>

<button onClick={(e)=>{
e.stopPropagation()
setStaffTargetId(u.stateId)
setStaffTab("multas")
}}>
🧾 Multas
</button>

</div>

</div>

))}

</div>

</div>

)}


{/* ================= DINERO ================= */}

{staffTab === "dinero" && (

<div className="staff-section">

<h3>Gestión de dinero</h3>

{staffTargetId && (()=>{

const bank = getBankByStateId(staffTargetId)

if(!bank) return <p>No existe banco para este jugador.</p>

return(

<div className="staff-bank-view">

{bank.accounts.map(acc=>(

<div key={acc.id} className="staff-bank-card">

<div><strong>Cuenta:</strong> {acc.name}</div>

<div><strong>Balance:</strong> ${Number(acc.balance||0).toLocaleString("es-CL")}</div>

</div>

))}

</div>

)

})()}

<div className="staff-money-actions">

<button
onClick={()=>modificarDineroByStateId(staffTargetId,Number(staffMonto))}
>
Agregar dinero
</button>

<button
onClick={()=>modificarDineroByStateId(staffTargetId,-Number(staffMonto))}
>
Quitar dinero
</button>

</div>

</div>

)}


{/* ================= STAFF ================= */}

{staffTab === "staff" && (

<div className="staff-section">

<h3>Gestión de Staff</h3>

<button onClick={()=>setRolByStateId(staffTargetId,"staff")}>
Dar Staff
</button>

<button onClick={()=>setRolByStateId(staffTargetId,"civil")}>
Quitar Staff
</button>

</div>

)}


{/* ================= INVENTARIO ================= */}

{staffTab === "inventario" && (
  <div className="staff-section">
    <h3>Inventario del jugador</h3>

    {!staffTargetId ? (
      <p>Selecciona un jugador.</p>
    ) : (
      <>
        <div className="staff-add-item">
          <h4>Agregar arma</h4>

          <div className="staff-add-row">
            <select
              value={staffArmaSeleccionada}
              onChange={(e) => setStaffArmaSeleccionada(e.target.value)}
            >
              <option value="">Seleccionar arma</option>
              {armasTienda.map((arma) => (
                <option key={arma.id} value={arma.id}>
                  {arma.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (!staffTargetId || !staffArmaSeleccionada) return;
                agregarArmaAInventario(staffTargetId, staffArmaSeleccionada);
                setStaffArmaSeleccionada("");
              }}
            >
              Agregar arma
            </button>
          </div>
        </div>

        <div className="staff-inventory-grid">
          {getInventarioByStateId(staffTargetId).length === 0 ? (
            <p>Este jugador no tiene objetos.</p>
          ) : (
            getInventarioByStateId(staffTargetId).map((item) => (
              <div key={item.id} className="staff-item-card">
                <div className="staff-item-image">
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} />
                  ) : (
                    <div className="staff-item-placeholder">Sin imagen</div>
                  )}
                </div>

                <div className="staff-item-info">
                  <strong>{item.nombre}</strong>
                  <div>Tipo: {item.tipo || "item"}</div>
                  <div>
                    Precio: $
                    {Number(item.precio || 0).toLocaleString("es-CL")}
                  </div>

                  <button
                    onClick={() =>
                      eliminarItemInventario(staffTargetId, item.id)
                    }
                  >
                    Quitar arma
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    )}
  </div>
)}

{/* ================= MULTAS ================= */}

{staffTab === "multas" && (

<div className="staff-section">

<h3>Multas del jugador</h3>

{getMultasByStateId(staffTargetId).map(m=>(

<div key={m.id} className="staff-multa-card">

<div>

<strong>{m.motivo}</strong>

<div>${Number(m.monto||0).toLocaleString("es-CL")}</div>

</div>

<button
onClick={()=>eliminarMultaById(staffTargetId,m.id)}
>
Eliminar multa
</button>

</div>

))}

</div>

)}


{/* ================= LOGS ================= */}

{staffTab === "logs" && (

<div className="staff-section">

<h3>Logs de acciones</h3>

{adminLogs.map(log=>(

<div key={log.id} className="staff-log">

<div>{log.fecha}</div>

<div>{log.accion}</div>

<div>Admin: {log.admin}</div>

</div>

))}

</div>

)}


{/* ================= STATS ================= */}

{staffTab === "stats" && (

<div className="staff-stats">

<div className="staff-stat">
<span>Jugadores</span>
<strong>{staffStats.totalJugadores}</strong>
</div>

<div className="staff-stat">
<span>Staff</span>
<strong>{staffStats.totalStaff}</strong>
</div>

<div className="staff-stat">
<span>Baneados</span>
<strong>{staffStats.totalBaneados}</strong>
</div>

<div className="staff-stat">
<span>Dinero total</span>
<strong>${staffStats.dineroTotal.toLocaleString("es-CL")}</strong>
</div>

<div className="staff-stat">
<span>Items</span>
<strong>{staffStats.totalItems}</strong>
</div>

<div className="staff-stat">
<span>Multas</span>
<strong>{staffStats.totalMultas}</strong>
</div>

</div>

)}

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