import React, { useState } from 'react';

const LEAGUES = [
  { id: 'laliga', label: 'LaLiga', flag: '🇪🇸' },
  { id: 'brasileirao', label: 'Brasileirão', flag: '🇧🇷' },
  { id: 'premier', label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'champions', label: 'Champions League', flag: '⭐' },
  { id: 'seriea', label: 'Serie A', flag: '🇮🇹' },
];

const MENU = [
  { id: 'today', label: 'Hoje', icon: '📅' },
  { id: 'live', label: 'Ao Vivo', icon: '🔴' },
  { id: 'favorites', label: 'Favoritos', icon: '⭐' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
];

// Raio verde com seta pra cima — SVG inline posicionado como superscript após o 'd'
const BoltArrow = () => (
  <svg
    className="logo-bolt"
    viewBox="0 0 14 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Seta pra cima */}
    <path
      d="M7 1 L7 11"
      stroke="#00c878"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3.5 4.5 L7 1 L10.5 4.5"
      stroke="#00c878"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Raio */}
    <path
      d="M8.5 10 L5 15.5 H8 L5.5 19 L11 13 H7.8 L10.5 10 Z"
      fill="#00c878"
      opacity="0.92"
    />
  </svg>
);

export default function Sidebar() {
  const [active, setActive] = useState('today');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-lockup">
          <span className="sidebar-logo-text">
            {/* Hand */}
            <span className="logo-part logo-hand">Hand</span>
            {/* cap — o raio fica no topo, logo após o 'd' de 'cap' */}
            <span className="logo-part logo-cap">
              cap
              <BoltArrow />
            </span>
            {/* PRO */}
            <span className="logo-part logo-pro">PRO</span>
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {MENU.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.id === 'live' && (
              <span className="live-badge">AO VIVO</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-section-title">Ligas</div>
      <ul className="sidebar-leagues">
        {LEAGUES.map((l) => (
          <li key={l.id} className="sidebar-league-item">
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">BH</div>
          <div>
            <div className="sidebar-user-name">Bruno Henrique</div>
            <div className="sidebar-user-role">Analista</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
