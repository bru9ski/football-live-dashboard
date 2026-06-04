import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function PremiumLoader({ onReady }) {
  const [progress, setProgress] = useState(0);
  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(100, Math.floor((elapsed / 7000) * 100));
      setProgress(next);
      if (elapsed >= 7000) {
        clearInterval(interval);
        setShowEnter(true);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="intro-screen">
      <div className="intro-noise" />
      <div className="intro-glow intro-glow-left" />
      <div className="intro-glow intro-glow-right" />

      <div className="intro-card">
        <div className="intro-brand-row">
          <div className="intro-brand-mark">
            <span className="intro-brand-dot" />
          </div>
          <div className="intro-brand-text-wrap">
            <div className="intro-kicker">premium live analytics</div>
            <h1 className="intro-brand-title">
              <span className="intro-brand-main">Handcap</span>
              <span className="intro-brand-pro">PRO</span>
            </h1>
          </div>
        </div>

        <p className="intro-copy">
          Inteligência visual para acompanhar partidas, momentum e dados ao vivo
          em uma experiência refinada, minimalista e responsiva.
        </p>

        <div className="intro-progress-block">
          <div className="intro-progress-meta">
            <span>Inicializando ambiente</span>
            <span>{progress}%</span>
          </div>
          <div className="intro-progress-track">
            <div
              className="intro-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="intro-actions">
          {showEnter ? (
            <button className="intro-enter-btn" onClick={onReady}>
              Entrar
            </button>
          ) : (
            <div className="intro-waiting">aguarde 7 segundos...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  const layoutClass = useMemo(
    () => `app-grid${selectedMatchId ? ' has-detail' : ''}`,
    [selectedMatchId]
  );

  if (showLoader) {
    return <PremiumLoader onReady={() => setShowLoader(false)} />;
  }

  return (
    <div className={layoutClass}>
      <Sidebar />
      <Dashboard
        selectedMatchId={selectedMatchId}
        onSelectMatch={setSelectedMatchId}
        onCloseDetails={() => setSelectedMatchId(null)}
      />
    </div>
  );
}
