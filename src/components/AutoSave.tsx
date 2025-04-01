
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { saveAppState } from '@/utils/localStorage';

/**
 * AutoSave component that periodically saves app state
 * and handles beforeunload event to prevent data loss
 */
const AutoSave: React.FC = () => {
  const appState = useApp();
  
  useEffect(() => {
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
      
      saveAppState(dataToSave);
    };
    
    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
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
      
      saveAppState(dataToSave);
      console.log('Auto-saved app state', new Date().toLocaleTimeString());
    }, 30000);
    
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
