import React, { useEffect, useMemo, useState } from "react";
import { fetchRecords } from "../api/client";
import MetricCard from "../components/MetricCard";

const Statistics = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords().then((res) => setRecords(res.data));
  }, []);

  const stats = useMemo(() => {
    const byCategory = records.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});
    const bySeverity = records.reduce((acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    }, {});
    return { byCategory, bySeverity };
  }, [records]);

  return (
    <div className="statistics-page">
      <section className="statistics-header">
        <h2>Visão analítica</h2>
        <p>
          Distribuição simples por categoria e severidade.
        </p>
      </section>
      <section className="statistics-grid">
        <div className="statistics-block">
          <h3>Por categoria</h3>
          <div className="statistics-cards">
            {Object.entries(stats.byCategory).map(([k, v]) => (
              <MetricCard
                key={k}
                label={k}
                value={v.toString().padStart(2, "0")}
              />
            ))}
            {!Object.keys(stats.byCategory).length && (
              <p className="muted">Sem dados ainda.</p>
            )}
          </div>
        </div>
        <div className="statistics-block">
          <h3>Por severidade</h3>
          <div className="statistics-cards">
            {Object.entries(stats.bySeverity).map(([k, v]) => (
              <MetricCard
                key={k}
                label={k}
                value={v.toString().padStart(2, "0")}
              />
            ))}
            {!Object.keys(stats.bySeverity).length && (
              <p className="muted">Sem dados ainda.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Statistics;
