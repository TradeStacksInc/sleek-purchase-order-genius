
import { Driver, GPSData, LogEntry, PurchaseOrder, Supplier, Truck, AIInsight } from '../types';

// Storage keys
export const STORAGE_KEYS = {
  PURCHASE_ORDERS: 'purchase_orders',
  LOGS: 'logs',
  SUPPLIERS: 'suppliers',
  DRIVERS: 'drivers',
  TRUCKS: 'trucks',
  GPS_DATA: 'gps_data',
  AI_INSIGHTS: 'ai_insights'
};

// Type for all storable data
export interface StoredAppData {
  purchaseOrders: PurchaseOrder[];
  logs: LogEntry[];
  suppliers: Supplier[];
  drivers: Driver[];
  trucks: Truck[];
  gpsData: GPSData[];
  aiInsights: AIInsight[];
}

// Save data to local storage with silent error handling
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    if (!Array.isArray(data)) {
      console.info(`Cannot save ${key}: value is not an array`);
      return false;
    }
    
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    console.info(`Successfully saved data to ${key}`);
    return true;
  } catch (error) {
    // Log error to console but don't surface to user
    console.error(`Error saving to local storage (${key}):`, error);
    return false;
  }
};

// Get data from local storage with proper date parsing and silent error handling
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      console.info(`No data found in local storage for ${key}, using default value`);
      return defaultValue;
    }

    // Parse JSON with date reviver
    const parsedData = JSON.parse(serializedData, dateReviver);
    console.info(`Successfully loaded data from ${key}`);
    return parsedData;
  } catch (error) {
    console.error(`Error retrieving from local storage (${key}):`, error);
    return defaultValue;
  }
};

// Date reviver function to convert date strings back to Date objects
const dateReviver = (_key: string, value: any): any => {
  // ISO date regex pattern
  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  
  if (typeof value === 'string' && datePattern.test(value)) {
    return new Date(value);
  }
  return value;
};

// Save entire app state to local storage with silent error handling
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

// Load entire app state from local storage with silent handling
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
  });
  console.log('All app data cleared from local storage');
};
