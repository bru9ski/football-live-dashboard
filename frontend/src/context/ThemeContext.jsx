import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings, updateSettings } from "../api/client";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications_enabled: true,
    compact_mode: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = window.localStorage.getItem("dashboard-settings");
    if (local) {
      const parsed = JSON.parse(local);
      setTheme(parsed.theme || "dark");
      setSettings(parsed);
      applyTheme(parsed.theme || "dark");
      setLoading(false);
      fetchSettings().catch(() => {});
    } else {
      fetchSettings()
        .then((res) => {
          setTheme(res.data.theme);
          setSettings(res.data);
          applyTheme(res.data.theme);
          window.localStorage.setItem(
            "dashboard-settings",
            JSON.stringify(res.data)
          );
        })
        .catch(() => {
          applyTheme("dark");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === "light") {
      root.classList.remove("theme-dark");
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
      root.classList.add("theme-dark");
    }
  };

  const updateTheme = (t) => {
    setTheme(t);
    const next = { ...settings, theme: t };
    setSettings(next);
    applyTheme(t);
    window.localStorage.setItem("dashboard-settings", JSON.stringify(next));
    updateSettings(next).catch(() => {});
  };

  const updateLocalSettings = (partial) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    window.localStorage.setItem("dashboard-settings", JSON.stringify(next));
    updateSettings(next).catch(() => {});
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="logo-mark" />
        <div className="loading-orbit">
          <div />
          <div />
        </div>
        <p className="loading-text">Carregando experiência premium...</p>
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{ theme, settings, updateTheme, updateLocalSettings }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
