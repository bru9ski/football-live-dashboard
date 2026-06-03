import React from "react";
import { useTheme } from "../context/ThemeContext";

const items = [
  { key: "dashboard", label: "Dashboard" },
  { key: "statistics", label: "Estatísticas" },
  { key: "alerts", label: "Alertas" },
  { key: "history", label: "Histórico" },
  { key: "settings", label: "Configurações" }
];

const Sidebar = ({ open, onClose, onNavigate, current }) => {
  const { theme } = useTheme();

  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-mark" />
          <div>
            <div className="logo-title">LiveSports IQ</div>
            <div className="logo-subtitle">Real-time insights</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${
                current === item.key ? "sidebar-item-active" : ""
              }`}
              onClick={() => {
                onNavigate(item.key);
                onClose();
              }}
            >
              <span className="sidebar-dot" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="sidebar-item sidebar-exit">Sair</button>
        <div className="sidebar-footer">
          <span className="sidebar-theme-indicator">
            Modo {theme === "dark" ? "escuro" : "claro"}
          </span>
        </div>
      </aside>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
};

export default Sidebar;
