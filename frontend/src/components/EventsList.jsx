import React from "react";

const EventsList = ({ records, onEdit, onDelete }) => {
  if (!records.length) {
    return (
      <div className="events-empty">
        Nenhum registro ainda. Comece adicionando um evento ou alerta.
      </div>
    );
  }

  return (
    <ul className="events-list">
      {records.map((r) => (
        <li key={r.id} className="events-item">
          <div className="events-main">
            <div className="events-title-row">
              <span className="events-dot" />
              <span className="events-title">{r.title}</span>
            </div>
            {r.description && (
              <p className="events-description">{r.description}</p>
            )}
            <div className="events-meta">
              <span className={`severity severity-${r.severity}`}>
                {r.severity}
              </span>
              <span className="events-category">{r.category}</span>
            </div>
          </div>
          <div className="events-actions">
            <button onClick={() => onEdit(r)}>Editar</button>
            <button className="danger" onClick={() => onDelete(r.id)}>
              Remover
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default EventsList;
