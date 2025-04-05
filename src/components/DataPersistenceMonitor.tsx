
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatBytes } from '@/utils/storageSync';
import { Button } from '@/components/ui/button';
import { Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DataStats {
  storageSize: number;
  collections: Record<string, number>;
  lastCheck: Date;
}

const DataPersistenceMonitor: React.FC = () => {
  const { toast } = useToast();
  const [dataStats, setDataStats] = useState<DataStats>({
    storageSize: 0,
    collections: {},
    lastCheck: new Date()
  });
  const [dataIntegrity, setDataIntegrity] = useState<'checking' | 'ok' | 'warning' | 'error'>('checking');
  const [showDetails, setShowDetails] = useState(false);
  
  // Check localStorage data
  useEffect(() => {
    const checkDataPersistence = () => {
      try {
        // Calculate storage usage
        let totalSize = 0;
        const collections: Record<string, number> = {};
        
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            if (value) {
              totalSize += value.length;
              
              // For known collections, count items
              if (key.startsWith('po_system_')) {
                try {
                  const data = JSON.parse(value);
                  collections[key.replace('po_system_', '')] = Array.isArray(data) ? data.length : 0;
                } catch (e) {
                  // Not parseable JSON
                }
              }
            }
          }
        }
        
        setDataStats({
          storageSize: totalSize,
          collections,
          lastCheck: new Date()
        });
        
        // Determine data integrity status
        const hasCollections = Object.keys(collections).length > 0;
        const hasSomeData = Object.values(collections).some(count => count > 0);
        
        if (!hasCollections) {
          setDataIntegrity('error');
        } else if (!hasSomeData) {
          setDataIntegrity('warning');
        } else {
          setDataIntegrity('ok');
        }
      } catch (error) {
        console.error('Error checking data persistence:', error);
        setDataIntegrity('error');
      }
    };
    
    // Run immediately and then every 30 seconds
    checkDataPersistence();
    const interval = setInterval(checkDataPersistence, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show a warning toast if there are data integrity issues
  useEffect(() => {
    if (dataIntegrity === 'error') {
      toast({
        title: "Data Persistence Issue",
        description: "No data collections found in local storage. Your changes may not persist.",
        variant: "destructive",
        duration: 10000
      });
    } else if (dataIntegrity === 'warning') {
      toast({
        title: "Data Warning",
        description: "Local storage collections exist but appear to be empty.",
        variant: "warning",
        duration: 5000
      });
    }
  }, [dataIntegrity, toast]);
  
  const getStatusIcon = () => {
    switch (dataIntegrity) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
      case 'checking':
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  if (showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="w-80 bg-white/90 backdrop-blur shadow-lg border">
          <div className="flex items-center justify-between mb-2">
            <AlertTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" /> 
              Data Persistence Monitor
            </AlertTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setShowDetails(false)}
            >
              ×
            </Button>
          </div>
          
          <AlertDescription>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Storage Used:</span>
                <span>{formatBytes(dataStats.storageSize)}</span>
              </div>
              
              <div className="mt-1 text-xs font-semibold">Collections:</div>
              {Object.entries(dataStats.collections).map(([key, count]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span>{count} items</span>
                </div>
              ))}
              
              <div className="mt-2 text-xs text-muted-foreground">
                Last checked: {dataStats.lastCheck.toLocaleTimeString()}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="fixed bottom-4 right-4 z-50 h-8 shadow-md bg-white"
            onClick={() => setShowDetails(true)}
          >
            {getStatusIcon()}
            <span className="ml-2">Data Monitor</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Monitor local storage data persistence</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataPersistenceMonitor;
