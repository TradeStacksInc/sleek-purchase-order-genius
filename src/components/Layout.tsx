
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AIChatWidget from './AIChatWidget';
import AppHeader from './AppHeader';
import AutoSave from './AutoSave';
import { useApp } from '@/context/AppContext';

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
        <div className="hidden lg:block">
          <AIChatWidget />
        </div>
      </div>
    </div>
  );
};

export default Layout;
