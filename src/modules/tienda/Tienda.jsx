import React from "react";

export default function Tienda({
  vehiculosTienda,
  documentosTienda,
  armasTienda,
  setCompraSeleccionada
}) {

  return (
    <div className="market-wrap">

      <h1>Tienda Oficial</h1>

      <h2>Vehículos</h2>

      <div className="vehicle-grid">

        {vehiculosTienda.map((auto) => (

          <div key={auto.id} className="vehicle-card">

            <img src={auto.imagen} alt={auto.nombre} />

            <h3>{auto.nombre}</h3>

            <p>${auto.precio.toLocaleString("es-US")}</p>

            <button
              onClick={() =>
                setCompraSeleccionada({
                  ...auto,
                  tipo: "vehiculo"
                })
              }
            >
              Comprar
            </button>

          </div>

        ))}

      </div>

      <h2>Documentos</h2>

      {documentosTienda.map((doc) => (

        <div key={doc.id}>

          <h3>{doc.nombre}</h3>

          <button
            onClick={() =>
              setCompraSeleccionada({
                ...doc,
                tipo: "documento"
              })
            }
          >
            Comprar
          </button>

        </div>

      ))}

      <h2>Armas</h2>

      {armasTienda.map((arma) => (

        <div key={arma.id}>

          <h3>{arma.nombre}</h3>

          <button
            onClick={() =>
              setCompraSeleccionada({
                ...arma,
                tipo: "arma"
              })
            }
          >
            Comprar
          </button>

        </div>

      ))}

    </div>
  );
}