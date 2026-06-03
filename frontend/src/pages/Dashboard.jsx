import React, { useEffect, useState } from "react";
import {
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord
} from "../api/client";
import MetricCard from "../components/MetricCard";
import LiveHighlight from "../components/LiveHighlight";
import EventsList from "../components/EventsList";

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    category: "event",
    severity: "normal",
    is_live: false
  });

  const load = () => {
    fetchRecords().then((res) => setRecords(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      severity: form.severity,
      is_live: form.is_live
    };
    if (form.id) {
      await updateRecord(form.id, payload);
    } else {
      await createRecord(payload);
    }
    setForm({
      id: null,
      title: "",
      description: "",
      category: "event",
      severity: "normal",
      is_live: false
    });
    load();
  };

  const handleEdit = (r) => {
    setForm({ ...r });
  };

  const handleDelete = async (id) => {
    await deleteRecord(id);
    load();
  };

  const liveRecord = records.find((r) => r.is_live) || records[0] || null;
  const total = records.length;
  const alerts = records.filter((r) => r.category === "alert").length;
  const critical = records.filter((r) => r.severity === "critical").length;

  return (
    <div className="dashboard-grid">
      <section className="dashboard-metrics">
        <MetricCard
          label="Registros totais"
          value={total.toString().padStart(2, "0")}
          hint="Eventos e alertas ativos"
        />
        <MetricCard
          label="Alertas"
          value={alerts.toString().padStart(2, "0")}
          hint="Itens de atenção"
        />
        <MetricCard
          label="Críticos"
          value={critical.toString().padStart(2, "0")}
          hint="Risco máximo"
        />
      </section>

      <section className="dashboard-main">
        <LiveHighlight record={liveRecord} />
        <div className="dashboard-form">
          <h2>{form.id ? "Editar registro" : "Novo registro"}</h2>
          <form onSubmit={handleSubmit} className="record-form">
            <div className="form-row">
              <label>Título</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Ex: Gol do Vasco aos 32'"
              />
            </div>
            <div className="form-row">
              <label>Descrição</label>
              <textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Contexto do evento, impacto, etc."
              />
            </div>
            <div className="form-row form-inline">
              <div>
                <label>Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="event">Evento</option>
                  <option value="alert">Alerta</option>
                  <option value="stat">Estatística</option>
                </select>
              </div>
              <div>
                <label>Severidade</label>
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value })
                  }
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div className="checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_live}
                    onChange={(e) =>
                      setForm({ ...form, is_live: e.target.checked })
                    }
                  />
                  Destacar ao vivo
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit">
                {form.id ? "Salvar alterações" : "Adicionar registro"}
              </button>
              {form.id && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    setForm({
                      id: null,
                      title: "",
                      description: "",
                      category: "event",
                      severity: "normal",
                      is_live: false
                    })
                  }
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="dashboard-list">
        <div className="section-header">
          <h2>Registros recentes</h2>
        </div>
        <EventsList
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
};

export default Dashboard;
