
import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { STORAGE_KEYS, saveToLocalStorage } from '@/utils/localStorage';

const AutoSave: React.FC = () => {
  const { 
    purchaseOrders, 
    logs, 
    suppliers, 
    drivers, 
    trucks, 
    gpsData, 
    aiInsights,
    staff,
    dispensers,
    shifts,
    sales,
    prices,
    incidents,
    activityLogs,
    tanks
  } = useApp();

  // Log component mount
  useEffect(() => {
    console.info('AutoSave component mounted');
    
    // Only save data when the user is leaving the page
    const handleBeforeUnload = () => {
      saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
      saveToLocalStorage(STORAGE_KEYS.LOGS, logs);
      saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
      saveToLocalStorage(STORAGE_KEYS.DRIVERS, drivers);
      saveToLocalStorage(STORAGE_KEYS.TRUCKS, trucks);
      saveToLocalStorage(STORAGE_KEYS.GPS_DATA, gpsData);
      saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, aiInsights);
      saveToLocalStorage(STORAGE_KEYS.STAFF, staff);
      saveToLocalStorage(STORAGE_KEYS.DISPENSERS, dispensers);
      saveToLocalStorage(STORAGE_KEYS.SHIFTS, shifts);
      saveToLocalStorage(STORAGE_KEYS.SALES, sales);
      saveToLocalStorage(STORAGE_KEYS.PRICES, prices);
      saveToLocalStorage(STORAGE_KEYS.INCIDENTS, incidents);
      saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, activityLogs);
      saveToLocalStorage(STORAGE_KEYS.TANKS, tanks);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Save data periodically WITHOUT causing any UI refresh
    const saveDataSilently = () => {
      // Use a debounced save approach to prevent excessive operations
      if (window.autoSaveTimeout) {
        clearTimeout(window.autoSaveTimeout);
      }
      
      window.autoSaveTimeout = setTimeout(() => {
        try {
          saveToLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);
          saveToLocalStorage(STORAGE_KEYS.LOGS, logs);
          saveToLocalStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
          saveToLocalStorage(STORAGE_KEYS.DRIVERS, drivers);
          saveToLocalStorage(STORAGE_KEYS.TRUCKS, trucks);
          saveToLocalStorage(STORAGE_KEYS.GPS_DATA, gpsData);
          saveToLocalStorage(STORAGE_KEYS.AI_INSIGHTS, aiInsights);
          saveToLocalStorage(STORAGE_KEYS.STAFF, staff);
          saveToLocalStorage(STORAGE_KEYS.DISPENSERS, dispensers);
          saveToLocalStorage(STORAGE_KEYS.SHIFTS, shifts);
          saveToLocalStorage(STORAGE_KEYS.SALES, sales);
          saveToLocalStorage(STORAGE_KEYS.PRICES, prices);
          saveToLocalStorage(STORAGE_KEYS.INCIDENTS, incidents);
          saveToLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, activityLogs);
          saveToLocalStorage(STORAGE_KEYS.TANKS, tanks);
          console.info('Data silently saved to local storage at', new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Error during silent save:', error);
        }
      }, 5000); // Reduced frequency and added debounce
    };
    
    // Save data every 10 minutes instead of 5 to reduce potential UI impact
    const intervalId = setInterval(saveDataSilently, 10 * 60 * 1000);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(intervalId);
      if (window.autoSaveTimeout) {
        clearTimeout(window.autoSaveTimeout);
      }
    };
  }, [
    purchaseOrders, 
    logs, 
    suppliers, 
    drivers, 
    trucks, 
    gpsData, 
    aiInsights,
    staff,
    dispensers,
    shifts,
    sales,
    prices,
    incidents,
    activityLogs,
    tanks
  ]);

  // No UI rendered - purely functional component
  return null;
};

// Add the timeout type to the Window interface
declare global {
  interface Window {
    autoSaveTimeout?: NodeJS.Timeout;
  }
}

export default AutoSave;
