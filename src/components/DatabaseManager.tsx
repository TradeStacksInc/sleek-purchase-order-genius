
// DatabaseManager.tsx
import React, { useState, useEffect } from 'react';
import { getDatabaseInfo, exportDatabase, importDatabase, resetDatabase } from '@/utils/databaseManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const DatabaseManager: React.FC = () => {
  const [dbInfo, setDbInfo] = useState(getDatabaseInfo());
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    setDbInfo(getDatabaseInfo());
  }, []);

  const handleExport = () => {
    const data = exportDatabase();
    setExportData(data);
  };

  const handleImport = () => {
    if (importData) {
      const success = importDatabase(importData);
      if (success) {
        toast({
          title: 'Database Imported',
          description: 'Database imported successfully.',
        });
        setDbInfo(getDatabaseInfo());
      } else {
        toast({
          title: 'Import Failed',
          description: 'Failed to import database. Please check the JSON data.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the database? All data will be lost.')) {
      resetDatabase();
      toast({
        title: 'Database Reset',
        description: 'Database has been reset to its initial state.',
      });
      setDbInfo(getDatabaseInfo());
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>
            Manage and maintain the application's local data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Database Information</h3>
            <ul className="list-disc list-inside">
              {dbInfo.version && <li>Version: {dbInfo.version}</li>}
              <li>Last Update: {dbInfo.lastUpdate.toLocaleString()}</li>
              {dbInfo.lastReset && <li>Last Reset: {dbInfo.lastReset.toLocaleString()}</li>}
              {Object.entries(dbInfo.recordCounts).map(([key, count]) => (
                <li key={key}>{key}: {count} records</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Export Database</h3>
            <Button onClick={handleExport}>Export to JSON</Button>
            {exportData && (
              <div className="mt-2">
                <Label htmlFor="exportData">Export Data:</Label>
                <Textarea id="exportData" value={exportData} readOnly className="mt-1" />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Import Database</h3>
            <Label htmlFor="importData">Import JSON Data:</Label>
            <Textarea
              id="importData"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="mt-1"
              placeholder="Paste JSON data here"
            />
            <Button onClick={handleImport} className="mt-2">Import from JSON</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleReset}>Reset Database</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DatabaseManager;
