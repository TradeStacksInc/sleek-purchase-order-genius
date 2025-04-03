
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import AutoSave from './AutoSave';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className={`flex-1 overflow-y-auto p-4 pb-0 transition-all ${sidebarOpen ? 'md:pl-72' : ''}`}>
          {children}
          <AutoSave />
        </main>
      </div>
    </div>
  );
};

export default Layout;
