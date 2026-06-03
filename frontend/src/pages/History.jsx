import React, { useEffect, useState } from "react";
import { fetchRecords, deleteRecord } from "../api/client";
import EventsList from "../components/EventsList";

const History = () => {
  const [records, setRecords] = useState([]);

  const load = () => {
    fetchRecords().then((res) =>
      setRecords(
        res.data.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      )
    );
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteRecord(id);
    load();
  };

  return (
    <div className="history-page">
      <header className="section-header">
        <h2>Histórico</h2>
        <p>Lista cronológica de todos os registros criados.</p>
      </header>
      <EventsList records={records} onEdit={() => {}} onDelete={handleDelete} />
    </div>
  );
};

export default History;
