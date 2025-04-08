
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Database } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <span className="text-lg font-bold">NIPCO Station Management System</span>
        </Link>
        <Separator orientation="vertical" className="mx-4 h-6" />
        <div className="flex-1"></div>
      </div>
    </header>
  );
};

export default AppHeader;
