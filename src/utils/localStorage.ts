
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

// Save data to local storage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to local storage (${key}):`, error);
  }
};

// Get data from local storage with proper date parsing
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }

    // Parse JSON with date reviver
    return JSON.parse(serializedData, dateReviver);
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

// Save entire app state to local storage
export const saveAppState = (state: StoredAppData): void => {
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const stateKey = key.toLowerCase() as keyof typeof STORAGE_KEYS;
    const stateValue = state[stateKey as keyof StoredAppData];
    saveToLocalStorage(storageKey, stateValue);
  });
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
  
  return loadedState;
};

// Clear all stored app data (for testing or reset)
export const clearAppState = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
