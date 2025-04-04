
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
    
    // Save data periodically without causing refresh
    const saveData = () => {
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
      console.info('Data saved to local storage');
    };
    
    // Save data every 5 minutes
    const intervalId = setInterval(saveData, 5 * 60 * 1000);
    
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

  return null;
};

export default AutoSave;
