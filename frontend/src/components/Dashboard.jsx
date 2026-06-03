import React from 'react';
import MatchCard from './MatchCard';
import MatchDetails from './MatchDetails';

const STATUS_ORDER = { LIVE: 0, SCHEDULED: 1, FINISHED: 2 };

export default function Dashboard({
  matches,
  selectedMatch,
  onSelectMatch,
  connStatus,
  scoredGoal,
}) {
  const sorted = [...matches].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
  );

  const live = sorted.filter((m) => m.status === 'LIVE');
  const scheduled = sorted.filter((m) => m.status === 'SCHEDULED');
  const finished = sorted.filter((m) => m.status === 'FINISHED');

  const StatusDot = () => (
    <div className="conn-status">
      <span className={`conn-dot conn-dot--${connStatus}`} />
      <span>{connStatus === 'live' ? 'WebSocket ao vivo' : connStatus === 'polling' ? 'Polling ativo' : 'Conectando...'}</span>
    </div>
  );

  const Section = ({ title, items }) =>
    items.length > 0 ? (
      <div className="match-section">
        <h3 className="match-section-title">{title}</h3>
        <div className="match-list">
          {items.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              isSelected={selectedMatch?.id === m.id}
              hasGoal={scoredGoal === m.id}
              onClick={() => onSelectMatch(m.id === selectedMatch?.id ? null : m.id)}
            />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="dashboard">
      {/* Cabeçalho */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard ao Vivo</h1>
          <p className="dashboard-subtitle">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
        </div>
        <StatusDot />
      </header>

      {/* Layout: lista de jogos + painel de detalhes */}
      <div className={`dashboard-body${selectedMatch ? ' has-detail' : ''}`}>
        {/* Lista de partidas */}
        <div className="matches-panel">
          {matches.length === 0 ? (
            <div className="empty-state">Carregando partidas...</div>
          ) : (
            <>
              <Section title="🔴 Ao Vivo" items={live} />
              <Section title="🕐 Agendados" items={scheduled} />
              <Section title="✅ Encerrados" items={finished} />
            </>
          )}
        </div>

        {/* Painel de detalhes */}
        {selectedMatch && (
          <div className="detail-panel">
            <MatchDetails match={selectedMatch} onClose={() => onSelectMatch(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
