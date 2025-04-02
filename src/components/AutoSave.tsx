
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { saveAppState } from '@/utils/localStorage';
import { setupStorageSync } from '@/utils/storageSync';

/**
 * AutoSave component that silently saves app state when user navigates away
 */
const AutoSave: React.FC = () => {
  const appState = useApp();
  
  useEffect(() => {
    console.log("AutoSave component mounted");
    
    // Setup cross-tab synchronization
    setupStorageSync();
    
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
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [appState]);
  
  // This component doesn't render anything
  return null;
};

export default AutoSave;
