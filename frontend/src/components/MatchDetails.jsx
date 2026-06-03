import React from 'react';

const STAT_LABELS = {
  possession: 'Posse de Bola',
  shots_on_target: 'Chutes a Gol',
  shots_total: 'Chutes Totais',
  fouls: 'Faltas',
  yellow_cards: 'Cartões Amarelos',
  red_cards: 'Cartões Vermelhos',
  corners: 'Escanteios',
  offsides: 'Impedimentos',
};

const EVENT_ICONS = {
  goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
};

function StatBar({ label, home, away }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;

  return (
    <div className="stat-row">
      <span className="stat-val stat-val--home">{home}{label === 'Posse de Bola' ? '%' : ''}</span>
      <div className="stat-bar-wrap">
        <div
          className="stat-bar-fill stat-bar-fill--home"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="stat-bar-fill stat-bar-fill--away"
          style={{ width: `${awayPct}%` }}
        />
      </div>
      <span className="stat-label">{label}</span>
      <div className="stat-bar-wrap">
        <div
          className="stat-bar-fill stat-bar-fill--away"
          style={{ width: `${awayPct}%` }}
        />
        <div
          className="stat-bar-fill stat-bar-fill--home"
          style={{ width: `${homePct}%` }}
        />
      </div>
      <span className="stat-val stat-val--away">{away}{label === 'Posse de Bola' ? '%' : ''}</span>
    </div>
  );
}

export default function MatchDetails({ match, onClose }) {
  const { home, away, score, minute, status, stats, events, league } = match;

  return (
    <div className="match-details">
      {/* Header */}
      <div className="details-header">
        <div className="details-league">
          <span>{match.league_logo}</span>
          <span>{league}</span>
        </div>
        <button className="details-close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>
      </div>

      {/* Placar destaque */}
      <div className="details-scoreboard">
        <div className="details-team">
          <span className="details-team-logo">{home.logo}</span>
          <span className="details-team-name">{home.name}</span>
        </div>
        <div className="details-score-center">
          <div className="details-score">
            {score.home} – {score.away}
          </div>
          <div className="details-minute">
            {status === 'LIVE' && <span className="live-dot" />}
            {status === 'LIVE'
              ? `${minute}'`
              : status === 'FINISHED'
              ? 'Encerrado'
              : 'Agendado'}
          </div>
        </div>
        <div className="details-team details-team--right">
          <span className="details-team-name">{away.name}</span>
          <span className="details-team-logo">{away.logo}</span>
        </div>
      </div>

      {/* Tabs: Stats | Eventos */}
      <DetailsTabs stats={stats} events={events} homeShort={home.short} awayShort={away.short} />
    </div>
  );
}

function DetailsTabs({ stats, events, homeShort, awayShort }) {
  const [tab, setTab] = React.useState('stats');

  return (
    <div className="details-tabs">
      <div className="tabs-header">
        <button
          className={`tab-btn${tab === 'stats' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Estatísticas
        </button>
        <button
          className={`tab-btn${tab === 'events' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('events')}
        >
          Cronologia ({events.length})
        </button>
      </div>

      {tab === 'stats' && (
        <div className="stats-panel">
          <div className="stats-header-row">
            <span className="stats-team-label">{homeShort}</span>
            <span />
            <span />
            <span />
            <span className="stats-team-label stats-team-label--right">{awayShort}</span>
          </div>
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <StatBar
              key={key}
              label={label}
              home={stats[key]?.[0] ?? 0}
              away={stats[key]?.[1] ?? 0}
            />
          ))}
        </div>
      )}

      {tab === 'events' && (
        <div className="events-panel">
          {events.length === 0 ? (
            <p className="events-empty">Nenhum evento ainda.</p>
          ) : (
            [...events].reverse().map((ev, i) => (
              <div
                key={i}
                className={`event-item event-item--${ev.team}`}
              >
                <span className="event-minute">{ev.minute}'</span>
                <span className="event-icon">{EVENT_ICONS[ev.type] ?? '•'}</span>
                <span className="event-player">{ev.player}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
