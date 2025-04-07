
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logPageVisit } = useActivityLogger();
  
  // Log page visits
  useEffect(() => {
    // Get the page name from the pathname
    const getPageName = (pathname: string) => {
      if (pathname === '/') return 'Dashboard';
      const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;
      return path
        .split('/')
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
    };
    
    const pageName = getPageName(location.pathname);
    logPageVisit(pageName);
  }, [location.pathname, logPageVisit]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 content-container p-4 bg-background/60">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
