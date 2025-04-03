
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Database, Bell } from 'lucide-react';
import DatabaseManager from './DatabaseManager';

const AppHeader: React.FC = () => {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg font-bold">Fuel Station Management</span>
        </Link>
        <Separator orientation="vertical" className="mx-4 h-6" />
        <nav className="flex-1">
          <ul className="flex gap-4">
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/orders">Orders</Link>
            </li>
            <li>
              <Link to="/delivery-log">Delivery Log</Link>
            </li>
            <li>
              <Link to="/gps-tracking">GPS Tracking</Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <DatabaseManager />
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
