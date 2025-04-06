
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDatabaseInfo } from '@/utils/databaseManager';
import { Database, HardDrive } from 'lucide-react';

const StorageStats: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    usedPercentage: 0,
    recordCounts: {} as Record<string, number>,
    lastUpdate: new Date()
  });
  
  useEffect(() => {
    // Calculate localStorage usage
    const calculateStorage = () => {
      let totalSize = 0;
      let maxSize = 5 * 1024 * 1024; // Typical localStorage limit is 5MB
      
      try {
        // Estimate total localStorage size
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length * 2; // Approx 2 bytes per character
          }
        }
        
        // Get database record counts
        const dbInfo = getDatabaseInfo();
        
        setStorageInfo({
          totalSize,
          usedPercentage: Math.min(100, (totalSize / maxSize) * 100),
          recordCounts: dbInfo.recordCounts || {},
          lastUpdate: new Date()
        });
      } catch (e) {
        console.error('Error calculating storage stats:', e);
      }
    };
    
    calculateStorage();
    
    // Set up interval to periodically update stats
    const interval = setInterval(calculateStorage, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <Database className="h-4 w-4" />
          <span>Storage Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Local Storage Usage</span>
            <span>{formatBytes(storageInfo.totalSize)} / 5 MB</span>
          </div>
          <Progress value={storageInfo.usedPercentage} className="h-2" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium">
            <HardDrive className="h-3 w-3 mr-1" />
            <span>Records</span>
            <span>Count</span>
          </div>
          {Object.entries(storageInfo.recordCounts)
            .filter(([_, count]) => count > 0)
            .sort(([_, count1], [__, count2]) => count2 - count1)
            .slice(0, 5)
            .map(([key, count]) => (
              <div key={key} className="flex justify-between text-xs">
                <span>{key.replace(/_/g, ' ').toLowerCase()}</span>
                <span>{count}</span>
              </div>
            ))}
        </div>
        
        <div className="text-xs text-gray-500 pt-2">
          Last updated: {storageInfo.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageStats;
