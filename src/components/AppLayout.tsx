import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import './AppLayout.css';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleMenuToggle() {
    setSidebarOpen((prev) => !prev);
  }

  function handleSidebarClose() {
    setSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="app-layout__main">
        <TopBar onMenuToggle={handleMenuToggle} />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
