
import React, { useState } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={open} setOpen={setOpen} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
