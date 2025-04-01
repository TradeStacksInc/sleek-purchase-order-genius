
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

// Save data to local storage with error handling
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    console.log(`Successfully saved data to ${key}`);
    return true;
  } catch (error) {
    console.error(`Error saving to local storage (${key}):`, error);
    return false;
  }
};

// Get data from local storage with proper date parsing and error handling
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      console.log(`No data found in local storage for ${key}, using default value`);
      return defaultValue;
    }

    // Parse JSON with date reviver
    const parsedData = JSON.parse(serializedData, dateReviver);
    console.log(`Successfully loaded data from ${key}`);
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

// Save entire app state to local storage with validation
export const saveAppState = (state: StoredAppData): boolean => {
  let success = true;
  
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
      if (!saveSuccess) success = false;
    } else {
      console.warn(`Cannot save ${stateKey}: value is not an array`);
      success = false;
    }
  });
  
  return success;
};

// Load entire app state from local storage with validation
export const loadAppState = (defaultState: StoredAppData): StoredAppData => {
  console.log('Loading app state from local storage');
  
  const loadedState: StoredAppData = {
    purchaseOrders: getFromLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, defaultState.purchaseOrders),
    logs: getFromLocalStorage(STORAGE_KEYS.LOGS, defaultState.logs),
    suppliers: getFromLocalStorage(STORAGE_KEYS.SUPPLIERS, defaultState.suppliers),
    drivers: getFromLocalStorage(STORAGE_KEYS.DRIVERS, defaultState.drivers),
    trucks: getFromLocalStorage(STORAGE_KEYS.TRUCKS, defaultState.trucks),
    gpsData: getFromLocalStorage(STORAGE_KEYS.GPS_DATA, defaultState.gpsData),
    aiInsights: getFromLocalStorage(STORAGE_KEYS.AI_INSIGHTS, defaultState.aiInsights)
  };
  
  // Check if we got any data or using all defaults
  const isUsingAllDefaults = Object.entries(loadedState).every(
    ([key, value]) => 
      Array.isArray(value) && 
      value.length === defaultState[key as keyof StoredAppData].length
  );
  
  if (isUsingAllDefaults) {
    console.log('Using all default data - no saved data found in local storage');
  } else {
    console.log('Successfully loaded saved data from local storage');
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
