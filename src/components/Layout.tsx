
import React, { useState } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={open} setOpen={setOpen} />
        <main className="flex-1 overflow-auto p-6 transition-all duration-200">
          <div className="container mx-auto max-w-7xl pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
