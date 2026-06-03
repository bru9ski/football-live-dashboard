import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

const WS_URL = 'ws://localhost:8000/ws/live';
const REST_URL = 'http://localhost:8000/api/matches';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [connStatus, setConnStatus] = useState('connecting'); // connecting | live | polling
  const [scoredGoal, setScoredGoal] = useState(null); // match id que acabou de ter gol
  const prevMatchesRef = useRef([]);
  const wsRef = useRef(null);

  // Detecta gols novos comparando snapshots
  const detectGoals = useCallback((prev, next) => {
    next.forEach((nm) => {
      const om = prev.find((m) => m.id === nm.id);
      if (!om) return;
      const homeGoal = nm.score.home > om.score.home;
      const awayGoal = nm.score.away > om.score.away;
      if (homeGoal || awayGoal) {
        setScoredGoal(nm.id);
        setTimeout(() => setScoredGoal(null), 2500);
      }
    });
  }, []);

  const applyUpdate = useCallback(
    (updated) => {
      setMatches((prev) => {
        detectGoals(prev, updated);
        prevMatchesRef.current = updated;
        return updated;
      });
    },
    [detectGoals]
  );

  // Busca inicial via REST
  useEffect(() => {
    fetch(REST_URL)
      .then((r) => r.json())
      .then((d) => applyUpdate(d.matches))
      .catch(console.error);
  }, [applyUpdate]);

  // WebSocket com fallback para polling
  useEffect(() => {
    let pollInterval = null;

    const connectWS = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnStatus('live');

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'matches_update') applyUpdate(msg.data);
      };

      ws.onerror = () => {
        setConnStatus('polling');
        startPolling();
      };

      ws.onclose = () => {
        if (connStatus !== 'polling') {
          setTimeout(connectWS, 5000); // reconecta
        }
      };
    };

    const startPolling = () => {
      pollInterval = setInterval(() => {
        fetch(REST_URL)
          .then((r) => r.json())
          .then((d) => applyUpdate(d.matches))
          .catch(console.error);
      }, 12000);
    };

    connectWS();

    return () => {
      wsRef.current?.close();
      clearInterval(pollInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedMatch = matches.find((m) => m.id === selectedId) || null;

  return (
    <div className="app-grid">
      <Sidebar />
      <Dashboard
        matches={matches}
        selectedMatch={selectedMatch}
        onSelectMatch={setSelectedId}
        connStatus={connStatus}
        scoredGoal={scoredGoal}
      />
    </div>
  );
}
