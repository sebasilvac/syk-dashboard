import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleMenuToggle() {
    setSidebarOpen((prev) => !prev);
  }

  function handleSidebarClose() {
    setSidebarOpen(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-dvh">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex flex-col min-w-0">
        <TopBar onMenuToggle={handleMenuToggle} />
        <main className="flex-1 max-w-content mx-auto w-full px-4 lg:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
