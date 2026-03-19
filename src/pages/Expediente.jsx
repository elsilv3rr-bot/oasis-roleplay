import Sidebar from "../components/sidebar";

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const START_MONEY = 20000;

import Banco from "../modules/banco/banco";
import Pertenencias from "../modules/pertenencias/pertenencias";
import Municipalidad from "../modules/municipalidad/municipalidad";
import Tienda from "../modules/tienda/tienda";

export default function Expediente() {

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

  // ================== SECCIONES (sidebar) ==================
const secciones = [
  { id: "identidad", label: "Identidad", icon: "🪪" },
  { id: "finanzas", label: "Finanzas", icon: "💳" },
  { id: "pertenencias", label: "Pertenencias", icon: "📦" },
  { id: "municipalidad", label: "Gestión de Multas", icon: "🧾" },
  { id: "tienda", label: "Mercado", icon: "🏪" },
];

  const [active, setActive] = React.useState("identidad");
  const [tiendaTab, setTiendaTab] = React.useState("vehiculos");
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

  // ================== REGISTRO DE STATEIDs EXISTENTES ==================
  React.useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("stateIDs")) || [];
    if (datos?.stateId && !lista.includes(datos.stateId)) {
      lista.push(datos.stateId);
      localStorage.setItem("stateIDs", JSON.stringify(lista));
    }
  }, [datos?.stateId]);

/* ================= MULTAS ================= */

const multasKey = `multas_${datos.stateId}`;

const [multasState, setMultasState] = React.useState(() => {
  const saved = localStorage.getItem(multasKey);
  const parsed = saved ? JSON.parse(saved) : [];
  return Array.isArray(parsed) ? parsed : [];
});

React.useEffect(() => {
  localStorage.setItem(multasKey, JSON.stringify(multasState));
}, [multasState, multasKey]);

/* ================= MULTAS PENDIENTES ================= */

const multasPendientes = multasState.filter(m => !m.pagada);

/* ================= HOJA DE VIDA ================= */

const hojaVidaTexto =
multasPendientes.length === 0
? "{hojaVidaTexto}"
: `${multasPendientes.length} multa(s) pendiente(s).`;

/* ================= ESTADO JUDICIAL ================= */

const estadoJudicialTexto =
multasPendientes.length === 0
? "{estadoJudicialTexto}"
: "CON ANTECEDENTES";

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
      <Sidebar
  secciones={secciones}
  active={active}
  setActive={setActive}
/>

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
                  {estadoJudicialTexto}
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
  <Banco
    datos={datos}
    bank={bank}
    setBank={setBank}
    formatUSD={formatUSD}
  />
)}

          {/* ================= PERTENENCIAS ================= */}
{active === "pertenencias" && (
  <Pertenencias
    pertenencias={pertenencias}
    datos={datos}
    formatUSD={formatUSD}
  />
)}

          {/* ================= MUNICIPALIDAD ================= */}
{active === "municipalidad" && (
  <Municipalidad
    multasState={multasState}
    pagarMulta={pagarMulta}
    pagarTodo={pagarTodo}
    formatUSD={formatUSD}
  />
)}

{/* ================= TIENDA OFICIAL ================= */}
{active === "tienda" && (
  <Tienda
    vehiculosTienda={vehiculosTienda}
    documentosTienda={documentosTienda}
    armasTienda={armasTienda}
    setCompraSeleccionada={setCompraSeleccionada}
  />
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