
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
    aiInsights 
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
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [purchaseOrders, logs, suppliers, drivers, trucks, gpsData, aiInsights]);

  return null;
};

export default AutoSave;
