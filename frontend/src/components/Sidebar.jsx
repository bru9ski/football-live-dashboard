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

export default function Sidebar() {
  const [active, setActive] = useState('today');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">⚽</span>
        <span className="sidebar-logo-text">LiveScore</span>
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
