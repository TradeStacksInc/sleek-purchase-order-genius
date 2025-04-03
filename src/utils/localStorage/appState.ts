
import { StoredAppData, PaginationParams, PaginatedResult } from './types';
import { STORAGE_KEYS, DB_VERSION } from './constants';
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
export const loadAppState = (defaultState: Partial<StoredAppData>): StoredAppData => {
  // Create a complete default state with empty arrays for any missing properties
  const completeDefaultState: StoredAppData = {
    purchaseOrders: [],
    logs: [],
    suppliers: [],
    drivers: [],
    trucks: [],
    gpsData: [],
    aiInsights: [],
    staff: [],
    dispensers: [],
    shifts: [],
    sales: [],
    prices: [],
    incidents: [],
    activityLogs: [],
    ...defaultState
  };
  
  const loadedState: StoredAppData = {
    purchaseOrders: getFromLocalStorage(STORAGE_KEYS.PURCHASE_ORDERS, completeDefaultState.purchaseOrders),
    logs: getFromLocalStorage(STORAGE_KEYS.LOGS, completeDefaultState.logs),
    suppliers: getFromLocalStorage(STORAGE_KEYS.SUPPLIERS, completeDefaultState.suppliers),
    drivers: getFromLocalStorage(STORAGE_KEYS.DRIVERS, completeDefaultState.drivers),
    trucks: getFromLocalStorage(STORAGE_KEYS.TRUCKS, completeDefaultState.trucks),
    gpsData: getFromLocalStorage(STORAGE_KEYS.GPS_DATA, completeDefaultState.gpsData),
    aiInsights: getFromLocalStorage(STORAGE_KEYS.AI_INSIGHTS, completeDefaultState.aiInsights),
    staff: getFromLocalStorage(STORAGE_KEYS.STAFF, completeDefaultState.staff),
    dispensers: getFromLocalStorage(STORAGE_KEYS.DISPENSERS, completeDefaultState.dispensers),
    shifts: getFromLocalStorage(STORAGE_KEYS.SHIFTS, completeDefaultState.shifts),
    sales: getFromLocalStorage(STORAGE_KEYS.SALES, completeDefaultState.sales),
    prices: getFromLocalStorage(STORAGE_KEYS.PRICES, completeDefaultState.prices),
    incidents: getFromLocalStorage(STORAGE_KEYS.INCIDENTS, completeDefaultState.incidents),
    activityLogs: getFromLocalStorage(STORAGE_KEYS.ACTIVITY_LOGS, completeDefaultState.activityLogs)
  };
  
  // Check if we're using all defaults, which means no saved data was found
  const usingAllDefaults = Object.keys(loadedState).every(key => 
    JSON.stringify(loadedState[key as keyof StoredAppData]) === 
    JSON.stringify(completeDefaultState[key as keyof StoredAppData])
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

// Get paginated data from a collection
export const getPaginatedData = <T>(
  collection: T[],
  params: PaginationParams
): PaginatedResult<T> => {
  let filteredData = [...collection];
  
  // Apply filters if provided
  if (params.filter) {
    filteredData = filteredData.filter(item => {
      return Object.entries(params.filter || {}).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        
        const itemValue = (item as any)[key];
        
        // Handle different filter types
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        // Date range filtering
        if (value.start && value.end && itemValue instanceof Date) {
          const start = new Date(value.start);
          const end = new Date(value.end);
          return itemValue >= start && itemValue <= end;
        }
        
        // Exact match
        return itemValue === value;
      });
    });
  }
  
  // Apply sorting if provided
  if (params.sort) {
    filteredData.sort((a, b) => {
      const aValue = (a as any)[params.sort?.field || ''];
      const bValue = (b as any)[params.sort?.field || ''];
      
      // Handle different value types
      if (aValue instanceof Date && bValue instanceof Date) {
        return params.sort?.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return params.sort?.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return params.sort?.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }
  
  // Calculate pagination values
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / params.limit));
  const currentPage = Math.min(Math.max(1, params.page), totalPages);
  const startIndex = (currentPage - 1) * params.limit;
  const endIndex = Math.min(startIndex + params.limit, totalCount);
  
  // Get the page of data
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    totalCount,
    totalPages,
    currentPage
  };
};

// Get database metadata
export const getDatabaseMetadata = (): { version: string, lastReset: Date | null } => {
  const metadata = localStorage.getItem('db_metadata');
  if (metadata) {
    return JSON.parse(metadata);
  }
  return { version: DB_VERSION, lastReset: null };
};

// Set database metadata
export const setDatabaseMetadata = (metadata: { version: string, lastReset: Date | null }): void => {
  localStorage.setItem('db_metadata', JSON.stringify(metadata));
};

// Initialize database with default data
export const initializeDatabase = (defaultData: Partial<StoredAppData>): void => {
  clearAppState();
  saveAppState(defaultData as StoredAppData);
  setDatabaseMetadata({ version: DB_VERSION, lastReset: new Date() });
};
