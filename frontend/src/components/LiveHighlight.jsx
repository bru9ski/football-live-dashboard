import React from "react";

const LiveHighlight = ({ record }) => {
  if (!record) return null;
  return (
    <div className="live-highlight">
      <div className="live-header">
        <span className="live-pill">Destaque ao vivo</span>
        <span className="live-category">{record.category}</span>
      </div>
      <h2>{record.title}</h2>
      {record.description && <p>{record.description}</p>}
      <div className="live-meta">
        <span className={`severity severity-${record.severity}`}>
          {record.severity}
        </span>
        <span>Live</span>
      </div>
    </div>
  );
};

export default LiveHighlight;
