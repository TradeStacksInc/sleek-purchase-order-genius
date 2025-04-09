
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Skeleton } from '@/components/ui/skeleton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logPageVisit } = useActivityLogger();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
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

    // Simulate page loading - remove in production with real data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname, logPageVisit]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 content-container p-4 bg-background/60 overflow-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-[500px] w-full" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
