
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import AutoSave from './AutoSave';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className={`flex-1 overflow-y-auto p-4 pb-0 transition-all ${sidebarOpen ? 'md:pl-72' : ''}`}>
          {!sidebarOpen && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSidebarOpen(true)} 
              className="fixed top-20 left-4 z-30 shadow-md rounded-full bg-white hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          )}
          {children}
          <AutoSave />
        </main>
      </div>
    </div>
  );
};

export default Layout;
