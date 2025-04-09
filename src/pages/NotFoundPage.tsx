
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <div className="space-x-4">
        <Button asChild>
          <Link to="/">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
