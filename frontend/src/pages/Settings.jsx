import React, { useState } from "react";
import SettingsPanel from "../components/SettingsPanel";
import Modal from "../components/Modal";
import { fetchRecords, deleteRecord } from "../api/client";

const Settings = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const clearAllData = async () => {
    const res = await fetchRecords();
    const records = res.data;
    for (const r of records) {
      await deleteRecord(r.id);
    }
    setConfirmOpen(false);
  };

  return (
    <div className="settings-page">
      <header className="section-header">
        <h2>Configurações</h2>
        <p>Preferências de interface, tema e dados.</p>
      </header>
      <SettingsPanel onClear={() => setConfirmOpen(true)} />
      <Modal
        open={confirmOpen}
        title="Limpar todos os dados?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={clearAllData}
        confirmLabel="Sim, limpar tudo"
      >
        <p>
          Esta ação vai remover todos os registros do backend. Esta operação não
          pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
};

export default Settings;
