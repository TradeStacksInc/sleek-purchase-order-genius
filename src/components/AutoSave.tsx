
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { saveAppState } from '@/utils/localStorage';
import { toast } from "@/components/ui/use-toast";

/**
 * AutoSave component that periodically saves app state
 * and handles beforeunload event to prevent data loss
 */
const AutoSave: React.FC = () => {
  const appState = useApp();
  
  useEffect(() => {
    console.log("AutoSave component mounted");
    
    // Save current state when user navigates away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Extract only the data properties, not functions
      const dataToSave = {
        purchaseOrders: appState.purchaseOrders,
        logs: appState.logs,
        suppliers: appState.suppliers,
        drivers: appState.drivers,
        trucks: appState.trucks,
        gpsData: appState.gpsData,
        aiInsights: appState.aiInsights
      };
      
      const saveSuccess = saveAppState(dataToSave);
      
      // If save was unsuccessful, prompt the user before leaving
      if (!saveSuccess) {
        // This message might not be displayed in some browsers due to security restrictions
        const message = "Changes you made may not be saved.";
        e.returnValue = message;
        return message;
      }
    };
    
    // Set up periodic auto-save (every 30 seconds)
    const autoSaveInterval = setInterval(() => {
      const dataToSave = {
        purchaseOrders: appState.purchaseOrders,
        logs: appState.logs,
        suppliers: appState.suppliers,
        drivers: appState.drivers,
        trucks: appState.trucks,
        gpsData: appState.gpsData,
        aiInsights: appState.aiInsights
      };
      
      const saveSuccess = saveAppState(dataToSave);
      
      if (saveSuccess) {
        console.log('Auto-saved app state', new Date().toLocaleTimeString());
      } else {
        console.error('Failed to auto-save app state', new Date().toLocaleTimeString());
        toast({
          title: "Auto-save Failed",
          description: "There was an issue saving your data. Please save manually before leaving the page.",
          variant: "destructive"
        });
      }
    }, 30000);
    
    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(autoSaveInterval);
    };
  }, [appState]);
  
  // This component doesn't render anything
  return null;
};

export default AutoSave;
