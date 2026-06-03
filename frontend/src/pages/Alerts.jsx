import React, { useEffect, useState } from "react";
import { fetchRecords, deleteRecord, updateRecord } from "../api/client";
import EventsList from "../components/EventsList";

const Alerts = () => {
  const [records, setRecords] = useState([]);

  const load = () => {
    fetchRecords().then((res) =>
      setRecords(res.data.filter((r) => r.category === "alert"))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteRecord(id);
    load();
  };

  const handleEdit = async (r) => {
    const updated = {
      ...r,
      severity: r.severity === "critical" ? "normal" : "critical"
    };
    await updateRecord(r.id, updated);
    load();
  };

  return (
    <div className="alerts-page">
      <header className="section-header">
        <h2>Alertas</h2>
        <p>Foco em eventos marcados como alerta.</p>
      </header>
      <EventsList
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Alerts;
