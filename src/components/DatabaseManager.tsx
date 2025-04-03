
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  resetDatabase, 
  getDatabaseInfo, 
  exportDatabase, 
  importDatabase 
} from '@/utils/databaseManager';
import { Database, Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';

const DatabaseManager: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [includeSeedData, setIncludeSeedData] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [exportedData, setExportedData] = useState('');
  const [importData, setImportData] = useState('');
  const [dbInfo, setDbInfo] = useState(getDatabaseInfo());
  
  const handleReset = () => {
    setIsResetting(true);
    setResetProgress(10);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setResetProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    // Perform the actual reset
    setTimeout(() => {
      try {
        resetDatabase(includeSeedData);
        setDbInfo(getDatabaseInfo());
        setResetProgress(100);
        
        toast({
          title: "Database Reset",
          description: "The database has been reset successfully.",
        });
        
        // Close dialog after 1 second
        setTimeout(() => {
          setIsOpen(false);
          setIsResetting(false);
          setResetProgress(0);
          
          // Reload the page to refresh all data
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error resetting database:', error);
        toast({
          title: "Reset Failed",
          description: "There was an error resetting the database.",
          variant: "destructive"
        });
        setIsResetting(false);
        setResetProgress(0);
        clearInterval(progressInterval);
      }
    }, 1000);
  };
  
  const handleExport = () => {
    try {
      const data = exportDatabase();
      setExportedData(data);
      
      // Create download link
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fuel-station-db-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Database exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting database:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the database.",
        variant: "destructive"
      });
    }
  };
  
  const handleImport = () => {
    try {
      if (!importData.trim()) {
        toast({
          title: "Import Failed",
          description: "No import data provided.",
          variant: "destructive"
        });
        return;
      }
      
      const success = importDatabase(importData);
      
      if (success) {
        setDbInfo(getDatabaseInfo());
        toast({
          title: "Import Successful",
          description: "Database imported successfully.",
        });
        
        // Reload the page to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Import Failed",
          description: "There was an error importing the database.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error importing database:', error);
      toast({
        title: "Import Failed",
        description: "There was an error importing the database.",
        variant: "destructive"
      });
    }
  };
  
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImportData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setDbInfo(getDatabaseInfo())}
        >
          <Database size={16} />
          Database Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={18} />
            Database Management
          </DialogTitle>
          <DialogDescription>
            Manage the local database for the Fuel Station application.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Database Info</TabsTrigger>
            <TabsTrigger value="reset">Reset Database</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Database Version</h3>
              <p className="text-sm">{dbInfo.version}</p>
              
              {dbInfo.lastReset && (
                <div>
                  <h3 className="font-medium mt-4">Last Reset</h3>
                  <p className="text-sm">{new Date(dbInfo.lastReset).toLocaleString()}</p>
                </div>
              )}
              
              <h3 className="font-medium mt-4">Record Counts</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(dbInfo.recordCounts).map(([key, count]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              onClick={() => setDbInfo(getDatabaseInfo())}
              className="gap-2"
              variant="outline"
            >
              <RefreshCw size={16} />
              Refresh Info
            </Button>
          </TabsContent>
          
          <TabsContent value="reset" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-amber-800 dark:text-amber-200">Warning</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Resetting the database will permanently delete all data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="seed-data"
                  checked={includeSeedData}
                  onCheckedChange={setIncludeSeedData}
                />
                <Label htmlFor="seed-data">Initialize with seed data</Label>
              </div>
              
              {isResetting && (
                <div className="space-y-2">
                  <p className="text-sm">Resetting database...</p>
                  <Progress value={resetProgress} className="h-2" />
                </div>
              )}
            </div>
            
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={isResetting}
              className="gap-2"
            >
              <RefreshCw size={16} />
              Reset Database
            </Button>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">Export Database</h3>
                <p className="text-sm">
                  Export all database records to a JSON file that can be imported later.
                </p>
                <Button
                  onClick={handleExport}
                  className="gap-2 w-full"
                  variant="outline"
                >
                  <Download size={16} />
                  Export Data
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Import Database</h3>
                <p className="text-sm">
                  Import database records from a previously exported JSON file.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="relative gap-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload size={16} />
                    Select File
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      className="sr-only"
                      onChange={handleImportFile}
                    />
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!importData}
                    className="gap-2"
                  >
                    <Database size={16} />
                    Import
                  </Button>
                </div>
                {importData && (
                  <p className="text-xs text-green-600 truncate">
                    File selected ({(importData.length / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseManager;
