import React from "react";
import { useTheme } from "../context/ThemeContext";
import Toggle from "./Toggle";

const SettingsPanel = ({ onClear }) => {
  const { theme, updateTheme, settings, updateLocalSettings } = useTheme();

  return (
    <div className="settings-panel">
      <section>
        <h2>Aparência</h2>
        <div className="settings-row">
          <span>Modo escuro</span>
          <Toggle
            checked={theme === "dark"}
            onChange={(checked) => updateTheme(checked ? "dark" : "light")}
          />
        </div>
        <div className="settings-row">
          <span>Modo compacto</span>
          <Toggle
            checked={settings.compact_mode}
            onChange={(checked) =>
              updateLocalSettings({ compact_mode: checked })
            }
          />
        </div>
      </section>

      <section>
        <h2>Notificações</h2>
        <div className="settings-row">
          <span>Notificações ao vivo</span>
          <Toggle
            checked={settings.notifications_enabled}
            onChange={(checked) =>
              updateLocalSettings({ notifications_enabled: checked })
            }
          />
        </div>
      </section>

      <section>
        <h2>Dados</h2>
        <button className="danger" onClick={onClear}>
          Limpar todos os registros
        </button>
      </section>
    </div>
  );
};

export default SettingsPanel;
