
import { useState, useEffect } from 'react';
import { getDatabaseInfo } from '@/utils/databaseManager';

export function useDatabase() {
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Get database info
      const dbInfo = getDatabaseInfo();
      setDatabaseInfo(dbInfo);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, []);

  const refreshDatabaseInfo = () => {
    setIsLoading(true);
    try {
      const dbInfo = getDatabaseInfo();
      setDatabaseInfo(dbInfo);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  };

  return { databaseInfo, isLoading, error, refreshDatabaseInfo };
}
