import React from "react";

export default function Banco({ datos }) {

const [bankAlert, setBankAlert] = React.useState("");

/* ================== BANCO ================== */

const START_MONEY = 20000;

/* ================== SUELDO SEMANAL ================== */

const WEEK_SALARY = 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const salaryKey = `salary_${datos.stateId}`;

const [salaryReady, setSalaryReady] = React.useState(false);

if (!datos) return null;

const bankKey = `bank_${datos.stateId}`;

const defaultBank = React.useMemo(
  () => ({
    titular: datos.nombre,
    stateId: datos.stateId,
    accounts: [
      {
        id: "principal",
        name: "Cuenta Principal",
        balance: START_MONEY,
      },
    ],
    activeAccountId: "principal",
    contacts: [],
    transactions: [
      {
        id: Date.now(),
        type: "deposit",
        amount: START_MONEY,
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

/* ================== VERIFICAR SUELDO ================== */

React.useEffect(() => {

  const lastSalary = Number(localStorage.getItem(salaryKey)) || 0;
  const now = Date.now();

  if (now - lastSalary >= WEEK_MS) {
    setSalaryReady(true);
  }

}, []);

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

/* ================== MODALES ================== */

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

/* ================== COPIAR DATOS ================== */

const copyDatos = async () => {
  const text = `Titular: ${bank.titular}
Cuenta: ${activeAccount?.name}
StateID: ${bank.stateId}`;

  try {
    await navigator.clipboard.writeText(text);
    setBankAlert("Datos copiados ✅");
  } catch {
    setBankAlert("No se pudo copiar");
  }
};

/* ================== CONTACTOS ================== */

const addContact = () => {

  const nombre = document.getElementById("contactName")?.value?.trim();
  const stateId = document.getElementById("contactStateId")?.value?.trim();

  if (!nombre || !stateId) return setBankAlert("Completa Nombre y StateID");

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

/* ================== TRANSFERENCIA ================== */

const submitTransfer = () => {

  const amount = Number(String(monto).replace(/[^\d]/g, ""));
  if (!amount || amount <= 0) return setBankAlert("Monto inválido");

  const from = bank.accounts.find((a) => a.id === fromAccountId);
  if (!from) return;

  if (from.balance < amount) return setBankAlert("Saldo insuficiente");

  const stateId = stateIdDest.trim();
  if (!stateId) return setBankAlert("Ingresa StateID");

  if (stateId === bank.stateId)
    return setBankAlert("No puedes transferirte a ti mismo.");

  const lista = JSON.parse(localStorage.getItem("stateIDs")) || [];

  if (!lista.includes(stateId))
    return setBankAlert("El StateID no existe.");

  const ok = confirm(`¿Enviar ${formatUSD(amount)} al StateID ${stateId}?`);

  if (!ok) return;

  setBank((prev) => {

    const newAccounts = prev.accounts.map((a) =>
      a.id === fromAccountId
        ? { ...a, balance: a.balance - amount }
        : a
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

    return {
      ...prev,
      accounts: newAccounts,
      transactions: [tx, ...prev.transactions],
    };

  });

  setOpenTransfer(false);
  setStateIdDest("");
  setMonto("");
  setMotivo("");

  setSuccessMessage("Transferencia realizada con éxito ✅");

  setTimeout(() => setSuccessMessage(""), 2500);

};

/* ================== COBRAR SUELDO ================== */

const cobrarSueldo = () => {

  if (!salaryReady) return;

  setBank((prev) => {

    const newAccounts = prev.accounts.map((a) =>
      a.id === prev.activeAccountId
        ? { ...a, balance: a.balance + WEEK_SALARY }
        : a
    );

    const tx = {
      id: Date.now(),
      type: "INGRESO",
      amount: WEEK_SALARY,
      description: "Sueldo semanal",
      date: new Date().toLocaleString("en-US"),
    };

    return {
      ...prev,
      accounts: newAccounts,
      transactions: [tx, ...prev.transactions],
    };

  });

  localStorage.setItem(salaryKey, Date.now());

  setSalaryReady(false);
  setSuccessMessage(`Sueldo cobrado: ${formatUSD(WEEK_SALARY)}`);

  setTimeout(() => setSuccessMessage(""), 2500);

};

/* ================== UI ================== */

return (

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
{bank.hideBalance
? "****"
: Number(activeAccount?.balance || 0).toLocaleString("en-US")}
</span>

<button
className="eye"
onClick={toggleHideBalance}
>
{bank.hideBalance ? "👁️" : "🙈"}
</button>

</div>

<div className="bank-card-footer">

<div>
<div className="small">TITULAR</div>
<div className="big">{bank.titular}</div>
</div>

<div className="right">
<div className="small">STATE ID</div>
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

<div className="acc-name">
{acc.name.toUpperCase()}
</div>

<div className="acc-balance">
{formatUSD(acc.balance)}
</div>

</button>

))}

</div>

</div>

<div className="bank-right">

<div className="bank-usercard">
<div className="user-icon">💼</div>
<div>
<div className="user-title">Ciudadano</div>
<div className="user-sub">Cuenta activa</div>
</div>
</div>

<div className="bank-ops">

<div className="ops-title">
Operaciones
</div>

<div className="ops-grid">

<button
className="op-btn op-primary"
onClick={() => setOpenTransfer(true)}
>
Transferir
</button>

<button
className="op-btn"
onClick={copyDatos}
>
Copiar Datos
</button>

<button
className="op-btn"
onClick={() => setOpenContact(true)}
>
Nuevo Contacto
</button>

</div>

</div>

</div>

</div>

{bankAlert && (
<div className="bank-alert">

<div className="bank-alert-box">

<div className="bank-alert-title">
⚠ Error
</div>

<div className="bank-alert-text">
{bankAlert}
</div>

<button
className="bank-alert-btn"
onClick={() => setBankAlert("")}
>
Aceptar
</button>

</div>

</div>
)}

{/* SUELDO SEMANAL */}

<div className="salary-box">

<div className="salary-info">
💼 Ciudadano / Desempleado
</div>

{salaryReady && (

<button
className="salary-btn"
onClick={cobrarSueldo}
>
💰 COBRAR {formatUSD(WEEK_SALARY)}
</button>

)}

</div>

{/* MODAL TRANSFERENCIA */}

{openTransfer && (
<div className="modal-backdrop" onClick={() => setOpenTransfer(false)}>

<div className="transfer-modal" onClick={(e) => e.stopPropagation()}>

<div className="transfer-header">

<div className="transfer-title">
💳 Transferencias
</div>

<button
className="transfer-close"
onClick={() => setOpenTransfer(false)}
>
✕
</button>

</div>

<div className="transfer-tabs">

<button className="transfer-tab active">
A Terceros
</button>

</div>

<div className="transfer-body">

<label>Cuenta de Origen</label>

<select
value={fromAccountId}
onChange={(e) => setFromAccountId(e.target.value)}
>

{(bank.accounts || []).map((a) => (

<option key={a.id} value={a.id}>
{a.name} ({formatUSD(a.balance)})
</option>

))}

</select>

<label>StateID Destinatario</label>

<input
placeholder="Ej: 1234"
value={stateIdDest}
onChange={(e) => setStateIdDest(e.target.value)}
/>

<label>Monto</label>

<input
placeholder="$ 0"
value={monto}
onChange={(e) => setMonto(e.target.value)}
/>

<label>Motivo (Opcional)</label>

<input
placeholder="Ej: Pago de arriendo"
value={motivo}
onChange={(e) => setMotivo(e.target.value)}
/>

<button
className="transfer-submit"
onClick={submitTransfer}
>
ENVIAR DINERO
</button>

</div>

</div>

</div>
)}

{/* MODAL CONTACTO */}

{openContact && (
<div className="modal-backdrop" onClick={() => setOpenContact(false)}>

<div className="contact-modal" onClick={(e) => e.stopPropagation()}>

<div className="contact-header">

<div className="contact-title">
👤➕ Agregar Contacto
</div>

<button
className="contact-close"
onClick={() => setOpenContact(false)}
>
✕
</button>

</div>

<div className="contact-body">

<label>Nombre del Contacto</label>

<input
id="contactName"
placeholder=""
/>

<label>StateID</label>

<input
id="contactStateId"
placeholder="Ej: 1234"
/>

<button
className="contact-save"
onClick={addContact}
>
GUARDAR CONTACTO
</button>

</div>

</div>

</div>

)}

<div className="bank-history">

<div className="history-title">
Movimientos Recientes
</div>

<div className="history-list">

{(bank.transactions || []).length === 0 ? (

<p className="history-empty">
Sin movimientos
</p>

) : (

bank.transactions.slice(0,10).map((tx) => {

const isIngreso =
tx.type === "deposit" ||
tx.type === "TRANSFERENCIA_RECIBIDA" ||
tx.type === "INGRESO";

return (

<div key={tx.id} className="history-item">

<div className="history-left">

<div className="history-type">
{tx.type || "Movimiento"}
</div>

<div className="history-date">
{tx.date}
</div>

</div>

<div className={`history-amount ${isIngreso ? "plus" : "minus"}`}>
{isIngreso ? "+" : "-"} {formatUSD(tx.amount)}
</div>

</div>

);

})

)}

</div>
</div>

</div>

);
}