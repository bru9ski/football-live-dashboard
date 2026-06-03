import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children, onNavigate, current }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        current={current}
      />
      <div className="app-main">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
