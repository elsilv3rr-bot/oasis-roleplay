import React from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {

  const navigate = useNavigate()

  const usuarioGuardado = localStorage.getItem("usuario")

  const entrar = () => {
    if (usuarioGuardado) navigate("/expediente")
    else navigate("/registro")
  }

  return (
    <div className="home-container">

      <video className="video-bg" autoPlay loop muted playsInline preload="auto">
        <source src="/video/video.mp4" type="video/mp4" />
      </video>

      <div className="home-content">

        <div className="home-card">
          <h1>¡BIENVENIDO A OASIS ROLEPLAY!</h1>

          <button className="home-btn" onClick={entrar}>
            Ingresar
          </button>
        </div>

      </div>

    </div>
  )
}