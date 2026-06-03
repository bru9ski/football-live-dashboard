import React from 'react';

export default function MatchCard({ match, isSelected, hasGoal, onClick }) {
  const { home, away, score, minute, status, league, kickoff } = match;

  const statusLabel = {
    LIVE: `${minute}'`,
    SCHEDULED: kickoff || 'Em breve',
    FINISHED: 'Encerrado',
  }[status];

  return (
    <button
      className={[
        'match-card',
        isSelected ? 'match-card--selected' : '',
        hasGoal ? 'match-card--goal' : '',
        status === 'LIVE' ? 'match-card--live' : '',
        status === 'FINISHED' ? 'match-card--finished' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {/* League badge */}
      <div className="card-league">
        <span>{match.league_logo}</span>
        <span>{league}</span>
      </div>

      {/* Conteúdo principal */}
      <div className="card-main">
        {/* Time da casa */}
        <div className="card-team">
          <span className="team-logo">{home.logo}</span>
          <span className="team-name">{home.name}</span>
        </div>

        {/* Placar + status */}
        <div className="card-score-block">
          <div className={`card-score${hasGoal ? ' card-score--flash' : ''}`}>
            <span>{score.home}</span>
            <span className="score-sep">–</span>
            <span>{score.away}</span>
          </div>
          <div className="card-status">
            {status === 'LIVE' && <span className="live-dot" />}
            <span className={`status-label status-label--${status.toLowerCase()}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Time visitante */}
        <div className="card-team card-team--right">
          <span className="team-name">{away.name}</span>
          <span className="team-logo">{away.logo}</span>
        </div>
      </div>
    </button>
  );
}
