
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";

const NotFound = () => {
  const location = useLocation();
  const { addActivityLog } = useApp();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Log the 404 error as an activity
    addActivityLog({
      action: 'error',
      entityType: 'system',
      entityId: 'navigation',
      details: `404 Error: User attempted to access non-existent route: ${location.pathname}`,
      user: 'Current User'
    });
  }, [location.pathname, addActivityLog]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <Button 
          variant="default" 
          className="transition-all duration-200 rounded-lg hover:shadow-sm"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
