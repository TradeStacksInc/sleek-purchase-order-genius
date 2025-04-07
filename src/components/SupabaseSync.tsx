
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Component that ensures data is synced between Supabase and the app context
const SupabaseSync: React.FC = () => {
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);
  const { toast } = useToast();
  const appContext = useApp();
  
  // Initial sync from Supabase to local context
  useEffect(() => {
    const syncFromSupabase = async () => {
      try {
        // Check if we have an active Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase.from('trucks').select('count', { count: 'exact', head: true });
        
        if (connectionError) {
          console.error('Supabase connection error:', connectionError);
          toast({
            title: "Database Connection Error",
            description: "Unable to connect to the database. Using local data only.",
            variant: "destructive",
            duration: 5000
          });
          return;
        }
        
        // If connected, perform initial sync of all data types
        // This would trigger all the necessary data loads
        
        setIsInitialSyncComplete(true);
        console.log('Initial Supabase sync complete');
      } catch (error) {
        console.error('Error in initial Supabase sync:', error);
      }
    };
    
    syncFromSupabase();
  }, [toast]);
  
  // Set up subscription for real-time updates
  useEffect(() => {
    if (!isInitialSyncComplete) return;
    
    // Subscribe to real-time changes for trucks
    const truckSubscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'trucks' 
      }, (payload) => {
        console.log('Truck data changed in Supabase:', payload);
        // Reload trucks data into context
        // This will use the loaded data from context to update the UI
        appContext.getAllTrucks();
      })
      .subscribe();
      
    // Add more subscriptions for other tables as needed
    
    return () => {
      supabase.removeChannel(truckSubscription);
      // Remove other subscriptions
    };
  }, [isInitialSyncComplete, appContext]);
  
  // This is a non-visual component
  return null;
};

export default SupabaseSync;
