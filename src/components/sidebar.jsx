import React from "react";

export default function Sidebar({ secciones, active, setActive }) {
  return (
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
  );
}