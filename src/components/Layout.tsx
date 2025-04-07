
import React, { useState } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
