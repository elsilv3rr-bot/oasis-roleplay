import React from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

const START_MONEY = 20000

export default function Registro() {
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
  const numero = Math.floor(1000 + Math.random() * 9000);
  return numero.toString().padStart(4, "0");
}

    const datos = {
  nombre,
  edad,
  nacionalidad,
  rol: "civil",
  stateId: generarStateID(),
};

console.log("Insertando usuario:", datos)

const { data, error } = await supabase
  .from("usuarios")
  .insert({
  stateid: datos.stateId,
  nombre: datos.nombre,
  edad: datos.edad,
  nacionalidad: datos.nacionalidad,
  rol: datos.rol,
  dinero: START_MONEY
})

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