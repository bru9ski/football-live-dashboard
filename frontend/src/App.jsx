import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Settings from "./pages/Settings";

const App = () => {
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "statistics":
        return <Statistics />;
      case "alerts":
        return <Alerts />;
      case "history":
        return <History />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!entered) {
    return (
      <ThemeProvider>
        <Landing onEnter={() => setEntered(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Layout current={page} onNavigate={setPage}>
        {renderPage()}
      </Layout>
    </ThemeProvider>
  );
};

export default App;
