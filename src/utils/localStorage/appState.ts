
import { StoredAppData } from './types';
import { STORAGE_KEYS } from './constants';
import { saveToLocalStorage, getFromLocalStorage } from './core';
import { broadcastStorageUpdate } from '../storageSync';

// Save entire app state to local storage
export const saveAppState = (state: StoredAppData): boolean => {
  let success = true;
  let anySuccess = false;
  
  // Validate data before saving
  if (!state || Object.keys(state).length === 0) {
    console.error('Cannot save empty app state');
    return false;
  }
  
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const stateKey = key.toLowerCase() as keyof typeof STORAGE_KEYS;
    const stateValue = state[stateKey as keyof StoredAppData];
    
    if (Array.isArray(stateValue)) {
      const saveSuccess = saveToLocalStorage(storageKey, stateValue);
      if (saveSuccess) anySuccess = true;
      else success = false;
    }
  });
  
  if (!anySuccess) {
    console.error(`Failed to auto-save app state ${new Date().toLocaleTimeString()}`);
  }
  
  return success;
};

// Load entire app state from local storage
export const loadAppState = (defaultState: StoredAppData): StoredAppData => {
  const loadedState: StoredAppData = {
    purchaseOrders: getFromLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, defaultState.purchaseOrders),
    logs: getFromLocalStorage(STORAGE_KEYS.LOGS, defaultState.logs),
    suppliers: getFromLocalStorage(STORAGE_KEYS.SUPPLIERS, defaultState.suppliers),
    drivers: getFromLocalStorage(STORAGE_KEYS.DRIVERS, defaultState.drivers),
    trucks: getFromLocalStorage(STORAGE_KEYS.TRUCKS, defaultState.trucks),
    gpsData: getFromLocalStorage(STORAGE_KEYS.GPS_DATA, defaultState.gpsData),
    aiInsights: getFromLocalStorage(STORAGE_KEYS.AI_INSIGHTS, defaultState.aiInsights)
  };
  
  // Check if we're using all defaults, which means no saved data was found
  const usingAllDefaults = Object.keys(loadedState).every(key => 
    JSON.stringify(loadedState[key as keyof StoredAppData]) === 
    JSON.stringify(defaultState[key as keyof StoredAppData])
  );
  
  if (usingAllDefaults) {
    console.info('Using all default data - no saved data found in local storage');
  }
  
  return loadedState;
};

// Clear all stored app data (for testing or reset)
export const clearAppState = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    broadcastStorageUpdate(key);
  });
  console.log('All app data cleared from local storage');
};
