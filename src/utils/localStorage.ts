
import { Driver, GPSData, LogEntry, PurchaseOrder, Supplier, Truck, AIInsight } from '../types';
import { broadcastStorageUpdate } from './storageSync';

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

// Save data to local storage with retry mechanism and error handling
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    if (!Array.isArray(data)) {
      console.error(`Cannot save ${key}: value is not an array`);
      return false;
    }
    
    // Try to optimize the data before saving
    const serializedData = JSON.stringify(data);
    
    // Attempt to save with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while (attempts < maxAttempts && !success) {
      try {
        localStorage.setItem(key, serializedData);
        success = true;
      } catch (retryError) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw retryError; // Re-throw after max attempts
        }
        // Wait briefly before retry
        setTimeout(() => {}, 100 * attempts);
      }
    }
    
    // Broadcast the update to other tabs
    broadcastStorageUpdate(key);
    
    console.info(`Successfully saved data to ${key}`);
    return true;
  } catch (error) {
    // Handle storage quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error(`Storage quota exceeded when saving to ${key}. Attempting cleanup...`);
      // Attempt to clean up old data (implementation depends on application needs)
      // This is just a placeholder - real implementation would be more sophisticated
    }
    
    console.error(`Error saving to local storage (${key}):`, error);
    return false;
  }
};

// Get data from local storage with date parsing and error handling
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      console.info(`No data found in local storage for ${key}, using default value`);
      return defaultValue;
    }

    // Parse JSON with date reviver and validation
    try {
      const parsedData = JSON.parse(serializedData, dateReviver);
      
      // Validate that parsed data is an array if defaultValue is an array
      if (Array.isArray(defaultValue) && !Array.isArray(parsedData)) {
        console.warn(`Invalid data format in ${key}, expected array. Using default value.`);
        return defaultValue;
      }
      
      console.info(`Successfully loaded data from ${key}`);
      return parsedData;
    } catch (parseError) {
      console.error(`Error parsing data from ${key}:`, parseError);
      return defaultValue;
    }
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

// Save entire app state to local storage with validation and error handling
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

// Load entire app state from local storage with validation
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

// Export data to a file
export const exportDataToFile = (data: any, filename: string = 'export.json', type: 'json' | 'csv' = 'json'): void => {
  try {
    let content: string;
    let mimeType: string;
    
    if (type === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      if (!filename.endsWith('.json')) filename += '.json';
    } else {
      // Simple CSV conversion for array of objects
      if (!Array.isArray(data)) {
        throw new Error('CSV export only supports arrays of objects');
      }
      
      // Get headers from first object
      const headers = Object.keys(data[0] || {});
      // Convert each object to CSV row
      const rows = data.map(obj => 
        headers.map(header => {
          const value = obj[header];
          // Handle special cases
          if (value instanceof Date) return value.toISOString();
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        }).join(',')
      );
      
      content = [headers.join(','), ...rows].join('\n');
      mimeType = 'text/csv';
      if (!filename.endsWith('.csv')) filename += '.csv';
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.info(`Successfully exported data as ${filename}`);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};
