import React from "react";
import { useTheme } from "../context/ThemeContext";

const Topbar = ({ onMenu }) => {
  const { theme } = useTheme();

  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenu}>
        <span />
        <span />
      </button>
      <div className="topbar-title">
        <span className="topbar-pill">AO VIVO</span>
        <h1>Dashboard ao vivo</h1>
      </div>
      <div className="topbar-actions">
        <div className="topbar-indicator">
          <span className="status-dot" />
          <span>Conectado</span>
        </div>
        <div className="topbar-profile">
          <span className="profile-avatar">BH</span>
          <span className="profile-name">Analista</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
