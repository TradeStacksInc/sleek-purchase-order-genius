
import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { STORAGE_KEYS, saveToLocalStorage } from '@/utils/localStorage';
import { supabase } from '@/integrations/supabase/client';

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

  // Save data both on component unmount and on a timer
  useEffect(() => {
    console.info('AutoSave component mounted');
    
    // Function to save all data
    const saveAllData = async () => {
      try {
        // Save directly to Supabase and localStorage as backup
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
      } catch (error) {
        console.error('Error during auto-save:', error);
      }
    };
    
    // Save data when the user is leaving the page
    const handleBeforeUnload = () => {
      saveAllData();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also save data every 5 minutes
    const intervalId = setInterval(() => {
      console.info('Auto-saving data to Supabase...');
      saveAllData();
      console.info('Data saved at', new Date().toLocaleTimeString());
    }, 5 * 60 * 1000);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(intervalId);
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

export default AutoSave;
