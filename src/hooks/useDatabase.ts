
import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from './use-toast';
import { StoredAppData } from '@/utils/localStorage/types';
import { 
  resetDatabase as resetDatabaseUtil, 
  exportDatabase as exportDatabaseUtil,
  importDatabase as importDatabaseUtil,
  getDatabaseInfo
} from '@/utils/databaseManager';

export const useDatabase = () => {
  const { toast } = useToast();
  const app = useApp();
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dbInfo, setDbInfo] = useState(getDatabaseInfo());
  
  const refreshInfo = useCallback(() => {
    setDbInfo(getDatabaseInfo());
  }, []);
  
  const resetDatabase = useCallback(async (includeSeedData = false) => {
    try {
      setIsResetting(true);
      
      // Use app context method which will then update all state
      await app.resetDatabase(includeSeedData);
      
      toast({
        title: "Database Reset",
        description: "The database has been reset successfully.",
      });
      
      refreshInfo();
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      toast({
        title: "Reset Failed",
        description: "There was an error resetting the database.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [app, refreshInfo, toast]);
  
  const exportDatabase = useCallback(async () => {
    try {
      setIsExporting(true);
      
      // Use app context method
      const data = app.exportDatabase();
      
      toast({
        title: "Export Successful",
        description: "Database exported successfully.",
      });
      
      refreshInfo();
      return data;
    } catch (error) {
      console.error('Error exporting database:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the database.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [app, refreshInfo, toast]);
  
  const importDatabase = useCallback(async (jsonData: string) => {
    try {
      setIsImporting(true);
      
      // Use app context method
      const success = app.importDatabase(jsonData);
      
      if (success) {
        toast({
          title: "Import Successful",
          description: "Database imported successfully.",
        });
        
        refreshInfo();
      } else {
        toast({
          title: "Import Failed",
          description: "There was an error importing the database.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error importing database:', error);
      toast({
        title: "Import Failed",
        description: "There was an error importing the database.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  }, [app, refreshInfo, toast]);
  
  return {
    resetDatabase,
    exportDatabase,
    importDatabase,
    refreshInfo,
    dbInfo,
    isResetting,
    isExporting,
    isImporting
  };
};
